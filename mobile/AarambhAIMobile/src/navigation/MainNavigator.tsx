import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import DashboardNavigator from './DashboardNavigator';
import AINavigator from './AINavigator';
import CoursesNavigator from './CoursesNavigator';
import ProfileNavigator from './ProfileNavigator';
import { COLORS, DIMENSIONS } from '../constants';
import type { MainTabParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;
          let IconComponent = Ionicons;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'AI':
              iconName = focused ? 'brain' : 'brain-outline';
              IconComponent = MaterialIcons;
              iconName = focused ? 'psychology' : 'psychology';
              break;
            case 'Courses':
              iconName = focused ? 'library' : 'library-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <IconComponent name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary[600],
        tabBarInactiveTintColor: COLORS.grey[500],
        tabBarStyle: {
          height: DIMENSIONS.TAB_BAR_HEIGHT,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          backgroundColor: COLORS.background.light,
          borderTopWidth: 1,
          borderTopColor: COLORS.grey[200],
          elevation: 8,
          shadowColor: COLORS.grey[900],
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 4,
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardNavigator}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="AI" 
        component={AINavigator}
        options={{
          tabBarLabel: 'AI Tutor',
        }}
      />
      <Tab.Screen 
        name="Courses" 
        component={CoursesNavigator}
        options={{
          tabBarLabel: 'Courses',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;