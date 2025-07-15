import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SecurityConfig {
  enableEncryption: boolean;
  enableTokenValidation: boolean;
  enableRequestSigning: boolean;
  enableCertificatePinning: boolean;
  sessionTimeout: number; // in milliseconds
  maxFailedAttempts: number;
  lockoutDuration: number; // in milliseconds
}

export interface SecurityToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  type: 'Bearer';
  scope: string[];
}

export interface SecurityEvent {
  id: string;
  type: 'LOGIN' | 'LOGOUT' | 'FAILED_LOGIN' | 'TOKEN_REFRESH' | 'SECURITY_VIOLATION' | 'DATA_ACCESS';
  timestamp: number;
  userId?: string;
  deviceId: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

class SecurityService {
  private static instance: SecurityService;
  private config: SecurityConfig;
  private deviceId: string;
  private securityEvents: SecurityEvent[] = [];
  private failedAttempts: number = 0;
  private lockoutUntil: number = 0;
  private sessionTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.config = {
      enableEncryption: true,
      enableTokenValidation: true,
      enableRequestSigning: true,
      enableCertificatePinning: true,
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      maxFailedAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 minutes
    };
    
    this.deviceId = this.generateDeviceId();
    this.initialize();
  }

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  private async initialize() {
    // Load failed attempts and lockout status
    const failedAttempts = await AsyncStorage.getItem('security_failed_attempts');
    const lockoutUntil = await AsyncStorage.getItem('security_lockout_until');
    
    if (failedAttempts) {
      this.failedAttempts = parseInt(failedAttempts, 10);
    }
    
    if (lockoutUntil) {
      this.lockoutUntil = parseInt(lockoutUntil, 10);
    }
    
    // Load security events
    const events = await AsyncStorage.getItem('security_events');
    if (events) {
      this.securityEvents = JSON.parse(events);
    }
  }

