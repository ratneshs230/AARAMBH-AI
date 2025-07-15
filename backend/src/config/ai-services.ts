import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

export class AIServiceConfig {
  private static instance: AIServiceConfig;
  private openaiClient: OpenAI | null = null;
  private geminiClient: GoogleGenerativeAI | null = null;
  private anthropicClient: Anthropic | null = null;

  private constructor() {}

  public static getInstance(): AIServiceConfig {
    if (!AIServiceConfig.instance) {
      AIServiceConfig.instance = new AIServiceConfig();
    }
    return AIServiceConfig.instance;
  }

  public async initializeOpenAI(): Promise<OpenAI> {
    if (!this.openaiClient) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API key not found in environment variables');
      }

      this.openaiClient = new OpenAI({
        apiKey: apiKey,
        timeout: 60000,
        maxRetries: 3,
      });

      console.log('✅ OpenAI client initialized successfully');
    }
    return this.openaiClient;
  }

  public async initializeGemini(): Promise<GoogleGenerativeAI> {
    if (!this.geminiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key not found in environment variables');
      }

      this.geminiClient = new GoogleGenerativeAI(apiKey);
      console.log('✅ Gemini client initialized successfully');
    }
    return this.geminiClient;
  }

  public async initializeAnthropic(): Promise<Anthropic> {
    if (!this.anthropicClient) {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error('Anthropic API key not found in environment variables');
      }

      this.anthropicClient = new Anthropic({
        apiKey: apiKey,
        timeout: 60000,
        maxRetries: 3,
      });

      console.log('✅ Anthropic client initialized successfully');
    }
    return this.anthropicClient;
  }

  public getOpenAI(): OpenAI {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized. Call initializeOpenAI() first.');
    }
    return this.openaiClient;
  }

  public getGemini(): GoogleGenerativeAI {
    if (!this.geminiClient) {
      throw new Error('Gemini client not initialized. Call initializeGemini() first.');
    }
    return this.geminiClient;
  }

  public getAnthropic(): Anthropic {
    if (!this.anthropicClient) {
      throw new Error('Anthropic client not initialized. Call initializeAnthropic() first.');
    }
    return this.anthropicClient;
  }

  public async healthCheck(): Promise<{
    openai: boolean;
    gemini: boolean;
    anthropic: boolean;
  }> {
    const health = {
      openai: false,
      gemini: false,
      anthropic: false,
    };

    try {
      if (this.openaiClient) {
        await this.openaiClient.models.list();
        health.openai = true;
      }
    } catch (error) {
      console.warn('OpenAI health check failed:', error);
    }

    try {
      if (this.geminiClient) {
        const model = this.geminiClient.getGenerativeModel({ model: 'gemini-pro' });
        await model.generateContent('test');
        health.gemini = true;
      }
    } catch (error) {
      console.warn('Gemini health check failed:', error);
    }

    try {
      if (this.anthropicClient) {
        await this.anthropicClient.messages.create({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'test' }],
        });
        health.anthropic = true;
      }
    } catch (error) {
      console.warn('Anthropic health check failed:', error);
    }

    return health;
  }
}

export default AIServiceConfig;