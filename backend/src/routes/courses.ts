import { Router } from 'express';
import CourseController from '../controllers/courseController';
import AuthMiddleware from '../middleware/auth';
import ValidationMiddleware from '../middleware/validation';

const router = Router();

router.post(
  '/',
  AuthMiddleware.verifyFirebaseToken,
  AuthMiddleware.requireRole(['teacher', 'admin']),
  ValidationMiddleware.courseCreation,
  CourseController.createCourse
);

router.get('/', ValidationMiddleware.paginationValidation, CourseController.getCourses);

router.get(
  '/my-courses',
  AuthMiddleware.verifyFirebaseToken,
  AuthMiddleware.requireRole(['teacher', 'admin']),
  ValidationMiddleware.paginationValidation,
  CourseController.getMyCourses
);

router.get('/slug/:slug', CourseController.getCourseBySlug);

router.get('/:id', ValidationMiddleware.objectIdValidation, CourseController.getCourseById);

router.put(
  '/:id',
  ValidationMiddleware.objectIdValidation,
  AuthMiddleware.verifyFirebaseToken,
  CourseController.updateCourse
);

router.delete(
  '/:id',
  ValidationMiddleware.objectIdValidation,
  AuthMiddleware.verifyFirebaseToken,
  CourseController.deleteCourse
);

router.post(
  '/:id/publish',
  ValidationMiddleware.objectIdValidation,
  AuthMiddleware.verifyFirebaseToken,
  CourseController.publishCourse
);

router.post(
  '/:id/unpublish',
  ValidationMiddleware.objectIdValidation,
  AuthMiddleware.verifyFirebaseToken,
  CourseController.unpublishCourse
);

export default router;
