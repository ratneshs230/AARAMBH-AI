import { AIRequest, AIResponse, AIAgent } from '../types';
import { apiService } from './api';
import { offlineApiService } from './offlineApi';
import { storageService, ChatMessage } from './storage';
import { networkService } from './network';
import { API_ENDPOINTS, AGENT_TYPES } from '../constants';

export class AIService {
  // Get available AI agents
  async getAgents(): Promise<{ success: boolean; data: Record<string, AIAgent> }> {
    return offlineApiService.request({
      method: 'GET',
      endpoint: API_ENDPOINTS.AI.AGENTS,
      useCache: true,
      cacheDuration: 10 * 60 * 1000 // 10 minutes
    });
  }

  // Check AI services health
  async getHealth(): Promise<{ success: boolean; data: any }> {
    return offlineApiService.request({
      method: 'GET',
      endpoint: API_ENDPOINTS.AI.HEALTH,
      useCache: true,
      cacheDuration: 2 * 60 * 1000 // 2 minutes
    });
  }

  // Generic AI request router
  async sendRequest(request: AIRequest): Promise<{ success: boolean; data: AIResponse }> {
    return offlineApiService.request({
      method: 'POST',
      endpoint: API_ENDPOINTS.AI.REQUEST,
      data: request,
      retryOnline: true
    });
  }

  // Tutor Agent - Get personalized explanations
  async askTutor(prompt: string, options?: {
    subject?: string;
    level?: string;
    language?: string;
  }): Promise<{ success: boolean; data: AIResponse }> {
    const response = await offlineApiService.sendChatMessage('tutor', prompt, options);
    
    // Mock AI response for demonstration (in real implementation, this would be handled by the backend)
    if (response.data && !networkService.isConnected()) {
      const mockAiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: this.generateMockTutorResponse(prompt, options),
        timestamp: new Date().toISOString(),
        agentType: 'tutor',
        metadata: {
          confidence: 0.85,
          provider: 'offline-mock',
          processingTime: 500
        },
        synced: false
      };
      
      await storageService.saveChatMessage('tutor', mockAiResponse);
      
      return {
        success: true,
        data: {
          content: mockAiResponse.content,
          confidence: mockAiResponse.metadata?.confidence || 0.85,
          provider: 'offline-mock',
          processingTime: 500
        }
      };
    }
    
