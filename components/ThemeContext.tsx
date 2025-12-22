import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PALETTES, ThemeMode, ThemeType } from '../constants/theme';
import { StatusBar, StatusBarStyle } from 'react-native';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  colors: typeof PALETTES['dark']; // The active colors
  themeType: ThemeType; // The actual active theme (e.g., 'dark' even if mode is 'dynamic')
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [activeTheme, setActiveTheme] = useState<ThemeType>('dark');

  // 1. Load Saved Preference
  useEffect(() => {
    AsyncStorage.getItem('user_theme_mode').then((saved) => {
      if (saved) setMode(saved as ThemeMode);
    });
  }, []);

  // 2. Calculate Active Theme
  useEffect(() => {
    const determineTheme = () => {
      if (mode !== 'dynamic') {
        setActiveTheme(mode);
        return;
      }

      const hour = new Date().getHours();
      // Morning: 6am - 12pm -> Light
      if (hour >= 6 && hour < 12) {
        setActiveTheme('light');
      } 
      // Afternoon: 12pm - 6pm -> Sunset
      else if (hour >= 12 && hour < 18) {
        setActiveTheme('sunset');
      } 
      // Night: 6pm - 6am -> Dark
      else {
        setActiveTheme('dark');
      }
    };

    determineTheme();
    
    // Check every minute if dynamic
    const interval = setInterval(determineTheme, 60000);
    return () => clearInterval(interval);
  }, [mode]);

  // 3. Persist Change
  const updateMode = async (newMode: ThemeMode) => {
    setMode(newMode);
    await AsyncStorage.setItem('user_theme_mode', newMode);
  };

  const colors = PALETTES[activeTheme];

  return (
    <ThemeContext.Provider value={{ mode, setMode: updateMode, colors, themeType: activeTheme }}>
      <StatusBar barStyle={colors.statusBarStyle as StatusBarStyle} backgroundColor={colors.background} />
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};