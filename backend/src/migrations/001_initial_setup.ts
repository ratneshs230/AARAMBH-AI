/**
 * AARAMBH AI - Initial Database Setup Migration
 * Creates all necessary collections and indexes for the platform
 */

import { MongoClient, Db } from 'mongodb';

export async function up(db: Db): Promise<void> {
  console.log('🚀 Running Initial Setup Migration...');

  // =============================================================================
  // CREATE COLLECTIONS
  // =============================================================================
  
  // Users collection
  await db.createCollection('users', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['email', 'password', 'role', 'createdAt'],
        properties: {
          email: { bsonType: 'string' },
          password: { bsonType: 'string' },
          role: { 
            bsonType: 'string', 
            enum: ['student', 'teacher', 'admin', 'parent'] 
          },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    }
  });

  // Courses collection
  await db.createCollection('courses', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['title', 'description', 'instructor', 'createdAt'],
        properties: {
          title: { bsonType: 'string' },
          description: { bsonType: 'string' },
          instructor: { bsonType: 'object' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    }
  });

  // Lessons collection
  await db.createCollection('lessons', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['courseId', 'title', 'content', 'createdAt'],
        properties: {
          courseId: { bsonType: 'objectId' },
          title: { bsonType: 'string' },
          content: { bsonType: 'object' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    }
  });

  // Assessments collection
  await db.createCollection('assessments', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['courseId', 'title', 'type', 'questions', 'createdAt'],
        properties: {
          courseId: { bsonType: 'objectId' },
          title: { bsonType: 'string' },
          type: { 
            bsonType: 'string', 
            enum: ['quiz', 'test', 'assignment', 'project'] 
          },
          questions: { bsonType: 'array' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    }
  });

  // User Progress collection
  await db.createCollection('user_progress', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'courseId', 'enrollmentDate', 'createdAt'],
        properties: {
          userId: { bsonType: 'objectId' },
          courseId: { bsonType: 'objectId' },
          enrollmentDate: { bsonType: 'date' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    }
  });

  // AI Conversations collection
  await db.createCollection('ai_conversations', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'sessionId', 'conversation', 'createdAt'],
        properties: {
          userId: { bsonType: 'objectId' },
          sessionId: { bsonType: 'string' },
          conversation: { bsonType: 'object' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    }
  });

  // Learning Sessions collection
  await db.createCollection('learning_sessions', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'sessionId', 'startTime', 'createdAt'],
        properties: {
          userId: { bsonType: 'objectId' },
          sessionId: { bsonType: 'string' },
          startTime: { bsonType: 'date' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    }
  });

  // Analytics collection
  await db.createCollection('analytics', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['type', 'data', 'timestamp', 'createdAt'],
        properties: {
          type: { bsonType: 'string' },
          data: { bsonType: 'object' },
          timestamp: { bsonType: 'date' },
          createdAt: { bsonType: 'date' }
        }
      }
    }
  });

  // System Logs collection
  await db.createCollection('system_logs', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['level', 'message', 'timestamp', 'createdAt'],
        properties: {
          level: { 
            bsonType: 'string', 
            enum: ['error', 'warn', 'info', 'debug'] 
          },
          message: { bsonType: 'string' },
          timestamp: { bsonType: 'date' },
          createdAt: { bsonType: 'date' }
        }
      }
    }
  });

  // =============================================================================
  // CREATE INDEXES
  // =============================================================================

  // Users indexes
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('users').createIndex({ role: 1 });
  await db.collection('users').createIndex({ 'subscription.type': 1 });
  await db.collection('users').createIndex({ 'analytics.lastActive': 1 });
  await db.collection('users').createIndex({ createdAt: 1 });

  // Courses indexes
  await db.collection('courses').createIndex({ 'instructor.id': 1 });
  await db.collection('courses').createIndex({ 'content.subject': 1, 'content.level': 1 });
  await db.collection('courses').createIndex({ 'settings.isPublished': 1 });
  await db.collection('courses').createIndex({ 'analytics.enrollmentCount': -1 });
  await db.collection('courses').createIndex({ 'seo.slug': 1 }, { unique: true });

  // Lessons indexes
  await db.collection('lessons').createIndex({ courseId: 1 });
  await db.collection('lessons').createIndex({ courseId: 1, 'structure.order': 1 });
  await db.collection('lessons').createIndex({ 'content.type': 1 });

  // Assessments indexes
  await db.collection('assessments').createIndex({ courseId: 1 });
  await db.collection('assessments').createIndex({ lessonId: 1 });
  await db.collection('assessments').createIndex({ type: 1 });

  // User Progress indexes
  await db.collection('user_progress').createIndex({ userId: 1, courseId: 1 }, { unique: true });
  await db.collection('user_progress').createIndex({ userId: 1 });
  await db.collection('user_progress').createIndex({ 'progress.lastAccessed': 1 });

  // AI Conversations indexes
  await db.collection('ai_conversations').createIndex({ userId: 1, sessionId: 1 });
  await db.collection('ai_conversations').createIndex({ userId: 1 });
  await db.collection('ai_conversations').createIndex({ 'conversation.agentType': 1 });
  await db.collection('ai_conversations').createIndex({ createdAt: 1 });

  // Learning Sessions indexes
  await db.collection('learning_sessions').createIndex({ userId: 1 });
  await db.collection('learning_sessions').createIndex({ sessionId: 1 });
  await db.collection('learning_sessions').createIndex({ startTime: 1 });

  // Analytics indexes
  await db.collection('analytics').createIndex({ type: 1 });
  await db.collection('analytics').createIndex({ timestamp: 1 });
  await db.collection('analytics').createIndex({ 'data.userId': 1 });

  // System Logs indexes
  await db.collection('system_logs').createIndex({ level: 1 });
  await db.collection('system_logs').createIndex({ timestamp: 1 });
  await db.collection('system_logs').createIndex({ createdAt: 1 });

  console.log('✅ Initial Setup Migration completed successfully!');
}

export async function down(db: Db): Promise<void> {
  console.log('🔄 Rolling back Initial Setup Migration...');

  // Drop collections in reverse order
  const collections = [
    'system_logs',
    'analytics', 
    'learning_sessions',
    'ai_conversations',
    'user_progress',
    'assessments',
    'lessons',
    'courses',
    'users'
  ];

  for (const collection of collections) {
    try {
      await db.collection(collection).drop();
      console.log(`✅ Dropped collection: ${collection}`);
    } catch (error) {
      console.log(`⚠️  Collection ${collection} not found, skipping...`);
    }
  }

  console.log('✅ Initial Setup Migration rollback completed!');
}

export const migration = {
  name: '001_initial_setup',
  up,
  down
};