/**
 * Theme System
 * Defines color palettes for each itinerary
 */

export const themes = {
  universal: {
    name: 'Urban',
    primary: '#FFFFFF', // White for highlights/buttons
    secondary: '#333333', // Borders/Muted
    background: '#121212', // App Background
    text: '#FFFFFF', // Main text
    accent: '#9CA3AF', // Gray-400 for secondary text
    light: '#1E1E1E', // Card backgrounds
    dark: '#000000'
  }
};

/**
 * Get theme by name (now always returns universal urban theme)
 * @param {string} themeName - Theme identifier
 * @returns {object} Theme color object
 */
export const getTheme = () => {
  return themes.universal;
};

/**
 * Convert theme object to CSS variables
 * Useful for injecting theme colors into document or component styles
 * @param {string} themeName - Theme identifier
 * @returns {object} CSS variable object { '--color-primary': '#500000', ... }
 */
export const getThemeCSSVariables = (themeName) => {
  const theme = getTheme(themeName);
  return {
    '--theme-primary': theme.primary,
    '--theme-secondary': theme.secondary,
    '--theme-background': theme.background,
    '--theme-text': theme.text,
    '--theme-accent': theme.accent,
    '--theme-light': theme.light,
    '--theme-dark': theme.dark
  };
};
