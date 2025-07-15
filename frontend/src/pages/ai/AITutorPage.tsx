import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Send as SendIcon,
  Psychology as AIIcon,
  School as SchoolIcon,
  AutoAwesome as MagicIcon,
} from '@mui/icons-material';
import { SUBJECTS, EDUCATION_LEVELS } from '@/utils/constants';
import { aiService } from '@/services/ai';
import { AIResponse } from '@/types/index';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  metadata?: any;
}

const AITutorPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI Tutor. I\'m here to help you learn and understand any topic. What would you like to explore today?',
      timestamp: new Date(),
    },
  ]);
  const [prompt, setPrompt] = useState('');
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState('');
  const [language, setLanguage] = useState('english');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (!prompt.trim()) return;

    const userMessage: ChatMessage = {
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
      const response = await aiService.askTutor(prompt, {
        subject: subject || undefined,
        level: level || undefined,
        language: language || undefined,
      });

      if (response.success) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: response.data.content,
          timestamp: new Date(),
          metadata: response.data.metadata,
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        setError('Failed to get response from AI tutor. Please try again.');
      }
    } catch (err) {
      console.error('AI Tutor error:', err);
      setError('An error occurred while communicating with the AI tutor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = [
    'Explain photosynthesis in simple terms',
    'Help me solve quadratic equations',
    'What is the difference between mitosis and meiosis?',
    'How do I calculate derivatives?',
    'Explain Newton\'s laws of motion',
    'What are the causes of World War I?',
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
          AI Tutor 🧠
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Get personalized explanations and step-by-step guidance from your AI tutor
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Chat Interface */}
        <Grid item xs={12} lg={8}>
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
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    mb: 2,
                    justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  {message.type === 'ai' && (
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 1, mt: 0.5 }}>
                      <AIIcon />
                    </Avatar>
                  )}
                  
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      maxWidth: '70%',
                      backgroundColor: message.type === 'user' ? 'primary.main' : 'background.paper',
                      color: message.type === 'user' ? 'primary.contrastText' : 'text.primary',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.content}
                    </Typography>
                    <Typography
                      variant="caption"
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
                    <Avatar sx={{ bgcolor: 'grey.400', ml: 1, mt: 0.5 }}>
                      👤
                    </Avatar>
                  )}
                </Box>
              ))}

              {isLoading && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                    <AIIcon />
                  </Avatar>
                  <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    <Typography variant="body2">AI is thinking...</Typography>
                  </Paper>
                </Box>
              )}
            </Box>

            <Divider />

            {/* Input Area */}
            <Box sx={{ p: 2 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask your AI tutor anything..."
                  disabled={isLoading}
                />
                <Button
                  variant="contained"
                  onClick={handleSendMessage}
                  disabled={!prompt.trim() || isLoading}
                  sx={{ px: 3 }}
                >
                  <SendIcon />
                </Button>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Sidebar with Options */}
        <Grid item xs={12} lg={4}>
          {/* Settings */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Tutor Settings
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  label="Subject"
                >
                  <MenuItem value="">All Subjects</MenuItem>
                  {SUBJECTS.map((subj) => (
                    <MenuItem key={subj} value={subj.toLowerCase()}>
                      {subj}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Education Level</InputLabel>
                <Select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  label="Education Level"
                >
                  <MenuItem value="">Any Level</MenuItem>
                  {EDUCATION_LEVELS.map((lvl) => (
                    <MenuItem key={lvl} value={lvl.toLowerCase()}>
                      {lvl}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  label="Language"
                >
                  <MenuItem value="english">English</MenuItem>
                  <MenuItem value="hindi">Hindi</MenuItem>
                  <MenuItem value="mixed">Mixed (English + Hindi)</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>

          {/* Quick Prompts */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Quick Questions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Try these example questions to get started
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {quickPrompts.map((quickPrompt, index) => (
                  <Chip
                    key={index}
                    label={quickPrompt}
                    onClick={() => setPrompt(quickPrompt)}
                    clickable
                    variant="outlined"
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

          {/* Features */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                AI Tutor Features
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SchoolIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Personalized explanations
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MagicIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Step-by-step problem solving
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AIIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Adaptive learning approach
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AITutorPage;