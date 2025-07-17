import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  VolumeUp as SpeakIcon,
  Settings as SettingsIcon,
  Stop as StopIcon,
  Accessibility as AccessibilityIcon,
} from '@mui/icons-material';

interface VoiceInterfaceProps {
  onVoiceInput?: (text: string) => void;
  textToSpeak?: string;
  isEnabled?: boolean;
  showSettings?: boolean;
}

interface VoiceSettings {
  language: string;
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
  autoSpeak: boolean;
  continuousListening: boolean;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  onVoiceInput,
  textToSpeak,
  isEnabled = true,
  showSettings = true,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [supportsSpeechRecognition, setSupportsSpeechRecognition] = useState(false);
  const [supportsSpeechSynthesis, setSupportsSpeechSynthesis] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const [settings, setSettings] = useState<VoiceSettings>({
    language: 'en-US',
    voice: '',
    rate: 1,
    pitch: 1,
    volume: 1,
    autoSpeak: false,
    continuousListening: false,
  });

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSupportsSpeechRecognition(true);
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = settings.language;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (settings.continuousListening && isEnabled) {
          setTimeout(() => {
            try {
              recognition.start();
            } catch (error) {
              console.warn('Failed to restart continuous listening:', error);
            }
          }, 1000);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        let lastConfidence = 0;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;

          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            lastConfidence = confidence;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
        setConfidence(lastConfidence);

        if (finalTranscript && onVoiceInput) {
          onVoiceInput(finalTranscript);
          setTranscript('');
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [settings.language, settings.continuousListening, onVoiceInput, isEnabled]);

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSupportsSpeechSynthesis(true);

      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        setAvailableVoices(voices);

        if (voices.length > 0 && !settings.voice) {
          const defaultVoice = voices.find(voice => voice.lang === settings.language) || voices[0];
          setSettings(prev => ({ ...prev, voice: defaultVoice.name }));
        }
      };

      loadVoices();
      speechSynthesis.addEventListener('voiceschanged', loadVoices);

      return () => {
        speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, [settings.language, settings.voice]);

