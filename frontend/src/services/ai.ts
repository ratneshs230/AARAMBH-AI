import type { AIRequest, AIResponse, AIAgent } from '@/types/index';
import { apiService } from './api';
import { API_ENDPOINTS, AGENT_TYPES } from '@utils/constants';

export class AIService {
  // Get available AI agents
  async getAgents(): Promise<{ success: boolean; data: Record<string, AIAgent> }> {
    return apiService.aiGet(API_ENDPOINTS.AI.AGENTS);
  }

  // Check AI services health
  async getHealth(): Promise<{ success: boolean; data: any }> {
    return apiService.aiGet(API_ENDPOINTS.AI.HEALTH);
  }

  // Generic AI request router
  async sendRequest(request: AIRequest): Promise<{ success: boolean; data: AIResponse }> {
    return apiService.aiRequest(API_ENDPOINTS.AI.REQUEST, request);
  }

  // Tutor Agent - Get personalized explanations
  async askTutor(
    prompt: string,
    options?: {
      subject?: string;
      level?: string;
      language?: string;
    }
  ): Promise<{ success: boolean; data: AIResponse }> {
    return apiService.aiRequest(API_ENDPOINTS.AI.TUTOR, {
      prompt,
      subject: options?.subject,
      level: options?.level,
      language: options?.language,
    });
  }

  // Content Creator Agent - Generate educational content
  async createContent(
    prompt: string,
    options?: {
      subject?: string;
      level?: string;
      contentType?: string;
    }
  ): Promise<{ success: boolean; data: AIResponse }> {
    return apiService.aiRequest(API_ENDPOINTS.AI.CONTENT, {
      prompt,
      subject: options?.subject,
      level: options?.level,
      contentType: options?.contentType,
    });
  }

  // Assessment Agent - Create quizzes and tests
  async createAssessment(
    prompt: string,
    options?: {
      subject?: string;
      level?: string;
      assessmentType?: string;
    }
  ): Promise<{ success: boolean; data: AIResponse }> {
    return apiService.aiRequest(API_ENDPOINTS.AI.ASSESSMENT, {
      prompt,
      subject: options?.subject,
      level: options?.level,
      assessmentType: options?.assessmentType,
    });
  }

  // Doubt Solver Agent - Solve problems and answer questions
  async solveDoubt(
    prompt: string,
    options?: {
      subject?: string;
      level?: string;
    }
  ): Promise<{ success: boolean; data: AIResponse }> {
    return apiService.aiRequest(API_ENDPOINTS.AI.DOUBT, {
      prompt,
      subject: options?.subject,
      level: options?.level,
    });
  }

  // Study Planner Agent - Create study schedules
  async createStudyPlan(
    prompt: string,
    options?: {
      subjects?: string[];
      duration?: string;
      examDate?: string;
    }
  ): Promise<{ success: boolean; data: AIResponse }> {
    return apiService.aiRequest(API_ENDPOINTS.AI.REQUEST, {
      prompt,
      agentType: AGENT_TYPES.STUDY_PLANNER,
      metadata: {
        subjects: options?.subjects,
        duration: options?.duration,
        examDate: options?.examDate,
      },
    });
  }

  // Mentor Agent - Get career guidance
  async getCareerGuidance(
    prompt: string,
    options?: {
      interests?: string[];
      currentLevel?: string;
    }
  ): Promise<{ success: boolean; data: AIResponse }> {
    return apiService.aiRequest(API_ENDPOINTS.AI.REQUEST, {
      prompt,
      agentType: AGENT_TYPES.MENTOR,
      metadata: {
        interests: options?.interests,
        currentLevel: options?.currentLevel,
      },
    });
  }

  // Analytics Agent - Get learning insights
  async getAnalytics(
    prompt: string,
    options?: {
      timeRange?: string;
      metrics?: string[];
    }
  ): Promise<{ success: boolean; data: AIResponse }> {
    return apiService.aiRequest(API_ENDPOINTS.AI.REQUEST, {
      prompt,
      agentType: AGENT_TYPES.ANALYTICS,
      metadata: {
        timeRange: options?.timeRange,
        metrics: options?.metrics,
      },
    });
  }

  // Batch processing for multiple AI requests
  async batchRequest(requests: AIRequest[]): Promise<{ success: boolean; data: any[] }> {
    return apiService.aiRequest('/batch', { requests });
  }

  // Start a conversation session
  async startConversation(
    agentType: string,
    options?: {
      subject?: string;
      level?: string;
    }
  ): Promise<{ success: boolean; data: { sessionId: string } }> {
    return apiService.aiRequest('/conversation/start', {
      agentType,
      subject: options?.subject,
      level: options?.level,
    });
  }
}

export const aiService = new AIService();
export default aiService;
