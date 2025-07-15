import { Router } from 'express';
import AuthController from '../controllers/authController';
import AuthMiddleware from '../middleware/auth';
import ValidationMiddleware from '../middleware/validation';

const router = Router();

router.post('/register', ValidationMiddleware.userRegistration, AuthController.register);

router.post('/login', ValidationMiddleware.userLogin, AuthController.login);

router.post('/refresh-token', AuthMiddleware.verifyFirebaseToken, AuthController.refreshToken);

router.post('/logout', AuthMiddleware.verifyFirebaseToken, AuthController.logout);

router.post('/verify-email', AuthMiddleware.verifyFirebaseToken, AuthController.verifyEmail);

router.post(
  '/request-password-reset',
  [
    ValidationMiddleware.userLogin[0], // email validation
    ValidationMiddleware.handleValidationErrors,
  ],
  AuthController.requestPasswordReset
);

router.post('/change-password', AuthMiddleware.verifyFirebaseToken, AuthController.changePassword);

router.delete('/delete-account', AuthMiddleware.verifyFirebaseToken, AuthController.deleteAccount);

export default router;
