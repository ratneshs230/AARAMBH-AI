import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion {
  id: string;
  type: 'multiple_choice' | 'single_choice' | 'true_false' | 'fill_blank' | 'short_answer' | 'essay';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  timeLimit?: number; // in seconds
}

export interface IAssessment extends Document {
  title: string;
  description: string;
  type: 'quiz' | 'test' | 'assignment' | 'practice' | 'mock_exam';
  
  // Association
  courseId?: mongoose.Types.ObjectId;
  lessonId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;

  // Configuration
  questions: IQuestion[];
  totalQuestions: number;
  totalPoints: number;
  timeLimit: number; // in minutes
  passingScore: number; // percentage

  // Settings
  settings: {
    isPublished: boolean;
    randomizeQuestions: boolean;
    randomizeOptions: boolean;
    allowRetakes: boolean;
    maxAttempts: number;
    showResults: 'immediate' | 'after_completion' | 'manual';
    showCorrectAnswers: boolean;
    showExplanations: boolean;
    allowReview: boolean;
    lockAfterSubmission: boolean;
  };

  // Access Control
  accessControl: {
    startDate?: Date;
    endDate?: Date;
    accessCode?: string;
    allowedUsers?: mongoose.Types.ObjectId[];
    requiredCompletion?: mongoose.Types.ObjectId[]; // required lessons/assessments
  };

  // Instructions
  instructions: {
    beforeStart: string;
    duringAssessment: string;
    afterSubmission: string;
  };

  // Analytics
  analytics: {
    totalAttempts: number;
    totalCompletions: number;
    averageScore: number;
    averageTime: number;
    passRate: number;
    questionStats: {
      questionId: string;
      correctAttempts: number;
      totalAttempts: number;
      averageTime: number;
    }[];
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: mongoose.Types.ObjectId;
}

const QuestionSchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['multiple_choice', 'single_choice', 'true_false', 'fill_blank', 'short_answer', 'essay'],
    required: true,
  },
  question: {
    type: String,
    required: true,
    trim: true,
  },
  options: [String],
  correctAnswer: mongoose.Schema.Types.Mixed,
  explanation: String,
  points: {
    type: Number,
    required: true,
    min: 1,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  tags: [String],
  timeLimit: Number,
});

const AssessmentSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: ['quiz', 'test', 'assignment', 'practice', 'mock_exam'],
      required: true,
      index: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      index: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    questions: [QuestionSchema],
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPoints: {
      type: Number,
      required: true,
      min: 1,
    },
    timeLimit: {
      type: Number,
      required: true,
      min: 1,
    },
    passingScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 60,
    },

    settings: {
      isPublished: {
        type: Boolean,
        default: false,
        index: true,
      },
      randomizeQuestions: {
        type: Boolean,
        default: false,
      },
      randomizeOptions: {
        type: Boolean,
        default: false,
      },
      allowRetakes: {
        type: Boolean,
        default: true,
      },
      maxAttempts: {
        type: Number,
        default: 3,
        min: 1,
      },
      showResults: {
        type: String,
        enum: ['immediate', 'after_completion', 'manual'],
        default: 'immediate',
      },
      showCorrectAnswers: {
        type: Boolean,
        default: true,
      },
      showExplanations: {
        type: Boolean,
        default: true,
      },
      allowReview: {
        type: Boolean,
        default: true,
      },
      lockAfterSubmission: {
        type: Boolean,
        default: true,
      },
    },

    accessControl: {
      startDate: Date,
      endDate: Date,
      accessCode: String,
      allowedUsers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      requiredCompletion: [mongoose.Schema.Types.ObjectId],
    },

    instructions: {
      beforeStart: {
        type: String,
        default: 'Read each question carefully and select the best answer.',
      },
      duringAssessment: {
        type: String,
        default: 'Make sure to review your answers before submitting.',
      },
      afterSubmission: {
        type: String,
        default: 'Thank you for completing the assessment.',
      },
    },

    analytics: {
      totalAttempts: {
        type: Number,
        default: 0,
      },
      totalCompletions: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      averageTime: {
        type: Number,
        default: 0,
      },
      passRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      questionStats: [
        {
          questionId: String,
          correctAttempts: {
            type: Number,
            default: 0,
          },
          totalAttempts: {
            type: Number,
            default: 0,
          },
          averageTime: {
            type: Number,
            default: 0,
          },
        },
      ],
    },

    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes
AssessmentSchema.index({ courseId: 1, type: 1 });
AssessmentSchema.index({ lessonId: 1 });
AssessmentSchema.index({ createdBy: 1, 'settings.isPublished': 1 });
AssessmentSchema.index({ type: 1, 'settings.isPublished': 1 });
AssessmentSchema.index({ title: 'text', description: 'text' });

// Virtual for completion rate
AssessmentSchema.virtual('completionRate').get(function (this: IAssessment) {
  if (this.analytics.totalAttempts === 0) return 0;
  return (this.analytics.totalCompletions / this.analytics.totalAttempts) * 100;
});

// Methods
AssessmentSchema.methods.addAttempt = function () {
  this.analytics.totalAttempts += 1;
  return this.save();
};

AssessmentSchema.methods.addCompletion = function (score: number, timeSpent: number) {
  this.analytics.totalCompletions += 1;
  
  // Update average score
  const currentTotal = this.analytics.averageScore * (this.analytics.totalCompletions - 1);
  this.analytics.averageScore = (currentTotal + score) / this.analytics.totalCompletions;
  
  // Update average time
  const currentTimeTotal = this.analytics.averageTime * (this.analytics.totalCompletions - 1);
  this.analytics.averageTime = (currentTimeTotal + timeSpent) / this.analytics.totalCompletions;
  
  // Update pass rate
  const passCount = score >= this.passingScore ? 1 : 0;
  const currentPassTotal = (this.analytics.passRate / 100) * (this.analytics.totalCompletions - 1);
  this.analytics.passRate = ((currentPassTotal + passCount) / this.analytics.totalCompletions) * 100;
  
  return this.save();
};

AssessmentSchema.methods.updateQuestionStats = function (questionId: string, isCorrect: boolean, timeSpent: number) {
  let questionStat = this.analytics.questionStats.find(stat => stat.questionId === questionId);
  
  if (!questionStat) {
    questionStat = {
      questionId,
      correctAttempts: 0,
      totalAttempts: 0,
      averageTime: 0,
    };
    this.analytics.questionStats.push(questionStat);
  }
  
  questionStat.totalAttempts += 1;
  if (isCorrect) {
    questionStat.correctAttempts += 1;
  }
  
  const currentTimeTotal = questionStat.averageTime * (questionStat.totalAttempts - 1);
  questionStat.averageTime = (currentTimeTotal + timeSpent) / questionStat.totalAttempts;
  
  return this.save();
};

AssessmentSchema.methods.publish = function () {
  this.settings.isPublished = true;
  return this.save();
};

AssessmentSchema.methods.unpublish = function () {
  this.settings.isPublished = false;
  return this.save();
};

AssessmentSchema.methods.isAccessible = function (userId?: string) {
  if (!this.settings.isPublished) return false;
  
  const now = new Date();
  if (this.accessControl.startDate && now < this.accessControl.startDate) return false;
  if (this.accessControl.endDate && now > this.accessControl.endDate) return false;
  
  if (this.accessControl.allowedUsers && this.accessControl.allowedUsers.length > 0) {
    return userId && this.accessControl.allowedUsers.includes(new mongoose.Types.ObjectId(userId));
  }
  
  return true;
};

// Static methods
AssessmentSchema.statics.findByCourse = function (courseId: string) {
  return this.find({ courseId, 'settings.isPublished': true });
};

AssessmentSchema.statics.findByLesson = function (lessonId: string) {
  return this.find({ lessonId, 'settings.isPublished': true });
};

AssessmentSchema.statics.findByType = function (type: string) {
  return this.find({ type, 'settings.isPublished': true });
};

// Extend the model interface
interface IAssessmentModel extends mongoose.Model<IAssessment> {
  findByCourse(courseId: string): mongoose.Query<IAssessment[], IAssessment>;
  findByLesson(lessonId: string): mongoose.Query<IAssessment[], IAssessment>;
  findByType(type: string): mongoose.Query<IAssessment[], IAssessment>;
}

export default mongoose.model<IAssessment, IAssessmentModel>('Assessment', AssessmentSchema);