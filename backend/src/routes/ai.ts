import { Router } from 'express';
import aiController from '../controllers/aiController';
import { body } from 'express-validator';
import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// Validation middleware
const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
      timestamp: new Date().toISOString(),
    });
    return;
  }
  next();
};

// Generic AI request validation
const baseAIValidation = [
  body('prompt').notEmpty().withMessage('Prompt is required'),
  body('prompt')
    .isLength({ min: 5, max: 2000 })
    .withMessage('Prompt must be between 5 and 2000 characters'),
];

// AI Services Health Check
router.get('/health', aiController.getAIServicesHealth.bind(aiController));

// Agent Status and Management
router.get('/agents/status', aiController.getAgentStatus.bind(aiController));

// Generic AI Request Router
router.post(
  '/request',
  [
    ...baseAIValidation,
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
    body('sessionId').optional().isString(),
    handleValidationErrors,
  ],
  aiController.processRequest.bind(aiController)
);

// Tutor Agent Endpoints
router.post(
  '/tutor/ask',
  [
    ...baseAIValidation,
    body('subject').optional().isString(),
    body('level').optional().isString(),
    body('language').optional().isString(),
    handleValidationErrors,
  ],
  aiController.getTutorResponse.bind(aiController)
);

// Content Creator Agent Endpoints
router.post(
  '/content/create',
  [
    ...baseAIValidation,
    body('subject').optional().isString(),
    body('level').optional().isString(),
    body('contentType').optional().isIn(['lesson', 'activity', 'explanation', 'example']),
    handleValidationErrors,
  ],
  aiController.createContent.bind(aiController)
);

// Assessment Agent Endpoints
router.post(
  '/assessment/create',
  [
    ...baseAIValidation,
    body('subject').optional().isString(),
    body('level').optional().isString(),
    body('assessmentType').optional().isIn(['quiz', 'test', 'assignment', 'practice']),
    handleValidationErrors,
  ],
  aiController.createAssessment.bind(aiController)
);

// Doubt Solver Agent Endpoints
router.post(
  '/doubt/solve',
  [
    ...baseAIValidation,
    body('subject').optional().isString(),
    body('level').optional().isString(),
    handleValidationErrors,
  ],
  aiController.solveDoubt.bind(aiController)
);

// Study Planner Agent Endpoints
router.post(
  '/study/plan',
  [
    ...baseAIValidation,
    body('subjects').optional().isArray(),
    body('duration').optional().isString(),
    body('examDate').optional().isISO8601(),
    handleValidationErrors,
  ],
  aiController.createStudyPlan.bind(aiController)
);

// Mentor Agent Endpoints
router.post(
  '/mentor/guidance',
  [
    ...baseAIValidation,
    body('interests').optional().isArray(),
    body('currentLevel').optional().isString(),
    handleValidationErrors,
  ],
  aiController.getCareerGuidance.bind(aiController)
);

// Analytics Agent Endpoints
router.post(
  '/analytics/insights',
  [
    ...baseAIValidation,
    body('timeRange').optional().isString(),
    body('metrics').optional().isArray(),
    handleValidationErrors,
  ],
  aiController.getAnalytics.bind(aiController)
);

// Batch Processing Endpoint
router.post(
  '/batch',
  [
    body('requests')
      .isArray({ min: 1, max: 10 })
      .withMessage('Requests array must contain 1-10 items'),
    body('requests.*.prompt').notEmpty().withMessage('Each request must have a prompt'),
    body('requests.*.agentType')
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
  async (req: AuthRequest, res: Response) => {
    try {
      const { requests } = req.body;
      const userId = req.user?.firebaseUid || 'anonymous';

      const responses = await Promise.allSettled(
        requests.map(async (request: any) => {
          const aiRequest = {
            userId,
            prompt: request.prompt,
            metadata: request.metadata,
            context: { agentType: request.agentType || null },
          };

          const agentManager = (aiController as any).agentManager;
          return await agentManager.routeRequest(aiRequest);
        })
      );

      const results = responses.map((response, index) => ({
        index,
        status: response.status,
        data: response.status === 'fulfilled' ? response.value : null,
        error: response.status === 'rejected' ? response.reason.message : null,
      }));

      res.json({
        success: true,
        data: results,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Batch processing error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

// Conversation Management
router.post(
  '/conversation/start',
  [
    body('agentType').isIn([
      'tutor',
      'content_creator',
      'assessment',
      'analytics',
      'mentor',
      'study_planner',
      'doubt_solver',
    ]),
    body('subject').optional().isString(),
    body('level').optional().isString(),
    handleValidationErrors,
  ],
  (req: Request, res: Response) => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    res.json({
      success: true,
      data: {
        sessionId,
        agentType: req.body.agentType,
        metadata: {
          subject: req.body.subject,
          level: req.body.level,
          startTime: new Date().toISOString(),
        },
      },
      timestamp: new Date().toISOString(),
    });
  }
);

// Export available agents and their capabilities
router.get('/agents', (_req: Request, res: Response) => {
  const agents = {
    tutor: {
      name: 'AI Tutor',
      description: 'Personalized learning assistance and explanations',
      capabilities: ['concept_explanation', 'step_by_step_guidance', 'learning_support'],
      subjects: 'all',
    },
    content_creator: {
      name: 'Content Creator',
      description: 'Educational content and lesson creation',
      capabilities: ['lesson_creation', 'activity_design', 'curriculum_alignment'],
      subjects: 'all',
    },
    assessment: {
      name: 'Assessment Generator',
      description: 'Quiz and test creation with various question types',
      capabilities: ['quiz_creation', 'test_generation', 'rubric_design'],
      subjects: 'all',
    },
    doubt_solver: {
      name: 'Doubt Solver',
      description: 'Instant problem solving and question answering',
      capabilities: ['problem_solving', 'homework_help', 'concept_clarification'],
      subjects: 'all',
    },
    study_planner: {
      name: 'Study Planner',
      description: 'Personalized study schedules and planning',
      capabilities: ['schedule_creation', 'exam_planning', 'time_management'],
      subjects: 'all',
    },
    mentor: {
      name: 'Career Mentor',
      description: 'Career guidance and educational counseling',
      capabilities: ['career_guidance', 'educational_planning', 'skill_development'],
      subjects: 'career_counseling',
    },
    analytics: {
      name: 'Learning Analytics',
      description: 'Performance insights and learning recommendations',
      capabilities: ['progress_analysis', 'performance_insights', 'recommendations'],
      subjects: 'data_analysis',
    },
  };

  res.json({
    success: true,
    data: agents,
    timestamp: new Date().toISOString(),
  });
});

export default router;
