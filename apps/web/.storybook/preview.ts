import type { Preview } from '@storybook/react';
import React from 'react';
import '../src/index.css';
import { ThemeProvider } from '../src/components/theme-provider';
import { AuthProvider } from '../src/contexts/auth-context';
import { HighContrastProvider } from '../src/components/high-contrast-provider';
import { withThemeByClassName } from '@storybook/addon-themes';

// Global decorator to wrap all stories with theme providers
const preview: Preview = {
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'light';
      return (
        <ThemeProvider>
          <AuthProvider>
            <HighContrastProvider>
              <div className={theme}>
                <Story />
              </div>
            </HighContrastProvider>
          </AuthProvider>
        </ThemeProvider>
      );
    },
    withThemeByClassName({
      themes: {
        light: 'light',
        dark: 'dark',
        system: 'system',
      },
      defaultTheme: 'light',
    }),
  ],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      toc: true,
    },
    a11y: {
      // Configuration for accessibility addon
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
          {
            id: 'label',
            enabled: true,
          },
          {
            id: 'image-alt',
            enabled: true,
          },
        ],
      },
      options: {
        // Run WCAG 2.1 AA rules for all stories
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa'],
        },
      },
    },
    viewport: {
      viewports: {
        mobile1: {
          name: 'Small Phone',
          styles: { width: '320px', height: '568px' },
        },
        mobile2: {
          name: 'Large Phone',
          styles: { width: '414px', height: '896px' },
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1200px', height: '800px' },
        },
        large: {
          name: 'Large Desktop',
          styles: { width: '1440px', height: '900px' },
        },
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
          { value: 'system', title: 'System', icon: 'mirror' },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;