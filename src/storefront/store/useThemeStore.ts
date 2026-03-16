"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  themeColor: string; // Added to store the vendor's accent color
  setThemeColor: (color: string) => void; // Action to update color
  toggleTheme: () => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: true,
      themeColor: '#f97316', // Default brand orange

      setThemeColor: (color) => set({ themeColor: color }),

      toggleTheme: () => set((state) => {
        const newIsDark = !state.isDark;
        if (typeof window !== 'undefined') {
          if (newIsDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
        return { isDark: newIsDark };
      }),

      initTheme: () => {
        if (typeof window !== 'undefined') {
          document.documentElement.classList.add('dark');
        }
      }
    }),
    {
      name: 'theme-storage',
    }
  )
);
