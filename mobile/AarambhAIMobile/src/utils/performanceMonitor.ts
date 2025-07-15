import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { PerformanceMonitor } from './performance';

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  category: 'render' | 'network' | 'memory' | 'user' | 'system';
  tags?: Record<string, string>;
}

export interface PerformanceSession {
  id: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metrics: PerformanceMetric[];
  deviceInfo: {
    platform: string;
    version: string;
    model?: string;
  };
  appInfo: {
    version: string;
    buildNumber: string;
  };
}

export interface PerformanceAlert {
  id: string;
  metric: string;
  threshold: number;
  actualValue: number;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
}

export interface PerformanceConfig {
  enableMetrics: boolean;
  enableAlerts: boolean;
  sampleRate: number; // 0-1
  maxSessions: number;
  maxMetricsPerSession: number;
  alertThresholds: Record<string, number>;
  enableRemoteReporting: boolean;
  remoteEndpoint?: string;
}

class PerformanceMonitorService {
  private static instance: PerformanceMonitorService;
  private config: PerformanceConfig;
  private currentSession: PerformanceSession | null = null;
  private sessions: PerformanceSession[] = [];
  private alerts: PerformanceAlert[] = [];
  private listeners: ((alert: PerformanceAlert) => void)[] = [];
  private metricBuffer: PerformanceMetric[] = [];
  private reportingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.config = {
      enableMetrics: true,
      enableAlerts: true,
      sampleRate: 0.1, // 10% sampling
      maxSessions: 50,
      maxMetricsPerSession: 1000,
      alertThresholds: {
        'render_time': 16, // 16ms for 60fps
        'memory_usage': 85, // 85% memory usage
        'network_latency': 3000, // 3 seconds
        'app_crash': 1, // Any crash
        'js_error': 1, // Any JS error
        'bundle_load_time': 5000, // 5 seconds
      },
      enableRemoteReporting: false,
    };

