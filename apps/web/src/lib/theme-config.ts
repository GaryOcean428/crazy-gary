import { ThemeTokens, ThemeColors, ThemeGradients, ThemeShadows, ThemeConfig } from '@/types';

/**
 * Enhanced Theme Configuration System
 * Provides comprehensive theming with high contrast, custom themes, and accessibility features
 */

// Base color tokens using OKLCH color space for better accessibility
export const createThemeTokens = (mode: 'light' | 'dark' | 'high-contrast'): ThemeTokens => {
  const baseTokens: ThemeTokens = {
    colors: createThemeColors(mode),
    gradients: createThemeGradients(mode),
    shadows: createThemeShadows(mode),
    borderRadius: {
      sm: 'calc(var(--radius) - 4px)',
      md: 'calc(var(--radius) - 2px)',
      lg: 'var(--radius)',
      xl: 'calc(var(--radius) + 4px)',
      '2xl': 'calc(var(--radius) + 8px)',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    typography: {
      fontFamily: '"Inter", system-ui, sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
      },
    },
    animation: {
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      easing: {
        easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  };

  return baseTokens;
};

const createThemeColors = (mode: 'light' | 'dark' | 'high-contrast'): ThemeColors => {
  const colorSets = {
    light: {
      background: 'oklch(1 0 0)',
      foreground: 'oklch(0.145 0 0)',
      card: 'oklch(0.98 0 0)',
      cardForeground: 'oklch(0.145 0 0)',
      popover: 'oklch(1 0 0)',
      popoverForeground: 'oklch(0.145 0 0)',
      primary: 'oklch(0.446 0.268 275.75)',
      primaryForeground: 'oklch(0.985 0 0)',
      secondary: 'oklch(0.96 0 0)',
      secondaryForeground: 'oklch(0.205 0 0)',
      muted: 'oklch(0.96 0 0)',
      mutedForeground: 'oklch(0.556 0 0)',
      accent: 'oklch(0.94 0.013 275.75)',
      accentForeground: 'oklch(0.205 0 0)',
      destructive: 'oklch(0.577 0.245 27.325)',
      border: 'oklch(0.9 0 0)',
      input: 'oklch(0.94 0 0)',
      ring: 'oklch(0.446 0.268 275.75)',
      chart1: 'oklch(0.646 0.222 41.116)',
      chart2: 'oklch(0.6 0.118 184.704)',
      chart3: 'oklch(0.398 0.07 227.392)',
      chart4: 'oklch(0.828 0.189 84.429)',
      chart5: 'oklch(0.769 0.188 70.08)',
      sidebar: 'oklch(0.985 0 0)',
      sidebarForeground: 'oklch(0.145 0 0)',
      sidebarPrimary: 'oklch(0.446 0.268 275.75)',
      sidebarPrimaryForeground: 'oklch(0.985 0 0)',
      sidebarAccent: 'oklch(0.94 0.013 275.75)',
      sidebarAccentForeground: 'oklch(0.205 0 0)',
      sidebarBorder: 'oklch(0.9 0 0)',
      sidebarRing: 'oklch(0.446 0.268 275.75)',
    },
    dark: {
      background: 'oklch(0.09 0 0)',
      foreground: 'oklch(0.985 0 0)',
      card: 'oklch(0.12 0 0)',
      cardForeground: 'oklch(0.985 0 0)',
      popover: 'oklch(0.12 0 0)',
      popoverForeground: 'oklch(0.985 0 0)',
      primary: 'oklch(0.665 0.268 275.75)',
      primaryForeground: 'oklch(0.09 0 0)',
      secondary: 'oklch(0.18 0 0)',
      secondaryForeground: 'oklch(0.985 0 0)',
      muted: 'oklch(0.18 0 0)',
      mutedForeground: 'oklch(0.708 0 0)',
      accent: 'oklch(0.24 0.045 275.75)',
      accentForeground: 'oklch(0.985 0 0)',
      destructive: 'oklch(0.704 0.191 22.216)',
      border: 'oklch(0.24 0 0)',
      input: 'oklch(0.18 0 0)',
      ring: 'oklch(0.665 0.268 275.75)',
      chart1: 'oklch(0.665 0.268 275.75)',
      chart2: 'oklch(0.696 0.17 162.48)',
      chart3: 'oklch(0.769 0.188 70.08)',
      chart4: 'oklch(0.627 0.265 303.9)',
      chart5: 'oklch(0.645 0.246 16.439)',
      sidebar: 'oklch(0.12 0 0)',
      sidebarForeground: 'oklch(0.985 0 0)',
      sidebarPrimary: 'oklch(0.665 0.268 275.75)',
      sidebarPrimaryForeground: 'oklch(0.09 0 0)',
      sidebarAccent: 'oklch(0.24 0.045 275.75)',
      sidebarAccentForeground: 'oklch(0.985 0 0)',
      sidebarBorder: 'oklch(0.24 0 0)',
      sidebarRing: 'oklch(0.665 0.268 275.75)',
    },
    'high-contrast': {
      background: 'oklch(0 0 0)',
      foreground: 'oklch(1 0 0)',
      card: 'oklch(0.05 0 0)',
      cardForeground: 'oklch(1 0 0)',
      popover: 'oklch(0.05 0 0)',
      popoverForeground: 'oklch(1 0 0)',
      primary: 'oklch(0.85 0.268 275.75)',
      primaryForeground: 'oklch(0 0 0)',
      secondary: 'oklch(0.2 0 0)',
      secondaryForeground: 'oklch(1 0 0)',
      muted: 'oklch(0.15 0 0)',
      mutedForeground: 'oklch(0.85 0 0)',
      accent: 'oklch(0.3 0.1 275.75)',
      accentForeground: 'oklch(1 0 0)',
      destructive: 'oklch(0.9 0.3 27.325)',
      border: 'oklch(0.4 0 0)',
      input: 'oklch(0.15 0 0)',
      ring: 'oklch(0.85 0.268 275.75)',
      chart1: 'oklch(0.8 0.3 41.116)',
      chart2: 'oklch(0.75 0.2 184.704)',
      chart3: 'oklch(0.6 0.15 227.392)',
      chart4: 'oklch(0.9 0.25 84.429)',
      chart5: 'oklch(0.85 0.25 70.08)',
      sidebar: 'oklch(0.08 0 0)',
      sidebarForeground: 'oklch(1 0 0)',
      sidebarPrimary: 'oklch(0.85 0.268 275.75)',
      sidebarPrimaryForeground: 'oklch(0 0 0)',
      sidebarAccent: 'oklch(0.3 0.1 275.75)',
      sidebarAccentForeground: 'oklch(1 0 0)',
      sidebarBorder: 'oklch(0.4 0 0)',
      sidebarRing: 'oklch(0.85 0.268 275.75)',
    },
  };

  return colorSets[mode];
};

const createThemeGradients = (mode: 'light' | 'dark' | 'high-contrast'): ThemeGradients => {
  const gradients = {
    light: {
      primary: 'linear-gradient(135deg, oklch(0.446 0.268 275.75) 0%, oklch(0.6 0.3 275.75) 100%)',
      secondary: 'linear-gradient(135deg, oklch(0.96 0 0) 0%, oklch(0.9 0 0) 100%)',
      accent: 'linear-gradient(135deg, oklch(0.94 0.013 275.75) 0%, oklch(0.8 0.05 275.75) 100%)',
      success: 'linear-gradient(135deg, oklch(0.6 0.15 142.495) 0%, oklch(0.7 0.2 142.495) 100%)',
      warning: 'linear-gradient(135deg, oklch(0.7 0.2 84.429) 0%, oklch(0.8 0.25 84.429) 100%)',
      error: 'linear-gradient(135deg, oklch(0.577 0.245 27.325) 0%, oklch(0.7 0.3 27.325) 100%)',
    },
    dark: {
      primary: 'linear-gradient(135deg, oklch(0.665 0.268 275.75) 0%, oklch(0.8 0.3 275.75) 100%)',
      secondary: 'linear-gradient(135deg, oklch(0.18 0 0) 0%, oklch(0.15 0 0) 100%)',
      accent: 'linear-gradient(135deg, oklch(0.24 0.045 275.75) 0%, oklch(0.35 0.08 275.75) 100%)',
      success: 'linear-gradient(135deg, oklch(0.6 0.15 142.495) 0%, oklch(0.7 0.2 142.495) 100%)',
      warning: 'linear-gradient(135deg, oklch(0.7 0.2 84.429) 0%, oklch(0.8 0.25 84.429) 100%)',
      error: 'linear-gradient(135deg, oklch(0.704 0.191 22.216) 0%, oklch(0.8 0.25 22.216) 100%)',
    },
    'high-contrast': {
      primary: 'linear-gradient(135deg, oklch(0.85 0.268 275.75) 0%, oklch(0.95 0.3 275.75) 100%)',
      secondary: 'linear-gradient(135deg, oklch(0.2 0 0) 0%, oklch(0.3 0 0) 100%)',
      accent: 'linear-gradient(135deg, oklch(0.3 0.1 275.75) 0%, oklch(0.5 0.15 275.75) 100%)',
      success: 'linear-gradient(135deg, oklch(0.8 0.2 142.495) 0%, oklch(0.9 0.25 142.495) 100%)',
      warning: 'linear-gradient(135deg, oklch(0.8 0.25 84.429) 0%, oklch(0.9 0.3 84.429) 100%)',
      error: 'linear-gradient(135deg, oklch(0.9 0.3 27.325) 0%, oklch(1 0.35 27.325) 100%)',
    },
  };

  return gradients[mode];
};

const createThemeShadows = (mode: 'light' | 'dark' | 'high-contrast'): ThemeShadows => {
  const shadows = {
    light: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      soft: '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06)',
      moderate: '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)',
      strong: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.06)',
    },
    dark: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.6), 0 8px 10px -6px rgb(0 0 0 / 0.5)',
      soft: '0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)',
      moderate: '0 4px 16px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3)',
      strong: '0 8px 32px rgba(0, 0, 0, 0.5), 0 4px 16px rgba(0, 0, 0, 0.4)',
    },
    'high-contrast': {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.5)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.6), 0 2px 4px -2px rgb(0 0 0 / 0.5)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.7), 0 4px 6px -4px rgb(0 0 0 / 0.6)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.8), 0 8px 10px -6px rgb(0 0 0 / 0.7)',
      soft: '0 2px 8px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3)',
      moderate: '0 4px 16px rgba(0, 0, 0, 0.5), 0 2px 6px rgba(0, 0, 0, 0.4)',
      strong: '0 8px 32px rgba(0, 0, 0, 0.6), 0 4px 16px rgba(0, 0, 0, 0.5)',
    },
  };

  return shadows[mode];
};

