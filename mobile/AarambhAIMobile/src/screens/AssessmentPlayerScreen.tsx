import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  BackHandler,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { COLORS, FONT_SIZES, DIMENSIONS } from '../constants';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { Modal } from '../components/common/Modal';
import { useOfflineApi } from '../hooks/useOffline';

const { width } = Dimensions.get('window');

interface Question {
  id: string;
  type: 'multiple_choice' | 'single_choice' | 'true_false' | 'fill_blank' | 'numerical';
  question: string;
  options?: string[];
  correctAnswer: string | number | string[];
  explanation: string;
  marks: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  subject: string;
  topic: string;
  image?: string;
}

interface AssessmentSession {
  id: string;
  assessmentId: string;
  title: string;
  description: string;
  duration: number; // in minutes
  totalQuestions: number;
  totalMarks: number;
  questions: Question[];
  startTime: string;
  endTime?: string;
  timeRemaining: number; // in seconds
  currentQuestionIndex: number;
  answers: Record<string, any>;
  flaggedQuestions: Set<string>;
  isSubmitted: boolean;
  autoSubmit: boolean;
}

interface QuestionNavigationProps {
  questions: Question[];
  currentIndex: number;
  answers: Record<string, any>;
  flaggedQuestions: Set<string>;
  onQuestionSelect: (index: number) => void;
}

const QuestionNavigation: React.FC<QuestionNavigationProps> = ({
  questions,
  currentIndex,
  answers,
  flaggedQuestions,
  onQuestionSelect,
}) => {
  const getQuestionStatus = (index: number, questionId: string) => {
    const isAnswered = answers[questionId] !== undefined && answers[questionId] !== '';
    const isFlagged = flaggedQuestions.has(questionId);
    const isCurrent = index === currentIndex;

    if (isCurrent) {
      return isAnswered ? 'current-answered' : 'current';
    } else if (isAnswered && isFlagged) {
      return 'answered-flagged';
    } else if (isAnswered) {
      return 'answered';
    } else if (isFlagged) {
      return 'flagged';
    } else {
      return 'not-answered';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'current':
        return styles.navItemCurrent;
      case 'current-answered':
        return styles.navItemCurrentAnswered;
      case 'answered':
        return styles.navItemAnswered;
      case 'flagged':
        return styles.navItemFlagged;
      case 'answered-flagged':
        return styles.navItemAnsweredFlagged;
      default:
        return styles.navItemNotAnswered;
    }
  };

  return (
    <View style={styles.questionNavigation}>
      <Text style={styles.navigationTitle}>Question Navigation</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.navigationGrid}>
          {questions.map((question, index) => {
            const status = getQuestionStatus(index, question.id);
            return (
              <TouchableOpacity
                key={question.id}
                style={[styles.navItem, getStatusStyle(status)]}
                onPress={() => onQuestionSelect(index)}
              >
                <Text style={styles.navItemText}>{index + 1}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      
      <View style={styles.navigationLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendIndicator, styles.navItemAnswered]} />
          <Text style={styles.legendText}>Answered</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendIndicator, styles.navItemFlagged]} />
          <Text style={styles.legendText}>Flagged</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendIndicator, styles.navItemNotAnswered]} />
          <Text style={styles.legendText}>Not Answered</Text>
        </View>
      </View>
    </View>
  );
};

