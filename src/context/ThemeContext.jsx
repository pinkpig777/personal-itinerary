import React, { createContext, useContext } from 'react';
import { getTheme, getThemeCSSVariables } from '../utils/themes';

/**
 * ThemeContext
 * Provides theme colors and utilities to all descendant components
 */
const ThemeContext = createContext(null);

/**
 * ThemeProvider Component
 * Wraps your app or itinerary with theme context
 * @param {object} props - Component props
 * @param {string} props.themeName - Theme identifier (e.g., 'cowboy', 'coastal')
 * @param {React.ReactNode} props.children - Child components
 */
export const ThemeProvider = ({ themeName = 'cowboy', children }) => {
  const theme = getTheme(themeName);
  const cssVariables = getThemeCSSVariables(themeName);

  const value = {
    themeName,
    theme,
    cssVariables
  };

  return (
    <ThemeContext.Provider value={value}>
      <div style={cssVariables}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

/**
 * useTheme Hook
 * Access theme colors and metadata from any component
 * @returns {object} Theme object with colors and utilities
 * @throws {Error} If used outside ThemeProvider
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within <ThemeProvider>');
  }
  return context;
};
