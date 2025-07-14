import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import FirebaseConfig from '../config/firebase';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
  firebaseUser?: any;
}

export class AuthMiddleware {
  public static async verifyFirebaseToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please provide a valid Firebase ID token'
        });
      }

      const idToken = authHeader.substring(7);
      
      const decodedToken = await FirebaseConfig.getInstance().verifyIdToken(idToken);
      
      const user = await User.findByFirebaseUid(decodedToken.uid);
      
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'User account not found in the system'
        });
      }

      if (user.accountStatus !== 'active') {
        return res.status(403).json({
          error: 'Account suspended',
          message: 'Your account has been suspended or deactivated'
        });
      }

      req.user = user;
      req.firebaseUser = decodedToken;
      
      await user.updateLastActive();
      
      next();
    } catch (error) {
      console.error('Firebase token verification failed:', error);
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Authentication token is invalid or expired'
      });
    }
  }

  public static async verifyJWT(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please provide a valid JWT token'
        });
      }

      const token = authHeader.substring(7);
      const jwtSecret = process.env.JWT_SECRET;

      if (!jwtSecret) {
        throw new Error('JWT_SECRET not configured');
      }

      const decoded = jwt.verify(token, jwtSecret) as any;
      
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'User account not found'
        });
      }

      if (user.accountStatus !== 'active') {
        return res.status(403).json({
          error: 'Account suspended',
          message: 'Your account has been suspended or deactivated'
        });
      }

      req.user = user;
      
      await user.updateLastActive();
      
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          error: 'Invalid token',
          message: 'JWT token is invalid'
        });
      }
      
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          error: 'Token expired',
          message: 'JWT token has expired'
        });
      }

      console.error('JWT verification failed:', error);
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Unable to authenticate request'
      });
    }
  }

  public static requireRole(roles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'User not authenticated'
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          message: `Access denied. Required roles: ${roles.join(', ')}`
        });
      }

      next();
    };
  }

  public static requireSubscription(subscriptionTypes: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'User not authenticated'
        });
      }

      if (!subscriptionTypes.includes(req.user.subscriptionType)) {
        return res.status(403).json({
          error: 'Subscription required',
          message: `Access denied. Required subscription: ${subscriptionTypes.join(' or ')}`
        });
      }

      if (!req.user.isSubscriptionActive()) {
        return res.status(403).json({
          error: 'Subscription expired',
          message: 'Your subscription has expired. Please renew to continue.'
        });
      }

      next();
    };
  }

  public static optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    AuthMiddleware.verifyFirebaseToken(req, res, (error) => {
      if (error) {
        return next();
      }
      next();
    });
  }

  public static generateJWT(user: IUser): string {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpire = process.env.JWT_EXPIRE || '24h';

    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const payload = {
      userId: user._id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      role: user.role,
      subscriptionType: user.subscriptionType
    };

    return jwt.sign(payload, jwtSecret, {
      expiresIn: jwtExpire,
      issuer: 'aarambh-ai',
      audience: 'aarambh-ai-users'
    });
  }

  public static async refreshToken(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'User not authenticated'
        });
      }

      const newToken = AuthMiddleware.generateJWT(req.user);
      
      res.json({
        success: true,
        token: newToken,
        user: {
          id: req.user._id,
          email: req.user.email,
          username: req.user.username,
          role: req.user.role,
          subscriptionType: req.user.subscriptionType
        }
      });
    } catch (error) {
      console.error('Token refresh failed:', error);
      res.status(500).json({
        error: 'Token refresh failed',
        message: 'Unable to refresh authentication token'
      });
    }
  }
}

export default AuthMiddleware;