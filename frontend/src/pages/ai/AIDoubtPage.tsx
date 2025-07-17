import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import {
  Send as SendIcon,
  Help as HelpIcon,
  Lightbulb as LightbulbIcon,
  PhotoCamera as CameraIcon,
} from '@mui/icons-material';
import { SUBJECTS, EDUCATION_LEVELS } from '@/utils/constants';
import { aiService } from '@/services/ai';

interface DoubtMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  metadata?: any;
}

const AIDoubtPage: React.FC = () => {
  const [messages, setMessages] = useState<DoubtMessage[]>([
    {
      id: '1',
      type: 'ai',
      content:
        "Hi! I'm your AI Doubt Solver. I can help you with any academic questions or problems. What would you like help with today?",
      timestamp: new Date(),
    },
  ]);
  const [prompt, setPrompt] = useState('');
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendDoubt = async () => {
    if (!prompt.trim()) return;

    const userMessage: DoubtMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: prompt,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await aiService.solveDoubt(prompt, {
        subject: subject || undefined,
        level: level || undefined,
      });

      if (response.success) {
        const aiMessage: DoubtMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: response.data.content,
          timestamp: new Date(),
          metadata: response.data.metadata,
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        setError('Failed to get response from AI. Please try again.');
      }
    } catch (err) {
      console.error('AI Doubt Solver error:', err);
      setError('An error occurred while solving your doubt.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendDoubt();
    }
  };

  const commonDoubts = [
    'How do I solve quadratic equations?',
    'What is the difference between speed and velocity?',
    'Explain the process of photosynthesis',
    'How to find the derivative of a function?',
    'What are the laws of thermodynamics?',
    'How do chemical bonds form?',
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' component='h1' fontWeight={600} gutterBottom>
          AI Doubt Solver 💡
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Get instant help with your academic doubts and problems
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Chat Interface */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
            {/* Messages Area */}
            <Box
              sx={{
                flexGrow: 1,
                p: 2,
                overflowY: 'auto',
                maxHeight: '450px',
              }}
            >
              {messages.map(message => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    mb: 2,
                    justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  {message.type === 'ai' && (
                    <Avatar sx={{ bgcolor: 'success.main', mr: 1, mt: 0.5 }}>
                      <HelpIcon />
                    </Avatar>
                  )}

                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      maxWidth: '75%',
                      backgroundColor:
                        message.type === 'user' ? 'primary.main' : 'background.paper',
                      color: message.type === 'user' ? 'primary.contrastText' : 'text.primary',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant='body1' sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.content}
                    </Typography>
                    <Typography
                      variant='caption'
                      sx={{
                        display: 'block',
                        mt: 1,
                        opacity: 0.7,
                      }}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </Typography>
                  </Paper>

                  {message.type === 'user' && (
                    <Avatar sx={{ bgcolor: 'grey.400', ml: 1, mt: 0.5 }}>👤</Avatar>
                  )}
                </Box>
              ))}

              {isLoading && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 1 }}>
                    <HelpIcon />
                  </Avatar>
                  <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    <Typography variant='body2'>Solving your doubt...</Typography>
                  </Paper>
                </Box>
              )}
            </Box>

            <Divider />

            {/* Input Area */}
            <Box sx={{ p: 2 }}>
              {error && (
                <Alert severity='error' sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder='Ask your doubt here...'
                  disabled={isLoading}
                />
                <Button
                  variant='contained'
                  onClick={handleSendDoubt}
                  disabled={!prompt.trim() || isLoading}
                  sx={{ px: 3 }}
                >
                  <SendIcon />
                </Button>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant='outlined' size='small' startIcon={<CameraIcon />} disabled>
                  Upload Image
                </Button>
                <Typography variant='caption' color='text.secondary' sx={{ alignSelf: 'center' }}>
                  Image upload coming soon
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Sidebar with Options */}
        <Grid size={{ xs: 12, lg: 4 }}>
          {/* Settings */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant='h6' fontWeight={600} gutterBottom>
                Doubt Context
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Subject</InputLabel>
                <Select value={subject} onChange={e => setSubject(e.target.value)} label='Subject'>
                  <MenuItem value=''>All Subjects</MenuItem>
                  {SUBJECTS.map(subj => (
                    <MenuItem key={subj} value={subj.toLowerCase()}>
                      {subj}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Education Level</InputLabel>
                <Select
                  value={level}
                  onChange={e => setLevel(e.target.value)}
                  label='Education Level'
                >
                  <MenuItem value=''>Any Level</MenuItem>
                  {EDUCATION_LEVELS.map(lvl => (
                    <MenuItem key={lvl} value={lvl.toLowerCase()}>
                      {lvl}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>

          {/* Common Doubts */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant='h6' fontWeight={600} gutterBottom>
                Common Doubts
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                Click on any question to ask
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {commonDoubts.map((doubt, index) => (
                  <Chip
                    key={index}
                    label={doubt}
                    onClick={() => setPrompt(doubt)}
                    clickable
                    variant='outlined'
                    sx={{
                      justifyContent: 'flex-start',
                      height: 'auto',
                      py: 1,
                      px: 2,
                      '& .MuiChip-label': {
                        whiteSpace: 'normal',
                        textAlign: 'left',
                      },
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardContent>
              <Typography variant='h6' fontWeight={600} gutterBottom>
                Tips for Better Help
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <LightbulbIcon color='primary' sx={{ mr: 1, mt: 0.5, fontSize: 20 }} />
                  <Typography variant='body2'>
                    Be specific about what you don't understand
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <LightbulbIcon color='primary' sx={{ mr: 1, mt: 0.5, fontSize: 20 }} />
                  <Typography variant='body2'>
                    Mention your current level of understanding
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <LightbulbIcon color='primary' sx={{ mr: 1, mt: 0.5, fontSize: 20 }} />
                  <Typography variant='body2'>Ask follow-up questions for clarity</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <LightbulbIcon color='primary' sx={{ mr: 1, mt: 0.5, fontSize: 20 }} />
                  <Typography variant='body2'>Include relevant context or formulas</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AIDoubtPage;
