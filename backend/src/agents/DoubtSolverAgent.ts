import {
  BaseAIAgent,
  AIRequest,
  AIResponse,
  ConversationContext,
  AgentType,
  AIProvider,
} from '../types/ai-agent';
import AIServiceConfig from '../config/ai-services';

export class DoubtSolverAgent extends BaseAIAgent {
  constructor() {
    super(AgentType.DOUBT_SOLVER, {
      provider: AIProvider.OPENAI,
      model: 'gpt-4',
      temperature: 0.6,
      maxTokens: 1200,
      fallbackProvider: AIProvider.GEMINI,
      systemPrompt: `You are an expert doubt solver and problem-solving assistant for Indian students. Your role is to:
1. Solve academic doubts and questions across all subjects
2. Provide step-by-step problem solutions
3. Explain concepts clearly when students are confused
4. Help with homework and assignment questions
5. Clarify misunderstandings and misconceptions
6. Provide multiple solution approaches when applicable
7. Encourage independent thinking and learning

Always be patient, clear, and educational in your responses.`,
      rateLimiting: {
        requestsPerMinute: 40,
        requestsPerHour: 600,
      },
    });
  }

  async processRequest(request: AIRequest, context?: ConversationContext): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      const aiService = AIServiceConfig.getInstance();
      const openai = aiService.getOpenAI();

      const prompt = this.buildPrompt(request, context);

      const response = await openai.chat.completions.create({
        model: this.config.model,
        messages: [
          { role: 'system', content: this.config.systemPrompt! },
          { role: 'user', content: prompt },
        ],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      });

      const content = response.choices[0]?.message?.content || '';

      return {
        id: this.generateResponseId(),
        agentType: this.agentType,
        provider: this.config.provider,
        content,
        confidence: this.calculateDoubtSolverConfidence(content),
        metadata: {
          problemType: this.detectProblemType(content),
          solutionSteps: this.countSolutionSteps(content),
          hasExplanation: this.hasExplanation(content),
        },
        usage: {
          inputTokens: response.usage?.prompt_tokens,
          outputTokens: response.usage?.completion_tokens,
          totalTokens: response.usage?.total_tokens,
          cost: this.calculateCost(response.usage?.total_tokens || 0),
        },
        timestamp: new Date(),
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error('DoubtSolverAgent error:', error);
      return this.handleFallback(request, context, startTime);
    }
  }

  protected buildPrompt(request: AIRequest, context?: ConversationContext): string {
    return `Student Doubt: ${request.prompt}\n\nPlease provide a clear, step-by-step solution and explanation.`;
  }

  private calculateDoubtSolverConfidence(content: string): number {
    let confidence = 0.7;
    if (content.includes('step') || content.includes('solution')) confidence += 0.1;
    if (content.includes('answer') || content.includes('result')) confidence += 0.1;
    if (content.includes('explanation') || content.includes('because')) confidence += 0.1;
    return Math.min(confidence, 1.0);
  }

  private detectProblemType(content: string): string {
    if (content.includes('math') || content.includes('equation')) return 'mathematical';
    if (content.includes('concept') || content.includes('theory')) return 'conceptual';
    if (content.includes('practical') || content.includes('experiment')) return 'practical';
    return 'general';
  }

  private countSolutionSteps(content: string): number {
    const stepPatterns = [/step \d+/gi, /\d+\./g, /first|second|third|finally/gi];
    let maxSteps = 0;
    stepPatterns.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) maxSteps = Math.max(maxSteps, matches.length);
    });
    return maxSteps;
  }

  private hasExplanation(content: string): boolean {
    const explanationKeywords = ['because', 'reason', 'explanation', 'why', 'therefore'];
    return explanationKeywords.some((keyword) => content.toLowerCase().includes(keyword));
  }

  private calculateCost(totalTokens: number): number {
    return (totalTokens / 1000) * 0.045;
  }

  private async handleFallback(
    request: AIRequest,
    context?: ConversationContext,
    startTime: number
  ): Promise<AIResponse> {
    return {
      id: this.generateResponseId(),
      agentType: this.agentType,
      provider: this.config.provider,
      content: 'Doubt solving service temporarily unavailable.',
      confidence: 0.1,
      metadata: { error: true },
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }
}
