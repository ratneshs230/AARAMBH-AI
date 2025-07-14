# AARAMBH AI - Technical Architecture Document

## 1. System Overview

### 1.1 Architecture Principles
- **Microservices Architecture**: Each module as independent service
- **API-First Design**: RESTful APIs with GraphQL for complex queries
- **Event-Driven Architecture**: Asynchronous communication between services
- **Cloud-Native**: Fully utilizing Azure cloud services
- **Scalable by Design**: Horizontal scaling capabilities
- **Security by Design**: Zero-trust security model

### 1.2 Technology Stack Detail

```
Frontend Layer
├── Web Application
│   ├── Framework: React.js 18+ with TypeScript
│   ├── State Management: Redux Toolkit + RTK Query
│   ├── UI Components: Material-UI / Chakra UI
│   ├── Styling: Tailwind CSS
│   ├── Build Tool: Vite
│   └── PWA: Workbox for service workers
├── Mobile Application
│   ├── Framework: React Native 0.72+
│   ├── Navigation: React Navigation 6
│   ├── State Management: Redux Toolkit
│   ├── UI Components: Native Base / React Native Elements
│   └── Platform-specific: Expo for development
└── Shared Components
    ├── Design System: Storybook
    ├── Icon Library: React Icons
    └── Animation: Framer Motion / Lottie
```

## 2. Backend Architecture

### 2.1 Microservices Structure

```
API Gateway (Azure API Management)
├── Authentication Service
│   ├── Technology: Firebase Admin SDK
│   ├── Database: Firebase Firestore
│   ├── Features: JWT validation, role management
│   └── Endpoints: /auth/login, /auth/register, /auth/refresh
├── User Management Service
│   ├── Technology: Node.js + Express.js
│   ├── Database: Azure SQL Database
│   ├── Features: Profile management, preferences
│   └── Endpoints: /users/profile, /users/preferences
├── Course Management Service
│   ├── Technology: Node.js + Express.js
│   ├── Database: Azure Cosmos DB
│   ├── Features: Course CRUD, enrollment, progress
│   └── Endpoints: /courses, /enrollments, /progress
├── Content Management Service
│   ├── Technology: Node.js + Express.js
│   ├── Database: Azure Cosmos DB + Blob Storage
│   ├── Features: Lesson content, media management
│   └── Endpoints: /content, /lessons, /media
├── Assessment Service
│   ├── Technology: Node.js + Express.js
│   ├── Database: Azure SQL Database
│   ├── Features: Quiz creation, scoring, analytics
│   └── Endpoints: /assessments, /submissions, /scores
├── AI Agent Orchestration Service
│   ├── Technology: Python + FastAPI
│   ├── Database: Azure ML workspace
│   ├── Features: Agent coordination, ML model serving
│   └── Endpoints: /agents, /generate, /analyze
├── Community Service
│   ├── Technology: Node.js + Express.js + Socket.io
│   ├── Database: Azure Cosmos DB
│   ├── Features: Forums, chat, collaboration
│   └── Endpoints: /community, /messages, /groups
├── Analytics Service
│   ├── Technology: Python + FastAPI
│   ├── Database: Azure Data Lake + Synapse
│   ├── Features: Learning analytics, reporting
│   └── Endpoints: /analytics, /reports, /insights
├── Notification Service
│   ├── Technology: Node.js + Express.js
│   ├── Database: Azure Service Bus
│   ├── Features: Push notifications, email, SMS
│   └── Endpoints: /notifications, /preferences
└── Content Generation Service
    ├── Technology: Python + FastAPI
    ├── Database: Azure ML + Cognitive Services
    ├── Features: AI content creation, research
    └── Endpoints: /generate, /research, /validate
```

### 2.2 Database Design

#### 2.2.1 User Database (Azure SQL)
```sql
-- Users table
CREATE TABLE Users (
    user_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    age INT,
    gender VARCHAR(20),
    location VARCHAR(255),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- User Profiles table
CREATE TABLE UserProfiles (
    profile_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(user_id),
    board VARCHAR(50), -- CBSE, ICSE, State boards
    grade VARCHAR(20),
    school VARCHAR(255),
    target_exams TEXT, -- JSON array of exam codes
    learning_preferences TEXT, -- JSON object
    subscription_status VARCHAR(50),
    created_at DATETIME DEFAULT GETDATE()
);

-- Subscriptions table
CREATE TABLE Subscriptions (
    subscription_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(user_id),
    course_id VARCHAR(100),
    plan_type VARCHAR(50),
    start_date DATETIME,
    end_date DATETIME,
    status VARCHAR(20), -- active, expired, cancelled
    payment_id VARCHAR(255),
    created_at DATETIME DEFAULT GETDATE()
);
```

