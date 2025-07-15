import type { AppConfig } from '@/types/index';

export const config: AppConfig = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  aiApiUrl: import.meta.env.VITE_AI_API_URL || 'http://localhost:5000/api/ai',
  socketUrl: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
  enableAI: import.meta.env.VITE_ENABLE_AI_FEATURES === 'true',
  enableRealTime: import.meta.env.VITE_ENABLE_REAL_TIME === 'true',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enablePWA: import.meta.env.VITE_ENABLE_PWA === 'true',
};

export const appInfo = {
  name: import.meta.env.VITE_APP_NAME || 'AARAMBH AI',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  description: import.meta.env.VITE_APP_DESCRIPTION || 'AI-Powered Educational Platform',
};

export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;