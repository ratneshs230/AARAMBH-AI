import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
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
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
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
  Work as WorkspaceIcon,
  LocalFireDepartment as StreakIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendingIcon,
  EmojiEvents as AchievementIcon,
  CheckCircle as CompletedIcon,
  RadioButtonUnchecked as UncheckedIcon,
  ExpandMore as ExpandMoreIcon,
  Psychology as AIIcon,
  Schedule as ScheduleIcon,
  Book as BookIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { ROUTES } from '@/utils/constants';

interface Course {
  id: string;
  name: string;
  subject: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  instructor: string;
  nextClass?: string;
  lastAccessed: string;
  timeRemaining: string;
  currentLesson: {
    id: string;
    title: string;
    type: 'video' | 'quiz' | 'assignment' | 'reading';
  };
}

interface DailyActivity {
  id: string;
  type: 'video' | 'reading' | 'assignment' | 'quiz';
  title: string;
  duration: string;
  isCompleted: boolean;
  description: string;
}

interface StudentStats {
  currentStreak: number;
  totalStudyTime: number;
  todayStudyTime: number;
  weeklyGoal: number;
  weeklyProgress: number;
  coursesEnrolled: number;
  coursesCompleted: number;
  averageScore: number;
}

interface RecentActivity {
  id: string;
  type: 'lesson_completed' | 'quiz_completed' | 'achievement_unlocked' | 'ai_session' | 'course';
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

const mockCourses: Record<string, Course> = {
  '1': {
    id: '1',
    name: 'Advanced Mathematics',
    subject: 'Mathematics',
    progress: 75,
    totalLessons: 32,
    completedLessons: 24,
    instructor: 'Dr. Priya Sharma',
    nextClass: 'Today at 3:00 PM',
    lastAccessed: '1 hour ago',
    timeRemaining: '20 min remaining',
    currentLesson: {
      id: 'calc-8',
      title: 'Differential Equations',
      type: 'video'
    }
  },
  '2': {
    id: '2',
    name: 'Physics Fundamentals',
    subject: 'Physics',
    progress: 45,
    totalLessons: 28,
    completedLessons: 13,
    instructor: 'Prof. Rajesh Kumar',
    nextClass: 'Tomorrow at 10:00 AM',
    lastAccessed: '3 hours ago',
    timeRemaining: '35 min remaining',
    currentLesson: {
      id: 'phys-7',
      title: 'Newton\'s Laws of Motion',
      type: 'video'
    }
  },
  '3': {
    id: '3',
    name: 'Chemistry Basics',
    subject: 'Chemistry',
    progress: 90,
    totalLessons: 20,
    completedLessons: 18,
    instructor: 'Dr. Anita Verma',
    nextClass: 'Wednesday at 2:00 PM',
    lastAccessed: '30 min ago',
    timeRemaining: '10 min remaining',
    currentLesson: {
      id: 'chem-19',
      title: 'Organic Reactions',
      type: 'quiz'
    }
  }
};

const mockStats: StudentStats = {
  currentStreak: 12,
  totalStudyTime: 156,
  todayStudyTime: 2.5,
  weeklyGoal: 20,
  weeklyProgress: 75,
  coursesEnrolled: 8,
  coursesCompleted: 3,
  averageScore: 87,
};

const quickActions: QuickAction[] = [
  {
    id: 'ai_tutor',
    title: 'AI Tutor',
    description: 'Get instant help',
    icon: <AIIcon />,
    route: ROUTES.AI_TUTOR,
    color: '#1976d2'
  },
  {
    id: 'practice',
    title: 'Practice',
    description: 'Take tests & quizzes',
    icon: <QuizIcon />,
    route: ROUTES.PRACTICE,
    color: '#388e3c'
  },
  {
    id: 'games',
    title: 'Games',
    description: 'Create & play games',
    icon: <GamesIcon />,
    route: ROUTES.GAMES,
    color: '#f57c00'
  },
  {
    id: 'community',
    title: 'Community',
    description: 'Connect with peers',
    icon: <CommunityIcon />,
    route: ROUTES.COMMUNITY,
    color: '#7b1fa2'
  },
  {
    id: 'study_planner',
    title: 'Study Planner',
    description: 'Plan your schedule',
    icon: <ScheduleIcon />,
    route: ROUTES.STUDY_PLANNER,
    color: '#d32f2f'
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'Track progress',
    icon: <AnalyticsIcon />,
    route: ROUTES.ANALYTICS,
    color: '#1976d2'
  },
];

const UnifiedDashboardPage: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [allCourses] = useState<Course[]>(Object.values(mockCourses));
  const [todaysPlan, setTodaysPlan] = useState<DailyActivity[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    // Redirect to course selection if no course ID is provided
    if (!courseId) {
      navigate('/dashboard');
      return;
    }

    setTimeout(() => {
      if (mockCourses[courseId]) {
        setSelectedCourse(mockCourses[courseId]);
        setTodaysPlan(getMockTodaysPlan(courseId));
        setRecentActivity(getMockRecentActivity(courseId));
      } else {
        // If course doesn't exist, redirect to course selection
        navigate('/dashboard');
        return;
      }
      setLoading(false);
    }, 1000);
  }, [courseId, navigate]);

  const getMockTodaysPlan = (courseId: string): DailyActivity[] => {
    const plans: Record<string, DailyActivity[]> = {
      '1': [
        {
          id: '1',
          type: 'video',
          title: 'Differential Equations - Introduction',
          duration: '25 min',
          isCompleted: true,
          description: 'Learn the basics of differential equations'
        },
        {
          id: '2',
          type: 'reading',
          title: 'Chapter 8: Differential Equations',
          duration: '15 min',
          isCompleted: true,
          description: 'Read through theoretical concepts'
        },
        {
          id: '3',
          type: 'video',
          title: 'Solving First Order Equations',
          duration: '30 min',
          isCompleted: false,
          description: 'Methods for solving first order equations'
        },
        {
          id: '4',
          type: 'assignment',
          title: 'Practice Problems Set 8A',
          duration: '45 min',
          isCompleted: false,
          description: '15 practice problems'
        }
      ],
      '2': [
        {
          id: '1',
          type: 'video',
          title: 'Newton\'s Laws - Part 1',
          duration: '20 min',
          isCompleted: true,
          description: 'Understanding the first law of motion'
        },
        {
          id: '2',
          type: 'quiz',
          title: 'Laws of Motion Quiz',
          duration: '15 min',
          isCompleted: false,
          description: '10 questions on Newton\'s laws'
        }
      ],
      '3': [
        {
          id: '1',
          type: 'video',
          title: 'Organic Reactions Overview',
          duration: '35 min',
          isCompleted: false,
          description: 'Introduction to organic chemistry reactions'
        }
      ]
    };
    return plans[courseId] || [];
  };

  const getMockRecentActivity = (courseId: string): RecentActivity[] => {
    const activities: Record<string, RecentActivity[]> = {
      '1': [
        {
          id: '1',
          type: 'lesson_completed',
          title: 'Completed "Differential Equations"',
          description: 'Scored 92% in chapter quiz',
          timestamp: '1 hour ago',
          score: 92,
          icon: '✅'
        }
      ],
      '2': [
        {
          id: '1',
          type: 'lesson_completed',
          title: 'Completed "Newton\'s Laws"',
          description: 'Scored 78% in chapter quiz',
          timestamp: '3 hours ago',
          score: 78,
          icon: '✅'
        }
      ],
      '3': [
        {
          id: '1',
          type: 'lesson_completed',
          title: 'Completed "Organic Chemistry"',
          description: 'Scored 96% in chapter quiz',
          timestamp: '30 min ago',
          score: 96,
          icon: '✅'
        }
      ]
    };
    return activities[courseId] || [];
  };

  const getMockGeneralActivity = (): RecentActivity[] => [
    {
      id: '1',
      type: 'ai_session',
      title: 'AI Tutor Session',
      description: 'Completed math problem solving with AI',
      timestamp: '2 hours ago',
      icon: '🤖'
    },
    {
      id: '2',
      type: 'course',
      title: 'Physics Course Progress',
      description: 'Completed Chapter 5: Motion in a Plane',
      timestamp: '5 hours ago',
      icon: '📚'
    }
  ];

  const handleCourseSelect = (course: Course) => {
    setAnchorEl(null);
    navigate(`/dashboard/${course.id}`);
  };

  const handleBackToCourseSelection = () => {
    navigate('/dashboard');
  };

  const handleActivityClick = (activity: DailyActivity) => {
    if (!selectedCourse) return;
    
    switch (activity.type) {
      case 'video':
        navigate(`/courses/${selectedCourse.id}/lessons/${activity.id}`);
        break;
      case 'reading':
        navigate(`/courses/${selectedCourse.id}/materials/${activity.id}`);
        break;
      case 'assignment':
        navigate(`/courses/${selectedCourse.id}/assignments/${activity.id}`);
        break;
      case 'quiz':
        navigate(`/courses/${selectedCourse.id}/quiz/${activity.id}`);
        break;
    }
  };

  const toggleActivityCompletion = (activityId: string) => {
    setTodaysPlan(prevPlan =>
      prevPlan.map(activity =>
        activity.id === activityId
          ? { ...activity, isCompleted: !activity.isCompleted }
          : activity
      )
    );
  };

  const getActivityIcon = (type: string, isCompleted: boolean) => {
    const iconColor = isCompleted ? 'success' : 'action';
    switch (type) {
      case 'video':
        return <PlayIcon color={iconColor} />;
      case 'reading':
        return <BookIcon color={iconColor} />;
      case 'assignment':
        return <AssignmentIcon color={iconColor} />;
      case 'quiz':
        return <QuizIcon color={iconColor} />;
      default:
        return <BookIcon color={iconColor} />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Skeleton variant="text" width="60%" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="40%" height={30} sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          {[...Array(6)].map((_, i) => (
            <Grid key={i} size={{ xs: 12, md: 4 }}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  const completedActivities = todaysPlan.filter(activity => activity.isCompleted).length;
  const totalActivities = todaysPlan.length;
  const progressPercentage = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header with Course Selection */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h4" component="h1" fontWeight={600}>
            {selectedCourse?.name} Dashboard 👋
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleBackToCourseSelection}
            >
              ← Back to Courses
            </Button>
            <Button
              variant="outlined"
              endIcon={<ExpandMoreIcon />}
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              Switch Course
            </Button>
          </Box>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            {allCourses.map((course) => (
              <MenuItem
                key={course.id}
                onClick={() => handleCourseSelect(course)}
                selected={selectedCourse?.id === course.id}
              >
                <Box>
                  <Typography variant="subtitle2">{course.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {course.subject} • {course.progress}% complete
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Menu>
        </Box>
        
        <Typography variant="h6" color="text.secondary">
          Today's Plan: {totalActivities > 0 ? `Complete ${totalActivities - completedActivities} remaining activities` : 'All caught up! Great work!'}
        </Typography>
      </Box>

      {/* Course-specific header */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)' }}>
        <CardContent sx={{ color: 'white' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                📚 {selectedCourse?.subject} • 👨‍🏫 {selectedCourse?.instructor}
              </Typography>
              {selectedCourse?.nextClass && (
                <Typography variant="h6" gutterBottom>
                  ⏰ Next class: {selectedCourse.nextClass}
                </Typography>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                <Typography variant="body1">
                  Course Progress: {selectedCourse?.progress}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={selectedCourse?.progress || 0}
                  sx={{
                    flexGrow: 1,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 'white',
                    },
                  }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {selectedCourse?.completedLessons}/{selectedCourse?.totalLessons} lessons
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<PlayIcon />}
                  sx={{ mt: 1 }}
                  onClick={() => selectedCourse && navigate(`/courses/${selectedCourse.id}/lessons/${selectedCourse.currentLesson.id}`)}
                >
                  Continue Learning
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" fontWeight={600}>
                {selectedCourse?.progress}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Course Progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <StreakIcon sx={{ color: 'orange', fontSize: 32, mb: 1 }} />
              <Typography variant="h4" color="orange" fontWeight={600}>
                {mockStats.currentStreak}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Day Streak
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TimeIcon sx={{ color: 'green', fontSize: 32, mb: 1 }} />
              <Typography variant="h4" color="green" fontWeight={600}>
                {mockStats.todayStudyTime}h
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Today's Study Time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Today's Plan */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight={600}>
                  📅 Today's Plan
                </Typography>
                <Chip
                  label={`${completedActivities}/${totalActivities} Complete`}
                  color={completedActivities === totalActivities ? 'success' : 'primary'}
                  variant="outlined"
                />
              </Box>

              {totalActivities > 0 ? (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Daily Progress
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {Math.round(progressPercentage)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progressPercentage}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <List>
                    {todaysPlan.map((activity) => (
                      <ListItem
                        key={activity.id}
                        sx={{
                          borderRadius: 2,
                          mb: 1,
                          bgcolor: activity.isCompleted ? 'success.light' : 'background.paper',
                          border: '1px solid',
                          borderColor: activity.isCompleted ? 'success.main' : 'divider',
                          opacity: activity.isCompleted ? 0.8 : 1,
                        }}
                      >
                        <ListItemIcon>
                          <IconButton
                            size="small"
                            onClick={() => toggleActivityCompletion(activity.id)}
                            color={activity.isCompleted ? 'success' : 'default'}
                          >
                            {activity.isCompleted ? <CompletedIcon /> : <UncheckedIcon />}
                          </IconButton>
                        </ListItemIcon>
                        
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            {getActivityIcon(activity.type, activity.isCompleted)}
                            <Typography
                              variant="h6"
                              sx={{
                                textDecoration: activity.isCompleted ? 'line-through' : 'none',
                                fontWeight: activity.isCompleted ? 400 : 600,
                              }}
                            >
                              {activity.title}
                            </Typography>
                            <Chip
                              label={activity.duration}
                              size="small"
                              variant="outlined"
                              icon={<TimeIcon />}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {activity.description}
                          </Typography>
                        </Box>

                        <Button
                          variant={activity.isCompleted ? 'outlined' : 'contained'}
                          size="small"
                          onClick={() => handleActivityClick(activity)}
                          disabled={activity.isCompleted}
                        >
                          {activity.isCompleted ? 'Review' : 'Start'}
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    🎉 All activities completed for today!
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Great job! You're all caught up with today's plan.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => selectedCourse && navigate(`/courses/${selectedCourse.id}/lessons`)}
                  >
                    Continue with Next Lesson
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions and Recent Activity */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                🚀 Quick Actions
              </Typography>
              <Grid container spacing={2}>
                {quickActions.map((action) => (
                  <Grid size={{ xs: 6 }} key={action.id}>
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
                      onClick={() => navigate(action.route)}
                    >
                      <Box sx={{ color: action.color, mb: 1 }}>
                        {action.icon}
                      </Box>
                      <Typography variant="caption" fontWeight={600}>
                        {action.title}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                📈 Recent Activity
              </Typography>
              <List>
                {recentActivity.map((activity) => (
                  <React.Fragment key={activity.id}>
                    <ListItem sx={{ px: 0 }}>
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
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UnifiedDashboardPage;