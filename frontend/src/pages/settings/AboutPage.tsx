import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Breadcrumbs,
  Link,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Info as InfoIcon,
  Build as BuildIcon,
  Cloud as CloudIcon,
  Security as SecurityIcon,
  Speed as PerformanceIcon,
  Update as UpdateIcon,
} from '@mui/icons-material';
import { appInfo, config } from '@/utils/config';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  const systemInfo = [
    {
      label: 'Version',
      value: appInfo.version,
      icon: <InfoIcon />,
    },
    {
      label: 'Environment',
      value: process.env.NODE_ENV || 'development',
      icon: <BuildIcon />,
    },
    {
      label: 'AI Features',
      value: config.enableAI ? 'Enabled' : 'Disabled',
      icon: <CloudIcon />,
    },
    {
      label: 'Real-time',
      value: config.enableRealTime ? 'Enabled' : 'Disabled',
      icon: <PerformanceIcon />,
    },
    {
      label: 'Analytics',
      value: config.enableAnalytics ? 'Enabled' : 'Disabled',
      icon: <SecurityIcon />,
    },
    {
      label: 'PWA',
      value: config.enablePWA ? 'Enabled' : 'Disabled',
      icon: <UpdateIcon />,
    },
  ];

  const features = [
    'AI-Powered Tutoring',
    'Personalized Learning Paths',
    'Real-time Collaboration',
    'Adaptive Assessments',
    'Progress Analytics',
    'Community Learning',
    'Multi-device Sync',
    'Offline Mode Support',
  ];

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
          <Link 
            color="inherit" 
            href="#" 
            onClick={(e) => { e.preventDefault(); navigate('/settings'); }}
          >
            Settings
          </Link>
          <Typography color="text.primary">About</Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
          About AARAMBH AI
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {appInfo.description}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* App Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Application Information
              </Typography>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h2" fontWeight={700} color="primary" gutterBottom>
                  {appInfo.name}
                </Typography>
                <Chip 
                  label={`Version ${appInfo.version}`} 
                  color="primary" 
                  variant="outlined" 
                />
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                AARAMBH AI is an intelligent educational platform that uses artificial intelligence 
                to provide personalized learning experiences. Our mission is to make quality 
                education accessible and adaptive to every learner's needs.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* System Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                System Information
              </Typography>
              <List>
                {systemInfo.map((info, index) => (
                  <React.Fragment key={info.label}>
                    <ListItem>
                      <ListItemIcon>{info.icon}</ListItemIcon>
                      <ListItemText
                        primary={info.label}
                        secondary={info.value}
                      />
                      <Chip 
                        label={info.value} 
                        size="small" 
                        color={
                          info.value.includes('Enabled') ? 'success' : 
                          info.value.includes('Disabled') ? 'error' : 
                          'default'
                        }
                      />
                    </ListItem>
                    {index < systemInfo.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Features */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Key Features
              </Typography>
              <Grid container spacing={2}>
                {features.map((feature) => (
                  <Grid key={feature} size={{ xs: 12, sm: 6, md: 3 }}>
                    <Chip
                      label={feature}
                      variant="outlined"
                      sx={{ width: '100%', justifyContent: 'flex-start' }}
                    />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Technical Details */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Technical Details
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Frontend
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • React 18 with TypeScript<br />
                    • Material-UI Components<br />
                    • Responsive Design<br />
                    • Progressive Web App
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Backend
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Node.js & Express<br />
                    • RESTful API Design<br />
                    • Real-time Socket.IO<br />
                    • MongoDB Database
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    AI Services
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • OpenAI GPT Integration<br />
                    • Anthropic Claude Support<br />
                    • Google Gemini API<br />
                    • Custom AI Agents
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Copyright and Legal */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body2" color="text.secondary">
              © 2024 AARAMBH AI. All rights reserved.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Built with ❤️ for learners worldwide
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AboutPage;