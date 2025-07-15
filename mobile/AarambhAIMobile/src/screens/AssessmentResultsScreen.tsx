import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, FONT_SIZES, DIMENSIONS } from '../constants';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { TabView } from '../components/common/TabView';
import { useOfflineApi } from '../hooks/useOffline';

const { width } = Dimensions.get('window');

interface AssessmentResult {
  id: string;
  assessmentId: string;
  sessionId: string;
  title: string;
  description: string;
  subject: string;
  level: string;
  type: string;
  totalQuestions: number;
  totalMarks: number;
  score: number;
  percentage: number;
  timeTaken: number; // in seconds
  timeAllowed: number; // in seconds
  completedAt: string;
  rank?: number;
  totalParticipants?: number;
  questions: {
    id: string;
    question: string;
    type: string;
    options?: string[];
    correctAnswer: any;
    userAnswer: any;
    isCorrect: boolean;
    marks: number;
    marksObtained: number;
    explanation: string;
    difficulty: string;
    subject: string;
    topic: string;
  }[];
  categoryAnalysis: {
    category: string;
    totalQuestions: number;
    correctAnswers: number;
    percentage: number;
    color: string;
  }[];
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
  badges: {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
  }[];
}

export const AssessmentResultsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { assessmentId, sessionId } = route.params as { 
    assessmentId: string; 
    sessionId: string;
  };
  const { getAssessmentResults, isLoading } = useOfflineApi();

  const [results, setResults] = useState<AssessmentResult | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const response = await getAssessmentResults(assessmentId, sessionId);
      if (response.data) {
        setResults(response.data);
      } else {
        // Mock results for development
        setResults(mockResults);
      }
    } catch (error) {
      console.error('Failed to load results:', error);
      setResults(mockResults);
    }
  };

  const handleShareResults = async () => {
    if (!results) return;

    try {
      const shareMessage = `
🎯 Assessment Results

📚 ${results.title}
📊 Score: ${results.score}/${results.totalMarks} (${results.percentage}%)
⏱️ Time: ${formatTime(results.timeTaken)}
📈 Rank: ${results.rank || 'N/A'}

Achieved via AARAMBH AI
      `.trim();

      await Share.share({
        message: shareMessage,
        title: 'Assessment Results'
      });
    } catch (error) {
      console.error('Error sharing results:', error);
    }
  };

  const handleRetakeAssessment = () => {
    navigation.navigate('AssessmentPlayer', {
      assessmentId: results?.assessmentId,
      mode: 'new'
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return COLORS.success.main;
    if (percentage >= 80) return COLORS.primary[600];
    if (percentage >= 70) return COLORS.warning.main;
    if (percentage >= 60) return COLORS.orange;
    return COLORS.error.main;
  };

  const getGradeLetter = (percentage: number) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 90) return 'Excellent! Outstanding performance!';
    if (percentage >= 80) return 'Great job! Very good performance!';
    if (percentage >= 70) return 'Good work! Above average performance!';
    if (percentage >= 60) return 'Fair performance. Keep practicing!';
    return 'Needs improvement. Review the topics and try again!';
  };

  const renderOverview = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Score Card */}
      <Card variant="elevated" style={styles.scoreCard}>
        <View style={styles.scoreHeader}>
          <View style={styles.gradeCircle}>
            <Text style={[styles.gradeText, { color: getGradeColor(results?.percentage || 0) }]}>
              {getGradeLetter(results?.percentage || 0)}
            </Text>
          </View>
          <View style={styles.scoreInfo}>
            <Text style={styles.scoreValue}>
              {results?.score}/{results?.totalMarks}
            </Text>
            <Text style={styles.scorePercentage}>
              {results?.percentage.toFixed(1)}%
            </Text>
          </View>
        </View>
        
        <Text style={styles.performanceMessage}>
          {getPerformanceMessage(results?.percentage || 0)}
        </Text>
        
        <View style={styles.progressContainer}>
          <ProgressBar 
            progress={results?.percentage || 0} 
            style={styles.scoreProgress}
            color={getGradeColor(results?.percentage || 0)}
          />
        </View>
      </Card>

      {/* Quick Stats */}
      <Card variant="outlined" style={styles.statsCard}>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success.main} />
            </View>
            <Text style={styles.statValue}>
              {results?.questions.filter(q => q.isCorrect).length || 0}
            </Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Ionicons name="close-circle" size={20} color={COLORS.error.main} />
            </View>
            <Text style={styles.statValue}>
              {results?.questions.filter(q => !q.isCorrect).length || 0}
            </Text>
            <Text style={styles.statLabel}>Wrong</Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Ionicons name="time" size={20} color={COLORS.primary[600]} />
            </View>
            <Text style={styles.statValue}>
              {formatTime(results?.timeTaken || 0)}
            </Text>
            <Text style={styles.statLabel}>Time Taken</Text>
          </View>
          
          {results?.rank && (
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name="trophy" size={20} color={COLORS.warning.main} />
              </View>
              <Text style={styles.statValue}>
                {results.rank}
              </Text>
              <Text style={styles.statLabel}>Rank</Text>
            </View>
          )}
        </View>
      </Card>

      {/* Category Analysis */}
      <Card variant="elevated" style={styles.analysisCard}>
        <Text style={styles.analysisTitle}>Performance by Category</Text>
        
        {results?.categoryAnalysis.map((category, index) => (
          <View key={index} style={styles.categoryItem}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryName}>{category.category}</Text>
              <Text style={styles.categoryPercentage}>
                {category.percentage.toFixed(1)}%
              </Text>
            </View>
            
            <View style={styles.categoryProgress}>
              <ProgressBar 
                progress={category.percentage} 
                style={styles.categoryProgressBar}
                color={category.color}
              />
            </View>
            
            <Text style={styles.categoryStats}>
              {category.correctAnswers}/{category.totalQuestions} questions correct
            </Text>
          </View>
        ))}
      </Card>

      {/* Badges */}
      {results?.badges && results.badges.length > 0 && (
        <Card variant="elevated" style={styles.badgesCard}>
          <Text style={styles.badgesTitle}>Achievements</Text>
          <View style={styles.badgesGrid}>
            {results.badges.map((badge, index) => (
              <View key={index} style={styles.badgeItem}>
                <View style={[styles.badgeIcon, { backgroundColor: badge.color }]}>
                  <Ionicons name={badge.icon as any} size={24} color={COLORS.background.light} />
                </View>
                <Text style={styles.badgeTitle}>{badge.title}</Text>
                <Text style={styles.badgeDescription}>{badge.description}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Recommendations */}
      <Card variant="outlined" style={styles.recommendationsCard}>
        <Text style={styles.recommendationsTitle}>Recommendations</Text>
        
        {results?.strengths && results.strengths.length > 0 && (
          <View style={styles.recommendationSection}>
            <Text style={styles.recommendationSectionTitle}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success.main} />
              {' '}Strengths
            </Text>
            {results.strengths.map((strength, index) => (
              <Text key={index} style={styles.recommendationItem}>
                • {strength}
              </Text>
            ))}
          </View>
        )}
        
        {results?.weaknesses && results.weaknesses.length > 0 && (
          <View style={styles.recommendationSection}>
            <Text style={styles.recommendationSectionTitle}>
              <Ionicons name="alert-circle" size={16} color={COLORS.warning.main} />
              {' '}Areas for Improvement
            </Text>
            {results.weaknesses.map((weakness, index) => (
              <Text key={index} style={styles.recommendationItem}>
                • {weakness}
              </Text>
            ))}
          </View>
        )}
        
        {results?.recommendations && results.recommendations.length > 0 && (
          <View style={styles.recommendationSection}>
            <Text style={styles.recommendationSectionTitle}>
              <Ionicons name="bulb" size={16} color={COLORS.primary[600]} />
              {' '}Study Recommendations
            </Text>
            {results.recommendations.map((recommendation, index) => (
              <Text key={index} style={styles.recommendationItem}>
                • {recommendation}
              </Text>
            ))}
          </View>
        )}
      </Card>
    </ScrollView>
  );

  const renderQuestionReview = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewTitle}>Question Review</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowAllQuestions(!showAllQuestions)}
        >
          <Text style={styles.filterText}>
            {showAllQuestions ? 'Show Wrong Only' : 'Show All'}
          </Text>
          <Ionicons 
            name={showAllQuestions ? 'funnel' : 'funnel-outline'} 
            size={16} 
            color={COLORS.primary[600]} 
          />
        </TouchableOpacity>
      </View>

      {results?.questions
        .filter(q => showAllQuestions || !q.isCorrect)
        .map((question, index) => (
          <Card key={question.id} variant="outlined" style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <View style={styles.questionMeta}>
                <Badge 
                  text={`Q${index + 1}`} 
                  variant="outline" 
                  size="small" 
                />
                <Badge 
                  text={question.difficulty} 
                  variant="outline" 
                  size="small" 
                />
                <Badge 
                  text={`${question.marksObtained}/${question.marks} marks`} 
                  variant={question.isCorrect ? 'success' : 'error'} 
                  size="small" 
                />
              </View>
              
              <View style={styles.questionStatus}>
                <Ionicons 
                  name={question.isCorrect ? 'checkmark-circle' : 'close-circle'} 
                  size={24} 
                  color={question.isCorrect ? COLORS.success.main : COLORS.error.main} 
                />
              </View>
            </View>

            <Text style={styles.questionText}>{question.question}</Text>

            {question.options && (
              <View style={styles.optionsReview}>
                {question.options.map((option, optionIndex) => {
                  const isCorrect = question.correctAnswer === optionIndex;
                  const isUserAnswer = question.userAnswer === optionIndex;
                  
                  let optionStyle = styles.reviewOption;
                  if (isCorrect) {
                    optionStyle = styles.correctOption;
                  } else if (isUserAnswer && !isCorrect) {
                    optionStyle = styles.wrongOption;
                  }
                  
                  return (
                    <View key={optionIndex} style={optionStyle}>
                      <View style={styles.optionContent}>
                        <Text style={styles.optionLetter}>
                          {String.fromCharCode(65 + optionIndex)}
                        </Text>
                        <Text style={styles.optionText}>{option}</Text>
                        <View style={styles.optionIndicators}>
                          {isCorrect && (
                            <Ionicons name="checkmark" size={16} color={COLORS.success.main} />
                          )}
                          {isUserAnswer && (
                            <Ionicons 
                              name="person" 
                              size={16} 
                              color={isCorrect ? COLORS.success.main : COLORS.error.main} 
                            />
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            <View style={styles.explanationSection}>
              <Text style={styles.explanationTitle}>Explanation:</Text>
              <Text style={styles.explanationText}>{question.explanation}</Text>
            </View>

            <View style={styles.questionFooter}>
              <Text style={styles.questionTopicInfo}>
                {question.subject} • {question.topic}
              </Text>
            </View>
          </Card>
        ))}
    </ScrollView>
  );

  const renderDetailedAnalysis = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Card variant="elevated" style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>Assessment Details</Text>
        
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Assessment Type</Text>
            <Text style={styles.detailValue}>{results?.type}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Subject</Text>
            <Text style={styles.detailValue}>{results?.subject}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Level</Text>
            <Text style={styles.detailValue}>{results?.level}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Total Questions</Text>
            <Text style={styles.detailValue}>{results?.totalQuestions}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Total Marks</Text>
            <Text style={styles.detailValue}>{results?.totalMarks}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Time Allowed</Text>
            <Text style={styles.detailValue}>{formatTime(results?.timeAllowed || 0)}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Time Taken</Text>
            <Text style={styles.detailValue}>{formatTime(results?.timeTaken || 0)}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Completed At</Text>
            <Text style={styles.detailValue}>
              {new Date(results?.completedAt || '').toLocaleDateString()}
            </Text>
          </View>
          
          {results?.rank && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Rank</Text>
              <Text style={styles.detailValue}>
                {results.rank} / {results.totalParticipants}
              </Text>
            </View>
          )}
        </View>
      </Card>

      {/* Time Analysis */}
      <Card variant="outlined" style={styles.timeAnalysisCard}>
        <Text style={styles.timeAnalysisTitle}>Time Analysis</Text>
        
        <View style={styles.timeStats}>
          <View style={styles.timeStatItem}>
            <Text style={styles.timeStatLabel}>Time Efficiency</Text>
            <Text style={styles.timeStatValue}>
              {((results?.timeAllowed || 0) - (results?.timeTaken || 0) > 0 ? 'Good' : 'Could be better')}
            </Text>
          </View>
          
          <View style={styles.timeStatItem}>
            <Text style={styles.timeStatLabel}>Average per Question</Text>
            <Text style={styles.timeStatValue}>
              {formatTime(Math.round((results?.timeTaken || 0) / (results?.totalQuestions || 1)))}
            </Text>
          </View>
          
          <View style={styles.timeStatItem}>
            <Text style={styles.timeStatLabel}>Time Remaining</Text>
            <Text style={styles.timeStatValue}>
              {formatTime(Math.max(0, (results?.timeAllowed || 0) - (results?.timeTaken || 0)))}
            </Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );

  if (!results) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading results...</Text>
      </View>
    );
  }

  const tabs = [
    { key: 'overview', title: 'Overview', component: renderOverview },
    { key: 'questions', title: 'Questions', component: renderQuestionReview },
    { key: 'analysis', title: 'Analysis', component: renderDetailedAnalysis },
  ];

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
          <Text style={styles.headerTitle}>Assessment Results</Text>
          <Text style={styles.headerSubtitle}>{results.title}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShareResults}
        >
          <Ionicons name="share-outline" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <TabView
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        style={styles.tabView}
      />

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <Button
          title="Retake Assessment"
          variant="outline"
          onPress={handleRetakeAssessment}
          style={styles.actionButton}
          icon="refresh"
        />
        <Button
          title="View Similar"
          onPress={() => navigation.navigate('AssessmentScreen')}
          style={styles.actionButton}
          icon="search"
        />
      </View>
    </View>
  );
};

