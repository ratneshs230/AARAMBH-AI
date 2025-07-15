import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';

// Storage Keys
export const STORAGE_KEYS = {
  // User Data
  USER_PROFILE: 'user_profile',
  USER_PREFERENCES: 'user_preferences',
  USER_PROGRESS: 'user_progress',
  
  // Study Sessions
  STUDY_SESSIONS: 'study_sessions',
  ACTIVE_SESSION: 'active_session',
  SESSION_STATS: 'session_stats',
  
  // AI Chat History
  CHAT_HISTORY: 'chat_history',
  CHAT_SETTINGS: 'chat_settings',
  
  // Content Cache
  GENERATED_CONTENT: 'generated_content',
  ASSESSMENTS: 'assessments',
  STUDY_PLANS: 'study_plans',
  
  // Analytics Data
  ANALYTICS_DATA: 'analytics_data',
  LEARNING_INSIGHTS: 'learning_insights',
  
  // App State
  APP_VERSION: 'app_version',
  LAST_SYNC: 'last_sync',
  OFFLINE_QUEUE: 'offline_queue',
  
  // Settings
  NOTIFICATION_SETTINGS: 'notification_settings',
  THEME_PREFERENCES: 'theme_preferences',
} as const;

export type StorageKey = keyof typeof STORAGE_KEYS;

// Data Types
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  level: string;
  totalPoints: number;
  streakDays: number;
  joinedDate: string;
  avatar?: string;
}

export interface UserPreferences {
  language: string;
  studyReminders: boolean;
  breakReminders: boolean;
  soundEnabled: boolean;
  dailyGoal: number;
  preferredStudyTime: string;
  subjects: string[];
}

export interface StudySession {
  id: string;
  subject: string;
  topic?: string;
  startTime: string;
  endTime?: string;
  duration: number;
  totalStudyTime: number;
  breaks: {
    startTime: string;
    duration: number;
  }[];
  goal?: number;
  completed: boolean;
  synced: boolean;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  agentType: string;
  metadata?: {
    confidence?: number;
    provider?: string;
    processingTime?: number;
  };
  synced: boolean;
}

export interface CachedContent {
  id: string;
  type: 'lesson_plan' | 'study_notes' | 'assessment' | 'study_plan';
  title: string;
  content: string;
  subject?: string;
  level?: string;
  createdAt: string;
  lastAccessed: string;
  synced: boolean;
}

export interface OfflineQueueItem {
  id: string;
  action: string;
  data: any;
  timestamp: string;
  retryCount: number;
  maxRetries: number;
}

// Storage Service Class
class StorageService {
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;

  constructor() {
    this.initializeNetworkListener();
  }

