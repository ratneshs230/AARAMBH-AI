import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import SubscriptionScreen from '../screens/profile/SubscriptionScreen';
import HelpScreen from '../screens/profile/HelpScreen';
import AboutScreen from '../screens/profile/AboutScreen';
import { COLORS } from '../constants';

type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Subscription: undefined;
  Help: undefined;
  About: undefined;
};

const Stack = createStackNavigator<ProfileStackParamList>();

const ProfileNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="ProfileHome"
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
        name="ProfileHome" 
        component={ProfileScreen}
        options={{
          title: 'Profile',
          headerLeft: () => null,
        }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{
          title: 'Edit Profile',
        }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Settings',
        }}
      />
      <Stack.Screen 
        name="Subscription" 
        component={SubscriptionScreen}
        options={{
          title: 'Subscription',
        }}
      />
      <Stack.Screen 
        name="Help" 
        component={HelpScreen}
        options={{
          title: 'Help & Support',
        }}
      />
      <Stack.Screen 
        name="About" 
        component={AboutScreen}
        options={{
          title: 'About AARAMBH AI',
        }}
      />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;