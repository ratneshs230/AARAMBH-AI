import { BaseAIAgent, AIRequest, AIResponse, ConversationContext, AgentType, AIProvider } from '../types/ai-agent';
import AIServiceConfig from '../config/ai-services';

export class AssessmentAgent extends BaseAIAgent {
  constructor() {
    super(AgentType.ASSESSMENT, {
      provider: AIProvider.GEMINI,
      model: 'gemini-pro',
      temperature: 0.6,
      maxTokens: 1500,
      fallbackProvider: AIProvider.OPENAI,
      systemPrompt: `You are an expert assessment creator for Indian educational system. Your role is to:
1. Create comprehensive quizzes, tests, and assessments
2. Design questions for different difficulty levels and Bloom's taxonomy
3. Generate multiple choice, short answer, and essay questions
4. Create rubrics and evaluation criteria
5. Ensure questions align with Indian curriculum standards
6. Include adaptive questioning based on student performance
7. Create practice tests for competitive exams (JEE, NEET, UPSC, etc.)
8. Design formative and summative assessments

Always create fair, unbiased, and pedagogically sound assessments.`,
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
        confidence: this.calculateAssessmentConfidence(content, request.metadata),
        metadata: {
          assessmentType: this.detectAssessmentType(content),
          questionCount: this.countQuestions(content),
          difficulty: this.detectDifficulty(content),
          subject: request.metadata?.subject,
          level: request.metadata?.level,
          hasRubric: this.hasRubric(content),
        },
        usage: {
          // Gemini doesn't provide token usage in the same way
          totalTokens: this.estimateTokens(prompt + content),
          cost: this.calculateCost(this.estimateTokens(prompt + content)),
        },
        timestamp: new Date(),
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error('AssessmentAgent error:', error);
      return this.handleFallback(request, context, startTime);
    }
  }

  protected buildPrompt(request: AIRequest, context?: ConversationContext): string {
    let prompt = `Assessment Creation Request: ${request.prompt}\n\n`;
    
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
      prompt += `Learning Objectives to Assess:\n${context.metadata.learningObjectives.map(obj => `- ${obj}`).join('\n')}\n\n`;
    }
    
    prompt += `Requirements:
1. Create well-structured assessment questions
2. Include multiple question types (MCQ, short answer, essay)
3. Vary difficulty levels (easy, medium, hard)
4. Provide clear instructions and marking schemes
5. Include answer key or rubric where appropriate
6. Ensure questions test different cognitive levels
7. Make questions culturally appropriate for Indian students
8. Follow standard examination formats

Please create a comprehensive assessment that meets these requirements.`;
    
    return prompt;
  }

  private calculateAssessmentConfidence(content: string, metadata?: Record<string, any>): number {
    let confidence = 0.6;
    
    // Check for assessment structure
    if (content.includes('Question') || content.includes('Q.')) confidence += 0.15;
    if (content.includes('Answer') || content.includes('Ans')) confidence += 0.1;
    if (content.includes('marks') || content.includes('points')) confidence += 0.1;
    if (content.includes('rubric') || content.includes('criteria')) confidence += 0.1;
    
    // Question variety
    if (content.includes('MCQ') || content.includes('multiple choice')) confidence += 0.05;
    if (content.includes('essay') || content.includes('explain')) confidence += 0.05;
    
    return Math.min(confidence, 1.0);
  }

  private detectAssessmentType(content: string): string {
    if (content.includes('quiz') || content.includes('quick')) return 'quiz';
    if (content.includes('test') || content.includes('exam')) return 'test';
    if (content.includes('assignment') || content.includes('homework')) return 'assignment';
    if (content.includes('project') || content.includes('presentation')) return 'project';
    if (content.includes('practice') || content.includes('drill')) return 'practice';
    return 'general';
  }

  private countQuestions(content: string): number {
    const questionPatterns = [
      /Question \d+/gi,
      /Q\.\d+/gi,
      /\d+\./g,
      /\d+\)/g,
    ];
    
    let maxCount = 0;
    questionPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        maxCount = Math.max(maxCount, matches.length);
      }
    });
    
    return maxCount;
  }

  private detectDifficulty(content: string): string {
    const easyKeywords = ['basic', 'simple', 'fundamental', 'define', 'list'];
    const mediumKeywords = ['explain', 'analyze', 'compare', 'describe'];
    const hardKeywords = ['evaluate', 'synthesize', 'create', 'justify', 'critique'];
    
    let easyCount = 0, mediumCount = 0, hardCount = 0;
    
    const lowerContent = content.toLowerCase();
    easyKeywords.forEach(word => {
      if (lowerContent.includes(word)) easyCount++;
    });
    mediumKeywords.forEach(word => {
      if (lowerContent.includes(word)) mediumCount++;
    });
    hardKeywords.forEach(word => {
      if (lowerContent.includes(word)) hardCount++;
    });
    
    if (hardCount > mediumCount && hardCount > easyCount) return 'hard';
    if (mediumCount > easyCount) return 'medium';
    return 'easy';
  }

  private hasRubric(content: string): boolean {
    const rubricKeywords = ['rubric', 'criteria', 'marking scheme', 'evaluation', 'grading'];
    const lowerContent = content.toLowerCase();
    return rubricKeywords.some(keyword => lowerContent.includes(keyword));
  }

  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  private calculateCost(totalTokens: number): number {
    // Gemini Pro pricing: $0.0005 per 1K tokens
    return (totalTokens / 1000) * 0.0005;
  }

  private async handleFallback(request: AIRequest, context?: ConversationContext, startTime: number): Promise<AIResponse> {
    try {
      const aiService = AIServiceConfig.getInstance();
      const openai = aiService.getOpenAI();
      
      const prompt = this.buildPrompt(request, context);
      
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
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
        confidence: this.calculateAssessmentConfidence(content, request.metadata) * 0.9,
        metadata: {
          fallback: true,
          originalProvider: this.config.provider,
        },
        timestamp: new Date(),
        processingTime: Date.now() - startTime,
      };
    } catch (fallbackError) {
      console.error('AssessmentAgent fallback error:', fallbackError);
      return {
        id: this.generateResponseId(),
        agentType: this.agentType,
        provider: this.config.provider,
        content: 'I apologize, but I\'m currently unable to generate assessments. Please try again later.',
        confidence: 0.1,
        metadata: { error: true },
        timestamp: new Date(),
        processingTime: Date.now() - startTime,
      };
    }
  }
}