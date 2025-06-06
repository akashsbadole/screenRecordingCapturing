"use client";

import { useState, useEffect } from 'react';
import { useWebRTC } from '@/hooks/use-webrtc';
import { VideoGrid } from './video-grid';
import { MeetingControls } from './meeting-controls';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Video, Users, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface MeetingRoomProps {
  roomId?: string;
  className?: string;
}

export function MeetingRoom({ roomId: initialRoomId, className }: MeetingRoomProps) {
  const [roomId, setRoomId] = useState(initialRoomId || '');
  const [userName, setUserName] = useState('');
  const [isJoinFormVisible, setIsJoinFormVisible] = useState(!initialRoomId);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const {
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
    userId
  } = useWebRTC({
    roomId,
    userId: userName || `user-${Date.now()}`,
    autoJoin: false,
    mediaConstraints: {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    }
  });

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      toast({
        title: "Room ID Required",
        description: "Please enter a room ID to join",
        variant: "destructive",
      });
      return;
    }

    setIsJoinFormVisible(false);
    await joinRoom();
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    setIsJoinFormVisible(true);
  };

  const handleToggleScreenShare = () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  };

  const generateRoomId = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(newRoomId);
  };

  const copyRoomId = async () => {
    if (!roomId) return;
    
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Room ID Copied",
        description: "Room ID has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy room ID to clipboard",
        variant: "destructive",
      });
    }
  };

  // Auto-generate room ID if not provided
  useEffect(() => {
    if (!roomId && !initialRoomId) {
      generateRoomId();
    }
  }, [roomId, initialRoomId]);

  if (isJoinFormVisible && !isConnected) {
    return (
      <div className={cn("max-w-md mx-auto", className)}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Video className="h-6 w-6" />
              Join Meeting Room
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userName">Your Name</Label>
              <Input
                id="userName"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomId">Room ID</Label>
              <div className="flex gap-2">
                <Input
                  id="roomId"
                  placeholder="Enter room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                />
                <Button
                  variant="outline"
                  onClick={generateRoomId}
                  className="shrink-0"
                >
                  Generate
                </Button>
              </div>
            </div>

            {roomId && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded">
                <span className="text-sm font-mono flex-1">{roomId}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyRoomId}
                  className="h-8 w-8 p-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleJoinRoom}
              disabled={isJoining || !roomId.trim()}
              className="w-full"
            >
              {isJoining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <Video className="mr-2 h-4 w-4" />
                  Join Room
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className={cn("flex items-center justify-center h-64", className)}>
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Connecting to room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-screen", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Room: {roomId}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{participants.length} participant{participants.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyRoomId}
            className="hidden sm:flex"
          >
            {copied ? (
              <Check className="mr-2 h-4 w-4 text-green-500" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            Copy Room ID
          </Button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 overflow-hidden">
        <VideoGrid participants={participants} className="h-full" />
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Meeting Controls */}
      <MeetingControls
        isAudioEnabled={localAudioEnabled}
        isVideoEnabled={localVideoEnabled}
        isScreenSharing={isScreenSharing}
        participantCount={participants.length}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={handleToggleScreenShare}
        onLeaveCall={handleLeaveRoom}
      />
    </div>
  );
}
