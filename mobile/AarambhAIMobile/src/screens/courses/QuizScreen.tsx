import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, FONT_SIZES, DIMENSIONS } from '../../constants';

const QuizScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Quiz</Text>
      <Text style={styles.subtitle}>Test your knowledge with interactive quizzes</Text>
      
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Coming soon...</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light,
  },
  content: {
    padding: DIMENSIONS.SCREEN_PADDING,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text.secondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  placeholder: {
    backgroundColor: COLORS.grey[100],
    padding: 20,
    borderRadius: DIMENSIONS.BORDER_RADIUS,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
  },
});

export default QuizScreen;