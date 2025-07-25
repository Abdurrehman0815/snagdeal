import create from 'zustand'; // CORRECTED
import { persist, createJSONStorage } from 'zustand/middleware';

// Helper to get initial cart data from localStorage if it exists
const getInitialCartData = () => {
  if (typeof window !== 'undefined') {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart);
        return parsed.state?.cartItems || [];
      } catch (e) {
        console.error("Failed to parse stored cart data:", e);
        return [];
      }
    }
  }
  return [];
};

export const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: getInitialCartData(),
      addToCart: (itemToAdd) => {
        set((state) => {
          const existingItem = state.cartItems.find(
            (item) => item.product === itemToAdd.product
          );

          if (existingItem) {
            return {
              cartItems: state.cartItems.map((item) =>
                item.product === itemToAdd.product
                  ? { ...item, qty: existingItem.qty + itemToAdd.qty }
                  : item
              ),
            };
          } else {
            return {
              cartItems: [...state.cartItems, { ...itemToAdd, qty: itemToAdd.qty }],
            };
          }
        });
      },

      removeFromCart: (id) => {
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item.product !== id),
        }));
      },

      updateCartItemQty: (id, newQty) => {
        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.product === id ? { ...item, qty: newQty } : item
          ).filter(item => item.qty > 0),
        }));
      },

      clearCart: () => set({ cartItems: [] }),

      getTotalItems: () => get().cartItems.reduce((acc, item) => acc + item.qty, 0),
      getTotalPrice: () => get().cartItems.reduce((acc, item) => acc + item.qty * item.price, 0),

    }),
    {
      name: 'cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);