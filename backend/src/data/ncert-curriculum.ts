/**
 * AARAMBH AI - NCERT Curriculum Structure
 * Complete curriculum mapping for Classes 6-12 across all subjects
 */

export interface NCERTChapter {
  id: string;
  title: string;
  description: string;
  learningObjectives: string[];
  keyTopics: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedHours: number;
  prerequisites: string[];
  assessmentTypes: ('mcq' | 'short_answer' | 'long_answer' | 'practical')[];
}

export interface NCERTSubject {
  id: string;
  name: string;
  description: string;
  totalChapters: number;
  totalHours: number;
  chapters: NCERTChapter[];
}

export interface NCERTClass {
  id: string;
  name: string;
  description: string;
  subjects: NCERTSubject[];
}

export const NCERTCurriculum: NCERTClass[] = [
  // =============================================================================
  // CLASS 6
  // =============================================================================
  {
    id: 'class_6',
    name: 'Class 6',
    description: 'Foundation level curriculum for Class 6 students',
    subjects: [
      {
        id: 'math_6',
        name: 'Mathematics',
        description: 'Basic mathematical concepts and operations',
        totalChapters: 14,
        totalHours: 120,
        chapters: [
          {
            id: 'math_6_ch1',
            title: 'Knowing Our Numbers',
            description: 'Understanding large numbers, place value, and number systems',
            learningObjectives: [
              'Read and write large numbers',
              'Compare and order numbers',
              'Understand place value system',
              'Use number line for representation'
            ],
            keyTopics: ['Place Value', 'Number Line', 'Comparing Numbers', 'Rounding Off'],
            difficulty: 'easy',
            estimatedHours: 10,
            prerequisites: [],
            assessmentTypes: ['mcq', 'short_answer']
          },
          {
            id: 'math_6_ch2',
            title: 'Whole Numbers',
            description: 'Properties and operations on whole numbers',
            learningObjectives: [
              'Understand properties of whole numbers',
              'Perform operations on whole numbers',
              'Use patterns in whole numbers'
            ],
            keyTopics: ['Properties of Whole Numbers', 'Operations', 'Patterns'],
            difficulty: 'easy',
            estimatedHours: 12,
            prerequisites: ['math_6_ch1'],
            assessmentTypes: ['mcq', 'short_answer']
          },
          {
            id: 'math_6_ch3',
            title: 'Playing with Numbers',
            description: 'Factors, multiples, and divisibility rules',
            learningObjectives: [
              'Find factors and multiples',
              'Apply divisibility rules',
              'Find HCF and LCM',
              'Solve problems using factors and multiples'
            ],
            keyTopics: ['Factors', 'Multiples', 'Divisibility Rules', 'HCF', 'LCM'],
            difficulty: 'medium',
            estimatedHours: 15,
            prerequisites: ['math_6_ch2'],
            assessmentTypes: ['mcq', 'short_answer', 'long_answer']
          }
          // Additional chapters would be added here...
        ]
      },
      {
        id: 'science_6',
        name: 'Science',
        description: 'Introduction to basic scientific concepts',
        totalChapters: 16,
        totalHours: 100,
        chapters: [
          {
            id: 'science_6_ch1',
            title: 'Food: Where Does It Come From?',
            description: 'Understanding food sources and classification',
            learningObjectives: [
              'Identify different food sources',
              'Classify food into plant and animal sources',
              'Understand food chains'
            ],
            keyTopics: ['Food Sources', 'Plant Foods', 'Animal Foods', 'Food Chains'],
            difficulty: 'easy',
            estimatedHours: 8,
            prerequisites: [],
            assessmentTypes: ['mcq', 'short_answer']
          }
          // Additional chapters would be added here...
        ]
      },
      {
        id: 'social_6',
        name: 'Social Science',
        description: 'History, Geography, and Civics for Class 6',
        totalChapters: 24,
        totalHours: 120,
        chapters: [
          {
            id: 'social_6_ch1',
            title: 'What, Where, How and When?',
            description: 'Introduction to history and historical sources',
            learningObjectives: [
              'Understand the concept of history',
              'Identify different historical sources',
              'Learn about chronology in history'
            ],
            keyTopics: ['Historical Sources', 'Chronology', 'Archaeology', 'Manuscripts'],
            difficulty: 'easy',
            estimatedHours: 6,
            prerequisites: [],
            assessmentTypes: ['mcq', 'short_answer']
          }
          // Additional chapters would be added here...
        ]
      }
    ]
  },

  // =============================================================================
  // CLASS 10
  // =============================================================================
  {
    id: 'class_10',
    name: 'Class 10',
    description: 'Secondary level curriculum for Class 10 students',
    subjects: [
      {
        id: 'math_10',
        name: 'Mathematics',
        description: 'Advanced mathematical concepts for Class 10',
        totalChapters: 15,
        totalHours: 150,
        chapters: [
          {
            id: 'math_10_ch1',
            title: 'Real Numbers',
            description: 'Understanding real numbers and their properties',
            learningObjectives: [
              'Understand rational and irrational numbers',
              'Apply Euclid\'s division algorithm',
              'Find HCF and LCM of large numbers',
              'Prove irrationality of numbers'
            ],
            keyTopics: ['Rational Numbers', 'Irrational Numbers', 'Euclid\'s Algorithm', 'HCF', 'LCM'],
            difficulty: 'medium',
            estimatedHours: 12,
            prerequisites: [],
            assessmentTypes: ['mcq', 'short_answer', 'long_answer']
          },
          {
            id: 'math_10_ch2',
            title: 'Polynomials',
            description: 'Operations on polynomials and their applications',
            learningObjectives: [
              'Understand polynomial expressions',
              'Perform operations on polynomials',
              'Find zeros of polynomials',
              'Apply remainder theorem'
            ],
            keyTopics: ['Polynomial Expressions', 'Degree of Polynomial', 'Zeros', 'Remainder Theorem'],
            difficulty: 'medium',
            estimatedHours: 15,
            prerequisites: ['math_10_ch1'],
            assessmentTypes: ['mcq', 'short_answer', 'long_answer']
          },
          {
            id: 'math_10_ch3',
            title: 'Pair of Linear Equations in Two Variables',
            description: 'Solving systems of linear equations',
            learningObjectives: [
              'Solve linear equations graphically',
              'Apply substitution method',
              'Use elimination method',
              'Solve real-world problems'
            ],
            keyTopics: ['Linear Equations', 'Graphical Method', 'Substitution', 'Elimination'],
            difficulty: 'medium',
            estimatedHours: 18,
            prerequisites: ['math_10_ch2'],
            assessmentTypes: ['mcq', 'short_answer', 'long_answer']
          }
          // Additional chapters would be added here...
        ]
      },
      {
        id: 'science_10',
        name: 'Science',
        description: 'Integrated science curriculum for Class 10',
        totalChapters: 16,
        totalHours: 140,
        chapters: [
          {
            id: 'science_10_ch1',
            title: 'Light - Reflection and Refraction',
            description: 'Understanding light behavior and optical phenomena',
            learningObjectives: [
              'Understand reflection of light',
              'Learn about refraction of light',
              'Study spherical mirrors and lenses',
              'Apply sign conventions'
            ],
            keyTopics: ['Reflection', 'Refraction', 'Mirrors', 'Lenses', 'Sign Conventions'],
            difficulty: 'hard',
            estimatedHours: 20,
            prerequisites: [],
            assessmentTypes: ['mcq', 'short_answer', 'long_answer', 'practical']
          }
          // Additional chapters would be added here...
        ]
      }
    ]
  },

  // =============================================================================
  // CLASS 12
  // =============================================================================
  {
    id: 'class_12',
    name: 'Class 12',
    description: 'Senior secondary curriculum for Class 12 students',
    subjects: [
      {
        id: 'math_12',
        name: 'Mathematics',
        description: 'Advanced mathematics for Class 12',
        totalChapters: 13,
        totalHours: 180,
        chapters: [
          {
            id: 'math_12_ch1',
            title: 'Relations and Functions',
            description: 'Understanding relations, functions, and their properties',
            learningObjectives: [
              'Understand different types of relations',
              'Learn about various functions',
              'Study inverse functions',
              'Understand composite functions'
            ],
            keyTopics: ['Relations', 'Functions', 'Inverse Functions', 'Composite Functions'],
            difficulty: 'hard',
            estimatedHours: 20,
            prerequisites: [],
            assessmentTypes: ['mcq', 'short_answer', 'long_answer']
          },
          {
            id: 'math_12_ch2',
            title: 'Inverse Trigonometric Functions',
            description: 'Study of inverse trigonometric functions and their properties',
            learningObjectives: [
              'Understand inverse trigonometric functions',
              'Learn their domains and ranges',
              'Solve problems involving inverse trig functions',
              'Apply in integration and differentiation'
            ],
            keyTopics: ['Inverse Trig Functions', 'Domain', 'Range', 'Properties'],
            difficulty: 'hard',
            estimatedHours: 15,
            prerequisites: ['math_12_ch1'],
            assessmentTypes: ['mcq', 'short_answer', 'long_answer']
          },
          {
            id: 'math_12_ch3',
            title: 'Matrices',
            description: 'Operations on matrices and their applications',
            learningObjectives: [
              'Understand matrix operations',
              'Calculate determinants',
              'Find inverse of matrices',
              'Solve system of equations using matrices'
            ],
            keyTopics: ['Matrix Operations', 'Determinants', 'Inverse Matrix', 'Linear Systems'],
            difficulty: 'hard',
            estimatedHours: 25,
            prerequisites: ['math_12_ch1'],
            assessmentTypes: ['mcq', 'short_answer', 'long_answer']
          }
          // Additional chapters would be added here...
        ]
      },
      {
        id: 'physics_12',
        name: 'Physics',
        description: 'Advanced physics concepts for Class 12',
        totalChapters: 15,
        totalHours: 160,
        chapters: [
          {
            id: 'physics_12_ch1',
            title: 'Electric Charges and Fields',
            description: 'Understanding electric charges and electric fields',
            learningObjectives: [
              'Understand properties of electric charges',
              'Learn about Coulomb\'s law',
              'Study electric field and potential',
              'Apply Gauss\'s law'
            ],
            keyTopics: ['Electric Charges', 'Coulomb\'s Law', 'Electric Field', 'Gauss\'s Law'],
            difficulty: 'hard',
            estimatedHours: 18,
            prerequisites: [],
            assessmentTypes: ['mcq', 'short_answer', 'long_answer', 'practical']
          }
          // Additional chapters would be added here...
        ]
      }
    ]
  }
];

