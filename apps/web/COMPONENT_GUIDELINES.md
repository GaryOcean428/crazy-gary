# Component Development Guidelines

## Overview

This document outlines the standards, patterns, and best practices for developing components in the Crazy-Gary component library. Following these guidelines ensures consistency, accessibility, and maintainability across the entire component ecosystem.

## Component Structure

### File Organization
```
src/components/
├── ui/                     # Reusable UI components
│   ├── button.tsx         # Component implementation
│   ├── button.stories.tsx # Component stories
│   └── index.ts           # Barrel export
├── layout/                # Layout components
├── patterns/              # Design patterns
├── examples/              # Usage examples
└── shared/                # Shared utilities
```

### Component File Structure
Each component should follow this pattern:

1. **Implementation file** (`component.tsx`)
2. **Stories file** (`component.stories.tsx`)
3. **Test file** (`component.test.tsx`)
4. **Documentation** (included in stories)

## Component Implementation Standards

### 1. TypeScript Interface
```tsx
// ✅ Good: Clear, descriptive interface
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  loadingText?: string
  asChild?: boolean
}

// ❌ Bad: Vague or incomplete interface
export interface ButtonProps {
  className?: string
  children?: React.ReactNode
}
```

### 2. Forward References
```tsx
// ✅ Good: Proper ref forwarding
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

// ❌ Bad: No ref forwarding or display name
const Button = ({ children, ...props }) => {
  return <button {...props}>{children}</button>
}
```

### 3. Variant System
```tsx
// ✅ Good: CVA for variant management
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

// ❌ Bad: Manual className management
const Button = ({ variant, size, children, ...props }) => {
  const classes = [
    "inline-flex items-center justify-center rounded-md font-medium",
    variant === "default" && "bg-primary text-primary-foreground",
    variant === "secondary" && "bg-secondary text-secondary-foreground",
    size === "sm" && "h-8 px-3 text-sm",
    // ... many more conditionals
  ].filter(Boolean).join(" ")
  
  return <button className={classes} {...props}>{children}</button>
}
```

### 4. Accessibility Standards
```tsx
// ✅ Good: Comprehensive accessibility
const Button = ({ 
  children, 
  variant, 
  size, 
  disabled, 
  loading,
  loadingText = "Loading...",
  ...props 
}) => {
  const isDisabled = disabled || loading
  
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <>
          <Spinner className="mr-2 h-4 w-4" aria-hidden="true" />
          <span className="sr-only">{loadingText}</span>
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  )
}

// ❌ Bad: Missing accessibility features
const Button = ({ children, ...props }) => {
  return <button {...props}>{children}</button>
}
```

### 5. Responsive Design
```tsx
// ✅ Good: Responsive classes
const Button = ({ children, className, ...props }) => {
  return (
    <button
      className={cn(
        "h-10 px-4 py-2 sm:h-9 sm:px-4 md:h-10", // Responsive sizing
        "text-sm sm:text-base", // Responsive typography
        "btn-touch sm:btn-touch-lg", // Touch targets
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// ❌ Bad: Fixed sizing only
const Button = ({ children, ...props }) => {
  return (
    <button className="h-10 px-4 text-base" {...props}>
      {children}
    </button>
  )
}
```

## Story Writing Standards

### 1. Story Structure
```tsx
// ✅ Good: Comprehensive story structure
const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Button component is a versatile, accessible button with multiple variants and states.

## Features
- Multiple visual variants
- Loading states with spinner
- Accessibility compliant
- Responsive design
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive'],
      description: 'Visual variant of the button',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the button',
    },
  },
  args: {
    children: 'Button',
    variant: 'default',
    size: 'md',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// ✅ Good: Multiple story types
export const Default: Story = {
  args: { variant: 'default' },
};

export const Secondary: Story = {
  args: { variant: 'secondary' },
};

export const Loading: Story = {
  args: { 
    loading: true,
    loadingText: 'Loading...',
  },
};

export const Responsive: Story = {
  render: () => (
    <div className="space-y-4">
      <Button size="sm">Small Button</Button>
      <Button size="md">Medium Button</Button>
      <Button size="lg">Large Button</Button>
    </div>
  ),
};
```

### 2. Interactive Controls
```tsx
// ✅ Good: Rich interactive controls
export const Playground: Story = {
  args: {
    variant: 'default',
    size: 'md',
    loading: false,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Use the controls below to experiment with different configurations.',
      },
    },
  },
};
```

### 3. Real-world Examples
```tsx
// ✅ Good: Real-world context
export const InForm: Story = {
  render: () => (
    <form className="space-y-4 max-w-md">
      <div>
        <label htmlFor="email">Email</label>
        <Input id="email" type="email" placeholder="Enter your email" />
      </div>
      <Button type="submit">Sign Up</Button>
    </form>
  ),
};
```

## Design Pattern Guidelines

### 1. Compound Components
```tsx
// ✅ Good: Flexible compound components
const Tabs = ({ children, defaultValue, ...props }) => {
  const [activeTab, setActiveTab] = useState(defaultValue)
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div {...props}>{children}</div>
    </TabsContext.Provider>
  )
}

const TabsList = ({ children, ...props }) => {
  return <div role="tablist" {...props}>{children}</div>
}

const TabsTrigger = ({ value, children, ...props }) => {
  const { activeTab, setActiveTab } = useContext(TabsContext)
  
  return (
    <button
      role="tab"
      aria-selected={activeTab === value}
      onClick={() => setActiveTab(value)}
      {...props}
    >
      {children}
    </button>
  )
}

const TabsContent = ({ value, children, ...props }) => {
  const { activeTab } = useContext(TabsContext)
  
  if (activeTab !== value) return null
  
  return <div role="tabpanel" {...props}>{children}</div>
}

// Usage
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

### 2. Render Props Pattern
```tsx
// ✅ Good: Flexible render props
const DataFetcher = ({ url, children }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    fetchData(url)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [url])
  
  return children({ data, loading, error })
}

