import { apiClient, setTokens, clearTokens, getAccessToken, getRefreshToken } from './client';
import { AuthUser, LoginRequest } from '@/types/entities';

const decodeJwt = (token?: string | null): Partial<AuthUser> => {
  if (!token) return {};
  try {
    const payload = JSON.parse(atob(token.split('.')[1] || ''));
    return {
      id: String(payload.user_id || payload.sub || '1'),
      name: payload.username || payload.name || 'Админ',
      email: payload.email || 'admin@example.com',
      role: 'admin',
    };
  } catch {
    return {};
  }
};

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthUser> => {
    const response = await apiClient.post<{ access: string; refresh: string }>('/token/', data);
    const { access, refresh } = response.data;
    setTokens(access, refresh);
    const decoded = decodeJwt(access);
    return {
      id: decoded.id || '1',
      name: decoded.name || data.username || 'Админ',
      email: decoded.email || 'admin@example.com',
      role: 'admin',
    };
  },

  refresh: async (): Promise<string> => {
    const refresh = getRefreshToken();
    if (!refresh) {
      throw new Error('Нет refresh токена');
    }
    const response = await apiClient.post<{ access: string }>('/token/refresh/', { refresh });
    const { access } = response.data;
    setTokens(access, refresh);
    return access;
  },

  me: async (): Promise<AuthUser> => {
    const token = getAccessToken();
    const decoded = decodeJwt(token);
    return {
      id: decoded.id || '1',
      name: decoded.name || 'Админ',
      email: decoded.email || 'admin@example.com',
      role: 'admin',
    };
  },

  logout: async (): Promise<void> => {
    clearTokens();
  },
};
