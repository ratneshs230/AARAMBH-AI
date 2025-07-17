import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Avatar,
  Chip,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tabs,
  Tab,
  Paper,
  Tooltip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  Whatshot as StreakIcon,
  Speed as XPIcon,
  School as LearningIcon,
  Group as TeamIcon,
  Timeline as ProgressIcon,
  WorkspacePremium as AchievementIcon,
  Equalizer as LeaderboardIcon,
  CardGiftcard as RewardIcon,
  Timer as TimeIcon,
  Psychology as ChallengeIcon,
  Share as ShareIcon,
  Close as CloseIcon,
  KeyboardArrowUp as UpIcon,
  KeyboardArrowDown as DownIcon,
  Stars as RankIcon,
} from '@mui/icons-material';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'learning' | 'social' | 'streak' | 'challenge' | 'milestone';
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  hint?: string;
}

interface User {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXP: number;
  rank: number;
  previousRank: number;
  badges: string[];
  streak: number;
  achievements: Achievement[];
  weeklyXP: number;
  monthlyXP: number;
  title: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  category: string;
  xpReward: number;
  timeLimit: string;
  participants: number;
  isCompleted: boolean;
  progress: number;
  maxProgress: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  endTime: string;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  type: 'cosmetic' | 'feature' | 'badge' | 'bonus';
  cost: number;
  category: string;
  isOwned: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const GamificationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [achievementDialog, setAchievementDialog] = useState<Achievement | null>(null);
  const [user, setUser] = useState<User>({
    id: '1',
    name: 'Alex Johnson',
    avatar: 'AJ',
    level: 25,
    xp: 3250,
    xpToNextLevel: 750,
    totalXP: 15750,
    rank: 3,
    previousRank: 5,
    badges: ['streak-master', 'challenge-champion', 'knowledge-seeker'],
    streak: 15,
    weeklyXP: 1250,
    monthlyXP: 4800,
    title: 'Knowledge Seeker',
    achievements: [],
  });

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'First Steps',
      description: 'Complete your first lesson',
      category: 'learning',
      icon: '🎯',
      rarity: 'common',
      xpReward: 100,
      isUnlocked: true,
      unlockedAt: '2025-01-10T10:00:00Z',
      progress: 1,
      maxProgress: 1,
    },
    {
      id: '2',
      title: 'Streak Master',
      description: 'Maintain a 7-day learning streak',
      category: 'streak',
      icon: '🔥',
      rarity: 'rare',
      xpReward: 500,
      isUnlocked: true,
      unlockedAt: '2025-01-12T15:30:00Z',
      progress: 15,
      maxProgress: 7,
    },
    {
      id: '3',
      title: 'Knowledge Collector',
      description: 'Complete 100 lessons',
      category: 'learning',
      icon: '📚',
      rarity: 'epic',
      xpReward: 1000,
      isUnlocked: false,
      progress: 67,
      maxProgress: 100,
      hint: "Keep learning! You're 67% there",
    },
    {
      id: '4',
      title: 'Team Player',
      description: 'Participate in 10 study groups',
      category: 'social',
      icon: '👥',
      rarity: 'rare',
      xpReward: 750,
      isUnlocked: false,
      progress: 6,
      maxProgress: 10,
      hint: 'Join more study groups to unlock this achievement',
    },
    {
      id: '5',
      title: 'Perfect Score',
      description: 'Score 100% on 5 assessments',
      category: 'challenge',
      icon: '⭐',
      rarity: 'legendary',
      xpReward: 2000,
      isUnlocked: false,
      progress: 2,
      maxProgress: 5,
      hint: 'Aim for perfection in your assessments',
    },
  ]);

  const [leaderboard, setLeaderboard] = useState<User[]>([
    {
      id: '2',
      name: 'Sarah Chen',
      avatar: 'SC',
      level: 28,
      xp: 4200,
      xpToNextLevel: 800,
      totalXP: 18400,
      rank: 1,
      previousRank: 1,
      badges: ['legend', 'perfectionist'],
      streak: 22,
      weeklyXP: 1580,
      monthlyXP: 6200,
      title: 'Learning Legend',
      achievements: [],
    },
    {
      id: '3',
      name: 'Mike Rodriguez',
      avatar: 'MR',
      level: 26,
      xp: 3800,
      xpToNextLevel: 200,
      totalXP: 16800,
      rank: 2,
      previousRank: 3,
      badges: ['challenger', 'mentor'],
      streak: 18,
      weeklyXP: 1420,
      monthlyXP: 5600,
      title: 'Challenge Master',
      achievements: [],
    },
    user,
    {
      id: '4',
      name: 'Emma Wilson',
      avatar: 'EW',
      level: 24,
      xp: 2950,
      xpToNextLevel: 1050,
      totalXP: 14950,
      rank: 4,
      previousRank: 4,
      badges: ['collaborator'],
      streak: 12,
      weeklyXP: 980,
      monthlyXP: 3800,
      title: 'Study Buddy',
      achievements: [],
    },
    {
      id: '5',
      name: 'David Kim',
      avatar: 'DK',
      level: 23,
      xp: 2700,
      xpToNextLevel: 300,
      totalXP: 13700,
      rank: 5,
      previousRank: 2,
      badges: ['explorer'],
      streak: 8,
      weeklyXP: 750,
      monthlyXP: 3200,
      title: 'Knowledge Explorer',
      achievements: [],
    },
  ]);

  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: '1',
      title: 'Daily Dose',
      description: 'Complete 3 lessons today',
      type: 'daily',
      category: 'Learning',
      xpReward: 200,
      timeLimit: '24 hours',
      participants: 1247,
      isCompleted: true,
      progress: 3,
      maxProgress: 3,
      difficulty: 'easy',
      endTime: '2025-01-16T00:00:00Z',
    },
    {
      id: '2',
      title: 'Speed Learner',
      description: 'Complete 15 lessons this week',
      type: 'weekly',
      category: 'Learning',
      xpReward: 800,
      timeLimit: '7 days',
      participants: 856,
      isCompleted: false,
      progress: 8,
      maxProgress: 15,
      difficulty: 'medium',
      endTime: '2025-01-20T00:00:00Z',
    },
    {
      id: '3',
      title: 'Math Marathon',
      description: 'Solve 50 math problems',
      type: 'special',
      category: 'Mathematics',
      xpReward: 1500,
      timeLimit: '3 days',
      participants: 432,
      isCompleted: false,
      progress: 23,
      maxProgress: 50,
      difficulty: 'hard',
      endTime: '2025-01-18T23:59:59Z',
    },
  ]);

  const [rewards, setRewards] = useState<Reward[]>([
    {
      id: '1',
      title: 'Golden Avatar Frame',
      description: 'Show off your achievements with a premium frame',
      type: 'cosmetic',
      cost: 500,
      category: 'Appearance',
      isOwned: false,
      rarity: 'epic',
    },
    {
      id: '2',
      title: 'Study Buddy Boost',
      description: '+50% XP for group study sessions',
      type: 'feature',
      cost: 1000,
      category: 'Boosts',
      isOwned: true,
      rarity: 'rare',
    },
    {
      id: '3',
      title: 'Legendary Learner Badge',
      description: 'Exclusive badge for top performers',
      type: 'badge',
      cost: 2000,
      category: 'Badges',
      isOwned: false,
      rarity: 'legendary',
    },
  ]);

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: '#757575',
      rare: '#2196f3',
      epic: '#9c27b0',
      legendary: '#ff9800',
    };
    return colors[rarity as keyof typeof colors] || '#757575';
  };

  const getDifficultyColor = (
    difficulty: string
  ): 'success' | 'warning' | 'error' | 'secondary' | 'default' => {
    const colors = {
      easy: 'success' as const,
      medium: 'warning' as const,
      hard: 'error' as const,
      extreme: 'secondary' as const,
    };
    return colors[difficulty as keyof typeof colors] || 'default';
  };

  const getRankChange = (current: number, previous: number) => {
    if (current < previous)
      return { icon: <UpIcon />, color: 'success', text: `+${previous - current}` };
    if (current > previous)
      return { icon: <DownIcon />, color: 'error', text: `-${current - previous}` };
    return { icon: null, color: 'default', text: '-' };
  };

  const formatTimeRemaining = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }

    return `${hours}h ${minutes}m`;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant='h4' component='h1' sx={{ fontWeight: 'bold' }}>
          Learning Achievements
        </Typography>
        <FormControl size='small' sx={{ minWidth: 120 }}>
          <InputLabel>Period</InputLabel>
          <Select
            value={selectedPeriod}
            label='Period'
            onChange={e => setSelectedPeriod(e.target.value)}
          >
            <MenuItem value='week'>This Week</MenuItem>
            <MenuItem value='month'>This Month</MenuItem>
            <MenuItem value='all'>All Time</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* User Profile Card */}
      <Card
        sx={{
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <CardContent>
          <Grid container spacing={3} alignItems='center'>
            <Grid size={{ xs: 12 }}>
              <Badge
                badgeContent={user.level}
                color='warning'
                overlap='circular'
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              >
                <Avatar
                  sx={{ width: 80, height: 80, fontSize: '2rem', bgcolor: 'rgba(255,255,255,0.2)' }}
                >
                  {user.avatar}
                </Avatar>
              </Badge>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant='h5' sx={{ fontWeight: 'bold', mb: 1 }}>
                {user.name}
              </Typography>
              <Typography variant='subtitle1' sx={{ opacity: 0.9, mb: 2 }}>
                {user.title}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Chip
                  icon={<RankIcon />}
                  label={`Rank #${user.rank}`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip
                  icon={<StreakIcon />}
                  label={`${user.streak} day streak`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip
                  icon={<XPIcon />}
                  label={`${user.totalXP} Total XP`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Box>

              <Box sx={{ mb: 1 }}>
                <Typography variant='body2' sx={{ opacity: 0.9 }}>
                  Level {user.level} Progress
                </Typography>
                <LinearProgress
                  variant='determinate'
                  value={(user.xp / (user.xp + user.xpToNextLevel)) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': { bgcolor: 'white' },
                  }}
                />
                <Typography variant='caption' sx={{ opacity: 0.8 }}>
                  {user.xp} / {user.xp + user.xpToNextLevel} XP ({user.xpToNextLevel} to next level)
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab icon={<AchievementIcon />} label='Achievements' />
        <Tab icon={<LeaderboardIcon />} label='Leaderboard' />
        <Tab icon={<ChallengeIcon />} label='Challenges' />
        <Tab icon={<RewardIcon />} label='Rewards' />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Achievement Categories */}
          {['learning', 'social', 'streak', 'challenge', 'milestone'].map(category => {
            const categoryAchievements = achievements.filter(a => a.category === category);
            const unlockedCount = categoryAchievements.filter(a => a.isUnlocked).length;

            return (
              <Grid size={{ xs: 12 }} key={category}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant='h6'
                      sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}
                    >
                      {category} Achievements
                    </Typography>
                    <Chip
                      label={`${unlockedCount}/${categoryAchievements.length}`}
                      color={unlockedCount === categoryAchievements.length ? 'success' : 'default'}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    {categoryAchievements.map(achievement => (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={achievement.id}>
                        <Card
                          sx={{
                            cursor: 'pointer',
                            opacity: achievement.isUnlocked ? 1 : 0.7,
                            border: achievement.isUnlocked
                              ? `2px solid ${getRarityColor(achievement.rarity)}`
                              : '1px solid #e0e0e0',
                            '&:hover': { transform: 'scale(1.02)' },
                            transition: 'all 0.2s',
                          }}
                          onClick={() => setAchievementDialog(achievement)}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Typography variant='h4' sx={{ mr: 2 }}>
                                {achievement.icon}
                              </Typography>
                              <Box>
                                <Typography variant='subtitle1' sx={{ fontWeight: 'bold' }}>
                                  {achievement.title}
                                </Typography>
                                <Chip
                                  label={achievement.rarity}
                                  size='small'
                                  sx={{
                                    bgcolor: getRarityColor(achievement.rarity),
                                    color: 'white',
                                    textTransform: 'capitalize',
                                  }}
                                />
                              </Box>
                            </Box>

                            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                              {achievement.description}
                            </Typography>

                            {!achievement.isUnlocked && (
                              <Box sx={{ mb: 2 }}>
                                <LinearProgress
                                  variant='determinate'
                                  value={(achievement.progress / achievement.maxProgress) * 100}
                                  sx={{ height: 6, borderRadius: 3 }}
                                />
                                <Typography variant='caption' color='text.secondary'>
                                  Progress: {achievement.progress}/{achievement.maxProgress}
                                </Typography>
                              </Box>
                            )}

                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <Chip
                                icon={<XPIcon />}
                                label={`${achievement.xpReward} XP`}
                                color='primary'
                                size='small'
                              />
                              {achievement.isUnlocked && (
                                <Chip
                                  icon={<StarIcon />}
                                  label='Unlocked'
                                  color='success'
                                  size='small'
                                />
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Level</TableCell>
                    <TableCell>XP</TableCell>
                    <TableCell>Streak</TableCell>
                    <TableCell>Change</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaderboard.map((user, index) => {
                    const rankChange = getRankChange(user.rank, user.previousRank);
                    return (
                      <TableRow
                        key={user.id}
                        sx={{ bgcolor: user.id === '1' ? 'action.selected' : 'inherit' }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {user.rank <= 3 && (
                              <TrophyIcon
                                sx={{
                                  color:
                                    user.rank === 1
                                      ? '#FFD700'
                                      : user.rank === 2
                                        ? '#C0C0C0'
                                        : '#CD7F32',
                                }}
                              />
                            )}
                            <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                              #{user.rank}
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar>{user.avatar}</Avatar>
                            <Box>
                              <Typography variant='subtitle1' sx={{ fontWeight: 'bold' }}>
                                {user.name}
                              </Typography>
                              <Typography variant='caption' color='text.secondary'>
                                {user.title}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Chip label={user.level} color='primary' />
                        </TableCell>

                        <TableCell>
                          <Typography variant='body1' sx={{ fontWeight: 'bold' }}>
                            {selectedPeriod === 'week'
                              ? user.weeklyXP
                              : selectedPeriod === 'month'
                                ? user.monthlyXP
                                : user.totalXP}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            icon={<StreakIcon />}
                            label={user.streak}
                            color={user.streak >= 7 ? 'warning' : 'default'}
                            size='small'
                          />
                        </TableCell>

                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {rankChange.icon}
                            <Typography variant='body2' color={`${rankChange.color}.main`}>
                              {rankChange.text}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          {challenges.map(challenge => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={challenge.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                      {challenge.title}
                    </Typography>
                    <Chip
                      label={challenge.type}
                      color={challenge.type === 'special' ? 'secondary' : 'primary'}
                      size='small'
                    />
                  </Box>

                  <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                    {challenge.description}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <LinearProgress
                      variant='determinate'
                      value={(challenge.progress / challenge.maxProgress) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant='caption' sx={{ mt: 1, display: 'block' }}>
                      Progress: {challenge.progress}/{challenge.maxProgress}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      icon={<XPIcon />}
                      label={`${challenge.xpReward} XP`}
                      color='primary'
                      size='small'
                    />
                    <Chip
                      label={challenge.difficulty}
                      color={getDifficultyColor(challenge.difficulty)}
                      size='small'
                    />
                    <Chip
                      icon={<TeamIcon />}
                      label={`${challenge.participants} joined`}
                      size='small'
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Time remaining
                      </Typography>
                      <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
                        {formatTimeRemaining(challenge.endTime)}
                      </Typography>
                    </Box>

                    {challenge.isCompleted ? (
                      <Chip icon={<StarIcon />} label='Completed' color='success' />
                    ) : (
                      <Button variant='contained' size='small'>
                        Join Challenge
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Typography variant='h6' gutterBottom>
              Your Points: {user.totalXP} XP
            </Typography>
          </Grid>

          {rewards.map(reward => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={reward.id}>
              <Card sx={{ height: '100%', opacity: reward.isOwned ? 0.7 : 1 }}>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                      {reward.title}
                    </Typography>
                    <Chip
                      label={reward.rarity}
                      size='small'
                      sx={{
                        bgcolor: getRarityColor(reward.rarity),
                        color: 'white',
                        textTransform: 'capitalize',
                      }}
                    />
                  </Box>

                  <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                    {reward.description}
                  </Typography>

                  <Chip label={reward.category} color='primary' size='small' sx={{ mb: 2 }} />

                  <Box sx={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                    <Chip icon={<XPIcon />} label={`${reward.cost} XP`} color='secondary' />

                    {reward.isOwned ? (
                      <Chip icon={<StarIcon />} label='Owned' color='success' />
                    ) : (
                      <Button
                        variant='contained'
                        size='small'
                        disabled={user.totalXP < reward.cost}
                      >
                        {user.totalXP >= reward.cost ? 'Purchase' : 'Not enough XP'}
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Achievement Detail Dialog */}
      <Dialog
        open={Boolean(achievementDialog)}
        onClose={() => setAchievementDialog(null)}
        maxWidth='sm'
        fullWidth
      >
        {achievementDialog && (
          <>
            <DialogTitle
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant='h4'>{achievementDialog.icon}</Typography>
                <Box>
                  <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                    {achievementDialog.title}
                  </Typography>
                  <Chip
                    label={achievementDialog.rarity}
                    size='small'
                    sx={{
                      bgcolor: getRarityColor(achievementDialog.rarity),
                      color: 'white',
                      textTransform: 'capitalize',
                    }}
                  />
                </Box>
              </Box>
              <IconButton onClick={() => setAchievementDialog(null)}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent>
              <Typography variant='body1' sx={{ mb: 3 }}>
                {achievementDialog.description}
              </Typography>

              {!achievementDialog.isUnlocked && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant='subtitle2' gutterBottom>
                    Progress
                  </Typography>
                  <LinearProgress
                    variant='determinate'
                    value={(achievementDialog.progress / achievementDialog.maxProgress) * 100}
                    sx={{ height: 10, borderRadius: 5, mb: 1 }}
                  />
                  <Typography variant='body2' color='text.secondary'>
                    {achievementDialog.progress} / {achievementDialog.maxProgress}
                  </Typography>

                  {achievementDialog.hint && (
                    <Typography variant='body2' sx={{ mt: 2, fontStyle: 'italic' }}>
                      Hint: {achievementDialog.hint}
                    </Typography>
                  )}
                </Box>
              )}

              {achievementDialog.isUnlocked && achievementDialog.unlockedAt && (
                <Typography variant='body2' color='success.main' sx={{ mb: 2 }}>
                  Unlocked on {new Date(achievementDialog.unlockedAt).toLocaleDateString()}
                </Typography>
              )}

              <Chip
                icon={<XPIcon />}
                label={`Reward: ${achievementDialog.xpReward} XP`}
                color='primary'
              />

              {achievementDialog.isUnlocked && (
                <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                  <Button variant='outlined' startIcon={<ShareIcon />}>
                    Share Achievement
                  </Button>
                </Box>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default GamificationPage;
