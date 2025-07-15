import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '../constants';

class ApiService {
  private api: AxiosInstance;
  private aiApi: AxiosInstance;

  constructor() {
    // Main API instance
    this.api = axios.create({
      baseURL: API_CONFIG.API_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // AI API instance with longer timeout
    this.aiApi = axios.create({
      baseURL: API_CONFIG.AI_API_URL,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    const requestInterceptor = async (config: AxiosRequestConfig) => {
      try {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.warn('Failed to get auth token from storage:', error);
      }
      return config;
    };

    // Response interceptor for error handling
    const responseInterceptor = (response: AxiosResponse) => response;
    const errorInterceptor = async (error: any) => {
      if (error.response?.status === 401) {
        // Handle unauthorized access
        try {
          await AsyncStorage.multiRemove([
            STORAGE_KEYS.AUTH_TOKEN,
            STORAGE_KEYS.USER_DATA,
          ]);
          // Navigate to login screen
          // This would typically be handled by a navigation service
        } catch (storageError) {
          console.warn('Failed to clear auth data:', storageError);
        }
      }
      return Promise.reject(error);
    };

    // Apply interceptors to both API instances
    this.api.interceptors.request.use(requestInterceptor);
    this.api.interceptors.response.use(responseInterceptor, errorInterceptor);

    this.aiApi.interceptors.request.use(requestInterceptor);
    this.aiApi.interceptors.response.use(responseInterceptor, errorInterceptor);
  }

  // Generic API methods
  public async get<T>(endpoint: string, params?: any): Promise<T> {
    const response = await this.api.get(endpoint, { params });
    return response.data;
  }

  public async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.api.post(endpoint, data);
    return response.data;
  }

  public async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.api.put(endpoint, data);
    return response.data;
  }

  public async delete<T>(endpoint: string): Promise<T> {
    const response = await this.api.delete(endpoint);
    return response.data;
  }

  // AI-specific methods
  public async aiRequest<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.aiApi.post(endpoint, data);
    return response.data;
  }

  public async aiGet<T>(endpoint: string, params?: any): Promise<T> {
    const response = await this.aiApi.get(endpoint, { params });
    return response.data;
  }

  // Health check methods
  public async healthCheck(): Promise<any> {
    const response = await this.api.get('/status');
    return response.data;
  }

  public async aiHealthCheck(): Promise<any> {
    const response = await this.aiApi.get('/health');
    return response.data;
  }

  // Upload methods for mobile-specific features
  public async uploadFile(endpoint: string, file: any): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;