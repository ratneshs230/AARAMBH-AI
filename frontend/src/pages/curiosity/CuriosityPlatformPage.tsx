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
} from '@mui/icons-material';
import { curiosityAIService } from '@/services/curiosityAI';
import SarasStatusIndicator from '@/components/common/SarasStatusIndicator';
import { ROUTES } from '@/utils/constants';

interface ExplanationResult {
  title: string;
  summary: string;
  keyPoints: string[];
  realWorldExample: string;
  imageUrl?: string;
}

const CuriosityPlatformPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ExplanationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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

    try {
      // Step 1: Generate text explanation
      const textResponse = await generateTextExplanation(searchQuery);
      
      // Step 2: Generate image (optional)
      let imageUrl: string | undefined;
      try {
        imageUrl = await generateImage(textResponse.title, textResponse.summary);
      } catch (imageError) {
        console.warn('Image generation failed:', imageError);
        // Continue without image - this is acceptable
      }

      setResult({
        ...textResponse,
        imageUrl,
      });
    } catch (err) {
      console.error('Search error:', err);
      setError('Sorry, I encountered an issue while generating the explanation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateTextExplanation = async (query: string): Promise<Omit<ExplanationResult, 'imageUrl'>> => {
    // This would call the Gemini API with a structured prompt
    const prompt = `You are a friendly and knowledgeable tutor for a student in India. Please explain "${query}" in a clear, engaging way.

Return your response as a JSON object with this exact structure:
{
  "title": "A clear, descriptive title for the topic",
  "summary": "A concise 2-3 sentence explanation of the main concept",
  "keyPoints": ["3-5 bullet points highlighting the most important aspects"],
  "realWorldExample": "A practical, relatable example that demonstrates the concept in action"
}`;

    // For now, using the existing curiosityAI service as a placeholder
    // In production, this would use Gemini with the structured responseSchema
    try {
      const response = await curiosityAIService.generateCuriosityInsights(
        {
          id: 'user',
          interests: [query],
          learningStyle: 'visual',
          preferredDifficulty: 'intermediate',
          completedTopics: [],
          bookmarkedTopics: [],
          searchHistory: [query],
          timeSpent: {},
          ratings: {},
        },
        {
          recentlyViewed: [],
          sessionDuration: 0,
          todayActivity: [],
          activeQuestions: [query],
        }
      );

      // Mock structured response based on query
      return generateMockResponse(query);
    } catch (error) {
      // Fallback to mock response
      return generateMockResponse(query);
    }
  };

  const generateImage = async (title: string, summary: string): Promise<string> => {
    // This would call the Imagen API
    const imagePrompt = `Create an educational illustration for "${title}". ${summary}. Make it clear, colorful, and suitable for learning. Style: educational diagram, scientific illustration.`;
    
    // For now, return a placeholder
    // In production: const imageUrl = await imagenAPI.generateImage(imagePrompt);
    throw new Error('Image generation not implemented yet');
  };

  const generateMockResponse = (query: string): Omit<ExplanationResult, 'imageUrl'> => {
    // Generate contextual mock responses based on the query
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('quantum') || queryLower.includes('entanglement')) {
      return {
        title: "Quantum Entanglement",
        summary: "Quantum entanglement is a physical phenomenon where two or more particles become connected in such a way that the quantum state of each particle cannot be described independently. When particles are entangled, measuring one instantly affects the other, regardless of the distance between them.",
        keyPoints: [
          "Particles become 'entangled' and share a quantum state",
          "Measuring one particle instantly affects its entangled partner",
          "This connection persists even across vast distances",
          "Einstein called it 'spooky action at a distance'",
          "It's fundamental to quantum computing and quantum communication"
        ],
        realWorldExample: "Imagine you have two magic coins that are quantum entangled. No matter how far apart you take them, when you flip one and it lands heads, the other will instantly land tails. Scientists use this principle in quantum computers to process information in revolutionary ways, and it may one day enable ultra-secure quantum internet."
      };
    }
    
    if (queryLower.includes('black hole')) {
      return {
        title: "Black Holes: Cosmic Vacuum Cleaners",
        summary: "A black hole is a region in space where gravity is so strong that nothing, not even light, can escape once it crosses the event horizon. They form when massive stars collapse at the end of their lives, creating a point of infinite density called a singularity.",
        keyPoints: [
          "Gravity is so strong that even light cannot escape",
          "Formed from collapsed massive stars (at least 25 times our Sun's mass)",
          "Have an 'event horizon' - the point of no return",
          "Time slows down dramatically near black holes",
          "They can grow by consuming matter and merging with other black holes"
        ],
        realWorldExample: "Think of a black hole like a cosmic drain in a bathtub. Just as water spirals down a drain and disappears, matter spirals into a black hole and vanishes from our observable universe. The closest black hole to Earth is about 1,000 light-years away - far enough that we're completely safe, but close enough for scientists to study!"
      };
    }

    if (queryLower.includes('dream')) {
      return {
        title: "Why Do We Dream?",
        summary: "Dreams occur during REM (Rapid Eye Movement) sleep when our brain is highly active. Scientists believe dreams help process memories, emotions, and experiences from our waking hours, essentially helping our brain organize and make sense of information.",
        keyPoints: [
          "Dreams mainly occur during REM sleep (about 25% of our sleep)",
          "Brain activity during dreams is similar to when we're awake",
          "Dreams help process and consolidate memories",
          "They may help us work through emotions and problems",
          "Everyone dreams, but not everyone remembers their dreams"
        ],
        realWorldExample: "Think of your brain as a computer that needs to organize its files at night. During dreams, your brain sorts through the day's experiences - like filing important memories in long-term storage and deleting unnecessary information. This is why you might dream about studying for an exam or have strange combinations of people and places from your day mixed together."
      };
    }

    // Default response for any other query
    return {
      title: `Understanding: ${query}`,
      summary: `This is a fascinating topic that deserves exploration! While I'm generating a detailed explanation about ${query}, I'll provide you with key insights and practical examples to help you understand this concept better.`,
      keyPoints: [
        `${query} is an important concept worth understanding`,
        "It connects to many other areas of knowledge",
        "Real-world applications make it relevant to daily life",
        "Understanding this topic opens doors to deeper learning",
        "There are always new discoveries being made in this field"
      ],
      realWorldExample: `To better understand ${query}, think about how it might appear in your everyday life. Many complex concepts become clearer when we connect them to familiar experiences and practical applications that we can observe around us.`
    };
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
            {/* SARAS AI Status */}
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
            Please wait while SARAS creates a comprehensive explanation for you
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
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <BeakerIcon color="success" />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Real-World Example
                  </Typography>
                </Box>
                
                <Paper 
                  sx={{ 
                    p: 3, 
                    backgroundColor: 'success.light',
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
            </CardContent>
          </Card>
        </Fade>
      )}
      </Container>
    </Box>
  );
};

export default CuriosityPlatformPage;