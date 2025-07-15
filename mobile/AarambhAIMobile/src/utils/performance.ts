import { useEffect, useRef, useCallback, useMemo } from 'react';

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private componentRenderTimes: Map<string, number[]> = new Map();
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Track component render time
  trackRenderTime(componentName: string, startTime: number, endTime: number) {
    const renderTime = endTime - startTime;
    
    if (!this.componentRenderTimes.has(componentName)) {
      this.componentRenderTimes.set(componentName, []);
    }
    
    const times = this.componentRenderTimes.get(componentName)!;
    times.push(renderTime);
    
    // Keep only last 100 measurements
    if (times.length > 100) {
      times.shift();
    }
    
    // Log slow renders (>16ms for 60fps)
    if (renderTime > 16) {
      console.warn(`Slow render detected: ${componentName} took ${renderTime}ms`);
    }
  }

  // Track API call performance
  trackApiCall(endpoint: string, duration: number) {
    if (!this.metrics.has(endpoint)) {
      this.metrics.set(endpoint, []);
    }
    
    const times = this.metrics.get(endpoint)!;
    times.push(duration);
    
    if (times.length > 50) {
      times.shift();
    }
  }

  // Get average render time for a component
  getAverageRenderTime(componentName: string): number {
    const times = this.componentRenderTimes.get(componentName);
    if (!times || times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  // Get performance report
  getPerformanceReport(): {
    components: { name: string; avgRenderTime: number; renderCount: number }[];
    apis: { endpoint: string; avgDuration: number; callCount: number }[];
  } {
    const components = Array.from(this.componentRenderTimes.entries()).map(([name, times]) => ({
      name,
      avgRenderTime: times.reduce((sum, time) => sum + time, 0) / times.length,
      renderCount: times.length,
    }));

    const apis = Array.from(this.metrics.entries()).map(([endpoint, times]) => ({
      endpoint,
      avgDuration: times.reduce((sum, time) => sum + time, 0) / times.length,
      callCount: times.length,
    }));

    return { components, apis };
  }
}

// Hook for tracking component render performance
export const useRenderPerformance = (componentName: string) => {
  const startTimeRef = useRef<number>(0);
  const monitor = PerformanceMonitor.getInstance();

  useEffect(() => {
    startTimeRef.current = performance.now();
    
    return () => {
      const endTime = performance.now();
      monitor.trackRenderTime(componentName, startTimeRef.current, endTime);
    };
  });
};

// Hook for debouncing values to prevent excessive re-renders
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook for throttling function calls
export const useThrottle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  const throttledFuncRef = useRef<T | null>(null);
  const lastExecRef = useRef<number>(0);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastExecRef.current >= delay) {
        lastExecRef.current = now;
        return func(...args);
      }
    }) as T,
    [func, delay]
  );
};

// Memoization utilities
export const createMemoizedSelector = <T, R>(
  selector: (state: T) => R,
  equalityFn?: (a: R, b: R) => boolean
) => {
  let lastInput: T;
  let lastResult: R;
  
  return (input: T): R => {
    if (lastInput === input) {
      return lastResult;
    }
    
    const result = selector(input);
    
    if (equalityFn && lastResult !== undefined) {
      if (equalityFn(lastResult, result)) {
        return lastResult;
      }
    }
    
    lastInput = input;
    lastResult = result;
    return result;
  };
};

// Deep equality check for objects
export const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }
    
    return true;
  }
  
  return false;
};

// Shallow equality check for objects
export const shallowEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (a[key] !== b[key]) return false;
    }
    
    return true;
  }
  
  return false;
};

// Memory management utilities
export const memoryUtils = {
  // Clear unused cached data
  clearCache: () => {
    if (global.gc) {
      global.gc();
    }
  },
  
  // Get memory usage information
  getMemoryUsage: () => {
    if (global.performance && global.performance.memory) {
      return {
        used: global.performance.memory.usedJSHeapSize,
        total: global.performance.memory.totalJSHeapSize,
        limit: global.performance.memory.jsHeapSizeLimit,
      };
    }
    return null;
  },
  
  // Monitor memory usage
  monitorMemory: (callback: (usage: any) => void, interval: number = 5000) => {
    const monitor = setInterval(() => {
      const usage = memoryUtils.getMemoryUsage();
      if (usage) {
        callback(usage);
      }
    }, interval);
    
    return () => clearInterval(monitor);
  },
};

// Bundle analysis utilities
export const bundleUtils = {
  // Track bundle size
  trackBundleSize: (bundleName: string) => {
    console.log(`Bundle loaded: ${bundleName}`);
  },
  
  // Lazy load component
  lazyLoadComponent: <T extends React.ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>
  ) => {
    return React.lazy(() => 
      importFunc().then(module => {
        bundleUtils.trackBundleSize(module.default.name || 'Unknown');
        return module;
      })
    );
  },
};

// Performance optimization hooks
export const useOptimizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return useCallback(callback, deps);
};

export const useOptimizedMemo = <T>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  return useMemo(factory, deps);
};

// Component optimization helpers
export const withPerformanceTracking = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  return React.memo((props: P) => {
    useRenderPerformance(componentName);
    return <Component {...props} />;
  });
};

// List optimization utilities
export const listUtils = {
  // Get item layout for FlatList optimization
  getItemLayout: (itemHeight: number) => (data: any, index: number) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  }),
  
  // Key extractor for FlatList
  keyExtractor: (item: any, index: number) => {
    return item.id?.toString() || index.toString();
  },
  
  // Render item with memoization
  renderItem: <T>(ItemComponent: React.ComponentType<{ item: T; index: number }>) => 
    React.memo(({ item, index }: { item: T; index: number }) => (
      <ItemComponent item={item} index={index} />
    )),
};

export default PerformanceMonitor;