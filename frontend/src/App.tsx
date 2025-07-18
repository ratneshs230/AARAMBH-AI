import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';

// Theme
import { lightTheme } from '@/utils/theme';

// Context Providers
import { SarasProvider } from '@/contexts/SarasContext';

// Layout Components
import Layout from '@/components/layout/Layout';

// Page Components
import HomePage from '@/pages/HomePage';
import UnifiedDashboardPage from '@/pages/dashboard/UnifiedDashboardPage';
import CourseSelectionPage from '@/pages/dashboard/CourseSelectionPage';
import AITestPage from '@/pages/debug/AITestPage';
import SettingsPage from '@/pages/settings/SettingsPage';
import AboutPage from '@/pages/settings/AboutPage';
import AITutorPage from '@/pages/ai/AITutorPage';
import AIContentPage from '@/pages/ai/AIContentPage';
import AIAssessmentPage from '@/pages/ai/AIAssessmentPage';
import AIDoubtPage from '@/pages/ai/AIDoubtPage';
import CoursesPage from '@/pages/courses/CoursesPage';
import CourseDetailPage from '@/pages/courses/CourseDetailPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ProfilePage from '@/pages/profile/ProfilePage';
import AnalyticsPage from '@/pages/dashboard/AnalyticsPage';
import StudyRoomsPage from '@/pages/study-rooms/StudyRoomsPage';
import AdvancedAnalyticsPage from '@/pages/analytics/AdvancedAnalyticsPage';
import AdaptiveLearningPathPage from '@/pages/learning-paths/AdaptiveLearningPathPage';
import GamificationPage from '@/pages/gamification/GamificationPage';
import ARVRLearningPage from '@/pages/immersive/ARVRLearningPage';
import AICodeEditorPage from '@/pages/coding/AICodeEditorPage';
import NeuralNetworkVisualizationPage from '@/pages/neural-networks/NeuralNetworkVisualizationPage';
import CuriosityPlatformPage from '@/pages/curiosity/CuriosityPlatformPage';
import CommunityPage from '@/pages/community/CommunityPage';
import CreateGamesPage from '@/pages/games/CreateGamesPage';
import StudyPlannerPage from '@/pages/study-planner/StudyPlannerPage';
import AssessmentsPage from '@/pages/assessments/AssessmentsPage';

// Constants
import { ROUTES } from '@/utils/constants';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <SarasProvider>
        <Router>
        <Routes>
          {/* Public Routes */}
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

          {/* Curiosity Platform - Clean Layout without Sidebar */}
          <Route path={ROUTES.CURIOSITY} element={<CuriosityPlatformPage />} />

          {/* App Routes with Layout */}
          <Route element={<Layout />}>
            <Route path={ROUTES.DASHBOARD} element={<CourseSelectionPage />} />
            <Route path="/dashboard/:id" element={<UnifiedDashboardPage />} />
            <Route path={ROUTES.COURSES} element={<CoursesPage />} />
            <Route path={ROUTES.COURSE_DETAIL} element={<CourseDetailPage />} />
            <Route path={ROUTES.AI_TUTOR} element={<AITutorPage />} />
            <Route path={ROUTES.AI_CONTENT} element={<AIContentPage />} />
            <Route path={ROUTES.AI_ASSESSMENT} element={<AIAssessmentPage />} />
            <Route path={ROUTES.AI_DOUBT} element={<AIDoubtPage />} />
            <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
            <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
            <Route path='/community' element={<CommunityPage />} />
            <Route path='/create-games' element={<CreateGamesPage />} />
            <Route path={ROUTES.STUDY_PLANNER} element={<StudyPlannerPage />} />
            <Route path={ROUTES.ASSESSMENTS} element={<AssessmentsPage />} />
            <Route path='/study-rooms' element={<StudyRoomsPage />} />
            <Route path='/advanced-analytics' element={<AdvancedAnalyticsPage />} />
            <Route path='/learning-paths' element={<AdaptiveLearningPathPage />} />
            <Route path='/gamification' element={<GamificationPage />} />
            <Route path='/ar-vr-learning' element={<ARVRLearningPage />} />
            <Route path='/code-editor' element={<AICodeEditorPage />} />
            <Route path='/neural-networks' element={<NeuralNetworkVisualizationPage />} />
            <Route path='/debug/ai-test' element={<AITestPage />} />
            <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
            <Route path='/settings/about' element={<AboutPage />} />
          </Route>

          {/* 404 Route */}
          <Route path='*' element={<div>Page Not Found</div>} />
        </Routes>
        </Router>
      </SarasProvider>
    </ThemeProvider>
  );
};

export default App;
