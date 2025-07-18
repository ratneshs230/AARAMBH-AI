import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  AppBar,
  Toolbar,
  useTheme,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Psychology as AIIcon,
  School as LearnIcon,
  Analytics as AnalyticsIcon,
  Explore as CuriosityIcon,
  Person as PersonIcon,
  Login as LoginIcon,
  KeyboardArrowDown as ArrowDownIcon,
  PlayArrow as PlayIcon,
  Book as BookIcon,
} from '@mui/icons-material';
import { ROUTES } from '@/utils/constants';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [coursesAnchorEl, setCoursesAnchorEl] = useState<null | HTMLElement>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // This would come from auth context
  
  // Mock enrolled courses data - this would come from API/context
  const enrolledCourses = [
    {
      id: 1,
      title: 'Advanced Mathematics',
      progress: 75,
      thumbnail: '/api/placeholder/40/40',
      subject: 'Mathematics',
    },
    {
      id: 2,
      title: 'Physics Fundamentals',
      progress: 45,
      thumbnail: '/api/placeholder/40/40',
      subject: 'Physics',
    },
    {
      id: 3,
      title: 'Chemistry Basics',
      progress: 90,
      thumbnail: '/api/placeholder/40/40',
      subject: 'Chemistry',
    },
  ];
  
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCoursesMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setCoursesAnchorEl(event.currentTarget);
  };

  const handleCoursesMenuClose = () => {
    setCoursesAnchorEl(null);
  };

  const handleCourseSelect = (courseId: number) => {
    handleCoursesMenuClose();
    navigate(`/dashboard/${courseId}`); // Navigate to unified dashboard with course
  };

  const handleLogin = () => {
    // This would handle actual login logic
    navigate('/login'); // You might need to add this route
  };

  const handleSignup = () => {
    // This would handle actual signup logic
    navigate('/signup'); // You might need to add this route
  };

  const features = [
    {
      icon: <AIIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'AI-Powered Learning',
      description:
        'Get personalized tutoring, content creation, and assessments powered by advanced AI.',
    },
    {
      icon: <CuriosityIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      title: 'Curiosity Platform',
      description:
        'Explore topics, ask questions, and discover new knowledge through AI-powered recommendations.',
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
  ];

  return (
    <Box>
      {/* Header */}
      <AppBar position='static' elevation={0} sx={{ backgroundColor: 'transparent' }}>
        <Toolbar>
          <Typography
            variant='h6'
            component='h1'
            onClick={() => navigate(ROUTES.HOME)}
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              flexGrow: 1,
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8,
                transform: 'scale(1.02)',
                transition: 'all 0.2s ease-in-out',
              },
            }}
          >
            AARAMBH AI
          </Typography>
          {!isLoggedIn ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant='outlined'
                onClick={handleLogin}
                startIcon={<LoginIcon />}
                sx={{ mr: 1 }}
              >
                Login
              </Button>
              <Button
                variant='contained'
                onClick={handleSignup}
              >
                Sign Up
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                size='large'
                edge='end'
                aria-label='account of current user'
                aria-controls='profile-menu'
                aria-haspopup='true'
                onClick={handleProfileMenuOpen}
                color='inherit'
              >
                <Avatar sx={{ width: 32, height: 32 }}>
                  <PersonIcon />
                </Avatar>
              </IconButton>
              <Menu
                id='profile-menu'
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
              >
                <MenuItem onClick={() => { handleProfileMenuClose(); navigate(ROUTES.DASHBOARD); }}>
                  Dashboard
                </MenuItem>
                <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/profile'); }}>
                  My Profile
                </MenuItem>
                <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/settings'); }}>
                  Settings
                </MenuItem>
                <MenuItem onClick={() => { handleProfileMenuClose(); setIsLoggedIn(false); }}>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Container maxWidth='lg'>
        <Box
          sx={{
            py: 8,
            textAlign: 'center',
          }}
        >
          <Chip label='AI-Powered Education' color='primary' sx={{ mb: 3, fontWeight: 600 }} />

          <Typography
            variant='h1'
            component='h1'
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
            variant='h5'
            component='p'
            color='text.secondary'
            sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
          >
            Personalized AI tutoring, smart content creation, and comprehensive analytics designed
            specifically for Indian students.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* Start Learning Button - Dropdown for enrolled courses */}
            <Box>
              <Button
                variant='contained'
                size='large'
                onClick={enrolledCourses.length > 0 ? handleCoursesMenuOpen : () => navigate(ROUTES.AI_TUTOR)}
                endIcon={enrolledCourses.length > 0 ? <ArrowDownIcon /> : <PlayIcon />}
                sx={{ px: 4, py: 1.5 }}
              >
                {enrolledCourses.length > 0 ? 'Continue Learning' : 'Start Learning with AI'}
              </Button>
              
              {/* Courses Dropdown Menu */}
              <Menu
                anchorEl={coursesAnchorEl}
                open={Boolean(coursesAnchorEl)}
                onClose={handleCoursesMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 300,
                    maxHeight: 400,
                  },
                }}
              >
                {/* Header */}
                <MenuItem disabled sx={{ py: 1 }}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Your Enrolled Courses
                  </Typography>
                </MenuItem>
                <Divider />
                
                {/* Course List */}
                {enrolledCourses.map((course) => (
                  <MenuItem
                    key={course.id}
                    onClick={() => handleCourseSelect(course.id)}
                    sx={{ py: 1.5, px: 2 }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        variant='rounded'
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          bgcolor: 'primary.main',
                          mr: 1 
                        }}
                      >
                        <BookIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={course.title}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Typography variant='caption' color='text.secondary'>
                            {course.subject}
                          </Typography>
                          <Chip
                            label={`${course.progress}% Complete`}
                            size='small'
                            color={course.progress >= 75 ? 'success' : course.progress >= 50 ? 'warning' : 'primary'}
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        </Box>
                      }
                    />
                  </MenuItem>
                ))}
                
                <Divider />
                
                {/* Footer Actions */}
                <MenuItem 
                  onClick={() => { handleCoursesMenuClose(); navigate(ROUTES.COURSES); }}
                  sx={{ py: 1, justifyContent: 'center' }}
                >
                  <Typography variant='body2' color='primary'>
                    Browse All Courses
                  </Typography>
                </MenuItem>
              </Menu>
            </Box>
            
            <Button
              variant='contained'
              size='large'
              onClick={() => navigate(ROUTES.CURIOSITY)}
              sx={{
                px: 4,
                py: 1.5,
                background: 'linear-gradient(135deg, #e91e63 0%, #f06292 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #c2185b 0%, #e91e63 100%)',
                },
              }}
            >
              Explore Curiosity Platform
            </Button>
          </Box>
        </Box>

        {/* Features Section */}
        <Box sx={{ py: 8 }}>
          <Typography
            variant='h3'
            component='h2'
            textAlign='center'
            gutterBottom
            sx={{ fontWeight: 600, mb: 6 }}
          >
            Why Choose AARAMBH AI?
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    transition: 'transform 0.2s',
                    cursor: feature.title === 'Curiosity Platform' ? 'pointer' : 'default',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                    },
                  }}
                  onClick={() => {
                    if (feature.title === 'Curiosity Platform') {
                      navigate(ROUTES.CURIOSITY);
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                    <Typography variant='h6' component='h3' gutterBottom sx={{ fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

      </Container>
    </Box>
  );
};

export default HomePage;