    return {
      success: response.data !== null,
      data: response.data || { content: 'Failed to get response', confidence: 0 }
    };
  }

  // Content Creator Agent - Generate educational content
  async createContent(prompt: string, options?: {
    subject?: string;
    level?: string;
    contentType?: string;
  }): Promise<{ success: boolean; data: AIResponse }> {
    const response = await offlineApiService.generateContent(
      options?.contentType || 'lesson_plan',
      prompt,
      options
    );
    
    if (response.data && !networkService.isConnected()) {
      return {
        success: true,
        data: {
          content: this.generateMockContent(options?.contentType || 'lesson_plan', prompt, options),
          confidence: 0.8,
          provider: 'offline-mock',
          processingTime: 1000
        }
      };
    }
    
    return {
      success: response.data !== null,
      data: response.data || { content: 'Content generation requires internet connection', confidence: 0 }
    };
  }

  // Assessment Agent - Create quizzes and tests
  async createAssessment(prompt: string, options?: {
    subject?: string;
    level?: string;
    assessmentType?: string;
  }): Promise<{ success: boolean; data: AIResponse }> {
    const response = await offlineApiService.generateContent('assessment', prompt, options);
    
    if (!networkService.isConnected()) {
      return {
        success: false,
        data: {
          content: 'Assessment generation requires internet connection. Please try again when online.',
          confidence: 0,
          provider: 'offline',
          processingTime: 0
        }
      };
    }
    
    return {
      success: response.data !== null,
      data: response.data || { content: 'Assessment generation failed', confidence: 0 }
    };
  }

  // Doubt Solver Agent - Solve problems and answer questions
  async solveDoubt(prompt: string, options?: {
    subject?: string;
    level?: string;
  }): Promise<{ success: boolean; data: AIResponse }> {
    const response = await offlineApiService.sendChatMessage('doubt_solver', prompt, options);
    
    if (response.data && !networkService.isConnected()) {
      const mockResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: this.generateMockDoubtResponse(prompt, options),
        timestamp: new Date().toISOString(),
        agentType: 'doubt_solver',
        metadata: {
          confidence: 0.8,
          provider: 'offline-mock',
          processingTime: 800
        },
        synced: false
      };
      
      await storageService.saveChatMessage('doubt_solver', mockResponse);
      
      return {
        success: true,
        data: {
          content: mockResponse.content,
          confidence: mockResponse.metadata?.confidence || 0.8,
          provider: 'offline-mock',
          processingTime: 800
        }
      };
    }
    
    return {
      success: response.data !== null,
      data: response.data || { content: 'Failed to solve doubt', confidence: 0 }
    };
  }

  // Study Planner Agent - Create study schedules
  async createStudyPlan(prompt: string, options?: {
    subjects?: string[];
    duration?: string;
    examDate?: string;
  }): Promise<{ success: boolean; data: AIResponse }> {
    const response = await offlineApiService.generateContent('study_plan', prompt, options);
    
    if (!networkService.isConnected()) {
      return {
        success: true,
        data: {
          content: this.generateMockStudyPlan(prompt, options),
          confidence: 0.85,
          provider: 'offline-mock',
          processingTime: 1200
        }
      };
    }
    
    return {
      success: response.data !== null,
      data: response.data || { content: 'Study plan generation failed', confidence: 0 }
    };
  }

  // Mentor Agent - Get career guidance
  async getMentorship(prompt: string, options?: {
    interests?: string[];
    careerStage?: string;
    goals?: string;
  }): Promise<{ success: boolean; data: AIResponse }> {
    const response = await offlineApiService.sendChatMessage('mentor', prompt, options);
    
    if (response.data && !networkService.isConnected()) {
      const mockResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: this.generateMockMentorResponse(prompt, options),
        timestamp: new Date().toISOString(),
        agentType: 'mentor',
        metadata: {
          confidence: 0.88,
          provider: 'offline-mock',
          processingTime: 1000
        },
        synced: false
      };
      
      await storageService.saveChatMessage('mentor', mockResponse);
      
      return {
        success: true,
        data: {
          content: mockResponse.content,
          confidence: mockResponse.metadata?.confidence || 0.88,
          provider: 'offline-mock',
          processingTime: 1000
        }
      };
    }
    
    return {
      success: response.data !== null,
      data: response.data || { content: 'Failed to get mentorship guidance', confidence: 0 }
    };
  }

  // Analytics Agent - Get learning insights
  async getAnalytics(options?: {
    timeframe?: string;
    includeRecommendations?: boolean;
  }): Promise<{ success: boolean; data: any }> {
    const response = await offlineApiService.getAnalytics(options);
    
    return {
      success: response.data !== null,
      data: response.data || {}
    };
  }

  // Generate insight from analytics data
  async generateInsight(options: {
    type: string;
    analyticsData?: any;
  }): Promise<{ success: boolean; data: { insight: string } }> {
    if (!networkService.isConnected()) {
      return {
        success: true,
        data: {
          insight: this.generateMockInsight(options.type)
        }
      };
    }
    
    return offlineApiService.request({
      method: 'POST',
      endpoint: '/analytics/insights',
      data: options,
      retryOnline: true
    });
  }

  // Mock response generators for offline mode
  private generateMockTutorResponse(prompt: string, options?: any): string {
    const responses = [
      "I understand you're asking about this topic. Let me break it down step by step for you.",
      "That's a great question! Here's how I would approach this problem:",
      "Let me explain this concept in a way that's easy to understand:",
      "I can help you with that. Let's start with the fundamentals:",
    ];
    
    const baseResponse = responses[Math.floor(Math.random() * responses.length)];
    const subjectContext = options?.subject ? ` Since you're studying ${options.subject}, ` : ' ';
    
    return baseResponse + subjectContext + "I'll provide a detailed explanation once we're back online. For now, I've saved your question and will give you a comprehensive answer when connected.";
  }

  private generateMockDoubtResponse(prompt: string, options?: any): string {
    return "I've received your doubt and I'm ready to help solve it! While we're offline, I've saved your question. Once we're back online, I'll provide a detailed step-by-step solution with examples and explanations.";
  }

  private generateMockMentorResponse(prompt: string, options?: any): string {
    const interests = options?.interests?.join(', ') || 'your interests';
    const stage = options?.careerStage || 'your current stage';
    
    return `I understand you're looking for career guidance related to ${interests} at ${stage}. I've noted your question and will provide personalized career advice, including relevant opportunities, skill development paths, and industry insights once we're connected.`;
  }

  private generateMockContent(type: string, prompt: string, options?: any): string {
    const contentTypes: Record<string, string> = {
      lesson_plan: "Lesson Plan Template:\n\n1. Learning Objectives\n2. Materials Needed\n3. Introduction\n4. Main Activities\n5. Assessment\n6. Conclusion\n\nDetailed content will be generated when online.",
      study_notes: "Study Notes Outline:\n\n• Key Concepts\n• Important Definitions\n• Examples\n• Practice Problems\n• Summary\n\nComprehensive notes will be created when connected.",
      flashcards: "Flashcard Set:\n\nTerm 1: [Definition]\nTerm 2: [Definition]\nTerm 3: [Definition]\n\nComplete flashcard set will be generated online."
    };
    
    return contentTypes[type] || "Content template saved. Full content will be generated when online.";
  }

  private generateMockStudyPlan(prompt: string, options?: any): string {
    const subjects = options?.subjects?.join(', ') || 'selected subjects';
    const duration = options?.duration || 'specified timeframe';
    
    return `Study Plan Framework for ${subjects} over ${duration}:\n\n📚 Week 1: Foundation concepts\n📚 Week 2: Core topics\n📚 Week 3: Advanced topics\n📚 Week 4: Review and practice\n\nDetailed schedule with specific activities, resources, and milestones will be created when online.`;
  }

  private generateMockInsight(type: string): string {
    const insights: Record<string, string> = {
      study_pattern: "Based on your offline data, you tend to study most effectively in the evenings. Consider scheduling your most challenging subjects during this time.",
      performance_trends: "Your performance shows consistent improvement over time. Keep up the excellent work!",
      strength_analysis: "Your strongest areas appear to be in analytical subjects. Consider leveraging these strengths.",
      goal_tracking: "You're making good progress toward your study goals. Stay consistent!",
      time_optimization: "Your study sessions are well-distributed. Consider adding short review sessions.",
      ai_recommendations: "Continue your current study approach and maintain consistency."
    };
    
    return insights[type] || "Detailed insights will be available when connected to the internet.";
  }

  // Batch processing for multiple AI requests
  async batchRequest(requests: AIRequest[]): Promise<{ success: boolean; data: any[] }> {
    if (!networkService.isConnected()) {
      // Queue all requests for when online
      for (const request of requests) {
        await storageService.addToOfflineQueue('batchRequest', request);
      }
      
      return {
        success: false,
        data: []
      };
    }
    
    return offlineApiService.request({
      method: 'POST',
      endpoint: '/batch',
      data: { requests },
      retryOnline: true
    });
  }

  // Start a conversation session
  async startConversation(agentType: string, options?: {
    subject?: string;
    level?: string;
  }): Promise<{ success: boolean; data: { sessionId: string } }> {
    if (!networkService.isConnected()) {
      // Generate offline session ID
      return {
        success: true,
        data: {
          sessionId: `offline_${agentType}_${Date.now()}`
        }
      };
    }
    
    return offlineApiService.request({
      method: 'POST',
      endpoint: '/conversation/start',
      data: {
        agentType,
        subject: options?.subject,
        level: options?.level,
      },
      retryOnline: true
    });
  }

  // Get chat history for an agent
  async getChatHistory(agentType: string): Promise<{ success: boolean; data: ChatMessage[] }> {
    const response = await offlineApiService.getChatHistory(agentType);
    return {
      success: response.data !== null,
      data: response.data || []
    };
  }

  // Clear chat history for an agent
  async clearChatHistory(agentType: string): Promise<{ success: boolean }> {
    await storageService.clearChatHistory(agentType);
    return { success: true };
  }
}

export const aiService = new AIService();
export default aiService;