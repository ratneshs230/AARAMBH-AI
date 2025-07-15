import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, DIMENSIONS } from '../../constants';
import { shallowEqual } from '../../utils/performance';

interface OptimizedCardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  style?: ViewStyle;
  onPress?: () => void;
  testID?: string;
}

const OptimizedCard: React.FC<OptimizedCardProps> = React.memo(({
  children,
  variant = 'elevated',
  style,
  onPress,
  testID,
}) => {
  const cardStyle = React.useMemo(() => [
    styles.card,
    styles[variant],
    style,
  ], [variant, style]);

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.7}
        testID={testID}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} testID={testID}>
      {children}
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.variant === nextProps.variant &&
    prevProps.onPress === nextProps.onPress &&
    prevProps.testID === nextProps.testID &&
    shallowEqual(prevProps.style, nextProps.style) &&
    React.Children.count(prevProps.children) === React.Children.count(nextProps.children)
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: DIMENSIONS.BORDER_RADIUS,
    padding: 16,
    marginVertical: 4,
  },
  elevated: {
    backgroundColor: COLORS.background.light,
    elevation: 4,
    shadowColor: COLORS.grey[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  outlined: {
    backgroundColor: COLORS.background.light,
    borderWidth: 1,
    borderColor: COLORS.grey[300],
  },
  filled: {
    backgroundColor: COLORS.primary.light,
  },
});

OptimizedCard.displayName = 'OptimizedCard';

export default OptimizedCard;