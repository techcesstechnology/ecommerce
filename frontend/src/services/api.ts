import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    const token = localStorage.getItem('token');
    if (token) {
      this.setAuthToken(token);
    }
  }

  setAuthToken(token: string) {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  }

  removeAuthToken() {
    delete this.api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }

  getApi() {
    return this.api;
  }
}

export const apiService = new ApiService();
export const api = apiService.getApi();
