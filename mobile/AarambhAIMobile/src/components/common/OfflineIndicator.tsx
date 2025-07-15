import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus, useSync, useConnectionQuality } from '../../hooks/useOffline';
import { COLORS, FONT_SIZES, DIMENSIONS } from '../../constants';
import { Modal } from './Modal';
import { Button } from './Button';
import { Badge } from './Badge';

interface OfflineIndicatorProps {
  showDetailed?: boolean;
  style?: any;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  showDetailed = false,
  style
}) => {
  const {
    isConnected,
    isOffline,
    connectionType,
    isWifi,
    isCellular,
    isInternetReachable,
    isLoading: networkLoading,
    refreshNetworkState
  } = useNetworkStatus();

  const {
    isSyncing,
    lastSyncTime,
    queueSize,
    canSync,
    forceSync
  } = useSync();

  const { quality, latency, isChecking } = useConnectionQuality();

  const [showDetails, setShowDetails] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));

  React.useEffect(() => {
    // Animate the indicator
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const getConnectionIcon = () => {
    if (isLoading || networkLoading) return 'sync-outline';
    if (isOffline) return 'cloud-offline-outline';
    if (isWifi) return 'wifi-outline';
    if (isCellular) return 'cellular-outline';
    return 'cloud-done-outline';
  };

  const getConnectionColor = () => {
    if (isOffline) return COLORS.error.main;
    if (quality === 'excellent') return COLORS.success.main;
    if (quality === 'good') return COLORS.primary[600];
    if (quality === 'fair') return COLORS.warning.main;
    return COLORS.error.main;
  };

  const getStatusText = () => {
    if (isOffline) return 'Offline';
    if (isSyncing) return 'Syncing...';
    if (quality === 'excellent') return 'Excellent';
    if (quality === 'good') return 'Good';
    if (quality === 'fair') return 'Fair';
    return 'Poor';
  };

  const handleSync = async () => {
    try {
      await forceSync();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never';
    const now = new Date();
    const diff = now.getTime() - lastSyncTime.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const renderSimpleIndicator = () => (
    <TouchableOpacity
      style={[styles.simpleContainer, style]}
      onPress={() => showDetailed && setShowDetails(true)}
    >
      <Ionicons
        name={getConnectionIcon()}
        size={16}
        color={getConnectionColor()}
      />
      {queueSize > 0 && (
        <View style={styles.queueBadge}>
          <Text style={styles.queueText}>{queueSize}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderDetailedIndicator = () => (
    <TouchableOpacity
      style={[styles.detailedContainer, style]}
      onPress={() => setShowDetails(true)}
    >
      <View style={styles.indicatorRow}>
        <Ionicons
          name={getConnectionIcon()}
          size={20}
          color={getConnectionColor()}
        />
        <Text style={[styles.statusText, { color: getConnectionColor() }]}>
          {getStatusText()}
        </Text>
        
        {queueSize > 0 && (
          <Badge
            text={`${queueSize} pending`}
            variant="warning"
            size="small"
          />
        )}
      </View>
      
      {isOffline && (
        <Text style={styles.offlineMessage}>
          Working offline - changes will sync when online
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderDetailsModal = () => (
    <Modal
      visible={showDetails}
      onClose={() => setShowDetails(false)}
      title="Connection Status"
      position="center"
    >
      <View style={styles.modalContent}>
        {/* Connection Status */}
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Connection</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <View style={styles.detailValue}>
              <Ionicons
                name={getConnectionIcon()}
                size={16}
                color={getConnectionColor()}
              />
              <Text style={[styles.statusValue, { color: getConnectionColor() }]}>
                {isConnected ? 'Connected' : 'Offline'}
              </Text>
            </View>
          </View>
          
          {isConnected && (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type:</Text>
                <Text style={styles.detailValue}>{connectionType}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Quality:</Text>
                <Text style={[styles.detailValue, { color: getConnectionColor() }]}>
                  {quality} ({latency}ms)
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Internet:</Text>
                <Text style={styles.detailValue}>
                  {isInternetReachable ? 'Reachable' : 'Not reachable'}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Sync Status */}
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Sync Status</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Last sync:</Text>
            <Text style={styles.detailValue}>{formatLastSync()}</Text>
          </View>
          
          {queueSize > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Pending items:</Text>
              <Text style={styles.detailValue}>{queueSize}</Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={styles.detailValue}>
              {isSyncing ? 'Syncing...' : 'Up to date'}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Button
            title="Refresh Status"
            onPress={refreshNetworkState}
            variant="outline"
            size="small"
            icon="refresh-outline"
            style={styles.actionButton}
            disabled={networkLoading}
          />
          
          {canSync && (
            <Button
              title="Sync Now"
              onPress={handleSync}
              size="small"
              icon="cloud-upload-outline"
              style={styles.actionButton}
              disabled={isSyncing}
            />
          )}
        </View>

        {isOffline && (
          <View style={styles.offlineNotice}>
            <Ionicons name="information-circle" size={16} color={COLORS.warning.main} />
            <Text style={styles.offlineNoticeText}>
              You're working offline. Your data will be saved locally and synced when you're back online.
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );

  return (
    <>
      {showDetailed ? renderDetailedIndicator() : renderSimpleIndicator()}
      {renderDetailsModal()}
    </>
  );
};

const styles = StyleSheet.create({
  simpleContainer: {
    position: 'relative',
    padding: 4,
  },
  queueBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.error.main,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  queueText: {
    fontSize: 10,
    color: COLORS.background.light,
    fontWeight: '600',
  },
  detailedContainer: {
    backgroundColor: COLORS.background.light,
    borderRadius: DIMENSIONS.BORDER_RADIUS,
    padding: 12,
    marginVertical: 4,
    elevation: 1,
    shadowColor: COLORS.grey[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  offlineMessage: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  modalContent: {
    padding: 16,
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  detailValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
  },
  offlineNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: COLORS.warning.light,
    padding: 12,
    borderRadius: DIMENSIONS.BORDER_RADIUS,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning.main,
  },
  offlineNoticeText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning.dark,
    lineHeight: 18,
  },
});

export default OfflineIndicator;