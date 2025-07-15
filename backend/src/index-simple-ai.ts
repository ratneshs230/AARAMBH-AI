import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import DatabaseConfig from './config/database';
import FirebaseConfig from './config/firebase';
import AIServiceConfig from './config/ai-services';
import apiRoutes from './routes/index-simple';
import aiRoutes from './routes/simple-ai';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://aitutor-frontend-123.azurestaticapps.net'] 
      : ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://aitutor-frontend-123.azurestaticapps.net'] 
    : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/', limiter);

// API Routes
app.use('/api', apiRoutes);
app.use('/api/ai', aiRoutes);

app.get('/health', async (_req, res) => {
  try {
    const dbHealth = await DatabaseConfig.getInstance().healthCheck();
    let aiHealth = { openai: false, gemini: false, anthropic: false };
    
    try {
      aiHealth = await AIServiceConfig.getInstance().healthCheck();
    } catch (error) {
      console.warn('AI health check failed:', error);
    }
    
    const healthStatus = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: dbHealth,
      aiServices: aiHealth,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
      }
    };

    const isHealthy = dbHealth.mongodb && dbHealth.cosmosdb;
    
    res.status(isHealthy ? 200 : 503).json(healthStatus);
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

app.get('/api/status', (_req, res) => {
  res.json({
    message: 'AARAMBH AI Backend is running with AI Agents',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    features: {
      ai_agents: 'enabled',
      ai_services: ['openai', 'gemini', 'anthropic'],
      database: 'mongodb + cosmosdb',
      real_time: 'socket.io'
    },
    phase: 'Phase 3: AI Agent System - 50% Complete'
  });
});

app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to AARAMBH AI - AI-Powered Educational Platform',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health',
    status: '/api/status',
    ai: {
      agents: '/api/ai/agents',
      health: '/api/ai/health',
      tutor: '/api/ai/tutor/ask',
      content: '/api/ai/content/create',
      assessment: '/api/ai/assessment/create',
      doubt_solver: '/api/ai/doubt/solve'
    }
  });
});

// Socket.IO with AI features
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });

  socket.on('join_room', (roomId: string) => {
    socket.join(roomId);
    console.log(`👥 User ${socket.id} joined room: ${roomId}`);
  });

  socket.on('leave_room', (roomId: string) => {
    socket.leave(roomId);
    console.log(`👥 User ${socket.id} left room: ${roomId}`);
  });

  // AI-powered real-time events
  socket.on('ai_question', (data) => {
    console.log(`🤖 AI question from ${socket.id}: ${data.agentType}`);
    socket.emit('ai_response', {
      success: true,
      message: 'AI processing your question...',
      requestId: data.requestId,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('study_session_start', (data) => {
    console.log(`📚 Study session started: ${data.subject || 'General'} by ${socket.id}`);
    socket.emit('study_session_confirmed', {
      sessionId: `study_${Date.now()}`,
      subject: data.subject || 'General',
      timestamp: new Date().toISOString()
    });
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('❌ Unhandled error:', error);
  
  res.status(error.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

async function startServer() {
  try {
    console.log('🚀 Starting AARAMBH AI Backend Server with AI Agents...');
    
    // Initialize database connections
    const dbConfig = DatabaseConfig.getInstance();
    await dbConfig.connectMongoDB();
    await dbConfig.connectCosmosDB();
    
    // Initialize Firebase
    const firebaseConfig = FirebaseConfig.getInstance();
    await firebaseConfig.initialize();
    
    // Initialize AI Services
    console.log('🤖 Initializing AI Services...');
    const aiConfig = AIServiceConfig.getInstance();
    
    try {
      await aiConfig.initializeOpenAI();
    } catch (error) {
      console.warn('⚠️  OpenAI initialization failed, will use fallback');
    }
    
    try {
      await aiConfig.initializeGemini();
    } catch (error) {
      console.warn('⚠️  Gemini initialization failed, will use fallback');
    }
    
    try {
      await aiConfig.initializeAnthropic();
    } catch (error) {
      console.warn('⚠️  Anthropic initialization failed, will use fallback');
    }
    
    console.log('✅ AI services initialization completed');
    
    server.listen(PORT, () => {
      console.log(`✅ AARAMBH AI Server is running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔄 API Status: http://localhost:${PORT}/api/status`);
      console.log(`📖 Welcome: http://localhost:${PORT}`);
      console.log(`🤖 AI Agents: http://localhost:${PORT}/api/ai/agents`);
      console.log(`🎓 AI Tutor: POST http://localhost:${PORT}/api/ai/tutor/ask`);
      console.log(`📝 Content Creator: POST http://localhost:${PORT}/api/ai/content/create`);
      console.log(`📊 Assessment Generator: POST http://localhost:${PORT}/api/ai/assessment/create`);
      console.log(`❓ Doubt Solver: POST http://localhost:${PORT}/api/ai/doubt/solve`);
      
      // Log sample request
      console.log('\n📋 Sample AI Request:');
      console.log('curl -X POST http://localhost:' + PORT + '/api/ai/tutor/ask \\');
      console.log('  -H "Content-Type: application/json" \\');
      console.log('  -d \'{"prompt": "Explain photosynthesis in simple terms", "subject": "biology", "level": "grade10"}\'');
    });

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

async function gracefulShutdown(signal: string) {
  console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);
  
  server.close(async () => {
    console.log('🔌 HTTP server closed');
    
    try {
      await DatabaseConfig.getInstance().disconnectMongoDB();
      console.log('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error('⏰ Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
}

if (require.main === module) {
  startServer();
}

export { app, io };