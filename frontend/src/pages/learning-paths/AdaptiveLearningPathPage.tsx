import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Tooltip,
  Badge,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  School as LearningIcon,
  Psychology as AIIcon,
  TrendingUp as ProgressIcon,
  Lightbulb as ConceptIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  VideoLibrary as VideoIcon,
  Article as ArticleIcon,
  Group as CollaborationIcon,
  Star as MasteryIcon,
  Lock as LockedIcon,
  CheckCircle as CompletedIcon,
  PlayArrow as StartIcon,
  Refresh as AdaptIcon,
  ExpandMore as ExpandMoreIcon,
  Timeline as PathIcon,
  Speed as DifficultyIcon,
  Schedule as TimeIcon,
  EmojiEvents as AchievementIcon,
} from '@mui/icons-material';

interface LearningNode {
  id: string;
  title: string;
  description: string;
  type: 'concept' | 'practice' | 'assessment' | 'project' | 'video' | 'reading';
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedTime: number; // in minutes
  prerequisites: string[];
  masteryLevel: number; // 0-100
  isCompleted: boolean;
  isUnlocked: boolean;
  adaptiveLevel: 'beginner' | 'intermediate' | 'advanced';
  learningObjectives: string[];
  resources: Resource[];
  aiRecommendations: string[];
}

interface Resource {
  id: string;
  title: string;
  type: 'video' | 'article' | 'interactive' | 'quiz' | 'simulation';
  url: string;
  duration: number;
  difficulty: number;
}

interface LearningPath {
  id: string;
  title: string;
  subject: string;
  description: string;
  totalNodes: number;
  completedNodes: number;
  estimatedDuration: number; // in hours
  difficulty: string;
  nodes: LearningNode[];
  adaptiveFeatures: string[];
  personalizedFor: string;
}

interface AIPersonalization {
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  pace: 'slow' | 'moderate' | 'fast';
  difficulty: 'adaptive' | 'challenging' | 'comfortable';
  interests: string[];
  weakAreas: string[];
  strongAreas: string[];
  recommendedFocus: string[];
}

