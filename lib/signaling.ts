// Simple signaling implementation using localStorage for demo purposes
// In production, you would use WebSocket/Socket.IO server

export interface SignalMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join-room' | 'leave-room' | 'user-joined' | 'user-left';
  from: string;
  to?: string;
  roomId: string;
  data?: any;
  timestamp: number;
}

export class LocalSignalingService {
  private roomId: string;
  private userId: string;
  private onMessage?: (message: SignalMessage) => void;
  private pollInterval?: NodeJS.Timeout;

  constructor(roomId: string, userId: string) {
    this.roomId = roomId;
    this.userId = userId;
  }

  connect(onMessage: (message: SignalMessage) => void) {
    this.onMessage = onMessage;
    this.startPolling();
    
    // Announce joining the room
    this.sendMessage({
      type: 'join-room',
      from: this.userId,
      roomId: this.roomId,
      timestamp: Date.now()
    });
  }

  private startPolling() {
    this.pollInterval = setInterval(() => {
      this.checkForMessages();
    }, 1000);
  }

  private checkForMessages() {
    const messages = this.getStoredMessages();
    const unreadMessages = messages.filter(msg => 
      msg.roomId === this.roomId && 
      msg.from !== this.userId &&
      (!msg.to || msg.to === this.userId) &&
      !this.isMessageRead(msg)
    );

    unreadMessages.forEach(message => {
      this.markMessageAsRead(message);
      this.onMessage?.(message);
    });
  }

  sendMessage(message: Omit<SignalMessage, 'timestamp'>) {
    const fullMessage: SignalMessage = {
      ...message,
      timestamp: Date.now()
    };

    const messages = this.getStoredMessages();
    messages.push(fullMessage);
    
    // Keep only last 100 messages to prevent localStorage overflow
    if (messages.length > 100) {
      messages.splice(0, messages.length - 100);
    }
    
    localStorage.setItem('signaling_messages', JSON.stringify(messages));
  }

  private getStoredMessages(): SignalMessage[] {
    const stored = localStorage.getItem('signaling_messages');
    return stored ? JSON.parse(stored) : [];
  }

  private isMessageRead(message: SignalMessage): boolean {
    const readMessages = JSON.parse(localStorage.getItem('read_messages') || '[]');
    return readMessages.includes(this.getMessageId(message));
  }

  private markMessageAsRead(message: SignalMessage) {
    const readMessages = JSON.parse(localStorage.getItem('read_messages') || '[]');
    const messageId = this.getMessageId(message);
    if (!readMessages.includes(messageId)) {
      readMessages.push(messageId);
      // Keep only last 200 read message IDs
      if (readMessages.length > 200) {
        readMessages.splice(0, readMessages.length - 200);
      }
      localStorage.setItem('read_messages', JSON.stringify(readMessages));
    }
  }

  private getMessageId(message: SignalMessage): string {
    return `${message.from}-${message.timestamp}`;
  }

  disconnect() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }

    // Announce leaving the room
    this.sendMessage({
      type: 'leave-room',
      from: this.userId,
      roomId: this.roomId,
      timestamp: Date.now()
    });
  }

  getRoomUsers(): string[] {
    const messages = this.getStoredMessages();
    const roomMessages = messages.filter(msg => msg.roomId === this.roomId);
    
    const users = new Set<string>();
    const userJoinTimes = new Map<string, number>();
    const userLeaveTimes = new Map<string, number>();

    roomMessages.forEach(msg => {
      if (msg.type === 'join-room') {
        users.add(msg.from);
        userJoinTimes.set(msg.from, msg.timestamp);
      } else if (msg.type === 'leave-room') {
        userLeaveTimes.set(msg.from, msg.timestamp);
      }
    });

    // Filter out users who have left after their last join
    const activeUsers = Array.from(users).filter(userId => {
      const joinTime = userJoinTimes.get(userId) || 0;
      const leaveTime = userLeaveTimes.get(userId) || 0;
      return joinTime > leaveTime;
    });

    return activeUsers;
  }
}

// WebSocket-based signaling service for production use
export class WebSocketSignalingService {
  private ws: WebSocket | null = null;
  private roomId: string;
  private userId: string;
  private onMessage?: (message: SignalMessage) => void;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(roomId: string, userId: string, serverUrl: string = 'ws://localhost:3001') {
    this.roomId = roomId;
    this.userId = userId;
  }

  connect(onMessage: (message: SignalMessage) => void) {
    this.onMessage = onMessage;
    // WebSocket implementation would go here
    // For now, fall back to local signaling
    console.warn('WebSocket signaling not implemented, using local signaling');
  }

  sendMessage(message: Omit<SignalMessage, 'timestamp'>) {
    // WebSocket send implementation would go here
    console.log('WebSocket send:', message);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const createSignalingService = (
  roomId: string, 
  userId: string, 
  useWebSocket: boolean = false
) => {
  if (useWebSocket) {
    return new WebSocketSignalingService(roomId, userId);
  }
  return new LocalSignalingService(roomId, userId);
};
