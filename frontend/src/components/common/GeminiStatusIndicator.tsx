import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  Tooltip,
  Typography,
  IconButton,
  CircularProgress,
  Paper,
  Badge,
} from '@mui/material';
import {
  AutoAwesome as GeminiIcon,
  Refresh as RefreshIcon,
  SignalWifiOff as OfflineIcon,
  CheckCircle as OnlineIcon,
  Warning as WarningIcon,
  Psychology as AIIcon,
} from '@mui/icons-material';
import geminiStatusService from '@/services/geminiStatusService';

// Define types locally to avoid import issues
type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'checking' | 'unknown';

interface HealthData {
  status: HealthStatus;
  services: {
    gemini?: boolean;
    teacherAgent?: boolean;
    imageGenerator?: boolean;
  };
  responseTime: number;
  lastChecked?: Date;
  error?: string;
  server?: string;
}

interface GeminiStatusIndicatorProps {
  variant?: 'chip' | 'full' | 'icon' | 'badge';
  showLabel?: boolean;
  showDetails?: boolean;
  autoCheck?: boolean;
  size?: 'small' | 'medium';
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

const GeminiStatusIndicator: React.FC<GeminiStatusIndicatorProps> = ({
  variant = 'chip',
  showLabel = true,
  showDetails = false,
  autoCheck = true,
  size = 'small',
  placement = 'top',
}) => {
  const [healthData, setHealthData] = useState<HealthData>(geminiStatusService.getCurrentHealth());

  useEffect(() => {
    // Subscribe to status updates
    const unsubscribe = geminiStatusService.subscribe(setHealthData);
    
    // Force initial check if autoCheck is enabled
    if (autoCheck && healthData.status === 'unknown') {
      geminiStatusService.forceCheck();
    }

    return unsubscribe;
  }, [autoCheck]);

  const handleManualCheck = () => {
    geminiStatusService.forceCheck();
  };

  const getStatusColor = (): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    switch (healthData.status) {
      case 'healthy': return 'success';
      case 'degraded': return 'warning';
      case 'unhealthy': return 'error';
      case 'checking': return 'info';
      default: return 'default';
    }
  };

  const getStatusText = () => {
    const summary = geminiStatusService.getStatusSummary();
    return summary.text;
  };

  const getStatusIcon = () => {
    const iconSize = size === 'small' ? 16 : 20;
    
    switch (healthData.status) {
      case 'healthy': 
        return <OnlineIcon sx={{ fontSize: iconSize, color: 'success.main' }} />;
      case 'degraded': 
        return <WarningIcon sx={{ fontSize: iconSize, color: 'warning.main' }} />;
      case 'unhealthy': 
        return <OfflineIcon sx={{ fontSize: iconSize, color: 'error.main' }} />;
      case 'checking': 
        return <CircularProgress size={iconSize} />;
      default: 
        return <GeminiIcon sx={{ fontSize: iconSize, color: 'action.disabled' }} />;
    }
  };

  const getTooltipContent = () => {
    return geminiStatusService.getDetailedStatus();
  };

  const getBadgeColor = () => {
    switch (healthData.status) {
      case 'healthy': return '#4caf50';
      case 'degraded': return '#ff9800';
      case 'unhealthy': return '#f44336';
      case 'checking': return '#2196f3';
      default: return '#9e9e9e';
    }
  };

  // Badge variant - small dot indicator
  if (variant === 'badge') {
    return (
      <Tooltip title={getTooltipContent()} placement={placement}>
        <Box
          sx={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            cursor: 'pointer',
          }}
          onClick={handleManualCheck}
        >
          <AIIcon sx={{ fontSize: size === 'small' ? 20 : 24, color: 'action.active' }} />
          <Box
            sx={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: getBadgeColor(),
              border: '2px solid white',
              boxShadow: 1,
            }}
          />
        </Box>
      </Tooltip>
    );
  }

  // Icon variant
  if (variant === 'icon') {
    return (
      <Tooltip title={getTooltipContent()} placement={placement}>
        <IconButton 
          size={size}
          onClick={handleManualCheck}
          sx={{
            color: getStatusColor() + '.main',
            '&:hover': {
              backgroundColor: getStatusColor() + '.light',
            }
          }}
        >
          {getStatusIcon()}
        </IconButton>
      </Tooltip>
    );
  }

  // Chip variant
  if (variant === 'chip') {
    return (
      <Tooltip title={getTooltipContent()} placement={placement}>
        <Chip
          icon={getStatusIcon()}
          label={showLabel ? getStatusText() : undefined}
          color={getStatusColor()}
          size={size}
          onClick={handleManualCheck}
          sx={{
            cursor: 'pointer',
            '& .MuiChip-icon': {
              fontSize: size === 'small' ? 16 : 20,
            },
            '&:hover': {
              boxShadow: 2,
            },
          }}
        />
      </Tooltip>
    );
  }

  // Full variant - detailed card
  return (
    <Paper 
      sx={{ 
        p: 2, 
        borderLeft: '4px solid',
        borderColor: `${getStatusColor()}.main`,
        '&:hover': {
          boxShadow: 4,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        {getStatusIcon()}
        <Typography variant="h6" sx={{ flex: 1 }}>
          Gemini AI Service
        </Typography>
        <IconButton size="small" onClick={handleManualCheck}>
          <RefreshIcon />
        </IconButton>
      </Box>
      
      <Typography 
        variant="body2" 
        color={getStatusColor() === 'error' ? 'error' : 'text.secondary'} 
        gutterBottom
        sx={{ fontWeight: 500 }}
      >
        {getStatusText()}
      </Typography>

      {showDetails && (
        <Box sx={{ mt: 2, spacing: 1 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            <strong>Response Time:</strong> {healthData.responseTime}ms
          </Typography>
          
          {healthData.lastChecked && (
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Last Checked:</strong> {healthData.lastChecked.toLocaleTimeString()}
            </Typography>
          )}

          {healthData.server && (
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Server:</strong> {healthData.server}
            </Typography>
          )}

          {/* Service Status */}
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Available Services:
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
              {Object.entries(healthData.services).map(([service, available]) => {
                if (available === undefined) return null;
                return (
                  <Chip
                    key={service}
                    label={service}
                    size="small"
                    color={available ? 'success' : 'error'}
                    variant="outlined"
                    sx={{ 
                      fontSize: '0.7rem',
                      height: 20,
                      textTransform: 'capitalize',
                    }}
                  />
                );
              })}
            </Box>
          </Box>

          {healthData.error && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              <strong>Error:</strong> {healthData.error}
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default GeminiStatusIndicator;