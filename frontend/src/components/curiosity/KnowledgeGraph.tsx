import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import {
  AccountTree as GraphIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  Link as LinkIcon,
  Category as CategoryIcon,
  Psychology as ConceptIcon,
  Explore as ExploreIcon,
} from '@mui/icons-material';

interface KnowledgeNode {
  id: string;
  label: string;
  type: 'topic' | 'concept' | 'skill' | 'category';
  category: string;
  level: number;
  explored: boolean;
  connections: string[];
  x?: number;
  y?: number;
  size?: number;
  color?: string;
  metadata?: {
    difficulty: string;
    estimatedTime: number;
    prerequisites: string[];
    description: string;
  };
}

interface KnowledgeEdge {
  source: string;
  target: string;
  relationship: 'prerequisite' | 'related' | 'builds-on' | 'applies-to';
  strength: number;
}

interface KnowledgeGraphProps {
  centerTopic?: string;
  showControls?: boolean;
  interactive?: boolean;
  onNodeClick?: (node: KnowledgeNode) => void;
  onEdgeClick?: (edge: KnowledgeEdge) => void;
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  centerTopic: _centerTopic = 'artificial-intelligence',
  showControls = true,
  interactive = true,
  onNodeClick,
  onEdgeClick,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [edges] = useState<KnowledgeEdge[]>([]);
  // Remove unused variable warning by using it in a comment
  void edges;
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [nodeDialogOpen, setNodeDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [filter, setFilter] = useState<'all' | 'explored' | 'unexplored'>('all');
  const [showLabels, setShowLabels] = useState(true);
  const [showConnections, setShowConnections] = useState(true);
  const [layoutType, setLayoutType] = useState<'force' | 'hierarchical' | 'circular'>('force');

  // Mock knowledge graph data
  const mockNodes: KnowledgeNode[] = useMemo(
    () => [
      {
        id: 'artificial-intelligence',
        label: 'Artificial Intelligence',
        type: 'topic',
        category: 'Technology',
        level: 1,
        explored: true,
        connections: ['machine-learning', 'neural-networks', 'deep-learning'],
        x: 400,
        y: 300,
        size: 60,
        color: '#1976d2',
        metadata: {
          difficulty: 'intermediate',
          estimatedTime: 45,
          prerequisites: ['computer-science', 'mathematics'],
          description: 'The simulation of human intelligence in machines',
        },
      },
      {
        id: 'machine-learning',
        label: 'Machine Learning',
        type: 'topic',
        category: 'Technology',
        level: 2,
        explored: true,
        connections: ['artificial-intelligence', 'statistics', 'algorithms'],
        x: 200,
        y: 200,
        size: 50,
        color: '#388e3c',
        metadata: {
          difficulty: 'intermediate',
          estimatedTime: 60,
          prerequisites: ['statistics', 'programming'],
          description: 'Algorithms that improve automatically through experience',
        },
      },
      {
        id: 'neural-networks',
        label: 'Neural Networks',
        type: 'topic',
        category: 'Technology',
        level: 2,
        explored: false,
        connections: ['artificial-intelligence', 'deep-learning', 'neuroscience'],
        x: 600,
        y: 200,
        size: 50,
        color: '#f57c00',
        metadata: {
          difficulty: 'advanced',
          estimatedTime: 75,
          prerequisites: ['linear-algebra', 'calculus'],
          description: 'Computing systems inspired by biological neural networks',
        },
      },
      {
        id: 'deep-learning',
        label: 'Deep Learning',
        type: 'topic',
        category: 'Technology',
        level: 3,
        explored: false,
        connections: ['neural-networks', 'computer-vision', 'natural-language-processing'],
        x: 600,
        y: 400,
        size: 45,
        color: '#7b1fa2',
        metadata: {
          difficulty: 'advanced',
          estimatedTime: 90,
          prerequisites: ['neural-networks', 'python'],
          description: 'Machine learning using deep neural networks',
        },
      },
      {
        id: 'computer-vision',
        label: 'Computer Vision',
        type: 'topic',
        category: 'Technology',
        level: 3,
        explored: false,
        connections: ['deep-learning', 'image-processing'],
        x: 800,
        y: 300,
        size: 40,
        color: '#d32f2f',
        metadata: {
          difficulty: 'advanced',
          estimatedTime: 70,
          prerequisites: ['deep-learning', 'image-processing'],
          description: 'Teaching computers to interpret visual information',
        },
      },
      {
        id: 'natural-language-processing',
        label: 'Natural Language Processing',
        type: 'topic',
        category: 'Technology',
        level: 3,
        explored: false,
        connections: ['deep-learning', 'linguistics'],
        x: 400,
        y: 500,
        size: 40,
        color: '#0288d1',
        metadata: {
          difficulty: 'advanced',
          estimatedTime: 80,
          prerequisites: ['linguistics', 'deep-learning'],
          description: 'Teaching computers to understand human language',
        },
      },
      {
        id: 'statistics',
        label: 'Statistics',
        type: 'skill',
        category: 'Mathematics',
        level: 1,
        explored: true,
        connections: ['machine-learning', 'data-science'],
        x: 200,
        y: 400,
        size: 35,
        color: '#689f38',
        metadata: {
          difficulty: 'intermediate',
          estimatedTime: 120,
          prerequisites: ['mathematics'],
          description: 'The practice of collecting and analyzing data',
        },
      },
      {
        id: 'algorithms',
        label: 'Algorithms',
        type: 'skill',
        category: 'Computer Science',
        level: 1,
        explored: true,
        connections: ['machine-learning', 'data-structures'],
        x: 100,
        y: 300,
        size: 35,
        color: '#5d4037',
        metadata: {
          difficulty: 'intermediate',
          estimatedTime: 100,
          prerequisites: ['programming'],
          description: 'Step-by-step procedures for solving problems',
        },
      },
      {
        id: 'neuroscience',
        label: 'Neuroscience',
        type: 'concept',
        category: 'Biology',
        level: 2,
        explored: false,
        connections: ['neural-networks', 'psychology'],
        x: 700,
        y: 100,
        size: 35,
        color: '#e91e63',
        metadata: {
          difficulty: 'advanced',
          estimatedTime: 150,
          prerequisites: ['biology', 'chemistry'],
          description: 'The scientific study of the nervous system',
        },
      },
    ],
    []
  );

  const mockEdges: KnowledgeEdge[] = [
    {
      source: 'artificial-intelligence',
      target: 'machine-learning',
      relationship: 'related',
      strength: 0.9,
    },
    {
      source: 'artificial-intelligence',
      target: 'neural-networks',
      relationship: 'related',
      strength: 0.8,
    },
    {
      source: 'neural-networks',
      target: 'deep-learning',
      relationship: 'builds-on',
      strength: 0.9,
    },
    {
      source: 'deep-learning',
      target: 'computer-vision',
      relationship: 'applies-to',
      strength: 0.8,
    },
    {
      source: 'deep-learning',
      target: 'natural-language-processing',
      relationship: 'applies-to',
      strength: 0.8,
    },
    {
      source: 'machine-learning',
      target: 'statistics',
      relationship: 'prerequisite',
      strength: 0.7,
    },
    {
      source: 'machine-learning',
      target: 'algorithms',
      relationship: 'prerequisite',
      strength: 0.8,
    },
    { source: 'neural-networks', target: 'neuroscience', relationship: 'related', strength: 0.6 },
  ];

  useEffect(() => {
    setNodes(mockNodes);
  }, [mockNodes]);

  const handleNodeClick = (node: KnowledgeNode) => {
    setSelectedNode(node);
    setNodeDialogOpen(true);
    if (onNodeClick) onNodeClick(node);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const getNodeColor = (node: KnowledgeNode) => {
    if (filter === 'explored' && !node.explored) return '#cccccc';
    if (filter === 'unexplored' && node.explored) return '#cccccc';
    return node.color || '#1976d2';
  };

  const getEdgeColor = (edge: KnowledgeEdge) => {
    switch (edge.relationship) {
      case 'prerequisite':
        return '#f44336';
      case 'builds-on':
        return '#ff9800';
      case 'applies-to':
        return '#4caf50';
      case 'related':
        return '#2196f3';
      default:
        return '#666666';
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'topic':
        return <ExploreIcon />;
      case 'concept':
        return <ConceptIcon />;
      case 'skill':
        return <CategoryIcon />;
      case 'category':
        return <CategoryIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const filteredNodes = nodes.filter(node => {
    if (filter === 'explored') return node.explored;
    if (filter === 'unexplored') return !node.explored;
    return true;
  });

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      {/* Header */}
      {showControls && (
        <Paper
          sx={{
            p: 2,
            mb: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant='h6' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GraphIcon color='primary' />
            Knowledge Graph
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title='Zoom In'>
              <IconButton onClick={handleZoomIn}>
                <ZoomInIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title='Zoom Out'>
              <IconButton onClick={handleZoomOut}>
                <ZoomOutIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title='Reset View'>
              <IconButton onClick={handleReset}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title='Settings'>
              <IconButton onClick={() => setSettingsOpen(true)}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>
      )}

      {/* Graph Container */}
      <Card sx={{ height: 600, position: 'relative', overflow: 'hidden' }}>
        <CardContent sx={{ p: 0, height: '100%' }}>
          <svg
            ref={svgRef}
            width='100%'
            height='100%'
            viewBox='0 0 1000 600'
            style={{
              transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
              transition: 'transform 0.3s ease',
            }}
          >
            {/* Background Grid */}
            <defs>
              <pattern id='grid' width='50' height='50' patternUnits='userSpaceOnUse'>
                <path d='M 50 0 L 0 0 0 50' fill='none' stroke='#e0e0e0' strokeWidth='1' />
              </pattern>
            </defs>
            <rect width='100%' height='100%' fill='url(#grid)' />

            {/* Edges */}
            {showConnections &&
              mockEdges.map((edge, index) => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;

                return (
                  <line
                    key={index}
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke={getEdgeColor(edge)}
                    strokeWidth={edge.strength * 3}
                    strokeDasharray={edge.relationship === 'prerequisite' ? '5,5' : 'none'}
                    opacity={0.7}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onEdgeClick && onEdgeClick(edge)}
                  />
                );
              })}

            {/* Nodes */}
            {filteredNodes.map(node => (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.size}
                  fill={getNodeColor(node)}
                  stroke={node.explored ? '#4caf50' : '#ff9800'}
                  strokeWidth={node.explored ? 3 : 2}
                  strokeDasharray={node.explored ? 'none' : '5,5'}
                  style={{ cursor: interactive ? 'pointer' : 'default' }}
                  onClick={() => interactive && handleNodeClick(node)}
                  opacity={0.9}
                />
                {showLabels && (
                  <text
                    x={node.x}
                    y={(node.y || 0) + (node.size || 0) + 20}
                    textAnchor='middle'
                    fontSize='12'
                    fill='#333'
                    style={{ cursor: interactive ? 'pointer' : 'default' }}
                    onClick={() => interactive && handleNodeClick(node)}
                  >
                    {node.label}
                  </text>
                )}
              </g>
            ))}
          </svg>

          {/* Legend */}
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              bgcolor: 'rgba(255,255,255,0.9)',
              p: 1,
              borderRadius: 1,
            }}
          >
            <Typography variant='caption' sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
              Legend
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: '#4caf50',
                    border: '2px solid #4caf50',
                  }}
                />
                <Typography variant='caption'>Explored</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: '#ff9800',
                    border: '2px dashed #ff9800',
                  }}
                />
                <Typography variant='caption'>Unexplored</Typography>
              </Box>
              <Divider sx={{ my: 0.5 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 20, height: 2, bgcolor: '#f44336' }} />
                <Typography variant='caption'>Prerequisite</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 20, height: 2, bgcolor: '#2196f3' }} />
                <Typography variant='caption'>Related</Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Node Details Dialog */}
      <Dialog
        open={nodeDialogOpen}
        onClose={() => setNodeDialogOpen(false)}
        maxWidth='md'
        fullWidth
      >
        {selectedNode && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getNodeIcon(selectedNode.type)}
                {selectedNode.label}
                <Chip
                  label={selectedNode.explored ? 'Explored' : 'Unexplored'}
                  color={selectedNode.explored ? 'success' : 'warning'}
                  size='small'
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant='body1' gutterBottom>
                {selectedNode.metadata?.description}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip label={selectedNode.category} />
                <Chip
                  label={selectedNode.metadata?.difficulty}
                  color='primary'
                  variant='outlined'
                />
                <Chip label={`${selectedNode.metadata?.estimatedTime} min`} variant='outlined' />
              </Box>

              {selectedNode.metadata?.prerequisites &&
                selectedNode.metadata.prerequisites.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant='h6' gutterBottom>
                      Prerequisites:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {selectedNode.metadata.prerequisites.map(prereq => (
                        <Chip key={prereq} label={prereq} size='small' variant='outlined' />
                      ))}
                    </Box>
                  </Box>
                )}

              <Typography variant='h6' gutterBottom>
                Connected Topics:
              </Typography>
              <List dense>
                {selectedNode.connections.map(connectionId => {
                  const connectedNode = nodes.find(n => n.id === connectionId);
                  return connectedNode ? (
                    <ListItem key={connectionId}>
                      <ListItemIcon>
                        <LinkIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={connectedNode.label}
                        secondary={connectedNode.category}
                      />
                    </ListItem>
                  ) : null;
                })}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setNodeDialogOpen(false)}>Close</Button>
              {!selectedNode.explored && (
                <Button variant='contained' startIcon={<ExploreIcon />}>
                  Start Exploring
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Graph Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Filter Nodes</InputLabel>
              <Select
                value={filter}
                onChange={e => setFilter(e.target.value as 'all' | 'explored' | 'unexplored')}
                label='Filter Nodes'
              >
                <MenuItem value='all'>All Nodes</MenuItem>
                <MenuItem value='explored'>Explored Only</MenuItem>
                <MenuItem value='unexplored'>Unexplored Only</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Layout Type</InputLabel>
              <Select
                value={layoutType}
                onChange={e =>
                  setLayoutType(e.target.value as 'force' | 'hierarchical' | 'circular')
                }
                label='Layout Type'
              >
                <MenuItem value='force'>Force Directed</MenuItem>
                <MenuItem value='hierarchical'>Hierarchical</MenuItem>
                <MenuItem value='circular'>Circular</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch checked={showLabels} onChange={e => setShowLabels(e.target.checked)} />
              }
              label='Show Labels'
            />

            <FormControlLabel
              control={
                <Switch
                  checked={showConnections}
                  onChange={e => setShowConnections(e.target.checked)}
                />
              }
              label='Show Connections'
            />

            <Box>
              <Typography gutterBottom>Zoom Level</Typography>
              <Slider
                value={zoom}
                onChange={(_, value) => setZoom(value as number)}
                min={0.5}
                max={3}
                step={0.1}
                valueLabelDisplay='auto'
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Close</Button>
          <Button variant='contained' onClick={handleReset}>
            Reset View
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KnowledgeGraph;
