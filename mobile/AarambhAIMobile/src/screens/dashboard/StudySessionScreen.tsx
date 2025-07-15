import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  AppState,
  BackHandler,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, Button, Modal } from '../../components/common';
import { COLORS, FONT_SIZES, DIMENSIONS, SUBJECTS } from '../../constants';

interface StudySession {
  id: string;
  subject: string;
  topic?: string;
  startTime: Date;
  duration: number; // in seconds
  isActive: boolean;
  breaks: {
    startTime: Date;
    duration: number;
  }[];
  totalStudyTime: number; // excluding breaks
  goal?: number; // target duration in minutes
}

interface SessionStats {
  totalTime: number;
  studyTime: number;
  breakTime: number;
  efficiency: number;
}

const StudySessionScreen: React.FC = () => {
  const navigation = useNavigation();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalTime: 0,
    studyTime: 0,
    breakTime: 0,
    efficiency: 0
  });
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [showStartSessionModal, setShowStartSessionModal] = useState(false);
  const [sessionSettings, setSessionSettings] = useState({
    subject: '',
    topic: '',
    goal: 60, // minutes
    breakReminders: true,
    focusMode: false
  });

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' && currentSession?.isActive) {
        // Optionally pause session or show notification
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [currentSession]);

  // Handle back button during active session
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (currentSession?.isActive) {
          Alert.alert(
            'Active Session',
            'You have an active study session. Do you want to end it?',
            [
              { text: 'Continue Session', style: 'cancel' },
              { text: 'End Session', onPress: endSession }
            ]
          );
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [currentSession])
  );

  // Timer effect
  useEffect(() => {
    if (currentSession?.isActive && !isOnBreak) {
      intervalRef.current = setInterval(() => {
        setCurrentSession(prev => {
          if (!prev) return null;
          
          const newDuration = prev.duration + 1;
          const newStudyTime = prev.totalStudyTime + 1;
          
          // Update stats
          const totalBreakTime = prev.breaks.reduce((sum, brk) => sum + brk.duration, 0);
          setSessionStats({
            totalTime: newDuration,
            studyTime: newStudyTime,
            breakTime: totalBreakTime,
            efficiency: Math.round((newStudyTime / newDuration) * 100)
          });

          // Check for break reminders (every 25 minutes of study)
          if (sessionSettings.breakReminders && newStudyTime > 0 && newStudyTime % (25 * 60) === 0) {
            showBreakReminder();
          }

          return {
            ...prev,
            duration: newDuration,
            totalStudyTime: newStudyTime
          };
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentSession?.isActive, isOnBreak, sessionSettings.breakReminders]);

  const startSession = () => {
    if (!sessionSettings.subject.trim()) {
      Alert.alert('Error', 'Please select a subject before starting');
      return;
    }

    const newSession: StudySession = {
      id: Date.now().toString(),
      subject: sessionSettings.subject,
      topic: sessionSettings.topic,
      startTime: new Date(),
      duration: 0,
      isActive: true,
      breaks: [],
      totalStudyTime: 0,
      goal: sessionSettings.goal
    };

    setCurrentSession(newSession);
    setShowStartSessionModal(false);
    
    if (sessionSettings.focusMode) {
      // Could implement focus mode features like blocking notifications
    }
  };

  const pauseSession = () => {
    if (!currentSession) return;
    
    setCurrentSession(prev => prev ? { ...prev, isActive: false } : null);
  };

  const resumeSession = () => {
    if (!currentSession) return;
    
    setCurrentSession(prev => prev ? { ...prev, isActive: true } : null);
  };

  const startBreak = () => {
    if (!currentSession) return;

    const breakStart = new Date();
    setIsOnBreak(true);
    setCurrentSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        breaks: [...prev.breaks, { startTime: breakStart, duration: 0 }]
      };
    });
  };

  const endBreak = () => {
    setIsOnBreak(false);
    setCurrentSession(prev => {
      if (!prev || prev.breaks.length === 0) return prev;
      
      const lastBreakIndex = prev.breaks.length - 1;
      const updatedBreaks = [...prev.breaks];
      const breakDuration = Math.floor((Date.now() - prev.breaks[lastBreakIndex].startTime.getTime()) / 1000);
      updatedBreaks[lastBreakIndex] = {
        ...updatedBreaks[lastBreakIndex],
        duration: breakDuration
      };

      return {
        ...prev,
        breaks: updatedBreaks
      };
    });
  };

  const endSession = () => {
    if (!currentSession) return;

    setShowEndSessionModal(true);
  };

  const confirmEndSession = () => {
    if (!currentSession) return;

    // Save session data
    const finalSession = {
      ...currentSession,
      isActive: false,
      endTime: new Date()
    };

    // Could save to storage or send to backend
    console.log('Session completed:', finalSession);

    // Reset state
    setCurrentSession(null);
    setSessionStats({ totalTime: 0, studyTime: 0, breakTime: 0, efficiency: 0 });
    setIsOnBreak(false);
    setShowEndSessionModal(false);

    // Show completion message
    Alert.alert(
      'Session Complete!',
      `Great job! You studied for ${formatTime(finalSession.totalStudyTime)}.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const showBreakReminder = () => {
    Alert.alert(
      'Take a Break',
      'You\'ve been studying for 25 minutes. Consider taking a 5-minute break.',
      [
        { text: 'Continue', style: 'cancel' },
        { text: 'Start Break', onPress: startBreak }
      ]
    );
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    if (!currentSession?.goal) return 0;
    const goalSeconds = currentSession.goal * 60;
    return Math.min(100, (currentSession.totalStudyTime / goalSeconds) * 100);
  };

  const renderActiveSession = () => (
    <View style={styles.activeSessionContainer}>
      <Card variant="elevated" style={styles.timerCard}>
        <View style={styles.timerHeader}>
          <Text style={styles.subjectText}>{currentSession?.subject}</Text>
          {currentSession?.topic && (
            <Text style={styles.topicText}>{currentSession.topic}</Text>
          )}
          <Badge 
            text={isOnBreak ? 'On Break' : currentSession?.isActive ? 'Active' : 'Paused'} 
            variant={isOnBreak ? 'warning' : currentSession?.isActive ? 'success' : 'error'} 
            size="small" 
          />
        </View>

        <View style={styles.timerDisplay}>
          <Text style={styles.timerText}>
            {formatTime(isOnBreak ? 
              (currentSession?.breaks[currentSession.breaks.length - 1]?.duration || 0) : 
              currentSession?.totalStudyTime || 0
            )}
          </Text>
          <Text style={styles.timerLabel}>
            {isOnBreak ? 'Break Time' : 'Study Time'}
          </Text>
        </View>

        {currentSession?.goal && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${getProgressPercentage()}%` }]} 
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(getProgressPercentage())}% of {currentSession.goal}min goal
            </Text>
          </View>
        )}

        <View style={styles.sessionControls}>
          {isOnBreak ? (
            <Button
              title="End Break"
              onPress={endBreak}
              icon="play-outline"
              style={styles.controlButton}
            />
          ) : (
            <>
              {currentSession?.isActive ? (
                <Button
                  title="Pause"
                  onPress={pauseSession}
                  variant="outline"
                  icon="pause-outline"
                  style={styles.controlButton}
                />
              ) : (
                <Button
                  title="Resume"
                  onPress={resumeSession}
                  icon="play-outline"
                  style={styles.controlButton}
                />
              )}
              
              <Button
                title="Break"
                onPress={startBreak}
                variant="outline"
                icon="cafe-outline"
                style={styles.controlButton}
              />
            </>
          )}
          
          <Button
            title="End Session"
            onPress={endSession}
            variant="outline"
            icon="stop-outline"
            style={[styles.controlButton, styles.endButton]}
          />
        </View>
      </Card>

      <Card variant="elevated" style={styles.statsCard}>
        <Text style={styles.statsTitle}>Session Stats</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatTime(sessionStats.totalTime)}</Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatTime(sessionStats.studyTime)}</Text>
            <Text style={styles.statLabel}>Study Time</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatTime(sessionStats.breakTime)}</Text>
            <Text style={styles.statLabel}>Break Time</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{sessionStats.efficiency}%</Text>
            <Text style={styles.statLabel}>Efficiency</Text>
          </View>
        </View>
      </Card>
    </View>
  );

  const renderStartSessionModal = () => (
    <Modal
      visible={showStartSessionModal}
      onClose={() => setShowStartSessionModal(false)}
      title="Start Study Session"
      position="bottom"
    >
      <ScrollView style={styles.modalContent}>
        <View style={styles.settingSection}>
          <Text style={styles.settingLabel}>Subject *</Text>
          <View style={styles.subjectsList}>
            {SUBJECTS.slice(0, 8).map((subject) => (
              <TouchableOpacity
                key={subject}
                style={[
                  styles.subjectButton,
                  sessionSettings.subject === subject && styles.subjectButtonSelected
                ]}
                onPress={() => setSessionSettings(prev => ({ ...prev, subject }))}
              >
                <Text style={[
                  styles.subjectButtonText,
                  sessionSettings.subject === subject && styles.subjectButtonTextSelected
                ]}>
                  {subject}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.settingSection}>
          <Text style={styles.settingLabel}>Study Goal (minutes)</Text>
          <View style={styles.goalContainer}>
            <TouchableOpacity
              style={styles.goalButton}
              onPress={() => setSessionSettings(prev => ({ 
                ...prev, 
                goal: Math.max(15, prev.goal - 15) 
              }))}
            >
              <Ionicons name="remove" size={20} color={COLORS.primary[600]} />
            </TouchableOpacity>
            
            <Text style={styles.goalText}>{sessionSettings.goal} min</Text>
            
            <TouchableOpacity
              style={styles.goalButton}
              onPress={() => setSessionSettings(prev => ({ 
                ...prev, 
                goal: Math.min(180, prev.goal + 15) 
              }))}
            >
              <Ionicons name="add" size={20} color={COLORS.primary[600]} />
            </TouchableOpacity>
          </View>
        </View>

        <Button
          title="Start Session"
          onPress={startSession}
          fullWidth
          disabled={!sessionSettings.subject}
          style={styles.startButton}
        />
      </ScrollView>
    </Modal>
  );

  const renderEndSessionModal = () => (
    <Modal
      visible={showEndSessionModal}
      onClose={() => setShowEndSessionModal(false)}
      title="End Study Session"
      position="center"
    >
      <View style={styles.endModalContent}>
        <Text style={styles.endModalText}>
          Are you sure you want to end this study session?
        </Text>
        
        <Text style={styles.sessionSummary}>
          Study Time: {formatTime(currentSession?.totalStudyTime || 0)}
        </Text>

        <View style={styles.endModalActions}>
          <Button
            title="Continue"
            onPress={() => setShowEndSessionModal(false)}
            variant="outline"
            style={styles.modalButton}
          />
          <Button
            title="End Session"
            onPress={confirmEndSession}
            style={styles.modalButton}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.background.light} />
        </TouchableOpacity>
        
        <Text style={styles.title}>Study Session</Text>
        
        <View style={styles.headerActions}>
          {currentSession && (
            <Badge 
              text="Active" 
              variant={currentSession.isActive ? "success" : "warning"} 
              size="small" 
            />
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
        {currentSession ? (
          renderActiveSession()
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons
                name="timer-outline"
                size={64}
                color={COLORS.grey[400]}
              />
            </View>
            <Text style={styles.emptyTitle}>No Active Session</Text>
            <Text style={styles.emptySubtitle}>
              Start a focused study session to track your progress and stay motivated
            </Text>
            
            <Button
              title="Start Study Session"
              onPress={() => setShowStartSessionModal(true)}
              style={styles.startSessionButton}
              icon="play-outline"
            />
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      {renderStartSessionModal()}
      {renderEndSessionModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light,
  },
  header: {
    backgroundColor: COLORS.primary[600],
    paddingHorizontal: DIMENSIONS.SCREEN_PADDING,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: COLORS.grey[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.background.light,
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  headerActions: {
    width: 40,
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
    padding: DIMENSIONS.SCREEN_PADDING,
  },
  activeSessionContainer: {
    gap: 16,
  },
  timerCard: {
    padding: 24,
    alignItems: 'center',
  },
  timerHeader: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  subjectText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  topicText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 56,
    fontWeight: '300',
    color: COLORS.primary[600],
    fontFamily: 'monospace',
  },
  timerLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    marginTop: 8,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.grey[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary[600],
    borderRadius: 4,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  sessionControls: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  controlButton: {
    minWidth: 100,
  },
  endButton: {
    borderColor: COLORS.error.main,
  },
  statsCard: {
    padding: 16,
  },
  statsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.grey[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 32,
  },
  startSessionButton: {
    paddingHorizontal: 32,
  },
  modalContent: {
    maxHeight: 400,
  },
  settingSection: {
    marginBottom: 24,
  },
  settingLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  subjectsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: DIMENSIONS.BORDER_RADIUS,
    backgroundColor: COLORS.grey[100],
    borderWidth: 1,
    borderColor: COLORS.grey[200],
  },
  subjectButtonSelected: {
    backgroundColor: COLORS.primary[50],
    borderColor: COLORS.primary[600],
  },
  subjectButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  subjectButtonTextSelected: {
    color: COLORS.primary[600],
    fontWeight: '600',
  },
  goalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  goalButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary[50],
    borderWidth: 1,
    borderColor: COLORS.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    minWidth: 80,
    textAlign: 'center',
  },
  startButton: {
    marginTop: 16,
  },
  endModalContent: {
    padding: 16,
    alignItems: 'center',
  },
  endModalText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  sessionSummary: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.primary[600],
    marginBottom: 24,
  },
  endModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});

export default StudySessionScreen;