// Application constants

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  COURSES: '/courses',
  COURSE_DETAIL: '/courses/:id',
  AI_TUTOR: '/ai/tutor',
  AI_CONTENT: '/ai/content',
  AI_ASSESSMENT: '/ai/assessment',
  AI_DOUBT: '/ai/doubt',
  STUDY_PLANNER: '/study-planner',
  ASSESSMENTS: '/assessments',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  ANALYTICS: '/analytics',
} as const;

export const AGENT_TYPES = {
  TUTOR: 'tutor',
  CONTENT_CREATOR: 'content_creator',
  ASSESSMENT: 'assessment',
  ANALYTICS: 'analytics',
  MENTOR: 'mentor',
  STUDY_PLANNER: 'study_planner',
  DOUBT_SOLVER: 'doubt_solver',
} as const;

export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
  PARENT: 'parent',
} as const;

export const SUBSCRIPTION_TYPES = {
  FREE: 'free',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise',
} as const;

export const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Hindi',
  'History',
  'Geography',
  'Computer Science',
  'Economics',
  'Political Science',
  'Psychology',
] as const;

export const EDUCATION_LEVELS = [
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
  'Undergraduate',
  'Postgraduate',
] as const;

export const LEARNING_STYLES = [
  'Visual',
  'Auditory',
  'Kinesthetic',
  'Reading/Writing',
  'Mixed',
] as const;

export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  AI_QUESTION: 'ai_question',
  AI_RESPONSE: 'ai_response',
  STUDY_SESSION_START: 'study_session_start',
  STUDY_SESSION_CONFIRMED: 'study_session_confirmed',
} as const;

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'aarambh_auth_token',
  USER_DATA: 'aarambh_user_data',
  THEME_MODE: 'aarambh_theme_mode',
  LANGUAGE: 'aarambh_language',
  RECENT_SEARCHES: 'aarambh_recent_searches',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  AI: {
    TUTOR: '/ai/tutor/ask',
    CONTENT: '/ai/content/create',
    ASSESSMENT: '/ai/assessment/create',
    DOUBT: '/ai/doubt/solve',
    REQUEST: '/ai/request',
    AGENTS: '/ai/agents',
    HEALTH: '/ai/health',
  },
  COURSES: {
    LIST: '/courses',
    DETAIL: '/courses/:id',
    ENROLL: '/courses/:id/enroll',
    PROGRESS: '/courses/:id/progress',
  },
  USER: {
    PROFILE: '/users/profile',
    UPDATE: '/users/update',
    ANALYTICS: '/users/analytics',
  },
} as const;
