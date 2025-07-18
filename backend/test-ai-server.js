const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST'],
  credentials: true,
}));
app.use(express.json());

// Test if AI keys are loaded
const hasOpenAI = !!process.env.OPENAI_API_KEY;
const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
const hasGemini = !!process.env.GEMINI_API_KEY;

console.log('🔑 AI API Keys Status:');
console.log(`OpenAI: ${hasOpenAI ? '✅ Found' : '❌ Missing'}`);
console.log(`Anthropic: ${hasAnthropic ? '✅ Found' : '❌ Missing'}`);
console.log(`Gemini: ${hasGemini ? '✅ Found' : '❌ Missing'}`);

// Health endpoint
app.get('/api/ai/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: hasOpenAI || hasAnthropic || hasGemini ? 'healthy' : 'degraded',
      services: {
        openai: hasOpenAI,
        anthropic: hasAnthropic,
        gemini: hasGemini
      },
      timestamp: new Date().toISOString()
    }
  });
});

// AI Agents endpoint
app.get('/api/ai/agents', (req, res) => {
  res.json({
    success: true,
    data: {
      tutor: { available: true, provider: hasOpenAI ? 'openai' : 'mock' },
      content: { available: true, provider: hasOpenAI ? 'openai' : 'mock' },
      assessment: { available: true, provider: hasOpenAI ? 'openai' : 'mock' },
      doubt: { available: true, provider: hasOpenAI ? 'openai' : 'mock' }
    }
  });
});

// AI Request endpoint
app.post('/api/ai/request', (req, res) => {
  console.log('📥 AI Request received:', req.body);
  
  const { prompt, agentType = 'tutor', metadata = {} } = req.body;
  
  // Mock response for now
  res.json({
    success: true,
    data: {
      id: `${agentType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agentType,
      provider: hasOpenAI ? 'openai' : 'mock',
      content: hasOpenAI ? 
        `I apologize, but I'm currently experiencing technical difficulties. Please try again in a moment.` :
        `Mock response: I understand you asked about "${prompt}". This is a test response since AI services are not fully configured.`,
      metadata,
      timestamp: new Date().toISOString()
    }
  });
});

// AI Tutor endpoint
app.post('/api/ai/tutor', (req, res) => {
  console.log('📚 AI Tutor request:', req.body);
  
  const { prompt, subject = 'general', level = 'intermediate', jsonMode = false } = req.body;
  
  let content;
  if (jsonMode) {
    content = JSON.stringify({
      title: `Understanding: ${prompt}`,
      summary: `This is a test explanation for "${prompt}". The AI service is responding but may be experiencing limitations.`,
      keyPoints: [
        `Key concept 1 about ${prompt}`,
        `Key concept 2 about ${prompt}`,
        `Key concept 3 about ${prompt}`
      ],
      realWorldExample: `Think of ${prompt} like something you use in everyday life - it's more practical than you might think!`
    });
  } else {
    content = hasOpenAI ? 
      `I apologize, but I'm currently experiencing technical difficulties. Please try again in a moment.` :
      `Test response for: "${prompt}". Subject: ${subject}, Level: ${level}. The AI service is working but may have limited functionality.`;
  }
  
  res.json({
    success: true,
    data: {
      id: `tutor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agentType: 'tutor',
      provider: hasOpenAI ? 'openai' : 'mock',
      content,
      metadata: { subject, level, jsonMode },
      timestamp: new Date().toISOString()
    }
  });
});

// Catch all for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test AI Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/ai/health`);
  console.log(`🤖 AI endpoints: http://localhost:${PORT}/api/ai/`);
  console.log(`🌐 CORS enabled for: http://localhost:3000`);
});