import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AIHomeScreen from '../screens/ai/AIHomeScreen';
import AITutorScreen from '../screens/ai/AITutorScreen';
import AIContentScreen from '../screens/ai/AIContentScreen';
import AIAssessmentScreen from '../screens/ai/AIAssessmentScreen';
import AIDoubtScreen from '../screens/ai/AIDoubtScreen';
import AIPlannerScreen from '../screens/ai/AIPlannerScreen';
import AIMentorScreen from '../screens/ai/AIMentorScreen';
import AIAnalyticsScreen from '../screens/ai/AIAnalyticsScreen';
import { COLORS } from '../constants';
import type { AIStackParamList } from '../types';

const Stack = createStackNavigator<AIStackParamList>();

const AINavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="AIHome"
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary[600],
          elevation: 4,
          shadowColor: COLORS.grey[900],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
        headerTintColor: COLORS.background.light,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      <Stack.Screen 
        name="AIHome" 
        component={AIHomeScreen}
        options={{
          title: 'AI Assistants',
          headerLeft: () => null,
        }}
      />
      <Stack.Screen 
        name="AITutor" 
        component={AITutorScreen}
        options={{
          title: 'AI Tutor',
        }}
      />
      <Stack.Screen 
        name="AIContent" 
        component={AIContentScreen}
        options={{
          title: 'Content Creator',
        }}
      />
      <Stack.Screen 
        name="AIAssessment" 
        component={AIAssessmentScreen}
        options={{
          title: 'Assessment Generator',
        }}
      />
      <Stack.Screen 
        name="AIDoubt" 
        component={AIDoubtScreen}
        options={{
          title: 'Doubt Solver',
        }}
      />
      <Stack.Screen 
        name="AIPlanner" 
        component={AIPlannerScreen}
        options={{
          title: 'Study Planner',
        }}
      />
      <Stack.Screen 
        name="AIMentor" 
        component={AIMentorScreen}
        options={{
          title: 'Career Mentor',
        }}
      />
      <Stack.Screen 
        name="AIAnalytics" 
        component={AIAnalyticsScreen}
        options={{
          title: 'Learning Analytics',
        }}
      />
    </Stack.Navigator>
  );
};

export default AINavigator;