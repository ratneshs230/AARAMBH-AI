import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, DIMENSIONS } from '../../constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: DIMENSIONS.BORDER_RADIUS,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      ...getButtonSizeStyle(),
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: COLORS.primary[600],
          elevation: 4,
          shadowColor: COLORS.primary[600],
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: COLORS.secondary[600],
          elevation: 2,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: COLORS.primary[600],
        };
      case 'text':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      default:
        return baseStyle;
    }
  };

  const getButtonSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          height: 36,
          paddingHorizontal: 16,
          minWidth: fullWidth ? '100%' : 80,
        };
      case 'medium':
        return {
          height: DIMENSIONS.BUTTON_HEIGHT,
          paddingHorizontal: 20,
          minWidth: fullWidth ? '100%' : 120,
        };
      case 'large':
        return {
          height: 56,
          paddingHorizontal: 24,
          minWidth: fullWidth ? '100%' : 160,
        };
      default:
        return {};
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
      ...getTextSizeStyle(),
    };

    switch (variant) {
      case 'primary':
      case 'secondary':
        return {
          ...baseStyle,
          color: COLORS.background.light,
        };
      case 'outline':
      case 'text':
        return {
          ...baseStyle,
          color: COLORS.primary[600],
        };
      default:
        return baseStyle;
    }
  };

  const getTextSizeStyle = (): TextStyle => {
    switch (size) {
      case 'small':
        return { fontSize: FONT_SIZES.sm };
      case 'medium':
        return { fontSize: FONT_SIZES.md };
      case 'large':
        return { fontSize: FONT_SIZES.lg };
      default:
        return {};
    }
  };

  const isDisabled = disabled || loading;
  const buttonStyle = getButtonStyle();
  const finalButtonStyle: ViewStyle = {
    ...buttonStyle,
    opacity: isDisabled ? 0.6 : 1,
    width: fullWidth ? '100%' : undefined,
    ...style,
  };

  const finalTextStyle: TextStyle = {
    ...getTextStyle(),
    ...textStyle,
  };

  const renderIcon = () => {
    if (!icon) return null;

    return (
      <Ionicons
        name={icon as any}
        size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
        color={finalTextStyle.color}
        style={[
          iconPosition === 'left' ? styles.iconLeft : styles.iconRight,
        ]}
      />
    );
  };

  return (
    <TouchableOpacity
      style={finalButtonStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color={finalTextStyle.color}
            style={styles.loadingIndicator}
          />
          <Text style={finalTextStyle}>Loading...</Text>
        </View>
      ) : (
        <>
          {iconPosition === 'left' && renderIcon()}
          <Text style={finalTextStyle}>{title}</Text>
          {iconPosition === 'right' && renderIcon()}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingIndicator: {
    marginRight: 8,
  },
});

export default Button;