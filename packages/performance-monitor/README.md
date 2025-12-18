# Performance Monitoring System

A comprehensive performance monitoring and optimization system for React applications with real-time tracking, alerting, and performance regression testing.

## Features

- **Web Vitals Tracking**: Monitor LCP, FID, CLS, FCP, TTFB, and INP metrics
- **Performance Budgets**: Set and enforce performance budgets with alerts
- **Memory Monitoring**: Track memory usage and detect potential leaks
- **Bundle Analysis**: Analyze bundle sizes and code splitting effectiveness
- **Performance Dashboard**: Interactive React dashboard for monitoring
- **Regression Testing**: Automated performance regression testing
- **Real-time Alerts**: Configurable alert system for performance issues
- **Trend Analysis**: Historical performance data and trend visualization

## Installation

```bash
# Install in your React project
yarn add @crazy-gary/performance-monitor

# Or with npm
npm install @crazy-gary/performance-monitor
```

## Quick Start

### 1. Basic Integration

```tsx
import React from 'react';
import { PerformanceMonitor, PerformanceDashboard } from '@crazy-gary/performance-monitor';

// Initialize in your main App component
function App() {
  React.useEffect(() => {
    // Initialize performance monitoring
    PerformanceMonitor.initialize({
      enabled: true,
      sampleRate: 1.0, // Monitor 100% of users in development
      autoReport: true,
      reportInterval: 30000 // Report every 30 seconds
    });

    // Start monitoring
    PerformanceMonitor.start();
  }, []);

  return (
    <div className="App">
      {/* Your app content */}
      
      {/* Add performance dashboard (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <PerformanceDashboard />
      )}
    </div>
  );
}

export default App;
```

### 2. Custom Configuration

```tsx
import { PerformanceMonitor } from '@crazy-gary/performance-monitor';

// Initialize with custom configuration
PerformanceMonitor.initialize({
  enabled: true,
  sampleRate: 0.1, // Monitor 10% of users
  budgets: [
    {
      name: 'LCP',
      value: 2500,
      unit: 'ms',
      type: 'largest-contentful-paint',
      threshold: 'good'
    },
    {
      name: 'Bundle Size',
      value: 500,
      unit: 'KB',
      type: 'bundle-size',
      threshold: 'good'
    },
    {
      name: 'Memory Usage',
      value: 50,
      unit: 'MB',
      type: 'memory',
      threshold: 'good'
    }
  ],
  autoReport: true,
  reportInterval: 60000, // 1 minute
  enableMemoryMonitoring: true,
  enableBundleAnalysis: true,
  enableCodeSplittingMonitoring: true,
  alertThresholds: {
    memoryLeak: 10, // MB increase
    bundleSizeIncrease: 15, // percentage
    performanceRegression: 25 // percentage
  }
});
```

### 3. React Hook Integration

```tsx
import React from 'react';
import { usePerformanceMonitoring } from '@crazy-gary/performance-monitor';

function PerformanceWidget() {
  const performance = usePerformanceMonitoring();
  
  if (!performance) return null;

  return (
    <div className="performance-widget">
      <h3>Performance Status</h3>
      <p>Monitoring: {performance.isMonitoring ? 'Active' : 'Inactive'}</p>
      <p>Active Alerts: {performance.alerts.filter(a => !a.resolved).length}</p>
      <button onClick={() => performance.generateReport()}>
        Generate Report
      </button>
    </div>
  );
}
```

### 4. Performance Dashboard

The performance dashboard provides a comprehensive view of your application's performance:

```tsx
import React from 'react';
import { PerformanceDashboard } from '@crazy-gary/performance-monitor';

function DevTools() {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="dev-tools">
      <h2>Performance Monitoring</h2>
      <PerformanceDashboard />
    </div>
  );
}
```

### 5. Custom Performance Testing

