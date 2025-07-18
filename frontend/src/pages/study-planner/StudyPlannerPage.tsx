import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Today as TodayIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

const StudyPlannerPage: React.FC = () => {
  const mockSchedule = [
    {
      id: '1',
      time: '09:00 AM',
      title: 'Mathematics - Calculus',
      duration: '1 hour',
      type: 'study',
    },
    {
      id: '2',
      time: '11:00 AM',
      title: 'Physics Lab Assignment',
      duration: '2 hours',
      type: 'assignment',
    },
    {
      id: '3',
      time: '02:00 PM',
      title: 'Chemistry Quiz Review',
      duration: '45 min',
      type: 'review',
    },
    {
      id: '4',
      time: '04:00 PM',
      title: 'AI Tutor Session',
      duration: '30 min',
      type: 'ai_session',
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" fontWeight={600} gutterBottom>
          Study Planner 📅
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Organize your study schedule and track your progress
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Today's Schedule
              </Typography>
              <List>
                {mockSchedule.map((item) => (
                  <ListItem key={item.id}>
                    <ListItemIcon>
                      <ScheduleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      secondary={`${item.time} • ${item.duration}`}
                    />
                    <Chip
                      label={item.type.replace('_', ' ')}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Quick Actions
              </Typography>
              <Button
                fullWidth
                variant="contained"
                startIcon={<TodayIcon />}
                sx={{ mb: 2 }}
              >
                Add Study Session
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<EventIcon />}
                sx={{ mb: 2 }}
              >
                Schedule Exam
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AssignmentIcon />}
              >
                Set Reminder
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StudyPlannerPage;