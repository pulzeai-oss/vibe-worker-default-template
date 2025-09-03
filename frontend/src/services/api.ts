const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000';

export interface User {
  user_id: string;
  email: string;
  is_admin: boolean;
  role: 'admin' | 'editor' | 'viewer';
  full_name?: string; // Optional field for display purposes
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role?: 'admin' | 'editor' | 'viewer';
}

export interface AuthResponse {
  token_type: string;
  access_token: string;
  expires_at: number;
  refresh_token: string;
  refresh_token_expires_at: number;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface Item {
  id: string;
  title: string;
  description?: string;
  owner_id: string;
}

export interface ApiResponse<T> {
  data: T;
  count?: number;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getAuthToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          this.logout();
          throw new Error('Authentication failed');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Users
  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.request<ApiResponse<User[]>>('/api/v1/users/');
  }

  async createUser(userData: Partial<User>): Promise<User> {
    return this.request<User>('/api/v1/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Items
  async getItems(): Promise<ApiResponse<Item[]>> {
    return this.request<ApiResponse<Item[]>>('/api/v1/items/');
  }

  async createItem(itemData: Partial<Item>): Promise<Item> {
    return this.request<Item>('/api/v1/items/', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await fetch(`${this.baseUrl}/api/v1/auth/access-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const authData = await response.json();
    
    // Store tokens
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', authData.access_token);
      localStorage.setItem('refresh_token', authData.refresh_token);
      localStorage.setItem('expires_at', authData.expires_at.toString());
    }

    return authData;
  }

  async register(userData: RegisterRequest): Promise<User> {
    return this.request<User>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const authData = await this.request<AuthResponse>('/api/v1/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    // Update stored tokens
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', authData.access_token);
      localStorage.setItem('refresh_token', authData.refresh_token);
      localStorage.setItem('expires_at', authData.expires_at.toString());
    }

    return authData;
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/api/v1/users/me');
  }

  async resetPassword(password: string): Promise<void> {
    await this.request('/api/v1/users/reset-password', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('expires_at');
      window.location.href = '/login';
    }
  }

  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      const expiresAt = localStorage.getItem('expires_at');
      
      if (token && expiresAt) {
        return Date.now() < parseInt(expiresAt) * 1000;
      }
    }
    return false;
  }

  // Health check
  async healthCheck(): Promise<{status: string}> {
    return this.request<{status: string}>('/health');
  }
}

export const apiService = new ApiService(API_BASE_URL);
