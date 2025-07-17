import { aiService } from './ai';
import type { CuriosityInsight, CuriosityRecommendation } from './curiosity';

export interface UserProfile {
  id: string;
  interests: string[];
  learningStyle: string;
  preferredDifficulty: string;
  completedTopics: string[];
  bookmarkedTopics: string[];
  searchHistory: string[];
  timeSpent: { [topicId: string]: number };
  ratings: { [topicId: string]: number };
}

export interface CuriosityContext {
  currentTopic?: string;
  recentlyViewed: string[];
  currentPath?: string;
  activeQuestions: string[];
  sessionDuration: number;
  todayActivity: string[];
}

export class CuriosityAIService {
  // Generate personalized topic recommendations using AI
  async generatePersonalizedRecommendations(
    userProfile: UserProfile,
    context: CuriosityContext,
    limit: number = 10
  ): Promise<CuriosityRecommendation[]> {
    try {
      const prompt = this.buildRecommendationPrompt(userProfile, context);

      const response = await aiService.askTutor(prompt, {
        subject: 'general',
        level: userProfile.preferredDifficulty,
      });

      console.log('AI Recommendation Response:', response);

      if (response.success && response.data && response.data.content) {
        return this.parseRecommendations(response.data.content, limit);
      }

      // Return fallback recommendations if AI service fails
      return this.getFallbackRecommendations(limit);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return this.getFallbackRecommendations(limit);
    }
  }

  // Generate curiosity insights based on user activity
  async generateCuriosityInsights(
    userProfile: UserProfile,
    context: CuriosityContext
  ): Promise<CuriosityInsight[]> {
    try {
      const prompt = this.buildInsightsPrompt(userProfile, context);

      const response = await aiService.askTutor(prompt, {
        subject: 'general',
        level: 'intermediate',
      });

      console.log('AI Insights Response:', response);

      if (response.success && response.data && response.data.content) {
        return this.parseInsights(response.data.content);
      }

      // Return fallback insights if AI service fails
      return this.getFallbackInsights();
    } catch (error) {
      console.error('Error generating insights:', error);
      return this.getFallbackInsights();
    }
  }

  // Generate discovery paths based on user interests
  async generateDiscoveryPath(
    startingTopic: string,
    userProfile: UserProfile,
    pathLength: number = 5
  ): Promise<{
    title: string;
    description: string;
    topics: string[];
    estimatedDuration: number;
  }> {
    try {
      const prompt = `
        Create a discovery learning path starting from "${startingTopic}".
        User interests: ${userProfile.interests.join(', ')}
        Preferred difficulty: ${userProfile.preferredDifficulty}
        Learning style: ${userProfile.learningStyle}
        Path length: ${pathLength} topics
        
        Generate a progressive learning path that builds knowledge step by step.
        Return a structured path with:
        - Path title
        - Description
        - List of ${pathLength} topics in logical order
        - Estimated total duration in minutes
        
        Format your response as JSON with fields: title, description, topics, estimatedDuration
      `;

      const response = await aiService.askTutor(prompt, {
        subject: 'general',
        level: userProfile.preferredDifficulty,
      });

      if (response.success) {
        return this.parseDiscoveryPath(response.data.content);
      }

      return {
        title: `Exploring ${startingTopic}`,
        description: `A discovery path starting from ${startingTopic}`,
        topics: [startingTopic],
        estimatedDuration: 30,
      };
    } catch (error) {
      console.error('Error generating discovery path:', error);
      return {
        title: `Exploring ${startingTopic}`,
        description: `A discovery path starting from ${startingTopic}`,
        topics: [startingTopic],
        estimatedDuration: 30,
      };
    }
  }

  // Generate follow-up questions based on a topic
  async generateFollowUpQuestions(
    topicId: string,
    userProfile: UserProfile,
    count: number = 3
  ): Promise<string[]> {
    try {
      const prompt = `
        Generate ${count} thought-provoking follow-up questions about the topic "${topicId}".
        User level: ${userProfile.preferredDifficulty}
        User interests: ${userProfile.interests.join(', ')}
        
        Create questions that:
        - Encourage deeper thinking
        - Connect to broader concepts
        - Spark genuine curiosity
        - Are appropriate for ${userProfile.preferredDifficulty} level
        
        Return only the questions, one per line.
      `;

      const response = await aiService.askTutor(prompt, {
        subject: 'general',
        level: userProfile.preferredDifficulty,
      });

      if (response.success) {
        return response.data.content
          .split('\n')
          .filter(q => q.trim())
          .slice(0, count);
      }

      return [];
    } catch (error) {
      console.error('Error generating follow-up questions:', error);
      return [];
    }
  }

