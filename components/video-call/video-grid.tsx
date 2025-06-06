"use client";

import { ParticipantVideo } from './participant-video';
import { Participant } from '@/hooks/use-webrtc';
import { cn } from '@/lib/utils';

interface VideoGridProps {
  participants: Participant[];
  className?: string;
}

export function VideoGrid({ participants, className }: VideoGridProps) {
  const getGridLayout = (count: number) => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-1 md:grid-cols-2";
    if (count <= 4) return "grid-cols-2";
    if (count <= 6) return "grid-cols-2 md:grid-cols-3";
    if (count <= 9) return "grid-cols-3";
    return "grid-cols-3 md:grid-cols-4";
  };

  const getVideoSize = (count: number, isLocal: boolean) => {
    // Local video gets special treatment in larger groups
    if (count > 4 && isLocal) {
      return "aspect-video max-w-xs";
    }
    
    if (count === 1) return "aspect-video max-w-2xl mx-auto";
    if (count === 2) return "aspect-video";
    if (count <= 4) return "aspect-video";
    return "aspect-video";
  };

  // Sort participants to show local participant first
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.isLocal && !b.isLocal) return -1;
    if (!a.isLocal && b.isLocal) return 1;
    return 0;
  });

  if (participants.length === 0) {
    return (
      <div className={cn(
        "flex items-center justify-center h-64 bg-muted rounded-lg",
        className
      )}>
        <p className="text-muted-foreground">No participants in the call</p>
      </div>
    );
  }

  // Special layout for single participant (usually local only)
  if (participants.length === 1) {
    const participant = participants[0];
    return (
      <div className={cn("flex justify-center", className)}>
        <ParticipantVideo
          participantId={participant.id}
          stream={participant.stream}
          isLocal={participant.isLocal}
          audioEnabled={participant.audioEnabled}
          videoEnabled={participant.videoEnabled}
          isScreenSharing={participant.isScreenSharing}
          className={getVideoSize(1, participant.isLocal)}
        />
      </div>
    );
  }

  // Special layout for screen sharing
  const screenSharingParticipant = participants.find(p => p.isScreenSharing);
  if (screenSharingParticipant) {
    const otherParticipants = participants.filter(p => !p.isScreenSharing);
    
    return (
      <div className={cn("space-y-4", className)}>
        {/* Main screen share view */}
        <div className="flex justify-center">
          <ParticipantVideo
            participantId={screenSharingParticipant.id}
            stream={screenSharingParticipant.stream}
            isLocal={screenSharingParticipant.isLocal}
            audioEnabled={screenSharingParticipant.audioEnabled}
            videoEnabled={screenSharingParticipant.videoEnabled}
            isScreenSharing={true}
            className="aspect-video max-w-4xl w-full"
          />
        </div>
        
        {/* Thumbnail view of other participants */}
        {otherParticipants.length > 0 && (
          <div className="flex gap-2 justify-center flex-wrap">
            {otherParticipants.map((participant) => (
              <ParticipantVideo
                key={participant.id}
                participantId={participant.id}
                stream={participant.stream}
                isLocal={participant.isLocal}
                audioEnabled={participant.audioEnabled}
                videoEnabled={participant.videoEnabled}
                isScreenSharing={participant.isScreenSharing}
                className="w-32 h-24 md:w-40 md:h-30"
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Regular grid layout
  return (
    <div className={cn(
      "grid gap-4 auto-rows-fr",
      getGridLayout(participants.length),
      className
    )}>
      {sortedParticipants.map((participant) => (
        <ParticipantVideo
          key={participant.id}
          participantId={participant.id}
          stream={participant.stream}
          isLocal={participant.isLocal}
          audioEnabled={participant.audioEnabled}
          videoEnabled={participant.videoEnabled}
          isScreenSharing={participant.isScreenSharing}
          className={getVideoSize(participants.length, participant.isLocal)}
        />
      ))}
    </div>
  );
}
