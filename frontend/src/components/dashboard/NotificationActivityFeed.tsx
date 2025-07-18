import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Badge,
  Tabs,
  Tab,
  Button,
  Divider,
  Paper,
  Stack,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Activity as ActivityIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  EmojiEvents as AchievementIcon,
  Group as GroupIcon,
  Psychology as AIIcon,
  Schedule as ScheduleIcon,
  Clear as ClearIcon,
  Settings as SettingsIcon,
  MoreVert as MoreVertIcon,
  Check as CheckIcon,
  AccessTime as TimeIcon,
  Star as StarIcon,
  TrendingUp as TrendingIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  LocalFireDepartment as StreakIcon,
} from '@mui/icons-material';

interface Notification {
  id: string;
  type: 'achievement' | 'reminder' | 'update' | 'social' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  metadata?: {
    courseId?: string;
    score?: number;
    streak?: number;
    user?: string;
  };
}

interface Activity {
  id: string;
  type: 'lesson_completed' | 'quiz_taken' | 'achievement_earned' | 'ai_session' | 'course_enrolled' | 'study_session' | 'milestone_reached';
  title: string;
  description: string;
  timestamp: string;
  duration?: number;
  score?: number;
  courseId?: string;
  icon: React.ReactNode;
  color: string;
}

interface NotificationSettings {
  achievements: boolean;
  reminders: boolean;
  courseUpdates: boolean;
  socialActivity: boolean;
  systemAlerts: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  studyReminders: boolean;
  weeklyReports: boolean;
}

interface Props {
  notifications: Notification[];
  activities: Activity[];
  notificationSettings: NotificationSettings;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (notificationId: string) => void;
  onUpdateSettings: (settings: NotificationSettings) => void;
  onNotificationAction: (notification: Notification) => void;
}

