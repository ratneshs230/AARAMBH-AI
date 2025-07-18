/**
 * AARAMBH AI - Seed Data Migration
 * Populates the database with initial demo data and admin users
 */

import { MongoClient, Db, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

export async function up(db: Db): Promise<void> {
  console.log('🌱 Running Seed Data Migration...');

  // =============================================================================
  // CREATE ADMIN USER
  // =============================================================================
  
  const hashedPassword = await bcrypt.hash('AdminPass123!', 12);
  const adminUser = {
    _id: new ObjectId(),
    email: 'admin@aarambh.ai',
    password: hashedPassword,
    profile: {
      firstName: 'AARAMBH',
      lastName: 'Admin',
      avatar: '/assets/avatars/admin.png',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'other',
      location: {
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India'
      }
    },
    education: {
      currentGrade: 'Postgraduate',
      school: 'AARAMBH AI Technologies',
      subjects: ['All Subjects'],
      learningStyle: 'mixed',
      preferredLanguage: 'en'
    },
    subscription: {
      type: 'enterprise',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      features: ['all']
    },
    preferences: {
      notifications: true,
      darkMode: false,
      studyReminders: true,
      difficultyLevel: 'medium'
    },
    analytics: {
      totalStudyTime: 0,
      coursesCompleted: 0,
      averageScore: 0,
      learningStreak: 0,
      lastActive: new Date()
    },
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.collection('users').insertOne(adminUser);
  console.log('✅ Admin user created successfully');

  // =============================================================================
  // CREATE DEMO TEACHER
  // =============================================================================
  
  const teacherPassword = await bcrypt.hash('TeacherPass123!', 12);
  const teacherUser = {
    _id: new ObjectId(),
    email: 'teacher@aarambh.ai',
    password: teacherPassword,
    profile: {
      firstName: 'Dr. Priya',
      lastName: 'Sharma',
      avatar: '/assets/avatars/teacher.png',
      dateOfBirth: new Date('1985-03-15'),
      gender: 'female',
      location: {
        city: 'Delhi',
        state: 'Delhi',
        country: 'India'
      }
    },
    education: {
      currentGrade: 'Postgraduate',
      school: 'Delhi University',
      subjects: ['Mathematics', 'Physics', 'Chemistry'],
      learningStyle: 'visual',
      preferredLanguage: 'en'
    },
    subscription: {
      type: 'premium',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      features: ['content_creation', 'analytics', 'assessments']
    },
    preferences: {
      notifications: true,
      darkMode: false,
      studyReminders: true,
      difficultyLevel: 'medium'
    },
    analytics: {
      totalStudyTime: 0,
      coursesCompleted: 0,
      averageScore: 0,
      learningStreak: 0,
      lastActive: new Date()
    },
    role: 'teacher',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.collection('users').insertOne(teacherUser);
  console.log('✅ Demo teacher created successfully');

  // =============================================================================
  // CREATE DEMO STUDENT
  // =============================================================================
  
  const studentPassword = await bcrypt.hash('StudentPass123!', 12);
  const studentUser = {
    _id: new ObjectId(),
    email: 'student@aarambh.ai',
    password: studentPassword,
    profile: {
      firstName: 'Arjun',
      lastName: 'Kumar',
      avatar: '/assets/avatars/student.png',
      dateOfBirth: new Date('2005-06-20'),
      gender: 'male',
      location: {
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India'
      }
    },
    education: {
      currentGrade: 'Class 12',
      school: 'Kendriya Vidyalaya',
      subjects: ['Mathematics', 'Physics', 'Chemistry', 'English'],
      learningStyle: 'kinesthetic',
      preferredLanguage: 'en'
    },
    subscription: {
      type: 'free',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      features: ['basic_ai', 'courses']
    },
    preferences: {
      notifications: true,
      darkMode: true,
      studyReminders: true,
      difficultyLevel: 'medium'
    },
    analytics: {
      totalStudyTime: 0,
      coursesCompleted: 0,
      averageScore: 0,
      learningStreak: 0,
      lastActive: new Date()
    },
    role: 'student',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.collection('users').insertOne(studentUser);
  console.log('✅ Demo student created successfully');

  // =============================================================================
  // CREATE DEMO COURSE
  // =============================================================================
  
  const demoCourse = {
    _id: new ObjectId(),
    title: 'Advanced Mathematics for Class 12',
    description: 'Complete mathematics course covering all topics for Class 12 CBSE curriculum including calculus, algebra, and trigonometry.',
    instructor: {
      id: teacherUser._id,
      name: 'Dr. Priya Sharma',
      bio: 'Mathematics teacher with 15 years of experience in CBSE curriculum',
      avatar: '/assets/avatars/teacher.png',
      rating: 4.8
    },
    content: {
      level: 'Class 12',
      subject: 'Mathematics',
      topics: ['Calculus', 'Algebra', 'Trigonometry', 'Coordinate Geometry', 'Statistics'],
      prerequisites: ['Class 11 Mathematics'],
      learningObjectives: [
        'Master differential and integral calculus',
        'Solve complex algebraic equations',
        'Apply trigonometric concepts to real-world problems',
        'Understand coordinate geometry principles'
      ]
    },
    structure: {
      totalLessons: 50,
      totalDuration: 3000, // 50 hours
      assessmentCount: 10,
      difficultyLevel: 'intermediate'
    },
    media: {
      thumbnail: '/assets/courses/math-class12.jpg',
      trailer: '/assets/videos/math-trailer.mp4',
      images: [
        '/assets/courses/math-preview1.jpg',
        '/assets/courses/math-preview2.jpg'
      ]
    },
    pricing: {
      type: 'free',
      price: 0,
      currency: 'INR',
      discountPercentage: 0
    },
    analytics: {
      enrollmentCount: 1,
      completionRate: 0,
      averageRating: 0,
      reviewCount: 0
    },
    settings: {
      isPublished: true,
      allowEnrollment: true,
      certificateAvailable: true,
      maxStudents: 1000
    },
    seo: {
      slug: 'advanced-mathematics-class-12',
      metaTitle: 'Advanced Mathematics for Class 12 - AARAMBH AI',
      metaDescription: 'Complete mathematics course for Class 12 students with AI-powered tutoring',
      keywords: ['mathematics', 'class 12', 'cbse', 'calculus', 'algebra']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.collection('courses').insertOne(demoCourse);
  console.log('✅ Demo course created successfully');

  // =============================================================================
  // CREATE DEMO LESSON
  // =============================================================================
  
  const demoLesson = {
    _id: new ObjectId(),
    courseId: demoCourse._id,
    title: 'Introduction to Differential Calculus',
    description: 'Learn the fundamentals of differential calculus including limits, derivatives, and applications.',
    content: {
      type: 'video',
      data: {
        videoUrl: '/assets/videos/differential-calculus-intro.mp4',
        duration: 1800, // 30 minutes
        transcript: 'In this lesson, we will explore the concept of limits and how they lead to derivatives...',
        captions: true
      },
      duration: 30,
      resources: [
        '/assets/pdfs/calculus-notes.pdf',
        '/assets/pdfs/practice-problems.pdf'
      ]
    },
    structure: {
      order: 1,
      isRequired: true,
      unlockConditions: [],
      prerequisites: []
    },
    learning: {
      objectives: [
        'Understand the concept of limits',
        'Learn to calculate basic derivatives',
        'Apply derivative rules to solve problems'
      ],
      keyPoints: [
        'Limit definition of derivative',
        'Power rule for derivatives',
        'Product and quotient rules',
        'Chain rule applications'
      ],
      difficulty: 'medium',
      estimatedTime: 45
    },
    assessment: {
      hasQuiz: true,
      passingScore: 70,
      maxAttempts: 3,
      questions: []
    },
    analytics: {
      completionRate: 0,
      averageScore: 0,
      timeSpent: 0,
      engagementMetrics: {}
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.collection('lessons').insertOne(demoLesson);
  console.log('✅ Demo lesson created successfully');

  // =============================================================================
  // CREATE DEMO ASSESSMENT
  // =============================================================================
  
  const demoAssessment = {
    _id: new ObjectId(),
    courseId: demoCourse._id,
    lessonId: demoLesson._id,
    title: 'Differential Calculus Quiz',
    description: 'Test your understanding of differential calculus concepts',
    type: 'quiz',
    questions: [
      {
        _id: new ObjectId(),
        type: 'mcq',
        question: 'What is the derivative of x³?',
        options: ['2x²', '3x²', '3x³', 'x²'],
        correctAnswer: '3x²',
        explanation: 'Using the power rule: d/dx(x³) = 3x²',
        points: 10,
        difficulty: 'easy',
        tags: ['derivatives', 'power-rule']
      },
      {
        _id: new ObjectId(),
        type: 'mcq',
        question: 'What is the limit of (x² - 1)/(x - 1) as x approaches 1?',
        options: ['0', '1', '2', 'undefined'],
        correctAnswer: '2',
        explanation: 'Factor the numerator: (x+1)(x-1)/(x-1) = x+1. As x→1, the limit is 2.',
        points: 15,
        difficulty: 'medium',
        tags: ['limits', 'factoring']
      }
    ],
    settings: {
      duration: 30, // 30 minutes
      attempts: 3,
      shuffleQuestions: true,
      showResults: true,
      passingScore: 70
    },
    grading: {
      type: 'automatic',
      rubric: {},
      weightage: 100
    },
    analytics: {
      totalAttempts: 0,
      averageScore: 0,
      averageTime: 0,
      completionRate: 0
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.collection('assessments').insertOne(demoAssessment);
  console.log('✅ Demo assessment created successfully');

  // =============================================================================
  // CREATE DEMO USER PROGRESS
  // =============================================================================
  
  const demoProgress = {
    _id: new ObjectId(),
    userId: studentUser._id,
    courseId: demoCourse._id,
    enrollmentDate: new Date(),
    progress: {
      completedLessons: [],
      currentLesson: demoLesson._id,
      totalProgress: 0,
      timeSpent: 0,
      lastAccessed: new Date()
    },
    performance: {
      averageScore: 0,
      totalAssessments: 0,
      passedAssessments: 0,
      highestScore: 0,
      improvementRate: 0
    },
    learning: {
      studyStreak: 0,
      totalSessions: 0,
      bookmarks: [],
      notes: [],
      preferences: {}
    },
    achievements: {
      badges: [],
      certificates: [],
      milestones: [],
      rewards: []
    },
    analytics: {
      learningPatterns: {},
      timeDistribution: {},
      subjectStrengths: [],
      improvementAreas: []
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.collection('user_progress').insertOne(demoProgress);
  console.log('✅ Demo user progress created successfully');

  // =============================================================================
  // CREATE SYSTEM SETTINGS
  // =============================================================================
  
  const systemSettings = {
    _id: new ObjectId(),
    platform: {
      name: 'AARAMBH AI',
      version: '1.0.0',
      description: 'AI-Powered Educational Platform for Indian Students',
      supportEmail: 'support@aarambh.ai',
      contactEmail: 'contact@aarambh.ai'
    },
    features: {
      aiFeatures: true,
      voiceInterface: true,
      vrFeatures: true,
      collaborativeFeatures: true,
      advancedAnalytics: true,
      betaFeatures: false
    },
    limits: {
      maxRequestsPerMinute: 100,
      maxAIRequestsPerMinute: 10,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      maxStudentsPerCourse: 1000
    },
    maintenance: {
      isMaintenanceMode: false,
      maintenanceMessage: '',
      estimatedDowntime: 0
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.collection('system_settings').insertOne(systemSettings);
  console.log('✅ System settings created successfully');

  console.log('🌱 Seed Data Migration completed successfully!');
}

export async function down(db: Db): Promise<void> {
  console.log('🔄 Rolling back Seed Data Migration...');

  // Remove all seed data
  await db.collection('users').deleteMany({
    email: { $in: ['admin@aarambh.ai', 'teacher@aarambh.ai', 'student@aarambh.ai'] }
  });

  await db.collection('courses').deleteMany({
    'seo.slug': 'advanced-mathematics-class-12'
  });

  await db.collection('lessons').deleteMany({
    title: 'Introduction to Differential Calculus'
  });

  await db.collection('assessments').deleteMany({
    title: 'Differential Calculus Quiz'
  });

  await db.collection('user_progress').deleteMany({});
  await db.collection('system_settings').deleteMany({});

  console.log('✅ Seed Data Migration rollback completed!');
}

export const migration = {
  name: '002_seed_data',
  up,
  down
};