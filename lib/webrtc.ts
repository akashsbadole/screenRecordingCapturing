import Peer from 'simple-peer';

export interface PeerConnection {
  id: string;
  peer: Peer.Instance;
  stream?: MediaStream;
  isInitiator: boolean;
}

export interface MediaConstraints {
  video: boolean | MediaTrackConstraints;
  audio: boolean | MediaTrackConstraints;
}

export class WebRTCManager {
  private peers: Map<string, PeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private onPeerConnected?: (peerId: string, stream: MediaStream) => void;
  private onPeerDisconnected?: (peerId: string) => void;
  private onError?: (error: Error) => void;

  constructor(callbacks: {
    onPeerConnected?: (peerId: string, stream: MediaStream) => void;
    onPeerDisconnected?: (peerId: string) => void;
    onError?: (error: Error) => void;
  }) {
    this.onPeerConnected = callbacks.onPeerConnected;
    this.onPeerDisconnected = callbacks.onPeerDisconnected;
    this.onError = callbacks.onError;
  }

  async initializeLocalStream(constraints: MediaConstraints): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.localStream;
    } catch (error) {
      this.onError?.(new Error(`Failed to get user media: ${error}`));
      throw error;
    }
  }

  async getDisplayMedia(): Promise<MediaStream> {
    try {
      return await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
    } catch (error) {
      this.onError?.(new Error(`Failed to get display media: ${error}`));
      throw error;
    }
  }

  createPeer(peerId: string, isInitiator: boolean, stream?: MediaStream): Peer.Instance {
    const peer = new Peer({
      initiator: isInitiator,
      trickle: false,
      stream: stream || this.localStream || undefined,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ]
      }
    });

    const peerConnection: PeerConnection = {
      id: peerId,
      peer,
      isInitiator
    };

    this.peers.set(peerId, peerConnection);

    peer.on('signal', (data) => {
      // This will be handled by the signaling system
      this.handleSignal(peerId, data);
    });

    peer.on('stream', (remoteStream) => {
      peerConnection.stream = remoteStream;
      this.onPeerConnected?.(peerId, remoteStream);
    });

    peer.on('error', (error) => {
      console.error(`Peer ${peerId} error:`, error);
      this.onError?.(error);
      this.removePeer(peerId);
    });

    peer.on('close', () => {
      this.removePeer(peerId);
    });

    return peer;
  }

  private handleSignal(peerId: string, signalData: any) {
    // This method will be overridden by the signaling implementation
    console.log(`Signal from ${peerId}:`, signalData);
  }

  signal(peerId: string, signalData: any) {
    const peerConnection = this.peers.get(peerId);
    if (peerConnection) {
      peerConnection.peer.signal(signalData);
    }
  }

  removePeer(peerId: string) {
    const peerConnection = this.peers.get(peerId);
    if (peerConnection) {
      peerConnection.peer.destroy();
      this.peers.delete(peerId);
      this.onPeerDisconnected?.(peerId);
    }
  }

  getPeer(peerId: string): PeerConnection | undefined {
    return this.peers.get(peerId);
  }

  getAllPeers(): PeerConnection[] {
    return Array.from(this.peers.values());
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  toggleAudio(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  toggleVideo(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  async switchCamera() {
    if (!this.localStream) return;

    try {
      const videoTrack = this.localStream.getVideoTracks()[0];
      const currentFacingMode = videoTrack.getSettings().facingMode;
      const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode },
        audio: true
      });

      // Replace the video track in all peer connections
      const newVideoTrack = newStream.getVideoTracks()[0];
      this.peers.forEach(({ peer }) => {
        const sender = peer._pc?.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        if (sender) {
          sender.replaceTrack(newVideoTrack);
        }
      });

      // Update local stream
      videoTrack.stop();
      this.localStream.removeTrack(videoTrack);
      this.localStream.addTrack(newVideoTrack);
    } catch (error) {
      this.onError?.(new Error(`Failed to switch camera: ${error}`));
    }
  }

  async replaceVideoTrack(newVideoTrack: MediaStreamTrack) {
    if (!this.localStream) return;

    const oldVideoTrack = this.localStream.getVideoTracks()[0];
    if (oldVideoTrack) {
      this.localStream.removeTrack(oldVideoTrack);
      oldVideoTrack.stop();
    }

    this.localStream.addTrack(newVideoTrack);

    // Update all peer connections
    this.peers.forEach(({ peer }) => {
      const sender = peer._pc?.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      );
      if (sender) {
        sender.replaceTrack(newVideoTrack);
      }
    });
  }

  destroy() {
    this.peers.forEach(({ peer }) => peer.destroy());
    this.peers.clear();
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }

  setSignalHandler(handler: (peerId: string, signalData: any) => void) {
    this.handleSignal = handler;
  }
}

export const createWebRTCManager = (callbacks: {
  onPeerConnected?: (peerId: string, stream: MediaStream) => void;
  onPeerDisconnected?: (peerId: string) => void;
  onError?: (error: Error) => void;
}) => {
  return new WebRTCManager(callbacks);
};
