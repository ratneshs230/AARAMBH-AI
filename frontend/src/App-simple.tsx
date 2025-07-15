import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme } from './utils/theme';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/dashboard/DashboardPage';
import AITutorPage from './pages/ai/AITutorPage';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route element={<Layout />}>
            <Route path='/dashboard' element={<DashboardPage />} />
            <Route path='/ai/tutor' element={<AITutorPage />} />
          </Route>
          <Route path='*' element={<div>Page Not Found</div>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
