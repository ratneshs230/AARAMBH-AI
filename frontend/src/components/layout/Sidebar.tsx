import React, { useState } from 'react';
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
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  School as CoursesIcon,
  Psychology as AIIcon,
  Quiz as AssessmentIcon,
  Analytics as AnalyticsIcon,
  EventNote as PlannerIcon,
  Explore as CuriosityIcon,
  People as CommunityIcon,
  SportsEsports as GamesIcon,
  Dashboard as DashboardIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import { ROUTES } from '@/utils/constants';

const drawerWidth = 260;
const collapsedWidth = 64;

interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  category?: string;
}

const menuItems: MenuItem[] = [
  { text: 'Courses', icon: <DashboardIcon />, path: ROUTES.DASHBOARD },
  { text: 'AI Tutor', icon: <AIIcon />, path: ROUTES.AI_TUTOR },
  { text: 'Curiosity Platform', icon: <CuriosityIcon />, path: ROUTES.CURIOSITY },
  { text: 'Study Planner', icon: <PlannerIcon />, path: ROUTES.STUDY_PLANNER },
  { text: 'Assessments', icon: <AssessmentIcon />, path: ROUTES.ASSESSMENTS },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: ROUTES.ANALYTICS },
  { text: 'Community', icon: <CommunityIcon />, path: ROUTES.COMMUNITY },
  { text: 'Create Games', icon: <GamesIcon />, path: ROUTES.GAMES },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const renderMenuItem = (item: MenuItem) => {
    const isSelected = location.pathname === item.path;

    const menuButton = (
      <ListItemButton
        onClick={() => handleNavigation(item.path)}
        selected={isSelected}
        sx={{
          borderRadius: 2,
          mb: 0.5,
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          px: isCollapsed ? 1 : 2,
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
            minWidth: isCollapsed ? 'auto' : 36,
            color: isSelected ? 'inherit' : 'text.secondary',
            justifyContent: 'center',
          }}
        >
          {item.icon}
        </ListItemIcon>
        {!isCollapsed && (
          <ListItemText
            primary={item.text}
            primaryTypographyProps={{
              fontSize: '0.875rem',
              fontWeight: isSelected ? 600 : 500,
            }}
          />
        )}
      </ListItemButton>
    );

    if (isCollapsed) {
      return (
        <Tooltip key={item.text} title={item.text} placement="right">
          <ListItem disablePadding sx={{ px: 1 }}>
            {menuButton}
          </ListItem>
        </Tooltip>
      );
    }

    return (
      <ListItem key={item.text} disablePadding sx={{ px: 1 }}>
        {menuButton}
      </ListItem>
    );
  };

  return (
    <Drawer
      variant='permanent'
      sx={{
        width: isCollapsed ? collapsedWidth : drawerWidth,
        flexShrink: 0,
        transition: 'width 0.3s ease-in-out',
        '& .MuiDrawer-paper': {
          width: isCollapsed ? collapsedWidth : drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          transition: 'width 0.3s ease-in-out',
          overflowX: 'hidden',
        },
      }}
    >
      {/* Toggle Button */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: isCollapsed ? 'center' : 'flex-end',
          p: 1,
          pt: 9,
          pb: 1
        }}
      >
        <IconButton onClick={onToggle} size="small">
          {isCollapsed ? <MenuIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>

      <Box sx={{ px: isCollapsed ? 0.5 : 2, pb: 2 }}>
        <List sx={{ py: 0 }}>
          {menuItems.map(renderMenuItem)}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
export { drawerWidth, collapsedWidth };
