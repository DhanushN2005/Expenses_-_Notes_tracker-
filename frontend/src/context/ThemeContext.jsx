import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('noted-workspace-theme') || 'dark-indigo';
  });

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('noted-workspace-theme', newTheme);
  };

  const themeList = [
    { id: 'dark-indigo', name: 'Deep Indigo', dark: true, primary: '#6366f1' },
    { id: 'dark-emerald', name: 'Emerald Mint', dark: true, primary: '#10b981' },
    { id: 'dark-rose', name: 'Cyber Rose', dark: true, primary: '#f43f5e' },
    { id: 'light-modern', name: 'Alabaster Light', dark: false, primary: '#3b82f6' },
  ];

  const activeTheme = themeList.find(t => t.id === theme) || themeList[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeList, activeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
