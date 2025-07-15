import { networkService } from './network';
import { storageService, ChatMessage, StudySession, CachedContent } from './storage';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error?: string;
  fromCache?: boolean;
  offline?: boolean;
}

export interface ApiRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  data?: any;
  useCache?: boolean;
  cacheKey?: string;
  cacheDuration?: number; // in milliseconds
  retryOnline?: boolean;
}

class OfflineApiService {
  private baseUrl: string = 'https://api.aarambhai.com'; // Replace with actual API URL
  private cache: Map<string, { data: any; timestamp: number; duration: number }> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();

  constructor() {
    // Listen for network changes to process offline queue
    networkService.addListener((state) => {
      if (state.isConnected) {
        this.processOfflineQueue();
      }
    });
  }

  // Core API Methods
  async request<T>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    const { endpoint, method, data, useCache, cacheKey, cacheDuration, retryOnline } = config;
    const isOnline = networkService.isConnected();
    
    // Generate cache key if not provided
    const finalCacheKey = cacheKey || this.generateCacheKey(endpoint, method, data);
    
    // Check cache first if enabled
    if (useCache && this.isCacheValid(finalCacheKey)) {
      const cachedData = this.getCachedData(finalCacheKey);
      return {
        success: true,
        data: cachedData,
        fromCache: true
      };
    }

    // If offline, handle accordingly
    if (!isOnline) {
      return this.handleOfflineRequest(config, finalCacheKey);
    }

