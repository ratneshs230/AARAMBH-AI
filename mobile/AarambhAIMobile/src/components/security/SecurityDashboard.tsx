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
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES } from '../../constants';
import { securityService } from '../../services/security';
import { authSecurityService } from '../../services/authSecurity';
import { dataProtectionService } from '../../services/dataProtection';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface SecurityDashboardProps {
  visible: boolean;
  onClose: () => void;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({
  visible,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'audit' | 'data'>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [securityReport, setSecurityReport] = useState<any>(null);
  const [securityAudit, setSecurityAudit] = useState<any>(null);
  const [dataProtectionReport, setDataProtectionReport] = useState<any>(null);
  const [securitySettings, setSecuritySettings] = useState<any>(null);

  useEffect(() => {
    if (visible) {
      loadSecurityData();
    }
  }, [visible]);

  const loadSecurityData = async () => {
    try {
      const [report, audit, dataReport, settings] = await Promise.all([
        securityService.getSecurityReport(),
        authSecurityService.getSecurityAudit(),
        dataProtectionService.getDataProtectionReport(),
        authSecurityService.getSecuritySettings(),
      ]);

      setSecurityReport(report);
      setSecurityAudit(audit);
      setDataProtectionReport(dataReport);
      setSecuritySettings(settings);
    } catch (error) {
      console.error('Failed to load security data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSecurityData();
    setRefreshing(false);
  };

  const getSecurityScore = (): { score: number; level: string; color: string } => {
    if (!securityAudit) return { score: 0, level: 'Unknown', color: COLORS.grey[500] };

    let score = 0;
    let maxScore = 0;

    // Authentication status
    if (securityAudit.authStatus) score += 25;
    maxScore += 25;

    // Two-factor authentication
    if (securityAudit.twoFactorEnabled) score += 25;
    maxScore += 25;

    // Biometric authentication
    if (securityAudit.biometricEnabled) score += 20;
    maxScore += 20;

    // Device trust
    if (securityAudit.deviceTrusted) score += 15;
    maxScore += 15;

    // Security events (negative impact)
    const securityViolations = securityAudit.securityEvents.filter(
      (event: any) => event.type === 'SECURITY_VIOLATION'
    ).length;
    score -= Math.min(securityViolations * 5, 15);
    maxScore += 15;

    const percentage = Math.max(0, Math.min(100, (score / maxScore) * 100));

    let level: string;
    let color: string;

    if (percentage >= 80) {
      level = 'Excellent';
      color = COLORS.success.main;
    } else if (percentage >= 60) {
      level = 'Good';
      color = COLORS.info.main;
    } else if (percentage >= 40) {
      level = 'Fair';
      color = COLORS.warning.main;
    } else {
      level = 'Poor';
      color = COLORS.error.main;
    }

    return { score: Math.round(percentage), level, color };
  };

  const renderOverview = () => {
    const securityScore = getSecurityScore();

    return (
      <ScrollView
        style={styles.tabContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Security Score */}
        <Card style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreTitle}>Security Score</Text>
            <View style={styles.scoreDisplay}>
              <Text style={[styles.scoreValue, { color: securityScore.color }]}>
                {securityScore.score}%
              </Text>
              <Text style={[styles.scoreLevel, { color: securityScore.color }]}>
                {securityScore.level}
              </Text>
            </View>
          </View>
          <View style={styles.scoreBar}>
            <View
              style={[
                styles.scoreProgress,
                {
                  width: `${securityScore.score}%`,
                  backgroundColor: securityScore.color,
                },
              ]}
            />
          </View>
        </Card>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons
                name="shield-checkmark"
                size={24}
                color={securityAudit?.authStatus ? COLORS.success.main : COLORS.error.main}
              />
            </View>
            <Text style={styles.statLabel}>Authentication</Text>
            <Text style={styles.statValue}>
              {securityAudit?.authStatus ? 'Secure' : 'Insecure'}
            </Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons
                name="phone-portrait"
                size={24}
                color={securityAudit?.deviceTrusted ? COLORS.success.main : COLORS.warning.main}
              />
            </View>
            <Text style={styles.statLabel}>Device Status</Text>
            <Text style={styles.statValue}>
              {securityAudit?.deviceTrusted ? 'Trusted' : 'Untrusted'}
            </Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons
                name="key"
                size={24}
                color={securityAudit?.twoFactorEnabled ? COLORS.success.main : COLORS.error.main}
              />
            </View>
            <Text style={styles.statLabel}>2FA</Text>
            <Text style={styles.statValue}>
              {securityAudit?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons
                name="database"
                size={24}
                color={dataProtectionReport?.totalDataItems > 0 ? COLORS.info.main : COLORS.grey[400]}
              />
            </View>
            <Text style={styles.statLabel}>Data Items</Text>
            <Text style={styles.statValue}>
              {dataProtectionReport?.totalDataItems || 0}
            </Text>
          </Card>
        </View>

        {/* Security Recommendations */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Security Recommendations</Text>
          {securityAudit?.recommendations.length > 0 ? (
            securityAudit.recommendations.map((recommendation: string, index: number) => (
              <View key={index} style={styles.recommendationItem}>
                <Ionicons name="bulb" size={16} color={COLORS.warning.main} />
                <Text style={styles.recommendationText}>{recommendation}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No recommendations at this time</Text>
          )}
        </Card>

        {/* Recent Security Events */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Security Events</Text>
          {securityAudit?.securityEvents.length > 0 ? (
            securityAudit.securityEvents.map((event: any, index: number) => (
              <View key={index} style={styles.eventItem}>
                <View style={styles.eventHeader}>
                  <Ionicons
                    name={getEventIcon(event.type)}
                    size={16}
                    color={getEventColor(event.type)}
                  />
                  <Text style={styles.eventType}>{event.type}</Text>
                  <Text style={styles.eventTime}>
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
                {event.metadata && (
                  <Text style={styles.eventMetadata}>
                    {JSON.stringify(event.metadata)}
                  </Text>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No recent security events</Text>
          )}
        </Card>
      </ScrollView>
    );
  };

  const renderSettings = () => {
    const handleToggleSetting = async (setting: string, value: boolean) => {
      try {
        await authSecurityService.updateSecuritySettings({ [setting]: value });
        setSecuritySettings({ ...securitySettings, [setting]: value });
      } catch (error) {
        Alert.alert('Error', 'Failed to update security setting');
      }
    };

    const handleTrustDevice = async () => {
      try {
        await authSecurityService.trustDevice();
        await loadSecurityData();
        Alert.alert('Success', 'Device has been trusted');
      } catch (error) {
        Alert.alert('Error', 'Failed to trust device');
      }
    };

    const handleUntrustDevice = async () => {
      try {
        await authSecurityService.untrustDevice();
        await loadSecurityData();
        Alert.alert('Success', 'Device trust has been removed');
      } catch (error) {
        Alert.alert('Error', 'Failed to untrust device');
      }
    };

    return (
      <ScrollView style={styles.tabContent}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Authentication Settings</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
            <Switch
              value={securitySettings?.twoFactorEnabled || false}
              onValueChange={(value) => handleToggleSetting('twoFactorEnabled', value)}
              trackColor={{ false: COLORS.grey[300], true: COLORS.primary[300] }}
              thumbColor={securitySettings?.twoFactorEnabled ? COLORS.primary[600] : COLORS.grey[500]}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Biometric Authentication</Text>
            <Switch
              value={securitySettings?.biometricEnabled || false}
              onValueChange={(value) => handleToggleSetting('biometricEnabled', value)}
              trackColor={{ false: COLORS.grey[300], true: COLORS.primary[300] }}
              thumbColor={securitySettings?.biometricEnabled ? COLORS.primary[600] : COLORS.grey[500]}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Login Notifications</Text>
            <Switch
              value={securitySettings?.loginNotificationsEnabled || false}
              onValueChange={(value) => handleToggleSetting('loginNotificationsEnabled', value)}
              trackColor={{ false: COLORS.grey[300], true: COLORS.primary[300] }}
              thumbColor={securitySettings?.loginNotificationsEnabled ? COLORS.primary[600] : COLORS.grey[500]}
            />
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Device Management</Text>
          
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceLabel}>Device Trust Status</Text>
            <Badge
              text={securityAudit?.deviceTrusted ? 'Trusted' : 'Untrusted'}
              variant={securityAudit?.deviceTrusted ? 'success' : 'warning'}
            />
          </View>

          <View style={styles.deviceActions}>
            {securityAudit?.deviceTrusted ? (
              <Button
                title="Untrust Device"
                variant="outline"
                onPress={handleUntrustDevice}
                style={styles.deviceButton}
              />
            ) : (
              <Button
                title="Trust Device"
                onPress={handleTrustDevice}
                style={styles.deviceButton}
              />
            )}
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Session Settings</Text>
          
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionLabel}>Session Timeout</Text>
            <Text style={styles.sessionValue}>
              {Math.round((securitySettings?.sessionTimeout || 0) / 60000)} minutes
            </Text>
          </View>

          <Button
            title="Update Session Settings"
            variant="outline"
            onPress={() => Alert.alert('Info', 'Session settings can be updated in app settings')}
            style={styles.sessionButton}
          />
        </Card>
      </ScrollView>
    );
  };

  const renderAudit = () => {
    const accessLogs = dataProtectionService.getAccessLogs(20);

    return (
      <ScrollView style={styles.tabContent}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Account Security</Text>
          
          <View style={styles.auditItem}>
            <Text style={styles.auditLabel}>Failed Login Attempts</Text>
            <Text style={styles.auditValue}>{securityReport?.failedAttempts || 0}</Text>
          </View>

          <View style={styles.auditItem}>
            <Text style={styles.auditLabel}>Account Locked</Text>
            <Text style={[
              styles.auditValue,
              { color: securityReport?.isLocked ? COLORS.error.main : COLORS.success.main }
            ]}>
              {securityReport?.isLocked ? 'Yes' : 'No'}
            </Text>
          </View>

          <View style={styles.auditItem}>
            <Text style={styles.auditLabel}>Security Events</Text>
            <Text style={styles.auditValue}>{securityReport?.eventCount || 0}</Text>
          </View>

          <View style={styles.auditItem}>
            <Text style={styles.auditLabel}>Last Activity</Text>
            <Text style={styles.auditValue}>
              {securityReport?.lastActivity 
                ? new Date(securityReport.lastActivity).toLocaleString()
                : 'No activity'
              }
            </Text>
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Data Access Logs</Text>
          
          {accessLogs.length > 0 ? (
            accessLogs.map((log: any, index: number) => (
              <View key={index} style={styles.logItem}>
                <View style={styles.logHeader}>
                  <Text style={styles.logAction}>{log.action}</Text>
                  <Text style={styles.logType}>{log.dataType}</Text>
                  <Text style={styles.logTime}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
                <Text style={styles.logData}>
                  Data ID: {log.dataId} | Classification: {log.classification}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No access logs available</Text>
          )}
        </Card>
      </ScrollView>
    );
  };

  const renderData = () => {
    const handleExportData = async () => {
      try {
        const exportId = await dataProtectionService.requestDataExport(
          ['ACADEMIC', 'PERSONAL', 'BEHAVIORAL'],
          'JSON'
        );
        Alert.alert('Success', `Data export requested. Request ID: ${exportId}`);
      } catch (error) {
        Alert.alert('Error', 'Failed to request data export');
      }
    };

    const handleDeleteAllData = async () => {
      Alert.alert(
        'Delete All Data',
        'This will permanently delete all your personal data. This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await dataProtectionService.deleteAllPersonalData();
                await loadSecurityData();
                Alert.alert('Success', 'All personal data has been deleted');
              } catch (error) {
                Alert.alert('Error', 'Failed to delete personal data');
              }
            },
          },
        ]
      );
    };

    return (
      <ScrollView style={styles.tabContent}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Data Overview</Text>
          
          <View style={styles.dataStats}>
            <View style={styles.dataStatItem}>
              <Text style={styles.dataStatLabel}>Total Data Items</Text>
              <Text style={styles.dataStatValue}>
                {dataProtectionReport?.totalDataItems || 0}
              </Text>
            </View>
            
            <View style={styles.dataStatItem}>
              <Text style={styles.dataStatLabel}>Access Logs</Text>
              <Text style={styles.dataStatValue}>
                {dataProtectionReport?.accessLogCount || 0}
              </Text>
            </View>
          </View>

          <Text style={styles.dataSubtitle}>Data by Type</Text>
          {dataProtectionReport?.dataByType &&
            Object.entries(dataProtectionReport.dataByType).map(([type, count]) => (
              <View key={type} style={styles.dataTypeItem}>
                <Text style={styles.dataTypeLabel}>{type}</Text>
                <Text style={styles.dataTypeCount}>{count as number}</Text>
              </View>
            ))}
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Data Rights</Text>
          
          <Button
            title="Export My Data"
            onPress={handleExportData}
            style={styles.dataButton}
            icon="download"
          />

          <Button
            title="Delete All My Data"
            variant="outline"
            onPress={handleDeleteAllData}
            style={styles.dataButton}
            icon="trash"
          />
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Consent Settings</Text>
          
          {dataProtectionReport?.consentStatus && (
            <View style={styles.consentList}>
              {Object.entries(dataProtectionReport.consentStatus).map(([key, value]) => (
                <View key={key} style={styles.consentItem}>
                  <Text style={styles.consentLabel}>{key}</Text>
                  <Text style={[
                    styles.consentValue,
                    { color: value ? COLORS.success.main : COLORS.error.main }
                  ]}>
                    {value ? 'Granted' : 'Denied'}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>
    );
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'LOGIN':
        return 'log-in';
      case 'LOGOUT':
        return 'log-out';
      case 'FAILED_LOGIN':
        return 'alert-circle';
      case 'SECURITY_VIOLATION':
        return 'warning';
      case 'DATA_ACCESS':
        return 'database';
      default:
        return 'information-circle';
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'LOGIN':
        return COLORS.success.main;
      case 'LOGOUT':
        return COLORS.info.main;
      case 'FAILED_LOGIN':
        return COLORS.warning.main;
      case 'SECURITY_VIOLATION':
        return COLORS.error.main;
      case 'DATA_ACCESS':
        return COLORS.primary[600];
      default:
        return COLORS.grey[500];
    }
  };

  const renderTabs = () => (
    <View style={styles.tabBar}>
      {[
        { key: 'overview', label: 'Overview', icon: 'shield' },
        { key: 'settings', label: 'Settings', icon: 'settings' },
        { key: 'audit', label: 'Audit', icon: 'document-text' },
        { key: 'data', label: 'Data', icon: 'database' },
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
      case 'settings':
        return renderSettings();
      case 'audit':
        return renderAudit();
      case 'data':
        return renderData();
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
          <Text style={styles.title}>Security Dashboard</Text>
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
  scoreCard: {
    marginBottom: 16,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  scoreDisplay: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
  },
  scoreLevel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  scoreBar: {
    height: 8,
    backgroundColor: COLORS.grey[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreProgress: {
    height: '100%',
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
  },
  statIcon: {
    marginBottom: 8,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: 8,
    flex: 1,
  },
  eventItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: COLORS.grey[50],
    borderRadius: 8,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventType: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: 8,
  },
  eventTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginLeft: 'auto',
  },
  eventMetadata: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
  },
  deviceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  deviceLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
  },
  deviceActions: {
    alignItems: 'center',
  },
  deviceButton: {
    alignSelf: 'stretch',
  },
  sessionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sessionLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
  },
  sessionValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  sessionButton: {
    alignSelf: 'stretch',
  },
  auditItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  auditLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  auditValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  logItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: COLORS.grey[50],
    borderRadius: 8,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  logAction: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  logType: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: 8,
  },
  logTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginLeft: 'auto',
  },
  logData: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
  },
  dataStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dataStatItem: {
    alignItems: 'center',
  },
  dataStatLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  dataStatValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  dataSubtitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  dataTypeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dataTypeLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  dataTypeCount: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  dataButton: {
    alignSelf: 'stretch',
    marginBottom: 12,
  },
  consentList: {
    marginTop: 8,
  },
  consentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  consentLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  consentValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  noDataText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
});

export default SecurityDashboard;