/**
 * Test configuration and coverage settings
 * for the Crazy-Gary application
 */

export const testConfig = {
  // Coverage thresholds
  coverage: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    
    // Specific coverage thresholds for different types of code
    components: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    
    hooks: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    
    utils: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    
    api: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    
    contexts: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  
  // Test file patterns
  testPatterns: {
    unit: [
      'src/__tests__/utils/**/*.test.{ts,tsx}',
      'src/__tests__/lib/**/*.test.{ts,tsx}',
      'src/__tests__/hooks/**/*.test.{ts,tsx}',
      'src/__tests__/components/**/*.test.{ts,tsx}',
    ],
    
    integration: [
      'src/__tests__/integration/**/*.test.{ts,tsx}',
      'src/__tests__/e2e/**/*.test.{ts,tsx}',
    ],
    
    api: [
      'src/__tests__/api/**/*.test.{ts,tsx}',
    ],
    
    ui: [
      'src/__tests__/ui/**/*.test.{ts,tsx}',
    ],
    
    cache: [
      'src/__tests__/cache/**/*.test.{ts,tsx}',
    ],
    
    contexts: [
      'src/__tests__/contexts/**/*.test.{ts,tsx}',
    ],
  },
  
  // Test categories and priorities
  testCategories: {
    critical: {
      description: 'Critical functionality that must work',
      patterns: ['**/*critical*.test.{ts,tsx}', '**/*auth*.test.{ts,tsx}', '**/*login*.test.{ts,tsx}'],
      priority: 1,
    },
    
    important: {
      description: 'Important functionality that should work',
      patterns: ['**/*important*.test.{ts,tsx}', '**/*dashboard*.test.{ts,tsx}', '**/*api*.test.{ts,tsx}'],
      priority: 2,
    },
    
    standard: {
      description: 'Standard functionality',
      patterns: ['**/*.{test,spec}.{ts,tsx}'],
      priority: 3,
    },
    
    edge: {
      description: 'Edge cases and error handling',
      patterns: ['**/*edge*.test.{ts,tsx}', '**/*error*.test.{ts,tsx}'],
      priority: 4,
    },
  },
  
  // Mock configurations
  mocks: {
    api: {
      baseURL: 'http://localhost:3000/api',
      timeout: 5000,
      retries: 3,
      delay: 100,
    },
    
    auth: {
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token',
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      },
    },
    
    cache: {
      ttl: 300000, // 5 minutes
      maxSize: 100,
      strategy: 'memory',
    },
    
    storage: {
      localStorage: 'mock-local-storage',
      sessionStorage: 'mock-session-storage',
    },
  },
  
  // Test environment variables
  env: {
    NODE_ENV: 'test',
    VITE_API_URL: 'http://localhost:3000/api',
    VITE_APP_NAME: 'Crazy Gary Test',
    VITE_CACHE_ENABLED: 'true',
    VITE_MOCK_API: 'true',
  },
  
  // Browser compatibility
  browsers: {
    chrome: {
      version: 'latest',
      flags: ['--no-sandbox', '--disable-dev-shm-usage'],
    },
    
    firefox: {
      version: 'latest',
      flags: [],
    },
    
    safari: {
      version: 'latest',
      flags: [],
    },
  },
  
  // Performance testing
  performance: {
    thresholds: {
      renderTime: 16, // 60fps
      clickResponse: 100,
      apiResponse: 1000,
      cacheHit: 50,
    },
    
    stress: {
      users: 1000,
      duration: 30000, // 30 seconds
      rampUpTime: 5000, // 5 seconds
    },
  },
  
  // Accessibility testing
  accessibility: {
    wcagLevel: 'AA',
    rules: {
      'color-contrast': 'error',
      'keyboard-navigation': 'error',
      'focus-management': 'error',
      'aria-labels': 'warn',
      'semantic-html': 'warn',
    },
    
    components: {
      buttons: ['button-name', 'keyboard-accessible'],
      forms: ['label-association', 'error-messages'],
      navigation: ['skip-links', 'aria-current'],
      modals: ['focus-trap', 'aria-modal'],
    },
  },
  
  // Security testing
  security: {
    checks: {
      xss: 'error',
      csrf: 'error',
      injection: 'error',
      authentication: 'error',
      authorization: 'error',
    },
    
    headers: {
      'Content-Security-Policy': 'enforce',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
  
  // Monitoring and reporting
  reporting: {
    formats: ['html', 'json', 'lcov'],
    outputDir: 'coverage',
    reportsDir: 'test-reports',
    
    ci: {
      failOnCoverageBelow: 80,
      failOnTestFailures: true,
      uploadCoverage: true,
      uploadReports: true,
    },
  },
  
  // Continuous Integration
  ci: {
    nodeVersions: ['18.x', '20.x'],
    os: ['ubuntu-latest', 'windows-latest', 'macos-latest'],
    
    steps: {
      install: 'npm ci',
      build: 'npm run build',
      test: 'npm run test:coverage',
      lint: 'npm run lint',
      typecheck: 'npm run type-check',
    },
    
    artifacts: {
      'coverage/**': 'Coverage reports',
      'test-reports/**': 'Test reports',
      'dist/**': 'Build artifacts',
    },
  },
  
  // Documentation
  documentation: {
    testStrategy: 'docs/TESTING_STRATEGY.md',
    coverageReport: 'docs/COVERAGE_REPORT.md',
    bestPractices: 'docs/TESTING_BEST_PRACTICES.md',
    
    badges: {
      coverage: '![Coverage](https://img.shields.io/badge/Coverage-80%25-brightgreen)',
      tests: '![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen)',
      quality: '![Quality](https://img.shields.io/badge/Quality-A-brightgreen)',
    },
  },
}

export default testConfig