    this.initialize();
  }

  static getInstance(): PerformanceMonitorService {
    if (!PerformanceMonitorService.instance) {
      PerformanceMonitorService.instance = new PerformanceMonitorService();
    }
    return PerformanceMonitorService.instance;
  }

  private async initialize() {
    await this.loadSessions();
    await this.loadConfig();
    this.startSession();
    this.startReporting();
  }

  private async loadSessions() {
    try {
      const data = await AsyncStorage.getItem('performance_sessions');
      if (data) {
        this.sessions = JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load performance sessions:', error);
    }
  }

  private async loadConfig() {
    try {
      const data = await AsyncStorage.getItem('performance_config');
      if (data) {
        const savedConfig = JSON.parse(data);
        this.config = { ...this.config, ...savedConfig };
      }
    } catch (error) {
      console.error('Failed to load performance config:', error);
    }
  }

  private async saveSessions() {
    try {
      await AsyncStorage.setItem('performance_sessions', JSON.stringify(this.sessions));
    } catch (error) {
      console.error('Failed to save performance sessions:', error);
    }
  }

  private async saveConfig() {
    try {
      await AsyncStorage.setItem('performance_config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save performance config:', error);
    }
  }

  private startSession() {
    if (!this.config.enableMetrics) return;

    this.currentSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: Date.now(),
      metrics: [],
      deviceInfo: {
        platform: Platform.OS,
        version: Platform.Version.toString(),
      },
      appInfo: {
        version: '1.0.0', // Should be read from app config
        buildNumber: '1', // Should be read from app config
      },
    };

    // Track session start
    this.recordMetric('session_start', 1, 'count', 'system');
  }

  private endSession() {
    if (!this.currentSession) return;

    this.currentSession.endTime = Date.now();
    this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;
    this.currentSession.metrics = [...this.metricBuffer];

    // Add to sessions list
    this.sessions.push(this.currentSession);

    // Enforce session limit
    if (this.sessions.length > this.config.maxSessions) {
      this.sessions.shift();
    }

    // Save sessions
    this.saveSessions();

    // Clear current session
    this.currentSession = null;
    this.metricBuffer = [];
  }

  private startReporting() {
    if (this.config.enableRemoteReporting && this.config.remoteEndpoint) {
      this.reportingInterval = setInterval(() => {
        this.sendMetricsToRemote();
      }, 60000); // Report every minute
    }
  }

  private async sendMetricsToRemote() {
    if (!this.config.remoteEndpoint || this.metricBuffer.length === 0) return;

    try {
      const response = await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.currentSession?.id,
          metrics: this.metricBuffer,
          timestamp: Date.now(),
        }),
      });

      if (response.ok) {
        console.log('Metrics sent to remote endpoint');
      }
    } catch (error) {
      console.error('Failed to send metrics to remote:', error);
    }
  }

  recordMetric(
    name: string,
    value: number,
    unit: string,
    category: PerformanceMetric['category'],
    tags?: Record<string, string>
  ) {
    if (!this.config.enableMetrics) return;
    if (Math.random() > this.config.sampleRate) return;

    const metric: PerformanceMetric = {
      id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      value,
      unit,
      timestamp: Date.now(),
      category,
      tags,
    };

    this.metricBuffer.push(metric);

    // Enforce metric limit
    if (this.metricBuffer.length > this.config.maxMetricsPerSession) {
      this.metricBuffer.shift();
    }

    // Check for alerts
    this.checkAlert(metric);

    // Auto-report certain metrics
    if (category === 'system' || category === 'memory') {
      this.maybeReportMetric(metric);
    }
  }

  private checkAlert(metric: PerformanceMetric) {
    if (!this.config.enableAlerts) return;

    const threshold = this.config.alertThresholds[metric.name];
    if (threshold === undefined) return;

    if (metric.value > threshold) {
      const alert: PerformanceAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        metric: metric.name,
        threshold,
        actualValue: metric.value,
        timestamp: Date.now(),
        severity: this.calculateSeverity(metric.value, threshold),
        message: `${metric.name} exceeded threshold: ${metric.value}${metric.unit} > ${threshold}${metric.unit}`,
      };

      this.alerts.push(alert);

      // Keep only last 100 alerts
      if (this.alerts.length > 100) {
        this.alerts.shift();
      }

      // Notify listeners
      this.listeners.forEach(listener => listener(alert));
    }
  }

  private calculateSeverity(value: number, threshold: number): PerformanceAlert['severity'] {
    const ratio = value / threshold;
    if (ratio >= 3) return 'critical';
    if (ratio >= 2) return 'high';
    if (ratio >= 1.5) return 'medium';
    return 'low';
  }

  private maybeReportMetric(metric: PerformanceMetric) {
    // Report critical metrics immediately
    if (metric.category === 'system' && metric.name === 'app_crash') {
      this.reportCriticalMetric(metric);
    }
  }

  private async reportCriticalMetric(metric: PerformanceMetric) {
    if (!this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'critical_metric',
          sessionId: this.currentSession?.id,
          metric,
          timestamp: Date.now(),
        }),
      });
    } catch (error) {
      console.error('Failed to report critical metric:', error);
    }
  }

  // Component performance tracking
  trackComponentRender(componentName: string, renderTime: number) {
    this.recordMetric(
      'component_render_time',
      renderTime,
      'ms',
      'render',
      { component: componentName }
    );
  }

  trackComponentMount(componentName: string, mountTime: number) {
    this.recordMetric(
      'component_mount_time',
      mountTime,
      'ms',
      'render',
      { component: componentName }
    );
  }

  // Network performance tracking
  trackNetworkRequest(url: string, duration: number, status: number) {
    this.recordMetric(
      'network_request_duration',
      duration,
      'ms',
      'network',
      { url, status: status.toString() }
    );
  }

  trackNetworkError(url: string, error: string) {
    this.recordMetric(
      'network_error',
      1,
      'count',
      'network',
      { url, error }
    );
  }

  // Memory performance tracking
  trackMemoryUsage(usage: number) {
    this.recordMetric('memory_usage', usage, '%', 'memory');
  }

  trackMemoryLeak(componentName: string, leakSize: number) {
    this.recordMetric(
      'memory_leak',
      leakSize,
      'bytes',
      'memory',
      { component: componentName }
    );
  }

  // User interaction tracking
  trackUserInteraction(action: string, duration: number) {
    this.recordMetric(
      'user_interaction',
      duration,
      'ms',
      'user',
      { action }
    );
  }

  trackScreenTransition(from: string, to: string, duration: number) {
    this.recordMetric(
      'screen_transition',
      duration,
      'ms',
      'user',
      { from, to }
    );
  }

  // Bundle performance tracking
  trackBundleLoad(bundleName: string, loadTime: number) {
    this.recordMetric(
      'bundle_load_time',
      loadTime,
      'ms',
      'system',
      { bundle: bundleName }
    );
  }

  // JavaScript error tracking
  trackJSError(error: Error, stackTrace?: string) {
    this.recordMetric(
      'js_error',
      1,
      'count',
      'system',
      { 
        error: error.message,
        stack: stackTrace || error.stack || 'No stack trace',
        name: error.name,
      }
    );
  }

  // App lifecycle tracking
  trackAppStart(startTime: number) {
    this.recordMetric('app_start_time', startTime, 'ms', 'system');
  }

  trackAppBackground() {
    this.recordMetric('app_background', 1, 'count', 'system');
  }

  trackAppForeground() {
    this.recordMetric('app_foreground', 1, 'count', 'system');
  }

  // Custom metrics
  trackCustomMetric(
    name: string,
    value: number,
    unit: string,
    tags?: Record<string, string>
  ) {
    this.recordMetric(name, value, unit, 'user', tags);
  }

  // Alert management
  addAlertListener(listener: (alert: PerformanceAlert) => void): () => void {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  clearAlerts() {
    this.alerts = [];
  }

  // Session management
  getCurrentSession(): PerformanceSession | null {
    return this.currentSession;
  }

  getAllSessions(): PerformanceSession[] {
    return [...this.sessions];
  }

  clearSessions() {
    this.sessions = [];
    this.saveSessions();
  }

  // Analytics
  getMetricsSummary(): {
    totalMetrics: number;
    averageRenderTime: number;
    averageNetworkTime: number;
    errorCount: number;
    alertCount: number;
  } {
    const allMetrics = this.metricBuffer;
    const renderMetrics = allMetrics.filter(m => m.category === 'render');
    const networkMetrics = allMetrics.filter(m => m.category === 'network');
    const errorMetrics = allMetrics.filter(m => m.name === 'js_error');

    return {
      totalMetrics: allMetrics.length,
      averageRenderTime: renderMetrics.reduce((sum, m) => sum + m.value, 0) / renderMetrics.length || 0,
      averageNetworkTime: networkMetrics.reduce((sum, m) => sum + m.value, 0) / networkMetrics.length || 0,
      errorCount: errorMetrics.length,
      alertCount: this.alerts.length,
    };
  }

  getTopSlowComponents(): { name: string; averageTime: number }[] {
    const componentMetrics = this.metricBuffer
      .filter(m => m.name === 'component_render_time' && m.tags?.component)
      .reduce((acc, m) => {
        const name = m.tags!.component;
        if (!acc[name]) {
          acc[name] = { total: 0, count: 0 };
        }
        acc[name].total += m.value;
        acc[name].count++;
        return acc;
      }, {} as Record<string, { total: number; count: number }>);

    return Object.entries(componentMetrics)
      .map(([name, data]) => ({
        name,
        averageTime: data.total / data.count,
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 10);
  }

  // Configuration
  updateConfig(newConfig: Partial<PerformanceConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  // Cleanup
  destroy() {
    this.endSession();
    
    if (this.reportingInterval) {
      clearInterval(this.reportingInterval);
    }
    
    this.listeners = [];
    this.alerts = [];
    this.metricBuffer = [];
  }
}

// Export singleton instance
export const performanceMonitorService = PerformanceMonitorService.getInstance();

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  const [alerts, setAlerts] = React.useState<PerformanceAlert[]>([]);
  const [summary, setSummary] = React.useState(performanceMonitorService.getMetricsSummary());

  React.useEffect(() => {
    // Update summary periodically
    const interval = setInterval(() => {
      setSummary(performanceMonitorService.getMetricsSummary());
    }, 5000);

    // Listen for alerts
    const unsubscribe = performanceMonitorService.addAlertListener((alert) => {
      setAlerts(prev => [...prev, alert]);
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  return {
    alerts,
    summary,
    trackComponentRender: performanceMonitorService.trackComponentRender.bind(performanceMonitorService),
    trackNetworkRequest: performanceMonitorService.trackNetworkRequest.bind(performanceMonitorService),
    trackUserInteraction: performanceMonitorService.trackUserInteraction.bind(performanceMonitorService),
    trackCustomMetric: performanceMonitorService.trackCustomMetric.bind(performanceMonitorService),
    getTopSlowComponents: performanceMonitorService.getTopSlowComponents.bind(performanceMonitorService),
    clearAlerts: performanceMonitorService.clearAlerts.bind(performanceMonitorService),
  };
};

export default performanceMonitorService;