/**
 * AARAMBH AI - AI Endpoints Integration Tests
 * Test suite for AI-related API endpoints
 */

import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import app from '../../../src/index';
import { jest } from '@jest/globals';

describe('AI API Endpoints', () => {
  let mongod: MongoMemoryServer;
  let mongoClient: MongoClient;
  let authToken: string;

  beforeAll(async () => {
    // Start in-memory MongoDB instance
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();

    // Set test environment variables
    process.env.MONGODB_URI = uri;
    process.env.JWT_SECRET = 'test-secret';
    process.env.OPENAI_API_KEY = 'test-key';
    
    // Create test user and get auth token
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Test123!',
        firstName: 'Test',
        lastName: 'User'
      });

    authToken = userResponse.body.token;
  });

  afterAll(async () => {
    await mongoClient.close();
    await mongod.stop();
  });

  describe('POST /api/ai/health', () => {
    it('should return health status of AI services', async () => {
      const response = await request(app)
        .get('/api/ai/health')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('services');
    });

    it('should return service details', async () => {
      const response = await request(app)
        .get('/api/ai/health')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.data.services).toHaveProperty('openai');
      expect(response.body.data.services).toHaveProperty('gemini');
      expect(response.body.data.services).toHaveProperty('anthropic');
    });
  });

  describe('POST /api/ai/tutor', () => {
    it('should generate tutor explanation', async () => {
      const response = await request(app)
        .post('/api/ai/tutor')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          prompt: 'Explain photosynthesis',
          subject: 'biology',
          level: 'grade_10'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('explanation');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/ai/tutor')
        .send({
          prompt: 'Explain photosynthesis',
          subject: 'biology'
        });

      expect(response.status).toBe(401);
    });

    it('should validate input parameters', async () => {
      const response = await request(app)
        .post('/api/ai/tutor')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing required prompt
          subject: 'biology'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle JSON mode requests', async () => {
      const response = await request(app)
        .post('/api/ai/tutor')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          prompt: 'Explain quadratic equations',
          subject: 'mathematics',
          jsonMode: true
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('content');
    });
  });

  describe('POST /api/ai/content', () => {
    it('should generate educational content', async () => {
      const response = await request(app)
        .post('/api/ai/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          topic: 'Newton\'s Laws of Motion',
          subject: 'physics',
          level: 'grade_11',
          contentType: 'lesson'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('content');
    });

    it('should generate different content types', async () => {
      const response = await request(app)
        .post('/api/ai/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          topic: 'Algebra',
          subject: 'mathematics',
          contentType: 'worksheet'
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('content');
      expect(response.body.data.contentType).toBe('worksheet');
    });
  });

  describe('POST /api/ai/assessment', () => {
    it('should generate assessment questions', async () => {
      const response = await request(app)
        .post('/api/ai/assessment')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          topic: 'Fractions',
          subject: 'mathematics',
          level: 'grade_5',
          questionCount: 5,
          assessmentType: 'quiz'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('questions');
      expect(response.body.data.questions).toHaveLength(5);
    });

    it('should validate question count limits', async () => {
      const response = await request(app)
        .post('/api/ai/assessment')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          topic: 'Test Topic',
          questionCount: 100 // Exceeds limit
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/ai/doubt', () => {
    it('should solve student doubts', async () => {
      const response = await request(app)
        .post('/api/ai/doubt')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          question: 'How do I solve 2x + 5 = 13?',
          subject: 'mathematics',
          needSteps: true
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('solution');
    });

    it('should provide step-by-step solutions when requested', async () => {
      const response = await request(app)
        .post('/api/ai/doubt')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          question: 'Solve quadratic equation x² - 5x + 6 = 0',
          subject: 'mathematics',
          needSteps: true
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('steps');
    });
  });

  describe('POST /api/ai/request', () => {
    it('should route to appropriate AI agent', async () => {
      const response = await request(app)
        .post('/api/ai/request')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          prompt: 'Create a study schedule for math exam',
          agentType: 'study_planner'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('agentType', 'study_planner');
    });

    it('should validate agent type', async () => {
      const response = await request(app)
        .post('/api/ai/request')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          prompt: 'Test prompt',
          agentType: 'invalid_agent'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on AI endpoints', async () => {
      const promises = [];
      
      // Make multiple requests quickly
      for (let i = 0; i < 15; i++) {
        promises.push(
          request(app)
            .post('/api/ai/tutor')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              prompt: `Test prompt ${i}`,
              subject: 'mathematics'
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // Should have some rate-limited responses
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle AI service errors gracefully', async () => {
      // Mock AI service to return error
      jest.spyOn(require('../../../src/services/ai-service'), 'generateContent')
        .mockRejectedValueOnce(new Error('AI service unavailable'));

      const response = await request(app)
        .post('/api/ai/tutor')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          prompt: 'Test prompt',
          subject: 'mathematics'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should handle malformed requests', async () => {
      const response = await request(app)
        .post('/api/ai/tutor')
        .set('Authorization', `Bearer ${authToken}`)
        .send('invalid json');

      expect(response.status).toBe(400);
    });
  });

  describe('Authentication & Authorization', () => {
    it('should require valid JWT token', async () => {
      const response = await request(app)
        .post('/api/ai/tutor')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          prompt: 'Test prompt',
          subject: 'mathematics'
        });

      expect(response.status).toBe(401);
    });

    it('should validate token expiry', async () => {
      const expiredToken = 'expired-jwt-token';
      
      const response = await request(app)
        .post('/api/ai/tutor')
        .set('Authorization', `Bearer ${expiredToken}`)
        .send({
          prompt: 'Test prompt',
          subject: 'mathematics'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Input Validation', () => {
    it('should sanitize user inputs', async () => {
      const response = await request(app)
        .post('/api/ai/tutor')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          prompt: '<script>alert("xss")</script>Explain photosynthesis',
          subject: 'biology'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.originalPrompt).not.toContain('<script>');
    });

    it('should validate prompt length', async () => {
      const longPrompt = 'a'.repeat(10000);
      
      const response = await request(app)
        .post('/api/ai/tutor')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          prompt: longPrompt,
          subject: 'mathematics'
        });

      expect(response.status).toBe(400);
    });
  });
});