import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { aiService } from '@/services/ai';
import { config } from '@/utils/config';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
  duration?: number;
}

const AIConnectionTest: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);

    const tests: TestResult[] = [
      { test: 'Configuration Check', status: 'pending', message: 'Checking AI configuration...' },
      { test: 'Health Check', status: 'pending', message: 'Testing AI service health...' },
      { test: 'Basic AI Request', status: 'pending', message: 'Testing basic AI functionality...' },
      { test: 'Tutor Agent', status: 'pending', message: 'Testing AI Tutor agent...' },
    ];

    setResults([...tests]);

    // Test 1: Configuration Check
    const configTest = async (): Promise<TestResult> => {
      const start = Date.now();
      try {
        const aiEnabled = config.enableAI;
        const aiApiUrl = config.aiApiUrl;
        
        return {
          test: 'Configuration Check',
          status: 'success',
          message: `AI Features: ${aiEnabled ? 'Enabled' : 'Disabled'}, API URL: ${aiApiUrl}`,
          data: { aiEnabled, aiApiUrl },
          duration: Date.now() - start,
        };
      } catch (error) {
        return {
          test: 'Configuration Check',
          status: 'error',
          message: `Configuration error: ${error}`,
          duration: Date.now() - start,
        };
      }
    };

    // Test 2: Health Check
    const healthTest = async (): Promise<TestResult> => {
      const start = Date.now();
      try {
        const health = await aiService.getHealth();
        return {
          test: 'Health Check',
          status: health.success ? 'success' : 'error',
          message: health.success ? 'AI service is healthy' : 'AI service health check failed',
          data: health.data,
          duration: Date.now() - start,
        };
      } catch (error: any) {
        return {
          test: 'Health Check',
          status: 'error',
          message: `Health check failed: ${error.message || error}`,
          duration: Date.now() - start,
        };
      }
    };

    // Test 3: Basic AI Request
    const basicRequestTest = async (): Promise<TestResult> => {
      const start = Date.now();
      try {
        const response = await aiService.sendRequest({
          prompt: 'Test connection - please respond with "Connection successful"',
          agentType: 'teacher',
          metadata: { test: true },
        });
        
        return {
          test: 'Basic AI Request',
          status: response.success ? 'success' : 'error',
          message: response.success ? 'Basic AI request successful' : 'Basic AI request failed',
          data: response.data,
          duration: Date.now() - start,
        };
      } catch (error: any) {
        return {
          test: 'Basic AI Request',
          status: 'error',
          message: `Basic request failed: ${error.message || error}`,
          duration: Date.now() - start,
        };
      }
    };

    // Test 4: Tutor Agent
    const tutorTest = async (): Promise<TestResult> => {
      const start = Date.now();
      try {
        const response = await aiService.askTutor('What is 2+2?', {
          subject: 'mathematics',
          level: 'basic',
        });
        
        return {
          test: 'Tutor Agent',
          status: response.success ? 'success' : 'error',
          message: response.success ? 'Tutor agent working correctly' : 'Tutor agent failed',
          data: response.data,
          duration: Date.now() - start,
        };
      } catch (error: any) {
        return {
          test: 'Tutor Agent',
          status: 'error',
          message: `Tutor test failed: ${error.message || error}`,
          duration: Date.now() - start,
        };
      }
    };

    // Run tests sequentially
    const testFunctions = [configTest, healthTest, basicRequestTest, tutorTest];
    const finalResults: TestResult[] = [];

    for (let i = 0; i < testFunctions.length; i++) {
      const result = await testFunctions[i]();
      finalResults.push(result);
      
      // Update results as each test completes
      setResults(prev => prev.map((r, index) => 
        index === i ? result : r
      ));
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <SuccessIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <CircularProgress size={20} />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getOverallStatus = () => {
    if (results.length === 0) return 'No tests run';
    if (isRunning) return 'Tests running...';
    
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    return `${successCount} passed, ${errorCount} failed`;
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={600}>
            AI Connection Test
          </Typography>
          <Button
            variant="contained"
            onClick={runTests}
            disabled={isRunning}
            startIcon={isRunning ? <CircularProgress size={20} /> : <InfoIcon />}
          >
            {isRunning ? 'Running Tests...' : 'Test AI Connection'}
          </Button>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          This test checks if the AI service is properly connected and responding. 
          It tests configuration, health, and basic functionality.
        </Alert>

        <Typography variant="h6" gutterBottom>
          Status: <Chip label={getOverallStatus()} color={isRunning ? 'default' : 'primary'} />
        </Typography>

        {results.length > 0 && (
          <List>
            {results.map((result, index) => (
              <React.Fragment key={result.test}>
                <ListItem>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    {getStatusIcon(result.status)}
                    <Box sx={{ ml: 2, flexGrow: 1 }}>
                      <ListItemText
                        primary={result.test}
                        secondary={
                          <Box component="div">
                            <Box component="span" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.875rem' }}>
                              {result.message}
                            </Box>
                            {result.duration && (
                              <Box component="span" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.75rem', mt: 0.5 }}>
                                Duration: {result.duration}ms
                              </Box>
                            )}
                            {result.data && (
                              <Box sx={{ mt: 1 }}>
                                <Box component="span" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.75rem' }}>
                                  Response: {JSON.stringify(result.data, null, 2).substring(0, 200)}
                                  {JSON.stringify(result.data, null, 2).length > 200 ? '...' : ''}
                                </Box>
                              </Box>
                            )}
                          </Box>
                        }
                      />
                    </Box>
                    <Chip
                      label={result.status.toUpperCase()}
                      color={getStatusColor(result.status) as any}
                      size="small"
                    />
                  </Box>
                </ListItem>
                {index < results.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}

        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Configuration Details:
          </Typography>
          <Box component="div" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
            <Box component="div">• AI API URL: {config.aiApiUrl}</Box>
            <Box component="div">• AI Features Enabled: {config.enableAI ? 'Yes' : 'No'}</Box>
            <Box component="div">• Environment: {process.env.NODE_ENV || 'development'}</Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AIConnectionTest;