import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Carousel from 'react-native-reanimated-carousel';
import { COLORS, FONT_SIZES, DIMENSIONS } from '../../constants';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const onboardingData: OnboardingSlide[] = [
  {
    id: 1,
    title: 'AI-Powered Learning',
    description: 'Experience personalized education with advanced AI tutors that adapt to your learning style.',
    icon: 'school',
    color: COLORS.primary[500],
  },
  {
    id: 2,
    title: 'Smart Content Creation',
    description: 'Generate educational content, quizzes, and study materials tailored to your curriculum.',
    icon: 'create',
    color: COLORS.secondary[500],
  },
  {
    id: 3,
    title: 'Real-time Doubt Solving',
    description: 'Get instant help with your questions from our intelligent doubt-solving AI assistant.',
    icon: 'help-circle',
    color: COLORS.success.main,
  },
  {
    id: 4,
    title: 'Track Your Progress',
    description: 'Monitor your learning journey with detailed analytics and personalized insights.',
    icon: 'trending-up',
    color: COLORS.warning.main,
  },
];

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon as any} size={80} color={item.color} />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const handleGetStarted = () => {
    navigation.navigate('Login' as never);
  };

  const handleSkip = () => {
    navigation.navigate('Login' as never);
  };

  const handleNext = () => {
    if (currentSlide < onboardingData.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleGetStarted();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.light} />
      
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Carousel */}
      <View style={styles.carouselContainer}>
        <Carousel
          loop={false}
          width={width}
          height={400}
          data={onboardingData}
          scrollAnimationDuration={500}
          onSnapToItem={(index) => setCurrentSlide(index)}
          renderItem={renderSlide}
        />
      </View>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index === currentSlide ? COLORS.primary[600] : COLORS.grey[300],
                width: index === currentSlide ? 20 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* Bottom Buttons */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.getStartedButton} onPress={handleNext}>
          <Text style={styles.getStartedText}>
            {currentSlide === onboardingData.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons
            name="arrow-forward"
            size={20}
            color={COLORS.background.light}
            style={styles.buttonIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  skipText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DIMENSIONS.SCREEN_PADDING * 2,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  bottomContainer: {
    paddingHorizontal: DIMENSIONS.SCREEN_PADDING * 2,
    paddingBottom: 40,
  },
  getStartedButton: {
    backgroundColor: COLORS.primary[600],
    height: DIMENSIONS.BUTTON_HEIGHT,
    borderRadius: DIMENSIONS.BORDER_RADIUS,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: COLORS.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  getStartedText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.background.light,
  },
  buttonIcon: {
    marginLeft: 8,
  },
});

export default OnboardingScreen;