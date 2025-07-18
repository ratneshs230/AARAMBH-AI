import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Grid,
  Chip,
  Avatar,
  Stack,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  EmojiEvents as AchievementIcon,
  LocalFireDepartment as StreakIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  Book as BookIcon,
  Star as StarIcon,
} from '@mui/icons-material';

interface ProgressStats {
  courseProgress: number;
  weeklyGoal: number;
  weeklyProgress: number;
  todayStudyTime: number;
  totalStudyTime: number;
  currentStreak: number;
  completedLessons: number;
  totalLessons: number;
  averageScore: number;
  assignmentsCompleted: number;
  totalAssignments: number;
}

interface WeeklyProgressData {
  day: string;
  studyTime: number;
  lessonsCompleted: number;
  averageScore: number;
}

interface SubjectProgress {
  subject: string;
  progress: number;
  color: string;
  icon: React.ReactNode;
  timeSpent: number;
  lastActivity: string;
}

interface Props {
  stats: ProgressStats;
  weeklyData: WeeklyProgressData[];
  subjectProgress: SubjectProgress[];
}

const ProgressVisualization: React.FC<Props> = ({ 
  stats, 
  weeklyData, 
  subjectProgress 
}) => {
  const getStreakColor = (streak: number) => {
    if (streak >= 30) return '#ff6b35'; // orange-red
    if (streak >= 14) return '#f39c12'; // orange
    if (streak >= 7) return '#e67e22'; // orange
    return '#3498db'; // blue
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 75) return 'warning';
    return 'error';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'success.main';
    if (progress >= 60) return 'warning.main';
    return 'error.main';
  };

  return (
    <Box>
      {/* Main Progress Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Course Progress */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', position: 'relative' }}>
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                <CircularProgress
                  variant="determinate"
                  value={stats.courseProgress}
                  size={80}
                  thickness={6}
                  sx={{
                    color: getProgressColor(stats.courseProgress),
                  }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {stats.courseProgress}%
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h6" gutterBottom>
                Course Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.completedLessons}/{stats.totalLessons} lessons completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Study Streak */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <StreakIcon 
                sx={{ 
                  fontSize: 48, 
                  color: getStreakColor(stats.currentStreak),
                  mb: 1 
                }} 
              />
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold',
                  color: getStreakColor(stats.currentStreak)
                }}
              >
                {stats.currentStreak}
              </Typography>
              <Typography variant="h6" gutterBottom>
                Day Streak
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Keep it up! 🔥
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Weekly Goal */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ScheduleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Weekly Goal</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                {stats.weeklyProgress}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={stats.weeklyProgress}
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  mb: 1,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: stats.weeklyProgress >= 100 ? 'success.main' : 'primary.main',
                  }
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {Math.round((stats.weeklyProgress / 100) * stats.weeklyGoal)} / {stats.weeklyGoal} hours
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Average Score */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <StarIcon 
                sx={{ 
                  fontSize: 48, 
                  color: 'warning.main',
                  mb: 1 
                }} 
              />
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold',
                  color: getScoreColor(stats.averageScore) + '.main'
                }}
              >
                {stats.averageScore}%
              </Typography>
              <Typography variant="h6" gutterBottom>
                Average Score
              </Typography>
              <Chip
                label={stats.averageScore >= 90 ? 'Excellent' : stats.averageScore >= 75 ? 'Good' : 'Needs Improvement'}
                color={getScoreColor(stats.averageScore)}
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Weekly Progress Chart */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUpIcon sx={{ mr: 1 }} />
            Weekly Progress Overview
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {weeklyData.map((day, index) => (
              <Grid item xs key={index} sx={{ textAlign: 'center' }}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    height: 120,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    backgroundColor: day.studyTime > 0 ? 'primary.light' : 'grey.100',
                    color: day.studyTime > 0 ? 'white' : 'text.secondary'
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                    {day.day}
                  </Typography>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {day.studyTime}h
                    </Typography>
                    <Typography variant="caption">
                      {day.lessonsCompleted} lessons
                    </Typography>
                  </Box>
                  {day.averageScore > 0 && (
                    <Chip
                      label={`${day.averageScore}%`}
                      size="small"
                      sx={{ 
                        fontSize: '0.7rem', 
                        height: 20,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'inherit'
                      }}
                    />
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Subject-wise Progress */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <BookIcon sx={{ mr: 1 }} />
            Subject Progress
          </Typography>
          
          <Stack spacing={3} sx={{ mt: 2 }}>
            {subjectProgress.map((subject, index) => (
              <Box key={index}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: subject.color, 
                      width: 32, 
                      height: 32, 
                      mr: 2 
                    }}
                  >
                    {subject.icon}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {subject.subject}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {subject.progress}%
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {subject.timeSpent}h • Last activity: {subject.lastActivity}
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={subject.progress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: subject.color,
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AssignmentIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {stats.assignmentsCompleted}/{stats.totalAssignments}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Assignments Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <QuizIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {stats.todayStudyTime}h
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Today's Study Time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AchievementIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {stats.totalStudyTime}h
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Study Time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProgressVisualization;