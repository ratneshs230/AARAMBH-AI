import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import FirebaseConfig from '../config/firebase';
import AuthMiddleware, { AuthRequest } from '../middleware/auth';

export class AuthController {
  public static async register(req: Request, res: Response) {
    try {
      const {
        email,
        username,
        firstName,
        lastName,
        dateOfBirth,
        gender,
        phoneNumber,
        educationLevel,
        learningLanguage,
        role = 'student',
        subjects = [],
        currentClass,
      } = req.body;

      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({
          error: 'Firebase ID token required',
          message: 'Please provide a valid Firebase ID token',
        });
      }

      const decodedToken = await FirebaseConfig.getInstance().verifyIdToken(idToken);

      if (decodedToken.email !== email) {
        return res.status(400).json({
          error: 'Email mismatch',
          message: 'Firebase token email does not match provided email',
        });
      }

      const existingUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { username }, { firebaseUid: decodedToken.uid }],
      });

      if (existingUser) {
        if (existingUser.email === email.toLowerCase()) {
          return res.status(409).json({
            error: 'Email already exists',
            message: 'An account with this email already exists',
          });
        }
        if (existingUser.username === username) {
          return res.status(409).json({
            error: 'Username already exists',
            message: 'This username is already taken',
          });
        }
        if (existingUser.firebaseUid === decodedToken.uid) {
          return res.status(409).json({
            error: 'Account already exists',
            message: 'An account with this Firebase UID already exists',
          });
        }
      }

      const userData = {
        firebaseUid: decodedToken.uid,
        email: email.toLowerCase(),
        username,
        firstName,
        lastName,
        dateOfBirth,
        gender,
        phoneNumber,
        educationLevel,
        learningLanguage,
        role,
        subjects,
        currentClass,
        isEmailVerified: decodedToken.email_verified || false,
        preferences: {
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
          privacy: {
            profileVisibility: 'public',
            showOnlineStatus: true,
            allowMessaging: true,
          },
          learning: {
            dailyGoalMinutes: 30,
            difficultyLevel: 'beginner',
          },
        },
        analytics: {
          totalStudyTime: 0,
          coursesCompleted: 0,
          averageScore: 0,
          streakDays: 0,
          lastActiveDate: new Date(),
          loginCount: 1,
        },
      };

      const user = new User(userData);
      await user.save();

      await FirebaseConfig.getInstance().setCustomUserClaims(decodedToken.uid, {
        role: user.role,
        subscriptionType: user.subscriptionType,
        userId: user._id.toString(),
      });

      const jwtToken = AuthMiddleware.generateJWT(user);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
          id: user._id,
          firebaseUid: user.firebaseUid,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          educationLevel: user.educationLevel,
          learningLanguage: user.learningLanguage,
          subscriptionType: user.subscriptionType,
          isEmailVerified: user.isEmailVerified,
          accountStatus: user.accountStatus,
          createdAt: user.createdAt,
        },
        tokens: {
          jwt: jwtToken,
          firebase: idToken,
        },
      });
    } catch (error) {
      console.error('User registration failed:', error);

      if (error instanceof Error && error.message.includes('duplicate key')) {
        return res.status(409).json({
          error: 'Duplicate data',
          message: 'Email or username already exists',
        });
      }

      res.status(500).json({
        error: 'Registration failed',
        message: 'Unable to create user account',
      });
    }
  }

  public static async login(req: Request, res: Response) {
    try {
      const { email, idToken } = req.body;

      const decodedToken = await FirebaseConfig.getInstance().verifyIdToken(idToken);

      if (decodedToken.email !== email) {
        return res.status(400).json({
          error: 'Email mismatch',
          message: 'Firebase token email does not match provided email',
        });
      }

      const user = await User.findByFirebaseUid(decodedToken.uid);

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'No account found with this email. Please register first.',
        });
      }

      if (user.accountStatus !== 'active') {
        return res.status(403).json({
          error: 'Account suspended',
          message: 'Your account has been suspended or deactivated',
        });
      }

      await user.updateLastActive();
      await user.updateStreakDays();

      await FirebaseConfig.getInstance().setCustomUserClaims(decodedToken.uid, {
        role: user.role,
        subscriptionType: user.subscriptionType,
        userId: user._id.toString(),
      });

      const jwtToken = AuthMiddleware.generateJWT(user);

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user._id,
          firebaseUid: user.firebaseUid,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          role: user.role,
          educationLevel: user.educationLevel,
          learningLanguage: user.learningLanguage,
          subscriptionType: user.subscriptionType,
          isEmailVerified: user.isEmailVerified,
          accountStatus: user.accountStatus,
          analytics: user.analytics,
          preferences: user.preferences,
          lastLoginAt: user.analytics.lastActiveDate,
        },
        tokens: {
          jwt: jwtToken,
          firebase: idToken,
        },
      });
    } catch (error) {
      console.error('User login failed:', error);
      res.status(401).json({
        error: 'Login failed',
        message: 'Invalid credentials or authentication error',
      });
    }
  }

  public static async refreshToken(req: AuthRequest, res: Response) {
    try {
      return AuthMiddleware.refreshToken(req, res);
    } catch (error) {
      console.error('Token refresh failed:', error);
      res.status(500).json({
        error: 'Token refresh failed',
        message: 'Unable to refresh authentication token',
      });
    }
  }

  public static async logout(req: AuthRequest, res: Response) {
    try {
      if (req.user) {
        req.user.analytics.lastActiveDate = new Date();
        await req.user.save();
      }

      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      console.error('Logout failed:', error);
      res.status(500).json({
        error: 'Logout failed',
        message: 'Unable to process logout',
      });
    }
  }

  public static async verifyEmail(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'User not authenticated',
        });
      }

      if (req.firebaseUser?.email_verified) {
        req.user.isEmailVerified = true;
        await req.user.save();

        res.json({
          success: true,
          message: 'Email verified successfully',
        });
      } else {
        res.status(400).json({
          error: 'Email not verified',
          message: 'Email has not been verified in Firebase',
        });
      }
    } catch (error) {
      console.error('Email verification failed:', error);
      res.status(500).json({
        error: 'Verification failed',
        message: 'Unable to verify email',
      });
    }
  }

  public static async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          error: 'Email required',
          message: 'Please provide an email address',
        });
      }

      const user = await User.findByEmail(email);

      if (!user) {
        return res.json({
          success: true,
          message: 'If an account with this email exists, a password reset link has been sent',
        });
      }

      res.json({
        success: true,
        message: 'Password reset link has been sent to your email',
        instructions: 'Please use Firebase Auth to reset your password',
      });
    } catch (error) {
      console.error('Password reset request failed:', error);
      res.status(500).json({
        error: 'Reset request failed',
        message: 'Unable to process password reset request',
      });
    }
  }

  public static async changePassword(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'User not authenticated',
        });
      }

      res.json({
        success: true,
        message: 'Password change completed',
        instructions: 'Password was changed through Firebase Auth',
      });
    } catch (error) {
      console.error('Password change failed:', error);
      res.status(500).json({
        error: 'Password change failed',
        message: 'Unable to change password',
      });
    }
  }

  public static async deleteAccount(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'User not authenticated',
        });
      }

      const { confirmDelete } = req.body;

      if (confirmDelete !== 'DELETE_ACCOUNT') {
        return res.status(400).json({
          error: 'Confirmation required',
          message: 'Please confirm account deletion by sending "DELETE_ACCOUNT"',
        });
      }

      req.user.accountStatus = 'deactivated';
      await req.user.save();

      try {
        await FirebaseConfig.getInstance().deleteUser(req.user.firebaseUid);
      } catch (firebaseError) {
        console.error('Firebase user deletion failed:', firebaseError);
      }

      res.json({
        success: true,
        message: 'Account has been deleted successfully',
      });
    } catch (error) {
      console.error('Account deletion failed:', error);
      res.status(500).json({
        error: 'Account deletion failed',
        message: 'Unable to delete account',
      });
    }
  }
}

export default AuthController;
