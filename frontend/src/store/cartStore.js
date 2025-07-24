import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Helper to get initial cart data from localStorage if it exists
const getInitialCartData = () => {
    if (typeof window !== 'undefined') {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            try {
                const parsed = JSON.parse(storedCart);
                // Zustand's persist middleware stores state under a 'state' key by default
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
            cartItems: getInitialCartData(), // Initialize with data from localStorage

            addToCart: (itemToAdd) => {
                set((state) => {
                    const existingItem = state.cartItems.find(
                        (item) => item.product === itemToAdd.product
                    );

                    if (existingItem) {
                        // If item exists, update its quantity
                        return {
                            cartItems: state.cartItems.map((item) =>
                                item.product === itemToAdd.product
                                    ? { ...item, qty: existingItem.qty + itemToAdd.qty }
                                    : item
                            ),
                        };
                    } else {
                        // If item doesn't exist, add it to the cart
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
                    ).filter(item => item.qty > 0), // Remove if qty becomes 0
                }));
            },

            clearCart: () => set({ cartItems: [] }),

            // Selector to get total items in cart (useful for cart icon badge)
            getTotalItems: () => get().cartItems.reduce((acc, item) => acc + item.qty, 0),

            // Selector to get total price of items in cart
            getTotalPrice: () => get().cartItems.reduce((acc, item) => acc + item.qty * item.price, 0),

        }),
        {
            name: 'cart', // Name of the item in localStorage
            storage: createJSONStorage(() => localStorage), // Use localStorage
        }
    )
);