import mongoose from 'mongoose';
import { CosmosClient } from '@azure/cosmos';

class DatabaseConfig {
  private static instance: DatabaseConfig;
  private cosmosClient: CosmosClient | null = null;

  private constructor() {}

  public static getInstance(): DatabaseConfig {
    if (!DatabaseConfig.instance) {
      DatabaseConfig.instance = new DatabaseConfig();
    }
    return DatabaseConfig.instance;
  }

  public async connectMongoDB(): Promise<void> {
    try {
      const connectionString = process.env.MONGODB_URI;

      if (!connectionString) {
        throw new Error('MONGODB_URI is not defined');
      }

      await mongoose.connect(connectionString, {
        maxPoolSize: 50,
        wtimeoutMS: 2500,
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log('✅ MongoDB connection established successfully');

      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
      });
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      process.exit(1);
    }
  }

  public async connectCosmosDB(): Promise<void> {
    try {
      const endpoint = process.env.COSMOS_DB_ENDPOINT;
      const key = process.env.COSMOS_DB_KEY;

      if (!endpoint || !key) {
        throw new Error('Cosmos DB endpoint or key is not defined');
      }

      this.cosmosClient = new CosmosClient({
        endpoint,
        key,
        connectionPolicy: {
          requestTimeout: 60000,
          enableEndpointDiscovery: true,
          preferredLocations: ['East US', 'West US'],
        },
      });

      const { database } = await this.cosmosClient.databases.createIfNotExists({
        id: 'aarambh-ai-db',
      });

      console.log('✅ Cosmos DB connection established successfully');
      console.log(`📁 Database: ${database.id}`);
    } catch (error) {
      console.error('❌ Cosmos DB connection failed:', error);
      throw error;
    }
  }

  public getCosmosClient(): CosmosClient {
    if (!this.cosmosClient) {
      throw new Error('Cosmos DB client not initialized');
    }
    return this.cosmosClient;
  }

  public async disconnectMongoDB(): Promise<void> {
    try {
      await mongoose.disconnect();
      console.log('🔌 MongoDB disconnected successfully');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
    }
  }

  public async healthCheck(): Promise<{ mongodb: boolean; cosmosdb: boolean }> {
    const health = {
      mongodb: false,
      cosmosdb: false,
    };

    try {
      if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
        await mongoose.connection.db.admin().ping();
        health.mongodb = true;
      }
    } catch (error) {
      console.error('MongoDB health check failed:', error);
    }

    try {
      if (this.cosmosClient) {
        await this.cosmosClient.databases.readAll().fetchAll();
        health.cosmosdb = true;
      }
    } catch (error) {
      console.error('Cosmos DB health check failed:', error);
    }

    return health;
  }
}

export default DatabaseConfig;
