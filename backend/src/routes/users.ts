import { Router } from 'express';
import UserController from '../controllers/userController';
import AuthMiddleware from '../middleware/auth';
import ValidationMiddleware from '../middleware/validation';

const router = Router();

router.get('/profile', AuthMiddleware.verifyFirebaseToken, UserController.getProfile);

router.put(
  '/profile',
  AuthMiddleware.verifyFirebaseToken,
  ValidationMiddleware.userProfileUpdate,
  UserController.updateProfile
);

router.put('/preferences', AuthMiddleware.verifyFirebaseToken, UserController.updatePreferences);

router.get('/analytics', AuthMiddleware.verifyFirebaseToken, UserController.getAnalytics);

router.post('/progress', AuthMiddleware.verifyFirebaseToken, UserController.updateLearningProgress);

router.get(
  '/search',
  ValidationMiddleware.searchValidation,
  ValidationMiddleware.paginationValidation,
  UserController.searchUsers
);

router.get('/:id', ValidationMiddleware.objectIdValidation, UserController.getUserById);

router.put('/deactivate', AuthMiddleware.verifyFirebaseToken, UserController.deactivateAccount);

router.put('/reactivate', AuthMiddleware.verifyFirebaseToken, UserController.reactivateAccount);

export default router;
