import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ProgressBarAndroid, ProgressViewIOS, Platform } from 'react-native';
import { COLORS, FONT_SIZES } from '../../constants';
import { bundleManager, useBundleLoader } from '../../utils/bundleManager';
import { useRenderPerformance } from '../../utils/performance';

interface BundlePreloaderProps {
  onLoadingComplete?: () => void;
  onError?: (error: Error) => void;
  showProgress?: boolean;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  loadingText?: string;
  errorText?: string;
  style?: any;
}

export const BundlePreloader: React.FC<BundlePreloaderProps> = ({
  onLoadingComplete,
  onError,
  showProgress = true,
  priority = 'high',
  loadingText = 'Loading application...',
  errorText = 'Failed to load application',
  style,
}) => {
  useRenderPerformance('BundlePreloader');

  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentBundle, setCurrentBundle] = useState<string>('');
  const [error, setError] = useState<Error | null>(null);
  const { preloadByPriority, getBundleStats } = useBundleLoader();

  useEffect(() => {
    preloadBundles();
  }, [priority]);

  const preloadBundles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const loadOrder = bundleManager.getBundleLoadOrder();
      const bundlesToLoad = loadOrder.filter(bundleName => {
        const config = bundleManager['bundleConfigs'].get(bundleName);
        return config && getPriorityValue(config.priority) <= getPriorityValue(priority);
      });

      let loadedCount = 0;
      const totalCount = bundlesToLoad.length;

      for (const bundleName of bundlesToLoad) {
        setCurrentBundle(bundleName);
        
        const result = await bundleManager.loadBundle(bundleName);
        if (!result.success) {
          throw result.error || new Error(`Failed to load bundle: ${bundleName}`);
        }

        loadedCount++;
        setLoadingProgress(loadedCount / totalCount);
      }

      setIsLoading(false);
      onLoadingComplete?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      setIsLoading(false);
      onError?.(error);
    }
  };

  const getPriorityValue = (priority: 'critical' | 'high' | 'medium' | 'low'): number => {
    const priorityOrder = {
      'critical': 0,
      'high': 1,
      'medium': 2,
      'low': 3,
    };
    return priorityOrder[priority];
  };

  const renderProgressBar = () => {
    if (!showProgress || !isLoading) return null;

    const progress = Math.round(loadingProgress * 100);

    return (
      <View style={styles.progressContainer}>
        {Platform.OS === 'ios' ? (
          <ProgressViewIOS
            progress={loadingProgress}
            style={styles.progressBar}
            progressTintColor={COLORS.primary[600]}
            trackTintColor={COLORS.grey[300]}
          />
        ) : (
          <ProgressBarAndroid
            progress={loadingProgress}
            style={styles.progressBar}
            color={COLORS.primary[600]}
            indeterminate={false}
            styleAttr="Horizontal"
          />
        )}
        <Text style={styles.progressText}>{progress}%</Text>
      </View>
    );
  };

  const renderCurrentBundle = () => {
    if (!currentBundle || !isLoading) return null;

    return (
      <Text style={styles.bundleText}>
        Loading {currentBundle}...
      </Text>
    );
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorText}</Text>
        <Text style={styles.errorDetail}>{error.message}</Text>
      </View>
    );
  };

  const renderLoader = () => {
    if (!isLoading) return null;

    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator 
          size="large" 
          color={COLORS.primary[600]} 
          style={styles.spinner}
        />
        <Text style={styles.loadingText}>{loadingText}</Text>
        {renderCurrentBundle()}
        {renderProgressBar()}
      </View>
    );
  };

  if (error) {
    return (
      <View style={[styles.container, style]}>
        {renderError()}
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        {renderLoader()}
      </View>
    );
  }

  return null;
};

interface BundleStatsProps {
  visible?: boolean;
  style?: any;
}

export const BundleStats: React.FC<BundleStatsProps> = ({
  visible = false,
  style,
}) => {
  const { getBundleStats } = useBundleLoader();
  const [stats, setStats] = useState(getBundleStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getBundleStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <View style={[styles.statsContainer, style]}>
      <Text style={styles.statsTitle}>Bundle Statistics</Text>
      <Text style={styles.statsText}>
        Loaded: {stats.loaded}/{stats.total}
      </Text>
      <Text style={styles.statsText}>
        Loaded Bundles: {stats.loadedBundles.join(', ')}
      </Text>
      {stats.pendingBundles.length > 0 && (
        <Text style={styles.statsText}>
          Pending: {stats.pendingBundles.join(', ')}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background.main,
    padding: 20,
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  bundleText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    marginBottom: 10,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.error.main,
    marginBottom: 10,
    textAlign: 'center',
  },
  errorDetail: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error.dark,
    textAlign: 'center',
  },
  statsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: COLORS.background.light,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.grey[300],
  },
  statsTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  statsText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
});

export default BundlePreloader;