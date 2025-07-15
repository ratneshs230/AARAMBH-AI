import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { securityService } from './security';
import { storageService } from './storage';

export interface DataClassification {
  level: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  requiresEncryption: boolean;
  requiresAudit: boolean;
  retentionPeriod: number; // in days
}

export interface DataAccessLog {
  id: string;
  userId: string;
  dataType: string;
  dataId: string;
  action: 'READ' | 'WRITE' | 'DELETE' | 'EXPORT';
  timestamp: number;
  classification: DataClassification['level'];
  ipAddress?: string;
  userAgent?: string;
}

export interface PersonalDataItem {
  id: string;
  type: 'ACADEMIC' | 'PERSONAL' | 'BIOMETRIC' | 'BEHAVIORAL' | 'LOCATION';
  data: any;
  classification: DataClassification;
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
  metadata?: Record<string, any>;
}

export interface DataExportRequest {
  id: string;
  userId: string;
  requestDate: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  dataTypes: string[];
  exportFormat: 'JSON' | 'CSV' | 'PDF';
  downloadUrl?: string;
  expiresAt?: number;
}

export interface DataConsentSettings {
  analyticsConsent: boolean;
  marketingConsent: boolean;
  thirdPartyConsent: boolean;
  dataRetentionConsent: boolean;
  biometricConsent: boolean;
  locationConsent: boolean;
  consentDate: number;
  consentVersion: string;
}

class DataProtectionService {
  private static instance: DataProtectionService;
  private accessLogs: DataAccessLog[] = [];
  private personalData: Map<string, PersonalDataItem> = new Map();
  private consentSettings: DataConsentSettings;
  private dataClassifications: Map<string, DataClassification> = new Map();

  constructor() {
    this.consentSettings = {
      analyticsConsent: false,
      marketingConsent: false,
      thirdPartyConsent: false,
      dataRetentionConsent: false,
      biometricConsent: false,
      locationConsent: false,
      consentDate: Date.now(),
      consentVersion: '1.0.0',
    };

    this.initialize();
  }

  static getInstance(): DataProtectionService {
    if (!DataProtectionService.instance) {
      DataProtectionService.instance = new DataProtectionService();
    }
    return DataProtectionService.instance;
  }

  private async initialize() {
    // Initialize data classifications
    this.initializeDataClassifications();

    // Load consent settings
    const savedConsent = await storageService.getItem('data_consent_settings');
    if (savedConsent) {
      this.consentSettings = { ...this.consentSettings, ...savedConsent };
    }

    // Load access logs
    const savedLogs = await storageService.getItem('data_access_logs');
    if (savedLogs) {
      this.accessLogs = savedLogs;
    }

    // Load personal data
    const savedPersonalData = await storageService.getItem('personal_data_encrypted');
    if (savedPersonalData) {
      await this.loadPersonalData(savedPersonalData);
    }

    // Start periodic cleanup
    this.startPeriodicCleanup();
  }

  private initializeDataClassifications() {
    // Academic data
    this.dataClassifications.set('ACADEMIC', {
      level: 'CONFIDENTIAL',
      requiresEncryption: true,
      requiresAudit: true,
      retentionPeriod: 2555, // 7 years
    });

    // Personal information
    this.dataClassifications.set('PERSONAL', {
      level: 'RESTRICTED',
      requiresEncryption: true,
      requiresAudit: true,
      retentionPeriod: 2555, // 7 years
    });

    // Biometric data
    this.dataClassifications.set('BIOMETRIC', {
      level: 'RESTRICTED',
      requiresEncryption: true,
      requiresAudit: true,
      retentionPeriod: 90, // 3 months
    });

    // Behavioral data
    this.dataClassifications.set('BEHAVIORAL', {
      level: 'INTERNAL',
      requiresEncryption: true,
      requiresAudit: true,
      retentionPeriod: 365, // 1 year
    });

    // Location data
    this.dataClassifications.set('LOCATION', {
      level: 'CONFIDENTIAL',
      requiresEncryption: true,
      requiresAudit: true,
      retentionPeriod: 30, // 1 month
    });

    // Public data
    this.dataClassifications.set('PUBLIC', {
      level: 'PUBLIC',
      requiresEncryption: false,
      requiresAudit: false,
      retentionPeriod: 365, // 1 year
    });
  }

