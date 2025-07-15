import { securityService, SecurityToken } from './security';
import { storageService } from './storage';
import { networkService } from './network';

export interface AuthCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResult {
  success: boolean;
  token?: SecurityToken;
  user?: any;
  error?: string;
  requiresVerification?: boolean;
  lockoutTimeRemaining?: number;
}

export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  forbiddenPatterns: string[];
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  sessionTimeout: number;
  passwordPolicy: PasswordRequirements;
  deviceTrustEnabled: boolean;
  loginNotificationsEnabled: boolean;
}

class AuthSecurityService {
  private static instance: AuthSecurityService;
  private currentUser: any = null;
  private securitySettings: SecuritySettings;
  private deviceTrusted: boolean = false;

  constructor() {
    this.securitySettings = {
      twoFactorEnabled: false,
      biometricEnabled: false,
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        forbiddenPatterns: ['password', '123456', 'qwerty', 'admin'],
      },
      deviceTrustEnabled: true,
      loginNotificationsEnabled: true,
    };
    
    this.initialize();
  }

  static getInstance(): AuthSecurityService {
    if (!AuthSecurityService.instance) {
      AuthSecurityService.instance = new AuthSecurityService();
    }
    return AuthSecurityService.instance;
  }

  private async initialize() {
    // Load security settings
    const settings = await storageService.getItem('security_settings');
    if (settings) {
      this.securitySettings = { ...this.securitySettings, ...settings };
    }

    // Check device trust status
    const deviceTrustStatus = await storageService.getItem('device_trusted');
    this.deviceTrusted = deviceTrustStatus === 'true';

    // Load current user if token exists
    const token = await securityService.getToken();
    if (token) {
      const user = await storageService.getItem('current_user');
      if (user) {
        this.currentUser = user;
      }
    }
  }

  // Password Security
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const { passwordPolicy } = this.securitySettings;

    // Check minimum length
    if (password.length < passwordPolicy.minLength) {
      errors.push(`Password must be at least ${passwordPolicy.minLength} characters long`);
    }

    // Check for uppercase letters
    if (passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    // Check for lowercase letters
    if (passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    // Check for numbers
    if (passwordPolicy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    // Check for special characters
    if (passwordPolicy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for forbidden patterns
    const lowercasePassword = password.toLowerCase();
    for (const pattern of passwordPolicy.forbiddenPatterns) {
      if (lowercasePassword.includes(pattern)) {
        errors.push(`Password cannot contain "${pattern}"`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  generateSecurePassword(length: number = 12): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*(),.?":{}|<>';
    
    let password = '';
    let charSet = '';
    
    // Ensure at least one character from each required set
    if (this.securitySettings.passwordPolicy.requireUppercase) {
      password += uppercase[Math.floor(Math.random() * uppercase.length)];
      charSet += uppercase;
    }
    
    if (this.securitySettings.passwordPolicy.requireLowercase) {
      password += lowercase[Math.floor(Math.random() * lowercase.length)];
      charSet += lowercase;
    }
    
    if (this.securitySettings.passwordPolicy.requireNumbers) {
      password += numbers[Math.floor(Math.random() * numbers.length)];
      charSet += numbers;
    }
    
    if (this.securitySettings.passwordPolicy.requireSpecialChars) {
      password += specialChars[Math.floor(Math.random() * specialChars.length)];
      charSet += specialChars;
    }
    
    // Fill remaining characters
    for (let i = password.length; i < length; i++) {
      password += charSet[Math.floor(Math.random() * charSet.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  // Authentication
  async login(credentials: AuthCredentials): Promise<AuthResult> {
    try {
      // Check if account is locked
      if (securityService.isAccountLocked()) {
        return {
          success: false,
          error: 'Account is temporarily locked due to too many failed attempts',
          lockoutTimeRemaining: securityService.getLockoutTimeRemaining(),
        };
      }

      // Validate credentials format
      if (!this.validateEmail(credentials.email)) {
        return {
          success: false,
          error: 'Invalid email format',
        };
      }

      if (!credentials.password) {
        return {
          success: false,
          error: 'Password is required',
        };
      }

      // Check network connectivity
      if (!networkService.isConnected()) {
        return {
          success: false,
          error: 'Network connection required for authentication',
        };
      }

      // Prepare secure request
      const loginData = {
        email: credentials.email,
        password: await securityService.encryptData(credentials.password),
        deviceId: securityService.getSecurityHeaders()['X-Device-ID'],
        deviceTrusted: this.deviceTrusted,
        timestamp: Date.now(),
      };

      // Make authentication request
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...securityService.getSecurityHeaders(),
        },
        body: JSON.stringify(loginData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Store token securely
        const token: SecurityToken = {
          accessToken: result.token.accessToken,
          refreshToken: result.token.refreshToken,
          expiresAt: Date.now() + (result.token.expiresIn * 1000),
          type: 'Bearer',
          scope: result.token.scope || [],
        };

        await securityService.storeToken(token);
        await storageService.setItem('current_user', result.user);
        
        this.currentUser = result.user;

        // Record successful login
        await securityService.recordLoginAttempt(true, result.user.id);

        // Trust device if remember me is enabled
        if (credentials.rememberMe) {
          await this.trustDevice();
        }

        // Send login notification
        if (this.securitySettings.loginNotificationsEnabled) {
          await this.sendLoginNotification();
        }

        return {
          success: true,
          token,
          user: result.user,
        };
      } else {
        // Record failed login
        await securityService.recordLoginAttempt(false, credentials.email);

        return {
          success: false,
          error: result.message || 'Login failed',
          requiresVerification: result.requiresVerification,
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Record failed login
      await securityService.recordLoginAttempt(false, credentials.email);
      
      return {
        success: false,
        error: 'Login failed. Please try again.',
      };
    }
  }

  async logout(): Promise<void> {
    try {
      // Notify server of logout
      const token = await securityService.getToken();
      if (token && networkService.isConnected()) {
        await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `${token.type} ${token.accessToken}`,
            'Content-Type': 'application/json',
            ...securityService.getSecurityHeaders(),
          },
        });
      }

      // Clear local data
      await securityService.removeToken();
      await storageService.removeItem('current_user');
      
      this.currentUser = null;
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const token = await securityService.getToken();
      if (!token || !token.refreshToken) {
        return false;
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...securityService.getSecurityHeaders(),
        },
        body: JSON.stringify({
          refreshToken: token.refreshToken,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const newToken: SecurityToken = {
          accessToken: result.token.accessToken,
          refreshToken: result.token.refreshToken,
          expiresAt: Date.now() + (result.token.expiresIn * 1000),
          type: 'Bearer',
          scope: result.token.scope || [],
        };

        await securityService.storeToken(newToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  // Device Trust Management
  async trustDevice(): Promise<void> {
    this.deviceTrusted = true;
    await storageService.setItem('device_trusted', 'true');
  }

  async untrustDevice(): Promise<void> {
    this.deviceTrusted = false;
    await storageService.removeItem('device_trusted');
  }

  isDeviceTrusted(): boolean {
    return this.deviceTrusted;
  }

  // Two-Factor Authentication
  async enableTwoFactor(): Promise<{ success: boolean; qrCode?: string; backupCodes?: string[] }> {
    try {
      const token = await securityService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/2fa/enable`, {
        method: 'POST',
        headers: {
          'Authorization': `${token.type} ${token.accessToken}`,
          'Content-Type': 'application/json',
          ...securityService.getSecurityHeaders(),
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        this.securitySettings.twoFactorEnabled = true;
        await this.saveSecuritySettings();
        
        return {
          success: true,
          qrCode: result.qrCode,
          backupCodes: result.backupCodes,
        };
      }

      return { success: false };
    } catch (error) {
      console.error('2FA enable error:', error);
      return { success: false };
    }
  }

  async disableTwoFactor(): Promise<boolean> {
    try {
      const token = await securityService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/2fa/disable`, {
        method: 'POST',
        headers: {
          'Authorization': `${token.type} ${token.accessToken}`,
          'Content-Type': 'application/json',
          ...securityService.getSecurityHeaders(),
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        this.securitySettings.twoFactorEnabled = false;
        await this.saveSecuritySettings();
        return true;
      }

      return false;
    } catch (error) {
      console.error('2FA disable error:', error);
      return false;
    }
  }

  async verifyTwoFactor(code: string): Promise<boolean> {
    try {
      const token = await securityService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/2fa/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `${token.type} ${token.accessToken}`,
          'Content-Type': 'application/json',
          ...securityService.getSecurityHeaders(),
        },
        body: JSON.stringify({ code }),
      });

      const result = await response.json();
      return response.ok && result.success;
    } catch (error) {
      console.error('2FA verify error:', error);
      return false;
    }
  }

  // Utility Functions
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private async sendLoginNotification(): Promise<void> {
    try {
      const token = await securityService.getToken();
      if (!token) return;

      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/login-notification`, {
        method: 'POST',
        headers: {
          'Authorization': `${token.type} ${token.accessToken}`,
          'Content-Type': 'application/json',
          ...securityService.getSecurityHeaders(),
        },
      });
    } catch (error) {
      console.error('Login notification error:', error);
    }
  }

  private async saveSecuritySettings(): Promise<void> {
    await storageService.setItem('security_settings', this.securitySettings);
  }

  // Getters
  getCurrentUser(): any {
    return this.currentUser;
  }

  getSecuritySettings(): SecuritySettings {
    return { ...this.securitySettings };
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await securityService.getToken();
    return token !== null && this.currentUser !== null;
  }

  // Security Settings Management
  async updateSecuritySettings(settings: Partial<SecuritySettings>): Promise<void> {
    this.securitySettings = { ...this.securitySettings, ...settings };
    await this.saveSecuritySettings();
  }

  async updatePasswordPolicy(policy: Partial<PasswordRequirements>): Promise<void> {
    this.securitySettings.passwordPolicy = { 
      ...this.securitySettings.passwordPolicy, 
      ...policy 
    };
    await this.saveSecuritySettings();
  }

  // Security Audit
  async getSecurityAudit(): Promise<{
    authStatus: boolean;
    deviceTrusted: boolean;
    twoFactorEnabled: boolean;
    biometricEnabled: boolean;
    securityEvents: any[];
    recommendations: string[];
  }> {
    const securityEvents = securityService.getSecurityEvents();
    const recommendations: string[] = [];

    // Generate security recommendations
    if (!this.securitySettings.twoFactorEnabled) {
      recommendations.push('Enable two-factor authentication for enhanced security');
    }

    if (!this.securitySettings.biometricEnabled) {
      recommendations.push('Enable biometric authentication for convenient and secure access');
    }

    if (!this.deviceTrusted) {
      recommendations.push('Consider trusting this device to reduce authentication prompts');
    }

    const failedLoginAttempts = securityEvents.filter(e => e.type === 'FAILED_LOGIN').length;
    if (failedLoginAttempts > 3) {
      recommendations.push('Multiple failed login attempts detected. Consider changing your password');
    }

    return {
      authStatus: await this.isAuthenticated(),
      deviceTrusted: this.deviceTrusted,
      twoFactorEnabled: this.securitySettings.twoFactorEnabled,
      biometricEnabled: this.securitySettings.biometricEnabled,
      securityEvents: securityEvents.slice(-10), // Last 10 events
      recommendations,
    };
  }

  // Cleanup
  destroy(): void {
    this.currentUser = null;
    securityService.destroy();
  }
}

// Export singleton instance
export const authSecurityService = AuthSecurityService.getInstance();
export default authSecurityService;