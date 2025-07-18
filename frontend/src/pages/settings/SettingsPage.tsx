import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  Divider,
  Breadcrumbs,
  Link,
  Alert,
  Chip,
} from '@mui/material';
import {
  Person as ProfileIcon,
  Palette as ThemeIcon,
  Language as LanguageIcon,
  Notifications as NotificationIcon,
  Security as SecurityIcon,
  BugReport as DiagnosticsIcon,
  Info as InfoIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Psychology as AIIcon,
} from '@mui/icons-material';

interface SettingsOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: 'page' | 'toggle' | 'action';
  route?: string;
  value?: boolean;
  onToggle?: (value: boolean) => void;
  badge?: string;
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [aiFeatures, setAIFeatures] = useState(true);

  const settingsCategories = [
    {
      title: 'Account & Profile',
      options: [
        {
          id: 'profile',
          title: 'Profile Settings',
          description: 'Manage your personal information and preferences',
          icon: <ProfileIcon />,
          type: 'page' as const,
          route: '/settings/profile',
        },
        {
          id: 'security',
          title: 'Security & Privacy',
          description: 'Password, two-factor authentication, and privacy settings',
          icon: <SecurityIcon />,
          type: 'page' as const,
          route: '/settings/security',
        },
      ],
    },
    {
      title: 'Appearance & Experience',
      options: [
        {
          id: 'theme',
          title: 'Dark Mode',
          description: 'Switch between light and dark themes',
          icon: darkMode ? <DarkModeIcon /> : <LightModeIcon />,
          type: 'toggle' as const,
          value: darkMode,
          onToggle: (value: boolean) => {
            setDarkMode(value);
            localStorage.setItem('aarambh_theme_mode', value ? 'dark' : 'light');
          },
        },
        {
          id: 'language',
          title: 'Language & Region',
          description: 'Choose your preferred language and regional settings',
          icon: <LanguageIcon />,
          type: 'page' as const,
          route: '/settings/language',
        },
        {
          id: 'notifications',
          title: 'Notifications',
          description: 'Manage notification preferences and alerts',
          icon: <NotificationIcon />,
          type: 'toggle' as const,
          value: notifications,
          onToggle: setNotifications,
        },
      ],
    },
    {
      title: 'Learning & AI',
      options: [
        {
          id: 'ai-features',
          title: 'AI Features',
          description: 'Enable or disable AI-powered learning features',
          icon: <AIIcon />,
          type: 'toggle' as const,
          value: aiFeatures,
          onToggle: setAIFeatures,
        },
        {
          id: 'ai-diagnostics',
          title: 'AI Service Diagnostics',
          description: 'Test AI connection and troubleshoot issues',
          icon: <DiagnosticsIcon />,
          type: 'action' as const,
          route: '/debug/ai-test',
          badge: 'Diagnostics',
        },
      ],
    },
    {
      title: 'System & Support',
      options: [
        {
          id: 'about',
          title: 'About AARAMBH AI',
          description: 'Version information and system details',
          icon: <InfoIcon />,
          type: 'page' as const,
          route: '/settings/about',
        },
      ],
    },
  ];

  const handleOptionClick = (option: SettingsOption) => {
    if (option.type === 'page' || option.type === 'action') {
      if (option.route) {
        navigate(option.route);
      }
    }
  };

  const renderSettingsOption = (option: SettingsOption) => {
    return (
      <ListItem key={option.id} disablePadding>
        <ListItemButton
          onClick={() => handleOptionClick(option)}
          disabled={option.type === 'toggle'}
          sx={{
            borderRadius: 2,
            mb: 1,
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'primary.main' }}>
            {option.icon}
          </ListItemIcon>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {option.title}
                </Typography>
                {option.badge && (
                  <Chip label={option.badge} size="small" color="primary" />
                )}
              </Box>
            }
            secondary={option.description}
          />
          {option.type === 'toggle' && (
            <FormControlLabel
              control={
                <Switch
                  checked={option.value || false}
                  onChange={(e) => option.onToggle?.(e.target.checked)}
                  color="primary"
                />
              }
              label=""
              sx={{ ml: 1 }}
            />
          )}
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link 
            color="inherit" 
            href="#" 
            onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
          >
            Dashboard
          </Link>
          <Typography color="text.primary">Settings</Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Customize your AARAMBH AI experience and manage your preferences
        </Typography>
      </Box>

      {/* Welcome Alert */}
      <Alert severity="info" sx={{ mb: 4 }}>
        💡 Configure your learning environment to match your preferences. Changes are saved automatically.
      </Alert>

      {/* Settings Categories */}
      <Grid container spacing={3}>
        {settingsCategories.map((category, categoryIndex) => (
          <Grid key={category.title} size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography 
                  variant="h6" 
                  fontWeight={600} 
                  gutterBottom
                  sx={{ mb: 2 }}
                >
                  {category.title}
                </Typography>
                <List sx={{ py: 0 }}>
                  {category.options.map((option, optionIndex) => (
                    <React.Fragment key={option.id}>
                      {renderSettingsOption(option)}
                      {optionIndex < category.options.length - 1 && (
                        <Divider sx={{ my: 1 }} />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Stats */}
      <Box sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Quick Info
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="primary">
                    {aiFeatures ? 'Enabled' : 'Disabled'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    AI Features
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="primary">
                    {darkMode ? 'Dark' : 'Light'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Theme Mode
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="primary">
                    {notifications ? 'On' : 'Off'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Notifications
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default SettingsPage;