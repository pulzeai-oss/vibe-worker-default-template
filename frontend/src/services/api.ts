const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface User {
  id: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  full_name?: string;
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

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
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

  // Health check
  async healthCheck(): Promise<{status: string}> {
    return this.request<{status: string}>('/health');
  }
}

export const apiService = new ApiService(API_BASE_URL);
