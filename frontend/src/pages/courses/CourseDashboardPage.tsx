import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  Divider,
  Container,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Quiz as QuizIcon,
  MenuBook as LessonsIcon,
  SportsEsports as GamesIcon,
  People as CommunityIcon,
  Analytics as AnalyticsIcon,
  Folder as ContentIcon,
  School as CourseIcon,
  Person as ProfileIcon,
  Work as WorkspaceIcon,
  LocalFireDepartment as StreakIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendingIcon,
  EmojiEvents as AchievementIcon,
  Notifications as NotificationIcon,
  Group as GroupIcon,
  CheckCircle as CompletedIcon,
} from '@mui/icons-material';
import { ROUTES } from '@/utils/constants';

interface CourseProgress {
  courseId: string;
  courseName: string;
  subject: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  lastAccessed: string;
  timeRemaining: string;
  currentLesson: {
    id: string;
    title: string;
    type: 'video' | 'quiz' | 'assignment';
  };
}

interface StudentStats {
  currentStreak: number;
  totalStudyTime: number;
  todayStudyTime: number;
  weeklyGoal: number;
  weeklyProgress: number;
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  type: 'streak' | 'completion' | 'time' | 'social';
}

interface RecentActivity {
  id: string;
  type: 'lesson_completed' | 'quiz_completed' | 'achievement_unlocked' | 'group_joined';
  title: string;
  description: string;
  timestamp: string;
  score?: number;
  icon: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  color: string;
}

// Mock courses data - different courses based on ID
const getMockCourseProgress = (courseId: string): CourseProgress => {
  const courses: Record<string, CourseProgress> = {
    '1': {
      courseId: '1',
      courseName: 'Advanced Mathematics',
      subject: 'Mathematics',
      progress: 75,
      totalLessons: 32,
      completedLessons: 24,
      lastAccessed: '1 hour ago',
      timeRemaining: '20 min remaining',
      currentLesson: {
        id: 'calc-8',
        title: 'Differential Equations',
        type: 'video'
      }
    },
    '2': {
      courseId: '2',
      courseName: 'Physics Fundamentals',
      subject: 'Physics',
      progress: 45,
      totalLessons: 28,
      completedLessons: 13,
      lastAccessed: '3 hours ago',
      timeRemaining: '35 min remaining',
      currentLesson: {
        id: 'phys-7',
        title: 'Newton\'s Laws of Motion',
        type: 'video'
      }
    },
    '3': {
      courseId: '3',
      courseName: 'Chemistry Basics',
      subject: 'Chemistry',
      progress: 90,
      totalLessons: 20,
      completedLessons: 18,
      lastAccessed: '30 min ago',
      timeRemaining: '10 min remaining',
      currentLesson: {
        id: 'chem-19',
        title: 'Organic Reactions',
        type: 'quiz'
      }
    }
  };
  
  return courses[courseId] || courses['1']; // Default to course 1 if not found
};

const mockStudentStats: StudentStats = {
  currentStreak: 12,
  totalStudyTime: 156, // hours
  todayStudyTime: 2.5, // hours
  weeklyGoal: 20, // hours
  weeklyProgress: 75, // percentage
  achievements: [
    {
      id: 'week-warrior',
      title: 'Week Warrior',
      description: '7-day study streak',
      icon: '🏆',
      unlockedAt: '2 days ago',
      type: 'streak'
    },
    {
      id: 'physics-master',
      title: 'Physics Master',
      description: 'Completed 5 physics chapters',
      icon: '⚡',
      unlockedAt: '1 week ago',
      type: 'completion'
    }
  ]
};

const getMockRecentActivity = (courseId: string): RecentActivity[] => {
  const activities: Record<string, RecentActivity[]> = {
    '1': [
      {
        id: '1',
        type: 'lesson_completed',
        title: 'Completed "Differential Equations"',
        description: 'Scored 92% in the chapter quiz',
        timestamp: '1 hour ago',
        score: 92,
        icon: '✅'
      },
      {
        id: '2',
        type: 'achievement_unlocked',
        title: 'Achievement: "Math Master"',
        description: 'Completed 20 mathematics lessons',
        timestamp: '1 day ago',
        icon: '🏆'
      }
    ],
    '2': [
      {
        id: '1',
        type: 'lesson_completed',
        title: 'Completed "Newton\'s Laws"',
        description: 'Scored 78% in the chapter quiz',
        timestamp: '3 hours ago',
        score: 78,
        icon: '✅'
      },
      {
        id: '2',
        type: 'group_joined',
        title: 'Joined "Physics Study Group"',
        description: 'Connected with 12 physics students',
        timestamp: '2 days ago',
        icon: '👥'
      }
    ],
    '3': [
      {
        id: '1',
        type: 'lesson_completed',
        title: 'Completed "Organic Chemistry"',
        description: 'Scored 96% in the chapter quiz',
        timestamp: '30 min ago',
        score: 96,
        icon: '✅'
      },
      {
        id: '2',
        type: 'achievement_unlocked',
        title: 'Achievement: "Chemistry Expert"',
        description: 'Achieved 90%+ in 5 consecutive quizzes',
        timestamp: '2 hours ago',
        icon: '🏆'
      }
    ]
  };
  
  return activities[courseId] || activities['1'];
};

