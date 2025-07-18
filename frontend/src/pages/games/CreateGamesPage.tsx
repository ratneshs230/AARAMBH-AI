import React, { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
} from '@mui/material';
import {
  SportsEsports as GameIcon,
  Add as AddIcon,
  Quiz as QuizGameIcon,
  Extension as PuzzleIcon,
  Psychology as BrainIcon,
  School as EducationIcon,
  PlayArrow as PlayIcon,
  Edit as EditIcon,
  Share as ShareIcon,
  Star as StarIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

interface Game {
  id: string;
  title: string;
  type: 'quiz' | 'puzzle' | 'memory' | 'adventure';
  subject: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating: number;
  plays: number;
  author: string;
  description: string;
  isPublished: boolean;
}

const CreateGamesPage: React.FC = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedGameType, setSelectedGameType] = useState('');

  const gameTypes = [
    {
      id: 'quiz',
      title: 'Quiz Game',
      description: 'Create interactive quiz games with multiple choice questions',
      icon: <QuizGameIcon />,
      color: '#1976d2',
    },
    {
      id: 'puzzle',
      title: 'Puzzle Game',
      description: 'Build engaging puzzle games for problem-solving skills',
      icon: <PuzzleIcon />,
      color: '#388e3c',
    },
    {
      id: 'memory',
      title: 'Memory Game',
      description: 'Design memory games to enhance cognitive abilities',
      icon: <BrainIcon />,
      color: '#f57c00',
    },
    {
      id: 'adventure',
      title: 'Learning Adventure',
      description: 'Create story-based educational adventures',
      icon: <EducationIcon />,
      color: '#7b1fa2',
    },
  ];

  const mockGames: Game[] = [
    {
      id: '1',
      title: 'Math Challenge Quest',
      type: 'quiz',
      subject: 'Mathematics',
      difficulty: 'Medium',
      rating: 4.5,
      plays: 1250,
      author: 'Student123',
      description: 'Test your algebra and geometry skills in this exciting quiz adventure!',
      isPublished: true,
    },
    {
      id: '2',
      title: 'Chemistry Lab Mystery',
      type: 'adventure',
      subject: 'Chemistry',
      difficulty: 'Hard',
      rating: 4.8,
      plays: 890,
      author: 'ScienceGuru',
      description: 'Solve chemical reactions to uncover the mystery in the virtual lab.',
      isPublished: true,
    },
    {
      id: '3',
      title: 'Physics Puzzle Palace',
      type: 'puzzle',
      subject: 'Physics',
      difficulty: 'Easy',
      rating: 4.2,
      plays: 2100,
      author: 'PhysicsPhun',
      description: 'Interactive puzzles that make physics concepts crystal clear.',
      isPublished: false,
    },
  ];

  const getGameTypeIcon = (type: string) => {
    const gameType = gameTypes.find(gt => gt.id === type);
    return gameType ? gameType.icon : <GameIcon />;
  };

  const getGameTypeColor = (type: string) => {
    const gameType = gameTypes.find(gt => gt.id === type);
    return gameType ? gameType.color : '#1976d2';
  };

  const handleCreateGame = () => {
    setCreateDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setCreateDialogOpen(false);
    setSelectedGameType('');
  };

  const handleGameTypeSelect = (typeId: string) => {
    setSelectedGameType(typeId);
  };

  const GameCard: React.FC<{ game: Game }> = ({ game }) => (
    <Card sx={{ height: '100%', position: 'relative' }}>
      {!game.isPublished && (
        <Chip
          label="Draft"
          color="warning"
          size="small"
          sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
        />
      )}
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box 
            sx={{ 
              p: 1, 
              borderRadius: 1, 
              bgcolor: `${getGameTypeColor(game.type)}20`,
              color: getGameTypeColor(game.type),
              mr: 2 
            }}
          >
            {getGameTypeIcon(game.type)}
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight={600} noWrap>
              {game.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {game.subject} • {game.difficulty}
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          {game.description}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <StarIcon sx={{ color: 'orange', fontSize: 16, mr: 0.5 }} />
          <Typography variant="body2" sx={{ mr: 2 }}>
            {game.rating}
          </Typography>
          <PersonIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {game.plays} plays
          </Typography>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
          by {game.author}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<PlayIcon />}
            sx={{ flex: 1 }}
          >
            Play
          </Button>
          <IconButton size="small" color="primary">
            <EditIcon />
          </IconButton>
          <IconButton size="small" color="primary">
            <ShareIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" fontWeight={600} gutterBottom>
          Create Games 🎮
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Design and build educational games to make learning fun and interactive
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={600}>
            Game Creation Tools
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateGame}
            size="large"
          >
            Create New Game
          </Button>
        </Box>

        <Grid container spacing={3}>
          {gameTypes.map((gameType) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={gameType.id}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  border: `2px solid ${gameType.color}`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                    bgcolor: `${gameType.color}15`,
                  },
                }}
                onClick={() => handleGameTypeSelect(gameType.id)}
              >
                <Box sx={{ color: gameType.color, mb: 2 }}>
                  {gameType.icon}
                </Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {gameType.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {gameType.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* My Games */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          My Games
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Manage your created games and track their performance
        </Typography>
        
        <Grid container spacing={3}>
          {mockGames.map((game) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={game.id}>
              <GameCard game={game} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Featured Games */}
      <Box>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Featured Community Games
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Popular games created by the community
        </Typography>
        
        <List>
          <ListItem>
            <ListItemIcon>
              <GameIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="History Timeline Challenge"
              secondary="Adventure game • Created by HistoryBuff • 5,240 plays"
            />
            <Chip label="Trending" color="success" size="small" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <GameIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Molecular Structure Builder"
              secondary="Puzzle game • Created by ChemWiz • 3,890 plays"
            />
            <Chip label="Popular" color="primary" size="small" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <GameIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Mental Math Marathon"
              secondary="Quiz game • Created by MathMaster • 8,120 plays"
            />
            <Chip label="Top Rated" color="warning" size="small" />
          </ListItem>
        </List>
      </Box>

      {/* Create Game Dialog */}
      <Dialog open={createDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Game</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Game Title"
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            select
            label="Game Type"
            fullWidth
            variant="outlined"
            value={selectedGameType}
            onChange={(e) => setSelectedGameType(e.target.value)}
            sx={{ mb: 2 }}
          >
            {gameTypes.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.title}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Subject"
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          >
            <MenuItem value="mathematics">Mathematics</MenuItem>
            <MenuItem value="physics">Physics</MenuItem>
            <MenuItem value="chemistry">Chemistry</MenuItem>
            <MenuItem value="biology">Biology</MenuItem>
            <MenuItem value="history">History</MenuItem>
            <MenuItem value="geography">Geography</MenuItem>
          </TextField>
          <TextField
            multiline
            rows={3}
            label="Description"
            fullWidth
            variant="outlined"
            placeholder="Describe your game..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            Create Game
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CreateGamesPage;