export const AssessmentPlayerScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { assessmentId, mode } = route.params as { assessmentId: string; mode: 'new' | 'resume' };
  const { startAssessment, saveAssessmentProgress, submitAssessment, isLoading } = useOfflineApi();

  const [session, setSession] = useState<AssessmentSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showNavigation, setShowNavigation] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadAssessment();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleBackPress();
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [session])
  );

  const loadAssessment = async () => {
    try {
      const response = await startAssessment(assessmentId, mode);
      if (response.data) {
        const sessionData = response.data;
        setSession(sessionData);
        setTimeRemaining(sessionData.timeRemaining);
        startTimer(sessionData.timeRemaining);
        startAutoSave();
      } else {
        // Mock session for development
        const mockSession = createMockSession();
        setSession(mockSession);
        setTimeRemaining(mockSession.timeRemaining);
        startTimer(mockSession.timeRemaining);
        startAutoSave();
      }
    } catch (error) {
      console.error('Failed to load assessment:', error);
      Alert.alert('Error', 'Failed to load assessment. Please try again.');
      navigation.goBack();
    }
  };

  const startTimer = (initialTime: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        
        // Show warning at 5 minutes
        if (newTime === 300 && !showTimeWarning) {
          setShowTimeWarning(true);
          Alert.alert(
            'Time Warning',
            'Only 5 minutes remaining! Please review your answers.',
            [{ text: 'OK', onPress: () => setShowTimeWarning(false) }]
          );
        }
        
        // Auto-submit when time is up
        if (newTime <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);
  };

  const startAutoSave = () => {
    if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    
    // Auto-save every 30 seconds
    autoSaveRef.current = setInterval(() => {
      saveProgress();
    }, 30000);
  };

  const saveProgress = async () => {
    if (!session) return;
    
    try {
      await saveAssessmentProgress(session.id, {
        currentQuestionIndex: session.currentQuestionIndex,
        answers: session.answers,
        flaggedQuestions: Array.from(session.flaggedQuestions),
        timeRemaining,
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const handleBackPress = () => {
    Alert.alert(
      'Exit Assessment',
      'Are you sure you want to exit? Your progress will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Exit', 
          onPress: () => {
            saveProgress();
            navigation.goBack();
          }
        }
      ]
    );
  };

  const handleAutoSubmit = async () => {
    Alert.alert(
      'Time Up!',
      'Assessment time has ended. Your answers will be submitted automatically.',
      [
        {
          text: 'OK',
          onPress: () => submitAssessmentAnswers(true)
        }
      ]
    );
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    if (!session) return;
    
    setSession(prev => prev ? {
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answer
      }
    } : null);
  };

  const handleFlagQuestion = (questionId: string) => {
    if (!session) return;
    
    setSession(prev => {
      if (!prev) return null;
      
      const newFlagged = new Set(prev.flaggedQuestions);
      if (newFlagged.has(questionId)) {
        newFlagged.delete(questionId);
      } else {
        newFlagged.add(questionId);
      }
      
      return {
        ...prev,
        flaggedQuestions: newFlagged
      };
    });
  };

  const handleNextQuestion = () => {
    if (!session || session.currentQuestionIndex >= session.questions.length - 1) return;
    
    setSession(prev => prev ? {
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1
    } : null);
  };

  const handlePreviousQuestion = () => {
    if (!session || session.currentQuestionIndex <= 0) return;
    
    setSession(prev => prev ? {
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex - 1
    } : null);
  };

  const handleQuestionSelect = (index: number) => {
    if (!session) return;
    
    setSession(prev => prev ? {
      ...prev,
      currentQuestionIndex: index
    } : null);
    setShowNavigation(false);
  };

  const submitAssessmentAnswers = async (isAutoSubmit = false) => {
    if (!session) return;

    try {
      const response = await submitAssessment(session.id, {
        answers: session.answers,
        flaggedQuestions: Array.from(session.flaggedQuestions),
        timeTaken: session.duration * 60 - timeRemaining,
        isAutoSubmit,
      });

      if (response.success) {
        if (timerRef.current) clearInterval(timerRef.current);
        if (autoSaveRef.current) clearInterval(autoSaveRef.current);
        
        navigation.replace('AssessmentResults', {
          assessmentId: session.assessmentId,
          sessionId: session.id,
          score: response.data?.score,
          percentage: response.data?.percentage,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit assessment. Please try again.');
    }
  };

  const handleSubmit = () => {
    if (!session) return;

    const answeredCount = Object.keys(session.answers).length;
    const totalQuestions = session.questions.length;
    const unansweredCount = totalQuestions - answeredCount;

    if (unansweredCount > 0) {
      Alert.alert(
        'Incomplete Assessment',
        `You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit', onPress: () => setShowSubmitConfirm(true) }
        ]
      );
    } else {
      setShowSubmitConfirm(true);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeRemaining <= 300) return COLORS.error.main; // Last 5 minutes
    if (timeRemaining <= 600) return COLORS.warning.main; // Last 10 minutes
    return COLORS.text.primary;
  };

  const renderQuestion = (question: Question, index: number) => {
    const isAnswered = session?.answers[question.id] !== undefined;
    const isFlagged = session?.flaggedQuestions.has(question.id) || false;
    const userAnswer = session?.answers[question.id];

    const renderQuestionContent = () => {
      switch (question.type) {
        case 'multiple_choice':
        case 'single_choice':
          return (
            <View style={styles.optionsContainer}>
              {question.options?.map((option, optionIndex) => (
                <TouchableOpacity
                  key={optionIndex}
                  style={[
                    styles.option,
                    userAnswer === optionIndex && styles.selectedOption
                  ]}
                  onPress={() => handleAnswerChange(question.id, optionIndex)}
                >
                  <View style={styles.optionContent}>
                    <View style={[
                      styles.optionIndicator,
                      question.type === 'single_choice' ? styles.radioIndicator : styles.checkboxIndicator,
                      userAnswer === optionIndex && styles.selectedIndicator
                    ]}>
                      {userAnswer === optionIndex && (
                        <Ionicons 
                          name={question.type === 'single_choice' ? 'ellipse' : 'checkmark'} 
                          size={12} 
                          color={COLORS.background.light} 
                        />
                      )}
                    </View>
                    <Text style={styles.optionText}>{option}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          );

        case 'true_false':
          return (
            <View style={styles.optionsContainer}>
              {['True', 'False'].map((option, optionIndex) => (
                <TouchableOpacity
                  key={optionIndex}
                  style={[
                    styles.option,
                    userAnswer === optionIndex && styles.selectedOption
                  ]}
                  onPress={() => handleAnswerChange(question.id, optionIndex)}
                >
                  <View style={styles.optionContent}>
                    <View style={[
                      styles.optionIndicator,
                      styles.radioIndicator,
                      userAnswer === optionIndex && styles.selectedIndicator
                    ]}>
                      {userAnswer === optionIndex && (
                        <Ionicons name="ellipse" size={12} color={COLORS.background.light} />
                      )}
                    </View>
                    <Text style={styles.optionText}>{option}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          );

        case 'fill_blank':
        case 'numerical':
          return (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {question.type === 'numerical' ? 'Enter your numerical answer:' : 'Fill in the blank:'}
              </Text>
              <View style={styles.textInputContainer}>
                {/* In a real implementation, this would be a TextInput */}
                <Text style={styles.textInput}>
                  {userAnswer || 'Tap to enter answer...'}
                </Text>
              </View>
            </View>
          );

        default:
          return null;
      }
    };

    return (
      <View style={styles.questionContainer}>
        <View style={styles.questionHeader}>
          <View style={styles.questionMeta}>
            <Badge text={`Question ${index + 1}`} variant="outline" size="small" />
            <Badge text={question.difficulty} variant="outline" size="small" />
            <Badge text={`${question.marks} marks`} variant="primary" size="small" />
          </View>
          
          <TouchableOpacity
            style={styles.flagButton}
            onPress={() => handleFlagQuestion(question.id)}
          >
            <Ionicons
              name={isFlagged ? 'flag' : 'flag-outline'}
              size={20}
              color={isFlagged ? COLORS.warning.main : COLORS.grey[400]}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.questionText}>{question.question}</Text>
        
        {question.image && (
          <View style={styles.questionImage}>
            <Ionicons name="image-outline" size={48} color={COLORS.grey[400]} />
            <Text style={styles.imageText}>Question Image</Text>
          </View>
        )}

        {renderQuestionContent()}

        <View style={styles.questionFooter}>
          <Text style={styles.questionInfo}>
            Subject: {question.subject} • Topic: {question.topic}
          </Text>
          {isAnswered && (
            <View style={styles.answeredIndicator}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success.main} />
              <Text style={styles.answeredText}>Answered</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderSubmitConfirmModal = () => (
    <Modal
      visible={showSubmitConfirm}
      onClose={() => setShowSubmitConfirm(false)}
      title="Submit Assessment"
      position="center"
    >
      <View style={styles.submitModalContent}>
        <Text style={styles.submitModalText}>
          Are you sure you want to submit your assessment? This action cannot be undone.
        </Text>
        
        <View style={styles.submitSummary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Questions:</Text>
            <Text style={styles.summaryValue}>{session?.questions.length}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Answered:</Text>
            <Text style={styles.summaryValue}>
              {Object.keys(session?.answers || {}).length}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Flagged:</Text>
            <Text style={styles.summaryValue}>
              {session?.flaggedQuestions.size || 0}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Time Remaining:</Text>
            <Text style={styles.summaryValue}>{formatTime(timeRemaining)}</Text>
          </View>
        </View>

        <View style={styles.submitModalActions}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => setShowSubmitConfirm(false)}
            style={styles.submitModalButton}
          />
          <Button
            title="Submit"
            onPress={() => {
              setShowSubmitConfirm(false);
              submitAssessmentAnswers();
            }}
            style={styles.submitModalButton}
            loading={isLoading}
          />
        </View>
      </View>
    </Modal>
  );

  if (!session) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading assessment...</Text>
      </View>
    );
  }

  const currentQuestion = session.questions[session.currentQuestionIndex];
  const progress = ((session.currentQuestionIndex + 1) / session.questions.length) * 100;
  const answeredCount = Object.keys(session.answers).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {session.title}
          </Text>
          <Text style={styles.headerSubtitle}>
            {session.currentQuestionIndex + 1} of {session.questions.length}
          </Text>
        </View>
        
        <View style={styles.timerContainer}>
          <Ionicons name="time-outline" size={20} color={getTimeColor()} />
          <Text style={[styles.timerText, { color: getTimeColor() }]}>
            {formatTime(timeRemaining)}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <ProgressBar progress={progress} style={styles.progressBar} />
        <Text style={styles.progressText}>
          {answeredCount}/{session.questions.length} answered
        </Text>
      </View>

      {/* Question Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderQuestion(currentQuestion, session.currentQuestionIndex)}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <View style={styles.navigationRow}>
          <Button
            title="Previous"
            variant="outline"
            onPress={handlePreviousQuestion}
            disabled={session.currentQuestionIndex === 0}
            style={styles.navButton}
            icon="chevron-back"
          />
          
          <Button
            title="Questions"
            variant="outline"
            onPress={() => setShowNavigation(true)}
            style={styles.questionsButton}
            icon="grid-outline"
          />
          
          <Button
            title="Next"
            onPress={handleNextQuestion}
            disabled={session.currentQuestionIndex >= session.questions.length - 1}
            style={styles.navButton}
            icon="chevron-forward"
            iconPosition="right"
          />
        </View>
        
        <Button
          title="Submit Assessment"
          onPress={handleSubmit}
          style={styles.submitButton}
          icon="checkmark-circle"
        />
      </View>

      {/* Question Navigation Modal */}
      <Modal
        visible={showNavigation}
        onClose={() => setShowNavigation(false)}
        title="Question Navigation"
        position="fullscreen"
      >
        <QuestionNavigation
          questions={session.questions}
          currentIndex={session.currentQuestionIndex}
          answers={session.answers}
          flaggedQuestions={session.flaggedQuestions}
          onQuestionSelect={handleQuestionSelect}
        />
      </Modal>

      {renderSubmitConfirmModal()}
    </View>
  );
};

// Mock session creator for development
const createMockSession = (): AssessmentSession => ({
  id: 'session_1',
  assessmentId: '1',
  title: 'Mathematics Class 12 - Calculus Test',
  description: 'Comprehensive test covering limits, derivatives, and integrals',
  duration: 180,
  totalQuestions: 10,
  totalMarks: 100,
  questions: [
    {
      id: 'q1',
      type: 'single_choice',
      question: 'What is the derivative of sin(x)?',
      options: ['cos(x)', '-cos(x)', 'sin(x)', '-sin(x)'],
      correctAnswer: 0,
      explanation: 'The derivative of sin(x) is cos(x).',
      marks: 4,
      difficulty: 'Easy',
      subject: 'Mathematics',
      topic: 'Differentiation',
    },
    {
      id: 'q2',
      type: 'multiple_choice',
      question: 'Which of the following are properties of limits? (Select all that apply)',
      options: [
        'Limit of sum is sum of limits',
        'Limit of product is product of limits',
        'Limit of quotient is quotient of limits',
        'Limit is always equal to function value'
      ],
      correctAnswer: [0, 1, 2],
      explanation: 'The first three options are properties of limits. The fourth is not always true.',
      marks: 6,
      difficulty: 'Medium',
      subject: 'Mathematics',
      topic: 'Limits',
    },
    // Add more mock questions as needed
  ],
  startTime: new Date().toISOString(),
  timeRemaining: 180 * 60, // 3 hours in seconds
  currentQuestionIndex: 0,
  answers: {},
  flaggedQuestions: new Set(),
  isSubmitted: false,
  autoSubmit: true,
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.main,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: COLORS.background.light,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.background.main,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timerText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.background.light,
    gap: 12,
  },
  progressBar: {
    flex: 1,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  questionMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  flagButton: {
    padding: 4,
  },
  questionText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    lineHeight: 28,
    marginBottom: 20,
  },
  questionImage: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grey[100],
    borderRadius: DIMENSIONS.BORDER_RADIUS,
    padding: 40,
    marginBottom: 20,
  },
  imageText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginTop: 8,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  option: {
    borderWidth: 2,
    borderColor: COLORS.grey[200],
    borderRadius: DIMENSIONS.BORDER_RADIUS,
    backgroundColor: COLORS.background.light,
  },
  selectedOption: {
    borderColor: COLORS.primary[600],
    backgroundColor: COLORS.primary.light,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  optionIndicator: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.grey[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioIndicator: {
    borderRadius: 10,
  },
  checkboxIndicator: {
    borderRadius: 4,
  },
  selectedIndicator: {
    backgroundColor: COLORS.primary[600],
    borderColor: COLORS.primary[600],
  },
  optionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    flex: 1,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  textInputContainer: {
    borderWidth: 2,
    borderColor: COLORS.grey[200],
    borderRadius: DIMENSIONS.BORDER_RADIUS,
    backgroundColor: COLORS.background.light,
    padding: 16,
    minHeight: 48,
  },
  textInput: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
  },
  questionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionInfo: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  answeredIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  answeredText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success.main,
    fontWeight: '500',
  },
  bottomNavigation: {
    backgroundColor: COLORS.background.light,
    borderTopWidth: 1,
    borderTopColor: COLORS.grey[200],
    padding: 16,
    gap: 12,
  },
  navigationRow: {
    flexDirection: 'row',
    gap: 12,
  },
  navButton: {
    flex: 1,
  },
  questionsButton: {
    flex: 1,
  },
  submitButton: {
    width: '100%',
  },
  questionNavigation: {
    flex: 1,
    padding: 20,
  },
  navigationTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  navigationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 20,
  },
  navItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  navItemText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  navItemCurrent: {
    backgroundColor: COLORS.primary[600],
    borderColor: COLORS.primary[600],
  },
  navItemCurrentAnswered: {
    backgroundColor: COLORS.success.main,
    borderColor: COLORS.success.main,
  },
  navItemAnswered: {
    backgroundColor: COLORS.success.main,
    borderColor: COLORS.success.main,
  },
  navItemFlagged: {
    backgroundColor: COLORS.warning.main,
    borderColor: COLORS.warning.main,
  },
  navItemAnsweredFlagged: {
    backgroundColor: COLORS.warning.main,
    borderColor: COLORS.warning.main,
  },
  navItemNotAnswered: {
    backgroundColor: COLORS.background.light,
    borderColor: COLORS.grey[300],
  },
  navigationLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.grey[200],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  legendText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  submitModalContent: {
    padding: 20,
  },
  submitModalText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    lineHeight: 22,
    marginBottom: 20,
  },
  submitSummary: {
    backgroundColor: COLORS.background.main,
    borderRadius: DIMENSIONS.BORDER_RADIUS,
    padding: 16,
    marginBottom: 20,
    gap: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  summaryValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  submitModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  submitModalButton: {
    flex: 1,
  },
});

export default AssessmentPlayerScreen;