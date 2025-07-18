import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  LinearProgress,
  Tab,
  Tabs,
  TextField,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as AchievementIcon,
  Book as BookIcon,
  Quiz as QuizIcon,
  Timeline as TimelineIcon,
  Star as StarIcon,
  Settings as SettingsIcon,
  PhotoCamera as PhotoCameraIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Language as LanguageIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { ROUTES } from '@/utils/constants';
import GeminiStatusIndicator from '@/components/common/GeminiStatusIndicator';
import SarasStatusIndicator from '@/components/common/SarasStatusIndicator';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  joinDate: string;
  educationLevel: string;
  school: string;
  subjects: string[];
  bio: string;
  location: string;
  phone: string;
  achievements: Achievement[];
  stats: UserStats;
  preferences: UserPreferences;
  recentActivity: Activity[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedDate: string;
  category: string;
}

interface UserStats {
  totalCourses: number;
  completedCourses: number;
  totalQuizzes: number;
  averageScore: number;
  studyStreak: number;
  studyHours: number;
  rank: number;
  points: number;
}

interface UserPreferences {
  notifications: boolean;
  emailUpdates: boolean;
  studyReminders: boolean;
  language: string;
  theme: string;
  timezone: string;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  icon: string;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});

  // Mock data - in real app, this would come from API
  const mockUserProfile: UserProfile = {
    id: '1',
    name: 'Arjun Sharma',
    email: 'arjun.sharma@example.com',
    role: 'student',
    avatar: '/api/placeholder/120/120',
    joinDate: '2024-01-15',
    educationLevel: 'Class 12',
    school: 'Delhi Public School',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'Computer Science'],
    bio: 'Passionate about mathematics and science. Preparing for JEE Advanced. Love exploring new technologies and AI.',
    location: 'New Delhi, India',
    phone: '+91 9876543210',
    achievements: [
      {
        id: '1',
        title: 'First Quiz Master',
        description: 'Scored 100% in first quiz',
        icon: 'star',
        earnedDate: '2024-01-20',
        category: 'academic',
      },
      {
        id: '2',
        title: 'Study Streak Champion',
        description: '30 days continuous study streak',
        icon: 'trending_up',
        earnedDate: '2024-02-15',
        category: 'consistency',
      },
      {
        id: '3',
        title: 'AI Enthusiast',
        description: 'Completed 5 AI-powered courses',
        icon: 'psychology',
        earnedDate: '2024-03-10',
        category: 'technology',
      },
    ],
    stats: {
      totalCourses: 12,
      completedCourses: 8,
      totalQuizzes: 45,
      averageScore: 87.5,
      studyStreak: 42,
      studyHours: 156,
      rank: 23,
      points: 2840,
    },
    preferences: {
      notifications: true,
      emailUpdates: true,
      studyReminders: true,
      language: 'English',
      theme: 'light',
      timezone: 'Asia/Kolkata',
    },
    recentActivity: [
      {
        id: '1',
        type: 'course_completion',
        title: 'Completed Advanced Mathematics',
        description: 'Finished all modules with 92% score',
        date: '2024-03-15',
        icon: 'book',
      },
      {
        id: '2',
        type: 'quiz_attempt',
        title: 'Physics Quiz - Motion',
        description: 'Scored 95% in kinematics quiz',
        date: '2024-03-14',
        icon: 'quiz',
      },
      {
        id: '3',
        type: 'achievement',
        title: 'New Achievement Unlocked',
        description: 'Earned "AI Enthusiast" badge',
        date: '2024-03-10',
        icon: 'emoji_events',
      },
    ],
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUserProfile(mockUserProfile);
        setEditedProfile(mockUserProfile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleEditProfile = () => {
    setEditDialogOpen(true);
  };

  const handleSaveProfile = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUserProfile(prev => ({ ...prev, ...editedProfile } as UserProfile));
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  const renderOverviewTab = () => (
    <Grid container spacing={3}>
      {/* Stats Cards */}
      <Grid size={{ xs: 12, md: 8 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary" fontWeight={600}>
                  {userProfile?.stats.totalCourses}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Courses
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" fontWeight={600}>
                  {userProfile?.stats.completedCourses}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main" fontWeight={600}>
                  {userProfile?.stats.averageScore}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Score
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="secondary.main" fontWeight={600}>
                  {userProfile?.stats.studyStreak}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Study Streak
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Rank and Points */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <AchievementIcon color="primary" />
              <Typography variant="h6" ml={1}>
                Ranking
              </Typography>
            </Box>
            <Typography variant="h3" color="primary" fontWeight={600}>
              #{userProfile?.stats.rank}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Global Rank
            </Typography>
            <Box display="flex" alignItems="center">
              <StarIcon color="warning" />
              <Typography variant="h6" ml={1}>
                {userProfile?.stats.points} Points
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Progress Chart */}
      <Grid size={{ xs: 12, md: 8 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Course Progress
            </Typography>
            {userProfile?.subjects.map((subject, index) => (
              <Box key={subject} mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">{subject}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Math.floor(Math.random() * 30 + 70)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.floor(Math.random() * 30 + 70)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Activity */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {userProfile?.recentActivity.map((activity, index) => (
                <ListItem key={activity.id} divider={index < userProfile.recentActivity.length - 1}>
                  <ListItemIcon>
                    {activity.icon === 'book' && <BookIcon color="primary" />}
                    {activity.icon === 'quiz' && <QuizIcon color="secondary" />}
                    {activity.icon === 'emoji_events' && <AchievementIcon color="warning" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.title}
                    secondary={activity.description}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderAchievementsTab = () => (
    <Grid container spacing={3}>
      {userProfile?.achievements.map((achievement) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={achievement.id}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Badge
                badgeContent={<StarIcon sx={{ fontSize: 16 }} />}
                color="primary"
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'warning.main',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <AchievementIcon sx={{ fontSize: 40 }} />
                </Avatar>
              </Badge>
              <Typography variant="h6" gutterBottom>
                {achievement.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {achievement.description}
              </Typography>
              <Chip
                label={achievement.category}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Typography variant="caption" display="block" mt={1}>
                Earned: {new Date(achievement.earnedDate).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderSettingsTab = () => (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Notification Settings
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText primary="Push Notifications" />
                <Button variant="outlined" size="small">
                  {userProfile?.preferences.notifications ? 'Enabled' : 'Disabled'}
                </Button>
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText primary="Email Updates" />
                <Button variant="outlined" size="small">
                  {userProfile?.preferences.emailUpdates ? 'Enabled' : 'Disabled'}
                </Button>
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ScheduleIcon />
                </ListItemIcon>
                <ListItemText primary="Study Reminders" />
                <Button variant="outlined" size="small">
                  {userProfile?.preferences.studyReminders ? 'Enabled' : 'Disabled'}
                </Button>
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              App Settings
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <LanguageIcon />
                </ListItemIcon>
                <ListItemText primary="Language" />
                <Button variant="outlined" size="small">
                  {userProfile?.preferences.language}
                </Button>
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CalendarIcon />
                </ListItemIcon>
                <ListItemText primary="Timezone" />
                <Button variant="outlined" size="small">
                  {userProfile?.preferences.timezone}
                </Button>
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText primary="Security" />
                <Button variant="outlined" size="small">
                  Manage
                </Button>
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Loading profile...</Typography>
        </Box>
      </Container>
    );
  }

  if (!userProfile) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Failed to load user profile</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Profile Header */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, sm: 'auto' }}>
              <Box position="relative">
                <Avatar
                  src={userProfile.avatar}
                  sx={{ width: 120, height: 120 }}
                >
                  {userProfile.name.charAt(0)}
                </Avatar>
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                  }}
                  size="small"
                >
                  <PhotoCameraIcon />
                </IconButton>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: true }}>
              <Typography variant="h4" gutterBottom>
                {userProfile.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {userProfile.bio}
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                {userProfile.subjects.map((subject) => (
                  <Chip key={subject} label={subject} size="small" />
                ))}
              </Box>
              <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <SchoolIcon fontSize="small" />
                  <Typography variant="body2">{userProfile.school}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <LocationIcon fontSize="small" />
                  <Typography variant="body2">{userProfile.location}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <CalendarIcon fontSize="small" />
                  <Typography variant="body2">
                    Joined {new Date(userProfile.joinDate).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 'auto' }}>
              <Box display="flex" flexDirection="column" gap={1}>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleEditProfile}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={() => navigate(ROUTES.SETTINGS)}
                >
                  Settings
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* AI Status Indicators */}
      <Box display="flex" gap={2} mb={4}>
        <GeminiStatusIndicator variant="chip" showLabel={true} />
        <SarasStatusIndicator variant="chip" />
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overview" />
          <Tab label="Achievements" />
          <Tab label="Settings" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {activeTab === 0 && renderOverviewTab()}
        {activeTab === 1 && renderAchievementsTab()}
        {activeTab === 2 && renderSettingsTab()}
      </Box>

      {/* Edit Profile Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Name"
                value={editedProfile.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email"
                value={editedProfile.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="School"
                value={editedProfile.school || ''}
                onChange={(e) => handleInputChange('school', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Location"
                value={editedProfile.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Bio"
                multiline
                rows={3}
                value={editedProfile.bio || ''}
                onChange={(e) => handleInputChange('bio', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveProfile}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfilePage;