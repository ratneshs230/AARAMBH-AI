import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';

// Theme
import { lightTheme } from '@/utils/theme';

// Layout Components
import Layout from '@/components/layout/Layout';

// Page Components
import HomePage from '@/pages/HomePage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import AITutorPage from '@/pages/ai/AITutorPage';
import AIContentPage from '@/pages/ai/AIContentPage';
import AIAssessmentPage from '@/pages/ai/AIAssessmentPage';
import AIDoubtPage from '@/pages/ai/AIDoubtPage';
import CoursesPage from '@/pages/courses/CoursesPage';
import CourseDetailPage from '@/pages/courses/CourseDetailPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import AnalyticsPage from '@/pages/dashboard/AnalyticsPage';

// Constants
import { ROUTES } from '@/utils/constants';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

          {/* App Routes with Layout */}
          <Route element={<Layout />}>
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.COURSES} element={<CoursesPage />} />
            <Route path={ROUTES.COURSE_DETAIL} element={<CourseDetailPage />} />
            <Route path={ROUTES.AI_TUTOR} element={<AITutorPage />} />
            <Route path={ROUTES.AI_CONTENT} element={<AIContentPage />} />
            <Route path={ROUTES.AI_ASSESSMENT} element={<AIAssessmentPage />} />
            <Route path={ROUTES.AI_DOUBT} element={<AIDoubtPage />} />
            <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
          </Route>

          {/* 404 Route */}
          <Route path='*' element={<div>Page Not Found</div>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