  // Analyze learning patterns and suggest optimizations
  async analyzeLearningPatterns(
    userProfile: UserProfile,
    context: CuriosityContext
  ): Promise<{
    patterns: string[];
    suggestions: string[];
    strengths: string[];
    improvements: string[];
  }> {
    try {
      const prompt = `
        Analyze the learning patterns of a user based on their activity:
        
        Interests: ${userProfile.interests.join(', ')}
        Learning Style: ${userProfile.learningStyle}
        Completed Topics: ${userProfile.completedTopics.length}
        Bookmarked Topics: ${userProfile.bookmarkedTopics.length}
        Recent Activity: ${context.recentlyViewed.join(', ')}
        Session Duration: ${context.sessionDuration} minutes
        
        Provide analysis including:
        - Identified learning patterns
        - Personalized suggestions for improvement
        - Learning strengths
        - Areas for improvement
        
        Format as JSON with fields: patterns, suggestions, strengths, improvements
      `;

      const response = await aiService.askTutor(prompt, {
        subject: 'general',
        level: 'intermediate',
      });

      if (response.success) {
        return this.parseLearningAnalysis(response.data.content);
      }

      return {
        patterns: [],
        suggestions: [],
        strengths: [],
        improvements: [],
      };
    } catch (error) {
      console.error('Error analyzing learning patterns:', error);
      return {
        patterns: [],
        suggestions: [],
        strengths: [],
        improvements: [],
      };
    }
  }

  // Generate curiosity challenges
  async generateCuriosityChallenge(
    userProfile: UserProfile,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<{
    title: string;
    description: string;
    tasks: string[];
    expectedDuration: number;
    rewards: string[];
  }> {
    try {
      const prompt = `
        Create a curiosity challenge for a user with these preferences:
        Interests: ${userProfile.interests.join(', ')}
        Difficulty: ${difficulty}
        Learning Style: ${userProfile.learningStyle}
        
        Generate a weekly curiosity challenge that includes:
        - Engaging title
        - Clear description
        - List of 5-7 specific tasks
        - Expected time to complete
        - Rewards/achievements
        
        Format as JSON with fields: title, description, tasks, expectedDuration, rewards
      `;

      const response = await aiService.askTutor(prompt, {
        subject: 'general',
        level: difficulty,
      });

      if (response.success) {
        return this.parseCuriosityChallenge(response.data.content);
      }

      return {
        title: 'Weekly Curiosity Challenge',
        description: 'Explore new topics and expand your knowledge',
        tasks: ['Explore a new topic', 'Ask a question', 'Share a discovery'],
        expectedDuration: 120,
        rewards: ['Curious Explorer Badge'],
      };
    } catch (error) {
      console.error('Error generating curiosity challenge:', error);
      return {
        title: 'Weekly Curiosity Challenge',
        description: 'Explore new topics and expand your knowledge',
        tasks: ['Explore a new topic', 'Ask a question', 'Share a discovery'],
        expectedDuration: 120,
        rewards: ['Curious Explorer Badge'],
      };
    }
  }

  // Private helper methods
  private buildRecommendationPrompt(userProfile: UserProfile, context: CuriosityContext): string {
    return `
      Generate personalized topic recommendations for a learner with these characteristics:
      
      User Profile:
      - Interests: ${userProfile.interests.join(', ')}
      - Learning Style: ${userProfile.learningStyle}
      - Preferred Difficulty: ${userProfile.preferredDifficulty}
      - Completed Topics: ${userProfile.completedTopics.length}
      - Recent Activity: ${context.recentlyViewed.join(', ')}
      
      Context:
      - Current Topic: ${context.currentTopic || 'None'}
      - Session Duration: ${context.sessionDuration} minutes
      - Active Questions: ${context.activeQuestions.length}
      
      Generate 10 diverse topic recommendations that:
      1. Match the user's interests and learning style
      2. Are appropriate for their difficulty level
      3. Build on their recent activity
      4. Introduce new perspectives
      5. Encourage deeper exploration
      
      For each recommendation, provide:
      - Title
      - Brief description
      - Relevance reason
      - Estimated time to explore
      - Difficulty level
      
      Format as a structured list.
    `;
  }

  private buildInsightsPrompt(userProfile: UserProfile, context: CuriosityContext): string {
    return `
      Generate curiosity insights based on user activity:
      
      User Profile:
      - Interests: ${userProfile.interests.join(', ')}
      - Completed Topics: ${userProfile.completedTopics.length}
      - Learning Pattern: ${userProfile.learningStyle}
      - Recent Activity: ${context.recentlyViewed.join(', ')}
      
      Generate 3-5 insights including:
      1. Interesting facts related to their interests
      2. Connections between topics they've explored
      3. Thought-provoking questions
      4. New discoveries in their areas of interest
      
      Each insight should be:
      - Engaging and surprising
      - Relevant to their interests
      - Encourage further exploration
      - Include the type (fact, connection, question, discovery)
      
      Format as structured insights with type, content, and related topics.
    `;
  }

  private parseRecommendations(content: string, limit: number): CuriosityRecommendation[] {
    // Parse AI response and create recommendation objects
    const recommendations: CuriosityRecommendation[] = [];

    try {
      // Check if content is valid
      if (!content || typeof content !== 'string') {
        console.warn('Invalid content provided to parseRecommendations:', content);
        return [];
      }

      // Simple parsing logic - in production, this would be more sophisticated
      const lines = content.split('\n').filter(line => line.trim());

      for (let i = 0; i < Math.min(lines.length, limit); i++) {
        const line = lines[i];
        if (line.includes(':')) {
          const [title, ...descParts] = line.split(':');
          const description = descParts.join(':').trim();

          recommendations.push({
            id: `rec_${Date.now()}_${i}`,
            type: 'topic',
            title: title.trim(),
            description: description,
            relevanceScore: 0.8,
            reason: 'AI-generated based on your interests',
            relatedToTopics: [],
          });
        }
      }
    } catch (error) {
      console.error('Error parsing recommendations:', error);
    }

    return recommendations;
  }

  private parseInsights(content: string): CuriosityInsight[] {
    const insights: CuriosityInsight[] = [];

    try {
      // Check if content is valid
      if (!content || typeof content !== 'string') {
        console.warn('Invalid content provided to parseInsights:', content);
        return [];
      }

      const lines = content.split('\n').filter(line => line.trim());

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim()) {
          insights.push({
            id: `insight_${Date.now()}_${i}`,
            type: this.determineInsightType(line),
            content: line.trim(),
            relatedTopics: [],
            source: 'AI Analysis',
            timestamp: new Date().toISOString(),
            isNew: true,
          });
        }
      }
    } catch (error) {
      console.error('Error parsing insights:', error);
    }

