import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { storageService } from './storage';
import { networkService } from './network';

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  sound?: boolean;
  badge?: number;
  category?: string;
  priority?: 'low' | 'normal' | 'high' | 'max';
  channelId?: string;
}

export interface ScheduledNotification extends NotificationData {
  trigger: {
    type: 'date' | 'timeInterval' | 'daily' | 'weekly';
    date?: Date;
    seconds?: number;
    hour?: number;
    minute?: number;
    weekday?: number;
    repeats?: boolean;
  };
}

export interface NotificationSettings {
  enabled: boolean;
  studyReminders: boolean;
  aiResponses: boolean;
  courseUpdates: boolean;
  achievements: boolean;
  weeklyReports: boolean;
  dailyGoals: boolean;
  sessionBreaks: boolean;
  sound: boolean;
  vibration: boolean;
  badgeCount: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string; // "22:00"
    endTime: string; // "08:00"
  };
}

export interface StudyReminderConfig {
  enabled: boolean;
  subjects: string[];
  times: string[]; // ["09:00", "15:00", "20:00"]
  days: number[]; // [1,2,3,4,5] for weekdays
  customMessage?: string;
}

class NotificationService {
  private expoPushToken: string | null = null;
  private isInitialized: boolean = false;
  private notificationListener: any = null;
  private responseListener: any = null;
  private settings: NotificationSettings = {
    enabled: true,
    studyReminders: true,
    aiResponses: true,
    courseUpdates: true,
    achievements: true,
    weeklyReports: true,
    dailyGoals: true,
    sessionBreaks: true,
    sound: true,
    vibration: true,
    badgeCount: true,
    quietHours: {
      enabled: true,
      startTime: "22:00",
      endTime: "08:00"
    }
  };

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // Load saved settings
      const savedSettings = await storageService.getItem('notificationSettings');
      if (savedSettings) {
        this.settings = { ...this.settings, ...savedSettings };
      }

      // Configure notification behavior
      await this.configureNotifications();

      // Register for push notifications
      await this.registerForPushNotificationsAsync();

      // Set up listeners
      this.setupNotificationListeners();

      // Schedule default notifications
      await this.scheduleDefaultNotifications();

