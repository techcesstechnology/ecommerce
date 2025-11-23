import { api, apiService } from './api';
import { User, ApiResponse } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await api.post<any>(
      '/auth/login',
      credentials
    );

    // Backend returns { message, user, accessToken }
    const { accessToken, user } = response.data;

    if (!accessToken || !user) {
      throw new Error('Invalid response from server');
    }

    apiService.setAuthToken(accessToken);
    return { token: accessToken, user };
  },

  async register(data: RegisterData) {
    const response = await api.post<ApiResponse<{ token: string; user: User }>>(
      '/auth/register',
      data
    );
    // Note: Register might also need similar fix if backend structure is consistent
    // But for now keeping as is unless tested otherwise
    const { token, user } = response.data.data;
    apiService.setAuthToken(token);
    return { token, user };
  },

  async logout() {
    apiService.removeAuthToken();
    window.location.href = '/';
  },

  async getCurrentUser() {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    // Check if structure matches login fix
    if (response.data && !response.data.data && (response.data as any).user) {
      return (response.data as any).user;
    }
    return response.data.data;
  },

  async updateProfile(data: Partial<User>) {
    const response = await api.put<ApiResponse<User>>('/auth/profile', data);
    return response.data.data;
  },

  async changePassword(oldPassword: string, newPassword: string) {
    await api.put('/auth/password', {
      oldPassword,
      newPassword,
    });
  },
};
