import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    agentType?: string;
    provider?: string;
    model?: string;
    tokens?: number;
    cost?: number;
    processingTime?: number;
    confidence?: number;
  };
}

export interface IAIConversation extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId: string;
  title?: string;
  
  // Conversation Context
  context: {
    agentType: 'tutor' | 'content_creator' | 'assessment' | 'analytics' | 'mentor' | 'study_planner' | 'doubt_solver';
    subject?: string;
    educationLevel?: string;
    language: 'hindi' | 'english' | 'bilingual';
    courseId?: mongoose.Types.ObjectId;
    lessonId?: mongoose.Types.ObjectId;
    assessmentId?: mongoose.Types.ObjectId;
  };

  // Messages
  messages: IMessage[];
  messageCount: number;

  // Session Info
  startedAt: Date;
  lastActivityAt: Date;
  endedAt?: Date;
  isActive: boolean;
  duration: number; // in seconds

  // Analytics
  analytics: {
    totalTokensUsed: number;
    totalCost: number;
    averageResponseTime: number;
    userSatisfactionRating?: number;
    helpfulnessRating?: number;
    topics: string[];
    resolvedQueries: number;
    followUpQuestions: number;
  };

  // Quality Metrics
  quality: {
    coherenceScore: number;
    relevanceScore: number;
    accuracyScore: number;
    helpfulnessScore: number;
    engagementScore: number;
  };

  // Feedback
  feedback: {
    rating?: number;
    comment?: string;
    timestamp?: Date;
    helpful?: boolean;
    issues?: string[];
  };

  // Configuration
  settings: {
    saveMessages: boolean;
    allowFeedback: boolean;
    enableAnalytics: boolean;
    maxMessages: number;
    sessionTimeout: number; // in minutes
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  metadata: {
    agentType: String,
    provider: String,
    model: String,
    tokens: Number,
    cost: Number,
    processingTime: Number,
    confidence: Number,
  },
});

const AIConversationSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    context: {
      agentType: {
        type: String,
        enum: ['tutor', 'content_creator', 'assessment', 'analytics', 'mentor', 'study_planner', 'doubt_solver'],
        required: true,
        index: true,
      },
      subject: {
        type: String,
        trim: true,
      },
      educationLevel: {
        type: String,
        trim: true,
      },
      language: {
        type: String,
        enum: ['hindi', 'english', 'bilingual'],
        default: 'bilingual',
      },
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
      lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
      },
      assessmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment',
      },
    },

    messages: [MessageSchema],
    messageCount: {
      type: Number,
      default: 0,
    },

    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    lastActivityAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endedAt: Date,
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    duration: {
      type: Number,
      default: 0,
    },

    analytics: {
      totalTokensUsed: {
        type: Number,
        default: 0,
      },
      totalCost: {
        type: Number,
        default: 0,
      },
      averageResponseTime: {
        type: Number,
        default: 0,
      },
      userSatisfactionRating: {
        type: Number,
        min: 1,
        max: 5,
      },
      helpfulnessRating: {
        type: Number,
        min: 1,
        max: 5,
      },
      topics: [String],
      resolvedQueries: {
        type: Number,
        default: 0,
      },
      followUpQuestions: {
        type: Number,
        default: 0,
      },
    },

    quality: {
      coherenceScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 1,
      },
      relevanceScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 1,
      },
      accuracyScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 1,
      },
      helpfulnessScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 1,
      },
      engagementScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 1,
      },
    },

    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        maxlength: 1000,
      },
      timestamp: Date,
      helpful: Boolean,
      issues: [String],
    },

    settings: {
      saveMessages: {
        type: Boolean,
        default: true,
      },
      allowFeedback: {
        type: Boolean,
        default: true,
      },
      enableAnalytics: {
        type: Boolean,
        default: true,
      },
      maxMessages: {
        type: Number,
        default: 100,
      },
      sessionTimeout: {
        type: Number,
        default: 30, // 30 minutes
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes
AIConversationSchema.index({ userId: 1, 'context.agentType': 1 });
AIConversationSchema.index({ sessionId: 1 });
AIConversationSchema.index({ isActive: 1, lastActivityAt: -1 });
AIConversationSchema.index({ 'context.courseId': 1 });
AIConversationSchema.index({ 'context.lessonId': 1 });
AIConversationSchema.index({ startedAt: -1 });

// Virtual for session duration in minutes
AIConversationSchema.virtual('durationMinutes').get(function (this: IAIConversation) {
  return Math.round(this.duration / 60);
});

// Virtual for average message length
AIConversationSchema.virtual('averageMessageLength').get(function (this: IAIConversation) {
  if (this.messageCount === 0) return 0;
  const totalLength = this.messages.reduce((sum, msg) => sum + msg.content.length, 0);
  return Math.round(totalLength / this.messageCount);
});

// Methods
AIConversationSchema.methods.addMessage = function (message: Partial<IMessage>) {
  const newMessage = {
    id: message.id || new mongoose.Types.ObjectId().toString(),
    role: message.role,
    content: message.content,
    timestamp: message.timestamp || new Date(),
    metadata: message.metadata || {},
  };

  this.messages.push(newMessage);
  this.messageCount += 1;
  this.lastActivityAt = new Date();

  // Update analytics
  if (message.metadata?.tokens) {
    this.analytics.totalTokensUsed += message.metadata.tokens;
  }
  if (message.metadata?.cost) {
    this.analytics.totalCost += message.metadata.cost;
  }
  if (message.metadata?.processingTime) {
    const currentTotal = this.analytics.averageResponseTime * (this.messageCount - 1);
    this.analytics.averageResponseTime = (currentTotal + message.metadata.processingTime) / this.messageCount;
  }

  // Auto-generate title if not set
  if (!this.title && this.messageCount === 2) {
    this.title = this.generateTitle();
  }

  return this.save();
};

AIConversationSchema.methods.endSession = function () {
  this.isActive = false;
  this.endedAt = new Date();
  this.duration = Math.floor((this.endedAt.getTime() - this.startedAt.getTime()) / 1000);
  return this.save();
};

AIConversationSchema.methods.addFeedback = function (feedback: any) {
  this.feedback = {
    ...this.feedback,
    ...feedback,
    timestamp: new Date(),
  };

  if (feedback.rating) {
    this.analytics.userSatisfactionRating = feedback.rating;
  }

  return this.save();
};

AIConversationSchema.methods.updateQualityScores = function (scores: any) {
  this.quality = {
    ...this.quality,
    ...scores,
  };
  return this.save();
};

AIConversationSchema.methods.addTopic = function (topic: string) {
  if (!this.analytics.topics.includes(topic)) {
    this.analytics.topics.push(topic);
    return this.save();
  }
  return Promise.resolve(this);
};

AIConversationSchema.methods.incrementResolvedQueries = function () {
  this.analytics.resolvedQueries += 1;
  return this.save();
};

AIConversationSchema.methods.incrementFollowUpQuestions = function () {
  this.analytics.followUpQuestions += 1;
  return this.save();
};

AIConversationSchema.methods.generateTitle = function () {
  // Generate title from first user message
  const firstUserMessage = this.messages.find(msg => msg.role === 'user');
  if (firstUserMessage) {
    const content = firstUserMessage.content;
    if (content.length <= 50) {
      return content;
    }
    return content.substring(0, 47) + '...';
  }
  return `${this.context.agentType} conversation`;
};

AIConversationSchema.methods.isExpired = function () {
  if (!this.isActive) return true;
  
  const now = new Date();
  const timeoutMs = this.settings.sessionTimeout * 60 * 1000;
  return (now.getTime() - this.lastActivityAt.getTime()) > timeoutMs;
};

AIConversationSchema.methods.getLastUserMessage = function () {
  for (let i = this.messages.length - 1; i >= 0; i--) {
    if (this.messages[i].role === 'user') {
      return this.messages[i];
    }
  }
  return null;
};

AIConversationSchema.methods.getConversationHistory = function (limit: number = 10) {
  return this.messages.slice(-limit);
};

// Static methods
AIConversationSchema.statics.findByUser = function (userId: string, options = {}) {
  const query: any = { userId };
  if (options.agentType) query['context.agentType'] = options.agentType;
  if (options.isActive !== undefined) query.isActive = options.isActive;
  
  return this.find(query).sort({ lastActivityAt: -1 });
};

AIConversationSchema.statics.findActiveSession = function (userId: string, agentType?: string) {
  const query: any = { userId, isActive: true };
  if (agentType) query['context.agentType'] = agentType;
  
  return this.findOne(query).sort({ lastActivityAt: -1 });
};

AIConversationSchema.statics.findBySessionId = function (sessionId: string) {
  return this.findOne({ sessionId });
};

AIConversationSchema.statics.getConversationStats = function (userId: string, dateRange?: { start: Date; end: Date }) {
  const matchQuery: any = { userId };
  if (dateRange) {
    matchQuery.createdAt = { $gte: dateRange.start, $lte: dateRange.end };
  }

  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$context.agentType',
        totalConversations: { $sum: 1 },
        totalMessages: { $sum: '$messageCount' },
        totalCost: { $sum: '$analytics.totalCost' },
        averageDuration: { $avg: '$duration' },
        averageRating: { $avg: '$analytics.userSatisfactionRating' },
      },
    },
  ]);
};

// Extend the model interface
interface IAIConversationModel extends mongoose.Model<IAIConversation> {
  findByUser(userId: string, options?: any): mongoose.Query<IAIConversation[], IAIConversation>;
  findActiveSession(userId: string, agentType?: string): mongoose.Query<IAIConversation | null, IAIConversation>;
  findBySessionId(sessionId: string): mongoose.Query<IAIConversation | null, IAIConversation>;
  getConversationStats(userId: string, dateRange?: { start: Date; end: Date }): mongoose.Aggregate<any[]>;
}

export default mongoose.model<IAIConversation, IAIConversationModel>('AIConversation', AIConversationSchema);