import { Platform } from 'react-native';
import { bundleUtils } from './performance';

export interface BundleConfig {
  name: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  preload?: boolean;
  chunks?: string[];
  dependencies?: string[];
}

export interface BundleLoadResult {
  success: boolean;
  bundle?: any;
  error?: Error;
  loadTime?: number;
}

class BundleManager {
  private static instance: BundleManager;
  private loadedBundles: Map<string, any> = new Map();
  private loadingBundles: Map<string, Promise<any>> = new Map();
  private bundleConfigs: Map<string, BundleConfig> = new Map();
  private loadOrder: string[] = [];

  static getInstance(): BundleManager {
    if (!BundleManager.instance) {
      BundleManager.instance = new BundleManager();
    }
    return BundleManager.instance;
  }

  constructor() {
    this.initializeDefaultBundles();
  }

  private initializeDefaultBundles() {
    // Core bundles
    this.registerBundle({
      name: 'auth',
      priority: 'critical',
      preload: true,
      chunks: ['login', 'register', 'forgotPassword'],
      dependencies: [],
    });

    this.registerBundle({
      name: 'dashboard',
      priority: 'critical',
      preload: true,
      chunks: ['home', 'profile', 'settings'],
      dependencies: ['auth'],
    });

    // AI bundles
    this.registerBundle({
      name: 'ai-core',
      priority: 'high',
      preload: true,
      chunks: ['aiTutor', 'aiContent', 'aiAssessment'],
      dependencies: ['dashboard'],
    });

    this.registerBundle({
      name: 'ai-extended',
      priority: 'medium',
      preload: false,
      chunks: ['aiDoubt', 'aiPlanner', 'aiMentor', 'aiAnalytics'],
      dependencies: ['ai-core'],
    });

    // Course bundles
    this.registerBundle({
      name: 'courses',
      priority: 'medium',
      preload: false,
      chunks: ['courseList', 'courseDetails', 'lessonPlayer'],
      dependencies: ['dashboard'],
    });

    // Assessment bundles
    this.registerBundle({
      name: 'assessments',
      priority: 'medium',
      preload: false,
      chunks: ['assessmentList', 'assessmentPlayer', 'assessmentResults'],
      dependencies: ['ai-core'],
    });

    // Real-time bundles
    this.registerBundle({
      name: 'realtime',
      priority: 'low',
      preload: false,
      chunks: ['studySession', 'chat', 'collaboration'],
      dependencies: ['dashboard'],
    });

    // Offline bundles
    this.registerBundle({
      name: 'offline',
      priority: 'low',
      preload: false,
      chunks: ['offlineStorage', 'offlineSync', 'offlineUI'],
      dependencies: ['dashboard'],
    });
  }

  registerBundle(config: BundleConfig): void {
    this.bundleConfigs.set(config.name, config);
    
    // Update load order based on priority and dependencies
    this.updateLoadOrder();
  }

  private updateLoadOrder(): void {
    const bundles = Array.from(this.bundleConfigs.entries());
    const sorted = this.topologicalSort(bundles);
    
    // Sort by priority within dependency order
    this.loadOrder = sorted.sort((a, b) => {
      const configA = this.bundleConfigs.get(a)!;
      const configB = this.bundleConfigs.get(b)!;
      
      const priorityOrder = {
        'critical': 0,
        'high': 1,
        'medium': 2,
        'low': 3,
      };
      
      return priorityOrder[configA.priority] - priorityOrder[configB.priority];
    });
  }

  private topologicalSort(bundles: [string, BundleConfig][]): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: string[] = [];

    const visit = (bundleName: string) => {
      if (visiting.has(bundleName)) {
        throw new Error(`Circular dependency detected: ${bundleName}`);
      }
      
      if (visited.has(bundleName)) {
        return;
      }

      visiting.add(bundleName);
      
      const config = this.bundleConfigs.get(bundleName);
      if (config?.dependencies) {
        config.dependencies.forEach(dep => visit(dep));
      }
      
      visiting.delete(bundleName);
      visited.add(bundleName);
      result.push(bundleName);
    };

