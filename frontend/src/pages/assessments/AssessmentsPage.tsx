import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Paper,
} from '@mui/material';
import {
  Quiz as QuizIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';

const AssessmentsPage: React.FC = () => {
  const mockAssessments = [
    {
      id: '1',
      title: 'Mathematics - Calculus Quiz',
      subject: 'Mathematics',
      duration: '30 min',
      questions: 20,
      status: 'pending',
      dueDate: 'Tomorrow',
    },
    {
      id: '2',
      title: 'Physics - Mechanics Test',
      subject: 'Physics',
      duration: '45 min',
      questions: 25,
      status: 'completed',
      score: '85%',
    },
    {
      id: '3',
      title: 'Chemistry - Organic Reactions',
      subject: 'Chemistry',
      duration: '20 min',
      questions: 15,
      status: 'pending',
      dueDate: 'In 3 days',
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" fontWeight={600} gutterBottom>
          Assessments 📝
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Take quizzes, tests, and track your performance
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Available Assessments
              </Typography>
              <List>
                {mockAssessments.map((assessment) => (
                  <Paper key={assessment.id} sx={{ mb: 2, p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight={600}>
                          {assessment.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {assessment.subject} • {assessment.questions} questions • {assessment.duration}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip
                            label={assessment.status === 'completed' ? `Score: ${assessment.score}` : `Due: ${assessment.dueDate}`}
                            color={assessment.status === 'completed' ? 'success' : 'warning'}
                            size="small"
                          />
                        </Box>
                      </Box>
                      <Button
                        variant={assessment.status === 'completed' ? 'outlined' : 'contained'}
                        startIcon={assessment.status === 'completed' ? <CheckCircleIcon /> : <PlayIcon />}
                      >
                        {assessment.status === 'completed' ? 'Review' : 'Start'}
                      </Button>
                    </Box>
                  </Paper>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Quick Stats
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">Tests Completed: 12</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">Average Score: 87%</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">Pending Tests: 3</Typography>
              </Box>
              <Button
                fullWidth
                variant="contained"
                startIcon={<QuizIcon />}
                sx={{ mt: 2 }}
              >
                Create Custom Quiz
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AssessmentsPage;