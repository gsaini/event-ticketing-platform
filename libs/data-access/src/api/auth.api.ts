import type { AuthResponse, LoginDTO, RegisterDTO, RefreshTokenDTO, User, UpdateProfileDTO } from '@ticketing/types';
import { apiClient } from './client';

export const authApi = {
  login: async (data: LoginDTO): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterDTO): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/register', data);
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await apiClient.post<{ accessToken: string; refreshToken: string }>(
      '/api/v1/auth/refresh',
      { refreshToken } satisfies RefreshTokenDTO
    );
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/api/v1/users/me');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileDTO): Promise<User> => {
    const response = await apiClient.patch<User>('/api/v1/users/me', data);
    return response.data;
  },
};
