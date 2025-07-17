import {
  BaseAIAgent,
  AIRequest,
  AIResponse,
  ConversationContext,
  AgentType,
  AIProvider,
} from '../types/ai-agent';
import AIServiceConfig from '../config/ai-services';

interface AssessmentTemplate {
  type: string;
  structure: string[];
  guidelines: string[];
  questionTypes: string[];
  bloomsLevels: string[];
}

interface AssessmentRubric {
  criteria: string;
  levels: { score: number; description: string }[];
  weightage: number;
}

export class AssessmentAgent extends BaseAIAgent {
  private assessmentTemplates: Map<string, AssessmentTemplate>;
  private rubricTemplates: Map<string, AssessmentRubric[]>;

  constructor() {
    super(AgentType.ASSESSMENT, {
      provider: AIProvider.GEMINI,
      model: 'gemini-pro',
      temperature: 0.3, // Lower temperature for consistency in assessments
      maxTokens: 2500,
      fallbackProvider: AIProvider.OPENAI,
      systemPrompt: `You are an expert educational assessment specialist for Indian students with expertise in:

🎯 ASSESSMENT DESIGN:
- Bloom's Taxonomy-based question creation
- Formative and summative assessment strategies
- Authentic and performance-based assessments
- Adaptive assessment techniques
- Multiple assessment formats (MCQ, Short answer, Essay, Practical)

📊 MEASUREMENT & EVALUATION:
- Learning outcome alignment
- Reliability and validity principles
- Item analysis and difficulty indexing
- Fair and unbiased assessment practices
- Rubric development and scoring guides

🇮🇳 INDIAN EDUCATION CONTEXT:
- CBSE/ICSE/State board assessment patterns
- Continuous and Comprehensive Evaluation (CCE)
- Competency-based assessment
- National Education Policy (NEP) 2020 guidelines
- Cultural sensitivity in assessment design

🧠 PSYCHOMETRIC PRINCIPLES:
- Constructive alignment
- Scaffolded assessment progression
- Differentiated assessment strategies
- Accommodations for diverse learners
- Error analysis and diagnostic feedback

Your assessment creation follows these principles:
1. Align assessments to specific learning objectives
2. Design for various cognitive levels (Bloom's taxonomy)
3. Ensure cultural fairness and accessibility
4. Provide clear rubrics and success criteria
5. Include both formative and summative elements
6. Create meaningful feedback mechanisms
7. Design for authentic application of knowledge
8. Support student self-assessment and reflection

Always create fair, valid, reliable, and educationally meaningful assessments.`,
      rateLimiting: {
        requestsPerMinute: 25,
        requestsPerHour: 400,
      },
    });

    this.initializeAssessmentTemplates();
    this.initializeRubricTemplates();
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
          questionTypes: this.identifyQuestionTypes(content),
          bloomsLevels: this.identifyBloomsLevels(content),
          difficultyLevel: this.assessDifficultyLevel(content),
          culturalSensitivity: this.assessCulturalSensitivity(content),
          rubricIncluded: this.checkRubricInclusion(content),
          formativeElements: this.identifyFormativeElements(content),
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
    const assessmentType = this.detectRequestedAssessmentType(request.prompt);
    const template = this.assessmentTemplates.get(assessmentType);
    const rubrics = this.rubricTemplates.get(assessmentType);

    let prompt = `🎯 ASSESSMENT CREATION REQUEST\n`;
    prompt += `Request: ${request.prompt}\n\n`;

    // Context Information
    prompt += `📋 CONTEXT:\n`;
    if (request.metadata?.subject) {
      prompt += `Subject: ${request.metadata.subject}\n`;
    }
    if (request.metadata?.level) {
      prompt += `Academic Level: ${request.metadata.level}\n`;
    }
    if (request.metadata?.topic) {
      prompt += `Topic/Chapter: ${request.metadata.topic}\n`;
    }
    if (request.metadata?.duration) {
      prompt += `Assessment Duration: ${request.metadata.duration}\n`;
    }
    if (request.metadata?.board) {
      prompt += `Curriculum Board: ${request.metadata.board}\n`;
    }
    if (request.metadata?.language) {
      prompt += `Language: ${request.metadata.language}\n`;
    }

    // Learning Objectives
    if (context?.metadata?.learningObjectives) {
      prompt += `\n🎯 LEARNING OBJECTIVES TO ASSESS:\n`;
      prompt += context.metadata.learningObjectives.map((obj) => `- ${obj}`).join('\n');
      prompt += `\n`;
    }

    // Assessment Template Structure
    if (template) {
      prompt += `\n📝 ASSESSMENT STRUCTURE (${assessmentType.toUpperCase()}):\n`;
      prompt += template.structure.map((item, index) => `${index + 1}. ${item}`).join('\n');
      prompt += `\n\n📚 ASSESSMENT GUIDELINES:\n`;
      prompt += template.guidelines.map((guideline) => `• ${guideline}`).join('\n');
      prompt += `\n\n❓ QUESTION TYPES TO INCLUDE:\n`;
      prompt += template.questionTypes.map((type) => `• ${type}`).join('\n');
      prompt += `\n\n🧠 BLOOM'S TAXONOMY LEVELS:\n`;
      prompt += template.bloomsLevels.map((level) => `• ${level}`).join('\n');
      prompt += `\n`;
    }

    // Rubric Information
    if (rubrics) {
      prompt += `\n📊 RUBRIC CRITERIA:\n`;
      rubrics.forEach((rubric, index) => {
        prompt += `${index + 1}. ${rubric.criteria} (Weight: ${rubric.weightage}%)\n`;
        rubric.levels.forEach((level) => {
          prompt += `   - Score ${level.score}: ${level.description}\n`;
        });
      });
      prompt += `\n`;
    }

    // Assessment Requirements
    prompt += `\n✅ ASSESSMENT REQUIREMENTS:\n`;
    prompt += `1. 🎯 Align questions to specific learning objectives\n`;
    prompt += `2. 🧠 Include multiple cognitive levels (Bloom's taxonomy)\n`;
    prompt += `3. 📏 Provide clear marking schemes and rubrics\n`;
    prompt += `4. 🇮🇳 Use Indian cultural context and examples\n`;
    prompt += `5. ♿ Ensure accessibility and fairness for diverse learners\n`;
    prompt += `6. 📊 Include both formative and summative elements\n`;
    prompt += `7. 🔍 Design for authentic assessment of understanding\n`;
    prompt += `8. 💬 Provide constructive feedback opportunities\n`;
    prompt += `9. 📈 Include self-assessment components where appropriate\n`;
    prompt += `10. 🎨 Use varied question formats and presentation styles\n\n`;

    // Previous Context
    if (context?.history && context.history.length > 0) {
      prompt += `📚 PREVIOUS CONVERSATION CONTEXT:\n`;
      context.history.slice(-2).forEach((msg) => {
        prompt += `${msg.role.toUpperCase()}: ${msg.content.substring(0, 150)}...\n`;
      });
      prompt += `\n`;
    }

    prompt += `Create a comprehensive, pedagogically sound assessment that measures student learning effectively and provides meaningful feedback for improvement.`;

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
    const questionPatterns = [/Question \d+/gi, /Q\.\d+/gi, /\d+\./g, /\d+\)/g];

