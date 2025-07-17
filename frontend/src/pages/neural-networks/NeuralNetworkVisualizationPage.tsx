import React, { useState, useEffect, useRef, useCallback } from 'react';
import Grid from '@mui/material/Grid';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Slider,
  TextField,
  IconButton,
  Chip,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Psychology as BrainIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Refresh as ResetIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';

interface Neuron {
  id: string;
  layerIndex: number;
  neuronIndex: number;
  value: number;
  bias: number;
  activation: 'relu' | 'sigmoid' | 'tanh' | 'linear';
  x: number;
  y: number;
}

interface Connection {
  id: string;
  fromNeuron: string;
  toNeuron: string;
  weight: number;
  strength: number; // for visualization
}

interface Layer {
  id: string;
  type: 'input' | 'hidden' | 'output';
  neurons: Neuron[];
  activationFunction: string;
  dropoutRate: number;
}

interface NetworkArchitecture {
  id: string;
  name: string;
  description: string;
  layers: Layer[];
  connections: Connection[];
  learningRate: number;
  epochs: number;
  batchSize: number;
  optimizer: 'sgd' | 'adam' | 'rmsprop';
  lossFunction: 'mse' | 'crossentropy' | 'mae';
}

interface TrainingMetrics {
  epoch: number;
  loss: number;
  accuracy: number;
  valLoss: number;
  valAccuracy: number;
  learningRate: number;
}

const NeuralNetworkVisualizationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(50);
  const [showWeights, setShowWeights] = useState(true);
  const [showBiases, setShowBiases] = useState(false);
  const [showActivations, setShowActivations] = useState(true);
  const [selectedNeuron, setSelectedNeuron] = useState<Neuron | null>(null);
  const [architectureDialogOpen, setArchitectureDialogOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  const [network, setNetwork] = useState<NetworkArchitecture>({
    id: '1',
    name: 'Basic Neural Network',
    description: 'A simple feedforward neural network for classification',
    learningRate: 0.01,
    epochs: 100,
    batchSize: 32,
    optimizer: 'adam',
    lossFunction: 'crossentropy',
    layers: [
      {
        id: 'input',
        type: 'input',
        activationFunction: 'linear',
        dropoutRate: 0,
        neurons: [
          {
            id: 'i1',
            layerIndex: 0,
            neuronIndex: 0,
            value: 0.8,
            bias: 0,
            activation: 'linear',
            x: 100,
            y: 150,
          },
          {
            id: 'i2',
            layerIndex: 0,
            neuronIndex: 1,
            value: 0.3,
            bias: 0,
            activation: 'linear',
            x: 100,
            y: 250,
          },
          {
            id: 'i3',
            layerIndex: 0,
            neuronIndex: 2,
            value: 0.6,
            bias: 0,
            activation: 'linear',
            x: 100,
            y: 350,
          },
        ],
      },
      {
        id: 'hidden1',
        type: 'hidden',
        activationFunction: 'relu',
        dropoutRate: 0.2,
        neurons: [
          {
            id: 'h1',
            layerIndex: 1,
            neuronIndex: 0,
            value: 0.7,
            bias: 0.1,
            activation: 'relu',
            x: 300,
            y: 100,
          },
          {
            id: 'h2',
            layerIndex: 1,
            neuronIndex: 1,
            value: 0.4,
            bias: -0.2,
            activation: 'relu',
            x: 300,
            y: 200,
          },
          {
            id: 'h3',
            layerIndex: 1,
            neuronIndex: 2,
            value: 0.9,
            bias: 0.3,
            activation: 'relu',
            x: 300,
            y: 300,
          },
          {
            id: 'h4',
            layerIndex: 1,
            neuronIndex: 3,
            value: 0.2,
            bias: 0.1,
            activation: 'relu',
            x: 300,
            y: 400,
          },
        ],
      },
      {
        id: 'hidden2',
        type: 'hidden',
        activationFunction: 'relu',
        dropoutRate: 0.2,
        neurons: [
          {
            id: 'h5',
            layerIndex: 2,
            neuronIndex: 0,
            value: 0.6,
            bias: 0.2,
            activation: 'relu',
            x: 500,
            y: 150,
          },
          {
            id: 'h6',
            layerIndex: 2,
            neuronIndex: 1,
            value: 0.8,
            bias: -0.1,
            activation: 'relu',
            x: 500,
            y: 250,
          },
          {
            id: 'h7',
            layerIndex: 2,
            neuronIndex: 2,
            value: 0.3,
            bias: 0.4,
            activation: 'relu',
            x: 500,
            y: 350,
          },
        ],
      },
      {
        id: 'output',
        type: 'output',
        activationFunction: 'softmax',
        dropoutRate: 0,
        neurons: [
          {
            id: 'o1',
            layerIndex: 3,
            neuronIndex: 0,
            value: 0.7,
            bias: 0.1,
            activation: 'sigmoid',
            x: 700,
            y: 200,
          },
          {
            id: 'o2',
            layerIndex: 3,
            neuronIndex: 1,
            value: 0.3,
            bias: -0.1,
            activation: 'sigmoid',
            x: 700,
            y: 300,
          },
        ],
      },
    ],
    connections: [],
  });

  const [trainingData] = useState<TrainingMetrics[]>([
    { epoch: 0, loss: 2.3, accuracy: 0.1, valLoss: 2.5, valAccuracy: 0.12, learningRate: 0.01 },
    { epoch: 10, loss: 1.8, accuracy: 0.3, valLoss: 2.0, valAccuracy: 0.28, learningRate: 0.01 },
    { epoch: 20, loss: 1.2, accuracy: 0.55, valLoss: 1.4, valAccuracy: 0.52, learningRate: 0.01 },
    { epoch: 30, loss: 0.8, accuracy: 0.72, valLoss: 1.0, valAccuracy: 0.68, learningRate: 0.009 },
    { epoch: 40, loss: 0.5, accuracy: 0.85, valLoss: 0.7, valAccuracy: 0.82, learningRate: 0.008 },
    { epoch: 50, loss: 0.3, accuracy: 0.92, valLoss: 0.5, valAccuracy: 0.89, learningRate: 0.007 },
  ]);

  // useCallback function declarations - moved before useEffect hooks
  const findNeuronById = useCallback(
    (id: string): Neuron | undefined => {
      for (const layer of network.layers) {
        const neuron = layer.neurons.find(n => n.id === id);
        if (neuron) return neuron;
      }
      return undefined;
    },
    [network.layers]
  );

  const getLayerColor = useCallback((layerType: string): string => {
    const colors = {
      input: '#17a2b8',
      hidden: '#28a745',
      output: '#ffc107',
    };
    return colors[layerType as keyof typeof colors] || '#6c757d';
  }, []);

  const drawConnection = useCallback(
    (ctx: CanvasRenderingContext2D, from: Neuron, to: Neuron, connection: Connection) => {
      const alpha = showWeights ? Math.abs(connection.weight) : 0.3;
      const color =
        connection.weight >= 0 ? `rgba(0, 123, 255, ${alpha})` : `rgba(220, 53, 69, ${alpha})`;
      const lineWidth = Math.abs(connection.weight) * 3 + 1;

      ctx.beginPath();
      ctx.moveTo(from.x + 20, from.y + 20);
      ctx.lineTo(to.x, to.y + 20);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.stroke();

      // Draw weight value
      if (showWeights) {
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        ctx.fillStyle = '#333';
        ctx.font = '10px Arial';
        ctx.fillText(connection.weight.toFixed(2), midX, midY);
      }
    },
    [showWeights]
  );

  const drawNeuron = useCallback(
    (ctx: CanvasRenderingContext2D, neuron: Neuron, layerType: string) => {
      const radius = 20;
      const isSelected = selectedNeuron?.id === neuron.id;

      // Neuron circle
      ctx.beginPath();
      ctx.arc(neuron.x + radius, neuron.y + radius, radius, 0, 2 * Math.PI);

      // Color based on activation value
      if (showActivations) {
        const intensity = Math.abs(neuron.value);
        const color =
          neuron.value >= 0 ? `rgba(40, 167, 69, ${intensity})` : `rgba(220, 53, 69, ${intensity})`;
        ctx.fillStyle = color;
      } else {
        ctx.fillStyle = getLayerColor(layerType);
      }

      ctx.fill();

      // Border
      ctx.strokeStyle = isSelected ? '#007bff' : '#333';
      ctx.lineWidth = isSelected ? 3 : 1;
      ctx.stroke();

      // Activation value
      if (showActivations) {
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(neuron.value.toFixed(2), neuron.x + radius, neuron.y + radius + 4);
      }

      // Bias value
      if (showBiases && neuron.bias !== 0) {
        ctx.fillStyle = '#666';
        ctx.font = '10px Arial';
        ctx.fillText(`b:${neuron.bias.toFixed(2)}`, neuron.x + radius, neuron.y + radius + 35);
      }
    },
    [showActivations, showBiases, selectedNeuron, getLayerColor]
  );

  const drawLayerLabels = useCallback((ctx: CanvasRenderingContext2D) => {
    const labels = ['Input Layer', 'Hidden Layer 1', 'Hidden Layer 2', 'Output Layer'];
    const positions = [100, 300, 500, 700];

    labels.forEach((label, index) => {
      ctx.fillStyle = '#333';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(label, positions[index] + 20, 50);
    });
  }, []);

  const drawNetwork = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    network.connections.forEach(connection => {
      const fromNeuron = findNeuronById(connection.fromNeuron);
      const toNeuron = findNeuronById(connection.toNeuron);

      if (fromNeuron && toNeuron) {
        drawConnection(ctx, fromNeuron, toNeuron, connection);
      }
    });

    // Draw neurons
    network.layers.forEach(layer => {
      layer.neurons.forEach(neuron => {
        drawNeuron(ctx, neuron, layer.type);
      });
    });

    // Draw layer labels
    drawLayerLabels(ctx);
  }, [network, findNeuronById, drawConnection, drawNeuron, drawLayerLabels]);

  const animateTraining = useCallback(() => {
    // Simulate training by updating neuron values and connections
    setNetwork(prev => ({
      ...prev,
      layers: prev.layers.map(layer => ({
        ...layer,
        neurons: layer.neurons.map(neuron => ({
          ...neuron,
          value: Math.max(0, Math.min(1, neuron.value + (Math.random() - 0.5) * 0.1)),
        })),
      })),
      connections: prev.connections.map(conn => ({
        ...conn,
        weight: conn.weight + (Math.random() - 0.5) * 0.01,
      })),
    }));

    setCurrentEpoch(prev => prev + 1);

    if (currentEpoch < network.epochs) {
      setTimeout(() => {
        if (isTraining && !isPaused) {
          animationRef.current = requestAnimationFrame(animateTraining);
        }
      }, 101 - animationSpeed);
    } else {
      setIsTraining(false);
    }
  }, [currentEpoch, network.epochs, isTraining, isPaused, animationSpeed]);

  // Generate connections between layers
  useEffect(() => {
    const connections: Connection[] = [];

    for (let i = 0; i < network.layers.length - 1; i++) {
      const currentLayer = network.layers[i];
      const nextLayer = network.layers[i + 1];

      currentLayer.neurons.forEach(fromNeuron => {
        nextLayer.neurons.forEach(toNeuron => {
          connections.push({
            id: `${fromNeuron.id}-${toNeuron.id}`,
            fromNeuron: fromNeuron.id,
            toNeuron: toNeuron.id,
            weight: (Math.random() - 0.5) * 2, // Random weight between -1 and 1
            strength: Math.random(),
          });
        });
      });
    }

    setNetwork(prev => ({ ...prev, connections }));
  }, [network.layers]);

  // Canvas drawing
  useEffect(() => {
    drawNetwork();
  }, [network, showWeights, showBiases, showActivations, selectedNeuron, drawNetwork]);

  // Training animation
  useEffect(() => {
    if (isTraining && !isPaused) {
      animationRef.current = requestAnimationFrame(animateTraining);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isTraining, isPaused, animationSpeed, animateTraining, currentEpoch, network.epochs]);

  const startTraining = () => {
    setIsTraining(true);
    setIsPaused(false);
    setCurrentEpoch(0);
  };

  const pauseTraining = () => {
    setIsPaused(!isPaused);
  };

  const stopTraining = () => {
    setIsTraining(false);
    setIsPaused(false);
    setCurrentEpoch(0);
  };

  const resetNetwork = () => {
    stopTraining();
    // Reset neuron values to random
    setNetwork(prev => ({
      ...prev,
      layers: prev.layers.map(layer => ({
        ...layer,
        neurons: layer.neurons.map(neuron => ({
          ...neuron,
          value: Math.random(),
        })),
      })),
    }));
  };

  const handleNeuronClick = (neuron: Neuron) => {
    setSelectedNeuron(selectedNeuron?.id === neuron.id ? null : neuron);
  };

  const prebuiltArchitectures = [
    {
      name: 'Simple Perceptron',
      description: 'Single layer perceptron for linear classification',
      layers: [3, 1],
      activation: ['linear', 'sigmoid'],
    },
    {
      name: 'Multi-Layer Perceptron',
      description: 'Classic feedforward network',
      layers: [4, 8, 6, 3],
      activation: ['linear', 'relu', 'relu', 'softmax'],
    },
    {
      name: 'Deep Network',
      description: 'Deep neural network with multiple hidden layers',
      layers: [5, 10, 8, 6, 4, 2],
      activation: ['linear', 'relu', 'relu', 'relu', 'relu', 'sigmoid'],
    },
    {
      name: 'Autoencoder',
      description: 'Encoder-decoder architecture for dimensionality reduction',
      layers: [8, 6, 3, 6, 8],
      activation: ['linear', 'relu', 'relu', 'relu', 'linear'],
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography
          variant='h4'
          component='h1'
          sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <BrainIcon color='primary' sx={{ fontSize: '2rem' }} />
          Neural Network Visualization
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant='outlined'
            startIcon={<UploadIcon />}
            onClick={() => setArchitectureDialogOpen(true)}
          >
            Load Architecture
          </Button>
          <Button variant='outlined' startIcon={<DownloadIcon />}>
            Export Model
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Control Panel */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Training Controls
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button
                  variant='contained'
                  startIcon={<PlayIcon />}
                  onClick={startTraining}
                  disabled={isTraining}
                  fullWidth
                >
                  Train
                </Button>
                <IconButton onClick={pauseTraining} disabled={!isTraining} color='primary'>
                  {isPaused ? <PlayIcon /> : <PauseIcon />}
                </IconButton>
                <IconButton onClick={stopTraining} disabled={!isTraining} color='error'>
                  <StopIcon />
                </IconButton>
                <IconButton onClick={resetNetwork} color='secondary'>
                  <ResetIcon />
                </IconButton>
              </Box>

              {/* Training Progress */}
              <Box sx={{ mb: 2 }}>
                <Typography variant='body2' gutterBottom>
                  Epoch: {currentEpoch} / {network.epochs}
                </Typography>
                <LinearProgress
                  variant='determinate'
                  value={(currentEpoch / network.epochs) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              {/* Animation Speed */}
              <Box sx={{ mb: 2 }}>
                <Typography variant='body2' gutterBottom>
                  Animation Speed
                </Typography>
                <Slider
                  value={animationSpeed}
                  onChange={(_, value) => setAnimationSpeed(value as number)}
                  min={1}
                  max={100}
                  valueLabelDisplay='auto'
                />
              </Box>

              <Typography variant='h6' gutterBottom sx={{ mt: 3 }}>
                Visualization Options
              </Typography>

              <FormControlLabel
                control={
                  <Switch checked={showWeights} onChange={e => setShowWeights(e.target.checked)} />
                }
                label='Show Weights'
              />

              <FormControlLabel
                control={
                  <Switch checked={showBiases} onChange={e => setShowBiases(e.target.checked)} />
                }
                label='Show Biases'
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={showActivations}
                    onChange={e => setShowActivations(e.target.checked)}
                  />
                }
                label='Show Activations'
              />
            </CardContent>
          </Card>

          {/* Network Configuration */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Network Configuration
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Optimizer</InputLabel>
                <Select
                  value={network.optimizer}
                  label='Optimizer'
                  onChange={e =>
                    setNetwork(prev => ({
                      ...prev,
                      optimizer: e.target.value as 'sgd' | 'adam' | 'rmsprop',
                    }))
                  }
                >
                  <MenuItem value='sgd'>SGD</MenuItem>
                  <MenuItem value='adam'>Adam</MenuItem>
                  <MenuItem value='rmsprop'>RMSprop</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label='Learning Rate'
                type='number'
                value={network.learningRate}
                onChange={e =>
                  setNetwork(prev => ({ ...prev, learningRate: parseFloat(e.target.value) }))
                }
                inputProps={{ step: 0.001, min: 0.001, max: 1 }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label='Batch Size'
                type='number'
                value={network.batchSize}
                onChange={e =>
                  setNetwork(prev => ({ ...prev, batchSize: parseInt(e.target.value) }))
                }
                inputProps={{ min: 1, max: 1024 }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label='Epochs'
                type='number'
                value={network.epochs}
                onChange={e => setNetwork(prev => ({ ...prev, epochs: parseInt(e.target.value) }))}
                inputProps={{ min: 1, max: 1000 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Main Visualization Area */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant='h6'>Network Architecture</Typography>
                <Chip label={`${network.layers.length} Layers`} color='primary' />
              </Box>

              {/* Canvas for network visualization */}
              <Paper sx={{ p: 2, bgcolor: '#f8f9fa', overflow: 'auto' }}>
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={500}
                  style={{ cursor: 'pointer', maxWidth: '100%' }}
                  onClick={e => {
                    const rect = canvasRef.current?.getBoundingClientRect();
                    if (rect) {
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;

                      // Find clicked neuron
                      for (const layer of network.layers) {
                        for (const neuron of layer.neurons) {
                          const distance = Math.sqrt(
                            Math.pow(x - (neuron.x + 20), 2) + Math.pow(y - (neuron.y + 20), 2)
                          );
                          if (distance <= 20) {
                            handleNeuronClick(neuron);
                            return;
                          }
                        }
                      }
                      setSelectedNeuron(null);
                    }
                  }}
                />
              </Paper>

              {/* Legend */}
              <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  label='Input Layer'
                  sx={{ bgcolor: '#17a2b8', color: 'white' }}
                  size='small'
                />
                <Chip
                  label='Hidden Layer'
                  sx={{ bgcolor: '#28a745', color: 'white' }}
                  size='small'
                />
                <Chip
                  label='Output Layer'
                  sx={{ bgcolor: '#ffc107', color: 'white' }}
                  size='small'
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Information Panel */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                <Tab label='Details' />
                <Tab label='Metrics' />
              </Tabs>

              {activeTab === 0 && (
                <Box sx={{ mt: 2 }}>
                  {selectedNeuron ? (
                    <Box>
                      <Typography variant='h6' gutterBottom>
                        Neuron Details
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary='Layer'
                            secondary={network.layers[selectedNeuron.layerIndex].type}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary='Activation'
                            secondary={selectedNeuron.activation}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary='Value'
                            secondary={selectedNeuron.value.toFixed(4)}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary='Bias' secondary={selectedNeuron.bias.toFixed(4)} />
                        </ListItem>
                      </List>

                      <Typography variant='subtitle2' gutterBottom sx={{ mt: 2 }}>
                        Connected Weights
                      </Typography>
                      <List dense>
                        {network.connections
                          .filter(
                            conn =>
                              conn.fromNeuron === selectedNeuron.id ||
                              conn.toNeuron === selectedNeuron.id
                          )
                          .slice(0, 5)
                          .map(conn => (
                            <ListItem key={conn.id}>
                              <ListItemText
                                primary={conn.weight.toFixed(4)}
                                secondary={`${conn.fromNeuron} → ${conn.toNeuron}`}
                              />
                            </ListItem>
                          ))}
                      </List>
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant='h6' gutterBottom>
                        Network Summary
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary='Total Neurons'
                            secondary={network.layers.reduce(
                              (sum, layer) => sum + layer.neurons.length,
                              0
                            )}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary='Total Connections'
                            secondary={network.connections.length}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary='Total Parameters'
                            secondary={
                              network.connections.length +
                              network.layers.reduce((sum, layer) => sum + layer.neurons.length, 0)
                            }
                          />
                        </ListItem>
                      </List>

                      <Alert severity='info' sx={{ mt: 2 }}>
                        Click on any neuron to see detailed information about its connections and
                        values.
                      </Alert>
                    </Box>
                  )}
                </Box>
              )}

              {activeTab === 1 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant='h6' gutterBottom>
                    Training Metrics
                  </Typography>

                  {trainingData.length > 0 && (
                    <Box>
                      <Typography variant='subtitle2' gutterBottom>
                        Latest Epoch Results
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary='Loss'
                            secondary={trainingData[trainingData.length - 1].loss.toFixed(4)}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary='Accuracy'
                            secondary={`${(trainingData[trainingData.length - 1].accuracy * 100).toFixed(2)}%`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary='Val Loss'
                            secondary={trainingData[trainingData.length - 1].valLoss.toFixed(4)}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary='Val Accuracy'
                            secondary={`${(trainingData[trainingData.length - 1].valAccuracy * 100).toFixed(2)}%`}
                          />
                        </ListItem>
                      </List>

                      <Typography variant='subtitle2' gutterBottom sx={{ mt: 2 }}>
                        Training Progress
                      </Typography>
                      <Box sx={{ height: 200, bgcolor: '#f8f9fa', p: 1, borderRadius: 1 }}>
                        {/* Simple progress visualization */}
                        <Typography variant='caption' color='text.secondary'>
                          Training curves would be displayed here
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Architecture Selection Dialog */}
      <Dialog
        open={architectureDialogOpen}
        onClose={() => setArchitectureDialogOpen(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>Select Network Architecture</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {prebuiltArchitectures.map((arch, index) => (
              <Grid size={{ xs: 12, sm: 6 }} key={index}>
                <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
                  <CardContent>
                    <Typography variant='h6' gutterBottom>
                      {arch.name}
                    </Typography>
                    <Typography variant='body2' color='text.secondary' gutterBottom>
                      {arch.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      {arch.layers.map((neurons, layerIndex) => (
                        <Chip key={layerIndex} label={neurons} size='small' variant='outlined' />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setArchitectureDialogOpen(false)}>Cancel</Button>
          <Button variant='contained'>Load Custom</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NeuralNetworkVisualizationPage;
