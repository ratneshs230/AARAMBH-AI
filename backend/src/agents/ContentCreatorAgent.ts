import { BaseAIAgent, AIRequest, AIResponse, ConversationContext, AgentType, AIProvider } from '../types/ai-agent';
import AIServiceConfig from '../config/ai-services';

export class ContentCreatorAgent extends BaseAIAgent {
  constructor() {
    super(AgentType.CONTENT_CREATOR, {
      provider: AIProvider.ANTHROPIC,
      model: 'claude-3-sonnet-20240229',
      temperature: 0.8,
      maxTokens: 2000,
      fallbackProvider: AIProvider.OPENAI,
      systemPrompt: `You are an expert educational content creator for Indian students. Your role is to:
1. Create engaging, curriculum-aligned educational content
2. Design interactive lessons with multimedia elements
3. Develop practice exercises and assignments
4. Create content for multiple learning styles (visual, auditory, kinesthetic)
5. Ensure content follows Indian education standards (CBSE, ICSE, State boards)
6. Include cultural context and relevant examples
7. Structure content with clear learning objectives and outcomes
8. Create assessments and evaluation criteria

Always create well-structured, pedagogically sound content that enhances learning.`,
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
      const usage = response.usage;

      return {
        id: this.generateResponseId(),
        agentType: this.agentType,
        provider: this.config.provider,
        content,
        confidence: this.calculateContentCreatorConfidence(content, request.metadata),
        metadata: {
          contentType: this.detectContentType(content),
          subject: request.metadata?.subject,
          level: request.metadata?.level,
          format: this.detectContentFormat(content),
          interactivity: this.detectInteractivityLevel(content),
        },
        usage: {
          inputTokens: usage.input_tokens,
          outputTokens: usage.output_tokens,
          totalTokens: usage.input_tokens + usage.output_tokens,
          cost: this.calculateCost(usage.input_tokens, usage.output_tokens),
        },
        timestamp: new Date(),
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error('ContentCreatorAgent error:', error);
      return this.handleFallback(request, context, startTime);
    }
  }

  protected buildPrompt(request: AIRequest, context?: ConversationContext): string {
    let prompt = `Content Creation Request: ${request.prompt}\n\n`;
    
    if (request.metadata?.subject) {
      prompt += `Subject: ${request.metadata.subject}\n`;
    }
    
    if (request.metadata?.level) {
      prompt += `Academic Level: ${request.metadata.level}\n`;
    }
    
    if (request.metadata?.language) {
      prompt += `Language: ${request.metadata.language}\n`;
    }
    
    if (context?.metadata?.learningObjectives) {
      prompt += `Learning Objectives:\n${context.metadata.learningObjectives.map(obj => `- ${obj}`).join('\n')}\n\n`;
    }
    
    prompt += `Requirements:
1. Create structured, engaging educational content
2. Include clear learning objectives and outcomes
3. Design interactive elements where appropriate
4. Provide examples relevant to Indian context
5. Ensure content is age-appropriate and curriculum-aligned
6. Include assessment or practice opportunities
7. Structure content with proper headings and organization

Please create comprehensive educational content that meets these requirements.`;
    
    return prompt;
  }

  private calculateContentCreatorConfidence(content: string, metadata?: Record<string, any>): number {
    let confidence = 0.6;
    
    // Check for educational structure
    if (content.includes('Learning Objectives') || content.includes('Objectives')) confidence += 0.15;
    if (content.includes('Activity') || content.includes('Exercise')) confidence += 0.1;
    if (content.includes('Assessment') || content.includes('Evaluation')) confidence += 0.1;
    if (content.includes('#') || content.includes('**')) confidence += 0.05; // Markdown formatting
    
    // Content depth
    if (content.length > 500) confidence += 0.1;
    if (content.split('\n').length > 10) confidence += 0.05; // Well-structured
    
    return Math.min(confidence, 1.0);
  }

  private detectContentType(content: string): string {
    if (content.includes('lesson') || content.includes('chapter')) return 'lesson';
    if (content.includes('quiz') || content.includes('test')) return 'assessment';
    if (content.includes('activity') || content.includes('exercise')) return 'practice';
    if (content.includes('project') || content.includes('assignment')) return 'project';
    if (content.includes('explanation') || content.includes('concept')) return 'explanation';
    return 'general';
  }

  private detectContentFormat(content: string): string {
    if (content.includes('video') || content.includes('multimedia')) return 'multimedia';
    if (content.includes('#') || content.includes('**')) return 'structured_text';
    if (content.includes('interactive') || content.includes('simulation')) return 'interactive';
    if (content.includes('diagram') || content.includes('chart')) return 'visual';
    return 'text';
  }

  private detectInteractivityLevel(content: string): string {
    let interactivity = 0;
    if (content.includes('activity') || content.includes('exercise')) interactivity += 1;
    if (content.includes('discussion') || content.includes('group')) interactivity += 1;
    if (content.includes('simulation') || content.includes('interactive')) interactivity += 1;
    if (content.includes('project') || content.includes('hands-on')) interactivity += 1;
    
    if (interactivity >= 3) return 'high';
    if (interactivity >= 2) return 'medium';
    if (interactivity >= 1) return 'low';
    return 'passive';
  }

  private calculateCost(inputTokens: number, outputTokens: number): number {
    // Claude pricing: $0.003 per 1K input tokens, $0.015 per 1K output tokens
    return (inputTokens / 1000) * 0.003 + (outputTokens / 1000) * 0.015;
  }

  private async handleFallback(request: AIRequest, context?: ConversationContext, startTime: number): Promise<AIResponse> {
    try {
      const aiService = AIServiceConfig.getInstance();
      const openai = aiService.getOpenAI();
      
      const prompt = this.buildPrompt(request, context);
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
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
        provider: AIProvider.OPENAI,
        content,
        confidence: this.calculateContentCreatorConfidence(content, request.metadata) * 0.9,
        metadata: {
          fallback: true,
          originalProvider: this.config.provider,
        },
        timestamp: new Date(),
        processingTime: Date.now() - startTime,
      };
    } catch (fallbackError) {
      console.error('ContentCreatorAgent fallback error:', fallbackError);
      return {
        id: this.generateResponseId(),
        agentType: this.agentType,
        provider: this.config.provider,
        content: 'I apologize, but I\'m currently unable to generate content. Please try again later.',
        confidence: 0.1,
        metadata: { error: true },
        timestamp: new Date(),
        processingTime: Date.now() - startTime,
      };
    }
  }
}