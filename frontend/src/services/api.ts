import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { config } from '@utils/config';
import { LOCAL_STORAGE_KEYS } from '@utils/constants';

class ApiService {
  private api: AxiosInstance;
  private aiApi: AxiosInstance;

  constructor() {
    // Main API instance
    this.api = axios.create({
      baseURL: config.apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // AI API instance with longer timeout
    this.aiApi = axios.create({
      baseURL: config.aiApiUrl,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    const requestInterceptor = (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    };

    // Response interceptor for error handling
    const responseInterceptor = (response: AxiosResponse) => response;
    const errorInterceptor = (error: any) => {
      if (error.response?.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_DATA);
        window.location.href = '/login';
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

  // Health check
  public async healthCheck(): Promise<any> {
    const response = await this.api.get('/status');
    return response.data;
  }

  public async aiHealthCheck(): Promise<any> {
    const response = await this.aiApi.get('/health');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
