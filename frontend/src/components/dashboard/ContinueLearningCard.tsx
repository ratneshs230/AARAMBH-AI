import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  LinearProgress,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Skeleton,
  Collapse,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  Quiz as QuizIcon,
  SkipNext as NextIcon,
  Help as HelpIcon,
  MoreVert as MoreIcon,
  AccessTime as TimeIcon,
  TrendingUp as ProgressIcon,
  School as CourseIcon,
  Psychology as AIIcon,
  MenuBook as BookIcon,
  Assignment as AssignmentIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  LocalFireDepartment as StreakIcon,
  EmojiEvents as AchievementIcon,
} from '@mui/icons-material';
import {
  learningProgressService,
  LearningProgressService,
} from '@/services/learningProgressService';

// Import the interfaces directly from the service file
export interface ContinueLearningItem {
  session: LearningSession;
  priority: number;
  reasonToContinue: string;
  timeUntilStale: number;
  quickActions: QuickAction[];
}

export interface StudyStreak {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: Date;
  weeklyGoal: number;
  weeklyProgress: number;
  dailyGoal: number;
  todayProgress: number;
}

export interface LearningSession {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  sectionId?: string;
  title: string;
  description: string;
  type: 'video' | 'reading' | 'quiz' | 'assignment' | 'interactive' | 'curiosity';
  platform: 'course' | 'curiosity' | 'ai_tutor' | 'practice';
  progress: number;
  timeSpent: number;
  lastAccessed: Date;
  isCompleted: boolean;
  completedAt?: Date;
  bookmarks: LearningBookmark[];
  notes: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  actualDuration?: number;
  score?: number;
  nextSuggestion?: NextLearningItem;
}

export interface LearningBookmark {
  id: string;
  timestamp: number;
  title: string;
  note?: string;
  createdAt: Date;
}

export interface NextLearningItem {
  id: string;
  title: string;
  type: string;
  platform: string;
  reason: string;
  estimatedDuration: number;
  difficulty: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  type: 'resume' | 'review' | 'practice' | 'next' | 'help';
}
import { ROUTES } from '@/utils/constants';

interface ContinueLearningCardProps {
  userId: string;
  maxItems?: number;
  showStreak?: boolean;
  compact?: boolean;
}

