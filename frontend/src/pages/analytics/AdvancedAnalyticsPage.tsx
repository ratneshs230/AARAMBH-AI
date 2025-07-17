import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  LinearProgress,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  CircularProgress,
  Tooltip,
  IconButton,
  Badge,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Psychology as AIIcon,
  School as LearningIcon,
  Timer as TimeIcon,
  EmojiEvents as AchievementIcon,
  Lightbulb as InsightIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  Speed as PerformanceIcon,
  Groups as CollaborationIcon,
  Favorite as WellbeingIcon,
  Download as ExportIcon,
  Refresh as RefreshIcon,
  Analytics as PredictionIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts';

interface LearningMetrics {
  studyTime: number;
  completionRate: number;
  averageScore: number;
  streakDays: number;
  focusLevel: number;
  collaborationScore: number;
  wellbeingIndex: number;
}

interface AIInsight {
  id: string;
  type: 'performance' | 'learning' | 'wellbeing' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  timestamp: string;
}

interface LearningPattern {
  subject: string;
  timeOfDay: string;
  performance: number;
  engagement: number;
  difficulty: number;
}

interface PredictiveAnalytics {
  nextWeekPerformance: number;
  riskFactors: string[];
  recommendations: string[];
  optimalStudyTimes: string[];
  burnoutRisk: number;
}

const AdvancedAnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('week');
  const [isLoading, setIsLoading] = useState(false);
  const [learningMetrics, setLearningMetrics] = useState<LearningMetrics>({
    studyTime: 45.5,
    completionRate: 87,
    averageScore: 92,
    streakDays: 15,
    focusLevel: 78,
    collaborationScore: 85,
    wellbeingIndex: 82,
  });

  const [aiInsights, setAiInsights] = useState<AIInsight[]>([
    {
      id: '1',
      type: 'performance',
      title: 'Peak Performance Window Detected',
      description: 'Your best learning happens between 9-11 AM with 94% higher retention rates.',
      confidence: 96,
      priority: 'high',
      actionable: true,
      timestamp: '2025-01-15T10:30:00Z',
    },
    {
      id: '2',
      type: 'learning',
      title: 'Mathematics Difficulty Pattern',
      description: 'Struggling with calculus concepts. Recommend visual learning approach.',
      confidence: 89,
      priority: 'medium',
      actionable: true,
      timestamp: '2025-01-15T09:15:00Z',
    },
    {
      id: '3',
      type: 'wellbeing',
      title: 'Study-Life Balance Alert',
      description: 'Extended study sessions detected. Consider 15-minute breaks every hour.',
      confidence: 78,
      priority: 'medium',
      actionable: true,
      timestamp: '2025-01-15T14:20:00Z',
    },
    {
      id: '4',
      type: 'prediction',
      title: 'Performance Forecast',
      description: 'Based on current trends, expect 8% improvement in next assessment.',
      confidence: 85,
      priority: 'low',
      actionable: false,
      timestamp: '2025-01-15T16:45:00Z',
    },
  ]);

  const [learningPatterns, setLearningPatterns] = useState<LearningPattern[]>([
    {
      subject: 'Mathematics',
      timeOfDay: 'Morning',
      performance: 92,
      engagement: 88,
      difficulty: 7,
    },
    { subject: 'Physics', timeOfDay: 'Morning', performance: 89, engagement: 91, difficulty: 8 },
    {
      subject: 'Chemistry',
      timeOfDay: 'Afternoon',
      performance: 85,
      engagement: 82,
      difficulty: 6,
    },
    { subject: 'Biology', timeOfDay: 'Evening', performance: 88, engagement: 90, difficulty: 5 },
    { subject: 'Literature', timeOfDay: 'Evening', performance: 94, engagement: 95, difficulty: 4 },
  ]);

  const [predictiveAnalytics, setPredictiveAnalytics] = useState<PredictiveAnalytics>({
    nextWeekPerformance: 94,
    riskFactors: ['High study intensity', 'Limited break time', 'Irregular sleep pattern'],
    recommendations: [
      'Schedule regular 15-minute breaks',
      'Focus morning sessions on difficult subjects',
      'Use spaced repetition for better retention',
      'Join study groups for collaborative learning',
    ],
    optimalStudyTimes: ['9:00 AM - 11:00 AM', '2:00 PM - 4:00 PM', '7:00 PM - 8:30 PM'],
    burnoutRisk: 35,
  });

  // Performance trend data
  const performanceData = [
    { name: 'Week 1', performance: 78, focus: 72, wellbeing: 85 },
    { name: 'Week 2', performance: 82, focus: 78, wellbeing: 80 },
    { name: 'Week 3', performance: 85, focus: 80, wellbeing: 78 },
    { name: 'Week 4', performance: 88, focus: 85, wellbeing: 82 },
    { name: 'Week 5', performance: 92, focus: 88, wellbeing: 84 },
    { name: 'Week 6', performance: 89, focus: 82, wellbeing: 86 },
    { name: 'Week 7', performance: 94, focus: 90, wellbeing: 88 },
  ];

  // Subject performance radar data
  const subjectData = [
    { subject: 'Math', score: 92, fullMark: 100 },
    { subject: 'Physics', score: 89, fullMark: 100 },
    { subject: 'Chemistry', score: 85, fullMark: 100 },
    { subject: 'Biology', score: 88, fullMark: 100 },
    { subject: 'Literature', score: 94, fullMark: 100 },
    { subject: 'History', score: 91, fullMark: 100 },
  ];

  // Study time distribution
  const studyTimeData = [
    { name: 'Mathematics', hours: 12, color: '#8884d8' },
    { name: 'Physics', hours: 10, color: '#82ca9d' },
    { name: 'Chemistry', hours: 8, color: '#ffc658' },
    { name: 'Biology', hours: 9, color: '#ff7300' },
    { name: 'Literature', hours: 6, color: '#00ff88' },
  ];

  // Learning efficiency scatter plot
  const efficiencyData = [
    { timeSpent: 2, performance: 85, subject: 'Math' },
    { timeSpent: 1.5, performance: 92, subject: 'Literature' },
    { timeSpent: 3, performance: 78, subject: 'Physics' },
    { timeSpent: 2.5, performance: 88, subject: 'Chemistry' },
    { timeSpent: 1.8, performance: 90, subject: 'Biology' },
  ];

  const handleRefreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const exportAnalytics = () => {
    // Generate and download analytics report
    const reportData = {
      metrics: learningMetrics,
      insights: aiInsights,
      patterns: learningPatterns,
      predictions: predictiveAnalytics,
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const getInsightIcon = (type: string) => {
    const icons = {
      performance: <PerformanceIcon />,
      learning: <LearningIcon />,
      wellbeing: <WellbeingIcon />,
      prediction: <PredictionIcon />,
    };
    return icons[type as keyof typeof icons] || <InsightIcon />;
  };

  const getPriorityColor = (priority: string): 'success' | 'warning' | 'error' | 'default' => {
    const colors = {
      low: 'success' as const,
      medium: 'warning' as const,
      high: 'error' as const,
    };
    return colors[priority as keyof typeof colors] || 'default';
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant='h4' component='h1' sx={{ fontWeight: 'bold' }}>
          Advanced Learning Analytics
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl size='small' sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label='Time Range'
              onChange={e => setTimeRange(e.target.value)}
            >
              <MenuItem value='week'>This Week</MenuItem>
              <MenuItem value='month'>This Month</MenuItem>
              <MenuItem value='quarter'>This Quarter</MenuItem>
              <MenuItem value='year'>This Year</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title='Refresh Data'>
            <IconButton onClick={handleRefreshData} disabled={isLoading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button variant='outlined' startIcon={<ExportIcon />} onClick={exportAnalytics}>
            Export Report
          </Button>
        </Box>
      </Box>

      {/* AI-Powered Insights Alert */}
      <Alert
        severity='info'
        icon={<AIIcon />}
        sx={{ mb: 3 }}
        action={
          <Button color='inherit' size='small'>
            View All Insights
          </Button>
        }
      >
        <Typography variant='subtitle2' sx={{ fontWeight: 'bold' }}>
          AI Analysis Complete
        </Typography>
        Found {aiInsights.filter(i => i.priority === 'high').length} high-priority insights and{' '}
        {aiInsights.filter(i => i.actionable).length} actionable recommendations
      </Alert>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color='textSecondary' gutterBottom>
                    Study Time
                  </Typography>
                  <Typography variant='h4' component='div' sx={{ fontWeight: 'bold' }}>
                    {learningMetrics.studyTime}h
                  </Typography>
                  <Typography variant='body2' color='success.main'>
                    +12% from last week
                  </Typography>
                </Box>
                <TimeIcon color='primary' sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color='textSecondary' gutterBottom>
                    Completion Rate
                  </Typography>
                  <Typography variant='h4' component='div' sx={{ fontWeight: 'bold' }}>
                    {learningMetrics.completionRate}%
                  </Typography>
                  <LinearProgress
                    variant='determinate'
                    value={learningMetrics.completionRate}
                    sx={{ mt: 1 }}
                  />
                </Box>
                <SuccessIcon color='success' sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color='textSecondary' gutterBottom>
                    Average Score
                  </Typography>
                  <Typography variant='h4' component='div' sx={{ fontWeight: 'bold' }}>
                    {learningMetrics.averageScore}%
                  </Typography>
                  <Typography variant='body2' color='success.main'>
                    +5% improvement
                  </Typography>
                </Box>
                <AchievementIcon color='warning' sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color='textSecondary' gutterBottom>
                    Study Streak
                  </Typography>
                  <Typography variant='h4' component='div' sx={{ fontWeight: 'bold' }}>
                    {learningMetrics.streakDays}
                  </Typography>
                  <Typography variant='body2' color='textSecondary'>
                    days
                  </Typography>
                </Box>
                <TrendingUpIcon color='secondary' sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label='Performance Trends' />
        <Tab label='AI Insights' />
        <Tab label='Learning Patterns' />
        <Tab label='Predictive Analytics' />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Performance Trend Chart */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Performance Trends Over Time
                </Typography>
                <ResponsiveContainer width='100%' height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='name' />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type='monotone' dataKey='performance' stroke='#8884d8' strokeWidth={3} />
                    <Line type='monotone' dataKey='focus' stroke='#82ca9d' strokeWidth={2} />
                    <Line type='monotone' dataKey='wellbeing' stroke='#ffc658' strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Subject Performance Radar */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Subject Performance
                </Typography>
                <ResponsiveContainer width='100%' height={300}>
                  <RadarChart data={subjectData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey='subject' />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name='Score'
                      dataKey='score'
                      stroke='#8884d8'
                      fill='#8884d8'
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Study Time Distribution */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Study Time Distribution
                </Typography>
                <ResponsiveContainer width='100%' height={250}>
                  <PieChart>
                    <Pie
                      data={studyTimeData}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}h`}
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='hours'
                    >
                      {studyTimeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Learning Efficiency */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Learning Efficiency (Time vs Performance)
                </Typography>
                <ResponsiveContainer width='100%' height={250}>
                  <ScatterChart data={efficiencyData}>
                    <CartesianGrid />
                    <XAxis type='number' dataKey='timeSpent' name='Time Spent' unit='h' />
                    <YAxis type='number' dataKey='performance' name='Performance' unit='%' />
                    <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name='Subjects' dataKey='performance' fill='#8884d8' />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography
                  variant='h6'
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <AIIcon color='primary' />
                  AI-Powered Learning Insights
                </Typography>
                <List>
                  {aiInsights.map(insight => (
                    <ListItem key={insight.id} sx={{ mb: 1 }}>
                      <Paper sx={{ width: '100%', p: 2 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            mb: 1,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getInsightIcon(insight.type)}
                            <Typography variant='subtitle1' sx={{ fontWeight: 'bold' }}>
                              {insight.title}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip
                              label={`${insight.confidence}% confidence`}
                              size='small'
                              color='primary'
                            />
                            <Chip
                              label={insight.priority}
                              size='small'
                              color={getPriorityColor(insight.priority)}
                            />
                            {insight.actionable && (
                              <Chip label='Actionable' size='small' color='success' />
                            )}
                          </Box>
                        </Box>
                        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                          {insight.description}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          Generated: {new Date(insight.timestamp).toLocaleString()}
                        </Typography>
                        {insight.actionable && (
                          <Box sx={{ mt: 1 }}>
                            <Button size='small' variant='outlined'>
                              Take Action
                            </Button>
                          </Box>
                        )}
                      </Paper>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Learning Pattern Analysis
                </Typography>
                <ResponsiveContainer width='100%' height={400}>
                  <BarChart data={learningPatterns}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='subject' />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey='performance' fill='#8884d8' name='Performance %' />
                    <Bar dataKey='engagement' fill='#82ca9d' name='Engagement %' />
                    <Bar dataKey='difficulty' fill='#ffc658' name='Difficulty Level' />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography
                  variant='h6'
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <PredictionIcon color='secondary' />
                  Performance Predictions
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant='body2' color='text.secondary' gutterBottom>
                    Predicted Performance Next Week
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CircularProgress
                      variant='determinate'
                      value={predictiveAnalytics.nextWeekPerformance}
                      size={60}
                      thickness={4}
                    />
                    <Typography variant='h4' sx={{ fontWeight: 'bold' }}>
                      {predictiveAnalytics.nextWeekPerformance}%
                    </Typography>
                  </Box>
                </Box>

                <Typography variant='subtitle2' gutterBottom>
                  Risk Factors:
                </Typography>
                <List dense>
                  {predictiveAnalytics.riskFactors.map((factor, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <WarningIcon color='warning' />
                      </ListItemIcon>
                      <ListItemText primary={factor} />
                    </ListItem>
                  ))}
                </List>

                <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                  <Typography variant='subtitle2' color='error.dark'>
                    Burnout Risk: {predictiveAnalytics.burnoutRisk}%
                  </Typography>
                  <LinearProgress
                    variant='determinate'
                    value={predictiveAnalytics.burnoutRisk}
                    color='error'
                    sx={{ mt: 1 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  AI Recommendations
                </Typography>
                <List>
                  {predictiveAnalytics.recommendations.map((recommendation, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <InsightIcon color='primary' />
                      </ListItemIcon>
                      <ListItemText primary={recommendation} />
                    </ListItem>
                  ))}
                </List>

                <Typography variant='subtitle2' gutterBottom sx={{ mt: 2 }}>
                  Optimal Study Times:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {predictiveAnalytics.optimalStudyTimes.map((time, index) => (
                    <Chip key={index} label={time} color='primary' variant='outlined' />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {isLoading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <CircularProgress size={60} />
        </Box>
      )}
    </Box>
  );
};

export default AdvancedAnalyticsPage;
