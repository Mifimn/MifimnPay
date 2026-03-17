"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  themeColor: string; 
  setThemeColor: (color: string) => void;
  resetToDefault: () => void; // New: Clears vendor color for main site
  toggleTheme: () => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: true,
      themeColor: '#ff7d1a', // MifimnPay Default Orange

      setThemeColor: (color) => {
        set({ themeColor: color });
        // Apply to CSS variable immediately when set
        if (typeof window !== 'undefined') {
          document.documentElement.style.setProperty('--brand-orange', color);
        }
      },

      // Use this when leaving a storefront to return to Dashboard
      resetToDefault: () => {
        const defaultColor = '#ff7d1a';
        set({ themeColor: defaultColor });
        if (typeof window !== 'undefined') {
          document.documentElement.style.setProperty('--brand-orange', defaultColor);
        }
      },

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
          // Sync HTML class with stored preference
          set((state) => {
            if (state.isDark) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
            return state;
          });
        }
      }
    }),
    {
      name: 'mifimn-theme-storage', // Specific name to avoid conflicts
    }
  )
);
