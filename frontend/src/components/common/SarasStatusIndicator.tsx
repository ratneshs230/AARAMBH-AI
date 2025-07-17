import React from 'react';
import {
  Box,
  Chip,
  Tooltip,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Psychology as SarasIcon,
  Refresh as RefreshIcon,
  SignalWifiOff as OfflineIcon,
  CheckCircle as OnlineIcon,
} from '@mui/icons-material';
import { useSaras } from '@/contexts/SarasContext';

interface SarasStatusIndicatorProps {
  variant?: 'chip' | 'full' | 'icon';
  showLabel?: boolean;
  showLastChecked?: boolean;
}

const SarasStatusIndicator: React.FC<SarasStatusIndicatorProps> = ({
  variant = 'chip',
  showLabel = true,
  showLastChecked = false,
}) => {
  const { isOnline, isChecking, lastChecked, error, checkStatus } = useSaras();

  const getStatusColor = () => {
    if (isChecking) return 'info';
    return isOnline ? 'success' : 'error';
  };

  const getStatusText = () => {
    if (isChecking) return 'Checking...';
    return isOnline ? 'SARAS Online' : 'SARAS Offline';
  };

  const getStatusIcon = () => {
    if (isChecking) return <CircularProgress size={16} />;
    return isOnline ? <OnlineIcon /> : <OfflineIcon />;
  };

  const getTooltipContent = () => {
    const status = isOnline ? 'Online' : 'Offline';
    const lastCheckedText = lastChecked 
      ? `Last checked: ${lastChecked.toLocaleTimeString()}`
      : 'Never checked';
    
    return (
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          SARAS AI Teacher: {status}
        </Typography>
        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
            {error}
          </Typography>
        )}
        {showLastChecked && (
          <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
            {lastCheckedText}
          </Typography>
        )}
        <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
          Click to refresh status
        </Typography>
      </Box>
    );
  };

  if (variant === 'icon') {
    return (
      <Tooltip title={getTooltipContent()}>
        <IconButton 
          onClick={checkStatus} 
          disabled={isChecking}
          size="small"
          sx={{
            color: isOnline ? 'success.main' : 'error.main',
            '&:hover': {
              backgroundColor: isOnline ? 'success.light' : 'error.light',
              opacity: 0.1,
            },
          }}
        >
          {getStatusIcon()}
        </IconButton>
      </Tooltip>
    );
  }

  if (variant === 'full') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1,
          borderRadius: 1,
          backgroundColor: isOnline ? 'success.light' : 'error.light',
          border: 1,
          borderColor: isOnline ? 'success.main' : 'error.main',
          opacity: 0.1,
        }}
      >
        <SarasIcon 
          sx={{ 
            color: isOnline ? 'success.main' : 'error.main',
            fontSize: 20,
          }} 
        />
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            SARAS AI Teacher
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: isOnline ? 'success.main' : 'error.main',
              fontWeight: 500,
            }}
          >
            {getStatusText()}
          </Typography>
        </Box>
        <IconButton 
          onClick={checkStatus} 
          disabled={isChecking}
          size="small"
        >
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  }

  // Default chip variant
  return (
    <Tooltip title={getTooltipContent()}>
      <Chip
        icon={<SarasIcon />}
        label={showLabel ? getStatusText() : ''}
        color={getStatusColor()}
        variant={isOnline ? 'filled' : 'outlined'}
        size="small"
        onClick={checkStatus}
        disabled={isChecking}
        sx={{
          cursor: 'pointer',
          '& .MuiChip-icon': {
            color: 'inherit',
          },
          '&:hover': {
            opacity: 0.8,
          },
        }}
      />
    </Tooltip>
  );
};

export default SarasStatusIndicator;