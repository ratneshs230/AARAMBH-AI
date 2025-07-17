import { apiService } from './api';
import { API_ENDPOINTS } from '@/utils/constants';

export interface CuriosityTopic {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  tags: string[];
  likes: number;
  views: number;
  rating: number;
  isBookmarked: boolean;
  contentTypes: ('video' | 'article' | 'interactive' | 'quiz' | 'experiment')[];
  relatedTopics: string[];
  aiGenerated: boolean;
  thumbnail: string;
  createdAt: string;
}

export interface CuriosityQuestion {
  id: string;
  question: string;
  askedBy: string;
  category: string;
  votes: number;
  answers: number;
  isAnswered: boolean;
  difficulty: string;
  tags: string[];
  timestamp: string;
}

export interface DiscoveryPath {
  id: string;
  title: string;
  description: string;
  topics: string[];
  progress: number;
  totalTopics: number;
  estimatedDuration: number;
  difficulty: string;
  category: string;
  participants: number;
}

export interface CuriosityInsight {
  id: string;
  type: 'fact' | 'connection' | 'question' | 'discovery';
  content: string;
  relatedTopics: string[];
  source: string;
  timestamp: string;
  isNew: boolean;
}

export interface CuriosityRecommendation {
  id: string;
  type: 'topic' | 'question' | 'path';
  title: string;
  description: string;
  relevanceScore: number;
  reason: string;
  relatedToTopics: string[];
}

export interface CuriosityStats {
  topicsExplored: number;
  questionsAsked: number;
  questionsAnswered: number;
  pathsCompleted: number;
  curiosityScore: number;
  curiosityLevel: number;
  badges: string[];
  streakDays: number;
}

export class CuriosityService {
  // Get all topics with filters
  async getTopics(filters?: {
    category?: string;
    difficulty?: string;
    search?: string;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ success: boolean; data: CuriosityTopic[] }> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const url = `${API_ENDPOINTS.CURIOSITY.TOPICS}?${params.toString()}`;
    return apiService.get(url);
  }

  // Get topic details
  async getTopic(topicId: string): Promise<{ success: boolean; data: CuriosityTopic }> {
    return apiService.get(`${API_ENDPOINTS.CURIOSITY.TOPICS}/${topicId}`);
  }

  // Get AI-powered topic recommendations
  async getTopicRecommendations(
    userId?: string,
    limit?: number
  ): Promise<{ success: boolean; data: CuriosityRecommendation[] }> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (limit) params.append('limit', limit.toString());

