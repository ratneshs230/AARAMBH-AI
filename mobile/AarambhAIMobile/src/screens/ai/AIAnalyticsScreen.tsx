import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, Button, Modal, LoadingSpinner } from '../../components/common';
import { aiService } from '../../services/ai';
import { COLORS, FONT_SIZES, DIMENSIONS as DIMS } from '../../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AnalyticsData {
  overview: {
    totalStudyTime: number;
    completedSessions: number;
    averageScore: number;
    weeklyGrowth: number;
  };
  subjectProgress: {
    subject: string;
    progress: number;
    timeSpent: number;
    score: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  weeklyActivity: {
    day: string;
    minutes: number;
    sessions: number;
  }[];
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}

interface InsightCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  actionable: boolean;
}

const insightCards: InsightCard[] = [
  {
    id: 'study_pattern',
    title: 'Study Pattern Analysis',
    description: 'Analyze your learning patterns and optimal study times',
    icon: 'analytics-outline',
    color: COLORS.primary[500],
    actionable: true
  },
  {
    id: 'performance_trends',
    title: 'Performance Trends',
    description: 'Track your progress across different subjects and topics',
    icon: 'trending-up-outline',
    color: COLORS.secondary[500],
    actionable: true
  },
  {
    id: 'strength_analysis',
    title: 'Strength & Weakness Analysis',
    description: 'Identify your strong areas and improvement opportunities',
    icon: 'pulse-outline',
    color: COLORS.success.main,
    actionable: true
  },
  {
    id: 'goal_tracking',
    title: 'Goal Progress Tracking',
    description: 'Monitor your progress toward learning goals',
    icon: 'flag-outline',
    color: COLORS.warning.main,
    actionable: true
  },
  {
    id: 'time_optimization',
    title: 'Time Optimization',
    description: 'Get insights on how to optimize your study schedule',
    icon: 'time-outline',
    color: COLORS.error.main,
    actionable: true
  },
  {
    id: 'ai_recommendations',
    title: 'AI Recommendations',
    description: 'Personalized suggestions to improve your learning',
    icon: 'bulb-outline',
    color: COLORS.primary[700],
    actionable: true
  }
];

