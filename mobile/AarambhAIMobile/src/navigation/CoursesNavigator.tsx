import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CoursesListScreen from '../screens/courses/CoursesListScreen';
import CourseDetailScreen from '../screens/courses/CourseDetailScreen';
import LessonScreen from '../screens/courses/LessonScreen';
import QuizScreen from '../screens/courses/QuizScreen';
import { COLORS } from '../constants';

type CoursesStackParamList = {
  CoursesList: undefined;
  CourseDetail: { courseId: string };
  Lesson: { courseId: string; lessonId: string };
  Quiz: { courseId: string; quizId: string };
};

const Stack = createStackNavigator<CoursesStackParamList>();

const CoursesNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="CoursesList"
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
        name="CoursesList" 
        component={CoursesListScreen}
        options={{
          title: 'Courses',
          headerLeft: () => null,
        }}
      />
      <Stack.Screen 
        name="CourseDetail" 
        component={CourseDetailScreen}
        options={({ route }) => ({
          title: 'Course Details',
        })}
      />
      <Stack.Screen 
        name="Lesson" 
        component={LessonScreen}
        options={({ route }) => ({
          title: 'Lesson',
        })}
      />
      <Stack.Screen 
        name="Quiz" 
        component={QuizScreen}
        options={({ route }) => ({
          title: 'Quiz',
        })}
      />
    </Stack.Navigator>
  );
};

export default CoursesNavigator;