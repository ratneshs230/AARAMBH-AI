/**
 * AARAMBH AI - Security Middleware
 * Comprehensive security configurations for production deployment
 */

import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { validationResult } from 'express-validator';

// =============================================================================
// HELMET SECURITY CONFIGURATION
// =============================================================================
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://cdnjs.cloudflare.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com"
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://apis.google.com",
        "https://www.googletagmanager.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "blob:",
        "https://cdn.aarambh.ai",
        "https://images.aarambh.ai"
      ],
      connectSrc: [
        "'self'",
        "https://api.aarambh.ai",
        "https://identitytoolkit.googleapis.com",
        "https://securetoken.googleapis.com",
        "wss://ws.aarambh.ai"
      ],
      mediaSrc: ["'self'", "https://assets.aarambh.ai"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: []
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  frameguard: { action: 'deny' }
});

// =============================================================================
// RATE LIMITING CONFIGURATIONS
// =============================================================================

// General API rate limiting
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: 900 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(15 * 60) // 15 minutes
    });
  }
});

// AI API rate limiting (more restrictive)
export const aiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 AI requests per minute
  message: {
    error: 'Too many AI requests from this IP, please try again later.',
    code: 'AI_RATE_LIMIT_EXCEEDED',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'AI rate limit exceeded',
      message: 'Too many AI requests from this IP, please try again later.',
      retryAfter: 60
    });
  }
});

// Authentication rate limiting
export const authRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // limit each IP to 5 login attempts per 5 minutes
  message: {
    error: 'Too many login attempts, please try again later.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    retryAfter: 300
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Authentication rate limit exceeded',
      message: 'Too many login attempts from this IP, please try again later.',
      retryAfter: 300
    });
  }
});

// =============================================================================
// INPUT VALIDATION MIDDLEWARE
// =============================================================================
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      message: 'Please check your input data',
      details: errors.array()
    });
  }
  next();
};

// =============================================================================
// CORS CONFIGURATION
// =============================================================================
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      'https://app.aarambh.ai',
      'https://www.aarambh.ai',
      'https://aarambh.ai',
      'http://localhost:3000', // Development
      'http://localhost:3001', // Alternative dev port
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-API-Key'
  ]
};

// =============================================================================
// SECURITY HEADERS MIDDLEWARE
// =============================================================================
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Remove server header
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Add custom security headers
  res.setHeader('X-API-Version', '1.0.0');
  res.setHeader('X-Request-ID', req.headers['x-request-id'] || 'unknown');
  
  next();
};

// =============================================================================
// REQUEST SANITIZATION
// =============================================================================
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  // Remove potentially dangerous characters from query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = (req.query[key] as string)
          .replace(/[<>]/g, '') // Remove HTML tags
          .trim();
      }
    });
  }

  // Limit request body size
  if (req.body && JSON.stringify(req.body).length > 10485760) { // 10MB limit
    return res.status(413).json({
      success: false,
      error: 'Payload too large',
      message: 'Request body exceeds maximum size limit'
    });
  }

  next();
};

// =============================================================================
// API KEY VALIDATION
// =============================================================================
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key required',
      message: 'Please provide a valid API key'
    });
  }

  if (!validApiKeys.includes(apiKey as string)) {
    return res.status(401).json({
      success: false,
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
  }

  next();
};

// =============================================================================
// LOGGING MIDDLEWARE
// =============================================================================
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      duration,
      timestamp: new Date().toISOString()
    };

    // Log suspicious activity
    if (res.statusCode >= 400) {
      console.warn('Security Alert:', logData);
    }
  });

  next();
};

// =============================================================================
// DDOS PROTECTION
// =============================================================================
export const ddosProtection = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // limit each IP to 1000 requests per minute
  message: {
    error: 'Too many requests - possible DDoS attack detected',
    code: 'DDOS_PROTECTION_TRIGGERED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    console.error('DDoS Protection Triggered:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
    
    res.status(429).json({
      success: false,
      error: 'Request blocked',
      message: 'Too many requests detected from this IP'
    });
  }
});

// =============================================================================
// MONGODB INJECTION PROTECTION
// =============================================================================
export const mongoSanitize = (req: Request, res: Response, next: NextFunction) => {
  // Function to recursively sanitize object
  const sanitizeObject = (obj: any): any => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          sanitizeObject(obj[key]);
        }
      }
    }
    return obj;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

// =============================================================================
// EXPORT ALL MIDDLEWARE
// =============================================================================
export {
  helmetConfig as helmet,
  apiRateLimit,
  aiRateLimit,
  authRateLimit,
  corsOptions,
  securityHeaders,
  sanitizeRequest,
  validateApiKey,
  securityLogger,
  ddosProtection,
  mongoSanitize,
  handleValidationErrors
};