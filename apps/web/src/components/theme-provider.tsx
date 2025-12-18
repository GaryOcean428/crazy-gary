import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from "react"
import { ThemeProviderState, ThemeProviderProps, Theme, ThemeConfig, ThemeTokens } from "@/types"
import { 
  defaultThemeConfig, 
  createThemeTokens, 
  getSystemTheme, 
  prefersReducedMotion,
  generateCSSVariables,
  validateThemeAccessibility
} from "@/lib/theme-config"

const initialState: ThemeProviderState = {
  theme: "system",
  config: defaultThemeConfig,
  isTransitioning: false,
  systemTheme: "light",
  setTheme: () => null,
  setConfig: () => null,
  toggleTheme: () => null,
  resetToSystem: () => null,
  validateTheme: () => true,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultConfig = {},
  storageKey = "crazy-gary-theme",
  enableTransitions = true,
  enableHighContrast = true,
  enableCustomization = true,
  ...props
}: ThemeProviderProps) {
  // Load theme and config from storage or defaults
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme;
    return (localStorage.getItem(`${storageKey}-mode`) as Theme) || defaultTheme;
  });

  const [config, setConfigState] = useState<ThemeConfig>(() => {
    if (typeof window === 'undefined') return { ...defaultThemeConfig, ...defaultConfig };
    
    try {
      const savedConfig = localStorage.getItem(`${storageKey}-config`);
      return savedConfig ? { ...defaultThemeConfig, ...defaultConfig, ...JSON.parse(savedConfig) } : { ...defaultThemeConfig, ...defaultConfig };
    } catch {
      return { ...defaultThemeConfig, ...defaultConfig };
    }
  });

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const transitionTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize system theme detection
  useEffect(() => {
    const updateSystemTheme = () => {
      const newSystemTheme = getSystemTheme();
      setSystemTheme(newSystemTheme);
    };

    updateSystemTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => updateSystemTheme();
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Get effective theme (resolves 'system' to actual theme)
  const getEffectiveTheme = useCallback((): 'light' | 'dark' | 'high-contrast' => {
    if (theme === 'system') {
      return systemTheme === 'light' ? 'light' : 'dark';
    }
    return theme as 'light' | 'dark' | 'high-contrast';
  }, [theme, systemTheme]);

  // Validate theme accessibility
  const validateTheme = useCallback((themeToValidate: Theme): boolean => {
    const effectiveTheme = themeToValidate === 'system' ? systemTheme : themeToValidate;
    const tokens = createThemeTokens(effectiveTheme as 'light' | 'dark' | 'high-contrast');
    return validateThemeAccessibility(tokens);
  }, [systemTheme]);

  // Apply theme with transitions
  const applyTheme = useCallback((newTheme: Theme, newConfig?: Partial<ThemeConfig>) => {
    const effectiveTheme = newTheme === 'system' ? systemTheme : newTheme;
    const themeMode = effectiveTheme === 'light' ? 'light' : effectiveTheme === 'dark' ? 'dark' : 'high-contrast';
    
    // Generate tokens for the theme
    const tokens = createThemeTokens(themeMode);
    const mergedConfig = newConfig ? { ...config, ...newConfig } : config;
    const finalTokens = { ...tokens, ...mergedConfig.tokens };

    // Generate CSS variables
    const cssVars = generateCSSVariables(finalTokens);
    
    // Apply CSS variables to root
    const root = window.document.documentElement;
    
    // Handle transitions
    if (enableTransitions && mergedConfig.transitions.enableTransitions && !prefersReducedMotion()) {
      setIsTransitioning(true);
      
      // Clear existing timeout
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      
      // Start transition
      root.style.transition = `all ${mergedConfig.transitions.duration}ms ${mergedConfig.transitions.easing}`;
      root.style.willChange = 'background-color, color, border-color';
      
      // Apply new theme class
      root.classList.remove('light', 'dark', 'high-contrast');
      root.classList.add(themeMode);
      
      // Apply CSS variables
      Object.entries(cssVars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
      
      // End transition
      transitionTimeoutRef.current = setTimeout(() => {
        root.style.transition = '';
        root.style.willChange = '';
        setIsTransitioning(false);
      }, mergedConfig.transitions.duration);
    } else {
      // Apply without transitions
      root.classList.remove('light', 'dark', 'high-contrast');
      root.classList.add(themeMode);
      
      Object.entries(cssVars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
    
    // Set color scheme
    root.style.colorScheme = themeMode;
  }, [config, systemTheme, enableTransitions]);

  // Set theme function
  const setTheme = useCallback((newTheme: Theme) => {
    if (newTheme !== theme) {
      setThemeState(newTheme);
      
      // Persist to storage
      if (config.persistence.savePreferences) {
        localStorage.setItem(`${storageKey}-mode`, newTheme);
      }
      
      // Apply the theme
      applyTheme(newTheme);
      
      // Emit theme change event for external listeners
      window.dispatchEvent(new CustomEvent('themechange', { 
        detail: { 
          theme: newTheme, 
          effectiveTheme: getEffectiveTheme(),
          config 
        } 
      }));
    }
  }, [theme, config, storageKey, applyTheme, getEffectiveTheme]);

  // Set config function
  const setConfig = useCallback((newConfig: Partial<ThemeConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfigState(updatedConfig);
    
    // Persist to storage
    if (config.persistence.savePreferences) {
      localStorage.setItem(`${storageKey}-config`, JSON.stringify(updatedConfig));
    }
    
    // Re-apply theme with new config
    applyTheme(theme, newConfig);
  }, [config, storageKey, applyTheme, theme]);

  // Toggle theme function (cycles through available themes)
  const toggleTheme = useCallback(() => {
    const themes: Theme[] = enableHighContrast 
      ? ['light', 'dark', 'high-contrast', 'system'] 
      : ['light', 'dark', 'system'];
    
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  }, [theme, enableHighContrast, setTheme]);

  // Reset to system theme
  const resetToSystem = useCallback(() => {
    setTheme('system');
  }, [setTheme]);

  // Apply theme on mount and when dependencies change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      applyTheme(theme);
    }
  }, [theme, config, systemTheme, applyTheme]);

  // Handle system theme sync
  useEffect(() => {
    if (theme === 'system' && config.persistence.syncWithSystem) {
      applyTheme('system');
    }
  }, [systemTheme, theme, config.persistence.syncWithSystem, applyTheme]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const value: ThemeProviderState = {
    theme,
    config,
    isTransitioning,
    systemTheme,
    setTheme,
    setConfig,
    toggleTheme,
    resetToSystem,
    validateTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = (): ThemeProviderState => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};

// Additional theme utilities
export const useThemeTransition = () => {
  const { isTransitioning } = useTheme();
  return isTransitioning;
};

export const useSystemTheme = () => {
  const { systemTheme } = useTheme();
  return systemTheme;
};

export const useThemeConfig = () => {
  const { config, setConfig } = useTheme();
  return { config, setConfig };
};

