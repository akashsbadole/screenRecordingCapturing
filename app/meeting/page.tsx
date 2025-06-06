"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MeetingRoom } from '@/components/video-call/meeting-room';
import { Loader2 } from 'lucide-react';

function MeetingPageContent() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get('room');

  return (
    <div className="min-h-screen bg-background">
      <MeetingRoom roomId={roomId || undefined} />
    </div>
  );
}

export default function MeetingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading meeting room...</p>
        </div>
      </div>
    }>
      <MeetingPageContent />
    </Suspense>
  );
}
