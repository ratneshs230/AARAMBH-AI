import admin from 'firebase-admin';

class FirebaseConfig {
  private static instance: FirebaseConfig;
  private app: admin.app.App | null = null;

  private constructor() {}

  public static getInstance(): FirebaseConfig {
    if (!FirebaseConfig.instance) {
      FirebaseConfig.instance = new FirebaseConfig();
    }
    return FirebaseConfig.instance;
  }

  public async initialize(): Promise<void> {
    try {
      if (this.app) {
        console.log('🔥 Firebase already initialized');
        return;
      }

      const serviceAccount = {
        type: process.env.FIREBASE_TYPE || 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
        token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url:
          process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL ||
          'https://www.googleapis.com/oauth2/v1/certs',
      };

      if (!serviceAccount.project_id) {
        throw new Error('Firebase project_id is required');
      }

      this.app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        projectId: serviceAccount.project_id,
      });

      console.log('✅ Firebase Admin initialized successfully');
      console.log(`📁 Project ID: ${serviceAccount.project_id}`);
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error);

      console.log('🔄 Attempting to initialize Firebase with Application Default Credentials...');
      try {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        if (!projectId) {
          throw new Error('FIREBASE_PROJECT_ID is required');
        }
        this.app = admin.initializeApp({
          projectId,
        });
        console.log('✅ Firebase initialized with default credentials');
      } catch (fallbackError) {
        console.error('❌ Firebase fallback initialization failed:', fallbackError);
        throw error;
      }
    }
  }

  public getApp(): admin.app.App {
    if (!this.app) {
      throw new Error('Firebase not initialized. Call initialize() first.');
    }
    return this.app;
  }

  public getAuth(): admin.auth.Auth {
    return this.getApp().auth();
  }

  public getFirestore(): admin.firestore.Firestore {
    return this.getApp().firestore();
  }

  public async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    try {
      const decodedToken = await this.getAuth().verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      console.error('❌ Token verification failed:', error);
      throw new Error('Invalid token');
    }
  }

  public async createCustomToken(uid: string, additionalClaims?: object): Promise<string> {
    try {
      const customToken = await this.getAuth().createCustomToken(uid, additionalClaims);
      return customToken;
    } catch (error) {
      console.error('❌ Custom token creation failed:', error);
      throw error;
    }
  }

  public async getUserByEmail(email: string): Promise<admin.auth.UserRecord> {
    try {
      const userRecord = await this.getAuth().getUserByEmail(email);
      return userRecord;
    } catch (error) {
      console.error('❌ Get user by email failed:', error);
      throw error;
    }
  }

  public async createUser(userData: admin.auth.CreateRequest): Promise<admin.auth.UserRecord> {
    try {
      const userRecord = await this.getAuth().createUser(userData);
      console.log('✅ Successfully created new user:', userRecord.uid);
      return userRecord;
    } catch (error) {
      console.error('❌ Create user failed:', error);
      throw error;
    }
  }

  public async updateUser(
    uid: string,
    userData: admin.auth.UpdateRequest
  ): Promise<admin.auth.UserRecord> {
    try {
      const userRecord = await this.getAuth().updateUser(uid, userData);
      console.log('✅ Successfully updated user:', uid);
      return userRecord;
    } catch (error) {
      console.error('❌ Update user failed:', error);
      throw error;
    }
  }

  public async deleteUser(uid: string): Promise<void> {
    try {
      await this.getAuth().deleteUser(uid);
      console.log('✅ Successfully deleted user:', uid);
    } catch (error) {
      console.error('❌ Delete user failed:', error);
      throw error;
    }
  }

  public async setCustomUserClaims(uid: string, customClaims: object): Promise<void> {
    try {
      await this.getAuth().setCustomUserClaims(uid, customClaims);
      console.log('✅ Successfully set custom claims for user:', uid);
    } catch (error) {
      console.error('❌ Set custom claims failed:', error);
      throw error;
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      if (!this.app) {
        return false;
      }

      await this.getAuth().listUsers(1);
      return true;
    } catch (error) {
      console.error('Firebase health check failed:', error);
      return false;
    }
  }
}

export default FirebaseConfig;