```tsx
import { 
  PerformanceTestRunner, 
  createTestCase, 
  defaultThresholds 
} from '@crazy-gary/performance-monitor';

const testRunner = new PerformanceTestRunner();

// Define test cases
const homepageTest = createTestCase(
  'Homepage Performance',
  'http://localhost:3000',
  [
    { action: 'navigate', target: 'http://localhost:3000' },
    { action: 'wait', duration: 2000 },
    { action: 'scroll', duration: 500 },
    { action: 'wait', duration: 1000 }
  ],
  {
    ...defaultThresholds,
    LCP: { max: 2000, warn: 1500 }, // Stricter threshold
    memory: { max: 40, warn: 30 }
  }
);

// Run tests
async function runPerformanceTests() {
  const results = await testRunner.runTestSuite([homepageTest]);
  
  results.forEach(result => {
    console.log(`${result.testCase}: ${result.passed ? 'PASSED' : 'FAILED'}`);
    if (!result.passed) {
      console.log('Regressions:', result.regressions);
    }
  });

  // Generate report
  const report = testRunner.generateTestReport();
  console.log('Performance Test Report:', report);
}
```

## Configuration Options

### MonitoringConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `true` | Enable/disable performance monitoring |
| `sampleRate` | number | `1.0` | Percentage of users to monitor (0-1) |
| `budgets` | PerformanceBudget[] | `[]` | Performance budget thresholds |
| `autoReport` | boolean | `true` | Enable automatic report generation |
| `reportInterval` | number | `30000` | Report generation interval (ms) |
| `enableMemoryMonitoring` | boolean | `true` | Enable memory usage tracking |
| `enableBundleAnalysis` | boolean | `true` | Enable bundle size analysis |
| `enableCodeSplittingMonitoring` | boolean | `true` | Monitor code splitting |
| `alertThresholds` | AlertThresholds | `{}` | Alert trigger thresholds |

### Performance Budgets

```typescript
interface PerformanceBudget {
  name: string;           // Budget name
  value: number;          // Threshold value
  unit: 'ms' | 'KB' | 'MB' | 'bytes';
  type: 'largest-contentful-paint' | 'first-input-delay' | 'cumulative-layout-shift' | 'bundle-size' | 'network' | 'memory';
  threshold: 'good' | 'needs-improvement' | 'poor';
}
```

## API Reference

### Core Functions

#### `PerformanceMonitor.initialize(config)`
Initialize the performance monitoring system with custom configuration.

#### `PerformanceMonitor.start()`
Start performance monitoring.

#### `PerformanceMonitor.stop()`
Stop performance monitoring.

#### `PerformanceMonitor.generateReport()`
Generate and return a performance report.

#### `PerformanceMonitor.getStatus()`
Get current monitoring status and configuration.

### React Hooks

#### `usePerformanceMonitoring()`
Access the performance monitoring store in React components.

```tsx
const { 
  config, 
  currentReport, 
  alerts, 
  isMonitoring,
  startMonitoring,
  stopMonitoring,
  generateReport 
} = usePerformanceMonitoring();
```

### Utility Functions

#### `DevTools.clearAllData()`
Clear all performance data (development only).

#### `DevTools.getDebugInfo()`
Get debug information for development.

## Web Vitals Integration

The system automatically tracks Core Web Vitals:

- **LCP (Largest Contentful Paint)**: Measures loading performance
- **FID (First Input Delay)**: Measures interactivity
- **CLS (Cumulative Layout Shift)**: Measures visual stability
- **FCP (First Contentful Paint)**: Measures user-perceived loading speed
- **TTFB (Time to First Byte)**: Measures server response time
- **INP (Interaction to Next Paint)**: Measures overall responsiveness

## Performance Budgets

Set performance budgets to maintain application performance:

```typescript
PerformanceMonitor.initialize({
  budgets: [
    { name: 'LCP', value: 2500, unit: 'ms', type: 'largest-contentful-paint', threshold: 'good' },
    { name: 'FID', value: 100, unit: 'ms', type: 'first-input-delay', threshold: 'good' },
    { name: 'CLS', value: 0.1, unit: 'ms', type: 'cumulative-layout-shift', threshold: 'good' },
    { name: 'Bundle Size', value: 500, unit: 'KB', type: 'bundle-size', threshold: 'good' }
  ]
});
```

## Memory Monitoring

Track memory usage and detect potential leaks:

