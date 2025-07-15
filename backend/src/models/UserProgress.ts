import mongoose, { Document, Schema } from 'mongoose';

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  
  // Progress Tracking
  enrollmentDate: Date;
  completionDate?: Date;
  isCompleted: boolean;
  completionPercentage: number;
  
  // Lesson Progress
  lessonProgress: {
    lessonId: mongoose.Types.ObjectId;
    status: 'not_started' | 'in_progress' | 'completed';
    startedAt?: Date;
    completedAt?: Date;
    timeSpent: number; // in seconds
    watchedDuration: number; // for video lessons
    progressPercentage: number;
    lastAccessedAt: Date;
    notes?: string;
    bookmarks: number[]; // time stamps for video bookmarks
  }[];

  // Assessment Progress
  assessmentProgress: {
    assessmentId: mongoose.Types.ObjectId;
    attempts: {
      attemptNumber: number;
      startedAt: Date;
      submittedAt?: Date;
      score: number;
      totalPoints: number;
      percentage: number;
      timeSpent: number;
      passed: boolean;
      answers: {
        questionId: string;
        userAnswer: any;
        isCorrect: boolean;
        timeSpent: number;
      }[];
    }[];
    bestScore: number;
    bestAttempt: number;
    totalAttempts: number;
    averageScore: number;
    status: 'not_attempted' | 'in_progress' | 'completed' | 'passed';
  }[];

  // Learning Analytics
  analytics: {
    totalTimeSpent: number;
    avgSessionDuration: number;
    longestStreak: number;
    currentStreak: number;
    lastActiveDate: Date;
    sessionsCount: number;
    completedLessons: number;
    totalLessons: number;
    averageAssessmentScore: number;
    skillsAcquired: string[];
    weakAreas: string[];
    strongAreas: string[];
  };

  // Certificates
  certificates: {
    type: 'completion' | 'achievement' | 'skill';
    issuedDate: Date;
    certificateUrl: string;
    verificationCode: string;
  }[];

  // Settings
  settings: {
    notifications: boolean;
    autoAdvance: boolean;
    playbackSpeed: number;
    captionsEnabled: boolean;
    preferredLanguage: 'hindi' | 'english' | 'bilingual';
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastSyncedAt: Date;
}

const UserProgressSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },

    enrollmentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    completionDate: Date,
    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    lessonProgress: [
      {
        lessonId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Lesson',
          required: true,
        },
        status: {
          type: String,
          enum: ['not_started', 'in_progress', 'completed'],
          default: 'not_started',
        },
        startedAt: Date,
        completedAt: Date,
        timeSpent: {
          type: Number,
          default: 0,
        },
        watchedDuration: {
          type: Number,
          default: 0,
        },
        progressPercentage: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
        lastAccessedAt: {
          type: Date,
          default: Date.now,
        },
        notes: String,
        bookmarks: [Number],
      },
    ],

    assessmentProgress: [
      {
        assessmentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Assessment',
          required: true,
        },
        attempts: [
          {
            attemptNumber: {
              type: Number,
              required: true,
            },
            startedAt: {
              type: Date,
              required: true,
              default: Date.now,
            },
            submittedAt: Date,
            score: {
              type: Number,
              default: 0,
            },
            totalPoints: {
              type: Number,
              required: true,
            },
            percentage: {
              type: Number,
              default: 0,
              min: 0,
              max: 100,
            },
            timeSpent: {
              type: Number,
              default: 0,
            },
            passed: {
              type: Boolean,
              default: false,
            },
            answers: [
              {
                questionId: String,
                userAnswer: mongoose.Schema.Types.Mixed,
                isCorrect: Boolean,
                timeSpent: Number,
              },
            ],
          },
        ],
        bestScore: {
          type: Number,
          default: 0,
        },
        bestAttempt: {
          type: Number,
          default: 0,
        },
        totalAttempts: {
          type: Number,
          default: 0,
        },
        averageScore: {
          type: Number,
          default: 0,
        },
        status: {
          type: String,
          enum: ['not_attempted', 'in_progress', 'completed', 'passed'],
          default: 'not_attempted',
        },
      },
    ],

    analytics: {
      totalTimeSpent: {
        type: Number,
        default: 0,
      },
      avgSessionDuration: {
        type: Number,
        default: 0,
      },
      longestStreak: {
        type: Number,
        default: 0,
      },
      currentStreak: {
        type: Number,
        default: 0,
      },
      lastActiveDate: {
        type: Date,
        default: Date.now,
      },
      sessionsCount: {
        type: Number,
        default: 0,
      },
      completedLessons: {
        type: Number,
        default: 0,
      },
      totalLessons: {
        type: Number,
        default: 0,
      },
      averageAssessmentScore: {
        type: Number,
        default: 0,
      },
      skillsAcquired: [String],
      weakAreas: [String],
      strongAreas: [String],
    },

    certificates: [
      {
        type: {
          type: String,
          enum: ['completion', 'achievement', 'skill'],
          required: true,
        },
        issuedDate: {
          type: Date,
          required: true,
          default: Date.now,
        },
        certificateUrl: {
          type: String,
          required: true,
        },
        verificationCode: {
          type: String,
          required: true,
          unique: true,
        },
      },
    ],

    settings: {
      notifications: {
        type: Boolean,
        default: true,
      },
      autoAdvance: {
        type: Boolean,
        default: false,
      },
      playbackSpeed: {
        type: Number,
        default: 1.0,
        min: 0.5,
        max: 2.0,
      },
      captionsEnabled: {
        type: Boolean,
        default: false,
      },
      preferredLanguage: {
        type: String,
        enum: ['hindi', 'english', 'bilingual'],
        default: 'bilingual',
      },
    },

    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound indexes
UserProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
UserProgressSchema.index({ userId: 1, isCompleted: 1 });
UserProgressSchema.index({ courseId: 1, completionPercentage: -1 });
UserProgressSchema.index({ 'lessonProgress.lessonId': 1, 'lessonProgress.status': 1 });
UserProgressSchema.index({ 'assessmentProgress.assessmentId': 1 });

// Virtual for overall progress
UserProgressSchema.virtual('overallProgress').get(function (this: IUserProgress) {
  if (this.analytics.totalLessons === 0) return 0;
  return (this.analytics.completedLessons / this.analytics.totalLessons) * 100;
});

// Methods
UserProgressSchema.methods.updateLessonProgress = function (
  lessonId: string,
  status: string,
  timeSpent: number = 0,
  watchedDuration: number = 0
) {
  const lessonProgressIndex = this.lessonProgress.findIndex(
    (lp: any) => lp.lessonId.toString() === lessonId
  );

  if (lessonProgressIndex === -1) {
    // Create new lesson progress
    this.lessonProgress.push({
      lessonId: new mongoose.Types.ObjectId(lessonId),
      status,
      startedAt: status !== 'not_started' ? new Date() : undefined,
      completedAt: status === 'completed' ? new Date() : undefined,
      timeSpent,
      watchedDuration,
      progressPercentage: status === 'completed' ? 100 : 0,
      lastAccessedAt: new Date(),
      bookmarks: [],
    });
  } else {
    // Update existing lesson progress
    const lessonProgress = this.lessonProgress[lessonProgressIndex];
    lessonProgress.status = status;
    lessonProgress.timeSpent += timeSpent;
    lessonProgress.watchedDuration += watchedDuration;
    lessonProgress.lastAccessedAt = new Date();
    
    if (status === 'completed' && !lessonProgress.completedAt) {
      lessonProgress.completedAt = new Date();
      lessonProgress.progressPercentage = 100;
      this.analytics.completedLessons += 1;
    }
    
    if (status === 'in_progress' && !lessonProgress.startedAt) {
      lessonProgress.startedAt = new Date();
    }
  }

  // Update analytics
  this.analytics.totalTimeSpent += timeSpent;
  this.analytics.lastActiveDate = new Date();
  this.updateCompletionPercentage();

  return this.save();
};

