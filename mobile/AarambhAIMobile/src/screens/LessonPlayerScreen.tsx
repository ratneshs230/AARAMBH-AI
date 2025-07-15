import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, FONT_SIZES, DIMENSIONS } from '../constants';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { useOfflineApi } from '../hooks/useOffline';

const { width, height } = Dimensions.get('window');

interface Lesson {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  duration: string;
  content: {
    videoUrl?: string;
    textContent?: string;
    quiz?: {
      questions: {
        id: string;
        question: string;
        options: string[];
        correctAnswer: number;
        explanation: string;
      }[];
    };
    assignment?: {
      title: string;
      description: string;
      questions: string[];
    };
  };
  resources: {
    id: string;
    title: string;
    type: 'pdf' | 'link' | 'file';
    url: string;
  }[];
  isCompleted: boolean;
  nextLessonId?: string;
  previousLessonId?: string;
}

interface QuizAnswer {
  questionId: string;
  selectedAnswer: number;
}

export const LessonPlayerScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { courseId, lessonId } = route.params as { courseId: string; lessonId: string };
  const { getLessonDetails, markLessonComplete, submitQuizAnswers, isLoading } = useOfflineApi();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [showResources, setShowResources] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadLessonDetails();
  }, [lessonId]);

  const loadLessonDetails = async () => {
    try {
      const response = await getLessonDetails(courseId, lessonId);
      if (response.data) {
        setLesson(response.data);
      } else {
        // Mock data for development
        setLesson(mockLesson);
      }
    } catch (error) {
      console.error('Failed to load lesson details:', error);
      setLesson(mockLesson);
    }
  };

  const handleMarkComplete = async () => {
    if (!lesson) return;

    try {
      const response = await markLessonComplete(courseId, lessonId);
      if (response.success) {
        setLesson(prev => prev ? { ...prev, isCompleted: true } : null);
        Alert.alert(
          'Lesson Completed!',
          'Great job! You\'ve completed this lesson.',
          [
            { text: 'Continue', onPress: handleNextLesson }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to mark lesson as complete. Please try again.');
    }
  };

  const handleNextLesson = () => {
    if (lesson?.nextLessonId) {
      navigation.replace('LessonPlayer', {
        courseId,
        lessonId: lesson.nextLessonId
      });
    } else {
      navigation.goBack();
    }
  };

  const handlePreviousLesson = () => {
    if (lesson?.previousLessonId) {
      navigation.replace('LessonPlayer', {
        courseId,
        lessonId: lesson.previousLessonId
      });
    }
  };

  const handleQuizAnswer = (questionId: string, selectedAnswer: number) => {
    setQuizAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId);
      if (existing) {
        return prev.map(a => 
          a.questionId === questionId 
            ? { ...a, selectedAnswer }
            : a
        );
      } else {
        return [...prev, { questionId, selectedAnswer }];
      }
    });
  };

  const handleSubmitQuiz = async () => {
    if (!lesson?.content.quiz) return;

    const allAnswered = lesson.content.quiz.questions.every(q => 
      quizAnswers.find(a => a.questionId === q.id) !== undefined
    );

    if (!allAnswered) {
      Alert.alert('Incomplete', 'Please answer all questions before submitting.');
      return;
    }

    try {
      const response = await submitQuizAnswers(courseId, lessonId, quizAnswers);
      if (response.success) {
        setQuizSubmitted(true);
        
        // Calculate score
        let correct = 0;
        lesson.content.quiz.questions.forEach(question => {
          const answer = quizAnswers.find(a => a.questionId === question.id);
          if (answer && answer.selectedAnswer === question.correctAnswer) {
            correct++;
          }
        });
        
        const score = Math.round((correct / lesson.content.quiz.questions.length) * 100);
        setQuizScore(score);
        
        if (score >= 70) {
          await handleMarkComplete();
        } else {
          Alert.alert(
            'Quiz Completed',
            `You scored ${score}%. You need 70% to pass. Try again!`,
            [
              { text: 'Retry', onPress: () => {
                setQuizAnswers([]);
                setQuizSubmitted(false);
                setQuizScore(null);
              }},
              { text: 'Continue', onPress: handleNextLesson }
            ]
          );
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit quiz. Please try again.');
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    StatusBar.setHidden(!isFullscreen);
  };

  const renderVideoPlayer = () => (
    <View style={[styles.videoContainer, isFullscreen && styles.fullscreenVideo]}>
      <View style={styles.videoPlaceholder}>
        <Ionicons name="play-circle" size={64} color={COLORS.primary[600]} />
        <Text style={styles.videoText}>Video Player</Text>
        <Text style={styles.videoSubtext}>
          {lesson?.content.videoUrl || 'Video content would load here'}
        </Text>
      </View>
      
      <View style={styles.videoControls}>
        <TouchableOpacity onPress={toggleFullscreen} style={styles.fullscreenButton}>
          <Ionicons 
            name={isFullscreen ? "contract-outline" : "expand-outline"} 
            size={24} 
            color={COLORS.background.light} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.videoProgress}>
        <ProgressBar progress={videoProgress} style={styles.progressBar} />
        <Text style={styles.progressText}>{Math.round(videoProgress)}%</Text>
      </View>
    </View>
  );

  const renderTextContent = () => (
    <ScrollView style={styles.textContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.textContentText}>
        {lesson?.content.textContent || 'Text content would be displayed here with proper formatting, images, and interactive elements.'}
      </Text>
    </ScrollView>
  );

  const renderQuiz = () => (
    <ScrollView style={styles.quizContent} showsVerticalScrollIndicator={false}>
      <View style={styles.quizHeader}>
        <Text style={styles.quizTitle}>Quiz</Text>
        <Text style={styles.quizSubtitle}>
          Answer all questions to complete this lesson
        </Text>
      </View>

      {lesson?.content.quiz?.questions.map((question, index) => {
        const userAnswer = quizAnswers.find(a => a.questionId === question.id);
        const isCorrect = userAnswer?.selectedAnswer === question.correctAnswer;
        
        return (
          <Card key={question.id} variant="outlined" style={styles.questionCard}>
            <Text style={styles.questionNumber}>Question {index + 1}</Text>
            <Text style={styles.questionText}>{question.question}</Text>
            
            <View style={styles.optionsContainer}>
              {question.options.map((option, optionIndex) => {
                const isSelected = userAnswer?.selectedAnswer === optionIndex;
                const isCorrectOption = question.correctAnswer === optionIndex;
                
                let optionStyle = styles.option;
                if (quizSubmitted) {
                  if (isCorrectOption) {
                    optionStyle = styles.correctOption;
                  } else if (isSelected && !isCorrect) {
                    optionStyle = styles.incorrectOption;
                  }
                } else if (isSelected) {
                  optionStyle = styles.selectedOption;
                }
                
                return (
                  <TouchableOpacity
                    key={optionIndex}
                    style={optionStyle}
                    onPress={() => !quizSubmitted && handleQuizAnswer(question.id, optionIndex)}
                    disabled={quizSubmitted}
                  >
                    <View style={styles.optionContent}>
                      <View style={styles.optionNumber}>
                        <Text style={styles.optionNumberText}>
                          {String.fromCharCode(65 + optionIndex)}
                        </Text>
                      </View>
                      <Text style={styles.optionText}>{option}</Text>
                      {quizSubmitted && isCorrectOption && (
                        <Ionicons name="checkmark-circle" size={20} color={COLORS.success.main} />
                      )}
                      {quizSubmitted && isSelected && !isCorrect && (
                        <Ionicons name="close-circle" size={20} color={COLORS.error.main} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            {quizSubmitted && (
              <View style={styles.explanationContainer}>
                <Text style={styles.explanationTitle}>Explanation:</Text>
                <Text style={styles.explanationText}>{question.explanation}</Text>
              </View>
            )}
          </Card>
        );
      })}

      {!quizSubmitted && (
        <Button
          title="Submit Quiz"
          onPress={handleSubmitQuiz}
          style={styles.submitButton}
          loading={isLoading}
        />
      )}
      
      {quizSubmitted && quizScore !== null && (
        <Card variant="elevated" style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <Ionicons 
              name={quizScore >= 70 ? "trophy" : "refresh-circle"} 
              size={32} 
              color={quizScore >= 70 ? COLORS.warning.main : COLORS.primary[600]} 
            />
            <Text style={styles.scoreTitle}>Quiz Results</Text>
          </View>
          <Text style={styles.scoreText}>
            You scored {quizScore}% ({quizScore >= 70 ? 'Passed' : 'Failed'})
          </Text>
          {quizScore < 70 && (
            <Text style={styles.scoreSubtext}>
              You need 70% to pass this lesson. Review the material and try again.
            </Text>
          )}
        </Card>
      )}
    </ScrollView>
  );

  const renderAssignment = () => (
    <ScrollView style={styles.assignmentContent} showsVerticalScrollIndicator={false}>
      <View style={styles.assignmentHeader}>
        <Text style={styles.assignmentTitle}>
          {lesson?.content.assignment?.title || 'Assignment'}
        </Text>
        <Text style={styles.assignmentDescription}>
          {lesson?.content.assignment?.description || 'Complete the following assignment'}
        </Text>
      </View>

      <Card variant="outlined" style={styles.assignmentCard}>
        <Text style={styles.assignmentQuestionsTitle}>Questions:</Text>
        {lesson?.content.assignment?.questions.map((question, index) => (
          <View key={index} style={styles.assignmentQuestion}>
            <Text style={styles.assignmentQuestionNumber}>{index + 1}.</Text>
            <Text style={styles.assignmentQuestionText}>{question}</Text>
          </View>
        ))}
      </Card>

      <Card variant="elevated" style={styles.submissionCard}>
        <Text style={styles.submissionTitle}>Submit Your Work</Text>
        <Text style={styles.submissionText}>
          Complete the assignment and submit your answers to proceed.
        </Text>
        <Button
          title="Submit Assignment"
          onPress={() => Alert.alert('Feature Coming Soon', 'Assignment submission will be available soon.')}
          style={styles.submitButton}
        />
      </Card>
    </ScrollView>
  );

  const renderResources = () => (
    <View style={styles.resourcesContainer}>
      <Text style={styles.resourcesTitle}>Additional Resources</Text>
      {lesson?.resources.map((resource) => (
        <TouchableOpacity key={resource.id} style={styles.resourceItem}>
          <View style={styles.resourceIcon}>
            <Ionicons 
              name={
                resource.type === 'pdf' ? 'document-text' :
                resource.type === 'link' ? 'link' : 'folder'
              } 
              size={20} 
              color={COLORS.primary[600]} 
            />
          </View>
          <Text style={styles.resourceTitle}>{resource.title}</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.text.secondary} />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderLessonContent = () => {
    switch (lesson?.type) {
      case 'video':
        return renderVideoPlayer();
      case 'text':
        return renderTextContent();
      case 'quiz':
        return renderQuiz();
      case 'assignment':
        return renderAssignment();
      default:
        return renderTextContent();
    }
  };

  if (!lesson) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading lesson...</Text>
      </View>
    );
  }

  if (isFullscreen) {
    return (
      <View style={styles.fullscreenContainer}>
        {renderVideoPlayer()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {lesson.title}
          </Text>
          <Badge text={lesson.type} variant="primary" size="small" />
        </View>
        
        <TouchableOpacity
          style={styles.resourcesButton}
          onPress={() => setShowResources(!showResources)}
        >
          <Ionicons name="library-outline" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Resources Panel */}
      {showResources && renderResources()}

      {/* Main Content */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.lessonInfo}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <Text style={styles.lessonDescription}>{lesson.description}</Text>
          <View style={styles.lessonMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={COLORS.text.secondary} />
              <Text style={styles.metaText}>{lesson.duration}</Text>
            </View>
            {lesson.isCompleted && (
              <View style={styles.metaItem}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success.main} />
                <Text style={[styles.metaText, { color: COLORS.success.main }]}>
                  Completed
                </Text>
              </View>
            )}
          </View>
        </View>

        {renderLessonContent()}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <View style={styles.navigationButtons}>
          <Button
            title="Previous"
            variant="outline"
            onPress={handlePreviousLesson}
            disabled={!lesson.previousLessonId}
            style={styles.navButton}
            icon="chevron-back"
          />
          
          {!lesson.isCompleted && lesson.type !== 'quiz' && (
            <Button
              title="Mark Complete"
              onPress={handleMarkComplete}
              style={styles.completeButton}
              loading={isLoading}
            />
          )}
          
          <Button
            title="Next"
            onPress={handleNextLesson}
            disabled={!lesson.nextLessonId}
            style={styles.navButton}
            icon="chevron-forward"
            iconPosition="right"
          />
        </View>
      </View>
    </View>
  );
};

// Mock data for development
const mockLesson: Lesson = {
  id: '1-1',
  title: 'Introduction to Relations',
  description: 'Learn the fundamental concepts of relations in mathematics, including domain, range, and different types of relations.',
  type: 'video',
  duration: '45 min',
  content: {
    videoUrl: 'https://example.com/video.mp4',
    quiz: {
      questions: [
        {
          id: 'q1',
          question: 'What is a relation in mathematics?',
          options: [
            'A set of ordered pairs',
            'A function only',
            'A single number',
            'None of the above'
          ],
          correctAnswer: 0,
          explanation: 'A relation is a set of ordered pairs that shows the relationship between elements of two sets.'
        },
        {
          id: 'q2',
          question: 'What is the domain of a relation?',
          options: [
            'The set of all second elements',
            'The set of all first elements',
            'The set of all elements',
            'None of these'
          ],
          correctAnswer: 1,
          explanation: 'The domain of a relation is the set of all first elements (x-values) in the ordered pairs.'
        }
      ]
    }
  },
  resources: [
    {
      id: 'r1',
      title: 'Relations Notes PDF',
      type: 'pdf',
      url: 'https://example.com/notes.pdf'
    },
    {
      id: 'r2',
      title: 'Khan Academy - Relations',
      type: 'link',
      url: 'https://khanacademy.org/relations'
    }
  ],
  isCompleted: false,
  nextLessonId: '1-2',
  previousLessonId: undefined
};

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
  fullscreenContainer: {
    flex: 1,
    backgroundColor: COLORS.grey[900],
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
  },
  resourcesButton: {
    padding: 8,
    marginLeft: 8,
  },
  resourcesContainer: {
    backgroundColor: COLORS.background.light,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
    padding: 16,
  },
  resourcesTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  resourceIcon: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.primary.light,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  lessonInfo: {
    padding: 20,
    backgroundColor: COLORS.background.light,
  },
  lessonTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  lessonDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  videoContainer: {
    backgroundColor: COLORS.grey[900],
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  fullscreenVideo: {
    width: width,
    height: height,
    aspectRatio: undefined,
  },
  videoPlaceholder: {
    alignItems: 'center',
  },
  videoText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.background.light,
    marginTop: 16,
    fontWeight: '600',
  },
  videoSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.grey[300],
    marginTop: 8,
    textAlign: 'center',
  },
  videoControls: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  fullscreenButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  videoProgress: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.background.light,
    fontWeight: '600',
  },
  textContent: {
    padding: 20,
  },
  textContentText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    lineHeight: 24,
  },
  quizContent: {
    padding: 20,
  },
  quizHeader: {
    marginBottom: 20,
  },
  quizTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  quizSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    lineHeight: 22,
  },
  questionCard: {
    marginBottom: 20,
  },
  questionNumber: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary[600],
    fontWeight: '600',
    marginBottom: 8,
  },
  questionText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: 16,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 8,
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
  correctOption: {
    borderColor: COLORS.success.main,
    backgroundColor: COLORS.success.light,
  },
  incorrectOption: {
    borderColor: COLORS.error.main,
    backgroundColor: COLORS.error.light,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  optionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.grey[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionNumberText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  optionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    flex: 1,
    lineHeight: 22,
  },
  explanationContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: COLORS.primary.light,
    borderRadius: DIMENSIONS.BORDER_RADIUS / 2,
  },
  explanationTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary[800],
    marginBottom: 4,
  },
  explanationText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary[700],
    lineHeight: 18,
  },
  submitButton: {
    marginTop: 20,
  },
  scoreCard: {
    marginTop: 20,
    alignItems: 'center',
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  scoreTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  scoreText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary[600],
    marginBottom: 8,
  },
  scoreSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  assignmentContent: {
    padding: 20,
  },
  assignmentHeader: {
    marginBottom: 20,
  },
  assignmentTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  assignmentDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    lineHeight: 22,
  },
  assignmentCard: {
    marginBottom: 20,
  },
  assignmentQuestionsTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  assignmentQuestion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  assignmentQuestionNumber: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary[600],
    minWidth: 24,
  },
  assignmentQuestionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    flex: 1,
    lineHeight: 22,
  },
  submissionCard: {
    alignItems: 'center',
  },
  submissionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  submissionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  bottomNavigation: {
    backgroundColor: COLORS.background.light,
    borderTopWidth: 1,
    borderTopColor: COLORS.grey[200],
    padding: 16,
  },
  navigationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navButton: {
    flex: 1,
  },
  completeButton: {
    flex: 2,
  },
});

export default LessonPlayerScreen;