      this.isInitialized = true;
      console.log('✅ Notification service initialized');

    } catch (error) {
      console.error('❌ Failed to initialize notification service:', error);
    }
  }

  private async configureNotifications() {
    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        // Check quiet hours
        if (this.isQuietHours()) {
          return {
            shouldShowAlert: false,
            shouldPlaySound: false,
            shouldSetBadge: false,
          };
        }

        return {
          shouldShowAlert: this.settings.enabled,
          shouldPlaySound: this.settings.enabled && this.settings.sound,
          shouldSetBadge: this.settings.enabled && this.settings.badgeCount,
        };
      },
    });

    // Configure notification channels (Android)
    if (Platform.OS === 'android') {
      await this.createNotificationChannels();
    }
  }

  private async createNotificationChannels() {
    const channels = [
      {
        id: 'study-reminders',
        name: 'Study Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        description: 'Reminders for study sessions and breaks',
        sound: 'default',
        vibrationPattern: [250, 250, 250, 250],
        enableVibration: true,
        enableLights: true,
        lightColor: '#4F46E5',
      },
      {
        id: 'ai-responses',
        name: 'AI Responses',
        importance: Notifications.AndroidImportance.DEFAULT,
        description: 'Notifications when AI agents respond',
        sound: 'default',
      },
      {
        id: 'course-updates',
        name: 'Course Updates',
        importance: Notifications.AndroidImportance.DEFAULT,
        description: 'Updates about courses and content',
      },
      {
        id: 'achievements',
        name: 'Achievements',
        importance: Notifications.AndroidImportance.HIGH,
        description: 'Achievement unlocks and milestones',
        sound: 'achievement.wav',
      },
      {
        id: 'reports',
        name: 'Progress Reports',
        importance: Notifications.AndroidImportance.LOW,
        description: 'Weekly and monthly progress reports',
      },
    ];

    for (const channel of channels) {
      await Notifications.setNotificationChannelAsync(channel.id, channel);
    }
  }

  private async registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return;
      }
      
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })).data;
      
      this.expoPushToken = token;
      
      // Save token to storage and send to backend
      await storageService.setItem('expoPushToken', token);
      await this.registerTokenWithBackend(token);
      
    } else {
      console.warn('Must use physical device for Push Notifications');
    }

    return token;
  }

  private async registerTokenWithBackend(token: string) {
    try {
      if (networkService.isConnected()) {
        // In a real app, send token to your backend
        console.log('📱 Push token registered:', token);
        
        // Store locally for offline queue if needed
        await storageService.addToOfflineQueue('registerPushToken', { token });
      }
    } catch (error) {
      console.error('Failed to register push token:', error);
    }
  }

  private setupNotificationListeners() {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📳 Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Listener for notification responses (when user taps notification)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
      this.handleNotificationResponse(response);
    });
  }

  private handleNotificationReceived(notification: Notifications.Notification) {
    const { title, body, data } = notification.request.content;
    
    // Update badge count
    if (this.settings.badgeCount) {
      this.incrementBadgeCount();
    }

    // Store notification for history
    this.storeNotificationHistory({
      id: notification.request.identifier,
      title: title || '',
      body: body || '',
      data,
      receivedAt: new Date().toISOString(),
    });
  }

  private async handleNotificationResponse(response: Notifications.NotificationResponse) {
    const { notification } = response;
    const { data } = notification.request.content;

    // Clear badge count when notification is tapped
    await this.setBadgeCount(0);

    // Handle different notification types
    if (data?.type) {
      switch (data.type) {
        case 'study_reminder':
          this.handleStudyReminderTap(data);
          break;
        case 'ai_response':
          this.handleAIResponseTap(data);
          break;
        case 'achievement':
          this.handleAchievementTap(data);
          break;
        case 'course_update':
          this.handleCourseUpdateTap(data);
          break;
        default:
          console.log('Unknown notification type:', data.type);
      }
    }
  }

  private handleStudyReminderTap(data: any) {
    // Navigate to study session or subject
    console.log('Opening study session for:', data.subject);
    // In a real app, use navigation service to navigate to appropriate screen
  }

  private handleAIResponseTap(data: any) {
    // Navigate to chat with specific AI agent
    console.log('Opening AI chat for:', data.agentType);
    // Navigate to specific agent chat screen
  }

  private handleAchievementTap(data: any) {
    // Navigate to achievements screen
    console.log('Opening achievement:', data.achievementId);
    // Navigate to achievements or profile screen
  }

  private handleCourseUpdateTap(data: any) {
    // Navigate to course or content
    console.log('Opening course update:', data.courseId);
    // Navigate to course details screen
  }

  // Public Methods

  // Send immediate notification
  async sendNotification(notification: NotificationData): Promise<string | null> {
    if (!this.settings.enabled) {
      return null;
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: notification.sound !== false && this.settings.sound,
          badge: notification.badge,
          priority: this.mapPriority(notification.priority || 'normal'),
        },
        trigger: null,
      });

      console.log('📤 Notification sent:', notificationId);
      return notificationId;

    } catch (error) {
      console.error('Failed to send notification:', error);
      return null;
    }
  }

  // Schedule future notification
  async scheduleNotification(notification: ScheduledNotification): Promise<string | null> {
    if (!this.settings.enabled) {
      return null;
    }

    try {
      let trigger: any;

      switch (notification.trigger.type) {
        case 'date':
          trigger = { date: notification.trigger.date };
          break;
        case 'timeInterval':
          trigger = { 
            seconds: notification.trigger.seconds,
            repeats: notification.trigger.repeats 
          };
          break;
        case 'daily':
          trigger = {
            hour: notification.trigger.hour,
            minute: notification.trigger.minute,
            repeats: true,
          };
          break;
        case 'weekly':
          trigger = {
            weekday: notification.trigger.weekday,
            hour: notification.trigger.hour,
            minute: notification.trigger.minute,
            repeats: true,
          };
          break;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: notification.sound !== false && this.settings.sound,
          badge: notification.badge,
          categoryIdentifier: notification.category,
        },
        trigger,
      });

      console.log('⏰ Notification scheduled:', notificationId);
      
      // Store scheduled notification
      await this.storeScheduledNotification(notificationId, notification);
      
      return notificationId;

    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return null;
    }
  }

  // Cancel scheduled notification
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      await this.removeScheduledNotification(notificationId);
      console.log('❌ Notification cancelled:', notificationId);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await storageService.removeItem('scheduledNotifications');
      console.log('🗑️ All notifications cancelled');
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  // Study reminder methods
  async scheduleStudyReminders(config: StudyReminderConfig): Promise<void> {
    if (!config.enabled || !this.settings.studyReminders) {
      return;
    }

    // Cancel existing study reminders
    await this.cancelStudyReminders();

    const notifications: string[] = [];

    for (const subject of config.subjects) {
      for (const time of config.times) {
        for (const day of config.days) {
          const [hour, minute] = time.split(':').map(Number);
          
          const notificationId = await this.scheduleNotification({
            id: `study_reminder_${subject}_${day}_${time}`,
            title: `📚 Study Time for ${subject}`,
            body: config.customMessage || `Time to study ${subject}! Let's make progress today.`,
            data: {
              type: 'study_reminder',
              subject,
              time,
              day,
            },
            category: 'study-reminders',
            trigger: {
              type: 'weekly',
              weekday: day,
              hour,
              minute,
              repeats: true,
            },
          });

          if (notificationId) {
            notifications.push(notificationId);
          }
        }
      }
    }

    await storageService.setItem('studyReminderIds', notifications);
  }

  async cancelStudyReminders(): Promise<void> {
    const reminderIds = await storageService.getItem('studyReminderIds') || [];
    
    for (const id of reminderIds) {
      await this.cancelNotification(id);
    }
    
    await storageService.removeItem('studyReminderIds');
  }

  // AI response notifications
  async notifyAIResponse(agentType: string, message: string): Promise<void> {
    if (!this.settings.aiResponses) {
      return;
    }

    const agentNames: Record<string, string> = {
      tutor: '👨‍🏫 AI Tutor',
      content: '📝 Content Creator',
      assessment: '📊 Assessment Generator',
      doubt_solver: '🤔 Doubt Solver',
      planner: '📅 Study Planner',
      mentor: '🧭 AI Mentor',
      analytics: '📈 Analytics'
    };

    await this.sendNotification({
      id: `ai_response_${Date.now()}`,
      title: `${agentNames[agentType] || 'AI Assistant'} responded`,
      body: message.length > 100 ? message.substring(0, 100) + '...' : message,
      data: {
        type: 'ai_response',
        agentType,
      },
      category: 'ai-responses',
    });
  }

  // Achievement notifications
  async notifyAchievement(achievement: {
    id: string;
    title: string;
    description: string;
    icon?: string;
  }): Promise<void> {
    if (!this.settings.achievements) {
      return;
    }

    await this.sendNotification({
      id: `achievement_${achievement.id}`,
      title: `🏆 Achievement Unlocked!`,
      body: `${achievement.title}: ${achievement.description}`,
      data: {
        type: 'achievement',
        achievementId: achievement.id,
      },
      category: 'achievements',
      priority: 'high',
    });
  }

  // Session break reminders
  async scheduleSessionBreak(minutes: number): Promise<string | null> {
    if (!this.settings.sessionBreaks) {
      return null;
    }

    return await this.scheduleNotification({
      id: `break_reminder_${Date.now()}`,
      title: '⏰ Break Time!',
      body: `You've been studying for ${minutes} minutes. Time for a short break!`,
      data: {
        type: 'break_reminder',
        duration: minutes,
      },
      trigger: {
        type: 'timeInterval',
        seconds: minutes * 60,
        repeats: false,
      },
    });
  }

  // Weekly report notification
  async scheduleWeeklyReport(): Promise<void> {
    if (!this.settings.weeklyReports) {
      return;
    }

    await this.scheduleNotification({
      id: 'weekly_report',
      title: '📊 Your Weekly Report is Ready!',
      body: 'Check out your study progress and achievements from this week.',
      data: {
        type: 'weekly_report',
      },
      category: 'reports',
      trigger: {
        type: 'weekly',
        weekday: 1, // Monday
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });
  }

  // Settings management
  async updateSettings(newSettings: Partial<NotificationSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    await storageService.setItem('notificationSettings', this.settings);
    
    // Reschedule notifications if needed
    if (!this.settings.enabled) {
      await this.cancelAllNotifications();
    } else {
      await this.scheduleDefaultNotifications();
    }
  }

  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  // Badge management
  async setBadgeCount(count: number): Promise<void> {
    if (this.settings.badgeCount) {
      await Notifications.setBadgeCountAsync(count);
    }
  }

  async incrementBadgeCount(): Promise<void> {
    if (this.settings.badgeCount) {
      const current = await Notifications.getBadgeCountAsync();
      await Notifications.setBadgeCountAsync(current + 1);
    }
  }

  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }

  // Utility methods
  private isQuietHours(): boolean {
    if (!this.settings.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const { startTime, endTime } = this.settings.quietHours;
    
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Spans midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  private mapPriority(priority: string): Notifications.AndroidImportance {
    switch (priority) {
      case 'low': return Notifications.AndroidImportance.LOW;
      case 'normal': return Notifications.AndroidImportance.DEFAULT;
      case 'high': return Notifications.AndroidImportance.HIGH;
      case 'max': return Notifications.AndroidImportance.MAX;
      default: return Notifications.AndroidImportance.DEFAULT;
    }
  }

  private async scheduleDefaultNotifications(): Promise<void> {
    // Schedule weekly report
    await this.scheduleWeeklyReport();
    
    // Schedule daily goal reminder
    if (this.settings.dailyGoals) {
      await this.scheduleNotification({
        id: 'daily_goal_reminder',
        title: '🎯 Daily Goal Check',
        body: 'How are you doing with your study goals today?',
        data: {
          type: 'daily_goal',
        },
        trigger: {
          type: 'daily',
          hour: 18,
          minute: 0,
          repeats: true,
        },
      });
    }
  }

  private async storeNotificationHistory(notification: any): Promise<void> {
    try {
      const history = await storageService.getItem('notificationHistory') || [];
      history.unshift(notification);
      
      // Keep only last 100 notifications
      if (history.length > 100) {
        history.splice(100);
      }
      
      await storageService.setItem('notificationHistory', history);
    } catch (error) {
      console.error('Failed to store notification history:', error);
    }
  }

  private async storeScheduledNotification(id: string, notification: ScheduledNotification): Promise<void> {
    try {
      const scheduled = await storageService.getItem('scheduledNotifications') || {};
      scheduled[id] = notification;
      await storageService.setItem('scheduledNotifications', scheduled);
    } catch (error) {
      console.error('Failed to store scheduled notification:', error);
    }
  }

  private async removeScheduledNotification(id: string): Promise<void> {
    try {
      const scheduled = await storageService.getItem('scheduledNotifications') || {};
      delete scheduled[id];
      await storageService.setItem('scheduledNotifications', scheduled);
    } catch (error) {
      console.error('Failed to remove scheduled notification:', error);
    }
  }

  // Get notification history
  async getNotificationHistory(): Promise<any[]> {
    return await storageService.getItem('notificationHistory') || [];
  }

  // Get scheduled notifications
  async getScheduledNotifications(): Promise<any[]> {
    const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
    return allScheduled;
  }

  // Cleanup
  destroy(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;