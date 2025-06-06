"use client";

import { Button } from '@/components/ui/button';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MonitorOff,
  Phone,
  Settings,
  Users,
  MessageSquare,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface MeetingControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  participantCount: number;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onLeaveCall: () => void;
  onOpenSettings?: () => void;
  onOpenParticipants?: () => void;
  onOpenChat?: () => void;
  className?: string;
}

export function MeetingControls({
  isAudioEnabled,
  isVideoEnabled,
  isScreenSharing,
  participantCount,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onLeaveCall,
  onOpenSettings,
  onOpenParticipants,
  onOpenChat,
  className
}: MeetingControlsProps) {
  return (
    <div className={cn(
      "flex items-center justify-center gap-2 p-4 bg-background/95 backdrop-blur-sm border-t",
      className
    )}>
      {/* Audio Control */}
      <Button
        variant={isAudioEnabled ? "default" : "destructive"}
        size="lg"
        onClick={onToggleAudio}
        className="rounded-full w-12 h-12 p-0"
      >
        {isAudioEnabled ? (
          <Mic className="h-5 w-5" />
        ) : (
          <MicOff className="h-5 w-5" />
        )}
      </Button>

      {/* Video Control */}
      <Button
        variant={isVideoEnabled ? "default" : "destructive"}
        size="lg"
        onClick={onToggleVideo}
        className="rounded-full w-12 h-12 p-0"
      >
        {isVideoEnabled ? (
          <Video className="h-5 w-5" />
        ) : (
          <VideoOff className="h-5 w-5" />
        )}
      </Button>

      {/* Screen Share Control */}
      <Button
        variant={isScreenSharing ? "secondary" : "outline"}
        size="lg"
        onClick={onToggleScreenShare}
        className="rounded-full w-12 h-12 p-0"
      >
        {isScreenSharing ? (
          <MonitorOff className="h-5 w-5" />
        ) : (
          <Monitor className="h-5 w-5" />
        )}
      </Button>

      {/* Participants */}
      {onOpenParticipants && (
        <Button
          variant="outline"
          size="lg"
          onClick={onOpenParticipants}
          className="rounded-full w-12 h-12 p-0 relative"
        >
          <Users className="h-5 w-5" />
          {participantCount > 1 && (
            <Badge 
              variant="secondary" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {participantCount}
            </Badge>
          )}
        </Button>
      )}

      {/* Chat */}
      {onOpenChat && (
        <Button
          variant="outline"
          size="lg"
          onClick={onOpenChat}
          className="rounded-full w-12 h-12 p-0"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      )}

      {/* More Options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full w-12 h-12 p-0"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onOpenSettings && (
            <DropdownMenuItem onClick={onOpenSettings}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={onLeaveCall} className="text-destructive">
            <Phone className="mr-2 h-4 w-4" />
            Leave Call
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Leave Call Button */}
      <Button
        variant="destructive"
        size="lg"
        onClick={onLeaveCall}
        className="rounded-full w-12 h-12 p-0 ml-4"
      >
        <Phone className="h-5 w-5 rotate-[135deg]" />
      </Button>
    </div>
  );
}
