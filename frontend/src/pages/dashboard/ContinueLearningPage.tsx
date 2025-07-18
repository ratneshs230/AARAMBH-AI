import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TextField,
  InputAdornment,
  Alert,
  Fab,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Sort as SortIcon,
  Add as AddIcon,
  Analytics as AnalyticsIcon,
  School as SchoolIcon,
  Psychology as AIIcon,
  Quiz as QuizIcon,
} from '@mui/icons-material';
import { learningProgressService } from '@/services/learningProgressService';
import {
  ContinueLearningItem,
  StudyStreak,
  LearningSession,
} from '@/components/dashboard/ContinueLearningCard';
import ContinueLearningCard from '@/components/dashboard/ContinueLearningCard';
import { ROUTES } from '@/utils/constants';

interface LearningInsights {
  totalTimeStudied: number;
  averageSessionTime: number;
  preferredLearningTime: string;
  strongestSubjects: string[];
  recommendedFocus: string[];
  completionRate: number;
}

const ContinueLearningPage: React.FC = () => {
  const navigate = useNavigate();
  const [continueLearning, setContinueLearning] = useState<ContinueLearningItem[]>([]);
  const [allSessions, setAllSessions] = useState<LearningSession[]>([]);
  const [studyStreak, setStudyStreak] = useState<StudyStreak | null>(null);
  const [insights, setInsights] = useState<LearningInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('priority');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const userId = 'user_1'; // TODO: Get from auth context

  useEffect(() => {
    loadLearningData();
  }, []);

  const loadLearningData = async () => {
    try {
      setLoading(true);
      
      // Get all learning data
      const continueItems = learningProgressService.getContinueLearningItems(userId, 20);
      const sessions = learningProgressService.getUserSessions(userId);
      const streak = learningProgressService.getStudyStreak(userId);
      const learningInsights = learningProgressService.getLearningInsights(userId);
      
      setContinueLearning(continueItems);
      setAllSessions(sessions);
      setStudyStreak(streak);
      setInsights(learningInsights);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading learning data:', error);
      setLoading(false);
    }
  };

  const filteredAndSortedItems = React.useMemo(() => {
    let filtered = continueLearning;
    
    // Apply platform filter
    if (platformFilter !== 'all') {
      filtered = filtered.filter(item => item.session.platform === platformFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.session.type === typeFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.session.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'priority':
        filtered.sort((a, b) => a.priority - b.priority);
        break;
      case 'progress':
        filtered.sort((a, b) => b.session.progress - a.session.progress);
        break;
      case 'recent':
        filtered.sort((a, b) => 
          new Date(b.session.lastAccessed).getTime() - new Date(a.session.lastAccessed).getTime()
        );
        break;
      case 'timeSpent':
        filtered.sort((a, b) => b.session.timeSpent - a.session.timeSpent);
        break;
      default:
        break;
    }
    
    return filtered;
  }, [continueLearning, platformFilter, typeFilter, searchQuery, sortBy]);

  const formatTimeSpent = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getPlatformStats = () => {
    const stats = allSessions.reduce((acc, session) => {
      if (!acc[session.platform]) {
        acc[session.platform] = { count: 0, timeSpent: 0, completed: 0 };
      }
      acc[session.platform].count++;
      acc[session.platform].timeSpent += session.timeSpent;
      if (session.isCompleted) {
        acc[session.platform].completed++;
      }
      return acc;
    }, {} as Record<string, { count: number; timeSpent: number; completed: number }>);
    
    return Object.entries(stats).map(([platform, data]) => ({
      platform,
      ...data,
      completionRate: data.count > 0 ? (data.completed / data.count) * 100 : 0
    }));
  };

  const handleStartNewLearning = () => {
    navigate(ROUTES.CURIOSITY_PLATFORM);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="sticky" elevation={1} sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
        <Toolbar>
          <IconButton 
            edge="start" 
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <BackIcon />
          </IconButton>
          
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1, fontWeight: 600 }}>
            📚 Continue Learning
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              startIcon={<AnalyticsIcon />}
              onClick={() => navigate('/dashboard/analytics')}
              size="small"
            >
              Analytics
            </Button>
            <IconButton onClick={loadLearningData}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Learning Streak & Insights */}
        {studyStreak && insights && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Study Streak */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)', color: 'white' }}>
                <CardContent>
                  <Typography variant="h4" fontWeight={600} gutterBottom>
                    🔥 {studyStreak.currentStreak}
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    Day Learning Streak
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Longest: {studyStreak.longestStreak} days
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Today: {formatTimeSpent(studyStreak.todayProgress)} / {formatTimeSpent(studyStreak.dailyGoal)}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, (studyStreak.todayProgress / studyStreak.dailyGoal) * 100)}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        '& .MuiLinearProgress-bar': { backgroundColor: 'white' },
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Total Study Time */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h4" fontWeight={600} color="primary" gutterBottom>
                    {formatTimeSpent(insights.totalTimeStudied)}
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    Total Study Time
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg session: {formatTimeSpent(insights.averageSessionTime)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Preferred time: {insights.preferredLearningTime}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Completion Rate */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h4" fontWeight={600} color="success.main" gutterBottom>
                    {Math.round(insights.completionRate)}%
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    Completion Rate
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Strong subjects:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {insights.strongestSubjects.slice(0, 2).map((subject) => (
                      <Chip key={subject} label={subject} size="small" color="success" variant="outlined" />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Platform Statistics */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              📊 Learning Platform Statistics
            </Typography>
            <Grid container spacing={2}>
              {getPlatformStats().map((stat) => (
                <Grid item xs={6} sm={3} key={stat.platform}>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight={600} color="primary">
                      {stat.count}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                      {stat.platform}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatTimeSpent(stat.timeSpent)} • {Math.round(stat.completionRate)}% done
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Filters and Controls */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Search learning sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 250 }}
              />
              
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={(e) => setFilterAnchorEl(e.currentTarget)}
              >
                Filter
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<SortIcon />}
                onClick={(e) => setSortAnchorEl(e.currentTarget)}
              >
                Sort: {sortBy}
              </Button>
              
              <Box sx={{ ml: 'auto' }}>
                <Chip 
                  label={`${filteredAndSortedItems.length} sessions`} 
                  color="primary" 
                  variant="outlined" 
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Learning Sessions */}
        {loading ? (
          <ContinueLearningCard userId={userId} maxItems={10} showStreak={false} />
        ) : filteredAndSortedItems.length > 0 ? (
          <Grid container spacing={3}>
            {filteredAndSortedItems.map((item) => (
              <Grid item xs={12} lg={6} key={item.session.id}>
                <ContinueLearningCard
                  userId={userId}
                  maxItems={1}
                  showStreak={false}
                  compact={true}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              No learning sessions found
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {searchQuery || platformFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Start learning to see your progress here!'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<SchoolIcon />}
              onClick={handleStartNewLearning}
            >
              Start Learning
            </Button>
          </Alert>
        )}

        {/* Filter Menu */}
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={() => setFilterAnchorEl(null)}
        >
          <MenuItem>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Platform</InputLabel>
              <Select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                label="Platform"
              >
                <MenuItem value="all">All Platforms</MenuItem>
                <MenuItem value="course">Courses</MenuItem>
                <MenuItem value="curiosity">Curiosity</MenuItem>
                <MenuItem value="ai_tutor">AI Tutor</MenuItem>
                <MenuItem value="practice">Practice</MenuItem>
              </Select>
            </FormControl>
          </MenuItem>
          <MenuItem>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="video">Videos</MenuItem>
                <MenuItem value="reading">Reading</MenuItem>
                <MenuItem value="quiz">Quizzes</MenuItem>
                <MenuItem value="assignment">Assignments</MenuItem>
                <MenuItem value="curiosity">Curiosity</MenuItem>
              </Select>
            </FormControl>
          </MenuItem>
        </Menu>

        {/* Sort Menu */}
        <Menu
          anchorEl={sortAnchorEl}
          open={Boolean(sortAnchorEl)}
          onClose={() => setSortAnchorEl(null)}
        >
          <MenuItem onClick={() => { setSortBy('priority'); setSortAnchorEl(null); }}>
            Priority
          </MenuItem>
          <MenuItem onClick={() => { setSortBy('recent'); setSortAnchorEl(null); }}>
            Most Recent
          </MenuItem>
          <MenuItem onClick={() => { setSortBy('progress'); setSortAnchorEl(null); }}>
            Progress
          </MenuItem>
          <MenuItem onClick={() => { setSortBy('timeSpent'); setSortAnchorEl(null); }}>
            Time Spent
          </MenuItem>
        </Menu>
      </Container>

      {/* Floating Action Button */}
      <Tooltip title="Start New Learning Session">
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
          }}
          onClick={handleStartNewLearning}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
    </Box>
  );
};

export default ContinueLearningPage;