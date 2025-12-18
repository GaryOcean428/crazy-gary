# Accessibility Testing Guide

## Overview

This guide provides comprehensive documentation for accessibility testing in the Crazy Gary application. Our goal is to ensure WCAG 2.1 AA compliance and provide an inclusive experience for all users.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Testing Categories](#testing-categories)
3. [Running Tests](#running-tests)
4. [Test Structure](#test-structure)
5. [Common Accessibility Patterns](#common-accessibility-patterns)
6. [Tools and Utilities](#tools-and-utilities)
7. [CI/CD Integration](#cicd-integration)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

The accessibility testing dependencies are already included in the project:

```bash
cd apps/web
npm install
```

### Quick Start

Run all accessibility tests:

```bash
npm run test -- --testPathPattern=accessibility
```

Generate accessibility report:

```bash
chmod +x scripts/accessibility-ci.sh
./scripts/accessibility-ci.sh
```

## Testing Categories

### 1. Keyboard Navigation Tests (`keyboard-navigation.test.tsx`)

Tests ensure all functionality is accessible via keyboard:

- **Tab Order**: Logical tab sequence through interactive elements
- **Arrow Key Navigation**: Navigation within composite widgets (menus, tabs, lists)
- **Enter/Space Activation**: Button and link activation
- **Escape Key Handling**: Modal and dropdown dismissal
- **Skip Links**: Quick navigation to main content
- **Roving Tabindex**: Complex widget navigation patterns

**Example Test:**

```typescript
it('maintains logical tab order through interactive elements', async () => {
  const user = userEvent.setup()
  
  render(
    <form>
      <input aria-label="First Input" />
      <button>First Button</button>
      <input aria-label="Second Input" />
    </form>
  )
  
  // Test tab order
  await user.tab()
  expect(screen.getByLabelText('First Input')).toHaveFocus()
  
  await user.tab()
  expect(screen.getByRole('button')).toHaveFocus()
})
```

### 2. Screen Reader Compatibility (`screen-reader.test.tsx`)

Validates ARIA implementation and semantic structure:

- **ARIA Labels**: Proper use of `aria-label` and `aria-labelledby`
- **Live Regions**: Dynamic content announcements
- **Complex Widgets**: Tabs, accordions, menus, comboboxes
- **Landmarks**: Page structure (header, nav, main, aside, footer)
- **Headings Hierarchy**: Logical heading structure
- **Form Associations**: Label-input relationships

**Example Test:**

```typescript
it('announces dynamic content changes', () => {
  render(
    <div aria-live="polite" aria-atomic="true">
      Updated: {message}
    </div>
  )
  
  // Test that live regions announce changes
  expect(screen.getByText(`Updated: ${message}`))
    .toHaveAttribute('aria-live', 'polite')
})
```

### 3. Color Contrast and Visual Accessibility (`color-contrast.test.tsx`)

Ensures sufficient color contrast and visual accessibility:

- **Contrast Ratios**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Focus Indicators**: Visible focus states with sufficient contrast
- **Color-blind Accessibility**: Information not conveyed by color alone
- **High Contrast Mode**: Support for system high contrast settings
- **Reduced Motion**: Respects `prefers-reduced-motion` preference

**Example Test:**

```typescript
it('validates AA compliance for normal text (4.5:1)', () => {
  const ratio = getContrastRatio('#1a1a1a', '#ffffff')
  expect(ratio).toBeGreaterThanOrEqual(4.5)
})
```

### 4. ARIA Attribute Validation (`aria-validation.test.tsx`)

Comprehensive ARIA attribute testing:

- **ARIA States**: `aria-expanded`, `aria-selected`, `aria-checked`, etc.
- **ARIA Properties**: `aria-label`, `aria-describedby`, `aria-controls`
- **ARIA Relationships**: Proper widget relationships
- **ARIA Live Regions**: Live content announcements
- **ARIA Global Attributes**: `aria-hidden`, `aria-label` on landmarks

**Example Test:**

```typescript
it('validates aria-expanded for disclosure patterns', () => {
  render(
    <button aria-expanded="false" aria-controls="content">
      Show details
    </button>
    <div id="content" hidden>
      Hidden content
    </div>
  )
  
  expect(screen.getByRole('button'))
    .toHaveAttribute('aria-expanded', 'false')
})
```

### 5. Focus Management and Tab Order (`focus-management.test.tsx`)

Tests focus behavior and management:

- **Initial Focus**: Proper focus placement on page load
- **Focus Trapping**: Focus containment in modals and dialogs
- **Focus Restoration**: Return focus to trigger elements
- **Keyboard Navigation**: Roving tabindex patterns
- **Focus Visibility**: Visible focus indicators

**Example Test:**

```typescript
it('traps focus within modal dialog', async () => {
  const user = userEvent.setup()
  
  render(<Modal isOpen={true}>...</Modal>)
  
  // Test focus cycling within modal
  await user.tab() // Should cycle within modal
  await user.tab({ shift: true }) // Should cycle back
})
```

## Running Tests

### Individual Test Suites

Run specific accessibility test categories:

```bash
# Keyboard navigation tests
npm run test -- keyboard-navigation

# Screen reader tests  
npm run test -- screen-reader

# Color contrast tests
npm run test -- color-contrast

# ARIA validation tests
npm run test -- aria-validation

# Focus management tests
npm run test -- focus-management
```

### Coverage Reports

Generate detailed coverage reports:

```bash
# Generate coverage for accessibility tests
npm run test -- --coverage --testPathPattern=accessibility

# View HTML coverage report
open coverage/index.html
```

### Accessibility Report

Generate comprehensive accessibility report:

```bash
./scripts/accessibility-ci.sh --test-built
```

This generates:
- HTML accessibility report
- JUnit XML for CI integration
- JSON reports for external tools

### Built Application Testing

Test the built application for accessibility:

```bash
# Build and test
npm run build
npx axe-core dist

# Test with pa11y (if installed)
pa11y http://localhost:3000 --standard WCAG2AA
```

## Test Structure

### Test File Organization

```
src/__tests__/accessibility/
├── accessibility.test.tsx          # Core accessibility components
├── keyboard-navigation.test.tsx    # Keyboard navigation patterns
├── screen-reader.test.tsx          # Screen reader compatibility
├── color-contrast.test.tsx         # Color contrast and visual accessibility
├── aria-validation.test.tsx        # ARIA attribute validation
├── focus-management.test.tsx       # Focus management and tab order
└── accessibility-test-utils.ts     # Test utilities and helpers
```

### Test Utilities

The `accessibility-test-utils.ts` file provides:

- `runAxeTest()` - Run axe-core tests with custom configuration
- `assertNoAccessibilityViolations()` - Assert no violations found
- `testKeyboardNavigation()` - Test keyboard navigation patterns
- `testFocusManagement()` - Test focus behavior
- `testColorContrast()` - Validate color contrast ratios
- `testAriaAttributes()` - Test ARIA attribute usage
- `testLiveRegion()` - Test live region announcements

**Example Usage:**

```typescript
import { 
  assertNoAccessibilityViolations, 
  testKeyboardNavigation,
  testFocusManagement 
} from './accessibility-test-utils'

it('should not have accessibility violations', async () => {
  render(<MyComponent />)
  await assertNoAccessibilityViolations(document.body)
})

it('should handle keyboard navigation', async () => {
  render(<MyComponent />)
  const firstButton = screen.getByRole('button')
  
  await testKeyboardNavigation(firstButton, [
    { key: 'Tab', expectedFocusTarget: '[data-testid="next-element"]' },
    { key: 'Enter', expectedElementState: { 'aria-expanded': 'true' } }
  ])
})
```

## Common Accessibility Patterns

### Button Pattern

```typescript
// ✅ Good - Accessible button
<button 
  aria-label="Save document"
  aria-describedby="save-help"
  onClick={handleSave}
>
  💾
  <span className="sr-only">Save</span>
</button>
<div id="save-help" className="sr-only">
  Save the current document
</div>

// ❌ Bad - Inaccessible button
<button onClick={handleSave}>
  💾
</button>
```

### Form Field Pattern

```typescript
// ✅ Good - Accessible form field
<div>
  <label htmlFor="email-input">
    Email Address <span aria-label="required">*</span>
  </label>
  <input 
    id="email-input"
    type="email"
    aria-required="true"
    aria-invalid={hasError}
    aria-describedby="email-error email-help"
  />
  <div id="email-help" className="sr-only">
    Enter your email address
  </div>
  {hasError && (
    <div id="email-error" role="alert">
      Please enter a valid email address
    </div>
  )}
</div>
```

### Modal Pattern

```typescript
// ✅ Good - Accessible modal
{isOpen && (
  <div 
    role="dialog" 
    aria-modal="true"
    aria-labelledby="modal-title"
    aria-describedby="modal-description"
  >
    <h2 id="modal-title">Confirm Action</h2>
    <p id="modal-description">Are you sure you want to proceed?</p>
    
    <button onClick={onClose}>Cancel</button>
    <button onClick={onConfirm}>Confirm</button>
  </div>
)}
```

### Menu Pattern

```typescript
// ✅ Good - Accessible menu
<div role="menu" aria-label="File operations">
  <div 
    role="menuitem" 
    tabIndex={0}
    aria-haspopup="false"
  >
    New File
  </div>
  <div 
    role="menuitem" 
    tabIndex={-1}
    aria-disabled="true"
  >
    Open File (Disabled)
  </div>
</div>
```

## Tools and Utilities

### axe-core Integration

axe-core is automatically configured in tests:

```typescript
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

it('should not have accessibility violations', async () => {
  const { container } = render(<Component />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### Color Contrast Calculator

```typescript
import { calculateContrastRatio, getRelativeLuminance } from './accessibility-test-utils'

const ratio = calculateContrastRatio('#000000', '#ffffff')
expect(ratio).toBeGreaterThanOrEqual(4.5)
```

### Focus Management Utilities

```typescript
import { testFocusTrap, testFocusManagement } from './accessibility-test-utils'

// Test focus trapping in modal
await testFocusTrap(modalElement, focusableElements)

// Test focus management
await testFocusManagement(() => {
  openModal()
}, '[data-testid="modal-button"]')
```

### Keyboard Navigation Testing

```typescript
import { testKeyboardNavigation } from './accessibility-test-utils'

await testKeyboardNavigation(firstElement, [
  { key: 'ArrowDown', expectedFocusTarget: '[role="option"]:nth-child(2)' },
  { key: 'Enter', expectedElementState: { 'aria-selected': 'true' } }
])
```

## CI/CD Integration

### GitHub Actions

The accessibility tests run automatically on:

- Pull requests to main/develop
- Pushes to main/develop branches
- Daily scheduled runs (2 AM UTC)

### Local CI Simulation

Run the same checks as CI locally:

```bash
./scripts/accessibility-ci.sh --test-built
```

### Test Results

Accessibility test results are available as:

- **Artifacts**: Detailed reports and coverage data
- **PR Comments**: Automated feedback on pull requests
- **Commit Status**: Integration with branch protection rules

### CI Configuration

Modify `.github/workflows/accessibility.yml` to customize:

- Node.js versions to test
- Test execution options
- Reporting settings
- Notification rules

## Troubleshooting

### Common Issues

#### 1. Test Timeouts

```typescript
// Increase timeout for complex accessibility tests
it('should handle complex navigation', async () => {
  // Test implementation
}, { timeout: 10000 })
```

#### 2. Focus Issues in Tests

```typescript
// Ensure proper setup for focus tests
beforeEach(() => {
  // Set up focus management
  document.body.innerHTML = ''
})
```

#### 3. Color Contrast Testing

```typescript
// Mock canvas for color calculations
global.HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  // Mock implementation
})
```

#### 4. ARIA Attribute Validation

```typescript
// Use test utilities for ARIA validation
import { testAriaAttributes } from './accessibility-test-utils'

testAriaAttributes(element, {
  'aria-label': 'Expected Label',
  'aria-expanded': 'false',
  'aria-hidden': null
})
```

### Debugging Failed Tests

1. **Enable verbose output:**
   ```bash
   npm run test -- --reporter=verbose
   ```

2. **Run single test:**
   ```bash
   npm run test -- --testNamePattern="specific test name"
   ```

3. **Inspect accessibility violations:**
   ```typescript
   const results = await axe(container)
   console.log('Violations:', results.violations)
   ```

4. **Visual debugging:**
   ```typescript
   // Add debug output
   screen.debug() // Print DOM structure
   ```

## Best Practices

### Writing Accessibility Tests

1. **Test Real User Interactions**: Simulate actual user behavior
2. **Use Semantic Queries**: Prefer `getByRole` over `getByTestId`
3. **Test Keyboard and Mouse**: Ensure both work equivalently
4. **Validate ARIA Usage**: Test proper ARIA implementation
5. **Check Focus Management**: Verify focus behavior
6. **Test Error States**: Validate error handling and announcements

### Component Development

1. **Start with Semantic HTML**: Use native elements when possible
2. **Add ARIA as Enhancement**: Only use ARIA to enhance, not replace semantics
3. **Test with Screen Readers**: Verify compatibility with NVDA, JAWS, VoiceOver
4. **Use Color Contrast Tools**: Validate color choices during design
5. **Implement Focus Management**: Handle focus properly in all interactions

### Performance Considerations

1. **Mock Heavy Dependencies**: Use mocks for external services
2. **Optimize Test Structure**: Group related tests appropriately
3. **Use Efficient Queries**: Avoid expensive DOM queries in tests
4. **Parallel Testing**: Run tests in parallel when possible

### Continuous Improvement

1. **Regular WCAG Updates**: Stay current with accessibility guidelines
2. **User Feedback**: Incorporate real user accessibility feedback
3. **Tool Updates**: Keep accessibility testing tools updated
4. **Pattern Evolution**: Update patterns as best practices evolve

## Resources

### WCAG Guidelines
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WCAG 2.1 Understanding Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/)

### Testing Tools
- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [Testing Library Accessibility](https://testing-library.com/docs/dom-testing-library/api-accessibility/)
- [Pa11y Documentation](https://pa11y.org/)

### Development Resources
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM Resources](https://webaim.org/)

### Color Contrast
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)

---

For questions or issues with accessibility testing, please refer to the project documentation or create an issue in the repository.