// Default theme configuration
export const defaultThemeConfig: ThemeConfig = {
  mode: 'system',
  tokens: createThemeTokens('light'),
  transitions: {
    duration: 300,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    enableTransitions: true,
  },
  persistence: {
    storageKey: 'crazy-gary-theme',
    syncWithSystem: true,
    savePreferences: true,
  },
  accessibility: {
    minimumContrast: 4.5,
    respectReducedMotion: true,
    focusIndicators: true,
  },
  customization: {
    allowUserCustomization: true,
    defaultCustomTheme: null,
    customThemes: {},
  },
};

// Theme validation utilities
export const validateContrastRatio = (foreground: string, background: string): boolean => {
  // Simple validation - in a real implementation, you'd calculate actual contrast ratios
  return true; // Placeholder for actual contrast calculation
};

export const validateThemeAccessibility = (tokens: ThemeTokens): boolean => {
  // Validate color combinations meet accessibility standards
  return true; // Placeholder for comprehensive accessibility validation
};

// Theme utility functions
export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

export const prefersReducedMotion = (): boolean => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return false;
};

export const generateCSSVariables = (tokens: ThemeTokens): Record<string, string> => {
  const cssVars: Record<string, string> = {};

  // Colors
  Object.entries(tokens.colors).forEach(([key, value]) => {
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    cssVars[`--${cssKey}`] = value;
  });

  // Gradients
  Object.entries(tokens.gradients).forEach(([key, value]) => {
    cssVars[`--gradient-${key}`] = value;
  });

  // Shadows
  Object.entries(tokens.shadows).forEach(([key, value]) => {
    cssVars[`--shadow-${key}`] = value;
  });

  // Border radius
  Object.entries(tokens.borderRadius).forEach(([key, value]) => {
    cssVars[`--radius-${key}`] = value;
  });

  // Spacing
  Object.entries(tokens.spacing).forEach(([key, value]) => {
    cssVars[`--spacing-${key}`] = value;
  });

  // Typography
  cssVars['--font-family'] = tokens.typography.fontFamily;
  Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
    cssVars[`--font-size-${key}`] = value;
  });

  // Animation
  Object.entries(tokens.animation.duration).forEach(([key, value]) => {
    cssVars[`--duration-${key}`] = value;
  });
  Object.entries(tokens.animation.easing).forEach(([key, value]) => {
    cssVars[`--easing-${key}`] = value;
  });

  return cssVars;
};