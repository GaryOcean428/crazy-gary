# Visual Regression Testing Guide

## Overview

This guide covers the comprehensive visual regression testing implementation for the Crazy-Gary application. Visual regression testing helps catch unintended visual changes across different browsers, devices, themes, and states.

## Features

### ✅ Implemented Features

- **Multi-browser testing** (Chrome, Firefox, Safari)
- **Responsive design testing** (Mobile, Tablet, Desktop)
- **Theme testing** (Light/Dark mode)
- **Accessibility visual testing**
- **Error state testing**
- **Loading state testing**
- **Component-level testing**
- **Page-level testing**
- **CI/CD integration**
- **Automatic baseline updates**
- **Visual diff reporting**

## Getting Started

### Prerequisites

```bash
# Ensure you have the required dependencies installed
cd apps/web
npm install

# Install Playwright browsers
npx playwright install --with-deps
```

### Running Visual Tests

```bash
# Run all visual tests
npm run test:visual

# Run tests with headed browser (see tests in action)
npm run test:visual:headed

# Debug visual tests
npm run test:visual:debug

# Update baseline screenshots
npm run test:visual:update

# Run tests in CI mode (generate HTML report)
npm run test:visual:ci
```

### Test Categories

#### 1. Page Visual Tests (`tests/visual/pages.spec.ts`)

Tests all major application pages:
- Homepage
- Dashboard
- Login/Register
- Settings
- Task Manager
- Chat
- Model Control
- Monitoring
- Observability
- MCP Tools
- Heavy Page

Each page is tested in:
- Light theme
- Dark theme
- Multiple responsive breakpoints
- Different interaction states

#### 2. Component Visual Tests (`tests/visual/components.spec.ts`)

Tests individual UI components:
- Button variants (primary, secondary, outline, ghost, destructive)
- Form inputs (text, email, password, textarea, select)
- Card layouts
- Modal/Dialog components
- Navigation elements
- Loading states (spinner, skeleton, progress bars)
- Error and empty states

#### 3. Accessibility Visual Tests (`tests/visual/accessibility.spec.ts`)

Tests accessibility features visually:
- Focus management and indicators
- Color contrast compliance
- Keyboard navigation
- Screen reader support
- High contrast mode
- Reduced motion preferences
- Touch interface on mobile

#### 4. Error States Testing (`tests/visual/error-states.spec.ts`)

Tests various error scenarios:
- Error boundary fallbacks
- Network connectivity errors
- API error responses
- Form validation errors
- Loading states
- Empty states
- Offline states

## Test Structure

### Configuration

The visual tests are configured in `playwright.config.ts`:

```typescript
export default defineConfig({
  testDir: './tests',
  projects: [
    // Desktop browsers
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    
    // Mobile devices
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
    
    // Tablet
    { name: 'tablet', use: { ...devices['iPad Pro'] } },
  ],
})
```

### Utility Functions (`tests/visual/utils.ts`)

Key utilities for visual testing:

```typescript
// Theme switching
await switchTheme(page, 'dark')

// Responsive testing
await testResponsiveBreakpoints(page, 'component-name', [
  { width: 320, height: 568, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1024, height: 768, name: 'desktop' },
])

// Screenshot taking
await takeScreenshot(page, 'test-name', { 
  fullPage: true, 
  threshold: 0.1 
})

// Error state testing
await testErrorStates(page, 'component-name')

// Accessibility testing
await testAccessibilityVisual(page, 'component-name')
```

## Test Data and Configuration

### Responsive Breakpoints

```typescript
export const visualTestConfig = {
  breakpoints: [
    { width: 320, height: 568, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1024, height: 768, name: 'desktop-small' },
    { width: 1440, height: 900, name: 'desktop' },
    { width: 1920, height: 1080, name: 'desktop-large' },
  ],
  themes: ['light', 'dark'] as const,
  animationWaitTime: 500,
}
```

## CI/CD Integration

### GitHub Actions Workflow

The visual regression tests are integrated into CI/CD via `.github/workflows/visual-regression.yml`:

#### Workflow Jobs:

1. **visual-tests**: Main visual regression test suite
2. **visual-baseline-update**: Automatic baseline updates on main branch
3. **performance-visual-tests**: Cross-browser performance testing
4. **accessibility-visual-tests**: Dedicated accessibility visual tests
5. **mobile-visual-tests**: Mobile device specific testing

#### Workflow Triggers:

- Push to `main` or `develop` branches
- Pull requests to `main`
- Daily scheduled runs (2 AM UTC)

### Baseline Management

Visual baselines are automatically updated when:
- Changes are merged to `main` branch
- A PR is created with updated baselines
- Manual trigger via GitHub Actions

## Adding New Visual Tests

### 1. Add a New Page Test

