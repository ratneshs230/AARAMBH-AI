import request from 'supertest';
import { app } from '../src/index';

describe('Health Check Endpoints', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health').expect('Content-Type', /json/);

      // In test environment, expect 503 since databases aren't fully connected
      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('GET /api/status', () => {
    it('should return API status', async () => {
      const response = await request(app)
        .get('/api/status')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await request(app).get('/').expect('Content-Type', /json/).expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('AARAMBH AI');
    });
  });
});
