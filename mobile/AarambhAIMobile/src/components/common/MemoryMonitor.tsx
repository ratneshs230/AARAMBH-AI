import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES } from '../../constants';
import { useMemoryManager, MemoryStats, MemoryWarning } from '../../utils/memoryManager';
import { useRenderPerformance } from '../../utils/performance';

interface MemoryMonitorProps {
  visible?: boolean;
  onClose?: () => void;
  showWarnings?: boolean;
  showControls?: boolean;
}

export const MemoryMonitor: React.FC<MemoryMonitorProps> = ({
  visible = false,
  onClose,
  showWarnings = true,
  showControls = true,
}) => {
  useRenderPerformance('MemoryMonitor');

  const {
    memoryStats,
    memoryWarnings,
    performManualCleanup,
    clearAllCaches,
    getMemoryReport,
  } = useMemoryManager();

  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [autoCleanup, setAutoCleanup] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const handleManualCleanup = async () => {
    setIsCleaningUp(true);
    try {
      await performManualCleanup();
      Alert.alert('Success', 'Memory cleanup completed successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to perform memory cleanup');
    } finally {
      setIsCleaningUp(false);
    }
  };

  const handleClearAllCaches = async () => {
    Alert.alert(
      'Clear All Caches',
      'This will clear all cached data including images, bundles, and offline data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setIsCleaningUp(true);
            try {
              await clearAllCaches();
              Alert.alert('Success', 'All caches cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear caches');
            } finally {
              setIsCleaningUp(false);
            }
          },
        },
      ]
    );
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getMemoryStatusColor = (stats: MemoryStats): string => {
    if (stats.usagePercentage >= 90) return COLORS.error.main;
    if (stats.usagePercentage >= 75) return COLORS.warning.main;
    if (stats.usagePercentage >= 50) return COLORS.orange;
    return COLORS.success.main;
  };

  const getWarningColor = (level: MemoryWarning['level']): string => {
    switch (level) {
      case 'critical':
        return COLORS.error.main;
      case 'high':
        return COLORS.warning.main;
      case 'medium':
        return COLORS.orange;
      case 'low':
        return COLORS.info.main;
      default:
        return COLORS.grey[500];
    }
  };

  const renderMemoryStats = () => {
    if (!memoryStats) {
      return (
        <View style={styles.statsContainer}>
          <Text style={styles.noDataText}>Memory stats not available</Text>
        </View>
      );
    }

    const statusColor = getMemoryStatusColor(memoryStats);

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Memory Usage</Text>
          <Text style={[styles.statValue, { color: statusColor }]}>
            {memoryStats.usagePercentage.toFixed(1)}%
          </Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${memoryStats.usagePercentage}%`,
                backgroundColor: statusColor,
              },
            ]}
          />
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Used</Text>
          <Text style={styles.statValue}>{formatBytes(memoryStats.used)}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Available</Text>
          <Text style={styles.statValue}>{formatBytes(memoryStats.available)}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Limit</Text>
          <Text style={styles.statValue}>{formatBytes(memoryStats.limit)}</Text>
        </View>
      </View>
    );
  };

  const renderMemoryWarnings = () => {
    if (!showWarnings || memoryWarnings.length === 0) {
      return null;
    }

    const recentWarnings = memoryWarnings.slice(-5); // Show last 5 warnings

    return (
      <View style={styles.warningsContainer}>
        <Text style={styles.sectionTitle}>Recent Warnings</Text>
        {recentWarnings.map((warning, index) => (
          <View key={index} style={styles.warningItem}>
            <View style={styles.warningHeader}>
              <Ionicons
                name="warning"
                size={16}
                color={getWarningColor(warning.level)}
              />
              <Text style={[styles.warningLevel, { color: getWarningColor(warning.level) }]}>
                {warning.level.toUpperCase()}
              </Text>
              <Text style={styles.warningTime}>
                {new Date(warning.timestamp).toLocaleTimeString()}
              </Text>
            </View>
            <Text style={styles.warningMessage}>{warning.message}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderControls = () => {
    if (!showControls) return null;

    return (
      <View style={styles.controlsContainer}>
        <Text style={styles.sectionTitle}>Memory Controls</Text>
        
        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>Auto Cleanup</Text>
          <Switch
            value={autoCleanup}
            onValueChange={setAutoCleanup}
            trackColor={{ false: COLORS.grey[300], true: COLORS.primary[300] }}
            thumbColor={autoCleanup ? COLORS.primary[600] : COLORS.grey[500]}
          />
        </View>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleManualCleanup}
          disabled={isCleaningUp}
        >
          <Ionicons name="refresh" size={16} color={COLORS.background.light} />
          <Text style={styles.controlButtonText}>
            {isCleaningUp ? 'Cleaning...' : 'Manual Cleanup'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.dangerButton]}
          onPress={handleClearAllCaches}
          disabled={isCleaningUp}
        >
          <Ionicons name="trash" size={16} color={COLORS.background.light} />
          <Text style={styles.controlButtonText}>Clear All Caches</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.infoButton]}
          onPress={() => setShowDetails(!showDetails)}
        >
          <Ionicons name="information" size={16} color={COLORS.background.light} />
          <Text style={styles.controlButtonText}>
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderDetails = () => {
    if (!showDetails) return null;

    const report = getMemoryReport();

    return (
      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>Memory Report</Text>
        <ScrollView style={styles.detailsScroll}>
          <Text style={styles.detailsText}>
            {JSON.stringify(report, null, 2)}
          </Text>
        </ScrollView>
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Memory Monitor</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {renderMemoryStats()}
          {renderMemoryWarnings()}
          {renderControls()}
          {renderDetails()}
        </ScrollView>
      </View>
    </Modal>
  );
};

interface MemoryIndicatorProps {
  onPress?: () => void;
  style?: any;
}

export const MemoryIndicator: React.FC<MemoryIndicatorProps> = ({
  onPress,
  style,
}) => {
  const { memoryStats } = useMemoryManager();

  if (!memoryStats) return null;

  const statusColor = memoryStats.usagePercentage >= 90 
    ? COLORS.error.main 
    : memoryStats.usagePercentage >= 75 
    ? COLORS.warning.main 
    : COLORS.success.main;

  return (
    <TouchableOpacity
      style={[styles.indicator, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name="analytics" size={16} color={statusColor} />
      <Text style={[styles.indicatorText, { color: statusColor }]}>
        {memoryStats.usagePercentage.toFixed(0)}%
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.main,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    backgroundColor: COLORS.background.light,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
  },
  statValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.grey[200],
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  noDataText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  warningsContainer: {
    backgroundColor: COLORS.background.light,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  warningItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: COLORS.grey[50],
    borderRadius: 6,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  warningLevel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    marginLeft: 4,
  },
  warningTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginLeft: 'auto',
  },
  warningMessage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  controlsContainer: {
    backgroundColor: COLORS.background.light,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  controlLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary[600],
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  dangerButton: {
    backgroundColor: COLORS.error.main,
  },
  infoButton: {
    backgroundColor: COLORS.info.main,
  },
  controlButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.background.light,
    marginLeft: 8,
  },
  detailsContainer: {
    backgroundColor: COLORS.background.light,
    padding: 16,
    borderRadius: 8,
  },
  detailsScroll: {
    maxHeight: 200,
  },
  detailsText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    fontFamily: 'monospace',
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.background.light,
    borderWidth: 1,
    borderColor: COLORS.grey[300],
  },
  indicatorText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default MemoryMonitor;