const AIAnalyticsScreen: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [isLoading, setIsLoading] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<InsightCard | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [selectedTimeframe]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await aiService.getAnalytics({
        timeframe: selectedTimeframe,
        includeRecommendations: true,
      });

      if (response.success) {
        // Mock data for demonstration
        const mockData: AnalyticsData = {
          overview: {
            totalStudyTime: 1240,
            completedSessions: 28,
            averageScore: 82,
            weeklyGrowth: 15,
          },
          subjectProgress: [
            { subject: 'Mathematics', progress: 75, timeSpent: 320, score: 85, trend: 'up' },
            { subject: 'Physics', progress: 60, timeSpent: 280, score: 78, trend: 'up' },
            { subject: 'Chemistry', progress: 45, timeSpent: 180, score: 72, trend: 'stable' },
            { subject: 'Biology', progress: 55, timeSpent: 240, score: 80, trend: 'down' },
            { subject: 'English', progress: 80, timeSpent: 220, score: 88, trend: 'up' },
          ],
          weeklyActivity: [
            { day: 'Mon', minutes: 45, sessions: 2 },
            { day: 'Tue', minutes: 60, sessions: 3 },
            { day: 'Wed', minutes: 30, sessions: 1 },
            { day: 'Thu', minutes: 75, sessions: 4 },
            { day: 'Fri', minutes: 40, sessions: 2 },
            { day: 'Sat', minutes: 90, sessions: 5 },
            { day: 'Sun', minutes: 25, sessions: 1 },
          ],
          strengths: ['Problem Solving', 'Mathematical Reasoning', 'Quick Learning'],
          improvements: ['Time Management', 'Concept Retention', 'Test Strategy'],
          recommendations: [
            'Focus more on Chemistry fundamentals',
            'Increase daily study time by 15 minutes',
            'Review Biology concepts weekly',
            'Practice more Physics problems'
          ]
        };
        setAnalyticsData(mockData);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const generateInsight = async (insight: InsightCard) => {
    setSelectedInsight(insight);
    setIsLoading(true);
    
    try {
      const response = await aiService.generateInsight({
        type: insight.id,
        analyticsData: analyticsData,
      });
      
      if (response.success) {
        Alert.alert(
          insight.title,
          response.data.insight || "Here's your personalized insight based on your learning data.",
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error generating insight:', error);
      Alert.alert('Error', 'Failed to generate insight');
    } finally {
      setIsLoading(false);
      setSelectedInsight(null);
    }
  };

  const renderOverviewCard = () => (
    <Card variant="elevated" style={styles.overviewCard}>
      <Text style={styles.cardTitle}>Learning Overview</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{analyticsData?.overview.totalStudyTime}m</Text>
          <Text style={styles.statLabel}>Total Study Time</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{analyticsData?.overview.completedSessions}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{analyticsData?.overview.averageScore}%</Text>
          <Text style={styles.statLabel}>Avg Score</Text>
        </View>
        
        <View style={styles.statItem}>
          <View style={styles.growthContainer}>
            <Ionicons name="trending-up" size={16} color={COLORS.success.main} />
            <Text style={[styles.statValue, { color: COLORS.success.main }]}>
              +{analyticsData?.overview.weeklyGrowth}%
            </Text>
          </View>
          <Text style={styles.statLabel}>Weekly Growth</Text>
        </View>
      </View>
    </Card>
  );

  const renderSubjectProgress = () => (
    <Card variant="elevated" style={styles.progressCard}>
      <Text style={styles.cardTitle}>Subject Progress</Text>
      
      {analyticsData?.subjectProgress.map((subject, index) => (
        <View key={index} style={styles.subjectItem}>
          <View style={styles.subjectHeader}>
            <Text style={styles.subjectName}>{subject.subject}</Text>
            <View style={styles.subjectMeta}>
              <Ionicons 
                name={
                  subject.trend === 'up' ? 'trending-up' : 
                  subject.trend === 'down' ? 'trending-down' : 'remove'
                } 
                size={16} 
                color={
                  subject.trend === 'up' ? COLORS.success.main : 
                  subject.trend === 'down' ? COLORS.error.main : COLORS.grey[400]
                } 
              />
              <Text style={styles.subjectScore}>{subject.score}%</Text>
            </View>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${subject.progress}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{subject.progress}%</Text>
          </View>
          
          <Text style={styles.timeSpent}>{subject.timeSpent} minutes studied</Text>
        </View>
      ))}
    </Card>
  );

  const renderWeeklyActivity = () => (
    <Card variant="elevated" style={styles.activityCard}>
      <Text style={styles.cardTitle}>Weekly Activity</Text>
      
      <View style={styles.activityChart}>
        {analyticsData?.weeklyActivity.map((day, index) => {
          const maxMinutes = Math.max(...(analyticsData?.weeklyActivity.map(d => d.minutes) || [100]));
          const heightPercentage = (day.minutes / maxMinutes) * 100;
          
          return (
            <View key={index} style={styles.dayColumn}>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.activityBar, 
                    { height: `${heightPercentage}%` }
                  ]} 
                />
              </View>
              <Text style={styles.dayLabel}>{day.day}</Text>
              <Text style={styles.minutesLabel}>{day.minutes}m</Text>
            </View>
          );
        })}
      </View>
    </Card>
  );

  const renderInsightCard = (insight: InsightCard) => (
    <Card
      key={insight.id}
      variant="elevated"
      touchable
      onPress={() => generateInsight(insight)}
      style={styles.insightCard}
    >
      <View style={styles.insightHeader}>
        <View style={[styles.insightIcon, { backgroundColor: insight.color + '20' }]}>
          <Ionicons name={insight.icon as any} size={24} color={insight.color} />
        </View>
        <View style={styles.insightInfo}>
          <Text style={styles.insightTitle}>{insight.title}</Text>
          <Text style={styles.insightDescription}>{insight.description}</Text>
        </View>
        {insight.actionable && (
          <Ionicons name="chevron-forward" size={20} color={COLORS.grey[400]} />
        )}
      </View>
    </Card>
  );

  const renderInsightsModal = () => (
    <Modal
      visible={showInsights}
      onClose={() => setShowInsights(false)}
      title="AI Insights"
      position="center"
    >
      <ScrollView style={styles.insightsGrid} showsVerticalScrollIndicator={false}>
        <Text style={styles.insightsSubtitle}>
          Get personalized insights about your learning:
        </Text>
        
        {insightCards.map(renderInsightCard)}
      </ScrollView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Learning Analytics</Text>
          <Badge text="AI Powered" variant="info" size="small" />
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowInsights(true)}
          >
            <Ionicons name="bulb-outline" size={24} color={COLORS.background.light} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={loadAnalytics}
          >
            <Ionicons name="refresh-outline" size={24} color={COLORS.background.light} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Timeframe Selector */}
        <View style={styles.timeframeSelector}>
          {['week', 'month', '3months'].map((timeframe) => (
            <TouchableOpacity
              key={timeframe}
              style={[
                styles.timeframeButton,
                selectedTimeframe === timeframe && styles.timeframeButtonSelected
              ]}
              onPress={() => setSelectedTimeframe(timeframe)}
            >
              <Text style={[
                styles.timeframeText,
                selectedTimeframe === timeframe && styles.timeframeTextSelected
              ]}>
                {timeframe === 'week' ? 'This Week' : 
                 timeframe === 'month' ? 'This Month' : 'Last 3 Months'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <LoadingSpinner
            text="Loading analytics..."
            style={styles.loadingContainer}
          />
        ) : analyticsData ? (
          <View>
            {renderOverviewCard()}
            {renderSubjectProgress()}
            {renderWeeklyActivity()}
            
            {/* Insights Section */}
            <Card variant="elevated" style={styles.insightsPreview}>
              <View style={styles.insightsHeader}>
                <Text style={styles.cardTitle}>Quick Insights</Text>
                <Button
                  title="View All"
                  onPress={() => setShowInsights(true)}
                  variant="outline"
                  size="small"
                />
              </View>
              
              <View style={styles.quickInsights}>
                <View style={styles.insightRow}>
                  <Ionicons name="star" size={16} color={COLORS.success.main} />
                  <Text style={styles.insightText}>
                    Strong performance in Mathematics and English
                  </Text>
                </View>
                
                <View style={styles.insightRow}>
                  <Ionicons name="trending-up" size={16} color={COLORS.primary[600]} />
                  <Text style={styles.insightText}>
                    15% improvement this week
                  </Text>
                </View>
                
                <View style={styles.insightRow}>
                  <Ionicons name="time" size={16} color={COLORS.warning.main} />
                  <Text style={styles.insightText}>
                    Best study time: 6-8 PM
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons
                name="analytics-outline"
                size={64}
                color={COLORS.grey[400]}
              />
            </View>
            <Text style={styles.emptyTitle}>No Analytics Data</Text>
            <Text style={styles.emptySubtitle}>
              Start learning to see your progress and insights
            </Text>
            
            <Button
              title="Refresh Data"
              onPress={loadAnalytics}
              style={styles.refreshButton}
              icon="refresh-outline"
            />
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      {renderInsightsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light,
  },
  header: {
    backgroundColor: COLORS.secondary[600],
    paddingHorizontal: DIMS.SCREEN_PADDING,
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
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.background.light,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: DIMS.SCREEN_PADDING,
  },
  timeframeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: DIMS.BORDER_RADIUS,
    backgroundColor: COLORS.grey[100],
    borderWidth: 1,
    borderColor: COLORS.grey[200],
    alignItems: 'center',
  },
  timeframeButtonSelected: {
    backgroundColor: COLORS.secondary[50],
    borderColor: COLORS.secondary[600],
  },
  timeframeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  timeframeTextSelected: {
    color: COLORS.secondary[600],
    fontWeight: '600',
  },
  loadingContainer: {
    marginTop: 100,
  },
  overviewCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
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
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  growthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressCard: {
    marginBottom: 16,
  },
  subjectItem: {
    marginBottom: 16,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  subjectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subjectScore: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.grey[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.secondary[500],
    borderRadius: 4,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.secondary,
    minWidth: 40,
    textAlign: 'right',
  },
  timeSpent: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
  },
  activityCard: {
    marginBottom: 16,
  },
  activityChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    paddingHorizontal: 8,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 80,
    justifyContent: 'flex-end',
    width: 20,
  },
  activityBar: {
    backgroundColor: COLORS.secondary[500],
    borderRadius: 4,
    width: '100%',
    minHeight: 4,
  },
  dayLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginTop: 4,
    fontWeight: '600',
  },
  minutesLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  insightsPreview: {
    marginBottom: 16,
  },
  insightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  quickInsights: {
    gap: 12,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  insightText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    flex: 1,
  },
  insightsGrid: {
    maxHeight: 500,
  },
  insightsSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  insightCard: {
    marginBottom: 12,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightInfo: {
    flex: 1,
  },
  insightTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  insightDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
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
  refreshButton: {
    paddingHorizontal: 32,
  },
});

export default AIAnalyticsScreen;