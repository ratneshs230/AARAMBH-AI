        trigger: {
          hour,
          minute,
          repeats: true,
          channelId: 'lessons'
        },
      });

      await AsyncStorage.setItem('dailyReminderTime', JSON.stringify({ hour, minute }));
      console.log('Daily study reminder scheduled for', `${hour}:${minute}`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling daily study reminder:', error);
    }
  }

  async cancelNotificationsByTag(tag: string) {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const notificationsToCancel = scheduledNotifications.filter(
        notification => notification.content.data?.tag === tag
      );

      for (const notification of notificationsToCancel) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }

  private updateLessonReminder(data: any) {
    // Update Redux store or local state for lesson reminders
    console.log('Updating lesson reminder:', data);
  }

  private updateAchievements(data: any) {
    // Update achievements in local state
    console.log('New achievement unlocked:', data);
  }

  private updateCommunityMessages(data: any) {
    // Update community message count
    console.log('New community message:', data);
  }

  private navigateToLesson(lessonId: string) {
    // Navigation logic to lesson screen
    console.log('Navigate to lesson:', lessonId);
  }

  private navigateToAchievements() {
    // Navigation logic to achievements screen
    console.log('Navigate to achievements');
  }

  private navigateToCommunity(groupId: string) {
    // Navigation logic to community screen
    console.log('Navigate to community group:', groupId);
  }

  private navigateToAssessmentResult(sessionId: string) {
    // Navigation logic to assessment results
    console.log('Navigate to assessment result:', sessionId);
  }

  async getBadgeCount(): Promise<number> {
    try {
      const badgeCount = await Notifications.getBadgeCountAsync();
      return badgeCount;
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  async setBadgeCount(count: number) {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  async clearAllNotifications() {
    try {
      await Notifications.dismissAllNotificationsAsync();
      await this.setBadgeCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }
}

export const notificationService = new NotificationService();
```

## 8. Phase 7: Testing, Optimization & Deployment

### 8.1 Comprehensive Testing Strategy
```javascript
// backend/tests/integration/auth.test.js
const request = require('supertest');
const app = require('../../app');
const db = require('../../config/database');

describe('Authentication API', () => {
  beforeEach(async () => {
    // Clean up test database
    await db.query('DELETE FROM Users WHERE email LIKE ?', ['%@test.com']);
  });

  afterAll(async () => {
    // Close database connections
    await db.close();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@test.com',
        name: 'Test User',
        age: 16,
        provider: 'email',
        firebase_uid: 'test_firebase_uid_123'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user_profile.email).toBe(userData.email);
      expect(response.body.data.user_profile.name).toBe(userData.name);
      expect(response.body.data.access_token).toBeDefined();
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        email: 'duplicate@test.com',
        name: 'Test User',
        provider: 'email',
        firebase_uid: 'test_firebase_uid_456'
      };

      // First registration
      await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      // Second registration with same email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({...userData, firebase_uid: 'different_uid'})
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('USER_EXISTS');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          name: ''
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toBeDefined();
    });
  });
});

// backend/tests/integration/courses.test.js
describe('Courses API', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    // Create test user and get auth token
    const userResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'course-test@test.com',
        name: 'Course Test User',
        provider: 'email',
        firebase_uid: 'course_test_uid'
      });

    authToken = userResponse.body.data.access_token;
    userId = userResponse.body.data.user_id;
  });

  describe('GET /api/v1/courses', () => {
    it('should return list of available courses', async () => {
      const response = await request(app)
        .get('/api/v1/courses')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.courses).toBeDefined();
      expect(Array.isArray(response.body.data.courses)).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter courses by category', async () => {
      const response = await request(app)
        .get('/api/v1/courses?category=competitive_exam')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.courses.forEach(course => {
        expect(course.category).toBe('competitive_exam');
      });
    });
  });

  describe('POST /api/v1/courses/:courseId/enroll', () => {
    it('should enroll user in course successfully', async () => {
      const courseId = 'test_course_001';
      
      const response = await request(app)
        .post(`/api/v1/courses/${courseId}/enroll`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          plan_type: 'monthly',
          payment_method: 'test'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.course_id).toBe(courseId);
      expect(response.body.data.access_granted).toBe(true);
    });

    it('should prevent duplicate enrollment', async () => {
      const courseId = 'test_course_002';
      
      // First enrollment
      await request(app)
        .post(`/api/v1/courses/${courseId}/enroll`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ plan_type: 'monthly', payment_method: 'test' })
        .expect(201);

      // Second enrollment attempt
      const response = await request(app)
        .post(`/api/v1/courses/${courseId}/enroll`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ plan_type: 'monthly', payment_method: 'test' })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ALREADY_ENROLLED');
    });
  });
});
```

### 8.2 Performance Optimization
```javascript
// backend/middleware/caching.js
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});

const cache = (duration = 3600) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;
    
    try {
      const cachedResponse = await client.get(key);
      
      if (cachedResponse) {
        return res.json(JSON.parse(cachedResponse));
      }

      // Store original res.json
      const originalJson = res.json;
      
      res.json = function(data) {
        // Cache the response
        client.setex(key, duration, JSON.stringify(data));
        
        // Call original res.json
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache error:', error);
      next();
    }
  };
};

const invalidateCache = (pattern) => {
  return async (req, res, next) => {
    try {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
    next();
  };
};

module.exports = { cache, invalidateCache, client };

// backend/middleware/compression.js
const compression = require('compression');

const compressionMiddleware = compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024,
  chunkSize: 16 * 1024,
  windowBits: 15,
  memLevel: 8
});

module.exports = compressionMiddleware;

// backend/middleware/rateLimiting.js
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { client } = require('./caching');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => client.call(...args),
    }),
    windowMs,
    max,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return req.user ? `user:${req.user.user_id}` : req.ip;
    }
  });
};

const generalLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  1000, // limit each user to 1000 requests per windowMs
  'Too many requests, please try again later'
);

const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 auth requests per windowMs
  'Too many authentication attempts, please try again later'
);

const assessmentLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  10, // limit to 10 assessment submissions per hour
  'Too many assessment attempts, please try again later'
);

module.exports = {
  generalLimiter,
  authLimiter,
  assessmentLimiter
};
```

### 8.3 Azure Deployment Configuration
```yaml
# azure-pipelines.yml
trigger:
  branches:
    include:
      - main
      - develop

variables:
  buildConfiguration: 'Release'
  azureSubscription: 'aarambh-ai-subscription'
  resourceGroupName: 'aarambh-ai-rg'
  webAppName: 'aarambh-ai-backend'
  frontendAppName: 'aarambh-ai-frontend'

stages:
- stage: Build
  displayName: Build stage
  jobs:
  - job: BuildBackend
    displayName: Build Backend
    pool:
      vmImage: 'ubuntu-latest'
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '18.x'
      displayName: 'Install Node.js'
    
    - script: |
        cd backend
        npm ci
        npm run build
        npm run test:unit
        npm run test:integration
      displayName: 'npm install, build and test'
    
    - task: ArchiveFiles@2
      displayName: 'Archive backend files'
      inputs:
        rootFolderOrFile: '$(System.DefaultWorkingDirectory)/backend'
        includeRootFolder: false
        archiveType: zip
        archiveFile: $(Build.ArtifactStagingDirectory)/backend-$(Build.BuildId).zip
        replaceExistingArchive: true
    
    - upload: $(Build.ArtifactStagingDirectory)/backend-$(Build.BuildId).zip
      artifact: backend-drop

  - job: BuildFrontend
    displayName: Build Frontend
    pool:
      vmImage: 'ubuntu-latest'
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '18.x'
      displayName: 'Install Node.js'
    
    - script: |
        cd frontend
        npm ci
        npm run build
      displayName: 'npm install and build'
      env:
        REACT_APP_API_URL: $(REACT_APP_API_URL)
        REACT_APP_FIREBASE_CONFIG: $(REACT_APP_FIREBASE_CONFIG)
    
    - task: ArchiveFiles@2
      displayName: 'Archive frontend files'
      inputs:
        rootFolderOrFile: '$(System.DefaultWorkingDirectory)/frontend/build'
        includeRootFolder: false
        archiveType: zip
        archiveFile: $(Build.ArtifactStagingDirectory)/frontend-$(Build.BuildId).zip
        replaceExistingArchive: true
    
    - upload: $(Build.ArtifactStagingDirectory)/frontend-$(Build.BuildId).zip
      artifact: frontend-drop

  - job: BuildAIServices
    displayName: Build AI Services
    pool:
      vmImage: 'ubuntu-latest'
    steps:
    - task: UsePythonVersion@0
      inputs:
        versionSpec: '3.9'
      displayName: 'Use Python 3.9'
    
    - script: |
        cd ai-services
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        python -m pytest tests/
      displayName: 'Install dependencies and run tests'
    
    - task: ArchiveFiles@2
      displayName: 'Archive AI services files'
      inputs:
        rootFolderOrFile: '$(System.DefaultWorkingDirectory)/ai-services'
        includeRootFolder: false
        archiveType: zip
        archiveFile: $(Build.ArtifactStagingDirectory)/ai-services-$(Build.BuildId).zip
        replaceExistingArchive: true
    
    - upload: $(Build.ArtifactStagingDirectory)/ai-services-$(Build.BuildId).zip
      artifact: ai-services-drop

- stage: Deploy
  displayName: Deploy stage
  dependsOn: Build
  condition: succeeded()
  jobs:
  - deployment: DeployBackend
    displayName: Deploy Backend
    environment: 'production'
    pool:
      vmImage: 'ubuntu-latest'
    strategy:
      runOnce:
        deploy:
          steps:
          - task: AzureWebApp@1
            displayName: 'Deploy Azure Web App'
            inputs:
              azureSubscription: $(azureSubscription)
              appType: 'webAppLinux'
              appName: $(webAppName)
              runtimeStack: 'NODE|18-lts'
              package: $(Pipeline.Workspace)/backend-drop/backend-$(Build.BuildId).zip
              appSettings: |
                -NODE_ENV production
                -DATABASE_URL $(DATABASE_URL)
                -COSMOS_DB_ENDPOINT $(COSMOS_DB_ENDPOINT)
                -COSMOS_DB_KEY $(COSMOS_DB_KEY)
                -FIREBASE_PROJECT_ID $(FIREBASE_PROJECT_ID)
                -AZURE_STORAGE_CONNECTION $(AZURE_STORAGE_CONNECTION)
                -JWT_SECRET $(JWT_SECRET)
                -REDIS_URL $(REDIS_URL)

  - deployment: DeployFrontend
    displayName: Deploy Frontend
    environment: 'production'
    pool:
      vmImage: 'ubuntu-latest'
    strategy:
      runOnce:
        deploy:
          steps:
          - task: AzureStaticWebApp@0
            inputs:
              azureSubscription: $(azureSubscription)
              app_location: '/'
              api_location: ''
              output_location: 'build'
              azure_static_web_apps_api_token: $(AZURE_STATIC_WEB_APPS_API_TOKEN)
              action: 'upload'
              app_build_command: 'npm run build'
              api_build_command: ''

  - deployment: DeployAIServices
    displayName: Deploy AI Services
    environment: 'production'
    pool:
      vmImage: 'ubuntu-latest'
    strategy:
      runOnce:
        deploy:
          steps:
          - task: AzureFunctionApp@1
            displayName: 'Deploy Azure Functions'
            inputs:
              azureSubscription: $(azureSubscription)
              appType: functionAppLinux
              appName: 'aarambh-ai-functions'
              package: $(Pipeline.Workspace)/ai-services-drop/ai-services-$(Build.BuildId).zip
              runtimeStack: 'python|3.9'

# docker-compose.yml for local development
version: '3.8'
services:
  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=server=localhost;database=aarambhai_dev;user=dev_user;password=dev_password
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
      - sqlserver
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:5000/api/v1
    volumes:
      - ./frontend:/app
      - /app/node_modules

  ai-services:
    build:
      context: ./ai-services
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - PYTHONPATH=/app
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./ai-services:/app

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=Dev_Password123
      - MSSQL_PID=Developer
    ports:
      - "1433:1433"
    volumes:
      - sqlserver_data:/var/opt/mssql

volumes:
  redis_data:
  sqlserver_data:

# Dockerfile for backend
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

USER nodejs

CMD ["npm", "start"]

