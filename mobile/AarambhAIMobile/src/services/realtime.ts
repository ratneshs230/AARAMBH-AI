import { io, Socket } from 'socket.io-client';
import { networkService } from './network';
import { storageService } from './storage';
import { notificationService } from './notifications';

export interface RealtimeMessage {
  id: string;
  type: 'chat' | 'notification' | 'system' | 'typing' | 'presence' | 'study_session' | 'collaboration';
  sender: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  content: any;
  timestamp: string;
  channel?: string;
  metadata?: Record<string, any>;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  channel: string;
  timestamp: string;
}

export interface UserPresence {
  userId: string;
  userName: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen: string;
  currentActivity?: {
    type: 'studying' | 'taking_assessment' | 'browsing' | 'idle';
    details?: string;
  };
}

export interface StudySession {
  id: string;
  hostId: string;
  hostName: string;
  title: string;
  subject: string;
  description: string;
  participants: {
    id: string;
    name: string;
    avatar?: string;
    joinedAt: string;
  }[];
  maxParticipants: number;
  isPublic: boolean;
  startTime: string;
  endTime?: string;
  status: 'waiting' | 'active' | 'paused' | 'ended';
  currentTopic?: string;
  messages: RealtimeMessage[];
}

export type RealtimeEventListener = (data: any) => void;

class RealtimeService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  
  private listeners: Map<string, Set<RealtimeEventListener>> = new Map();
  private messageQueue: RealtimeMessage[] = [];
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map();
  
  // State management
  private currentUser: { id: string; name: string; avatar?: string } | null = null;
  private userPresence: Map<string, UserPresence> = new Map();
  private activeChannels: Set<string> = new Set();
  private currentStudySession: StudySession | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // Listen for network changes
    networkService.addListener((state) => {
      if (state.isConnected && !this.isConnected) {
        this.connect();
      } else if (!state.isConnected && this.isConnected) {
        this.handleDisconnection();
      }
    });

    // Load current user from storage
    const userProfile = await storageService.getUserProfile();
    if (userProfile) {
      this.currentUser = {
        id: userProfile.id,
        name: userProfile.name,
        avatar: userProfile.avatar,
      };
    }
  }

  // Connection Management
  async connect(force = false): Promise<void> {
    if (this.isConnected && !force) return;
    if (!networkService.isConnected()) return;

    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://api.aarambhai.com';
      const socketUrl = apiUrl.replace(/^http/, 'ws');

      this.socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        auth: {
          userId: this.currentUser?.id,
          token: await storageService.getItem('authToken'),
        },
      });

      this.setupSocketListeners();
      
      console.log('🔄 Connecting to realtime server...');
      
    } catch (error) {
      console.error('❌ Failed to connect to realtime server:', error);
      this.scheduleReconnect();
    }
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Connected to realtime server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.authenticateUser();
      this.processMessageQueue();
      this.emit('connection', { status: 'connected' });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from realtime server:', reason);
      this.handleDisconnection();
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      this.handleConnectionError();
    });

    // Authentication
    this.socket.on('authenticated', (data) => {
      console.log('🔐 User authenticated:', data);
      this.rejoinChannels();
      this.syncPresence();
    });

    this.socket.on('auth_error', (error) => {
      console.error('🔐 Authentication failed:', error);
      this.emit('auth_error', error);
    });

    // Message events
    this.socket.on('message', (message: RealtimeMessage) => {
      this.handleIncomingMessage(message);
    });

    this.socket.on('typing_start', (data: TypingIndicator) => {
      this.handleTypingStart(data);
    });

    this.socket.on('typing_stop', (data: TypingIndicator) => {
      this.handleTypingStop(data);
    });

    // Presence events
    this.socket.on('user_online', (user: UserPresence) => {
      this.updateUserPresence(user);
      this.emit('user_online', user);
    });

    this.socket.on('user_offline', (user: UserPresence) => {
      this.updateUserPresence(user);
      this.emit('user_offline', user);
    });

    this.socket.on('presence_update', (user: UserPresence) => {
      this.updateUserPresence(user);
      this.emit('presence_update', user);
    });

    // Study session events
    this.socket.on('study_session_created', (session: StudySession) => {
      this.emit('study_session_created', session);
    });

    this.socket.on('study_session_joined', (data: { sessionId: string; participant: any }) => {
      if (this.currentStudySession?.id === data.sessionId) {
        this.currentStudySession.participants.push(data.participant);
      }
      this.emit('study_session_joined', data);
    });

    this.socket.on('study_session_left', (data: { sessionId: string; participantId: string }) => {
      if (this.currentStudySession?.id === data.sessionId) {
        this.currentStudySession.participants = this.currentStudySession.participants.filter(
          p => p.id !== data.participantId
        );
      }
      this.emit('study_session_left', data);
    });

    this.socket.on('study_session_update', (session: StudySession) => {
      if (this.currentStudySession?.id === session.id) {
        this.currentStudySession = session;
      }
      this.emit('study_session_update', session);
    });

    // System events
    this.socket.on('system_notification', (notification: any) => {
      this.handleSystemNotification(notification);
    });

    this.socket.on('heartbeat', () => {
      this.socket?.emit('heartbeat_ack');
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.stopHeartbeat();
    this.clearTypingTimeouts();
    this.emit('connection', { status: 'disconnected' });
  }

  private handleDisconnection() {
    this.isConnected = false;
    this.stopHeartbeat();
    this.emit('connection', { status: 'disconnected' });
    
    if (networkService.isConnected()) {
      this.scheduleReconnect();
    }
  }

  private handleConnectionError() {
    this.scheduleReconnect();
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('❌ Max reconnection attempts reached');
      this.emit('connection', { status: 'failed' });
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      if (networkService.isConnected()) {
        this.connect();
      }
    }, delay);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.socket) {
        this.socket.emit('heartbeat');
      }
    }, 30000); // Every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Authentication
  private async authenticateUser() {
    if (!this.socket || !this.currentUser) return;

    const token = await storageService.getItem('authToken');
    this.socket.emit('authenticate', {
      userId: this.currentUser.id,
      token,
      userInfo: this.currentUser,
    });
  }

  // Message Handling
  private handleIncomingMessage(message: RealtimeMessage) {
    // Store message locally
    this.storeMessage(message);

    // Emit to listeners
    this.emit('message', message);
    this.emit(`message:${message.channel}`, message);

    // Handle specific message types
    switch (message.type) {
      case 'chat':
        this.handleChatMessage(message);
        break;
      case 'notification':
        this.handleNotificationMessage(message);
        break;
      case 'study_session':
        this.handleStudySessionMessage(message);
        break;
      case 'system':
        this.handleSystemMessage(message);
        break;
    }
  }

  private async handleChatMessage(message: RealtimeMessage) {
    // Save to chat history
    if (message.channel) {
      await storageService.saveChatMessage(message.channel, {
        id: message.id,
        type: message.sender.id === this.currentUser?.id ? 'user' : 'ai',
        content: message.content,
        timestamp: message.timestamp,
        agentType: message.channel,
        synced: true,
        metadata: message.metadata,
      });
    }

    // Show notification if app is in background
    if (message.sender.id !== this.currentUser?.id) {
      await notificationService.notifyAIResponse(
        message.channel || 'chat',
        message.content.text || message.content
      );
    }
  }

  private handleNotificationMessage(message: RealtimeMessage) {
    // Show push notification
    notificationService.sendNotification({
      id: message.id,
      title: message.content.title,
      body: message.content.body,
      data: message.content.data,
    });
  }

  private handleStudySessionMessage(message: RealtimeMessage) {
    if (this.currentStudySession) {
      this.currentStudySession.messages.push(message);
    }
  }

  private handleSystemMessage(message: RealtimeMessage) {
    console.log('System message:', message);
    this.emit('system_message', message);
  }

  private handleSystemNotification(notification: any) {
    // Handle system-wide notifications
    notificationService.sendNotification({
      id: notification.id,
      title: notification.title,
      body: notification.message,
      data: notification.data,
    });
  }

  private async storeMessage(message: RealtimeMessage) {
    try {
      const messages = await storageService.getItem('realtimeMessages') || [];
      messages.push(message);
      
      // Keep only last 1000 messages
      if (messages.length > 1000) {
        messages.splice(0, messages.length - 1000);
      }
      
      await storageService.setItem('realtimeMessages', messages);
    } catch (error) {
      console.error('Failed to store realtime message:', error);
    }
  }

  // Message Sending
  async sendMessage(message: Omit<RealtimeMessage, 'id' | 'timestamp' | 'sender'>): Promise<boolean> {
    if (!this.currentUser) {
      console.error('No current user for sending message');
      return false;
    }

    const fullMessage: RealtimeMessage = {
      ...message,
      id: this.generateMessageId(),
      timestamp: new Date().toISOString(),
      sender: this.currentUser,
    };

    if (this.isConnected && this.socket) {
      try {
        this.socket.emit('send_message', fullMessage);
        await this.storeMessage(fullMessage);
        return true;
      } catch (error) {
        console.error('Failed to send message:', error);
        this.queueMessage(fullMessage);
        return false;
      }
    } else {
      this.queueMessage(fullMessage);
      return false;
    }
  }

  private queueMessage(message: RealtimeMessage) {
    this.messageQueue.push(message);
    
    // Store queued messages
    storageService.setItem('queuedRealtimeMessages', this.messageQueue);
  }

  private async processMessageQueue() {
    // Load queued messages from storage
    const queuedMessages = await storageService.getItem('queuedRealtimeMessages') || [];
    this.messageQueue = [...this.messageQueue, ...queuedMessages];

    while (this.messageQueue.length > 0 && this.isConnected && this.socket) {
      const message = this.messageQueue.shift();
      if (message) {
        try {
          this.socket.emit('send_message', message);
        } catch (error) {
          console.error('Failed to send queued message:', error);
          this.messageQueue.unshift(message); // Put back at front
          break;
        }
      }
    }

    // Update stored queue
    await storageService.setItem('queuedRealtimeMessages', this.messageQueue);
  }

  // Typing Indicators
  startTyping(channel: string) {
    if (!this.isConnected || !this.socket || !this.currentUser) return;

    this.socket.emit('typing_start', {
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      channel,
      timestamp: new Date().toISOString(),
    });

    // Auto-stop typing after 3 seconds
    const timeoutKey = `${channel}_${this.currentUser.id}`;
    if (this.typingTimeouts.has(timeoutKey)) {
      clearTimeout(this.typingTimeouts.get(timeoutKey)!);
    }

    const timeout = setTimeout(() => {
      this.stopTyping(channel);
    }, 3000);

    this.typingTimeouts.set(timeoutKey, timeout);
  }

  stopTyping(channel: string) {
    if (!this.isConnected || !this.socket || !this.currentUser) return;

    this.socket.emit('typing_stop', {
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      channel,
      timestamp: new Date().toISOString(),
    });

    const timeoutKey = `${channel}_${this.currentUser.id}`;
    if (this.typingTimeouts.has(timeoutKey)) {
      clearTimeout(this.typingTimeouts.get(timeoutKey)!);
      this.typingTimeouts.delete(timeoutKey);
    }
  }

  private handleTypingStart(data: TypingIndicator) {
    this.emit('typing_start', data);
    this.emit(`typing_start:${data.channel}`, data);
  }

  private handleTypingStop(data: TypingIndicator) {
    this.emit('typing_stop', data);
    this.emit(`typing_stop:${data.channel}`, data);
  }

  private clearTypingTimeouts() {
    this.typingTimeouts.forEach(timeout => clearTimeout(timeout));
    this.typingTimeouts.clear();
  }

  // Presence Management
  async updatePresence(status: UserPresence['status'], activity?: UserPresence['currentActivity']) {
    if (!this.isConnected || !this.socket || !this.currentUser) return;

    const presence: UserPresence = {
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      status,
      lastSeen: new Date().toISOString(),
      currentActivity: activity,
    };

    this.socket.emit('update_presence', presence);
    this.updateUserPresence(presence);
  }

  private updateUserPresence(user: UserPresence) {
    this.userPresence.set(user.userId, user);
  }

  private async syncPresence() {
    if (!this.isConnected || !this.socket) return;

    this.socket.emit('sync_presence');
  }

  getUserPresence(userId: string): UserPresence | null {
    return this.userPresence.get(userId) || null;
  }

  getAllPresence(): UserPresence[] {
    return Array.from(this.userPresence.values());
  }

  // Channel Management
  async joinChannel(channel: string) {
    if (!this.isConnected || !this.socket) return false;

    try {
      this.socket.emit('join_channel', { channel });
      this.activeChannels.add(channel);
      this.emit('channel_joined', { channel });
      return true;
    } catch (error) {
      console.error('Failed to join channel:', error);
      return false;
    }
  }

  async leaveChannel(channel: string) {
    if (!this.isConnected || !this.socket) return false;

    try {
      this.socket.emit('leave_channel', { channel });
      this.activeChannels.delete(channel);
      this.emit('channel_left', { channel });
      return true;
    } catch (error) {
      console.error('Failed to leave channel:', error);
      return false;
    }
  }

  private async rejoinChannels() {
    for (const channel of this.activeChannels) {
      await this.joinChannel(channel);
    }
  }

  getActiveChannels(): string[] {
    return Array.from(this.activeChannels);
  }

  // Study Session Management
  async createStudySession(session: Omit<StudySession, 'id' | 'participants' | 'messages' | 'status'>): Promise<string | null> {
    if (!this.isConnected || !this.socket || !this.currentUser) return null;

    const sessionId = this.generateSessionId();
    const fullSession: StudySession = {
      ...session,
      id: sessionId,
      participants: [{
        id: this.currentUser.id,
        name: this.currentUser.name,
        avatar: this.currentUser.avatar,
        joinedAt: new Date().toISOString(),
      }],
      messages: [],
      status: 'waiting',
    };

    try {
      this.socket.emit('create_study_session', fullSession);
      this.currentStudySession = fullSession;
      return sessionId;
    } catch (error) {
      console.error('Failed to create study session:', error);
      return null;
    }
  }

  async joinStudySession(sessionId: string): Promise<boolean> {
    if (!this.isConnected || !this.socket || !this.currentUser) return false;

    try {
      this.socket.emit('join_study_session', {
        sessionId,
        participant: {
          id: this.currentUser.id,
          name: this.currentUser.name,
          avatar: this.currentUser.avatar,
          joinedAt: new Date().toISOString(),
        },
      });
      return true;
    } catch (error) {
      console.error('Failed to join study session:', error);
      return false;
    }
  }

  async leaveStudySession(): Promise<boolean> {
    if (!this.isConnected || !this.socket || !this.currentStudySession) return false;

    try {
      this.socket.emit('leave_study_session', {
        sessionId: this.currentStudySession.id,
        participantId: this.currentUser?.id,
      });
      this.currentStudySession = null;
      return true;
    } catch (error) {
      console.error('Failed to leave study session:', error);
      return false;
    }
  }

  getCurrentStudySession(): StudySession | null {
    return this.currentStudySession;
  }

  // Event Management
  addEventListener(event: string, listener: RealtimeEventListener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.removeEventListener(event, listener);
    };
  }

  removeEventListener(event: string, listener: RealtimeEventListener) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('Error in realtime event listener:', error);
        }
      });
    }
  }

  // Utility Methods
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public API
  isConnectedToServer(): boolean {
    return this.isConnected;
  }

  getConnectionStatus(): 'connected' | 'disconnected' | 'connecting' | 'failed' {
    if (this.isConnected) return 'connected';
    if (this.reconnectAttempts > 0 && this.reconnectAttempts < this.maxReconnectAttempts) return 'connecting';
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return 'failed';
    return 'disconnected';
  }

  async setCurrentUser(user: { id: string; name: string; avatar?: string }) {
    this.currentUser = user;
    await storageService.saveUserProfile(user);
    
    if (this.isConnected) {
      this.authenticateUser();
    }
  }

  // Cleanup
  destroy() {
    this.disconnect();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.stopHeartbeat();
    this.clearTypingTimeouts();
    this.listeners.clear();
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService();
export default realtimeService;