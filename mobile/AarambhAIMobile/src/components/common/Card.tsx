import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { COLORS, DIMENSIONS } from '../../constants';

interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: number;
  margin?: number;
  borderRadius?: number;
  touchable?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 16,
  margin = 0,
  borderRadius = DIMENSIONS.BORDER_RADIUS,
  touchable = false,
  ...props
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: COLORS.background.light,
      borderRadius,
      padding,
      margin,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          elevation: 4,
          shadowColor: COLORS.grey[900],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        };
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: COLORS.grey[200],
        };
      default:
        return {
          ...baseStyle,
          elevation: 2,
          shadowColor: COLORS.grey[900],
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        };
    }
  };

  const finalStyle = [getCardStyle(), style];

  if (touchable) {
    return (
      <TouchableOpacity
        style={finalStyle}
        activeOpacity={0.8}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={finalStyle}>{children}</View>;
};

export default Card;