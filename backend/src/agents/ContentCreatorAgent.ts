import {
  BaseAIAgent,
  AIRequest,
  AIResponse,
  ConversationContext,
  AgentType,
  AIProvider,
} from '../types/ai-agent';
import AIServiceConfig from '../config/ai-services';

interface ContentTemplate {
  type: string;
  structure: string[];
  guidelines: string[];
  bloomsLevel: string[];
}

interface CurriculumAlignment {
  board: 'CBSE' | 'ICSE' | 'State';
  grade: string;
  subject: string;
  topics: string[];
  learningOutcomes: string[];
}

interface PedagogicalPrinciple {
  name: string;
  description: string;
  application: string[];
  bloomsLevel: string;
}

export class ContentCreatorAgent extends BaseAIAgent {
  private contentTemplates: Map<string, ContentTemplate>;
  private curriculumStandards: Map<string, CurriculumAlignment[]>;
  private pedagogicalPrinciples: PedagogicalPrinciple[];

  constructor() {
    super(AgentType.CONTENT_CREATOR, {
      provider: AIProvider.ANTHROPIC,
      model: 'claude-3-sonnet-20240229',
      temperature: 0.8,
      maxTokens: 2000,
      fallbackProvider: AIProvider.OPENAI,
      systemPrompt: `You are an expert educational content creator for Indian students with deep knowledge of:

🎯 PEDAGOGICAL EXPERTISE:
- Bloom's Taxonomy for cognitive development
- Multiple Intelligence Theory (Gardner)
- Constructivist learning principles
- Culturally Responsive Teaching
- Universal Design for Learning (UDL)

📚 CURRICULUM MASTERY:
- CBSE/ICSE/State board standards and competencies
- National Education Policy (NEP) 2020 guidelines
- Learning outcome frameworks
- Assessment and evaluation methodologies

🇮🇳 CULTURAL INTEGRATION:
- Indian educational context and values
- Regional examples and case studies
- Multilingual learning approaches
- Inclusive content for diverse backgrounds

Your content creation process follows these principles:
1. Analyze learning objectives using Bloom's taxonomy
2. Design scaffolded learning experiences
3. Integrate multiple modalities (visual, auditory, kinesthetic)
4. Ensure curriculum alignment and standards compliance
5. Include formative and summative assessment strategies
6. Incorporate real-world applications and cultural relevance
7. Provide differentiated instruction for diverse learners
8. Follow evidence-based educational practices

Always create pedagogically sound, engaging, and culturally relevant educational content.`,
      rateLimiting: {
        requestsPerMinute: 20,
        requestsPerHour: 300,
      },
    });

    this.initializeContentTemplates();
    this.initializeCurriculumStandards();
    this.initializePedagogicalPrinciples();
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
        messages: [{ role: 'user', content: prompt }],
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
          pedagogicalApproach: this.analyzePedagogicalApproach(content),
          bloomsLevels: this.identifyBloomsLevels(content),
          culturalRelevance: this.assessCulturalRelevance(content),
          assessmentIntegration: this.checkAssessmentIntegration(content),
          multimodalElements: this.identifyMultimodalElements(content),
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
    const contentType = this.detectRequestedContentType(request.prompt);
    const template = this.contentTemplates.get(contentType);
    const curriculumInfo = this.getCurriculumAlignment(request.metadata);

    let prompt = `🎯 CONTENT CREATION REQUEST\n`;
    prompt += `Request: ${request.prompt}\n\n`;

    // Context Information
    prompt += `📋 CONTEXT:\n`;
    if (request.metadata?.subject) {
      prompt += `Subject: ${request.metadata.subject}\n`;
    }
    if (request.metadata?.level) {
      prompt += `Academic Level: ${request.metadata.level}\n`;
    }
    if (request.metadata?.language) {
      prompt += `Language: ${request.metadata.language}\n`;
    }
    if (request.metadata?.board) {
      prompt += `Curriculum Board: ${request.metadata.board}\n`;
    }

    // Learning Objectives
    if (context?.metadata?.learningObjectives) {
      prompt += `\n🎯 LEARNING OBJECTIVES:\n`;
      prompt += context.metadata.learningObjectives.map((obj) => `- ${obj}`).join('\n');
      prompt += `\n`;
    }

    // Content Template Structure
    if (template) {
      prompt += `\n📐 CONTENT STRUCTURE (${contentType.toUpperCase()}):\n`;
      prompt += template.structure.map((item, index) => `${index + 1}. ${item}`).join('\n');
      prompt += `\n\n📚 PEDAGOGICAL GUIDELINES:\n`;
      prompt += template.guidelines.map((guideline) => `• ${guideline}`).join('\n');
      prompt += `\n\n🧠 BLOOM'S TAXONOMY LEVELS TO ADDRESS:\n`;
      prompt += template.bloomsLevel.map((level) => `• ${level}`).join('\n');
      prompt += `\n`;
    }

    // Curriculum Alignment
    if (curriculumInfo) {
      prompt += `\n📖 CURRICULUM ALIGNMENT (${curriculumInfo.board}):\n`;
      prompt += `Grade: ${curriculumInfo.grade}\n`;
      prompt += `Topics: ${curriculumInfo.topics.join(', ')}\n`;
      prompt += `Learning Outcomes: ${curriculumInfo.learningOutcomes.join(', ')}\n`;
    }

    // Content Requirements
    prompt += `\n✅ CONTENT REQUIREMENTS:\n`;
    prompt += `1. 🎯 Clear learning objectives mapped to Bloom's taxonomy\n`;
    prompt += `2. 🏗️ Scaffolded learning progression (simple to complex)\n`;
    prompt += `3. 🎨 Multiple learning modalities (visual, auditory, kinesthetic)\n`;
    prompt += `4. 🇮🇳 Indian cultural context and relevant examples\n`;
    prompt += `5. 📊 Formative and summative assessment strategies\n`;
    prompt += `6. 🔄 Interactive elements and student engagement\n`;
    prompt += `7. 📚 Curriculum standards alignment\n`;
    prompt += `8. 🌟 Differentiated instruction for diverse learners\n`;
    prompt += `9. 🔗 Real-world applications and connections\n`;
    prompt += `10. 📝 Clear structure with headings and organization\n\n`;

    // Previous Context
    if (context?.history && context.history.length > 0) {
      prompt += `📚 PREVIOUS CONVERSATION CONTEXT:\n`;
      context.history.slice(-2).forEach((msg) => {
        prompt += `${msg.role.toUpperCase()}: ${msg.content.substring(0, 200)}...\n`;
      });
      prompt += `\n`;
    }

    prompt += `Create comprehensive, pedagogically sound educational content that follows these specifications and enhances student learning through evidence-based practices.`;

    return prompt;
  }

