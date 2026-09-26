'use client';

import { Laptop, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useThemeStore, type ThemePreference } from '@/lib/stores/theme-store';

const order: ThemePreference[] = ['system', 'light', 'dark'];
const labels: Record<ThemePreference, string> = {
  system: 'Theo hệ điều hành',
  light: 'Giao diện sáng',
  dark: 'Giao diện tối',
};

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const Icon = theme === 'system' ? Laptop : theme === 'light' ? Sun : Moon;

  const cycleTheme = () => {
    const index = order.indexOf(theme);
    setTheme(order[(index + 1) % order.length]);
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={cycleTheme}
      title={`${labels[theme]} — nhấn để chuyển`}
      aria-label={`${labels[theme]}. Nhấn để chuyển giao diện.`}
      className="fixed right-4 bottom-4 z-50 size-11 rounded-full bg-background/90 shadow-lg backdrop-blur"
    >
      <Icon />
    </Button>
  );
}
