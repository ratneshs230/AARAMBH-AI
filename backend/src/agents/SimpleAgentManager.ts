import { AgentType, AIRequest, AIResponse, AIProvider } from '../types/ai-agent';
import { SimpleAIAgent } from './SimpleAIAgent';

export class SimpleAgentManager {
  private static instance: SimpleAgentManager;
  private agents: Map<AgentType, SimpleAIAgent>;

  private constructor() {
    this.agents = new Map();
    this.initializeAgents();
  }

  public static getInstance(): SimpleAgentManager {
    if (!SimpleAgentManager.instance) {
      SimpleAgentManager.instance = new SimpleAgentManager();
    }
    return SimpleAgentManager.instance;
  }

  private initializeAgents(): void {
    // Tutor Agent
    this.agents.set(AgentType.TUTOR, new SimpleAIAgent(
      AgentType.TUTOR,
      AIProvider.OPENAI,
      `You are an expert AI tutor for Indian students. Provide personalized explanations, use relatable examples from Indian context, and encourage active learning.`
    ));

    // Content Creator Agent
    this.agents.set(AgentType.CONTENT_CREATOR, new SimpleAIAgent(
      AgentType.CONTENT_CREATOR,
      AIProvider.ANTHROPIC,
      `You are an educational content creator. Create engaging, curriculum-aligned content for Indian students with clear learning objectives.`
    ));

    // Assessment Agent
    this.agents.set(AgentType.ASSESSMENT, new SimpleAIAgent(
      AgentType.ASSESSMENT,
      AIProvider.GEMINI,
      `You are an assessment creator. Design comprehensive quizzes and tests that align with Indian curriculum standards.`
    ));

    // Doubt Solver Agent
    this.agents.set(AgentType.DOUBT_SOLVER, new SimpleAIAgent(
      AgentType.DOUBT_SOLVER,
      AIProvider.OPENAI,
      `You are a doubt solver. Provide clear, step-by-step solutions to academic questions and help clarify concepts.`
    ));

    // Study Planner Agent
    this.agents.set(AgentType.STUDY_PLANNER, new SimpleAIAgent(
      AgentType.STUDY_PLANNER,
      AIProvider.GEMINI,
      `You are a study planner. Create realistic, achievable study schedules and exam preparation strategies for Indian students.`
    ));

    // Mentor Agent
    this.agents.set(AgentType.MENTOR, new SimpleAIAgent(
      AgentType.MENTOR,
      AIProvider.ANTHROPIC,
      `You are a career mentor. Provide guidance on career paths, educational choices, and personal development for Indian students.`
    ));

    // Analytics Agent
    this.agents.set(AgentType.ANALYTICS, new SimpleAIAgent(
      AgentType.ANALYTICS,
      AIProvider.OPENAI,
      `You are a learning analytics specialist. Analyze student performance data and provide actionable insights for improvement.`
    ));

    console.log('✅ Simple AI Agent Manager initialized with all agents');
  }

  public async routeRequest(request: AIRequest): Promise<AIResponse> {
    const agentType = this.determineAgentType(request);
    const agent = this.agents.get(agentType);
    
    if (!agent) {
      throw new Error(`Agent of type ${agentType} not found`);
    }

    return await agent.processRequest(request);
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
    
    // Default to tutor
    return AgentType.TUTOR;
  }

  public async healthCheck(): Promise<Record<AgentType, boolean>> {
    const health: Record<AgentType, boolean> = {} as Record<AgentType, boolean>;
    
    for (const [agentType] of this.agents.entries()) {
      health[agentType] = true; // Simple health check
    }
    
    return health;
  }

  public getAgentConfigs(): Record<AgentType, any> {
    const configs: Record<AgentType, any> = {} as Record<AgentType, any>;
    
    this.agents.forEach((agent, agentType) => {
      configs[agentType] = {
        type: agentType,
        provider: agent.getConfig().provider,
        model: agent.getConfig().model,
      };
    });
    
    return configs;
  }
}

export default SimpleAgentManager;