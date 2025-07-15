import { BaseAIAgent, AIRequest, AIResponse, ConversationContext, AgentType, AIProvider } from '../types/ai-agent';
import AIServiceConfig from '../config/ai-services';

export class MentorAgent extends BaseAIAgent {
  constructor() {
    super(AgentType.MENTOR, {
      provider: AIProvider.ANTHROPIC,
      model: 'claude-3-sonnet-20240229',
      temperature: 0.7,
      maxTokens: 1500,
      fallbackProvider: AIProvider.OPENAI,
      systemPrompt: `You are an expert career mentor and guidance counselor for Indian students. Your role is to:
1. Provide career guidance and counseling
2. Help students explore career options based on their interests and skills
3. Advise on educational pathways and course selections
4. Guide students through competitive exam preparation strategies
5. Provide insights about job market trends in India
6. Help with college admissions and scholarship guidance
7. Support personal development and soft skills building

Always be supportive, encouraging, and provide practical, actionable advice.`,
      rateLimiting: {
        requestsPerMinute: 20,
        requestsPerHour: 300,
      },
    });
  }

  async processRequest(request: AIRequest, context?: ConversationContext): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      const aiService = AIServiceConfig.getInstance();
      const anthropic = aiService.getAnthropic();
      
      const prompt = this.buildPrompt(request, context);
      
      const response = await anthropic.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens!,
        temperature: this.config.temperature,
        system: this.config.systemPrompt!,
        messages: [
          { role: 'user', content: prompt },
        ],
      });

      const content = response.content[0]?.text || '';
      
      return {
        id: this.generateResponseId(),
        agentType: this.agentType,
        provider: this.config.provider,
        content,
        confidence: this.calculateMentorConfidence(content),
        metadata: {
          guidanceType: this.detectGuidanceType(content),
          careerField: this.detectCareerField(content),
        },
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
          cost: this.calculateCost(response.usage.input_tokens, response.usage.output_tokens),
        },
        timestamp: new Date(),
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error('MentorAgent error:', error);
      return this.handleFallback(request, context, startTime);
    }
  }

  protected buildPrompt(request: AIRequest, context?: ConversationContext): string {
    return `Career Guidance Request: ${request.prompt}\n\nProvide thoughtful career mentoring and guidance.`;
  }

  private calculateMentorConfidence(content: string): number {
    let confidence = 0.7;
    if (content.includes('career') || content.includes('guidance')) confidence += 0.1;
    if (content.includes('recommend') || content.includes('suggest')) confidence += 0.1;
    if (content.includes('pathway') || content.includes('option')) confidence += 0.1;
    return Math.min(confidence, 1.0);
  }

  private detectGuidanceType(content: string): string {
    if (content.includes('career')) return 'career';
    if (content.includes('college') || content.includes('admission')) return 'academic';
    if (content.includes('skill')) return 'skill_development';
    return 'general';
  }

  private detectCareerField(content: string): string {
    if (content.includes('engineering')) return 'engineering';
    if (content.includes('medical')) return 'medical';
    if (content.includes('business')) return 'business';
    if (content.includes('arts')) return 'arts';
    return 'general';
  }

  private calculateCost(inputTokens: number, outputTokens: number): number {
    return (inputTokens / 1000) * 0.003 + (outputTokens / 1000) * 0.015;
  }

  private async handleFallback(request: AIRequest, context?: ConversationContext, startTime: number): Promise<AIResponse> {
    return {
      id: this.generateResponseId(),
      agentType: this.agentType,
      provider: this.config.provider,
      content: 'Mentoring service temporarily unavailable.',
      confidence: 0.1,
      metadata: { error: true },
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }
}