#### 2.2.2 Content Database (Azure Cosmos DB)
```json
// Courses Container
{
  "id": "course_001",
  "courseCode": "JEE_MAIN_PHYSICS",
  "title": "JEE Main Physics Preparation",
  "description": "Comprehensive physics preparation for JEE Main",
  "category": "competitive_exam",
  "level": "intermediate",
  "duration": 365,
  "syllabus": {
    "chapters": [
      {
        "id": "ch_001",
        "title": "Mechanics",
        "topics": ["Kinematics", "Dynamics", "Work Energy Power"],
        "estimatedHours": 40
      }
    ]
  },
  "pricing": {
    "monthly": 299,
    "quarterly": 799,
    "annual": 2999
  },
  "metadata": {
    "created_at": "2025-01-15T00:00:00Z",
    "updated_at": "2025-01-15T00:00:00Z",
    "version": "1.0"
  }
}

// Lessons Container
{
  "id": "lesson_001",
  "courseId": "course_001",
  "chapterId": "ch_001",
  "title": "Introduction to Kinematics",
  "content": {
    "text": "Detailed explanation...",
    "audio": "https://storage.blob.core.windows.net/audio/lesson_001.mp3",
    "images": ["https://storage.blob.core.windows.net/images/kinematic_graph.png"],
    "videos": ["https://storage.blob.core.windows.net/videos/kinematics_intro.mp4"],
    "interactive_elements": [
      {
        "type": "3d_model",
        "url": "https://storage.blob.core.windows.net/3d/projectile_motion.glb"
      }
    ]
  },
  "assessments": ["quiz_001", "practice_001"],
  "prerequisites": [],
  "learning_objectives": ["Understand displacement", "Calculate velocity"],
  "estimated_duration": 45,
  "metadata": {
    "created_by": "teacher_agent",
    "generated_at": "2025-01-15T10:30:00Z",
    "version": "1.2"
  }
}
```

#### 2.2.3 Analytics Database (Azure Synapse)
```sql
-- Learning Analytics Fact Table
CREATE TABLE LearningAnalytics (
    event_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id UNIQUEIDENTIFIER,
    course_id VARCHAR(100),
    lesson_id VARCHAR(100),
    event_type VARCHAR(50), -- lesson_start, lesson_complete, quiz_attempt
    event_data TEXT, -- JSON with additional data
    timestamp DATETIME,
    session_id VARCHAR(100),
    device_type VARCHAR(50),
    platform VARCHAR(50)
);

-- User Progress Dimension
CREATE TABLE UserProgress (
    progress_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER,
    course_id VARCHAR(100),
    completion_percentage DECIMAL(5,2),
    lessons_completed INT,
    total_lessons INT,
    time_spent_minutes INT,
    last_accessed DATETIME,
    streak_days INT,
    performance_score DECIMAL(5,2)
);
```

## 3. AI Agent Architecture

### 3.1 AI Agent Framework
```python
# Base Agent Class
class BaseAgent:
    def __init__(self, agent_id: str, capabilities: List[str]):
        self.agent_id = agent_id
        self.capabilities = capabilities
        self.model_endpoints = {}
        self.memory = AgentMemory()
    
    async def process_request(self, request: AgentRequest) -> AgentResponse:
        # Common processing logic
        pass
    
    async def collaborate(self, other_agents: List[BaseAgent], task: str):
        # Inter-agent collaboration
        pass

# Teacher Agent Implementation
class TeacherAgent(BaseAgent):
    def __init__(self):
        super().__init__("teacher_agent", ["content_generation", "explanation", "question_creation"])
        self.subject_models = {
            "physics": "azure-openai-physics-model",
            "chemistry": "azure-openai-chemistry-model",
            "mathematics": "azure-openai-math-model"
        }
    
    async def generate_lesson(self, topic: str, difficulty: str, format: str) -> LessonContent:
        # Multi-modal lesson generation
        pass
    
    async def create_assessment(self, topic: str, question_count: int) -> Assessment:
        # Assessment creation
        pass

# Designer Agent Implementation
class DesignerAgent(BaseAgent):
    def __init__(self):
        super().__init__("designer_agent", ["visual_creation", "ui_adaptation", "accessibility"])
        self.design_models = {
            "image_generation": "azure-dalle-model",
            "diagram_creation": "azure-custom-diagram-model"
        }
    
    async def create_visual_content(self, description: str, style: str) -> VisualContent:
        # Visual content generation
        pass
```

