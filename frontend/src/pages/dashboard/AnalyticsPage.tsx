import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  School as SubjectIcon,
  Timer as TimeIcon,
  Assessment as AssessmentIcon,
  EmojiEvents as AchievementIcon,
  Psychology as AIIcon,
  Book as StudyIcon,
} from '@mui/icons-material';

interface AnalyticsData {
  overallStats: {
    totalStudyTime: number;
    averageScore: number;
    coursesCompleted: number;
    currentStreak: number;
  };
  subjectPerformance: {
    subject: string;
    progress: number;
    averageScore: number;
    timeSpent: number;
    trend: 'up' | 'down' | 'stable';
    color: string;
  }[];
  weeklyActivity: {
    day: string;
    studyTime: number;
    sessionsCount: number;
  }[];
  recentAchievements: {
    id: string;
    title: string;
    description: string;
    date: string;
    type: 'milestone' | 'streak' | 'score' | 'completion';
    icon: React.ReactElement;
  }[];
  aiInteractions: {
    agent: string;
    interactions: number;
    averageRating: number;
    mostUsedFeature: string;
  }[];
  studyPatterns: {
    peakStudyTime: string;
    averageSessionLength: number;
    preferredSubjects: string[];
    learningStyle: string;
  };
}

// Mock analytics data
const mockAnalyticsData: AnalyticsData = {
  overallStats: {
    totalStudyTime: 120, // hours
    averageScore: 87,
    coursesCompleted: 3,
    currentStreak: 7,
  },
  subjectPerformance: [
    {
      subject: 'Mathematics',
      progress: 85,
      averageScore: 92,
      timeSpent: 45,
      trend: 'up',
      color: '#1976d2',
    },
    {
      subject: 'Physics',
      progress: 72,
      averageScore: 78,
      timeSpent: 38,
      trend: 'up',
      color: '#388e3c',
    },
    {
      subject: 'Chemistry',
      progress: 68,
      averageScore: 85,
      timeSpent: 32,
      trend: 'stable',
      color: '#f57c00',
    },
    {
      subject: 'Biology',
      progress: 45,
      averageScore: 80,
      timeSpent: 28,
      trend: 'down',
      color: '#7b1fa2',
    },
  ],
  weeklyActivity: [
    { day: 'Mon', studyTime: 4.5, sessionsCount: 3 },
    { day: 'Tue', studyTime: 3.2, sessionsCount: 2 },
    { day: 'Wed', studyTime: 5.1, sessionsCount: 4 },
    { day: 'Thu', studyTime: 2.8, sessionsCount: 2 },
    { day: 'Fri', studyTime: 4.0, sessionsCount: 3 },
    { day: 'Sat', studyTime: 6.2, sessionsCount: 5 },
    { day: 'Sun', studyTime: 3.5, sessionsCount: 3 },
  ],
  recentAchievements: [
    {
      id: '1',
      title: '7-Day Streak!',
      description: 'Completed study sessions for 7 consecutive days',
      date: '2 hours ago',
      type: 'streak',
      icon: <AchievementIcon color='warning' />,
    },
    {
      id: '2',
      title: 'Mathematics Master',
      description: 'Scored 95% in Mathematics assessment',
      date: '1 day ago',
      type: 'score',
      icon: <AssessmentIcon color='success' />,
    },
    {
      id: '3',
      title: 'Course Completed',
      description: 'Finished "Advanced Calculus" course',
      date: '3 days ago',
      type: 'completion',
      icon: <StudyIcon color='primary' />,
    },
  ],
  aiInteractions: [
    {
      agent: 'AI Tutor',
      interactions: 45,
      averageRating: 4.8,
      mostUsedFeature: 'Problem Solving',
    },
    {
      agent: 'Content Creator',
      interactions: 23,
      averageRating: 4.6,
      mostUsedFeature: 'Study Materials',
    },
    {
      agent: 'Assessment Generator',
      interactions: 18,
      averageRating: 4.7,
      mostUsedFeature: 'Practice Tests',
    },
    {
      agent: 'Doubt Solver',
      interactions: 32,
      averageRating: 4.5,
      mostUsedFeature: 'Concept Clarification',
    },
  ],
  studyPatterns: {
    peakStudyTime: '7:00 PM - 9:00 PM',
    averageSessionLength: 45, // minutes
    preferredSubjects: ['Mathematics', 'Physics'],
    learningStyle: 'Visual',
  },
};

const AnalyticsPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAnalyticsData(mockAnalyticsData);
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  const tabs = ['Overview', 'Subject Performance', 'AI Interactions', 'Study Patterns'];

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon color='success' fontSize='small' />;
      case 'down':
        return <TrendingDownIcon color='error' fontSize='small' />;
      default:
        return <TrendingUpIcon color='disabled' fontSize='small' />;
    }
  };

  if (loading || !analyticsData) {
    return (
      <Box>
        <Typography variant='h4' gutterBottom>
          Analytics 📊
        </Typography>
        <Typography>Loading analytics data...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant='h4' component='h1' fontWeight={600} gutterBottom>
            Learning Analytics 📊
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Track your progress and optimize your learning journey
          </Typography>
        </Box>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select value={timeRange} onChange={e => setTimeRange(e.target.value)} label='Time Range'>
            <MenuItem value='week'>This Week</MenuItem>
            <MenuItem value='month'>This Month</MenuItem>
            <MenuItem value='semester'>This Semester</MenuItem>
            <MenuItem value='year'>This Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Overall Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TimeIcon color='primary' sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant='h4' color='primary' fontWeight={600}>
                {analyticsData.overallStats.totalStudyTime}h
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Total Study Time
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AssessmentIcon color='success' sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant='h4' color='success.main' fontWeight={600}>
                {analyticsData.overallStats.averageScore}%
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Average Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <StudyIcon color='info' sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant='h4' color='info.main' fontWeight={600}>
                {analyticsData.overallStats.coursesCompleted}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Courses Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AchievementIcon color='warning' sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant='h4' color='warning.main' fontWeight={600}>
                {analyticsData.overallStats.currentStreak}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Day Streak
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
            {tabs.map((tab, index) => (
              <Tab key={index} label={tab} />
            ))}
          </Tabs>
        </Box>

        <CardContent>
          {/* Overview Tab */}
          {selectedTab === 0 && (
            <Grid container spacing={3}>
              {/* Subject Performance */}
              <Grid size={{ xs: 12, md: 8 }}>
                <Typography variant='h6' gutterBottom>
                  Subject Performance
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {analyticsData.subjectPerformance.map(subject => (
                    <Paper key={subject.subject} sx={{ p: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ bgcolor: subject.color, width: 32, height: 32 }}>
                            <SubjectIcon fontSize='small' />
                          </Avatar>
                          <Typography variant='subtitle2'>{subject.subject}</Typography>
                          {getTrendIcon(subject.trend)}
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant='body2' color='text.secondary'>
                            {subject.timeSpent}h studied
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            Avg: {subject.averageScore}%
                          </Typography>
                        </Box>
                      </Box>
                      <LinearProgress
                        variant='determinate'
                        value={subject.progress}
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ mt: 0.5, display: 'block' }}
                      >
                        {subject.progress}% Complete
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              </Grid>

              {/* Recent Achievements */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant='h6' gutterBottom>
                  Recent Achievements
                </Typography>
                <List>
                  {analyticsData.recentAchievements.map(achievement => (
                    <ListItem key={achievement.id} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'background.default' }}>{achievement.icon}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={achievement.title}
                        secondary={
                          <>
                            <Typography component='span' variant='body2'>
                              {achievement.description}
                            </Typography>
                            <Typography
                              variant='caption'
                              color='text.secondary'
                              sx={{ display: 'block' }}
                            >
                              {achievement.date}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          )}

          {/* Subject Performance Tab */}
          {selectedTab === 1 && (
            <Box>
              <Typography variant='h6' gutterBottom>
                Detailed Subject Analysis
              </Typography>
              <TableContainer component={Paper} variant='outlined'>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Subject</TableCell>
                      <TableCell align='right'>Progress</TableCell>
                      <TableCell align='right'>Average Score</TableCell>
                      <TableCell align='right'>Time Spent</TableCell>
                      <TableCell align='right'>Trend</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analyticsData.subjectPerformance.map(subject => (
                      <TableRow key={subject.subject}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ bgcolor: subject.color, width: 24, height: 24 }}>
                              <SubjectIcon fontSize='small' />
                            </Avatar>
                            {subject.subject}
                          </Box>
                        </TableCell>
                        <TableCell align='right'>{subject.progress}%</TableCell>
                        <TableCell align='right'>{subject.averageScore}%</TableCell>
                        <TableCell align='right'>{subject.timeSpent}h</TableCell>
                        <TableCell align='right'>{getTrendIcon(subject.trend)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* AI Interactions Tab */}
          {selectedTab === 2 && (
            <Box>
              <Typography variant='h6' gutterBottom>
                AI Agent Usage Statistics
              </Typography>
              <Grid container spacing={2}>
                {analyticsData.aiInteractions.map(agent => (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }} key={agent.agent}>
                    <Card variant='outlined'>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <AIIcon color='primary' sx={{ mr: 1 }} />
                          <Typography variant='subtitle2'>{agent.agent}</Typography>
                        </Box>
                        <Typography variant='h4' color='primary' gutterBottom>
                          {agent.interactions}
                        </Typography>
                        <Typography variant='body2' color='text.secondary' gutterBottom>
                          Interactions
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mt: 2,
                          }}
                        >
                          <Chip
                            label={`★ ${agent.averageRating}`}
                            size='small'
                            color='primary'
                            variant='outlined'
                          />
                        </Box>
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          sx={{ mt: 1, display: 'block' }}
                        >
                          Most used: {agent.mostUsedFeature}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Study Patterns Tab */}
          {selectedTab === 3 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='h6' gutterBottom>
                  Study Habits
                </Typography>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant='subtitle2' gutterBottom>
                      Peak Study Time
                    </Typography>
                    <Typography variant='h6' color='primary'>
                      {analyticsData.studyPatterns.peakStudyTime}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant='subtitle2' gutterBottom>
                      Average Session Length
                    </Typography>
                    <Typography variant='h6' color='primary'>
                      {analyticsData.studyPatterns.averageSessionLength} minutes
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant='subtitle2' gutterBottom>
                      Learning Style
                    </Typography>
                    <Chip
                      label={analyticsData.studyPatterns.learningStyle}
                      color='primary'
                      variant='outlined'
                    />
                  </Box>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='h6' gutterBottom>
                  Weekly Activity
                </Typography>
                <Paper sx={{ p: 3 }}>
                  {analyticsData.weeklyActivity.map(day => (
                    <Box key={day.day} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant='body2'>{day.day}</Typography>
                        <Typography variant='body2'>
                          {day.studyTime}h ({day.sessionsCount} sessions)
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant='determinate'
                        value={(day.studyTime / 7) * 100}
                        sx={{ height: 6, borderRadius: 1 }}
                      />
                    </Box>
                  ))}
                </Paper>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AnalyticsPage;
