import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Tab,
  Tabs,
  Button,
  Grid,
  Avatar,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemIcon,
  IconButton,
  Divider,
} from '@mui/material';
import {
  People as CommunityIcon,
  School as MentorIcon,
  Create as ContentGeneratorIcon,
  Quiz as AssessmentGeneratorIcon,
  Star as StarIcon,
  Message as MessageIcon,
  VideoCall as VideoCallIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

interface Mentor {
  id: string;
  name: string;
  subject: string;
  rating: number;
  experience: string;
  students: number;
  avatar: string;
  specialties: string[];
  isOnline: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`community-tabpanel-${index}`}
      aria-labelledby={`community-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const CommunityPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const mockMentors: Mentor[] = [
    {
      id: '1',
      name: 'Dr. Priya Sharma',
      subject: 'Mathematics',
      rating: 4.9,
      experience: '10+ years',
      students: 2500,
      avatar: '/avatars/mentor1.jpg',
      specialties: ['JEE Advanced', 'Calculus', 'Algebra'],
      isOnline: true,
    },
    {
      id: '2',
      name: 'Prof. Rajesh Kumar',
      subject: 'Physics',
      rating: 4.8,
      experience: '8+ years',
      students: 1800,
      avatar: '/avatars/mentor2.jpg',
      specialties: ['NEET', 'Mechanics', 'Thermodynamics'],
      isOnline: false,
    },
    {
      id: '3',
      name: 'Dr. Anjali Gupta',
      subject: 'Chemistry',
      rating: 4.7,
      experience: '12+ years',
      students: 3200,
      avatar: '/avatars/mentor3.jpg',
      specialties: ['Organic Chemistry', 'CBSE', 'Board Exams'],
      isOnline: true,
    },
  ];

  const MentorCard: React.FC<{ mentor: Mentor }> = ({ mentor }) => (
    <Card sx={{ height: '100%', position: 'relative' }}>
      {mentor.isOnline && (
        <Chip
          label="Online"
          color="success"
          size="small"
          sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
        />
      )}
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={mentor.avatar}
            sx={{
              width: 64,
              height: 64,
              mr: 2,
              bgcolor: 'primary.main',
            }}
          >
            {mentor.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {mentor.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {mentor.subject} • {mentor.experience}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <StarIcon sx={{ color: 'orange', fontSize: 16 }} />
              <Typography variant="body2" sx={{ ml: 0.5 }}>
                {mentor.rating} ({mentor.students} students)
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Specialties:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {mentor.specialties.map((specialty, index) => (
              <Chip
                key={index}
                label={specialty}
                size="small"
                variant="outlined"
                color="primary"
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<MessageIcon />}
            sx={{ flex: 1 }}
          >
            Message
          </Button>
          <IconButton color="primary">
            <VideoCallIcon />
          </IconButton>
          <IconButton color="primary">
            <ScheduleIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

  const ContentGenerator: React.FC = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <ContentGeneratorIcon sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
          <Typography variant="h5" fontWeight={600}>
            AI Content Generator
          </Typography>
        </Box>
        
        <Typography variant="body1" paragraph color="text.secondary">
          Generate personalized learning content with the help of our AI mentors. Create custom 
          lessons, explanations, and study materials tailored to your learning needs.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" startIcon={<ContentGeneratorIcon />}>
            Generate Lesson
          </Button>
          <Button variant="outlined">
            Create Study Notes
          </Button>
          <Button variant="outlined">
            Make Flashcards
          </Button>
        </Box>

        <Paper sx={{ p: 2, mt: 3, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle2" gutterBottom>
            📝 Recent Generations:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText 
                primary="Calculus Integration Methods"
                secondary="Generated 2 hours ago • Mathematics"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Organic Chemistry Reactions"
                secondary="Generated 5 hours ago • Chemistry"
              />
            </ListItem>
          </List>
        </Paper>
      </CardContent>
    </Card>
  );

  const AssessmentGenerator: React.FC = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AssessmentGeneratorIcon sx={{ fontSize: 32, color: 'secondary.main', mr: 1 }} />
          <Typography variant="h5" fontWeight={600}>
            AI Assessment Generator
          </Typography>
        </Box>
        
        <Typography variant="body1" paragraph color="text.secondary">
          Create custom quizzes, tests, and assessments using AI. Generate questions based on 
          your curriculum, difficulty level, and learning objectives.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" color="secondary" startIcon={<AssessmentGeneratorIcon />}>
            Create Quiz
          </Button>
          <Button variant="outlined" color="secondary">
            Mock Test
          </Button>
          <Button variant="outlined" color="secondary">
            Practice Questions
          </Button>
        </Box>

        <Paper sx={{ p: 2, mt: 3, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle2" gutterBottom>
            🎯 Recent Assessments:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText 
                primary="JEE Physics Mock Test"
                secondary="Created yesterday • 30 questions • 1.5 hours"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Trigonometry Quick Quiz"
                secondary="Created 2 days ago • 15 questions • 30 minutes"
              />
            </ListItem>
          </List>
        </Paper>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" fontWeight={600} gutterBottom>
          Community Hub 👥
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Connect with mentors, access AI-powered tools, and collaborate with peers
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="community tabs"
          variant="fullWidth"
        >
          <Tab 
            label="Mentors" 
            icon={<MentorIcon />} 
            iconPosition="start"
            id="community-tab-0"
            aria-controls="community-tabpanel-0"
          />
          <Tab 
            label="Content Generator" 
            icon={<ContentGeneratorIcon />} 
            iconPosition="start"
            id="community-tab-1"
            aria-controls="community-tabpanel-1"
          />
          <Tab 
            label="Assessment Generator" 
            icon={<AssessmentGeneratorIcon />} 
            iconPosition="start"
            id="community-tab-2"
            aria-controls="community-tabpanel-2"
          />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Available Mentors
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Connect with experienced educators and get personalized guidance
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          {mockMentors.map((mentor) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={mentor.id}>
              <MentorCard mentor={mentor} />
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <ContentGenerator />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <AssessmentGenerator />
      </TabPanel>
    </Container>
  );
};

export default CommunityPage;