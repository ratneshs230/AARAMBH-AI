import React, { Suspense, ComponentType } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../../constants';
import { bundleUtils } from '../../utils/performance';

interface LazyLoaderProps {
  children: React.ReactNode;
  fallback?: React.ComponentType;
  onError?: (error: Error) => void;
}

// Default loading component
const DefaultLoader: React.FC = () => (
  <View style={styles.loaderContainer}>
    <ActivityIndicator size="large" color={COLORS.primary[600]} />
  </View>
);

// Error boundary for lazy loaded components
class LazyErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; onError?: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy loading error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Failed to load component. Please try again.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

// Lazy loader component
export const LazyLoader: React.FC<LazyLoaderProps> = ({
  children,
  fallback: FallbackComponent = DefaultLoader,
  onError,
}) => {
  return (
    <LazyErrorBoundary onError={onError}>
      <Suspense fallback={<FallbackComponent />}>
        {children}
      </Suspense>
    </LazyErrorBoundary>
  );
};

// HOC for lazy loading components
export const withLazyLoading = <P extends object>(
  Component: ComponentType<P>,
  LoadingComponent: ComponentType = DefaultLoader
) => {
  return React.memo((props: P) => (
    <LazyLoader fallback={LoadingComponent}>
      <Component {...props} />
    </LazyLoader>
  ));
};

// Lazy import with performance tracking
export const createLazyComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  componentName?: string
): React.LazyExoticComponent<T> => {
  return bundleUtils.lazyLoadComponent(importFunc);
};

// Preload component for better UX
export const preloadComponent = <T extends ComponentType<any>>(
  lazyComponent: React.LazyExoticComponent<T>
) => {
  // Trigger the import to preload the component
  const componentImport = (lazyComponent as any)._payload._result;
  if (!componentImport) {
    (lazyComponent as any)._payload._result = (lazyComponent as any)._payload._fn();
  }
};

// Conditional lazy loading based on platform or feature flags
export const createConditionalLazyComponent = <T extends ComponentType<any>>(
  condition: boolean,
  lazyImport: () => Promise<{ default: T }>,
  fallbackComponent: T
): React.LazyExoticComponent<T> | T => {
  if (condition) {
    return createLazyComponent(lazyImport);
  }
  return fallbackComponent;
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background.main,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background.main,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});

export default LazyLoader;