### 3.2 AI Model Configuration
```yaml
# Azure ML Configuration
ai_models:
  teacher_agent:
    primary_model: "gpt-4-turbo"
    subject_models:
      physics: "physics-specialist-model"
      chemistry: "chemistry-specialist-model"
      mathematics: "math-specialist-model"
    endpoints:
      content_generation: "/generate-content"
      assessment_creation: "/create-assessment"
  
  designer_agent:
    image_model: "dall-e-3"
    diagram_model: "custom-diagram-model"
    endpoints:
      image_generation: "/generate-image"
      diagram_creation: "/create-diagram"
  
  personal_watcher:
    analytics_model: "custom-analytics-model"
    prediction_model: "learning-prediction-model"
    endpoints:
      analyze_progress: "/analyze-progress"
      predict_performance: "/predict-performance"
```

## 4. API Specifications

### 4.1 Authentication API
```yaml
openapi: 3.0.0
info:
  title: AARAMBH AI Authentication API
  version: 1.0.0

paths:
  /auth/register:
    post:
      summary: Register new user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 8
                name:
                  type: string
                provider:
                  type: string
                  enum: [email, google, facebook]
      responses:
        201:
          description: User registered successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  user_id:
                    type: string
                  access_token:
                    type: string
                  refresh_token:
                    type: string

  /auth/login:
    post:
      summary: User login
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                password:
                  type: string
                provider:
                  type: string
      responses:
        200:
          description: Login successful
        401:
          description: Invalid credentials
```

### 4.2 Course Management API
```yaml
paths:
  /courses:
    get:
      summary: Get available courses
      parameters:
        - name: category
          in: query
          schema:
            type: string
            enum: [school, competitive_exam, college]
        - name: level
          in: query
          schema:
            type: string
        - name: search
          in: query
          schema:
            type: string
      responses:
        200:
          description: List of courses
          content:
            application/json:
              schema:
                type: object
                properties:
                  courses:
                    type: array
                    items:
                      $ref: '#/components/schemas/Course'
                  pagination:
                    $ref: '#/components/schemas/Pagination'

components:
  schemas:
    Course:
      type: object
      properties:
        id:
          type: string
        title:
          type: string
        description:
          type: string
        category:
          type: string
        level:
          type: string
        duration:
          type: integer
        pricing:
          type: object
        syllabus:
          type: object
```

## 5. Deployment Architecture

### 5.1 Azure Infrastructure
```yaml
# Azure Resource Configuration
resource_groups:
  - name: "aarambh-ai-prod"
    location: "South India"
    resources:
      app_services:
        - name: "aarambh-web-app"
          sku: "P1V2"
          runtime: "NODE|18-lts"
        - name: "aarambh-api-gateway"
          sku: "P2V2"
          runtime: "NODE|18-lts"
      
      databases:
        - type: "Azure SQL Database"
          name: "aarambh-users-db"
          tier: "Standard"
          size: "S2"
        - type: "Azure Cosmos DB"
          name: "aarambh-content-db"
          api: "SQL"
          consistency: "Session"
      
      storage:
        - name: "aarambhstorage"
          type: "StorageV2"
          tier: "Standard"
          replication: "LRS"
      
      ai_services:
        - name: "aarambh-cognitive-services"
          type: "CognitiveServices"
          sku: "S0"
        - name: "aarambh-ml-workspace"
          type: "MachineLearningServices"
```

### 5.2 CI/CD Pipeline
```yaml
# Azure DevOps Pipeline
trigger:
  branches:
    include:
      - main
      - develop

variables:
  buildConfiguration: 'Release'
  azureSubscription: 'aarambh-ai-subscription'

stages:
- stage: Build
  jobs:
  - job: BuildWeb
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '18.x'
    - script: |
        npm install
        npm run build
        npm run test
      displayName: 'Build and Test Web App'
    
  - job: BuildMobile
    steps:
    - script: |
        npm install -g @expo/cli
        expo build:android
        expo build:ios
      displayName: 'Build Mobile Apps'

- stage: Deploy
  jobs:
  - deployment: DeployToProduction
    environment: 'production'
    strategy:
      runOnce:
        deploy:
          steps:
          - task: AzureWebApp@1
            inputs:
              azureSubscription: $(azureSubscription)
              appName: 'aarambh-web-app'
              package: '$(Pipeline.Workspace)/**/*.zip'
```

## 6. Security Implementation