// Mock results for development
const mockResults: AssessmentResult = {
  id: 'result_1',
  assessmentId: '1',
  sessionId: 'session_1',
  title: 'Mathematics Class 12 - Calculus Test',
  description: 'Comprehensive test covering limits, derivatives, and integrals',
  subject: 'Mathematics',
  level: 'Intermediate',
  type: 'Mock Test',
  totalQuestions: 10,
  totalMarks: 100,
  score: 85,
  percentage: 85,
  timeTaken: 5400, // 1.5 hours
  timeAllowed: 10800, // 3 hours
  completedAt: '2024-01-15T14:30:00Z',
  rank: 15,
  totalParticipants: 1250,
  questions: [
    {
      id: 'q1',
      question: 'What is the derivative of sin(x)?',
      type: 'single_choice',
      options: ['cos(x)', '-cos(x)', 'sin(x)', '-sin(x)'],
      correctAnswer: 0,
      userAnswer: 0,
      isCorrect: true,
      marks: 4,
      marksObtained: 4,
      explanation: 'The derivative of sin(x) is cos(x) by the fundamental rules of differentiation.',
      difficulty: 'Easy',
      subject: 'Mathematics',
      topic: 'Differentiation',
    },
    {
      id: 'q2',
      question: 'Find the limit of (x²-4)/(x-2) as x approaches 2',
      type: 'single_choice',
      options: ['0', '2', '4', 'undefined'],
      correctAnswer: 2,
      userAnswer: 1,
      isCorrect: false,
      marks: 6,
      marksObtained: 0,
      explanation: 'Using L\'Hôpital\'s rule or factoring, (x²-4)/(x-2) = (x+2)(x-2)/(x-2) = x+2. As x→2, the limit is 4.',
      difficulty: 'Medium',
      subject: 'Mathematics',
      topic: 'Limits',
    },
  ],
  categoryAnalysis: [
    {
      category: 'Differentiation',
      totalQuestions: 4,
      correctAnswers: 4,
      percentage: 100,
      color: COLORS.success.main,
    },
    {
      category: 'Integration',
      totalQuestions: 3,
      correctAnswers: 2,
      percentage: 66.7,
      color: COLORS.warning.main,
    },
    {
      category: 'Limits',
      totalQuestions: 3,
      correctAnswers: 2,
      percentage: 66.7,
      color: COLORS.warning.main,
    },
  ],
  recommendations: [
    'Practice more limit problems with indeterminate forms',
    'Review integration by parts technique',
    'Strengthen your understanding of continuity and differentiability',
  ],
  strengths: [
    'Excellent grasp of differentiation rules',
    'Strong problem-solving approach',
    'Good time management',
  ],
  weaknesses: [
    'Limit calculations with factoring',
    'Integration of complex functions',
  ],
  badges: [
    {
      id: 'badge1',
      title: 'Differentiation Expert',
      description: 'Scored 100% in differentiation questions',
      icon: 'trophy',
      color: COLORS.success.main,
    },
    {
      id: 'badge2',
      title: 'Speed Solver',
      description: 'Completed assessment in under 2 hours',
      icon: 'flash',
      color: COLORS.primary[600],
    },
  ],
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
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  shareButton: {
    padding: 8,
    marginLeft: 8,
  },
  tabView: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  scoreCard: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 20,
  },
  gradeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
  },
  scoreInfo: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  scorePercentage: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.primary[600],
  },
  performanceMessage: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  progressContainer: {
    width: '100%',
  },
  scoreProgress: {
    height: 8,
  },
  statsCard: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  statItem: {
    alignItems: 'center',
    minWidth: width / 4 - 20,
    marginBottom: 16,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  analysisCard: {
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  categoryItem: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  categoryPercentage: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary[600],
  },
  categoryProgress: {
    marginBottom: 4,
  },
  categoryProgressBar: {
    height: 6,
  },
  categoryStats: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  badgesCard: {
    marginBottom: 16,
  },
  badgesTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  badgeItem: {
    alignItems: 'center',
    width: (width - 64) / 2,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  recommendationsCard: {
    marginBottom: 16,
  },
  recommendationsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  recommendationSection: {
    marginBottom: 16,
  },
  recommendationSectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  recommendationItem: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.primary.light,
    borderRadius: 16,
  },
  filterText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary[600],
    fontWeight: '500',
  },
  questionCard: {
    marginBottom: 16,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  questionMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  questionStatus: {
    marginLeft: 8,
  },
  questionText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    lineHeight: 22,
    marginBottom: 16,
  },
  optionsReview: {
    gap: 8,
    marginBottom: 16,
  },
  reviewOption: {
    borderWidth: 1,
    borderColor: COLORS.grey[200],
    borderRadius: DIMENSIONS.BORDER_RADIUS,
    backgroundColor: COLORS.background.light,
  },
  correctOption: {
    borderColor: COLORS.success.main,
    backgroundColor: COLORS.success.light,
  },
  wrongOption: {
    borderColor: COLORS.error.main,
    backgroundColor: COLORS.error.light,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  optionLetter: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    width: 20,
  },
  optionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    flex: 1,
  },
  optionIndicators: {
    flexDirection: 'row',
    gap: 4,
  },
  explanationSection: {
    backgroundColor: COLORS.primary.light,
    padding: 12,
    borderRadius: DIMENSIONS.BORDER_RADIUS / 2,
    marginBottom: 12,
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
  questionFooter: {
    alignItems: 'flex-end',
  },
  questionTopicInfo: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
  },
  detailsCard: {
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    width: (width - 64) / 2,
  },
  detailLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  timeAnalysisCard: {
    marginBottom: 16,
  },
  timeAnalysisTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  timeStats: {
    gap: 12,
  },
  timeStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
  },
  timeStatLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  timeStatValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: COLORS.background.light,
    borderTopWidth: 1,
    borderTopColor: COLORS.grey[200],
  },
  actionButton: {
    flex: 1,
  },
});

export default AssessmentResultsScreen;