    return insights;
  }

  private determineInsightType(content: string): 'fact' | 'connection' | 'question' | 'discovery' {
    if (content.includes('?')) return 'question';
    if (content.includes('connect') || content.includes('relate')) return 'connection';
    if (content.includes('discovered') || content.includes('found')) return 'discovery';
    return 'fact';
  }

  private parseDiscoveryPath(content: string): {
    title: string;
    description: string;
    topics: string[];
    estimatedDuration: number;
  } {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(content);
      return {
        title: parsed.title || 'Discovery Path',
        description: parsed.description || 'A learning journey',
        topics: parsed.topics || [],
        estimatedDuration: parsed.estimatedDuration || 60,
      };
    } catch {
      // Fallback to text parsing
      return {
        title: 'Custom Discovery Path',
        description: 'A personalized learning journey',
        topics: [],
        estimatedDuration: 60,
      };
    }
  }

  private parseLearningAnalysis(content: string): {
    patterns: string[];
    suggestions: string[];
    strengths: string[];
    improvements: string[];
  } {
    try {
      const parsed = JSON.parse(content);
      return {
        patterns: parsed.patterns || [],
        suggestions: parsed.suggestions || [],
        strengths: parsed.strengths || [],
        improvements: parsed.improvements || [],
      };
    } catch {
      return {
        patterns: [],
        suggestions: [],
        strengths: [],
        improvements: [],
      };
    }
  }

  private parseCuriosityChallenge(content: string): {
    title: string;
    description: string;
    tasks: string[];
    expectedDuration: number;
    rewards: string[];
  } {
    try {
      const parsed = JSON.parse(content);
      return {
        title: parsed.title || 'Curiosity Challenge',
        description: parsed.description || 'Explore and discover',
        tasks: parsed.tasks || [],
        expectedDuration: parsed.expectedDuration || 60,
        rewards: parsed.rewards || [],
      };
    } catch {
      return {
        title: 'Curiosity Challenge',
        description: 'Explore and discover',
        tasks: [],
        expectedDuration: 60,
        rewards: [],
      };
    }
  }

  // Fallback methods for when AI service is not available
  private getFallbackRecommendations(limit: number = 10): CuriosityRecommendation[] {
    const fallbackRecommendations: CuriosityRecommendation[] = [
      {
        id: 'fallback_rec_1',
        type: 'topic',
        title: 'The Science of Black Holes',
        description:
          'Explore the fascinating physics behind black holes and their role in the universe.',
        relevanceScore: 0.9,
        reason: 'Popular science topic',
        relatedToTopics: ['physics', 'astronomy', 'space'],
      },
      {
        id: 'fallback_rec_2',
        type: 'topic',
        title: 'Machine Learning Fundamentals',
        description: 'Understanding the basics of machine learning and artificial intelligence.',
        relevanceScore: 0.8,
        reason: 'Trending in technology',
        relatedToTopics: ['ai', 'computer-science', 'technology'],
      },
      {
        id: 'fallback_rec_3',
        type: 'topic',
        title: 'The Human Brain',
        description: 'Discover how the human brain works and processes information.',
        relevanceScore: 0.85,
        reason: 'Neuroscience insights',
        relatedToTopics: ['neuroscience', 'biology', 'psychology'],
      },
      {
        id: 'fallback_rec_4',
        type: 'topic',
        title: 'Climate Change Science',
        description: 'Understanding the science behind climate change and its global impact.',
        relevanceScore: 0.7,
        reason: 'Environmental awareness',
        relatedToTopics: ['environment', 'science', 'climate'],
      },
      {
        id: 'fallback_rec_5',
        type: 'topic',
        title: 'Quantum Computing Basics',
        description: 'An introduction to quantum computing and its potential applications.',
        relevanceScore: 0.75,
        reason: 'Emerging technology',
        relatedToTopics: ['quantum-physics', 'computing', 'technology'],
      },
    ];

    return fallbackRecommendations.slice(0, limit);
  }

  private getFallbackInsights(): CuriosityInsight[] {
    return [
      {
        id: 'fallback_insight_1',
        type: 'fact',
        content:
          'Did you know? The human brain contains approximately 86 billion neurons, each forming thousands of connections.',
        relatedTopics: ['neuroscience', 'biology', 'brain'],
        source: 'Neuroscience Research',
        timestamp: new Date().toISOString(),
        isNew: true,
      },
      {
        id: 'fallback_insight_2',
        type: 'connection',
        content:
          'The study of artificial intelligence often draws inspiration from how the human brain processes information.',
        relatedTopics: ['ai', 'neuroscience', 'cognitive-science'],
        source: 'AI Research',
        timestamp: new Date().toISOString(),
        isNew: true,
      },
      {
        id: 'fallback_insight_3',
        type: 'question',
        content: 'What if we could harness the power of quantum mechanics for everyday computing?',
        relatedTopics: ['quantum-computing', 'physics', 'technology'],
        source: 'Quantum Research',
        timestamp: new Date().toISOString(),
        isNew: true,
      },
      {
        id: 'fallback_insight_4',
        type: 'discovery',
        content:
          'Recent discoveries in exoplanet research suggest that habitable worlds might be more common than we thought.',
        relatedTopics: ['astronomy', 'space', 'exoplanets'],
        source: 'Space Research',
        timestamp: new Date().toISOString(),
        isNew: true,
      },
    ];
  }
}

export const curiosityAIService = new CuriosityAIService();
export default curiosityAIService;
