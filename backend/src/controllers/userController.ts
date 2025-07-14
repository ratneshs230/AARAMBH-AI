import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import { AuthRequest } from '../middleware/auth';

export class UserController {
  public static async getProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'User not authenticated'
        });
      }

      res.json({
        success: true,
        user: {
          id: req.user._id,
          firebaseUid: req.user.firebaseUid,
          email: req.user.email,
          username: req.user.username,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          fullName: req.user.fullName,
          dateOfBirth: req.user.dateOfBirth,
          age: req.user.age,
          gender: req.user.gender,
          phoneNumber: req.user.phoneNumber,
          profilePicture: req.user.profilePicture,
          bio: req.user.bio,
          educationLevel: req.user.educationLevel,
          currentClass: req.user.currentClass,
          subjects: req.user.subjects,
          learningLanguage: req.user.learningLanguage,
          learningStyle: req.user.learningStyle,
          role: req.user.role,
          isEmailVerified: req.user.isEmailVerified,
          isPhoneVerified: req.user.isPhoneVerified,
          accountStatus: req.user.accountStatus,
          subscriptionType: req.user.subscriptionType,
          subscriptionStartDate: req.user.subscriptionStartDate,
          subscriptionEndDate: req.user.subscriptionEndDate,
          preferences: req.user.preferences,
          analytics: req.user.analytics,
          createdAt: req.user.createdAt,
          updatedAt: req.user.updatedAt,
          lastLoginAt: req.user.lastLoginAt
        }
      });

    } catch (error) {
      console.error('Get profile failed:', error);
      res.status(500).json({
        error: 'Profile retrieval failed',
        message: 'Unable to retrieve user profile'
      });
    }
  }

  public static async updateProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'User not authenticated'
        });
      }

      const allowedUpdates = [
        'firstName', 'lastName', 'dateOfBirth', 'gender', 'phoneNumber',
        'profilePicture', 'bio', 'currentClass', 'subjects', 'learningStyle'
      ];

      const updates = Object.keys(req.body)
        .filter(key => allowedUpdates.includes(key))
        .reduce((obj: any, key: string) => {
          obj[key] = req.body[key];
          return obj;
        }, {});

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          error: 'No valid updates provided',
          message: 'Please provide valid fields to update'
        });
      }

      Object.assign(req.user, updates);
      await req.user.save();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: req.user._id,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          fullName: req.user.fullName,
          dateOfBirth: req.user.dateOfBirth,
          age: req.user.age,
          gender: req.user.gender,
          phoneNumber: req.user.phoneNumber,
          profilePicture: req.user.profilePicture,
          bio: req.user.bio,
          currentClass: req.user.currentClass,
          subjects: req.user.subjects,
          learningStyle: req.user.learningStyle,
          updatedAt: req.user.updatedAt
        }
      });

    } catch (error) {
      console.error('Profile update failed:', error);
      res.status(500).json({
        error: 'Profile update failed',
        message: 'Unable to update user profile'
      });
    }
  }

  public static async updatePreferences(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'User not authenticated'
        });
      }

      const { preferences } = req.body;

      if (!preferences) {
        return res.status(400).json({
          error: 'Preferences required',
          message: 'Please provide preferences to update'
        });
      }

      if (preferences.notifications) {
        Object.assign(req.user.preferences.notifications, preferences.notifications);
      }

      if (preferences.privacy) {
        Object.assign(req.user.preferences.privacy, preferences.privacy);
      }

      if (preferences.learning) {
        Object.assign(req.user.preferences.learning, preferences.learning);
      }

      await req.user.save();

      res.json({
        success: true,
        message: 'Preferences updated successfully',
        preferences: req.user.preferences
      });

    } catch (error) {
      console.error('Preferences update failed:', error);
      res.status(500).json({
        error: 'Preferences update failed',
        message: 'Unable to update user preferences'
      });
    }
  }

  public static async getAnalytics(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'User not authenticated'
        });
      }

      const analytics = {
        basic: req.user.analytics,
        calculated: {
          averageStudyTimePerDay: req.user.analytics.totalStudyTime / Math.max(req.user.analytics.streakDays, 1),
          accountAge: Math.floor((Date.now() - req.user.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
          isActiveToday: req.user.analytics.lastActiveDate.toDateString() === new Date().toDateString(),
          subscriptionDaysLeft: req.user.subscriptionEndDate 
            ? Math.max(0, Math.floor((req.user.subscriptionEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
            : null
        }
      };

      res.json({
        success: true,
        analytics
      });

    } catch (error) {
      console.error('Get analytics failed:', error);
      res.status(500).json({
        error: 'Analytics retrieval failed',
        message: 'Unable to retrieve user analytics'
      });
    }
  }

  public static async updateLearningProgress(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'User not authenticated'
        });
      }

      const { studyTimeMinutes, scorePercentage, courseCompleted } = req.body;

      if (studyTimeMinutes && typeof studyTimeMinutes === 'number' && studyTimeMinutes > 0) {
        req.user.analytics.totalStudyTime += studyTimeMinutes;
      }

      if (scorePercentage && typeof scorePercentage === 'number' && scorePercentage >= 0 && scorePercentage <= 100) {
        const currentTotal = req.user.analytics.averageScore * req.user.analytics.coursesCompleted;
        const newTotal = currentTotal + scorePercentage;
        const newCount = req.user.analytics.coursesCompleted + (courseCompleted ? 1 : 0);
        req.user.analytics.averageScore = newCount > 0 ? newTotal / newCount : 0;
      }

      if (courseCompleted) {
        req.user.analytics.coursesCompleted += 1;
      }

      await req.user.updateStreakDays();

      res.json({
        success: true,
        message: 'Learning progress updated successfully',
        analytics: req.user.analytics
      });

    } catch (error) {
      console.error('Learning progress update failed:', error);
      res.status(500).json({
        error: 'Progress update failed',
        message: 'Unable to update learning progress'
      });
    }
  }

  public static async searchUsers(req: Request, res: Response) {
    try {
      const { q, page = 1, limit = 20, role, educationLevel } = req.query;

      if (!q || typeof q !== 'string' || q.trim().length < 2) {
        return res.status(400).json({
          error: 'Search query required',
          message: 'Please provide a search query of at least 2 characters'
        });
      }

      const pageNum = parseInt(page as string);
      const limitNum = Math.min(parseInt(limit as string), 50);
      const skip = (pageNum - 1) * limitNum;

      const searchRegex = new RegExp(q.trim(), 'i');
      const query: any = {
        accountStatus: 'active',
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { username: searchRegex },
          { email: searchRegex }
        ]
      };

      if (role && typeof role === 'string') {
        query.role = role;
      }

      if (educationLevel && typeof educationLevel === 'string') {
        query.educationLevel = educationLevel;
      }

      const [users, total] = await Promise.all([
        User.find(query)
          .select('username firstName lastName profilePicture bio role educationLevel currentClass learningLanguage')
          .limit(limitNum)
          .skip(skip)
          .sort({ 'analytics.lastActiveDate': -1 }),
        User.countDocuments(query)
      ]);

      res.json({
        success: true,
        users,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalUsers: total,
          hasNextPage: pageNum * limitNum < total,
          hasPrevPage: pageNum > 1
        }
      });

    } catch (error) {
      console.error('User search failed:', error);
      res.status(500).json({
        error: 'Search failed',
        message: 'Unable to search users'
      });
    }
  }

  public static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await User.findById(id)
        .select('username firstName lastName profilePicture bio role educationLevel currentClass learningLanguage subjects createdAt');

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'No user found with the provided ID'
        });
      }

      if (user.accountStatus !== 'active') {
        return res.status(404).json({
          error: 'User not found',
          message: 'User account is not active'
        });
      }

      res.json({
        success: true,
        user
      });

    } catch (error) {
      console.error('Get user by ID failed:', error);
      res.status(500).json({
        error: 'User retrieval failed',
        message: 'Unable to retrieve user information'
      });
    }
  }

  public static async deactivateAccount(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'User not authenticated'
        });
      }

      req.user.accountStatus = 'deactivated';
      await req.user.save();

      res.json({
        success: true,
        message: 'Account has been deactivated successfully'
      });

    } catch (error) {
      console.error('Account deactivation failed:', error);
      res.status(500).json({
        error: 'Deactivation failed',
        message: 'Unable to deactivate account'
      });
    }
  }

  public static async reactivateAccount(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'User not authenticated'
        });
      }

      if (req.user.accountStatus !== 'deactivated') {
        return res.status(400).json({
          error: 'Account not deactivated',
          message: 'Account is not in deactivated state'
        });
      }

      req.user.accountStatus = 'active';
      await req.user.save();

      res.json({
        success: true,
        message: 'Account has been reactivated successfully'
      });

    } catch (error) {
      console.error('Account reactivation failed:', error);
      res.status(500).json({
        error: 'Reactivation failed',
        message: 'Unable to reactivate account'
      });
    }
  }
}

export default UserController;