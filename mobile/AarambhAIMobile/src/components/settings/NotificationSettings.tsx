import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Switch } from 'react-native-switch';
import { Ionicons } from '@expo/vector-icons';
import { 
  useNotificationSettings, 
  useNotificationPermissions,
  useNotificationHistory 
} from '../../hooks/useNotifications';
import { COLORS, FONT_SIZES, DIMENSIONS } from '../../constants';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { TimePicker } from '../common/TimePicker';
import { Badge } from '../common/Badge';

export const NotificationSettings: React.FC = () => {
  const {
    settings,
    isLoading,
    error,
    toggleNotifications,
    toggleStudyReminders,
    toggleAIResponses,
    toggleCourseUpdates,
    toggleAchievements,
    toggleWeeklyReports,
    toggleDailyGoals,
    toggleSessionBreaks,
    toggleSound,
    toggleVibration,
    toggleBadgeCount,
    updateQuietHours,
  } = useNotificationSettings();

  const {
    permissionStatus,
    hasPermission,
    requestPermissions,
  } = useNotificationPermissions();

  const {
    scheduledNotifications,
    cancelAllNotifications,
  } = useNotificationHistory();

  const [showQuietHours, setShowQuietHours] = useState(false);
  const [showScheduled, setShowScheduled] = useState(false);

  const handlePermissionRequest = async () => {
    const granted = await requestPermissions();
    if (!granted) {
      Alert.alert(
        'Permission Required',
        'Notifications require permission to work properly. Please enable them in your device settings.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    if (enabled && !hasPermission) {
      await handlePermissionRequest();
      return;
    }
    await toggleNotifications(enabled);
  };

  const handleQuietHoursUpdate = async (startTime: string, endTime: string, enabled: boolean) => {
    await updateQuietHours({
      enabled,
      startTime,
      endTime,
    });
    setShowQuietHours(false);
  };

  const handleCancelAllNotifications = () => {
    Alert.alert(
      'Cancel All Notifications',
      'Are you sure you want to cancel all scheduled notifications? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes, Cancel All', 
          style: 'destructive',
          onPress: cancelAllNotifications
        },
      ]
    );
  };

  const renderPermissionStatus = () => (
    <Card variant="elevated" style={styles.permissionCard}>
      <View style={styles.permissionHeader}>
        <Ionicons 
          name={hasPermission ? 'checkmark-circle' : 'alert-circle'} 
          size={24} 
          color={hasPermission ? COLORS.success.main : COLORS.warning.main} 
        />
        <Text style={styles.permissionTitle}>
          {hasPermission ? 'Notifications Enabled' : 'Permission Required'}
        </Text>
      </View>
      
      {!hasPermission && (
        <>
          <Text style={styles.permissionDescription}>
            Enable notifications to receive study reminders, AI responses, and important updates.
          </Text>
          <Button
            title="Enable Notifications"
            onPress={handlePermissionRequest}
            style={styles.permissionButton}
            icon="notifications-outline"
          />
        </>
      )}
      
      {hasPermission && (
        <Text style={styles.permissionDescription}>
          You can customize your notification preferences below.
        </Text>
      )}
    </Card>
  );

  const renderSettingItem = (
    title: string,
    description: string,
    value: boolean,
    onToggle: (value: boolean) => Promise<void>,
    icon: string,
    disabled?: boolean
  ) => (
    <View style={[styles.settingItem, disabled && styles.settingItemDisabled]}>
      <View style={styles.settingContent}>
        <View style={styles.settingHeader}>
          <Ionicons name={icon as any} size={20} color={COLORS.primary[600]} />
          <Text style={styles.settingTitle}>{title}</Text>
        </View>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      
      <Switch
        value={value && !disabled}
        onValueChange={onToggle}
        disabled={disabled || isLoading}
        trackColor={{
          false: COLORS.grey[300],
          true: COLORS.primary[200],
        }}
        thumbColor={value ? COLORS.primary[600] : COLORS.grey[500]}
        ios_backgroundColor={COLORS.grey[300]}
      />
    </View>
  );

  const renderQuietHoursModal = () => (
    <Modal
      visible={showQuietHours}
      onClose={() => setShowQuietHours(false)}
      title="Quiet Hours"
      position="center"
    >
      <View style={styles.modalContent}>
        <Text style={styles.modalDescription}>
          Set times when you don't want to receive notifications.
        </Text>
        
        <View style={styles.quietHoursForm}>
          <View style={styles.timePickerRow}>
            <Text style={styles.timeLabel}>Start Time:</Text>
            <TimePicker
              value={settings.quietHours.startTime}
              onChange={(time) => {
                // Update start time logic here
              }}
            />
          </View>
          
          <View style={styles.timePickerRow}>
            <Text style={styles.timeLabel}>End Time:</Text>
            <TimePicker
              value={settings.quietHours.endTime}
              onChange={(time) => {
                // Update end time logic here
              }}
            />
          </View>
          
          <View style={styles.quietHoursToggle}>
            <Text style={styles.timeLabel}>Enable Quiet Hours:</Text>
            <Switch
              value={settings.quietHours.enabled}
              onValueChange={(enabled) => 
                handleQuietHoursUpdate(
                  settings.quietHours.startTime,
                  settings.quietHours.endTime,
                  enabled
                )
              }
              trackColor={{
                false: COLORS.grey[300],
                true: COLORS.primary[200],
              }}
              thumbColor={settings.quietHours.enabled ? COLORS.primary[600] : COLORS.grey[500]}
            />
          </View>
        </View>
        
        <View style={styles.modalActions}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => setShowQuietHours(false)}
            style={styles.modalButton}
          />
          <Button
            title="Save"
            onPress={() => setShowQuietHours(false)}
            style={styles.modalButton}
          />
        </View>
      </View>
    </Modal>
  );

  const renderScheduledModal = () => (
    <Modal
      visible={showScheduled}
      onClose={() => setShowScheduled(false)}
      title="Scheduled Notifications"
      position="center"
    >
      <View style={styles.modalContent}>
        <View style={styles.scheduledHeader}>
          <Text style={styles.scheduledCount}>
            {scheduledNotifications.length} scheduled notifications
          </Text>
          {scheduledNotifications.length > 0 && (
            <Button
              title="Cancel All"
              variant="outline"
              size="small"
              onPress={handleCancelAllNotifications}
            />
          )}
        </View>
        
        <ScrollView style={styles.scheduledList}>
          {scheduledNotifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={48} color={COLORS.grey[400]} />
              <Text style={styles.emptyStateText}>No scheduled notifications</Text>
            </View>
          ) : (
            scheduledNotifications.map((notification, index) => (
              <View key={index} style={styles.scheduledItem}>
                <View style={styles.scheduledContent}>
                  <Text style={styles.scheduledTitle}>
                    {notification.content?.title || 'Notification'}
                  </Text>
                  <Text style={styles.scheduledBody}>
                    {notification.content?.body || 'No description'}
                  </Text>
                  <Text style={styles.scheduledTrigger}>
                    {notification.trigger ? 'Scheduled' : 'Immediate'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );

  const isDisabled = !hasPermission || !settings.enabled;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderPermissionStatus()}
      
      {error && (
        <Card variant="outlined" style={styles.errorCard}>
          <View style={styles.errorContent}>
            <Ionicons name="alert-circle" size={20} color={COLORS.error.main} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </Card>
      )}

      <Card variant="elevated" style={styles.settingsCard}>
        <Text style={styles.sectionTitle}>General Settings</Text>
        
        {renderSettingItem(
          'Enable Notifications',
          'Turn on/off all notifications',
          settings.enabled,
          handleToggleNotifications,
          'notifications-outline'
        )}
        
        {renderSettingItem(
          'Sound',
          'Play sound for notifications',
          settings.sound,
          toggleSound,
          'volume-high-outline',
          isDisabled
        )}
        
        {renderSettingItem(
          'Vibration',
          'Vibrate device for notifications',
          settings.vibration,
          toggleVibration,
          'phone-portrait-outline',
          isDisabled || Platform.OS === 'ios'
        )}
        
        {renderSettingItem(
          'Badge Count',
          'Show notification count on app icon',
          settings.badgeCount,
          toggleBadgeCount,
          'ellipse-outline',
          isDisabled
        )}
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <View style={styles.settingHeader}>
              <Ionicons name="moon-outline" size={20} color={COLORS.primary[600]} />
              <Text style={styles.settingTitle}>Quiet Hours</Text>
            </View>
            <Text style={styles.settingDescription}>
              {settings.quietHours.enabled 
                ? `${settings.quietHours.startTime} - ${settings.quietHours.endTime}`
                : 'Set times to silence notifications'
              }
            </Text>
          </View>
          
          <Button
            title="Configure"
            variant="outline"
            size="small"
            onPress={() => setShowQuietHours(true)}
            disabled={isDisabled}
          />
        </View>
      </Card>

      <Card variant="elevated" style={styles.settingsCard}>
        <Text style={styles.sectionTitle}>Notification Types</Text>
        
        {renderSettingItem(
          'Study Reminders',
          'Reminders for scheduled study sessions',
          settings.studyReminders,
          toggleStudyReminders,
          'book-outline',
          isDisabled
        )}
        
        {renderSettingItem(
          'AI Responses',
          'Notifications when AI agents respond',
          settings.aiResponses,
          toggleAIResponses,
          'chatbubble-outline',
          isDisabled
        )}
        
        {renderSettingItem(
          'Course Updates',
          'Updates about courses and content',
          settings.courseUpdates,
          toggleCourseUpdates,
          'school-outline',
          isDisabled
        )}
        
        {renderSettingItem(
          'Achievements',
          'Achievement unlocks and milestones',
          settings.achievements,
          toggleAchievements,
          'trophy-outline',
          isDisabled
        )}
        
        {renderSettingItem(
          'Weekly Reports',
          'Weekly progress summaries',
          settings.weeklyReports,
          toggleWeeklyReports,
          'bar-chart-outline',
          isDisabled
        )}
        
        {renderSettingItem(
          'Daily Goals',
          'Daily goal check-ins and reminders',
          settings.dailyGoals,
          toggleDailyGoals,
          'target-outline',
          isDisabled
        )}
        
        {renderSettingItem(
          'Session Breaks',
          'Break reminders during study sessions',
          settings.sessionBreaks,
          toggleSessionBreaks,
          'time-outline',
          isDisabled
        )}
      </Card>

      <Card variant="elevated" style={styles.settingsCard}>
        <Text style={styles.sectionTitle}>Notification Management</Text>
        
        <View style={styles.managementItem}>
          <View style={styles.managementContent}>
            <View style={styles.managementHeader}>
              <Ionicons name="list-outline" size={20} color={COLORS.primary[600]} />
              <Text style={styles.managementTitle}>Scheduled Notifications</Text>
              {scheduledNotifications.length > 0 && (
                <Badge 
                  text={scheduledNotifications.length.toString()} 
                  variant="primary" 
                  size="small" 
                />
              )}
            </View>
            <Text style={styles.managementDescription}>
              View and manage scheduled notifications
            </Text>
          </View>
          
          <Button
            title="View"
            variant="outline"
            size="small"
            onPress={() => setShowScheduled(true)}
          />
        </View>
      </Card>

      {renderQuietHoursModal()}
      {renderScheduledModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.main,
    padding: 16,
  },
  permissionCard: {
    marginBottom: 16,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  permissionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: 12,
  },
  permissionDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  permissionButton: {
    alignSelf: 'flex-start',
  },
  errorCard: {
    marginBottom: 16,
    borderColor: COLORS.error.light,
    backgroundColor: COLORS.error.light,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error.dark,
    marginLeft: 8,
    flex: 1,
  },
  settingsCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
  },
  settingItemDisabled: {
    opacity: 0.5,
  },
  settingContent: {
    flex: 1,
    marginRight: 12,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  settingTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginLeft: 8,
  },
  settingDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  managementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  managementContent: {
    flex: 1,
    marginRight: 12,
  },
  managementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  managementTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginLeft: 8,
    marginRight: 8,
  },
  managementDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  modalContent: {
    padding: 16,
  },
  modalDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  quietHoursForm: {
    marginBottom: 20,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  quietHoursToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  scheduledHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  scheduledCount: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  scheduledList: {
    maxHeight: 300,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    marginTop: 12,
  },
  scheduledItem: {
    padding: 12,
    backgroundColor: COLORS.background.light,
    borderRadius: DIMENSIONS.BORDER_RADIUS,
    marginBottom: 8,
  },
  scheduledContent: {
    flex: 1,
  },
  scheduledTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  scheduledBody: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  scheduledTrigger: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary[600],
    fontWeight: '500',
  },
});

export default NotificationSettings;