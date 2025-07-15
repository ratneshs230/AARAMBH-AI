// Global type definitions for AARAMBH AI Frontend

export interface User {
  uid: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher' | 'admin' | 'parent';
  subscription: 'free' | 'premium' | 'enterprise';
  profile?: {
    avatar?: string;
    class?: string;
    school?: string;
    subjects?: string[];
    learningStyle?: string;
    language?: string;
  };
  analytics?: {
    totalStudyTime: number;
    coursesCompleted: number;
    averageScore: number;
    streakDays: number;
    lastActiveDate: string;
  };
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  subject: string;
  level: string;
  instructor: {
    name: string;
    avatar?: string;
    bio?: string;
  };
  content: {
    lessons: number;
    duration: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
  pricing: {
    type: 'free' | 'premium';
    amount?: number;
  };
  rating: {
    average: number;
    count: number;
  };
  enrollmentCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AIAgent {
  type:
    | 'tutor'
    | 'content_creator'
    | 'assessment'
    | 'analytics'
    | 'mentor'
    | 'study_planner'
    | 'doubt_solver';
  name: string;
  description: string;
  capabilities: string[];
  isAvailable: boolean;
}

export interface AIRequest {
  prompt: string;
  agentType?: string;
  metadata?: {
    subject?: string;
    level?: string;
    language?: string;
  };
  sessionId?: string;
}

export interface AIResponse {
  id: string;
  agentType: string;
  provider: string;
  content: string;
  confidence: number;
  metadata?: Record<string, any>;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    cost?: number;
  };
  timestamp: string;
  processingTime: number;
}

export interface Assessment {
  _id: string;
  title: string;
  subject: string;
  level: string;
  type: 'quiz' | 'test' | 'assignment' | 'practice';
  questions: Question[];
  timeLimit?: number;
  passingScore: number;
  createdBy: string;
  createdAt: string;
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'short_answer' | 'essay' | 'true_false';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface StudySession {
  sessionId: string;
  userId: string;
  subject: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  progress: {
    completed: number;
    total: number;
  };
  performance: {
    score?: number;
    accuracy?: number;
  };
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface ThemeMode {
  mode: 'light' | 'dark' | 'system';
}

export interface AppConfig {
  apiUrl: string;
  aiApiUrl: string;
  socketUrl: string;
  enableAI: boolean;
  enableRealTime: boolean;
  enableAnalytics: boolean;
  enablePWA: boolean;
}
