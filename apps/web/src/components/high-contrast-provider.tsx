/**
 * High Contrast Mode Provider
 * Implements WCAG AAA contrast requirements for users who need high contrast
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

interface HighContrastContextType {
  isHighContrast: boolean;
  toggleHighContrast: () => void;
  setHighContrast: (enabled: boolean) => void;
}

const HighContrastContext = createContext<HighContrastContextType | undefined>(undefined);

export const useHighContrast = () => {
  const context = useContext(HighContrastContext);
  if (!context) {
    throw new Error('useHighContrast must be used within a HighContrastProvider');
  }
  return context;
};

interface HighContrastProviderProps {
  children: React.ReactNode;
}

export const HighContrastProvider: React.FC<HighContrastProviderProps> = ({ children }) => {
  const [isHighContrast, setIsHighContrast] = useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('high-contrast-mode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    
    // Check system preference
    return window.matchMedia('(prefers-contrast: more)').matches;
  });

  useEffect(() => {
    // Save preference to localStorage
    localStorage.setItem('high-contrast-mode', JSON.stringify(isHighContrast));
    
    // Apply high contrast classes to document
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast');
      document.documentElement.style.setProperty('--contrast-ratio', '7:1');
    } else {
      document.documentElement.classList.remove('high-contrast');
      document.documentElement.style.setProperty('--contrast-ratio', '4.5:1');
    }
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('high-contrast-mode')) {
        setIsHighContrast(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isHighContrast]);

  const toggleHighContrast = () => {
    setIsHighContrast(prev => !prev);
  };

  const setHighContrast = (enabled: boolean) => {
    setIsHighContrast(enabled);
  };

  return (
    <HighContrastContext.Provider value={{ isHighContrast, toggleHighContrast, setHighContrast }}>
      {children}
    </HighContrastContext.Provider>
  );
};

// High Contrast Toggle Component
export const HighContrastToggle: React.FC = () => {
  const { isHighContrast, toggleHighContrast } = useHighContrast();

  return (
    <button
      onClick={toggleHighContrast}
      className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
      aria-pressed={isHighContrast}
      aria-label={`Toggle high contrast mode. Currently ${isHighContrast ? 'enabled' : 'disabled'}`}
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
      {isHighContrast ? 'Disable' : 'Enable'} High Contrast
    </button>
  );
};

// High Contrast CSS Classes
export const highContrastStyles = `
  .high-contrast {
    --color-bg: #000000;
    --color-text: #ffffff;
    --color-border: #ffffff;
    --color-primary: #ffff00;
    --color-secondary: #00ffff;
    --color-accent: #ff00ff;
    --color-muted: #cccccc;
  }

  .high-contrast * {
    border-color: var(--color-border) !important;
    color: var(--color-text) !important;
    background-color: var(--color-bg) !important;
  }

  .high-contrast button {
    background-color: var(--color-bg) !important;
    border: 2px solid var(--color-border) !important;
    color: var(--color-text) !important;
  }

  .high-contrast button:hover,
  .high-contrast button:focus {
    background-color: var(--color-primary) !important;
    color: var(--color-bg) !important;
    border-color: var(--color-bg) !important;
  }

  .high-contrast a {
    color: var(--color-secondary) !important;
    text-decoration: underline !important;
  }

  .high-contrast a:hover,
  .high-contrast a:focus {
    color: var(--color-primary) !important;
    background-color: var(--color-secondary) !important;
  }

  .high-contrast input,
  .high-contrast textarea,
  .high-contrast select {
    background-color: var(--color-bg) !important;
    border: 2px solid var(--color-border) !important;
    color: var(--color-text) !important;
  }

  .high-contrast input:focus,
  .high-contrast textarea:focus,
  .high-contrast select:focus {
    outline: 3px solid var(--color-primary) !important;
    outline-offset: 2px !important;
  }

  .high-contrast .focus-visible {
    outline: 3px solid var(--color-primary) !important;
    outline-offset: 2px !important;
  }

  .high-contrast .sr-only {
    position: static !important;
    width: auto !important;
    height: auto !important;
    padding: 0.5rem !important;
    margin: 0 !important;
    overflow: visible !important;
    clip: auto !important;
    white-space: normal !important;
    background-color: var(--color-primary) !important;
    color: var(--color-bg) !important;
    border: 1px solid var(--color-border) !important;
  }
`;

export default HighContrastProvider;