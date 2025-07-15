import { useState, useEffect, useCallback } from 'react';
import { notificationService, NotificationSettings, StudyReminderConfig } from '../services/notifications';

// Hook for notification settings management
export const useNotificationSettings = () => {
  const [settings, setSettings] = useState<NotificationSettings>(notificationService.getSettings());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await notificationService.updateSettings(newSettings);
      setSettings(notificationService.getSettings());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
      setError(errorMessage);
      console.error('Failed to update notification settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleNotifications = useCallback(async (enabled: boolean) => {
    await updateSettings({ enabled });
  }, [updateSettings]);

  const toggleStudyReminders = useCallback(async (enabled: boolean) => {
    await updateSettings({ studyReminders: enabled });
  }, [updateSettings]);

  const toggleAIResponses = useCallback(async (enabled: boolean) => {
    await updateSettings({ aiResponses: enabled });
  }, [updateSettings]);

  const toggleCourseUpdates = useCallback(async (enabled: boolean) => {
    await updateSettings({ courseUpdates: enabled });
  }, [updateSettings]);

  const toggleAchievements = useCallback(async (enabled: boolean) => {
    await updateSettings({ achievements: enabled });
  }, [updateSettings]);

  const toggleWeeklyReports = useCallback(async (enabled: boolean) => {
    await updateSettings({ weeklyReports: enabled });
  }, [updateSettings]);

  const toggleDailyGoals = useCallback(async (enabled: boolean) => {
    await updateSettings({ dailyGoals: enabled });
  }, [updateSettings]);

  const toggleSessionBreaks = useCallback(async (enabled: boolean) => {
    await updateSettings({ sessionBreaks: enabled });
  }, [updateSettings]);

  const toggleSound = useCallback(async (enabled: boolean) => {
    await updateSettings({ sound: enabled });
  }, [updateSettings]);

  const toggleVibration = useCallback(async (enabled: boolean) => {
    await updateSettings({ vibration: enabled });
  }, [updateSettings]);

  const toggleBadgeCount = useCallback(async (enabled: boolean) => {
    await updateSettings({ badgeCount: enabled });
  }, [updateSettings]);

  const updateQuietHours = useCallback(async (quietHours: NotificationSettings['quietHours']) => {
    await updateSettings({ quietHours });
  }, [updateSettings]);

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    toggleNotifications,
    toggleStudyReminders,
    toggleAIResponses,
    toggleCourseUpdates,
    toggleAchievements,
    toggleWeeklyReports,
    toggleDailyGoals,
    toggleSessionBreaks,
    toggleSound,
    toggleVibration,
    toggleBadgeCount,
    updateQuietHours,
  };
};

// Hook for study reminders management
export const useStudyReminders = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scheduleReminders = useCallback(async (config: StudyReminderConfig) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await notificationService.scheduleStudyReminders(config);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to schedule reminders';
      setError(errorMessage);
      console.error('Failed to schedule study reminders:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelReminders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await notificationService.cancelStudyReminders();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel reminders';
      setError(errorMessage);
      console.error('Failed to cancel study reminders:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const scheduleBreakReminder = useCallback(async (minutes: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const notificationId = await notificationService.scheduleSessionBreak(minutes);
      return notificationId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to schedule break reminder';
      setError(errorMessage);
      console.error('Failed to schedule break reminder:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    scheduleReminders,
    cancelReminders,
    scheduleBreakReminder,
  };
};

// Hook for immediate notifications
export const useNotificationSender = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendNotification = useCallback(async (notification: {
    title: string;
    body: string;
    data?: any;
    sound?: boolean;
    priority?: 'low' | 'normal' | 'high' | 'max';
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const notificationId = await notificationService.sendNotification({
        id: `manual_${Date.now()}`,
        ...notification,
      });
      return notificationId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send notification';
      setError(errorMessage);
      console.error('Failed to send notification:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const notifyAIResponse = useCallback(async (agentType: string, message: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await notificationService.notifyAIResponse(agentType, message);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to notify AI response';
      setError(errorMessage);
      console.error('Failed to notify AI response:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const notifyAchievement = useCallback(async (achievement: {
    id: string;
    title: string;
    description: string;
    icon?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await notificationService.notifyAchievement(achievement);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to notify achievement';
      setError(errorMessage);
      console.error('Failed to notify achievement:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    sendNotification,
    notifyAIResponse,
    notifyAchievement,
  };
};

// Hook for badge management
export const useBadgeCount = () => {
  const [badgeCount, setBadgeCountState] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const updateBadgeCount = useCallback(async (count: number) => {
    setIsLoading(true);
    try {
      await notificationService.setBadgeCount(count);
      setBadgeCountState(count);
    } catch (error) {
      console.error('Failed to update badge count:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const incrementBadge = useCallback(async () => {
    setIsLoading(true);
    try {
      await notificationService.incrementBadgeCount();
      setBadgeCountState(prev => prev + 1);
    } catch (error) {
      console.error('Failed to increment badge count:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearBadge = useCallback(async () => {
    setIsLoading(true);
    try {
      await notificationService.clearBadge();
      setBadgeCountState(0);
    } catch (error) {
      console.error('Failed to clear badge count:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    badgeCount,
    isLoading,
    updateBadgeCount,
    incrementBadge,
    clearBadge,
  };
};

// Hook for notification history and scheduled notifications
export const useNotificationHistory = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [scheduledNotifications, setScheduledNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const historyData = await notificationService.getNotificationHistory();
      setHistory(historyData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load history';
      setError(errorMessage);
      console.error('Failed to load notification history:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadScheduledNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const scheduled = await notificationService.getScheduledNotifications();
      setScheduledNotifications(scheduled);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load scheduled notifications';
      setError(errorMessage);
      console.error('Failed to load scheduled notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelNotification = useCallback(async (notificationId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await notificationService.cancelNotification(notificationId);
      await loadScheduledNotifications(); // Refresh the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel notification';
      setError(errorMessage);
      console.error('Failed to cancel notification:', err);
    } finally {
      setIsLoading(false);
    }
  }, [loadScheduledNotifications]);

  const cancelAllNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await notificationService.cancelAllNotifications();
      setScheduledNotifications([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel all notifications';
      setError(errorMessage);
      console.error('Failed to cancel all notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
    loadScheduledNotifications();
  }, [loadHistory, loadScheduledNotifications]);

  return {
    history,
    scheduledNotifications,
    isLoading,
    error,
    loadHistory,
    loadScheduledNotifications,
    cancelNotification,
    cancelAllNotifications,
    refreshData: useCallback(() => {
      loadHistory();
      loadScheduledNotifications();
    }, [loadHistory, loadScheduledNotifications]),
  };
};

// Hook for permission status
export const useNotificationPermissions = () => {
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [isLoading, setIsLoading] = useState(false);

  const checkPermissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const { status } = await import('expo-notifications').then(Notifications => 
        Notifications.getPermissionsAsync()
      );
      setPermissionStatus(status);
    } catch (error) {
      console.error('Failed to check permissions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestPermissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const { status } = await import('expo-notifications').then(Notifications => 
        Notifications.requestPermissionsAsync()
      );
      setPermissionStatus(status);
      return status === 'granted';
    } catch (error) {
      console.error('Failed to request permissions:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  return {
    permissionStatus,
    isLoading,
    checkPermissions,
    requestPermissions,
    hasPermission: permissionStatus === 'granted',
  };
};