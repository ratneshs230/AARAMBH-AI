import OpenAI from 'openai'; // Import OpenAI for type definitions
import {
  BaseAIAgent,
  AIRequest,
  AIResponse,
  ConversationContext,
  AgentType,
  AIProvider,
} from '../types/ai-agent';
import AIServiceConfig from '../config/ai-services';

export class TutorAgent extends BaseAIAgent {
  constructor() {
    super(AgentType.TUTOR, {
      provider: AIProvider.OPENAI,
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 1000,
      fallbackProvider: AIProvider.GEMINI,
      systemPrompt: `You are an expert AI tutor for Indian students. Your role is to:
1. Provide personalized explanations based on student's learning level
2. Use relatable examples from Indian context
3. Break down complex concepts into simple steps
4. Encourage active learning and critical thinking
5. Adapt teaching style to individual learning preferences
6. Support multiple languages (English, Hindi, regional languages)
7. Follow Indian education standards (CBSE, ICSE, State boards)

Always be encouraging, patient, and culturally sensitive.`,
      rateLimiting: {
        requestsPerMinute: 30,
        requestsPerHour: 500,
      },
    });
  }

  async processRequest(request: AIRequest, context?: ConversationContext): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      const aiService = AIServiceConfig.getInstance();
      const openai = aiService.getOpenAI();

      // Determine if JSON output is required based on request metadata
      const jsonMode = request.metadata?.jsonMode === true;

      const prompt = this.buildPrompt(request, context, jsonMode);

      const chatCompletionOptions: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
        model: this.config.model,
        messages: [
          { role: 'system', content: this.config.systemPrompt! },
          { role: 'user', content: prompt },
        ],
        temperature: this.config.temperature ?? null, // Explicitly set to null if undefined
        max_tokens: this.config.maxTokens ?? null, // Explicitly set to null if undefined
        stream: false, // Explicitly set to false for non-streaming response
      };

      if (jsonMode) {
        chatCompletionOptions.response_format = { type: "json_object" };
      }

      const response: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create(chatCompletionOptions);

      const content = response.choices[0]?.message?.content || '';
      const usage = response.usage;

      return {
        id: this.generateResponseId(),
        agentType: this.agentType,
        provider: this.config.provider,
        content,
        confidence: this.calculateTutorConfidence(content, request.metadata),
        metadata: {
          subject: request.metadata?.subject,
          level: request.metadata?.level,
          explanation_type: this.detectExplanationType(content),
          learning_approach: this.detectLearningApproach(content),
        },
        usage: {
          inputTokens: usage?.prompt_tokens ?? 0, // Provide default 0 for undefined
          outputTokens: usage?.completion_tokens ?? 0, // Provide default 0 for undefined
          totalTokens: usage?.total_tokens ?? 0, // Provide default 0 for undefined
          cost: this.calculateCost(usage?.total_tokens || 0),
        },
        timestamp: new Date(),
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error('TutorAgent error:', error);
      return this.handleFallback(request, context, startTime);
    }
  }

  protected buildPrompt(request: AIRequest, context?: ConversationContext, jsonMode: boolean = false): string {
    let prompt = `Student Question: ${request.prompt}\n\n`;

    if (request.metadata?.subject) {
      prompt += `Subject: ${request.metadata.subject}\n`;
    }

    if (request.metadata?.level) {
      prompt += `Academic Level: ${request.metadata.level}\n`;
    }

    if (request.metadata?.language && request.metadata.language !== 'english') {
      prompt += `Preferred Language: ${request.metadata.language}\n`;
    }

    if (context?.metadata?.learningObjectives) {
      prompt += `Learning Objectives: ${context.metadata.learningObjectives.join(', ')}\n`;
    }

    if (context?.history && context.history.length > 0) {
      prompt += `\nPrevious Conversation:\n`;
      context.history.slice(-3).forEach((msg, index) => {
        prompt += `${msg.role}: ${msg.content}\n`;
      });
    }

    if (jsonMode) {
      prompt += `\nYour response MUST be a valid JSON object matching the structure requested by the user. Do NOT include any conversational text or markdown outside the JSON.`;
    } else {
      prompt += `\nPlease provide a clear, step-by-step explanation that helps the student understand the concept. Use examples relevant to Indian context when applicable.`;
    }

    return prompt;
  }

  private calculateTutorConfidence(content: string, metadata?: Record<string, any>): number {
    let confidence = 0.6;

    // Check for educational indicators
    if (content.includes('step') || content.includes('first') || content.includes('next'))
      confidence += 0.15;
    if (content.includes('example') || content.includes('for instance')) confidence += 0.1;
    if (content.includes('understand') || content.includes('concept')) confidence += 0.1;
    if (content.length > 200) confidence += 0.05;

    // Subject-specific confidence
    if (metadata?.subject) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  private detectExplanationType(content: string): string {
    if (content.includes('step') && content.includes('solve')) return 'problem_solving';
    if (content.includes('concept') || content.includes('theory')) return 'conceptual';
    if (content.includes('example') || content.includes('practice')) return 'practical';
    if (content.includes('formula') || content.includes('equation')) return 'mathematical';
    return 'general';
  }

  private detectLearningApproach(content: string): string {
    if (content.includes('visual') || content.includes('diagram')) return 'visual';
    if (content.includes('practice') || content.includes('exercise')) return 'kinesthetic';
    if (content.includes('listen') || content.includes('repeat')) return 'auditory';
    if (content.includes('read') || content.includes('text')) return 'reading';
    return 'mixed';
  }

  private calculateCost(totalTokens: number): number {
    // GPT-4 pricing: $0.03 per 1K input tokens, $0.06 per 1K output tokens
    // Simplified calculation assuming 50/50 split
    return (totalTokens / 1000) * 0.045;
  }

  private async handleFallback(
    request: AIRequest,
    context?: ConversationContext,
    startTime: number
  ): Promise<AIResponse> {
    try {
      const aiService = AIServiceConfig.getInstance();
      const gemini = aiService.getGemini();
      const model = gemini.getGenerativeModel({ model: 'gemini-pro' });

      // Pass jsonMode as false for fallback, as Gemini might not support response_format directly
      const prompt = this.buildPrompt(request, context, false);
      const result = await model.generateContent(prompt);
      const content = result.response.text();

      return {
        id: this.generateResponseId(),
        agentType: this.agentType,
        provider: AIProvider.GEMINI,
        content,
        confidence: this.calculateTutorConfidence(content, request.metadata) * 0.9, // Slightly lower for fallback
        metadata: {
          fallback: true,
          originalProvider: this.config.provider,
        },
        timestamp: new Date(),
        processingTime: Date.now() - startTime,
      };
    } catch (fallbackError) {
      console.error('TutorAgent fallback error:', fallbackError);
      return {
        id: this.generateResponseId(),
        agentType: this.agentType,
        provider: this.config.provider,
        content:
          "I apologize, but I'm currently experiencing technical difficulties. Please try again in a moment.",
        confidence: 0.1,
        metadata: { error: true },
        timestamp: new Date(),
        processingTime: Date.now() - startTime,
      };
    }
  }
}
