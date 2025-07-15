import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStudyReminders } from '../../hooks/useNotifications';
import { StudyReminderConfig } from '../../services/notifications';
import { COLORS, FONT_SIZES, DIMENSIONS } from '../../constants';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Switch } from 'react-native-switch';
import { Checkbox } from '../common/Checkbox';
import { TextInput } from '../common/TextInput';
import { TimePicker } from '../common/TimePicker';

interface StudyReminderSetupProps {
  visible: boolean;
  onClose: () => void;
  initialConfig?: StudyReminderConfig;
  onSave?: (config: StudyReminderConfig) => void;
}

const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Hindi',
  'History',
  'Geography',
  'Computer Science',
  'Economics',
  'Political Science',
  'Psychology',
];

const WEEKDAYS = [
  { id: 1, name: 'Monday', short: 'Mon' },
  { id: 2, name: 'Tuesday', short: 'Tue' },
  { id: 3, name: 'Wednesday', short: 'Wed' },
  { id: 4, name: 'Thursday', short: 'Thu' },
  { id: 5, name: 'Friday', short: 'Fri' },
  { id: 6, name: 'Saturday', short: 'Sat' },
  { id: 0, name: 'Sunday', short: 'Sun' },
];

const DEFAULT_TIMES = ['09:00', '15:00', '20:00'];