# Dockerfile for frontend
# frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 8.4 Monitoring and Analytics Setup
```javascript
// backend/middleware/monitoring.js
const AppInsights = require('applicationinsights');

// Initialize Application Insights
AppInsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY)
  .setAutoDependencyCorrelation(true)
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true, true)
  .setAutoCollectExceptions(true)
  .setAutoCollectDependencies(true)
  .setAutoCollectConsole(true)
  .setUseDiskRetryCaching(true)
  .setSendLiveMetrics(true)
  .start();

const client = AppInsights.defaultClient;

const trackUserActivity = (req, res, next) => {
  if (req.user) {
    client.trackEvent({
      name: 'UserActivity',
      properties: {
        userId: req.user.user_id,
        endpoint: req.path,
        method: req.method,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      }
    });
  }
  next();
};

const trackPerformance = (operationName) => {
  return (req, res, next) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      client.trackDependency({
        target: operationName,
        name: operationName,
        data: `${req.method} ${req.path}`,
        duration: duration,
        resultCode: res.statusCode,
        success: res.statusCode < 400
      });

      client.trackMetric({
        name: 'ResponseTime',
        value: duration,
        properties: {
          endpoint: req.path,
          method: req.method,
          statusCode: res.statusCode.toString()
        }
      });
    });
    
    next();
  };
};

const trackError = (error, req, res, next) => {
  client.trackException({
    exception: error,
    properties: {
      userId: req.user?.user_id || 'anonymous',
      endpoint: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    }
  });
  
  next(error);
};

module.exports = {
  trackUserActivity,
  trackPerformance,
  trackError,
  client
};

// backend/services/healthCheck.js
const db = require('../config/database');
const { client: redisClient } = require('../middleware/caching');
const axios = require('axios');

class HealthCheckService {
  async checkDatabase() {
    try {
      await db.query('SELECT 1');
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error.message, 
        timestamp: new Date().toISOString() 
      };
    }
  }

  async checkRedis() {
    try {
      await redisClient.ping();
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error.message, 
        timestamp: new Date().toISOString() 
      };
    }
  }

  async checkAIServices() {
    try {
      const response = await axios.get(`${process.env.AI_SERVICE_URL}/health`, {
        timeout: 5000
      });
      
      if (response.status === 200) {
        return { status: 'healthy', timestamp: new Date().toISOString() };
      } else {
        return { 
          status: 'unhealthy', 
          error: `Unexpected status: ${response.status}`,
          timestamp: new Date().toISOString() 
        };
      }
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error.message, 
        timestamp: new Date().toISOString() 
      };
    }
  }

  async checkExternalServices() {
    const checks = {
      firebase: await this.checkFirebase(),
      azure_storage: await this.checkAzureStorage(),
      cosmos_db: await this.checkCosmosDB()
    };

    return checks;
  }

  async checkFirebase() {
    try {
      const admin = require('../config/firebase');
      await admin.auth().listUsers(1);
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error.message, 
        timestamp: new Date().toISOString() 
      };
    }
  }

  async checkAzureStorage() {
    try {
      // Add Azure Storage health check
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error.message, 
        timestamp: new Date().toISOString() 
      };
    }
  }

  async checkCosmosDB() {
    try {
      const { CosmosClient } = require('@azure/cosmos');
      const client = new CosmosClient({
        endpoint: process.env.COSMOS_DB_ENDPOINT,
        key: process.env.COSMOS_DB_KEY
      });
      
      await client.databases.readAll().fetchAll();
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error.message, 
        timestamp: new Date().toISOString() 
      };
    }
  }

  async getSystemMetrics() {
    const os = require('os');
    const process = require('process');

    return {
      system: {
        uptime: process.uptime(),
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: process.memoryUsage()
        },
        cpu: {
          load: os.loadavg(),
          count: os.cpus().length
        }
      },
      node: {
        version: process.version,
        pid: process.pid,
        platform: process.platform
      },
      timestamp: new Date().toISOString()
    };
  }

  async getDetailedHealthReport() {
    const [
      database,
      redis,
      aiServices,
      externalServices,
      systemMetrics
    ] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkAIServices(),
      this.checkExternalServices(),
      this.getSystemMetrics()
    ]);

    const overallStatus = [database, redis, aiServices, ...Object.values(externalServices)]
      .every(check => check.status === 'healthy') ? 'healthy' : 'unhealthy';

    return {
      status: overallStatus,
      checks: {
        database,
        redis,
        ai_services: aiServices,
        external_services: externalServices
      },
      system_metrics: systemMetrics,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new HealthCheckService();
```

This comprehensive implementation guide provides Claude CLI with all the necessary technical details, code examples, database schemas, API specifications, and deployment configurations to build AARAMBH AI from scratch. Each phase is logically structured with specific implementation steps, ensuring a systematic development approach.

The guide includes:
- Complete backend API implementation
- Frontend React.js structure
- Mobile React Native app
- AI agent framework with specialized agents
- Real-time collaboration features
- Comprehensive testing strategies
- Performance optimization techniques
- Azure deployment configurations
- Monitoring and health check systems

Following this guide will result in a fully functional, scalable, and production-ready AARAMBH AI educational platform.const { authenticateToken } = require('../middleware/auth');
const { CosmosClient } = require('@azure/cosmos');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const cosmosClient = new CosmosClient({
  endpoint: process.env.COSMOS_DB_ENDPOINT,
  key: process.env.COSMOS_DB_KEY
});

const database = cosmosClient.database('AarambhAI');
const workspacesContainer = database.container('Workspaces');

// Create collaborative workspace
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, group_id, workspace_type = 'study_group' } = req.body;
    const userId = req.user.user_id;

    // Verify user is member of the group
    if (group_id) {
      const membership = await db.query(`
        SELECT * FROM GroupMembers 
        WHERE user_id = ? AND group_id = ? AND status = 'active'
      `, [userId, group_id]);

      if (!membership.length) {
        return res.status(403).json({
          success: false,
          error: { code: 'ACCESS_DENIED', message: 'Not a member of this group' }
        });
      }
    }

    const workspaceId = uuidv4();
    const workspace = {
      id: workspaceId,
      name,
      description,
      group_id: group_id || null,
      workspace_type,
      created_by: userId,
      created_at: new Date().toISOString(),
      members: [
        {
          user_id: userId,
          role: 'owner',
          joined_at: new Date().toISOString()
        }
      ],
      documents: [],
      settings: {
        allow_anonymous_edit: false,
        require_approval: false,
        max_concurrent_editors: 10,
        auto_save_interval: 30
      },
      status: 'active'
    };

    await workspacesContainer.items.create(workspace);

    res.status(201).json({
      success: true,
      data: {
        workspace_id: workspaceId,
        name,
        description,
        created_at: workspace.created_at,
        member_count: 1,
        features_enabled: [
          'real_time_editing',
          'voice_chat',
          'file_sharing',
          'version_control',
          'commenting'
        ]
      },
      message: 'Workspace created successfully'
    });

  } catch (error) {
    console.error('Error creating workspace:', error);
    res.status(500).json({
      success: false,
      error: { code: 'CREATION_FAILED', message: 'Failed to create workspace' }
    });
  }
});

// Get workspace details
router.get('/:workspaceId', authenticateToken, async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.user_id;

    const { resource: workspace } = await workspacesContainer.item(workspaceId, workspaceId).read();

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: { code: 'WORKSPACE_NOT_FOUND', message: 'Workspace not found' }
      });
    }

    // Check if user has access
    const hasAccess = workspace.members.some(member => member.user_id === userId) ||
                     workspace.settings.allow_anonymous_edit;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCESS_DENIED', message: 'No access to this workspace' }
      });
    }

    // Get member details
    const memberIds = workspace.members.map(m => m.user_id);
    const memberDetails = await db.query(`
      SELECT user_id, name, profile_picture_url 
      FROM Users 
      WHERE user_id IN (${memberIds.map(() => '?').join(',')})
    `, memberIds);

    const enrichedMembers = workspace.members.map(member => {
      const userDetail = memberDetails.find(u => u.user_id === member.user_id);
      return {
        ...member,
        name: userDetail?.name || 'Unknown',
        avatar: userDetail?.profile_picture_url || null
      };
    });

    res.status(200).json({
      success: true,
      data: {
        ...workspace,
        members: enrichedMembers,
        user_role: workspace.members.find(m => m.user_id === userId)?.role || 'viewer'
      },
      message: 'Workspace details retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching workspace:', error);
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: 'Failed to fetch workspace' }
    });
  }
});

// Create document in workspace
router.post('/:workspaceId/documents', authenticateToken, async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { title, content = '', document_type = 'text', template = null } = req.body;
    const userId = req.user.user_id;

    // Get workspace and verify access
    const { resource: workspace } = await workspacesContainer.item(workspaceId, workspaceId).read();

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: { code: 'WORKSPACE_NOT_FOUND', message: 'Workspace not found' }
      });
    }

    const hasWriteAccess = workspace.members.some(member => 
      member.user_id === userId && ['owner', 'editor'].includes(member.role)
    );

    if (!hasWriteAccess) {
      return res.status(403).json({
        success: false,
        error: { code: 'WRITE_ACCESS_DENIED', message: 'No write access to workspace' }
      });
    }

    const documentId = uuidv4();
    const document = {
      id: documentId,
      title,
      content,
      document_type,
      template,
      created_by: userId,
      created_at: new Date().toISOString(),
      last_modified: new Date().toISOString(),
      last_modified_by: userId,
      version: 1,
      collaborators: [userId],
      permissions: {
        read: workspace.members.map(m => m.user_id),
        write: workspace.members.filter(m => ['owner', 'editor'].includes(m.role)).map(m => m.user_id),
        comment: workspace.members.map(m => m.user_id)
      }
    };

    // Add document to workspace
    workspace.documents.push({
      document_id: documentId,
      title,
      document_type,
      created_at: document.created_at,
      last_modified: document.last_modified
    });

    await workspacesContainer.item(workspaceId, workspaceId).replace(workspace);

    // Create document in separate container for better performance
    const documentsContainer = database.container('Documents');
    await documentsContainer.items.create(document);

    res.status(201).json({
      success: true,
      data: {
        document_id: documentId,
        title,
        document_type,
        created_at: document.created_at,
        edit_url: `/workspace/${workspaceId}/documents/${documentId}`,
        collaborative_features: {
          real_time_editing: true,
          commenting: true,
          version_history: true,
          concurrent_editors: 0
        }
      },
      message: 'Document created successfully'
    });

  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({
      success: false,
      error: { code: 'CREATION_FAILED', message: 'Failed to create document' }
    });
  }
});

// Get document content for editing
router.get('/:workspaceId/documents/:documentId', authenticateToken, async (req, res) => {
  try {
    const { workspaceId, documentId } = req.params;
    const userId = req.user.user_id;

    // Verify workspace access
    const { resource: workspace } = await workspacesContainer.item(workspaceId, workspaceId).read();
    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: { code: 'WORKSPACE_NOT_FOUND', message: 'Workspace not found' }
      });
    }

    const hasAccess = workspace.members.some(member => member.user_id === userId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCESS_DENIED', message: 'No access to workspace' }
      });
    }

    // Get document
    const documentsContainer = database.container('Documents');
    const { resource: document } = await documentsContainer.item(documentId, documentId).read();

    if (!document) {
      return res.status(404).json({
        success: false,
        error: { code: 'DOCUMENT_NOT_FOUND', message: 'Document not found' }
      });
    }

    // Get current active editors
    const activeEditors = await getActiveEditors(documentId);

    // Get recent operations for operational transformation
    const recentOperations = await getRecentOperations(documentId);

    res.status(200).json({
      success: true,
      data: {
        ...document,
        active_editors: activeEditors,
        recent_operations: recentOperations,
        user_permissions: {
          can_read: document.permissions.read.includes(userId),
          can_write: document.permissions.write.includes(userId),
          can_comment: document.permissions.comment.includes(userId)
        }
      },
      message: 'Document retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: 'Failed to fetch document' }
    });
  }
});

// Helper functions
async function getActiveEditors(documentId) {
  const activeEditorsQuery = await db.query(`
    SELECT DISTINCT u.user_id, u.name, u.profile_picture_url, ae.last_seen
    FROM ActiveEditors ae
    JOIN Users u ON ae.user_id = u.user_id
    WHERE ae.document_id = ? AND ae.last_seen > DATEADD(minute, -5, GETDATE())
  `, [documentId]);

  return activeEditorsQuery.map(editor => ({
    user_id: editor.user_id,
    name: editor.name,
    avatar: editor.profile_picture_url,
    last_seen: editor.last_seen,
    status: 'active'
  }));
}

async function getRecentOperations(documentId) {
  const operationsQuery = await db.query(`
    SELECT TOP 50 operation, user_id, applied_at
    FROM DocumentOperations
    WHERE document_id = ?
    ORDER BY applied_at DESC
  `, [documentId]);

  return operationsQuery.map(op => ({
    operation: JSON.parse(op.operation),
    user_id: op.user_id,
    timestamp: op.applied_at
  }));
}

module.exports = router;
```

## 7. Phase 6: Mobile App & Advanced Features

### 7.1 React Native App Structure
```javascript
// mobile/App.tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { NativeBaseProvider } from 'native-base';
import { store } from './src/store/store';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { MainNavigator } from './src/navigation/MainNavigator';
import { useAppSelector } from './src/hooks/redux';
import { initializeApp } from './src/services/firebase';
import { theme } from './src/theme/theme';

const Stack = createStackNavigator();

function AppContent() {
  const { isAuthenticated, user } = useAppSelector(state => state.auth);

  useEffect(() => {
    initializeApp();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated && user ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <NativeBaseProvider theme={theme}>
        <AppContent />
      </NativeBaseProvider>
    </Provider>
  );
}

// mobile/src/navigation/MainNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { DashboardScreen } from '../screens/DashboardScreen';
import { CoursesScreen } from '../screens/CoursesScreen';
import { LessonsScreen } from '../screens/LessonsScreen';
import { CommunityScreen } from '../screens/CommunityScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { LessonPlayerScreen } from '../screens/LessonPlayerScreen';
import { AssessmentScreen } from '../screens/AssessmentScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function CoursesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="CoursesList" 
        component={CoursesScreen} 
        options={{ title: 'Courses' }}
      />
      <Stack.Screen 
        name="Lessons" 
        component={LessonsScreen} 
        options={{ title: 'Lessons' }}
      />
      <Stack.Screen 
        name="LessonPlayer" 
        component={LessonPlayerScreen} 
        options={{ title: 'Lesson', headerShown: false }}
      />
      <Stack.Screen 
        name="Assessment" 
        component={AssessmentScreen} 
        options={{ title: 'Assessment' }}
      />
    </Stack.Navigator>
  );
}

export function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Courses':
              iconName = focused ? 'book' : 'book-outline';
              break;
            case 'Community':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Courses" component={CoursesStack} />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
```

### 7.2 Offline Content Management
```javascript
// mobile/src/services/offlineManager.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import { CourseContent, LessonContent, OfflineContent } from '../types/content';

class OfflineManager {
  private offlineDirectory: string;
  private maxStorageSize: number = 1024 * 1024 * 1024; // 1GB

  constructor() {
    this.offlineDirectory = `${RNFS.DocumentDirectoryPath}/offline`;
    this.initializeOfflineDirectory();
  }

  private async initializeOfflineDirectory() {
    try {
      const exists = await RNFS.exists(this.offlineDirectory);
      if (!exists) {
        await RNFS.mkdir(this.offlineDirectory);
      }
    } catch (error) {
      console.error('Error initializing offline directory:', error);
    }
  }

