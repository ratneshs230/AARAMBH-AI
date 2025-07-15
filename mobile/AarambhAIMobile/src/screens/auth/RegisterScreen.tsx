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
import { useAuthContext } from '../../contexts/AuthContext';
import { Input, Button } from '../../components/common';
import { COLORS, FONT_SIZES, DIMENSIONS, EDUCATION_LEVELS } from '../../constants';

interface FormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'teacher' | 'parent';
  class?: string;
}

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const { register } = useAuthContext();
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    // Required fields validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      await register({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim().toLowerCase(),
        role: formData.role,
      });
      // Navigation will be handled by AuthContext
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (key: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login' as never);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.light} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join AARAMBH AI and start your learning journey</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Name Fields */}
          <View style={styles.row}>
            <Input
              label="First Name"
              placeholder="Enter first name"
              value={formData.firstName}
              onChangeText={(value) => updateFormData('firstName', value)}
              error={errors.firstName}
              containerStyle={styles.halfInput}
              leftIcon="person-outline"
              required
            />
            <Input
              label="Last Name"
              placeholder="Enter last name"
              value={formData.lastName}
              onChangeText={(value) => updateFormData('lastName', value)}
              error={errors.lastName}
              containerStyle={styles.halfInput}
              leftIcon="person-outline"
              required
            />
          </View>

          {/* Username */}
          <Input
            label="Username"
            placeholder="Choose a unique username"
            value={formData.username}
            onChangeText={(value) => updateFormData('username', value)}
            error={errors.username}
            leftIcon="at-outline"
            autoCapitalize="none"
            required
          />

          {/* Email */}
          <Input
            label="Email"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            error={errors.email}
            leftIcon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            required
          />

          {/* Password */}
          <Input
            label="Password"
            placeholder="Create a password"
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            error={errors.password}
            leftIcon="lock-closed-outline"
            secureTextEntry
            required
          />

          {/* Confirm Password */}
          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChangeText={(value) => updateFormData('confirmPassword', value)}
            error={errors.confirmPassword}
            leftIcon="lock-closed-outline"
            secureTextEntry
            required
          />

          {/* Role Selection */}
          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>I am a:</Text>
            <View style={styles.roleButtons}>
              {[
                { key: 'student', label: 'Student', icon: 'school-outline' },
                { key: 'teacher', label: 'Teacher', icon: 'library-outline' },
                { key: 'parent', label: 'Parent', icon: 'people-outline' },
              ].map((role) => (
                <TouchableOpacity
                  key={role.key}
                  style={[
                    styles.roleButton,
                    formData.role === role.key && styles.roleButtonSelected,
                  ]}
                  onPress={() => updateFormData('role', role.key as any)}
                >
                  <Ionicons
                    name={role.icon as any}
                    size={20}
                    color={
                      formData.role === role.key
                        ? COLORS.primary[600]
                        : COLORS.grey[500]
                    }
                  />
                  <Text
                    style={[
                      styles.roleButtonText,
                      formData.role === role.key && styles.roleButtonTextSelected,
                    ]}
                  >
                    {role.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Register Button */}
          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            fullWidth
            style={styles.registerButton}
          />

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Registration */}
          <Button
            title="Continue with Google"
            onPress={() => {}}
            variant="outline"
            icon="logo-google"
            fullWidth
            style={styles.socialButton}
          />

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
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
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  roleContainer: {
    marginBottom: 24,
  },
  roleLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grey[50],
    borderWidth: 1,
    borderColor: COLORS.grey[200],
    borderRadius: DIMENSIONS.BORDER_RADIUS,
    padding: 12,
    marginHorizontal: 4,
  },
  roleButtonSelected: {
    backgroundColor: COLORS.primary[50],
    borderColor: COLORS.primary[600],
  },
  roleButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.grey[600],
    marginLeft: 8,
    fontWeight: '600',
  },
  roleButtonTextSelected: {
    color: COLORS.primary[600],
  },
  registerButton: {
    marginBottom: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.grey[300],
  },
  dividerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginHorizontal: 16,
  },
  socialButton: {
    marginBottom: 32,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  loginText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
  },
  loginLink: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary[600],
  },
});

export default RegisterScreen;