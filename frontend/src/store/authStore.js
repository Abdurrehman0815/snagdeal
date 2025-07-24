import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Helper to get initial user data from localStorage if it exists
const getInitialAuthData = () => {
    if (typeof window !== 'undefined') { // Check if window is defined (for SSR safety)
        const storedAuth = localStorage.getItem('auth');
        if (storedAuth) {
            try {
                const parsed = JSON.parse(storedAuth);
                // Zustand's persist middleware stores state under a 'state' key by default
                return parsed.state?.user || null;
            } catch (e) {
                console.error("Failed to parse stored auth data:", e);
                return null;
            }
        }
    }
    return null;
};

export const useAuthStore = create(
    persist(
        (set) => ({
            user: getInitialAuthData(), // Initialize with data from localStorage
            // Login action: sets the user data
            login: (userData) => set({ user: userData }),
            // Logout action: clears the user data
            logout: () => set({ user: null }),
        }),
        {
            name: 'auth', // Name of the item in localStorage
            storage: createJSONStorage(() => localStorage), // Use localStorage
            // Optional: Add partialize to select which parts of the state to persist
            // For example, if you only want to store the token and not sensitive data
            // partialize: (state) => ({ user: { token: state.user?.token, role: state.user?.role } }),
            // Skip `version` and `migrations` for simplicity for now.
        }
    )
);