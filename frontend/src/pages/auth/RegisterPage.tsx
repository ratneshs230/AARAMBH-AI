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
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  AppBar,
  Toolbar,
  useTheme,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  School as SchoolIcon,
  ArrowForward as NextIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { ROUTES, EDUCATION_LEVELS, USER_ROLES } from '@/utils/constants';
import GeminiStatusIndicator from '@/components/common/GeminiStatusIndicator';
import SarasStatusIndicator from '@/components/common/SarasStatusIndicator';

interface RegistrationData {
  // Step 1: Basic Info
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;

  // Step 2: Educational Info
  role: string;
  educationLevel: string;
  schoolName: string;
  interests: string[];

  // Step 3: Preferences
  learningStyle: string;
  studyGoals: string[];
  agreeToTerms: boolean;
  subscribeNewsletter: boolean;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<RegistrationData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    educationLevel: '',
    schoolName: '',
    interests: [],
    learningStyle: '',
    studyGoals: [],
    agreeToTerms: false,
    subscribeNewsletter: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const steps = ['Account Details', 'Educational Background', 'Learning Preferences'];

  const handleChange =
    (field: keyof RegistrationData) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
      setFormData(prev => ({ ...prev, [field]: value }));
      if (error) setError('');
    };

  const handleArrayChange = (field: 'interests' | 'studyGoals', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value],
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
          setError('Please fill in all required fields');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          return false;
        }
        break;
      case 1:
        if (!formData.role || !formData.educationLevel) {
          setError('Please fill in all required fields');
          return false;
        }
        break;
      case 2:
        if (!formData.agreeToTerms) {
          setError('Please agree to the terms and conditions');
          return false;
        }
        break;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock registration success
      localStorage.setItem('auth_token', 'mock_token_123');
      localStorage.setItem(
        'user_data',
        JSON.stringify({
          id: '1',
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          role: formData.role,
        })
      );

      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    setError('Google signup not implemented yet');
  };

  const interests = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'English',
    'History',
    'Geography',
    'Economics',
    'Arts',
  ];

  const studyGoals = [
    'Board Exam Preparation',
    'JEE/NEET Preparation',
    'Competitive Exams',
    'Skill Development',
    'Career Guidance',
    'General Knowledge',
  ];

  const learningStyles = ['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Mixed'];

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label='First Name'
                  value={formData.firstName}
                  onChange={handleChange('firstName')}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label='Last Name'
                  value={formData.lastName}
                  onChange={handleChange('lastName')}
                  required
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label='Email Address'
              type='email'
              value={formData.email}
              onChange={handleChange('email')}
              required
              sx={{ mt: 2 }}
              autoComplete='email'
            />

            <TextField
              fullWidth
              label='Password'
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange('password')}
              required
              sx={{ mt: 2 }}
              autoComplete='new-password'
              helperText='Minimum 6 characters'
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

            <TextField
              fullWidth
              label='Confirm Password'
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              required
              sx={{ mt: 2 }}
              autoComplete='new-password'
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge='end'
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        );

      case 1:
        return (
          <Box>
            <TextField
              fullWidth
              select
              label='I am a'
              value={formData.role}
              onChange={handleChange('role')}
              required
              sx={{ mb: 2 }}
            >
              <MenuItem value='student'>Student</MenuItem>
              <MenuItem value='teacher'>Teacher</MenuItem>
              <MenuItem value='parent'>Parent</MenuItem>
            </TextField>

            <TextField
              fullWidth
              select
              label='Education Level'
              value={formData.educationLevel}
              onChange={handleChange('educationLevel')}
              required
              sx={{ mb: 2 }}
            >
              {EDUCATION_LEVELS.map(level => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label='School/Institution Name'
              value={formData.schoolName}
              onChange={handleChange('schoolName')}
              sx={{ mb: 2 }}
            />

            <Typography variant='subtitle2' gutterBottom sx={{ mt: 2 }}>
              Subjects of Interest (select multiple)
            </Typography>
            <Grid container spacing={1}>
              {interests.map(interest => (
                <Grid size={{ xs: 6, sm: 4 }} key={interest}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.interests.includes(interest)}
                        onChange={() => handleArrayChange('interests', interest)}
                        size='small'
                      />
                    }
                    label={<Typography variant='body2'>{interest}</Typography>}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <TextField
              fullWidth
              select
              label='Preferred Learning Style'
              value={formData.learningStyle}
              onChange={handleChange('learningStyle')}
              sx={{ mb: 2 }}
            >
              {learningStyles.map(style => (
                <MenuItem key={style} value={style}>
                  {style}
                </MenuItem>
              ))}
            </TextField>

            <Typography variant='subtitle2' gutterBottom sx={{ mt: 2 }}>
              Study Goals (select multiple)
            </Typography>
            <Grid container spacing={1}>
              {studyGoals.map(goal => (
                <Grid size={{ xs: 12, sm: 6 }} key={goal}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.studyGoals.includes(goal)}
                        onChange={() => handleArrayChange('studyGoals', goal)}
                        size='small'
                      />
                    }
                    label={<Typography variant='body2'>{goal}</Typography>}
                  />
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.agreeToTerms}
                    onChange={handleChange('agreeToTerms')}
                    required
                  />
                }
                label={
                  <Typography variant='body2'>
                    I agree to the{' '}
                    <Link href='#' color='primary'>
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href='#' color='primary'>
                      Privacy Policy
                    </Link>
                  </Typography>
                }
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.subscribeNewsletter}
                    onChange={handleChange('subscribeNewsletter')}
                  />
                }
                label={
                  <Typography variant='body2'>
                    Subscribe to newsletter for learning tips and updates
                  </Typography>
                }
              />
            </Box>
          </Box>
        );

      default:
        return null;
    }
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
            size={{ xs: 0, md: 5 }}
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
              Join AARAMBH AI
            </Typography>

            <Typography variant='h6' textAlign='center' sx={{ mb: 4, opacity: 0.9 }}>
              Start Your AI-Powered Learning Journey Today
            </Typography>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant='body1' sx={{ mb: 2, opacity: 0.8 }}>
                ✨ Personalized Learning Experience
              </Typography>
              <Typography variant='body1' sx={{ mb: 2, opacity: 0.8 }}>
                🎯 Adaptive Study Plans
              </Typography>
              <Typography variant='body1' sx={{ mb: 2, opacity: 0.8 }}>
                📈 Real-time Progress Tracking
              </Typography>
              <Typography variant='body1' sx={{ opacity: 0.8 }}>
                🏆 Achieve Your Academic Goals
              </Typography>
            </Box>
          </Grid>

          {/* Right Side - Registration Form */}
          <Grid
            size={{ xs: 12, md: 7 }}
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
                    Create Account
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Join thousands of students already learning with AI
                  </Typography>
                </Box>

                {/* Stepper */}
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                  {steps.map(label => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

                {/* Error Alert */}
                {error && (
                  <Alert severity='error' sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                {/* Form Content */}
                {renderStepContent(activeStep)}

                {/* Navigation Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button onClick={handleBack} disabled={activeStep === 0} startIcon={<BackIcon />}>
                    Back
                  </Button>

                  {activeStep === steps.length - 1 ? (
                    <Button
                      variant='contained'
                      onClick={handleSubmit}
                      disabled={loading}
                      endIcon={!loading && <NextIcon />}
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  ) : (
                    <Button variant='contained' onClick={handleNext} endIcon={<NextIcon />}>
                      Next
                    </Button>
                  )}
                </Box>

                {/* Alternative Registration */}
                {activeStep === 0 && (
                  <>
                    <Divider sx={{ my: 3 }}>
                      <Typography variant='caption' color='text.secondary'>
                        or
                      </Typography>
                    </Divider>

                    <Button
                      fullWidth
                      variant='outlined'
                      startIcon={<GoogleIcon />}
                      onClick={handleGoogleSignup}
                      sx={{ mb: 3 }}
                    >
                      Sign up with Google
                    </Button>
                  </>
                )}

                {/* Sign In Link */}
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Already have an account?{' '}
                    <Link component={RouterLink} to={ROUTES.LOGIN} color='primary' fontWeight={600}>
                      Sign in
                    </Link>
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

export default RegisterPage;