  private generateDeviceId(): string {
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Token Management
  async storeToken(token: SecurityToken): Promise<void> {
    try {
      if (this.config.enableEncryption) {
        await SecureStore.setItemAsync('security_token', JSON.stringify(token));
      } else {
        await AsyncStorage.setItem('security_token', JSON.stringify(token));
      }
      
      this.logSecurityEvent('TOKEN_REFRESH', { tokenType: token.type });
      this.startSessionTimer();
    } catch (error) {
      console.error('Failed to store token:', error);
      throw new Error('Failed to store authentication token');
    }
  }

  async getToken(): Promise<SecurityToken | null> {
    try {
      let tokenData: string | null;
      
      if (this.config.enableEncryption) {
        tokenData = await SecureStore.getItemAsync('security_token');
      } else {
        tokenData = await AsyncStorage.getItem('security_token');
      }
      
      if (!tokenData) {
        return null;
      }
      
      const token: SecurityToken = JSON.parse(tokenData);
      
      // Check if token is expired
      if (this.isTokenExpired(token)) {
        await this.removeToken();
        return null;
      }
      
      return token;
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  }

  async removeToken(): Promise<void> {
    try {
      if (this.config.enableEncryption) {
        await SecureStore.deleteItemAsync('security_token');
      } else {
        await AsyncStorage.removeItem('security_token');
      }
      
      this.logSecurityEvent('LOGOUT');
      this.stopSessionTimer();
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  }

  private isTokenExpired(token: SecurityToken): boolean {
    return Date.now() >= token.expiresAt;
  }

  // Session Management
  private startSessionTimer() {
    this.stopSessionTimer();
    
    this.sessionTimer = setTimeout(() => {
      this.logSecurityEvent('SECURITY_VIOLATION', { 
        reason: 'Session timeout',
        timeout: this.config.sessionTimeout 
      });
      this.removeToken();
    }, this.config.sessionTimeout);
  }

  private stopSessionTimer() {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  extendSession() {
    this.startSessionTimer();
  }

  // Authentication Security
  async recordLoginAttempt(success: boolean, userId?: string): Promise<void> {
    if (success) {
      this.failedAttempts = 0;
      await AsyncStorage.removeItem('security_failed_attempts');
      await AsyncStorage.removeItem('security_lockout_until');
      
      this.logSecurityEvent('LOGIN', { userId });
    } else {
      this.failedAttempts++;
      await AsyncStorage.setItem('security_failed_attempts', this.failedAttempts.toString());
      
      if (this.failedAttempts >= this.config.maxFailedAttempts) {
        this.lockoutUntil = Date.now() + this.config.lockoutDuration;
        await AsyncStorage.setItem('security_lockout_until', this.lockoutUntil.toString());
        
        this.logSecurityEvent('SECURITY_VIOLATION', { 
          reason: 'Max failed attempts reached',
          attempts: this.failedAttempts,
          lockoutUntil: this.lockoutUntil
        });
      }
      
      this.logSecurityEvent('FAILED_LOGIN', { 
        attempts: this.failedAttempts,
        userId 
      });
    }
  }

  isAccountLocked(): boolean {
    return Date.now() < this.lockoutUntil;
  }

  getLockoutTimeRemaining(): number {
    if (!this.isAccountLocked()) {
      return 0;
    }
    return this.lockoutUntil - Date.now();
  }

  // Data Encryption
  async encryptData(data: string): Promise<string> {
    if (!this.config.enableEncryption) {
      return data;
    }
    
    try {
      const key = await this.getEncryptionKey();
      const encrypted = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        data + key
      );
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  async decryptData(encryptedData: string): Promise<string> {
    if (!this.config.enableEncryption) {
      return encryptedData;
    }
    
    try {
      // In a real implementation, you would use proper symmetric encryption
      // This is a simplified example
      return encryptedData;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  private async getEncryptionKey(): Promise<string> {
    let key = await SecureStore.getItemAsync('encryption_key');
    
    if (!key) {
      key = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${this.deviceId}_${Date.now()}`
      );
      await SecureStore.setItemAsync('encryption_key', key);
    }
    
    return key;
  }

  // Request Signing
  async signRequest(
    method: string,
    url: string,
    body?: string,
    timestamp?: number
  ): Promise<string> {
    if (!this.config.enableRequestSigning) {
      return '';
    }
    
    const ts = timestamp || Date.now();
    const token = await this.getToken();
    
    if (!token) {
      throw new Error('No authentication token available for signing');
    }
    
    const stringToSign = `${method.toUpperCase()}\n${url}\n${body || ''}\n${ts}`;
    const signature = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      stringToSign + token.accessToken
    );
    
    return signature;
  }

  async verifyRequestSignature(
    method: string,
    url: string,
    body: string,
    timestamp: number,
    signature: string
  ): Promise<boolean> {
    if (!this.config.enableRequestSigning) {
      return true;
    }
    
    try {
      const expectedSignature = await this.signRequest(method, url, body, timestamp);
      return signature === expectedSignature;
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  // Security Events Logging
  private logSecurityEvent(
    type: SecurityEvent['type'],
    metadata?: Record<string, any>
  ) {
    const event: SecurityEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: Date.now(),
      deviceId: this.deviceId,
      metadata,
    };
    
    this.securityEvents.push(event);
    
    // Keep only last 100 events
    if (this.securityEvents.length > 100) {
      this.securityEvents.shift();
    }
    
    // Save to storage
    AsyncStorage.setItem('security_events', JSON.stringify(this.securityEvents));
  }

  getSecurityEvents(): SecurityEvent[] {
    return [...this.securityEvents];
  }

  // Data Access Control
  async recordDataAccess(
    resourceType: string,
    resourceId: string,
    action: string,
    userId?: string
  ): Promise<void> {
    this.logSecurityEvent('DATA_ACCESS', {
      resourceType,
      resourceId,
      action,
      userId,
    });
  }

  // Security Validation
  async validateSecurityContext(): Promise<boolean> {
    try {
      // Check if account is locked
      if (this.isAccountLocked()) {
        return false;
      }
      
      // Check token validity
      const token = await this.getToken();
      if (!token) {
        return false;
      }
      
      // Check if token is expired
      if (this.isTokenExpired(token)) {
        await this.removeToken();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Security validation failed:', error);
      return false;
    }
  }

  // Security Headers
  getSecurityHeaders(): Record<string, string> {
    return {
      'X-Device-ID': this.deviceId,
      'X-Platform': Platform.OS,
      'X-App-Version': '1.0.0', // Should be read from app config
      'X-Security-Version': '1.0.0',
    };
  }

  // Certificate Pinning (placeholder)
  async validateCertificate(domain: string): Promise<boolean> {
    if (!this.config.enableCertificatePinning) {
      return true;
    }
    
    // In a real implementation, you would validate SSL certificates
    // This is a placeholder for certificate pinning logic
    return true;
  }

  // Security Configuration
  updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): SecurityConfig {
    return { ...this.config };
  }

  // Security Report
  getSecurityReport(): {
    deviceId: string;
    failedAttempts: number;
    isLocked: boolean;
    lockoutTimeRemaining: number;
    eventCount: number;
    lastActivity: number;
    configStatus: SecurityConfig;
  } {
    return {
      deviceId: this.deviceId,
      failedAttempts: this.failedAttempts,
      isLocked: this.isAccountLocked(),
      lockoutTimeRemaining: this.getLockoutTimeRemaining(),
      eventCount: this.securityEvents.length,
      lastActivity: this.securityEvents.length > 0 
        ? this.securityEvents[this.securityEvents.length - 1].timestamp 
        : 0,
      configStatus: this.getConfig(),
    };
  }

  // Clear security data
  async clearSecurityData(): Promise<void> {
    try {
      await this.removeToken();
      await SecureStore.deleteItemAsync('encryption_key');
      await AsyncStorage.removeItem('security_failed_attempts');
      await AsyncStorage.removeItem('security_lockout_until');
      await AsyncStorage.removeItem('security_events');
      
      this.failedAttempts = 0;
      this.lockoutUntil = 0;
      this.securityEvents = [];
      
      this.logSecurityEvent('SECURITY_VIOLATION', { 
        reason: 'Security data cleared' 
      });
    } catch (error) {
      console.error('Failed to clear security data:', error);
    }
  }

  // Cleanup
  destroy(): void {
    this.stopSessionTimer();
  }
}

// Export singleton instance
export const securityService = SecurityService.getInstance();
export default securityService;