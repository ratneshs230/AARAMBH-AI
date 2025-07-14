import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  phoneNumber?: string;
  profilePicture?: string;
  bio?: string;
  
  // Educational Information
  educationLevel: 'primary' | 'secondary' | 'higher_secondary' | 'undergraduate' | 'graduate' | 'other';
  currentClass?: string;
  subjects: string[];
  learningLanguage: 'hindi' | 'english' | 'bilingual';
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing';
  
  // Account Information
  role: 'student' | 'teacher' | 'parent' | 'admin';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  accountStatus: 'active' | 'suspended' | 'deactivated';
  
  // Subscription Information
  subscriptionType: 'free' | 'premium' | 'enterprise';
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  
  // Preferences
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'friends' | 'private';
      showOnlineStatus: boolean;
      allowMessaging: boolean;
    };
    learning: {
      dailyGoalMinutes: number;
      reminderTime?: string;
      difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
    };
  };
  
  // Analytics
  analytics: {
    totalStudyTime: number;
    coursesCompleted: number;
    averageScore: number;
    streakDays: number;
    lastActiveDate: Date;
    loginCount: number;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

const UserSchema: Schema = new Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    index: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500
  },
  
  // Educational Information
  educationLevel: {
    type: String,
    required: true,
    enum: ['primary', 'secondary', 'higher_secondary', 'undergraduate', 'graduate', 'other']
  },
  currentClass: {
    type: String,
    trim: true
  },
  subjects: [{
    type: String,
    trim: true
  }],
  learningLanguage: {
    type: String,
    required: true,
    enum: ['hindi', 'english', 'bilingual'],
    default: 'bilingual'
  },
  learningStyle: {
    type: String,
    enum: ['visual', 'auditory', 'kinesthetic', 'reading_writing']
  },
  
  // Account Information
  role: {
    type: String,
    required: true,
    enum: ['student', 'teacher', 'parent', 'admin'],
    default: 'student'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'deactivated'],
    default: 'active'
  },
  
  // Subscription Information
  subscriptionType: {
    type: String,
    enum: ['free', 'premium', 'enterprise'],
    default: 'free'
  },
  subscriptionStartDate: {
    type: Date
  },
  subscriptionEndDate: {
    type: Date
  },
  
  // Preferences
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'public'
      },
      showOnlineStatus: {
        type: Boolean,
        default: true
      },
      allowMessaging: {
        type: Boolean,
        default: true
      }
    },
    learning: {
      dailyGoalMinutes: {
        type: Number,
        default: 30,
        min: 5,
        max: 480
      },
      reminderTime: {
        type: String
      },
      difficultyLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
      }
    }
  },
  
  // Analytics
  analytics: {
    totalStudyTime: {
      type: Number,
      default: 0
    },
    coursesCompleted: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    streakDays: {
      type: Number,
      default: 0
    },
    lastActiveDate: {
      type: Date,
      default: Date.now
    },
    loginCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes
UserSchema.index({ email: 1, firebaseUid: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ role: 1, accountStatus: 1 });
UserSchema.index({ educationLevel: 1, currentClass: 1 });
UserSchema.index({ subscriptionType: 1, subscriptionEndDate: 1 });
UserSchema.index({ 'analytics.lastActiveDate': -1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function(this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
UserSchema.virtual('age').get(function(this: IUser) {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Methods
UserSchema.methods.updateLastActive = function() {
  this.analytics.lastActiveDate = new Date();
  this.analytics.loginCount += 1;
  return this.save();
};

UserSchema.methods.updateStreakDays = function() {
  const today = new Date();
  const lastActive = new Date(this.analytics.lastActiveDate);
  const diffTime = Math.abs(today.getTime() - lastActive.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    this.analytics.streakDays += 1;
  } else if (diffDays > 1) {
    this.analytics.streakDays = 1;
  }
  
  this.analytics.lastActiveDate = today;
  return this.save();
};

UserSchema.methods.isSubscriptionActive = function() {
  if (this.subscriptionType === 'free') return true;
  if (!this.subscriptionEndDate) return false;
  return new Date() <= this.subscriptionEndDate;
};

// Static methods
UserSchema.statics.findByFirebaseUid = function(uid: string) {
  return this.findOne({ firebaseUid: uid });
};

UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

UserSchema.statics.findByUsername = function(username: string) {
  return this.findOne({ username: username });
};

export default mongoose.model<IUser>('User', UserSchema);