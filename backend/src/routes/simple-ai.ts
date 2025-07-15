import { Router } from 'express';
import simpleAIController from '../controllers/simpleAIController';
import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const router = Router();

// Validation middleware
const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
      timestamp: new Date().toISOString(),
    });
  }
  next();
};

// Basic validation
const baseValidation = [
  body('prompt').notEmpty().withMessage('Prompt is required'),
  body('prompt')
    .isLength({ min: 5, max: 2000 })
    .withMessage('Prompt must be between 5 and 2000 characters'),
];

// AI Services Health Check
router.get('/health', simpleAIController.getAIServicesHealth.bind(simpleAIController));

// Agent Status
router.get('/agents/status', simpleAIController.getAgentStatus.bind(simpleAIController));

// Generic AI Request
router.post(
  '/request',
  [
    ...baseValidation,
    body('agentType')
      .optional()
      .isIn([
        'tutor',
        'content_creator',
        'assessment',
        'analytics',
        'mentor',
        'study_planner',
        'doubt_solver',
      ]),
    handleValidationErrors,
  ],
  simpleAIController.processRequest.bind(simpleAIController)
);

// Tutor Endpoint
router.post(
  '/tutor/ask',
  [
    ...baseValidation,
    body('subject').optional().isString(),
    body('level').optional().isString(),
    body('language').optional().isString(),
    handleValidationErrors,
  ],
  simpleAIController.getTutorResponse.bind(simpleAIController)
);

// Content Creator Endpoint
router.post(
  '/content/create',
  [
    ...baseValidation,
    body('subject').optional().isString(),
    body('level').optional().isString(),
    handleValidationErrors,
  ],
  simpleAIController.createContent.bind(simpleAIController)
);

// Assessment Creator Endpoint
router.post(
  '/assessment/create',
  [
    ...baseValidation,
    body('subject').optional().isString(),
    body('level').optional().isString(),
    handleValidationErrors,
  ],
  simpleAIController.createAssessment.bind(simpleAIController)
);

// Doubt Solver Endpoint
router.post(
  '/doubt/solve',
  [
    ...baseValidation,
    body('subject').optional().isString(),
    body('level').optional().isString(),
    handleValidationErrors,
  ],
  simpleAIController.solveDoubt.bind(simpleAIController)
);

// Available Agents Info
router.get('/agents', (_req: Request, res: Response) => {
  const agents = {
    tutor: {
      name: 'AI Tutor',
      description: 'Personalized learning assistance and explanations',
      endpoint: '/api/ai/tutor/ask',
    },
    content_creator: {
      name: 'Content Creator',
      description: 'Educational content and lesson creation',
      endpoint: '/api/ai/content/create',
    },
    assessment: {
      name: 'Assessment Generator',
      description: 'Quiz and test creation',
      endpoint: '/api/ai/assessment/create',
    },
    doubt_solver: {
      name: 'Doubt Solver',
      description: 'Problem solving and question answering',
      endpoint: '/api/ai/doubt/solve',
    },
    study_planner: {
      name: 'Study Planner',
      description: 'Study schedules and planning',
      endpoint: '/api/ai/request (agentType: study_planner)',
    },
    mentor: {
      name: 'Career Mentor',
      description: 'Career guidance and counseling',
      endpoint: '/api/ai/request (agentType: mentor)',
    },
    analytics: {
      name: 'Learning Analytics',
      description: 'Performance insights and recommendations',
      endpoint: '/api/ai/request (agentType: analytics)',
    },
  };

  res.json({
    success: true,
    data: agents,
    timestamp: new Date().toISOString(),
  });
});

export default router;
