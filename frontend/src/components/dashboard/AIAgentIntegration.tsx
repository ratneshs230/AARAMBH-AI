import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  Button,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  Badge,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Psychology as AIIcon,
  School as TeacherIcon,
  Palette as DesignerIcon,
  SportsEsports as GameMasterIcon,
  Analytics as WatcherIcon,
  FitnessCenter as CoachIcon,
  ConnectWithoutContact as MatchmakerIcon,
  Shield as FacilitatorIcon,
  Chat as ChatIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingIcon,
  Lightbulb as LightbulbIcon,
  Speed as PerformanceIcon,
  Group as GroupIcon,
  Security as SecurityIcon,
  AutoAwesome as AutoIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

interface AIAgent {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
  status: 'online' | 'busy' | 'offline';
  capabilities: string[];
  lastInteraction: string;
  performance: {
    responseTime: number;
    accuracy: number;
    satisfaction: number;
    totalInteractions: number;
  };
  specializations: string[];
  currentTask?: string;
  suggestions: AgentSuggestion[];
}

interface AgentSuggestion {
  id: string;
  type: 'study_plan' | 'practice' | 'content' | 'schedule' | 'collaboration';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: number;
  agentId: string;
}

interface AIInsight {
  id: string;
  agentId: string;
  type: 'recommendation' | 'warning' | 'achievement' | 'trend';
  title: string;
  message: string;
  confidence: number;
  timestamp: string;
  actionable: boolean;
  metadata?: Record<string, any>;
}

interface Props {
  agents: AIAgent[];
  insights: AIInsight[];
  onAgentInteraction: (agentId: string, message: string) => void;
  onAcceptSuggestion: (suggestionId: string) => void;
  onDismissInsight: (insightId: string) => void;
  onRefreshAgentData: () => void;
  isLoading: boolean;
}

