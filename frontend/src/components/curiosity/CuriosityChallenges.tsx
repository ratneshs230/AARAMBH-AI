import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  Fab,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
} from '@mui/material';
import {
  Whatshot as FireIcon,
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  Group as GroupIcon,
  CheckCircle as CheckIcon,
  PlayArrow as StartIcon,
  Add as AddIcon,
  Share as ShareIcon,
  Leaderboard as LeaderboardIcon,
  Flag as FlagIcon,
  Explore as ExploreIcon,
  Create as CreateIcon,
  Groups as CommunityIcon,
  Close as CloseIcon,
  AccessTime as ClockIcon,
  People as PeopleIcon,
  Diamond as DiamondIcon,
} from '@mui/icons-material';
import type { CuriosityChallenge, CuriosityTask } from '@/types/curiosity';

interface CuriosityChallengesProps {
  onChallengeJoin: (challengeId: string) => void;
  onChallengeComplete?: (challengeId: string) => void;
  onTaskComplete?: (challengeId: string, taskId: string) => void;
}

const CuriosityChallenges: React.FC<CuriosityChallengesProps> = ({
  onChallengeJoin,
  onChallengeComplete: _onChallengeComplete,
  onTaskComplete: _onTaskComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'available' | 'completed'>('active');
  const [selectedChallenge, setSelectedChallenge] = useState<CuriosityChallenge | null>(null);
  const [challengeDialogOpen, setChallengeDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [challenges, setChallenges] = useState<CuriosityChallenge[]>([]);
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'ending-soon'>('newest');
  const [isLoading, setIsLoading] = useState(false);

  // Mock challenges data
  const mockChallenges: CuriosityChallenge[] = [
    {
      id: 'weekly_explorer',
      title: 'Weekly Explorer Challenge',
      description: 'Explore 7 different topics across various categories this week',
      tasks: [
        {
          id: '1',
          title: 'Explore a Science topic',
          description: 'Visit any topic in the Science category',
          type: 'explore',
          targetType: 'category',
          targetId: 'science',
          completed: true,
          progress: 100,
          completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          title: 'Explore a Technology topic',
          description: 'Visit any topic in the Technology category',
          type: 'explore',
          targetType: 'category',
          targetId: 'technology',
          completed: true,
          progress: 100,
          completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          title: 'Explore an Arts topic',
          description: 'Visit any topic in the Arts category',
          type: 'explore',
          targetType: 'category',
          targetId: 'arts',
          completed: false,
          progress: 0,
        },
        {
          id: '4',
          title: 'Explore a History topic',
          description: 'Visit any topic in the History category',
          type: 'explore',
          targetType: 'category',
          targetId: 'history',
          completed: false,
          progress: 0,
        },
        {
          id: '5',
          title: 'Explore a Language topic',
          description: 'Visit any topic in the Language category',
          type: 'explore',
          targetType: 'category',
          targetId: 'language',
          completed: false,
          progress: 0,
        },
        {
          id: '6',
          title: 'Explore a Math topic',
          description: 'Visit any topic in the Math category',
          type: 'explore',
          targetType: 'category',
          targetId: 'math',
          completed: false,
          progress: 0,
        },
        {
          id: '7',
          title: 'Explore a Philosophy topic',
          description: 'Visit any topic in the Philosophy category',
          type: 'explore',
          targetType: 'category',
          targetId: 'philosophy',
          completed: false,
          progress: 0,
        },
      ],
      expectedDuration: 168,
      rewards: ['Weekly Explorer Badge', '200 Curiosity Points', 'Knowledge Diversity Boost'],
      difficulty: 'medium',
      category: 'Exploration',
      participants: 2847,
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      progress: 28,
    },
    {
      id: 'question_master',
      title: 'Question Master Sprint',
      description: 'Ask 10 thoughtful questions and get community engagement',
      tasks: [
        {
          id: '1',
          title: 'Ask 5 questions',
          description: 'Post 5 questions on any topics',
          type: 'question',
          completed: true,
          progress: 100,
        },
        {
          id: '2',
          title: 'Get 20 total votes',
          description: 'Receive 20 votes on your questions',
          type: 'question',
          completed: false,
          progress: 65,
        },
        {
          id: '3',
          title: 'Get 3 answers',
          description: 'Have 3 of your questions answered',
          type: 'question',
          completed: false,
          progress: 33,
        },
      ],
      expectedDuration: 72,
      rewards: ['Inquisitive Mind Badge', '150 Curiosity Points', 'Community Recognition'],
      difficulty: 'easy',
      category: 'Engagement',
      participants: 1834,
      startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      progress: 66,
    },
    {
      id: 'knowledge_marathon',
      title: 'Knowledge Marathon',
      description: 'Complete 3 discovery paths in different categories',
      tasks: [
        {
          id: '1',
          title: 'Complete Science path',
          description: 'Finish any discovery path in Science',
          type: 'complete',
          targetType: 'path',
          completed: true,
          progress: 100,
        },
        {
          id: '2',
          title: 'Complete Technology path',
          description: 'Finish any discovery path in Technology',
          type: 'complete',
          targetType: 'path',
          completed: false,
          progress: 70,
        },
        {
          id: '3',
          title: 'Complete Arts path',
          description: 'Finish any discovery path in Arts',
          type: 'complete',
          targetType: 'path',
          completed: false,
          progress: 0,
        },
      ],
      expectedDuration: 300,
      rewards: ['Marathon Runner Badge', '500 Curiosity Points', 'Learning Streak Multiplier'],
      difficulty: 'hard',
      category: 'Achievement',
      participants: 892,
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      progress: 57,
    },
    {
      id: 'social_butterfly',
      title: 'Social Butterfly Challenge',
      description: 'Share discoveries and help the community',
      tasks: [
        {
          id: '1',
          title: 'Share 5 topics',
          description: 'Share interesting topics with friends',
          type: 'share',
          completed: false,
          progress: 60,
        },
        {
          id: '2',
          title: 'Answer 3 questions',
          description: 'Help others by answering their questions',
          type: 'question',
          completed: false,
          progress: 33,
        },
        {
          id: '3',
          title: 'Get 10 likes',
          description: 'Receive likes on your contributions',
          type: 'question',
          completed: false,
          progress: 80,
        },
      ],
      expectedDuration: 120,
      rewards: ['Social Contributor Badge', '250 Curiosity Points', 'Community Spotlight'],
      difficulty: 'medium',
      category: 'Community',
      participants: 1567,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      progress: 58,
    },
  ];

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setChallenges(mockChallenges);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleChallengeClick = (challenge: CuriosityChallenge) => {
    setSelectedChallenge(challenge);
    setChallengeDialogOpen(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
        return 'error';
      default:
        return 'default';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <StarIcon />;
      case 'medium':
        return <DiamondIcon />;
      case 'hard':
        return <TrophyIcon />;
      default:
        return <StarIcon />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Exploration':
        return <ExploreIcon />;
      case 'Engagement':
        return <CommunityIcon />;
      case 'Achievement':
        return <TrophyIcon />;
      case 'Community':
        return <GroupIcon />;
      default:
        return <FlagIcon />;
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffInHours = Math.floor((end.getTime() - now.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) return `${diffInHours} hours left`;
    return `${Math.floor(diffInHours / 24)} days left`;
  };

  const completedTasks = (tasks: CuriosityTask[]) => tasks.filter(task => task.completed).length;
  const totalTasks = (tasks: CuriosityTask[]) => tasks.length;

  const filteredChallenges = challenges.filter(challenge => {
    if (filter !== 'all' && challenge.difficulty !== filter) return false;
    if (activeTab === 'active' && !challenge.isActive) return false;
    if (activeTab === 'completed' && (challenge.progress || 0) < 100) return false;
    if (activeTab === 'available' && challenge.isActive) return false;
    return true;
  });

  const sortedChallenges = [...filteredChallenges].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.participants - a.participants;
      case 'ending-soon':
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      case 'newest':
      default:
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    }
  });

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
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant='h4' gutterBottom sx={{ fontWeight: 'bold' }}>
              🔥 Curiosity Challenges
            </Typography>
            <Typography variant='h6' sx={{ opacity: 0.9 }}>
              Test your knowledge and compete with the community
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant='contained'
              startIcon={<LeaderboardIcon />}
              sx={{ bgcolor: 'white', color: 'primary.main' }}
            >
              Leaderboard
            </Button>
            <Button
              variant='outlined'
              startIcon={<CreateIcon />}
              sx={{ borderColor: 'white', color: 'white' }}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create Challenge
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Navigation and Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={activeTab === 'active' ? 'contained' : 'outlined'}
                onClick={() => setActiveTab('active')}
                startIcon={<FireIcon />}
              >
                Active
              </Button>
              <Button
                variant={activeTab === 'available' ? 'contained' : 'outlined'}
                onClick={() => setActiveTab('available')}
                startIcon={<FlagIcon />}
              >
                Available
              </Button>
              <Button
                variant={activeTab === 'completed' ? 'contained' : 'outlined'}
                onClick={() => setActiveTab('completed')}
                startIcon={<CheckIcon />}
              >
                Completed
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size='small' sx={{ minWidth: 120 }}>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={filter}
                  onChange={e => setFilter(e.target.value as any)}
                  label='Difficulty'
                >
                  <MenuItem value='all'>All Levels</MenuItem>
                  <MenuItem value='easy'>Easy</MenuItem>
                  <MenuItem value='medium'>Medium</MenuItem>
                  <MenuItem value='hard'>Hard</MenuItem>
                </Select>
              </FormControl>
              <FormControl size='small' sx={{ minWidth: 120 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  label='Sort By'
                >
                  <MenuItem value='newest'>Newest</MenuItem>
                  <MenuItem value='popular'>Most Popular</MenuItem>
                  <MenuItem value='ending-soon'>Ending Soon</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Challenges Grid */}
      <Grid container spacing={3}>
        {sortedChallenges.map(challenge => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={challenge.id}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => handleChallengeClick(challenge)}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getCategoryIcon(challenge.category)}
                    <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                      {challenge.title}
                    </Typography>
                  </Box>
                  <Chip
                    label={challenge.difficulty}
                    size='small'
                    color={getDifficultyColor(challenge.difficulty)}
                    icon={getDifficultyIcon(challenge.difficulty)}
                  />
                </Box>

                <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                  {challenge.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip label={challenge.category} size='small' variant='outlined' />
                  <Chip
                    label={`${challenge.participants} participants`}
                    size='small'
                    variant='outlined'
                    icon={<PeopleIcon />}
                  />
                  <Chip
                    label={getTimeRemaining(challenge.endDate)}
                    size='small'
                    variant='outlined'
                    icon={<ClockIcon />}
                    color='warning'
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                    }}
                  >
                    <Typography variant='body2'>
                      Progress: {completedTasks(challenge.tasks)}/{totalTasks(challenge.tasks)}{' '}
                      tasks
                    </Typography>
                    <Typography variant='body2' color='primary'>
                      {challenge.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant='determinate'
                    value={challenge.progress || 0}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant='body2' color='text.secondary'>
                    Rewards: {challenge.rewards.length} items
                  </Typography>
                  <Button
                    variant='contained'
                    size='small'
                    startIcon={challenge.isActive ? <StartIcon /> : <StartIcon />}
                    onClick={e => {
                      e.stopPropagation();
                      onChallengeJoin(challenge.id);
                    }}
                  >
                    {challenge.isActive ? 'Continue' : 'Join'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Challenge Details Dialog */}
      <Dialog
        open={challengeDialogOpen}
        onClose={() => setChallengeDialogOpen(false)}
        maxWidth='md'
        fullWidth
      >
        {selectedChallenge && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getCategoryIcon(selectedChallenge.category)}
                  <Typography variant='h6'>{selectedChallenge.title}</Typography>
                </Box>
                <IconButton onClick={() => setChallengeDialogOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>

            <DialogContent>
              <Typography variant='body1' gutterBottom>
                {selectedChallenge.description}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                <Chip
                  label={selectedChallenge.difficulty}
                  color={getDifficultyColor(selectedChallenge.difficulty)}
                  icon={getDifficultyIcon(selectedChallenge.difficulty)}
                />
                <Chip label={selectedChallenge.category} />
                <Chip
                  label={`${selectedChallenge.participants} participants`}
                  icon={<PeopleIcon />}
                />
                <Chip
                  label={getTimeRemaining(selectedChallenge.endDate)}
                  icon={<ClockIcon />}
                  color='warning'
                />
              </Box>

              <Typography variant='h6' gutterBottom>
                Tasks ({completedTasks(selectedChallenge.tasks)}/
                {totalTasks(selectedChallenge.tasks)} completed)
              </Typography>

              <Stepper orientation='vertical'>
                {selectedChallenge.tasks.map(task => (
                  <Step key={task.id} active={!task.completed} completed={task.completed}>
                    <StepLabel>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {task.title}
                        {task.completed && <CheckIcon color='success' />}
                      </Box>
                    </StepLabel>
                    <StepContent>
                      <Typography variant='body2' color='text.secondary'>
                        {task.description}
                      </Typography>
                      {!task.completed && task.progress && task.progress > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <LinearProgress
                            variant='determinate'
                            value={task.progress}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                          <Typography variant='caption' sx={{ mt: 0.5, display: 'block' }}>
                            {task.progress}% complete
                          </Typography>
                        </Box>
                      )}
                    </StepContent>
                  </Step>
                ))}
              </Stepper>

              <Typography variant='h6' gutterBottom sx={{ mt: 3 }}>
                Rewards
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {selectedChallenge.rewards.map(reward => (
                  <Chip
                    key={reward}
                    label={reward}
                    color='primary'
                    variant='outlined'
                    icon={<TrophyIcon />}
                  />
                ))}
              </Box>
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setChallengeDialogOpen(false)}>Close</Button>
              <Button variant='outlined' startIcon={<ShareIcon />}>
                Share Challenge
              </Button>
              <Button
                variant='contained'
                startIcon={selectedChallenge.isActive ? <StartIcon /> : <StartIcon />}
                onClick={() => {
                  onChallengeJoin(selectedChallenge.id);
                  setChallengeDialogOpen(false);
                }}
              >
                {selectedChallenge.isActive ? 'Continue' : 'Join Challenge'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create Challenge Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Create Custom Challenge</DialogTitle>
        <DialogContent>
          <Alert severity='info' sx={{ mb: 2 }}>
            Create your own challenge for the community to participate in!
          </Alert>
          <TextField
            fullWidth
            label='Challenge Title'
            sx={{ mb: 2 }}
            placeholder='Enter challenge title'
          />
          <TextField
            fullWidth
            label='Description'
            multiline
            rows={3}
            sx={{ mb: 2 }}
            placeholder='Describe your challenge'
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Difficulty</InputLabel>
            <Select label='Difficulty'>
              <MenuItem value='easy'>Easy</MenuItem>
              <MenuItem value='medium'>Medium</MenuItem>
              <MenuItem value='hard'>Hard</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select label='Category'>
              <MenuItem value='exploration'>Exploration</MenuItem>
              <MenuItem value='engagement'>Engagement</MenuItem>
              <MenuItem value='achievement'>Achievement</MenuItem>
              <MenuItem value='community'>Community</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant='contained'>Create Challenge</Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color='primary'
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default CuriosityChallenges;
