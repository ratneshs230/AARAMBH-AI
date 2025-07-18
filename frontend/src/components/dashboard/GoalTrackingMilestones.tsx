import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  LinearProgress,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondary,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  Stack,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
} from '@mui/material';
import {
  EmojiEvents as GoalIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Flag as MilestoneIcon,
  Schedule as ScheduleIcon,
  TrendingUp as ProgressIcon,
  CheckCircle as CompletedIcon,
  RadioButtonUnchecked as PendingIcon,
  PlayArrow as StartIcon,
  Pause as PauseIcon,
  AccessTime as TimeIcon,
  Star as StarIcon,
  Timeline as TimelineIcon,
  Assignment as TaskIcon,
  Quiz as QuizIcon,
  School as CourseIcon,
  LocalFireDepartment as StreakIcon,
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  Celebration as CelebrationIcon,
} from '@mui/icons-material';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'academic' | 'skill' | 'exam' | 'course' | 'habit';
  priority: 'low' | 'medium' | 'high';
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  targetDate: string;
  createdAt: string;
  progress: number;
  milestones: Milestone[];
  metrics: {
    totalTasks: number;
    completedTasks: number;
    timeSpent: number;
    estimatedTime: number;
  };
  rewards?: {
    points: number;
    badge?: string;
    unlocks?: string[];
  };
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  isCompleted: boolean;
  completedAt?: string;
  tasks: Task[];
  progress: number;
  order: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'study' | 'practice' | 'assignment' | 'quiz' | 'reading';
  estimatedMinutes: number;
  isCompleted: boolean;
  completedAt?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface NewGoalData {
  title: string;
  description: string;
  category: 'academic' | 'skill' | 'exam' | 'course' | 'habit';
  priority: 'low' | 'medium' | 'high';
  targetDate: string;
  estimatedTime: number;
}

interface Props {
  goals: Goal[];
  onCreateGoal: (goal: NewGoalData) => void;
  onUpdateGoal: (goalId: string, updates: Partial<Goal>) => void;
  onDeleteGoal: (goalId: string) => void;
  onCompleteMilestone: (goalId: string, milestoneId: string) => void;
  onCompleteTask: (goalId: string, milestoneId: string, taskId: string) => void;
  onStartGoal: (goalId: string) => void;
  onPauseGoal: (goalId: string) => void;
}

