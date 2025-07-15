import { Router } from 'express';
import authRoutes from './auth-simple';

const router = Router();

// Simple API Routes for initial testing
router.use('/auth', authRoutes);

// API Info endpoint
router.get('/', (_req, res) => {
  res.json({
    message: 'AARAMBH AI API v1.0 - Phase 2 Development',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    status: 'Backend foundation ready',
    features: {
      authentication: 'In Progress',
      userManagement: 'In Progress',
      courseManagement: 'In Progress',
      database: 'Connected',
      firebase: 'Configured',
    },
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
      },
    },
  });
});

export default router;
