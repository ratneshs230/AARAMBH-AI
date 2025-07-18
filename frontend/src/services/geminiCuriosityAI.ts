import type { ExplanationResult } from '@/pages/curiosity/CuriosityPlatformPage';

export interface GeminiConfig {
  apiUrl: string;
  timeout: number;
  retryAttempts: number;
}

export interface TeacherAgentOptions {
  subject?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  language?: string;
  jsonMode?: boolean;
}

export class GeminiCuriosityAIService {
  private config: GeminiConfig;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>;

  constructor(config?: Partial<GeminiConfig>) {
    this.config = {
      apiUrl: 'http://localhost:5000/api/ai',
      timeout: 30000,
      retryAttempts: 3,
      ...config,
    };
    this.cache = new Map();
  }

  // Generate comprehensive explanation using Teacher Agent with Gemini
  async generateStructuredExplanation(
    query: string,
    options: TeacherAgentOptions = {}
  ): Promise<ExplanationResult> {
    const {
      subject = 'general',
      level = 'intermediate',
      language = 'en',
      jsonMode = true,
    } = options;

    // Check cache first
    const cacheKey = `explanation_${query}_${subject}_${level}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log('📦 Using cached explanation for:', query);
      return cached;
    }

    try {
      console.log('🎓 Generating explanation with Gemini for:', query);
      console.log('📚 Options:', { subject, level, language, jsonMode });

      const response = await this.makeRequest('/tutor', {
        prompt: query,
        subject,
        level,
        language,
        jsonMode,
      });

      if (response.success && response.data?.content) {
        let result: ExplanationResult;

        if (jsonMode) {
          try {
            // Parse JSON response from Gemini
            const parsedContent = JSON.parse(response.data.content);
            
            // Validate and structure the response
            result = {
              title: parsedContent.title || `Understanding: ${query}`,
              summary: parsedContent.summary || '',
              keyPoints: Array.isArray(parsedContent.keyPoints) 
                ? parsedContent.keyPoints 
                : [],
              realWorldExample: parsedContent.realWorldExample || '',
              // Additional fields from Gemini response
              difficulty: parsedContent.difficulty || level,
              subject: parsedContent.subject || subject,
              connections: parsedContent.connections || [],
            };

            // Validate required fields
            if (!result.summary || !result.keyPoints.length || !result.realWorldExample) {
              throw new Error('Incomplete response from AI');
            }

          } catch (parseError) {
            console.warn('Failed to parse JSON response, using text parsing fallback:', parseError);
            result = this.parseTextToStructured(response.data.content, query);
          }
        } else {
          result = this.parseTextToStructured(response.data.content, query);
        }

        // Cache the result
        this.setCache(cacheKey, result, 30 * 60 * 1000); // 30 minutes TTL

        console.log('✅ Explanation generated successfully');
        return result;

      } else {
        throw new Error('Invalid response from AI service');
      }

    } catch (error) {
      console.error('❌ Failed to generate explanation:', error);
      return this.getFallbackExplanation(query, { subject, level });
    }
  }

  // Generate follow-up questions based on a topic
  async generateFollowUpQuestions(
    topic: string,
    count: number = 3,
    options: TeacherAgentOptions = {}
  ): Promise<string[]> {
    const cacheKey = `followup_${topic}_${count}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const prompt = `Generate ${count} thought-provoking follow-up questions about "${topic}" that encourage deeper exploration and curiosity. Make them engaging and appropriate for students.`;
      
      const response = await this.makeRequest('/tutor', {
        prompt,
        subject: options.subject || 'general',
        level: options.level || 'intermediate',
        jsonMode: false,
      });

      if (response.success && response.data?.content) {
        const questions = response.data.content
          .split('\n')
          .filter((line: string) => line.trim() && line.includes('?'))
          .map((q: string) => q.trim().replace(/^\d+\.\s*/, ''))
          .slice(0, count);

        this.setCache(cacheKey, questions, 60 * 60 * 1000); // 1 hour TTL
        return questions;
      }

      return this.getFallbackQuestions(topic, count);
    } catch (error) {
      console.error('Error generating follow-up questions:', error);
      return this.getFallbackQuestions(topic, count);
    }
  }

  // Generate educational image
  async generateEducationalImage(
    prompt: string,
    title?: string,
    description?: string,
    style: string = 'educational'
  ): Promise<{
    success: boolean;
    imageUrl?: string;
    provider?: string;
    cached?: boolean;
    error?: string;
  }> {
    try {
      console.log('🎨 Generating educational image for:', prompt);
      
      const response = await this.makeRequest('/generate-image', {
        prompt,
        title,
        description,
        style
      });

      if (response.success && response.data?.imageUrl) {
        console.log('✅ Image generated successfully with:', response.data.provider);
        return {
          success: true,
          imageUrl: response.data.imageUrl,
          provider: response.data.provider,
          cached: response.data.cached
        };
      } else {
        console.warn('❌ Image generation failed:', response.error);
        return {
          success: false,
          error: response.error || 'Image generation failed'
        };
      }
    } catch (error) {
      console.error('❌ Image generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Generate related topics for exploration
  async generateRelatedTopics(
    topic: string,
    count: number = 5,
    options: TeacherAgentOptions = {}
  ): Promise<string[]> {
    try {
      const prompt = `Based on "${topic}", suggest ${count} related topics that a curious learner might want to explore next. Focus on connections and interdisciplinary learning.`;
      
      const response = await this.makeRequest('/tutor', {
        prompt,
        subject: options.subject || 'general',
        level: options.level || 'intermediate',
        jsonMode: false,
      });

      if (response.success && response.data?.content) {
        const topics = response.data.content
          .split('\n')
          .filter((line: string) => line.trim())
          .map((topic: string) => topic.trim().replace(/^\d+\.\s*/, '').replace(/^[-•*]\s*/, ''))
          .slice(0, count);

        return topics;
      }

      return this.getFallbackRelatedTopics(topic, count);
    } catch (error) {
      console.error('Error generating related topics:', error);
      return this.getFallbackRelatedTopics(topic, count);
    }
  }

  // Check AI service health
  async checkHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: any;
    responseTime: number;
  }> {
    const startTime = Date.now();
    
    try {
      const response = await this.makeRequest('/health', {}, 'GET');
      const responseTime = Date.now() - startTime;

      return {
        status: response.data?.status || 'unknown',
        services: response.data?.services || {},
        responseTime,
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        services: {},
        responseTime: Date.now() - startTime,
      };
    }
  }

  // Private helper methods
  private async makeRequest(
    endpoint: string,
    data: any = {},
    method: 'GET' | 'POST' = 'POST'
  ): Promise<any> {
    const url = `${this.config.apiUrl}${endpoint}`;
    
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const options: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        };

        if (method === 'POST' && data) {
          options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();

      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        
        if (attempt === this.config.retryAttempts) {
          throw error;
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw new Error('All retry attempts failed');
  }

  private parseTextToStructured(content: string, query: string): ExplanationResult {
    const lines = content.split('\n').filter(line => line.trim());
    
    let title = `Understanding: ${query}`;
    let summary = '';
    let keyPoints: string[] = [];
    let realWorldExample = '';

    // Extract title if present
    if (lines.length > 0 && lines[0].length < 100) {
      title = lines[0].trim();
    }

    // Extract sections
    let currentSection = '';
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.toLowerCase().includes('summary') || 
          trimmedLine.toLowerCase().includes('explanation')) {
        currentSection = 'summary';
        continue;
      } else if (trimmedLine.toLowerCase().includes('key') || 
                 trimmedLine.toLowerCase().includes('point')) {
        currentSection = 'keyPoints';
        continue;
      } else if (trimmedLine.toLowerCase().includes('example')) {
        currentSection = 'example';
        continue;
      }

      // Process content based on current section
      if (trimmedLine.match(/^[-•*]\s/) || trimmedLine.match(/^\d+\.\s/)) {
        keyPoints.push(trimmedLine.replace(/^[-•*]\s/, '').replace(/^\d+\.\s/, ''));
      } else if (currentSection === 'example') {
        realWorldExample += (realWorldExample ? ' ' : '') + trimmedLine;
      } else if (currentSection === 'summary' || !summary) {
        summary += (summary ? ' ' : '') + trimmedLine;
      }
    }

    // Fallbacks
    if (!summary) {
      summary = content.substring(0, 200) + (content.length > 200 ? '...' : '');
    }
    
    if (keyPoints.length === 0) {
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
      keyPoints = sentences.slice(0, 4).map(s => s.trim());
    }
    
    if (!realWorldExample) {
      realWorldExample = `Think of ${query.toLowerCase()} as something you might encounter in everyday life - it's more relevant than you might think!`;
    }

    return {
      title: title || `Understanding ${query}`,
      summary: summary || `Here's what you need to know about ${query}.`,
      keyPoints: keyPoints.length > 0 ? keyPoints : [`${query} is an important concept to understand`],
      realWorldExample
    };
  }

  private getFallbackExplanation(query: string, options: TeacherAgentOptions): ExplanationResult {
    const { subject = 'general', level = 'intermediate' } = options;
    
    const fallbackContent = this.getFallbackContent(query.toLowerCase());
    
    return {
      title: fallbackContent.title,
      summary: fallbackContent.summary,
      keyPoints: fallbackContent.keyPoints,
      realWorldExample: fallbackContent.realWorldExample,
    };
  }

  private getFallbackContent(query: string) {
    const fallbacks: Record<string, any> = {
      'quantum entanglement': {
        title: "Quantum Entanglement",
        summary: "Quantum entanglement is a phenomenon where particles become connected and instantly affect each other, regardless of distance. Einstein called it 'spooky action at a distance.'",
        keyPoints: [
          "Two particles become quantum mechanically linked",
          "Measuring one particle instantly affects the other",
          "Works regardless of distance between particles",
          "Foundation for quantum computing and cryptography"
        ],
        realWorldExample: "Imagine two magical coins in Mumbai and Delhi - when one shows heads, the other instantly becomes tails, no matter the distance."
      },
      'black holes': {
        title: "Black Holes",
        summary: "Black holes are regions in space where gravity is so strong that nothing, not even light, can escape. They form when massive stars collapse.",
        keyPoints: [
          "Formed from collapsed massive stars",
          "Gravitational pull traps even light",
          "Have an event horizon - point of no return",
          "Can bend time and space around them"
        ],
        realWorldExample: "Think of a cosmic drain - everything gets pulled in and nothing can escape, like water going down a sink."
      },
      'photosynthesis': {
        title: "Photosynthesis",
        summary: "Photosynthesis is the process by which plants convert sunlight, carbon dioxide, and water into glucose and oxygen.",
        keyPoints: [
          "Plants use sunlight as energy source",
          "Carbon dioxide from air is absorbed",
          "Water is absorbed through roots",
          "Produces glucose for energy and oxygen as byproduct"
        ],
        realWorldExample: "Like a solar panel that also cooks food - plants capture sunlight and make their own food while producing the oxygen we breathe."
      }
    };

    return fallbacks[query] || {
      title: `Understanding: ${query}`,
      summary: `This topic covers important concepts related to ${query}. It involves multiple interconnected principles that help us understand this subject better.`,
      keyPoints: [
        `${query} is a fundamental concept in its field`,
        "Understanding requires grasping key principles",
        "Has practical applications in real life",
        "Connects to many other related topics"
      ],
      realWorldExample: `You can observe examples of ${query} in daily life around you. It's more common and relevant than you might think.`
    };
  }

  private getFallbackQuestions(topic: string, count: number): string[] {
    const genericQuestions = [
      `How does ${topic} affect our daily lives?`,
      `What would happen if ${topic} didn't exist?`,
      `How has our understanding of ${topic} changed over time?`,
      `What are the latest discoveries about ${topic}?`,
      `How is ${topic} connected to other scientific concepts?`
    ];

    return genericQuestions.slice(0, count);
  }

  private getFallbackRelatedTopics(topic: string, count: number): string[] {
    const genericTopics = [
      `History of ${topic}`,
      `Applications of ${topic}`,
      `Future of ${topic}`,
      `${topic} in technology`,
      `${topic} research methods`
    ];

    return genericTopics.slice(0, count);
  }

  // Cache management
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    // Clean up old cache entries
    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  // Clear cache
  public clearCache(): void {
    this.cache.clear();
  }
}

// Create singleton instance
export const geminiCuriosityAI = new GeminiCuriosityAIService();
export default geminiCuriosityAI;