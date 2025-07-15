import {
  BaseAIAgent,
  AIRequest,
  AIResponse,
  ConversationContext,
  AgentType,
  AIProvider,
} from '../types/ai-agent';
import AIServiceConfig from '../config/ai-services';

interface AnalyticsMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  interpretation: string;
}

interface LearningInsight {
  category: string;
  insight: string;
  evidence: string[];
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
}

interface RecommendationAction {
  type: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  timeframe: string;
  resources: string[];
}

export class AnalyticsAgent extends BaseAIAgent {
  private analyticsFrameworks: Map<string, any>;
  private performanceIndicators: Map<string, AnalyticsMetric[]>;
  private insightTemplates: Map<string, LearningInsight[]>;

  constructor() {
    super(AgentType.ANALYTICS, {
      provider: AIProvider.OPENAI,
      model: 'gpt-4',
      temperature: 0.2, // Very low temperature for consistent analytics
      maxTokens: 3000,
      fallbackProvider: AIProvider.GEMINI,
      systemPrompt: `You are an expert learning analytics specialist for Indian education with deep expertise in:

📊 LEARNING ANALYTICS:
- Educational data mining and pattern recognition
- Predictive modeling for academic success
- Learning path optimization and personalization
- Competency-based progression tracking
- Multimodal learning analytics (text, video, interaction)

🧠 COGNITIVE ANALYTICS:
- Learning style identification and adaptation
- Metacognitive skill assessment
- Cognitive load analysis and optimization
- Knowledge gap identification and remediation
- Transfer learning and retention analysis

🇮🇳 INDIAN EDUCATION CONTEXT:
- CBSE/ICSE/State board performance standards
- Regional learning pattern variations
- Multilingual learning analytics
- Cultural factors in academic performance
- Competitive exam preparation analytics (JEE, NEET, etc.)

📈 PERFORMANCE MEASUREMENT:
- Learning outcome achievement tracking
- Skill development progression analysis
- Engagement and motivation metrics
- Collaborative learning effectiveness
- Assessment validity and reliability analysis

🎯 ACTIONABLE INSIGHTS:
- Evidence-based intervention recommendations
- Personalized learning pathway suggestions
- Teacher professional development insights
- Parent engagement strategies
- Institutional improvement recommendations

Your analytics approach follows these principles:
1. Use multiple data sources for comprehensive analysis
2. Apply statistical rigor and educational research principles
3. Provide culturally relevant and contextual insights
4. Generate actionable, evidence-based recommendations
5. Respect student privacy and ethical data use
6. Support inclusive and equitable learning outcomes
7. Bridge research and practice with practical solutions
8. Enable data-driven decision making at all levels

Always provide scientifically grounded, ethically sound, and practically useful learning analytics.`,
      rateLimiting: {
        requestsPerMinute: 15,
        requestsPerHour: 200,
      },
    });
    
    this.initializeAnalyticsFrameworks();
    this.initializePerformanceIndicators();
    this.initializeInsightTemplates();
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
        confidence: this.calculateAnalyticsConfidence(content, request.metadata),
        metadata: {
          analysisType: this.detectAnalysisType(content),
          insights: this.extractInsights(content),
          recommendations: this.extractRecommendations(content),
          metrics: this.extractMetrics(content),
          patterns: this.identifyPatterns(content),
          predictions: this.extractPredictions(content),
          stakeholders: this.identifyStakeholders(content),
          dataQuality: this.assessDataQuality(content),
          actionabilityScore: this.calculateActionabilityScore(content),
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
    const analysisType = this.detectRequestedAnalysisType(request.prompt);
    const framework = this.analyticsFrameworks.get(analysisType);
    const indicators = this.performanceIndicators.get(analysisType);
    
    let prompt = `📊 LEARNING ANALYTICS REQUEST\n`;
    prompt += `Request: ${request.prompt}\n\n`;

    // Context Information
    prompt += `📋 ANALYTICS CONTEXT:\n`;
    if (request.metadata?.student_id) {
      prompt += `Student ID: ${request.metadata.student_id}\n`;
    }
    if (request.metadata?.timeframe) {
      prompt += `Analysis Timeframe: ${request.metadata.timeframe}\n`;
    }
    if (request.metadata?.subject) {
      prompt += `Subject Focus: ${request.metadata.subject}\n`;
    }
    if (request.metadata?.level) {
      prompt += `Academic Level: ${request.metadata.level}\n`;
    }
    if (request.metadata?.board) {
      prompt += `Curriculum Board: ${request.metadata.board}\n`;
    }

    // Data Sources
    if (request.metadata?.data_sources) {
      prompt += `\n📊 AVAILABLE DATA SOURCES:\n`;
      request.metadata.data_sources.forEach((source: string) => {
        prompt += `• ${source}\n`;
      });
    }

    // Analytics Framework
    if (framework) {
      prompt += `\n🔬 ANALYTICS FRAMEWORK (${analysisType.toUpperCase()}):\n`;
      prompt += `Methodology: ${framework.methodology}\n`;
      prompt += `Key Metrics: ${framework.metrics.join(', ')}\n`;
      prompt += `Analysis Dimensions: ${framework.dimensions.join(', ')}\n`;
    }

    // Performance Indicators
    if (indicators) {
      prompt += `\n📈 KEY PERFORMANCE INDICATORS:\n`;
      indicators.forEach((indicator, index) => {
        prompt += `${index + 1}. ${indicator.name} (${indicator.unit})\n`;
        prompt += `   Current: ${indicator.value}, Trend: ${indicator.trend}\n`;
        prompt += `   Meaning: ${indicator.interpretation}\n`;
      });
    }

    // Analytics Requirements
    prompt += `\n✅ ANALYTICS REQUIREMENTS:\n`;
    prompt += `1. 📊 Provide quantitative metrics with statistical significance\n`;
    prompt += `2. 🧠 Include qualitative insights and interpretations\n`;
    prompt += `3. 📈 Show trends, patterns, and comparative analysis\n`;
    prompt += `4. 🎯 Identify specific learning gaps and strengths\n`;
    prompt += `5. 💡 Generate actionable, evidence-based recommendations\n`;
    prompt += `6. 🇮🇳 Consider Indian educational context and standards\n`;
    prompt += `7. 👥 Provide peer comparison and benchmark analysis\n`;
    prompt += `8. 🔮 Include predictive insights where appropriate\n`;
    prompt += `9. 📋 Structure findings for different stakeholders\n`;
    prompt += `10. 🛡️ Ensure ethical and privacy-conscious analysis\n\n`;

    // Previous Context
    if (context?.history && context.history.length > 0) {
      prompt += `📚 PREVIOUS ANALYTICS CONTEXT:\n`;
      context.history.slice(-2).forEach((msg) => {
        prompt += `${msg.role.toUpperCase()}: ${msg.content.substring(0, 150)}...\n`;
      });
      prompt += `\n`;
    }

    prompt += `Conduct comprehensive learning analytics that provides deep insights and actionable recommendations for improving educational outcomes.`;

    return prompt;
  }

  private calculateAnalyticsConfidence(content: string, metadata?: Record<string, any>): number {
    let confidence = 0.5;

    // Statistical rigor indicators
    const statisticalIndicators = [
      /statistical significance|p-value|confidence interval/i,
      /correlation|regression|analysis/i,
      /sample size|data points|observations/i,
      /variance|standard deviation|mean/i,
      /trend analysis|time series/i
    ];
    
    statisticalIndicators.forEach(indicator => {
      if (indicator.test(content)) confidence += 0.08;
    });

    // Analytics quality indicators
    const qualityIndicators = [
      /learning analytics|educational data/i,
      /performance metrics|kpi|indicators/i,
      /benchmark|comparison|baseline/i,
      /prediction|forecast|projection/i,
      /pattern|trend|correlation/i,
      /insight|finding|discovery/i
    ];
    
    qualityIndicators.forEach(indicator => {
      if (indicator.test(content)) confidence += 0.06;
    });

    // Actionability indicators
    const actionabilityIndicators = [
      /recommendation|suggest|should/i,
      /intervention|strategy|approach/i,
      /next steps|action plan/i,
      /improve|enhance|optimize/i
    ];
    
    actionabilityIndicators.forEach(indicator => {
      if (indicator.test(content)) confidence += 0.05;
    });

    // Data comprehensiveness
    if (content.length > 1500) confidence += 0.1;
    if (content.split('\n').length > 25) confidence += 0.08;

    // Metadata quality
    if (metadata?.timeframe) confidence += 0.04;
    if (metadata?.data_sources && metadata.data_sources.length > 2) confidence += 0.06;

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
    lines.forEach((line) => {
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
    lines.forEach((line) => {
      if (line.includes('recommend') || line.includes('suggest')) {
        recommendations.push(line.trim());
      }
    });
    return recommendations;
  }

  private calculateCost(totalTokens: number): number {
    return (totalTokens / 1000) * 0.045;
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
      content: 'Analytics service temporarily unavailable.',
      confidence: 0.1,
      metadata: { error: true },
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  // Initialization Methods
  private initializeAnalyticsFrameworks(): void {
    this.analyticsFrameworks = new Map();
    
    this.analyticsFrameworks.set('performance', {
      methodology: 'Multi-dimensional Performance Analysis',
      metrics: ['Academic Achievement', 'Skill Development', 'Engagement Level', 'Progress Rate'],
      dimensions: ['Cognitive', 'Behavioral', 'Affective', 'Social']
    });

    this.analyticsFrameworks.set('learning_path', {
      methodology: 'Adaptive Learning Path Analytics',
      metrics: ['Completion Rate', 'Time Efficiency', 'Mastery Level', 'Retention Rate'],
      dimensions: ['Content Mastery', 'Learning Velocity', 'Difficulty Progression', 'Knowledge Transfer']
    });

    this.analyticsFrameworks.set('engagement', {
      methodology: 'Multi-modal Engagement Analysis',
      metrics: ['Attention Duration', 'Interaction Frequency', 'Content Preference', 'Participation Quality'],
      dimensions: ['Cognitive Engagement', 'Behavioral Engagement', 'Emotional Engagement', 'Social Engagement']
    });

    this.analyticsFrameworks.set('predictive', {
      methodology: 'Predictive Learning Analytics',
      metrics: ['Success Probability', 'Risk Indicators', 'Intervention Points', 'Outcome Forecasts'],
      dimensions: ['Academic Trajectory', 'Skill Development', 'Motivation Trends', 'Support Needs']
    });
  }

  private initializePerformanceIndicators(): void {
    this.performanceIndicators = new Map();
    
    this.performanceIndicators.set('academic', [
      {
        name: 'Overall Academic Performance',
        value: 85,
        unit: 'percentage',
        trend: 'up',
        interpretation: 'Strong performance with consistent improvement'
      },
      {
        name: 'Subject Mastery Rate',
        value: 78,
        unit: 'percentage',
        trend: 'stable',
        interpretation: 'Good conceptual understanding with room for improvement'
      },
      {
        name: 'Assessment Success Rate',
        value: 92,
        unit: 'percentage',
        trend: 'up',
        interpretation: 'Excellent test performance indicating effective preparation'
      }
    ]);

    this.performanceIndicators.set('engagement', [
      {
        name: 'Learning Session Duration',
        value: 45,
        unit: 'minutes',
        trend: 'up',
        interpretation: 'Increasing attention span and focus during study sessions'
      },
      {
        name: 'Content Interaction Rate',
        value: 68,
        unit: 'percentage',
        trend: 'stable',
        interpretation: 'Moderate engagement with learning materials'
      },
      {
        name: 'Discussion Participation',
        value: 35,
        unit: 'posts per week',
        trend: 'down',
        interpretation: 'Declining participation in collaborative activities'
      }
    ]);
  }

  private initializeInsightTemplates(): void {
    this.insightTemplates = new Map();
    
    this.insightTemplates.set('strength', [
      {
        category: 'Academic Strength',
        insight: 'Excellent performance in analytical subjects',
        evidence: ['High scores in mathematics', 'Strong problem-solving skills'],
        impact: 'high',
        actionable: true
      }
    ]);

    this.insightTemplates.set('improvement', [
      {
        category: 'Learning Gap',
        insight: 'Conceptual understanding needs reinforcement',
        evidence: ['Lower scores in theory-based questions', 'Difficulty with abstract concepts'],
        impact: 'medium',
        actionable: true
      }
    ]);
  }

  // Analysis Methods
  private detectRequestedAnalysisType(prompt: string): string {
    const typeKeywords = {
      'performance': /performance|achievement|scores|grades/i,
      'engagement': /engagement|participation|interaction|activity/i,
      'learning_path': /learning path|progress|trajectory|journey/i,
      'predictive': /predict|forecast|risk|probability|future/i,
      'comparative': /compare|benchmark|peer|cohort/i,
      'diagnostic': /diagnose|gap|weakness|strength|assessment/i
    };
    
    for (const [type, pattern] of Object.entries(typeKeywords)) {
      if (pattern.test(prompt)) return type;
    }
    
    return 'performance';
  }

  private extractMetrics(content: string): AnalyticsMetric[] {
    const metrics: AnalyticsMetric[] = [];
    
    // Extract numerical values and their contexts
    const metricPatterns = [
      /(\d+(?:\.\d+)?)\s*%?\s*(percentage|percent|score|rate)/gi,
      /(\w+)\s*:\s*(\d+(?:\.\d+)?)\s*(%|points|minutes|hours)/gi
    ];
    
    metricPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match.length >= 3) {
          metrics.push({
            name: match[1] || 'Performance Metric',
            value: parseFloat(match[2] || match[1]),
            unit: match[3] || match[2] || 'units',
            trend: 'stable',
            interpretation: 'Extracted from analytics report'
          });
        }
      }
    });
    
    return metrics.slice(0, 10); // Limit to top 10 metrics
  }

