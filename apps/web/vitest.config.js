/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: 'coverage',
      
      // Coverage thresholds - target 80%+ overall
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        
        // Component-specific thresholds
        'src/components/**': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        
        // Hook-specific thresholds (higher due to criticality)
        'src/hooks/**': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        
        // Utility function thresholds (highest due to foundational nature)
        'src/lib/utils/**': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
        
        // Context providers (high due to state management)
        'src/contexts/**': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        
        // API services
        'src/lib/api-client/**': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        
        // Cache system (critical for performance)
        'src/lib/cache/**': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
      },
      
      // Exclude patterns
      exclude: [
        'node_modules/',
        'src/test-setup.ts',
        'src/__tests__/**',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/*.spec.{js,jsx,ts,tsx}',
        'src/**/index.{ts,tsx}',
        'src/**/*.stories.{ts,tsx}',
        'src/**/*.d.ts',
        'dist/',
        'build/',
        '.next/',
        '.turbo/',
        'coverage/',
        '**/node_modules/**',
        '**/.{idea,git,cache,output}/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      ],
      
      // Include patterns
      include: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/index.{ts,tsx}',
      ],
      
      // Watermarks for coverage display
      watermarks: {
        high: [80, 100],
        medium: [50, 80],
        low: [0, 50],
      },
    },
    
    // Pool configuration for parallel testing
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true, // Set to false for parallel testing
      },
    },
    
    // reporters
    reporters: [
      'default',
      ['html', { 
        outputFile: 'test-reports/index.html',
        publicPath: 'test-reports/',
      }],
      ['json', {
        outputFile: 'test-reports/results.json',
      }],
    ],
    
    // Output directory for test results
    outputFile: {
      json: 'test-reports/results.json',
      html: 'test-reports/index.html',
    },
    
    // File watching
    watchExclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/test-reports/**',
      '**/.{idea,git,cache,output}/**',
    ],
    
    // Environment variables
    env: {
      NODE_ENV: 'test',
      VITE_API_URL: 'http://localhost:3000/api',
      VITE_APP_NAME: 'Crazy Gary Test',
      VITE_CACHE_ENABLED: 'true',
      VITE_MOCK_API: 'true',
    },
    
    // CSS handling
    css: false, // Disable CSS processing in tests for performance
    
    // Inline source maps for better debugging
    sourcemap: 'inline',
    
    // Test matching patterns
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'src/**/__tests__/**/*.{ts,tsx}',
    ],
    
    exclude: [
      'node_modules/',
      'dist/',
      'build/',
      'coverage/',
      'test-reports/',
      '**/*.d.ts',
      '**/*.config.{js,ts}',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['@testing-library/react', '@testing-library/jest-dom'],
  },
})