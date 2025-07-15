import {
  BaseAIAgent,
  AIRequest,
  AIResponse,
  ConversationContext,
  AgentType,
  AIProvider,
} from '../types/ai-agent';
import AIServiceConfig from '../config/ai-services';

export class SimpleAIAgent extends BaseAIAgent {
  constructor(agentType: AgentType, provider: AIProvider, systemPrompt: string) {
    super(agentType, {
      provider,
      model:
        provider === AIProvider.OPENAI
          ? 'gpt-4'
          : provider === AIProvider.GEMINI
            ? 'gemini-pro'
            : 'claude-3-sonnet-20240229',
      temperature: 0.7,
      maxTokens: 1500,
      systemPrompt,
      rateLimiting: {
        requestsPerMinute: 30,
        requestsPerHour: 500,
      },
    });
  }

  async processRequest(request: AIRequest, context?: ConversationContext): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      const prompt = this.buildPrompt(request, context);
      let content = '';
      let usage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

      if (this.config.provider === AIProvider.OPENAI) {
        const aiService = AIServiceConfig.getInstance();
        const openai = aiService.getOpenAI();

        const response = await openai.chat.completions.create({
          model: this.config.model,
          messages: [
            { role: 'system', content: this.config.systemPrompt! },
            { role: 'user', content: prompt },
          ],
          temperature: this.config.temperature || 0.7,
          max_tokens: this.config.maxTokens || 1500,
        });

        content = response.choices[0]?.message?.content || '';
        usage = {
          inputTokens: response.usage?.prompt_tokens || 0,
          outputTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        };
      } else if (this.config.provider === AIProvider.GEMINI) {
        const aiService = AIServiceConfig.getInstance();
        const gemini = aiService.getGemini();
        const model = gemini.getGenerativeModel({ model: this.config.model });

        const result = await model.generateContent(prompt);
        content = result.response.text();
        usage = {
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: this.estimateTokens(prompt + content),
        };
      } else if (this.config.provider === AIProvider.ANTHROPIC) {
        const aiService = AIServiceConfig.getInstance();
        const anthropic = aiService.getAnthropic();

        const response = await anthropic.messages.create({
          model: this.config.model,
          max_tokens: this.config.maxTokens || 1500,
          temperature: this.config.temperature || 0.7,
          system: this.config.systemPrompt!,
          messages: [{ role: 'user', content: prompt }],
        });

        const firstContent = response.content[0];
        content = firstContent && 'text' in firstContent ? firstContent.text : '';
        usage = {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        };
      }

      return {
        id: this.generateResponseId(),
        agentType: this.agentType,
        provider: this.config.provider,
        content,
        confidence: this.calculateConfidence(content),
        metadata: {
          subject: request.metadata?.subject,
          level: request.metadata?.level,
        },
        usage: {
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          totalTokens: usage.totalTokens,
          cost: this.calculateCost(usage.totalTokens),
        },
        timestamp: new Date(),
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error(`${this.agentType} error:`, error);
      return {
        id: this.generateResponseId(),
        agentType: this.agentType,
        provider: this.config.provider,
        content: 'Service temporarily unavailable. Please try again.',
        confidence: 0.1,
        metadata: { error: true },
        timestamp: new Date(),
        processingTime: Date.now() - startTime,
      };
    }
  }

  protected buildPrompt(request: AIRequest, _context?: ConversationContext): string {
    let prompt = `Request: ${request.prompt}\n\n`;

    if (request.metadata?.subject) {
      prompt += `Subject: ${request.metadata.subject}\n`;
    }

    if (request.metadata?.level) {
      prompt += `Level: ${request.metadata.level}\n`;
    }

    prompt += `Please provide a helpful and accurate response.`;

    return prompt;
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private calculateCost(totalTokens: number): number {
    switch (this.config.provider) {
      case AIProvider.OPENAI:
        return (totalTokens / 1000) * 0.045;
      case AIProvider.GEMINI:
        return (totalTokens / 1000) * 0.0005;
      case AIProvider.ANTHROPIC:
        return (totalTokens / 1000) * 0.009;
      default:
        return 0;
    }
  }
}
