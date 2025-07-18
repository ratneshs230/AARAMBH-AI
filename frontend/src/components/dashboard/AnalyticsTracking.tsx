import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Chip,
  LinearProgress,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  Book as BookIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  DateRange as DateIcon,
  Speed as SpeedIcon,
  EmojiEvents as AchievementIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  School as SchoolIcon,
} from '@mui/icons-material';

interface PerformanceMetrics {
  totalStudyTime: number;
  averageSessionDuration: number;
  coursesCompleted: number;
  averageScore: number;
  streakDays: number;
  weakAreas: string[];
  strongAreas: string[];
  improvement: {
    metric: string;
    change: number;
    trend: 'up' | 'down' | 'stable';
  }[];
}

interface StudyPattern {
  mostActiveDay: string;
  mostActiveHour: number;
  averageSessionLength: number;
  preferredSubjects: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  focusScore: number;
}

interface WeeklyData {
  week: string;
  studyHours: number;
  lessonsCompleted: number;
  quizzesTaken: number;
  averageScore: number;
  efficiency: number;
}

interface SubjectAnalytics {
  subject: string;
  timeSpent: number;
  progress: number;
  averageScore: number;
  difficulty: number;
  engagement: number;
  predictions: {
    completionDate: string;
    expectedFinalScore: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
}

interface Props {
  performanceMetrics: PerformanceMetrics;
  studyPattern: StudyPattern;
  weeklyData: WeeklyData[];
  subjectAnalytics: SubjectAnalytics[];
  timeRange: 'week' | 'month' | 'quarter' | 'year';
  onTimeRangeChange: (range: 'week' | 'month' | 'quarter' | 'year') => void;
}

const AnalyticsTracking: React.FC<Props> = ({
  performanceMetrics,
  studyPattern,
  weeklyData,
  subjectAnalytics,
  timeRange,
  onTimeRangeChange,
}) => {
  const [selectedMetric, setSelectedMetric] = useState('overview');

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon color="success" />;
      case 'down':
        return <TrendingDownIcon color="error" />;
      default:
        return <TrendingUpIcon color="action" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      default:
        return 'default';
    }
  };

  const getEngagementColor = (engagement: number) => {
    if (engagement >= 80) return 'success.main';
    if (engagement >= 60) return 'warning.main';
    return 'error.main';
  };

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <Box>
      {/* Header with Time Range Selection */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <AnalyticsIcon sx={{ mr: 1 }} />
          Analytics & Performance Tracking
        </Typography>
        
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={(_, value) => value && onTimeRangeChange(value)}
          size="small"
        >
          <ToggleButton value="week">Week</ToggleButton>
          <ToggleButton value="month">Month</ToggleButton>
          <ToggleButton value="quarter">Quarter</ToggleButton>
          <ToggleButton value="year">Year</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Key Performance Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TimeIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatHours(performanceMetrics.totalStudyTime)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Study Time
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                {getTrendIcon('up')}
                <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                  +12% from last period
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <StarIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {performanceMetrics.averageScore}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Score
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                {getTrendIcon('up')}
                <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                  +5% improvement
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <SpeedIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {Math.round(studyPattern.focusScore)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Focus Score
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                {getTrendIcon('stable')}
                <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                  Consistent
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AchievementIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {performanceMetrics.streakDays}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current Streak
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                {getTrendIcon('up')}
                <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                  Personal best!
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Weekly Performance Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ mr: 1 }} />
                Weekly Performance Trends
              </Typography>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Week</TableCell>
                      <TableCell align="center">Study Hours</TableCell>
                      <TableCell align="center">Lessons</TableCell>
                      <TableCell align="center">Quizzes</TableCell>
                      <TableCell align="center">Avg Score</TableCell>
                      <TableCell align="center">Efficiency</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {weeklyData.map((week) => (
                      <TableRow key={week.week}>
                        <TableCell>{week.week}</TableCell>
                        <TableCell align="center">{formatHours(week.studyHours)}</TableCell>
                        <TableCell align="center">{week.lessonsCompleted}</TableCell>
                        <TableCell align="center">{week.quizzesTaken}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${week.averageScore}%`}
                            color={week.averageScore >= 80 ? 'success' : week.averageScore >= 60 ? 'warning' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LinearProgress
                              variant="determinate"
                              value={week.efficiency}
                              sx={{ width: 50, mr: 1 }}
                            />
                            <Typography variant="caption">{week.efficiency}%</Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Study Patterns */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon sx={{ mr: 1 }} />
                Study Patterns
              </Typography>
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Most Active Day</Typography>
                  <Chip label={studyPattern.mostActiveDay} color="primary" />
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Peak Hours</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {studyPattern.mostActiveHour}:00 - {studyPattern.mostActiveHour + 1}:00
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Learning Style</Typography>
                  <Chip 
                    label={studyPattern.learningStyle} 
                    color="secondary" 
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Average Session</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatHours(studyPattern.averageSessionLength)}
                  </Typography>
                </Box>
                
                <Divider />
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Preferred Subjects</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {studyPattern.preferredSubjects.map((subject) => (
                      <Chip key={subject} label={subject} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Subject-wise Analytics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <SchoolIcon sx={{ mr: 1 }} />
                Subject-wise Performance Analytics
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Subject</TableCell>
                      <TableCell align="center">Time Spent</TableCell>
                      <TableCell align="center">Progress</TableCell>
                      <TableCell align="center">Avg Score</TableCell>
                      <TableCell align="center">Engagement</TableCell>
                      <TableCell align="center">Predicted Completion</TableCell>
                      <TableCell align="center">Risk Level</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subjectAnalytics.map((subject) => (
                      <TableRow key={subject.subject}>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {subject.subject}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {formatHours(subject.timeSpent)}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LinearProgress
                              variant="determinate"
                              value={subject.progress}
                              sx={{ width: 60, mr: 1 }}
                            />
                            <Typography variant="caption">{subject.progress}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${subject.averageScore}%`}
                            color={subject.averageScore >= 80 ? 'success' : subject.averageScore >= 60 ? 'warning' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                            <CircularProgress
                              variant="determinate"
                              value={subject.engagement}
                              size={40}
                              sx={{ color: getEngagementColor(subject.engagement) }}
                            />
                            <Box
                              sx={{
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                position: 'absolute',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                {subject.engagement}%
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="caption" color="text.secondary">
                            {subject.predictions.completionDate}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="primary">
                            Score: {subject.predictions.expectedFinalScore}%
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={subject.predictions.riskLevel}
                            color={getRiskColor(subject.predictions.riskLevel)}
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Insights */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <SuccessIcon sx={{ mr: 1, color: 'success.main' }} />
                Strong Areas
              </Typography>
              
              <List>
                {performanceMetrics.strongAreas.map((area, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <SuccessIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={area}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
                Areas for Improvement
              </Typography>
              
              <List>
                {performanceMetrics.weakAreas.map((area, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <WarningIcon color="warning" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={area}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsTracking;