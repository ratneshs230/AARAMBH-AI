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
  Slider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Quiz as QuizIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import { SUBJECTS, EDUCATION_LEVELS } from '@/utils/constants';
import { aiService } from '@/services/ai';

const AIAssessmentPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState('');
  const [assessmentType, setAssessmentType] = useState('quiz');
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  const [includeAnswers, setIncludeAnswers] = useState(true);
  const [timeLimit, setTimeLimit] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedAssessment, setGeneratedAssessment] = useState<string | null>(null);

  const handleGenerateAssessment = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setGeneratedAssessment(null);

    const enhancedPrompt = `${prompt}. Create ${questionCount} ${difficulty} difficulty questions. ${includeAnswers ? 'Include detailed answers and explanations.' : 'Questions only, no answers.'} Format as a ${assessmentType} with ${timeLimit} minutes time limit.`;

    try {
      const response = await aiService.createAssessment(enhancedPrompt, {
        subject: subject || undefined,
        level: level || undefined,
        assessmentType: assessmentType || undefined,
      });

      if (response.success) {
        setGeneratedAssessment(response.data.content);
      } else {
        setError('Failed to generate assessment. Please try again.');
      }
    } catch (err) {
      console.error('AI Assessment error:', err);
      setError('An error occurred while generating assessment.');
    } finally {
      setIsLoading(false);
    }
  };

  const assessmentTemplates = [
    {
      title: 'Chapter Test',
      prompt: 'Create a comprehensive test covering all key concepts from [chapter/topic]',
      type: 'test',
    },
    {
      title: 'Quick Quiz',
      prompt: 'Generate a quick quiz to assess understanding of [topic]',
      type: 'quiz',
    },
    {
      title: 'Practice Questions',
      prompt: 'Create practice questions for [exam/topic] preparation',
      type: 'practice',
    },
    {
      title: 'Assignment',
      prompt: 'Design a take-home assignment on [topic] with analytical questions',
      type: 'assignment',
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
          AI Assessment Generator 📝
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create quizzes, tests, and assessments tailored to your curriculum
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Assessment Configuration */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Assessment Builder
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the assessment topic..."
                label="Assessment Topic"
                sx={{ mb: 3 }}
              />

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

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Assessment Type</InputLabel>
                <Select
                  value={assessmentType}
                  onChange={(e) => setAssessmentType(e.target.value)}
                  label="Assessment Type"
                >
                  <MenuItem value="quiz">Quiz</MenuItem>
                  <MenuItem value="test">Test</MenuItem>
                  <MenuItem value="assignment">Assignment</MenuItem>
                  <MenuItem value="practice">Practice</MenuItem>
                </Select>
              </FormControl>

              <Typography gutterBottom>Number of Questions: {questionCount}</Typography>
              <Slider
                value={questionCount}
                onChange={(_, value) => setQuestionCount(value as number)}
                min={5}
                max={50}
                step={5}
                marks
                sx={{ mb: 3 }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Difficulty Level</InputLabel>
                <Select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  label="Difficulty Level"
                >
                  <MenuItem value="easy">Easy</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="hard">Hard</MenuItem>
                  <MenuItem value="mixed">Mixed</MenuItem>
                </Select>
              </FormControl>

              <Typography gutterBottom>Time Limit (minutes): {timeLimit}</Typography>
              <Slider
                value={timeLimit}
                onChange={(_, value) => setTimeLimit(value as number)}
                min={10}
                max={120}
                step={10}
                marks
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={includeAnswers}
                    onChange={(e) => setIncludeAnswers(e.target.checked)}
                  />
                }
                label="Include Answer Key"
                sx={{ mb: 3 }}
              />

              <Button
                fullWidth
                variant="contained"
                onClick={handleGenerateAssessment}
                disabled={!prompt.trim() || isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : <AssessmentIcon />}
                size="large"
              >
                {isLoading ? 'Generating...' : 'Generate Assessment'}
              </Button>
            </CardContent>
          </Card>

          {/* Templates */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Quick Templates
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {assessmentTemplates.map((template, index) => (
                  <Chip
                    key={index}
                    label={template.title}
                    onClick={() => {
                      setPrompt(template.prompt);
                      setAssessmentType(template.type);
                    }}
                    clickable
                    variant="outlined"
                    icon={<QuizIcon />}
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

        {/* Generated Assessment Display */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ minHeight: '600px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Generated Assessment
                </Typography>
                {generatedAssessment && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      icon={<TimerIcon />}
                      label={`${timeLimit} min`}
                      size="small"
                      color="primary"
                    />
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => {
                        const blob = new Blob([generatedAssessment], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${assessmentType}-${subject || 'general'}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      Download
                    </Button>
                  </Box>
                )}
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {isLoading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                  <CircularProgress size={60} sx={{ mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Creating your assessment...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Generating {questionCount} {difficulty} questions
                  </Typography>
                </Box>
              ) : generatedAssessment ? (
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
                    variant="body1"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.8,
                      fontFamily: 'monospace',
                    }}
                  >
                    {generatedAssessment}
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <AssessmentIcon sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No assessment generated yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Configure your assessment settings and click "Generate Assessment"
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Assessment Features */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Assessment Features
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <QuizIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="subtitle2" fontWeight={600}>
                      Multiple Question Types
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      MCQ, Short Answer, Essay Questions
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <TimerIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="subtitle2" fontWeight={600}>
                      Time Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Customizable time limits
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <AssessmentIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="subtitle2" fontWeight={600}>
                      Auto Grading
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Automatic scoring and feedback
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <DownloadIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="subtitle2" fontWeight={600}>
                      Export Options
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Download in multiple formats
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AIAssessmentPage;