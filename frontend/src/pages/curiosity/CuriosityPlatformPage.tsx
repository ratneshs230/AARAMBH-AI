import React, { useState, useEffect } from 'react';
import { curiosityService } from '@/services/curiosity';
import { curiosityAIService } from '@/services/curiosityAI';
import type {
  CuriosityTopic,
  CuriosityQuestion,
  DiscoveryPath,
  CuriosityInsight,
  CuriosityStats,
} from '@/types/curiosity';
import CuriosityRewards from '@/components/curiosity/CuriosityRewards';
// import CuriosityAnalytics from '@/components/curiosity/CuriosityAnalytics';
import KnowledgeGraph from '@/components/curiosity/KnowledgeGraph';
import CuriosityChallenges from '@/components/curiosity/CuriosityChallenges';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  IconButton,
  Chip,
  Avatar,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemIcon,
  Tooltip,
  Badge,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Menu,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  Divider,
  CircularProgress,
  Alert,
  Skeleton,
} from '@mui/material';
import type { AlertColor } from '@mui/material/Alert'; // Import AlertColor for type safety
import {
  Psychology as CuriosityIcon,
  Explore as ExploreIcon,
  Lightbulb as IdeaIcon,
  Quiz as QuestionIcon,
  TrendingUp as TrendingIcon,
  Bookmark as BookmarkIcon,
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  School as LearnIcon,
  Science as ScienceIcon,
  History as HistoryIcon,
  Language as LanguageIcon,
  Computer as TechIcon,
  Palette as ArtIcon,
  Sports as SportsIcon,
  Public as WorldIcon,
  AutoAwesome as MagicIcon,
  Timeline as TimelineIcon, // Re-added TimelineIcon
  Groups as CommunityIcon,
  Star as StarIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as AudioIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  Article as ArticleIcon,
  MenuBook as BookIcon,
  Quiz as QuizIcon,
  Assignment as ActivityIcon,
  EmojiEvents as AchievementIcon,
  Speed as SpeedIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  ThumbUp as LikeIcon,
  Comment as CommentIcon,
  Launch as LaunchIcon,
  Download as DownloadIcon,
  CloudUpload as UploadIcon,
  Whatshot as FireIcon,
  EmojiEvents as TrophyIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';

const CuriosityPlatformPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('trending');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<CuriosityTopic | null>(null);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [userStats, setUserStats] = useState<CuriosityStats>({
    topicsExplored: 47,
    questionsAsked: 12,
    questionsAnswered: 8,
    pathsCompleted: 3,
    pathsInProgress: 2,
    curiosityScore: 2847,
    curiosityLevel: 15,
    badges: ['First Explorer', 'Curious Mind', 'Deep Thinker'],
    streakDays: 7,
    totalTimeSpent: 480,
    favoriteCategories: ['Technology', 'Science', 'Arts'],
    recentAchievements: ['Weekly Explorer', 'Question Master'],
  });

  // Load AI recommendations and insights
  useEffect(() => {
    loadAIRecommendations();
    loadAIInsights();
  }, []);

  const loadAIRecommendations = async () => {
    try {
      // Mock user profile - in production, this would come from user context
      const userProfile = {
        id: 'user123',
        interests: ['physics', 'technology', 'science'],
        learningStyle: 'visual',
        preferredDifficulty: 'intermediate',
        completedTopics: ['1', '2'],
        bookmarkedTopics: ['2', '4'],
        searchHistory: ['black holes', 'neural networks'],
        timeSpent: {},
        ratings: {},
      };

      const context = {
        recentlyViewed: ['1', '2', '3'],
        sessionDuration: 45,
        todayActivity: ['1', '2'],
        activeQuestions: ['1', '2'],
      };

      const aiRecommendations = await curiosityAIService.generatePersonalizedRecommendations(
        userProfile,
        context,
        5
      );

      setRecommendations(aiRecommendations);
    } catch (error) {
      console.error('Error loading AI recommendations:', error);
      // Fallback recommendations
      setRecommendations([
        {
          id: 'fallback_1',
          type: 'topic',
          title: 'Quantum Computing Basics',
          description:
            'Explore the fundamentals of quantum computing and its potential applications.',
          relevanceScore: 0.9,
          reason: 'Based on your interest in technology',
          relatedToTopics: ['quantum-mechanics', 'computer-science'],
        },
        {
          id: 'fallback_2',
          type: 'topic',
          title: 'The Science of Learning',
          description: 'Understand how the brain learns and retains information.',
          relevanceScore: 0.8,
          reason: 'Popular among curious learners',
          relatedToTopics: ['neuroscience', 'psychology'],
        },
      ]);
    }
  };

  const loadAIInsights = async () => {
    try {
      const userProfile = {
        id: 'user123',
        interests: ['physics', 'technology', 'science'],
        learningStyle: 'visual',
        preferredDifficulty: 'intermediate',
        completedTopics: ['1', '2'],
        bookmarkedTopics: ['2', '4'],
        searchHistory: ['black holes', 'neural networks'],
        timeSpent: {},
        ratings: {},
      };

      const context = {
        recentlyViewed: ['1', '2', '3'],
        sessionDuration: 45,
        todayActivity: ['1', '2'],
        activeQuestions: ['1', '2'],
      };

      const generatedInsights = await curiosityAIService.generateCuriosityInsights(
        userProfile,
        context
      );

      setAiInsights(generatedInsights);
    } catch (error) {
      console.error('Error loading AI insights:', error);
      // Fallback insights
      setAiInsights([
        {
          id: 'fallback_insight_1',
          type: 'fact',
          content:
            'Did you know? The human brain contains approximately 86 billion neurons, each connected to thousands of others.',
          relatedTopics: ['neuroscience', 'biology'],
          source: 'Neuroscience Research',
          timestamp: new Date().toISOString(),
          isNew: true,
        },
        {
          id: 'fallback_insight_2',
          type: 'connection',
          content:
            'Your interest in AI and learning connects to cognitive science, neuroscience, and educational psychology.',
          relatedTopics: ['artificial-intelligence', 'learning', 'psychology'],
          source: 'Learning Analytics',
          timestamp: new Date().toISOString(),
          isNew: true,
        },
      ]);
    }
  };

  const [topics, setTopics] = useState<CuriosityTopic[]>([
    {
      id: '1',
      title: 'Why do black holes bend space-time?',
      description:
        'Explore the fascinating physics behind black holes and their effect on the fabric of spacetime itself.',
      category: 'Physics',
      difficulty: 'advanced',
      estimatedTime: 45,
      tags: ['space', 'physics', 'relativity', 'astronomy'],
      likes: 1247,
      views: 15890,
      rating: 4.8,
      isBookmarked: false,
      contentTypes: ['video', 'interactive', 'article'],
      relatedTopics: ['general-relativity', 'quantum-mechanics', 'cosmology'],
      aiGenerated: true,
      thumbnail: '/curiosity/black-hole.jpg',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      title: 'How do neural networks learn patterns?',
      description:
        'Dive deep into the mechanisms of artificial neural networks and understand how they recognize patterns.',
      category: 'Technology',
      difficulty: 'intermediate',
      estimatedTime: 30,
      tags: ['ai', 'machine-learning', 'neural-networks', 'technology'],
      likes: 892,
      views: 12456,
      rating: 4.6,
      isBookmarked: true,
      contentTypes: ['interactive', 'video', 'quiz'],
      relatedTopics: ['machine-learning', 'deep-learning', 'algorithms'],
      aiGenerated: false,
      thumbnail: '/curiosity/neural-network.jpg',
      createdAt: '2024-01-10',
    },
    {
      id: '3',
      title: 'What makes music emotionally powerful?',
      description:
        "Discover the science behind music's ability to evoke emotions and create powerful memories.",
      category: 'Arts',
      difficulty: 'beginner',
      estimatedTime: 20,
      tags: ['music', 'psychology', 'emotions', 'neuroscience'],
      likes: 654,
      views: 8934,
      rating: 4.4,
      isBookmarked: false,
      contentTypes: ['video', 'article', 'experiment'],
      relatedTopics: ['psychology', 'neuroscience', 'sound-waves'],
      aiGenerated: true,
      thumbnail: '/curiosity/music-brain.jpg',
      createdAt: '2024-01-08',
    },
    {
      id: '4',
      title: 'How do languages evolve over time?',
      description:
        'Explore the fascinating journey of language evolution and how new words and grammar emerge.',
      category: 'Language',
      difficulty: 'intermediate',
      estimatedTime: 35,
      tags: ['linguistics', 'evolution', 'communication', 'history'],
      likes: 743,
      views: 9876,
      rating: 4.5,
      isBookmarked: true,
      contentTypes: ['article', 'video', 'interactive'],
      relatedTopics: ['linguistics', 'anthropology', 'communication'],
      aiGenerated: false,
      thumbnail: '/curiosity/language-evolution.jpg',
      createdAt: '2024-01-05',
    },
  ]);

  const [questions, setQuestions] = useState<CuriosityQuestion[]>([
    {
      id: '1',
      question: "Why don't we fall through the floor if atoms are mostly empty space?",
      askedBy: 'curious_student',
      category: 'Physics',
      votes: 234,
      answers: 12,
      isAnswered: true,
      difficulty: 'intermediate',
      tags: ['atoms', 'physics', 'quantum'],
      timestamp: '2024-01-16T10:30:00Z',
    },
    {
      id: '2',
      question: 'How does the brain decide what to remember and what to forget?',
      askedBy: 'mindful_learner',
      category: 'Neuroscience',
      votes: 189,
      answers: 8,
      isAnswered: false,
      difficulty: 'advanced',
      tags: ['memory', 'brain', 'neuroscience'],
      timestamp: '2024-01-16T09:15:00Z',
    },
    {
      id: '3',
      question: 'What would happen if we could travel faster than light?',
      askedBy: 'space_explorer',
      category: 'Physics',
      votes: 156,
      answers: 15,
      isAnswered: true,
      difficulty: 'advanced',
      tags: ['relativity', 'space', 'physics'],
      timestamp: '2024-01-16T08:45:00Z',
    },
  ]);

  const [discoveryPaths, setDiscoveryPaths] = useState<DiscoveryPath[]>([
    {
      id: '1',
      title: 'Journey Through the Cosmos',
      description: 'From atoms to galaxies - explore the scales of the universe',
      topics: ['atoms', 'molecules', 'planets', 'stars', 'galaxies'],
      progress: 60,
      totalTopics: 15,
      estimatedDuration: 180,
      difficulty: 'intermediate',
      category: 'Physics',
      participants: 1234,
    },
    {
      id: '2',
      title: 'The Evolution of Intelligence',
      description: 'Trace the development of intelligence from simple organisms to AI',
      topics: ['evolution', 'neuroscience', 'cognition', 'ai'],
      progress: 30,
      totalTopics: 12,
      estimatedDuration: 150,
      difficulty: 'advanced',
      category: 'Biology',
      participants: 892,
    },
    {
      id: '3',
      title: 'Art Through the Ages',
      description: 'Discover how art has evolved and influenced human culture',
      topics: ['prehistoric-art', 'renaissance', 'modern-art', 'digital-art'],
      progress: 80,
      totalTopics: 10,
      estimatedDuration: 120,
      difficulty: 'beginner',
      category: 'Arts',
      participants: 567,
    },
  ]);

  const [insights, setInsights] = useState<CuriosityInsight[]>([
    {
      id: '1',
      type: 'fact',
      content:
        'Did you know? A single teaspoon of neutron star material would weigh about 6 billion tons!',
      relatedTopics: ['neutron-stars', 'physics', 'astronomy'],
      source: 'NASA',
      timestamp: '2024-01-16T12:00:00Z',
      isNew: true,
    },
    {
      id: '2',
      type: 'connection',
      content:
        "Your interest in neural networks connects to 3 other topics you've explored: pattern recognition, machine learning, and cognitive science.",
      relatedTopics: ['neural-networks', 'pattern-recognition', 'machine-learning'],
      source: 'AI Analysis',
      timestamp: '2024-01-16T11:30:00Z',
      isNew: false,
    },
    {
      id: '3',
      type: 'question',
      content:
        'Based on your exploration of quantum mechanics, you might be curious about: How does quantum entanglement work in practice?',
      relatedTopics: ['quantum-mechanics', 'entanglement', 'physics'],
      source: 'Curiosity AI',
      timestamp: '2024-01-16T10:45:00Z',
      isNew: true,
    },
  ]);

  const categories = [
    { id: 'all', label: 'All Categories', icon: <WorldIcon /> },
    { id: 'Physics', label: 'Physics', icon: <ScienceIcon /> },
    { id: 'Technology', label: 'Technology', icon: <TechIcon /> },
    { id: 'Biology', label: 'Biology', icon: <LearnIcon /> },
    { id: 'Arts', label: 'Arts', icon: <ArtIcon /> },
    { id: 'Language', label: 'Language', icon: <LanguageIcon /> },
    { id: 'History', label: 'History', icon: <HistoryIcon /> },
    { id: 'Sports', label: 'Sports', icon: <SportsIcon /> },
  ];

  const handleTopicClick = (topic: CuriosityTopic) => {
    setSelectedTopic(topic);
    setDetailsOpen(true);
  };

  const handleBookmark = (topicId: string) => {
    setTopics(prev =>
      prev.map(topic =>
        topic.id === topicId ? { ...topic, isBookmarked: !topic.isBookmarked } : topic
      )
    );
  };

  const handleLike = (topicId: string) => {
    setTopics(prev =>
      prev.map(topic => (topic.id === topicId ? { ...topic, likes: topic.likes + 1 } : topic))
    );
  };

  const submitQuestion = () => {
    if (!newQuestion.trim()) return;

    const question: CuriosityQuestion = {
      id: Date.now().toString(),
      question: newQuestion,
      askedBy: 'current_user',
      category: selectedCategory === 'all' ? 'General' : selectedCategory,
      votes: 0,
      answers: 0,
      isAnswered: false,
      difficulty: 'intermediate',
      tags: [],
      timestamp: new Date().toISOString(),
    };

    setQuestions(prev => [question, ...prev]);
    setNewQuestion('');
    setQuestionDialogOpen(false);
  };

  // Handler functions for new components
  const handleChallengeJoin = (challengeId: string) => {
    console.log('Joining challenge:', challengeId);
    // Implementation for joining a challenge
  };

  const handleChallengeComplete = (challengeId: string) => {
    console.log('Completing challenge:', challengeId);
    // Implementation for completing a challenge
  };

  const handleTaskComplete = (challengeId: string, taskId: string) => {
    console.log('Completing task:', taskId, 'in challenge:', challengeId);
    // Implementation for completing a task
  };

  const handleBadgeEarned = (badgeId: string) => {
    console.log('Badge earned:', badgeId);
    // Implementation for earning a badge
  };

  const handleTimeRangeChange = (range: 'week' | 'month' | 'year') => {
    setTimeRange(range);
  };

  const handleNodeClick = (node: any) => {
    console.log('Node clicked:', node);
    // Implementation for knowledge graph node click
  };

  const handleEdgeClick = (edge: any) => {
    console.log('Edge clicked:', edge);
    // Implementation for knowledge graph edge click
  };

  const filteredTopics = topics.filter(topic => {
    const matchesSearch =
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === 'all' || topic.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const sortedTopics = [...filteredTopics].sort((a, b) => {
    switch (sortBy) {
      case 'trending':
        return b.likes + b.views - (a.likes + a.views);
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'rating':
        return b.rating - a.rating;
      case 'difficulty':
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      default:
        return 0;
    }
  });

  const getDifficultyColor = (difficulty: string): AlertColor => {
    // Changed return type to AlertColor
    switch (difficulty) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'error';
      default:
        return 'info'; // Changed default to 'info' to match AlertColor
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryMap: { [key: string]: React.ReactNode } = {
      Physics: <ScienceIcon />,
      Technology: <TechIcon />,
      Biology: <LearnIcon />,
      Arts: <ArtIcon />,
      Language: <LanguageIcon />,
      History: <HistoryIcon />,
      Sports: <SportsIcon />,
    };
    return categoryMap[category] || <WorldIcon />;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'fact':
        return <IdeaIcon />;
      case 'connection':
        return <ExploreIcon />;
      case 'question':
        return <QuestionIcon />;
      case 'discovery':
        return <ExploreIcon />;
      default:
        return <MagicIcon />;
    }
  };

  const getInsightColor = (type: string): AlertColor => {
    switch (type) {
      case 'fact':
        return 'info';
      case 'connection':
        return 'success';
      case 'question':
        return 'warning';
      case 'discovery':
        return 'info';
      default:
        return 'info';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography
          variant='h4'
          component='h1'
          sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <CuriosityIcon color='primary' sx={{ fontSize: '2rem' }} />
          Curiosity Platform
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={() => setQuestionDialogOpen(true)}
          >
            Ask Question
          </Button>
          <Button variant='outlined' startIcon={<ExploreIcon />}>
            Explore Topics
          </Button>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder='Search topics, questions, or discoveries...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            variant='outlined'
            size='small'
            sx={{ flex: 1, minWidth: 300 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
            }}
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            {categories.slice(0, 4).map(category => (
              <Chip
                key={category.id}
                label={category.label}
                icon={category.icon}
                onClick={() => setSelectedCategory(category.id)}
                color={selectedCategory === category.id ? 'primary' : 'default'}
                variant={selectedCategory === category.id ? 'filled' : 'outlined'}
              />
            ))}

            <IconButton onClick={e => setFilterMenuAnchor(e.currentTarget)} size='small'>
              <FilterIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - Main Content */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ mb: 3 }}>
            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
              <Tab label='Explore Topics' icon={<ExploreIcon />} />
              <Tab label='Questions' icon={<QuestionIcon />} />
              <Tab label='Discovery Paths' icon={<TimelineIcon />} />
              <Tab label='Challenges' icon={<FireIcon />} />
              <Tab label='Rewards' icon={<TrophyIcon />} />
              <Tab label='Analytics' icon={<AnalyticsIcon />} />
              <Tab label='Knowledge Graph' icon={<TimelineIcon />} />
            </Tabs>
          </Paper>

          {/* Topics Tab */}
          {activeTab === 0 && (
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant='h6'>Trending Topics ({sortedTopics.length})</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size='small'
                    startIcon={<SortIcon />}
                    onClick={e => setFilterMenuAnchor(e.currentTarget)}
                  >
                    Sort by: {sortBy}
                  </Button>
                  <Button
                    size='small'
                    startIcon={<RefreshIcon />}
                    onClick={() => setIsLoading(true)}
                  >
                    Refresh
                  </Button>
                </Box>
              </Box>

              <Grid container spacing={2}>
                {sortedTopics.map(topic => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={topic.id}>
                    <Card
                      sx={{
                        height: '100%',
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: 3,
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s',
                      }}
                      onClick={() => handleTopicClick(topic)}
                    >
                      <Box sx={{ position: 'relative' }}>
                        <Box
                          sx={{
                            height: 120,
                            bgcolor: 'primary.light',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {getCategoryIcon(topic.category)}
                        </Box>

                        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                          <IconButton
                            size='small'
                            onClick={e => {
                              e.stopPropagation();
                              handleBookmark(topic.id);
                            }}
                            sx={{ bgcolor: 'rgba(255,255,255,0.8)' }}
                          >
                            <BookmarkIcon color={topic.isBookmarked ? 'primary' : 'action'} />
                          </IconButton>
                        </Box>

                        {topic.aiGenerated && (
                          <Chip
                            label='AI Generated'
                            size='small'
                            sx={{ position: 'absolute', top: 8, left: 8 }}
                            color='secondary'
                          />
                        )}
                      </Box>

                      <CardContent>
                        <Typography variant='h6' gutterBottom noWrap>
                          {topic.title}
                        </Typography>

                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {topic.description}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 2 }}>
                          <Chip
                            label={topic.difficulty}
                            size='small'
                            color={getDifficultyColor(topic.difficulty)}
                          />
                          <Chip
                            label={`${topic.estimatedTime}min`}
                            size='small'
                            variant='outlined'
                          />
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LikeIcon fontSize='small' />
                              <Typography variant='caption'>{topic.likes}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Rating value={topic.rating} readOnly size='small' />
                              <Typography variant='caption'>({topic.rating})</Typography>
                            </Box>
                          </Box>

                          <IconButton
                            size='small'
                            onClick={e => {
                              e.stopPropagation();
                              handleLike(topic.id);
                            }}
                          >
                            <FavoriteIcon fontSize='small' />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Questions Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant='h6' gutterBottom>
                Community Questions
              </Typography>

              <List>
                {questions.map(question => (
                  <Paper key={question.id} sx={{ mb: 2 }}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <QuestionIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={question.question}
                        secondary={
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
                            <Typography variant='caption'>Asked by {question.askedBy}</Typography>
                            <Chip label={question.category} size='small' />
                            <Chip
                              label={question.difficulty}
                              size='small'
                              color={getDifficultyColor(question.difficulty)}
                            />
                            <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
                              <Typography variant='caption'>{question.votes} votes</Typography>
                              <Typography variant='caption'>{question.answers} answers</Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  </Paper>
                ))}
              </List>
            </Box>
          )}

          {/* Discovery Paths Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant='h6' gutterBottom>
                Discovery Paths
              </Typography>

              {discoveryPaths.map(path => (
                <Paper key={path.id} sx={{ mb: 2, p: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant='h6' gutterBottom>
                        {path.title}
                      </Typography>
                      <Typography variant='body2' color='text.secondary' gutterBottom>
                        {path.description}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip label={path.category} size='small' />
                        <Chip
                          label={path.difficulty}
                          size='small'
                          color={getDifficultyColor(path.difficulty)}
                        />
                        <Chip
                          label={`${path.estimatedDuration}min`}
                          size='small'
                          variant='outlined'
                        />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant='caption' color='text.secondary'>
                          Progress: {path.progress}% (
                          {Math.floor((path.totalTopics * path.progress) / 100)}/{path.totalTopics}{' '}
                          topics)
                        </Typography>
                        <LinearProgress
                          variant='determinate'
                          value={path.progress}
                          sx={{ mt: 0.5 }}
                        />
                      </Box>

                      <Typography variant='caption' color='text.secondary'>
                        {path.participants} participants
                      </Typography>
                    </Box>

                    <Button variant='contained' startIcon={<PlayIcon />}>
                      Continue
                    </Button>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}

          {/* Challenges Tab */}
          {activeTab === 3 && (
            <CuriosityChallenges
              onChallengeJoin={handleChallengeJoin}
              onChallengeComplete={handleChallengeComplete}
              onTaskComplete={handleTaskComplete}
            />
          )}

          {/* Rewards Tab */}
          {activeTab === 4 && (
            <CuriosityRewards
              userStats={userStats}
              onChallengeComplete={handleChallengeComplete}
              onBadgeEarned={handleBadgeEarned}
            />
          )}

          {/* Analytics Tab */}
          {activeTab === 5 && (
            <Box sx={{ p: 2 }}>
              <Typography variant='h6' gutterBottom>
                Curiosity Analytics
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Analytics feature is being implemented. Check back soon for detailed insights!
              </Typography>
            </Box>
          )}

          {/* Knowledge Graph Tab */}
          {activeTab === 6 && (
            <KnowledgeGraph
              centerTopic='artificial-intelligence'
              showControls={true}
              interactive={true}
              onNodeClick={handleNodeClick}
              onEdgeClick={handleEdgeClick}
            />
          )}
        </Grid>

        {/* Right Column - Insights and Activities */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* AI Recommendations */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography
              variant='h6'
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <MagicIcon color='primary' />
              AI Recommendations
            </Typography>

            {recommendations.length > 0 ? (
              <List dense>
                {recommendations.map((rec, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemText
                      primary={rec.title}
                      secondary={rec.description}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
          </Paper>

          {/* Daily Insights */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography
              variant='h6'
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <MagicIcon color='primary' />
              Daily Insights
            </Typography>

            {aiInsights.length > 0
              ? aiInsights.map(insight => (
                  <Box key={insight.id} sx={{ mb: 2 }}>
                    <Alert
                      severity={getInsightColor(insight.type)}
                      icon={getInsightIcon(insight.type)}
                      sx={{ mb: 1 }}
                    >
                      <Typography variant='body2'>{insight.content}</Typography>
                    </Alert>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {insight.relatedTopics.map(topic => (
                        <Chip key={topic} label={topic} size='small' variant='outlined' />
                      ))}
                    </Box>
                  </Box>
                ))
              : insights.map(insight => (
                  <Box key={insight.id} sx={{ mb: 2 }}>
                    <Alert
                      severity={getInsightColor(insight.type)}
                      icon={getInsightIcon(insight.type)}
                      sx={{ mb: 1 }}
                    >
                      <Typography variant='body2'>{insight.content}</Typography>
                    </Alert>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {insight.relatedTopics.map(topic => (
                        <Chip key={topic} label={topic} size='small' variant='outlined' />
                      ))}
                    </Box>
                  </Box>
                ))}
          </Paper>

          {/* Quick Stats */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant='h6' gutterBottom>
              Your Curiosity Stats
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant='h4' color='primary'>
                  47
                </Typography>
                <Typography variant='caption'>Topics Explored</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant='h4' color='secondary'>
                  12
                </Typography>
                <Typography variant='caption'>Questions Asked</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant='h4' color='success.main'>
                  89
                </Typography>
                <Typography variant='caption'>Curiosity Score</Typography>
              </Box>
            </Box>

            <LinearProgress variant='determinate' value={89} sx={{ height: 8, borderRadius: 4 }} />
            <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
              Keep exploring to reach Curiosity Level 10!
            </Typography>
          </Paper>

          {/* Recent Activity */}
          <Paper sx={{ p: 2 }}>
            <Typography variant='h6' gutterBottom>
              Recent Activity
            </Typography>

            <List dense>
              <ListItem>
                <ListItemIcon>
                  <ExploreIcon color='primary' />
                </ListItemIcon>
                <ListItemText primary='Explored: Black Holes' secondary='2 hours ago' />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <QuestionIcon color='secondary' />
                </ListItemIcon>
                <ListItemText primary='Asked about quantum mechanics' secondary='5 hours ago' />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <AchievementIcon color='warning' />
                </ListItemIcon>
                <ListItemText primary="Earned 'Deep Thinker' badge" secondary='1 day ago' />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <BookmarkIcon color='info' />
                </ListItemIcon>
                <ListItemText primary='Bookmarked 3 topics' secondary='2 days ago' />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Topic Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth='md' fullWidth>
        {selectedTopic && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant='h6'>{selectedTopic.title}</Typography>
                <IconButton onClick={() => setDetailsOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>

            <DialogContent>
              <Typography variant='body1' gutterBottom>
                {selectedTopic.description}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip label={selectedTopic.category} />
                <Chip
                  label={selectedTopic.difficulty}
                  color={getDifficultyColor(selectedTopic.difficulty)}
                />
                <Chip label={`${selectedTopic.estimatedTime} minutes`} variant='outlined' />
              </Box>

              <Typography variant='h6' gutterBottom sx={{ mt: 2 }}>
                Content Types Available
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                {selectedTopic.contentTypes.map(type => (
                  <Chip
                    key={type}
                    label={type}
                    icon={
                      type === 'video' ? (
                        <VideoIcon />
                      ) : type === 'article' ? (
                        <ArticleIcon />
                      ) : type === 'quiz' ? (
                        <QuizIcon />
                      ) : type === 'interactive' ? (
                        <ActivityIcon />
                      ) : (
                        <BookIcon />
                      )
                    }
                    variant='outlined'
                  />
                ))}
              </Box>

              <Typography variant='h6' gutterBottom sx={{ mt: 2 }}>
                Related Topics
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {selectedTopic.relatedTopics.map(topic => (
                  <Chip key={topic} label={topic} size='small' clickable variant='outlined' />
                ))}
              </Box>
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
              <Button
                variant='contained'
                startIcon={<PlayIcon />}
                onClick={() => {
                  // Handle start learning
                  setDetailsOpen(false);
                }}
              >
                Start Learning
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Ask Question Dialog */}
      <Dialog
        open={questionDialogOpen}
        onClose={() => setQuestionDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Ask a Question</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            label='Your Question'
            value={newQuestion}
            onChange={e => setNewQuestion(e.target.value)}
            placeholder='What are you curious about?'
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuestionDialogOpen(false)}>Cancel</Button>
          <Button variant='contained' onClick={submitQuestion} disabled={!newQuestion.trim()}>
            Ask Question
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
      >
        <MenuItem onClick={() => setSortBy('trending')}>Trending</MenuItem>
        <MenuItem onClick={() => setSortBy('newest')}>Newest</MenuItem>
        <MenuItem onClick={() => setSortBy('rating')}>Highest Rated</MenuItem>
        <MenuItem onClick={() => setSortBy('difficulty')}>By Difficulty</MenuItem>
      </Menu>

      {/* Floating Action Button */}
      <Fab
        color='primary'
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => setQuestionDialogOpen(true)}
      >
        <QuestionIcon />
      </Fab>
    </Box>
  );
};

export default CuriosityPlatformPage;
