import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  Divider,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Avatar,
  AppBar,
  Toolbar,
  useTheme,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { ROUTES } from '@/utils/constants';
import GeminiStatusIndicator from '@/components/common/GeminiStatusIndicator';
import SarasStatusIndicator from '@/components/common/SarasStatusIndicator';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock validation
      if (formData.email === 'student@example.com' && formData.password === 'password') {
        // Store auth token (in real app, this would come from API)
        localStorage.setItem('auth_token', 'mock_token_123');
        localStorage.setItem(
          'user_data',
          JSON.stringify({
            id: '1',
            name: 'Student User',
            email: formData.email,
            role: 'student',
          })
        );

        navigate(ROUTES.DASHBOARD);
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Implement Google OAuth
    setError('Google login not implemented yet');
  };

  const handleDemoLogin = () => {
    setFormData({
      email: 'student@example.com',
      password: 'password',
      rememberMe: false,
    });
  };

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
          
          {/* AI Status Indicators */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GeminiStatusIndicator variant="chip" size="small" />
            <SarasStatusIndicator variant="chip" />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        sx={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          py: 3,
        }}
      >
        <Grid container maxWidth='lg' sx={{ height: '100%' }}>
          {/* Left Side - Branding */}
          <Grid
            size={{ xs: 0, md: 6 }}
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              p: 4,
            }}
          >
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'white', color: 'primary.main', mb: 3 }}>
              <SchoolIcon sx={{ fontSize: 40 }} />
            </Avatar>

            <Typography variant='h3' component='h1' fontWeight={700} gutterBottom textAlign='center'>
              Welcome Back to AARAMBH AI
            </Typography>

            <Typography variant='h6' textAlign='center' sx={{ mb: 4, opacity: 0.9 }}>
              Continue Your AI-Powered Learning Journey
            </Typography>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant='body1' sx={{ mb: 2, opacity: 0.8 }}>
                ✨ Personalized Learning Experience
              </Typography>
              <Typography variant='body1' sx={{ mb: 2, opacity: 0.8 }}>
                🎯 AI-Powered Tutoring
              </Typography>
              <Typography variant='body1' sx={{ mb: 2, opacity: 0.8 }}>
                📈 Real-time Progress Tracking
              </Typography>
              <Typography variant='body1' sx={{ opacity: 0.8 }}>
                🏆 Achieve Your Academic Goals
              </Typography>
            </Box>
          </Grid>

          {/* Right Side - Login Form */}
          <Grid
            size={{ xs: 12, md: 6 }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
            }}
          >
            <Card sx={{ width: '100%', maxWidth: 500 }}>
              <CardContent sx={{ p: 4 }}>
                {/* Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography variant='h4' component='h1' fontWeight={600} gutterBottom>
                    Welcome Back
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Sign in to continue your AI-powered learning journey
                  </Typography>
                </Box>

                {/* Demo Login Button */}
                <Button variant='outlined' fullWidth onClick={handleDemoLogin} sx={{ mb: 2 }}>
                  Use Demo Credentials
                </Button>

                <Divider sx={{ my: 2 }}>
                  <Typography variant='caption' color='text.secondary'>
                    or
                  </Typography>
                </Divider>

                {/* Error Alert */}
                {error && (
                  <Alert severity='error' sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label='Email Address'
                    type='email'
                    value={formData.email}
                    onChange={handleChange('email')}
                    required
                    sx={{ mb: 2 }}
                    autoComplete='email'
                  />

                  <TextField
                    fullWidth
                    label='Password'
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange('password')}
                    required
                    sx={{ mb: 2 }}
                    autoComplete='current-password'
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge='end'>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 3,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.rememberMe}
                          onChange={handleChange('rememberMe')}
                          size='small'
                        />
                      }
                      label={
                        <Typography variant='body2' color='text.secondary'>
                          Remember me
                        </Typography>
                      }
                    />

                    <Link
                      component={RouterLink}
                      to='/forgot-password'
                      variant='body2'
                      color='primary'
                    >
                      Forgot password?
                    </Link>
                  </Box>

                  <Button
                    type='submit'
                    fullWidth
                    variant='contained'
                    size='large'
                    disabled={loading}
                    sx={{ mb: 2 }}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>

                {/* Google Login */}
                <Button
                  fullWidth
                  variant='outlined'
                  startIcon={<GoogleIcon />}
                  onClick={handleGoogleLogin}
                  sx={{ mb: 3 }}
                >
                  Sign in with Google
                </Button>

                <Divider sx={{ my: 2 }} />

                {/* Sign Up Link */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant='body2' color='text.secondary'>
                    Don't have an account?{' '}
                    <Link
                      component={RouterLink}
                      to={ROUTES.REGISTER}
                      color='primary'
                      fontWeight={600}
                    >
                      Sign up for free
                    </Link>
                  </Typography>
                </Box>

                {/* Demo Credentials Info */}
                <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ display: 'block', mb: 1 }}
                  >
                    Demo Credentials:
                  </Typography>
                  <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                    Email: student@example.com
                  </Typography>
                  <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                    Password: password
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default LoginPage;
