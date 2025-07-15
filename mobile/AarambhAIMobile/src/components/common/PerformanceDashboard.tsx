import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { COLORS, FONT_SIZES, DIMENSIONS } from '../../constants';
import { 
  usePerformanceMonitor, 
  PerformanceAlert, 
  performanceMonitorService 
} from '../../utils/performanceMonitor';
import { useRenderPerformance } from '../../utils/performance';

interface PerformanceDashboardProps {
  visible: boolean;
  onClose: () => void;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  visible,
  onClose,
}) => {
  useRenderPerformance('PerformanceDashboard');

  const { alerts, summary, getTopSlowComponents, clearAlerts } = usePerformanceMonitor();
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'components' | 'config'>('overview');
  const [config, setConfig] = useState(performanceMonitorService.getConfig());

  useEffect(() => {
    setConfig(performanceMonitorService.getConfig());
  }, []);

  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    performanceMonitorService.updateConfig(newConfig);
  };

  const handleClearAlerts = () => {
    Alert.alert(
      'Clear Alerts',
      'Are you sure you want to clear all performance alerts?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', onPress: clearAlerts },
      ]
    );
  };

  const handleClearSessions = () => {
    Alert.alert(
      'Clear Sessions',
      'Are you sure you want to clear all performance sessions?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', onPress: () => performanceMonitorService.clearSessions() },
      ]
    );
  };

  const getAlertColor = (severity: PerformanceAlert['severity']) => {
    switch (severity) {
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

  const renderOverview = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{summary.totalMetrics}</Text>
          <Text style={styles.metricLabel}>Total Metrics</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{summary.averageRenderTime.toFixed(1)}ms</Text>
          <Text style={styles.metricLabel}>Avg Render Time</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{summary.averageNetworkTime.toFixed(0)}ms</Text>
          <Text style={styles.metricLabel}>Avg Network Time</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: COLORS.error.main }]}>
            {summary.errorCount}
          </Text>
          <Text style={styles.metricLabel}>Errors</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Alerts</Text>
        {alerts.slice(-5).map((alert, index) => (
          <View key={index} style={styles.alertItem}>
            <View style={styles.alertHeader}>
              <Ionicons
                name="warning"
                size={16}
                color={getAlertColor(alert.severity)}
              />
              <Text style={[styles.alertSeverity, { color: getAlertColor(alert.severity) }]}>
                {alert.severity.toUpperCase()}
              </Text>
              <Text style={styles.alertTime}>
                {new Date(alert.timestamp).toLocaleTimeString()}
              </Text>
            </View>
            <Text style={styles.alertMessage}>{alert.message}</Text>
          </View>
        ))}
        
        {alerts.length === 0 && (
          <Text style={styles.noDataText}>No alerts recorded</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Chart</Text>
        <View style={styles.chartContainer}>
          <Text style={styles.chartPlaceholder}>Performance metrics chart would go here</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderAlerts = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.alertsHeader}>
        <Text style={styles.sectionTitle}>All Alerts ({alerts.length})</Text>
        <TouchableOpacity onPress={handleClearAlerts} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {alerts.map((alert, index) => (
        <View key={index} style={styles.alertItem}>
          <View style={styles.alertHeader}>
            <Ionicons
              name="warning"
              size={16}
              color={getAlertColor(alert.severity)}
            />
            <Text style={[styles.alertSeverity, { color: getAlertColor(alert.severity) }]}>
              {alert.severity.toUpperCase()}
            </Text>
            <Text style={styles.alertTime}>
              {new Date(alert.timestamp).toLocaleString()}
            </Text>
          </View>
          <Text style={styles.alertMessage}>{alert.message}</Text>
          <View style={styles.alertDetails}>
            <Text style={styles.alertDetail}>
              Metric: {alert.metric}
            </Text>
            <Text style={styles.alertDetail}>
              Threshold: {alert.threshold}
            </Text>
            <Text style={styles.alertDetail}>
              Actual: {alert.actualValue}
            </Text>
          </View>
        </View>
      ))}

      {alerts.length === 0 && (
        <Text style={styles.noDataText}>No alerts recorded</Text>
      )}
    </ScrollView>
  );

  const renderComponents = () => {
    const slowComponents = getTopSlowComponents();

    return (
      <ScrollView style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Slowest Components</Text>
        
        {slowComponents.map((component, index) => (
          <View key={index} style={styles.componentItem}>
            <Text style={styles.componentName}>{component.name}</Text>
            <Text style={styles.componentTime}>
              {component.averageTime.toFixed(1)}ms
            </Text>
          </View>
        ))}

        {slowComponents.length === 0 && (
          <Text style={styles.noDataText}>No component data available</Text>
        )}
      </ScrollView>
    );
  };

  const renderConfig = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Performance Configuration</Text>
      
      <View style={styles.configItem}>
        <Text style={styles.configLabel}>Enable Metrics</Text>
        <Switch
          value={config.enableMetrics}
          onValueChange={(value) => handleConfigChange('enableMetrics', value)}
          trackColor={{ false: COLORS.grey[300], true: COLORS.primary[300] }}
          thumbColor={config.enableMetrics ? COLORS.primary[600] : COLORS.grey[500]}
        />
      </View>

      <View style={styles.configItem}>
        <Text style={styles.configLabel}>Enable Alerts</Text>
        <Switch
          value={config.enableAlerts}
          onValueChange={(value) => handleConfigChange('enableAlerts', value)}
          trackColor={{ false: COLORS.grey[300], true: COLORS.primary[300] }}
          thumbColor={config.enableAlerts ? COLORS.primary[600] : COLORS.grey[500]}
        />
      </View>

      <View style={styles.configItem}>
        <Text style={styles.configLabel}>Enable Remote Reporting</Text>
        <Switch
          value={config.enableRemoteReporting}
          onValueChange={(value) => handleConfigChange('enableRemoteReporting', value)}
          trackColor={{ false: COLORS.grey[300], true: COLORS.primary[300] }}
          thumbColor={config.enableRemoteReporting ? COLORS.primary[600] : COLORS.grey[500]}
        />
      </View>

      <View style={styles.configSection}>
        <Text style={styles.configSectionTitle}>Sample Rate</Text>
        <Text style={styles.configValue}>{(config.sampleRate * 100).toFixed(0)}%</Text>
      </View>

      <View style={styles.configSection}>
        <Text style={styles.configSectionTitle}>Max Sessions</Text>
        <Text style={styles.configValue}>{config.maxSessions}</Text>
      </View>

      <View style={styles.configSection}>
        <Text style={styles.configSectionTitle}>Alert Thresholds</Text>
        {Object.entries(config.alertThresholds).map(([key, value]) => (
          <View key={key} style={styles.thresholdItem}>
            <Text style={styles.thresholdLabel}>{key}</Text>
            <Text style={styles.thresholdValue}>{value}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity onPress={handleClearSessions} style={styles.dangerButton}>
        <Text style={styles.dangerButtonText}>Clear All Sessions</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderTabs = () => (
    <View style={styles.tabBar}>
      {[
        { key: 'overview', label: 'Overview', icon: 'analytics' },
        { key: 'alerts', label: 'Alerts', icon: 'warning' },
        { key: 'components', label: 'Components', icon: 'code' },
        { key: 'config', label: 'Config', icon: 'settings' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tab,
            activeTab === tab.key && styles.activeTab,
          ]}
          onPress={() => setActiveTab(tab.key as any)}
        >
          <Ionicons
            name={tab.icon as any}
            size={16}
            color={activeTab === tab.key ? COLORS.primary[600] : COLORS.text.secondary}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === tab.key && styles.activeTabLabel,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'alerts':
        return renderAlerts();
      case 'components':
        return renderComponents();
      case 'config':
        return renderConfig();
      default:
        return renderOverview();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Performance Dashboard</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>

        {renderTabs()}
        {renderContent()}
      </View>
    </Modal>
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.light,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary[600],
  },
  tabLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  activeTabLabel: {
    color: COLORS.primary[600],
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 12,
  },
  metricCard: {
    backgroundColor: COLORS.background.light,
    padding: 16,
    borderRadius: 8,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearButton: {
    backgroundColor: COLORS.error.main,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  clearButtonText: {
    color: COLORS.background.light,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  alertItem: {
    backgroundColor: COLORS.background.light,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertSeverity: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    marginLeft: 4,
  },
  alertTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginLeft: 'auto',
  },
  alertMessage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  alertDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  alertDetail: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    backgroundColor: COLORS.grey[100],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  componentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background.light,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  componentName: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  componentTime: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background.light,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  configLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
  },
  configSection: {
    backgroundColor: COLORS.background.light,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  configSectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  configValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
  },
  thresholdItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  thresholdLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  thresholdValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: COLORS.error.main,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  dangerButtonText: {
    color: COLORS.background.light,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  chartContainer: {
    backgroundColor: COLORS.background.light,
    padding: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartPlaceholder: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
  noDataText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
});

export default PerformanceDashboard;