  // Data Storage and Retrieval
  async storePersonalData(
    type: PersonalDataItem['type'],
    data: any,
    metadata?: Record<string, any>
  ): Promise<string> {
    const classification = this.dataClassifications.get(type) || this.dataClassifications.get('PERSONAL')!;
    
    // Check consent
    if (!this.hasConsentForDataType(type)) {
      throw new Error(`No consent provided for ${type} data`);
    }

    const dataItem: PersonalDataItem = {
      id: `data_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data: classification.requiresEncryption ? await this.encryptData(data) : data,
      classification,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      expiresAt: Date.now() + (classification.retentionPeriod * 24 * 60 * 60 * 1000),
      metadata,
    };

    this.personalData.set(dataItem.id, dataItem);
    await this.savePersonalData();

    // Log data access
    await this.logDataAccess(dataItem.id, type, 'WRITE', classification.level);

    return dataItem.id;
  }

  async getPersonalData(dataId: string): Promise<PersonalDataItem | null> {
    const dataItem = this.personalData.get(dataId);
    if (!dataItem) {
      return null;
    }

    // Check if data has expired
    if (dataItem.expiresAt && Date.now() > dataItem.expiresAt) {
      await this.deletePersonalData(dataId);
      return null;
    }

    // Decrypt data if needed
    if (dataItem.classification.requiresEncryption) {
      const decryptedData = await this.decryptData(dataItem.data);
      dataItem.data = decryptedData;
    }

    // Log data access
    await this.logDataAccess(dataId, dataItem.type, 'READ', dataItem.classification.level);

    return dataItem;
  }

  async updatePersonalData(
    dataId: string,
    newData: any,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    const dataItem = this.personalData.get(dataId);
    if (!dataItem) {
      return false;
    }

    // Check consent
    if (!this.hasConsentForDataType(dataItem.type)) {
      throw new Error(`No consent provided for ${dataItem.type} data`);
    }

    dataItem.data = dataItem.classification.requiresEncryption 
      ? await this.encryptData(newData) 
      : newData;
    dataItem.updatedAt = Date.now();
    dataItem.metadata = { ...dataItem.metadata, ...metadata };

    await this.savePersonalData();

    // Log data access
    await this.logDataAccess(dataId, dataItem.type, 'WRITE', dataItem.classification.level);

    return true;
  }

  async deletePersonalData(dataId: string): Promise<boolean> {
    const dataItem = this.personalData.get(dataId);
    if (!dataItem) {
      return false;
    }

    // Log data access before deletion
    await this.logDataAccess(dataId, dataItem.type, 'DELETE', dataItem.classification.level);

    this.personalData.delete(dataId);
    await this.savePersonalData();

    return true;
  }

  // Data Encryption
  private async encryptData(data: any): Promise<string> {
    const jsonData = JSON.stringify(data);
    return await securityService.encryptData(jsonData);
  }

  private async decryptData(encryptedData: string): Promise<any> {
    try {
      const decryptedJson = await securityService.decryptData(encryptedData);
      return JSON.parse(decryptedJson);
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  // Data Access Logging
  private async logDataAccess(
    dataId: string,
    dataType: string,
    action: DataAccessLog['action'],
    classification: DataClassification['level']
  ): Promise<void> {
    const user = await storageService.getItem('current_user');
    
    const logEntry: DataAccessLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user?.id || 'unknown',
      dataType,
      dataId,
      action,
      timestamp: Date.now(),
      classification,
    };

    this.accessLogs.push(logEntry);

    // Keep only last 1000 logs
    if (this.accessLogs.length > 1000) {
      this.accessLogs.shift();
    }

    await storageService.setItem('data_access_logs', this.accessLogs);
  }

  // Consent Management
  async updateConsentSettings(newSettings: Partial<DataConsentSettings>): Promise<void> {
    this.consentSettings = {
      ...this.consentSettings,
      ...newSettings,
      consentDate: Date.now(),
    };

    await storageService.setItem('data_consent_settings', this.consentSettings);

    // If consent is withdrawn, delete related data
    if (newSettings.biometricConsent === false) {
      await this.deleteDataByType('BIOMETRIC');
    }
    if (newSettings.locationConsent === false) {
      await this.deleteDataByType('LOCATION');
    }
  }

  private hasConsentForDataType(type: PersonalDataItem['type']): boolean {
    switch (type) {
      case 'BIOMETRIC':
        return this.consentSettings.biometricConsent;
      case 'LOCATION':
        return this.consentSettings.locationConsent;
      case 'BEHAVIORAL':
        return this.consentSettings.analyticsConsent;
      case 'ACADEMIC':
      case 'PERSONAL':
        return this.consentSettings.dataRetentionConsent;
      default:
        return true;
    }
  }

  getConsentSettings(): DataConsentSettings {
    return { ...this.consentSettings };
  }

  // Data Export (GDPR Right to Portability)
  async requestDataExport(
    dataTypes: string[],
    exportFormat: DataExportRequest['exportFormat'] = 'JSON'
  ): Promise<string> {
    const user = await storageService.getItem('current_user');
    if (!user) {
      throw new Error('User not authenticated');
    }

    const exportRequest: DataExportRequest = {
      id: `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      requestDate: Date.now(),
      status: 'PENDING',
      dataTypes,
      exportFormat,
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
    };

    // Process export request
    await this.processDataExport(exportRequest);

    return exportRequest.id;
  }

