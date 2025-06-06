"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Video, Users, Plus, ArrowRight, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export function VideoCallTool() {
  const [roomId, setRoomId] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const generateRoomId = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(newRoomId);
    return newRoomId;
  };

  const copyRoomId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
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

  const createNewMeeting = () => {
    const newRoomId = generateRoomId();
    router.push(`/meeting?room=${newRoomId}`);
  };

  const joinMeeting = () => {
    if (!roomId.trim()) {
      toast({
        title: "Room ID Required",
        description: "Please enter a room ID to join",
        variant: "destructive",
      });
      return;
    }
    router.push(`/meeting?room=${roomId.toUpperCase()}`);
  };

  const handleQuickJoin = () => {
    router.push('/meeting');
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold">Video Conferencing</h3>
        <p className="text-muted-foreground">
          Start or join video meetings with screen sharing and recording capabilities
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Create New Meeting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Meeting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Start an instant meeting and invite others to join
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={createNewMeeting}
                className="w-full"
                size="lg"
              >
                <Video className="mr-2 h-4 w-4" />
                Start New Meeting
              </Button>
              
              <div className="text-center">
                <span className="text-xs text-muted-foreground">or</span>
              </div>
              
              <Button 
                variant="outline"
                onClick={handleQuickJoin}
                className="w-full"
              >
                <Users className="mr-2 h-4 w-4" />
                Quick Join
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Join Existing Meeting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Join Meeting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter a room ID to join an existing meeting
            </p>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="joinRoomId">Room ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="joinRoomId"
                    placeholder="Enter room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && joinMeeting()}
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
                    onClick={() => copyRoomId(roomId)}
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
              
              <Button 
                onClick={joinMeeting}
                disabled={!roomId.trim()}
                className="w-full"
                size="lg"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Join Meeting
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features List */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary p-2 rounded-full">
                <Video className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">HD Video Calls</p>
                <p className="text-xs text-muted-foreground">Crystal clear video quality</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary p-2 rounded-full">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Multiple Participants</p>
                <p className="text-xs text-muted-foreground">Support for group calls</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary p-2 rounded-full">
                <Video className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Screen Sharing</p>
                <p className="text-xs text-muted-foreground">Share your screen with others</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