const AdaptiveLearningPathPage: React.FC = () => {
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isCustomizeDialogOpen, setIsCustomizeDialogOpen] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [personalization, setPersonalization] = useState<AIPersonalization>({
    learningStyle: 'visual',
    pace: 'moderate',
    difficulty: 'adaptive',
    interests: ['Mathematics', 'Problem Solving'],
    weakAreas: ['Calculus', 'Complex Numbers'],
    strongAreas: ['Algebra', 'Geometry'],
    recommendedFocus: ['Visual Learning', 'Practice Problems', 'Step-by-step Solutions'],
  });

  // Mock learning paths data
  useEffect(() => {
    setLearningPaths([
      {
        id: '1',
        title: 'Advanced Calculus Mastery',
        subject: 'Mathematics',
        description: 'Comprehensive calculus course adapted to your learning style and pace',
        totalNodes: 12,
        completedNodes: 4,
        estimatedDuration: 40,
        difficulty: 'Advanced',
        personalizedFor: 'Visual Learner, Moderate Pace',
        adaptiveFeatures: [
          'AI-driven difficulty adjustment',
          'Personalized examples',
          'Smart practice problems',
        ],
        nodes: [
          {
            id: '1',
            title: 'Limits and Continuity',
            description: 'Understanding the fundamental concept of limits',
            type: 'concept',
            difficulty: 3,
            estimatedTime: 45,
            prerequisites: [],
            masteryLevel: 100,
            isCompleted: true,
            isUnlocked: true,
            adaptiveLevel: 'intermediate',
            learningObjectives: [
              'Define mathematical limits',
              'Evaluate limits using various techniques',
              'Understand continuity',
            ],
            resources: [
              {
                id: '1',
                title: 'Limits Visualization',
                type: 'interactive',
                url: '/resources/limits-interactive',
                duration: 20,
                difficulty: 2,
              },
            ],
            aiRecommendations: [
              'Focus on graphical interpretation for better understanding',
              'Practice with real-world examples',
            ],
          },
          {
            id: '2',
            title: 'Derivative Fundamentals',
            description: 'Master the concept and calculation of derivatives',
            type: 'concept',
            difficulty: 3,
            estimatedTime: 60,
            prerequisites: ['1'],
            masteryLevel: 85,
            isCompleted: true,
            isUnlocked: true,
            adaptiveLevel: 'intermediate',
            learningObjectives: [
              'Understand derivative as rate of change',
              'Apply differentiation rules',
              'Solve optimization problems',
            ],
            resources: [],
            aiRecommendations: [
              'Review chain rule applications',
              'Practice more optimization problems',
            ],
          },
          {
            id: '3',
            title: 'Integration Techniques',
            description: 'Learn various integration methods and applications',
            type: 'practice',
            difficulty: 4,
            estimatedTime: 90,
            prerequisites: ['2'],
            masteryLevel: 60,
            isCompleted: false,
            isUnlocked: true,
            adaptiveLevel: 'advanced',
            learningObjectives: [
              'Master integration by parts',
              'Apply substitution methods',
              'Solve area and volume problems',
            ],
            resources: [],
            aiRecommendations: [
              'Focus on integration by parts - this matches your learning style',
              'Use visual aids for area calculations',
            ],
          },
          {
            id: '4',
            title: 'Advanced Applications',
            description: 'Apply calculus to real-world problems',
            type: 'project',
            difficulty: 5,
            estimatedTime: 120,
            prerequisites: ['3'],
            masteryLevel: 0,
            isCompleted: false,
            isUnlocked: false,
            adaptiveLevel: 'advanced',
            learningObjectives: [
              'Model real-world phenomena',
              'Solve complex optimization',
              'Apply multivariable calculus',
            ],
            resources: [],
            aiRecommendations: [],
          },
        ],
      },
    ]);
    setSelectedPath(learningPaths[0]);
  }, []);

  const getNodeIcon = (type: string, isCompleted: boolean, isUnlocked: boolean) => {
    if (!isUnlocked) return <LockedIcon color='disabled' />;
    if (isCompleted) return <CompletedIcon color='success' />;

    const icons = {
      concept: <ConceptIcon color='primary' />,
      practice: <AssignmentIcon color='secondary' />,
      assessment: <QuizIcon color='warning' />,
      project: <CollaborationIcon color='info' />,
      video: <VideoIcon color='error' />,
      reading: <ArticleIcon color='action' />,
    };
    return icons[type as keyof typeof icons] || <LearningIcon />;
  };

  const getDifficultyColor = (difficulty: number): 'success' | 'warning' | 'error' => {
    if (difficulty <= 2) return 'success';
    if (difficulty <= 3) return 'warning';
    return 'error';
  };

  const getAdaptiveLevelColor = (
    level: 'beginner' | 'intermediate' | 'advanced'
  ): 'success' | 'warning' | 'error' | 'default' => {
    const colors: { [key: string]: 'success' | 'warning' | 'error' | 'default' } = {
      beginner: 'success',
      intermediate: 'warning',
      advanced: 'error',
    };
    return colors[level] || 'default';
  };

  const handleStartNode = (nodeId: string) => {
    if (selectedPath) {
      const updatedNodes = selectedPath.nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, isCompleted: true, masteryLevel: 100 };
        }
        return node;
      });

      // Unlock next nodes
      const completedNode = updatedNodes.find(n => n.id === nodeId);
      if (completedNode) {
        updatedNodes.forEach(node => {
          if (node.prerequisites.includes(nodeId)) {
            node.isUnlocked = true;
          }
        });
      }

      setSelectedPath({ ...selectedPath, nodes: updatedNodes });
    }
  };

  const handleAdaptPath = async () => {
    // AI-powered path adaptation
    if (selectedPath) {
      // Simulate AI analysis
      const adaptedNodes = selectedPath.nodes.map(node => ({
        ...node,
        aiRecommendations: [
          'Adapted based on your recent performance',
          'Difficulty adjusted to match your pace',
          'Additional resources added for your learning style',
        ],
      }));

      setSelectedPath({ ...selectedPath, nodes: adaptedNodes });
    }
  };

  const calculateProgress = () => {
    if (!selectedPath) return 0;
    const completed = selectedPath.nodes.filter(n => n.isCompleted).length;
    return (completed / selectedPath.totalNodes) * 100;
  };

  if (!selectedPath) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant='h4' component='h1' sx={{ fontWeight: 'bold', mb: 3 }}>
          Adaptive Learning Paths
        </Typography>
        <Grid container spacing={3}>
          {learningPaths.map(path => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={path.id}>
              <Card
                sx={{ height: '100%', cursor: 'pointer' }}
                onClick={() => setSelectedPath(path)}
              >
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    {path.title}
                  </Typography>
                  <Typography color='text.secondary' gutterBottom>
                    {path.description}
                  </Typography>
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <LinearProgress
                      variant='determinate'
                      value={(path.completedNodes / path.totalNodes) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant='body2' sx={{ mt: 1 }}>
                      {path.completedNodes} of {path.totalNodes} completed
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label={path.subject} color='primary' size='small' />
                    <Chip label={path.difficulty} color='secondary' size='small' />
                    <Chip label={`${path.estimatedDuration}h`} size='small' />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant='h4' component='h1' sx={{ fontWeight: 'bold' }}>
            {selectedPath.title}
          </Typography>
          <Typography variant='subtitle1' color='text.secondary'>
            Personalized for: {selectedPath.personalizedFor}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant='outlined' startIcon={<AdaptIcon />} onClick={handleAdaptPath}>
            Adapt Path
          </Button>
          <Button variant='outlined' startIcon={<AIIcon />} onClick={() => setShowAIInsights(true)}>
            AI Insights
          </Button>
          <Button
            variant='contained'
            startIcon={<PathIcon />}
            onClick={() => setSelectedPath(null)}
          >
            All Paths
          </Button>
        </Box>
      </Box>

      {/* Progress Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Learning Progress
              </Typography>
              <Box sx={{ mb: 2 }}>
                <LinearProgress
                  variant='determinate'
                  value={calculateProgress()}
                  sx={{ height: 12, borderRadius: 6 }}
                />
                <Typography variant='body2' sx={{ mt: 1 }}>
                  {selectedPath.completedNodes} of {selectedPath.totalNodes} nodes completed (
                  {Math.round(calculateProgress())}%)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Chip
                  icon={<TimeIcon />}
                  label={`${selectedPath.estimatedDuration} hours`}
                  color='primary'
                />
                <Chip icon={<DifficultyIcon />} label={selectedPath.difficulty} color='secondary' />
                <Chip
                  icon={<MasteryIcon />}
                  label={`Avg Mastery: ${Math.round(selectedPath.nodes.reduce((acc, n) => acc + n.masteryLevel, 0) / selectedPath.nodes.length)}%`}
                  color='warning'
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Adaptive Features
              </Typography>
              <List dense>
                {selectedPath.adaptiveFeatures.map((feature, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <AIIcon color='primary' fontSize='small' />
                    </ListItemIcon>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Learning Path Stepper */}
      <Card>
        <CardContent>
          <Typography
            variant='h6'
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <PathIcon color='primary' />
            Learning Journey
          </Typography>

          <Stepper activeStep={activeStep} orientation='vertical'>
            {selectedPath.nodes.map((node, index) => (
              <Step key={node.id} completed={node.isCompleted}>
                <StepLabel
                  optional={
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      <Chip label={node.type} size='small' color='primary' variant='outlined' />
                      <Chip label={`${node.estimatedTime} min`} size='small' color='default' />
                      <Chip
                        label={node.adaptiveLevel}
                        size='small'
                        color={getAdaptiveLevelColor(node.adaptiveLevel)}
                      />
                    </Box>
                  }
                  StepIconComponent={() =>
                    getNodeIcon(node.type, node.isCompleted, node.isUnlocked)
                  }
                >
                  <Typography variant='subtitle1' sx={{ fontWeight: 'bold' }}>
                    {node.title}
                  </Typography>
                </StepLabel>

                <StepContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                      {node.description}
                    </Typography>

                    {/* Mastery Level */}
                    {node.masteryLevel > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant='caption' color='text.secondary'>
                          Mastery Level: {node.masteryLevel}%
                        </Typography>
                        <LinearProgress
                          variant='determinate'
                          value={node.masteryLevel}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    )}

                    {/* Learning Objectives */}
                    <Accordion sx={{ mb: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant='subtitle2'>Learning Objectives</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List dense>
                          {node.learningObjectives.map((objective, idx) => (
                            <ListItem key={idx}>
                              <ListItemText primary={objective} />
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>

                    {/* AI Recommendations */}
                    {node.aiRecommendations.length > 0 && (
                      <Alert severity='info' icon={<AIIcon />} sx={{ mb: 2 }}>
                        <Typography variant='subtitle2' sx={{ fontWeight: 'bold' }}>
                          AI Recommendations:
                        </Typography>
                        <List dense>
                          {node.aiRecommendations.map((rec, idx) => (
                            <ListItem key={idx}>
                              <ListItemText primary={rec} />
                            </ListItem>
                          ))}
                        </List>
                      </Alert>
                    )}

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {node.isUnlocked && !node.isCompleted && (
                        <Button
                          variant='contained'
                          startIcon={<StartIcon />}
                          onClick={() => handleStartNode(node.id)}
                        >
                          Start Learning
                        </Button>
                      )}
                      {node.isCompleted && (
                        <Button variant='outlined' startIcon={<ProgressIcon />}>
                          Review & Practice
                        </Button>
                      )}
                      {!node.isUnlocked && (
                        <Button disabled startIcon={<LockedIcon />}>
                          Complete Prerequisites
                        </Button>
                      )}
                    </Box>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* AI Insights Dialog */}
      <Dialog
        open={showAIInsights}
        onClose={() => setShowAIInsights(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AIIcon color='primary' />
          AI Learning Insights
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant='subtitle1' gutterBottom sx={{ fontWeight: 'bold' }}>
                Learning Profile
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary='Learning Style'
                    secondary={personalization.learningStyle}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText primary='Preferred Pace' secondary={personalization.pace} />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary='Difficulty Preference'
                    secondary={personalization.difficulty}
                  />
                </ListItem>
              </List>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant='subtitle1' gutterBottom sx={{ fontWeight: 'bold' }}>
                Personalized Recommendations
              </Typography>
              <List dense>
                {personalization.recommendedFocus.map((focus, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <ConceptIcon color='primary' fontSize='small' />
                    </ListItemIcon>
                    <ListItemText primary={focus} />
                  </ListItem>
                ))}
              </List>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant='subtitle1' gutterBottom sx={{ fontWeight: 'bold' }}>
                Areas for Improvement
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {personalization.weakAreas.map((area, index) => (
                  <Chip key={index} label={area} color='warning' size='small' />
                ))}
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant='subtitle1' gutterBottom sx={{ fontWeight: 'bold' }}>
                Strong Areas
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {personalization.strongAreas.map((area, index) => (
                  <Chip key={index} label={area} color='success' size='small' />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAIInsights(false)}>Close</Button>
          <Button variant='contained' onClick={() => setIsCustomizeDialogOpen(true)}>
            Customize Path
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdaptiveLearningPathPage;
