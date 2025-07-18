import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondary,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Badge,
  LinearProgress,
  Stack,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  PhotoCamera as PhotoIcon,
  School as SchoolIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Cake as BirthdayIcon,
  Badge as BadgeIcon,
  Star as StarIcon,
  EmojiEvents as AchievementIcon,
  LocalFireDepartment as StreakIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  Security as SecurityIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  VerifiedUser as VerifiedIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  avatar: string;
  bio: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  academic: {
    board: string;
    grade: string;
    school: string;
    targetExams: string[];
    subjects: string[];
  };
  preferences: {
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
    studyTime: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    notifications: boolean;
    darkMode: boolean;
    language: string;
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    showProgress: boolean;
    showAchievements: boolean;
    allowMessages: boolean;
  };
  statistics: {
    totalStudyHours: number;
    coursesCompleted: number;
    currentStreak: number;
    averageScore: number;
    rank: number;
    achievements: Achievement[];
  };
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Props {
  profile: UserProfile;
  isEditing: boolean;
  onUpdateProfile: (profile: UserProfile) => void;
  onToggleEdit: () => void;
  onUploadAvatar: (file: File) => void;
  onDeleteAccount: () => void;
}

const ProfileManagement: React.FC<Props> = ({
  profile,
  isEditing,
  onUpdateProfile,
  onToggleEdit,
  onUploadAvatar,
  onDeleteAccount,
}) => {
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const boards = ['CBSE', 'ICSE', 'State Board', 'IB', 'Cambridge'];
  const grades = ['6th', '7th', '8th', '9th', '10th', '11th', '12th', 'Undergraduate', 'Postgraduate'];
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'Hindi'];
  const targetExams = ['JEE Main', 'JEE Advanced', 'NEET', 'BITSAT', 'CAT', 'GATE', 'UPSC'];
  const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati'];

  const handleSave = () => {
    onUpdateProfile(editedProfile);
    onToggleEdit();
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    onToggleEdit();
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUploadAvatar(file);
      setAvatarDialogOpen(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#95a5a6';
      case 'rare': return '#3498db';
      case 'epic': return '#9b59b6';
      case 'legendary': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const getGradeProgress = () => {
    const gradeIndex = grades.indexOf(editedProfile.academic.grade);
    return ((gradeIndex + 1) / grades.length) * 100;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <PersonIcon sx={{ mr: 1 }} />
          Profile Management
        </Typography>
        
        <Box>
          {isEditing ? (
            <Stack direction="row" spacing={1}>
              <Button 
                variant="outlined" 
                startIcon={<CancelIcon />}
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                startIcon={<SaveIcon />}
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </Stack>
          ) : (
            <Button 
              variant="contained" 
              startIcon={<EditIcon />}
              onClick={onToggleEdit}
            >
              Edit Profile
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              {/* Avatar */}
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                <Avatar
                  src={editedProfile.avatar}
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    mx: 'auto',
                    border: '4px solid',
                    borderColor: 'primary.main'
                  }}
                >
                  {editedProfile.firstName.charAt(0)}{editedProfile.lastName.charAt(0)}
                </Avatar>
                {isEditing && (
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': { backgroundColor: 'primary.dark' },
                    }}
                    onClick={() => setAvatarDialogOpen(true)}
                  >
                    <PhotoIcon />
                  </IconButton>
                )}
              </Box>

              {/* Name */}
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                {editedProfile.firstName} {editedProfile.lastName}
              </Typography>
              
              {/* Bio */}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {editedProfile.bio || 'No bio available'}
              </Typography>

              {/* Quick Stats */}
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 1.5, textAlign: 'center' }}>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                      {editedProfile.statistics.currentStreak}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Day Streak
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 1.5, textAlign: 'center' }}>
                    <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold' }}>
                      {editedProfile.statistics.averageScore}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Avg Score
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 1.5, textAlign: 'center' }}>
                    <Typography variant="h6" color="warning.main" sx={{ fontWeight: 'bold' }}>
                      #{editedProfile.statistics.rank}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Rank
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 1.5, textAlign: 'center' }}>
                    <Typography variant="h6" color="info.main" sx={{ fontWeight: 'bold' }}>
                      {editedProfile.statistics.coursesCompleted}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Completed
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Academic Progress */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Academic Progress
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>
                    {editedProfile.academic.grade} - {editedProfile.academic.board}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {Math.round(getGradeProgress())}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={getGradeProgress()}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AchievementIcon sx={{ mr: 1 }} />
                Recent Achievements
              </Typography>
              
              <Stack spacing={1}>
                {editedProfile.statistics.achievements.slice(0, 3).map((achievement) => (
                  <Paper 
                    key={achievement.id} 
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      alignItems: 'center',
                      border: `2px solid ${getRarityColor(achievement.rarity)}`,
                    }}
                  >
                    <Typography sx={{ fontSize: '1.5rem', mr: 2 }}>
                      {achievement.icon}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {achievement.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {achievement.description}
                      </Typography>
                    </Box>
                    <Chip
                      label={achievement.rarity}
                      size="small"
                      sx={{ 
                        backgroundColor: getRarityColor(achievement.rarity),
                        color: 'white',
                        textTransform: 'capitalize'
                      }}
                    />
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          {/* Personal Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1 }} />
                Personal Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={editedProfile.firstName}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      firstName: e.target.value
                    })}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={editedProfile.lastName}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      lastName: e.target.value
                    })}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      email: e.target.value
                    })}
                    disabled={!isEditing}
                    InputProps={{
                      endAdornment: <VerifiedIcon color="success" />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={editedProfile.phone}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      phone: e.target.value
                    })}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date of Birth"
                    InputLabelProps={{ shrink: true }}
                    value={editedProfile.dateOfBirth}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      dateOfBirth: e.target.value
                    })}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!isEditing}>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={editedProfile.gender}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        gender: e.target.value as any
                      })}
                    >
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Bio"
                    value={editedProfile.bio}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      bio: e.target.value
                    })}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <SchoolIcon sx={{ mr: 1 }} />
                Academic Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!isEditing}>
                    <InputLabel>Board</InputLabel>
                    <Select
                      value={editedProfile.academic.board}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        academic: {
                          ...editedProfile.academic,
                          board: e.target.value
                        }
                      })}
                    >
                      {boards.map((board) => (
                        <MenuItem key={board} value={board}>{board}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!isEditing}>
                    <InputLabel>Grade/Class</InputLabel>
                    <Select
                      value={editedProfile.academic.grade}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        academic: {
                          ...editedProfile.academic,
                          grade: e.target.value
                        }
                      })}
                    >
                      {grades.map((grade) => (
                        <MenuItem key={grade} value={grade}>{grade}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="School/Institution"
                    value={editedProfile.academic.school}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      academic: {
                        ...editedProfile.academic,
                        school: e.target.value
                      }
                    })}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    value={editedProfile.location.city}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      location: {
                        ...editedProfile.location,
                        city: e.target.value
                      }
                    })}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="State"
                    value={editedProfile.location.state}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      location: {
                        ...editedProfile.location,
                        state: e.target.value
                      }
                    })}
                    disabled={!isEditing}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Subjects of Interest
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {subjects.map((subject) => (
                    <Chip
                      key={subject}
                      label={subject}
                      color={editedProfile.academic.subjects.includes(subject) ? 'primary' : 'default'}
                      onClick={() => {
                        if (isEditing) {
                          const newSubjects = editedProfile.academic.subjects.includes(subject)
                            ? editedProfile.academic.subjects.filter(s => s !== subject)
                            : [...editedProfile.academic.subjects, subject];
                          setEditedProfile({
                            ...editedProfile,
                            academic: {
                              ...editedProfile.academic,
                              subjects: newSubjects
                            }
                          });
                        }
                      }}
                      clickable={isEditing}
                    />
                  ))}
                </Box>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Target Exams
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {targetExams.map((exam) => (
                    <Chip
                      key={exam}
                      label={exam}
                      color={editedProfile.academic.targetExams.includes(exam) ? 'secondary' : 'default'}
                      onClick={() => {
                        if (isEditing) {
                          const newExams = editedProfile.academic.targetExams.includes(exam)
                            ? editedProfile.academic.targetExams.filter(e => e !== exam)
                            : [...editedProfile.academic.targetExams, exam];
                          setEditedProfile({
                            ...editedProfile,
                            academic: {
                              ...editedProfile.academic,
                              targetExams: newExams
                            }
                          });
                        }
                      }}
                      clickable={isEditing}
                    />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <SettingsIcon sx={{ mr: 1 }} />
                Preferences & Privacy
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!isEditing}>
                    <InputLabel>Learning Style</InputLabel>
                    <Select
                      value={editedProfile.preferences.learningStyle}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        preferences: {
                          ...editedProfile.preferences,
                          learningStyle: e.target.value as any
                        }
                      })}
                    >
                      <MenuItem value="visual">Visual</MenuItem>
                      <MenuItem value="auditory">Auditory</MenuItem>
                      <MenuItem value="kinesthetic">Kinesthetic</MenuItem>
                      <MenuItem value="reading">Reading/Writing</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!isEditing}>
                    <InputLabel>Preferred Language</InputLabel>
                    <Select
                      value={editedProfile.preferences.language}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        preferences: {
                          ...editedProfile.preferences,
                          language: e.target.value
                        }
                      })}
                    >
                      {languages.map((language) => (
                        <MenuItem key={language} value={language}>{language}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!isEditing}>
                    <InputLabel>Profile Visibility</InputLabel>
                    <Select
                      value={editedProfile.privacy.profileVisibility}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        privacy: {
                          ...editedProfile.privacy,
                          profileVisibility: e.target.value as any
                        }
                      })}
                    >
                      <MenuItem value="public">Public</MenuItem>
                      <MenuItem value="friends">Friends Only</MenuItem>
                      <MenuItem value="private">Private</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Preferred Study Time"
                    value={editedProfile.preferences.studyTime}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      preferences: {
                        ...editedProfile.preferences,
                        studyTime: e.target.value
                      }
                    })}
                    disabled={!isEditing}
                    placeholder="e.g., 9:00 AM - 11:00 AM"
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Privacy Settings
                </Typography>
                <Stack spacing={1}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editedProfile.privacy.showProgress}
                        onChange={(e) => setEditedProfile({
                          ...editedProfile,
                          privacy: {
                            ...editedProfile.privacy,
                            showProgress: e.target.checked
                          }
                        })}
                        disabled={!isEditing}
                      />
                    }
                    label="Show my progress to others"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editedProfile.privacy.showAchievements}
                        onChange={(e) => setEditedProfile({
                          ...editedProfile,
                          privacy: {
                            ...editedProfile.privacy,
                            showAchievements: e.target.checked
                          }
                        })}
                        disabled={!isEditing}
                      />
                    }
                    label="Show my achievements"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editedProfile.privacy.allowMessages}
                        onChange={(e) => setEditedProfile({
                          ...editedProfile,
                          privacy: {
                            ...editedProfile.privacy,
                            allowMessages: e.target.checked
                          }
                        })}
                        disabled={!isEditing}
                      />
                    }
                    label="Allow messages from other users"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editedProfile.preferences.notifications}
                        onChange={(e) => setEditedProfile({
                          ...editedProfile,
                          preferences: {
                            ...editedProfile.preferences,
                            notifications: e.target.checked
                          }
                        })}
                        disabled={!isEditing}
                      />
                    }
                    label="Enable notifications"
                  />
                </Stack>
              </Box>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          {isEditing && (
            <Card sx={{ border: '1px solid', borderColor: 'error.main' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
                  <WarningIcon sx={{ mr: 1 }} />
                  Danger Zone
                </Typography>
                
                <Alert severity="error" sx={{ mb: 2 }}>
                  Once you delete your account, there is no going back. Please be certain.
                </Alert>
                
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Avatar Upload Dialog */}
      <Dialog open={avatarDialogOpen} onClose={() => setAvatarDialogOpen(false)}>
        <DialogTitle>Change Profile Picture</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="avatar-upload"
              type="file"
              onChange={handleAvatarUpload}
            />
            <label htmlFor="avatar-upload">
              <Button variant="contained" component="span" startIcon={<PhotoIcon />}>
                Choose Image
              </Button>
            </label>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ color: 'error.main' }}>Delete Account</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action cannot be undone. All your data will be permanently deleted.
          </Alert>
          <TextField
            fullWidth
            label="Type 'DELETE' to confirm"
            placeholder="DELETE"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={onDeleteAccount}>
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileManagement;