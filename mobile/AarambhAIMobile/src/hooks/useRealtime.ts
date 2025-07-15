import { useState, useEffect, useCallback, useRef } from 'react';
import { realtimeService, RealtimeMessage, UserPresence, StudySession, TypingIndicator } from '../services/realtime';

// Hook for connection status
export const useRealtimeConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState(realtimeService.getConnectionStatus());
  const [isConnected, setIsConnected] = useState(realtimeService.isConnectedToServer());

  useEffect(() => {
    const unsubscribe = realtimeService.addEventListener('connection', (data) => {
      setConnectionStatus(data.status);
      setIsConnected(data.status === 'connected');
    });

    return unsubscribe;
  }, []);

  const connect = useCallback(() => {
    realtimeService.connect();
  }, []);

  const disconnect = useCallback(() => {
    realtimeService.disconnect();
  }, []);

  return {
    connectionStatus,
    isConnected,
    connect,
    disconnect,
  };
};

// Hook for realtime messaging
export const useRealtimeMessaging = (channel?: string) => {
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (channel) {
      // Join channel
      realtimeService.joinChannel(channel);
      
      // Listen for messages in this channel
      const unsubscribe = realtimeService.addEventListener(`message:${channel}`, (message: RealtimeMessage) => {
        setMessages(prev => [...prev, message]);
      });

      return () => {
        unsubscribe();
        realtimeService.leaveChannel(channel);
      };
    } else {
      // Listen for all messages
      const unsubscribe = realtimeService.addEventListener('message', (message: RealtimeMessage) => {
        setMessages(prev => [...prev, message]);
      });

      return unsubscribe;
    }
  }, [channel]);

  const sendMessage = useCallback(async (content: any, type: RealtimeMessage['type'] = 'chat', metadata?: Record<string, any>) => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await realtimeService.sendMessage({
        type,
        content,
        channel,
        metadata,
      });

      if (!success) {
        throw new Error('Failed to send message');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('Failed to send message:', err);
    } finally {
      setIsLoading(false);
    }
  }, [channel]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
};

// Hook for typing indicators
export const useTypingIndicator = (channel: string) => {
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsubscribeStart = realtimeService.addEventListener(`typing_start:${channel}`, (data: TypingIndicator) => {
      setTypingUsers(prev => {
        const existing = prev.find(u => u.userId === data.userId);
        if (existing) {
          return prev.map(u => u.userId === data.userId ? data : u);
        }
        return [...prev, data];
      });
    });

    const unsubscribeStop = realtimeService.addEventListener(`typing_stop:${channel}`, (data: TypingIndicator) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    });

    return () => {
      unsubscribeStart();
      unsubscribeStop();
    };
  }, [channel]);

  const startTyping = useCallback(() => {
    realtimeService.startTyping(channel);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Auto-stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      realtimeService.stopTyping(channel);
    }, 3000);
  }, [channel]);

  const stopTyping = useCallback(() => {
    realtimeService.stopTyping(channel);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [channel]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    typingUsers,
    startTyping,
    stopTyping,
  };
};

// Hook for user presence
export const useUserPresence = (userId?: string) => {
  const [userPresence, setUserPresence] = useState<UserPresence | null>(
    userId ? realtimeService.getUserPresence(userId) : null
  );
  const [allPresence, setAllPresence] = useState<UserPresence[]>(realtimeService.getAllPresence());

  useEffect(() => {
    const unsubscribeOnline = realtimeService.addEventListener('user_online', (user: UserPresence) => {
      if (userId && user.userId === userId) {
        setUserPresence(user);
      }
      setAllPresence(realtimeService.getAllPresence());
    });

    const unsubscribeOffline = realtimeService.addEventListener('user_offline', (user: UserPresence) => {
      if (userId && user.userId === userId) {
        setUserPresence(user);
      }
      setAllPresence(realtimeService.getAllPresence());
    });

    const unsubscribeUpdate = realtimeService.addEventListener('presence_update', (user: UserPresence) => {
      if (userId && user.userId === userId) {
        setUserPresence(user);
      }
      setAllPresence(realtimeService.getAllPresence());
    });

    return () => {
      unsubscribeOnline();
      unsubscribeOffline();
      unsubscribeUpdate();
    };
  }, [userId]);

  const updatePresence = useCallback(async (status: UserPresence['status'], activity?: UserPresence['currentActivity']) => {
    await realtimeService.updatePresence(status, activity);
  }, []);

  return {
    userPresence,
    allPresence,
    updatePresence,
  };
};

