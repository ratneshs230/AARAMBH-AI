import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Create as CreateIcon,
  ExpandMore as ExpandMoreIcon,
  AutoAwesome as MagicIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { SUBJECTS, EDUCATION_LEVELS } from '@/utils/constants';
import { aiService } from '@/services/ai';

const AIContentPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState('');
  const [contentType, setContentType] = useState('lesson');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);

  const handleGenerateContent = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    try {
      const response = await aiService.createContent(prompt, {
        subject: subject || undefined,
        level: level || undefined,
        contentType: contentType || undefined,
      });

      if (response.success) {
        setGeneratedContent(response.data.content);
      } else {
        setError('Failed to generate content. Please try again.');
      }
    } catch (err) {
      console.error('AI Content error:', err);
      setError('An error occurred while generating content.');
    } finally {
      setIsLoading(false);
    }
  };

  const contentTemplates = [
    {
      title: 'Interactive Lesson',
      description: 'Create engaging lessons with activities',
      prompt:
        'Create an interactive lesson about [topic] with learning objectives, explanations, and practice activities',
    },
    {
      title: 'Study Notes',
      description: 'Generate comprehensive study notes',
      prompt:
        'Create detailed study notes covering all important concepts of [topic] with key points and examples',
    },
    {
      title: 'Practice Worksheets',
      description: 'Design practice exercises',
      prompt:
        'Design a practice worksheet for [topic] with various types of questions and detailed solutions',
    },
    {
      title: 'Lab Experiment',
      description: 'Create hands-on experiments',
      prompt:
        'Design a lab experiment to demonstrate [concept] with materials, procedure, and expected results',
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' component='h1' fontWeight={600} gutterBottom>
          AI Content Creator ✨
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Generate educational content, lessons, and study materials with AI
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Content Generation Form */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent>
              <Typography variant='h6' fontWeight={600} gutterBottom>
                Content Generator
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={4}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder='Describe the content you want to create...'
                label='Content Description'
                sx={{ mb: 3 }}
              />

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

              <FormControl fullWidth sx={{ mb: 2 }}>
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

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Content Type</InputLabel>
                <Select
                  value={contentType}
                  onChange={e => setContentType(e.target.value)}
                  label='Content Type'
                >
                  <MenuItem value='lesson'>Lesson</MenuItem>
                  <MenuItem value='notes'>Study Notes</MenuItem>
                  <MenuItem value='worksheet'>Worksheet</MenuItem>
                  <MenuItem value='activity'>Activity</MenuItem>
                  <MenuItem value='explanation'>Explanation</MenuItem>
                  <MenuItem value='example'>Example</MenuItem>
                </Select>
              </FormControl>

              <Button
                fullWidth
                variant='contained'
                onClick={handleGenerateContent}
                disabled={!prompt.trim() || isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : <CreateIcon />}
                size='large'
              >
                {isLoading ? 'Generating...' : 'Generate Content'}
              </Button>
            </CardContent>
          </Card>

          {/* Templates */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant='h6' fontWeight={600} gutterBottom>
                Quick Templates
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                Use these templates to get started quickly
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {contentTemplates.map((template, index) => (
                  <Chip
                    key={index}
                    label={template.title}
                    onClick={() => setPrompt(template.prompt)}
                    clickable
                    variant='outlined'
                    icon={<MagicIcon />}
                    sx={{
                      justifyContent: 'flex-start',
                      height: 'auto',
                      py: 1,
                      px: 2,
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Generated Content Display */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ minHeight: '600px' }}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant='h6' fontWeight={600}>
                  Generated Content
                </Typography>
                {generatedContent && (
                  <Button
                    variant='outlined'
                    startIcon={<DownloadIcon />}
                    onClick={() => {
                      const blob = new Blob([generatedContent], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'generated-content.txt';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Download
                  </Button>
                )}
              </Box>

              {error && (
                <Alert severity='error' sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {isLoading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                  <CircularProgress size={60} sx={{ mb: 2 }} />
                  <Typography variant='h6' color='text.secondary'>
                    Creating your content...
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    This may take a few moments
                  </Typography>
                </Box>
              ) : generatedContent ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    backgroundColor: 'grey.50',
                    border: '1px solid',
                    borderColor: 'grey.200',
                    borderRadius: 2,
                    maxHeight: '500px',
                    overflow: 'auto',
                  }}
                >
                  <Typography
                    variant='body1'
                    sx={{
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.8,
                      fontFamily: 'monospace',
                    }}
                  >
                    {generatedContent}
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <CreateIcon sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
                  <Typography variant='h6' color='text.secondary' gutterBottom>
                    No content generated yet
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Describe what you want to create and click "Generate Content"
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Help & Examples */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant='h6' fontWeight={600} gutterBottom>
                Content Creation Examples
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography fontWeight={600}>Lesson Plans</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant='body2'>
                        "Create a comprehensive lesson plan on photosynthesis for Class 10 students
                        with learning objectives, explanations, diagrams, and activities"
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography fontWeight={600}>Study Materials</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant='body2'>
                        "Generate detailed study notes for quadratic equations with step-by-step
                        solutions, formulas, and practice problems"
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography fontWeight={600}>Interactive Activities</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant='body2'>
                        "Design an interactive activity to teach the periodic table with games,
                        mnemonics, and hands-on experiments"
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AIContentPage;
