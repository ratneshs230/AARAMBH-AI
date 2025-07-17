import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  Divider,
  Container,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Quiz as QuizIcon,
  MenuBook as LessonsIcon,
  SportsEsports as GamesIcon,
  People as CommunityIcon,
  Analytics as AnalyticsIcon,
  Folder as ContentIcon,
  School as CourseIcon,
  Person as ProfileIcon,
  Work as WorkspaceIcon,
  LocalFireDepartment as StreakIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendingIcon,
  EmojiEvents as AchievementIcon,
  Notifications as NotificationIcon,
  Group as GroupIcon,
  CheckCircle as CompletedIcon,
} from '@mui/icons-material';
import { ROUTES } from '@/utils/constants';

interface CourseProgress {
  courseId: string;
  courseName: string;
  subject: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  lastAccessed: string;
  timeRemaining: string;
  currentLesson: {
    id: string;
    title: string;
    type: 'video' | 'quiz' | 'assignment';
  };
}

interface StudentStats {
  currentStreak: number;
  totalStudyTime: number;
  todayStudyTime: number;
  weeklyGoal: number;
  weeklyProgress: number;
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  type: 'streak' | 'completion' | 'time' | 'social';
}

interface RecentActivity {
  id: string;
  type: 'lesson_completed' | 'quiz_completed' | 'achievement_unlocked' | 'group_joined';
  title: string;
  description: string;
  timestamp: string;
  score?: number;
  icon: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  color: string;
}

