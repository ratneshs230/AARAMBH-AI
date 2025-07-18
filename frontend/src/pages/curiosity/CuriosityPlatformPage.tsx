import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fade,
  IconButton,
  AppBar,
  Toolbar,
  Badge,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  MenuBook as BookOpenIcon,
  Photo as PhotoIcon,
  Lightbulb as LightBulbIcon,
  Science as BeakerIcon,
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Help as QuestionIcon,
  TrendingUp as TrendingIcon,
  History as HistoryIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Psychology as PsychologyIcon,
  Quiz as QuizIcon,
  AutoStories as ReadingIcon,
  TipsAndUpdates as TipsIcon,
  Visibility as VisibilityIcon,
  TouchApp as InteractiveIcon,
  Flag as FlagIcon,
  Calculate as MathIcon,
  ScienceOutlined as ExperimentIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { geminiCuriosityAI } from '@/services/geminiCuriosityAI';
import SarasStatusIndicator from '@/components/common/SarasStatusIndicator';
import GeminiStatusIndicator from '@/components/common/GeminiStatusIndicator';
import { ROUTES } from '@/utils/constants';

export interface ExplanationResult {
  title: string;
  summary: string;
  keyPoints: string[];
  realWorldExample: string;
  imageUrl?: string;
  difficulty?: string;
  subject?: string;
  connections?: string[];
  // Enhanced extensive content fields
  detailedExplanation?: string;
  practicalApplications?: string[];
  historicalContext?: string;
  currentResearch?: string;
  mathematicalConcepts?: string;
  experimentalEvidence?: string;
  misconceptions?: string[];
  studyTips?: string[];
  careerConnections?: string[];
  indianContext?: string;
  visualizationSuggestions?: string[];
  interactiveElements?: string[];
  assessmentQuestions?: string[];
  furtherReading?: string[];
  difficulty_explanation?: string;
}

const CuriosityPlatformPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ExplanationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [relatedTopics, setRelatedTopics] = useState<string[]>([]);

  // Example prompts to guide users
  const examplePrompts = [
    "What is Quantum Entanglement?",
    "How do black holes work?",
    "Why do we dream?",
    "How does machine learning work?",
    "What causes the Northern Lights?",
    "How do vaccines protect us?",
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setFollowUpQuestions([]);
    setRelatedTopics([]);

    try {
      console.log('🔍 Searching for:', searchQuery);
      
      // Generate comprehensive explanation using Gemini-powered Teacher Agent
      const explanation = await geminiCuriosityAI.generateStructuredExplanation(searchQuery, {
        level: 'intermediate',
        subject: 'general',
        jsonMode: true
      });
      
      console.log('✅ Explanation received:', explanation);
      
      // Generate educational image
      let imageUrl: string | undefined;
      try {
        console.log('🎨 Generating educational illustration...');
        const imageResult = await geminiCuriosityAI.generateEducationalImage(
          `Create an educational illustration that explains ${searchQuery}`,
          explanation.title,
          explanation.summary,
          'educational'
        );
        
        if (imageResult.success && imageResult.imageUrl) {
          imageUrl = imageResult.imageUrl;
          console.log('✅ Image generated with:', imageResult.provider);
          if (imageResult.cached) {
            console.log('📦 Used cached image');
          }
        } else {
          console.warn('⚠️ Image generation failed:', imageResult.error);
        }
      } catch (imageError) {
        console.warn('⚠️ Image generation error:', imageError);
      }

      setResult({
        ...explanation,
        imageUrl,
      });
      
      // Generate follow-up questions and related topics in parallel
      const [questions, topics] = await Promise.allSettled([
        geminiCuriosityAI.generateFollowUpQuestions(searchQuery, 3),
        geminiCuriosityAI.generateRelatedTopics(searchQuery, 5)
      ]);

      if (questions.status === 'fulfilled') {
        setFollowUpQuestions(questions.value);
      }

      if (topics.status === 'fulfilled') {
        setRelatedTopics(topics.value);
      }
      
      console.log('🎯 Search completed successfully');
    } catch (err) {
      console.error('❌ Search error:', err);
      setError('Sorry, I encountered an issue while generating the explanation. Please try again or check if the AI service is running.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleExamplePrompt = (prompt: string) => {
    setSearchQuery(prompt);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !isLoading) {
      handleSearch();
    }
  };

  const handleRefresh = () => {
    if (searchQuery) {
      handleSearch();
    }
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Clean Header */}
      <AppBar
        position='sticky'
        elevation={0}
        sx={{
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Left Side - Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
          </Box>

          {/* Right Side - Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* AI Status Indicators */}
            <GeminiStatusIndicator variant="chip" />
            <SarasStatusIndicator variant="chip" />
            
            <Tooltip title='Notifications'>
              <IconButton color='inherit'>
                <Badge badgeContent={3} color='primary'>
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title='Settings'>
              <IconButton color='inherit'>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Curiosity Platform
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary" 
          sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
        >
          Ask any question and get comprehensive explanations with visual illustrations
        </Typography>

        {/* Search Bar */}
        <Paper 
          sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            maxWidth: 700,
            mx: 'auto',
            boxShadow: 3,
          }}
        >
          <SearchIcon color="action" />
          <TextField
            fullWidth
            variant="standard"
            placeholder="What would you like to explore today?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            InputProps={{
              disableUnderline: true,
              sx: { fontSize: '1.1rem' }
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={!searchQuery.trim() || isLoading}
            sx={{ 
              minWidth: 100,
              background: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)',
            }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Explore'}
          </Button>
          {result && (
            <IconButton 
              onClick={handleRefresh}
              disabled={isLoading}
              color="primary"
            >
              <RefreshIcon />
            </IconButton>
          )}
        </Paper>
      </Box>

      {/* Example Prompts */}
      {!result && (
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h6" gutterBottom color="text.secondary">
            Not sure what to ask? Try these examples:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            {examplePrompts.map((prompt, index) => (
              <Chip
                key={index}
                label={prompt}
                onClick={() => handleExamplePrompt(prompt)}
                clickable
                variant="outlined"
                sx={{ 
                  m: 0.5,
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    color: 'white',
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6" color="text.secondary">
            Generating explanation & illustration...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            AI is creating a comprehensive explanation with educational visuals
          </Typography>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Card sx={{ mt: 4, border: '1px solid', borderColor: 'error.main' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography color="error" variant="h6" gutterBottom>
              Oops! Something went wrong
            </Typography>
            <Typography color="text.secondary">
              {error}
            </Typography>
            <Button 
              variant="outlined" 
              onClick={handleSearch} 
              sx={{ mt: 2 }}
              disabled={isLoading}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Result Card */}
      {result && !isLoading && (
        <Fade in={true} timeout={800}>
          <Card sx={{ mt: 4, boxShadow: 4 }}>
            <CardContent sx={{ p: 4 }}>
              {/* Title */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <BookOpenIcon 
                  sx={{ 
                    fontSize: 40, 
                    color: 'primary.main' 
                  }} 
                />
                <Typography 
                  variant="h4" 
                  component="h2" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: 'primary.main'
                  }}
                >
                  {result.title}
                </Typography>
              </Box>

              {/* Summary */}
              <Typography 
                variant="h6" 
                paragraph 
                sx={{ 
                  mb: 4,
                  lineHeight: 1.6,
                  color: 'text.primary'
                }}
              >
                {result.summary}
              </Typography>

              {/* Visual Explanation */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PhotoIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Visual Explanation
                  </Typography>
                </Box>
                
                {result.imageUrl ? (
                <Box
                  component="img"
                  src={result.imageUrl}
                  alt={result.title}
                  sx={{
                    width: '100%',
                    maxHeight: 400,
                    objectFit: 'contain',
                    borderRadius: 2,
                    boxShadow: 2,
                  }}
                />
              ) : (
                <Paper 
                  sx={{ 
                    p: 4, 
                    textAlign: 'center', 
                    backgroundColor: 'grey.50',
                    border: '2px dashed',
                    borderColor: 'grey.300'
                  }}
                >
                  <PhotoIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                  <Typography color="text.secondary">
                    Visual illustration will be generated here
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    AI-generated images are being prepared to enhance your understanding
                  </Typography>
                </Paper>
              )}
            </Box>

            {/* Key Points */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LightBulbIcon color="warning" />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Key Points
                </Typography>
              </Box>
              
              <List>
                {result.keyPoints.map((point, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: 'primary.main',
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText 
                      primary={point}
                      primaryTypographyProps={{
                        sx: { lineHeight: 1.5 }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Real-World Example */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <BeakerIcon color="success" />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Real-World Example
                </Typography>
              </Box>
              
              <Paper 
                sx={{ 
                  p: 3, 
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  border: '1px solid',
                  borderColor: 'success.light'
                }}
              >
                <Typography 
                  sx={{ 
                    lineHeight: 1.6,
                    color: 'text.primary'
                  }}
                >
                  {result.realWorldExample}
                </Typography>
              </Paper>
            </Box>

            {/* Detailed Explanation */}
            {result.detailedExplanation && (
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <MenuBook color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Detailed Explanation
                  </Typography>
                </Box>
                <Typography 
                  paragraph 
                  sx={{ 
                    lineHeight: 1.7,
                    fontSize: '1.1rem',
                    color: 'text.primary',
                    textAlign: 'justify'
                  }}
                >
                  {result.detailedExplanation}
                </Typography>
              </Box>
            )}

            {/* Practical Applications */}
            {result.practicalApplications && result.practicalApplications.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <WorkIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Practical Applications
                  </Typography>
                </Box>
                <List>
                  {result.practicalApplications.map((app, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: 'primary.main',
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={app}
                        primaryTypographyProps={{
                          sx: { lineHeight: 1.5 }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Historical Context */}
            {result.historicalContext && (
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <HistoryIcon color="secondary" />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Historical Context
                  </Typography>
                </Box>
                <Paper 
                  sx={{ 
                    p: 3, 
                    backgroundColor: 'rgba(156, 39, 176, 0.1)',
                    border: '1px solid',
                    borderColor: 'secondary.light'
                  }}
                >
                  <Typography 
                    sx={{ 
                      lineHeight: 1.6,
                      color: 'text.primary'
                    }}
                  >
                    {result.historicalContext}
                  </Typography>
                </Paper>
              </Box>
            )}

            {/* Current Research */}
            {result.currentResearch && (
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <ExperimentIcon color="info" />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Current Research
                  </Typography>
                </Box>
                <Paper 
                  sx={{ 
                    p: 3, 
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    border: '1px solid',
                    borderColor: 'info.light'
                  }}
                >
                  <Typography 
                    sx={{ 
                      lineHeight: 1.6,
                      color: 'text.primary'
                    }}
                  >
                    {result.currentResearch}
                  </Typography>
                </Paper>
              </Box>
            )}

            {/* Mathematical Concepts */}
            {result.mathematicalConcepts && (
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <MathIcon color="warning" />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Mathematical Concepts
                  </Typography>
                </Box>
                <Paper 
                  sx={{ 
                    p: 3, 
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    border: '1px solid',
                    borderColor: 'warning.light'
                  }}
                >
                  <Typography 
                    sx={{ 
                      lineHeight: 1.6,
                      color: 'text.primary',
                      fontFamily: 'monospace'
                    }}
                  >
                    {result.mathematicalConcepts}
                  </Typography>
                </Paper>
              </Box>
            )}

            {/* Indian Context */}
            {result.indianContext && (
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <FlagIcon sx={{ color: '#FF6600' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Indian Context
                  </Typography>
                </Box>
                <Paper 
                  sx={{ 
                    p: 3, 
                    backgroundColor: 'rgba(255, 102, 0, 0.1)',
                    border: '2px solid',
                    borderColor: '#FF6600'
                  }}
                >
                  <Typography 
                    sx={{ 
                      lineHeight: 1.6,
                      color: 'text.primary'
                    }}
                  >
                    {result.indianContext}
                  </Typography>
                </Paper>
              </Box>
            )}


            {/* Learning & Development Section */}
            <Divider sx={{ my: 4 }} />
            
            <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SchoolIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Learning & Career Development
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {/* Career Connections */}
                {result.careerConnections && result.careerConnections.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Career Connections
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {result.careerConnections.map((career, index) => (
                        <Chip
                          key={index}
                          label={career}
                          variant="outlined"
                          color="primary"
                          sx={{ mb: 1 }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Study Tips */}
                {result.studyTips && result.studyTips.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Study Tips
                    </Typography>
                    <List dense>
                      {result.studyTips.map((tip, index) => (
                        <ListItem key={index} sx={{ py: 0.25 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <TipsIcon color="success" sx={{ fontSize: 16 }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={tip}
                            primaryTypographyProps={{
                              sx: { lineHeight: 1.5, fontWeight: 500 }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Common Misconceptions */}
                {result.misconceptions && result.misconceptions.length > 0 && (
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Common Misconceptions to Avoid
                    </Typography>
                    <List dense>
                      {result.misconceptions.map((misconception, index) => (
                        <ListItem key={index} sx={{ py: 0.25 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <WarningIcon color="error" sx={{ fontSize: 16 }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={misconception}
                            primaryTypographyProps={{
                              sx: { lineHeight: 1.5 }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>

            {/* Interactive Learning Section */}
            <Accordion sx={{ mb: 2, boxShadow: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InteractiveIcon color="info" />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Interactive Learning
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {/* Interactive Elements */}
                {result.interactiveElements && result.interactiveElements.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Try These Activities
                    </Typography>
                    <List dense>
                      {result.interactiveElements.map((element, index) => (
                        <ListItem key={index} sx={{ py: 0.25 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <InteractiveIcon color="info" sx={{ fontSize: 16 }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={element}
                            primaryTypographyProps={{
                              sx: { lineHeight: 1.5 }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Assessment Questions */}
                {result.assessmentQuestions && result.assessmentQuestions.length > 0 && (
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Self-Assessment Questions
                    </Typography>
                    <List dense>
                      {result.assessmentQuestions.map((question, index) => (
                        <ListItem key={index} sx={{ py: 0.25 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                              {index + 1}.
                            </Typography>
                          </ListItemIcon>
                          <ListItemText 
                            primary={question}
                            primaryTypographyProps={{
                              sx: { lineHeight: 1.5, fontStyle: 'italic' }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>

            {/* Additional Resources Section */}
            <Accordion sx={{ mb: 4, boxShadow: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ReadingIcon color="info" />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Additional Resources
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {/* Further Reading */}
                {result.furtherReading && result.furtherReading.length > 0 && (
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Recommended Reading
                    </Typography>
                    <List dense>
                      {result.furtherReading.map((reading, index) => (
                        <ListItem key={index} sx={{ py: 0.25 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <ReadingIcon color="info" sx={{ fontSize: 16 }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={reading}
                            primaryTypographyProps={{
                              sx: { lineHeight: 1.5 }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>

            {/* Follow-up Questions */}
            {followUpQuestions.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <QuestionIcon color="info" />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Explore Further
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {followUpQuestions.map((question, index) => (
                    <Chip
                      key={index}
                      label={question}
                      onClick={() => handleExamplePrompt(question)}
                      clickable
                      variant="outlined"
                      color="info"
                      sx={{
                        mb: 1,
                        '&:hover': {
                          backgroundColor: 'info.light',
                          color: 'white',
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Related Topics */}
            {relatedTopics.length > 0 && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TrendingIcon color="secondary" />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Related Topics
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {relatedTopics.map((topic, index) => (
                    <Chip
                      key={index}
                      label={topic}
                      onClick={() => handleExamplePrompt(topic)}
                      clickable
                      variant="outlined"
                      color="secondary"
                      sx={{
                        mb: 1,
                        '&:hover': {
                          backgroundColor: 'secondary.light',
                          color: 'white',
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Fade>
    )}
    </Container>
  </Box>
);
};

export default CuriosityPlatformPage;