    let maxCount = 0;
    questionPatterns.forEach((pattern) => {
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

    let easyCount = 0,
      mediumCount = 0,
      hardCount = 0;

    const lowerContent = content.toLowerCase();
    easyKeywords.forEach((word) => {
      if (lowerContent.includes(word)) easyCount++;
    });
    mediumKeywords.forEach((word) => {
      if (lowerContent.includes(word)) mediumCount++;
    });
    hardKeywords.forEach((word) => {
      if (lowerContent.includes(word)) hardCount++;
    });

    if (hardCount > mediumCount && hardCount > easyCount) return 'hard';
    if (mediumCount > easyCount) return 'medium';
    return 'easy';
  }

  private hasRubric(content: string): boolean {
    const rubricKeywords = ['rubric', 'criteria', 'marking scheme', 'evaluation', 'grading'];
    const lowerContent = content.toLowerCase();
    return rubricKeywords.some((keyword) => lowerContent.includes(keyword));
  }

  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  private calculateCost(totalTokens: number): number {
    // Gemini Pro pricing: $0.0005 per 1K tokens
    return (totalTokens / 1000) * 0.0005;
  }

  private async handleFallback(
    request: AIRequest,
    context?: ConversationContext,
    startTime: number
  ): Promise<AIResponse> {
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
        content:
          "I apologize, but I'm currently unable to generate assessments. Please try again later.",
        confidence: 0.1,
        metadata: { error: true },
        timestamp: new Date(),
        processingTime: Date.now() - startTime,
      };
    }
  }

  // Initialization Methods
  private initializeAssessmentTemplates(): void {
    this.assessmentTemplates = new Map();

    this.assessmentTemplates.set('quiz', {
      type: 'quiz',
      structure: [
        'Assessment Overview and Learning Objectives',
        'Instructions and Guidelines',
        'Multiple Choice Questions (MCQs)',
        'True/False Questions',
        'Fill-in-the-blanks',
        'Short Answer Questions',
        'Answer Key with Explanations',
        'Scoring Rubric',
        'Time Allocation Guide',
      ],
      guidelines: [
        'Keep questions clear and unambiguous',
        'Include distractors that test common misconceptions',
        'Vary difficulty levels across questions',
        'Ensure cultural appropriateness of examples',
        'Provide immediate feedback when possible',
        'Include reflection questions',
      ],
      questionTypes: ['Multiple Choice', 'True/False', 'Fill-in-blanks', 'Short Answer'],
      bloomsLevels: ['Remember', 'Understand', 'Apply'],
    });

    this.assessmentTemplates.set('test', {
      type: 'test',
      structure: [
        'Assessment Cover Page with Instructions',
        'Learning Objectives and Competencies',
        'Section A: Objective Questions (MCQ, T/F)',
        'Section B: Short Answer Questions',
        'Section C: Long Answer/Essay Questions',
        'Section D: Problem Solving/Application',
        'Detailed Marking Scheme',
        'Rubrics for Each Section',
        'Time Management Guidelines',
      ],
      guidelines: [
        'Balance different cognitive levels',
        'Include real-world application problems',
        'Provide choice in essay questions',
        'Ensure progressive difficulty',
        'Include scaffolding in complex questions',
        'Design for authentic assessment',
      ],
      questionTypes: ['Multiple Choice', 'Short Answer', 'Essay', 'Problem Solving', 'Case Study'],
      bloomsLevels: ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate'],
    });

    this.assessmentTemplates.set('assignment', {
      type: 'assignment',
      structure: [
        'Assignment Brief and Context',
        'Learning Outcomes and Assessment Criteria',
        'Task Description and Requirements',
        'Research Guidelines and Resources',
        'Submission Format and Timeline',
        'Assessment Rubric with Criteria',
        'Peer Review Component',
        'Self-Reflection Questions',
        'Extension Activities',
      ],
      guidelines: [
        'Design for authentic real-world application',
        'Include collaborative elements',
        'Provide scaffolding for complex tasks',
        'Allow for creative expression',
        'Include formative checkpoints',
        'Design for differentiated outcomes',
      ],
      questionTypes: [
        'Research Project',
        'Case Study',
        'Portfolio',
        'Presentation',
        'Creative Work',
      ],
      bloomsLevels: ['Apply', 'Analyze', 'Evaluate', 'Create'],
    });
  }

  private initializeRubricTemplates(): void {
    this.rubricTemplates = new Map();

    this.rubricTemplates.set('essay', [
      {
        criteria: 'Content Knowledge and Understanding',
        levels: [
          {
            score: 4,
            description: 'Demonstrates comprehensive understanding with detailed examples',
          },
          { score: 3, description: 'Shows good understanding with relevant examples' },
          { score: 2, description: 'Basic understanding with some gaps' },
          { score: 1, description: 'Limited understanding with significant gaps' },
        ],
        weightage: 40,
      },
      {
        criteria: 'Critical Thinking and Analysis',
        levels: [
          { score: 4, description: 'Excellent analysis with original insights' },
          { score: 3, description: 'Good analysis with some original thinking' },
          { score: 2, description: 'Basic analysis with limited depth' },
          { score: 1, description: 'Minimal analysis or original thought' },
        ],
        weightage: 30,
      },
      {
        criteria: 'Organization and Structure',
        levels: [
          { score: 4, description: 'Clear, logical structure with smooth transitions' },
          { score: 3, description: 'Well-organized with good flow' },
          { score: 2, description: 'Adequate organization with some issues' },
          { score: 1, description: 'Poor organization, difficult to follow' },
        ],
        weightage: 20,
      },
      {
        criteria: 'Language and Communication',
        levels: [
          { score: 4, description: 'Excellent language use, clear and engaging' },
          { score: 3, description: 'Good language use with minor errors' },
          { score: 2, description: 'Adequate communication with some errors' },
          { score: 1, description: 'Poor language use affecting clarity' },
        ],
        weightage: 10,
      },
    ]);
  }

  // Analysis Methods
  private detectRequestedAssessmentType(prompt: string): string {
    const typeKeywords = {
      quiz: /quiz|quick assessment|short test/i,
      test: /test|exam|examination/i,
      assignment: /assignment|project|task/i,
      rubric: /rubric|scoring guide|evaluation criteria/i,
      portfolio: /portfolio|collection|showcase/i,
      performance: /performance|practical|demonstration/i,
    };

    for (const [type, pattern] of Object.entries(typeKeywords)) {
      if (pattern.test(prompt)) return type;
    }

    return 'quiz';
  }

  private identifyQuestionTypes(content: string): string[] {
    const types = [];

    const typeIndicators = {
      'Multiple Choice': /multiple choice|mcq|choose the best/i,
      'True/False': /true.*false|t\/f|correct.*incorrect/i,
      'Short Answer': /short answer|brief|explain briefly/i,
      Essay: /essay|long answer|discuss|elaborate/i,
      'Fill-in-blanks': /fill.*blank|complete.*sentence/i,
      Matching: /match|pair|connect/i,
      'Problem Solving': /solve|calculate|find|determine/i,
      'Case Study': /case study|scenario|situation/i,
    };

    for (const [type, pattern] of Object.entries(typeIndicators)) {
      if (pattern.test(content)) {
        types.push(type);
      }
    }

    return types;
  }

  private identifyBloomsLevels(content: string): string[] {
    const levels = [];

    const bloomsIndicators = {
      Remember: /remember|recall|list|identify|define|describe|state/i,
      Understand: /understand|explain|interpret|summarize|classify|compare/i,
      Apply: /apply|demonstrate|solve|use|implement|show|calculate/i,
      Analyze: /analyze|examine|investigate|categorize|distinguish/i,
      Evaluate: /evaluate|assess|judge|critique|defend|justify|argue/i,
      Create: /create|design|develop|compose|construct|formulate|plan/i,
    };

    for (const [level, pattern] of Object.entries(bloomsIndicators)) {
      if (pattern.test(content)) {
        levels.push(level);
      }
    }

    return levels;
  }

  private assessDifficultyLevel(content: string): string {
    let complexity = 0;

    // Simple indicators
    if (/basic|simple|easy|recall|identify/i.test(content)) complexity += 1;

    // Moderate indicators
    if (/explain|understand|apply|demonstrate/i.test(content)) complexity += 2;

    // Complex indicators
    if (/analyze|evaluate|create|synthesize|critique/i.test(content)) complexity += 3;

    // Very complex indicators
    if (/design|formulate|compose|develop.*original/i.test(content)) complexity += 4;

    if (complexity <= 2) return 'Easy';
    if (complexity <= 4) return 'Moderate';
    if (complexity <= 6) return 'Challenging';
    return 'Advanced';
  }

  private assessCulturalSensitivity(content: string): number {
    let score = 0;

    const sensitivityIndicators = [
      /indian|india/i,
      /cultural|diverse|inclusive/i,
      /fair|equity|bias/i,
      /accommodat/i,
      /accessible/i,
      /multilingual/i,
    ];

    sensitivityIndicators.forEach((indicator) => {
      if (indicator.test(content)) score += 1;
    });

    return Math.min(score / sensitivityIndicators.length, 1.0);
  }

  private checkRubricInclusion(content: string): boolean {
    return /rubric|scoring|criteria|marking scheme|evaluation|grading/i.test(content);
  }

  private identifyFormativeElements(content: string): string[] {
    const elements = [];

    if (/feedback|comment|suggestion/i.test(content)) {
      elements.push('Feedback');
    }
    if (/self.assessment|self.evaluation/i.test(content)) {
      elements.push('Self-Assessment');
    }
    if (/peer review|peer evaluation/i.test(content)) {
      elements.push('Peer Review');
    }
    if (/reflection|think about/i.test(content)) {
      elements.push('Reflection');
    }
    if (/checkpoint|milestone|progress/i.test(content)) {
      elements.push('Progress Monitoring');
    }

    return elements;
  }
}
