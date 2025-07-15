import { AgentManager, BaseAIAgent, AgentType, AIRequest, AIResponse } from '../types/ai-agent';
import { TutorAgent } from './TutorAgent';
import { ContentCreatorAgent } from './ContentCreatorAgent';
import { AssessmentAgent } from './AssessmentAgent';
import { AnalyticsAgent } from './AnalyticsAgent';
import { MentorAgent } from './MentorAgent';
import { StudyPlannerAgent } from './StudyPlannerAgent';
import { DoubtSolverAgent } from './DoubtSolverAgent';

export class AIAgentManager implements AgentManager {
  private static instance: AIAgentManager;
  private agents: Map<AgentType, BaseAIAgent>;
  private requestCounts: Map<AgentType, { minute: number, hour: number, lastReset: Date }>;

  private constructor() {
    this.agents = new Map();
    this.requestCounts = new Map();
    this.initializeAgents();
  }

  public static getInstance(): AIAgentManager {
    if (!AIAgentManager.instance) {
      AIAgentManager.instance = new AIAgentManager();
    }
    return AIAgentManager.instance;
  }

  private initializeAgents(): void {
    this.agents.set(AgentType.TUTOR, new TutorAgent());
    this.agents.set(AgentType.CONTENT_CREATOR, new ContentCreatorAgent());
    this.agents.set(AgentType.ASSESSMENT, new AssessmentAgent());
    this.agents.set(AgentType.ANALYTICS, new AnalyticsAgent());
    this.agents.set(AgentType.MENTOR, new MentorAgent());
    this.agents.set(AgentType.STUDY_PLANNER, new StudyPlannerAgent());
    this.agents.set(AgentType.DOUBT_SOLVER, new DoubtSolverAgent());

    // Initialize request counters
    Object.values(AgentType).forEach(agentType => {
      this.requestCounts.set(agentType, {
        minute: 0,
        hour: 0,
        lastReset: new Date(),
      });
    });

    console.log('✅ AI Agent Manager initialized with all agents');
  }

  public getAgent(agentType: AgentType): BaseAIAgent {
    const agent = this.agents.get(agentType);
    if (!agent) {
      throw new Error(`Agent of type ${agentType} not found`);
    }
    return agent;
  }

  public async routeRequest(request: AIRequest): Promise<AIResponse> {
    const agentType = this.determineAgentType(request);
    
    // Check rate limits
    if (!this.checkRateLimit(agentType)) {
      throw new Error(`Rate limit exceeded for ${agentType} agent`);
    }

    const agent = this.getAgent(agentType);
    this.incrementRequestCount(agentType);

    try {
      const response = await agent.processRequest(request);
      
      // Log request for analytics
      this.logRequest(agentType, request, response);
      
      return response;
    } catch (error) {
      console.error(`Error processing request with ${agentType} agent:`, error);
      throw error;
    }
  }

  private determineAgentType(request: AIRequest): AgentType {
    const prompt = request.prompt.toLowerCase();
    const context = request.context || {};
    
    // Explicit agent type in context
    if (context.agentType && Object.values(AgentType).includes(context.agentType)) {
      return context.agentType;
    }

    // Intent-based routing
    if (prompt.includes('create') && (prompt.includes('lesson') || prompt.includes('content'))) {
      return AgentType.CONTENT_CREATOR;
    }
    
    if (prompt.includes('quiz') || prompt.includes('test') || prompt.includes('assessment')) {
      return AgentType.ASSESSMENT;
    }
    
    if (prompt.includes('plan') && (prompt.includes('study') || prompt.includes('schedule'))) {
      return AgentType.STUDY_PLANNER;
    }
    
    if (prompt.includes('career') || prompt.includes('guidance') || prompt.includes('future')) {
      return AgentType.MENTOR;
    }
    
    if (prompt.includes('doubt') || prompt.includes('help') || prompt.includes('solve')) {
      return AgentType.DOUBT_SOLVER;
    }
    
    if (prompt.includes('analytics') || prompt.includes('progress') || prompt.includes('performance')) {
      return AgentType.ANALYTICS;
    }
    
    // Default to tutor for educational explanations
    return AgentType.TUTOR;
  }

  private checkRateLimit(agentType: AgentType): boolean {
    const agent = this.getAgent(agentType);
    const config = agent.getConfig();
    const counts = this.requestCounts.get(agentType);
    
    if (!config.rateLimiting || !counts) return true;

    const now = new Date();
    const timeDiff = now.getTime() - counts.lastReset.getTime();
    
    // Reset counters if needed
    if (timeDiff >= 60000) { // 1 minute
      counts.minute = 0;
      if (timeDiff >= 3600000) { // 1 hour
        counts.hour = 0;
      }
      counts.lastReset = now;
    }
    
    // Check limits
    if (counts.minute >= config.rateLimiting.requestsPerMinute) return false;
    if (counts.hour >= config.rateLimiting.requestsPerHour) return false;
    
    return true;
  }

  private incrementRequestCount(agentType: AgentType): void {
    const counts = this.requestCounts.get(agentType);
    if (counts) {
      counts.minute++;
      counts.hour++;
    }
  }

  private logRequest(agentType: AgentType, request: AIRequest, response: AIResponse): void {
    // Log for analytics and monitoring
    console.log(`📊 Agent Request: ${agentType}`, {
      userId: request.userId,
      responseId: response.id,
      confidence: response.confidence,
      processingTime: response.processingTime,
      provider: response.provider,
      cost: response.usage?.cost,
    });
  }

  public async healthCheck(): Promise<Record<AgentType, boolean>> {
    const health: Record<AgentType, boolean> = {} as Record<AgentType, boolean>;
    
    for (const [agentType, agent] of this.agents.entries()) {
      try {
        // Simple health check - verify agent can be instantiated and configured
        const config = agent.getConfig();
        health[agentType] = !!config && !!agent.getAgentType();
      } catch (error) {
        console.error(`Health check failed for ${agentType}:`, error);
        health[agentType] = false;
      }
    }
    
    return health;
  }

  public getRequestCounts(): Map<AgentType, { minute: number, hour: number }> {
    const counts = new Map<AgentType, { minute: number, hour: number }>();
    
    this.requestCounts.forEach((count, agentType) => {
      counts.set(agentType, {
        minute: count.minute,
        hour: count.hour,
      });
    });
    
    return counts;
  }

  public getAgentConfigs(): Map<AgentType, any> {
    const configs = new Map<AgentType, any>();
    
    this.agents.forEach((agent, agentType) => {
      configs.set(agentType, {
        type: agentType,
        provider: agent.getConfig().provider,
        model: agent.getConfig().model,
        rateLimiting: agent.getConfig().rateLimiting,
      });
    });
    
    return configs;
  }

  public async resetRateLimits(): Promise<void> {
    const now = new Date();
    this.requestCounts.forEach((count) => {
      count.minute = 0;
      count.hour = 0;
      count.lastReset = now;
    });
    console.log('✅ Rate limits reset for all agents');
  }
}

export default AIAgentManager;