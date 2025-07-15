export enum AIProvider {
  OPENAI = 'openai',
  GEMINI = 'gemini',
  ANTHROPIC = 'anthropic',
}

export enum AgentType {
  TUTOR = 'tutor',
  CONTENT_CREATOR = 'content_creator',
  ASSESSMENT = 'assessment',
  ANALYTICS = 'analytics',
  MENTOR = 'mentor',
  STUDY_PLANNER = 'study_planner',
  DOUBT_SOLVER = 'doubt_solver',
}

export interface AIRequest {
  userId: string;
  sessionId?: string;
  context?: Record<string, any>;
  prompt: string;
  metadata?: {
    subject?: string;
    level?: string;
    language?: string;
    preference?: string;
  };
}

export interface AIResponse {
  id: string;
  agentType: AgentType;
  provider: AIProvider;
  content: string;
  confidence: number;
  metadata?: Record<string, any>;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    cost?: number;
  };
  timestamp: Date;
  processingTime: number;
}

export interface AgentConfig {
  provider: AIProvider;
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  fallbackProvider?: AIProvider;
  rateLimiting?: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

export interface ConversationContext {
  userId: string;
  sessionId: string;
  history: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  metadata: {
    subject?: string;
    level?: string;
    learningObjectives?: string[];
    userPreferences?: Record<string, any>;
  };
}

export abstract class BaseAIAgent {
  protected config: AgentConfig;
  protected agentType: AgentType;

  constructor(agentType: AgentType, config: AgentConfig) {
    this.agentType = agentType;
    this.config = config;
  }

  abstract processRequest(request: AIRequest, context?: ConversationContext): Promise<AIResponse>;

  protected abstract buildPrompt(request: AIRequest, context?: ConversationContext): string;

  protected generateResponseId(): string {
    return `${this.agentType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  protected calculateConfidence(response: string, metadata?: Record<string, any>): number {
    // Base confidence calculation - can be overridden by specific agents
    let confidence = 0.7;
    
    if (response.length > 100) confidence += 0.1;
    if (response.includes('specific') || response.includes('example')) confidence += 0.1;
    if (metadata?.structured) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  public getConfig(): AgentConfig {
    return this.config;
  }

  public getAgentType(): AgentType {
    return this.agentType;
  }
}

export interface AgentManager {
  getAgent(agentType: AgentType): BaseAIAgent;
  routeRequest(request: AIRequest): Promise<AIResponse>;
  healthCheck(): Promise<Record<AgentType, boolean>>;
}