```typescript
test.describe('New Page', () => {
  test('should match new page in light theme', async ({ page }) => {
    await page.goto('/new-page')
    await takeScreenshot(page, 'new-page-light', { fullPage: true })
  })

  test('should match new page in dark theme', async ({ page }) => {
    await page.goto('/new-page')
    await switchTheme(page, 'dark')
    await takeScreenshot(page, 'new-page-dark', { fullPage: true })
  })
})
```

### 2. Add a New Component Test

```typescript
test.describe('New Component', () => {
  test('should match new component variants', async ({ page }) => {
    await page.evaluate(() => {
      constElement('div')
 container = document.create      container.innerHTML = `
        <!-- Your component HTML here -->
      `
      document.body.appendChild(container)
    })
    await takeScreenshot(page, 'new-component')
  })
})
```

### 3. Add a New Accessibility Test

```typescript
test('should show focus indicators', async ({ page }) => {
  // Add interactive elements
  await page.evaluate(() => {
    // Add test content
  })
  
  // Test focus states
  await page.locator('button').focus()
  await takeScreenshot(page, 'focus-state')
})
```

## Best Practices

### 1. Test Naming

- Use descriptive test names: `should match dashboard in dark theme`
- Include theme and state information: `login-form-validation-errors`
- Use consistent naming: `component-variant-state`

### 2. Screenshot Management

- Keep screenshots small and focused
- Use appropriate thresholds (0.1 for most cases, 0.2 for complex content)
- Test at multiple breakpoints when relevant
- Include both light and dark themes

### 3. Test Isolation

- Each test should be independent
- Clean up test data after each test
- Use `beforeEach` to set up consistent starting states

### 4. Performance Considerations

- Use `fullyParallel: true` for faster execution
- Set appropriate timeouts for CI environments
- Use `trace: 'on-first-retry'` for debugging

## Debugging Failed Tests

### 1. View Test Results

```bash
# Generate HTML report
npm run test:visual:ci

# Open the report
npx playwright show-report
```

### 2. Debug Individual Tests

```bash
# Run specific test with debugging
npx playwright test --debug tests/visual/pages.spec.ts -g "should match homepage"

# Run with headed browser
npx playwright test --headed tests/visual/components.spec.ts
```

### 3. Update Baselines

```bash
# Update all baselines
npm run test:visual:update

# Update specific test baselines
npx playwright test --update-snapshots tests/visual/pages.spec.ts
```

## Troubleshooting

### Common Issues

1. **Flaky tests due to animations**
   - Add `await page.waitForTimeout(500)` after page loads
   - Use `animations: 'disabled'` in screenshot options

2. **Inconsistent theme switching**
   - Ensure theme toggle is visible before clicking
   - Wait for theme transition: `await page.waitForTimeout(300)`

3. **Mobile viewport issues**
   - Set specific viewport sizes
   - Wait for responsive layout: `await page.waitForTimeout(200)`

4. **Network-dependent tests**
   - Mock API responses where possible
   - Use appropriate timeouts for slow networks

### Visual Diff Analysis

When a test fails due to visual differences:

1. **Review the diff image** in the test results
2. **Check if the change is intentional**
3. **Update baselines if the change is correct**
4. **Fix the issue if the change is unintended**

## Performance Monitoring

### Test Execution Times

Monitor test execution times to identify performance issues:

```typescript
test('performance benchmark', async ({ page }) => {
  const startTime = Date.now()
  await page.goto('/complex-page')
  await takeScreenshot(page, 'complex-page', { fullPage: true })
  const loadTime = Date.now() - startTime
  
  expect(loadTime).toBeLessThan(5000) // 5 second threshold
})
```

### Memory Usage

For memory-intensive tests:

```typescript
test('memory usage test', async ({ page }) => {
  // Clear memory before test
  await page.evaluate(() => {
    if (window.gc) {
      window.gc()
    }
  })
  
  // Run test
  await page.goto('/heavy-page')
  await takeScreenshot(page, 'heavy-page')
  
  // Check for memory leaks
  const metrics = await page.evaluate(() => {
    return performance.memory ? {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize
    } : null
  })
})
```

## Maintenance

### Regular Tasks

1. **Review and update baselines** monthly
2. **Clean up old test artifacts** 
3. **Update Playwright and browser versions**
4. **Review test coverage** for new features
5. **Optimize test performance** as needed

### Baseline Storage

- Visual baselines are stored in `tests/visual/__snapshots__/`
- Baselines are committed to version control
- Each test gets its own baseline file
- Different browsers/devices get separate baseline files

## Contributing

When adding visual tests:

1. Follow the established naming conventions
2. Include both light and dark themes where applicable
3. Test at relevant responsive breakpoints
4. Add accessibility considerations
5. Update this documentation if adding new test patterns

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Visual Testing Best Practices](https://playwright.dev/docs/test-snapshots)
- [Accessibility Testing Guidelines](https://www.w3.org/WAI/test-evaluate/)
- [Responsive Design Testing](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Responsive)