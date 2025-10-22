import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

// API Configuration
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
};

// Create axios instance
const apiClient: AxiosInstance = axios.create(API_CONFIG);

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("hotel_auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }

    return response;
  },
  (error) => {
    // Log error in development
    if (import.meta.env.DEV) {
      console.error(
        `❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        error.response?.data || error.message
      );
    }

    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem("hotel_auth_token");
      localStorage.removeItem("hotel_auth_user");
      window.location.href = "/login";
    }

    if (error.response?.status === 403) {
      // Forbidden - show error message
      console.error("Access forbidden. You do not have permission to perform this action.");
    }

    return Promise.reject(error);
  }
);

// Generic API response type
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

// Paginated response type
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Generic API error type
export interface ApiError {
  message: string;
  status: number;
  errors?: string[];
}

// Generic CRUD operations
export class BaseApiService {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  // Helper method to build query parameters
  protected buildQueryParams(params: Record<string, unknown> = {}): Record<string, unknown> {
    return apiUtils.buildParams(params);
  }

  // GET method
  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await apiClient.get(url, config);
    return response.data;
  }

  // POST method
  protected async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await apiClient.post(url, data, config);
    return response.data;
  }

  // PUT method
  protected async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await apiClient.put(url, data, config);
    return response.data;
  }

  // PATCH method
  protected async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await apiClient.patch(url, data, config);
    return response.data;
  }

  // DELETE method
  protected async delete<T = void>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await apiClient.delete(url, config);
    return response.data;
  }

  // GET all items
  async getAll<T>(params?: Record<string, unknown>): Promise<ApiResponse<T[]>> {
    const response = await apiClient.get(this.endpoint, { params });
    return response.data;
  }

  // GET single item by ID
  async getById<T>(id: string | number): Promise<ApiResponse<T>> {
    const response = await apiClient.get(`${this.endpoint}/${id}`);
    return response.data;
  }

  // POST create new item
  async create<T>(data: Partial<T>): Promise<ApiResponse<T>> {
    const response = await apiClient.post(this.endpoint, data);
    return response.data;
  }

  // PUT update item
  async update<T>(id: string | number, data: Partial<T>): Promise<ApiResponse<T>> {
    const response = await apiClient.put(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  // PATCH partial update
  async patchUpdate<T>(id: string | number, data: Partial<T>): Promise<ApiResponse<T>> {
    const response = await apiClient.patch(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  // DELETE item
  async deleteById(id: string | number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`${this.endpoint}/${id}`);
    return response.data;
  }

  // Custom request method
  async customRequest<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await apiClient.request(config);
    return response.data;
  }
}

// Utility functions
export const apiUtils = {
  // Handle API errors consistently
  handleError: (error: unknown): ApiError => {
    if (axios.isAxiosError(error)) {
      return {
        message: error.response?.data?.message || error.message,
        status: error.response?.status || 500,
        errors: error.response?.data?.errors || [],
      };
    }

    return {
      message: error instanceof Error ? error.message : "An unexpected error occurred",
      status: 500,
      errors: [],
    };
  },

  // Build query parameters
  buildParams: (params: Record<string, unknown>): Record<string, unknown> => {
    const cleanParams: Record<string, unknown> = {};

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        cleanParams[key] = value;
      }
    });

    return cleanParams;
  },

  // Format date for API
  formatDate: (date: Date | string): string => {
    if (typeof date === "string") {
      return date;
    }
    return date.toISOString().split("T")[0];
  },

  // Parse API date
  parseDate: (dateString: string): Date => {
    return new Date(dateString);
  },
};

export default apiClient;
