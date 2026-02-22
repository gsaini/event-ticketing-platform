import { create } from 'zustand';
import type { Cart, CartItem } from '@ticketing/types';

interface CartState {
  cart: Cart;
  isLoading: boolean;

  // Local optimistic updates
  addItemOptimistic: (item: CartItem) => void;
  removeItemOptimistic: (itemId: string) => void;
  updateQuantityOptimistic: (itemId: string, quantity: number) => void;
  clearCart: () => void;

  // Sync with server
  syncCart: (serverCart: Cart) => void;
  setLoading: (loading: boolean) => void;

  // Computed
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: { items: [], total: 0 },
  isLoading: false,

  addItemOptimistic: (item) =>
    set((state) => ({
      cart: {
        items: [...state.cart.items, item],
        total: state.cart.total + item.price * item.quantity,
      },
    })),

  removeItemOptimistic: (itemId) =>
    set((state) => {
      const item = state.cart.items.find((i) => i.id === itemId);
      return {
        cart: {
          items: state.cart.items.filter((i) => i.id !== itemId),
          total: state.cart.total - (item ? item.price * item.quantity : 0),
        },
      };
    }),

  updateQuantityOptimistic: (itemId, quantity) =>
    set((state) => {
      const items = state.cart.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return { cart: { items, total } };
    }),

  clearCart: () => set({ cart: { items: [], total: 0 } }),

  syncCart: (serverCart) => set({ cart: serverCart }),

  setLoading: (isLoading) => set({ isLoading }),

  getItemCount: () => get().cart.items.reduce((sum, item) => sum + item.quantity, 0),
}));
