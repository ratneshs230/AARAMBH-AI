const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
}));
app.use(express.json());

// Mock AI response function
const mockAIResponse = (prompt, agentType = 'tutor') => {
  const responses = {
    tutor: `As your AI tutor, I understand you're asking about: "${prompt}". This is a great question! Let me explain this concept step by step...`,
    content: `Content created for: "${prompt}". Here's a comprehensive lesson plan...`,
    assessment: `Assessment created for: "${prompt}". Here are some practice questions...`,
    doubt: `Doubt resolved for: "${prompt}". The solution involves...`
  };
  
  return {
    success: true,
    data: {
      response: responses[agentType] || responses.tutor,
      agentType,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`,
      metadata: {
        processingTime: Math.random() * 2000 + 500,
        confidence: 0.95,
        sources: ['Knowledge Base', 'Educational Resources']
      }
    }
  };
};

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AARAMBH AI Backend - Full AI Services',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    features: {
      ai_tutor: 'enabled',
      content_creator: 'enabled',
      assessment: 'enabled',
      doubt_solver: 'enabled'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      ai_tutor: 'running',
      database: 'connected',
      api: 'operational'
    }
  });
});

// AI Tutor endpoint
app.post('/api/ai/tutor/ask', (req, res) => {
  const { prompt, subject, level } = req.body;
  
  if (!prompt) {
    return res.status(400).json({
      success: false,
      error: 'Prompt is required'
    });
  }

  const response = mockAIResponse(prompt, 'tutor');
  response.data.subject = subject;
  response.data.level = level;
  
  res.json(response);
});

// Content Creator endpoint
app.post('/api/ai/content/create', (req, res) => {
  const { prompt, subject, level } = req.body;
  
  if (!prompt) {
    return res.status(400).json({
      success: false,
      error: 'Prompt is required'
    });
  }

  const response = mockAIResponse(prompt, 'content');
  response.data.subject = subject;
  response.data.level = level;
  
  res.json(response);
});

// Assessment Creator endpoint
app.post('/api/ai/assessment/create', (req, res) => {
  const { prompt, subject, level } = req.body;
  
  if (!prompt) {
    return res.status(400).json({
      success: false,
      error: 'Prompt is required'
    });
  }

  const response = mockAIResponse(prompt, 'assessment');
  response.data.subject = subject;
  response.data.level = level;
  
  res.json(response);
});

// Doubt Solver endpoint
app.post('/api/ai/doubt/solve', (req, res) => {
  const { prompt, subject, level } = req.body;
  
  if (!prompt) {
    return res.status(400).json({
      success: false,
      error: 'Prompt is required'
    });
  }

  const response = mockAIResponse(prompt, 'doubt');
  response.data.subject = subject;
  response.data.level = level;
  
  res.json(response);
});

// Generic AI request endpoint
app.post('/api/ai/request', (req, res) => {
  const { prompt, agentType } = req.body;
  
  if (!prompt) {
    return res.status(400).json({
      success: false,
      error: 'Prompt is required'
    });
  }

  const response = mockAIResponse(prompt, agentType);
  res.json(response);
});

// AI Agents info
app.get('/api/ai/agents', (req, res) => {
  res.json({
    success: true,
    data: {
      tutor: {
        name: 'AI Tutor',
        description: 'Personalized learning assistance',
        endpoint: '/api/ai/tutor/ask',
        status: 'active'
      },
      content_creator: {
        name: 'Content Creator',
        description: 'Educational content generation',
        endpoint: '/api/ai/content/create',
        status: 'active'
      },
      assessment: {
        name: 'Assessment Generator',
        description: 'Quiz and test creation',
        endpoint: '/api/ai/assessment/create',
        status: 'active'
      },
      doubt_solver: {
        name: 'Doubt Solver',
        description: 'Problem solving assistance',
        endpoint: '/api/ai/doubt/solve',
        status: 'active'
      }
    }
  });
});

// Catch all 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AARAMBH AI Backend Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 AI Tutor: POST http://localhost:${PORT}/api/ai/tutor/ask`);
  console.log(`📝 Content Creator: POST http://localhost:${PORT}/api/ai/content/create`);
  console.log(`📊 Assessment: POST http://localhost:${PORT}/api/ai/assessment/create`);
  console.log(`❓ Doubt Solver: POST http://localhost:${PORT}/api/ai/doubt/solve`);
});