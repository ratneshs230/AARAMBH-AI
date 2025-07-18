/**
 * Global Gemini AI Status Service
 * Manages Gemini AI health status across the entire application
 */

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'checking' | 'unknown';

export interface HealthData {
  status: HealthStatus;
  services: {
    gemini?: boolean;
    teacherAgent?: boolean;
    imageGenerator?: boolean;
  };
  responseTime: number;
  lastChecked?: Date;
  error?: string;
  server?: string;
}

export interface GeminiStatusListener {
  (healthData: HealthData): void;
}

class GeminiStatusService {
  private healthData: HealthData = {
    status: 'unknown',
    services: {},
    responseTime: 0,
  };

  private listeners: Set<GeminiStatusListener> = new Set();
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private isChecking = false;

  // Subscribe to status updates
  subscribe(listener: GeminiStatusListener): () => void {
    this.listeners.add(listener);
    
    // Immediately notify with current status
    listener(this.healthData);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Notify all listeners of status changes
  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.healthData);
      } catch (error) {
        console.error('Error in status listener:', error);
      }
    });
  }

  // Get current health data
  getCurrentHealth(): HealthData {
    return { ...this.healthData };
  }

  // Check health from multiple endpoints
  async checkHealth(): Promise<HealthData> {
    if (this.isChecking) {
      return this.healthData;
    }

    this.isChecking = true;
    const startTime = Date.now();
    
    this.healthData = {
      ...this.healthData,
      status: 'checking',
    };
    this.notifyListeners();

    try {
      // Check multiple Gemini endpoints
      const healthChecks = await Promise.allSettled([
        this.checkCuriosityGemini(),
        this.checkMainAIService(),
      ]);

      let bestHealth: HealthData | null = null;
      let hasHealthyService = false;

      // Analyze results from all health checks
      healthChecks.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const health = result.value;
          if (health.status === 'healthy') {
            hasHealthyService = true;
            if (!bestHealth || health.responseTime < bestHealth.responseTime) {
              bestHealth = health;
            }
          } else if (!bestHealth && health.status === 'degraded') {
            bestHealth = health;
          }
        }
      });

      // Determine final status
      if (hasHealthyService && bestHealth) {
        this.healthData = {
          ...bestHealth,
          responseTime: Date.now() - startTime,
          lastChecked: new Date(),
          error: undefined,
        };
      } else if (bestHealth) {
        this.healthData = {
          ...bestHealth,
          status: 'degraded',
          responseTime: Date.now() - startTime,
          lastChecked: new Date(),
        };
      } else {
        this.healthData = {
          status: 'unhealthy',
          services: {},
          responseTime: Date.now() - startTime,
          lastChecked: new Date(),
          error: 'All Gemini services are unavailable',
        };
      }
    } catch (error) {
      console.error('Health check failed:', error);
      this.healthData = {
        status: 'unhealthy',
        services: {},
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Health check failed',
      };
    } finally {
      this.isChecking = false;
      this.notifyListeners();
    }

    return this.healthData;
  }

  // Check Curiosity Platform Gemini service
  private async checkCuriosityGemini(): Promise<HealthData> {
    try {
      const response = await fetch('http://localhost:5001/api/ai/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        return {
          status: result.data.status === 'healthy' ? 'healthy' : 'degraded',
          services: {
            gemini: result.data.services?.gemini || false,
            teacherAgent: result.data.services?.teacherAgent || false,
          },
          responseTime: 0, // Will be calculated by caller
          server: 'Curiosity Gemini Server',
        };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      throw new Error(`Curiosity Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Check main AI service
  private async checkMainAIService(): Promise<HealthData> {
    try {
      const response = await fetch('http://localhost:5000/api/ai/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        return {
          status: result.data.status === 'healthy' ? 'healthy' : 'degraded',
          services: {
            gemini: result.data.services?.gemini || false,
            teacherAgent: result.data.services?.teacherAgent || false,
            imageGenerator: result.data.services?.imageGenerator || false,
          },
          responseTime: 0, // Will be calculated by caller
          server: 'Main AI Server',
        };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      throw new Error(`Main AI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Start automatic health checking
  startAutoCheck() {
    if (this.checkInterval) {
      return; // Already started
    }

    // Initial check
    this.checkHealth();

    // Set up interval
    this.checkInterval = setInterval(() => {
      this.checkHealth();
    }, this.CHECK_INTERVAL);

    console.log('🔍 Started automatic Gemini health monitoring');
  }

  // Stop automatic health checking
  stopAutoCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('⏹️ Stopped automatic Gemini health monitoring');
    }
  }

  // Force a manual health check
  async forceCheck(): Promise<HealthData> {
    return this.checkHealth();
  }

  // Get status summary for display
  getStatusSummary(): {
    text: string;
    color: 'success' | 'warning' | 'error' | 'info' | 'default';
    isOnline: boolean;
  } {
    switch (this.healthData.status) {
      case 'healthy':
        return {
          text: 'Gemini AI Ready',
          color: 'success',
          isOnline: true,
        };
      case 'degraded':
        return {
          text: 'Limited Service',
          color: 'warning',
          isOnline: true,
        };
      case 'unhealthy':
        return {
          text: 'Service Unavailable',
          color: 'error',
          isOnline: false,
        };
      case 'checking':
        return {
          text: 'Checking Status...',
          color: 'info',
          isOnline: false,
        };
      default:
        return {
          text: 'Unknown Status',
          color: 'default',
          isOnline: false,
        };
    }
  }

  // Check if specific service is available
  isServiceAvailable(service: keyof HealthData['services']): boolean {
    return this.healthData.services[service] === true && this.healthData.status !== 'unhealthy';
  }

  // Get detailed status for tooltips
  getDetailedStatus(): string {
    const lines = [
      `Status: ${this.healthData.status}`,
      this.healthData.responseTime > 0 ? `Response time: ${this.healthData.responseTime}ms` : '',
      this.healthData.lastChecked ? `Last checked: ${this.healthData.lastChecked.toLocaleTimeString()}` : '',
    ].filter(Boolean);

    if (this.healthData.server) {
      lines.push(`Server: ${this.healthData.server}`);
    }

    Object.entries(this.healthData.services).forEach(([service, available]) => {
      if (available !== undefined) {
        lines.push(`${service}: ${available ? 'Available' : 'Unavailable'}`);
      }
    });

    if (this.healthData.error) {
      lines.push(`Error: ${this.healthData.error}`);
    }

    return lines.join('\n');
  }

  // Cleanup resources
  destroy() {
    this.stopAutoCheck();
    this.listeners.clear();
  }
}

// Create singleton instance
export const geminiStatusService = new GeminiStatusService();

// Auto-start monitoring when service is imported
geminiStatusService.startAutoCheck();

// Re-export types for convenience
export type { HealthStatus, HealthData, GeminiStatusListener };
export { GeminiStatusService };

export default geminiStatusService;