const GoalTrackingMilestones: React.FC<Props> = ({
  goals,
  onCreateGoal,
  onUpdateGoal,
  onDeleteGoal,
  onCompleteMilestone,
  onCompleteTask,
  onStartGoal,
  onPauseGoal,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [newGoal, setNewGoal] = useState<NewGoalData>({
    title: '',
    description: '',
    category: 'academic',
    priority: 'medium',
    targetDate: '',
    estimatedTime: 30,
  });

  const categories = [
    { value: 'academic', label: 'Academic', icon: <CourseIcon /> },
    { value: 'skill', label: 'Skill Development', icon: <ProgressIcon /> },
    { value: 'exam', label: 'Exam Preparation', icon: <QuizIcon /> },
    { value: 'course', label: 'Course Completion', icon: <CourseIcon /> },
    { value: 'habit', label: 'Study Habits', icon: <StreakIcon /> },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'primary';
      case 'paused': return 'warning';
      case 'not_started': return 'default';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.icon || <GoalIcon />;
  };

  const getTimeRemaining = (targetDate: string) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    if (days === 1) return '1 day left';
    if (days <= 7) return `${days} days left`;
    if (days <= 30) return `${Math.ceil(days / 7)} weeks left`;
    return `${Math.ceil(days / 30)} months left`;
  };

  const handleCreateGoal = () => {
    onCreateGoal(newGoal);
    setNewGoal({
      title: '',
      description: '',
      category: 'academic',
      priority: 'medium',
      targetDate: '',
      estimatedTime: 30,
    });
    setCreateDialogOpen(false);
  };

  const activeGoals = goals.filter(g => g.status === 'in_progress');
  const completedGoals = goals.filter(g => g.status === 'completed');
  const plannedGoals = goals.filter(g => g.status === 'not_started');

  const totalProgress = goals.length > 0 
    ? Math.round(goals.reduce((acc, goal) => acc + goal.progress, 0) / goals.length)
    : 0;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <GoalIcon sx={{ mr: 1 }} />
          Goals & Milestones
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Create New Goal
        </Button>
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <GoalIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {goals.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Goals
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ProgressIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {activeGoals.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Goals
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CompletedIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {completedGoals.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
                <CircularProgress
                  variant="determinate"
                  value={totalProgress}
                  size={60}
                  thickness={6}
                  sx={{ color: 'primary.main' }}
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
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {totalProgress}%
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Overall Progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Goal Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={`Active (${activeGoals.length})`} />
          <Tab label={`Planned (${plannedGoals.length})`} />
          <Tab label={`Completed (${completedGoals.length})`} />
          <Tab label="All Goals" />
        </Tabs>
      </Paper>

      {/* Goals List */}
      <Grid container spacing={3}>
        {(activeTab === 0 ? activeGoals :
          activeTab === 1 ? plannedGoals :
          activeTab === 2 ? completedGoals :
          goals
        ).map((goal) => (
          <Grid item xs={12} lg={6} key={goal.id}>
            <Card 
              sx={{ 
                height: '100%',
                border: goal.priority === 'high' ? '2px solid' : '1px solid',
                borderColor: goal.priority === 'high' ? 'error.main' : 'divider',
              }}
            >
              <CardContent>
                {/* Goal Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                        {getCategoryIcon(goal.category)}
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {goal.title}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Chip 
                        label={goal.status.replace('_', ' ')} 
                        color={getStatusColor(goal.status)}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                      <Chip 
                        label={goal.priority} 
                        color={getPriorityColor(goal.priority)}
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: 'capitalize' }}
                      />
                      <Chip 
                        label={goal.category} 
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </Box>
                  </Box>
                  
                  <Box>
                    <IconButton size="small" onClick={() => setSelectedGoal(goal)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => onDeleteGoal(goal.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                {/* Goal Description */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {goal.description}
                </Typography>

                {/* Progress */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2">Progress</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {goal.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={goal.progress}
                    sx={{ height: 8, borderRadius: 4 }}
                    color={goal.progress >= 80 ? 'success' : goal.progress >= 50 ? 'warning' : 'primary'}
                  />
                </Box>

                {/* Metrics */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 1, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Tasks
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {goal.metrics.completedTasks}/{goal.metrics.totalTasks}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 1, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Time Spent
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {Math.round(goal.metrics.timeSpent)}h
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Timeline */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ScheduleIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {getTimeRemaining(goal.targetDate)}
                  </Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    Due: {new Date(goal.targetDate).toLocaleDateString()}
                  </Typography>
                </Box>

                {/* Milestones Accordion */}
                <Accordion sx={{ mt: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">
                      Milestones ({goal.milestones.filter(m => m.isCompleted).length}/{goal.milestones.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stepper orientation="vertical">
                      {goal.milestones.sort((a, b) => a.order - b.order).map((milestone) => (
                        <Step key={milestone.id} active={!milestone.isCompleted} completed={milestone.isCompleted}>
                          <StepLabel
                            StepIconComponent={() => 
                              milestone.isCompleted ? 
                                <CompletedIcon color="success" /> : 
                                <PendingIcon color="action" />
                            }
                          >
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {milestone.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Due: {new Date(milestone.targetDate).toLocaleDateString()}
                            </Typography>
                          </StepLabel>
                          <StepContent>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {milestone.description}
                            </Typography>
                            
                            <LinearProgress
                              variant="determinate"
                              value={milestone.progress}
                              sx={{ mb: 1, height: 4 }}
                            />
                            
                            <List dense>
                              {milestone.tasks.slice(0, 3).map((task) => (
                                <ListItem key={task.id} sx={{ px: 0 }}>
                                  <ListItemIcon sx={{ minWidth: 24 }}>
                                    {task.isCompleted ? 
                                      <CompletedIcon color="success" fontSize="small" /> : 
                                      <PendingIcon color="action" fontSize="small" />
                                    }
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={task.title}
                                    primaryTypographyProps={{ variant: 'caption' }}
                                  />
                                </ListItem>
                              ))}
                              {milestone.tasks.length > 3 && (
                                <Typography variant="caption" color="text.secondary">
                                  +{milestone.tasks.length - 3} more tasks
                                </Typography>
                              )}
                            </List>
                            
                            {!milestone.isCompleted && (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => onCompleteMilestone(goal.id, milestone.id)}
                                sx={{ mt: 1 }}
                              >
                                Mark Complete
                              </Button>
                            )}
                          </StepContent>
                        </Step>
                      ))}
                    </Stepper>
                  </AccordionDetails>
                </Accordion>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  {goal.status === 'not_started' ? (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<StartIcon />}
                      onClick={() => onStartGoal(goal.id)}
                      sx={{ flexGrow: 1 }}
                    >
                      Start Goal
                    </Button>
                  ) : goal.status === 'in_progress' ? (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PauseIcon />}
                      onClick={() => onPauseGoal(goal.id)}
                      color="warning"
                    >
                      Pause
                    </Button>
                  ) : goal.status === 'completed' ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                      <CelebrationIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                        Completed!
                      </Typography>
                      {goal.rewards && (
                        <Chip
                          label={`+${goal.rewards.points} pts`}
                          color="success"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  ) : null}
                  
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setSelectedGoal(goal)}
                  >
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {goals.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <GoalIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No goals yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Create your first goal to start tracking your academic progress
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Your First Goal
          </Button>
        </Box>
      )}

      {/* Create Goal Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Goal</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Goal Title"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                placeholder="e.g., Master Calculus by December"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                placeholder="Describe what you want to achieve and why it's important"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as any })}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newGoal.priority}
                  onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as any })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="date"
                label="Target Date"
                InputLabelProps={{ shrink: true }}
                value={newGoal.targetDate}
                onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Estimated Time (hours)"
                value={newGoal.estimatedTime}
                onChange={(e) => setNewGoal({ ...newGoal, estimatedTime: parseInt(e.target.value) })}
                inputProps={{ min: 1, max: 1000 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateGoal}
            disabled={!newGoal.title || !newGoal.targetDate}
          >
            Create Goal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GoalTrackingMilestones;