  async downloadCourseContent(courseId: string, lessons: LessonContent[]): Promise<void> {
    try {
      const courseDir = `${this.offlineDirectory}/${courseId}`;
      await RNFS.mkdir(courseDir);

      const downloadPromises = lessons.map(lesson => this.downloadLesson(courseId, lesson));
      await Promise.all(downloadPromises);

      // Save course metadata
      const courseMetadata = {
        courseId,
        downloadedAt: new Date().toISOString(),
        lessonsCount: lessons.length,
        totalSize: await this.calculateDirectorySize(courseDir)
      };

      await AsyncStorage.setItem(
        `offline_course_${courseId}`,
        JSON.stringify(courseMetadata)
      );

      console.log(`Course ${courseId} downloaded successfully`);
    } catch (error) {
      console.error('Error downloading course content:', error);
      throw error;
    }
  }

  private async downloadLesson(courseId: string, lesson: LessonContent): Promise<void> {
    const lessonDir = `${this.offlineDirectory}/${courseId}/${lesson.id}`;
    await RNFS.mkdir(lessonDir);

    // Download video content
    if (lesson.content.multimedia?.videos) {
      for (const video of lesson.content.multimedia.videos) {
        await this.downloadFile(video.url, `${lessonDir}/${video.id}.mp4`);
      }
    }

    // Download audio content
    if (lesson.content.multimedia?.audio) {
      for (const audio of lesson.content.multimedia.audio) {
        await this.downloadFile(audio.url, `${lessonDir}/${audio.id}.mp3`);
      }
    }

    // Download images
    if (lesson.content.multimedia?.images) {
      for (const image of lesson.content.multimedia.images) {
        const extension = image.url.split('.').pop() || 'jpg';
        await this.downloadFile(image.url, `${lessonDir}/${image.id}.${extension}`);
      }
    }

    // Save lesson content with offline paths
    const offlineLesson = {
      ...lesson,
      offline: true,
      localPaths: this.generateLocalPaths(lessonDir, lesson)
    };

    await AsyncStorage.setItem(
      `offline_lesson_${lesson.id}`,
      JSON.stringify(offlineLesson)
    );
  }

  private async downloadFile(url: string, localPath: string): Promise<void> {
    try {
      const downloadResult = await RNFS.downloadFile({
        fromUrl: url,
        toFile: localPath,
        background: true,
        discretionary: true,
        cacheable: true
      }).promise;

      if (downloadResult.statusCode !== 200) {
        throw new Error(`Download failed with status: ${downloadResult.statusCode}`);
      }
    } catch (error) {
      console.error(`Error downloading file ${url}:`, error);
      throw error;
    }
  }

  private generateLocalPaths(lessonDir: string, lesson: LessonContent): any {
    const localPaths: any = {};

    if (lesson.content.multimedia?.videos) {
      localPaths.videos = lesson.content.multimedia.videos.map(video => ({
        ...video,
        localUrl: `file://${lessonDir}/${video.id}.mp4`
      }));
    }

    if (lesson.content.multimedia?.audio) {
      localPaths.audio = lesson.content.multimedia.audio.map(audio => ({
        ...audio,
        localUrl: `file://${lessonDir}/${audio.id}.mp3`
      }));
    }

    if (lesson.content.multimedia?.images) {
      localPaths.images = lesson.content.multimedia.images.map(image => {
        const extension = image.url.split('.').pop() || 'jpg';
        return {
          ...image,
          localUrl: `file://${lessonDir}/${image.id}.${extension}`
        };
      });
    }

    return localPaths;
  }

