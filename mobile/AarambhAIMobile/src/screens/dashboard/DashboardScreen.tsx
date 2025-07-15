import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, Button, LoadingSpinner } from '../../components/common';
import { COLORS, FONT_SIZES, DIMENSIONS as DIMS } from '../../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DashboardData {
  user: {
    name: string;
    level: string;
    streakDays: number;
    totalPoints: number;
  };
  todayActivity: {
    studyTime: number;
    sessionsCompleted: number;
    pointsEarned: number;
    goal: number;
  };
  recentSessions: {
    id: string;
    type: string;
    subject: string;
    duration: number;
    score?: number;
    timestamp: Date;
  }[];
  quickStats: {
    weeklyProgress: number;
    completedCourses: number;
    averageScore: number;
    rank: number;
  };
  recommendations: {
    id: string;
    title: string;
    description: string;
    type: 'study' | 'practice' | 'review';
    priority: 'high' | 'medium' | 'low';
  }[];
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  route: string;
  badge?: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'ai_tutor',
    title: 'AI Tutor',
    description: 'Get instant help',
    icon: 'school-outline',
    color: COLORS.primary[600],
    route: 'AITutor',
    badge: 'Popular'
  },
  {
    id: 'doubt_solver',
    title: 'Solve Doubts',
    description: 'Quick problem solving',
    icon: 'help-circle-outline',
    color: COLORS.success.main,
    route: 'AIDoubt'
  },
  {
    id: 'assessments',
    title: 'Practice Tests',
    description: 'Test your knowledge',
    icon: 'document-text-outline',
    color: COLORS.warning.main,
    route: 'AIAssessment'
  },
  {
    id: 'study_planner',
    title: 'Study Plan',
    description: 'Organize learning',
    icon: 'calendar-outline',
    color: COLORS.secondary[500],
    route: 'AIPlanner'
  }
];

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Mock data for demonstration
      const mockData: DashboardData = {
        user: {
          name: 'Ratnesh',
          level: 'Intermediate',
          streakDays: 7,
          totalPoints: 2450
        },
        todayActivity: {
          studyTime: 45,
          sessionsCompleted: 3,
          pointsEarned: 120,
          goal: 60
        },
        recentSessions: [
          {
            id: '1',
            type: 'AI Tutor',
            subject: 'Mathematics',
            duration: 25,
            score: 85,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            id: '2',
            type: 'Practice Test',
            subject: 'Physics',
            duration: 30,
            score: 78,
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
          },
          {
            id: '3',
            type: 'Doubt Solving',
            subject: 'Chemistry',
            duration: 15,
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
          }
        ],
        quickStats: {
          weeklyProgress: 75,
          completedCourses: 12,
          averageScore: 82,
          rank: 156
        },
        recommendations: [
          {
            id: '1',
            title: 'Review Physics Concepts',
            description: 'Your last test showed room for improvement in mechanics',
            type: 'review',
            priority: 'high'
          },
          {
            id: '2',
            title: 'Practice Math Problems',
            description: 'Keep up your excellent progress with daily practice',
            type: 'practice',
            priority: 'medium'
          }
        ]
      };

      setDashboardData(mockData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleQuickAction = (action: QuickAction) => {
    navigation.navigate(action.route as never);
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getTimeAgo = (date: Date): string => {
    const diffMs = Date.now() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  };

  const renderWelcomeSection = () => (
    <View style={styles.welcomeSection}>
      <Text style={styles.greeting}>Good {getGreeting()}, {dashboardData?.user.name}! 👋</Text>
      <Text style={styles.motivationalText}>Ready to continue your learning journey?</Text>
      
      <View style={styles.streakContainer}>
        <View style={styles.streakItem}>
          <Ionicons name="flame" size={20} color={COLORS.warning.main} />
          <Text style={styles.streakText}>{dashboardData?.user.streakDays} day streak</Text>
        </View>
        
        <View style={styles.streakItem}>
          <Ionicons name="star" size={20} color={COLORS.secondary[500]} />
          <Text style={styles.streakText}>{dashboardData?.user.totalPoints} points</Text>
        </View>
        
        <Badge text={dashboardData?.user.level || 'Beginner'} variant="info" size="small" />
      </View>
    </View>
  );

  const renderTodayProgress = () => (
    <Card variant="elevated" style={styles.progressCard}>
      <Text style={styles.cardTitle}>Today's Progress</Text>
      
      <View style={styles.progressStats}>
        <View style={styles.progressItem}>
          <Text style={styles.progressValue}>{formatTime(dashboardData?.todayActivity.studyTime || 0)}</Text>
          <Text style={styles.progressLabel}>Study Time</Text>
          <Text style={styles.progressGoal}>Goal: {formatTime(dashboardData?.todayActivity.goal || 60)}</Text>
        </View>
        
        <View style={styles.progressItem}>
          <Text style={styles.progressValue}>{dashboardData?.todayActivity.sessionsCompleted}</Text>
          <Text style={styles.progressLabel}>Sessions</Text>
        </View>
        
        <View style={styles.progressItem}>
          <Text style={styles.progressValue}>+{dashboardData?.todayActivity.pointsEarned}</Text>
          <Text style={styles.progressLabel}>Points</Text>
        </View>
      </View>
      
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${Math.min(100, ((dashboardData?.todayActivity.studyTime || 0) / (dashboardData?.todayActivity.goal || 60)) * 100)}%` 
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round(((dashboardData?.todayActivity.studyTime || 0) / (dashboardData?.todayActivity.goal || 60)) * 100)}% of daily goal
        </Text>
      </View>
    </Card>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsSection}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      
      <View style={styles.actionsGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionCard}
            onPress={() => handleQuickAction(action)}
          >
            <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
              <Ionicons name={action.icon as any} size={24} color={action.color} />
            </View>
            <Text style={styles.actionTitle}>{action.title}</Text>
            <Text style={styles.actionDescription}>{action.description}</Text>
            {action.badge && (
              <Badge text={action.badge} variant="warning" size="small" style={styles.actionBadge} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderRecentActivity = () => (
    <Card variant="elevated" style={styles.activityCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Recent Activity</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AIAnalytics' as never)}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      {dashboardData?.recentSessions.map((session) => (
        <View key={session.id} style={styles.sessionItem}>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionType}>{session.type}</Text>
            <Text style={styles.sessionSubject}>{session.subject}</Text>
            <Text style={styles.sessionTime}>{getTimeAgo(session.timestamp)}</Text>
          </View>
          
          <View style={styles.sessionMeta}>
            <Text style={styles.sessionDuration}>{formatTime(session.duration)}</Text>
            {session.score && (
              <Badge 
                text={`${session.score}%`} 
                variant={session.score >= 80 ? "success" : session.score >= 60 ? "warning" : "error"} 
                size="small" 
              />
            )}
          </View>
        </View>
      ))}
    </Card>
  );

  const renderQuickStats = () => (
    <Card variant="elevated" style={styles.statsCard}>
      <Text style={styles.cardTitle}>Quick Stats</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{dashboardData?.quickStats.weeklyProgress}%</Text>
          <Text style={styles.statLabel}>Weekly Progress</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{dashboardData?.quickStats.completedCourses}</Text>
          <Text style={styles.statLabel}>Courses Done</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{dashboardData?.quickStats.averageScore}%</Text>
          <Text style={styles.statLabel}>Avg Score</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>#{dashboardData?.quickStats.rank}</Text>
          <Text style={styles.statLabel}>Rank</Text>
        </View>
      </View>
    </Card>
  );

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner text="Loading dashboard..." />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {renderWelcomeSection()}
      {renderTodayProgress()}
      {renderQuickActions()}
      {renderRecentActivity()}
      {renderQuickStats()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light,
  },
  content: {
    padding: DIMS.SCREEN_PADDING,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeSection: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  motivationalText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    marginBottom: 16,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  streakItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  progressCard: {
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  progressItem: {
    alignItems: 'center',
  },
  progressValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  progressLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  progressGoal: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  progressBarContainer: {
    marginTop: 8,
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
  quickActionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (SCREEN_WIDTH - DIMS.SCREEN_PADDING * 2 - 12) / 2,
    backgroundColor: COLORS.background.light,
    borderRadius: DIMS.BORDER_RADIUS,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.grey[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  actionBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  activityCard: {
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary[600],
    fontWeight: '600',
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[100],
  },
  sessionInfo: {
    flex: 1,
  },
  sessionType: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  sessionSubject: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  sessionTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  sessionMeta: {
    alignItems: 'flex-end',
    gap: 8,
  },
  sessionDuration: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  statsCard: {
    marginBottom: 24,
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
    paddingVertical: 12,
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default DashboardScreen;