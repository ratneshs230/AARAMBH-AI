import { useState, useEffect, useCallback } from 'react';
import { networkService, NetworkState } from '../services/network';
import { storageService } from '../services/storage';
import { offlineApiService } from '../services/offlineApi';

// Hook for network status
export const useNetworkStatus = () => {
  const [networkState, setNetworkState] = useState<NetworkState>(networkService.getCurrentState());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = networkService.addListener(setNetworkState);
    return unsubscribe;
  }, []);

  const refreshNetworkState = useCallback(async () => {
    setIsLoading(true);
    try {
      const state = await networkService.refresh();
      setNetworkState(state);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const testConnectivity = useCallback(async () => {
    setIsLoading(true);
    try {
      return await networkService.testInternetConnectivity();
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isConnected: networkState.isConnected,
    isOffline: !networkState.isConnected,
    connectionType: networkState.type,
    isWifi: networkState.type === 'wifi',
    isCellular: networkState.type === 'cellular',
    isInternetReachable: networkState.isInternetReachable,
    isLoading,
    networkState,
    refreshNetworkState,
    testConnectivity
  };
};

// Hook for offline data storage
export const useOfflineStorage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeStorageAction = useCallback(async <T>(
    action: () => Promise<T>
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await action();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Storage operation failed';
      setError(errorMessage);
      console.error('Storage action failed:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveUserProfile = useCallback(async (profile: any) => {
    return executeStorageAction(() => storageService.saveUserProfile(profile));
  }, [executeStorageAction]);

  const getUserProfile = useCallback(async () => {
    return executeStorageAction(() => storageService.getUserProfile());
  }, [executeStorageAction]);

  const saveStudySession = useCallback(async (session: any) => {
    return executeStorageAction(() => storageService.saveStudySession(session));
  }, [executeStorageAction]);

  const getStudySessions = useCallback(async () => {
    return executeStorageAction(() => storageService.getStudySessions());
  }, [executeStorageAction]);

  const saveChatMessage = useCallback(async (agentType: string, message: any) => {
    return executeStorageAction(() => storageService.saveChatMessage(agentType, message));
  }, [executeStorageAction]);

  const getChatHistory = useCallback(async (agentType: string) => {
    return executeStorageAction(() => storageService.getChatHistory(agentType));
  }, [executeStorageAction]);

  const cacheContent = useCallback(async (content: any) => {
    return executeStorageAction(() => storageService.cacheContent(content));
  }, [executeStorageAction]);

  const getCachedContent = useCallback(async () => {
    return executeStorageAction(() => storageService.getCachedContent());
  }, [executeStorageAction]);

  const clearCache = useCallback(async () => {
    return executeStorageAction(() => storageService.clear());
  }, [executeStorageAction]);

  return {
    isLoading,
    error,
    saveUserProfile,
    getUserProfile,
    saveStudySession,
    getStudySessions,
    saveChatMessage,
    getChatHistory,
    cacheContent,
    getCachedContent,
    clearCache
  };
};

// Hook for offline API requests
export const useOfflineApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isOffline } = useNetworkStatus();

  const executeApiCall = useCallback(async <T>(
    apiCall: () => Promise<{ success: boolean; data: T; error?: string; offline?: boolean; fromCache?: boolean }>
  ): Promise<{ data: T | null; isFromCache: boolean; isOffline: boolean }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiCall();
      
      if (!response.success) {
        throw new Error(response.error || 'API call failed');
      }
      
      return {
        data: response.data,
        isFromCache: response.fromCache || false,
        isOffline: response.offline || false
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'API call failed';
      setError(errorMessage);
      console.error('API call failed:', err);
      return {
        data: null,
        isFromCache: false,
        isOffline: isOffline
      };
    } finally {
      setIsLoading(false);
    }
  }, [isOffline]);

  const sendChatMessage = useCallback(async (agentType: string, message: string, context?: any) => {
    return executeApiCall(() => offlineApiService.sendChatMessage(agentType, message, context));
  }, [executeApiCall]);

  const getChatHistory = useCallback(async (agentType: string) => {
    return executeApiCall(() => offlineApiService.getChatHistory(agentType));
  }, [executeApiCall]);

  const saveStudySession = useCallback(async (session: any) => {
    return executeApiCall(() => offlineApiService.saveStudySession(session));
  }, [executeApiCall]);

  const getStudySessions = useCallback(async () => {
    return executeApiCall(() => offlineApiService.getStudySessions());
  }, [executeApiCall]);

  const generateContent = useCallback(async (type: string, prompt: string, options?: any) => {
    return executeApiCall(() => offlineApiService.generateContent(type, prompt, options));
  }, [executeApiCall]);

  const getAnalytics = useCallback(async (params?: any) => {
    return executeApiCall(() => offlineApiService.getAnalytics(params));
  }, [executeApiCall]);

  return {
    isLoading,
    error,
    sendChatMessage,
    getChatHistory,
    saveStudySession,
    getStudySessions,
    generateContent,
    getAnalytics
  };
};

// Hook for sync management
export const useSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [queueStatus, setQueueStatus] = useState({
    queueSize: 0,
    oldestItem: null as Date | null,
    isProcessing: false
  });
  const { isConnected } = useNetworkStatus();

  const updateSyncStatus = useCallback(async () => {
    try {
      const lastSync = await storageService.getLastSyncTime();
      setLastSyncTime(lastSync ? new Date(lastSync) : null);
      
      const status = await offlineApiService.getOfflineQueueStatus();
      setQueueStatus(status);
      
      setIsSyncing(storageService.isSyncInProgress());
    } catch (error) {
      console.error('Failed to update sync status:', error);
    }
  }, []);

  useEffect(() => {
    updateSyncStatus();
    
    // Update sync status every 30 seconds
    const interval = setInterval(updateSyncStatus, 30000);
    return () => clearInterval(interval);
  }, [updateSyncStatus]);

  const forceSync = useCallback(async () => {
    if (!isConnected) {
      throw new Error('Cannot sync while offline');
    }
    
    setIsSyncing(true);
    try {
      await offlineApiService.forceSync();
      await updateSyncStatus();
    } finally {
      setIsSyncing(false);
    }
  }, [isConnected, updateSyncStatus]);

  const clearOfflineQueue = useCallback(async () => {
    await storageService.clearOfflineQueue();
    await updateSyncStatus();
  }, [updateSyncStatus]);

  return {
    isSyncing,
    lastSyncTime,
    queueSize: queueStatus.queueSize,
    oldestQueueItem: queueStatus.oldestItem,
    isProcessing: queueStatus.isProcessing,
    canSync: isConnected && queueStatus.queueSize > 0,
    forceSync,
    clearOfflineQueue,
    updateSyncStatus
  };
};

// Hook for connection quality
export const useConnectionQuality = () => {
  const [quality, setQuality] = useState<{
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    latency: number;
    downloadSpeed: number | null;
  }>({
    quality: 'poor',
    latency: Infinity,
    downloadSpeed: null
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkQuality = useCallback(async () => {
    setIsChecking(true);
    try {
      const result = await networkService.assessConnectionQuality();
      setQuality(result);
      return result;
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    checkQuality();
  }, [checkQuality]);

  return {
    quality: quality.quality,
    latency: quality.latency,
    downloadSpeed: quality.downloadSpeed,
    isChecking,
    checkQuality
  };
};

// Hook for storage info
export const useStorageInfo = () => {
  const [storageInfo, setStorageInfo] = useState({
    totalSize: 0,
    itemCount: 0,
    keys: [] as string[]
  });
  const [isLoading, setIsLoading] = useState(false);

  const refreshStorageInfo = useCallback(async () => {
    setIsLoading(true);
    try {
      const info = await storageService.getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error('Failed to get storage info:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cleanupOldData = useCallback(async () => {
    setIsLoading(true);
    try {
      await storageService.cleanupOldData();
      await refreshStorageInfo();
    } catch (error) {
      console.error('Failed to cleanup old data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [refreshStorageInfo]);

  useEffect(() => {
    refreshStorageInfo();
  }, [refreshStorageInfo]);

  const formatSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  return {
    totalSize: formatSize(storageInfo.totalSize),
    itemCount: storageInfo.itemCount,
    keys: storageInfo.keys,
    isLoading,
    refreshStorageInfo,
    cleanupOldData
  };
};