  // Network Monitoring
  private initializeNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      // If we just came back online, sync data
      if (wasOffline && this.isOnline && !this.syncInProgress) {
        this.syncOfflineData();
      }
    });
  }

  // Generic Storage Methods
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
      throw new Error(`Failed to store ${key}`);
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      throw new Error(`Failed to remove ${key}`);
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw new Error('Failed to clear storage');
    }
  }

  // User Profile Methods
  async saveUserProfile(profile: UserProfile): Promise<void> {
    await this.setItem(STORAGE_KEYS.USER_PROFILE, profile);
  }

  async getUserProfile(): Promise<UserProfile | null> {
    return await this.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
    const currentProfile = await this.getUserProfile();
    if (currentProfile) {
      const updatedProfile = { ...currentProfile, ...updates };
      await this.saveUserProfile(updatedProfile);
    }
  }

  // User Preferences Methods
  async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    await this.setItem(STORAGE_KEYS.USER_PREFERENCES, preferences);
  }

  async getUserPreferences(): Promise<UserPreferences | null> {
    return await this.getItem<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES);
  }

  async updateUserPreferences(updates: Partial<UserPreferences>): Promise<void> {
    const currentPrefs = await this.getUserPreferences();
    if (currentPrefs) {
      const updatedPrefs = { ...currentPrefs, ...updates };
      await this.saveUserPreferences(updatedPrefs);
    }
  }

  // Study Session Methods
  async saveStudySession(session: StudySession): Promise<void> {
    const sessions = await this.getStudySessions();
    const updatedSessions = [session, ...sessions.filter(s => s.id !== session.id)];
    await this.setItem(STORAGE_KEYS.STUDY_SESSIONS, updatedSessions);
    
    // Queue for sync if offline
    if (!this.isOnline) {
      await this.addToOfflineQueue('saveStudySession', session);
    }
  }

  async getStudySessions(): Promise<StudySession[]> {
    const sessions = await this.getItem<StudySession[]>(STORAGE_KEYS.STUDY_SESSIONS);
    return sessions || [];
  }

  async getStudySessionById(id: string): Promise<StudySession | null> {
    const sessions = await this.getStudySessions();
    return sessions.find(session => session.id === id) || null;
  }

  async deleteStudySession(id: string): Promise<void> {
    const sessions = await this.getStudySessions();
    const filteredSessions = sessions.filter(session => session.id !== id);
    await this.setItem(STORAGE_KEYS.STUDY_SESSIONS, filteredSessions);
  }

  // Active Session Methods
  async saveActiveSession(session: StudySession): Promise<void> {
    await this.setItem(STORAGE_KEYS.ACTIVE_SESSION, session);
  }

  async getActiveSession(): Promise<StudySession | null> {
    return await this.getItem<StudySession>(STORAGE_KEYS.ACTIVE_SESSION);
  }

  async clearActiveSession(): Promise<void> {
    await this.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
  }

  // Chat History Methods
  async saveChatMessage(agentType: string, message: ChatMessage): Promise<void> {
    const chatHistory = await this.getChatHistory(agentType);
    const updatedHistory = [message, ...chatHistory];
    
    // Keep only last 100 messages per agent
    const limitedHistory = updatedHistory.slice(0, 100);
    
    await this.setItem(`${STORAGE_KEYS.CHAT_HISTORY}_${agentType}`, limitedHistory);
    
    // Queue for sync if offline
    if (!this.isOnline) {
      await this.addToOfflineQueue('saveChatMessage', { agentType, message });
    }
  }

  async getChatHistory(agentType: string): Promise<ChatMessage[]> {
    const history = await this.getItem<ChatMessage[]>(`${STORAGE_KEYS.CHAT_HISTORY}_${agentType}`);
    return history || [];
  }

  async clearChatHistory(agentType: string): Promise<void> {
    await this.removeItem(`${STORAGE_KEYS.CHAT_HISTORY}_${agentType}`);
  }

  async getAllChatHistory(): Promise<Record<string, ChatMessage[]>> {
    const keys = await this.getAllKeys();
    const chatKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.CHAT_HISTORY));
    const chatHistory: Record<string, ChatMessage[]> = {};
    
    for (const key of chatKeys) {
      const agentType = key.replace(`${STORAGE_KEYS.CHAT_HISTORY}_`, '');
      chatHistory[agentType] = await this.getChatHistory(agentType);
    }
    
    return chatHistory;
  }

  // Content Cache Methods
  async cacheContent(content: CachedContent): Promise<void> {
    const cachedContent = await this.getCachedContent();
    const updatedCache = [content, ...cachedContent.filter(c => c.id !== content.id)];
    
    // Keep only last 50 items
    const limitedCache = updatedCache.slice(0, 50);
    
    await this.setItem(STORAGE_KEYS.GENERATED_CONTENT, limitedCache);
  }

  async getCachedContent(): Promise<CachedContent[]> {
    const content = await this.getItem<CachedContent[]>(STORAGE_KEYS.GENERATED_CONTENT);
    return content || [];
  }

  async getCachedContentById(id: string): Promise<CachedContent | null> {
    const content = await this.getCachedContent();
    const item = content.find(c => c.id === id);
    
    if (item) {
      // Update last accessed time
      item.lastAccessed = new Date().toISOString();
      await this.cacheContent(item);
    }
    
    return item || null;
  }

  async deleteCachedContent(id: string): Promise<void> {
    const content = await this.getCachedContent();
    const filteredContent = content.filter(c => c.id !== id);
    await this.setItem(STORAGE_KEYS.GENERATED_CONTENT, filteredContent);
  }

  // Analytics Data Methods
  async saveAnalyticsData(data: any): Promise<void> {
    await this.setItem(STORAGE_KEYS.ANALYTICS_DATA, {
      ...data,
      lastUpdated: new Date().toISOString()
    });
  }

  async getAnalyticsData(): Promise<any> {
    return await this.getItem(STORAGE_KEYS.ANALYTICS_DATA);
  }

  // Offline Queue Methods
  async addToOfflineQueue(action: string, data: any): Promise<void> {
    const queue = await this.getOfflineQueue();
    const queueItem: OfflineQueueItem = {
      id: Date.now().toString(),
      action,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      maxRetries: 3
    };
    
    queue.push(queueItem);
    await this.setItem(STORAGE_KEYS.OFFLINE_QUEUE, queue);
  }

  async getOfflineQueue(): Promise<OfflineQueueItem[]> {
    const queue = await this.getItem<OfflineQueueItem[]>(STORAGE_KEYS.OFFLINE_QUEUE);
    return queue || [];
  }

  async removeFromOfflineQueue(id: string): Promise<void> {
    const queue = await this.getOfflineQueue();
    const filteredQueue = queue.filter(item => item.id !== id);
    await this.setItem(STORAGE_KEYS.OFFLINE_QUEUE, filteredQueue);
  }

  async clearOfflineQueue(): Promise<void> {
    await this.setItem(STORAGE_KEYS.OFFLINE_QUEUE, []);
  }

  // Sync Methods
  async syncOfflineData(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) return;
    
    this.syncInProgress = true;
    
    try {
      const queue = await this.getOfflineQueue();
      
      for (const item of queue) {
        try {
          // Process each queued item
          await this.processOfflineQueueItem(item);
          await this.removeFromOfflineQueue(item.id);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          
          // Increment retry count
          item.retryCount++;
          
          if (item.retryCount >= item.maxRetries) {
            // Remove failed items after max retries
            await this.removeFromOfflineQueue(item.id);
          } else {
            // Update the item in queue for retry
            const updatedQueue = await this.getOfflineQueue();
            const itemIndex = updatedQueue.findIndex(q => q.id === item.id);
            if (itemIndex >= 0) {
              updatedQueue[itemIndex] = item;
              await this.setItem(STORAGE_KEYS.OFFLINE_QUEUE, updatedQueue);
            }
          }
        }
      }
      
      // Update last sync time
      await this.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      
    } catch (error) {
      console.error('Error during offline sync:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async processOfflineQueueItem(item: OfflineQueueItem): Promise<void> {
    // Here you would make actual API calls to sync data
    // This is a placeholder for the actual sync logic
    console.log(`Processing offline queue item: ${item.action}`, item.data);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mark synced items
    switch (item.action) {
      case 'saveStudySession':
        const session = item.data as StudySession;
        session.synced = true;
        await this.saveStudySession(session);
        break;
        
      case 'saveChatMessage':
        const { agentType, message } = item.data;
        message.synced = true;
        await this.saveChatMessage(agentType, message);
        break;
        
      default:
        console.warn(`Unknown offline action: ${item.action}`);
    }
  }

  // Utility Methods
  async getStorageInfo(): Promise<{
    totalSize: number;
    itemCount: number;
    keys: string[];
  }> {
    const keys = await this.getAllKeys();
    let totalSize = 0;
    
    for (const key of keys) {
      try {
        const value = await AsyncStorage.getItem(key);
        totalSize += value ? value.length : 0;
      } catch (error) {
        console.error(`Error calculating size for ${key}:`, error);
      }
    }
    
    return {
      totalSize,
      itemCount: keys.length,
      keys
    };
  }

  async cleanupOldData(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days ago
    
    // Clean old cached content
    const cachedContent = await this.getCachedContent();
    const recentContent = cachedContent.filter(content => 
      new Date(content.lastAccessed) > cutoffDate
    );
    await this.setItem(STORAGE_KEYS.GENERATED_CONTENT, recentContent);
    
    // Clean old study sessions (keep last 100)
    const sessions = await this.getStudySessions();
    const recentSessions = sessions.slice(0, 100);
    await this.setItem(STORAGE_KEYS.STUDY_SESSIONS, recentSessions);
  }

  // Status Methods
  isOffline(): boolean {
    return !this.isOnline;
  }

  isSyncInProgress(): boolean {
    return this.syncInProgress;
  }

  async getLastSyncTime(): Promise<string | null> {
    return await this.getItem<string>(STORAGE_KEYS.LAST_SYNC);
  }
}

// Export singleton instance
export const storageService = new StorageService();
export default storageService;