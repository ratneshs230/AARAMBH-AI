import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import NotificationsScreen from '../screens/dashboard/NotificationsScreen';
import StudySessionScreen from '../screens/dashboard/StudySessionScreen';
import { COLORS } from '../constants';

type DashboardStackParamList = {
  Home: undefined;
  Notifications: undefined;
  StudySession: { sessionId?: string };
};

const Stack = createStackNavigator<DashboardStackParamList>();

const DashboardNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
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
        name="Home" 
        component={DashboardScreen}
        options={{
          title: 'AARAMBH AI',
          headerLeft: () => null,
        }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
        }}
      />
      <Stack.Screen 
        name="StudySession" 
        component={StudySessionScreen}
        options={{
          title: 'Study Session',
        }}
      />
    </Stack.Navigator>
  );
};

export default DashboardNavigator;