    bundles.forEach(([name]) => visit(name));
    return result;
  }

  async loadBundle(bundleName: string): Promise<BundleLoadResult> {
    const startTime = Date.now();
    
    try {
      // Check if already loaded
      if (this.loadedBundles.has(bundleName)) {
        return {
          success: true,
          bundle: this.loadedBundles.get(bundleName),
          loadTime: 0,
        };
      }

      // Check if already loading
      if (this.loadingBundles.has(bundleName)) {
        const bundle = await this.loadingBundles.get(bundleName)!;
        return {
          success: true,
          bundle,
          loadTime: Date.now() - startTime,
        };
      }

      const config = this.bundleConfigs.get(bundleName);
      if (!config) {
        throw new Error(`Bundle configuration not found: ${bundleName}`);
      }

      // Load dependencies first
      if (config.dependencies) {
        for (const dep of config.dependencies) {
          const depResult = await this.loadBundle(dep);
          if (!depResult.success) {
            throw new Error(`Failed to load dependency: ${dep}`);
          }
        }
      }

      // Start loading the bundle
      const loadPromise = this.loadBundleChunks(config);
      this.loadingBundles.set(bundleName, loadPromise);

      const bundle = await loadPromise;
      
      // Cache the loaded bundle
      this.loadedBundles.set(bundleName, bundle);
      this.loadingBundles.delete(bundleName);

      bundleUtils.trackBundleSize(bundleName);

      return {
        success: true,
        bundle,
        loadTime: Date.now() - startTime,
      };
    } catch (error) {
      this.loadingBundles.delete(bundleName);
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
        loadTime: Date.now() - startTime,
      };
    }
  }

  private async loadBundleChunks(config: BundleConfig): Promise<any> {
    const chunks: any = {};
    
    if (config.chunks) {
      await Promise.all(
        config.chunks.map(async (chunkName) => {
          try {
            const chunk = await this.loadChunk(config.name, chunkName);
            chunks[chunkName] = chunk;
          } catch (error) {
            console.error(`Failed to load chunk ${chunkName}:`, error);
            // Continue loading other chunks
          }
        })
      );
    }

    return chunks;
  }

  private async loadChunk(bundleName: string, chunkName: string): Promise<any> {
    // Map chunk names to actual import paths
    const chunkMap: Record<string, () => Promise<any>> = {
      // Auth chunks
      'login': () => import('../screens/auth/LoginScreen'),
      'register': () => import('../screens/auth/RegisterScreen'),
      'forgotPassword': () => import('../screens/auth/ForgotPasswordScreen'),

      // Dashboard chunks
      'home': () => import('../screens/HomeScreen'),
      'profile': () => import('../screens/ProfileScreen'),
      'settings': () => import('../screens/SettingsScreen'),

      // AI chunks
      'aiTutor': () => import('../screens/ai/AITutorScreen'),
      'aiContent': () => import('../screens/ai/AIContentScreen'),
      'aiAssessment': () => import('../screens/ai/AIAssessmentScreen'),
      'aiDoubt': () => import('../screens/ai/AIDoubtScreen'),
      'aiPlanner': () => import('../screens/ai/AIPlannerScreen'),
      'aiMentor': () => import('../screens/ai/AIMentorScreen'),
      'aiAnalytics': () => import('../screens/ai/AIAnalyticsScreen'),

      // Course chunks
      'courseList': () => import('../screens/CourseScreen'),
      'courseDetails': () => import('../screens/CourseDetailsScreen'),
      'lessonPlayer': () => import('../screens/LessonPlayerScreen'),

      // Assessment chunks
      'assessmentList': () => import('../screens/AssessmentScreen'),
      'assessmentPlayer': () => import('../screens/AssessmentPlayerScreen'),
      'assessmentResults': () => import('../screens/AssessmentResultsScreen'),

      // Real-time chunks
      'studySession': () => import('../screens/StudySessionScreen'),
      'chat': () => import('../components/realtime/RealtimeChat'),
      'collaboration': () => import('../hooks/useRealtime'),

      // Offline chunks
      'offlineStorage': () => import('../services/storage'),
      'offlineSync': () => import('../services/offlineApi'),
      'offlineUI': () => import('../components/common/OfflineIndicator'),
    };

    const importFunc = chunkMap[chunkName];
    if (!importFunc) {
      throw new Error(`Chunk not found: ${chunkName}`);
    }

    return await importFunc();
  }

  async preloadBundles(): Promise<void> {
    const bundlesToPreload = Array.from(this.bundleConfigs.entries())
      .filter(([_, config]) => config.preload)
      .map(([name]) => name);

    await Promise.all(
      bundlesToPreload.map(bundleName => this.loadBundle(bundleName))
    );
  }

  async preloadByPriority(maxPriority: 'critical' | 'high' | 'medium' | 'low'): Promise<void> {
    const priorityOrder = {
      'critical': 0,
      'high': 1,
      'medium': 2,
      'low': 3,
    };

    const bundlesToPreload = Array.from(this.bundleConfigs.entries())
      .filter(([_, config]) => priorityOrder[config.priority] <= priorityOrder[maxPriority])
      .map(([name]) => name);

    // Load in order
    for (const bundleName of bundlesToPreload) {
      await this.loadBundle(bundleName);
    }
  }

  isBundleLoaded(bundleName: string): boolean {
    return this.loadedBundles.has(bundleName);
  }

  getBundleLoadOrder(): string[] {
    return [...this.loadOrder];
  }

  getBundleStats(): {
    loaded: number;
    total: number;
    loadedBundles: string[];
    pendingBundles: string[];
  } {
    const total = this.bundleConfigs.size;
    const loaded = this.loadedBundles.size;
    const loadedBundles = Array.from(this.loadedBundles.keys());
    const pendingBundles = Array.from(this.bundleConfigs.keys())
      .filter(name => !this.loadedBundles.has(name));

    return {
      loaded,
      total,
      loadedBundles,
      pendingBundles,
    };
  }

  async clearBundle(bundleName: string): Promise<void> {
    this.loadedBundles.delete(bundleName);
    this.loadingBundles.delete(bundleName);
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  }

  async clearAllBundles(): Promise<void> {
    this.loadedBundles.clear();
    this.loadingBundles.clear();
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  }
}

// Export singleton instance
export const bundleManager = BundleManager.getInstance();

// Hook for bundle loading
export const useBundleLoader = () => {
  const loadBundle = async (bundleName: string) => {
    return await bundleManager.loadBundle(bundleName);
  };

  const preloadBundles = async () => {
    await bundleManager.preloadBundles();
  };

  const preloadByPriority = async (priority: 'critical' | 'high' | 'medium' | 'low') => {
    await bundleManager.preloadByPriority(priority);
  };

  const isBundleLoaded = (bundleName: string) => {
    return bundleManager.isBundleLoaded(bundleName);
  };

  const getBundleStats = () => {
    return bundleManager.getBundleStats();
  };

  return {
    loadBundle,
    preloadBundles,
    preloadByPriority,
    isBundleLoaded,
    getBundleStats,
  };
};

export default bundleManager;