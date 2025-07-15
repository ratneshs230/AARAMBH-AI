import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';

export class ValidationMiddleware {
  public static handleValidationErrors(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Please check your input data',
        details: errors.array().map((error) => ({
          field: error.type === 'field' ? error.path : 'unknown',
          message: error.msg,
          value: error.type === 'field' ? error.value : undefined,
        })),
      });
    }

    next();
  }

  public static userRegistration = [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),

    body('username')
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage(
        'Username must be 3-30 characters and contain only letters, numbers, and underscores'
      ),

    body('firstName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('First name must be 2-50 characters and contain only letters'),

    body('lastName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Last name must be 2-50 characters and contain only letters'),

    body('dateOfBirth')
      .optional()
      .isISO8601()
      .toDate()
      .custom((value) => {
        const today = new Date();
        const birthDate = new Date(value);
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 5 || age > 100) {
          throw new Error('Age must be between 5 and 100 years');
        }
        return true;
      }),

    body('educationLevel')
      .isIn(['primary', 'secondary', 'higher_secondary', 'undergraduate', 'graduate', 'other'])
      .withMessage('Please select a valid education level'),

    body('learningLanguage')
      .isIn(['hindi', 'english', 'bilingual'])
      .withMessage('Please select a valid learning language'),

    body('role')
      .optional()
      .isIn(['student', 'teacher', 'parent'])
      .withMessage('Please select a valid role'),

    ValidationMiddleware.handleValidationErrors,
  ];

  public static userLogin = [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),

    body('idToken').notEmpty().withMessage('Firebase ID token is required'),

    ValidationMiddleware.handleValidationErrors,
  ];

  public static userProfileUpdate = [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('First name must be 2-50 characters and contain only letters'),

    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Last name must be 2-50 characters and contain only letters'),

    body('bio')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Bio must not exceed 500 characters'),

    body('phoneNumber')
      .optional()
      .matches(/^[+]?[\d\s-()]+$/)
      .withMessage('Please provide a valid phone number'),

    body('subjects')
      .optional()
      .isArray({ max: 10 })
      .withMessage('Subjects must be an array with maximum 10 items'),

    body('subjects.*')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Each subject must be 1-50 characters'),

    body('learningStyle')
      .optional()
      .isIn(['visual', 'auditory', 'kinesthetic', 'reading_writing'])
      .withMessage('Please select a valid learning style'),

    ValidationMiddleware.handleValidationErrors,
  ];

  public static courseCreation = [
    body('title')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Course title must be 5-200 characters'),

    body('description')
      .trim()
      .isLength({ min: 20, max: 2000 })
      .withMessage('Course description must be 20-2000 characters'),

    body('category')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Category must be 2-50 characters'),

    body('difficulty')
      .isIn(['beginner', 'intermediate', 'advanced'])
      .withMessage('Please select a valid difficulty level'),

    body('language')
      .isIn(['hindi', 'english', 'bilingual'])
      .withMessage('Please select a valid language'),

    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),

    body('tags')
      .optional()
      .isArray({ max: 10 })
      .withMessage('Tags must be an array with maximum 10 items'),

    ValidationMiddleware.handleValidationErrors,
  ];

  public static lessonCreation = [
    body('title')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Lesson title must be 5-200 characters'),

    body('content')
      .trim()
      .isLength({ min: 50 })
      .withMessage('Lesson content must be at least 50 characters'),

    body('type')
      .isIn(['video', 'text', 'interactive', 'quiz', 'assignment'])
      .withMessage('Please select a valid lesson type'),

    body('duration')
      .isInt({ min: 1, max: 300 })
      .withMessage('Duration must be between 1 and 300 minutes'),

    body('order').isInt({ min: 1 }).withMessage('Lesson order must be a positive integer'),

    ValidationMiddleware.handleValidationErrors,
  ];

  public static assessmentCreation = [
    body('title')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Assessment title must be 5-200 characters'),

    body('type')
      .isIn(['quiz', 'assignment', 'project', 'exam'])
      .withMessage('Please select a valid assessment type'),

    body('questions')
      .isArray({ min: 1, max: 100 })
      .withMessage('Assessment must have 1-100 questions'),

    body('timeLimit')
      .optional()
      .isInt({ min: 1, max: 300 })
      .withMessage('Time limit must be between 1 and 300 minutes'),

    body('passingScore')
      .isInt({ min: 0, max: 100 })
      .withMessage('Passing score must be between 0 and 100'),

    ValidationMiddleware.handleValidationErrors,
  ];

  public static objectIdValidation = [
    param('id').isMongoId().withMessage('Please provide a valid ID'),

    ValidationMiddleware.handleValidationErrors,
  ];

  public static paginationValidation = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),

    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),

    query('sort')
      .optional()
      .isIn(['createdAt', '-createdAt', 'updatedAt', '-updatedAt', 'title', '-title'])
      .withMessage('Invalid sort parameter'),

    ValidationMiddleware.handleValidationErrors,
  ];

  public static searchValidation = [
    query('q')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search query must be 1-100 characters'),

    query('category')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Category must be 1-50 characters'),

    query('difficulty')
      .optional()
      .isIn(['beginner', 'intermediate', 'advanced'])
      .withMessage('Invalid difficulty level'),

    ValidationMiddleware.handleValidationErrors,
  ];

  public static subscriptionValidation = [
    body('planType')
      .isIn(['premium', 'enterprise'])
      .withMessage('Please select a valid subscription plan'),

    body('duration')
      .isIn(['monthly', 'quarterly', 'yearly'])
      .withMessage('Please select a valid subscription duration'),

    body('paymentMethod')
      .isIn(['razorpay', 'stripe', 'upi'])
      .withMessage('Please select a valid payment method'),

    ValidationMiddleware.handleValidationErrors,
  ];
}

export default ValidationMiddleware;
