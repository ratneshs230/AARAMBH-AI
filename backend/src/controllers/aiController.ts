import { Request, Response } from 'express';
import AIAgentManager from '../agents/AgentManager';
import AIServiceConfig from '../config/ai-services';
import { AIRequest, AgentType } from '../types/ai-agent';

export class AIController {
  private agentManager: AIAgentManager;

  constructor() {
    this.agentManager = AIAgentManager.getInstance();
  }

  public async processRequest(req: Request, res: Response): Promise<void> {
    try {
      const { prompt, agentType, metadata, sessionId } = req.body;
      const userId = req.user?.uid || 'anonymous';

      if (!prompt) {
        res.status(400).json({
          success: false,
          error: 'Prompt is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const aiRequest: AIRequest = {
        userId,
        sessionId,
        prompt,
        metadata,
        context: {
          agentType: agentType || null,
        },
      };

      const response = await this.agentManager.routeRequest(aiRequest);

      res.json({
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('AI Controller error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async getTutorResponse(req: Request, res: Response): Promise<void> {
    try {
      const { prompt, subject, level, language } = req.body;
      const userId = req.user?.uid || 'anonymous';

      const aiRequest: AIRequest = {
        userId,
        prompt,
        metadata: { subject, level, language },
        context: { agentType: AgentType.TUTOR },
      };

      const response = await this.agentManager.routeRequest(aiRequest);

      res.json({
        success: true,
        data: response,
        type: 'tutor_response',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Tutor Controller error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async createContent(req: Request, res: Response): Promise<void> {
    try {
      const { prompt, subject, level, contentType } = req.body;
      const userId = req.user?.uid || 'anonymous';

      const aiRequest: AIRequest = {
        userId,
        prompt,
        metadata: { subject, level, contentType },
        context: { agentType: AgentType.CONTENT_CREATOR },
      };

      const response = await this.agentManager.routeRequest(aiRequest);

      res.json({
        success: true,
        data: response,
        type: 'content_creation',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Content Creator Controller error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async createAssessment(req: Request, res: Response): Promise<void> {
    try {
      const { prompt, subject, level, assessmentType } = req.body;
      const userId = req.user?.uid || 'anonymous';

      const aiRequest: AIRequest = {
        userId,
        prompt,
        metadata: { subject, level, assessmentType },
        context: { agentType: AgentType.ASSESSMENT },
      };

      const response = await this.agentManager.routeRequest(aiRequest);

      res.json({
        success: true,
        data: response,
        type: 'assessment_creation',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Assessment Controller error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async solveDoubt(req: Request, res: Response): Promise<void> {
    try {
      const { prompt, subject, level } = req.body;
      const userId = req.user?.uid || 'anonymous';

      const aiRequest: AIRequest = {
        userId,
        prompt,
        metadata: { subject, level },
        context: { agentType: AgentType.DOUBT_SOLVER },
      };

      const response = await this.agentManager.routeRequest(aiRequest);

      res.json({
        success: true,
        data: response,
        type: 'doubt_resolution',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Doubt Solver Controller error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async createStudyPlan(req: Request, res: Response): Promise<void> {
    try {
      const { prompt, subjects, duration, examDate } = req.body;
      const userId = req.user?.uid || 'anonymous';

      const aiRequest: AIRequest = {
        userId,
        prompt,
        metadata: { subjects, duration, examDate },
        context: { agentType: AgentType.STUDY_PLANNER },
      };

      const response = await this.agentManager.routeRequest(aiRequest);

      res.json({
        success: true,
        data: response,
        type: 'study_plan',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Study Planner Controller error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async getCareerGuidance(req: Request, res: Response): Promise<void> {
    try {
      const { prompt, interests, currentLevel } = req.body;
      const userId = req.user?.uid || 'anonymous';

      const aiRequest: AIRequest = {
        userId,
        prompt,
        metadata: { interests, currentLevel },
        context: { agentType: AgentType.MENTOR },
      };

      const response = await this.agentManager.routeRequest(aiRequest);

      res.json({
        success: true,
        data: response,
        type: 'career_guidance',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Mentor Controller error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { prompt, timeRange, metrics } = req.body;
      const userId = req.user?.uid || 'anonymous';

      const aiRequest: AIRequest = {
        userId,
        prompt,
        metadata: { timeRange, metrics },
        context: { agentType: AgentType.ANALYTICS },
      };

      const response = await this.agentManager.routeRequest(aiRequest);

      res.json({
        success: true,
        data: response,
        type: 'analytics_insights',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Analytics Controller error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async getAgentStatus(req: Request, res: Response): Promise<void> {
    try {
      const health = await this.agentManager.healthCheck();
      const configs = this.agentManager.getAgentConfigs();
      const requestCounts = this.agentManager.getRequestCounts();

      res.json({
        success: true,
        data: {
          health,
          configs: Object.fromEntries(configs),
          requestCounts: Object.fromEntries(requestCounts),
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Agent Status error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async getAIServicesHealth(req: Request, res: Response): Promise<void> {
    try {
      const aiConfig = AIServiceConfig.getInstance();
      const health = await aiConfig.healthCheck();

      res.json({
        success: true,
        data: {
          services: health,
          status: Object.values(health).every(Boolean) ? 'healthy' : 'degraded',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('AI Services Health error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export default new AIController();