import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, FONT_SIZES } from '../../constants';

interface BadgeProps {
  text: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'default',
  size = 'medium',
  style,
  textStyle,
}) => {
  const getBadgeStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      paddingVertical: getSizePadding().vertical,
      paddingHorizontal: getSizePadding().horizontal,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    };

    switch (variant) {
      case 'success':
        return {
          ...baseStyle,
          backgroundColor: COLORS.success.light,
        };
      case 'warning':
        return {
          ...baseStyle,
          backgroundColor: COLORS.warning.light,
        };
      case 'error':
        return {
          ...baseStyle,
          backgroundColor: COLORS.error.light,
        };
      case 'info':
        return {
          ...baseStyle,
          backgroundColor: COLORS.primary[100],
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: COLORS.grey[200],
        };
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: getSizeFontSize(),
      fontWeight: '600',
    };

    switch (variant) {
      case 'success':
        return {
          ...baseStyle,
          color: COLORS.success.dark,
        };
      case 'warning':
        return {
          ...baseStyle,
          color: COLORS.warning.dark,
        };
      case 'error':
        return {
          ...baseStyle,
          color: COLORS.error.dark,
        };
      case 'info':
        return {
          ...baseStyle,
          color: COLORS.primary[700],
        };
      default:
        return {
          ...baseStyle,
          color: COLORS.grey[700],
        };
    }
  };

  const getSizePadding = () => {
    switch (size) {
      case 'small':
        return { vertical: 2, horizontal: 6 };
      case 'medium':
        return { vertical: 4, horizontal: 8 };
      case 'large':
        return { vertical: 6, horizontal: 12 };
      default:
        return { vertical: 4, horizontal: 8 };
    }
  };

  const getSizeFontSize = () => {
    switch (size) {
      case 'small':
        return FONT_SIZES.xs;
      case 'medium':
        return FONT_SIZES.sm;
      case 'large':
        return FONT_SIZES.md;
      default:
        return FONT_SIZES.sm;
    }
  };

  return (
    <View style={[getBadgeStyle(), style]}>
      <Text style={[getTextStyle(), textStyle]}>{text}</Text>
    </View>
  );
};

export default Badge;