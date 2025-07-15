import { BaseAIAgent, AIRequest, AIResponse, ConversationContext, AgentType, AIProvider } from '../types/ai-agent';
import AIServiceConfig from '../config/ai-services';

export class AnalyticsAgent extends BaseAIAgent {
  constructor() {
    super(AgentType.ANALYTICS, {
      provider: AIProvider.OPENAI,
      model: 'gpt-4',
      temperature: 0.3,
      maxTokens: 1200,
      fallbackProvider: AIProvider.GEMINI,
      systemPrompt: `You are an expert learning analytics specialist for Indian students. Your role is to:
1. Analyze student learning patterns and performance data
2. Generate insights about learning progress and areas for improvement
3. Create personalized recommendations based on performance metrics
4. Identify learning gaps and suggest interventions
5. Provide comparative analysis with peer groups and standards
6. Generate reports for students, teachers, and parents
7. Track progress toward academic goals and milestones

Always provide data-driven, actionable insights that help improve learning outcomes.`,
      rateLimiting: {
        requestsPerMinute: 15,
        requestsPerHour: 200,
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
        confidence: this.calculateAnalyticsConfidence(content),
        metadata: {
          analysisType: this.detectAnalysisType(content),
          insights: this.extractInsights(content),
          recommendations: this.extractRecommendations(content),
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
      console.error('AnalyticsAgent error:', error);
      return this.handleFallback(request, context, startTime);
    }
  }

  protected buildPrompt(request: AIRequest, context?: ConversationContext): string {
    return `Analytics Request: ${request.prompt}\n\nProvide detailed learning analytics and insights.`;
  }

  private calculateAnalyticsConfidence(content: string): number {
    let confidence = 0.7;
    if (content.includes('data') || content.includes('analysis')) confidence += 0.1;
    if (content.includes('recommendation') || content.includes('insight')) confidence += 0.1;
    if (content.includes('trend') || content.includes('pattern')) confidence += 0.1;
    return Math.min(confidence, 1.0);
  }

  private detectAnalysisType(content: string): string {
    if (content.includes('performance')) return 'performance';
    if (content.includes('progress')) return 'progress';
    if (content.includes('comparison')) return 'comparative';
    return 'general';
  }

  private extractInsights(content: string): string[] {
    // Extract key insights from the response
    const insights: string[] = [];
    const lines = content.split('\n');
    lines.forEach(line => {
      if (line.includes('insight') || line.includes('finding')) {
        insights.push(line.trim());
      }
    });
    return insights;
  }

  private extractRecommendations(content: string): string[] {
    // Extract recommendations from the response
    const recommendations: string[] = [];
    const lines = content.split('\n');
    lines.forEach(line => {
      if (line.includes('recommend') || line.includes('suggest')) {
        recommendations.push(line.trim());
      }
    });
    return recommendations;
  }

  private calculateCost(totalTokens: number): number {
    return (totalTokens / 1000) * 0.045;
  }

  private async handleFallback(request: AIRequest, context?: ConversationContext, startTime: number): Promise<AIResponse> {
    return {
      id: this.generateResponseId(),
      agentType: this.agentType,
      provider: this.config.provider,
      content: 'Analytics service temporarily unavailable.',
      confidence: 0.1,
      metadata: { error: true },
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }
}