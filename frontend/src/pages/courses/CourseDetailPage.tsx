import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Paper,
} from '@mui/material';

const CourseDetailPage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
            Course Details
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Course details will be implemented here. This page shows detailed information about a specific course.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CourseDetailPage;