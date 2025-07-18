import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Box,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import SarasStatusIndicator from '@/components/common/SarasStatusIndicator';
import GeminiStatusIndicator from '@/components/common/GeminiStatusIndicator';
import { ROUTES } from '@/utils/constants';

const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppBar
      position='sticky'
      elevation={0}
      sx={{
        zIndex: theme => theme.zIndex.drawer + 1,
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Left Side - Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            variant='h6'
            component='h1'
            onClick={() => navigate(ROUTES.HOME)}
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8,
                transform: 'scale(1.02)',
                transition: 'all 0.2s ease-in-out',
              },
            }}
          >
            AARAMBH AI
          </Typography>
        </Box>

        {/* Right Side - Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* AI Status Indicators */}
          <GeminiStatusIndicator variant="chip" size="small" />
          <SarasStatusIndicator variant="chip" />
          
          <Tooltip title='Search'>
            <IconButton color='inherit'>
              <SearchIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title='Notifications'>
            <IconButton color='inherit'>
              <Badge badgeContent={3} color='primary'>
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title='Settings'>
            <IconButton color='inherit' onClick={() => navigate(ROUTES.SETTINGS)}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title='Profile'>
            <IconButton sx={{ ml: 1 }} onClick={() => navigate(ROUTES.PROFILE)}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                }}
              >
                S
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
