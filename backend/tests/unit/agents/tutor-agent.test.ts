/**
 * AARAMBH AI - Tutor Agent Unit Tests
 * Test suite for the AI Tutor Agent functionality
 */

import { TutorAgent } from '../../../src/agents/TutorAgent';
import { jest } from '@jest/globals';

describe('TutorAgent', () => {
  let tutorAgent: TutorAgent;
  let mockAIService: any;

  beforeEach(() => {
    mockAIService = {
      generateContent: jest.fn(),
      isHealthy: jest.fn().mockResolvedValue(true)
    };
    tutorAgent = new TutorAgent(mockAIService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateExplanation', () => {
    it('should generate a detailed explanation for a given topic', async () => {
      const mockResponse = {
        success: true,
        data: {
          explanation: 'Quadratic equations are polynomial equations of degree 2...',
          examples: ['x² + 5x + 6 = 0', '2x² - 3x + 1 = 0'],
          keyPoints: ['Standard form: ax² + bx + c = 0', 'Discriminant: b² - 4ac']
        }
      };

      mockAIService.generateContent.mockResolvedValue(mockResponse);

      const result = await tutorAgent.generateExplanation('quadratic equations', {
        subject: 'mathematics',
        level: 'grade_10',
        includeExamples: true
      });

      expect(result.success).toBe(true);
      expect(result.data.explanation).toBeDefined();
      expect(result.data.examples).toBeDefined();
      expect(result.data.keyPoints).toBeDefined();
      expect(mockAIService.generateContent).toHaveBeenCalledWith(
        expect.stringContaining('quadratic equations'),
        expect.objectContaining({
          subject: 'mathematics',
          level: 'grade_10'
        })
      );
    });

    it('should handle errors gracefully', async () => {
      mockAIService.generateContent.mockRejectedValue(new Error('AI service unavailable'));

      const result = await tutorAgent.generateExplanation('test topic');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should support JSON mode for structured responses', async () => {
      const mockResponse = {
        success: true,
        data: {
          topic: 'photosynthesis',
          definition: 'The process by which plants make food using sunlight',
          equation: '6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂',
          keyPoints: ['Requires sunlight', 'Produces oxygen', 'Occurs in chloroplasts']
        }
      };

      mockAIService.generateContent.mockResolvedValue(mockResponse);

      const result = await tutorAgent.generateExplanation('photosynthesis', {
        subject: 'biology',
        jsonMode: true
      });

      expect(result.success).toBe(true);
      expect(result.data.topic).toBe('photosynthesis');
      expect(result.data.definition).toBeDefined();
      expect(result.data.equation).toBeDefined();
    });
  });

  describe('solveStepByStep', () => {
    it('should provide step-by-step solution for math problems', async () => {
      const mockResponse = {
        success: true,
        data: {
          problem: 'Solve: 2x + 5 = 13',
          steps: [
            { step: 1, action: 'Subtract 5 from both sides', result: '2x = 8' },
            { step: 2, action: 'Divide both sides by 2', result: 'x = 4' }
          ],
          finalAnswer: 'x = 4',
          verification: 'Check: 2(4) + 5 = 8 + 5 = 13 ✓'
        }
      };

      mockAIService.generateContent.mockResolvedValue(mockResponse);

      const result = await tutorAgent.solveStepByStep('2x + 5 = 13', {
        subject: 'mathematics',
        showVerification: true
      });

      expect(result.success).toBe(true);
      expect(result.data.steps).toBeDefined();
      expect(result.data.steps.length).toBeGreaterThan(0);
      expect(result.data.finalAnswer).toBe('x = 4');
      expect(result.data.verification).toBeDefined();
    });

    it('should handle complex multi-step problems', async () => {
      const mockResponse = {
        success: true,
        data: {
          problem: 'Find the area of a triangle with vertices at (0,0), (4,0), and (2,3)',
          steps: [
            { step: 1, action: 'Use the formula: Area = 1/2 |x₁(y₂-y₃) + x₂(y₃-y₁) + x₃(y₁-y₂)|' },
            { step: 2, action: 'Substitute values: Area = 1/2 |0(0-3) + 4(3-0) + 2(0-0)|' },
            { step: 3, action: 'Simplify: Area = 1/2 |0 + 12 + 0|' },
            { step: 4, action: 'Calculate: Area = 1/2 × 12 = 6' }
          ],
          finalAnswer: '6 square units'
        }
      };

      mockAIService.generateContent.mockResolvedValue(mockResponse);

      const result = await tutorAgent.solveStepByStep(
        'Find the area of a triangle with vertices at (0,0), (4,0), and (2,3)',
        { subject: 'mathematics' }
      );

      expect(result.success).toBe(true);
      expect(result.data.steps.length).toBe(4);
      expect(result.data.finalAnswer).toBe('6 square units');
    });
  });

  describe('generatePracticeQuestions', () => {
    it('should generate practice questions for a given topic', async () => {
      const mockResponse = {
        success: true,
        data: {
          topic: 'linear equations',
          questions: [
            {
              question: 'Solve: 3x + 7 = 22',
              difficulty: 'easy',
              answer: 'x = 5',
              explanation: 'Subtract 7 from both sides, then divide by 3'
            },
            {
              question: 'Find x: 2(x - 3) = 4x + 6',
              difficulty: 'medium',
              answer: 'x = -6',
              explanation: 'Expand, collect like terms, then solve'
            }
          ]
        }
      };

      mockAIService.generateContent.mockResolvedValue(mockResponse);

      const result = await tutorAgent.generatePracticeQuestions('linear equations', {
        count: 2,
        difficulty: 'mixed'
      });

      expect(result.success).toBe(true);
      expect(result.data.questions).toBeDefined();
      expect(result.data.questions.length).toBe(2);
      expect(result.data.questions[0].question).toBeDefined();
      expect(result.data.questions[0].answer).toBeDefined();
    });

    it('should respect difficulty level parameter', async () => {
      const mockResponse = {
        success: true,
        data: {
          topic: 'algebra',
          questions: [
            {
              question: 'Solve: x² - 5x + 6 = 0',
              difficulty: 'hard',
              answer: 'x = 2 or x = 3',
              explanation: 'Factor the quadratic or use the quadratic formula'
            }
          ]
        }
      };

      mockAIService.generateContent.mockResolvedValue(mockResponse);

      const result = await tutorAgent.generatePracticeQuestions('algebra', {
        count: 1,
        difficulty: 'hard'
      });

      expect(result.success).toBe(true);
      expect(result.data.questions[0].difficulty).toBe('hard');
    });
  });

  describe('provideFeedback', () => {
    it('should provide constructive feedback on student answers', async () => {
      const mockResponse = {
        success: true,
        data: {
          isCorrect: false,
          score: 70,
          feedback: 'Your approach is correct, but you made a calculation error in step 2.',
          suggestions: [
            'Double-check your arithmetic in step 2',
            'Consider using the distributive property more carefully'
          ],
          correctAnswer: 'x = 8'
        }
      };

      mockAIService.generateContent.mockResolvedValue(mockResponse);

      const result = await tutorAgent.provideFeedback(
        'Solve: 2(x - 3) = 10',
        'x = 6',
        'x = 8'
      );

      expect(result.success).toBe(true);
      expect(result.data.isCorrect).toBe(false);
      expect(result.data.score).toBe(70);
      expect(result.data.feedback).toBeDefined();
      expect(result.data.suggestions).toBeDefined();
    });

    it('should recognize correct answers', async () => {
      const mockResponse = {
        success: true,
        data: {
          isCorrect: true,
          score: 100,
          feedback: 'Excellent! Your solution is correct and well-explained.',
          suggestions: [],
          correctAnswer: 'x = 8'
        }
      };

      mockAIService.generateContent.mockResolvedValue(mockResponse);

      const result = await tutorAgent.provideFeedback(
        'Solve: 2(x - 3) = 10',
        'x = 8',
        'x = 8'
      );

      expect(result.success).toBe(true);
      expect(result.data.isCorrect).toBe(true);
      expect(result.data.score).toBe(100);
    });
  });

  describe('adaptToDifficultyLevel', () => {
    it('should adapt explanations based on student level', async () => {
      const mockResponse = {
        success: true,
        data: {
          explanation: 'A fraction is a part of a whole, like when you cut a pizza into slices.',
          vocabulary: ['numerator', 'denominator', 'whole'],
          examples: ['1/2', '3/4', '2/3']
        }
      };

      mockAIService.generateContent.mockResolvedValue(mockResponse);

      const result = await tutorAgent.generateExplanation('fractions', {
        level: 'grade_3',
        adaptToLevel: true
      });

      expect(result.success).toBe(true);
      expect(result.data.explanation).toContain('pizza');
      expect(result.data.vocabulary).toBeDefined();
    });

    it('should provide advanced explanations for higher levels', async () => {
      const mockResponse = {
        success: true,
        data: {
          explanation: 'Rational numbers are defined as quotients of integers where the denominator is non-zero.',
          theorem: 'Every rational number can be expressed as a/b where a,b ∈ Z and b ≠ 0',
          properties: ['closure', 'associativity', 'commutativity']
        }
      };

      mockAIService.generateContent.mockResolvedValue(mockResponse);

      const result = await tutorAgent.generateExplanation('rational numbers', {
        level: 'grade_12',
        adaptToLevel: true
      });

      expect(result.success).toBe(true);
      expect(result.data.explanation).toContain('quotients');
      expect(result.data.theorem).toBeDefined();
      expect(result.data.properties).toBeDefined();
    });
  });

  describe('health check', () => {
    it('should return healthy status when AI service is available', async () => {
      const isHealthy = await tutorAgent.isHealthy();
      expect(isHealthy).toBe(true);
    });

    it('should return unhealthy status when AI service is unavailable', async () => {
      mockAIService.isHealthy.mockResolvedValue(false);
      const isHealthy = await tutorAgent.isHealthy();
      expect(isHealthy).toBe(false);
    });
  });
});