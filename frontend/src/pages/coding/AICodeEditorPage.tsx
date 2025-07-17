import React, { useState, useEffect, useRef } from 'react';
import Grid from '@mui/material/Grid';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  IconButton,
  Chip,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Badge,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  LinearProgress,
  Drawer,
  Divider,
} from '@mui/material';
import {
  Code as CodeIcon,
  Psychology as AIIcon,
  PlayArrow as RunIcon,
  Stop as StopIcon,
  Save as SaveIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  BugReport as DebugIcon,
  Lightbulb as SuggestionIcon,
  AutoFixHigh as AutoFixIcon,
  Speed as PerformanceIcon,
  Security as SecurityIcon,
  Quiz as TestIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  VolumeUp as VoiceIcon,
  Chat as ChatIcon,
  Timeline as AnalyticsIcon,
  School as LearnIcon,
  FindReplace as RefactorIcon,
  WarningAmber as WarningIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

interface CodeSuggestion {
  id: string;
  type: 'completion' | 'fix' | 'optimization' | 'explanation' | 'refactor';
  title: string;
  description: string;
  code: string;
  confidence: number;
  line?: number;
  column?: number;
  severity?: 'info' | 'warning' | 'error';
}

interface AIAssistant {
  isActive: boolean;
  mode: 'helper' | 'tutor' | 'reviewer' | 'pair-programmer';
  suggestions: CodeSuggestion[];
  conversation: ChatMessage[];
  isTyping: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
  type: 'text' | 'code' | 'suggestion';
}

interface CodeAnalysis {
  complexity: number;
  performance: number;
  security: number;
  maintainability: number;
  testCoverage: number;
  issues: Issue[];
  metrics: {
    linesOfCode: number;
    cyclomaticComplexity: number;
    duplicatedLines: number;
    technicalDebt: number;
  };
}

interface Issue {
  id: string;
  type: 'bug' | 'vulnerability' | 'code-smell' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  line: number;
  suggestion?: string;
}

interface CodeTemplate {
  id: string;
  name: string;
  language: string;
  category: string;
  description: string;
  code: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const AICodeEditorPage: React.FC = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [activeTab, setActiveTab] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [errors, setErrors] = useState('');
  const [aiDrawerOpen, setAIDrawerOpen] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<CodeTemplate | null>(null);

  const [aiAssistant, setAIAssistant] = useState<AIAssistant>({
    isActive: true,
    mode: 'helper',
    suggestions: [],
    conversation: [
      {
        id: '1',
        sender: 'ai',
        content:
          "Hi! I'm your AI coding assistant. I can help you write, debug, and optimize your code. What would you like to work on today?",
        timestamp: new Date().toISOString(),
        type: 'text',
      },
    ],
    isTyping: false,
  });

  const [codeAnalysis, setCodeAnalysis] = useState<CodeAnalysis>({
    complexity: 75,
    performance: 85,
    security: 90,
    maintainability: 80,
    testCoverage: 65,
    issues: [
      {
        id: '1',
        type: 'performance',
        severity: 'medium',
        message: 'Consider using list comprehension for better performance',
        line: 5,
        suggestion: 'result = [x*2 for x in numbers]',
      },
      {
        id: '2',
        type: 'code-smell',
        severity: 'low',
        message: 'Variable name could be more descriptive',
        line: 3,
        suggestion: 'Use "user_count" instead of "n"',
      },
    ],
    metrics: {
      linesOfCode: 45,
      cyclomaticComplexity: 8,
      duplicatedLines: 0,
      technicalDebt: 15,
    },
  });

  const codeTemplates: CodeTemplate[] = [
    {
      id: '1',
      name: 'Python Web Scraper',
      language: 'python',
      category: 'Data Science',
      description: 'A basic web scraper using requests and BeautifulSoup',
      difficulty: 'intermediate',
      code: `import requests
from bs4 import BeautifulSoup
import pandas as pd

def scrape_website(url):
    """
    Scrape data from a website and return structured data
    """
    try:
        # Send GET request
        response = requests.get(url)
        response.raise_for_status()
        
        # Parse HTML content
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract data (customize based on your needs)
        data = []
        for item in soup.find_all('div', class_='item'):
            title = item.find('h2').text.strip()
            description = item.find('p').text.strip()
            data.append({
                'title': title,
                'description': description
            })
        
        return data
    
    except Exception as e:
        print(f"Error scraping website: {e}")
        return []

# Example usage
if __name__ == "__main__":
    url = "https://example.com"
    scraped_data = scrape_website(url)
    
    # Convert to DataFrame for analysis
    df = pd.DataFrame(scraped_data)
    print(df.head())`,
    },
    {
      id: '2',
      name: 'React Todo Component',
      language: 'javascript',
      category: 'Frontend',
      description: 'A complete todo list component with hooks',
      difficulty: 'beginner',
      code: `import React, { useState, useEffect } from 'react';

const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');

  // Load todos from localStorage on component mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (inputValue.trim() !== '') {
      const newTodo = {
        id: Date.now(),
        text: inputValue,
        completed: false,
        createdAt: new Date().toISOString()
      };
      setTodos([...todos, newTodo]);
      setInputValue('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="todo-app">
      <h1>My Todo List</h1>
      
      <div className="input-section">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a new todo..."
        />
        <button onClick={addTodo}>Add</button>
      </div>

      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <span onClick={() => toggleTodo(todo.id)}>
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <div className="stats">
        <p>Total: {todos.length} | Completed: {todos.filter(t => t.completed).length}</p>
      </div>
    </div>
  );
};

export default TodoApp;`,
    },
    {
      id: '3',
      name: 'Machine Learning Model',
      language: 'python',
      category: 'AI/ML',
      description: 'A simple machine learning model using scikit-learn',
      difficulty: 'advanced',
      code: `import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
import seaborn as sns

class MLModel:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
    
    def load_data(self, file_path):
        """Load data from CSV file"""
        try:
            self.data = pd.read_csv(file_path)
            print(f"Data loaded successfully. Shape: {self.data.shape}")
            return self.data
        except Exception as e:
            print(f"Error loading data: {e}")
            return None
    
    def preprocess_data(self, target_column):
        """Preprocess the data for training"""
        # Separate features and target
        X = self.data.drop(columns=[target_column])
        y = self.data[target_column]
        
        # Handle categorical variables (simple encoding)
        X_encoded = pd.get_dummies(X, drop_first=True)
        
        # Split the data
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X_encoded, y, test_size=0.2, random_state=42
        )
        
        # Scale the features
        self.X_train_scaled = self.scaler.fit_transform(self.X_train)
        self.X_test_scaled = self.scaler.transform(self.X_test)
        
        print(f"Data preprocessed. Training set: {self.X_train_scaled.shape}")
    
    def train(self):
        """Train the model"""
        self.model.fit(self.X_train_scaled, self.y_train)
        self.is_trained = True
        print("Model trained successfully!")
    
    def evaluate(self):
        """Evaluate the model"""
        if not self.is_trained:
            print("Model needs to be trained first!")
            return
        
        # Make predictions
        y_pred = self.model.predict(self.X_test_scaled)
        
        # Print evaluation metrics
        print("Classification Report:")
        print(classification_report(self.y_test, y_pred))
        
        # Plot confusion matrix
        cm = confusion_matrix(self.y_test, y_pred)
        plt.figure(figsize=(8, 6))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
        plt.title('Confusion Matrix')
        plt.ylabel('Actual')
        plt.xlabel('Predicted')
        plt.show()
        
        return y_pred
    
    def predict(self, new_data):
        """Make predictions on new data"""
        if not self.is_trained:
            print("Model needs to be trained first!")
            return None
        
        new_data_scaled = self.scaler.transform(new_data)
        return self.model.predict(new_data_scaled)

# Example usage
if __name__ == "__main__":
    # Initialize the model
    ml_model = MLModel()
    
    # Load your data (replace with your CSV file path)
    # data = ml_model.load_data('your_dataset.csv')
    
    # Preprocess data (replace 'target' with your target column name)
    # ml_model.preprocess_data('target')
    
    # Train the model
    # ml_model.train()
    
    # Evaluate the model
    # predictions = ml_model.evaluate()
    
    print("ML Model template ready for your data!")`,
    },
  ];

  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate real-time AI analysis
    if (code.length > 10) {
      const timer = setTimeout(() => {
        generateAISuggestions();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [code]);

  const generateAISuggestions = () => {
    const suggestions: CodeSuggestion[] = [
      {
        id: '1',
        type: 'completion',
        title: 'Auto-complete function',
        description: 'Complete the function definition based on context',
        code: 'def calculate_average(numbers):\n    return sum(numbers) / len(numbers)',
        confidence: 95,
        line: 5,
      },
      {
        id: '2',
        type: 'optimization',
        title: 'Performance optimization',
        description: 'Use list comprehension for better performance',
        code: 'result = [x*2 for x in numbers]',
        confidence: 88,
        line: 8,
      },
      {
        id: '3',
        type: 'fix',
        title: 'Potential bug fix',
        description: 'Add null check to prevent runtime error',
        code: 'if numbers and len(numbers) > 0:',
        confidence: 92,
        line: 3,
        severity: 'warning',
      },
    ];

    setAIAssistant(prev => ({
      ...prev,
      suggestions,
    }));
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('');
    setErrors('');

    // Simulate code execution
    setTimeout(() => {
      if (language === 'python' && code.includes('print')) {
        setOutput('Hello, World!\nCode executed successfully!');
      } else if (language === 'javascript' && code.includes('console.log')) {
        setOutput('Hello, World!\nCode executed successfully!');
      } else {
        setOutput('Code executed successfully!');
      }
      setIsRunning(false);
    }, 2000);
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: chatInput,
      timestamp: new Date().toISOString(),
      type: 'text',
    };

    setAIAssistant(prev => ({
      ...prev,
      conversation: [...prev.conversation, userMessage],
      isTyping: true,
    }));

    setChatInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: generateAIResponse(userMessage.content),
        timestamp: new Date().toISOString(),
        type: 'text',
      };

      setAIAssistant(prev => ({
        ...prev,
        conversation: [...prev.conversation, aiResponse],
        isTyping: false,
      }));
    }, 1500);
  };

  const generateAIResponse = (userInput: string): string => {
    if (userInput.toLowerCase().includes('bug') || userInput.toLowerCase().includes('error')) {
      return 'I can help you debug your code! Looking at your current code, I notice a few potential issues. Would you like me to suggest specific fixes?';
    } else if (userInput.toLowerCase().includes('optimize')) {
      return 'Great question about optimization! Here are some suggestions: 1) Use list comprehensions where possible, 2) Consider using built-in functions, 3) Profile your code to identify bottlenecks. Would you like me to analyze your current code?';
    } else if (userInput.toLowerCase().includes('explain')) {
      return "I'd be happy to explain your code! Let me break down what each part does and suggest improvements if needed.";
    } else {
      return "I understand you need help with your code. Could you be more specific about what you'd like assistance with? I can help with debugging, optimization, explanations, or code reviews.";
    }
  };

  const applySuggestion = (suggestion: CodeSuggestion) => {
    if (suggestion.line && editorRef.current) {
      const lines = code.split('\n');
      lines.splice(suggestion.line - 1, 0, suggestion.code);
      setCode(lines.join('\n'));
    }
  };

  const loadTemplate = (template: CodeTemplate) => {
    setCode(template.code);
    setLanguage(template.language);
    setSelectedTemplate(template);
  };

  const getAnalysisColor = (score: number): 'success' | 'warning' | 'error' => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const getSeverityColor = (severity: string): 'info' | 'warning' | 'error' | 'default' => {
    const colors = {
      low: 'info' as const,
      medium: 'warning' as const,
      high: 'error' as const,
      critical: 'error' as const,
    };
    return colors[severity as keyof typeof colors] || 'default';
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Main Editor Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar */}
        <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1, borderRadius: 0 }}>
          <FormControl size='small' sx={{ minWidth: 120 }}>
            <InputLabel>Language</InputLabel>
            <Select value={language} label='Language' onChange={e => setLanguage(e.target.value)}>
              <MenuItem value='python'>Python</MenuItem>
              <MenuItem value='javascript'>JavaScript</MenuItem>
              <MenuItem value='typescript'>TypeScript</MenuItem>
              <MenuItem value='java'>Java</MenuItem>
              <MenuItem value='cpp'>C++</MenuItem>
              <MenuItem value='go'>Go</MenuItem>
            </Select>
          </FormControl>

          <Divider orientation='vertical' flexItem />

          <Button
            variant='contained'
            startIcon={isRunning ? <StopIcon /> : <RunIcon />}
            onClick={runCode}
            disabled={isRunning}
            color={isRunning ? 'error' : 'primary'}
          >
            {isRunning ? 'Running...' : 'Run Code'}
          </Button>

          <Button startIcon={<SaveIcon />} variant='outlined'>
            Save
          </Button>

          <Button startIcon={<ShareIcon />} variant='outlined'>
            Share
          </Button>

          <Divider orientation='vertical' flexItem />

          <Tooltip title='AI Assistant'>
            <IconButton
              onClick={() => setAIDrawerOpen(!aiDrawerOpen)}
              color={aiAssistant.isActive ? 'primary' : 'default'}
            >
              <Badge badgeContent={aiAssistant.suggestions.length} color='error'>
                <AIIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title='Code Analysis'>
            <IconButton>
              <AnalyticsIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title='Voice Commands'>
            <IconButton>
              <VoiceIcon />
            </IconButton>
          </Tooltip>
        </Paper>

        {/* Editor Content */}
        <Box sx={{ flex: 1, display: 'flex' }}>
          {/* Code Editor */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Paper sx={{ flex: 1, p: 0, borderRadius: 0 }}>
              <TextField
                ref={editorRef}
                multiline
                fullWidth
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder={`# Start typing your ${language} code here...
# AI will provide real-time suggestions and analysis

def hello_world():
    print("Hello, World!")
    return "Welcome to AI-powered coding!"

if __name__ == "__main__":
    message = hello_world()
    print(message)`}
                variant='outlined'
                sx={{
                  height: '100%',
                  '& .MuiOutlinedInput-root': {
                    height: '100%',
                    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                    fontSize: '14px',
                    lineHeight: '1.4',
                  },
                  '& .MuiOutlinedInput-input': {
                    height: '100% !important',
                    overflowY: 'auto',
                  },
                  '& fieldset': { border: 'none' },
                }}
              />
            </Paper>

            {/* Output/Console */}
            <Paper sx={{ height: 200, p: 1, borderRadius: 0, borderTop: '1px solid #ddd' }}>
              <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                <Tab label='Output' />
                <Tab label='Errors' />
                <Tab label='Console' />
              </Tabs>

              <Box
                sx={{
                  mt: 1,
                  height: 140,
                  overflow: 'auto',
                  bgcolor: '#1e1e1e',
                  color: '#d4d4d4',
                  p: 1,
                  fontFamily: 'monospace',
                }}
              >
                {activeTab === 0 && (
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {isRunning
                      ? 'Running code...'
                      : output || 'No output yet. Run your code to see results.'}
                  </pre>
                )}
                {activeTab === 1 && (
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#f48771' }}>
                    {errors || 'No errors found.'}
                  </pre>
                )}
                {activeTab === 2 && (
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    Welcome to the AI Code Editor Console Type 'help' for available commands
                  </pre>
                )}
              </Box>
            </Paper>
          </Box>

          {/* Right Panel - Code Analysis */}
          <Paper sx={{ width: 300, borderRadius: 0, borderLeft: '1px solid #ddd' }}>
            <Box sx={{ p: 2 }}>
              <Typography variant='h6' gutterBottom>
                Code Analysis
              </Typography>

              {/* Quality Metrics */}
              <Box sx={{ mb: 2 }}>
                <Typography variant='subtitle2' gutterBottom>
                  Quality Scores
                </Typography>

                <Box sx={{ mb: 1 }}>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Typography variant='caption'>Complexity</Typography>
                    <Typography variant='caption'>{codeAnalysis.complexity}%</Typography>
                  </Box>
                  <LinearProgress
                    variant='determinate'
                    value={codeAnalysis.complexity}
                    color={getAnalysisColor(codeAnalysis.complexity)}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>

                <Box sx={{ mb: 1 }}>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Typography variant='caption'>Performance</Typography>
                    <Typography variant='caption'>{codeAnalysis.performance}%</Typography>
                  </Box>
                  <LinearProgress
                    variant='determinate'
                    value={codeAnalysis.performance}
                    color={getAnalysisColor(codeAnalysis.performance)}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>

                <Box sx={{ mb: 1 }}>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Typography variant='caption'>Security</Typography>
                    <Typography variant='caption'>{codeAnalysis.security}%</Typography>
                  </Box>
                  <LinearProgress
                    variant='determinate'
                    value={codeAnalysis.security}
                    color={getAnalysisColor(codeAnalysis.security)}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              </Box>

              {/* Issues */}
              <Box sx={{ mb: 2 }}>
                <Typography variant='subtitle2' gutterBottom>
                  Issues Found
                </Typography>
                <List dense>
                  {codeAnalysis.issues.map(issue => (
                    <ListItem key={issue.id} sx={{ px: 0 }}>
                      <ListItemIcon>
                        {issue.severity === 'critical' || issue.severity === 'high' ? (
                          <ErrorIcon color='error' fontSize='small' />
                        ) : (
                          <WarningIcon color='warning' fontSize='small' />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={issue.message}
                        secondary={`Line ${issue.line} • ${issue.type}`}
                        primaryTypographyProps={{ variant: 'caption' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              {/* Metrics */}
              <Box>
                <Typography variant='subtitle2' gutterBottom>
                  Metrics
                </Typography>
                <Grid container spacing={1}>
                  <Grid size={{ xs: 6 }}>
                    <Paper sx={{ p: 1, textAlign: 'center' }}>
                      <Typography variant='h6'>{codeAnalysis.metrics.linesOfCode}</Typography>
                      <Typography variant='caption'>Lines</Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Paper sx={{ p: 1, textAlign: 'center' }}>
                      <Typography variant='h6'>
                        {codeAnalysis.metrics.cyclomaticComplexity}
                      </Typography>
                      <Typography variant='caption'>Complexity</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* AI Assistant Drawer */}
      <Drawer
        anchor='right'
        open={aiDrawerOpen}
        onClose={() => setAIDrawerOpen(false)}
        variant='persistent'
        sx={{
          width: 400,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 400,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* AI Assistant Header */}
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography variant='h6' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AIIcon color='primary' />
              AI Assistant
            </Typography>
            <IconButton onClick={() => setAIDrawerOpen(false)} size='small'>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* AI Mode Selection */}
          <FormControl fullWidth size='small' sx={{ mb: 2 }}>
            <InputLabel>AI Mode</InputLabel>
            <Select
              value={aiAssistant.mode}
              label='AI Mode'
              onChange={e => setAIAssistant(prev => ({ ...prev, mode: e.target.value as any }))}
            >
              <MenuItem value='helper'>Code Helper</MenuItem>
              <MenuItem value='tutor'>Programming Tutor</MenuItem>
              <MenuItem value='reviewer'>Code Reviewer</MenuItem>
              <MenuItem value='pair-programmer'>Pair Programmer</MenuItem>
            </Select>
          </FormControl>

          <Tabs value={0} sx={{ mb: 2 }}>
            <Tab label='Chat' />
            <Tab label='Suggestions' />
            <Tab label='Templates' />
          </Tabs>

          {/* Chat Interface */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
              {aiAssistant.conversation.map(message => (
                <Box
                  key={message.id}
                  sx={{
                    mb: 1,
                    p: 1,
                    borderRadius: 1,
                    bgcolor: message.sender === 'user' ? 'primary.light' : 'grey.100',
                    color: message.sender === 'user' ? 'white' : 'text.primary',
                    alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Typography variant='body2'>{message.content}</Typography>
                  <Typography variant='caption' sx={{ opacity: 0.7 }}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </Typography>
                </Box>
              ))}
              {aiAssistant.isTyping && (
                <Box sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant='body2' sx={{ fontStyle: 'italic' }}>
                    AI is typing...
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Chat Input */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size='small'
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && sendChatMessage()}
                placeholder='Ask AI about your code...'
              />
              <Button variant='contained' onClick={sendChatMessage} disabled={!chatInput.trim()}>
                Send
              </Button>
            </Box>
          </Box>

          {/* AI Suggestions */}
          {aiAssistant.suggestions.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant='subtitle2' gutterBottom>
                AI Suggestions
              </Typography>
              {aiAssistant.suggestions.map(suggestion => (
                <Accordion key={suggestion.id}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <SuggestionIcon color='primary' fontSize='small' />
                      <Typography variant='body2' sx={{ flex: 1 }}>
                        {suggestion.title}
                      </Typography>
                      <Chip label={`${suggestion.confidence}%`} size='small' color='primary' />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant='body2' sx={{ mb: 1 }}>
                      {suggestion.description}
                    </Typography>
                    <Paper sx={{ p: 1, bgcolor: 'grey.50', mb: 1 }}>
                      <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
                        {suggestion.code}
                      </Typography>
                    </Paper>
                    <Button
                      size='small'
                      variant='contained'
                      onClick={() => applySuggestion(suggestion)}
                    >
                      Apply Suggestion
                    </Button>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}

          {/* Code Templates */}
          <Box sx={{ mt: 2 }}>
            <Typography variant='subtitle2' gutterBottom>
              Code Templates
            </Typography>
            <List dense>
              {codeTemplates.slice(0, 3).map(template => (
                <ListItem key={template.id} sx={{ px: 0 }}>
                  <Card sx={{ width: '100%' }}>
                    <CardContent sx={{ p: 1 }}>
                      <Typography variant='subtitle2' gutterBottom>
                        {template.name}
                      </Typography>
                      <Typography variant='caption' color='text.secondary' display='block'>
                        {template.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
                        <Chip label={template.language} size='small' color='primary' />
                        <Chip
                          label={template.difficulty}
                          size='small'
                          color={getDifficultyColor(template.difficulty)}
                        />
                        <Button size='small' onClick={() => loadTemplate(template)}>
                          Load
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

const getDifficultyColor = (difficulty: string): 'success' | 'warning' | 'error' | 'default' => {
  const colors = {
    beginner: 'success' as const,
    intermediate: 'warning' as const,
    advanced: 'error' as const,
  };
  return colors[difficulty as keyof typeof colors] || 'default';
};

export default AICodeEditorPage;