// Mock course detail data
const mockCourseDetail: CourseDetail = {
  id: '1',
  title: 'Complete Mathematics for Class 12',
  description:
    'Comprehensive course covering all topics in Class 12 Mathematics including Calculus, Algebra, and Geometry.',
  fullDescription: `This comprehensive Class 12 Mathematics course is designed to provide students with a thorough understanding of all key mathematical concepts required for board exams and competitive entrance tests like JEE Main and Advanced.

The course covers all major topics including:
- Calculus (Limits, Continuity, Differentiation, Integration)
- Algebra (Complex Numbers, Quadratic Equations, Sequences and Series)
- Coordinate Geometry (3D Geometry, Vector Algebra)
- Probability and Statistics
- Linear Programming

Each topic is explained with detailed theory, solved examples, and practice problems. The course includes video lectures, interactive quizzes, and comprehensive study materials.`,
  instructor: {
    name: 'Dr. Priya Sharma',
    avatar: '/avatars/instructor1.jpg',
    bio: 'Dr. Priya Sharma is a renowned mathematics educator with over 15 years of teaching experience. She holds a Ph.D. in Mathematics from IIT Delhi and has helped thousands of students excel in their board exams and competitive tests.',
    rating: 4.8,
    students: 25000,
  },
  thumbnail: '/courses/math12.jpg',
  duration: '120 hours',
  level: 'Class 12',
  subject: 'Mathematics',
  rating: 4.8,
  reviewCount: 1250,
  studentsEnrolled: 2450,
  price: 2999,
  originalPrice: 4999,
  isBookmarked: false,
  isEnrolled: true,
  progress: 65,
  tags: ['CBSE', 'JEE Preparation', 'Board Exam', 'Mathematics'],
  chapters: [
    {
      id: 'ch1',
      title: 'Relations and Functions',
      duration: '12 hours',
      isCompleted: true,
      lessons: [
        {
          id: 'l1',
          title: 'Introduction to Relations',
          duration: '45 min',
          type: 'video',
          isCompleted: true,
          isLocked: false,
        },
        {
          id: 'l2',
          title: 'Types of Relations',
          duration: '30 min',
          type: 'video',
          isCompleted: true,
          isLocked: false,
        },
        {
          id: 'l3',
          title: 'Functions and their Properties',
          duration: '50 min',
          type: 'video',
          isCompleted: true,
          isLocked: false,
        },
        {
          id: 'l4',
          title: 'Practice Quiz',
          duration: '20 min',
          type: 'quiz',
          isCompleted: true,
          isLocked: false,
        },
      ],
    },
    {
      id: 'ch2',
      title: 'Inverse Trigonometric Functions',
      duration: '10 hours',
      isCompleted: false,
      lessons: [
        {
          id: 'l5',
          title: 'Basic Concepts',
          duration: '40 min',
          type: 'video',
          isCompleted: true,
          isLocked: false,
          preview: true,
        },
        {
          id: 'l6',
          title: 'Properties and Identities',
          duration: '45 min',
          type: 'video',
          isCompleted: false,
          isLocked: false,
        },
        {
          id: 'l7',
          title: 'Solving Equations',
          duration: '35 min',
          type: 'video',
          isCompleted: false,
          isLocked: false,
        },
        {
          id: 'l8',
          title: 'Practice Problems',
          duration: '25 min',
          type: 'quiz',
          isCompleted: false,
          isLocked: false,
        },
      ],
    },
    {
      id: 'ch3',
      title: 'Matrices',
      duration: '15 hours',
      isCompleted: false,
      lessons: [
        {
          id: 'l9',
          title: 'Introduction to Matrices',
          duration: '50 min',
          type: 'video',
          isCompleted: false,
          isLocked: true,
        },
        {
          id: 'l10',
          title: 'Matrix Operations',
          duration: '60 min',
          type: 'video',
          isCompleted: false,
          isLocked: true,
        },
        {
          id: 'l11',
          title: 'Determinants',
          duration: '55 min',
          type: 'video',
          isCompleted: false,
          isLocked: true,
        },
        {
          id: 'l12',
          title: 'Matrix Assessment',
          duration: '30 min',
          type: 'quiz',
          isCompleted: false,
          isLocked: true,
        },
      ],
    },
  ],
  learningOutcomes: [
    'Master all Class 12 Mathematics concepts',
    'Solve complex calculus problems with confidence',
    'Apply mathematical concepts to real-world scenarios',
    'Prepare effectively for board exams and JEE',
    'Develop analytical and problem-solving skills',
  ],
  requirements: [
    'Basic understanding of Class 11 Mathematics',
    'Willingness to practice regularly',
    'Access to calculator (scientific calculator recommended)',
    'Notebook for taking notes and solving problems',
  ],
  features: [
    'HD video lectures',
    'Downloadable study materials',
    'Interactive quizzes and assessments',
    'Doubt clearing sessions',
    'Certificate of completion',
    'Lifetime access',
  ],
};

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCourse(mockCourseDetail);
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleBookmarkToggle = () => {
    if (course) {
      setCourse({ ...course, isBookmarked: !course.isBookmarked });
    }
  };

  const handleEnroll = () => {
    if (course) {
      setCourse({ ...course, isEnrolled: true });
    }
  };

  const getLessonIcon = (lesson: Lesson) => {
    if (lesson.isCompleted) return <CompletedIcon color='success' />;
    if (lesson.isLocked) return <LockedIcon color='disabled' />;

    switch (lesson.type) {
      case 'video':
        return <PlayIcon color='primary' />;
      case 'article':
        return <LessonIcon color='primary' />;
      case 'quiz':
        return <QuizIcon color='primary' />;
      default:
        return <LessonIcon color='primary' />;
    }
  };

  const tabs = ['Overview', 'Curriculum', 'Instructor', 'Reviews'];

  if (loading || !course) {
    return <Box>Loading...</Box>;
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color='inherit' href='#' onClick={() => navigate(ROUTES.HOME)}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize='inherit' />
          Home
        </Link>
        <Link color='inherit' href='#' onClick={() => navigate(ROUTES.COURSES)}>
          <SchoolIcon sx={{ mr: 0.5 }} fontSize='inherit' />
          Courses
        </Link>
        <Typography color='text.primary'>{course.title}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid size={{ xs: 12, lg: 8 }}>
          {/* Course Header */}
          <Card sx={{ mb: 3 }}>
            <Box
              component='img'
              src={course.thumbnail}
              alt={course.title}
              sx={{
                width: '100%',
                height: 300,
                objectFit: 'cover',
              }}
            />
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 2,
                }}
              >
                <Typography variant='h4' component='h1' fontWeight={600}>
                  {course.title}
                </Typography>
                <Box>
                  <IconButton onClick={handleBookmarkToggle}>
                    {course.isBookmarked ? <BookmarkedIcon color='primary' /> : <BookmarkIcon />}
                  </IconButton>
                  <IconButton>
                    <ShareIcon />
                  </IconButton>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Rating value={course.rating} readOnly size='small' />
                <Typography variant='body2'>
                  {course.rating} ({course.reviewCount} reviews)
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {course.studentsEnrolled.toLocaleString()} students
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {course.tags.map((tag, index) => (
                  <Chip key={index} label={tag} size='small' color='primary' variant='outlined' />
                ))}
              </Box>

              {course.isEnrolled && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant='body2'>Course Progress</Typography>
                    <Typography variant='body2'>{course.progress}%</Typography>
                  </Box>
                  <LinearProgress variant='determinate' value={course.progress} />
                </Box>
              )}

              <Typography variant='body1' color='text.secondary'>
                {course.description}
              </Typography>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
                {tabs.map((tab, index) => (
                  <Tab key={index} label={tab} />
                ))}
              </Tabs>
            </Box>

            <CardContent>
              {/* Overview Tab */}
              {selectedTab === 0 && (
                <Box>
                  <Typography variant='h6' gutterBottom>
                    About this course
                  </Typography>
                  <Typography variant='body1' paragraph sx={{ whiteSpace: 'pre-line' }}>
                    {course.fullDescription}
                  </Typography>

                  <Typography variant='h6' gutterBottom sx={{ mt: 3 }}>
                    What you'll learn
                  </Typography>
                  <List>
                    {course.learningOutcomes.map((outcome, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CompletedIcon color='success' />
                        </ListItemIcon>
                        <ListItemText primary={outcome} />
                      </ListItem>
                    ))}
                  </List>

                  <Typography variant='h6' gutterBottom sx={{ mt: 3 }}>
                    Course Features
                  </Typography>
                  <Grid container spacing={2}>
                    {course.features.map((feature, index) => (
                      <Grid size={{ xs: 12, sm: 6 }} key={index}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CompletedIcon color='success' sx={{ mr: 1 }} />
                          <Typography variant='body2'>{feature}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  <Typography variant='h6' gutterBottom sx={{ mt: 3 }}>
                    Requirements
                  </Typography>
                  <List>
                    {course.requirements.map((requirement, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={requirement} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Curriculum Tab */}
              {selectedTab === 1 && (
                <Box>
                  <Typography variant='h6' gutterBottom>
                    Course Curriculum
                  </Typography>
                  <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                    {course.chapters.length} chapters • {course.duration} total content
                  </Typography>

                  {course.chapters.map(chapter => (
                    <Accordion key={chapter.id} defaultExpanded>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <Typography variant='subtitle1' sx={{ flexGrow: 1 }}>
                            {chapter.title}
                          </Typography>
                          <Typography variant='body2' color='text.secondary' sx={{ mr: 2 }}>
                            {chapter.duration}
                          </Typography>
                          {chapter.isCompleted && <CompletedIcon color='success' />}
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List>
                          {chapter.lessons.map((lesson, index) => (
                            <ListItem
                              key={lesson.id}
                              sx={{
                                cursor: lesson.isLocked ? 'default' : 'pointer',
                                '&:hover': lesson.isLocked ? {} : { bgcolor: 'action.hover' },
                              }}
                            >
                              <ListItemIcon>{getLessonIcon(lesson)}</ListItemIcon>
                              <ListItemText
                                primary={lesson.title}
                                secondary={`${lesson.duration} • ${lesson.type}`}
                                sx={{ opacity: lesson.isLocked ? 0.6 : 1 }}
                              />
                              {lesson.preview && (
                                <Chip
                                  label='Preview'
                                  size='small'
                                  color='primary'
                                  variant='outlined'
                                />
                              )}
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}

              {/* Instructor Tab */}
              {selectedTab === 2 && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar src={course.instructor.avatar} sx={{ width: 80, height: 80, mr: 3 }} />
                    <Box>
                      <Typography variant='h5'>{course.instructor.name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Rating value={course.instructor.rating} readOnly size='small' />
                        <Typography variant='body2' sx={{ ml: 1 }}>
                          {course.instructor.rating} rating
                        </Typography>
                      </Box>
                      <Typography variant='body2' color='text.secondary'>
                        {course.instructor.students.toLocaleString()} students
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant='body1'>{course.instructor.bio}</Typography>
                </Box>
              )}

              {/* Reviews Tab */}
              {selectedTab === 3 && (
                <Box>
                  <Typography variant='h6' gutterBottom>
                    Student Reviews
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Reviews feature coming soon...
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ position: 'sticky', top: 24 }}>
            <CardContent>
              {course.isEnrolled ? (
                <Button
                  variant='contained'
                  size='large'
                  fullWidth
                  startIcon={<PlayIcon />}
                  onClick={() => navigate(`${ROUTES.COURSES}/${course.id}/learn`)}
                  sx={{ mb: 2 }}
                >
                  Continue Learning
                </Button>
              ) : (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                    <Typography variant='h4' color='primary' component='span'>
                      ₹{course.price.toLocaleString()}
                    </Typography>
                    {course.originalPrice && (
                      <Typography
                        variant='h6'
                        color='text.secondary'
                        component='span'
                        sx={{ textDecoration: 'line-through', ml: 1 }}
                      >
                        ₹{course.originalPrice.toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                  <Button variant='contained' size='large' fullWidth onClick={handleEnroll}>
                    Enroll Now
                  </Button>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DurationIcon color='action' sx={{ mr: 1 }} />
                  <Typography variant='body2'>{course.duration} on-demand video</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <StudentsIcon color='action' sx={{ mr: 1 }} />
                  <Typography variant='body2'>
                    {course.studentsEnrolled.toLocaleString()} students enrolled
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CertificateIcon color='action' sx={{ mr: 1 }} />
                  <Typography variant='body2'>Certificate of completion</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <StarIcon color='action' sx={{ mr: 1 }} />
                  <Typography variant='body2'>Lifetime access</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CourseDetailPage;
