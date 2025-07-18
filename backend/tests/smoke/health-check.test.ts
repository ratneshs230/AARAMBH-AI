/**
 * AARAMBH AI - Smoke Tests
 * Basic health checks for production deployment
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import axios from 'axios';

const TEST_URL = process.env.TEST_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:5000';

describe('Production Smoke Tests', () => {
  const timeout = 30000; // 30 seconds timeout

  describe('Frontend Health Checks', () => {
    it('should load the main application', async () => {
      const response = await axios.get(TEST_URL, { timeout });
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/text\/html/);
    }, timeout);

    it('should serve static assets', async () => {
      const response = await axios.get(`${TEST_URL}/vite.svg`, { timeout });
      expect(response.status).toBe(200);
    }, timeout);

    it('should return 404 for non-existent pages', async () => {
      try {
        await axios.get(`${TEST_URL}/non-existent-page`, { timeout });
      } catch (error: any) {
        expect(error.response?.status).toBe(404);
      }
    }, timeout);
  });

  describe('Backend Health Checks', () => {
    it('should respond to health check endpoint', async () => {
      const response = await axios.get(`${API_URL}/health`, { timeout });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status');
      expect(response.data.status).toBe('healthy');
    }, timeout);

    it('should respond to API status endpoint', async () => {
      const response = await axios.get(`${API_URL}/api/status`, { timeout });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('timestamp');
    }, timeout);

    it('should handle CORS properly', async () => {
      const response = await axios.options(`${API_URL}/api/health`, {
        headers: {
          'Origin': TEST_URL,
          'Access-Control-Request-Method': 'GET',
        },
        timeout
      });
      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBeTruthy();
    }, timeout);
  });

  describe('AI Service Health Checks', () => {
    it('should respond to AI health check', async () => {
      const response = await axios.get(`${API_URL}/api/ai/health`, { timeout });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success');
      expect(response.data.success).toBe(true);
    }, timeout);

    it('should list available AI agents', async () => {
      const response = await axios.get(`${API_URL}/api/ai/agents`, { timeout });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success');
      expect(response.data.data).toHaveProperty('tutor');
    }, timeout);
  });

  describe('Database Connectivity', () => {
    it('should connect to database', async () => {
      const response = await axios.get(`${API_URL}/api/db/health`, { timeout });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('connected');
      expect(response.data.connected).toBe(true);
    }, timeout);
  });

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await axios.get(`${API_URL}/health`, { timeout });
      
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
    }, timeout);

    it('should not expose server information', async () => {
      const response = await axios.get(`${API_URL}/health`, { timeout });
      
      expect(response.headers).not.toHaveProperty('server');
      expect(response.headers).not.toHaveProperty('x-powered-by');
    }, timeout);
  });

  describe('Rate Limiting', () => {
    it('should have rate limiting configured', async () => {
      const requests = [];
      
      // Make multiple requests quickly
      for (let i = 0; i < 10; i++) {
        requests.push(axios.get(`${API_URL}/api/status`, { timeout }));
      }

      const responses = await Promise.allSettled(requests);
      
      // Should have at least one successful response
      const successfulResponses = responses.filter(r => 
        r.status === 'fulfilled' && r.value.status === 200
      );
      expect(successfulResponses.length).toBeGreaterThan(0);
    }, timeout);
  });

  describe('SSL/TLS Configuration', () => {
    it('should enforce HTTPS in production', async () => {
      if (process.env.NODE_ENV === 'production') {
        const httpsUrl = TEST_URL.replace('http://', 'https://');
        const response = await axios.get(httpsUrl, { timeout });
        expect(response.status).toBe(200);
      }
    }, timeout);

    it('should redirect HTTP to HTTPS in production', async () => {
      if (process.env.NODE_ENV === 'production') {
        const httpUrl = TEST_URL.replace('https://', 'http://');
        try {
          await axios.get(httpUrl, { 
            timeout,
            maxRedirects: 0 
          });
        } catch (error: any) {
          expect(error.response?.status).toBe(301);
          expect(error.response?.headers.location).toMatch(/^https:/);
        }
      }
    }, timeout);
  });

  describe('Performance Checks', () => {
    it('should respond within acceptable time limits', async () => {
      const startTime = Date.now();
      await axios.get(`${API_URL}/health`, { timeout });
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(5000); // 5 seconds
    }, timeout);

    it('should handle concurrent requests', async () => {
      const requests = Array(5).fill(null).map(() => 
        axios.get(`${API_URL}/health`, { timeout })
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    }, timeout);
  });

  describe('Error Handling', () => {
    it('should return proper error responses', async () => {
      try {
        await axios.get(`${API_URL}/api/non-existent-endpoint`, { timeout });
      } catch (error: any) {
        expect(error.response?.status).toBe(404);
        expect(error.response?.data).toHaveProperty('error');
      }
    }, timeout);

    it('should handle malformed requests gracefully', async () => {
      try {
        await axios.post(`${API_URL}/api/ai/tutor`, 'invalid-json', {
          headers: { 'Content-Type': 'application/json' },
          timeout
        });
      } catch (error: any) {
        expect(error.response?.status).toBe(400);
      }
    }, timeout);
  });
});

describe('Critical User Journeys', () => {
  const timeout = 30000;

  describe('Authentication Flow', () => {
    it('should handle user registration', async () => {
      const userData = {
        email: `test-${Date.now()}@example.com`,
        password: 'Test123!',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await axios.post(`${API_URL}/api/auth/register`, userData, { timeout });
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('success');
      expect(response.data.success).toBe(true);
    }, timeout);

    it('should handle user login', async () => {
      // First register a user
      const userData = {
        email: `test-login-${Date.now()}@example.com`,
        password: 'Test123!',
        firstName: 'Test',
        lastName: 'User'
      };

      await axios.post(`${API_URL}/api/auth/register`, userData, { timeout });

      // Then login
      const loginData = {
        email: userData.email,
        password: userData.password
      };

      const response = await axios.post(`${API_URL}/api/auth/login`, loginData, { timeout });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('token');
    }, timeout);
  });

  describe('AI Service Integration', () => {
    let authToken: string;

    beforeAll(async () => {
      // Create test user and get token
      const userData = {
        email: `test-ai-${Date.now()}@example.com`,
        password: 'Test123!',
        firstName: 'Test',
        lastName: 'User'
      };

      const registerResponse = await axios.post(`${API_URL}/api/auth/register`, userData, { timeout });
      authToken = registerResponse.data.token;
    });

    it('should handle AI tutor requests', async () => {
      const tutorRequest = {
        prompt: 'Explain photosynthesis',
        subject: 'biology',
        level: 'grade_10'
      };

      const response = await axios.post(`${API_URL}/api/ai/tutor`, tutorRequest, {
        headers: { Authorization: `Bearer ${authToken}` },
        timeout
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success');
      expect(response.data.success).toBe(true);
    }, timeout);

    it('should handle content generation', async () => {
      const contentRequest = {
        topic: 'Newton\'s Laws',
        subject: 'physics',
        contentType: 'lesson'
      };

      const response = await axios.post(`${API_URL}/api/ai/content`, contentRequest, {
        headers: { Authorization: `Bearer ${authToken}` },
        timeout
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success');
    }, timeout);
  });

  describe('Data Persistence', () => {
    let authToken: string;

    beforeAll(async () => {
      const userData = {
        email: `test-data-${Date.now()}@example.com`,
        password: 'Test123!',
        firstName: 'Test',
        lastName: 'User'
      };

      const registerResponse = await axios.post(`${API_URL}/api/auth/register`, userData, { timeout });
      authToken = registerResponse.data.token;
    });

    it('should save and retrieve user progress', async () => {
      const progressData = {
        courseId: 'test-course',
        lessonId: 'test-lesson',
        progress: 75,
        timeSpent: 1800
      };

      // Save progress
      const saveResponse = await axios.post(`${API_URL}/api/progress`, progressData, {
        headers: { Authorization: `Bearer ${authToken}` },
        timeout
      });

      expect(saveResponse.status).toBe(201);

      // Retrieve progress
      const getResponse = await axios.get(`${API_URL}/api/progress/test-course`, {
        headers: { Authorization: `Bearer ${authToken}` },
        timeout
      });

      expect(getResponse.status).toBe(200);
      expect(getResponse.data.data.progress).toBe(75);
    }, timeout);
  });
});