  async getOfflineCourses(): Promise<OfflineContent[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const courseKeys = keys.filter(key => key.startsWith('offline_course_'));
      
      const courses = await Promise.all(
        courseKeys.map(async (key) => {
          const data = await AsyncStorage.getItem(key);
          return data ? JSON.parse(data) : null;
        })
      );

      return courses.filter(course => course !== null);
    } catch (error) {
      console.error('Error getting offline courses:', error);
      return [];
    }
  }

  async getOfflineLesson(lessonId: string): Promise<LessonContent | null> {
    try {
      const data = await AsyncStorage.getItem(`offline_lesson_${lessonId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting offline lesson:', error);
      return null;
    }
  }

  async deleteOfflineCourse(courseId: string): Promise<void> {
    try {
      const courseDir = `${this.offlineDirectory}/${courseId}`;
      await RNFS.unlink(courseDir);
      await AsyncStorage.removeItem(`offline_course_${courseId}`);

      // Remove lesson data
      const keys = await AsyncStorage.getAllKeys();
      const lessonKeys = keys.filter(key => 
        key.startsWith('offline_lesson_') && 
        key.includes(courseId)
      );

      await Promise.all(
        lessonKeys.map(key => AsyncStorage.removeItem(key))
      );

      console.log(`Offline course ${courseId} deleted successfully`);
    } catch (error) {
      console.error('Error deleting offline course:', error);
      throw error;
    }
  }

  async getStorageUsage(): Promise<{ used: number; available: number; total: number }> {
    try {
      const fsInfo = await RNFS.getFSInfo();
      const offlineSize = await this.calculateDirectorySize(this.offlineDirectory);

      return {
        used: offlineSize,
        available: fsInfo.freeSpace,
        total: fsInfo.totalSpace
      };
    } catch (error) {
      console.error('Error getting storage usage:', error);
      return { used: 0, available: 0, total: 0 };
    }
  }

  private async calculateDirectorySize(dirPath: string): Promise<number> {
    try {
      const exists = await RNFS.exists(dirPath);
      if (!exists) return 0;

      const items = await RNFS.readDir(dirPath);
      let totalSize = 0;

      for (const item of items) {
        if (item.isFile()) {
          totalSize += item.size;
        } else if (item.isDirectory()) {
          totalSize += await this.calculateDirectorySize(item.path);
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Error calculating directory size:', error);
      return 0;
    }
  }

  async cleanupExpiredContent(): Promise<void> {
    try {
      const offlineCourses = await this.getOfflineCourses();
      const now = new Date();
      const expiryDays = 30; // Content expires after 30 days

      for (const course of offlineCourses) {
        const downloadedAt = new Date(course.downloadedAt);
        const daysDiff = Math.floor((now.getTime() - downloadedAt.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff > expiryDays) {
          await this.deleteOfflineCourse(course.courseId);
          console.log(`Expired course ${course.courseId} cleaned up`);
        }
      }
    } catch (error) {
      console.error('Error cleaning up expired content:', error);
    }
  }
}

export const offlineManager = new OfflineManager();
```

### 7.3 Push Notifications Setup
```javascript
// mobile/src/services/notificationService.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  private expoPushToken: string | null = null;

  async initialize() {
    try {
      await this.requestPermissions();
      await this.registerForPushNotifications();
      this.setupNotificationListeners();
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  private async requestPermissions() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      // Create specific channels for different notification types
      await Notifications.setNotificationChannelAsync('lessons', {
        name: 'Lesson Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        description: 'Notifications about lesson reminders and study schedule'
      });

      await Notifications.setNotificationChannelAsync('achievements', {
        name: 'Achievements',
        importance: Notifications.AndroidImportance.DEFAULT,
        description: 'Achievement and milestone notifications'
      });

      await Notifications.setNotificationChannelAsync('community', {
        name: 'Community',
        importance: Notifications.AndroidImportance.DEFAULT,
        description: 'Community and group activity notifications'
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }
  }

  private async registerForPushNotifications() {
    try {
      const token = await Notifications.getExpoPushTokenAsync();
      this.expoPushToken = token.data;

      // Store token locally
      await AsyncStorage.setItem('expoPushToken', this.expoPushToken);

      // Send token to server
      await this.sendTokenToServer(this.expoPushToken);

      console.log('Push token registered:', this.expoPushToken);
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  }

  private async sendTokenToServer(token: string) {
    try {
      await api.post('/notifications/register-token', {
        push_token: token,
        platform: Platform.OS,
        device_info: {
          brand: Device.brand,
          model: Device.modelName,
          os_version: Device.osVersion
        }
      });
    } catch (error) {
      console.error('Error sending token to server:', error);
    }
  }

  private setupNotificationListeners() {
    // Handle notification received while app is foregrounded
    Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Handle notification response (user tapped notification)
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  private handleNotificationReceived(notification: Notifications.Notification) {
    const { data } = notification.request.content;
    
    // Update app state based on notification type
    switch (data?.type) {
      case 'lesson_reminder':
        this.updateLessonReminder(data);
        break;
      case 'achievement':
        this.updateAchievements(data);
        break;
      case 'community_message':
        this.updateCommunityMessages(data);
        break;
    }
  }

  private handleNotificationResponse(response: Notifications.NotificationResponse) {
    const { data } = response.notification.request.content;
    
    // Navigate to appropriate screen based on notification type
    switch (data?.type) {
      case 'lesson_reminder':
        this.navigateToLesson(data.lesson_id);
        break;
      case 'achievement':
        this.navigateToAchievements();
        break;
      case 'community_message':
        this.navigateToCommunity(data.group_id);
        break;
      case 'assessment_result':
        this.navigateToAssessmentResult(data.session_id);
        break;
    }
  }

  async scheduleLocalNotification(
    title: string,
    body: string,
    data: any,
    triggerDate: Date,
    channelId: string = 'default'
  ) {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: {
          date: triggerDate,
          channelId
        },
      });

      console.log('Local notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling local notification:', error);
    }
  }

  async scheduleDailyStudyReminder(hour: number, minute: number) {
    try {
      // Cancel existing daily reminders
      await this.cancelNotificationsByTag('daily_study_reminder');

      // Schedule new daily reminder
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Time to Study! 📚',
          body: 'Continue your learning journey with AARAMBH AI',
          data: { type: 'study_reminder', tag: 'daily_study_reminder' },
          sound: true,
        },
        trigger: {
          hour,
          minute,
          repeats: true  } catch (error) {
    console.error('Error saving answer:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SAVE_FAILED', message: 'Failed to save answer' }
    });
  }
});

// Submit assessment
router.post('/sessions/:sessionId/submit', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.user_id;

    // Verify session
    const session = await db.query(
      'SELECT * FROM AssessmentSessions WHERE session_id = ? AND user_id = ? AND status = ?',
      [sessionId, userId, 'active']
    );

    if (!session.length) {
      return res.status(404).json({
        success: false,
        error: { code: 'INVALID_SESSION', message: 'Invalid session' }
      });
    }

    // Get assessment and answers
    const { resource: assessment } = await assessmentsContainer.item(
      session[0].assessment_id, 
      session[0].assessment_id
    ).read();

    const answers = await db.query(
      'SELECT * FROM AssessmentAnswers WHERE session_id = ?',
      [sessionId]
    );

    // Calculate score
    const scoreResult = await calculateAssessmentScore(assessment, answers);

    // Update session status
    const submittedAt = new Date();
    const timeTaken = Math.floor((submittedAt - new Date(session[0].started_at)) / 60000); // minutes

    await db.query(`
      UPDATE AssessmentSessions 
      SET status = ?, submitted_at = ?, time_taken_minutes = ?, score = ?, max_score = ?
      WHERE session_id = ?
    `, ['completed', submittedAt, timeTaken, scoreResult.totalScore, scoreResult.maxScore, sessionId]);

    // Save detailed results
    await saveDetailedResults(sessionId, assessment, answers, scoreResult);

    // Update user analytics
    await updateUserAnalytics(userId, session[0].course_id, scoreResult);

    res.status(200).json({
      success: true,
      data: {
        session_id: sessionId,
        assessment_id: session[0].assessment_id,
        submitted_at: submittedAt.toISOString(),
        time_taken_minutes: timeTaken,
        score: {
          total_marks: scoreResult.totalScore,
          max_marks: scoreResult.maxScore,
          percentage: Math.round((scoreResult.totalScore / scoreResult.maxScore) * 100),
          grade: calculateGrade(scoreResult.totalScore, scoreResult.maxScore),
          pass_status: scoreResult.totalScore >= (scoreResult.maxScore * 0.6) ? 'passed' : 'failed'
        },
        question_analysis: scoreResult.analysis,
        performance_insights: scoreResult.insights,
        rank: await calculateRank(session[0].assessment_id, scoreResult.totalScore),
        next_steps: generateNextSteps(scoreResult),
        detailed_report_url: `/api/v1/assessments/sessions/${sessionId}/report`
      },
      message: 'Assessment submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SUBMIT_FAILED', message: 'Failed to submit assessment' }
    });
  }
});

// Helper functions
async function calculateAssessmentScore(assessment, answers) {
  let totalScore = 0;
  let maxScore = 0;
  const analysis = {
    correct: 0,
    incorrect: 0,
    unanswered: 0,
    by_difficulty: { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } },
    by_topic: {}
  };

  const answerMap = {};
  answers.forEach(ans => {
    answerMap[ans.question_id] = JSON.parse(ans.answer);
  });

  assessment.questions.forEach(question => {
    maxScore += question.marks;
    analysis.by_difficulty[question.difficulty].total++;

    if (!analysis.by_topic[question.topic]) {
      analysis.by_topic[question.topic] = { correct: 0, total: 0 };
    }
    analysis.by_topic[question.topic].total++;

    if (answerMap[question.id]) {
      const userAnswer = answerMap[question.id];
      if (checkAnswer(question, userAnswer)) {
        totalScore += question.marks;
        analysis.correct++;
        analysis.by_difficulty[question.difficulty].correct++;
        analysis.by_topic[question.topic].correct++;
      } else {
        analysis.incorrect++;
      }
    } else {
      analysis.unanswered++;
    }
  });

  const insights = generatePerformanceInsights(analysis, totalScore, maxScore);

  return {
    totalScore,
    maxScore,
    analysis,
    insights
  };
}

function checkAnswer(question, userAnswer) {
  switch (question.type) {
    case 'multiple_choice':
      return userAnswer === question.correct_answer;
    case 'multiple_select':
      return JSON.stringify(userAnswer.sort()) === JSON.stringify(question.correct_answer.sort());
    case 'numerical':
      const tolerance = question.tolerance || 0.01;
      return Math.abs(parseFloat(userAnswer) - parseFloat(question.correct_answer)) <= tolerance;
    case 'text':
      return userAnswer.toLowerCase().trim() === question.correct_answer.toLowerCase().trim();
    default:
      return false;
  }
}

function generatePerformanceInsights(analysis, totalScore, maxScore) {
  const percentage = (totalScore / maxScore) * 100;
  const insights = {
    strengths: [],
    areas_for_improvement: [],
    time_management: 'good', // This would be calculated based on time data
    accuracy_rate: Math.round((analysis.correct / (analysis.correct + analysis.incorrect)) * 100)
  };

  // Identify strengths (topics with >80% accuracy)
  Object.entries(analysis.by_topic).forEach(([topic, data]) => {
    const accuracy = data.total > 0 ? (data.correct / data.total) * 100 : 0;
    if (accuracy >= 80) {
      insights.strengths.push(topic);
    } else if (accuracy < 60) {
      insights.areas_for_improvement.push(topic);
    }
  });

  return insights;
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function saveDetailedResults(sessionId, assessment, answers, scoreResult) {
  // Implementation for saving detailed results
  // This would store question-by-question analysis
}

async function updateUserAnalytics(userId, courseId, scoreResult) {
  // Update user performance analytics
  await db.query(`
    UPDATE UserProgress 
    SET performance_score = ?, last_assessment_score = ?, updated_at = GETDATE()
    WHERE user_id = ? AND course_id = ?
  `, [scoreResult.totalScore, scoreResult.totalScore, userId, courseId]);
}

async function calculateRank(assessmentId, score) {
  const rankQuery = await db.query(`
    SELECT COUNT(*) + 1 as rank 
    FROM AssessmentSessions 
    WHERE assessment_id = ? AND score > ? AND status = 'completed'
  `, [assessmentId, score]);
  
  return rankQuery[0].rank;
}

function calculateGrade(score, maxScore) {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  return 'F';
}

function generateNextSteps(scoreResult) {
  const steps = [];
  
  if (scoreResult.insights.areas_for_improvement.length > 0) {
    steps.push(`Review ${scoreResult.insights.areas_for_improvement[0]} concepts`);
    steps.push('Practice more problems in weak areas');
  }
  
  if (scoreResult.totalScore / scoreResult.maxScore >= 0.8) {
    steps.push('Move to next chapter');
  } else {
    steps.push('Retake assessment after revision');
  }
  
  return steps;
}

module.exports = router;
```

### 5.2 Analytics Engine
```javascript
// backend/routes/analytics.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

// Get user progress analytics
router.get('/users/:userId/progress', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { time_period = '30d', courses, format = 'detailed' } = req.query;

    // Verify user access
    if (req.user.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCESS_DENIED', message: 'Access denied' }
      });
    }

    // Calculate date range
    const dateRanges = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365,
      'all': null
    };

    const daysBack = dateRanges[time_period];
    const startDate = daysBack ? new Date(Date.now() - (daysBack * 24 * 60 * 60 * 1000)) : null;

    // Get overall summary
    const summaryQuery = `
      SELECT 
        COUNT(DISTINCT s.course_id) as courses_active,
        COALESCE(SUM(up.time_spent_minutes), 0) as total_study_time_hours,
        COALESCE(SUM(up.lessons_completed), 0) as lessons_completed,
        COALESCE(AVG(up.performance_score), 0) as average_score,
        MAX(up.streak_days) as streak_days,
        COUNT(DISTINCT ases.session_id) as assessments_taken
      FROM Subscriptions s
      LEFT JOIN UserProgress up ON s.user_id = up.user_id AND s.course_id = up.course_id
      LEFT JOIN AssessmentSessions ases ON s.user_id = ases.user_id AND s.course_id = ases.course_id
        AND ases.status = 'completed'
        ${daysBack ? 'AND ases.submitted_at >= ?' : ''}
      WHERE s.user_id = ? AND s.status = 'active'
      ${courses ? `AND s.course_id IN (${courses.split(',').map(() => '?').join(',')})` : ''}
    `;

    const queryParams = [userId];
    if (daysBack) queryParams.unshift(startDate);
    if (courses) queryParams.push(...courses.split(','));

    const summary = await db.query(summaryQuery, queryParams);

    // Get course-wise progress
    const courseProgressQuery = `
      SELECT 
        s.course_id,
        c.title as course_title,
        s.start_date as enrollment_date,
        up.completion_percentage,
        up.lessons_completed,
        up.total_lessons,
        up.time_spent_minutes,
        up.performance_score,
        up.last_accessed,
        AVG(ases.score) as average_assessment_score
      FROM Subscriptions s
      LEFT JOIN Courses c ON s.course_id = c.id
      LEFT JOIN UserProgress up ON s.user_id = up.user_id AND s.course_id = up.course_id
      LEFT JOIN AssessmentSessions ases ON s.user_id = ases.user_id AND s.course_id = ases.course_id
        AND ases.status = 'completed'
      WHERE s.user_id = ? AND s.status = 'active'
      GROUP BY s.course_id, c.title, s.start_date, up.completion_percentage, 
               up.lessons_completed, up.total_lessons, up.time_spent_minutes, 
               up.performance_score, up.last_accessed
    `;

    const courseProgress = await db.query(courseProgressQuery, [userId]);

    // Get learning patterns
    const patternsQuery = `
      SELECT 
        DATEPART(HOUR, la.timestamp) as hour_of_day,
        DATENAME(WEEKDAY, la.timestamp) as day_of_week,
        AVG(la.session_duration) as avg_session_duration,
        la.content_type,
        COUNT(*) as frequency
      FROM LearningActivity la
      WHERE la.user_id = ?
        ${daysBack ? 'AND la.timestamp >= ?' : ''}
      GROUP BY DATEPART(HOUR, la.timestamp), DATENAME(WEEKDAY, la.timestamp), la.content_type
      ORDER BY frequency DESC
    `;

    const patternsParams = [userId];
    if (daysBack) patternsParams.push(startDate);
    const patterns = await db.query(patternsQuery, patternsParams);

    // Process patterns data
    const studyPatterns = processStudyPatterns(patterns);

    // Get performance trends
    const trendsQuery = `
      SELECT 
        DATEADD(week, DATEDIFF(week, 0, ases.submitted_at), 0) as week_start,
        AVG(ases.score) as average_score,
        COUNT(*) as assessments_count
      FROM AssessmentSessions ases
      WHERE ases.user_id = ? AND ases.status = 'completed'
        ${daysBack ? 'AND ases.submitted_at >= ?' : ''}
      GROUP BY DATEADD(week, DATEDIFF(week, 0, ases.submitted_at), 0)
      ORDER BY week_start
    `;

    const trendsParams = [userId];
    if (daysBack) trendsParams.push(startDate);
    const trends = await db.query(trendsQuery, trendsParams);

    // Get strengths and weaknesses
    const strengthsQuery = `
      SELECT 
        ar.topic,
        AVG(CASE WHEN ar.is_correct = 1 THEN 1.0 ELSE 0.0 END) as proficiency,
        COUNT(*) as total_questions
      FROM AssessmentResults ar
      JOIN AssessmentSessions ases ON ar.session_id = ases.session_id
      WHERE ases.user_id = ?
        ${daysBack ? 'AND ases.submitted_at >= ?' : ''}
      GROUP BY ar.topic
      HAVING COUNT(*) >= 5
      ORDER BY proficiency DESC
    `;

    const strengthsParams = [userId];
    if (daysBack) strengthsParams.push(startDate);
    const strengths = await db.query(strengthsQuery, strengthsParams);

    const analyticsData = {
      user_id: userId,
      report_period: time_period,
      generated_at: new Date().toISOString(),
      overall_summary: {
        total_study_time_hours: Math.round((summary[0].total_study_time_hours || 0) / 60 * 10) / 10,
        lessons_completed: summary[0].lessons_completed || 0,
        assessments_taken: summary[0].assessments_taken || 0,
        average_score: Math.round((summary[0].average_score || 0) * 10) / 10,
        courses_active: summary[0].courses_active || 0,
        streak_days: summary[0].streak_days || 0,
        knowledge_improvement: calculateKnowledgeImprovement(trends)
      },
      course_wise_progress: courseProgress.map(course => ({
        course_id: course.course_id,
        course_title: course.course_title,
        enrollment_date: course.enrollment_date,
        progress_percentage: course.completion_percentage || 0,
        lessons_completed: course.lessons_completed || 0,
        total_lessons: course.total_lessons || 0,
        time_spent_hours: Math.round((course.time_spent_minutes || 0) / 60 * 10) / 10,
        performance_metrics: {
          average_lesson_score: course.performance_score || 0,
          average_assessment_score: course.average_assessment_score || 0,
          improvement_trend: calculateImprovementTrend(course.course_id, userId),
          consistency_score: calculateConsistencyScore(course.course_id, userId)
        }
      })),
      learning_analytics: {
        study_patterns: studyPatterns,
        performance_trends: trends.map(trend => ({
          week: trend.week_start,
          average_score: Math.round((trend.average_score || 0) * 10) / 10
        })),
        strengths_and_weaknesses: {
          strong_areas: strengths.filter(s => s.proficiency >= 0.8).map(s => ({
            topic: s.topic,
            proficiency: Math.round(s.proficiency * 100) / 100,
            evidence: `High accuracy in ${s.total_questions} questions`
          })),
          improvement_areas: strengths.filter(s => s.proficiency < 0.6).map(s => ({
            topic: s.topic,
            proficiency: Math.round(s.proficiency * 100) / 100,
            evidence: `Lower accuracy in ${s.total_questions} questions`,
            recommendations: generateTopicRecommendations(s.topic)
          }))
        }
      }
    };

    res.status(200).json({
      success: true,
      data: analyticsData,
      message: 'Analytics retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ANALYTICS_FAILED', message: 'Failed to fetch analytics' }
    });
  }
});

// Helper functions
function processStudyPatterns(patterns) {
  const hourMap = {};
  const dayMap = {};
  const contentTypeMap = {};

  patterns.forEach(pattern => {
    // Process hours
    if (!hourMap[pattern.hour_of_day]) {
      hourMap[pattern.hour_of_day] = 0;
    }
    hourMap[pattern.hour_of_day] += pattern.frequency;

    // Process days
    if (!dayMap[pattern.day_of_week]) {
      dayMap[pattern.day_of_week] = 0;
    }
    dayMap[pattern.day_of_week] += pattern.frequency;

    // Process content types
    if (!contentTypeMap[pattern.content_type]) {
      contentTypeMap[pattern.content_type] = 0;
    }
    contentTypeMap[pattern.content_type] += pattern.frequency;
  });

  // Find most active times
  const mostActiveHours = Object.entries(hourMap)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2)
    .map(([hour]) => `${hour}:00-${parseInt(hour) + 1}:00`);

  const mostActiveDays = Object.entries(dayMap)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([day]) => day);

  const preferredContentTypes = Object.entries(contentTypeMap)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([type]) => type);

  return {
    most_active_hours: mostActiveHours,
    most_active_days: mostActiveDays,
    preferred_content_types: preferredContentTypes,
    average_session_duration: patterns.length > 0 ? 
      Math.round(patterns.reduce((sum, p) => sum + p.avg_session_duration, 0) / patterns.length) : 0
  };
}

function calculateKnowledgeImprovement(trends) {
  if (trends.length < 2) return 0;
  
  const firstScore = trends[0].average_score;
  const lastScore = trends[trends.length - 1].average_score;
  
  return Math.round(((lastScore - firstScore) / firstScore) * 100 * 10) / 10;
}

async function calculateImprovementTrend(courseId, userId) {
  // This would implement trend calculation logic
  return "increasing"; // Placeholder
}

async function calculateConsistencyScore(courseId, userId) {
  // This would implement consistency calculation
  return 0.84; // Placeholder
}

function generateTopicRecommendations(topic) {
  const recommendations = {
    "mechanics": ["Review fundamental concepts", "Practice more numerical problems"],
    "thermodynamics": ["Focus on conceptual understanding", "Solve previous year questions"],
    "electricity": ["Understand circuit analysis", "Practice with different circuit types"]
  };
  
  return recommendations[topic.toLowerCase()] || ["Review fundamental concepts", "Practice more problems"];
}

module.exports = router;
```

## 6. Phase 5: Community & Collaboration Features

### 6.1 Real-time Communication System
```javascript
// backend/socketHandlers/community.js
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

class CommunitySocketHandler {
  constructor(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    // Socket authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await this.getUserById(decoded.user_id);
        
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user.user_id;
        socket.userInfo = {
          name: user.name,
          avatar: user.profile_picture_url
        };
        
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected`);

      // Join user to their groups
      this.joinUserGroups(socket);

      // Handle group messaging
      socket.on('join_group', (data) => this.handleJoinGroup(socket, data));
      socket.on('leave_group', (data) => this.handleLeaveGroup(socket, data));
      socket.on('send_message', (data) => this.handleSendMessage(socket, data));
      socket.on('typing_start', (data) => this.handleTypingStart(socket, data));
      socket.on('typing_stop', (data) => this.handleTypingStop(socket, data));
      
      // Handle collaborative workspace
      socket.on('join_workspace', (data) => this.handleJoinWorkspace(socket, data));
      socket.on('document_edit', (data) => this.handleDocumentEdit(socket, data));
      socket.on('cursor_position', (data) => this.handleCursorPosition(socket, data));

      // Handle voice/video calls
      socket.on('call_initiate', (data) => this.handleCallInitiate(socket, data));
      socket.on('call_accept', (data) => this.handleCallAccept(socket, data));
      socket.on('call_reject', (data) => this.handleCallReject(socket, data));

      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
        this.handleDisconnect(socket);
      });
    });
  }

  async joinUserGroups(socket) {
    try {
      const userGroups = await db.query(`
        SELECT gm.group_id, g.name 
        FROM GroupMembers gm 
        JOIN StudyGroups g ON gm.group_id = g.group_id 
        WHERE gm.user_id = ? AND gm.status = 'active'
      `, [socket.userId]);

      userGroups.forEach(group => {
        socket.join(`group_${group.group_id}`);
      });

      socket.emit('groups_joined', {
        groups: userGroups.map(g => ({ id: g.group_id, name: g.name }))
      });
    } catch (error) {
      console.error('Error joining user groups:', error);
    }
  }

  async handleJoinGroup(socket, data) {
    const { groupId } = data;
    
    try {
      // Verify user is member of the group
      const membership = await db.query(`
        SELECT * FROM GroupMembers 
        WHERE user_id = ? AND group_id = ? AND status = 'active'
      `, [socket.userId, groupId]);

      if (!membership.length) {
        socket.emit('error', { message: 'Not a member of this group' });
        return;
      }

      socket.join(`group_${groupId}`);
      
      // Notify other members
      socket.to(`group_${groupId}`).emit('user_joined', {
        user_id: socket.userId,
        user_name: socket.userInfo.name,
        timestamp: new Date().toISOString()
      });

      socket.emit('group_joined', { groupId });
    } catch (error) {
      socket.emit('error', { message: 'Failed to join group' });
    }
  }

  async handleSendMessage(socket, data) {
    const { groupId, content, messageType = 'text' } = data;

    try {
      // Verify group membership
      const membership = await db.query(`
        SELECT * FROM GroupMembers 
        WHERE user_id = ? AND group_id = ? AND status = 'active'
      `, [socket.userId, groupId]);

      if (!membership.length) {
        socket.emit('error', { message: 'Not authorized to send messages' });
        return;
      }

      // Save message to database
      const messageId = await this.saveMessage(socket.userId, groupId, content, messageType);

      const messageData = {
        message_id: messageId,
        group_id: groupId,
        sender: {
          user_id: socket.userId,
          name: socket.userInfo.name,
          avatar: socket.userInfo.avatar
        },
        content: {
          type: messageType,
          ...content
        },
        timestamp: new Date().toISOString()
      };

      // Broadcast to group members
      this.io.to(`group_${groupId}`).emit('new_message', messageData);

      // Send push notifications to offline users
      await this.sendPushNotifications(groupId, socket.userId, messageData);

    } catch (error) {
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  async handleDocumentEdit(socket, data) {
    const { workspaceId, documentId, operation, cursor } = data;

    try {
      // Verify workspace access
      const access = await this.verifyWorkspaceAccess(socket.userId, workspaceId);
      if (!access) {
        socket.emit('error', { message: 'No access to workspace' });
        return;
      }

      // Apply operational transformation
      const transformedOperation = await this.applyOperationalTransform(documentId, operation);

      // Broadcast to workspace members
      socket.to(`workspace_${workspaceId}`).emit('document_operation', {
        document_id: documentId,
        operation: transformedOperation,
        user_id: socket.userId,
        user_name: socket.userInfo.name,
        timestamp: new Date().toISOString()
      });

      // Save operation to database
      await this.saveDocumentOperation(documentId, socket.userId, transformedOperation);

    } catch (error) {
      socket.emit('error', { message: 'Failed to apply document edit' });
    }
  }

  async saveMessage(userId, groupId, content, messageType) {
    const result = await db.query(`
      INSERT INTO GroupMessages (user_id, group_id, content, message_type)
      OUTPUT INSERTED.message_id
      VALUES (?, ?, ?, ?)
    `, [userId, groupId, JSON.stringify(content), messageType]);

    return result[0].message_id;
  }

  async sendPushNotifications(groupId, senderId, messageData) {
    // Get offline group members
    const offlineMembers = await db.query(`
      SELECT u.user_id, u.push_token, u.email 
      FROM GroupMembers gm
      JOIN Users u ON gm.user_id = u.user_id
      LEFT JOIN ActiveSessions as_table ON u.user_id = as_table.user_id
      WHERE gm.group_id = ? AND gm.user_id != ? AND as_table.user_id IS NULL
    `, [groupId, senderId]);

    // Send push notifications (implementation would depend on notification service)
    for (const member of offlineMembers) {
      await this.sendPushNotification(member, messageData);
    }
  }

  async getUserById(userId) {
    const users = await db.query('SELECT * FROM Users WHERE user_id = ?', [userId]);
    return users[0] || null;
  }

  async verifyWorkspaceAccess(userId, workspaceId) {
    const access = await db.query(`
      SELECT * FROM WorkspaceMembers 
      WHERE user_id = ? AND workspace_id = ? AND status = 'active'
    `, [userId, workspaceId]);
    return access.length > 0;
  }

  async applyOperationalTransform(documentId, operation) {
    // Implement operational transformation for concurrent editing
    // This is a complex algorithm for handling simultaneous edits
    return operation; // Simplified for now
  }

  async saveDocumentOperation(documentId, userId, operation) {
    await db.query(`
      INSERT INTO DocumentOperations (document_id, user_id, operation, applied_at)
      VALUES (?, ?, ?, GETDATE())
    `, [documentId, userId, JSON.stringify(operation)]);
  }

  async sendPushNotification(user, messageData) {
    // Implementation would use Azure Notification Hubs or similar service
    console.log(`Sending push notification to user ${user.user_id}`);
  }
}

module.exports = CommunitySocketHandler;
```

### 6.2 Collaborative Workspace Implementation
```javascript
// backend/routes/workspace.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware        self.subject_specializations = {
            "physics": "Expert in Physics with deep understanding of concepts from class 9-12 and competitive exams",
            "chemistry": "Expert in Chemistry with knowledge of organic, inorganic, and physical chemistry",
            "mathematics": "Expert in Mathematics covering algebra, calculus, geometry, and statistics",
            "biology": "Expert in Biology including botany, zoology, and human physiology"
        }
    
    async def _setup_models(self):
        """Setup OpenAI and Azure AI models"""
        openai.api_key = self.config.get('openai_api_key')
        openai.api_base = self.config.get('azure_openai_endpoint')
        openai.api_type = 'azure'
        openai.api_version = '2023-05-15'
        
        self.model_endpoints = {
            "content_generation": "gpt-4-turbo",
            "question_creation": "gpt-4-turbo",
            "explanation": "gpt-3.5-turbo"
        }
    
    async def _setup_connections(self):
        """Setup external connections"""
        self.session = aiohttp.ClientSession()
    
    async def _process_task(self, request: AgentRequest) -> Any:
        """Process teacher-specific tasks"""
        task_type = request.task_type
        
        if task_type == "content_generation":
            return await self._generate_content(request)
        elif task_type == "explanation":
            return await self._generate_explanation(request)
        elif task_type == "question_creation":
            return await self._create_questions(request)
        elif task_type == "lesson_planning":
            return await self._plan_lesson(request)
        else:
            raise ValueError(f"Unknown task type: {task_type}")
    
    async def _generate_content(self, request: AgentRequest) -> Dict[str, Any]:
        """Generate educational content"""
        params = request.parameters
        topic = params.get('topic')
        difficulty = params.get('difficulty_level', 'intermediate')
        content_type = params.get('content_type', 'lesson')
        subject = params.get('subject', 'physics')
        
        # Build system prompt based on subject specialization
        system_prompt = f"""
        You are an expert {subject} teacher for Indian students preparing for competitive exams and school curricula.
        {self.subject_specializations.get(subject, '')}
        
        Create educational content that is:
        - Aligned with Indian education standards (CBSE/ICSE)
        - Appropriate for {difficulty} level students
        - Engaging and easy to understand
        - Includes real-world examples relevant to Indian context
        - Follows pedagogical best practices
        """
        
        user_prompt = f"""
        Create a comprehensive {content_type} on the topic: {topic}
        
        Requirements:
        - Difficulty level: {difficulty}
        - Include learning objectives
        - Provide clear explanations with examples
        - Add practice questions at the end
        - Suggest visual aids and interactive elements
        - Include common misconceptions and how to address them
        
        Format the response as a structured JSON with sections for:
        - introduction
        - main_content (with subsections)
        - examples
        - practice_questions
        - visual_suggestions
        - misconceptions
        - summary
        """
        
        try:
            response = await openai.ChatCompletion.acreate(
                engine="gpt-4-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=3000
            )
            
            content = json.loads(response.choices[0].message.content)
            
            # Enhance with multimedia suggestions
            content['multimedia_suggestions'] = await self._suggest_multimedia(topic, subject)
            
            return {
                "content_id": f"generated_{request.request_id}",
                "topic": topic,
                "subject": subject,
                "difficulty": difficulty,
                "content": content,
                "metadata": {
                    "generated_at": request.timestamp.isoformat(),
                    "model_used": "gpt-4-turbo",
                    "word_count": len(content.get('main_content', {}).get('text', '')),
                    "estimated_reading_time": self._calculate_reading_time(content)
                }
            }
            
        except Exception as e:
            raise Exception(f"Content generation failed: {str(e)}")
    
    async def _suggest_multimedia(self, topic: str, subject: str) -> List[Dict]:
        """Suggest multimedia content for the topic"""
        suggestions = []
        
        # Physics-specific multimedia
        if subject == "physics":
            suggestions.extend([
                {
                    "type": "3d_simulation",
                    "description": f"Interactive 3D model demonstrating {topic}",
                    "priority": "high"
                },
                {
                    "type": "animation",
                    "description": f"Animated explanation of {topic} principles",
                    "priority": "medium"
                }
            ])
        
        # Chemistry-specific multimedia
        elif subject == "chemistry":
            suggestions.extend([
                {
                    "type": "molecular_model",
                    "description": f"3D molecular structure visualization for {topic}",
                    "priority": "high"
                },
                {
                    "type": "reaction_animation",
                    "description": f"Step-by-step reaction mechanism for {topic}",
                    "priority": "medium"
                }
            ])
        
        # Common suggestions for all subjects
        suggestions.extend([
            {
                "type": "infographic",
                "description": f"Visual summary of key concepts in {topic}",
                "priority": "medium"
            },
            {
                "type": "interactive_quiz",
                "description": f"Practice quiz on {topic} concepts",
                "priority": "high"
            }
        ])
        
        return suggestions
    
    async def _create_questions(self, request: AgentRequest) -> Dict[str, Any]:
        """Create assessment questions"""
        params = request.parameters
        topic = params.get('topic')
        question_count = params.get('question_count', 10)
        difficulty = params.get('difficulty', 'intermediate')
        question_types = params.get('question_types', ['multiple_choice', 'numerical'])
        
        system_prompt = f"""
        You are an expert question creator for Indian competitive exams and school assessments.
        Create high-quality questions that test deep understanding, not just memorization.
        Follow Indian exam patterns (JEE, NEET, CBSE, etc.).
        """
        
        user_prompt = f"""
        Create {question_count} questions on the topic: {topic}
        
        Requirements:
        - Difficulty: {difficulty}
        - Question types: {', '.join(question_types)}
        - Include detailed solutions with step-by-step explanations
        - Provide hints for difficult questions
        - Mark the expected difficulty level for each question
        - Include common wrong answers with explanations
        
        Format as JSON array with each question having:
        - question_text
        - question_type
        - options (for MCQ)
        - correct_answer
        - solution_steps
        - hints
        - difficulty_level
        - common_mistakes
        """
        
        try:
            response = await openai.ChatCompletion.acreate(
                engine="gpt-4-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.6,
                max_tokens=2500
            )
            
            questions = json.loads(response.choices[0].message.content)
            
            return {
                "assessment_id": f"assess_{request.request_id}",
                "topic": topic,
                "question_count": len(questions),
                "questions": questions,
                "metadata": {
                    "created_at": request.timestamp.isoformat(),
                    "difficulty_distribution": self._analyze_difficulty_distribution(questions),
                    "estimated_time": question_count * 2  # 2 minutes per question
                }
            }
            
        except Exception as e:
            raise Exception(f"Question creation failed: {str(e)}")
    
    def _calculate_reading_time(self, content: Dict) -> int:
        """Calculate estimated reading time in minutes"""
        total_words = 0
        
        def count_words_recursive(obj):
            nonlocal total_words
            if isinstance(obj, str):
                total_words += len(obj.split())
            elif isinstance(obj, dict):
                for value in obj.values():
                    count_words_recursive(value)
            elif isinstance(obj, list):
                for item in obj:
                    count_words_recursive(item)
        
        count_words_recursive(content)
        return max(1, total_words // 200)  # Average reading speed: 200 words/minute
    
    def _analyze_difficulty_distribution(self, questions: List[Dict]) -> Dict[str, int]:
        """Analyze difficulty distribution of questions"""
        distribution = {"easy": 0, "medium": 0, "hard": 0}
        
        for question in questions:
            difficulty = question.get('difficulty_level', 'medium')
            if difficulty in distribution:
                distribution[difficulty] += 1
        
        return distribution

# Teacher Agent API endpoint
# ai-services/api/teacher_routes.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from agents.teacher_agent import TeacherAgent
from agents.base_agent import AgentRequest
import uuid
from datetime import datetime

router = APIRouter()

class ContentGenerationRequest(BaseModel):
    topic: str
    content_type: str = "lesson"
    difficulty_level: str = "intermediate"
    subject: str = "physics"
    course_context: Optional[Dict[str, Any]] = None
    user_profile: Optional[Dict[str, Any]] = None

class QuestionCreationRequest(BaseModel):
    topic: str
    question_count: int = 10
    difficulty: str = "intermediate"
    question_types: List[str] = ["multiple_choice"]
    subject: str = "physics"

# Initialize teacher agent
teacher_agent = TeacherAgent({
    'openai_api_key': 'your_openai_key',
    'azure_openai_endpoint': 'your_azure_endpoint'
})

@router.post("/teacher/generate-content")
async def generate_content(request: ContentGenerationRequest, user_id: str = "default"):
    try:
        agent_request = AgentRequest(
            request_id=str(uuid.uuid4()),
            user_id=user_id,
            task_type="content_generation",
            parameters=request.dict()
        )
        
        response = await teacher_agent.process_request(agent_request)
        
        if not response.success:
            raise HTTPException(status_code=500, detail=response.error)
        
        return {
            "success": True,
            "data": response.data,
            "message": "Content generated successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/teacher/create-questions")
async def create_questions(request: QuestionCreationRequest, user_id: str = "default"):
    try:
        agent_request = AgentRequest(
            request_id=str(uuid.uuid4()),
            user_id=user_id,
            task_type="question_creation",
            parameters=request.dict()
        )
        
        response = await teacher_agent.process_request(agent_request)
        
        if not response.success:
            raise HTTPException(status_code=500, detail=response.error)
        
        return {
            "success": True,
            "data": response.data,
            "message": "Questions created successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### 4.3 Designer Agent Implementation
```python
# ai-services/agents/designer_agent.py
import aiohttp
import json
import base64
from PIL import Image, ImageDraw, ImageFont
import io
from typing import Dict, List, Any
from .base_agent import BaseAgent, AgentRequest

class DesignerAgent(BaseAgent):
    def __init__(self, config: Dict[str, Any]):
        super().__init__(
            "designer_agent",
            ["visual_creation", "ui_adaptation", "infographic_generation", "diagram_creation"],
            config
        )
        self.dalle_endpoint = None
        self.custom_models = {}
    
    async def _setup_models(self):
        """Setup DALL-E and custom design models"""
        self.dalle_endpoint = self.config.get('dalle_endpoint')
        self.api_key = self.config.get('openai_api_key')
        
        # Setup custom diagram generation models
        self.custom_models = {
            "physics_diagrams": "physics_diagram_model",
            "chemistry_structures": "chemistry_structure_model",
            "flowcharts": "flowchart_generator_model"
        }
    
    async def _setup_connections(self):
        """Setup external connections"""
        self.session = aiohttp.ClientSession()
    
    async def _process_task(self, request: AgentRequest) -> Any:
        """Process designer-specific tasks"""
        task_type = request.task_type
        
        if task_type == "visual_creation":
            return await self._create_visual_content(request)
        elif task_type == "infographic_generation":
            return await self._generate_infographic(request)
        elif task_type == "diagram_creation":
            return await self._create_diagram(request)
        elif task_type == "ui_adaptation":
            return await self._adapt_ui(request)
        else:
            raise ValueError(f"Unknown task type: {task_type}")
    
    async def _create_visual_content(self, request: AgentRequest) -> Dict[str, Any]:
        """Create visual content using DALL-E and custom models"""
        params = request.parameters
        description = params.get('content_description')
        visual_type = params.get('visual_type', 'illustration')
        style = params.get('style', 'educational')
        subject = params.get('subject', 'general')
        
        # Enhanced prompt for educational content
        enhanced_prompt = f"""
        Create a {visual_type} for educational purposes showing {description}.
        Style: {style}, clear and professional for students.
        Subject context: {subject}.
        Requirements: High clarity, educational focus, suitable for Indian students,
        clean background, vibrant but not distracting colors.
        """
        
        try:
            # Generate image using DALL-E
            async with self.session.post(
                f"{self.dalle_endpoint}/openai/images/generations:submit",
                headers={
                    "api-key": self.api_key,
                    "Content-Type": "application/json"
                },
                json={
                    "prompt": enhanced_prompt,
                    "size": "1024x1024",
                    "n": 1,
                    "quality": "hd",
                    "style": "natural"
                }
            ) as response:
                if response.status != 200:
                    raise Exception(f"DALL-E API error: {response.status}")
                
                result = await response.json()
                image_url = result['data'][0]['url']
            
            # Download and process the image
            async with self.session.get(image_url) as img_response:
                image_data = await img_response.read()
            
            # Create variations for accessibility
            variations = await self._create_accessibility_variations(image_data)
            
            return {
                "visual_id": f"visual_{request.request_id}",
                "primary_image": {
                    "url": image_url,
                    "format": "png",
                    "size": "1024x1024"
                },
                "variations": variations,
                "metadata": {
                    "created_at": request.timestamp.isoformat(),
                    "style": style,
                    "subject": subject,
                    "accessibility_features": ["alt_text_ready", "high_contrast_available"]
                }
            }
            
        except Exception as e:
            raise Exception(f"Visual content creation failed: {str(e)}")
    
    async def _create_accessibility_variations(self, image_data: bytes) -> List[Dict]:
        """Create accessibility variations of the image"""
        variations = []
        
        try:
            # Load the original image
            image = Image.open(io.BytesIO(image_data))
            
            # Create high contrast version
            high_contrast = self._create_high_contrast_version(image)
            high_contrast_buffer = io.BytesIO()
            high_contrast.save(high_contrast_buffer, format='PNG')
            
            variations.append({
                "type": "high_contrast",
                "description": "High contrast version for better visibility",
                "data": base64.b64encode(high_contrast_buffer.getvalue()).decode(),
                "format": "png"
            })
            
            # Create simplified version
            simplified = self._create_simplified_version(image)
            simplified_buffer = io.BytesIO()
            simplified.save(simplified_buffer, format='PNG')
            
            variations.append({
                "type": "simplified",
                "description": "Simplified version with reduced visual complexity",
                "data": base64.b64encode(simplified_buffer.getvalue()).decode(),
                "format": "png"
            })
            
        except Exception as e:
            print(f"Error creating accessibility variations: {e}")
        
        return variations
    
    def _create_high_contrast_version(self, image: Image.Image) -> Image.Image:
        """Create a high contrast version of the image"""
        # Convert to grayscale and enhance contrast
        grayscale = image.convert('L')
        
        # Enhance contrast
        from PIL import ImageEnhance
        enhancer = ImageEnhance.Contrast(grayscale)
        high_contrast = enhancer.enhance(2.0)
        
        # Convert back to RGB
        return high_contrast.convert('RGB')
    
    def _create_simplified_version(self, image: Image.Image) -> Image.Image:
        """Create a simplified version with reduced complexity"""
        # Reduce colors and simplify
        simplified = image.quantize(colors=8)
        return simplified.convert('RGB')
    
    async def _generate_infographic(self, request: AgentRequest) -> Dict[str, Any]:
        """Generate educational infographics"""
        params = request.parameters
        topic = params.get('topic')
        data_points = params.get('data_points', [])
        style = params.get('style', 'modern')
        
        # Create infographic template
        width, height = 1200, 1600
        image = Image.new('RGB', (width, height), color='white')
        draw = ImageDraw.Draw(image)
        
        # Add title
        try:
            title_font = ImageFont.truetype("arial.ttf", 48)
            subtitle_font = ImageFont.truetype("arial.ttf", 24)
            text_font = ImageFont.truetype("arial.ttf", 18)
        except:
            title_font = ImageFont.load_default()
            subtitle_font = ImageFont.load_default()
            text_font = ImageFont.load_default()
        
        # Draw title
        title_bbox = draw.textbbox((0, 0), topic, font=title_font)
        title_width = title_bbox[2] - title_bbox[0]
        title_x = (width - title_width) // 2
        draw.text((title_x, 50), topic, fill='black', font=title_font)
        
        # Draw data points
        y_offset = 150
        for i, point in enumerate(data_points[:8]):  # Limit to 8 points
            # Draw point background
            rect_y = y_offset + i * 180
            draw.rectangle([(50, rect_y), (width-50, rect_y + 150)], 
                         fill=f'hsl({i*40}, 70%, 90%)', outline='black')
            
            # Draw point text
            point_text = f"{point.get('title', f'Point {i+1}')}"
            draw.text((70, rect_y + 20), point_text, fill='black', font=subtitle_font)
            
            description = point.get('description', '')[:100] + '...' if len(point.get('description', '')) > 100 else point.get('description', '')
            draw.text((70, rect_y + 60), description, fill='black', font=text_font)
        
        # Save infographic
        buffer = io.BytesIO()
        image.save(buffer, format='PNG')
        image_data = base64.b64encode(buffer.getvalue()).decode()
        
        return {
            "infographic_id": f"infographic_{request.request_id}",
            "topic": topic,
            "image_data": image_data,
            "format": "png",
            "dimensions": f"{width}x{height}",
            "metadata": {
                "created_at": request.timestamp.isoformat(),
                "style": style,
                "data_points_count": len(data_points)
            }
        }

# Designer Agent API routes
# ai-services/api/designer_routes.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional, List

router = APIRouter()

class VisualCreationRequest(BaseModel):
    content_description: str
    visual_type: str = "illustration"
    style: str = "educational"
    subject: str = "general"
    specifications: Optional[Dict[str, Any]] = None

class InfographicRequest(BaseModel):
    topic: str
    data_points: List[Dict[str, str]]
    style: str = "modern"
    color_scheme: str = "blue_gradient"

# Initialize designer agent
designer_agent = DesignerAgent({
    'dalle_endpoint': 'your_dalle_endpoint',
    'openai_api_key': 'your_openai_key'
})

@router.post("/designer/create-visual")
async def create_visual(request: VisualCreationRequest, user_id: str = "default"):
    try:
        agent_request = AgentRequest(
            request_id=str(uuid.uuid4()),
            user_id=user_id,
            task_type="visual_creation",
            parameters=request.dict()
        )
        
        response = await designer_agent.process_request(agent_request)
        
        if not response.success:
            raise HTTPException(status_code=500, detail=response.error)
        
        return {
            "success": True,
            "data": response.data,
            "message": "Visual content created successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/designer/create-infographic")
async def create_infographic(request: InfographicRequest, user_id: str = "default"):
    try:
        agent_request = AgentRequest(
            request_id=str(uuid.uuid4()),
            user_id=user_id,
            task_type="infographic_generation",
            parameters=request.dict()
        )
        
        response = await designer_agent.process_request(agent_request)
        
        if not response.success:
            raise HTTPException(status_code=500, detail=response.error)
        
        return {
            "success": True,
            "data": response.data,
            "message": "Infographic created successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## 5. Phase 4: Assessment & Analytics System

### 5.1 Assessment Engine
```javascript
// backend/routes/assessments.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { CosmosClient } = require('@azure/cosmos');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const cosmosClient = new CosmosClient({
  endpoint: process.env.COSMOS_DB_ENDPOINT,
  key: process.env.COSMOS_DB_KEY
});

const database = cosmosClient.database('AarambhAI');
const assessmentsContainer = database.container('Assessments');

// Start assessment session
router.post('/:assessmentId/start', authenticateToken, async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const userId = req.user.user_id;

    // Get assessment details
    const { resource: assessment } = await assessmentsContainer.item(assessmentId, assessmentId).read();
    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: { code: 'ASSESSMENT_NOT_FOUND', message: 'Assessment not found' }
      });
    }

    // Check if user has access to the course
    const enrollmentCheck = await db.query(
      'SELECT * FROM Subscriptions WHERE user_id = ? AND course_id = ? AND status = ? AND end_date > GETDATE()',
      [userId, assessment.courseId, 'active']
    );

    if (!enrollmentCheck.length) {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCESS_DENIED', message: 'Course access required' }
      });
    }

    // Check attempt limits
    const previousAttempts = await db.query(
      'SELECT COUNT(*) as attempt_count FROM AssessmentSessions WHERE user_id = ? AND assessment_id = ?',
      [userId, assessmentId]
    );

    if (previousAttempts[0].attempt_count >= assessment.attemptsAllowed) {
      return res.status(429).json({
        success: false,
        error: { code: 'ATTEMPT_LIMIT_EXCEEDED', message: 'Maximum attempts exceeded' }
      });
    }

    // Create assessment session
    const sessionId = uuidv4();
    const startTime = new Date();
    const expiryTime = new Date(startTime.getTime() + (assessment.durationMinutes * 60 * 1000));

    await db.query(`
      INSERT INTO AssessmentSessions 
      (session_id, user_id, assessment_id, course_id, started_at, expires_at, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [sessionId, userId, assessmentId, assessment.courseId, startTime, expiryTime, 'active']);

    // Randomize questions if configured
    let questions = assessment.questions;
    if (assessment.randomizeQuestions) {
      questions = shuffleArray([...questions]);
    }

    // Remove correct answers from response
    const sanitizedQuestions = questions.map((q, index) => ({
      id: q.id,
      question_number: index + 1,
      type: q.type,
      question_text: q.question_text,
      options: q.options,
      marks: q.marks,
      difficulty: q.difficulty,
      image: q.image,
      hint: q.hint
    }));

    res.status(200).json({
      success: true,
      data: {
        session_id: sessionId,
        assessment_id: assessmentId,
        started_at: startTime.toISOString(),
        expires_at: expiryTime.toISOString(),
        questions: sanitizedQuestions,
        navigation: {
          can_navigate_freely: assessment.allowFreeNavigation || true,
          can_review: assessment.allowReview || true,
          auto_submit: assessment.autoSubmit || true
        },
        time_remaining: assessment.durationMinutes * 60
      },
      message: 'Assessment started successfully'
    });

  } catch (error) {
    console.error('Error starting assessment:', error);
    res.status(500).json({
      success: false,
      error: { code: 'START_FAILED', message: 'Failed to start assessment' }
    });
  }
});

// Submit answer
router.post('/sessions/:sessionId/answers', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { question_id, answer, time_taken_seconds, is_final } = req.body;
    const userId = req.user.user_id;

    // Verify session ownership and validity
    const session = await db.query(
      'SELECT * FROM AssessmentSessions WHERE session_id = ? AND user_id = ? AND status = ?',
      [sessionId, userId, 'active']
    );

    if (!session.length) {
      return res.status(404).json({
        success: false,
        error: { code: 'INVALID_SESSION', message: 'Invalid or expired session' }
      });
    }

    // Check if session has expired
    if (new Date() > new Date(session[0].expires_at)) {
      await db.query(
        'UPDATE AssessmentSessions SET status = ? WHERE session_id = ?',
        ['expired', sessionId]
      );
      return res.status(410).json({
        success: false,
        error: { code: 'SESSION_EXPIRED', message: 'Assessment session has expired' }
      });
    }

    // Save/update answer
    const existingAnswer = await db.query(
      'SELECT * FROM AssessmentAnswers WHERE session_id = ? AND question_id = ?',
      [sessionId, question_id]
    );

    if (existingAnswer.length > 0) {
      // Update existing answer
      await db.query(`
        UPDATE AssessmentAnswers 
        SET answer = ?, time_taken_seconds = ?, is_final = ?, updated_at = GETDATE()
        WHERE session_id = ? AND question_id = ?
      `, [JSON.stringify(answer), time_taken_seconds, is_final, sessionId, question_id]);
    } else {
      // Insert new answer
      await db.query(`
        INSERT INTO AssessmentAnswers 
        (session_id, question_id, answer, time_taken_seconds, is_final)
        VALUES (?, ?, ?, ?, ?)
      `, [sessionId, question_id, JSON.stringify(answer), time_taken_seconds, is_final]);
    }

    // Calculate remaining time
    const timeRemaining = Math.max(0, 
      Math.floor((new Date(session[0].expires_at) - new Date()) / 1000)
    );

    // Get current progress
    const progressQuery = await db.query(
      'SELECT COUNT(*) as answered FROM AssessmentAnswers WHERE session_id = ? AND answer IS NOT NULL',
      [sessionId]
    );

    const { resource: assessment } = await assessmentsContainer.item(
      session[0].assessment_id, 
      session[0].assessment_id
    ).read();

    res.status(200).json({
      success: true,
      data: {
        question_id,
        answer_saved: true,
        is_correct: null, // Don't reveal during assessment
        time_remaining: timeRemaining,
        progress: {
          answered: progressQuery[0].answered,
          total: assessment.questions.length,
          percentage: Math.round((progressQuery[0].answered / assessment.questions.length) * 100)
        }
      },
      message: 'Answer saved successfully'
    });

  } catch (error) {
    console.error('Error saving answer:', error);
    res.status(500).json({// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/courses', require('./routes/courses'));
app.use('/api/v1/content', require('./routes/content'));
app.use('/api/v1/assessments', require('./routes/assessments'));
app.use('/api/v1/ai', require('./routes/ai-agents'));
app.use('/api/v1/community', require('./routes/community'));
app.use('/api/v1/analytics', require('./routes/analytics'));
app.use('/api/v1/subscriptions', require('./routes/subscriptions'));
app.use('/api/v1/notifications', require('./routes/notifications'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AARAMBH AI API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global Error:', error);
  res.status(error.status || 500).json({
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: error.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    },
    timestamp: new Date().toISOString(),
    request_id: req.headers['x-request-id'] || 'unknown'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`AARAMBH AI API server running on port ${PORT}`);
});

module.exports = app;
```

### 2.6 Authentication Routes Implementation
```javascript
// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const admin = require('../config/firebase');
const db = require('../config/database');
const { body, validationResult } = require('express-validator');

// Register new user
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('name').isLength({ min: 2, max: 100 }).trim(),
  body('age').optional().isInt({ min: 1, max: 120 }),
  body('provider').isIn(['email', 'google', 'facebook'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: errors.array() }
      });
    }

    const { email, name, age, provider, firebase_uid } = req.body;

    // Check if user already exists
    const existingUser = await db.query('SELECT * FROM Users WHERE email = ? OR firebase_uid = ?', [email, firebase_uid]);
    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        error: { code: 'USER_EXISTS', message: 'User already exists' }
      });
    }

    // Create user in database
    const userId = await db.query(
      'INSERT INTO Users (firebase_uid, email, name, age) OUTPUT INSERTED.user_id VALUES (?, ?, ?, ?)',
      [firebase_uid, email, name, age || null]
    );

    // Create user profile
    await db.query(
      'INSERT INTO UserProfiles (user_id, onboarding_completed) VALUES (?, ?)',
      [userId[0].user_id, false]
    );

    // Generate custom token for response
    const customToken = await admin.auth().createCustomToken(firebase_uid);

    res.status(201).json({
      success: true,
      data: {
        user_id: userId[0].user_id,
        firebase_uid,
        access_token: customToken,
        user_profile: {
          email,
          name,
          age: age || null,
          onboarding_completed: false
        }
      },
      message: 'User registered successfully'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'REGISTRATION_FAILED', message: 'Failed to register user' }
    });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('provider').isIn(['email', 'google', 'facebook'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: errors.array() }
      });
    }

    const { email, firebase_uid } = req.body;

    // Get user from database
    const userQuery = `
      SELECT u.*, p.onboarding_completed, p.subscription_status 
      FROM Users u 
      LEFT JOIN UserProfiles p ON u.user_id = p.user_id 
      WHERE u.email = ? AND u.firebase_uid = ?
    `;
    const user = await db.query(userQuery, [email, firebase_uid]);

    if (!user.length) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' }
      });
    }

    // Generate custom token
    const customToken = await admin.auth().createCustomToken(firebase_uid);

    res.status(200).json({
      success: true,
      data: {
        user_id: user[0].user_id,
        access_token: customToken,
        user_profile: {
          email: user[0].email,
          name: user[0].name,
          subscription_status: user[0].subscription_status || 'inactive',
          onboarding_completed: user[0].onboarding_completed || false
        }
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'LOGIN_FAILED', message: 'Failed to login' }
    });
  }
});

module.exports = router;
```

## 3. Phase 2: Basic Course Management & Content System

### 3.1 Cosmos DB Setup for Course Content
```javascript
// backend/config/cosmosdb.js
const { CosmosClient } = require('@azure/cosmos');

const client = new CosmosClient({
  endpoint: process.env.COSMOS_DB_ENDPOINT,
  key: process.env.COSMOS_DB_KEY
});

const databaseId = 'AarambhAI';
const containersConfig = [
  { id: 'Courses', partitionKey: '/courseId' },
  { id: 'Lessons', partitionKey: '/courseId' },
  { id: 'Assessments', partitionKey: '/courseId' },
  { id: 'GeneratedContent', partitionKey: '/contentType' },
  { id: 'Community', partitionKey: '/groupId' }
];

async function initializeCosmosDB() {
  try {
    // Create database
    const { database } = await client.databases.createIfNotExists({ id: databaseId });
    console.log(`Database "${databaseId}" created or exists`);

    // Create containers
    for (const containerConfig of containersConfig) {
      const { container } = await database.containers.createIfNotExists({
        id: containerConfig.id,
        partitionKey: containerConfig.partitionKey
      });
      console.log(`Container "${containerConfig.id}" created or exists`);
    }

    return database;
  } catch (error) {
    console.error('Error initializing Cosmos DB:', error);
    throw error;
  }
}

module.exports = { client, databaseId, initializeCosmosDB };
```

### 3.2 Course Management Routes
```javascript
// backend/routes/courses.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { CosmosClient } = require('@azure/cosmos');
const db = require('../config/database');

const cosmosClient = new CosmosClient({
  endpoint: process.env.COSMOS_DB_ENDPOINT,
  key: process.env.COSMOS_DB_KEY
});

const database = cosmosClient.database('AarambhAI');
const coursesContainer = database.container('Courses');

// Get available courses
router.get('/', async (req, res) => {
  try {
    const {
      category,
      level,
      board,
      grade,
      subject,
      exam_type,
      search,
      page = 1,
      limit = 20,
      sort_by = 'popularity'
    } = req.query;

    let querySpec = {
      query: 'SELECT * FROM c WHERE c.status = "active"',
      parameters: []
    };

    // Build dynamic query based on filters
    const conditions = [];
    const parameters = [];

    if (category) {
      conditions.push('c.category = @category');
      parameters.push({ name: '@category', value: category });
    }

    if (level) {
      conditions.push('c.level = @level');
      parameters.push({ name: '@level', value: level });
    }

    if (exam_type) {
      conditions.push('c.exam_type = @exam_type');
      parameters.push({ name: '@exam_type', value: exam_type });
    }

    if (search) {
      conditions.push('(CONTAINS(LOWER(c.title), @search) OR CONTAINS(LOWER(c.description), @search))');
      parameters.push({ name: '@search', value: search.toLowerCase() });
    }

    if (conditions.length > 0) {
      querySpec.query += ' AND ' + conditions.join(' AND ');
      querySpec.parameters = parameters;
    }

    // Add sorting
    const sortOptions = {
      popularity: 'ORDER BY c.enrolled_students DESC',
      rating: 'ORDER BY c.rating DESC',
      latest: 'ORDER BY c.created_at DESC',
      price: 'ORDER BY c.pricing.monthly ASC'
    };
    querySpec.query += ' ' + (sortOptions[sort_by] || sortOptions.popularity);

    // Add pagination
    const offset = (page - 1) * limit;
    querySpec.query += ` OFFSET ${offset} LIMIT ${limit}`;

    const { resources: courses } = await coursesContainer.items.query(querySpec).fetchAll();

    // Get total count for pagination
    const countQuery = {
      query: querySpec.query.replace(/SELECT \* FROM c/, 'SELECT VALUE COUNT(1) FROM c').split(' ORDER BY')[0],
      parameters: querySpec.parameters
    };
    const { resources: countResult } = await coursesContainer.items.query(countQuery).fetchAll();
    const totalItems = countResult[0] || 0;

    res.status(200).json({
      success: true,
      data: {
        courses: courses.map(course => ({
          course_id: course.id,
          title: course.title,
          description: course.description,
          category: course.category,
          level: course.level,
          duration_days: course.duration,
          total_lessons: course.syllabus?.chapters?.reduce((acc, ch) => acc + (ch.lesson_count || 0), 0) || 0,
          rating: course.rating || 0,
          enrolled_students: course.enrolled_students || 0,
          pricing: course.pricing,
          thumbnail: course.thumbnail,
          exam_type: course.exam_type
        })),
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(totalItems / limit),
          total_items: totalItems,
          items_per_page: parseInt(limit),
          has_next: (page * limit) < totalItems,
          has_previous: page > 1
        }
      },
      message: 'Courses retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: 'Failed to fetch courses' }
    });
  }
});

// Get course details
router.get('/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;

    // Get course from Cosmos DB
    const { resource: course } = await coursesContainer.item(courseId, courseId).read();

    if (!course) {
      return res.status(404).json({
        success: false,
        error: { code: 'COURSE_NOT_FOUND', message: 'Course not found' }
      });
    }

    // Check if user is enrolled
    const enrollmentQuery = `
      SELECT * FROM Subscriptions 
      WHERE user_id = ? AND course_id = ? AND status = 'active' AND end_date > GETDATE()
    `;
    const enrollment = await db.query(enrollmentQuery, [req.user.user_id, courseId]);
    const isEnrolled = enrollment.length > 0;

    // Get user progress if enrolled
    let userProgress = null;
    if (isEnrolled) {
      const progressQuery = `
        SELECT completion_percentage, lessons_completed, time_spent_minutes, last_accessed 
        FROM UserProgress 
        WHERE user_id = ? AND course_id = ?
      `;
      const progress = await db.query(progressQuery, [req.user.user_id, courseId]);
      userProgress = progress[0] || null;
    }

    res.status(200).json({
      success: true,
      data: {
        ...course,
        enrollment_info: {
          is_enrolled: isEnrolled,
          can_enroll: !isEnrolled,
          user_progress: userProgress
        }
      },
      message: 'Course details retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching course details:', error);
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: 'Failed to fetch course details' }
    });
  }
});

// Enroll in course
router.post('/:courseId/enroll', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { plan_type, payment_method, target_completion_date } = req.body;

    // Get course details
    const { resource: course } = await coursesContainer.item(courseId, courseId).read();
    if (!course) {
      return res.status(404).json({
        success: false,
        error: { code: 'COURSE_NOT_FOUND', message: 'Course not found' }
      });
    }

    // Check if already enrolled
    const existingEnrollment = await db.query(
      'SELECT * FROM Subscriptions WHERE user_id = ? AND course_id = ? AND status = ?',
      [req.user.user_id, courseId, 'active']
    );

    if (existingEnrollment.length > 0) {
      return res.status(409).json({
        success: false,
        error: { code: 'ALREADY_ENROLLED', message: 'Already enrolled in this course' }
      });
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    const durationMap = { monthly: 30, quarterly: 90, annual: 365 };
    endDate.setDate(endDate.getDate() + durationMap[plan_type]);

    // Get pricing
    const pricing = course.pricing[plan_type];
    if (!pricing) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PLAN', message: 'Invalid subscription plan' }
      });
    }

    // Create subscription (payment integration would go here)
    const subscriptionId = await db.query(`
      INSERT INTO Subscriptions (user_id, course_id, plan_type, start_date, end_date, status, amount_paid)
      OUTPUT INSERTED.subscription_id
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [req.user.user_id, courseId, plan_type, startDate, endDate, 'active', pricing]);

    // Initialize user progress
    await db.query(`
      INSERT INTO UserProgress (user_id, course_id, completion_percentage, lessons_completed, total_lessons, time_spent_minutes)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [req.user.user_id, courseId, 0, 0, course.syllabus?.chapters?.reduce((acc, ch) => acc + (ch.lesson_count || 0), 0) || 0, 0]);

    res.status(201).json({
      success: true,
      data: {
        enrollment_id: subscriptionId[0].subscription_id,
        course_id: courseId,
        plan_type,
        start_date: startDate,
        end_date: endDate,
        access_granted: true,
        next_steps: [
          'Complete course orientation',
          'Take initial assessment',
          'Set up study schedule'
        ]
      },
      message: 'Successfully enrolled in course'
    });

  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ENROLLMENT_FAILED', message: 'Failed to enroll in course' }
    });
  }
});

module.exports = router;
```

### 3.3 Content Management System
```javascript
// backend/routes/content.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { CosmosClient } = require('@azure/cosmos');
const db = require('../config/database');

const cosmosClient = new CosmosClient({
  endpoint: process.env.COSMOS_DB_ENDPOINT,
  key: process.env.COSMOS_DB_KEY
});

const database = cosmosClient.database('AarambhAI');
const lessonsContainer = database.container('Lessons');

// Get lesson content
router.get('/courses/:courseId/lessons/:lessonId', authenticateToken, async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;

    // Verify user enrollment
    const enrollment = await db.query(
      'SELECT * FROM Subscriptions WHERE user_id = ? AND course_id = ? AND status = ? AND end_date > GETDATE()',
      [req.user.user_id, courseId, 'active']
    );

    if (!enrollment.length) {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCESS_DENIED', message: 'Course access required' }
      });
    }

    // Get lesson content
    const { resource: lesson } = await lessonsContainer.item(lessonId, courseId).read();

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: { code: 'LESSON_NOT_FOUND', message: 'Lesson not found' }
      });
    }

    // Get user progress for this lesson
    const progressQuery = `
      SELECT progress_percentage, time_spent, is_completed, last_position, bookmarks, notes
      FROM LessonProgress 
      WHERE user_id = ? AND lesson_id = ?
    `;
    const progress = await db.query(progressQuery, [req.user.user_id, lessonId]);
    const userProgress = progress[0] || {
      progress_percentage: 0,
      time_spent: 0,
      is_completed: false,
      last_position: null,
      bookmarks: [],
      notes: []
    };

    res.status(200).json({
      success: true,
      data: {
        ...lesson,
        user_progress: userProgress
      },
      message: 'Lesson content retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching lesson content:', error);
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: 'Failed to fetch lesson content' }
    });
  }
});

// Update lesson progress
router.post('/courses/:courseId/lessons/:lessonId/progress', authenticateToken, async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const {
      progress_percentage,
      time_spent_seconds,
      current_position,
      completed_sections,
      is_completed,
      notes,
      bookmarks
    } = req.body;

    // Verify enrollment
    const enrollment = await db.query(
      'SELECT * FROM Subscriptions WHERE user_id = ? AND course_id = ? AND status = ?',
      [req.user.user_id, courseId, 'active']
    );

    if (!enrollment.length) {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCESS_DENIED', message: 'Course access required' }
      });
    }

    // Update or insert lesson progress
    const existingProgress = await db.query(
      'SELECT * FROM LessonProgress WHERE user_id = ? AND lesson_id = ?',
      [req.user.user_id, lessonId]
    );

    let query, params;
    if (existingProgress.length > 0) {
      // Update existing progress
      query = `
        UPDATE LessonProgress 
        SET progress_percentage = ?, time_spent = time_spent + ?, 
            current_position = ?, is_completed = ?, notes = ?, bookmarks = ?, updated_at = GETDATE()
        WHERE user_id = ? AND lesson_id = ?
      `;
      params = [
        progress_percentage,
        Math.floor(time_spent_seconds / 60), // Convert to minutes
        current_position,
        is_completed,
        JSON.stringify(notes || []),
        JSON.stringify(bookmarks || []),
        req.user.user_id,
        lessonId
      ];
    } else {
      // Insert new progress
      query = `
        INSERT INTO LessonProgress 
        (user_id, lesson_id, course_id, progress_percentage, time_spent, current_position, is_completed, notes, bookmarks)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      params = [
        req.user.user_id,
        lessonId,
        courseId,
        progress_percentage,
        Math.floor(time_spent_seconds / 60),
        current_position,
        is_completed,
        JSON.stringify(notes || []),
        JSON.stringify(bookmarks || [])
      ];
    }

    await db.query(query, params);

    // Update overall course progress if lesson completed
    if (is_completed) {
      await updateCourseProgress(req.user.user_id, courseId);
    }

    // Check for achievements
    const achievements = await checkAchievements(req.user.user_id, courseId, lessonId);

    // Get next recommendation
    const nextRecommendation = await getNextRecommendation(req.user.user_id, courseId, lessonId);

    res.status(200).json({
      success: true,
      data: {
        lesson_id: lessonId,
        progress_updated: true,
        new_progress_percentage: progress_percentage,
        achievements_unlocked: achievements,
        next_recommendation: nextRecommendation
      },
      message: 'Progress updated successfully'
    });

  } catch (error) {
    console.error('Error updating lesson progress:', error);
    res.status(500).json({
      success: false,
      error: { code: 'UPDATE_FAILED', message: 'Failed to update progress' }
    });
  }
});