export const StudyReminderSetup: React.FC<StudyReminderSetupProps> = ({
  visible,
  onClose,
  initialConfig,
  onSave,
}) => {
  const { scheduleReminders, cancelReminders, isLoading, error } = useStudyReminders();

  const [config, setConfig] = useState<StudyReminderConfig>(
    initialConfig || {
      enabled: true,
      subjects: ['Mathematics'],
      times: ['20:00'],
      days: [1, 2, 3, 4, 5], // Weekdays
      customMessage: '',
    }
  );

  const [showTimeEditor, setShowTimeEditor] = useState(false);
  const [editingTimeIndex, setEditingTimeIndex] = useState<number | null>(null);
  const [newTime, setNewTime] = useState('09:00');

  const handleSave = async () => {
    if (config.subjects.length === 0) {
      Alert.alert('Error', 'Please select at least one subject.');
      return;
    }

    if (config.times.length === 0) {
      Alert.alert('Error', 'Please add at least one reminder time.');
      return;
    }

    if (config.days.length === 0) {
      Alert.alert('Error', 'Please select at least one day.');
      return;
    }

    try {
      if (config.enabled) {
        await scheduleReminders(config);
      } else {
        await cancelReminders();
      }

      onSave?.(config);
      onClose();
      
      Alert.alert(
        'Success',
        config.enabled 
          ? 'Study reminders have been scheduled successfully!'
          : 'Study reminders have been disabled.'
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to save reminder settings. Please try again.');
    }
  };

  const toggleSubject = (subject: string) => {
    setConfig(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const toggleDay = (dayId: number) => {
    setConfig(prev => ({
      ...prev,
      days: prev.days.includes(dayId)
        ? prev.days.filter(d => d !== dayId)
        : [...prev.days, dayId]
    }));
  };

  const addTime = () => {
    setEditingTimeIndex(null);
    setNewTime('09:00');
    setShowTimeEditor(true);
  };

  const editTime = (index: number) => {
    setEditingTimeIndex(index);
    setNewTime(config.times[index]);
    setShowTimeEditor(true);
  };

  const saveTime = () => {
    if (editingTimeIndex !== null) {
      // Edit existing time
      setConfig(prev => ({
        ...prev,
        times: prev.times.map((time, index) => 
          index === editingTimeIndex ? newTime : time
        )
      }));
    } else {
      // Add new time
      if (!config.times.includes(newTime)) {
        setConfig(prev => ({
          ...prev,
          times: [...prev.times, newTime].sort()
        }));
      }
    }
    setShowTimeEditor(false);
  };

  const removeTime = (index: number) => {
    setConfig(prev => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index)
    }));
  };

  const setQuickDays = (preset: 'weekdays' | 'weekends' | 'all') => {
    let days: number[];
    switch (preset) {
      case 'weekdays':
        days = [1, 2, 3, 4, 5];
        break;
      case 'weekends':
        days = [0, 6];
        break;
      case 'all':
        days = [0, 1, 2, 3, 4, 5, 6];
        break;
    }
    setConfig(prev => ({ ...prev, days }));
  };

  const setQuickTimes = (preset: 'morning' | 'afternoon' | 'evening' | 'all') => {
    let times: string[];
    switch (preset) {
      case 'morning':
        times = ['08:00', '09:00'];
        break;
      case 'afternoon':
        times = ['14:00', '15:00'];
        break;
      case 'evening':
        times = ['19:00', '20:00'];
        break;
      case 'all':
        times = DEFAULT_TIMES;
        break;
    }
    setConfig(prev => ({ ...prev, times }));
  };

  const renderTimeEditor = () => (
    <Modal
      visible={showTimeEditor}
      onClose={() => setShowTimeEditor(false)}
      title={editingTimeIndex !== null ? 'Edit Time' : 'Add Time'}
      position="center"
    >
      <View style={styles.timeEditorContent}>
        <TimePicker
          value={newTime}
          onChange={setNewTime}
        />
        
        <View style={styles.timeEditorActions}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => setShowTimeEditor(false)}
            style={styles.timeEditorButton}
          />
          <Button
            title="Save"
            onPress={saveTime}
            style={styles.timeEditorButton}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Study Reminders"
      position="fullscreen"
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {error && (
          <Card variant="outlined" style={styles.errorCard}>
            <View style={styles.errorContent}>
              <Ionicons name="alert-circle" size={20} color={COLORS.error.main} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          </Card>
        )}

        {/* Enable/Disable Toggle */}
        <Card variant="elevated" style={styles.card}>
          <View style={styles.enableSection}>
            <View style={styles.enableContent}>
              <Text style={styles.enableTitle}>Enable Study Reminders</Text>
              <Text style={styles.enableDescription}>
                Get notifications to remind you about your study sessions
              </Text>
            </View>
            <Switch
              value={config.enabled}
              onValueChange={(enabled) => setConfig(prev => ({ ...prev, enabled }))}
              trackColor={{
                false: COLORS.grey[300],
                true: COLORS.primary[200],
              }}
              thumbColor={config.enabled ? COLORS.primary[600] : COLORS.grey[500]}
            />
          </View>
        </Card>

        {config.enabled && (
          <>
            {/* Subject Selection */}
            <Card variant="elevated" style={styles.card}>
              <Text style={styles.sectionTitle}>Select Subjects</Text>
              <Text style={styles.sectionDescription}>
                Choose which subjects you want to receive reminders for
              </Text>
              
              <View style={styles.subjectGrid}>
                {SUBJECTS.map((subject) => (
                  <View key={subject} style={styles.subjectItem}>
                    <Checkbox
                      checked={config.subjects.includes(subject)}
                      onPress={() => toggleSubject(subject)}
                      label={subject}
                    />
                  </View>
                ))}
              </View>
            </Card>

            {/* Time Selection */}
            <Card variant="elevated" style={styles.card}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Reminder Times</Text>
                  <Text style={styles.sectionDescription}>
                    Set when you want to receive study reminders
                  </Text>
                </View>
                <Button
                  title="Add Time"
                  variant="outline"
                  size="small"
                  onPress={addTime}
                  icon="add"
                />
              </View>

              {/* Quick Time Presets */}
              <View style={styles.quickPresets}>
                <Text style={styles.presetsLabel}>Quick presets:</Text>
                <View style={styles.presetsRow}>
                  <Button
                    title="Morning"
                    variant="outline"
                    size="small"
                    onPress={() => setQuickTimes('morning')}
                    style={styles.presetButton}
                  />
                  <Button
                    title="Afternoon"
                    variant="outline"
                    size="small"
                    onPress={() => setQuickTimes('afternoon')}
                    style={styles.presetButton}
                  />
                  <Button
                    title="Evening"
                    variant="outline"
                    size="small"
                    onPress={() => setQuickTimes('evening')}
                    style={styles.presetButton}
                  />
                  <Button
                    title="All Day"
                    variant="outline"
                    size="small"
                    onPress={() => setQuickTimes('all')}
                    style={styles.presetButton}
                  />
                </View>
              </View>
              
              <View style={styles.timesList}>
                {config.times.map((time, index) => (
                  <View key={`${time}-${index}`} style={styles.timeItem}>
                    <Text style={styles.timeText}>{time}</Text>
                    <View style={styles.timeActions}>
                      <Button
                        title=""
                        variant="ghost"
                        size="small"
                        icon="pencil"
                        onPress={() => editTime(index)}
                        style={styles.timeActionButton}
                      />
                      <Button
                        title=""
                        variant="ghost"
                        size="small"
                        icon="trash"
                        onPress={() => removeTime(index)}
                        style={styles.timeActionButton}
                      />
                    </View>
                  </View>
                ))}
                
                {config.times.length === 0 && (
                  <View style={styles.emptyState}>
                    <Ionicons name="time-outline" size={32} color={COLORS.grey[400]} />
                    <Text style={styles.emptyStateText}>No reminder times set</Text>
                  </View>
                )}
              </View>
            </Card>

            {/* Day Selection */}
            <Card variant="elevated" style={styles.card}>
              <Text style={styles.sectionTitle}>Days of Week</Text>
              <Text style={styles.sectionDescription}>
                Choose which days you want to receive reminders
              </Text>

              {/* Quick Day Presets */}
              <View style={styles.quickPresets}>
                <Text style={styles.presetsLabel}>Quick presets:</Text>
                <View style={styles.presetsRow}>
                  <Button
                    title="Weekdays"
                    variant="outline"
                    size="small"
                    onPress={() => setQuickDays('weekdays')}
                    style={styles.presetButton}
                  />
                  <Button
                    title="Weekends"
                    variant="outline"
                    size="small"
                    onPress={() => setQuickDays('weekends')}
                    style={styles.presetButton}
                  />
                  <Button
                    title="All Days"
                    variant="outline"
                    size="small"
                    onPress={() => setQuickDays('all')}
                    style={styles.presetButton}
                  />
                </View>
              </View>
              
              <View style={styles.daysGrid}>
                {WEEKDAYS.map((day) => (
                  <View key={day.id} style={styles.dayItem}>
                    <Checkbox
                      checked={config.days.includes(day.id)}
                      onPress={() => toggleDay(day.id)}
                      label={day.name}
                    />
                  </View>
                ))}
              </View>
            </Card>

            {/* Custom Message */}
            <Card variant="elevated" style={styles.card}>
              <Text style={styles.sectionTitle}>Custom Message (Optional)</Text>
              <Text style={styles.sectionDescription}>
                Personalize your reminder message
              </Text>
              
              <TextInput
                value={config.customMessage}
                onChangeText={(text) => setConfig(prev => ({ ...prev, customMessage: text }))}
                placeholder="e.g., Time to study! Let's achieve your goals today."
                multiline
                numberOfLines={3}
                style={styles.customMessageInput}
              />
            </Card>

            {/* Preview */}
            <Card variant="outlined" style={styles.previewCard}>
              <Text style={styles.previewTitle}>Preview</Text>
              <View style={styles.previewContent}>
                <View style={styles.previewItem}>
                  <Text style={styles.previewLabel}>Subjects:</Text>
                  <Text style={styles.previewValue}>
                    {config.subjects.join(', ') || 'None selected'}
                  </Text>
                </View>
                
                <View style={styles.previewItem}>
                  <Text style={styles.previewLabel}>Times:</Text>
                  <Text style={styles.previewValue}>
                    {config.times.join(', ') || 'None set'}
                  </Text>
                </View>
                
                <View style={styles.previewItem}>
                  <Text style={styles.previewLabel}>Days:</Text>
                  <Text style={styles.previewValue}>
                    {config.days.map(id => WEEKDAYS.find(d => d.id === id)?.short).join(', ') || 'None selected'}
                  </Text>
                </View>
                
                {config.customMessage && (
                  <View style={styles.previewItem}>
                    <Text style={styles.previewLabel}>Message:</Text>
                    <Text style={styles.previewValue}>{config.customMessage}</Text>
                  </View>
                )}
              </View>
            </Card>
          </>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={onClose}
            style={styles.actionButton}
            disabled={isLoading}
          />
          <Button
            title="Save Reminders"
            onPress={handleSave}
            style={styles.actionButton}
            loading={isLoading}
            disabled={!config.enabled && config.subjects.length === 0}
          />
        </View>
      </ScrollView>

      {renderTimeEditor()}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.main,
    padding: 16,
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
  card: {
    marginBottom: 16,
  },
  enableSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  enableContent: {
    flex: 1,
    marginRight: 12,
  },
  enableTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  enableDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  subjectItem: {
    width: '48%',
  },
  quickPresets: {
    marginBottom: 16,
  },
  presetsLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    minWidth: 80,
  },
  timesList: {
    gap: 8,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background.light,
    padding: 12,
    borderRadius: DIMENSIONS.BORDER_RADIUS,
  },
  timeText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  timeActions: {
    flexDirection: 'row',
    gap: 4,
  },
  timeActionButton: {
    width: 36,
    height: 36,
  },
  daysGrid: {
    gap: 8,
  },
  dayItem: {
    width: '100%',
  },
  customMessageInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  previewCard: {
    backgroundColor: COLORS.primary.light,
    borderColor: COLORS.primary[200],
  },
  previewTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary[800],
    marginBottom: 12,
  },
  previewContent: {
    gap: 8,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  previewLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.primary[700],
    width: 80,
  },
  previewValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary[800],
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 20,
  },
  actionButton: {
    flex: 1,
  },
  timeEditorContent: {
    padding: 16,
  },
  timeEditorActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  timeEditorButton: {
    flex: 1,
  },
});

export default StudyReminderSetup;