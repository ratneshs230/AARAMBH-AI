import React, { useState, useEffect, useRef } from 'react';
import Grid from '@mui/material/Grid';
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
  IconButton,
  Slider,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  Badge,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  ViewInAr as ARIcon,
  Vrpano as VRIcon,
  ThreeDRotation as ThreeDIcon,
  Visibility as EyeIcon,
  Settings as SettingsIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipNext as NextIcon,
  SkipPrevious as PrevIcon,
  RecordVoiceOver as NarratorIcon,
  Gesture as GestureIcon,
  CameraAlt as CameraIcon,
  Headset as HeadsetIcon,
  Psychology as BrainIcon,
  Science as ScienceIcon,
  Calculate as MathIcon,
  Language as LanguageIcon,
  History as HistoryIcon,
  Public as GeographyIcon,
} from '@mui/icons-material';

interface ARVRExperience {
  id: string;
  title: string;
  description: string;
  subject: string;
  type: 'AR' | 'VR' | '3D';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  thumbnail: string;
  tags: string[];
  prerequisites: string[];
  learningObjectives: string[];
  features: string[];
  hasVoiceNarration: boolean;
  hasInteractiveElements: boolean;
  supportsHandTracking: boolean;
  requiresVRHeadset: boolean;
}

interface VRSettings {
  quality: 'low' | 'medium' | 'high' | 'ultra';
  fieldOfView: number;
  movementSpeed: number;
  comfortSettings: boolean;
  snapTurning: boolean;
  voiceNarration: boolean;
  hapticFeedback: boolean;
  eyeTracking: boolean;
}

interface ARSettings {
  trackingMode: 'world' | 'image' | 'face' | 'hand';
  occlusion: boolean;
  lighting: boolean;
  shadows: boolean;
  scale: number;
  opacity: number;
}

const ARVRLearningPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [currentExperience, setCurrentExperience] = useState<ARVRExperience | null>(null);
  const [isImmersiveMode, setIsImmersiveMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [vrSupported, setVRSupported] = useState(false);
  const [arSupported, setARSupported] = useState(false);
  const [deviceCapabilities, setDeviceCapabilities] = useState({
    webXR: false,
    webAR: false,
    deviceMotion: false,
    deviceOrientation: false,
    gamepad: false,
  });

  const [vrSettings, setVRSettings] = useState<VRSettings>({
    quality: 'medium',
    fieldOfView: 90,
    movementSpeed: 1.0,
    comfortSettings: true,
    snapTurning: true,
    voiceNarration: true,
    hapticFeedback: true,
    eyeTracking: false,
  });

  const [arSettings, setARSettings] = useState<ARSettings>({
    trackingMode: 'world',
    occlusion: true,
    lighting: true,
    shadows: true,
    scale: 1.0,
    opacity: 1.0,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const experiences: ARVRExperience[] = [
    {
      id: '1',
      title: 'Solar System Exploration',
      description:
        'Journey through our solar system in immersive VR. Explore planets, moons, and space phenomena.',
      subject: 'Astronomy',
      type: 'VR',
      difficulty: 'beginner',
      duration: 25,
      thumbnail: '/images/solar-system-vr.jpg',
      tags: ['Space', 'Planets', 'Science', 'Exploration'],
      prerequisites: [],
      learningObjectives: [
        'Understand planetary characteristics',
        'Learn about space distances and scale',
        'Explore celestial mechanics',
      ],
      features: [
        '360° exploration',
        'Realistic physics',
        'Interactive UI',
        'Educational narration',
      ],
      hasVoiceNarration: true,
      hasInteractiveElements: true,
      supportsHandTracking: true,
      requiresVRHeadset: false,
    },
    {
      id: '2',
      title: 'Human Heart Anatomy',
      description:
        'Dissect and explore the human heart in 3D with AR overlay on real-world surfaces.',
      subject: 'Biology',
      type: 'AR',
      difficulty: 'intermediate',
      duration: 30,
      thumbnail: '/images/heart-anatomy-ar.jpg',
      tags: ['Anatomy', 'Medicine', 'Biology', 'Health'],
      prerequisites: ['Basic biology knowledge'],
      learningObjectives: [
        'Identify heart chambers and valves',
        'Understand blood circulation',
        'Learn cardiac cycle phases',
      ],
      features: ['3D manipulation', 'Layer-by-layer exploration', 'Real-time annotations'],
      hasVoiceNarration: true,
      hasInteractiveElements: true,
      supportsHandTracking: true,
      requiresVRHeadset: false,
    },
    {
      id: '3',
      title: 'Ancient Rome Virtual Tour',
      description:
        'Walk through ancient Rome as it was 2000 years ago. Experience history come alive.',
      subject: 'History',
      type: 'VR',
      difficulty: 'intermediate',
      duration: 45,
      thumbnail: '/images/ancient-rome-vr.jpg',
      tags: ['History', 'Ancient Civilizations', 'Architecture', 'Culture'],
      prerequisites: ['Roman history basics'],
      learningObjectives: [
        'Explore Roman architecture',
        'Understand daily life in ancient Rome',
        'Learn about Roman engineering',
      ],
      features: ['Photorealistic environments', 'Historical accuracy', 'Interactive NPCs'],
      hasVoiceNarration: true,
      hasInteractiveElements: true,
      supportsHandTracking: false,
      requiresVRHeadset: true,
    },
    {
      id: '4',
      title: 'Molecular Chemistry Lab',
      description: 'Manipulate molecules in 3D space and observe chemical reactions in real-time.',
      subject: 'Chemistry',
      type: '3D',
      difficulty: 'advanced',
      duration: 35,
      thumbnail: '/images/chemistry-3d.jpg',
      tags: ['Chemistry', 'Molecules', 'Reactions', 'Laboratory'],
      prerequisites: ['Chemistry fundamentals', 'Periodic table knowledge'],
      learningObjectives: [
        'Visualize molecular structures',
        'Understand chemical bonding',
        'Predict reaction outcomes',
      ],
      features: ['Molecular manipulation', 'Reaction simulation', 'Real-time feedback'],
      hasVoiceNarration: false,
      hasInteractiveElements: true,
      supportsHandTracking: true,
      requiresVRHeadset: false,
    },
    {
      id: '5',
      title: 'Mathematical Geometry Playground',
      description:
        'Explore geometric concepts in a virtual sandbox environment with AR visualization.',
      subject: 'Mathematics',
      type: 'AR',
      difficulty: 'beginner',
      duration: 20,
      thumbnail: '/images/geometry-ar.jpg',
      tags: ['Mathematics', 'Geometry', 'Shapes', 'Visualization'],
      prerequisites: [],
      learningObjectives: [
        'Understand 3D geometric shapes',
        'Learn geometric transformations',
        'Visualize mathematical concepts',
      ],
      features: ['Shape manipulation', 'Transformation tools', 'Measurement tools'],
      hasVoiceNarration: true,
      hasInteractiveElements: true,
      supportsHandTracking: true,
      requiresVRHeadset: false,
    },
  ];

  // Check device capabilities
  useEffect(() => {
    checkDeviceCapabilities();
  }, []);

  // Simulate progress for demo
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentExperience) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 1;
          if (newProgress >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return newProgress;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentExperience]);

  const checkDeviceCapabilities = async () => {
    // Check WebXR support
    if ('xr' in navigator) {
      try {
        const isVRSupported = await (navigator as any).xr.isSessionSupported('immersive-vr');
        const isARSupported = await (navigator as any).xr.isSessionSupported('immersive-ar');
        setVRSupported(isVRSupported);
        setARSupported(isARSupported);
        setDeviceCapabilities(prev => ({ ...prev, webXR: true, webAR: isARSupported }));
      } catch (error) {
        console.log('WebXR not fully supported');
      }
    }

    // Check device motion/orientation
    setDeviceCapabilities(prev => ({
      ...prev,
      deviceMotion: 'DeviceMotionEvent' in window,
      deviceOrientation: 'DeviceOrientationEvent' in window,
      gamepad: 'getGamepads' in navigator,
    }));
  };

  const startExperience = (experience: ARVRExperience) => {
    setCurrentExperience(experience);
    setProgress(0);
    setIsImmersiveMode(true);
    setIsPlaying(true);

    // Initialize 3D scene (mock implementation)
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Simple gradient background to simulate 3D environment
        const gradient = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          0,
          canvas.width / 2,
          canvas.height / 2,
          canvas.width / 2
        );
        gradient.addColorStop(0, '#1e3c72');
        gradient.addColorStop(1, '#2a5298');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add some "3D" elements
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(experience.title, canvas.width / 2, canvas.height / 2);
        ctx.font = '16px Arial';
        ctx.fillText('Immersive Experience Loading...', canvas.width / 2, canvas.height / 2 + 40);
      }
    }
  };

  const exitExperience = () => {
    setCurrentExperience(null);
    setIsImmersiveMode(false);
    setIsPlaying(false);
    setProgress(0);
    setIsFullscreen(false);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const getSubjectIcon = (subject: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      Astronomy: <GeographyIcon />, // Changed from PublicIcon to GeographyIcon
      Biology: <ScienceIcon />,
      History: <HistoryIcon />,
      Chemistry: <ScienceIcon />,
      Mathematics: <MathIcon />,
      Geography: <GeographyIcon />,
      Language: <LanguageIcon />,
    };
    return icons[subject] || <BrainIcon />;
  };

  const getDifficultyColor = (difficulty: string): 'success' | 'warning' | 'error' | 'default' => {
    const colors = {
      beginner: 'success' as const,
      intermediate: 'warning' as const,
      advanced: 'error' as const,
    };
    return colors[difficulty as keyof typeof colors] || 'default';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      AR: <ARIcon />,
      VR: <VRIcon />,
      '3D': <ThreeDIcon />,
    };
    return icons[type as keyof typeof icons] || <ThreeDIcon />;
  };

  if (isImmersiveMode && currentExperience) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'black',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Immersive Header */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            right: 16,
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              icon={getTypeIcon(currentExperience.type)}
              label={currentExperience.type}
              color='primary'
              sx={{ color: 'white', bgcolor: 'rgba(25, 118, 210, 0.8)' }}
            />
            <Typography variant='h6' sx={{ color: 'white', fontWeight: 'bold' }}>
              {currentExperience.title}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={() => setSettingsOpen(true)} sx={{ color: 'white' }}>
              <SettingsIcon />
            </IconButton>
            <IconButton onClick={toggleFullscreen} sx={{ color: 'white' }}>
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
            <Button
              variant='outlined'
              onClick={exitExperience}
              sx={{ color: 'white', borderColor: 'white' }}
            >
              Exit
            </Button>
          </Box>
        </Box>

        {/* Main 3D Canvas */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={window.innerWidth}
            height={window.innerHeight}
            style={{ width: '100%', height: '100%' }}
          />

          {/* AR/VR Overlay Elements */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 100,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              bg: 'rgba(0,0,0,0.7)',
              p: 2,
              borderRadius: 2,
            }}
          >
            <IconButton onClick={togglePlayPause} sx={{ color: 'white' }}>
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </IconButton>
            <IconButton sx={{ color: 'white' }}>
              <PrevIcon />
            </IconButton>
            <IconButton sx={{ color: 'white' }}>
              <NextIcon />
            </IconButton>
            {currentExperience.hasVoiceNarration && (
              <IconButton sx={{ color: 'white' }}>
                <NarratorIcon />
              </IconButton>
            )}
            {currentExperience.supportsHandTracking && (
              <IconButton sx={{ color: 'white' }}>
                <GestureIcon />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Progress Bar */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            bgcolor: 'rgba(0,0,0,0.7)',
            p: 2,
            borderRadius: 1,
          }}
        >
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}
          >
            <Typography variant='body2' sx={{ color: 'white' }}>
              Progress: {Math.round(progress)}%
            </Typography>
            <Typography variant='body2' sx={{ color: 'white' }}>
              {Math.round((progress * currentExperience.duration) / 100)} /{' '}
              {currentExperience.duration} min
            </Typography>
          </Box>
          <LinearProgress
            variant='determinate'
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              '& .MuiLinearProgress-bar': { bgcolor: 'primary.main' },
            }}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant='h4' component='h1' sx={{ fontWeight: 'bold' }}>
          AR/VR Learning Experiences
        </Typography>
        <Button
          variant='outlined'
          startIcon={<SettingsIcon />}
          onClick={() => setSettingsOpen(true)}
        >
          Configure Devices
        </Button>
      </Box>

      {/* Device Capability Status */}
      <Alert severity='info' sx={{ mb: 3 }}>
        <Typography variant='subtitle2' sx={{ fontWeight: 'bold', mb: 1 }}>
          Device Capabilities:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label='WebXR VR'
            color={vrSupported ? 'success' : 'error'}
            size='small'
            icon={<VRIcon />}
          />
          <Chip
            label='WebXR AR'
            color={arSupported ? 'success' : 'error'}
            size='small'
            icon={<ARIcon />}
          />
          <Chip
            label='Device Motion'
            color={deviceCapabilities.deviceMotion ? 'success' : 'error'}
            size='small'
          />
          <Chip
            label='Gamepad'
            color={deviceCapabilities.gamepad ? 'success' : 'error'}
            size='small'
          />
        </Box>
      </Alert>

      {/* Experience Categories */}
      <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)} sx={{ mb: 3 }}>
        <Tab label='All Experiences' />
        <Tab label='VR Experiences' />
        <Tab label='AR Experiences' />
        <Tab label='3D Interactive' />
      </Tabs>

      {/* Experience Grid */}
      <Grid container spacing={3}>
        {experiences
          .filter(exp => {
            if (selectedTab === 0) return true;
            if (selectedTab === 1) return exp.type === 'VR';
            if (selectedTab === 2) return exp.type === 'AR';
            if (selectedTab === 3) return exp.type === '3D';
            return true;
          })
          .map(experience => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={experience.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Thumbnail */}
                <Box
                  sx={{
                    height: 200,
                    bgcolor: 'linear-gradient(45deg, #1e3c72 0%, #2a5298 100%)',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {getTypeIcon(experience.type)}
                  <Typography
                    variant='h1'
                    sx={{
                      fontSize: '4rem',
                      color: 'rgba(255,255,255,0.3)',
                      position: 'absolute',
                    }}
                  >
                    {getTypeIcon(experience.type)}
                  </Typography>

                  {/* Badges */}
                  <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
                    <Chip
                      label={experience.type}
                      color='primary'
                      size='small'
                      icon={getTypeIcon(experience.type)}
                    />
                  </Box>

                  <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <Chip
                      label={experience.difficulty}
                      color={getDifficultyColor(experience.difficulty)}
                      size='small'
                    />
                  </Box>

                  {experience.requiresVRHeadset && (
                    <Box sx={{ position: 'absolute', bottom: 8, right: 8 }}>
                      <Tooltip title='Requires VR Headset'>
                        <HeadsetIcon sx={{ color: 'white' }} />
                      </Tooltip>
                    </Box>
                  )}
                </Box>

                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {getSubjectIcon(experience.subject)}
                    <Typography variant='h6' component='h2' sx={{ fontWeight: 'bold' }}>
                      {experience.title}
                    </Typography>
                  </Box>

                  <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                    {experience.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={experience.subject}
                      color='primary'
                      size='small'
                      variant='outlined'
                    />
                    <Chip label={`${experience.duration} min`} size='small' />
                  </Box>

                  {/* Features */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant='caption' color='text.secondary'>
                      Features:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                      {experience.hasVoiceNarration && (
                        <Chip
                          icon={<NarratorIcon />}
                          label='Voice'
                          size='small'
                          variant='outlined'
                        />
                      )}
                      {experience.hasInteractiveElements && (
                        <Chip
                          icon={<GestureIcon />}
                          label='Interactive'
                          size='small'
                          variant='outlined'
                        />
                      )}
                      {experience.supportsHandTracking && (
                        <Chip
                          icon={<GestureIcon />}
                          label='Hand Tracking'
                          size='small'
                          variant='outlined'
                        />
                      )}
                    </Box>
                  </Box>

                  <Button
                    fullWidth
                    variant='contained'
                    onClick={() => startExperience(experience)}
                    startIcon={<PlayIcon />}
                    disabled={experience.requiresVRHeadset && !vrSupported}
                  >
                    {experience.requiresVRHeadset && !vrSupported
                      ? 'VR Headset Required'
                      : 'Start Experience'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle>AR/VR Settings</DialogTitle>
        <DialogContent>
          <Tabs value={0} sx={{ mb: 2 }}>
            <Tab label='VR Settings' />
            <Tab label='AR Settings' />
            <Tab label='Device Info' />
          </Tabs>

          {/* VR Settings */}
          <Box sx={{ mb: 3 }}>
            <Typography variant='h6' gutterBottom>
              VR Configuration
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Quality</InputLabel>
              <Select
                value={vrSettings.quality}
                label='Quality'
                onChange={e => setVRSettings(prev => ({ ...prev, quality: e.target.value as any }))}
              >
                <MenuItem value='low'>Low (Better Performance)</MenuItem>
                <MenuItem value='medium'>Medium</MenuItem>
                <MenuItem value='high'>High</MenuItem>
                <MenuItem value='ultra'>Ultra (Best Quality)</MenuItem>
              </Select>
            </FormControl>

            <Typography gutterBottom>Field of View: {vrSettings.fieldOfView}°</Typography>
            <Slider
              value={vrSettings.fieldOfView}
              onChange={(_, value) =>
                setVRSettings(prev => ({ ...prev, fieldOfView: value as number }))
              }
              min={60}
              max={120}
              step={5}
              marks={[
                { value: 70, label: '70°' },
                { value: 90, label: '90°' },
                { value: 110, label: '110°' },
              ]}
              sx={{ mb: 2 }}
            />

            <Typography gutterBottom>Movement Speed: {vrSettings.movementSpeed}x</Typography>
            <Slider
              value={vrSettings.movementSpeed}
              onChange={(_, value) =>
                setVRSettings(prev => ({ ...prev, movementSpeed: value as number }))
              }
              min={0.1}
              max={3.0}
              step={0.1}
              marks={[
                { value: 0.5, label: 'Slow' },
                { value: 1.0, label: 'Normal' },
                { value: 2.0, label: 'Fast' },
              ]}
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={vrSettings.comfortSettings}
                  onChange={e =>
                    setVRSettings(prev => ({ ...prev, comfortSettings: e.target.checked }))
                  }
                />
              }
              label='Comfort Settings (Reduce Motion Sickness)'
            />

            <FormControlLabel
              control={
                <Switch
                  checked={vrSettings.snapTurning}
                  onChange={e =>
                    setVRSettings(prev => ({ ...prev, snapTurning: e.target.checked }))
                  }
                />
              }
              label='Snap Turning'
            />

            <FormControlLabel
              control={
                <Switch
                  checked={vrSettings.voiceNarration}
                  onChange={e =>
                    setVRSettings(prev => ({ ...prev, voiceNarration: e.target.checked }))
                  }
                />
              }
              label='Voice Narration'
            />
          </Box>

          {/* AR Settings */}
          <Box sx={{ mb: 3 }}>
            <Typography variant='h6' gutterBottom>
              AR Configuration
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Tracking Mode</InputLabel>
              <Select
                value={arSettings.trackingMode}
                label='Tracking Mode'
                onChange={e =>
                  setARSettings(prev => ({ ...prev, trackingMode: e.target.value as any }))
                }
              >
                <MenuItem value='world'>World Tracking</MenuItem>
                <MenuItem value='image'>Image Tracking</MenuItem>
                <MenuItem value='face'>Face Tracking</MenuItem>
                <MenuItem value='hand'>Hand Tracking</MenuItem>
              </Select>
            </FormControl>

            <Typography gutterBottom>Scale: {arSettings.scale}x</Typography>
            <Slider
              value={arSettings.scale}
              onChange={(_, value) => setARSettings(prev => ({ ...prev, scale: value as number }))}
              min={0.1}
              max={5.0}
              step={0.1}
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={arSettings.occlusion}
                  onChange={e => setARSettings(prev => ({ ...prev, occlusion: e.target.checked }))}
                />
              }
              label='Occlusion (Objects behind real world)'
            />

            <FormControlLabel
              control={
                <Switch
                  checked={arSettings.lighting}
                  onChange={e => setARSettings(prev => ({ ...prev, lighting: e.target.checked }))}
                />
              }
              label='Environmental Lighting'
            />
          </Box>

          {/* Device Information */}
          <Box>
            <Typography variant='h6' gutterBottom>
              Device Information
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <VRIcon color={vrSupported ? 'success' : 'error'} />
                </ListItemIcon>
                <ListItemText
                  primary='VR Support'
                  secondary={vrSupported ? 'WebXR VR available' : 'VR not supported'}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ARIcon color={arSupported ? 'success' : 'error'} />
                </ListItemIcon>
                <ListItemText
                  primary='AR Support'
                  secondary={arSupported ? 'WebXR AR available' : 'AR not supported'}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <GestureIcon color={deviceCapabilities.deviceMotion ? 'success' : 'error'} />
                </ListItemIcon>
                <ListItemText
                  primary='Motion Sensors'
                  secondary={deviceCapabilities.deviceMotion ? 'Available' : 'Not available'}
                />
              </ListItem>
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Close</Button>
          <Button variant='contained'>Save Settings</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Mock HandIcon component
const HandIcon = () => <GestureIcon />;

export default ARVRLearningPage;
