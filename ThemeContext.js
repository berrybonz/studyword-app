// ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from './themes';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(lightTheme);
  const [themeMode, setThemeMode] = useState('light');

  // 앱 실행 시 저장된 테마 모드를 불러옴
  useEffect(() => {
    async function loadTheme() {
      try {
        const storedTheme = await AsyncStorage.getItem('themeMode');
        if (storedTheme) {
          setThemeMode(storedTheme);
          setTheme(storedTheme === 'dark' ? darkTheme : lightTheme);
        }
      } catch (error) {
        console.error('Error loading theme', error);
      }
    }
    loadTheme();
  }, []);

  // 테마 변경 시 AsyncStorage에 저장하고 상태 업데이트
  const toggleTheme = async (mode) => {
    try {
      await AsyncStorage.setItem('themeMode', mode);
      setThemeMode(mode);
      setTheme(mode === 'dark' ? darkTheme : lightTheme);
    } catch (error) {
      console.error('Error saving theme', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