// Usage
<DataFetcher url="/api/users">
  {({ data, loading, error }) => {
    if (loading) return <Spinner />
    if (error) return <ErrorMessage error={error} />
    return <UserList users={data} />
  }}
</DataFetcher>
```

### 3. Higher-Order Components
```tsx
// ✅ Good: HOC for common functionality
const withLoading = (Component) => {
  return ({ loading, children, ...props }) => {
    if (loading) return <Spinner />
    return <Component {...props}>{children}</Component>
  }
}

const LoadingButton = withLoading(Button)

// Usage
<LoadingButton loading={isSubmitting}>
  Submit Form
</LoadingButton>
```

## Testing Standards

### 1. Unit Testing
```tsx
// ✅ Good: Comprehensive unit tests
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })
  
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
  
  it('shows loading state correctly', () => {
    render(<Button loading loadingText="Submitting...">Submit</Button>)
    
    expect(screen.getByText('Submitting...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### 2. Accessibility Testing
```tsx
// ✅ Good: Accessibility tests
import { axe, toHaveNoViolations } from 'jest-axe'
import { render } from '@testing-library/react'
import { Button } from './Button'

expect.extend(toHaveNoViolations)

describe('Button Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<Button>Accessible Button</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
  
  it('should support keyboard navigation', () => {
    render(<Button>Tab Test</Button>)
    
    const button = screen.getByRole('button')
    button.focus()
    expect(button).toHaveFocus()
    
    fireEvent.keyDown(button, { key: 'Enter' })
    // Verify keyboard interaction works
  })
})
```

## Performance Guidelines

### 1. Memoization
```tsx
// ✅ Good: Performance optimization
const Button = React.memo(({ children, onClick, ...props }) => {
  const handleClick = useCallback((event) => {
    onClick?.(event)
  }, [onClick])
  
  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  )
})

Button.displayName = "Button"

// ❌ Bad: Unnecessary re-renders
const Button = ({ children, onClick, ...props }) => {
  return (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  )
}
```

### 2. Lazy Loading
```tsx
// ✅ Good: Code splitting
const HeavyComponent = React.lazy(() => import('./HeavyComponent'))

const App = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyComponent />
    </Suspense>
  )
}
```

## Documentation Standards

### 1. JSDoc Comments
```tsx
/**
 * A versatile button component with multiple variants and states.
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" loading={isLoading}>
 *   Submit Form
 * </Button>
 * ```
 * 
 * @remarks
 * This component is built with accessibility in mind and includes
 * proper ARIA attributes and keyboard navigation support.
 * 
 * @see {@link https://example.com/accessibility-guidelines}
 */
export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'default',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  ...props 
}) => {
  // Implementation
}
```

### 2. Story Documentation
```tsx
const meta = {
  parameters: {
    docs: {
      description: {
        component: `
# Button Component

The Button component provides a consistent way to create interactive elements
throughout the application.

## Accessibility

- Proper ARIA attributes
- Keyboard navigation support
- Screen reader compatibility
- Focus management

## Variants

- **default**: Primary action button
- **secondary**: Secondary actions
- **destructive**: Destructive actions
- **ghost**: Subtle actions

## Sizes

- **sm**: Small buttons for tight spaces
- **md**: Default size for most use cases
- **lg**: Large buttons for primary actions
        `,
      },
    },
  },
};
```

## Code Quality Standards

### 1. ESLint Configuration
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:jsx-a11y/recommended"
  ],
  "rules": {
    "react/prop-types": "off",
    "@typescript-eslint/explicit-function-return-type": "error",
    "jsx-a11y/anchor-is-valid": "error"
  }
}
```

### 2. Import Organization
```tsx
// ✅ Good: Organized imports
// External libraries
import React, { useState, useCallback } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

// Internal utilities
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// Local types
import type { ComponentProps } from './types'

// Component implementation
const componentVariants = cva(...)
```

### 3. Error Handling
```tsx
// ✅ Good: Proper error handling
const DataComponent = ({ data, error, loading }) => {
  if (loading) return <Spinner />
  
  if (error) {
    return (
      <ErrorBoundary>
        <ErrorMessage 
          error={error}
          onRetry={() => refetch()}
        />
      </ErrorBoundary>
    )
  }
  
  if (!data) return <EmptyState />
  
  return <DataDisplay data={data} />
}
```

## Review Checklist

Before submitting a component, ensure:

- [ ] TypeScript interface is complete and well-documented
- [ ] Component uses proper forward refs
- [ ] Accessibility features are implemented (ARIA, keyboard nav, focus)
- [ ] Responsive design is supported
- [ ] Loading and error states are handled
- [ ] Stories cover all variants and use cases
- [ ] Unit tests are written and passing
- [ ] Accessibility tests are included
- [ ] Performance optimizations are applied where needed
- [ ] Documentation is complete and clear
- [ ] Code follows established patterns and conventions

## Conclusion

Following these guidelines ensures that all components in the Crazy-Gary library are consistent, accessible, performant, and maintainable. When in doubt, refer to existing components in the library for examples and patterns.

For questions or suggestions about these guidelines, please create an issue or reach out to the development team.