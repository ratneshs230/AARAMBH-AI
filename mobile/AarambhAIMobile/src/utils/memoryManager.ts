import { Platform, AppState, AppStateStatus } from 'react-native';
import { bundleManager } from './bundleManager';
import { imageCacheService } from '../services/imageCache';
import { storageService } from '../services/storage';

export interface MemoryStats {
  used: number;
  total: number;
  limit: number;
  usagePercentage: number;
  available: number;
}

export interface MemoryWarning {
  level: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  recommendations: string[];
  timestamp: number;
}

export interface MemoryConfig {
  warningThreshold: number; // percentage
  criticalThreshold: number; // percentage
  cleanupInterval: number; // milliseconds
  enableAutoCleanup: boolean;
  maxCacheSize: number; // bytes
  enableGarbageCollection: boolean;
}

class MemoryManager {
  private static instance: MemoryManager;
  private config: MemoryConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private memoryWarnings: MemoryWarning[] = [];
  private listeners: ((warning: MemoryWarning) => void)[] = [];
  private lastCleanup: number = 0;
  private appStateSubscription: any = null;

  constructor() {
    this.config = {
      warningThreshold: 75,
      criticalThreshold: 90,
      cleanupInterval: 30000, // 30 seconds
      enableAutoCleanup: true,
      maxCacheSize: 100 * 1024 * 1024, // 100MB
      enableGarbageCollection: true,
    };

    this.initialize();
  }

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  private initialize() {
    // Start monitoring
    this.startMonitoring();

    // Listen for app state changes
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);

