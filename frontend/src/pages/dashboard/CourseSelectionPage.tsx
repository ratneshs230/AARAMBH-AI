import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Avatar,
  Paper,
  Chip,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  School as SchoolIcon,
  AccessTime as TimeIcon,
  TrendingUp as ProgressIcon,
} from '@mui/icons-material';

interface Course {
  id: string;
  name: string;
  subject: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  instructor: string;
  lastAccessed: string;
  nextClass?: string;
  thumbnail?: string;
  color: string;
}

const mockCourses: Course[] = [
  {
    id: '1',
    name: 'Advanced Mathematics',
    subject: 'Mathematics',
    progress: 75,
    totalLessons: 32,
    completedLessons: 24,
    instructor: 'Dr. Priya Sharma',
    lastAccessed: '1 hour ago',
    nextClass: 'Today at 3:00 PM',
    color: '#1976d2'
  },
  {
    id: '2',
    name: 'Physics Fundamentals',
    subject: 'Physics',
    progress: 45,
    totalLessons: 28,
    completedLessons: 13,
    instructor: 'Prof. Rajesh Kumar',
    lastAccessed: '3 hours ago',
    nextClass: 'Tomorrow at 10:00 AM',
    color: '#388e3c'
  },
  {
    id: '3',
    name: 'Chemistry Basics',
    subject: 'Chemistry',
    progress: 90,
    totalLessons: 20,
    completedLessons: 18,
    instructor: 'Dr. Anita Verma',
    lastAccessed: '30 min ago',
    nextClass: 'Wednesday at 2:00 PM',
    color: '#f57c00'
  },
  {
    id: '4',
    name: 'Biology Essentials',
    subject: 'Biology',
    progress: 60,
    totalLessons: 25,
    completedLessons: 15,
    instructor: 'Dr. Suresh Patel',
    lastAccessed: '2 days ago',
    nextClass: 'Friday at 11:00 AM',
    color: '#7b1fa2'
  }
];

const CourseSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCourseSelect = (courseId: string) => {
    navigate(`/dashboard/${courseId}`);
  };

  const handleViewAllCourses = () => {
    navigate('/courses');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
          Select Course Dashboard 📚
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Choose a course to view your personalized dashboard and today's plan
        </Typography>
      </Box>

      {/* Course Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {mockCourses.map((course) => (
          <Grid key={course.id} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: `2px solid ${course.color}20`,
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 12px 24px ${course.color}30`,
                  borderColor: course.color,
                },
              }}
              onClick={() => handleCourseSelect(course.id)}
            >
              <CardContent sx={{ p: 3 }}>
                {/* Course Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: course.color,
                      width: 48,
                      height: 48,
                      mr: 2,
                    }}
                  >
                    <SchoolIcon />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {course.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {course.subject}
                    </Typography>
                  </Box>
                </Box>

                {/* Progress Section */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      Progress
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {course.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={course.progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: `${course.color}20`,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: course.color,
                      },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {course.completedLessons}/{course.totalLessons} lessons completed
                  </Typography>
                </Box>

                {/* Course Details */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    👨‍🏫 {course.instructor}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    ⏰ Last accessed: {course.lastAccessed}
                  </Typography>
                  {course.nextClass && (
                    <Chip
                      label={`Next: ${course.nextClass}`}
                      size="small"
                      sx={{
                        backgroundColor: `${course.color}15`,
                        color: course.color,
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Box>

                {/* Action Button */}
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<PlayIcon />}
                  sx={{
                    backgroundColor: course.color,
                    '&:hover': {
                      backgroundColor: course.color,
                      filter: 'brightness(0.9)',
                    },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCourseSelect(course.id);
                  }}
                >
                  Open Dashboard
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Stats */}
      <Paper sx={{ p: 3, mb: 4, textAlign: 'center' }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Typography variant="h4" color="primary" fontWeight={600}>
              {mockCourses.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Courses
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Typography variant="h4" color="success.main" fontWeight={600}>
              {Math.round(mockCourses.reduce((acc, course) => acc + course.progress, 0) / mockCourses.length)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Average Progress
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Typography variant="h4" color="warning.main" fontWeight={600}>
              {mockCourses.reduce((acc, course) => acc + course.completedLessons, 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lessons Completed
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Typography variant="h4" color="info.main" fontWeight={600}>
              {mockCourses.filter(course => course.nextClass?.includes('Today')).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Classes Today
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Additional Actions */}
      <Box sx={{ textAlign: 'center' }}>
        <Button
          variant="outlined"
          size="large"
          onClick={handleViewAllCourses}
          sx={{ mr: 2 }}
        >
          Browse All Courses
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={() => navigate('/courses/enroll')}
        >
          Enroll in New Course
        </Button>
      </Box>
    </Container>
  );
};

export default CourseSelectionPage;