const quickActions: QuickAction[] = [
  {
    id: 'lessons',
    title: 'Lessons',
    description: 'Continue learning',
    icon: <LessonsIcon />,
    route: ROUTES.LESSONS || '/lessons',
    color: '#1976d2'
  },
  {
    id: 'practice',
    title: 'Practice',
    description: 'Take tests & quizzes',
    icon: <QuizIcon />,
    route: ROUTES.PRACTICE || '/practice',
    color: '#388e3c'
  },
  {
    id: 'games',
    title: 'Games',
    description: 'Create & play games',
    icon: <GamesIcon />,
    route: ROUTES.GAMES || '/games',
    color: '#f57c00'
  },
  {
    id: 'community',
    title: 'Community',
    description: 'Connect with peers',
    icon: <CommunityIcon />,
    route: ROUTES.COMMUNITY || '/community',
    color: '#7b1fa2'
  },
  {
    id: 'workspace',
    title: 'Workspace',
    description: 'Collaborate on projects',
    icon: <WorkspaceIcon />,
    route: ROUTES.WORKSPACE || '/workspace',
    color: '#d32f2f'
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'Track your progress',
    icon: <AnalyticsIcon />,
    route: ROUTES.ANALYTICS,
    color: '#1976d2'
  },
  {
    id: 'courses',
    title: 'Courses',
    description: 'Manage enrollments',
    icon: <CourseIcon />,
    route: ROUTES.COURSES,
    color: '#388e3c'
  },
  {
    id: 'content',
    title: 'Content Library',
    description: 'Browse resources',
    icon: <ContentIcon />,
    route: ROUTES.CONTENT || '/content',
    color: '#f57c00'
  }
];

const CourseDashboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);
  const [studentStats] = useState<StudentStats>(mockStudentStats);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    // Simulate API call to load dashboard data for specific course
    if (id) {
      setTimeout(() => {
        setCourseProgress(getMockCourseProgress(id));
        setRecentActivity(getMockRecentActivity(id));
        setLoading(false);
      }, 1000);
    }
  }, [id]);

  const handleQuickAction = (route: string) => {
    navigate(route);
  };

  const handleContinueLearning = () => {
    if (courseProgress) {
      navigate(`/courses/${courseProgress.courseId}/lessons/${courseProgress.currentLesson.id}`);
    }
  };

  const handleTakeQuiz = () => {
    if (courseProgress) {
      navigate(`/courses/${courseProgress.courseId}/quiz`);
    }
  };

  if (loading || !courseProgress) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
          Welcome Back, Student! 👋
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Today's Goal: Complete 2 lessons in {courseProgress.courseName}
        </Typography>
      </Box>

      {/* Progress Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                {courseProgress.courseName}
              </Typography>
              <Typography variant="h3" color="primary" fontWeight={600}>
                {courseProgress.progress}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Complete
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={courseProgress.progress} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <StreakIcon sx={{ color: 'orange', mr: 1 }} />
                <Typography variant="h6">Current Streak</Typography>
              </Box>
              <Typography variant="h3" color="orange" fontWeight={600}>
                {studentStats.currentStreak}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <TimeIcon sx={{ color: 'green', mr: 1 }} />
                <Typography variant="h6">Study Time</Typography>
              </Box>
              <Typography variant="h3" color="green" fontWeight={600}>
                {studentStats.todayStudyTime}h
              </Typography>
              <Typography variant="body2" color="text.secondary">
                today
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Continue Learning Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            📚 CONTINUE LEARNING
          </Typography>
          <Paper sx={{ p: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {courseProgress.currentLesson.title}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                  Last accessed: {courseProgress.lastAccessed} | {courseProgress.timeRemaining}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button 
                    variant="contained" 
                    color="secondary"
                    startIcon={<PlayIcon />}
                    onClick={handleContinueLearning}
                  >
                    Continue Lesson
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="inherit"
                    startIcon={<QuizIcon />}
                    onClick={handleTakeQuiz}
                  >
                    Take Quiz
                  </Button>
                </Box>
              </Box>
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: 'secondary.main' }}>
                  <LessonsIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </Box>
          </Paper>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            🚀 QUICK ACTIONS
          </Typography>
          <Grid container spacing={2}>
            {quickActions.map((action) => (
              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={action.id}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    border: `2px solid ${action.color}`,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                      bgcolor: `${action.color}15`
                    }
                  }}
                  onClick={() => handleQuickAction(action.route)}
                >
                  <Box sx={{ color: action.color, mb: 1 }}>
                    {action.icon}
                  </Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {action.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {action.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Recent Activity & Achievements */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                📈 RECENT ACTIVITY & ACHIEVEMENTS
              </Typography>
              <List>
                {recentActivity.map((activity) => (
                  <React.Fragment key={activity.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {activity.icon}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.title}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {activity.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {activity.timestamp}
                            </Typography>
                          </Box>
                        }
                      />
                      {activity.score && (
                        <Chip 
                          label={`${activity.score}%`} 
                          color={activity.score >= 80 ? 'success' : activity.score >= 60 ? 'warning' : 'error'}
                          size="small"
                        />
                      )}
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                🏆 Achievements
              </Typography>
              {studentStats.achievements.map((achievement) => (
                <Paper key={achievement.id} sx={{ p: 2, mb: 2, bgcolor: 'success.light' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h5" sx={{ mr: 1 }}>
                      {achievement.icon}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {achievement.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {achievement.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Unlocked {achievement.unlockedAt}
                  </Typography>
                </Paper>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CourseDashboardPage;