const ContinueLearningCard: React.FC<ContinueLearningCardProps> = ({
  userId,
  maxItems = 5,
  showStreak = true,
  compact = false,
}) => {
  const navigate = useNavigate();
  const [continueLearning, setContinueLearning] = useState<ContinueLearningItem[]>([]);
  const [studyStreak, setStudyStreak] = useState<StudyStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(!compact);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSession, setSelectedSession] = useState<LearningSession | null>(null);

  useEffect(() => {
    loadContinueLearningData();
  }, [userId, maxItems]);

  const loadContinueLearningData = async () => {
    try {
      setLoading(true);
      
      // Get continue learning items
      const items = learningProgressService.getContinueLearningItems(userId, maxItems);
      setContinueLearning(items);
      
      // Get study streak if requested
      if (showStreak) {
        const streak = learningProgressService.getStudyStreak(userId);
        setStudyStreak(streak);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading continue learning data:', error);
      setLoading(false);
    }
  };

  const handleQuickAction = (action: QuickAction, session: LearningSession) => {
    switch (action.type) {
      case 'resume':
        handleResumeSession(session);
        break;
      case 'review':
        handleReviewSession(session);
        break;
      case 'practice':
        handlePracticeSession(session);
        break;
      case 'next':
        handleNextLesson(session);
        break;
      case 'help':
        handleGetHelp(session);
        break;
      default:
        console.log('Unknown action type:', action.type);
    }
  };

  const handleResumeSession = (session: LearningSession) => {
    // Update last accessed time
    learningProgressService.updateProgress(session.id, session.progress, 0);
    
    // Navigate to appropriate platform
    switch (session.platform) {
      case 'course':
        navigate(`/courses/${session.courseId}/lessons/${session.lessonId}`);
        break;
      case 'curiosity':
        navigate(ROUTES.CURIOSITY_PLATFORM);
        break;
      case 'ai_tutor':
        navigate(ROUTES.AI_TUTOR);
        break;
      case 'practice':
        navigate(ROUTES.PRACTICE);
        break;
      default:
        console.warn('Unknown platform:', session.platform);
    }
  };

  const handleReviewSession = (session: LearningSession) => {
    // Navigate to review mode
    navigate(`/courses/${session.courseId}/review/${session.lessonId}`);
  };

  const handlePracticeSession = (session: LearningSession) => {
    // Navigate to practice mode
    navigate(`/practice/${session.courseId}/${session.lessonId}`);
  };

  const handleNextLesson = (session: LearningSession) => {
    if (session.nextSuggestion) {
      navigate(`/courses/${session.courseId}/lessons/${session.nextSuggestion.id}`);
    }
  };

  const handleGetHelp = (session: LearningSession) => {
    // Navigate to AI tutor with context
    navigate(`${ROUTES.AI_TUTOR}?context=${session.courseId}&lesson=${session.lessonId}`);
  };

  const getSessionIcon = (session: LearningSession) => {
    switch (session.type) {
      case 'video':
        return <PlayIcon />;
      case 'reading':
        return <BookIcon />;
      case 'quiz':
        return <QuizIcon />;
      case 'assignment':
        return <AssignmentIcon />;
      case 'interactive':
        return <AIIcon />;
      case 'curiosity':
        return <ProgressIcon />;
      default:
        return <CourseIcon />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'course':
        return '#1976d2';
      case 'curiosity':
        return '#00bcd4';
      case 'ai_tutor':
        return '#9c27b0';
      case 'practice':
        return '#ff9800';
      default:
        return '#757575';
    }
  };

  const formatTimeSpent = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const formatLastAccessed = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getPriorityColor = (priority: number) => {
    if (priority <= 1.5) return 'error';
    if (priority <= 2.5) return 'warning';
    if (priority <= 3.5) return 'primary';
    return 'info';
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="circular" width={40} height={40} />
          </Box>
          {[...Array(3)].map((_, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
            </Box>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (continueLearning.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              📚 Continue Learning
            </Typography>
            <Button 
              startIcon={<RefreshIcon />} 
              onClick={loadContinueLearningData}
              size="small"
            >
              Refresh
            </Button>
          </Box>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              No learning sessions in progress. Start a new lesson or explore the Curiosity Platform!
            </Typography>
          </Alert>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              startIcon={<ProgressIcon />}
              onClick={() => navigate(ROUTES.CURIOSITY_PLATFORM)}
              size="small"
            >
              Explore Topics
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<AIIcon />}
              onClick={() => navigate(ROUTES.AI_TUTOR)}
              size="small"
            >
              AI Tutor
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              📚 Continue Learning
            </Typography>
            <Chip 
              label={continueLearning.length} 
              size="small" 
              color="primary" 
              variant="outlined" 
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {compact && (
              <IconButton 
                onClick={() => setExpanded(!expanded)}
                size="small"
              >
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
            <IconButton 
              onClick={loadContinueLearningData}
              size="small"
            >
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Study Streak */}
        {showStreak && studyStreak && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.light', borderRadius: 2, color: 'primary.contrastText' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <StreakIcon />
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {studyStreak.currentStreak} Day Streak! 🔥
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Today: {formatTimeSpent(studyStreak.todayProgress)} / {formatTimeSpent(studyStreak.dailyGoal)}
                </Typography>
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, (studyStreak.todayProgress / studyStreak.dailyGoal) * 100)}
              sx={{
                mt: 1,
                height: 6,
                borderRadius: 3,
                backgroundColor: 'rgba(255,255,255,0.3)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'white',
                },
              }}
            />
          </Box>
        )}

        {/* Continue Learning Items */}
        <Collapse in={expanded}>
          <List>
            {continueLearning.map((item, index) => (
              <React.Fragment key={item.session.id}>
                <ListItem
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    mb: 1,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        bgcolor: getPlatformColor(item.session.platform) + '20',
                        color: getPlatformColor(item.session.platform),
                      }}
                    >
                      {getSessionIcon(item.session)}
                    </Box>
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {item.session.title}
                        </Typography>
                        <Chip
                          label={item.session.platform}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            height: 20, 
                            fontSize: '0.7rem',
                            borderColor: getPlatformColor(item.session.platform),
                            color: getPlatformColor(item.session.platform),
                          }}
                        />
                        <Chip
                          label={`Priority ${item.priority}`}
                          size="small"
                          color={getPriorityColor(item.priority)}
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {item.reasonToContinue}
                        </Typography>
                        
                        {/* Progress Bar */}
                        <Box sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Progress
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {Math.round(item.session.progress)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={item.session.progress}
                            sx={{ height: 4, borderRadius: 2 }}
                          />
                        </Box>
                        
                        {/* Metadata */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <TimeIcon sx={{ fontSize: 14 }} />
                            <Typography variant="caption">
                              {formatTimeSpent(item.session.timeSpent)} spent
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            Last: {formatLastAccessed(item.session.lastAccessed)}
                          </Typography>
                          {item.session.estimatedDuration && (
                            <Typography variant="caption" color="text.secondary">
                              ~{formatTimeSpent(item.session.estimatedDuration - item.session.timeSpent)} left
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                      {/* Primary Action */}
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<PlayIcon />}
                        onClick={() => handleResumeSession(item.session)}
                        sx={{ minWidth: 80 }}
                      >
                        {item.session.progress > 0 ? 'Resume' : 'Start'}
                      </Button>
                      
                      {/* Quick Actions */}
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {item.quickActions.slice(1, 3).map((action) => (
                          <Tooltip key={action.id} title={action.label}>
                            <IconButton
                              size="small"
                              onClick={() => handleQuickAction(action, item.session)}
                              sx={{ 
                                bgcolor: 'action.hover',
                                '&:hover': { bgcolor: 'action.selected' }
                              }}
                            >
                              {action.icon === 'Refresh' && <RefreshIcon sx={{ fontSize: 16 }} />}
                              {action.icon === 'Quiz' && <QuizIcon sx={{ fontSize: 16 }} />}
                              {action.icon === 'SkipNext' && <NextIcon sx={{ fontSize: 16 }} />}
                              {action.icon === 'Help' && <HelpIcon sx={{ fontSize: 16 }} />}
                            </IconButton>
                          </Tooltip>
                        ))}
                        
                        {/* More actions menu */}
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setAnchorEl(e.currentTarget);
                            setSelectedSession(item.session);
                          }}
                        >
                          <MoreIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
                
                {index < continueLearning.length - 1 && <Divider sx={{ my: 1 }} />}
              </React.Fragment>
            ))}
          </List>
        </Collapse>

        {/* More Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => {
            setAnchorEl(null);
            setSelectedSession(null);
          }}
        >
          <MenuItem onClick={() => selectedSession && handleReviewSession(selectedSession)}>
            <RefreshIcon sx={{ mr: 1, fontSize: 16 }} />
            Review Session
          </MenuItem>
          <MenuItem onClick={() => selectedSession && handleGetHelp(selectedSession)}>
            <HelpIcon sx={{ mr: 1, fontSize: 16 }} />
            Get AI Help
          </MenuItem>
          <MenuItem onClick={() => selectedSession && handlePracticeSession(selectedSession)}>
            <QuizIcon sx={{ mr: 1, fontSize: 16 }} />
            Practice Mode
          </MenuItem>
        </Menu>
        
        {/* Show All Button */}
        {!compact && continueLearning.length === maxItems && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate('/dashboard/continue-learning')}
            >
              View All Learning Sessions
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ContinueLearningCard;