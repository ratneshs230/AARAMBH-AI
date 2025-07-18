import React from 'react';
import { Container, Typography, Box, Breadcrumbs, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AIConnectionTest from '@/components/debug/AIConnectionTest';

const AITestPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link 
            color="inherit" 
            href="#" 
            onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
          >
            Dashboard
          </Link>
          <Typography color="text.primary">AI Connection Test</Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
          AI Service Diagnostics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Use this page to test and diagnose AI service connectivity and functionality.
        </Typography>
      </Box>

      <AIConnectionTest />
    </Container>
  );
};

export default AITestPage;