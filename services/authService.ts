
import api from './api';
import { AuthResponse, User } from '../types/api';

export const authService = {
  async login(payload: any): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/users/login', payload);
    localStorage.setItem('jwt_token', data.token);
    localStorage.setItem('user_data', JSON.stringify(data.user));
    return data;
  },

  async register(payload: any): Promise<User> {
    const { data } = await api.post<User>('/users/register', payload);
    return data;
  },

  logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
  },

  getCurrentUser(): User | null {
    const data = localStorage.getItem('user_data');
    return data ? JSON.parse(data) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('jwt_token');
  }
};
