/**
 * AARAMBH AI - Database Migration Runner
 * Handles running and managing database migrations
 */

import { MongoClient, Db } from 'mongodb';
import { migration as migration001 } from './001_initial_setup';
import { migration as migration002 } from './002_seed_data';
import { migration as migration003 } from './003_ncert_curriculum';

interface Migration {
  name: string;
  up: (db: Db) => Promise<void>;
  down: (db: Db) => Promise<void>;
}

interface MigrationRecord {
  name: string;
  executedAt: Date;
  version: string;
}

export class MigrationRunner {
  private client: MongoClient;
  private db: Db;
  private migrations: Migration[] = [
    migration001,
    migration002,
    migration003
  ];

  constructor(mongoUri: string, dbName: string) {
    this.client = new MongoClient(mongoUri);
    this.db = this.client.db(dbName);
  }

  async connect(): Promise<void> {
    await this.client.connect();
    console.log('✅ Connected to MongoDB for migrations');
  }

  async disconnect(): Promise<void> {
    await this.client.close();
    console.log('✅ Disconnected from MongoDB');
  }

  async createMigrationsCollection(): Promise<void> {
    try {
      await this.db.createCollection('migrations', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'executedAt', 'version'],
            properties: {
              name: { bsonType: 'string' },
              executedAt: { bsonType: 'date' },
              version: { bsonType: 'string' }
            }
          }
        }
      });
      console.log('✅ Migrations collection created');
    } catch (error) {
      // Collection might already exist
      console.log('ℹ️  Migrations collection already exists');
    }
  }

  async getExecutedMigrations(): Promise<string[]> {
    const records = await this.db
      .collection<MigrationRecord>('migrations')
      .find({})
      .sort({ executedAt: 1 })
      .toArray();
    
    return records.map(record => record.name);
  }

  async recordMigration(name: string): Promise<void> {
    await this.db.collection('migrations').insertOne({
      name,
      executedAt: new Date(),
      version: '1.0.0'
    });
  }

  async removeMigrationRecord(name: string): Promise<void> {
    await this.db.collection('migrations').deleteOne({ name });
  }

  async up(targetMigration?: string): Promise<void> {
    console.log('🚀 Starting database migrations...');
    
    await this.createMigrationsCollection();
    const executedMigrations = await this.getExecutedMigrations();
    
    const migrationsToRun = this.migrations.filter(migration => {
      const shouldRun = !executedMigrations.includes(migration.name);
      if (targetMigration) {
        return shouldRun && migration.name <= targetMigration;
      }
      return shouldRun;
    });

    if (migrationsToRun.length === 0) {
      console.log('✅ No migrations to run');
      return;
    }

    console.log(`📋 Found ${migrationsToRun.length} migrations to run`);

    for (const migration of migrationsToRun) {
      try {
        console.log(`🔄 Running migration: ${migration.name}`);
        await migration.up(this.db);
        await this.recordMigration(migration.name);
        console.log(`✅ Migration ${migration.name} completed`);
      } catch (error) {
        console.error(`❌ Migration ${migration.name} failed:`, error);
        throw error;
      }
    }

    console.log('🎉 All migrations completed successfully!');
  }

  async down(targetMigration?: string): Promise<void> {
    console.log('🔄 Rolling back database migrations...');
    
    const executedMigrations = await this.getExecutedMigrations();
    
    const migrationsToRollback = this.migrations
      .filter(migration => executedMigrations.includes(migration.name))
      .reverse(); // Run in reverse order

    if (targetMigration) {
      const targetIndex = migrationsToRollback.findIndex(m => m.name === targetMigration);
      if (targetIndex === -1) {
        console.log(`⚠️  Target migration ${targetMigration} not found`);
        return;
      }
      migrationsToRollback.splice(targetIndex + 1);
    }

    if (migrationsToRollback.length === 0) {
      console.log('✅ No migrations to rollback');
      return;
    }

    console.log(`📋 Found ${migrationsToRollback.length} migrations to rollback`);

    for (const migration of migrationsToRollback) {
      try {
        console.log(`🔄 Rolling back migration: ${migration.name}`);
        await migration.down(this.db);
        await this.removeMigrationRecord(migration.name);
        console.log(`✅ Migration ${migration.name} rolled back`);
      } catch (error) {
        console.error(`❌ Migration ${migration.name} rollback failed:`, error);
        throw error;
      }
    }

    console.log('🎉 All migrations rolled back successfully!');
  }

  async status(): Promise<void> {
    console.log('📊 Migration Status:');
    console.log('===================');
    
    const executedMigrations = await this.getExecutedMigrations();
    
    for (const migration of this.migrations) {
      const status = executedMigrations.includes(migration.name) ? '✅ Applied' : '⏳ Pending';
      console.log(`${status} - ${migration.name}`);
    }
    
    console.log(`\n📈 Total migrations: ${this.migrations.length}`);
    console.log(`✅ Applied: ${executedMigrations.length}`);
    console.log(`⏳ Pending: ${this.migrations.length - executedMigrations.length}`);
  }

  async reset(): Promise<void> {
    console.log('🔄 Resetting database...');
    
    // Get all executed migrations in reverse order
    const executedMigrations = await this.getExecutedMigrations();
    const migrationsToRollback = this.migrations
      .filter(migration => executedMigrations.includes(migration.name))
      .reverse();

    // Rollback all migrations
    for (const migration of migrationsToRollback) {
      try {
        console.log(`🔄 Rolling back migration: ${migration.name}`);
        await migration.down(this.db);
        await this.removeMigrationRecord(migration.name);
        console.log(`✅ Migration ${migration.name} rolled back`);
      } catch (error) {
        console.error(`❌ Migration ${migration.name} rollback failed:`, error);
        throw error;
      }
    }

    // Drop migrations collection
    try {
      await this.db.collection('migrations').drop();
      console.log('✅ Migrations collection dropped');
    } catch (error) {
      console.log('ℹ️  Migrations collection not found');
    }

    console.log('🎉 Database reset completed!');
  }
}

// CLI Command handler
export async function runMigrations(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const dbName = process.env.MONGODB_DB_NAME || 'aarambh_ai_dev';
  const command = process.argv[2] || 'up';
  const target = process.argv[3];

  const runner = new MigrationRunner(mongoUri, dbName);

  try {
    await runner.connect();

    switch (command) {
      case 'up':
        await runner.up(target);
        break;
      case 'down':
        await runner.down(target);
        break;
      case 'status':
        await runner.status();
        break;
      case 'reset':
        await runner.reset();
        break;
      default:
        console.log('Usage: npm run migrate [up|down|status|reset] [target-migration]');
        break;
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await runner.disconnect();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}