  private calculateContentCreatorConfidence(
    content: string,
    metadata?: Record<string, any>
  ): number {
    let confidence = 0.5;

    // Educational structure indicators
    const structureIndicators = [
      /learning objectives?/i,
      /assessment/i,
      /activity|exercise/i,
      /bloom'?s taxonomy/i,
      /scaffolding/i,
      /differentiat/i,
    ];

    structureIndicators.forEach((indicator) => {
      if (indicator.test(content)) confidence += 0.08;
    });

    // Pedagogical quality indicators
    const pedagogicalIndicators = [
      /cognitive load/i,
      /prior knowledge/i,
      /formative assessment/i,
      /summative assessment/i,
      /multiple intelligence/i,
      /learning styles/i,
      /constructivist/i,
      /real-world application/i,
    ];

    pedagogicalIndicators.forEach((indicator) => {
      if (indicator.test(content)) confidence += 0.05;
    });

    // Cultural relevance
    const culturalIndicators = [
      /indian context/i,
      /cbse|icse/i,
      /hindi|regional language/i,
      /cultural/i,
      /local example/i,
    ];

    culturalIndicators.forEach((indicator) => {
      if (indicator.test(content)) confidence += 0.04;
    });

    // Content depth and structure
    if (content.length > 800) confidence += 0.1;
    if (content.split('\n').length > 15) confidence += 0.08;
    if (content.includes('#') || content.includes('**')) confidence += 0.05;

    // Subject-specific confidence boost
    if (metadata?.subject) confidence += 0.06;
    if (metadata?.level) confidence += 0.04;

    return Math.min(confidence, 1.0);
  }

