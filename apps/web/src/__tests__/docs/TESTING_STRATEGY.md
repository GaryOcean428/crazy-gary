# Testing Strategy and Best Practices

## Overview

This document outlines the comprehensive testing strategy for the Crazy-Gary application, designed to achieve and maintain 80%+ test coverage while ensuring high code quality and reliability.

## Testing Pyramid

Our testing strategy follows the testing pyramid approach:

```
                    E2E Tests (10%)
                 ┌─────────────────┐
                 │   End-to-End    │
                 │     Tests       │
                 └─────────────────┘
                   Integration Tests (20%)
                ┌─────────────────────────┐
                │   API & Component       │
                │     Integration         │
                └─────────────────────────┘
                   Unit Tests (70%)
                ┌─────────────────────────────┐
                │   Components, Hooks,       │
                │     Utils, Services        │
                └─────────────────────────────┘
```

## Test Categories

### 1. Unit Tests (70% of tests)

**Purpose**: Test individual components, functions, and hooks in isolation.

**Coverage Targets**:
- Components: 85%
- Hooks: 90%
- Utils: 95%
- Services: 85%

**Location**: `src/__tests__/{category}/`

**Examples**:
- `src/__tests__/ui/button.test.tsx`
- `src/__tests__/hooks/use-toast.test.ts`
- `src/__tests__/lib/utils.test.ts`
- `src/__tests__/cache/cache.test.ts`

### 2. Integration Tests (20% of tests)

**Purpose**: Test how different parts work together.

**Coverage Targets**:
- API integration: 85%
- Context integration: 90%
- Component integration: 80%

**Location**: `src/__tests__/integration/`

**Examples**:
- `src/__tests__/integration/auth-flow.test.tsx`
- `src/__tests__/integration/api-client.test.ts`

### 3. End-to-End Tests (10% of tests)

**Purpose**: Test complete user workflows.

**Coverage Targets**:
- Critical user journeys: 100%
- Authentication flows: 100%
- Core functionality: 90%

**Location**: `src/__tests__/e2e/`

**Examples**:
- `src/__tests__/e2e/user-registration.test.ts`
- `src/__tests__/e2e/task-management.test.ts`

## Test File Organization

```
src/__tests__/
├── config/              # Test configuration
├── utils/               # Test utilities and helpers
├── components/          # UI component tests
│   ├── ui/             # Shadcn/ui component tests
│   └── layout/         # Layout component tests
├── hooks/              # Custom hook tests
├── lib/                # Utility and service tests
│   ├── cache/          # Cache system tests
│   ├── api/            # API client tests
│   └── validation.ts   # Validation tests
├── contexts/           # React context tests
├── integration/        # Integration tests
├── e2e/               # End-to-end tests
└── fixtures/          # Test data and fixtures
```

## Test Naming Conventions

### File Naming
- `{ComponentName}.test.{ts,tsx}` for component tests
- `{HookName}.test.{ts,tsx}` for hook tests
- `{ServiceName}.test.{ts,tsx}` for service tests
- `{Feature}.integration.test.{ts,tsx}` for integration tests

### Test Naming
- Use descriptive names that explain the scenario
- Start with "should" for positive tests
- Use "should handle" for error cases
- Use "should not" for negative tests

**Examples**:
```typescript
describe('Button Component', () => {
  it('should render with default props', () => {})
  it('should handle click events', () => {})
  it('should not call handler when disabled', () => {})
  it('should handle loading state', () => {})
})
```

## Test Writing Guidelines

### 1. Component Tests

**Structure**:
```typescript
describe('ComponentName', () => {
  // Setup
  beforeEach(() => {
    // Common setup
  })
  
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<ComponentName />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })
  
  describe('Interactions', () => {
    it('should handle user interactions', async () => {
      const user = userEvent.setup()
      render(<ComponentName />)
      
      await user.click(screen.getByRole('button'))
      expect(mockFn).toHaveBeenCalled()
    })
  })
  
  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<ComponentName aria-label="Test" />)
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Test')
    })
  })
  
  describe('Edge Cases', () => {
    it('should handle null/undefined props', () => {
      render(<ComponentName prop={null} />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })
})
```

