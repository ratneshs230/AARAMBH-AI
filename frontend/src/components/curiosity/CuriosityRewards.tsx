import React, { useState, useEffect, useMemo } from 'react';
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
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  CircularProgress,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  Whatshot as FireIcon,
  Lock as LockedIcon,
  CheckCircle as CompletedIcon,
  ExpandMore as ExpandMoreIcon,
  Share as ShareIcon,
  Leaderboard as LeaderboardIcon,
  Diamond as DiamondIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import type { CuriosityBadge, CuriosityChallenge, CuriosityStats } from '@/types/curiosity';

interface CuriosityRewardsProps {
  userStats: CuriosityStats;
  onChallengeComplete: (challengeId: string) => void;
  onBadgeEarned: (badgeId: string) => void;
}

const CuriosityRewards: React.FC<CuriosityRewardsProps> = ({
  userStats,
  onChallengeComplete: _onChallengeComplete,
  onBadgeEarned: _onBadgeEarned,
}) => {
  const [activeTab, setActiveTab] = useState<'badges' | 'challenges' | 'leaderboard'>('badges');
  const [selectedBadge, setSelectedBadge] = useState<CuriosityBadge | null>(null);
  const [badgeDialogOpen, setBadgeDialogOpen] = useState(false);
  const [challenges, setChallenges] = useState<CuriosityChallenge[]>([]);
  const [badges, setBadges] = useState<CuriosityBadge[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // Mock badges data
  const mockBadges: CuriosityBadge[] = useMemo(
    () => [
      {
        id: 'first_explorer',
        name: 'First Explorer',
        description: 'Explore your first topic',
        icon: '🚀',
        category: 'Getting Started',
        rarity: 'common',
        requirements: ['Explore 1 topic'],
        unlockedAt: new Date().toISOString(),
        progress: 100,
      },
      {
        id: 'curious_mind',
        name: 'Curious Mind',
        description: 'Ask 10 questions',
        icon: '🤔',
        category: 'Engagement',
        rarity: 'common',
        requirements: ['Ask 10 questions'],
        progress: 70,
      },
      {
        id: 'knowledge_seeker',
        name: 'Knowledge Seeker',
        description: 'Complete 5 discovery paths',
        icon: '📚',
        category: 'Learning',
        rarity: 'uncommon',
        requirements: ['Complete 5 discovery paths'],
        progress: 40,
      },
      {
        id: 'deep_thinker',
        name: 'Deep Thinker',
        description: 'Spend 10 hours exploring topics',
        icon: '🧠',
        category: 'Dedication',
        rarity: 'rare',
        requirements: ['Spend 10 hours exploring'],
        progress: 85,
      },
      {
        id: 'master_explorer',
        name: 'Master Explorer',
        description: 'Reach curiosity level 50',
        icon: '👑',
        category: 'Achievement',
        rarity: 'legendary',
        requirements: ['Reach curiosity level 50'],
        progress: 20,
      },
    ],
    []
  );

  // Mock challenges data
  const mockChallenges: CuriosityChallenge[] = useMemo(
    () => [
      {
        id: 'weekly_explorer',
        title: 'Weekly Explorer',
        description: 'Explore 7 different topics this week',
        tasks: [
          {
            id: '1',
            title: 'Explore a Science topic',
            type: 'explore',
            completed: true,
            description: '',
            progress: 100,
          },
          {
            id: '2',
            title: 'Explore a Technology topic',
            type: 'explore',
            completed: true,
            description: '',
            progress: 100,
          },
          {
            id: '3',
            title: 'Explore an Arts topic',
            type: 'explore',
            completed: false,
            description: '',
            progress: 0,
          },
          {
            id: '4',
            title: 'Explore a History topic',
            type: 'explore',
            completed: false,
            description: '',
            progress: 0,
          },
          {
            id: '5',
            title: 'Explore a Language topic',
            type: 'explore',
            completed: false,
            description: '',
            progress: 0,
          },
          {
            id: '6',
            title: 'Explore a Math topic',
            type: 'explore',
            completed: false,
            description: '',
            progress: 0,
          },
          {
            id: '7',
            title: 'Explore a Philosophy topic',
            type: 'explore',
            completed: false,
            description: '',
            progress: 0,
          },
        ],
        expectedDuration: 168,
        rewards: ['Explorer Badge', '100 Curiosity Points'],
        difficulty: 'medium',
        category: 'Exploration',
        participants: 2847,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        progress: 28,
      },
      {
        id: 'question_master',
        title: 'Question Master',
        description: 'Ask 5 thoughtful questions',
        tasks: [
          {
            id: '1',
            title: 'Ask a question about Science',
            type: 'question',
            completed: true,
            description: '',
            progress: 100,
          },
          {
            id: '2',
            title: 'Ask a question about Technology',
            type: 'question',
            completed: true,
            description: '',
            progress: 100,
          },
          {
            id: '3',
            title: 'Ask a question about Arts',
            type: 'question',
            completed: false,
            description: '',
            progress: 0,
          },
          {
            id: '4',
            title: 'Ask a question about History',
            type: 'question',
            completed: false,
            description: '',
            progress: 0,
          },
          {
            id: '5',
            title: 'Ask a question about Philosophy',
            type: 'question',
            completed: false,
            description: '',
            progress: 0,
          },
        ],
        expectedDuration: 60,
        rewards: ['Inquisitive Mind Badge', '50 Curiosity Points'],
        difficulty: 'easy',
        category: 'Engagement',
        participants: 1234,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        progress: 40,
      },
    ],
    []
  );

  // Mock leaderboard data
  const mockLeaderboard = useMemo(
    () => [
      {
        id: '1',
        name: 'Alex Thompson',
        score: 2847,
        level: 42,
        avatar: '🔬',
        badge: 'Science Explorer',
      },
      {
        id: '2',
        name: 'Maya Chen',
        score: 2635,
        level: 38,
        avatar: '💡',
        badge: 'Innovation Pioneer',
      },
      {
        id: '3',
        name: 'David Kumar',
        score: 2401,
        level: 35,
        avatar: '🎨',
        badge: 'Creative Mind',
      },
      {
        id: '4',
        name: 'Sarah Johnson',
        score: 2198,
        level: 32,
        avatar: '📚',
        badge: 'Knowledge Seeker',
      },
      {
        id: '5',
        name: 'You',
        score: userStats.curiosityScore,
        level: userStats.curiosityLevel,
        avatar: '🎭',
        badge: 'Curious Explorer',
      },
    ],
    [userStats.curiosityScore, userStats.curiosityLevel]
  );

  useEffect(() => {
    setBadges(mockBadges);
    setChallenges(mockChallenges);
    setLeaderboard(mockLeaderboard);
  }, [mockBadges, mockChallenges, mockLeaderboard]);

  const handleBadgeClick = (badge: CuriosityBadge) => {
    setSelectedBadge(badge);
    setBadgeDialogOpen(true);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'info';
      case 'uncommon':
        return 'success';
      case 'rare':
        return 'warning';
      case 'legendary':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return <StarIcon />;
      case 'uncommon':
        return <DiamondIcon />;
      case 'rare':
        return <TrophyIcon />;
      case 'legendary':
        return <VerifiedIcon />;
      default:
        return <StarIcon />;
    }
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

  const completedTasks = (tasks: any[]) => tasks.filter(task => task.completed).length;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header with Stats */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Grid container spacing={3} alignItems='center'>
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant='h4' gutterBottom sx={{ fontWeight: 'bold' }}>
              🏆 Curiosity Rewards
            </Typography>
            <Typography variant='h6' sx={{ opacity: 0.9 }}>
              Level {userStats.curiosityLevel} • {userStats.curiosityScore} Points
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant='h3' sx={{ fontWeight: 'bold' }}>
                  {userStats.streakDays}
                </Typography>
                <Typography variant='caption'>Day Streak</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant='h3' sx={{ fontWeight: 'bold' }}>
                  {userStats.badges?.length || 0}
                </Typography>
                <Typography variant='caption'>Badges</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Navigation Tabs */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Button
              fullWidth
              variant={activeTab === 'badges' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('badges')}
              startIcon={<TrophyIcon />}
              sx={{ py: 1.5 }}
            >
              Badges & Achievements
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Button
              fullWidth
              variant={activeTab === 'challenges' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('challenges')}
              startIcon={<FireIcon />}
              sx={{ py: 1.5 }}
            >
              Challenges
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Button
              fullWidth
              variant={activeTab === 'leaderboard' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('leaderboard')}
              startIcon={<LeaderboardIcon />}
              sx={{ py: 1.5 }}
            >
              Leaderboard
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <Box>
          <Typography
            variant='h6'
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <TrophyIcon color='primary' />
            Your Badges & Achievements
          </Typography>

          <Grid container spacing={2}>
            {badges.map(badge => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={badge.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    opacity: badge.unlockedAt ? 1 : 0.6,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3,
                    },
                  }}
                  onClick={() => handleBadgeClick(badge)}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Box sx={{ position: 'relative', mb: 2 }}>
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          fontSize: '2rem',
                          mx: 'auto',
                          background: badge.unlockedAt
                            ? 'linear-gradient(135deg, #ffd700, #ffed4e)'
                            : 'grey.300',
                        }}
                      >
                        {badge.unlockedAt ? badge.icon : <LockedIcon />}
                      </Avatar>
                      <Chip
                        label={badge.rarity}
                        size='small'
                        color={getRarityColor(badge.rarity)}
                        icon={getRarityIcon(badge.rarity)}
                        sx={{ position: 'absolute', top: -5, right: -5 }}
                      />
                    </Box>

                    <Typography
                      variant='h6'
                      gutterBottom
                      sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                    >
                      {badge.name}
                    </Typography>
                    <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                      {badge.description}
                    </Typography>

                    {!badge.unlockedAt && (
                      <Box sx={{ mt: 2 }}>
                        <LinearProgress
                          variant='determinate'
                          value={badge.progress || 0}
                          sx={{ height: 6, borderRadius: 3, mb: 1 }}
                        />
                        <Typography variant='caption' color='text.secondary'>
                          {badge.progress || 0}% Complete
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Challenges Tab */}
      {activeTab === 'challenges' && (
        <Box>
          <Typography
            variant='h6'
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <FireIcon color='primary' />
            Active Challenges
          </Typography>

          {challenges.map(challenge => (
            <Card key={challenge.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='h6' gutterBottom>
                      {challenge.title}
                    </Typography>
                    <Typography variant='body2' color='text.secondary' gutterBottom>
                      {challenge.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip
                        label={challenge.difficulty}
                        size='small'
                        color={getDifficultyColor(challenge.difficulty)}
                      />
                      <Chip label={challenge.category} size='small' variant='outlined' />
                      <Chip
                        label={`${challenge.participants} participants`}
                        size='small'
                        variant='outlined'
                      />
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress
                      variant='determinate'
                      value={challenge.progress || 0}
                      size={60}
                      thickness={4}
                    />
                    <Typography variant='caption' sx={{ display: 'block', mt: 1 }}>
                      {challenge.progress || 0}%
                    </Typography>
                  </Box>
                </Box>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>
                      Tasks ({completedTasks(challenge.tasks)}/{challenge.tasks.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {challenge.tasks.map(task => (
                        <ListItem key={task.id}>
                          <ListItemAvatar>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {task.completed ? (
                                <CompletedIcon color='success' />
                              ) : (
                                <CircularProgress size={20} />
                              )}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={task.title}
                            secondary={task.completed ? 'Completed' : 'In Progress'}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>

                <Box sx={{ mt: 2 }}>
                  <Typography variant='body2' color='text.secondary' gutterBottom>
                    Rewards:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {challenge.rewards.map((reward, index) => (
                      <Chip
                        key={index}
                        label={reward}
                        size='small'
                        color='primary'
                        variant='outlined'
                      />
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <Box>
          <Typography
            variant='h6'
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <LeaderboardIcon color='primary' />
            Global Leaderboard
          </Typography>

          <List>
            {leaderboard.map((user, index) => (
              <Paper key={user.id} sx={{ mb: 1 }}>
                <ListItem>
                  <ListItemAvatar>
                    <Badge
                      badgeContent={index + 1}
                      color={index < 3 ? 'primary' : 'default'}
                      sx={{
                        '& .MuiBadge-badge': {
                          background:
                            index === 0
                              ? 'gold'
                              : index === 1
                                ? 'silver'
                                : index === 2
                                  ? '#cd7f32'
                                  : 'default',
                        },
                      }}
                    >
                      <Avatar sx={{ fontSize: '1.5rem' }}>{user.avatar}</Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant='h6'>{user.name}</Typography>
                        {user.name === 'You' && <Chip label='You' size='small' color='primary' />}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
                        <Typography variant='body2'>Level {user.level}</Typography>
                        <Chip label={user.badge} size='small' variant='outlined' />
                        <Typography variant='body2' color='primary' sx={{ fontWeight: 'bold' }}>
                          {user.score} pts
                        </Typography>
                      </Box>
                    }
                  />
                  <IconButton>
                    <ShareIcon />
                  </IconButton>
                </ListItem>
              </Paper>
            ))}
          </List>
        </Box>
      )}

      {/* Badge Details Dialog */}
      <Dialog
        open={badgeDialogOpen}
        onClose={() => setBadgeDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        {selectedBadge && (
          <>
            <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  fontSize: '3rem',
                  mx: 'auto',
                  mb: 2,
                  background: selectedBadge.unlockedAt
                    ? 'linear-gradient(135deg, #ffd700, #ffed4e)'
                    : 'grey.300',
                }}
              >
                {selectedBadge.unlockedAt ? selectedBadge.icon : <LockedIcon />}
              </Avatar>
              <Typography variant='h5' gutterBottom>
                {selectedBadge.name}
              </Typography>
              <Chip
                label={selectedBadge.rarity}
                color={getRarityColor(selectedBadge.rarity)}
                icon={getRarityIcon(selectedBadge.rarity)}
              />
            </DialogTitle>
            <DialogContent>
              <Typography variant='body1' gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                {selectedBadge.description}
              </Typography>

              <Typography variant='h6' gutterBottom>
                Requirements:
              </Typography>
              <List dense>
                {selectedBadge.requirements.map((req, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={req} />
                  </ListItem>
                ))}
              </List>

              {!selectedBadge.unlockedAt && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant='h6' gutterBottom>
                    Progress: {selectedBadge.progress || 0}%
                  </Typography>
                  <LinearProgress
                    variant='determinate'
                    value={selectedBadge.progress || 0}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              )}

              {selectedBadge.unlockedAt && (
                <Alert severity='success' sx={{ mt: 2 }}>
                  <Typography variant='body2'>
                    Unlocked on {new Date(selectedBadge.unlockedAt).toLocaleDateString()}
                  </Typography>
                </Alert>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setBadgeDialogOpen(false)}>Close</Button>
              {selectedBadge.unlockedAt && (
                <Button variant='contained' startIcon={<ShareIcon />}>
                  Share Achievement
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CuriosityRewards;