UserProgressSchema.methods.updateAssessmentProgress = function (
  assessmentId: string,
  attemptData: any
) {
  const assessmentProgressIndex = this.assessmentProgress.findIndex(
    (ap: any) => ap.assessmentId.toString() === assessmentId
  );

  if (assessmentProgressIndex === -1) {
    // Create new assessment progress
    this.assessmentProgress.push({
      assessmentId: new mongoose.Types.ObjectId(assessmentId),
      attempts: [attemptData],
      bestScore: attemptData.score,
      bestAttempt: 1,
      totalAttempts: 1,
      averageScore: attemptData.percentage,
      status: attemptData.passed ? 'passed' : 'completed',
    });
  } else {
    // Update existing assessment progress
    const assessmentProgress = this.assessmentProgress[assessmentProgressIndex];
    assessmentProgress.attempts.push(attemptData);
    assessmentProgress.totalAttempts += 1;

    // Update best score
    if (attemptData.score > assessmentProgress.bestScore) {
      assessmentProgress.bestScore = attemptData.score;
      assessmentProgress.bestAttempt = assessmentProgress.totalAttempts;
    }

    // Update average score
    const totalScore = assessmentProgress.attempts.reduce((sum: number, attempt: any) => sum + attempt.percentage, 0);
    assessmentProgress.averageScore = totalScore / assessmentProgress.totalAttempts;

    // Update status
    if (attemptData.passed) {
      assessmentProgress.status = 'passed';
    } else if (assessmentProgress.status !== 'passed') {
      assessmentProgress.status = 'completed';
    }
  }

  return this.save();
};

UserProgressSchema.methods.updateCompletionPercentage = function () {
  if (this.analytics.totalLessons === 0) {
    this.completionPercentage = 0;
    return;
  }

  this.completionPercentage = (this.analytics.completedLessons / this.analytics.totalLessons) * 100;

  if (this.completionPercentage >= 100 && !this.isCompleted) {
    this.isCompleted = true;
    this.completionDate = new Date();
  }
};

UserProgressSchema.methods.updateStreak = function () {
  const today = new Date();
  const lastActive = new Date(this.analytics.lastActiveDate);
  const diffTime = Math.abs(today.getTime() - lastActive.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    this.analytics.currentStreak += 1;
    if (this.analytics.currentStreak > this.analytics.longestStreak) {
      this.analytics.longestStreak = this.analytics.currentStreak;
    }
  } else if (diffDays > 1) {
    this.analytics.currentStreak = 1;
  }

  this.analytics.lastActiveDate = today;
  return this.save();
};

UserProgressSchema.methods.addBookmark = function (lessonId: string, timestamp: number) {
  const lessonProgress = this.lessonProgress.find((lp: any) => lp.lessonId.toString() === lessonId);
  if (lessonProgress && !lessonProgress.bookmarks.includes(timestamp)) {
    lessonProgress.bookmarks.push(timestamp);
    return this.save();
  }
  return Promise.resolve(this);
};

UserProgressSchema.methods.removeBookmark = function (lessonId: string, timestamp: number) {
  const lessonProgress = this.lessonProgress.find((lp: any) => lp.lessonId.toString() === lessonId);
  if (lessonProgress) {
    lessonProgress.bookmarks = lessonProgress.bookmarks.filter((bm: number) => bm !== timestamp);
    return this.save();
  }
  return Promise.resolve(this);
};

// Static methods
UserProgressSchema.statics.findByUser = function (userId: string) {
  return this.find({ userId }).populate('courseId', 'title thumbnail');
};

UserProgressSchema.statics.findByCourse = function (courseId: string) {
  return this.find({ courseId }).populate('userId', 'firstName lastName email');
};

UserProgressSchema.statics.findUserCourseProgress = function (userId: string, courseId: string) {
  return this.findOne({ userId, courseId });
};

UserProgressSchema.statics.getCompletedCourses = function (userId: string) {
  return this.find({ userId, isCompleted: true }).populate('courseId');
};

UserProgressSchema.statics.getInProgressCourses = function (userId: string) {
  return this.find({ 
    userId, 
    isCompleted: false, 
    completionPercentage: { $gt: 0 } 
  }).populate('courseId');
};

// Extend the model interface
interface IUserProgressModel extends mongoose.Model<IUserProgress> {
  findByUser(userId: string): mongoose.Query<IUserProgress[], IUserProgress>;
  findByCourse(courseId: string): mongoose.Query<IUserProgress[], IUserProgress>;
  findUserCourseProgress(userId: string, courseId: string): mongoose.Query<IUserProgress | null, IUserProgress>;
  getCompletedCourses(userId: string): mongoose.Query<IUserProgress[], IUserProgress>;
  getInProgressCourses(userId: string): mongoose.Query<IUserProgress[], IUserProgress>;
}

export default mongoose.model<IUserProgress, IUserProgressModel>('UserProgress', UserProgressSchema);