/**
 * AARAMBH AI - NCERT Curriculum Migration
 * Populates the database with complete NCERT curriculum data
 */

import { MongoClient, Db, ObjectId } from 'mongodb';
import { NCERTCurriculum } from '../data/ncert-curriculum';

export async function up(db: Db): Promise<void> {
  console.log('📚 Running NCERT Curriculum Migration...');

  // =============================================================================
  // CREATE CURRICULUM COLLECTIONS
  // =============================================================================
  
  // Create curriculum structure collection
  await db.createCollection('curriculum_structure', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['classId', 'className', 'subjects', 'createdAt'],
        properties: {
          classId: { bsonType: 'string' },
          className: { bsonType: 'string' },
          subjects: { bsonType: 'array' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    }
  });

  // Create subjects collection
  await db.createCollection('subjects', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['classId', 'subjectId', 'name', 'chapters', 'createdAt'],
        properties: {
          classId: { bsonType: 'string' },
          subjectId: { bsonType: 'string' },
          name: { bsonType: 'string' },
          chapters: { bsonType: 'array' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    }
  });

  // Create chapters collection
  await db.createCollection('chapters', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['classId', 'subjectId', 'chapterId', 'title', 'createdAt'],
        properties: {
          classId: { bsonType: 'string' },
          subjectId: { bsonType: 'string' },
          chapterId: { bsonType: 'string' },
          title: { bsonType: 'string' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    }
  });

  // =============================================================================
  // CREATE INDEXES
  // =============================================================================

  // Curriculum structure indexes
  await db.collection('curriculum_structure').createIndex({ classId: 1 }, { unique: true });
  await db.collection('curriculum_structure').createIndex({ className: 1 });

  // Subjects indexes
  await db.collection('subjects').createIndex({ classId: 1, subjectId: 1 }, { unique: true });
  await db.collection('subjects').createIndex({ classId: 1 });
  await db.collection('subjects').createIndex({ name: 1 });

  // Chapters indexes
  await db.collection('chapters').createIndex({ classId: 1, subjectId: 1, chapterId: 1 }, { unique: true });
  await db.collection('chapters').createIndex({ classId: 1, subjectId: 1 });
  await db.collection('chapters').createIndex({ difficulty: 1 });
  await db.collection('chapters').createIndex({ estimatedHours: 1 });

  // =============================================================================
  // POPULATE CURRICULUM DATA
  // =============================================================================

  const timestamp = new Date();
  let totalChapters = 0;
  let totalSubjects = 0;

  for (const curriculumClass of NCERTCurriculum) {
    console.log(`📖 Processing ${curriculumClass.name}...`);

    // Insert curriculum structure
    await db.collection('curriculum_structure').insertOne({
      _id: new ObjectId(),
      classId: curriculumClass.id,
      className: curriculumClass.name,
      description: curriculumClass.description,
      totalSubjects: curriculumClass.subjects.length,
      subjects: curriculumClass.subjects.map(subject => ({
        subjectId: subject.id,
        name: subject.name,
        totalChapters: subject.totalChapters,
        totalHours: subject.totalHours
      })),
      metadata: {
        curriculum: 'NCERT',
        board: 'CBSE',
        country: 'India',
        language: 'English'
      },
      createdAt: timestamp,
      updatedAt: timestamp
    });

    // Process each subject
    for (const subject of curriculumClass.subjects) {
      console.log(`  📝 Processing ${subject.name}...`);
      totalSubjects++;

      // Insert subject
      await db.collection('subjects').insertOne({
        _id: new ObjectId(),
        classId: curriculumClass.id,
        subjectId: subject.id,
        name: subject.name,
        description: subject.description,
        totalChapters: subject.totalChapters,
        totalHours: subject.totalHours,
        chapters: subject.chapters.map(chapter => ({
          chapterId: chapter.id,
          title: chapter.title,
          difficulty: chapter.difficulty,
          estimatedHours: chapter.estimatedHours
        })),
        metadata: {
          curriculum: 'NCERT',
          board: 'CBSE',
          academicYear: '2024-25'
        },
        createdAt: timestamp,
        updatedAt: timestamp
      });

      // Process each chapter
      for (const chapter of subject.chapters) {
        totalChapters++;

        // Insert chapter
        await db.collection('chapters').insertOne({
          _id: new ObjectId(),
          classId: curriculumClass.id,
          subjectId: subject.id,
          chapterId: chapter.id,
          title: chapter.title,
          description: chapter.description,
          learningObjectives: chapter.learningObjectives,
          keyTopics: chapter.keyTopics,
          difficulty: chapter.difficulty,
          estimatedHours: chapter.estimatedHours,
          prerequisites: chapter.prerequisites,
          assessmentTypes: chapter.assessmentTypes,
          content: {
            hasVideo: false,
            hasText: false,
            hasInteractive: false,
            hasAssessment: true,
            contentUrl: null,
            resourceUrls: []
          },
          analytics: {
            totalStudents: 0,
            completionRate: 0,
            averageScore: 0,
            averageTimeSpent: 0,
            difficultyRating: 0
          },
          metadata: {
            curriculum: 'NCERT',
            board: 'CBSE',
            source: 'NCERT Textbook',
            lastUpdated: timestamp
          },
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
    }
  }

  // =============================================================================
  // CREATE CURRICULUM STATISTICS
  // =============================================================================

  const curriculumStats = {
    _id: new ObjectId(),
    totalClasses: NCERTCurriculum.length,
    totalSubjects: totalSubjects,
    totalChapters: totalChapters,
    totalHours: NCERTCurriculum.reduce((total, cls) => 
      total + cls.subjects.reduce((subTotal, subject) => subTotal + subject.totalHours, 0), 0
    ),
    averageHoursPerChapter: Math.round(
      NCERTCurriculum.reduce((total, cls) => 
        total + cls.subjects.reduce((subTotal, subject) => subTotal + subject.totalHours, 0), 0
      ) / totalChapters
    ),
    difficultyDistribution: {
      easy: 0,
      medium: 0,
      hard: 0
    },
    subjectDistribution: {},
    metadata: {
      curriculum: 'NCERT',
      board: 'CBSE',
      country: 'India',
      lastUpdated: timestamp
    },
    createdAt: timestamp,
    updatedAt: timestamp
  };

  // Calculate difficulty distribution
  const difficultyCount = { easy: 0, medium: 0, hard: 0 };
  const subjectCount: { [key: string]: number } = {};

  NCERTCurriculum.forEach(cls => {
    cls.subjects.forEach(subject => {
      subjectCount[subject.name] = (subjectCount[subject.name] || 0) + 1;
      
      subject.chapters.forEach(chapter => {
        difficultyCount[chapter.difficulty]++;
      });
    });
  });

  curriculumStats.difficultyDistribution = difficultyCount;
  curriculumStats.subjectDistribution = subjectCount;

  await db.collection('curriculum_statistics').insertOne(curriculumStats);

  // =============================================================================
  // CREATE LEARNING PATHS
  // =============================================================================

  const learningPaths = [
    {
      _id: new ObjectId(),
      name: 'Mathematics Foundation',
      description: 'Complete mathematics journey from Class 6 to 12',
      subject: 'Mathematics',
      classes: ['class_6', 'class_7', 'class_8', 'class_9', 'class_10', 'class_11', 'class_12'],
      totalChapters: NCERTCurriculum.reduce((total, cls) => {
        const mathSubject = cls.subjects.find(s => s.name === 'Mathematics');
        return total + (mathSubject ? mathSubject.totalChapters : 0);
      }, 0),
      totalHours: NCERTCurriculum.reduce((total, cls) => {
        const mathSubject = cls.subjects.find(s => s.name === 'Mathematics');
        return total + (mathSubject ? mathSubject.totalHours : 0);
      }, 0),
      difficulty: 'progressive',
      prerequisites: ['Basic arithmetic', 'Number sense'],
      learningOutcomes: [
        'Master fundamental mathematical concepts',
        'Develop problem-solving skills',
        'Prepare for competitive exams',
        'Build foundation for higher mathematics'
      ],
      createdAt: timestamp,
      updatedAt: timestamp
    },
    {
      _id: new ObjectId(),
      name: 'Science Explorer',
      description: 'Comprehensive science education from elementary to advanced',
      subject: 'Science',
      classes: ['class_6', 'class_7', 'class_8', 'class_9', 'class_10'],
      totalChapters: NCERTCurriculum.reduce((total, cls) => {
        const scienceSubject = cls.subjects.find(s => s.name === 'Science');
        return total + (scienceSubject ? scienceSubject.totalChapters : 0);
      }, 0),
      totalHours: NCERTCurriculum.reduce((total, cls) => {
        const scienceSubject = cls.subjects.find(s => s.name === 'Science');
        return total + (scienceSubject ? scienceSubject.totalHours : 0);
      }, 0),
      difficulty: 'progressive',
      prerequisites: ['Basic reading', 'Curiosity about nature'],
      learningOutcomes: [
        'Understand scientific concepts',
        'Develop scientific thinking',
        'Learn experimental skills',
        'Build foundation for specialized sciences'
      ],
      createdAt: timestamp,
      updatedAt: timestamp
    }
  ];

  await db.collection('learning_paths').insertMany(learningPaths);

  // =============================================================================
  // CREATE ASSESSMENT TEMPLATES
  // =============================================================================

  const assessmentTemplates = [
    {
      _id: new ObjectId(),
      name: 'Chapter Assessment Template',
      description: 'Standard assessment template for NCERT chapters',
      type: 'chapter_assessment',
      structure: {
        mcq: {
          count: 10,
          marks: 1,
          totalMarks: 10,
          difficulty: 'mixed'
        },
        shortAnswer: {
          count: 5,
          marks: 2,
          totalMarks: 10,
          difficulty: 'medium'
        },
        longAnswer: {
          count: 2,
          marks: 5,
          totalMarks: 10,
          difficulty: 'hard'
        }
      },
      totalQuestions: 17,
      totalMarks: 30,
      duration: 60, // minutes
      passingMarks: 18,
      createdAt: timestamp,
      updatedAt: timestamp
    },
    {
      _id: new ObjectId(),
      name: 'Unit Test Template',
      description: 'Assessment template for unit tests covering multiple chapters',
      type: 'unit_test',
      structure: {
        mcq: {
          count: 20,
          marks: 1,
          totalMarks: 20,
          difficulty: 'mixed'
        },
        shortAnswer: {
          count: 8,
          marks: 3,
          totalMarks: 24,
          difficulty: 'medium'
        },
        longAnswer: {
          count: 3,
          marks: 6,
          totalMarks: 18,
          difficulty: 'hard'
        }
      },
      totalQuestions: 31,
      totalMarks: 62,
      duration: 120, // minutes
      passingMarks: 37,
      createdAt: timestamp,
      updatedAt: timestamp
    }
  ];

  await db.collection('assessment_templates').insertMany(assessmentTemplates);

  console.log('📚 NCERT Curriculum Migration Summary:');
  console.log(`   Classes: ${NCERTCurriculum.length}`);
  console.log(`   Subjects: ${totalSubjects}`);
  console.log(`   Chapters: ${totalChapters}`);
  console.log(`   Learning Paths: ${learningPaths.length}`);
  console.log(`   Assessment Templates: ${assessmentTemplates.length}`);
  console.log('✅ NCERT Curriculum Migration completed successfully!');
}

export async function down(db: Db): Promise<void> {
  console.log('🔄 Rolling back NCERT Curriculum Migration...');

  // Drop all curriculum-related collections
  const collections = [
    'curriculum_structure',
    'subjects',
    'chapters',
    'curriculum_statistics',
    'learning_paths',
    'assessment_templates'
  ];

  for (const collection of collections) {
    try {
      await db.collection(collection).drop();
      console.log(`✅ Dropped collection: ${collection}`);
    } catch (error) {
      console.log(`⚠️  Collection ${collection} not found, skipping...`);
    }
  }

  console.log('✅ NCERT Curriculum Migration rollback completed!');
}

export const migration = {
  name: '003_ncert_curriculum',
  up,
  down
};