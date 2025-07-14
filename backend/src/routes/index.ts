import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import courseRoutes from './courses';

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);

// API Info endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'AARAMBH AI API v1.0',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        refreshToken: 'POST /api/auth/refresh-token',
        verifyEmail: 'POST /api/auth/verify-email',
        requestPasswordReset: 'POST /api/auth/request-password-reset',
        changePassword: 'POST /api/auth/change-password',
        deleteAccount: 'DELETE /api/auth/delete-account'
      },
      users: {
        profile: 'GET /api/users/profile',
        updateProfile: 'PUT /api/users/profile',
        updatePreferences: 'PUT /api/users/preferences',
        analytics: 'GET /api/users/analytics',
        updateProgress: 'POST /api/users/progress',
        search: 'GET /api/users/search',
        getById: 'GET /api/users/:id',
        deactivate: 'PUT /api/users/deactivate',
        reactivate: 'PUT /api/users/reactivate'
      },
      courses: {
        create: 'POST /api/courses',
        getAll: 'GET /api/courses',
        getMyCourses: 'GET /api/courses/my-courses',
        getBySlug: 'GET /api/courses/slug/:slug',
        getById: 'GET /api/courses/:id',
        update: 'PUT /api/courses/:id',
        delete: 'DELETE /api/courses/:id',
        publish: 'POST /api/courses/:id/publish',
        unpublish: 'POST /api/courses/:id/unpublish'
      }
    },
    documentation: 'https://docs.aarambh-ai.com/api',
    support: 'support@aarambh-ai.com'
  });
});

export default router;