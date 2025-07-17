import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  LinearProgress,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Tooltip,
  type AlertColor,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Videocam as CameraIcon,
  Mic as MicIcon,
  Computer as ComputerIcon,
  Security as SecurityIcon,
  Visibility as EyeTrackingIcon,
  RecordVoiceOver as VoiceIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Monitor as ScreenIcon,
  Face as FaceIcon,
  Timer as TimerIcon,
  Assignment as AssessmentIcon,
  Shield as ShieldIcon,
  Analytics as AnalyticsIcon,
  CameraAlt as PhotoIcon,
} from '@mui/icons-material';

interface ProctoringAlert {
  id: string;
  type: 'warning' | 'violation' | 'suspicious';
  category:
    | 'eye-tracking'
    | 'face-detection'
    | 'audio'
    | 'screen'
    | 'tab-switch'
    | 'multiple-faces';
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidence?: {
    screenshot?: string;
    audioClip?: string;
    metadata?: any;
  };
}

interface ProctoringStats {
  faceDetectionAccuracy: number;
  eyeTrackingStability: number;
  audioLevel: number;
  suspiciousActivities: number;
  tabSwitches: number;
  averageGazeDeviation: number;
  totalViolations: number;
  integrityScore: number;
}

interface Assessment {
  id: string;
  title: string;
  duration: number; // in minutes
  questions: Question[];
  proctoringLevel: 'basic' | 'standard' | 'strict' | 'maximum';
  allowedResources: string[];
  restrictions: string[];
}

interface Question {
  id: string;
  type: 'multiple-choice' | 'essay' | 'coding' | 'true-false';
  question: string;
  options?: string[];
  timeLimit?: number;
  points: number;
}

const AIProctoredAssessmentPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSystemCheckComplete, setIsSystemCheckComplete] = useState(false);
  const [isAssessmentActive, setIsAssessmentActive] = useState(false);
  const [proctoringAlerts, setProctoringAlerts] = useState<ProctoringAlert[]>([]);
  const [proctoringStats, setProctoringStats] = useState<ProctoringStats>({
    faceDetectionAccuracy: 95,
    eyeTrackingStability: 88,
    audioLevel: 65,
    suspiciousActivities: 2,
    tabSwitches: 1,
    averageGazeDeviation: 12,
    totalViolations: 3,
    integrityScore: 85,
  });

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(3600); // 60 minutes in seconds
  const [isProctoringSuspended, setIsProctoringSuspended] = useState(false);
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<ProctoringAlert | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const assessment: Assessment = {
    id: '1',
    title: 'Advanced Mathematics Final Exam',
    duration: 120,
    proctoringLevel: 'strict',
    allowedResources: ['Calculator', 'Formula sheet'],
    restrictions: ['No external websites', 'No communication', 'No multiple tabs'],
    questions: [
      {
        id: '1',
        type: 'multiple-choice',
        question: 'What is the derivative of f(x) = x² + 3x + 2?',
        options: ['2x + 3', 'x² + 3', '2x + 2', 'x + 3'],
        points: 10,
      },
      {
        id: '2',
        type: 'essay',
        question: 'Explain the fundamental theorem of calculus and provide an example.',
        timeLimit: 30,
        points: 25,
      },
    ],
  };

  // Initialize camera and monitoring
  useEffect(() => {
    if (isAssessmentActive) {
      initializeProctoring();
      startTimer();
    }

    return () => {
      cleanup();
    };
  }, [isAssessmentActive]);

  // Simulate real-time monitoring
  useEffect(() => {
    if (isAssessmentActive && !isProctoringSuspended) {
      const interval = setInterval(() => {
        simulateMonitoring();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isAssessmentActive, isProctoringSuspended]);

  const initializeProctoring = async () => {
    try {
      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }

      // Initialize eye tracking and face detection (mock)
      console.log('AI Proctoring initialized');
    } catch (error) {
      console.error('Failed to initialize proctoring:', error);
      addAlert({
        type: 'violation',
        category: 'screen',
        message: 'Camera access denied. Assessment cannot proceed.',
        severity: 'critical',
      });
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const startTimer = () => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAssessmentComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const simulateMonitoring = () => {
    // Simulate various monitoring alerts
    const alertTypes = [
      {
        type: 'warning' as const,
        category: 'eye-tracking' as const,
        message: 'Looking away from screen detected',
        severity: 'medium' as const,
      },
      {
        type: 'suspicious' as const,
        category: 'face-detection' as const,
        message: 'Multiple faces detected in frame',
        severity: 'high' as const,
      },
      {
        type: 'violation' as const,
        category: 'tab-switch' as const,
        message: 'Tab switching detected',
        severity: 'high' as const,
      },
      {
        type: 'warning' as const,
        category: 'audio' as const,
        message: 'Background noise detected',
        severity: 'low' as const,
      },
    ];

    // Randomly generate alerts (simulation)
    if (Math.random() < 0.3) {
      const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      addAlert(alertType);
    }

    // Update stats
    setProctoringStats(prev => ({
      ...prev,
      faceDetectionAccuracy: Math.max(
        70,
        Math.min(100, prev.faceDetectionAccuracy + (Math.random() - 0.5) * 10)
      ),
      eyeTrackingStability: Math.max(
        60,
        Math.min(100, prev.eyeTrackingStability + (Math.random() - 0.5) * 15)
      ),
      audioLevel: Math.max(0, Math.min(100, prev.audioLevel + (Math.random() - 0.5) * 20)),
    }));
  };

  const addAlert = (alertData: Omit<ProctoringAlert, 'id' | 'timestamp'>) => {
    const newAlert: ProctoringAlert = {
      ...alertData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };

    setProctoringAlerts(prev => [...prev, newAlert]);

    if (alertData.severity === 'critical' || alertData.severity === 'high') {
      setCurrentAlert(newAlert);
      setWarningDialogOpen(true);

      if (alertData.severity === 'critical') {
        setIsProctoringSuspended(true);
      }
    }

    // Update violation count
    setProctoringStats(prev => ({
      ...prev,
      totalViolations: prev.totalViolations + 1,
      integrityScore: Math.max(
        0,
        prev.integrityScore -
          (alertData.severity === 'critical' ? 20 : alertData.severity === 'high' ? 10 : 5)
      ),
    }));
  };

  const handleSystemCheck = () => {
    setCurrentStep(1);
    // Simulate system check
    setTimeout(() => {
      setIsSystemCheckComplete(true);
      setCurrentStep(2);
    }, 3000);
  };

  const handleStartAssessment = () => {
    setCurrentStep(3);
    setIsAssessmentActive(true);
  };

  const handleAssessmentComplete = () => {
    setIsAssessmentActive(false);
    setCurrentStep(4);
    cleanup();
  };

  const handleWarningAcknowledge = () => {
    setWarningDialogOpen(false);
    setCurrentAlert(null);
    if (isProctoringSuspended && currentAlert?.severity !== 'critical') {
      setIsProctoringSuspended(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAlertColor = (severity: string) => {
    const colors = {
      low: 'info',
      medium: 'warning',
      high: 'error',
      critical: 'error',
    };
    return (colors[severity as keyof typeof colors] || 'default') as AlertColor;
  };

  const getIntegrityColor = (score: number): 'success' | 'warning' | 'error' => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const steps = [
    'Pre-Assessment Setup',
    'System Check',
    'Assessment Rules',
    'Assessment in Progress',
    'Completion',
  ];

  if (currentStep === 0) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <ShieldIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            <Typography variant='h4' component='h1' gutterBottom sx={{ fontWeight: 'bold' }}>
              AI-Proctored Assessment
            </Typography>
            <Typography variant='h5' color='text.secondary' gutterBottom>
              {assessment.title}
            </Typography>
            <Typography variant='body1' sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
              This assessment uses advanced AI monitoring to ensure academic integrity. Your camera,
              microphone, and screen activity will be monitored throughout the exam.
            </Typography>

            <Box
              sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3, flexWrap: 'wrap' }}
            >
              <Chip label={`Duration: ${assessment.duration} minutes`} color='primary' />
              <Chip label={`Proctoring: ${assessment.proctoringLevel}`} color='secondary' />
              <Chip label={`Questions: ${assessment.questions.length}`} />
            </Box>

            <Alert severity='warning' sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant='subtitle2' sx={{ fontWeight: 'bold' }}>
                Important Requirements:
              </Typography>
              <List dense>
                <ListItem>• Stable internet connection required</ListItem>
                <ListItem>• Camera and microphone access mandatory</ListItem>
                <ListItem>• Well-lit room with clear face visibility</ListItem>
                <ListItem>• No other people in the room</ListItem>
                <ListItem>• Close all other applications and browser tabs</ListItem>
              </List>
            </Alert>

            <Button
              variant='contained'
              size='large'
              onClick={handleSystemCheck}
              sx={{ px: 4, py: 2 }}
            >
              Begin System Check
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (currentStep === 1) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant='h5' gutterBottom>
              System Check in Progress
            </Typography>
            <CircularProgress size={60} sx={{ my: 3 }} />
            <Typography variant='body1' color='text.secondary'>
              Checking camera, microphone, and system requirements...
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (currentStep === 2) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant='h5' gutterBottom sx={{ textAlign: 'center' }}>
              Assessment Rules & Monitoring
            </Typography>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 6 }} component='div'>
                <Paper sx={{ p: 2 }}>
                  <Typography variant='h6' gutterBottom color='success.main'>
                    <SuccessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Allowed Resources
                  </Typography>
                  <List dense>
                    {assessment.allowedResources.map((resource, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={resource} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }} component='div'>
                <Paper sx={{ p: 2 }}>
                  <Typography variant='h6' gutterBottom color='error.main'>
                    <ErrorIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Restrictions
                  </Typography>
                  <List dense>
                    {assessment.restrictions.map((restriction, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={restriction} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>

            <Alert severity='info' sx={{ mb: 3 }}>
              <Typography variant='subtitle2' sx={{ fontWeight: 'bold' }}>
                AI Monitoring Features:
              </Typography>
              <Grid container spacing={1} sx={{ mt: 1 }}>
                <Grid size={{ xs: 6, sm: 3 }} component='div'>
                  <Chip icon={<FaceIcon />} label='Face Detection' size='small' />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }} component='div'>
                  <Chip icon={<EyeTrackingIcon />} label='Eye Tracking' size='small' />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }} component='div'>
                  <Chip icon={<VoiceIcon />} label='Audio Monitoring' size='small' />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }} component='div'>
                  <Chip icon={<ScreenIcon />} label='Screen Recording' size='small' />
                </Grid>
              </Grid>
            </Alert>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant='contained'
                size='large'
                onClick={handleStartAssessment}
                sx={{ px: 4, py: 2 }}
              >
                I Understand - Start Assessment
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (currentStep === 3 && isAssessmentActive) {
    return (
      <Box sx={{ p: 2, height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Assessment Header */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container alignItems='center' spacing={2}>
            <Grid size={{ xs: 12 }} component='div'>
              <Typography variant='h6'>{assessment.title}</Typography>
              <Typography variant='body2' color='text.secondary'>
                Question {currentQuestion + 1} of {assessment.questions.length}
              </Typography>
            </Grid>

            <Grid size={{ xs: 'auto' }} component='div'>
              <Chip
                icon={<TimerIcon />}
                label={formatTime(timeRemaining)}
                color={timeRemaining < 300 ? 'error' : 'primary'}
                sx={{ fontSize: '1.1rem', px: 2, py: 1 }}
              />
            </Grid>

            <Grid size={{ xs: 'auto' }} component='div'>
              <Chip
                icon={<ShieldIcon />}
                label={`Integrity: ${proctoringStats.integrityScore}%`}
                color={getIntegrityColor(proctoringStats.integrityScore)}
              />
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={2} sx={{ flex: 1 }}>
          {/* Main Assessment Area */}
          <Grid size={{ xs: 12, md: 8 }} component='div'>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  {assessment.questions[currentQuestion]?.question}
                </Typography>

                {assessment.questions[currentQuestion]?.type === 'multiple-choice' && (
                  <Box sx={{ mt: 2 }}>
                    {assessment.questions[currentQuestion]?.options?.map((option, index) => (
                      <Button
                        key={index}
                        variant='outlined'
                        fullWidth
                        sx={{ mb: 1, justifyContent: 'flex-start', textAlign: 'left' }}
                      >
                        {String.fromCharCode(65 + index)}. {option}
                      </Button>
                    ))}
                  </Box>
                )}

                {isProctoringSuspended && (
                  <Alert severity='error' sx={{ mt: 2 }}>
                    <Typography sx={{ fontWeight: 'bold' }}>Assessment Suspended</Typography>
                    Critical violation detected. Please contact your instructor.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Monitoring Panel */}
          <Grid size={{ xs: 12, md: 4 }} component='div'>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  AI Monitoring
                </Typography>

                {/* Video Feed */}
                <Box sx={{ mb: 2, position: 'relative' }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    style={{
                      width: '100%',
                      height: 120,
                      objectFit: 'cover',
                      borderRadius: 4,
                      backgroundColor: '#f5f5f5',
                    }}
                  />
                  <Box sx={{ position: 'absolute', top: 4, left: 4 }}>
                    <Chip
                      label='RECORDING'
                      color='error'
                      size='small'
                      sx={{ bgcolor: 'error.main', color: 'white' }}
                    />
                  </Box>
                </Box>

                {/* Monitoring Stats */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant='subtitle2' gutterBottom>
                    Real-time Stats
                  </Typography>

                  <Box sx={{ mb: 1 }}>
                    <Typography variant='caption'>Face Detection</Typography>
                    <LinearProgress
                      variant='determinate'
                      value={proctoringStats.faceDetectionAccuracy}
                      color={proctoringStats.faceDetectionAccuracy > 80 ? 'success' : 'warning'}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                    <Typography variant='caption'>
                      {proctoringStats.faceDetectionAccuracy}%
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 1 }}>
                    <Typography variant='caption'>Eye Tracking</Typography>
                    <LinearProgress
                      variant='determinate'
                      value={proctoringStats.eyeTrackingStability}
                      color={proctoringStats.eyeTrackingStability > 70 ? 'success' : 'warning'}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                    <Typography variant='caption'>
                      {proctoringStats.eyeTrackingStability}%
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 1 }}>
                    <Typography variant='caption'>Audio Level</Typography>
                    <LinearProgress
                      variant='determinate'
                      value={proctoringStats.audioLevel}
                      color='info'
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                    <Typography variant='caption'>{proctoringStats.audioLevel}%</Typography>
                  </Box>
                </Box>

                {/* Recent Alerts */}
                <Typography variant='subtitle2' gutterBottom>
                  Recent Alerts ({proctoringAlerts.length})
                </Typography>
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {proctoringAlerts.slice(-5).map(alert => (
                    <Alert
                      key={alert.id}
                      severity={getAlertColor(alert.severity)}
                      sx={{ mb: 1, fontSize: '0.75rem' }}
                    >
                      <Typography variant='caption'>{alert.message}</Typography>
                    </Alert>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Warning Dialog */}
        <Dialog open={warningDialogOpen} maxWidth='sm' fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color='error' />
            Monitoring Alert
          </DialogTitle>
          <DialogContent>
            {currentAlert && (
              <Box>
                <Alert severity={getAlertColor(currentAlert.severity)} sx={{ mb: 2 }}>
                  <Typography variant='body1' sx={{ fontWeight: 'bold' }}>
                    {currentAlert.message}
                  </Typography>
                  <Typography variant='body2'>
                    Category: {currentAlert.category} | Severity: {currentAlert.severity}
                  </Typography>
                </Alert>

                <Typography variant='body2' color='text.secondary'>
                  This incident has been recorded and will be reviewed. Please ensure you follow all
                  assessment guidelines to maintain academic integrity.
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleWarningAcknowledge} variant='contained'>
              I Understand
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Card>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          <SuccessIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant='h4' component='h1' gutterBottom>
            Assessment Complete
          </Typography>
          <Typography variant='body1' sx={{ mb: 3 }}>
            Your responses have been submitted successfully. The AI monitoring report will be
            reviewed by your instructor.
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6 }} component='div'>
              <Typography variant='h6'>{proctoringStats.integrityScore}%</Typography>
              <Typography variant='caption'>Integrity Score</Typography>
            </Grid>
            <Grid size={{ xs: 6 }} component='div'>
              <Typography variant='h6'>{proctoringStats.totalViolations}</Typography>
              <Typography variant='caption'>Total Alerts</Typography>
            </Grid>
          </Grid>

          <Button variant='contained' size='large'>
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AIProctoredAssessmentPage;
