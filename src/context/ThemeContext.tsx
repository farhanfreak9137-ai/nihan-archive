import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'midnight-rose' | 'starlight-obsidian' | 'warm-amber';

export interface ThemeConfig {
  id: ThemeMode;
  name: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  icon: string;
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'midnight-rose',
    name: 'Midnight Rose',
    tagline: 'Deep slate with romantic rose & sky accents',
    primaryColor: '#f43f5e',
    accentColor: '#38bdf8',
    icon: '🌹',
  },
  {
    id: 'starlight-obsidian',
    name: 'Starlight Obsidian',
    tagline: 'Pure OLED black with neon starlight violet & cyan',
    primaryColor: '#a855f7',
    accentColor: '#06b6d4',
    icon: '🌌',
  },
  {
    id: 'warm-amber',
    name: 'Warm Amber',
    tagline: 'Cozy espresso night with golden candlelight amber',
    primaryColor: '#f59e0b',
    accentColor: '#fb7185',
    icon: '🕯️',
  },
];

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  currentThemeConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('nila_archive_theme');
      if (saved === 'midnight-rose' || saved === 'starlight-obsidian' || saved === 'warm-amber') {
        return saved;
      }
    } catch {}
    return 'midnight-rose';
  });

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
    try {
      localStorage.setItem('nila_archive_theme', t);
    } catch {}
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    // Sync mobile status bar theme color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      if (theme === 'starlight-obsidian') metaThemeColor.setAttribute('content', '#000000');
      else if (theme === 'warm-amber') metaThemeColor.setAttribute('content', '#0c0a09');
      else metaThemeColor.setAttribute('content', '#0b0d10');
    }
  }, [theme]);

  const currentThemeConfig = THEMES.find((t) => t.id === theme) || THEMES[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, currentThemeConfig }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
};
