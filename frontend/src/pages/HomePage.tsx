import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  AppBar,
  Toolbar,
  useTheme,
} from '@mui/material';
import {
  Psychology as AIIcon,
  School as LearnIcon,
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { ROUTES } from '@/utils/constants';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const features = [
    {
      icon: <AIIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'AI-Powered Learning',
      description: 'Get personalized tutoring, content creation, and assessments powered by advanced AI.',
    },
    {
      icon: <LearnIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      title: 'Comprehensive Courses',
      description: 'Access courses designed for Indian education system with expert instructors.',
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      title: 'Learning Analytics',
      description: 'Track your progress and get insights to improve your learning efficiency.',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: 'error.main' }} />,
      title: 'Real-time Help',
      description: 'Get instant help with doubts and questions from our AI tutors.',
    },
  ];

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'transparent' }}>
        <Toolbar>
          <Typography
            variant="h6"
            component="h1"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              flexGrow: 1,
            }}
          >
            AARAMBH AI
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate(ROUTES.DASHBOARD)}
            sx={{ mr: 1 }}
          >
            Dashboard
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate(ROUTES.AI_TUTOR)}
          >
            Try AI Tutor
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Container maxWidth="lg">
        <Box
          sx={{
            py: 8,
            textAlign: 'center',
          }}
        >
          <Chip
            label="AI-Powered Education"
            color="primary"
            sx={{ mb: 3, fontWeight: 600 }}
          />
          
          <Typography
            variant="h1"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            Revolutionize Learning with AI
          </Typography>
          
          <Typography
            variant="h5"
            component="p"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
          >
            Personalized AI tutoring, smart content creation, and comprehensive analytics 
            designed specifically for Indian students.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate(ROUTES.AI_TUTOR)}
              sx={{ px: 4, py: 1.5 }}
            >
              Start Learning with AI
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate(ROUTES.COURSES)}
              sx={{ px: 4, py: 1.5 }}
            >
              Explore Courses
            </Button>
          </Box>
        </Box>

        {/* Features Section */}
        <Box sx={{ py: 8 }}>
          <Typography
            variant="h3"
            component="h2"
            textAlign="center"
            gutterBottom
            sx={{ fontWeight: 600, mb: 6 }}
          >
            Why Choose AARAMBH AI?
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      component="h3"
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box
          sx={{
            py: 8,
            px: 4,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            borderRadius: 4,
            color: 'white',
            mb: 8,
          }}
        >
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            Ready to Transform Your Learning?
          </Typography>
          <Typography
            variant="h6"
            sx={{ mb: 4, opacity: 0.9 }}
          >
            Join thousands of students already learning with AI
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate(ROUTES.DASHBOARD)}
            sx={{
              backgroundColor: 'white',
              color: 'primary.main',
              px: 4,
              py: 1.5,
              '&:hover': {
                backgroundColor: 'grey.100',
              },
            }}
          >
            Get Started Now
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;