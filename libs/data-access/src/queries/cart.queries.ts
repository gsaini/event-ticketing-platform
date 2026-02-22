import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../api/cart.api';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import type { AddToCartDTO, Cart } from '@ticketing/types';

export const cartKeys = {
  all: ['cart'] as const,
  current: () => [...cartKeys.all, 'current'] as const,
};

export function useCart() {
  const { accessToken } = useAuthStore();
  const { syncCart } = useCartStore();

  return useQuery({
    queryKey: cartKeys.current(),
    queryFn: async () => {
      const cart = await cartApi.get();
      syncCart(cart);
      return cart;
    },
    enabled: !!accessToken,
    refetchInterval: 30000, // Poll every 30s for hold expiration
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const { addItemOptimistic, syncCart } = useCartStore();

  return useMutation({
    mutationFn: (data: AddToCartDTO) => cartApi.addItem(data),
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.current() });
      const previousCart = queryClient.getQueryData<Cart>(cartKeys.current());

      // Optimistic update
      addItemOptimistic({
        id: `temp-${Date.now()}`,
        ...newItem,
      });

      return { previousCart };
    },
    onError: (_err, _newItem, context) => {
      if (context?.previousCart) {
        syncCart(context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.current() });
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  const { removeItemOptimistic, syncCart } = useCartStore();

  return useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.current() });
      const previousCart = queryClient.getQueryData<Cart>(cartKeys.current());

      removeItemOptimistic(itemId);

      return { previousCart };
    },
    onError: (_err, _itemId, context) => {
      if (context?.previousCart) {
        syncCart(context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.current() });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  const { clearCart } = useCartStore();

  return useMutation({
    mutationFn: () => cartApi.clear(),
    onSuccess: () => {
      clearCart();
      queryClient.setQueryData(cartKeys.current(), { items: [], total: 0 });
    },
  });
}