// =============================================================================
// CURRICULUM HELPER FUNCTIONS
// =============================================================================

export const getCurriculumByClass = (classId: string): NCERTClass | undefined => {
  return NCERTCurriculum.find(cls => cls.id === classId);
};

export const getSubjectByClassAndId = (classId: string, subjectId: string): NCERTSubject | undefined => {
  const cls = getCurriculumByClass(classId);
  return cls?.subjects.find(subject => subject.id === subjectId);
};

export const getChapterById = (classId: string, subjectId: string, chapterId: string): NCERTChapter | undefined => {
  const subject = getSubjectByClassAndId(classId, subjectId);
  return subject?.chapters.find(chapter => chapter.id === chapterId);
};

export const getAllSubjects = (): string[] => {
  const subjects = new Set<string>();
  NCERTCurriculum.forEach(cls => {
    cls.subjects.forEach(subject => {
      subjects.add(subject.name);
    });
  });
  return Array.from(subjects);
};

export const getClassesBySubject = (subjectName: string): string[] => {
  return NCERTCurriculum
    .filter(cls => cls.subjects.some(subject => subject.name === subjectName))
    .map(cls => cls.name);
};

export const getCurriculumStats = () => {
  let totalChapters = 0;
  let totalHours = 0;
  let totalSubjects = 0;

  NCERTCurriculum.forEach(cls => {
    cls.subjects.forEach(subject => {
      totalSubjects++;
      totalChapters += subject.totalChapters;
      totalHours += subject.totalHours;
    });
  });

  return {
    totalClasses: NCERTCurriculum.length,
    totalSubjects,
    totalChapters,
    totalHours,
    averageHoursPerChapter: Math.round(totalHours / totalChapters)
  };
};

