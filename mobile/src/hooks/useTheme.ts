// src/hooks/useTheme.ts
import { useState, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/theme';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: typeof lightColors;
}

const lightColors = {
  background: COLORS.offWhite,
  surface: COLORS.white,
  card: COLORS.white,
  border: COLORS.lightGray,
  text: COLORS.black,
  textSecondary: COLORS.darkGray,
  textMuted: COLORS.gray,
  primary: COLORS.teal,
  primaryDark: COLORS.navy,
  accent: COLORS.mint,
  ...COLORS,
};

const darkColors = {
  background: COLORS.darkBg,
  surface: COLORS.darkSurface,
  card: COLORS.darkCard,
  border: COLORS.darkBorder,
  text: COLORS.white,
  textSecondary: COLORS.sky,
  textMuted: COLORS.gray,
  primary: COLORS.teal,
  primaryDark: COLORS.mint,
  accent: COLORS.mint,
  ...COLORS,
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export const useThemeProvider = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('vitalia_dark_mode').then((val) => {
      if (val === 'true') setIsDark(true);
    });
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    AsyncStorage.setItem('vitalia_dark_mode', String(next));
  };

  const colors = isDark ? darkColors : lightColors;

  return { isDark, toggleTheme, colors };
};