### 2. Hook Tests

**Structure**:
```typescript
describe('useHookName', () => {
  it('should return initial state', () => {
    const { result } = renderHook(() => useHookName())
    expect(result.current).toEqual(expectedInitialState)
  })
  
  it('should update state on action', async () => {
    const { result } = renderHook(() => useHookName())
    
    act(() => {
      result.current.action()
    })
    
    expect(result.current.state).toEqual(expectedState)
  })
})
```

### 3. Service Tests

**Structure**:
```typescript
describe('ServiceName', () => {
  it('should perform expected operation', async () => {
    const result = await service.method()
    expect(result).toEqual(expectedResult)
  })
  
  it('should handle errors gracefully', async () => {
    mockApi.mockRejectedValue(new Error('API Error'))
    
    await expect(service.method()).rejects.toThrow('API Error')
  })
})
```

## Test Data Management

### Mock Data
Use the test utilities for consistent mock data:

```typescript
import { 
  createMockUser, 
  createMockTask, 
  generateUsers,
  testConfig 
} from '@/__tests__/utils/test-utils'

// Create single mock
const user = createMockUser({ role: 'admin' })

// Generate multiple mocks
const users = generateUsers(10)

// Use test configuration
const timeout = testConfig.defaultTimeout
```

### Test Fixtures
Store complex test data in fixtures:

```typescript
// src/__tests__/fixtures/mockData.ts
export const mockUserWithTasks = {
  user: createMockUser(),
  tasks: generateTasks(5),
  preferences: { theme: 'dark' }
}
```

## Mocking Strategy

### 1. External Dependencies
```typescript
// Mock API calls
vi.mock('@/lib/api-client', () => ({
  ApiClient: vi.fn().mockImplementation(() => ({
    get: vi.fn().mockResolvedValue({ data: mockData }),
    post: vi.fn().mockResolvedValue({ data: mockData }),
  })),
}))

// Mock browser APIs
beforeEach(() => {
  mockIntersectionObserver()
  mockResizeObserver()
})
```

### 2. Context Providers
```typescript
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          {ui}
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
```

## Testing Patterns

### 1. Component Testing Patterns

#### Render Props Pattern
```typescript
it('should render children when no error', () => {
  render(
    <ErrorBoundary>
      <TestComponent />
    </ErrorBoundary>
  )
  
  expect(screen.getByText('Test component content')).toBeInTheDocument()
})
```

#### Provider Pattern
```typescript
it('should use auth context', () => {
  renderWithProviders(
    <TestComponent />,
    { authState: { isAuthenticated: true, user: mockUser } }
  )
  
  expect(screen.getByText(`Welcome ${mockUser.name}`)).toBeInTheDocument()
})
```

### 2. Async Testing Patterns

#### Promises and Async/Await
```typescript
it('should handle async operations', async () => {
  render(<AsyncComponent />)
  
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument()
  })
})
```

#### Loading States
```typescript
it('should show loading state', async () => {
  render(<AsyncComponent />)
  
  expect(screen.getByText('Loading...')).toBeInTheDocument()
  
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument()
  })
})
```

### 3. Error Testing Patterns

#### Error Boundaries
```typescript
it('should catch component errors', () => {
  const ThrowError = () => {
    throw new Error('Test error')
  }
  
  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  )
  
  expect(screen.getByText('Something went wrong')).toBeInTheDocument()
})
```

#### API Error Handling
```typescript
it('should handle API errors', async () => {
  mockApi.mockRejectedValue(new Error('Network error'))
  
  render(<ApiComponent />)
  
  await waitFor(() => {
    expect(screen.getByText('Failed to load')).toBeInTheDocument()
  })
})
```

## Coverage Requirements

### Overall Targets
- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 80%
- **Statements**: 80%

### Specific Targets
- **UI Components**: 85%
- **Custom Hooks**: 90%
- **Utility Functions**: 95%
- **API Services**: 85%
- **Context Providers**: 90%

