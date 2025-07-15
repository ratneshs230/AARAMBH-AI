import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  subcategory?: string;
  tags: string[];

  // Instructor Information
  instructor: {
    id: mongoose.Types.ObjectId;
    name: string;
    profilePicture?: string;
    bio?: string;
  };

  // Course Content
  thumbnail: string;
  previewVideo?: string;
  language: 'hindi' | 'english' | 'bilingual';
  difficulty: 'beginner' | 'intermediate' | 'advanced';

  // Structure
  totalLessons: number;
  totalDuration: number; // in minutes
  estimatedCompletion: number; // in hours

  // Pricing
  pricing: {
    type: 'free' | 'paid' | 'subscription';
    amount?: number;
    currency: string;
    discountPrice?: number;
    discountEndDate?: Date;
  };

  // Requirements
  prerequisites: string[];
  requirements: {
    educationLevel: string[];
    subjects: string[];
    priorKnowledge?: string[];
  };

  // Learning Outcomes
  learningOutcomes: string[];
  skills: string[];

  // Status
  status: 'draft' | 'published' | 'archived' | 'suspended';
  isPublished: boolean;
  publishedAt?: Date;

  // Analytics
  analytics: {
    enrollmentCount: number;
    completionCount: number;
    averageRating: number;
    totalRatings: number;
    totalReviews: number;
    viewCount: number;
    likeCount: number;
    shareCount: number;
  };

  // SEO
  seoData: {
    metaTitle?: string;
    metaDescription?: string;
    keywords: string[];
    slug: string;
  };

  // Configuration
  settings: {
    allowComments: boolean;
    allowDownloads: boolean;
    allowDiscussions: boolean;
    requireEnrollment: boolean;
    certificateAvailable: boolean;
    trackProgress: boolean;
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: mongoose.Types.ObjectId;
}

const CourseSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 200,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 5000,
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 50,
      },
    ],

    instructor: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      profilePicture: String,
      bio: String,
    },

    thumbnail: {
      type: String,
      required: true,
    },
    previewVideo: String,
    language: {
      type: String,
      required: true,
      enum: ['hindi', 'english', 'bilingual'],
      default: 'bilingual',
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['beginner', 'intermediate', 'advanced'],
      index: true,
    },

    totalLessons: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalDuration: {
      type: Number,
      default: 0,
      min: 0,
    },
    estimatedCompletion: {
      type: Number,
      default: 0,
      min: 0,
    },

    pricing: {
      type: {
        type: String,
        enum: ['free', 'paid', 'subscription'],
        default: 'free',
      },
      amount: {
        type: Number,
        min: 0,
      },
      currency: {
        type: String,
        default: 'INR',
      },
      discountPrice: {
        type: Number,
        min: 0,
      },
      discountEndDate: Date,
    },

    prerequisites: [
      {
        type: String,
        trim: true,
      },
    ],
    requirements: {
      educationLevel: [
        {
          type: String,
          enum: ['primary', 'secondary', 'higher_secondary', 'undergraduate', 'graduate', 'any'],
        },
      ],
      subjects: [
        {
          type: String,
          trim: true,
        },
      ],
      priorKnowledge: [
        {
          type: String,
          trim: true,
        },
      ],
    },

    learningOutcomes: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    status: {
      type: String,
      enum: ['draft', 'published', 'archived', 'suspended'],
      default: 'draft',
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: Date,

    analytics: {
      enrollmentCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      completionCount: {
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
      totalReviews: {
        type: Number,
        default: 0,
        min: 0,
      },
      viewCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      likeCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      shareCount: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    seoData: {
      metaTitle: {
        type: String,
        maxlength: 60,
      },
      metaDescription: {
        type: String,
        maxlength: 160,
      },
      keywords: [
        {
          type: String,
          trim: true,
        },
      ],
      slug: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
      },
    },

    settings: {
      allowComments: {
        type: Boolean,
        default: true,
      },
      allowDownloads: {
        type: Boolean,
        default: false,
      },
      allowDiscussions: {
        type: Boolean,
        default: true,
      },
      requireEnrollment: {
        type: Boolean,
        default: true,
      },
      certificateAvailable: {
        type: Boolean,
        default: false,
      },
      trackProgress: {
        type: Boolean,
        default: true,
      },
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
CourseSchema.index({ title: 'text', description: 'text', category: 'text', tags: 'text' });
CourseSchema.index({ category: 1, difficulty: 1, language: 1 });
CourseSchema.index({ 'instructor.id': 1, status: 1 });
CourseSchema.index({ isPublished: 1, 'analytics.enrollmentCount': -1 });
CourseSchema.index({ 'analytics.averageRating': -1, 'analytics.totalRatings': -1 });
CourseSchema.index({ createdAt: -1 });
CourseSchema.index({ 'seoData.slug': 1 });

// Virtual for completion rate
CourseSchema.virtual('completionRate').get(function (this: ICourse) {
  if (this.analytics.enrollmentCount === 0) return 0;
  return (this.analytics.completionCount / this.analytics.enrollmentCount) * 100;
});

// Virtual for effective price
CourseSchema.virtual('effectivePrice').get(function (this: ICourse) {
  if (this.pricing.type === 'free') return 0;
  if (
    this.pricing.discountPrice &&
    this.pricing.discountEndDate &&
    new Date() <= this.pricing.discountEndDate
  ) {
    return this.pricing.discountPrice;
  }
  return this.pricing.amount || 0;
});

// Methods
CourseSchema.methods.incrementView = function () {
  this.analytics.viewCount += 1;
  return this.save();
};

CourseSchema.methods.incrementEnrollment = function () {
  this.analytics.enrollmentCount += 1;
  return this.save();
};

CourseSchema.methods.incrementCompletion = function () {
  this.analytics.completionCount += 1;
  return this.save();
};

CourseSchema.methods.updateRating = function (newRating: number) {
  const currentTotal = this.analytics.averageRating * this.analytics.totalRatings;
  this.analytics.totalRatings += 1;
  this.analytics.averageRating = (currentTotal + newRating) / this.analytics.totalRatings;
  return this.save();
};

CourseSchema.methods.publish = function () {
  this.status = 'published';
  this.isPublished = true;
  this.publishedAt = new Date();
  return this.save();
};

CourseSchema.methods.unpublish = function () {
  this.status = 'draft';
  this.isPublished = false;
  return this.save();
};

// Static methods
CourseSchema.statics.findPublished = function (filters = {}) {
  return this.find({
    ...filters,
    isPublished: true,
    status: 'published',
  });
};

CourseSchema.statics.findByInstructor = function (instructorId: string) {
  return this.find({ 'instructor.id': instructorId });
};

CourseSchema.statics.findByCategory = function (category: string) {
  return this.findPublished({ category });
};

CourseSchema.statics.search = function (query: string, filters = {}) {
  return this.findPublished({
    ...filters,
    $text: { $search: query },
  }).sort({ score: { $meta: 'textScore' } });
};

// Extend the model interface
interface ICourseModel extends mongoose.Model<ICourse> {
  findPublished(filters?: any): mongoose.Query<ICourse[], ICourse>;
  findByInstructor(instructorId: string): mongoose.Query<ICourse[], ICourse>;
  findByCategory(category: string): mongoose.Query<ICourse[], ICourse>;
  search(query: string, filters?: any): mongoose.Query<ICourse[], ICourse>;
}

export default mongoose.model<ICourse, ICourseModel>('Course', CourseSchema);