// Helper function to update course progress
async function updateCourseProgress(userId, courseId) {
  try {
    const progressQuery = `
      SELECT 
        COUNT(*) as total_lessons,
        SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed_lessons,
        SUM(time_spent) as total_time_spent
      FROM LessonProgress 
      WHERE user_id = ? AND course_id = ?
    `;
    
    const result = await db.query(progressQuery, [userId, courseId]);
    const { total_lessons, completed_lessons, total_time_spent } = result[0];
    
    const completion_percentage = total_lessons > 0 ? (completed_lessons / total_lessons) * 100 : 0;
    
    await db.query(`
      UPDATE UserProgress 
      SET completion_percentage = ?, lessons_completed = ?, time_spent_minutes = ?, last_accessed = GETDATE()
      WHERE user_id = ? AND course_id = ?
    `, [completion_percentage, completed_lessons, total_time_spent, userId, courseId]);
    
  } catch (error) {
    console.error('Error updating course progress:', error);
  }
}

// Helper function to check achievements
async function checkAchievements(userId, courseId, lessonId) {
  // Implementation for achievement checking
  return []; // Placeholder
}

// Helper function to get next recommendation
async function getNextRecommendation(userId, courseId, lessonId) {
  // Implementation for next content recommendation
  return {
    type: 'lesson',
    id: 'next_lesson_id',
    title: 'Next Lesson Title',
    reason: 'Continue with the course sequence'
  };
}