  // Auto-speak when text changes
  useEffect(() => {
    if (settings.autoSpeak && textToSpeak && supportsSpeechSynthesis) {
      speak(textToSpeak);
    }
  }, [textToSpeak, settings.autoSpeak, supportsSpeechSynthesis]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speak = (text: string) => {
    if (!supportsSpeechSynthesis || !text) return;

    // Stop any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = availableVoices.find(voice => voice.name === settings.voice);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthesisRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSettingsChange = (key: keyof VoiceSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!isEnabled || (!supportsSpeechRecognition && !supportsSpeechSynthesis)) {
    return null;
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Voice Input */}
        {supportsSpeechRecognition && (
          <Tooltip title={isListening ? 'Stop listening' : 'Start voice input'}>
            <IconButton
              onClick={toggleListening}
              color={isListening ? 'error' : 'primary'}
              sx={{
                bgcolor: isListening ? 'error.light' : 'primary.light',
                '&:hover': {
                  bgcolor: isListening ? 'error.main' : 'primary.main',
                  color: 'white',
                },
              }}
            >
              {isListening ? <MicOffIcon /> : <MicIcon />}
            </IconButton>
          </Tooltip>
        )}

        {/* Text-to-Speech */}
        {supportsSpeechSynthesis && textToSpeak && (
          <Tooltip title={isSpeaking ? 'Stop speaking' : 'Read aloud'}>
            <IconButton
              onClick={() => (isSpeaking ? stopSpeaking() : speak(textToSpeak))}
              color={isSpeaking ? 'error' : 'secondary'}
              sx={{
                bgcolor: isSpeaking ? 'error.light' : 'secondary.light',
                '&:hover': {
                  bgcolor: isSpeaking ? 'error.main' : 'secondary.main',
                  color: 'white',
                },
              }}
            >
              {isSpeaking ? <StopIcon /> : <SpeakIcon />}
            </IconButton>
          </Tooltip>
        )}

        {/* Settings */}
        {showSettings && (
          <Tooltip title='Voice settings'>
            <IconButton onClick={() => setIsSettingsOpen(true)}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        )}

        {/* Accessibility Indicator */}
        <Chip
          icon={<AccessibilityIcon />}
          label='Voice Enabled'
          size='small'
          color='primary'
          variant='outlined'
        />
      </Box>

      {/* Real-time Transcript Display */}
      {isListening && transcript && (
        <Card sx={{ position: 'absolute', top: '100%', left: 0, right: 0, mt: 1, zIndex: 1000 }}>
          <CardContent sx={{ py: 1 }}>
            <Typography variant='caption' color='text.secondary'>
              Listening... (Confidence: {Math.round(confidence * 100)}%)
            </Typography>
            <Typography variant='body2' sx={{ fontStyle: 'italic' }}>
              "{transcript}"
            </Typography>
            {confidence > 0 && (
              <LinearProgress
                variant='determinate'
                value={confidence * 100}
                sx={{ mt: 1, height: 4, borderRadius: 2 }}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Settings Dialog */}
      <Dialog
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessibilityIcon />
          Voice Interface Settings
        </DialogTitle>

        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Language Selection */}
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={settings.language}
                label='Language'
                onChange={e => handleSettingsChange('language', e.target.value)}
              >
                <MenuItem value='en-US'>English (US)</MenuItem>
                <MenuItem value='en-GB'>English (UK)</MenuItem>
                <MenuItem value='es-ES'>Spanish</MenuItem>
                <MenuItem value='fr-FR'>French</MenuItem>
                <MenuItem value='de-DE'>German</MenuItem>
                <MenuItem value='hi-IN'>Hindi</MenuItem>
                <MenuItem value='zh-CN'>Chinese (Simplified)</MenuItem>
              </Select>
            </FormControl>

            {/* Voice Selection */}
            {supportsSpeechSynthesis && availableVoices.length > 0 && (
              <FormControl fullWidth>
                <InputLabel>Voice</InputLabel>
                <Select
                  value={settings.voice}
                  label='Voice'
                  onChange={e => handleSettingsChange('voice', e.target.value)}
                >
                  {availableVoices
                    .filter(voice => voice.lang.startsWith(settings.language.split('-')[0]))
                    .map(voice => (
                      <MenuItem key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}

            {/* Speech Rate */}
            <Box>
              <Typography gutterBottom>Speech Rate</Typography>
              <Slider
                value={settings.rate}
                onChange={(_, value) => handleSettingsChange('rate', value)}
                min={0.5}
                max={2}
                step={0.1}
                marks={[
                  { value: 0.5, label: 'Slow' },
                  { value: 1, label: 'Normal' },
                  { value: 2, label: 'Fast' },
                ]}
                valueLabelDisplay='auto'
              />
            </Box>

            {/* Pitch */}
            <Box>
              <Typography gutterBottom>Pitch</Typography>
              <Slider
                value={settings.pitch}
                onChange={(_, value) => handleSettingsChange('pitch', value)}
                min={0.5}
                max={2}
                step={0.1}
                marks={[
                  { value: 0.5, label: 'Low' },
                  { value: 1, label: 'Normal' },
                  { value: 2, label: 'High' },
                ]}
                valueLabelDisplay='auto'
              />
            </Box>

            {/* Volume */}
            <Box>
              <Typography gutterBottom>Volume</Typography>
              <Slider
                value={settings.volume}
                onChange={(_, value) => handleSettingsChange('volume', value)}
                min={0}
                max={1}
                step={0.1}
                marks={[
                  { value: 0, label: 'Mute' },
                  { value: 0.5, label: '50%' },
                  { value: 1, label: '100%' },
                ]}
                valueLabelDisplay='auto'
              />
            </Box>

            {/* Options */}
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoSpeak}
                    onChange={e => handleSettingsChange('autoSpeak', e.target.checked)}
                  />
                }
                label='Auto-speak new content'
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.continuousListening}
                    onChange={e => handleSettingsChange('continuousListening', e.target.checked)}
                  />
                }
                label='Continuous listening'
              />
            </Box>

            {/* Feature Support Status */}
            <Box>
              <Typography variant='subtitle2' gutterBottom>
                Browser Support
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label='Speech Recognition'
                  color={supportsSpeechRecognition ? 'success' : 'error'}
                  size='small'
                />
                <Chip
                  label='Text-to-Speech'
                  color={supportsSpeechSynthesis ? 'success' : 'error'}
                  size='small'
                />
              </Box>
            </Box>

            {/* Accessibility Tips */}
            <Alert severity='info'>
              <Typography variant='subtitle2' sx={{ fontWeight: 'bold' }}>
                Accessibility Tips:
              </Typography>
              <Typography variant='body2' component='ul' sx={{ mt: 1, pl: 2 }}>
                <li>Use voice commands to navigate and interact</li>
                <li>Enable auto-speak for automatic content reading</li>
                <li>Adjust speech rate and pitch for comfort</li>
                <li>Use continuous listening for hands-free operation</li>
              </Typography>
            </Alert>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setIsSettingsOpen(false)}>Close</Button>
          <Button
            variant='contained'
            onClick={() => {
              // Test the current settings
              if (supportsSpeechSynthesis) {
                speak(
                  'Voice settings updated successfully. This is a test of your current voice configuration.'
                );
              }
            }}
          >
            Test Voice
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VoiceInterface;