  private async processDataExport(request: DataExportRequest): Promise<void> {
    try {
      request.status = 'PROCESSING';

      const exportData: any = {
        userId: request.userId,
        exportDate: new Date(request.requestDate).toISOString(),
        dataTypes: request.dataTypes,
        data: {},
      };

      // Collect requested data
      for (const [dataId, dataItem] of this.personalData) {
        if (request.dataTypes.includes(dataItem.type)) {
          const decryptedData = dataItem.classification.requiresEncryption
            ? await this.decryptData(dataItem.data)
            : dataItem.data;

          if (!exportData.data[dataItem.type]) {
            exportData.data[dataItem.type] = [];
          }

          exportData.data[dataItem.type].push({
            id: dataId,
            data: decryptedData,
            createdAt: new Date(dataItem.createdAt).toISOString(),
            updatedAt: new Date(dataItem.updatedAt).toISOString(),
            metadata: dataItem.metadata,
          });

          // Log export access
          await this.logDataAccess(dataId, dataItem.type, 'EXPORT', dataItem.classification.level);
        }
      }

      // Generate export file
      const exportContent = this.formatExportData(exportData, request.exportFormat);
      const exportFilename = `data_export_${request.userId}_${Date.now()}.${request.exportFormat.toLowerCase()}`;

      // In a real app, you would save this to a secure location or send via email
      await storageService.setItem(`export_${request.id}`, exportContent);

      request.status = 'COMPLETED';
      request.downloadUrl = `local://export_${request.id}`;

    } catch (error) {
      console.error('Export processing failed:', error);
      request.status = 'FAILED';
    }
  }

  private formatExportData(data: any, format: DataExportRequest['exportFormat']): string {
    switch (format) {
      case 'JSON':
        return JSON.stringify(data, null, 2);
      case 'CSV':
        return this.convertToCSV(data);
      case 'PDF':
        return this.convertToPDF(data);
      default:
        return JSON.stringify(data, null, 2);
    }
  }

  private convertToCSV(data: any): string {
    // Simple CSV conversion
    let csv = 'Type,ID,Data,Created,Updated\n';
    
    for (const [type, items] of Object.entries(data.data)) {
      if (Array.isArray(items)) {
        for (const item of items) {
          csv += `${type},${item.id},"${JSON.stringify(item.data).replace(/"/g, '""')}",${item.createdAt},${item.updatedAt}\n`;
        }
      }
    }
    
    return csv;
  }

  private convertToPDF(data: any): string {
    // Placeholder for PDF conversion
    return JSON.stringify(data, null, 2);
  }