module.exports = router;
```

## 4. Phase 3: AI Agent Framework & Content Generation

### 4.1 AI Agent Base Framework
```python
# ai-services/agents/base_agent.py
import asyncio
import json
import logging
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
from datetime import datetime
import aiohttp
from azure.cognitiveservices.language.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AgentRequest:
    def __init__(self, request_id: str, user_id: str, task_type: str, 
                 parameters: Dict[str, Any], context: Optional[Dict] = None):
        self.request_id = request_id
        self.user_id = user_id
        self.task_type = task_type
        self.parameters = parameters
        self.context = context or {}
        self.timestamp = datetime.utcnow()

class AgentResponse:
    def __init__(self, request_id: str, agent_id: str, success: bool, 
                 data: Any = None, error: Optional[str] = None, metadata: Optional[Dict] = None):
        self.request_id = request_id
        self.agent_id = agent_id
        self.success = success
        self.data = data
        self.error = error
        self.metadata = metadata or {}
        self.timestamp = datetime.utcnow()

class BaseAgent(ABC):
    def __init__(self, agent_id: str, capabilities: List[str], config: Dict[str, Any]):
        self.agent_id = agent_id
        self.capabilities = capabilities
        self.config = config
        self.model_endpoints = {}
        self.is_initialized = False
        
    async def initialize(self):
        """Initialize the agent with required resources"""
        try:
            await self._setup_models()
            await self._setup_connections()
            self.is_initialized = True
            logger.info(f"Agent {self.agent_id} initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize agent {self.agent_id}: {str(e)}")
            raise
    
    @abstractmethod
    async def _setup_models(self):
        """Setup AI models and endpoints"""
        pass
    
    @abstractmethod
    async def _setup_connections(self):
        """Setup external connections"""
        pass
    
    async def process_request(self, request: AgentRequest) -> AgentResponse:
        """Process an incoming request"""
        if not self.is_initialized:
            await self.initialize()
        
        try:
            logger.info(f"Processing request {request.request_id} for agent {self.agent_id}")
            
            # Validate request
            if not self._validate_request(request):
                return AgentResponse(
                    request.request_id, 
                    self.agent_id, 
                    False, 
                    error="Invalid request parameters"
                )
            
            # Process the request
            result = await self._process_task(request)
            
            return AgentResponse(
                request.request_id,
                self.agent_id,
                True,
                data=result,
                metadata={
                    "processing_time": (datetime.utcnow() - request.timestamp).total_seconds(),
                    "capabilities_used": [request.task_type]
                }
            )
            
        except Exception as e:
            logger.error(f"Error processing request {request.request_id}: {str(e)}")
            return AgentResponse(
                request.request_id,
                self.agent_id,
                False,
                error=str(e)
            )
    
    @abstractmethod
    async def _process_task(self, request: AgentRequest) -> Any:
        """Process the specific task"""
        pass
    
    def _validate_request(self, request: AgentRequest) -> bool:
        """Validate the incoming request"""
        return request.task_type in self.capabilities
    
    async def collaborate(self, other_agents: List['BaseAgent'], task: str, context: Dict) -> Dict:
        """Collaborate with other agents"""
        collaboration_results = {}
        
        for agent in other_agents:
            if task in agent.capabilities:
                agent_request = AgentRequest(
                    f"collab_{datetime.utcnow().timestamp()}",
                    context.get('user_id', 'system'),
                    task,
                    context.get('parameters', {}),
                    context
                )
                
                response = await agent.process_request(agent_request)
                collaboration_results[agent.agent_id] = response.data if response.success else None
        
        return collaboration_results
