// Core curiosity platform types
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
  updatedAt?: string;
  author?: string;
  metadata?: {
    sources?: string[];
    prerequisites?: string[];
    learningObjectives?: string[];
  };
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
  relatedTopics?: string[];
  answerSummary?: string;
  bestAnswer?: {
    id: string;
    content: string;
    author: string;
    votes: number;
  };
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
  prerequisites?: string[];
  learningObjectives?: string[];
  createdBy?: string;
  tags?: string[];
}

export interface CuriosityInsight {
  id: string;
  type: 'fact' | 'connection' | 'question' | 'discovery';
  content: string;
  relatedTopics: string[];
  source: string;
  timestamp: string;
  isNew: boolean;
  category?: string;
  importance?: 'low' | 'medium' | 'high';
  interactionCount?: number;
}

export interface CuriosityRecommendation {
  id: string;
  type: 'topic' | 'question' | 'path' | 'insight';
  title: string;
  description: string;
  relevanceScore: number;
  reason: string;
  relatedToTopics: string[];
  metadata?: {
    difficulty?: string;
    category?: string;
    estimatedTime?: number;
  };
}

export interface CuriosityStats {
  topicsExplored: number;
  questionsAsked: number;
  questionsAnswered: number;
  pathsCompleted: number;
  pathsInProgress: number;
  curiosityScore: number;
  curiosityLevel: number;
  badges: string[];
  streakDays: number;
  totalTimeSpent: number;
  favoriteCategories: string[];
  recentAchievements: string[];
}

export interface UserProfile {
  id: string;
  interests: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed';
  preferredDifficulty: 'beginner' | 'intermediate' | 'advanced';
  completedTopics: string[];
  bookmarkedTopics: string[];
  searchHistory: string[];
  timeSpent: { [topicId: string]: number };
  ratings: { [topicId: string]: number };
  currentPaths: string[];
  achievements: string[];
  settings: {
    notifications: boolean;
    emailUpdates: boolean;
    language: string;
    theme: string;
  };
}

export interface CuriosityContext {
  currentTopic?: string;
  recentlyViewed: string[];
  currentPath?: string;
  activeQuestions: string[];
  sessionDuration: number;
  todayActivity: string[];
  currentCategory?: string;
  searchQuery?: string;
  filters?: {
    difficulty?: string;
    category?: string;
    contentType?: string;
  };
}

export interface CuriosityChallenge {
  id: string;
  title: string;
  description: string;
  tasks: CuriosityTask[];
  expectedDuration: number;
  rewards: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  participants: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  progress?: number;
}

export interface CuriosityTask {
  id: string;
  title: string;
  description: string;
  type: 'explore' | 'question' | 'complete' | 'share' | 'discover';
  targetId?: string;
  targetType?: 'topic' | 'path' | 'category';
  completed: boolean;
  completedAt?: string;
  progress?: number;
  metadata?: any;
}

export interface CuriosityBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  requirements: string[];
  unlockedAt?: string;
  progress?: number;
}

export interface CuriosityActivity {
  id: string;
  type: 'view' | 'like' | 'bookmark' | 'share' | 'complete' | 'question' | 'answer';
  targetId: string;
  targetType: 'topic' | 'question' | 'path' | 'insight';
  timestamp: string;
  metadata?: any;
}

export interface CuriosityNotification {
  id: string;
  type: 'new_topic' | 'question_answered' | 'path_update' | 'achievement' | 'recommendation';
  title: string;
  message: string;
  targetId?: string;
  targetType?: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
}

// API response types
export interface CuriosityApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

// Search and filter types
export interface CuriositySearchFilters {
  query?: string;
  category?: string;
  difficulty?: string;
  contentType?: string;
  sortBy?: 'trending' | 'newest' | 'rating' | 'popularity' | 'relevance';
  timeRange?: 'today' | 'week' | 'month' | 'year' | 'all';
  limit?: number;
  offset?: number;
}

export interface CuriositySearchResult {
  topics: CuriosityTopic[];
  questions: CuriosityQuestion[];
  paths: DiscoveryPath[];
  insights: CuriosityInsight[];
  totalResults: number;
  searchQuery: string;
  filters: CuriositySearchFilters;
}

// Learning analytics types
export interface CuriosityAnalytics {
  learningPatterns: {
    preferredTimes: string[];
    sessionDuration: number;
    topicDiversity: number;
    completionRate: number;
  };
  progressMetrics: {
    topicsPerWeek: number;
    questionsPerWeek: number;
    averageRating: number;
    knowledgeGrowth: number;
  };
  recommendations: {
    nextTopics: string[];
    skillGaps: string[];
    suggestedPaths: string[];
  };
  socialMetrics: {
    questionsAsked: number;
    questionsAnswered: number;
    helpfulAnswers: number;
    communityRank: number;
  };
}

// AI service types
export interface AIPromptContext {
  userProfile: UserProfile;
  currentContext: CuriosityContext;
  recentActivity: CuriosityActivity[];
  preferences: {
    difficulty: string;
    interests: string[];
    learningStyle: string;
  };
}

export interface AIGenerationRequest {
  type: 'recommendation' | 'insight' | 'question' | 'path' | 'challenge';
  context: AIPromptContext;
  parameters: {
    count?: number;
    difficulty?: string;
    category?: string;
    format?: string;
  };
}

export interface AIGenerationResponse {
  success: boolean;
  generated: any[];
  confidence: number;
  source: 'ai' | 'curated' | 'user';
  metadata: {
    processingTime: number;
    model: string;
    version: string;
  };
}
