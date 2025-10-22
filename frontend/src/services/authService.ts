import axios from "axios";
import { jwtDecode } from "jwt-decode";
import type { LoginCredentials, AuthResponse, User, JwtPayload } from "../types/auth";
import apiClient from "../api_connection/base";

// Token storage keys
const TOKEN_KEY = "hotel_auth_token";
const USER_KEY = "hotel_auth_user";

export class AuthService {
  // Login user
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<{ data: AuthResponse }>("/auth/login", credentials);

      const { token, user } = response.data.data;

      // Store token and user data
      this.setToken(token);
      this.setUser(user);

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.data.message || "Login failed");
      }
      throw error;
    }
  }

  // Logout user
  static logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete apiClient.defaults.headers.common["Authorization"];
  }

  // Get stored token
  static getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // Set token
  static setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  // Get stored user
  static getUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Set user
  static setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  // Check if token is valid
  static isTokenValid(token: string): boolean {
    try {
      // For demo token, just check if it's the expected mock token
      if (token.includes("demo_token_for_development")) {
        return true;
      }

      const decoded: JwtPayload = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }

  // Get user from token
  static getUserFromToken(token: string): User | null {
    try {
      const decoded: JwtPayload = jwtDecode(token);
      return {
        staff_id: decoded.staff_id,
        username: decoded.username,
        role: decoded.role,
      };
    } catch {
      return null;
    }
  }

  // Initialize auth (call on app start)
  static initializeAuth(): { user: User | null; token: string | null; isAuthenticated: boolean } {
    const token = this.getToken();

    if (!token || !this.isTokenValid(token)) {
      this.logout();
      return { user: null, token: null, isAuthenticated: false };
    }

    // Set authorization header
    this.setToken(token);

    // Get user data
    let user = this.getUser();

    // If user data not in storage, try to get from token
    if (!user) {
      user = this.getUserFromToken(token);
      if (user) {
        this.setUser(user);
      }
    }

    return {
      user,
      token,
      isAuthenticated: !!(user && token),
    };
  }

  // Refresh token (if backend supports it)
  static async refreshToken(): Promise<string | null> {
    try {
      const response = await apiClient.post<{ token: string }>("/auth/refresh");
      const { token } = response.data;
      this.setToken(token);
      return token;
    } catch {
      this.logout();
      return null;
    }
  }
}

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = AuthService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      AuthService.logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
