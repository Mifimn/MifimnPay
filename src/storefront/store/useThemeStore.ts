"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Interface for Theme State and Actions
 */
interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: true, // Defaulting to your awesome dark mode

      toggleTheme: () => set((state) => {
        const newIsDark = !state.isDark;
        
        // Ensure we are in a browser environment before touching the DOM
        if (typeof window !== 'undefined') {
          if (newIsDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
        
        return { isDark: newIsDark };
      }),

      /**
       * initTheme
       * Sets the initial theme state. In Next.js, this is usually 
       * handled in the Root Layout or a dedicated ThemeProvider/layout.tsx].
       */
      initTheme: () => {
        if (typeof window !== 'undefined') {
          document.documentElement.classList.add('dark');
        }
      }
    }),
    {
      name: 'theme-storage', // Persists the user's preference in localStorage
    }
  )
);