    const url = `${API_ENDPOINTS.CURIOSITY.RECOMMENDATIONS}?${params.toString()}`;
    return apiService.get(url);
  }

  // Bookmark/unbookmark a topic
  async toggleBookmark(topicId: string): Promise<{ success: boolean; data: any }> {
    return apiService.post(`${API_ENDPOINTS.CURIOSITY.BOOKMARK}/${topicId}`, {});
  }

  // Rate a topic
  async rateTopic(topicId: string, rating: number): Promise<{ success: boolean; data: any }> {
    return apiService.post(`${API_ENDPOINTS.CURIOSITY.RATING}/${topicId}`, { rating });
  }

  // Get questions with filters
  async getQuestions(filters?: {
    category?: string;
    difficulty?: string;
    search?: string;
    sortBy?: string;
    answered?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ success: boolean; data: CuriosityQuestion[] }> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.answered !== undefined) params.append('answered', filters.answered.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const url = `${API_ENDPOINTS.CURIOSITY.QUESTIONS}?${params.toString()}`;
    return apiService.get(url);
  }

  // Ask a new question
  async askQuestion(questionData: {
    question: string;
    category: string;
    difficulty?: string;
    tags?: string[];
  }): Promise<{ success: boolean; data: CuriosityQuestion }> {
    return apiService.post(API_ENDPOINTS.CURIOSITY.QUESTIONS, questionData);
  }

  // Vote on a question
  async voteQuestion(
    questionId: string,
    vote: 'up' | 'down'
  ): Promise<{ success: boolean; data: any }> {
    return apiService.post(`${API_ENDPOINTS.CURIOSITY.QUESTIONS}/${questionId}/vote`, { vote });
  }

  // Get discovery paths
  async getDiscoveryPaths(filters?: {
    category?: string;
    difficulty?: string;
    search?: string;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ success: boolean; data: DiscoveryPath[] }> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const url = `${API_ENDPOINTS.CURIOSITY.PATHS}?${params.toString()}`;
    return apiService.get(url);
  }

  // Join a discovery path
  async joinPath(pathId: string): Promise<{ success: boolean; data: any }> {
    return apiService.post(`${API_ENDPOINTS.CURIOSITY.PATHS}/${pathId}/join`, {});
  }

  // Update path progress
  async updatePathProgress(
    pathId: string,
    topicId: string,
    completed: boolean
  ): Promise<{ success: boolean; data: any }> {
    return apiService.post(`${API_ENDPOINTS.CURIOSITY.PROGRESS}/${pathId}`, {
      topicId,
      completed,
    });
  }

  // Get daily insights
  async getDailyInsights(limit?: number): Promise<{ success: boolean; data: CuriosityInsight[] }> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());

    const url = `${API_ENDPOINTS.CURIOSITY.INSIGHTS}?${params.toString()}`;
    return apiService.get(url);
  }

  // Get personalized insights based on user activity
  async getPersonalizedInsights(
    userId?: string
  ): Promise<{ success: boolean; data: CuriosityInsight[] }> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);

    const url = `${API_ENDPOINTS.CURIOSITY.INSIGHTS}/personalized?${params.toString()}`;
    return apiService.get(url);
  }

  // Get user's curiosity statistics
  async getCuriosityStats(userId?: string): Promise<{ success: boolean; data: CuriosityStats }> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);

    const url = `${API_ENDPOINTS.CURIOSITY.INSIGHTS}/stats?${params.toString()}`;
    return apiService.get(url);
  }

  // Generate AI-powered topic suggestions based on user interests
  async generateTopicSuggestions(
    interests: string[],
    difficulty?: string
  ): Promise<{ success: boolean; data: CuriosityTopic[] }> {
    return apiService.post(`${API_ENDPOINTS.CURIOSITY.RECOMMENDATIONS}/generate`, {
      interests,
      difficulty,
    });
  }

  // Get trending topics
  async getTrendingTopics(limit?: number): Promise<{ success: boolean; data: CuriosityTopic[] }> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());

    const url = `${API_ENDPOINTS.CURIOSITY.TOPICS}/trending?${params.toString()}`;
    return apiService.get(url);
  }

  // Search topics using AI-powered semantic search
  async searchTopics(
    query: string,
    options?: {
      category?: string;
      difficulty?: string;
      semantic?: boolean;
      limit?: number;
    }
  ): Promise<{ success: boolean; data: CuriosityTopic[] }> {
    return apiService.post(`${API_ENDPOINTS.CURIOSITY.TOPICS}/search`, {
      query,
      ...options,
    });
  }

  // Get topic learning content
  async getTopicContent(
    topicId: string,
    contentType?: string
  ): Promise<{ success: boolean; data: any }> {
    const params = new URLSearchParams();
    if (contentType) params.append('type', contentType);

    const url = `${API_ENDPOINTS.CURIOSITY.TOPICS}/${topicId}/content?${params.toString()}`;
    return apiService.get(url);
  }

  // Track user interaction with topics
  async trackInteraction(
    topicId: string,
    interactionType: 'view' | 'like' | 'bookmark' | 'share' | 'complete'
  ): Promise<{ success: boolean; data: any }> {
    return apiService.post(`${API_ENDPOINTS.CURIOSITY.TOPICS}/${topicId}/track`, {
      interactionType,
      timestamp: new Date().toISOString(),
    });
  }

  // Get user's learning activity
  async getActivity(userId?: string, limit?: number): Promise<{ success: boolean; data: any[] }> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (limit) params.append('limit', limit.toString());

    const url = `${API_ENDPOINTS.CURIOSITY.INSIGHTS}/activity?${params.toString()}`;
    return apiService.get(url);
  }
}

export const curiosityService = new CuriosityService();
export default curiosityService;