  private detectContentType(content: string): string {
    const typeIndicators = {
      lesson_plan: /lesson plan|teaching plan|class plan/i,
      lesson: /lesson|chapter|unit/i,
      assessment: /quiz|test|exam|evaluation|assessment/i,
      activity: /activity|exercise|practice|worksheet/i,
      project: /project|assignment|investigation/i,
      explanation: /explanation|concept|theory|introduction/i,
      curriculum: /curriculum|syllabus|course outline/i,
      rubric: /rubric|grading|criteria|evaluation matrix/i,
      module: /module|course|program/i,
    };

    for (const [type, pattern] of Object.entries(typeIndicators)) {
      if (pattern.test(content)) return type;
    }

    return 'general';
  }

  private detectContentFormat(content: string): string {
    const formatIndicators = {
      multimedia: /video|audio|animation|multimedia|podcast/i,
      interactive: /interactive|simulation|virtual lab|gamification/i,
      visual: /diagram|chart|infographic|mind map|visual/i,
      structured_text: /#|\*\*|markdown|formatted/i,
      presentation: /slide|presentation|ppt|powerpoint/i,
      hands_on: /hands.?on|practical|experiment|lab/i,
      digital: /online|digital|e-learning|lms/i,
    };

    for (const [format, pattern] of Object.entries(formatIndicators)) {
      if (pattern.test(content)) return format;
    }

    return 'text';
  }

  private detectInteractivityLevel(content: string): string {
    let interactivity = 0;

    const interactivityIndicators = [
      /activity|exercise|practice/i,
      /discussion|group work|collaboration/i,
      /simulation|interactive|virtual/i,
      /project|hands.?on|experiment/i,
      /game|gamification|quiz/i,
      /peer review|feedback|reflection/i,
      /role.?play|case study|scenario/i,
      /create|design|build|construct/i,
    ];

    interactivityIndicators.forEach((indicator) => {
      if (indicator.test(content)) interactivity += 1;
    });

    if (interactivity >= 5) return 'very_high';
    if (interactivity >= 3) return 'high';
    if (interactivity >= 2) return 'medium';
    if (interactivity >= 1) return 'low';
    return 'passive';
  }