const NotificationActivityFeed: React.FC<Props> = ({
  notifications,
  activities,
  notificationSettings,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onUpdateSettings,
  onNotificationAction,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <AchievementIcon />;
      case 'reminder':
        return <ScheduleIcon />;
      case 'update':
        return <InfoIcon />;
      case 'social':
        return <GroupIcon />;
      case 'system':
        return <SettingsIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') return 'error.main';
    switch (type) {
      case 'achievement':
        return 'success.main';
      case 'reminder':
        return 'warning.main';
      case 'update':
        return 'info.main';
      case 'social':
        return 'secondary.main';
      default:
        return 'primary.main';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const filteredNotifications = notifications.filter(notification => 
    filterType === 'all' || notification.type === filterType
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      onNotificationAction(notification);
    }
  };

  const handleSettings = () => {
    setSettingsOpen(true);
    setAnchorEl(null);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <Badge badgeContent={unreadCount} color="error" sx={{ mr: 2 }}>
            <NotificationsIcon />
          </Badge>
          Notifications & Activity
        </Typography>
        
        <Box>
          <Button
            size="small"
            onClick={onMarkAllAsRead}
            disabled={unreadCount === 0}
            sx={{ mr: 1 }}
          >
            Mark All Read
          </Button>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <MoreVertIcon />
          </IconButton>
        </Box>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={handleSettings}>
            <SettingsIcon sx={{ mr: 1 }} />
            Notification Settings
          </MenuItem>
          <MenuItem onClick={onMarkAllAsRead}>
            <CheckIcon sx={{ mr: 1 }} />
            Mark All as Read
          </MenuItem>
        </Menu>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab 
            icon={<Badge badgeContent={unreadCount} color="error"><NotificationsIcon /></Badge>} 
            label="Notifications" 
          />
          <Tab icon={<ActivityIcon />} label="Recent Activity" />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <Card>
          <CardContent>
            {/* Filter Chips */}
            <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap' }}>
              <Chip
                label="All"
                color={filterType === 'all' ? 'primary' : 'default'}
                onClick={() => setFilterType('all')}
                clickable
              />
              <Chip
                label="Achievements"
                color={filterType === 'achievement' ? 'primary' : 'default'}
                onClick={() => setFilterType('achievement')}
                clickable
              />
              <Chip
                label="Reminders"
                color={filterType === 'reminder' ? 'primary' : 'default'}
                onClick={() => setFilterType('reminder')}
                clickable
              />
              <Chip
                label="Updates"
                color={filterType === 'update' ? 'primary' : 'default'}
                onClick={() => setFilterType('update')}
                clickable
              />
              <Chip
                label="Social"
                color={filterType === 'social' ? 'primary' : 'default'}
                onClick={() => setFilterType('social')}
                clickable
              />
            </Stack>

            {/* Notifications List */}
            <List>
              {filteredNotifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.selected',
                      },
                    }}
                    onClick={() => handleNotificationClick(notification)}
                    secondaryAction={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={notification.priority}
                          color={getPriorityColor(notification.priority)}
                          size="small"
                        />
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteNotification(notification.id);
                          }}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          bgcolor: getNotificationColor(notification.type, notification.priority),
                          width: 40,
                          height: 40,
                        }}
                      >
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: notification.isRead ? 'normal' : 'bold',
                            }}
                          >
                            {notification.title}
                          </Typography>
                          {!notification.isRead && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: 'primary.main',
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.5 }}
                          >
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTimeAgo(notification.timestamp)}
                          </Typography>
                          {notification.metadata?.score && (
                            <Chip
                              label={`Score: ${notification.metadata.score}%`}
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          )}
                          {notification.metadata?.streak && (
                            <Chip
                              label={`${notification.metadata.streak} day streak`}
                              size="small"
                              icon={<StreakIcon />}
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < filteredNotifications.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
              
              {filteredNotifications.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <NotificationsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No notifications found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {filterType === 'all' 
                      ? "You're all caught up!"
                      : `No ${filterType} notifications`
                    }
                  </Typography>
                </Box>
              )}
            </List>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            
            <List>
              {activities.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: activity.color }}>
                        {activity.icon}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {activity.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {formatTimeAgo(activity.timestamp)}
                            </Typography>
                            {activity.duration && (
                              <Chip
                                label={`${activity.duration}min`}
                                size="small"
                                icon={<TimeIcon />}
                                variant="outlined"
                              />
                            )}
                            {activity.score && (
                              <Chip
                                label={`${activity.score}%`}
                                size="small"
                                icon={<StarIcon />}
                                color={activity.score >= 80 ? 'success' : activity.score >= 60 ? 'warning' : 'error'}
                              />
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < activities.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
              
              {activities.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <ActivityIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No recent activity
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Start studying to see your activity here
                  </Typography>
                </Box>
              )}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Notification Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Notification Settings</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Notification Types
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.achievements}
                  onChange={(e) => onUpdateSettings({
                    ...notificationSettings,
                    achievements: e.target.checked,
                  })}
                />
              }
              label="Achievement notifications"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.reminders}
                  onChange={(e) => onUpdateSettings({
                    ...notificationSettings,
                    reminders: e.target.checked,
                  })}
                />
              }
              label="Study reminders"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.courseUpdates}
                  onChange={(e) => onUpdateSettings({
                    ...notificationSettings,
                    courseUpdates: e.target.checked,
                  })}
                />
              }
              label="Course updates"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.socialActivity}
                  onChange={(e) => onUpdateSettings({
                    ...notificationSettings,
                    socialActivity: e.target.checked,
                  })}
                />
              }
              label="Social activity"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.systemAlerts}
                  onChange={(e) => onUpdateSettings({
                    ...notificationSettings,
                    systemAlerts: e.target.checked,
                  })}
                />
              }
              label="System alerts"
            />
            
            <Divider />
            
            <Typography variant="h6" gutterBottom>
              Delivery Methods
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.pushNotifications}
                  onChange={(e) => onUpdateSettings({
                    ...notificationSettings,
                    pushNotifications: e.target.checked,
                  })}
                />
              }
              label="Push notifications"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onChange={(e) => onUpdateSettings({
                    ...notificationSettings,
                    emailNotifications: e.target.checked,
                  })}
                />
              }
              label="Email notifications"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.weeklyReports}
                  onChange={(e) => onUpdateSettings({
                    ...notificationSettings,
                    weeklyReports: e.target.checked,
                  })}
                />
              }
              label="Weekly progress reports"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationActivityFeed;