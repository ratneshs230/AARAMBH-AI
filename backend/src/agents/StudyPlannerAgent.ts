import {
  BaseAIAgent,
  AIRequest,
  AIResponse,
  ConversationContext,
  AgentType,
  AIProvider,
} from '../types/ai-agent';
import AIServiceConfig from '../config/ai-services';

export class StudyPlannerAgent extends BaseAIAgent {
  constructor() {
    super(AgentType.STUDY_PLANNER, {
      provider: AIProvider.GEMINI,
      model: 'gemini-pro',
      temperature: 0.5,
      maxTokens: 1800,
      fallbackProvider: AIProvider.OPENAI,
      systemPrompt: `You are an expert study planner and schedule optimizer for Indian students. Your role is to:
1. Create personalized study schedules and timetables
2. Plan exam preparation strategies and timelines
3. Balance academic studies with extracurricular activities
4. Optimize study sessions based on learning science principles
5. Account for Indian academic calendar and examination patterns
6. Create revision schedules and milestone tracking
7. Adapt plans based on student progress and feedback

Always create realistic, achievable plans that promote effective learning.`,
      rateLimiting: {
        requestsPerMinute: 25,
        requestsPerHour: 400,
      },
    });
  }

  async processRequest(request: AIRequest, context?: ConversationContext): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      const aiService = AIServiceConfig.getInstance();
      const gemini = aiService.getGemini();
      const model = gemini.getGenerativeModel({
        model: this.config.model,
        generationConfig: {
          temperature: this.config.temperature,
          maxOutputTokens: this.config.maxTokens,
        },
      });

      const prompt = this.buildPrompt(request, context);
      const result = await model.generateContent(prompt);
      const content = result.response.text();

      return {
        id: this.generateResponseId(),
        agentType: this.agentType,
        provider: this.config.provider,
        content,
        confidence: this.calculatePlannerConfidence(content),
        metadata: {
          planType: this.detectPlanType(content),
          duration: this.detectDuration(content),
          subjects: this.extractSubjects(content),
        },
        usage: {
          totalTokens: this.estimateTokens(prompt + content),
          cost: this.calculateCost(this.estimateTokens(prompt + content)),
        },
        timestamp: new Date(),
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error('StudyPlannerAgent error:', error);
      return this.handleFallback(request, context, startTime);
    }
  }

  protected buildPrompt(request: AIRequest, context?: ConversationContext): string {
    return `Study Planning Request: ${request.prompt}\n\nCreate a detailed, practical study plan.`;
  }

  private calculatePlannerConfidence(content: string): number {
    let confidence = 0.7;
    if (content.includes('schedule') || content.includes('timetable')) confidence += 0.1;
    if (content.includes('week') || content.includes('day')) confidence += 0.1;
    if (content.includes('subject') || content.includes('topic')) confidence += 0.1;
    return Math.min(confidence, 1.0);
  }

  private detectPlanType(content: string): string {
    if (content.includes('exam')) return 'exam_preparation';
    if (content.includes('daily') || content.includes('routine')) return 'daily_schedule';
    if (content.includes('revision')) return 'revision_plan';
    return 'general';
  }

  private detectDuration(content: string): string {
    if (content.includes('week')) return 'weekly';
    if (content.includes('month')) return 'monthly';
    if (content.includes('day')) return 'daily';
    return 'flexible';
  }

  private extractSubjects(content: string): string[] {
    const subjects: string[] = [];
    const commonSubjects = [
      'math',
      'science',
      'english',
      'history',
      'geography',
      'physics',
      'chemistry',
      'biology',
    ];
    commonSubjects.forEach((subject) => {
      if (content.toLowerCase().includes(subject)) {
        subjects.push(subject);
      }
    });
    return subjects;
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private calculateCost(totalTokens: number): number {
    return (totalTokens / 1000) * 0.0005;
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
      content: 'Study planning service temporarily unavailable.',
      confidence: 0.1,
      metadata: { error: true },
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }
}
