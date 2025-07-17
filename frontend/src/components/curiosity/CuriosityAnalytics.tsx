import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  LinearProgress,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Psychology as BrainIcon,
  Visibility as ViewIcon,
  ThumbUp as LikeIcon,
  Bookmark as BookmarkIcon,
  Quiz as QuestionIcon,
  Insights as InsightsIcon,
  AccessTime as TimeIcon,
  Category as CategoryIcon,
  GetApp as ExportIcon,
  Share as ShareIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import type { CuriosityAnalytics, CuriosityStats, CuriosityActivity } from '@/types/curiosity';

interface CuriosityAnalyticsProps {
  userStats: CuriosityStats;
  timeRange: 'week' | 'month' | 'year';
  onTimeRangeChange: (range: 'week' | 'month' | 'year') => void;
}

const CuriosityAnalytics: React.FC<CuriosityAnalyticsProps> = ({
  userStats,
  timeRange,
  onTimeRangeChange,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'learning' | 'engagement' | 'insights'>(
    'overview'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [analytics, setAnalytics] = useState<CuriosityAnalytics | null>(null);
  const [recentActivity, setRecentActivity] = useState<CuriosityActivity[]>([]);

  // Mock analytics data
  const mockAnalytics: CuriosityAnalytics = {
    learningPatterns: {
      preferredTimes: ['9:00 AM', '2:00 PM', '7:00 PM'],
      sessionDuration: 23,
      topicDiversity: 85,
      completionRate: 78,
    },
    progressMetrics: {
      topicsPerWeek: 12,
      questionsPerWeek: 8,
      averageRating: 4.3,
      knowledgeGrowth: 15,
    },
    recommendations: {
      nextTopics: ['Quantum Computing', 'Neuroscience', 'Climate Science'],
      skillGaps: ['Advanced Mathematics', 'Data Analysis'],
      suggestedPaths: ['AI and Machine Learning', 'Sustainable Technology'],
    },
    socialMetrics: {
      questionsAsked: 34,
      questionsAnswered: 12,
      helpfulAnswers: 9,
      communityRank: 247,
    },
  };

  const mockActivities: CuriosityActivity[] = [
    {
      id: '1',
      type: 'view',
      targetId: 'black-holes',
      targetType: 'topic',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      metadata: { duration: 15, category: 'Physics' },
    },
    {
      id: '2',
      type: 'like',
      targetId: 'neural-networks',
      targetType: 'topic',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      metadata: { category: 'Technology' },
    },
    {
      id: '3',
      type: 'question',
      targetId: 'quantum-mechanics',
      targetType: 'topic',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      metadata: { question: 'How does quantum entanglement work?' },
    },
    {
      id: '4',
      type: 'complete',
      targetId: 'cosmic-journey',
      targetType: 'path',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      metadata: { pathLength: 5, timeSpent: 45 },
    },
    {
      id: '5',
      type: 'bookmark',
      targetId: 'climate-change',
      targetType: 'topic',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      metadata: { category: 'Environment' },
    },
  ];

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setAnalytics(mockAnalytics);
      setRecentActivity(mockActivities);
      setIsLoading(false);
    }, 1000);
  }, [timeRange]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'view':
        return <ViewIcon />;
      case 'like':
        return <LikeIcon />;
      case 'bookmark':
        return <BookmarkIcon />;
      case 'question':
        return <QuestionIcon />;
      case 'complete':
        return <SuccessIcon />;
      case 'share':
        return <ShareIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getProgressColor = (value: number) => {
    if (value >= 80) return 'success';
    if (value >= 60) return 'warning';
    return 'error';
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant='h4' gutterBottom sx={{ fontWeight: 'bold' }}>
              📊 Curiosity Analytics
            </Typography>
            <Typography variant='h6' sx={{ opacity: 0.9 }}>
              Track your learning journey and discover insights
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size='small' sx={{ minWidth: 120 }}>
              <InputLabel sx={{ color: 'white' }}>Time Range</InputLabel>
              <Select
                value={timeRange}
                onChange={e => onTimeRangeChange(e.target.value as 'week' | 'month' | 'year')}
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                }}
              >
                <MenuItem value='week'>This Week</MenuItem>
                <MenuItem value='month'>This Month</MenuItem>
                <MenuItem value='year'>This Year</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant='contained'
              startIcon={<ExportIcon />}
              sx={{ bgcolor: 'white', color: 'primary.main' }}
            >
              Export
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Navigation Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} variant='fullWidth'>
          <Tab label='Overview' value='overview' icon={<AnalyticsIcon />} />
          <Tab label='Learning Patterns' value='learning' icon={<BrainIcon />} />
          <Tab label='Engagement' value='engagement' icon={<TimelineIcon />} />
          <Tab label='Insights' value='insights' icon={<InsightsIcon />} />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      {activeTab === 'overview' && analytics && (
        <Grid container spacing={3}>
          {/* Key Metrics */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant='h3' color='primary' gutterBottom>
                      {userStats.topicsExplored}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Topics Explored
                    </Typography>
                    <Typography variant='caption' color='success.main'>
                      +{analytics.progressMetrics.topicsPerWeek} this week
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant='h3' color='secondary' gutterBottom>
                      {userStats.questionsAsked}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Questions Asked
                    </Typography>
                    <Typography variant='caption' color='success.main'>
                      +{analytics.progressMetrics.questionsPerWeek} this week
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant='h3' color='success.main' gutterBottom>
                      {userStats.curiosityLevel}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Curiosity Level
                    </Typography>
                    <Typography variant='caption' color='success.main'>
                      +{analytics.progressMetrics.knowledgeGrowth}% growth
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant='h3' color='warning.main' gutterBottom>
                      {userStats.streakDays}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Day Streak
                    </Typography>
                    <Typography variant='caption' color='warning.main'>
                      Keep it up!
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Learning Progress */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Learning Progress
                </Typography>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant='body2'>Topic Diversity</Typography>
                        <Typography variant='body2'>
                          {analytics.learningPatterns.topicDiversity}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant='determinate'
                        value={analytics.learningPatterns.topicDiversity}
                        color={getProgressColor(analytics.learningPatterns.topicDiversity)}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant='body2'>Completion Rate</Typography>
                        <Typography variant='body2'>
                          {analytics.learningPatterns.completionRate}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant='determinate'
                        value={analytics.learningPatterns.completionRate}
                        color={getProgressColor(analytics.learningPatterns.completionRate)}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant='body2'>Average Rating</Typography>
                        <Typography variant='body2'>
                          {analytics.progressMetrics.averageRating}/5.0
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant='determinate'
                        value={(analytics.progressMetrics.averageRating / 5) * 100}
                        color='success'
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant='body2'>Knowledge Growth</Typography>
                        <Typography variant='body2'>
                          {analytics.progressMetrics.knowledgeGrowth}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant='determinate'
                        value={analytics.progressMetrics.knowledgeGrowth}
                        color='primary'
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: 'fit-content' }}>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Recent Activity
                </Typography>
                <List dense>
                  {recentActivity.map(activity => (
                    <ListItem key={activity.id} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {getActivityIcon(activity.type)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant='body2'>
                            {activity.type === 'view' && `Viewed ${activity.targetId}`}
                            {activity.type === 'like' && `Liked ${activity.targetId}`}
                            {activity.type === 'bookmark' && `Bookmarked ${activity.targetId}`}
                            {activity.type === 'question' && `Asked about ${activity.targetId}`}
                            {activity.type === 'complete' && `Completed ${activity.targetId}`}
                          </Typography>
                        }
                        secondary={
                          <Typography variant='caption' color='text.secondary'>
                            {formatTimeAgo(activity.timestamp)}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Learning Patterns Tab */}
      {activeTab === 'learning' && analytics && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Learning Patterns
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <TimeIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary='Preferred Learning Times'
                      secondary={analytics.learningPatterns.preferredTimes.join(', ')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SpeedIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary='Average Session Duration'
                      secondary={`${analytics.learningPatterns.sessionDuration} minutes`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CategoryIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary='Topic Diversity Score'
                      secondary={`${analytics.learningPatterns.topicDiversity}%`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SuccessIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary='Completion Rate'
                      secondary={`${analytics.learningPatterns.completionRate}%`}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Favorite Categories
                </Typography>
                {userStats.favoriteCategories.map((category, index) => (
                  <Box key={category} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant='body2'>{category}</Typography>
                      <Typography variant='body2'>{(5 - index) * 20}%</Typography>
                    </Box>
                    <LinearProgress
                      variant='determinate'
                      value={(5 - index) * 20}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Engagement Tab */}
      {activeTab === 'engagement' && analytics && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Engagement Metrics
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Metric</TableCell>
                        <TableCell align='right'>This Week</TableCell>
                        <TableCell align='right'>This Month</TableCell>
                        <TableCell align='right'>Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Topics Explored</TableCell>
                        <TableCell align='right'>
                          {analytics.progressMetrics.topicsPerWeek}
                        </TableCell>
                        <TableCell align='right'>
                          {analytics.progressMetrics.topicsPerWeek * 4}
                        </TableCell>
                        <TableCell align='right'>{userStats.topicsExplored}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Questions Asked</TableCell>
                        <TableCell align='right'>
                          {analytics.progressMetrics.questionsPerWeek}
                        </TableCell>
                        <TableCell align='right'>
                          {analytics.progressMetrics.questionsPerWeek * 4}
                        </TableCell>
                        <TableCell align='right'>{userStats.questionsAsked}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Questions Answered</TableCell>
                        <TableCell align='right'>
                          {analytics.socialMetrics.questionsAnswered}
                        </TableCell>
                        <TableCell align='right'>
                          {analytics.socialMetrics.questionsAnswered * 4}
                        </TableCell>
                        <TableCell align='right'>{userStats.questionsAnswered}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Paths Completed</TableCell>
                        <TableCell align='right'>2</TableCell>
                        <TableCell align='right'>5</TableCell>
                        <TableCell align='right'>{userStats.pathsCompleted}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Community Ranking
                </Typography>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant='h2' color='primary'>
                    #{analytics.socialMetrics.communityRank}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Global Rank
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary='Questions Asked'
                      secondary={analytics.socialMetrics.questionsAsked}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary='Helpful Answers'
                      secondary={analytics.socialMetrics.helpfulAnswers}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary='Community Score' secondary={userStats.curiosityScore} />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && analytics && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Recommended Topics
                </Typography>
                <List>
                  {analytics.recommendations.nextTopics.map((topic, index) => (
                    <ListItem key={topic}>
                      <ListItemIcon>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          {index + 1}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText primary={topic} secondary='Based on your interests' />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Skill Development
                </Typography>
                <Typography variant='body2' color='text.secondary' gutterBottom>
                  Areas for improvement:
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {analytics.recommendations.skillGaps.map(skill => (
                    <Chip
                      key={skill}
                      label={skill}
                      variant='outlined'
                      sx={{ mr: 1, mb: 1 }}
                      icon={<WarningIcon />}
                    />
                  ))}
                </Box>
                <Typography variant='body2' color='text.secondary' gutterBottom>
                  Suggested learning paths:
                </Typography>
                <Box>
                  {analytics.recommendations.suggestedPaths.map(path => (
                    <Chip
                      key={path}
                      label={path}
                      variant='outlined'
                      color='primary'
                      sx={{ mr: 1, mb: 1 }}
                      icon={<TrendingUpIcon />}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Alert severity='info' icon={<InfoIcon />}>
              <Typography variant='body2'>
                <strong>Insight:</strong> You're most productive during{' '}
                {analytics.learningPatterns.preferredTimes[0]}
                and show strong engagement with {userStats.favoriteCategories[0]} topics. Consider
                exploring more {analytics.recommendations.nextTopics[0]} content during your peak
                learning hours.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default CuriosityAnalytics;
