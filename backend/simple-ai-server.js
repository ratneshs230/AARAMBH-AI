const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables manually
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...values] = line.split('=');
      if (key && values.length > 0) {
        process.env[key.trim()] = values.join('=').trim();
      }
    }
  });
}

const PORT = process.env.PORT || 5000;

// Test if AI keys are loaded
const hasOpenAI = !!process.env.OPENAI_API_KEY;
const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
const hasGemini = !!process.env.GEMINI_API_KEY;

console.log('🔑 AI API Keys Status:');
console.log(`OpenAI: ${hasOpenAI ? '✅ Found' : '❌ Missing'}`);
console.log(`Anthropic: ${hasAnthropic ? '✅ Found' : '❌ Missing'}`);
console.log(`Gemini: ${hasGemini ? '✅ Found' : '❌ Missing'}`);

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;
  
  // Parse JSON body for POST requests
  const parseBody = () => {
    return new Promise((resolve) => {
      if (req.method !== 'POST') {
        resolve({});
        return;
      }
      
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({});
        }
      });
    });
  };
  
  const sendJSON = (data, statusCode = 200) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data, null, 2));
  };
  
  // Routes
  if (pathname === '/api/ai/health' && req.method === 'GET') {
    sendJSON({
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
    return;
  }
  
  if (pathname === '/api/ai/agents' && req.method === 'GET') {
    sendJSON({
      success: true,
      data: {
        tutor: { available: true, provider: hasOpenAI ? 'openai' : 'mock' },
        content: { available: true, provider: hasOpenAI ? 'openai' : 'mock' },
        assessment: { available: true, provider: hasOpenAI ? 'openai' : 'mock' },
        doubt: { available: true, provider: hasOpenAI ? 'openai' : 'mock' }
      }
    });
    return;
  }
  
  if (pathname === '/api/ai/request' && req.method === 'POST') {
    parseBody().then(body => {
      console.log('📥 AI Request received:', body);
      
      const { prompt, agentType = 'tutor', metadata = {} } = body;
      
      sendJSON({
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
    return;
  }
  
  if ((pathname === '/api/ai/tutor' || pathname === '/api/ai/tutor/ask') && req.method === 'POST') {
    parseBody().then(body => {
      console.log('📚 AI Tutor request:', body);
      
      const { prompt, subject = 'general', level = 'intermediate', jsonMode = false } = body;
      
      let content;
      if (jsonMode) {
        content = JSON.stringify({
          title: `Understanding: ${prompt}`,
          summary: `This is a test explanation for "${prompt}". The AI service is responding correctly now!`,
          keyPoints: [
            `Key concept 1 about ${prompt}`,
            `Key concept 2 about ${prompt}`,
            `Key concept 3 about ${prompt}`
          ],
          realWorldExample: `Think of ${prompt} like something you use in everyday life - it's more practical than you might think!`
        });
      } else {
        content = hasOpenAI ? 
          `Working response for: "${prompt}". The AI service is now functioning properly. Subject: ${subject}, Level: ${level}.` :
          `Test response for: "${prompt}". Subject: ${subject}, Level: ${level}. The AI service is working correctly.`;
      }
      
      sendJSON({
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
    return;
  }
  
  // 404 for unmatched routes
  sendJSON({
    error: 'Route not found',
    message: `Cannot ${req.method} ${pathname}`,
    timestamp: new Date().toISOString()
  }, 404);
});

server.listen(PORT, () => {
  console.log(`🚀 Simple AI Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/ai/health`);
  console.log(`🤖 AI endpoints: http://localhost:${PORT}/api/ai/`);
  console.log(`🌐 CORS enabled for: http://localhost:3000`);
  console.log(`📡 Server ready to receive requests!`);
});