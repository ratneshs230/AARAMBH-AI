import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  Tooltip,
  Typography,
  IconButton,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  AutoAwesome as GeminiIcon,
  Refresh as RefreshIcon,
  SignalWifiOff as OfflineIcon,
  CheckCircle as OnlineIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { geminiCuriosityAI } from '@/services/geminiCuriosityAI';

interface GeminiStatusIndicatorProps {
  variant?: 'chip' | 'full' | 'icon';
  showLabel?: boolean;
  showDetails?: boolean;
  autoCheck?: boolean;
}

type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'checking' | 'unknown';

interface HealthData {
  status: HealthStatus;
  services: any;
  responseTime: number;
  lastChecked?: Date;
  error?: string;
}

const GeminiStatusIndicator: React.FC<GeminiStatusIndicatorProps> = ({
  variant = 'chip',
  showLabel = true,
  showDetails = false,
  autoCheck = true,
}) => {
  const [healthData, setHealthData] = useState<HealthData>({
    status: 'unknown',
    services: {},
    responseTime: 0,
  });

  const checkHealth = async () => {
    setHealthData(prev => ({ ...prev, status: 'checking' }));
    
    try {
      const result = await geminiCuriosityAI.checkHealth();
      setHealthData({
        status: result.status,
        services: result.services,
        responseTime: result.responseTime,
        lastChecked: new Date(),
        error: undefined,
      });
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthData(prev => ({
        ...prev,
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date(),
      }));
    }
  };

  useEffect(() => {
    if (autoCheck) {
      checkHealth();
      
      // Check health every 5 minutes
      const interval = setInterval(checkHealth, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [autoCheck]);

  const getStatusColor = () => {
    switch (healthData.status) {
      case 'healthy': return 'success';
      case 'degraded': return 'warning';
      case 'unhealthy': return 'error';
      case 'checking': return 'info';
      default: return 'default';
    }
  };

  const getStatusText = () => {
    switch (healthData.status) {
      case 'healthy': return 'Gemini AI Ready';
      case 'degraded': return 'Limited Service';
      case 'unhealthy': return 'Service Unavailable';
      case 'checking': return 'Checking Status...';
      default: return 'Unknown Status';
    }
  };

  const getStatusIcon = () => {
    switch (healthData.status) {
      case 'healthy': return <OnlineIcon sx={{ fontSize: 16 }} />;
      case 'degraded': return <WarningIcon sx={{ fontSize: 16 }} />;
      case 'unhealthy': return <OfflineIcon sx={{ fontSize: 16 }} />;
      case 'checking': return <CircularProgress size={16} />;
      default: return <GeminiIcon sx={{ fontSize: 16 }} />;
    }
  };

  const getTooltipContent = () => {
    const lines = [
      `Status: ${healthData.status}`,
      healthData.responseTime > 0 ? `Response time: ${healthData.responseTime}ms` : '',
      healthData.lastChecked ? `Last checked: ${healthData.lastChecked.toLocaleTimeString()}` : '',
    ].filter(Boolean);

    if (healthData.services?.gemini !== undefined) {
      lines.push(`Gemini API: ${healthData.services.gemini ? 'Available' : 'Unavailable'}`);
    }

    if (healthData.error) {
      lines.push(`Error: ${healthData.error}`);
    }

    return lines.join('\n');
  };

  if (variant === 'icon') {
    return (
      <Tooltip title={getTooltipContent()}>
        <IconButton 
          size="small" 
          onClick={checkHealth}
          color={getStatusColor()}
        >
          {getStatusIcon()}
        </IconButton>
      </Tooltip>
    );
  }

  if (variant === 'chip') {
    return (
      <Tooltip title={getTooltipContent()}>
        <Chip
          icon={getStatusIcon()}
          label={showLabel ? getStatusText() : undefined}
          color={getStatusColor()}
          size="small"
          onClick={checkHealth}
          sx={{
            cursor: 'pointer',
            '& .MuiChip-icon': {
              fontSize: 16,
            },
          }}
        />
      </Tooltip>
    );
  }

  // Full variant
  return (
    <Paper 
      sx={{ 
        p: 2, 
        borderLeft: '4px solid',
        borderColor: `${getStatusColor()}.main`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        {getStatusIcon()}
        <Typography variant="h6" sx={{ flex: 1 }}>
          Gemini AI Service
        </Typography>
        <IconButton size="small" onClick={checkHealth}>
          <RefreshIcon />
        </IconButton>
      </Box>
      
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {getStatusText()}
      </Typography>

      {showDetails && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Response Time:</strong> {healthData.responseTime}ms
          </Typography>
          
          {healthData.lastChecked && (
            <Typography variant="body2">
              <strong>Last Checked:</strong> {healthData.lastChecked.toLocaleString()}
            </Typography>
          )}

          {healthData.services?.gemini !== undefined && (
            <Typography variant="body2">
              <strong>Gemini API:</strong> {healthData.services.gemini ? 'Available' : 'Unavailable'}
            </Typography>
          )}

          {healthData.error && (
            <Typography variant="body2" color="error">
              <strong>Error:</strong> {healthData.error}
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default GeminiStatusIndicator;