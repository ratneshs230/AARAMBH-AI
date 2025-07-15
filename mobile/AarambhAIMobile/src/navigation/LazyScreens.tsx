import React from 'react';
import { createLazyComponent } from '../components/common/LazyLoader';

// Lazy load all screens for better performance
export const LazyHomeScreen = createLazyComponent(
  () => import('../screens/HomeScreen'),
  'HomeScreen'
);

export const LazyDashboardScreen = createLazyComponent(
  () => import('../screens/DashboardScreen'),
  'DashboardScreen'
);

export const LazyProfileScreen = createLazyComponent(
  () => import('../screens/ProfileScreen'),
  'ProfileScreen'
);

export const LazySettingsScreen = createLazyComponent(
  () => import('../screens/SettingsScreen'),
  'SettingsScreen'
);

// AI Agent Screens
export const LazyAITutorScreen = createLazyComponent(
  () => import('../screens/ai/AITutorScreen'),
  'AITutorScreen'
);

export const LazyAIContentScreen = createLazyComponent(
  () => import('../screens/ai/AIContentScreen'),
  'AIContentScreen'
);

export const LazyAIAssessmentScreen = createLazyComponent(
  () => import('../screens/ai/AIAssessmentScreen'),
  'AIAssessmentScreen'
);

export const LazyAIDoubtScreen = createLazyComponent(
  () => import('../screens/ai/AIDoubtScreen'),
  'AIDoubtScreen'
);

export const LazyAIPlannerScreen = createLazyComponent(
  () => import('../screens/ai/AIPlannerScreen'),
  'AIPlannerScreen'
);

export const LazyAIMentorScreen = createLazyComponent(
  () => import('../screens/ai/AIMentorScreen'),
  'AIMentorScreen'
);

export const LazyAIAnalyticsScreen = createLazyComponent(
  () => import('../screens/ai/AIAnalyticsScreen'),
  'AIAnalyticsScreen'
);

// Course Management Screens
export const LazyCourseScreen = createLazyComponent(
  () => import('../screens/CourseScreen'),
  'CourseScreen'
);

export const LazyCourseDetailsScreen = createLazyComponent(
  () => import('../screens/CourseDetailsScreen'),
  'CourseDetailsScreen'
);

export const LazyLessonPlayerScreen = createLazyComponent(
  () => import('../screens/LessonPlayerScreen'),
  'LessonPlayerScreen'
);

// Assessment Screens
export const LazyAssessmentScreen = createLazyComponent(
  () => import('../screens/AssessmentScreen'),
  'AssessmentScreen'
);

export const LazyAssessmentPlayerScreen = createLazyComponent(
  () => import('../screens/AssessmentPlayerScreen'),
  'AssessmentPlayerScreen'
);

export const LazyAssessmentResultsScreen = createLazyComponent(
  () => import('../screens/AssessmentResultsScreen'),
  'AssessmentResultsScreen'
);

// Study Session Screens
export const LazyStudySessionScreen = createLazyComponent(
  () => import('../screens/StudySessionScreen'),
  'StudySessionScreen'
);

// Authentication Screens
export const LazyLoginScreen = createLazyComponent(
  () => import('../screens/auth/LoginScreen'),
  'LoginScreen'
);

export const LazyRegisterScreen = createLazyComponent(
  () => import('../screens/auth/RegisterScreen'),
  'RegisterScreen'
);

export const LazyForgotPasswordScreen = createLazyComponent(
  () => import('../screens/auth/ForgotPasswordScreen'),
  'ForgotPasswordScreen'
);

// Screen groups for preloading
export const coreScreens = [
  LazyHomeScreen,
  LazyDashboardScreen,
  LazyProfileScreen,
];

export const aiScreens = [
  LazyAITutorScreen,
  LazyAIContentScreen,
  LazyAIAssessmentScreen,
  LazyAIDoubtScreen,
];

export const courseScreens = [
  LazyCourseScreen,
  LazyCourseDetailsScreen,
  LazyLessonPlayerScreen,
];

export const assessmentScreens = [
  LazyAssessmentScreen,
  LazyAssessmentPlayerScreen,
  LazyAssessmentResultsScreen,
];

export const authScreens = [
  LazyLoginScreen,
  LazyRegisterScreen,
  LazyForgotPasswordScreen,
];

// Preload functions for different screen groups
export const preloadCoreScreens = () => {
  coreScreens.forEach(screen => {
    const componentImport = (screen as any)._payload._result;
    if (!componentImport) {
      (screen as any)._payload._result = (screen as any)._payload._fn();
    }
  });
};

export const preloadAIScreens = () => {
  aiScreens.forEach(screen => {
    const componentImport = (screen as any)._payload._result;
    if (!componentImport) {
      (screen as any)._payload._result = (screen as any)._payload._fn();
    }
  });
};

export const preloadCourseScreens = () => {
  courseScreens.forEach(screen => {
    const componentImport = (screen as any)._payload._result;
    if (!componentImport) {
      (screen as any)._payload._result = (screen as any)._payload._fn();
    }
  });
};

// Priority-based preloading
export const preloadByPriority = (priority: 'high' | 'medium' | 'low') => {
  switch (priority) {
    case 'high':
      preloadCoreScreens();
      break;
    case 'medium':
      preloadAIScreens();
      break;
    case 'low':
      preloadCourseScreens();
      break;
  }
};

export default {
  LazyHomeScreen,
  LazyDashboardScreen,
  LazyProfileScreen,
  LazySettingsScreen,
  LazyAITutorScreen,
  LazyAIContentScreen,
  LazyAIAssessmentScreen,
  LazyAIDoubtScreen,
  LazyAIPlannerScreen,
  LazyAIMentorScreen,
  LazyAIAnalyticsScreen,
  LazyCourseScreen,
  LazyCourseDetailsScreen,
  LazyLessonPlayerScreen,
  LazyAssessmentScreen,
  LazyAssessmentPlayerScreen,
  LazyAssessmentResultsScreen,
  LazyStudySessionScreen,
  LazyLoginScreen,
  LazyRegisterScreen,
  LazyForgotPasswordScreen,
};