  private calculateCost(inputTokens: number, outputTokens: number): number {
    // Claude pricing: $0.003 per 1K input tokens, $0.015 per 1K output tokens
    return (inputTokens / 1000) * 0.003 + (outputTokens / 1000) * 0.015;
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
        content:
          "I apologize, but I'm currently unable to generate content. Please try again later.",
        confidence: 0.1,
        metadata: { error: true },
        timestamp: new Date(),
        processingTime: Date.now() - startTime,
      };
    }
  }

  // Initialization Methods
  private initializeContentTemplates(): void {
    this.contentTemplates = new Map();

    this.contentTemplates.set('lesson_plan', {
      type: 'lesson_plan',
      structure: [
        "Learning Objectives (aligned to Bloom's taxonomy)",
        'Prerequisites and Prior Knowledge Assessment',
        'Materials and Resources Required',
        'Lesson Introduction (Hook/Engagement)',
        'Direct Instruction with Scaffolding',
        'Guided Practice Activities',
        'Independent Practice/Application',
        'Assessment and Evaluation (Formative & Summative)',
        'Closure and Reflection',
        'Extension Activities for Advanced Learners',
        'Differentiation Strategies',
        'Cultural Connections and Real-world Applications',
      ],
      guidelines: [
        'Use 5E Model (Engage, Explore, Explain, Elaborate, Evaluate)',
        'Incorporate multiple intelligence theory',
        'Ensure gradual release of responsibility',
        'Include culturally responsive teaching elements',
        'Design for universal access and inclusion',
        'Integrate technology meaningfully',
        'Plan for different learning paces',
        'Include metacognitive strategies',
      ],
      bloomsLevel: ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'],
    });

    this.contentTemplates.set('lesson', {
      type: 'lesson',
      structure: [
        'Learning Objectives',
        'Key Concepts Introduction',
        'Content Explanation with Examples',
        'Interactive Activities',
        'Practice Exercises',
        'Real-world Applications',
        'Summary and Key Takeaways',
        'Assessment Questions',
      ],
      guidelines: [
        'Use clear, age-appropriate language',
        'Include visual aids and multimedia',
        'Provide multiple examples and non-examples',
        "Connect to students' prior knowledge",
        'Use Indian cultural context and examples',
        'Include hands-on activities where possible',
      ],
      bloomsLevel: ['Remember', 'Understand', 'Apply'],
    });

    this.contentTemplates.set('assessment', {
      type: 'assessment',
      structure: [
        'Assessment Overview and Purpose',
        'Learning Objectives Being Assessed',
        'Question Types and Distribution',
        'Rubric/Scoring Criteria',
        'Sample Questions by Difficulty Level',
        'Time Allocation Guidelines',
        'Accommodation Strategies',
        'Feedback Mechanisms',
      ],
      guidelines: [
        'Align questions to learning objectives',
        'Include various question types (MCQ, Short answer, Essay)',
        'Design for different cognitive levels',
        'Ensure cultural fairness and sensitivity',
        'Provide clear instructions and examples',
        'Include self-assessment opportunities',
      ],
      bloomsLevel: ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate'],
    });

    this.contentTemplates.set('activity', {
      type: 'activity',
      structure: [
        'Activity Overview and Learning Goals',
        'Materials and Setup Instructions',
        'Step-by-step Procedure',
        'Student Roles and Responsibilities',
        'Discussion Questions/Reflection',
        'Extension Opportunities',
        'Assessment Criteria',
        'Troubleshooting Guide',
      ],
      guidelines: [
        'Design for active student participation',
        'Include collaborative elements',
        'Ensure safety considerations',
        'Provide clear success criteria',
        'Include reflection and metacognition',
        'Allow for creative expression',
      ],
      bloomsLevel: ['Apply', 'Analyze', 'Evaluate', 'Create'],
    });
  }

  private initializeCurriculumStandards(): void {
    this.curriculumStandards = new Map();

    // CBSE Standards
    this.curriculumStandards.set('mathematics', [
      {
        board: 'CBSE',
        grade: 'Class 10',
        subject: 'Mathematics',
        topics: [
          'Real Numbers',
          'Polynomials',
          'Linear Equations',
          'Quadratic Equations',
          'Arithmetic Progressions',
        ],
        learningOutcomes: [
          'Solve real-world problems using mathematical concepts',
          'Apply logical reasoning',
          'Demonstrate computational skills',
        ],
      },
      {
        board: 'CBSE',
        grade: 'Class 12',
        subject: 'Mathematics',
        topics: [
          'Relations and Functions',
          'Inverse Trigonometric Functions',
          'Matrices',
          'Determinants',
          'Calculus',
        ],
        learningOutcomes: [
          'Apply mathematical concepts to solve complex problems',
          'Demonstrate analytical thinking',
          'Use mathematical modeling',
        ],
      },
    ]);

    // Science Standards
    this.curriculumStandards.set('science', [
      {
        board: 'CBSE',
        grade: 'Class 10',
        subject: 'Science',
        topics: [
          'Light',
          'Human Eye',
          'Natural Resource Management',
          'Life Processes',
          'Control and Coordination',
        ],
        learningOutcomes: [
          'Understand scientific principles',
          'Conduct scientific investigations',
          'Apply scientific knowledge to daily life',
        ],
      },
    ]);
  }

  private initializePedagogicalPrinciples(): void {
    this.pedagogicalPrinciples = [
      {
        name: 'Constructivism',
        description: 'Students build knowledge through active participation and experience',
        application: ['Hands-on activities', 'Problem-based learning', 'Inquiry-based instruction'],
        bloomsLevel: 'Apply',
      },
      {
        name: 'Scaffolding',
        description:
          'Provide temporary support that is gradually removed as students become independent',
        application: ['Guided practice', 'Modeling', 'Think-alouds', 'Graphic organizers'],
        bloomsLevel: 'Understand',
      },
      {
        name: 'Differentiation',
        description: 'Tailor instruction to meet diverse student needs and learning styles',
        application: [
          'Multiple learning pathways',
          'Varied assessment methods',
          'Flexible grouping',
        ],
        bloomsLevel: 'Apply',
      },
      {
        name: 'Culturally Responsive Teaching',
        description: "Connect learning to students' cultural backgrounds and experiences",
        application: ['Local examples', 'Cultural references', 'Multilingual support'],
        bloomsLevel: 'Understand',
      },
    ];
  }

  // Analysis Methods
  private detectRequestedContentType(prompt: string): string {
    const typeKeywords = {
      lesson_plan: /lesson plan|teaching plan|class plan/i,
      lesson: /lesson|chapter|unit|explain|teach/i,
      assessment: /quiz|test|exam|assessment|evaluate/i,
      activity: /activity|exercise|practice|worksheet/i,
      project: /project|assignment|investigation/i,
      curriculum: /curriculum|syllabus|course/i,
      rubric: /rubric|grading criteria|evaluation matrix/i,
    };

    for (const [type, pattern] of Object.entries(typeKeywords)) {
      if (pattern.test(prompt)) return type;
    }

    return 'lesson';
  }

  private getCurriculumAlignment(metadata?: Record<string, any>): CurriculumAlignment | null {
    if (!metadata?.subject) return null;

    const standards = this.curriculumStandards.get(metadata.subject.toLowerCase());
    if (!standards) return null;

    // Return most relevant standard based on grade level
    return (
      standards.find(
        (standard) =>
          metadata.level && standard.grade.toLowerCase().includes(metadata.level.toLowerCase())
      ) || standards[0]
    );
  }

  private analyzePedagogicalApproach(content: string): string[] {
    const approaches = [];

    if (/scaffolding|guided practice|gradual release/i.test(content)) {
      approaches.push('Scaffolding');
    }
    if (/hands.?on|experiment|activity|practice/i.test(content)) {
      approaches.push('Constructivism');
    }
    if (/different|various|multiple|diverse/i.test(content)) {
      approaches.push('Differentiation');
    }
    if (/cultural|indian|local|regional/i.test(content)) {
      approaches.push('Culturally Responsive');
    }
    if (/inquiry|investigate|explore|discover/i.test(content)) {
      approaches.push('Inquiry-based');
    }
    if (/collaborate|group|team|peer/i.test(content)) {
      approaches.push('Collaborative Learning');
    }

    return approaches;
  }

  private identifyBloomsLevels(content: string): string[] {
    const levels = [];

    const bloomsIndicators = {
      Remember: /remember|recall|list|identify|define|describe/i,
      Understand: /understand|explain|interpret|summarize|classify/i,
      Apply: /apply|demonstrate|solve|use|implement|practice/i,
      Analyze: /analyze|compare|contrast|examine|categorize/i,
      Evaluate: /evaluate|assess|judge|critique|defend|justify/i,
      Create: /create|design|develop|compose|construct|formulate/i,
    };

    for (const [level, pattern] of Object.entries(bloomsIndicators)) {
      if (pattern.test(content)) {
        levels.push(level);
      }
    }

    return levels;
  }

  private assessCulturalRelevance(content: string): number {
    let score = 0;

    const culturalIndicators = [
      /indian|india/i,
      /hindi|tamil|bengali|marathi|gujarati|punjabi/i,
      /festival|tradition|culture/i,
      /local|regional|community/i,
      /cbse|icse|ncert/i,
      /rupee|cricket|bollywood/i,
    ];

    culturalIndicators.forEach((indicator) => {
      if (indicator.test(content)) score += 1;
    });

    return Math.min(score / culturalIndicators.length, 1.0);
  }

  private checkAssessmentIntegration(content: string): boolean {
    const assessmentIndicators = [
      /assessment|evaluate|quiz|test/i,
      /rubric|criteria|grading/i,
      /feedback|reflection/i,
      /formative|summative/i,
    ];

    return assessmentIndicators.some((indicator) => indicator.test(content));
  }

  private identifyMultimodalElements(content: string): string[] {
    const modalities = [];

    if (/visual|diagram|chart|image|graphic|video/i.test(content)) {
      modalities.push('Visual');
    }
    if (/audio|listen|music|sound|podcast/i.test(content)) {
      modalities.push('Auditory');
    }
    if (/hands.?on|kinesthetic|movement|gesture|tactile/i.test(content)) {
      modalities.push('Kinesthetic');
    }
    if (/read|text|written|literature/i.test(content)) {
      modalities.push('Reading/Writing');
    }
    if (/digital|online|interactive|technology/i.test(content)) {
      modalities.push('Digital');
    }

    return modalities;
  }
}