// Hook for study sessions
export const useStudySession = () => {
  const [currentSession, setCurrentSession] = useState<StudySession | null>(realtimeService.getCurrentStudySession());
  const [availableSessions, setAvailableSessions] = useState<StudySession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeCreated = realtimeService.addEventListener('study_session_created', (session: StudySession) => {
      setAvailableSessions(prev => [...prev, session]);
    });

    const unsubscribeJoined = realtimeService.addEventListener('study_session_joined', (data: { sessionId: string; participant: any }) => {
      setAvailableSessions(prev => 
        prev.map(session => 
          session.id === data.sessionId 
            ? { ...session, participants: [...session.participants, data.participant] }
            : session
        )
      );
    });

    const unsubscribeLeft = realtimeService.addEventListener('study_session_left', (data: { sessionId: string; participantId: string }) => {
      setAvailableSessions(prev => 
        prev.map(session => 
          session.id === data.sessionId 
            ? { ...session, participants: session.participants.filter(p => p.id !== data.participantId) }
            : session
        )
      );
    });

    const unsubscribeUpdate = realtimeService.addEventListener('study_session_update', (session: StudySession) => {
      setCurrentSession(session);
      setAvailableSessions(prev => 
        prev.map(s => s.id === session.id ? session : s)
      );
    });

    return () => {
      unsubscribeCreated();
      unsubscribeJoined();
      unsubscribeLeft();
      unsubscribeUpdate();
    };
  }, []);

  const createSession = useCallback(async (sessionData: Omit<StudySession, 'id' | 'participants' | 'messages' | 'status'>) => {
    setIsLoading(true);
    setError(null);

    try {
      const sessionId = await realtimeService.createStudySession(sessionData);
      if (sessionId) {
        setCurrentSession(realtimeService.getCurrentStudySession());
        return sessionId;
      } else {
        throw new Error('Failed to create study session');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create study session';
      setError(errorMessage);
      console.error('Failed to create study session:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const joinSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await realtimeService.joinStudySession(sessionId);
      if (success) {
        setCurrentSession(realtimeService.getCurrentStudySession());
      } else {
        throw new Error('Failed to join study session');
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join study session';
      setError(errorMessage);
      console.error('Failed to join study session:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const leaveSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await realtimeService.leaveStudySession();
      if (success) {
        setCurrentSession(null);
      } else {
        throw new Error('Failed to leave study session');
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to leave study session';
      setError(errorMessage);
      console.error('Failed to leave study session:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendSessionMessage = useCallback(async (content: any, metadata?: Record<string, any>) => {
    if (!currentSession) return false;

    return await realtimeService.sendMessage({
      type: 'study_session',
      content,
      channel: currentSession.id,
      metadata,
    });
  }, [currentSession]);

  return {
    currentSession,
    availableSessions,
    isLoading,
    error,
    createSession,
    joinSession,
    leaveSession,
    sendSessionMessage,
  };
};

// Hook for collaborative features
export const useCollaboration = (sessionId: string) => {
  const [collaborators, setCollaborators] = useState<UserPresence[]>([]);
  const [sharedData, setSharedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Join collaboration session
    realtimeService.joinChannel(`collaboration:${sessionId}`);

    const unsubscribeMessage = realtimeService.addEventListener(`message:collaboration:${sessionId}`, (message: RealtimeMessage) => {
      if (message.type === 'collaboration') {
        handleCollaborationMessage(message);
      }
    });

    const unsubscribePresence = realtimeService.addEventListener('presence_update', (user: UserPresence) => {
      if (user.currentActivity?.type === 'collaboration' && user.currentActivity?.details === sessionId) {
        setCollaborators(prev => {
          const existing = prev.find(c => c.userId === user.userId);
          if (existing) {
            return prev.map(c => c.userId === user.userId ? user : c);
          }
          return [...prev, user];
        });
      }
    });

    // Set current user's activity
    realtimeService.updatePresence('online', {
      type: 'collaboration' as any,
      details: sessionId,
    });

    return () => {
      unsubscribeMessage();
      unsubscribePresence();
      realtimeService.leaveChannel(`collaboration:${sessionId}`);
    };
  }, [sessionId]);

  const handleCollaborationMessage = (message: RealtimeMessage) => {
    switch (message.content.action) {
      case 'data_update':
        setSharedData(message.content.data);
        break;
      case 'cursor_move':
        // Handle cursor movement
        break;
      case 'selection_change':
        // Handle selection changes
        break;
      default:
        console.log('Unknown collaboration action:', message.content.action);
    }
  };

  const updateSharedData = useCallback(async (data: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await realtimeService.sendMessage({
        type: 'collaboration',
        content: {
          action: 'data_update',
          data,
        },
        channel: `collaboration:${sessionId}`,
      });

      if (success) {
        setSharedData(data);
      } else {
        throw new Error('Failed to update shared data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update shared data';
      setError(errorMessage);
      console.error('Failed to update shared data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const broadcastCursor = useCallback(async (position: { x: number; y: number }) => {
    await realtimeService.sendMessage({
      type: 'collaboration',
      content: {
        action: 'cursor_move',
        position,
      },
      channel: `collaboration:${sessionId}`,
    });
  }, [sessionId]);

  return {
    collaborators,
    sharedData,
    isLoading,
    error,
    updateSharedData,
    broadcastCursor,
  };
};

// Hook for system notifications
export const useSystemNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsubscribe = realtimeService.addEventListener('system_notification', (notification: any) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return unsubscribe;
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId 
          ? { ...n, read: true }
          : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
};

// Hook for realtime analytics
export const useRealtimeAnalytics = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = realtimeService.addEventListener('analytics_update', (data: any) => {
      setMetrics(data);
    });

    return unsubscribe;
  }, []);

  const trackEvent = useCallback(async (event: string, properties?: Record<string, any>) => {
    try {
      await realtimeService.sendMessage({
        type: 'system',
        content: {
          action: 'track_event',
          event,
          properties,
        },
      });
    } catch (err) {
      console.error('Failed to track event:', err);
    }
  }, []);

  return {
    metrics,
    isLoading,
    error,
    trackEvent,
  };
};

// Hook for managing multiple realtime features
export const useRealtimeManager = () => {
  const connection = useRealtimeConnection();
  const presence = useUserPresence();
  const notifications = useSystemNotifications();

  const initialize = useCallback(async (user: { id: string; name: string; avatar?: string }) => {
    await realtimeService.setCurrentUser(user);
    if (!connection.isConnected) {
      connection.connect();
    }
  }, [connection]);

  const cleanup = useCallback(() => {
    realtimeService.destroy();
  }, []);

  return {
    connection,
    presence,
    notifications,
    initialize,
    cleanup,
  };
};