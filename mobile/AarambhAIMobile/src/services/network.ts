import NetInfo from '@react-native-netinfo/netinfo';
import { storageService } from './storage';

export interface NetworkState {
  isConnected: boolean;
  type: string;
  isInternetReachable: boolean | null;
  details: any;
}

export type NetworkListener = (state: NetworkState) => void;

class NetworkService {
  private listeners: Set<NetworkListener> = new Set();
  private currentState: NetworkState = {
    isConnected: false,
    type: 'unknown',
    isInternetReachable: null,
    details: null
  };
  
  private unsubscribe: (() => void) | null = null;
  private syncTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // Get initial network state
    const state = await NetInfo.fetch();
    this.updateNetworkState(state);

    // Subscribe to network state changes
    this.unsubscribe = NetInfo.addEventListener(this.handleNetworkStateChange.bind(this));
    
    // Set up periodic sync when online
    this.setupPeriodicSync();
  }

  private handleNetworkStateChange(state: any) {
    const previouslyConnected = this.currentState.isConnected;
    this.updateNetworkState(state);
    
    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(this.currentState);
      } catch (error) {
        console.error('Error in network listener:', error);
      }
    });

    // Handle connectivity changes
    if (!previouslyConnected && this.currentState.isConnected) {
      this.handleConnectivityRestored();
    } else if (previouslyConnected && !this.currentState.isConnected) {
      this.handleConnectivityLost();
    }
  }

  private updateNetworkState(state: any) {
    this.currentState = {
      isConnected: state.isConnected ?? false,
      type: state.type || 'unknown',
      isInternetReachable: state.isInternetReachable,
      details: state.details
    };
  }

  private async handleConnectivityRestored() {
    console.log('📶 Connectivity restored');
    
    // Start syncing offline data
    try {
      await storageService.syncOfflineData();
      console.log('✅ Offline data synced successfully');
    } catch (error) {
      console.error('❌ Failed to sync offline data:', error);
    }
  }

  private handleConnectivityLost() {
    console.log('📵 Connectivity lost - switching to offline mode');
  }

  private setupPeriodicSync() {
    // Sync every 5 minutes when online
    this.syncTimer = setInterval(async () => {
      if (this.currentState.isConnected) {
        try {
          await storageService.syncOfflineData();
        } catch (error) {
          console.error('Periodic sync failed:', error);
        }
      }
    }, 5 * 60 * 1000);
  }

  // Public Methods
  addListener(listener: NetworkListener): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  removeListener(listener: NetworkListener): void {
    this.listeners.delete(listener);
  }

  getCurrentState(): NetworkState {
    return { ...this.currentState };
  }

  isConnected(): boolean {
    return this.currentState.isConnected;
  }

  isOffline(): boolean {
    return !this.currentState.isConnected;
  }

  getConnectionType(): string {
    return this.currentState.type;
  }

  isWifi(): boolean {
    return this.currentState.type === 'wifi';
  }

  isCellular(): boolean {
    return this.currentState.type === 'cellular';
  }

  async refresh(): Promise<NetworkState> {
    const state = await NetInfo.fetch();
    this.updateNetworkState(state);
    return this.getCurrentState();
  }

  async testInternetConnectivity(): Promise<boolean> {
    try {
      // Test connectivity by making a simple request
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        timeout: 5000,
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Quality assessment
  async assessConnectionQuality(): Promise<{
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    latency: number;
    downloadSpeed: number | null;
  }> {
    if (!this.currentState.isConnected) {
      return {
        quality: 'poor',
        latency: Infinity,
        downloadSpeed: null
      };
    }

    try {
      const startTime = Date.now();
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        timeout: 10000,
      });
      const latency = Date.now() - startTime;

      let quality: 'excellent' | 'good' | 'fair' | 'poor';
      
      if (latency < 100) {
        quality = 'excellent';
      } else if (latency < 300) {
        quality = 'good';
      } else if (latency < 1000) {
        quality = 'fair';
      } else {
        quality = 'poor';
      }

      return {
        quality,
        latency,
        downloadSpeed: null // Could implement speed test here
      };

    } catch (error) {
      return {
        quality: 'poor',
        latency: Infinity,
        downloadSpeed: null
      };
    }
  }

  // Sync management
  async forcSync(): Promise<void> {
    if (!this.currentState.isConnected) {
      throw new Error('Cannot sync while offline');
    }
    
    await storageService.syncOfflineData();
  }

  // Cleanup
  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    
    this.listeners.clear();
  }
}

// Export singleton instance
export const networkService = new NetworkService();
export default networkService;