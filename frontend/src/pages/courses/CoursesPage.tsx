import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Avatar,
  Rating,
  IconButton,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  BookmarkBorder as BookmarkIcon,
  Bookmark as BookmarkedIcon,
  Schedule as DurationIcon,
  People as StudentsIcon,
  School as LevelIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTES, SUBJECTS, EDUCATION_LEVELS } from '@/utils/constants';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorAvatar: string;
  thumbnail: string;
  duration: string;
  level: string;
  subject: string;
  rating: number;
  studentsEnrolled: number;
  price: number;
  originalPrice?: number;
  isBookmarked: boolean;
  tags: string[];
  progress?: number;
}

// Mock course data
const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Complete Mathematics for Class 12',
    description: 'Comprehensive course covering all topics in Class 12 Mathematics including Calculus, Algebra, and Geometry.',
    instructor: 'Dr. Priya Sharma',
    instructorAvatar: '/avatars/instructor1.jpg',
    thumbnail: '/courses/math12.jpg',
    duration: '120 hours',
    level: 'Class 12',
    subject: 'Mathematics',
    rating: 4.8,
    studentsEnrolled: 2450,
    price: 2999,
    originalPrice: 4999,
    isBookmarked: false,
    tags: ['CBSE', 'JEE Preparation', 'Board Exam'],
    progress: 65,
  },
  {
    id: '2',
    title: 'Physics Fundamentals - Motion and Force',
    description: 'Master the basics of Physics with detailed explanations of motion, force, and energy concepts.',
    instructor: 'Prof. Rajesh Kumar',
    instructorAvatar: '/avatars/instructor2.jpg',
    thumbnail: '/courses/physics.jpg',
    duration: '80 hours',
    level: 'Class 11',
    subject: 'Physics',
    rating: 4.6,
    studentsEnrolled: 1890,
    price: 1999,
    isBookmarked: true,
    tags: ['NCERT', 'Conceptual Learning'],
  },
  {
    id: '3',
    title: 'Organic Chemistry Made Easy',
    description: 'Simplify organic chemistry with easy-to-understand concepts and practical examples.',
    instructor: 'Dr. Anita Verma',
    instructorAvatar: '/avatars/instructor3.jpg',
    thumbnail: '/courses/chemistry.jpg',
    duration: '95 hours',
    level: 'Class 12',
    subject: 'Chemistry',
    rating: 4.7,
    studentsEnrolled: 3200,
    price: 2499,
    originalPrice: 3999,
    isBookmarked: false,
    tags: ['NEET Preparation', 'JEE Advanced'],
  },
  {
    id: '4',
    title: 'English Literature & Communication',
    description: 'Enhance your English skills with literature analysis and communication techniques.',
    instructor: 'Ms. Sarah Johnson',
    instructorAvatar: '/avatars/instructor4.jpg',
    thumbnail: '/courses/english.jpg',
    duration: '60 hours',
    level: 'Class 10',
    subject: 'English',
    rating: 4.5,
    studentsEnrolled: 1560,
    price: 1499,
    isBookmarked: false,
    tags: ['Language Skills', 'Board Exam'],
  },
];

const CoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCourses(mockCourses);
      setLoading(false);
    }, 1000);
  }, []);

  const handleBookmarkToggle = (courseId: string) => {
    setCourses(prevCourses =>
      prevCourses.map(course =>
        course.id === courseId ? { ...course, isBookmarked: !course.isBookmarked } : course
      )
    );
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSubject = !subjectFilter || course.subject === subjectFilter;
    const matchesLevel = !levelFilter || course.level === levelFilter;
    
    const matchesTab = selectedTab === 0 || 
                      (selectedTab === 1 && course.progress !== undefined) ||
                      (selectedTab === 2 && course.isBookmarked);

    return matchesSearch && matchesSubject && matchesLevel && matchesTab;
  });

  const tabs = ['All Courses', 'My Courses', 'Bookmarked'];

  const CourseCard: React.FC<{ course: Course }> = ({ course }) => (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={course.thumbnail}
          alt={course.title}
          sx={{ objectFit: 'cover' }}
        />
        <IconButton
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
          }}
          onClick={() => handleBookmarkToggle(course.id)}
        >
          {course.isBookmarked ? <BookmarkedIcon color="primary" /> : <BookmarkIcon />}
        </IconButton>
        
        {course.progress !== undefined && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              bgcolor: 'primary.main',
              color: 'white',
              px: 2,
              py: 0.5,
            }}
          >
            <Typography variant="caption">Progress: {course.progress}%</Typography>
          </Box>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" component="h2" gutterBottom>
          {course.title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
          {course.description}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar src={course.instructorAvatar} sx={{ width: 32, height: 32, mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {course.instructor}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Rating value={course.rating} readOnly size="small" />
            <Typography variant="body2" color="text.secondary">
              ({course.rating})
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            <StudentsIcon sx={{ fontSize: 16, mr: 0.5 }} />
            {course.studentsEnrolled.toLocaleString()}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              icon={<DurationIcon />} 
              label={course.duration} 
              size="small" 
              variant="outlined" 
            />
            <Chip 
              icon={<LevelIcon />} 
              label={course.level} 
              size="small" 
              variant="outlined" 
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
          {course.tags.map((tag, index) => (
            <Chip 
              key={index} 
              label={tag} 
              size="small" 
              color="primary" 
              variant="outlined" 
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" color="primary" component="span">
              ₹{course.price.toLocaleString()}
            </Typography>
            {course.originalPrice && (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                component="span" 
                sx={{ textDecoration: 'line-through', ml: 1 }}
              >
                ₹{course.originalPrice.toLocaleString()}
              </Typography>
            )}
          </Box>
          
          <Button 
            variant="contained" 
            onClick={() => navigate(`${ROUTES.COURSES}/${course.id}`)}
          >
            {course.progress !== undefined ? 'Continue' : 'Enroll'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
          Courses 📚
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover and learn from our comprehensive course library
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                placeholder="Search courses, instructors, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  label="Subject"
                >
                  <MenuItem value="">All Subjects</MenuItem>
                  {SUBJECTS.map(subject => (
                    <MenuItem key={subject} value={subject}>
                      {subject}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Level</InputLabel>
                <Select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  label="Level"
                >
                  <MenuItem value="">All Levels</MenuItem>
                  {EDUCATION_LEVELS.map(level => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={selectedTab} 
          onChange={(_, newValue) => setSelectedTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab} />
          ))}
        </Tabs>
      </Box>

      {/* Course Grid */}
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Skeleton variant="text" width={80} />
                    <Skeleton variant="rectangular" width={100} height={36} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          {filteredCourses.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No courses found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search criteria or filters
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {filteredCourses.map((course) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={course.id}>
                  <CourseCard course={course} />
                </Grid>
              ))}
            </Grid>
          )}
          
          {/* Results count */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredCourses.length} of {courses.length} courses
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

export default CoursesPage;