```typescript
// Memory usage is automatically tracked
// Access memory data through the dashboard or API
const memoryData = MemoryMonitor.getMemoryHistory();
const memoryStats = MemoryMonitor.getCurrentMemoryStats();

// Set custom leak threshold
MemoryMonitor.setLeakThreshold(15); // 15MB
```

## Bundle Analysis

Monitor bundle sizes and code splitting:

```typescript
// Bundle analysis is automatic
const bundleReport = BundleAnalyzer.generateBundleReport();
const bundleBreakdown = BundleAnalyzer.getBundleSizeBreakdown();

// Monitor lazy loading
const codeSplittingMetrics = BundleAnalyzer.getCodeSplittingMetrics();
```

## Performance Testing

Automated performance regression testing:

```typescript
import { 
  PerformanceTestRunner, 
  createTestCase, 
  defaultThresholds 
} from '@crazy-gary/performance-monitor';

const runner = new PerformanceTestRunner();

// Create test cases
const testCase = createTestCase(
  'User Journey Test',
  'http://localhost:3000',
  [
    { action: 'navigate', target: 'http://localhost:3000' },
    { action: 'click', target: '[data-testid="signup-button"]' },
    { action: 'type', target: '#email', value: 'test@example.com' },
    { action: 'click', target: '[data-testid="submit-button"]' }
  ],
  defaultThresholds
);

// Run tests
const results = await runner.runTestSuite([testCase]);
```

## Alerts and Notifications

The system provides real-time alerts for performance issues:

```typescript
// Listen for alerts
AlertManager.subscribe((alert) => {
  console.log('Performance Alert:', alert);
  
  // Send to external service
  if (alert.severity === 'critical') {
    // Notify team via Slack, email, etc.
  }
});

// Get alert statistics
const stats = AlertManager.getAlertStats();
```

## Development Tools

Access development utilities:

```typescript
// Clear all data (development only)
DevTools.clearAllData();

// Get debug information
const debugInfo = DevTools.getDebugInfo();
console.log('Performance Debug Info:', debugInfo);
```

## Best Practices

1. **Enable in Development**: Use the performance dashboard during development to catch issues early
2. **Sample Rate**: Use lower sample rates (0.1-0.5) in production to reduce overhead
3. **Budgets**: Set realistic budgets based on your application's needs
4. **Memory Monitoring**: Monitor memory usage, especially for long-running applications
5. **Testing**: Run performance tests as part of your CI/CD pipeline
6. **Alerts**: Configure appropriate alert thresholds for your team

## Integration Examples

### Next.js Integration

```tsx
// pages/_app.tsx
import { useEffect } from 'react';
import { PerformanceMonitor } from '@crazy-gary/performance-monitor';

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    PerformanceMonitor.initialize({
      enabled: process.env.NODE_ENV === 'development',
      sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0
    });
    
    if (process.env.NODE_ENV === 'development') {
      PerformanceMonitor.start();
    }
  }, []);

  return <Component {...pageProps} />;
}
```

### Vite Integration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select']
        }
      }
    }
  }
});
```

### CI/CD Integration

```yaml
# .github/workflows/performance-tests.yml
name: Performance Tests

on: [push, pull_request]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm run build
      
      - name: Run Performance Tests
        run: |
          node -e "
            const { performanceTestRunner } = require('./dist/performance-monitor');
            // Run your performance tests here
          "
      
      - name: Upload Performance Reports
        uses: actions/upload-artifact@v2
        with:
          name: performance-reports
          path: performance-report.json
```

## Troubleshooting

### Common Issues

1. **Dashboard not showing**: Ensure you're in development mode and the component is imported
2. **No Web Vitals data**: Check if the page has fully loaded and interactions have occurred
3. **Memory data unavailable**: Performance.memory API may not be available in all browsers
4. **Bundle analysis empty**: This is normal in development mode; build your app for accurate analysis

### Browser Support

- **Web Vitals**: All modern browsers
- **Performance API**: Chrome 60+, Firefox 60+, Safari 12.1+
- **Memory API**: Chrome only (for memory monitoring)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.