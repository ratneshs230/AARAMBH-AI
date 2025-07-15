import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Input, Button } from '../../components/common';
import { apiService } from '../../services/api';
import { COLORS, FONT_SIZES, DIMENSIONS } from '../../constants';

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiService.post('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      });

      if (response.success) {
        setEmailSent(true);
      } else {
        Alert.alert('Error', response.message || 'Failed to send reset email');
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to send password reset email. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login' as never);
  };

  const handleResendEmail = () => {
    setEmailSent(false);
    handleResetPassword();
  };

  if (emailSent) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.light} />
        
        <View style={styles.successContainer}>
          {/* Success Icon */}
          <View style={styles.successIconContainer}>
            <Ionicons
              name="mail-outline"
              size={64}
              color={COLORS.primary[600]}
            />
          </View>

          {/* Success Message */}
          <Text style={styles.successTitle}>Check Your Email</Text>
          <Text style={styles.successSubtitle}>
            We've sent a password reset link to:
          </Text>
          <Text style={styles.emailText}>{email}</Text>
          
          <Text style={styles.instructionsText}>
            Click the link in the email to reset your password. If you don't see the email, check your spam folder.
          </Text>

          {/* Actions */}
          <Button
            title="Resend Email"
            onPress={handleResendEmail}
            variant="outline"
            style={styles.resendButton}
            loading={isLoading}
          />

          <TouchableOpacity onPress={navigateToLogin} style={styles.backToLoginButton}>
            <Ionicons name="arrow-back" size={20} color={COLORS.primary[600]} />
            <Text style={styles.backToLoginText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.light} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={48}
              color={COLORS.primary[600]}
            />
          </View>
          
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            No worries! Enter your email address and we'll send you a link to reset your password.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            leftIcon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            required
          />

          <Button
            title="Send Reset Link"
            onPress={handleResetPassword}
            loading={isLoading}
            disabled={isLoading}
            fullWidth
            style={styles.resetButton}
          />

          {/* Back to Login */}
          <TouchableOpacity onPress={navigateToLogin} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color={COLORS.primary[600]} />
            <Text style={styles.backText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: DIMENSIONS.SCREEN_PADDING * 2,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  resetButton: {
    marginTop: 8,
    marginBottom: 32,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  backText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary[600],
    fontWeight: '600',
    marginLeft: 8,
  },
  // Success screen styles
  successContainer: {
    flex: 1,
    paddingHorizontal: DIMENSIONS.SCREEN_PADDING * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  successTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emailText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.primary[600],
    textAlign: 'center',
    marginBottom: 24,
  },
  instructionsText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  resendButton: {
    marginBottom: 24,
    alignSelf: 'stretch',
  },
  backToLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  backToLoginText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary[600],
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ForgotPasswordScreen;