const AIAgentIntegration: React.FC<Props> = ({
  agents,
  insights,
  onAgentInteraction,
  onAcceptSuggestion,
  onDismissInsight,
  onRefreshAgentData,
  isLoading,
}) => {
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [autoSuggestionsEnabled, setAutoSuggestionsEnabled] = useState(true);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'success.main';
      case 'busy': return 'warning.main';
      case 'offline': return 'error.main';
      default: return 'grey.500';
    }
  };

  const getAgentIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'teacher': return <TeacherIcon />;
      case 'designer': return <DesignerIcon />;
      case 'game master': return <GameMasterIcon />;
      case 'personal watcher': return <WatcherIcon />;
      case 'adaptive coach': return <CoachIcon />;
      case 'matchmaker': return <MatchmakerIcon />;
      case 'facilitator': return <FacilitatorIcon />;
      default: return <AIIcon />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'recommendation': return <LightbulbIcon color="primary" />;
      case 'warning': return <WarningIcon color="warning" />;
      case 'achievement': return <CheckIcon color="success" />;
      case 'trend': return <TrendingIcon color="info" />;
      default: return <AIIcon />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const handleAgentChat = (agent: AIAgent) => {
    setSelectedAgent(agent);
    setChatDialogOpen(true);
  };

  const handleSendMessage = () => {
    if (selectedAgent && chatMessage.trim()) {
      onAgentInteraction(selectedAgent.id, chatMessage);
      setChatMessage('');
      setChatDialogOpen(false);
    }
  };

  const activeAgents = agents.filter(a => a.status !== 'offline');
  const totalSuggestions = agents.reduce((acc, agent) => acc + agent.suggestions.length, 0);
  const highPriorityInsights = insights.filter(i => i.type === 'warning' || i.confidence > 0.8);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <AIIcon sx={{ mr: 1 }} />
          AI Agents & Intelligence
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={autoSuggestionsEnabled}
                onChange={(e) => setAutoSuggestionsEnabled(e.target.checked)}
              />
            }
            label="Auto Suggestions"
          />
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onRefreshAgentData}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AIIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {activeAgents.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Agents
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <LightbulbIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {totalSuggestions}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Suggestions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {insights.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                AI Insights
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PerformanceIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {Math.round(agents.reduce((acc, a) => acc + a.performance.accuracy, 0) / agents.length) || 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Accuracy
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* AI Agents */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AIIcon sx={{ mr: 1 }} />
                AI Agents Status
              </Typography>
              
              <Grid container spacing={2}>
                {agents.map((agent) => (
                  <Grid item xs={12} sm={6} key={agent.id}>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        height: '100%',
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: 2,
                        }
                      }}
                    >
                      {/* Agent Header */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: getStatusColor(agent.status),
                                border: '2px solid white',
                              }}
                            />
                          }
                        >
                          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                            {getAgentIcon(agent.role)}
                          </Avatar>
                        </Badge>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {agent.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {agent.role}
                          </Typography>
                        </Box>
                        <IconButton 
                          size="small"
                          onClick={() => handleAgentChat(agent)}
                          disabled={agent.status === 'offline'}
                        >
                          <ChatIcon />
                        </IconButton>
                      </Box>

                      {/* Agent Status */}
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {agent.description}
                      </Typography>

                      {/* Current Task */}
                      {agent.currentTask && (
                        <Alert severity="info" sx={{ mb: 2, py: 0 }}>
                          <Typography variant="caption">
                            Currently: {agent.currentTask}
                          </Typography>
                        </Alert>
                      )}

                      {/* Performance Metrics */}
                      <Stack spacing={1} sx={{ mb: 2 }}>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">Response Time</Typography>
                            <Typography variant="caption">{agent.performance.responseTime}ms</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.max(0, 100 - (agent.performance.responseTime / 10))}
                            sx={{ height: 4 }}
                          />
                        </Box>
                        
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">Accuracy</Typography>
                            <Typography variant="caption">{agent.performance.accuracy}%</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={agent.performance.accuracy}
                            sx={{ height: 4 }}
                            color="success"
                          />
                        </Box>
                      </Stack>

                      {/* Capabilities */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                        {agent.capabilities.slice(0, 3).map((capability) => (
                          <Chip
                            key={capability}
                            label={capability}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                        {agent.capabilities.length > 3 && (
                          <Chip
                            label={`+${agent.capabilities.length - 3} more`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>

                      {/* Suggestions */}
                      {agent.suggestions.length > 0 && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {agent.suggestions.length} suggestion(s) available
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            {agent.suggestions.slice(0, 2).map((suggestion) => (
                              <Paper 
                                key={suggestion.id}
                                sx={{ 
                                  p: 1, 
                                  mb: 1, 
                                  bgcolor: 'grey.50',
                                  border: '1px solid',
                                  borderColor: 'grey.200'
                                }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                      {suggestion.title}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                      {suggestion.description}
                                    </Typography>
                                  </Box>
                                  <Button
                                    size="small"
                                    variant="text"
                                    onClick={() => onAcceptSuggestion(suggestion.id)}
                                    sx={{ ml: 1 }}
                                  >
                                    Accept
                                  </Button>
                                </Box>
                              </Paper>
                            ))}
                          </Box>
                        </Box>
                      )}

                      {/* Interaction Button */}
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        startIcon={<ChatIcon />}
                        onClick={() => handleAgentChat(agent)}
                        disabled={agent.status === 'offline'}
                        sx={{ mt: 1 }}
                      >
                        Interact with {agent.name}
                      </Button>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* AI Insights */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AutoIcon sx={{ mr: 1 }} />
                AI Insights & Recommendations
              </Typography>
              
              {insights.length > 0 ? (
                <List>
                  {insights.slice(0, 5).map((insight, index) => (
                    <React.Fragment key={insight.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {getInsightIcon(insight.type)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                {insight.title}
                              </Typography>
                              <Chip
                                label={`${Math.round(insight.confidence * 100)}%`}
                                size="small"
                                color={insight.confidence > 0.8 ? 'success' : insight.confidence > 0.6 ? 'warning' : 'default'}
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {insight.message}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(insight.timestamp).toLocaleDateString()} • 
                                {agents.find(a => a.id === insight.agentId)?.name || 'AI System'}
                              </Typography>
                              {insight.actionable && (
                                <Box sx={{ mt: 1 }}>
                                  <Button
                                    size="small"
                                    variant="text"
                                    color="primary"
                                  >
                                    Take Action
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="text"
                                    color="secondary"
                                    onClick={() => onDismissInsight(insight.id)}
                                  >
                                    Dismiss
                                  </Button>
                                </Box>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < insights.length - 1 && index < 4 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <AutoIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No insights yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    AI agents are analyzing your data to provide personalized insights
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* High Priority Alerts */}
          {highPriorityInsights.length > 0 && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
                  Priority Alerts
                </Typography>
                
                <Stack spacing={1}>
                  {highPriorityInsights.map((insight) => (
                    <Alert 
                      key={insight.id}
                      severity={insight.type === 'warning' ? 'warning' : 'info'}
                      action={
                        <IconButton
                          size="small"
                          onClick={() => onDismissInsight(insight.id)}
                        >
                          <ErrorIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {insight.title}
                      </Typography>
                      <Typography variant="body2">
                        {insight.message}
                      </Typography>
                    </Alert>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Chat Dialog */}
      <Dialog
        open={chatDialogOpen}
        onClose={() => setChatDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          {selectedAgent && (
            <>
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                {getAgentIcon(selectedAgent.role)}
              </Avatar>
              Chat with {selectedAgent.name}
            </>
          )}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {selectedAgent?.description}
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder={`Ask ${selectedAgent?.name} anything...`}
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChatDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSendMessage}
            disabled={!chatMessage.trim()}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading Overlay */}
      {isLoading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6">
              AI Agents are thinking...
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default AIAgentIntegration;