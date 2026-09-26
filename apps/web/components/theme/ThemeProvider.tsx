'use client';

import { useEffect } from 'react';
import { useThemeStore, type ResolvedTheme } from '@/lib/stores/theme-store';

const systemTheme = (): ResolvedTheme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((state) => state.theme);
  const setResolvedTheme = useThemeStore((state) => state.setResolvedTheme);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const resolved = theme === 'system' ? systemTheme() : theme;
      document.documentElement.classList.toggle('dark', resolved === 'dark');
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = resolved;
      setResolvedTheme(resolved);
    };

    applyTheme();
    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [theme, setResolvedTheme]);

  return children;
}
