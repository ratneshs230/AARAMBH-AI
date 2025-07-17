import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as CoursesIcon,
  Psychology as AIIcon,
  Quiz as AssessmentIcon,
  Analytics as AnalyticsIcon,
  EventNote as PlannerIcon,
  Help as DoubtIcon,
  Person as ProfileIcon,
  Explore as CuriosityIcon,
} from '@mui/icons-material';
import { ROUTES } from '@/utils/constants';

const drawerWidth = 260;

interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  category?: string;
}

const menuItems: MenuItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: ROUTES.DASHBOARD },
  { text: 'Courses', icon: <CoursesIcon />, path: ROUTES.COURSES },

  // AI Features
  { text: 'AI Tutor', icon: <AIIcon />, path: ROUTES.AI_TUTOR, category: 'AI Features' },
  {
    text: 'Curiosity Platform',
    icon: <CuriosityIcon />,
    path: ROUTES.CURIOSITY,
    category: 'AI Features',
  },
  {
    text: 'Content Creator',
    icon: <CoursesIcon />,
    path: ROUTES.AI_CONTENT,
    category: 'AI Features',
  },
  {
    text: 'Assessment Generator',
    icon: <AssessmentIcon />,
    path: ROUTES.AI_ASSESSMENT,
    category: 'AI Features',
  },
  { text: 'Doubt Solver', icon: <DoubtIcon />, path: ROUTES.AI_DOUBT, category: 'AI Features' },

  // Tools
  { text: 'Study Planner', icon: <PlannerIcon />, path: ROUTES.STUDY_PLANNER, category: 'Tools' },
  { text: 'Assessments', icon: <AssessmentIcon />, path: ROUTES.ASSESSMENTS, category: 'Tools' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: ROUTES.ANALYTICS, category: 'Tools' },

  // Account
  { text: 'Profile', icon: <ProfileIcon />, path: ROUTES.PROFILE, category: 'Account' },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const renderMenuSection = (category: string | undefined, items: MenuItem[]) => {
    const sectionItems = items.filter(item => item.category === category);

    if (sectionItems.length === 0) return null;

    return (
      <Box key={category || 'main'}>
        {category && (
          <Typography
            variant='overline'
            sx={{
              px: 2,
              py: 1,
              display: 'block',
              fontWeight: 600,
              color: 'text.secondary',
              fontSize: '0.75rem',
            }}
          >
            {category}
          </Typography>
        )}
        <List sx={{ py: 0 }}>
          {sectionItems.map(item => {
            const isSelected = location.pathname === item.path;

            return (
              <ListItem key={item.text} disablePadding sx={{ px: 1 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  selected={isSelected}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.contrastText',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: isSelected ? 'inherit' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isSelected ? 600 : 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
        {category && <Divider sx={{ my: 1 }} />}
      </Box>
    );
  };

  // Group items by category
  const mainItems = menuItems.filter(item => !item.category);
  const categories = [
    ...new Set(menuItems.filter(item => item.category).map(item => item.category)),
  ];

  return (
    <Drawer
      variant='permanent'
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Box sx={{ p: 2, pt: 10 }}>
        {/* Main Navigation Items */}
        {renderMenuSection(undefined, mainItems)}

        {/* Categorized Items */}
        {categories.map(category => renderMenuSection(category, menuItems))}
      </Box>
    </Drawer>
  );
};

export default Sidebar;
