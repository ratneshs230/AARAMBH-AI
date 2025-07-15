// Mobile app constants for AARAMBH AI

export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000',
  API_URL: 'http://localhost:5000/api',
  AI_API_URL: 'http://localhost:5000/api/ai',
  SOCKET_URL: 'http://localhost:5000',
  TIMEOUT: 30000,
};

export const ROUTES = {
  // Auth Routes
  AUTH: 'Auth',
  LOGIN: 'Login',
  REGISTER: 'Register',
  
  // Main Routes
  MAIN: 'Main',
  DASHBOARD: 'Dashboard',
  COURSES: 'Courses',
  COURSE_DETAIL: 'CourseDetail',
  PROFILE: 'Profile',
  SETTINGS: 'Settings',
  
  // AI Routes
  AI: 'AI',
  AI_HOME: 'AIHome',
  AI_TUTOR: 'AITutor',
  AI_CONTENT: 'AIContent',
  AI_ASSESSMENT: 'AIAssessment',
  AI_DOUBT: 'AIDoubt',
  AI_PLANNER: 'AIPlanner',
  AI_MENTOR: 'AIMentor',
  AI_ANALYTICS: 'AIAnalytics',
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

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@aarambh_auth_token',
  USER_DATA: '@aarambh_user_data',
  THEME_MODE: '@aarambh_theme_mode',
  LANGUAGE: '@aarambh_language',
  OFFLINE_DATA: '@aarambh_offline_data',
  RECENT_SEARCHES: '@aarambh_recent_searches',
  STUDY_SESSIONS: '@aarambh_study_sessions',
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

export const COLORS = {
  primary: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#2196f3',
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1',
  },
  secondary: {
    50: '#fce4ec',
    100: '#f8bbd9',
    200: '#f48fb1',
    300: '#f06292',
    400: '#ec407a',
    500: '#e91e63',
    600: '#d81b60',
    700: '#c2185b',
    800: '#ad1457',
    900: '#880e4f',
  },
  success: {
    main: '#4caf50',
    light: '#81c784',
    dark: '#388e3c',
  },
  warning: {
    main: '#ff9800',
    light: '#ffb74d',
    dark: '#f57c00',
  },
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
  },
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  background: {
    light: '#ffffff',
    dark: '#121212',
    paper: '#f8fafc',
  },
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#bdbdbd',
  },
} as const;

export const DIMENSIONS = {
  SCREEN_PADDING: 16,
  BORDER_RADIUS: 8,
  BORDER_RADIUS_LARGE: 16,
  HEADER_HEIGHT: 60,
  TAB_BAR_HEIGHT: 80,
  BUTTON_HEIGHT: 48,
  INPUT_HEIGHT: 56,
} as const;

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const AI_AGENTS = [
  {
    type: AGENT_TYPES.TUTOR,
    name: 'AI Tutor',
    description: 'Get personalized explanations and step-by-step guidance',
    icon: 'school',
    color: COLORS.primary[500],
  },
  {
    type: AGENT_TYPES.CONTENT_CREATOR,
    name: 'Content Creator',
    description: 'Generate educational content and study materials',
    icon: 'create',
    color: COLORS.secondary[500],
  },
  {
    type: AGENT_TYPES.ASSESSMENT,
    name: 'Assessment Generator',
    description: 'Create quizzes and tests for practice',
    icon: 'quiz',
    color: COLORS.warning.main,
  },
  {
    type: AGENT_TYPES.DOUBT_SOLVER,
    name: 'Doubt Solver',
    description: 'Get instant help with your questions',
    icon: 'help',
    color: COLORS.success.main,
  },
  {
    type: AGENT_TYPES.STUDY_PLANNER,
    name: 'Study Planner',
    description: 'Create personalized study schedules',
    icon: 'event-note',
    color: COLORS.primary[700],
  },
  {
    type: AGENT_TYPES.MENTOR,
    name: 'Career Mentor',
    description: 'Get guidance for your career path',
    icon: 'person',
    color: COLORS.secondary[700],
  },
  {
    type: AGENT_TYPES.ANALYTICS,
    name: 'Learning Analytics',
    description: 'Track your progress and performance',
    icon: 'analytics',
    color: COLORS.error.main,
  },
] as const;