### Critical Code Paths
Must achieve 100% coverage:
- Authentication flows
- Error handling
- Input validation
- Security checks
- Payment processing

## Performance Testing

### Rendering Performance
```typescript
it('should render efficiently', async () => {
  const { measureRenderTime } = await import('@/__tests__/utils/test-utils')
  
  const { renderTime } = await measureRenderTime(() => {
    render(<ComplexComponent />)
  })
  
  expect(renderTime).toBeLessThan(16) // 60fps threshold
})
```

### Memory Testing
```typescript
it('should not cause memory leaks', () => {
  const { unmount } = render(<ComponentWithSubscriptions />)
  
  unmount()
  
  // Check that subscriptions are cleaned up
  expect(mockSubscription.unsubscribe).toHaveBeenCalled()
})
```

## Accessibility Testing

### Automated Testing
```typescript
it('should be accessible', async () => {
  render(<AccessibleComponent />)
  
  const results = await axe(document.body)
  expect(results).toHaveNoViolations()
})
```

### Manual Testing
```typescript
it('should support keyboard navigation', async () => {
  const user = userEvent.setup()
  render(<FocusableComponent />)
  
  const element = screen.getByRole('button')
  element.focus()
  
  await user.keyboard('{Tab}')
  expect(screen.getByRole('textbox')).toHaveFocus()
})
```

## Security Testing

### XSS Prevention
```typescript
it('should sanitize user input', () => {
  render(<UserInput value="<script>alert('xss')</script>" />)
  
  expect(screen.queryByText('<script>')).not.toBeInTheDocument()
})
```

### Authentication
```typescript
it('should redirect unauthorized users', () => {
  renderWithProviders(<ProtectedComponent />, {
    authState: { isAuthenticated: false }
  })
  
  expect(screen.getByText('Please log in')).toBeInTheDocument()
})
```

## Running Tests

### All Tests
```bash
npm run test
```

### With Coverage
```bash
npm run test:coverage
```

### Watch Mode
```bash
npm run test:watch
```

### Specific Test File
```bash
npm run test -- src/__tests__/components/Button.test.tsx
```

### Integration Tests Only
```bash
npm run test -- --grep "integration"
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run lint
      - run: npm run type-check
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### Coverage Reporting
- Generate HTML report for local review
- Upload to Codecov for CI
- Set coverage badges in README
- Fail build if coverage drops below 80%

## Best Practices

### 1. Test Organization
- Group tests by functionality
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests focused and independent

### 2. Mock Management
- Mock at the appropriate level
- Clean up mocks between tests
- Use realistic mock data
- Avoid over-mocking

### 3. Async Testing
- Use async/await instead of callbacks
- Use appropriate wait functions
- Test loading states
- Handle timeouts

### 4. Error Testing
- Test error boundaries
- Verify error messages
- Test recovery mechanisms
- Check error logging

### 5. Performance
- Avoid unnecessary re-renders
- Test with realistic data sizes
- Monitor memory usage
- Optimize slow tests

## Debugging Tests

### Debug Output
```typescript
it('should debug test', () => {
  console.log('Debug info:', data)
  screen.debug() // Print rendered DOM
})
```

### Test Isolation
```typescript
beforeEach(() => {
  vi.clearAllMocks()
  // Reset state
})
```

### Failing Tests
```typescript
it('should identify failing test', async () => {
  try {
    await complexOperation()
  } catch (error) {
    console.error('Operation failed:', error)
    throw error
  }
})
```

## Maintenance

### Regular Tasks
- Update tests when code changes
- Review and update mock data
- Clean up unused tests
- Update coverage targets

### Code Review
- Review test coverage
- Check test quality
- Verify test descriptions
- Ensure tests are maintainable

### Documentation
- Keep test documentation updated
- Document complex test scenarios
- Explain non-obvious test logic
- Update testing strategy as needed

## Conclusion

This testing strategy ensures high code quality, reliability, and maintainability while achieving our 80%+ coverage target. Regular review and updates of this strategy will keep our testing approach effective as the codebase evolves.