export const getPrerequisiteChain = (classId: string, subjectId: string, chapterId: string): string[] => {
  const chapter = getChapterById(classId, subjectId, chapterId);
  if (!chapter) return [];

  const chain: string[] = [];
  const visited = new Set<string>();

  const buildChain = (prerequisites: string[]) => {
    prerequisites.forEach(prereq => {
      if (!visited.has(prereq)) {
        visited.add(prereq);
        chain.push(prereq);
        
        // Find the prerequisite chapter and get its prerequisites
        const prereqChapter = getChapterById(classId, subjectId, prereq);
        if (prereqChapter && prereqChapter.prerequisites.length > 0) {
          buildChain(prereqChapter.prerequisites);
        }
      }
    });
  };

  buildChain(chapter.prerequisites);
  return chain.reverse(); // Return in correct order
};

export const getDifficultyDistribution = (classId: string, subjectId: string) => {
  const subject = getSubjectByClassAndId(classId, subjectId);
  if (!subject) return { easy: 0, medium: 0, hard: 0 };

  const distribution = { easy: 0, medium: 0, hard: 0 };
  subject.chapters.forEach(chapter => {
    distribution[chapter.difficulty]++;
  });

  return distribution;
};

export const getProgressionPath = (subjectName: string): { classId: string; subjectId: string; chapters: string[] }[] => {
  const path: { classId: string; subjectId: string; chapters: string[] }[] = [];
  
  NCERTCurriculum.forEach(cls => {
    cls.subjects.forEach(subject => {
      if (subject.name === subjectName) {
        path.push({
          classId: cls.id,
          subjectId: subject.id,
          chapters: subject.chapters.map(ch => ch.id)
        });
      }
    });
  });

  return path;
};