import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  Psychology as AIIcon,
  Quiz as QuizIcon,
  Book as BookIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Mock data - replace with real data from API
  const stats = {
    coursesEnrolled: 8,
    coursesCompleted: 3,
    totalStudyTime: 42,
    averageScore: 87,
    currentStreak: 7,
  };

  const recentActivities = [
    {
      id: 1,
      type: 'ai_session',
      title: 'AI Tutor Session',
      description: 'Completed math problem solving with AI',
      time: '2 hours ago',
      icon: <AIIcon color="primary" />,
    },
    {
      id: 2,
      type: 'course',
      title: 'Physics Course Progress',
      description: 'Completed Chapter 5: Motion in a Plane',
      time: '5 hours ago',
      icon: <BookIcon color="success" />,
    },
    {
      id: 3,
      type: 'assessment',
      title: 'Chemistry Quiz',
      description: 'Scored 92% in Organic Chemistry quiz',
      time: '1 day ago',
      icon: <QuizIcon color="warning" />,
    },
  ];

  const quickActions = [
    {
      title: 'Ask AI Tutor',
      description: 'Get instant help with any topic',
      icon: <AIIcon />,
      color: 'primary',
      path: ROUTES.AI_TUTOR,
    },
    {
      title: 'Create Content',
      description: 'Generate study materials with AI',
      icon: <BookIcon />,
      color: 'success',
      path: ROUTES.AI_CONTENT,
    },
    {
      title: 'Take Assessment',
      description: 'Test your knowledge',
      icon: <QuizIcon />,
      color: 'warning',
      path: ROUTES.AI_ASSESSMENT,
    },
    {
      title: 'Plan Study',
      description: 'Create study schedule',
      icon: <ScheduleIcon />,
      color: 'info',
      path: ROUTES.STUDY_PLANNER,
    },
  ];

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
          Welcome back, Student! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's your learning overview for today
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" fontWeight={600}>
                {stats.coursesEnrolled}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Courses Enrolled
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" fontWeight={600}>
                {stats.coursesCompleted}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Courses Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" fontWeight={600}>
                {stats.totalStudyTime}h
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Study Time
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" fontWeight={600}>
                {stats.averageScore}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main" fontWeight={600}>
                {stats.currentStreak}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Day Streak
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                {quickActions.map((action, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card
                      variant="outlined"
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 2,
                        },
                      }}
                      onClick={() => navigate(action.path)}
                    >
                      <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                        <Avatar sx={{ bgcolor: `${action.color}.main`, mr: 2 }}>
                          {action.icon}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {action.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {action.description}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Progress Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Learning Progress
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Mathematics</Typography>
                  <Typography variant="body2" color="text.secondary">75%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={75} />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Physics</Typography>
                  <Typography variant="body2" color="text.secondary">60%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={60} />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Chemistry</Typography>
                  <Typography variant="body2" color="text.secondary">85%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={85} />
              </Box>

              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate(ROUTES.ANALYTICS)}
              >
                View Detailed Analytics
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Recent Activities
              </Typography>
              <List>
                {recentActivities.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'background.default' }}>
                          {activity.icon}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.title}
                        secondary={
                          <>
                            <Typography component="span" variant="body2">
                              {activity.description}
                            </Typography>
                            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                              • {activity.time}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;