import create from 'zustand';
import { persist } from 'zustand/middleware'; // CORRECTED

// Helper to get initial user data from localStorage if it exists
const getInitialAuthData = () => {
  if (typeof window !== 'undefined') {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth);
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
      user: getInitialAuthData(),
      login: (userData) => set({ user: userData }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'auth',
      storage: localStorage, // CORRECTED: Directly use localStorage
    }
  )
);