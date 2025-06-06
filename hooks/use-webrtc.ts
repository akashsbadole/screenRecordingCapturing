import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { WebRTCManager, MediaConstraints } from '@/lib/webrtc';
import { createSignalingService, SignalMessage } from '@/lib/signaling';
import { useToast } from '@/hooks/use-toast';

export interface Participant {
  id: string;
  stream: MediaStream;
  isLocal: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
  isScreenSharing: boolean;
}

export interface UseWebRTCOptions {
  roomId: string;
  userId?: string;
  autoJoin?: boolean;
  mediaConstraints?: MediaConstraints;
}

export function useWebRTC({
  roomId,
  userId = uuidv4(),
  autoJoin = false,
  mediaConstraints = { video: true, audio: true }
}: UseWebRTCOptions) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [localAudioEnabled, setLocalAudioEnabled] = useState(true);
  const [localVideoEnabled, setLocalVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const webrtcManagerRef = useRef<WebRTCManager | null>(null);
  const signalingServiceRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const addParticipant = useCallback((id: string, stream: MediaStream, isLocal = false) => {
    setParticipants(prev => {
      const existing = prev.find(p => p.id === id);
      if (existing) {
        return prev.map(p => p.id === id ? { ...p, stream } : p);
      }
      
      return [...prev, {
        id,
        stream,
        isLocal,
        audioEnabled: true,
        videoEnabled: true,
        isScreenSharing: false
      }];
    });
  }, []);

  const removeParticipant = useCallback((id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  }, []);

  const updateParticipant = useCallback((id: string, updates: Partial<Participant>) => {
    setParticipants(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  }, []);

  const initializeWebRTC = useCallback(() => {
    if (webrtcManagerRef.current) {
      webrtcManagerRef.current.destroy();
    }

    webrtcManagerRef.current = new WebRTCManager({
      onPeerConnected: (peerId, stream) => {
        console.log('Peer connected:', peerId);
        addParticipant(peerId, stream);
      },
      onPeerDisconnected: (peerId) => {
        console.log('Peer disconnected:', peerId);
        removeParticipant(peerId);
      },
      onError: (error) => {
        console.error('WebRTC error:', error);
        setError(error.message);
        toast({
          title: "Connection Error",
          description: error.message,
          variant: "destructive",
        });
      }
    });

    // Initialize signaling
    signalingServiceRef.current = createSignalingService(roomId, userId);
    
    webrtcManagerRef.current.setSignalHandler((peerId, signalData) => {
      signalingServiceRef.current?.sendMessage({
        type: signalData.type === 'offer' ? 'offer' : 'answer',
        from: userId,
        to: peerId,
        roomId,
        data: signalData
      });
    });

    signalingServiceRef.current.connect((message: SignalMessage) => {
      handleSignalingMessage(message);
    });
  }, [roomId, userId, addParticipant, removeParticipant, toast]);

  const handleSignalingMessage = useCallback((message: SignalMessage) => {
    if (!webrtcManagerRef.current) return;

    switch (message.type) {
      case 'user-joined':
        // Create peer connection for new user
        if (message.from !== userId) {
          const peer = webrtcManagerRef.current.createPeer(message.from, true, localStreamRef.current || undefined);
        }
        break;
      
      case 'user-left':
        webrtcManagerRef.current.removePeer(message.from);
        break;
      
      case 'offer':
      case 'answer':
        if (message.to === userId && message.data) {
          webrtcManagerRef.current.signal(message.from, message.data);
        }
        break;
    }
  }, [userId]);

  const joinRoom = useCallback(async () => {
    if (isJoining || isConnected) return;

    setIsJoining(true);
    setError(null);

    try {
      // Initialize WebRTC if not already done
      if (!webrtcManagerRef.current) {
        initializeWebRTC();
      }

      // Get user media
      const stream = await webrtcManagerRef.current!.initializeLocalStream(mediaConstraints);
      localStreamRef.current = stream;
      
      // Add local participant
      addParticipant(userId, stream, true);

      // Get existing room users and create peer connections
      const existingUsers = signalingServiceRef.current?.getRoomUsers() || [];
      existingUsers.forEach((existingUserId: string) => {
        if (existingUserId !== userId) {
          webrtcManagerRef.current!.createPeer(existingUserId, false, stream);
        }
      });

      setIsConnected(true);
      toast({
        title: "Joined Room",
        description: `Successfully joined room ${roomId}`,
      });
    } catch (error) {
      console.error('Failed to join room:', error);
      setError(error instanceof Error ? error.message : 'Failed to join room');
      toast({
        title: "Failed to Join",
        description: "Could not join the room. Please check your camera and microphone permissions.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  }, [isJoining, isConnected, initializeWebRTC, mediaConstraints, userId, roomId, addParticipant, toast]);

  const leaveRoom = useCallback(() => {
    if (webrtcManagerRef.current) {
      webrtcManagerRef.current.destroy();
      webrtcManagerRef.current = null;
    }

    if (signalingServiceRef.current) {
      signalingServiceRef.current.disconnect();
      signalingServiceRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    setParticipants([]);
    setIsConnected(false);
    setIsScreenSharing(false);
    setError(null);

    toast({
      title: "Left Room",
      description: "You have left the meeting room",
    });
  }, [toast]);

  const toggleAudio = useCallback(() => {
    if (webrtcManagerRef.current) {
      const newState = !localAudioEnabled;
      webrtcManagerRef.current.toggleAudio(newState);
      setLocalAudioEnabled(newState);
      updateParticipant(userId, { audioEnabled: newState });
    }
  }, [localAudioEnabled, userId, updateParticipant]);

  const toggleVideo = useCallback(() => {
    if (webrtcManagerRef.current) {
      const newState = !localVideoEnabled;
      webrtcManagerRef.current.toggleVideo(newState);
      setLocalVideoEnabled(newState);
      updateParticipant(userId, { videoEnabled: newState });
    }
  }, [localVideoEnabled, userId, updateParticipant]);

  const startScreenShare = useCallback(async () => {
    if (!webrtcManagerRef.current || isScreenSharing) return;

    try {
      const screenStream = await webrtcManagerRef.current.getDisplayMedia();
      const videoTrack = screenStream.getVideoTracks()[0];
      
      await webrtcManagerRef.current.replaceVideoTrack(videoTrack);
      
      videoTrack.onended = () => {
        stopScreenShare();
      };

      setIsScreenSharing(true);
      updateParticipant(userId, { isScreenSharing: true });
      
      toast({
        title: "Screen Sharing Started",
        description: "You are now sharing your screen",
      });
    } catch (error) {
      console.error('Failed to start screen share:', error);
      toast({
        title: "Screen Share Failed",
        description: "Could not start screen sharing",
        variant: "destructive",
      });
    }
  }, [isScreenSharing, userId, updateParticipant, toast]);

  const stopScreenShare = useCallback(async () => {
    if (!webrtcManagerRef.current || !isScreenSharing) return;

    try {
      // Get camera stream back
      const cameraStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      const videoTrack = cameraStream.getVideoTracks()[0];
      
      await webrtcManagerRef.current.replaceVideoTrack(videoTrack);
      
      setIsScreenSharing(false);
      updateParticipant(userId, { isScreenSharing: false });
      
      toast({
        title: "Screen Sharing Stopped",
        description: "You are no longer sharing your screen",
      });
    } catch (error) {
      console.error('Failed to stop screen share:', error);
      toast({
        title: "Error",
        description: "Could not stop screen sharing",
        variant: "destructive",
      });
    }
  }, [isScreenSharing, mediaConstraints, userId, updateParticipant, toast]);

  // Auto-join if specified
  useEffect(() => {
    if (autoJoin && !isConnected && !isJoining) {
      joinRoom();
    }
  }, [autoJoin, isConnected, isJoining, joinRoom]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveRoom();
    };
  }, []);

  return {
    participants,
    isConnected,
    isJoining,
    localAudioEnabled,
    localVideoEnabled,
    isScreenSharing,
    error,
    joinRoom,
    leaveRoom,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    roomId,
    userId
  };
}
