import type { Cart, AddToCartDTO } from '@ticketing/types';
import { apiClient } from './client';

export const cartApi = {
  get: async (): Promise<Cart> => {
    const response = await apiClient.get<Cart>('/api/v1/cart');
    return response.data;
  },

  addItem: async (data: AddToCartDTO): Promise<Cart> => {
    const response = await apiClient.post<Cart>('/api/v1/cart/items', data);
    return response.data;
  },

  removeItem: async (itemId: string): Promise<Cart> => {
    const response = await apiClient.delete<Cart>(`/api/v1/cart/items/${itemId}`);
    return response.data;
  },

  updateQuantity: async (itemId: string, quantity: number): Promise<Cart> => {
    const response = await apiClient.patch<Cart>(`/api/v1/cart/items/${itemId}`, { quantity });
    return response.data;
  },

  clear: async (): Promise<void> => {
    await apiClient.delete('/api/v1/cart');
  },
};