### 6.1 Authentication Flow
```javascript
// JWT Token Validation Middleware
const validateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role || 'student'
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Role-based access control
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

### 6.2 Data Encryption
```javascript
// Encryption utilities
const crypto = require('crypto');

class DataEncryption {
  constructor(secretKey) {
    this.algorithm = 'aes-256-gcm';
    this.secretKey = secretKey;
  }
  
  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.secretKey);
    cipher.setIV(iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }
  
  decrypt(encryptedData) {
    const decipher = crypto.createDecipher(this.algorithm, this.secretKey);
    decipher.setIV(Buffer.from(encryptedData.iv, 'hex'));
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

## 7. Performance Optimization

### 7.1 Caching Strategy
```javascript
// Redis caching implementation
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});

class CacheManager {
  async get(key) {
    const cached = await client.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  async set(key, data, expiration = 3600) {
    await client.setex(key, expiration, JSON.stringify(data));
  }
  
  async invalidate(pattern) {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  }
}

// Course content caching
const cacheManager = new CacheManager();

const getCourseContent = async (courseId) => {
  const cacheKey = `course:${courseId}`;
  let content = await cacheManager.get(cacheKey);
  
  if (!content) {
    content = await database.getCourse(courseId);
    await cacheManager.set(cacheKey, content, 7200); // 2 hours
  }
  
  return content;
};
```

### 7.2 Database Optimization
```sql
-- Indexing strategy for performance
CREATE INDEX IX_Users_Email ON Users(email);
CREATE INDEX IX_UserProfiles_UserId ON UserProfiles(user_id);
CREATE INDEX IX_Subscriptions_UserId_Status ON Subscriptions(user_id, status);
CREATE INDEX IX_LearningAnalytics_UserId_Timestamp ON LearningAnalytics(user_id, timestamp);

-- Partitioning for large tables
CREATE PARTITION FUNCTION PF_LearningAnalytics(datetime)
AS RANGE RIGHT FOR VALUES 
('2025-01-01', '2025-02-01', '2025-03-01', '2025-04-01');

CREATE PARTITION SCHEME PS_LearningAnalytics
AS PARTITION PF_LearningAnalytics
TO ([PRIMARY], [PRIMARY], [PRIMARY], [PRIMARY]);

ALTER TABLE LearningAnalytics
ADD CONSTRAINT PK_LearningAnalytics PRIMARY KEY (event_id, timestamp)
ON PS_LearningAnalytics(timestamp);
```

## 8. Monitoring and Observability

### 8.1 Application Insights Configuration
```javascript
// Application monitoring setup
const appInsights = require('applicationinsights');

appInsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY)
  .setAutoDependencyCorrelation(true)
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true, true)
  .setAutoCollectExceptions(true)
  .setAutoCollectDependencies(true)
  .setAutoCollectConsole(true)
  .setUseDiskRetryCaching(true)
  .setSendLiveMetrics(true)
  .start();

// Custom telemetry
const client = appInsights.defaultClient;

const trackUserActivity = (userId, activity, properties = {}) => {
  client.trackEvent({
    name: 'UserActivity',
    properties: {
      userId,
      activity,
      ...properties,
      timestamp: new Date().toISOString()
    }
  });
};

const trackPerformance = (operationName, duration, success = true) => {
  client.trackDependency({
    target: operationName,
    name: operationName,
    data: operationName,
    duration: duration,
    resultCode: success ? 200 : 500,
    success: success
  });
};
```

### 8.2 Health Check Implementation
```javascript
// Health check endpoints
const healthCheck = {
  async checkDatabase() {
    try {
      await database.query('SELECT 1');
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
    }
  },
  
  async checkRedis() {
    try {
      await client.ping();
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
    }
  },
  
  async checkAIServices() {
    try {
      // Test AI service endpoint
      const response = await axios.get(`${process.env.AI_SERVICE_URL}/health`);
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
    }
  }
};

// Health check route
app.get('/health', async (req, res) => {
  const checks = await Promise.all([
    healthCheck.checkDatabase(),
    healthCheck.checkRedis(),
    healthCheck.checkAIServices()
  ]);
  
  const overallStatus = checks.every(check => check.status === 'healthy') ? 'healthy' : 'unhealthy';
  
  res.status(overallStatus === 'healthy' ? 200 : 503).json({
    status: overallStatus,
    checks: {
      database: checks[0],
      redis: checks[1],
      aiServices: checks[2]
    },
    timestamp: new Date().toISOString()
  });
});
```

This technical architecture document provides the detailed implementation guidance that Claude CLI would need to build AARAMBH AI. It includes specific code examples, database schemas, API specifications, and deployment configurations.