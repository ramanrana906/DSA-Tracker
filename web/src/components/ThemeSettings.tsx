'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { applyTheme, getStoredTheme, type Theme } from '@/lib/theme';

export default function ThemeSettings() {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    setThemeState(getStoredTheme());
  }, []);

  const choose = (next: Theme) => {
    setThemeState(next);
    applyTheme(next);
  };

  const optionStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.65rem 1.1rem',
    borderRadius: 'var(--radius-md)',
    border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
    background: active ? 'var(--primary-bg)' : 'var(--bg-panel)',
    color: active ? 'var(--primary)' : 'var(--text-main)',
    fontWeight: 600,
    fontSize: '0.875rem',
  });

  return (
    <div className="flex gap-3">
      <button type="button" style={optionStyle(theme === 'light')} onClick={() => choose('light')}>
        <Sun size={16} /> Light
      </button>
      <button type="button" style={optionStyle(theme === 'dark')} onClick={() => choose('dark')}>
        <Moon size={16} /> Dark
      </button>
    </div>
  );
}
