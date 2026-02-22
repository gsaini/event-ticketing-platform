import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../stores/authStore';
import type { LoginDTO, RegisterDTO, UpdateProfileDTO } from '@ticketing/types';

export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

export function useCurrentUser() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: authKeys.user(),
    queryFn: authApi.getCurrentUser,
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const { setTokens, setUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginDTO) => authApi.login(data),
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      queryClient.setQueryData(authKeys.user(), data.user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const { setTokens, setUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: RegisterDTO) => authApi.register(data),
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      queryClient.setQueryData(authKeys.user(), data.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: async () => {},
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: UpdateProfileDTO) => authApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.setQueryData(authKeys.user(), updatedUser);
    },
  });
}