  // Data Deletion (GDPR Right to Erasure)
  async deleteAllPersonalData(): Promise<void> {
    const user = await storageService.getItem('current_user');
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Log all deletions
    for (const [dataId, dataItem] of this.personalData) {
      await this.logDataAccess(dataId, dataItem.type, 'DELETE', dataItem.classification.level);
    }

    // Clear all personal data
    this.personalData.clear();
    await this.savePersonalData();

    // Clear consent settings
    this.consentSettings = {
      analyticsConsent: false,
      marketingConsent: false,
      thirdPartyConsent: false,
      dataRetentionConsent: false,
      biometricConsent: false,
      locationConsent: false,
      consentDate: Date.now(),
      consentVersion: '1.0.0',
    };

    await storageService.setItem('data_consent_settings', this.consentSettings);
  }

  private async deleteDataByType(type: PersonalDataItem['type']): Promise<void> {
    const dataToDelete = Array.from(this.personalData.entries())
      .filter(([_, dataItem]) => dataItem.type === type);

    for (const [dataId, dataItem] of dataToDelete) {
      await this.logDataAccess(dataId, dataItem.type, 'DELETE', dataItem.classification.level);
      this.personalData.delete(dataId);
    }

    await this.savePersonalData();
  }

  // Data Retention and Cleanup
  private startPeriodicCleanup(): void {
    // Run cleanup every hour
    setInterval(() => {
      this.cleanupExpiredData();
    }, 60 * 60 * 1000);
  }

  private async cleanupExpiredData(): Promise<void> {
    const now = Date.now();
    const expiredData = Array.from(this.personalData.entries())
      .filter(([_, dataItem]) => dataItem.expiresAt && now > dataItem.expiresAt);

    for (const [dataId, dataItem] of expiredData) {
      await this.logDataAccess(dataId, dataItem.type, 'DELETE', dataItem.classification.level);
      this.personalData.delete(dataId);
    }

    if (expiredData.length > 0) {
      await this.savePersonalData();
    }

    // Cleanup old access logs (keep only last 90 days)
    const ninetyDaysAgo = now - (90 * 24 * 60 * 60 * 1000);
    this.accessLogs = this.accessLogs.filter(log => log.timestamp > ninetyDaysAgo);
    
    await storageService.setItem('data_access_logs', this.accessLogs);
  }

  // Data Persistence
  private async savePersonalData(): Promise<void> {
    const dataArray = Array.from(this.personalData.entries());
    const encryptedData = await this.encryptData(dataArray);
    await storageService.setItem('personal_data_encrypted', encryptedData);
  }

  private async loadPersonalData(encryptedData: string): Promise<void> {
    try {
      const dataArray = await this.decryptData(encryptedData);
      this.personalData = new Map(dataArray);
    } catch (error) {
      console.error('Failed to load personal data:', error);
      this.personalData = new Map();
    }
  }

  // Reporting and Analytics
  getDataProtectionReport(): {
    totalDataItems: number;
    dataByType: Record<string, number>;
    dataByClassification: Record<string, number>;
    accessLogCount: number;
    consentStatus: DataConsentSettings;
    lastCleanup: number;
  } {
    const dataByType: Record<string, number> = {};
    const dataByClassification: Record<string, number> = {};

    for (const dataItem of this.personalData.values()) {
      dataByType[dataItem.type] = (dataByType[dataItem.type] || 0) + 1;
      dataByClassification[dataItem.classification.level] = 
        (dataByClassification[dataItem.classification.level] || 0) + 1;
    }

    return {
      totalDataItems: this.personalData.size,
      dataByType,
      dataByClassification,
      accessLogCount: this.accessLogs.length,
      consentStatus: this.getConsentSettings(),
      lastCleanup: Date.now(),
    };
  }

  getAccessLogs(limit: number = 50): DataAccessLog[] {
    return this.accessLogs.slice(-limit);
  }

  // Cleanup
  destroy(): void {
    this.personalData.clear();
    this.accessLogs = [];
  }
}

// Export singleton instance
export const dataProtectionService = DataProtectionService.getInstance();
export default dataProtectionService;