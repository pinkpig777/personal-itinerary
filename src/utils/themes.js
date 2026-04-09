/**
 * Theme System
 * Defines color palettes for each itinerary
 */

export const themes = {
  universal: {
    name: 'Brutalist',
    primary: '#FFFFFF', // White
    secondary: '#333333', // Muted borders
    background: '#0A0A0A', // True Black
    text: '#FFFFFF', // Main text
    accent: '#333333', // Gray text
    light: 'transparent', // No card backgrounds
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
