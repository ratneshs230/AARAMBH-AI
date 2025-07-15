import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, DIMENSIONS } from '../../constants';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  required?: boolean;
  secureTextEntry?: boolean;
  multiline?: boolean;
  height?: number;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  required = false,
  secureTextEntry = false,
  multiline = false,
  height,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecureText, setIsSecureText] = useState(secureTextEntry);

  const handleSecureToggle = () => {
    setIsSecureText(!isSecureText);
  };

  const getInputContainerStyle = (): ViewStyle => {
    return {
      ...styles.inputContainer,
      borderColor: error
        ? COLORS.error.main
        : isFocused
        ? COLORS.primary[600]
        : COLORS.grey[300],
      backgroundColor: isFocused ? COLORS.primary[50] : COLORS.grey[50],
      height: height || (multiline ? 100 : DIMENSIONS.INPUT_HEIGHT),
    };
  };

  const renderLabel = () => {
    if (!label) return null;

    return (
      <Text style={[styles.label, labelStyle]}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
    );
  };

  const renderLeftIcon = () => {
    if (!leftIcon) return null;

    return (
      <Ionicons
        name={leftIcon as any}
        size={20}
        color={isFocused ? COLORS.primary[600] : COLORS.grey[500]}
        style={styles.leftIcon}
      />
    );
  };

  const renderRightIcon = () => {
    if (secureTextEntry) {
      return (
        <TouchableOpacity onPress={handleSecureToggle} style={styles.rightIconButton}>
          <Ionicons
            name={isSecureText ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={COLORS.grey[500]}
          />
        </TouchableOpacity>
      );
    }

    if (!rightIcon) return null;

    return (
      <TouchableOpacity
        onPress={onRightIconPress}
        style={styles.rightIconButton}
        disabled={!onRightIconPress}
      >
        <Ionicons
          name={rightIcon as any}
          size={20}
          color={COLORS.grey[500]}
        />
      </TouchableOpacity>
    );
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <View style={styles.errorContainer}>
        <Ionicons
          name="alert-circle-outline"
          size={16}
          color={COLORS.error.main}
          style={styles.errorIcon}
        />
        <Text style={[styles.errorText, errorStyle]}>{error}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {renderLabel()}
      <View style={getInputContainerStyle()}>
        {renderLeftIcon()}
        <TextInput
          style={[
            styles.input,
            {
              textAlignVertical: multiline ? 'top' : 'center',
              paddingTop: multiline ? 12 : 0,
            },
            inputStyle,
          ]}
          placeholderTextColor={COLORS.grey[400]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isSecureText}
          multiline={multiline}
          {...props}
        />
        {renderRightIcon()}
      </View>
      {renderError()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  required: {
    color: COLORS.error.main,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: multiline ? 'flex-start' : 'center',
    borderWidth: 1,
    borderRadius: DIMENSIONS.BORDER_RADIUS,
    paddingHorizontal: 16,
  },
  leftIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    paddingVertical: 0,
  },
  rightIconButton: {
    padding: 4,
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorIcon: {
    marginRight: 4,
  },
  errorText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.error.main,
  },
});

export default Input;