    try {
      // Make online request
      const response = await this.makeHttpRequest(endpoint, method, data);
      
      // Cache response if enabled
      if (useCache && response.success) {
        this.setCachedData(finalCacheKey, response.data, cacheDuration || 5 * 60 * 1000);
      }
      
      return response;
      
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      
      // If request fails but we have cached data, use it
      if (useCache && this.cache.has(finalCacheKey)) {
        const cachedData = this.getCachedData(finalCacheKey);
        return {
          success: true,
          data: cachedData,
          fromCache: true,
          error: 'Using cached data due to network error'
        };
      }
      
      // Queue for retry if specified
      if (retryOnline) {
        await storageService.addToOfflineQueue('apiRequest', config);
      }
      
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Network request failed'
      };
    }
  }

  private async handleOfflineRequest<T>(config: ApiRequestConfig, cacheKey: string): Promise<ApiResponse<T>> {
    const { useCache, retryOnline } = config;
    
    // Check if we have cached data
    if (useCache && this.cache.has(cacheKey)) {
      const cachedData = this.getCachedData(cacheKey);
      return {
        success: true,
        data: cachedData,
        fromCache: true,
        offline: true
      };
    }
    
    // Check storage for offline data
    const offlineData = await this.getOfflineData(config);
    if (offlineData) {
      return {
        success: true,
        data: offlineData,
        fromCache: true,
        offline: true
      };
    }
    
    // Queue for when online if specified
    if (retryOnline) {
      await storageService.addToOfflineQueue('apiRequest', config);
    }
    
    return {
      success: false,
      data: null,
      error: 'No internet connection and no cached data available',
      offline: true
    };
  }

  private async makeHttpRequest(endpoint: string, method: string, data?: any): Promise<ApiResponse> {
    const url = `${this.baseUrl}${endpoint}`;
    const requestId = `${method}:${url}`;
    
    // Prevent duplicate requests
    if (this.pendingRequests.has(requestId)) {
      return await this.pendingRequests.get(requestId)!;
    }
    
    const requestPromise = this.executeHttpRequest(url, method, data);
    this.pendingRequests.set(requestId, requestPromise);
    
    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.pendingRequests.delete(requestId);
    }
  }

  private async executeHttpRequest(url: string, method: string, data?: any): Promise<ApiResponse> {
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers here
      },
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, config);
    const responseData = await response.json();
    
    return {
      success: response.ok,
      data: responseData,
      error: response.ok ? undefined : responseData.message || 'Request failed'
    };
  }

  // Cache Management
  private generateCacheKey(endpoint: string, method: string, data?: any): string {
    const dataHash = data ? JSON.stringify(data) : '';
    return `${method}:${endpoint}:${dataHash}`;
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    const now = Date.now();
    return (now - cached.timestamp) < cached.duration;
  }

  private getCachedData(key: string): any {
    const cached = this.cache.get(key);
    return cached ? cached.data : null;
  }

  private setCachedData(key: string, data: any, duration: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      duration
    });
  }

  private clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if ((now - cached.timestamp) >= cached.duration) {
        this.cache.delete(key);
      }
    }
  }

  // Offline Data Management
  private async getOfflineData(config: ApiRequestConfig): Promise<any> {
    const { endpoint } = config;
    
    // Map endpoints to offline data sources
    if (endpoint.includes('/chat/')) {
      const agentType = this.extractAgentType(endpoint);
      return await storageService.getChatHistory(agentType);
    }
    
    if (endpoint.includes('/sessions')) {
      return await storageService.getStudySessions();
    }
    
    if (endpoint.includes('/content')) {
      return await storageService.getCachedContent();
    }
    
    if (endpoint.includes('/analytics')) {
      return await storageService.getAnalyticsData();
    }
    
    return null;
  }

  private extractAgentType(endpoint: string): string {
    const match = endpoint.match(/\/chat\/([^\/]+)/);
    return match ? match[1] : 'tutor';
  }

  private async processOfflineQueue(): Promise<void> {
    try {
      await storageService.syncOfflineData();
    } catch (error) {
      console.error('Failed to process offline queue:', error);
    }
  }

  // Specific API Methods for AARAMBH AI
  
  // Chat Methods
  async sendChatMessage(agentType: string, message: string, context?: any): Promise<ApiResponse<ChatMessage>> {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      agentType,
      synced: networkService.isConnected()
    };
    
    // Save user message immediately
    await storageService.saveChatMessage(agentType, userMessage);
    
    if (!networkService.isConnected()) {
      // Return mock AI response for offline mode
      const offlineResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I'm currently offline, but I've saved your message. I'll respond once we're back online!",
        timestamp: new Date().toISOString(),
        agentType,
        synced: false
      };
      
      await storageService.saveChatMessage(agentType, offlineResponse);
      await storageService.addToOfflineQueue('sendChatMessage', { agentType, message, context });
      
      return {
        success: true,
        data: offlineResponse,
        offline: true
      };
    }
    
    return await this.request<ChatMessage>({
      method: 'POST',
      endpoint: `/chat/${agentType}`,
      data: { message, context },
      retryOnline: true
    });
  }

  async getChatHistory(agentType: string): Promise<ApiResponse<ChatMessage[]>> {
    const offlineHistory = await storageService.getChatHistory(agentType);
    
    if (!networkService.isConnected()) {
      return {
        success: true,
        data: offlineHistory,
        offline: true
      };
    }
    
    return await this.request<ChatMessage[]>({
      method: 'GET',
      endpoint: `/chat/${agentType}/history`,
      useCache: true,
      cacheDuration: 2 * 60 * 1000 // 2 minutes
    });
  }

  // Study Session Methods
  async saveStudySession(session: StudySession): Promise<ApiResponse> {
    // Save locally first
    await storageService.saveStudySession(session);
    
    if (!networkService.isConnected()) {
      return {
        success: true,
        data: session,
        offline: true
      };
    }
    
    return await this.request({
      method: 'POST',
      endpoint: '/sessions',
      data: session,
      retryOnline: true
    });
  }

  async getStudySessions(): Promise<ApiResponse<StudySession[]>> {
    const offlineSessions = await storageService.getStudySessions();
    
    if (!networkService.isConnected()) {
      return {
        success: true,
        data: offlineSessions,
        offline: true
      };
    }
    
    return await this.request<StudySession[]>({
      method: 'GET',
      endpoint: '/sessions',
      useCache: true,
      cacheDuration: 5 * 60 * 1000 // 5 minutes
    });
  }

  // Content Methods
  async generateContent(type: string, prompt: string, options?: any): Promise<ApiResponse<CachedContent>> {
    if (!networkService.isConnected()) {
      // Return cached content if available
      const cachedContent = await storageService.getCachedContent();
      const matchingContent = cachedContent.find(c => c.type === type);
      
      if (matchingContent) {
        return {
          success: true,
          data: matchingContent,
          offline: true,
          fromCache: true
        };
      }
      
      await storageService.addToOfflineQueue('generateContent', { type, prompt, options });
      
      return {
        success: false,
        data: null,
        error: 'Content generation requires internet connection',
        offline: true
      };
    }
    
    return await this.request<CachedContent>({
      method: 'POST',
      endpoint: '/content/generate',
      data: { type, prompt, options },
      retryOnline: true
    });
  }

  async getCachedContent(): Promise<ApiResponse<CachedContent[]>> {
    const offlineContent = await storageService.getCachedContent();
    
    return {
      success: true,
      data: offlineContent,
      offline: !networkService.isConnected()
    };
  }

  // Analytics Methods
  async getAnalytics(params?: any): Promise<ApiResponse> {
    const offlineAnalytics = await storageService.getAnalyticsData();
    
    if (!networkService.isConnected()) {
      return {
        success: true,
        data: offlineAnalytics,
        offline: true
      };
    }
    
    return await this.request({
      method: 'GET',
      endpoint: '/analytics',
      data: params,
      useCache: true,
      cacheDuration: 10 * 60 * 1000 // 10 minutes
    });
  }

  // Utility Methods
  clearCache(): void {
    this.cache.clear();
  }

  async getOfflineQueueStatus(): Promise<{
    queueSize: number;
    oldestItem: Date | null;
    isProcessing: boolean;
  }> {
    const queue = await storageService.getOfflineQueue();
    const oldestItem = queue.length > 0 
      ? new Date(queue[queue.length - 1].timestamp)
      : null;
    
    return {
      queueSize: queue.length,
      oldestItem,
      isProcessing: storageService.isSyncInProgress()
    };
  }

  async forceSync(): Promise<void> {
    if (!networkService.isConnected()) {
      throw new Error('Cannot sync while offline');
    }
    
    await storageService.syncOfflineData();
  }

  // Cleanup
  destroy(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }
}

// Export singleton instance
export const offlineApiService = new OfflineApiService();
export default offlineApiService;