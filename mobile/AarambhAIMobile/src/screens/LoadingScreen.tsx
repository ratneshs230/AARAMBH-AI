import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES } from '../constants';

const LoadingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary[600]} />
      <Text style={styles.loadingText}>Loading AARAMBH AI...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.light,
  },
  loadingText: {
    marginTop: 16,
    fontSize: FONT_SIZES.lg,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
});

export default LoadingScreen;