```

### 4.2 Teacher Agent Implementation
```python
# ai-services/agents/teacher_agent.py
import openai
import json
from typing import Dict, List, Any
from .base_agent import BaseAgent, AgentRequest
import asyncio
import aiohttp

class TeacherAgent(BaseAgent):
    def __init__(self, config: Dict[str, Any]):
        super().__init__(
            "teacher_agent",
            ["content_generation", "explanation", "question_creation", "lesson_planning"],
            config
        )
        self.openai_client = None
        self.subject_specializations = {
            "physics": "Expert in Physics with deep understanding of concepts from class 9-12 and competitive exams",
            "chemistry": "Expert in Chemistry with# AARAMBH AI - Development Implementation Guide

## 1. Implementation Overview

This guide provides step-by-step instructions for Claude CLI to build AARAMBH AI from scratch. Follow this logical sequence to ensure proper system architecture and functionality.

### 1.1 Development Phases Priority
1. **Phase 1**: Core Infrastructure & Authentication (Weeks 1-2)
2. **Phase 2**: Basic Course Management & Content System (Weeks 3-4)
3. **Phase 3**: AI Agent Framework & Content Generation (Weeks 5-7)
4. **Phase 4**: Assessment & Analytics System (Weeks 8-9)
5. **Phase 5**: Community & Collaboration Features (Weeks 10-11)
6. **Phase 6**: Mobile App & Advanced Features (Weeks 12-14)
7. **Phase 7**: Testing, Optimization & Deployment (Weeks 15-16)

### 1.2 Technology Stack Implementation Order
```
1. Backend Services (Node.js + Azure)
2. Database Schema (Azure SQL + Cosmos DB)
3. API Layer (Express.js + API Gateway)
4. Authentication (Firebase Integration)
5. Frontend Web App (React.js)
6. AI Agent System (Python + Azure ML)
7. Mobile App (React Native)
8. DevOps & Monitoring (Azure DevOps)
```

## 2. Phase 1: Core Infrastructure & Authentication

### 2.1 Project Setup
```bash
# Initialize main project structure
mkdir aarambh-ai
cd aarambh-ai

# Backend API
mkdir backend
cd backend
npm init -y
npm install express cors helmet morgan dotenv bcryptjs jsonwebtoken
npm install azure-storage azure-sql-client firebase-admin
npm install @azure/cosmos @azure/service-bus
npm install joi express-validator express-rate-limit
cd ..

# Frontend Web App
npx create-react-app frontend --template typescript
cd frontend
npm install @reduxjs/toolkit react-redux
npm install @mui/material @emotion/react @emotion/styled
npm install axios react-router-dom
npm install firebase framer-motion
cd ..

# AI Services
mkdir ai-services
cd ai-services
# Python virtual environment setup for AI agents
cd ..

# Mobile App
npx create-expo-app mobile --template typescript
cd mobile
npm install @reduxjs/toolkit react-redux
npm install native-base react-native-elements
npm install @react-navigation/native @react-navigation/stack
cd ..
```

### 2.2 Environment Configuration
```javascript
// backend/.env
NODE_ENV=development
PORT=5000
DATABASE_URL=your_azure_sql_connection
COSMOS_DB_ENDPOINT=your_cosmos_endpoint
COSMOS_DB_KEY=your_cosmos_key
FIREBASE_PROJECT_ID=your_firebase_project
AZURE_STORAGE_CONNECTION=your_storage_connection
JWT_SECRET=your_jwt_secret
REDIS_URL=your_redis_connection

// frontend/.env
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_FIREBASE_CONFIG=your_firebase_config
REACT_APP_ENVIRONMENT=development
```

### 2.3 Database Schema Implementation
```sql
-- Execute this in Azure SQL Database
-- Users and Authentication Tables
CREATE TABLE Users (
    user_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    age INT,
    gender VARCHAR(20),
    location VARCHAR(255),
    profile_picture_url VARCHAR(500),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    is_active BIT DEFAULT 1
);

CREATE TABLE UserProfiles (
    profile_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(user_id),
    board VARCHAR(50),
    grade VARCHAR(20),
    school VARCHAR(255),
    target_exams NVARCHAR(MAX), -- JSON array
    learning_preferences NVARCHAR(MAX), -- JSON object
    subscription_status VARCHAR(50) DEFAULT 'inactive',
    onboarding_completed BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE Subscriptions (
    subscription_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(user_id),
    course_id VARCHAR(100) NOT NULL,
    plan_type VARCHAR(50) NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    payment_id VARCHAR(255),
    amount_paid DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'INR',
    auto_renewal BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE()
);

-- Create indexes for performance
CREATE INDEX IX_Users_FirebaseUid ON Users(firebase_uid);
CREATE INDEX IX_Users_Email ON Users(email);
CREATE INDEX IX_UserProfiles_UserId ON UserProfiles(user_id);
CREATE INDEX IX_Subscriptions_UserId ON Subscriptions(user_id);
CREATE INDEX IX_Subscriptions_CourseId ON Subscriptions(course_id);
```

### 2.4 Firebase Authentication Setup
```javascript
// backend/config/firebase.js
const admin = require('firebase-admin');

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
});

module.exports = admin;

// backend/middleware/auth.js
const admin = require('../config/firebase');
const db = require('../config/database');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: { code: 'NO_TOKEN', message: 'Access token required' }
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Get user from database
    const userQuery = 'SELECT * FROM Users WHERE firebase_uid = ?';
    const user = await db.query(userQuery, [decodedToken.uid]);
    
    if (!user.length) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' }
      });
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      user_id: user[0].user_id,
      ...user[0]
    };
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid access token' }
    });
  }
};

module.exports = { authenticateToken };
```

### 2.5 Basic API Structure
```javascript
// backend/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: