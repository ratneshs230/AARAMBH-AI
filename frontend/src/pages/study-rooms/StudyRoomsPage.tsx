import React, { useState, useEffect, useRef } from 'react';
import Grid from '@mui/material/Grid';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Avatar,
  Badge,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  Tabs,
  Tab,
  Fab,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  VideoCall as VideoIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  ScreenShare as ScreenShareIcon,
  Chat as ChatIcon,
  Group as GroupIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  ExitToApp as LeaveIcon,
  School as SubjectIcon,
  Timer as TimerIcon,
  Lightbulb as IdeaIcon,
} from '@mui/icons-material';
import { io, Socket } from 'socket.io-client';

interface StudyRoom {
  id: string;
  name: string;
  subject: string;
  description: string;
  participants: Participant[];
  maxParticipants: number;
  isPrivate: boolean;
  createdBy: string;
  createdAt: string;
  sessionDuration: number;
  focusLevel: 'low' | 'medium' | 'high';
  roomType: 'study' | 'discussion' | 'exam-prep' | 'project';
}

interface Participant {
  id: string;
  name: string;
  avatar: string;
  role: 'host' | 'participant';
  isOnline: boolean;
  joinedAt: string;
  studyStreak: number;
  contributionScore: number;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'file' | 'whiteboard' | 'ai-insight';
}

const StudyRoomsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [studyRooms, setStudyRooms] = useState<StudyRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<StudyRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [studyTimer, setStudyTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [settingsMenu, setSettingsMenu] = useState<null | HTMLElement>(null);

  const socketRef = useRef<Socket | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [newRoom, setNewRoom] = useState({
    name: '',
    subject: '',
    description: '',
    maxParticipants: 6,
    isPrivate: false,
    focusLevel: 'medium' as const,
    roomType: 'study' as const,
  });

  // Mock data for demonstration
  useEffect(() => {
    setStudyRooms([
      {
        id: '1',
        name: 'Advanced Physics Study Group',
        subject: 'Physics',
        description: 'Quantum mechanics and electromagnetic theory discussion',
        participants: [
          {
            id: '1',
            name: 'Alice Johnson',
            avatar: 'AJ',
            role: 'host',
            isOnline: true,
            joinedAt: '2025-01-15T10:00:00Z',
            studyStreak: 15,
            contributionScore: 850,
          },
          {
            id: '2',
            name: 'Bob Smith',
            avatar: 'BS',
            role: 'participant',
            isOnline: true,
            joinedAt: '2025-01-15T10:05:00Z',
            studyStreak: 8,
            contributionScore: 420,
          },
        ],
        maxParticipants: 8,
        isPrivate: false,
        createdBy: '1',
        createdAt: '2025-01-15T09:00:00Z',
        sessionDuration: 7200,
        focusLevel: 'high',
        roomType: 'study',
      },
      {
        id: '2',
        name: 'Chemistry Lab Prep',
        subject: 'Chemistry',
        description: 'Preparing for organic chemistry lab experiments',
        participants: [
          {
            id: '3',
            name: 'Carol Davis',
            avatar: 'CD',
            role: 'host',
            isOnline: true,
            joinedAt: '2025-01-15T11:00:00Z',
            studyStreak: 22,
            contributionScore: 1200,
          },
        ],
        maxParticipants: 6,
        isPrivate: false,
        createdBy: '3',
        createdAt: '2025-01-15T10:30:00Z',
        sessionDuration: 5400,
        focusLevel: 'medium',
        roomType: 'exam-prep',
      },
    ]);
  }, []);

  // Socket.IO connection
  useEffect(() => {
    socketRef.current = io('http://localhost:5000');

    socketRef.current.on('new-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    socketRef.current.on('user-joined', (participant: Participant) => {
      if (currentRoom) {
        setCurrentRoom(prev =>
          prev
            ? {
                ...prev,
                participants: [...prev.participants, participant],
              }
            : null
        );
      }
    });

    socketRef.current.on('user-left', (userId: string) => {
      if (currentRoom) {
        setCurrentRoom(prev =>
          prev
            ? {
                ...prev,
                participants: prev.participants.filter(p => p.id !== userId),
              }
            : null
        );
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [currentRoom]);

  // Study timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && currentRoom) {
      interval = setInterval(() => {
        setStudyTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, currentRoom]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleJoinRoom = (room: StudyRoom) => {
    setCurrentRoom(room);
    setStudyTimer(0);
    setIsTimerRunning(true);
    socketRef.current?.emit('join-room', room.id);
  };

  const handleLeaveRoom = () => {
    if (currentRoom) {
      socketRef.current?.emit('leave-room', currentRoom.id);
      setCurrentRoom(null);
      setIsTimerRunning(false);
      setStudyTimer(0);
      setMessages([]);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && currentRoom) {
      const message: Message = {
        id: Date.now().toString(),
        userId: 'current-user',
        userName: 'You',
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        type: 'text',
      };

      socketRef.current?.emit('send-message', {
        roomId: currentRoom.id,
        message,
      });

      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const handleCreateRoom = () => {
    const room: StudyRoom = {
      id: Date.now().toString(),
      ...newRoom,
      participants: [],
      createdBy: 'current-user',
      createdAt: new Date().toISOString(),
      sessionDuration: 0,
    };

    setStudyRooms(prev => [...prev, room]);
    setIsCreateDialogOpen(false);
    setNewRoom({
      name: '',
      subject: '',
      description: '',
      maxParticipants: 6,
      isPrivate: false,
      focusLevel: 'medium',
      roomType: 'study',
    });
  };

  const toggleMic = () => setIsMicOn(!isMicOn);
  const toggleVideo = () => setIsVideoOn(!isVideoOn);
  const toggleScreenShare = () => setIsScreenSharing(!isScreenSharing);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRoomTypeColor = (
    type: string
  ): 'primary' | 'secondary' | 'warning' | 'success' | 'default' => {
    const colors = {
      study: 'primary' as const,
      discussion: 'secondary' as const,
      'exam-prep': 'warning' as const,
      project: 'success' as const,
    };
    return colors[type as keyof typeof colors] || 'default';
  };

  const getFocusLevelColor = (level: string): 'success' | 'warning' | 'error' | 'default' => {
    const colors = {
      low: 'success' as const,
      medium: 'warning' as const,
      high: 'error' as const,
    };
    return colors[level as keyof typeof colors] || 'default';
  };

  if (currentRoom) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Room Header */}
        <Paper sx={{ p: 2, borderRadius: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant='h5' component='h1' sx={{ fontWeight: 'bold' }}>
                {currentRoom.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip
                  label={currentRoom.subject}
                  color='primary'
                  size='small'
                  icon={<SubjectIcon />}
                />
                <Chip
                  label={currentRoom.roomType}
                  color={getRoomTypeColor(currentRoom.roomType)}
                  size='small'
                />
                <Chip
                  label={`Focus: ${currentRoom.focusLevel}`}
                  color={getFocusLevelColor(currentRoom.focusLevel)}
                  size='small'
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                icon={<TimerIcon />}
                label={formatTime(studyTimer)}
                color='primary'
                variant='outlined'
              />
              <Badge badgeContent={currentRoom.participants.length} color='primary'>
                <GroupIcon />
              </Badge>
              <IconButton onClick={e => setSettingsMenu(e.currentTarget)} color='primary'>
                <SettingsIcon />
              </IconButton>
              <Button
                variant='outlined'
                color='error'
                startIcon={<LeaveIcon />}
                onClick={handleLeaveRoom}
              >
                Leave
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Main Content */}
        <Grid container sx={{ flex: 1, height: '100%' }}>
          {/* Video/Screen Share Area */}
          <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flex: 1, position: 'relative', bgcolor: 'grey.900', p: 2 }}>
              <video
                ref={videoRef}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                autoPlay
                muted
              />

              {/* Participant Videos Grid */}
              <Grid
                container
                spacing={1}
                sx={{ position: 'absolute', top: 16, right: 16, maxWidth: 300 }}
              >
                {currentRoom.participants.map(participant => (
                  <Grid size={{ xs: 6 }} key={participant.id}>
                    <Card sx={{ minHeight: 100 }}>
                      <CardContent sx={{ p: 1, textAlign: 'center' }}>
                        <Avatar sx={{ width: 40, height: 40, mx: 'auto', mb: 1 }}>
                          {participant.avatar}
                        </Avatar>
                        <Typography variant='caption' display='block'>
                          {participant.name}
                        </Typography>
                        <Badge
                          color={participant.isOnline ? 'success' : 'error'}
                          variant='dot'
                          sx={{ '& .MuiBadge-badge': { right: 2, top: 2 } }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* AI Insights Overlay */}
              <Paper sx={{ position: 'absolute', bottom: 80, left: 16, p: 2, maxWidth: 400 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <IdeaIcon color='primary' />
                  <Typography variant='subtitle2' color='primary'>
                    AI Study Insight
                  </Typography>
                </Box>
                <Typography variant='body2'>
                  Based on your discussion, consider reviewing electromagnetic wave equations. The
                  group is showing strong engagement with quantum mechanics concepts.
                </Typography>
              </Paper>
            </Box>

            {/* Media Controls */}
            <Paper sx={{ p: 2, borderRadius: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Tooltip title={isMicOn ? 'Mute' : 'Unmute'}>
                  <IconButton
                    onClick={toggleMic}
                    color={isMicOn ? 'primary' : 'default'}
                    sx={{ bgcolor: isMicOn ? 'primary.light' : 'grey.200' }}
                  >
                    {isMicOn ? <MicIcon /> : <MicOffIcon />}
                  </IconButton>
                </Tooltip>

                <Tooltip title={isVideoOn ? 'Stop Video' : 'Start Video'}>
                  <IconButton
                    onClick={toggleVideo}
                    color={isVideoOn ? 'primary' : 'default'}
                    sx={{ bgcolor: isVideoOn ? 'primary.light' : 'grey.200' }}
                  >
                    {isVideoOn ? <VideocamIcon /> : <VideocamOffIcon />}
                  </IconButton>
                </Tooltip>

                <Tooltip title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}>
                  <IconButton
                    onClick={toggleScreenShare}
                    color={isScreenSharing ? 'secondary' : 'default'}
                    sx={{ bgcolor: isScreenSharing ? 'secondary.light' : 'grey.200' }}
                  >
                    <ScreenShareIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          </Grid>

          {/* Chat and Participants Sidebar */}
          <Grid size={{ xs: 12, md: 4 }} sx={{ borderLeft: '1px solid', borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant='fullWidth'
            >
              <Tab icon={<ChatIcon />} label='Chat' />
              <Tab icon={<GroupIcon />} label='Participants' />
            </Tabs>

            {activeTab === 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
                {/* Chat Messages */}
                <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
                  {messages.map(message => (
                    <Box key={message.id} sx={{ mb: 1 }}>
                      <Typography variant='caption' color='text.secondary'>
                        {message.userName} • {new Date(message.timestamp).toLocaleTimeString()}
                      </Typography>
                      <Paper sx={{ p: 1, mt: 0.5, bgcolor: 'grey.50' }}>
                        <Typography variant='body2'>{message.content}</Typography>
                      </Paper>
                    </Box>
                  ))}
                  <div ref={chatEndRef} />
                </Box>

                {/* Message Input */}
                <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                  <TextField
                    fullWidth
                    variant='outlined'
                    placeholder='Type a message...'
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                    multiline
                    maxRows={3}
                    size='small'
                  />
                  <Button
                    fullWidth
                    variant='contained'
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    sx={{ mt: 1 }}
                  >
                    Send
                  </Button>
                </Box>
              </Box>
            )}

            {activeTab === 1 && (
              <Box sx={{ p: 1, height: 'calc(100vh - 200px)', overflow: 'auto' }}>
                <List>
                  {currentRoom.participants.map(participant => (
                    <ListItem key={participant.id}>
                      <ListItemAvatar>
                        <Badge
                          color={participant.isOnline ? 'success' : 'error'}
                          variant='dot'
                          overlap='circular'
                        >
                          <Avatar>{participant.avatar}</Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={participant.name}
                        secondary={
                          <Box>
                            <Chip
                              label={participant.role}
                              size='small'
                              color={participant.role === 'host' ? 'primary' : 'default'}
                            />
                            <Typography variant='caption' display='block'>
                              Streak: {participant.studyStreak} days
                            </Typography>
                            <Typography variant='caption' display='block'>
                              Score: {participant.contributionScore}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Grid>
        </Grid>

        {/* Settings Menu */}
        <Menu
          anchorEl={settingsMenu}
          open={Boolean(settingsMenu)}
          onClose={() => setSettingsMenu(null)}
        >
          <MenuItem onClick={() => setSettingsMenu(null)}>Audio Settings</MenuItem>
          <MenuItem onClick={() => setSettingsMenu(null)}>Video Quality</MenuItem>
          <MenuItem onClick={() => setSettingsMenu(null)}>Notifications</MenuItem>
          <MenuItem onClick={() => setSettingsMenu(null)}>Record Session</MenuItem>
        </Menu>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant='h4' component='h1' sx={{ fontWeight: 'bold' }}>
          Study Rooms
        </Typography>
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={() => setIsCreateDialogOpen(true)}
          size='large'
        >
          Create Room
        </Button>
      </Box>

      <Grid container spacing={3}>
        {studyRooms.map(room => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={room.id}>
            <Card sx={{ height: '100%', position: 'relative' }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Typography variant='h6' component='h2' sx={{ fontWeight: 'bold' }}>
                    {room.name}
                  </Typography>
                  <Chip
                    label={`${room.participants.length}/${room.maxParticipants}`}
                    color='primary'
                    size='small'
                  />
                </Box>

                <Typography color='text.secondary' gutterBottom>
                  {room.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip label={room.subject} color='primary' size='small' />
                  <Chip
                    label={room.roomType}
                    color={getRoomTypeColor(room.roomType)}
                    size='small'
                  />
                  <Chip
                    label={`Focus: ${room.focusLevel}`}
                    color={getFocusLevelColor(room.focusLevel)}
                    size='small'
                  />
                </Box>

                {/* Participants Preview */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Participants:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {room.participants.slice(0, 3).map(participant => (
                      <Tooltip key={participant.id} title={participant.name}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                          {participant.avatar}
                        </Avatar>
                      </Tooltip>
                    ))}
                    {room.participants.length > 3 && (
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                        +{room.participants.length - 3}
                      </Avatar>
                    )}
                  </Box>
                </Box>

                <Typography variant='caption' color='text.secondary' display='block'>
                  Created {new Date(room.createdAt).toLocaleDateString()}
                </Typography>

                <Button
                  fullWidth
                  variant='contained'
                  onClick={() => handleJoinRoom(room)}
                  sx={{ mt: 2 }}
                  startIcon={<VideoIcon />}
                >
                  Join Room
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create Room Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Create Study Room</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label='Room Name'
              value={newRoom.name}
              onChange={e => setNewRoom(prev => ({ ...prev, name: e.target.value }))}
              margin='normal'
            />
            <TextField
              fullWidth
              label='Subject'
              value={newRoom.subject}
              onChange={e => setNewRoom(prev => ({ ...prev, subject: e.target.value }))}
              margin='normal'
            />
            <TextField
              fullWidth
              label='Description'
              value={newRoom.description}
              onChange={e => setNewRoom(prev => ({ ...prev, description: e.target.value }))}
              margin='normal'
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label='Max Participants'
              type='number'
              value={newRoom.maxParticipants}
              onChange={e =>
                setNewRoom(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))
              }
              margin='normal'
              inputProps={{ min: 2, max: 20 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateRoom}
            variant='contained'
            disabled={!newRoom.name || !newRoom.subject}
          >
            Create Room
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for Quick Join */}
      <Fab
        color='primary'
        aria-label='quick join'
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setIsCreateDialogOpen(true)}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default StudyRoomsPage;
