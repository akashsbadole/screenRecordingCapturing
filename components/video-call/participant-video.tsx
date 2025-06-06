"use client";

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mic, MicOff, Video, VideoOff, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ParticipantVideoProps {
  participantId: string;
  stream: MediaStream;
  isLocal?: boolean;
  audioEnabled?: boolean;
  videoEnabled?: boolean;
  isScreenSharing?: boolean;
  className?: string;
  muted?: boolean;
}

export function ParticipantVideo({
  participantId,
  stream,
  isLocal = false,
  audioEnabled = true,
  videoEnabled = true,
  isScreenSharing = false,
  className,
  muted = true
}: ParticipantVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [hasVideoTrack, setHasVideoTrack] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !stream) return;

    videoElement.srcObject = stream;
    videoElement.muted = muted || isLocal; // Always mute local video to prevent feedback

    const handleLoadedMetadata = () => {
      videoElement.play().catch(console.error);
    };

    const handlePlay = () => {
      setIsVideoPlaying(true);
    };

    const handlePause = () => {
      setIsVideoPlaying(false);
    };

    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);

    // Check if stream has video track
    const videoTracks = stream.getVideoTracks();
    setHasVideoTrack(videoTracks.length > 0 && videoTracks[0].enabled);

    // Listen for track changes
    const handleTrackChange = () => {
      const videoTracks = stream.getVideoTracks();
      setHasVideoTrack(videoTracks.length > 0 && videoTracks[0].enabled);
    };

    stream.addEventListener('addtrack', handleTrackChange);
    stream.addEventListener('removetrack', handleTrackChange);

    return () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      stream.removeEventListener('addtrack', handleTrackChange);
      stream.removeEventListener('removetrack', handleTrackChange);
    };
  }, [stream, muted, isLocal]);

  const getParticipantInitials = (id: string) => {
    return id.slice(0, 2).toUpperCase();
  };

  const showVideo = videoEnabled && hasVideoTrack && isVideoPlaying;

  return (
    <Card className={cn(
      "relative overflow-hidden bg-black aspect-video",
      className
    )}>
      {/* Video Element */}
      <video
        ref={videoRef}
        className={cn(
          "w-full h-full object-cover",
          !showVideo && "hidden"
        )}
        playsInline
        autoPlay
        muted={muted || isLocal}
      />

      {/* Avatar Fallback */}
      {!showVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
          <Avatar className="w-16 h-16 md:w-24 md:h-24">
            <AvatarFallback className="text-lg md:text-2xl font-semibold">
              {getParticipantInitials(participantId)}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Status Indicators */}
      <div className="absolute top-2 left-2 flex gap-1">
        {/* Audio Status */}
        <div className={cn(
          "p-1 rounded-full",
          audioEnabled ? "bg-green-500/80" : "bg-red-500/80"
        )}>
          {audioEnabled ? (
            <Mic className="w-3 h-3 text-white" />
          ) : (
            <MicOff className="w-3 h-3 text-white" />
          )}
        </div>

        {/* Video Status */}
        <div className={cn(
          "p-1 rounded-full",
          videoEnabled ? "bg-green-500/80" : "bg-red-500/80"
        )}>
          {videoEnabled ? (
            <Video className="w-3 h-3 text-white" />
          ) : (
            <VideoOff className="w-3 h-3 text-white" />
          )}
        </div>

        {/* Screen Sharing Indicator */}
        {isScreenSharing && (
          <div className="p-1 rounded-full bg-blue-500/80">
            <Monitor className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Participant Label */}
      <div className="absolute bottom-2 left-2 right-2">
        <div className="bg-black/60 backdrop-blur-sm rounded px-2 py-1">
          <p className="text-white text-xs md:text-sm font-medium truncate">
            {isLocal ? 'You' : participantId}
            {isScreenSharing && ' (Screen)'}
          </p>
        </div>
      </div>

      {/* Local Video Mirror Effect */}
      {isLocal && showVideo && !isScreenSharing && (
        <style jsx>{`
          video {
            transform: scaleX(-1);
          }
        `}</style>
      )}
    </Card>
  );
}
