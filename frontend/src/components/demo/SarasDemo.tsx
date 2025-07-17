import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  CheckCircle as OnlineIcon,
  Cancel as OfflineIcon,
  Psychology as SarasIcon,
} from '@mui/icons-material';
import SarasStatusIndicator from '@/components/common/SarasStatusIndicator';
import { useSaras } from '@/contexts/SarasContext';

const SarasDemo: React.FC = () => {
  const { isOnline, isChecking, lastChecked, error } = useSaras();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <SarasIcon color="primary" />
        SARAS AI Teacher Demo
      </Typography>
      
      <Grid container spacing={3}>
        {/* Status Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Status
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                {isOnline ? (
                  <OnlineIcon color="success" />
                ) : (
                  <OfflineIcon color="error" />
                )}
                <Typography variant="body1">
                  SARAS is {isOnline ? 'Online' : 'Offline'}
                </Typography>
              </Box>
              
              {isChecking && (
                <Typography variant="body2" color="info.main">
                  Checking connection...
                </Typography>
              )}
              
              {lastChecked && (
                <Typography variant="body2" color="text.secondary">
                  Last checked: {lastChecked.toLocaleTimeString()}
                </Typography>
              )}
              
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Status Indicators */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Status Indicators
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Chip Variant:
                  </Typography>
                  <SarasStatusIndicator variant="chip" />
                </Box>
                
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Icon Variant:
                  </Typography>
                  <SarasStatusIndicator variant="icon" />
                </Box>
                
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Full Variant:
                  </Typography>
                  <SarasStatusIndicator variant="full" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Features */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                SARAS AI Features
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Alert severity={isOnline ? "success" : "warning"} variant="outlined">
                    <AlertTitle>AI Tutoring</AlertTitle>
                    {isOnline ? "Available" : "Offline - Using fallback responses"}
                  </Alert>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Alert severity={isOnline ? "success" : "warning"} variant="outlined">
                    <AlertTitle>Doubt Solving</AlertTitle>
                    {isOnline ? "Available" : "Offline - Using fallback responses"}
                  </Alert>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Alert severity={isOnline ? "success" : "warning"} variant="outlined">
                    <AlertTitle>Content Creation</AlertTitle>
                    {isOnline ? "Available" : "Offline - Using fallback responses"}
                  </Alert>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SarasDemo;