  private identifyPatterns(content: string): string[] {
    const patterns = [];
    
    const patternIndicators = [
      /pattern|trend|correlation|relationship/i,
      /increasing|decreasing|improving|declining/i,
      /consistent|inconsistent|variable|stable/i,
      /cycle|seasonal|periodic|regular/i,
      /peak|valley|plateau|spike/i
    ];
    
    patternIndicators.forEach(indicator => {
      const matches = content.match(new RegExp(`[^.]*${indicator.source}[^.]*`, 'gi'));
      if (matches) {
        patterns.push(...matches.slice(0, 2));
      }
    });
    
    return patterns.slice(0, 8);
  }

  private extractPredictions(content: string): string[] {
    const predictions = [];
    
    const predictionIndicators = [
      /predict|forecast|expect|likely|probability/i,
      /will|should|may|might|projected/i,
      /future|upcoming|next|ahead|forward/i
    ];
    
    predictionIndicators.forEach(indicator => {
      const matches = content.match(new RegExp(`[^.]*${indicator.source}[^.]*`, 'gi'));
      if (matches) {
        predictions.push(...matches.slice(0, 2));
      }
    });
    
    return predictions.slice(0, 5);
  }

  private identifyStakeholders(content: string): string[] {
    const stakeholders = [];
    
    const stakeholderKeywords = [
      'student', 'teacher', 'parent', 'administrator', 'counselor',
      'tutor', 'mentor', 'peer', 'instructor', 'guardian'
    ];
    
    stakeholderKeywords.forEach(keyword => {
      if (new RegExp(keyword, 'i').test(content)) {
        stakeholders.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
      }
    });
    
    return [...new Set(stakeholders)];
  }

  private assessDataQuality(content: string): number {
    let quality = 0.5;
    
    const qualityIndicators = [
      /large sample|significant data|comprehensive analysis/i,
      /multiple sources|diverse data|triangulation/i,
      /validated|verified|reliable|accurate/i,
      /longitudinal|time series|historical/i,
      /statistical significance|confidence/i
    ];
    
    qualityIndicators.forEach(indicator => {
      if (indicator.test(content)) quality += 0.1;
    });
    
    return Math.min(quality, 1.0);
  }

  private calculateActionabilityScore(content: string): number {
    let score = 0;
    
    const actionabilityIndicators = [
      /specific|concrete|detailed/i,
      /recommend|suggest|should/i,
      /next steps|action plan|implementation/i,
      /timeline|deadline|schedule/i,
      /resources|support|tools/i,
      /measurable|trackable|observable/i
    ];
    
    actionabilityIndicators.forEach(indicator => {
      if (indicator.test(content)) score += 1;
    });
    
    return Math.min(score / actionabilityIndicators.length, 1.0);
  }
}
