import mongoose, { Document, Schema } from 'mongoose';

export interface ILesson extends Document {
  title: string;
  description: string;
  courseId: mongoose.Types.ObjectId;
  chapterId?: mongoose.Types.ObjectId;

  // Content Structure
  content: {
    type: 'video' | 'text' | 'interactive' | 'quiz' | 'assignment';
    data: {
      videoUrl?: string;
      textContent?: string;
      htmlContent?: string;
      interactiveElements?: any[];
      attachments?: string[];
    };
  };

  // Lesson Details
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  order: number; // position in course/chapter
  
  // Learning Objectives
  objectives: string[];
  prerequisites: string[];
  skills: string[];

  // Settings
  settings: {
    isPublished: boolean;
    isFree: boolean;
    allowPreview: boolean;
    enableComments: boolean;
    enableDownloads: boolean;
    autoAdvance: boolean;
  };

  // Resources
  resources: {
    type: 'pdf' | 'video' | 'link' | 'image' | 'code';
    title: string;
    url: string;
    description?: string;
  }[];

  // Analytics
  analytics: {
    viewCount: number;
    completionCount: number;
    averageWatchTime: number;
    averageRating: number;
    totalRatings: number;
    dropOffPoints: number[];
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
  lastModifiedBy: mongoose.Types.ObjectId;
}

const LessonSchema: Schema = new Schema(
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
      minlength: 10,
      maxlength: 1000,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      index: true,
    },

    content: {
      type: {
        type: String,
        enum: ['video', 'text', 'interactive', 'quiz', 'assignment'],
        required: true,
      },
      data: {
        videoUrl: String,
        textContent: String,
        htmlContent: String,
        interactiveElements: [mongoose.Schema.Types.Mixed],
        attachments: [String],
      },
    },

    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
      index: true,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },

    objectives: [
      {
        type: String,
        trim: true,
        required: true,
      },
    ],
    prerequisites: [
      {
        type: String,
        trim: true,
      },
    ],
    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    settings: {
      isPublished: {
        type: Boolean,
        default: false,
        index: true,
      },
      isFree: {
        type: Boolean,
        default: false,
      },
      allowPreview: {
        type: Boolean,
        default: false,
      },
      enableComments: {
        type: Boolean,
        default: true,
      },
      enableDownloads: {
        type: Boolean,
        default: false,
      },
      autoAdvance: {
        type: Boolean,
        default: false,
      },
    },

    resources: [
      {
        type: {
          type: String,
          enum: ['pdf', 'video', 'link', 'image', 'code'],
          required: true,
        },
        title: {
          type: String,
          required: true,
          trim: true,
        },
        url: {
          type: String,
          required: true,
        },
        description: String,
      },
    ],

    analytics: {
      viewCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      completionCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      averageWatchTime: {
        type: Number,
        default: 0,
        min: 0,
      },
      averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      totalRatings: {
        type: Number,
        default: 0,
        min: 0,
      },
      dropOffPoints: [Number],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
LessonSchema.index({ courseId: 1, order: 1 });
LessonSchema.index({ chapterId: 1, order: 1 });
LessonSchema.index({ courseId: 1, 'settings.isPublished': 1 });
LessonSchema.index({ difficulty: 1, 'content.type': 1 });
LessonSchema.index({ title: 'text', description: 'text' });

// Virtual for completion rate
LessonSchema.virtual('completionRate').get(function (this: ILesson) {
  if (this.analytics.viewCount === 0) return 0;
  return (this.analytics.completionCount / this.analytics.viewCount) * 100;
});

// Methods
LessonSchema.methods.incrementView = function () {
  this.analytics.viewCount += 1;
  return this.save();
};

LessonSchema.methods.incrementCompletion = function () {
  this.analytics.completionCount += 1;
  return this.save();
};

LessonSchema.methods.updateWatchTime = function (watchTime: number) {
  const currentTotal = this.analytics.averageWatchTime * this.analytics.viewCount;
  this.analytics.averageWatchTime = (currentTotal + watchTime) / (this.analytics.viewCount + 1);
  return this.save();
};

LessonSchema.methods.addDropOffPoint = function (timePoint: number) {
  this.analytics.dropOffPoints.push(timePoint);
  return this.save();
};

LessonSchema.methods.publish = function () {
  this.settings.isPublished = true;
  return this.save();
};

LessonSchema.methods.unpublish = function () {
  this.settings.isPublished = false;
  return this.save();
};

// Static methods
LessonSchema.statics.findByCourse = function (courseId: string) {
  return this.find({ courseId, 'settings.isPublished': true }).sort({ order: 1 });
};

LessonSchema.statics.findByChapter = function (chapterId: string) {
  return this.find({ chapterId, 'settings.isPublished': true }).sort({ order: 1 });
};

LessonSchema.statics.findFreeContent = function () {
  return this.find({ 'settings.isPublished': true, 'settings.isFree': true });
};

// Extend the model interface
interface ILessonModel extends mongoose.Model<ILesson> {
  findByCourse(courseId: string): mongoose.Query<ILesson[], ILesson>;
  findByChapter(chapterId: string): mongoose.Query<ILesson[], ILesson>;
  findFreeContent(): mongoose.Query<ILesson[], ILesson>;
}

export default mongoose.model<ILesson, ILessonModel>('Lesson', LessonSchema);