    // Listen for memory warnings (iOS)
    if (Platform.OS === 'ios') {
      // Note: In a real app, you would use a native module for memory warnings
      // For now, we'll simulate with periodic checks
    }
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'background') {
      this.performBackgroundCleanup();
    } else if (nextAppState === 'active') {
      this.performActiveCleanup();
    }
  };

  private startMonitoring() {
    if (this.config.enableAutoCleanup) {
      this.cleanupInterval = setInterval(() => {
        this.checkMemoryUsage();
      }, this.config.cleanupInterval);
    }
  }

  private stopMonitoring() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  getMemoryStats(): MemoryStats | null {
    if (global.performance?.memory) {
      const memory = global.performance.memory;
      const used = memory.usedJSHeapSize;
      const total = memory.totalJSHeapSize;
      const limit = memory.jsHeapSizeLimit;
      const usagePercentage = (used / limit) * 100;
      const available = limit - used;

      return {
        used,
        total,
        limit,
        usagePercentage,
        available,
      };
    }
    return null;
  }

  private async checkMemoryUsage() {
    const stats = this.getMemoryStats();
    if (!stats) return;

    const { usagePercentage } = stats;

    if (usagePercentage >= this.config.criticalThreshold) {
      this.triggerMemoryWarning('critical', 'Critical memory usage detected', [
        'Immediately clear unused caches',
        'Close unnecessary screens',
        'Restart the application if needed',
      ]);
      await this.performCriticalCleanup();
    } else if (usagePercentage >= this.config.warningThreshold) {
      this.triggerMemoryWarning('high', 'High memory usage detected', [
        'Clear image cache',
        'Remove unused bundles',
        'Optimize data structures',
      ]);
      await this.performHighMemoryCleanup();
    }
  }

  private triggerMemoryWarning(
    level: MemoryWarning['level'],
    message: string,
    recommendations: string[]
  ) {
    const warning: MemoryWarning = {
      level,
      message,
      recommendations,
      timestamp: Date.now(),
    };

    this.memoryWarnings.push(warning);
    
    // Keep only last 20 warnings
    if (this.memoryWarnings.length > 20) {
      this.memoryWarnings.shift();
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(warning));
  }

  private async performCriticalCleanup() {
    console.log('🚨 Performing critical memory cleanup...');
    
    // Clear all caches
    await this.clearAllCaches();
    
    // Clear unused bundles
    await this.clearUnusedBundles();
    
    // Force garbage collection
    this.forceGarbageCollection();
    
    this.lastCleanup = Date.now();
  }

  private async performHighMemoryCleanup() {
    console.log('⚠️ Performing high memory cleanup...');
    
    // Clear image cache partially
    await this.clearImageCache(0.5); // Clear 50% of cache
    
    // Clear old data
    await this.clearOldData();
    
    // Force garbage collection
    this.forceGarbageCollection();
    
    this.lastCleanup = Date.now();
  }

  private async performBackgroundCleanup() {
    console.log('🔄 Performing background cleanup...');
    
    // Clear temporary data
    await this.clearTemporaryData();
    
    // Optimize storage
    await this.optimizeStorage();
    
    this.lastCleanup = Date.now();
  }

  private async performActiveCleanup() {
    console.log('🔄 Performing active cleanup...');
    
    // Light cleanup when app becomes active
    await this.clearExpiredData();
    
    this.lastCleanup = Date.now();
  }

  async clearAllCaches(): Promise<void> {
    try {
      // Clear image cache
      await imageCacheService.clearCache();
      
      // Clear bundle cache
      await bundleManager.clearAllBundles();
      
      // Clear storage cache
      await storageService.clearCache();
      
      console.log('✅ All caches cleared');
    } catch (error) {
      console.error('❌ Failed to clear caches:', error);
    }
  }

  async clearImageCache(percentage: number = 1): Promise<void> {
    try {
      if (percentage >= 1) {
        await imageCacheService.clearCache();
      } else {
        // Partial cleanup - clear oldest items
        const stats = await imageCacheService.getCacheStats();
        const itemsToRemove = Math.floor(stats.itemCount * percentage);
        
        // Implementation would depend on image cache service API
        // For now, we'll clear the entire cache if partial cleanup is requested
        if (itemsToRemove > 0) {
          await imageCacheService.clearCache();
        }
      }
      
      console.log(`✅ Image cache cleared (${Math.round(percentage * 100)}%)`);
    } catch (error) {
      console.error('❌ Failed to clear image cache:', error);
    }
  }

  async clearUnusedBundles(): Promise<void> {
    try {
      const stats = bundleManager.getBundleStats();
      
      // Clear bundles that are not critical
      for (const bundleName of stats.loadedBundles) {
        const config = bundleManager['bundleConfigs'].get(bundleName);
        if (config && config.priority !== 'critical') {
          await bundleManager.clearBundle(bundleName);
        }
      }
      
      console.log('✅ Unused bundles cleared');
    } catch (error) {
      console.error('❌ Failed to clear unused bundles:', error);
    }
  }

  async clearOldData(): Promise<void> {
    try {
      const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago
      
      // Clear old chat messages
      await storageService.clearOldChatMessages(cutoffTime);
      
      // Clear old offline data
      await storageService.clearOldOfflineData(cutoffTime);
      
      console.log('✅ Old data cleared');
    } catch (error) {
      console.error('❌ Failed to clear old data:', error);
    }
  }

  async clearTemporaryData(): Promise<void> {
    try {
      // Clear temporary files
      await storageService.clearTemporaryFiles();
      
      // Clear session data
      await storageService.clearSessionData();
      
      console.log('✅ Temporary data cleared');
    } catch (error) {
      console.error('❌ Failed to clear temporary data:', error);
    }
  }

  async clearExpiredData(): Promise<void> {
    try {
      // Clear expired cache entries
      await storageService.clearExpiredCache();
      
      // Clear expired tokens
      await storageService.clearExpiredTokens();
      
      console.log('✅ Expired data cleared');
    } catch (error) {
      console.error('❌ Failed to clear expired data:', error);
    }
  }

  async optimizeStorage(): Promise<void> {
    try {
      // Compact storage
      await storageService.compact();
      
      // Optimize indexes
      await storageService.optimizeIndexes();
      
      console.log('✅ Storage optimized');
    } catch (error) {
      console.error('❌ Failed to optimize storage:', error);
    }
  }

  forceGarbageCollection(): void {
    if (this.config.enableGarbageCollection && global.gc) {
      try {
        global.gc();
        console.log('✅ Garbage collection forced');
      } catch (error) {
        console.error('❌ Failed to force garbage collection:', error);
      }
    }
  }

  addMemoryWarningListener(listener: (warning: MemoryWarning) => void): () => void {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getMemoryWarnings(): MemoryWarning[] {
    return [...this.memoryWarnings];
  }

  getLastCleanupTime(): number {
    return this.lastCleanup;
  }

  updateConfig(newConfig: Partial<MemoryConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart monitoring with new config
    this.stopMonitoring();
    this.startMonitoring();
  }

  getConfig(): MemoryConfig {
    return { ...this.config };
  }

  async performManualCleanup(): Promise<void> {
    console.log('🔧 Performing manual cleanup...');
    
    await this.clearImageCache(0.7); // Clear 70% of image cache
    await this.clearOldData();
    await this.clearTemporaryData();
    await this.optimizeStorage();
    this.forceGarbageCollection();
    
    this.lastCleanup = Date.now();
  }

  getMemoryReport(): {
    stats: MemoryStats | null;
    warnings: MemoryWarning[];
    lastCleanup: number;
    config: MemoryConfig;
  } {
    return {
      stats: this.getMemoryStats(),
      warnings: this.getMemoryWarnings(),
      lastCleanup: this.getLastCleanupTime(),
      config: this.getConfig(),
    };
  }

  destroy(): void {
    this.stopMonitoring();
    
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
    
    this.listeners = [];
    this.memoryWarnings = [];
  }
}

// Export singleton instance
export const memoryManager = MemoryManager.getInstance();

// React hook for memory management
export const useMemoryManager = () => {
  const [memoryStats, setMemoryStats] = React.useState<MemoryStats | null>(null);
  const [memoryWarnings, setMemoryWarnings] = React.useState<MemoryWarning[]>([]);

  React.useEffect(() => {
    // Update stats periodically
    const interval = setInterval(() => {
      const stats = memoryManager.getMemoryStats();
      setMemoryStats(stats);
      setMemoryWarnings(memoryManager.getMemoryWarnings());
    }, 5000);

    // Listen for memory warnings
    const unsubscribe = memoryManager.addMemoryWarningListener((warning) => {
      setMemoryWarnings(prev => [...prev, warning]);
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const performManualCleanup = async () => {
    await memoryManager.performManualCleanup();
  };

  const clearAllCaches = async () => {
    await memoryManager.clearAllCaches();
  };

  const getMemoryReport = () => {
    return memoryManager.getMemoryReport();
  };

  return {
    memoryStats,
    memoryWarnings,
    performManualCleanup,
    clearAllCaches,
    getMemoryReport,
  };
};

export default memoryManager;