# Crazy-Gary Storybook Component Library

## Overview

Welcome to the Crazy-Gary Component Library Storybook! This is a comprehensive component documentation and development environment that showcases all the UI components, layouts, and design patterns used throughout the Crazy-Gary application.

## What is Storybook?

Storybook is an open-source tool for building UI components and pages in isolation. It provides a dedicated environment where you can develop, test, and document components independently from the main application.

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Crazy-Gary web application dependencies

### Installation & Setup

1. **Navigate to the web application directory:**
   ```bash
   cd crazy-gary/apps/web
   ```

2. **Install Storybook dependencies:**
   ```bash
   npm install
   ```

3. **Start the Storybook development server:**
   ```bash
   npm run storybook
   ```

4. **Open your browser and visit:**
   ```
   http://localhost:6006
   ```

### Available Scripts

```bash
# Start Storybook development server
npm run storybook

# Build Storybook static files for deployment
npm run build-storybook

# Serve built Storybook locally
npm run storybook:serve

# Test Storybook components
npm run test:storybook

# Run Storybook tests in CI mode
npm run test:storybook:ci

# Deploy to Chromatic (visual testing)
npm run chromatic
```

## Component Library Structure

### UI Components
Located in `src/components/ui/`, these are the core building blocks:

- **Basic Elements**: Button, Input, Label, Badge
- **Composite Components**: Card, Alert, Dialog
- **Form Components**: Form, Checkbox, Select
- **Navigation**: Breadcrumb, Command, Tabs
- **Data Display**: Avatar, Chart, Table
- **Feedback**: Toast, Progress, Skeleton

### Layout Components
Located in `src/components/layout/`:

- **Header**: Application header with navigation
- **Sidebar**: Navigation sidebar
- **Footer**: Page footer
- **Container**: Layout containers

### Page Templates
Located in `src/pages/`:

- Dashboard layouts
- Authentication pages
- Settings pages

## How to Use This Storybook

### 1. Explore Components
- Browse the sidebar to see all available components
- Click on any component to view its stories
- Each component has multiple stories showing different states and variants

### 2. Interactive Controls
- Use the **Controls** panel to interact with component props
- Test different variants, states, and configurations
- See real-time updates as you change values

### 3. Accessibility Testing
- Use the **Accessibility** addon to check WCAG compliance
- Test keyboard navigation
- Verify screen reader compatibility

### 4. Responsive Testing
- Use the **Viewport** addon to test different screen sizes
- Check mobile, tablet, and desktop layouts
- Verify touch-friendly interactions

### 5. Theme Testing
- Use the **Theme** toolbar to switch between light/dark modes
- Test high contrast mode
- Verify theme switching functionality

## Story Structure

Each component story follows this structure:

### 1. Basic Stories
Show the component in its default state with minimal configuration.

### 2. Variant Stories
Demonstrate different visual variants (primary, secondary, destructive, etc.).

### 3. State Stories
Show the component in different states (loading, disabled, error, success).

### 4. Context Stories
Show the component in real-world contexts (forms, layouts, user interactions).

### 5. Responsive Stories
Demonstrate how the component adapts to different screen sizes.

### 6. Accessibility Stories
Show the component with accessibility features enabled and tested.

## Developing New Components

### 1. Create the Component
```tsx
// src/components/ui/new-component.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface NewComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary'
}

export const NewComponent = React.forwardRef<HTMLDivElement, NewComponentProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "base-styles",
          variant === 'default' && "default-styles",
          variant === 'secondary' && "secondary-styles",
          className
        )}
        {...props}
      />
    )
  }
)
NewComponent.displayName = "NewComponent"
```

### 2. Create Stories
```tsx
// src/components/ui/new-component.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { NewComponent } from './new-component';

const meta = {
  title: 'UI/NewComponent',
  component: NewComponent,
  parameters: {
    docs: {
      description: {
        component: 'Description of the component and its features.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    variant: 'default',
    children: 'New Component',
  },
} satisfies Meta<typeof NewComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'default',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
};
```

### 3. Add to Index
```tsx
// src/components/ui/index.ts
export { NewComponent } from './new-component'
```

## Writing Good Stories

### 1. Use Descriptive Names
```tsx
// Good
export const LoadingWithError: Story = { ... }

// Bad
export const Story3: Story = { ... }
```

### 2. Include Multiple Variants
```tsx
export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Destructive: Story = { args: { variant: 'destructive' } };
```

### 3. Show Real-World Usage
```tsx
export const InForm: Story = {
  render: () => (
    <form>
      <NewComponent>Submit</NewComponent>
    </form>
  ),
};
```

### 4. Test Accessibility
```tsx
export const Accessible: Story = {
  args: {
    'aria-label': 'Accessible button',
    'aria-describedby': 'button-description',
  },
};
```

### 5. Test Responsiveness
```tsx
export const Responsive: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <NewComponent>Item 1</NewComponent>
      <NewComponent>Item 2</NewComponent>
    </div>
  ),
};
```

## Component Documentation

### JSDoc Comments
Add JSDoc comments to your components:

```tsx
/**
 * A button component with multiple variants and states.
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="lg">
 *   Click me
 * </Button>
 * ```
 */
export const Button = ({ variant, children, ...props }) => {
  // Implementation
};
```

### Story Documentation
Use the `docs` parameter to add detailed documentation:

```tsx
const meta = {
  parameters: {
    docs: {
      description: {
        component: `
The Button component is a versatile, accessible button with multiple variants and states.

## Features
- Multiple visual variants
- Loading states
- Accessibility compliant
- Responsive design
        `,
      },
    },
  },
};
```

## Testing with Storybook

### 1. Visual Testing
- Use Chromatic for automated visual regression testing
- Compare screenshots across different builds
- Detect visual changes automatically

### 2. Accessibility Testing
- Use the built-in accessibility addon
- Test with screen readers
- Verify keyboard navigation

### 3. Interaction Testing
- Use the `interaction` addon to test user interactions
- Automate click, hover, and focus tests
- Verify component behavior

### 4. Accessibility Testing
```bash
# Run accessibility tests
npm run test:accessibility

# Run in CI mode
npm run test:storybook:ci
```

## Deployment

### 1. Static Build
```bash
npm run build-storybook
```

### 2. Chromatic Deployment
```bash
npm run chromatic
```

### 3. GitHub Pages
The built Storybook can be deployed to GitHub Pages or any static hosting service.

## Best Practices

### 1. Component Design
- Keep components focused and reusable
- Use TypeScript for type safety
- Follow accessibility guidelines
- Support responsive design

### 2. Story Writing
- Write stories for all component variants
- Include real-world usage examples
- Test accessibility features
- Document props and usage

### 3. Performance
- Lazy load heavy components
- Optimize bundle sizes
- Use efficient re-rendering
- Test on various devices

### 4. Maintenance
- Keep stories up to date
- Remove unused stories
- Update documentation regularly
- Monitor for breaking changes

## Troubleshooting

### Common Issues

1. **Stories not loading**
   - Check import paths
   - Verify component exports
   - Restart Storybook server

2. **TypeScript errors**
   - Update component types
   - Check prop interfaces
   - Verify story args types

3. **Accessibility issues**
   - Add proper ARIA labels
   - Test keyboard navigation
   - Verify focus management

4. **Responsive issues**
   - Test on multiple screen sizes
   - Check touch interactions
   - Verify mobile layouts

## Resources

### Documentation
- [Storybook Documentation](https://storybook.js.org/docs)
- [Component Story Format](https://storybook.js.org/docs/react/writing-stories/introduction)
- [Accessibility in Storybook](https://storybook.js.org/docs/react/writing-tests/accessibility-testing)

### Tools
- [Chromatic](https://www.chromatic.com/) - Visual testing
- [Storybook Addons](https://storybook.js.org/addons) - Extensions
- [Testing Library](https://testing-library.com/) - Component testing

### Design Resources
- [Design System Documentation](./design-system.md)
- [Component Guidelines](./COMPONENT_GUIDELINES.md)
- [Accessibility Guidelines](./ACCESSIBILITY.md)

## Contributing

1. **Create feature branches** for new components
2. **Write comprehensive stories** for all variants
3. **Add accessibility testing** for all interactive elements
4. **Update documentation** for new features
5. **Test across different browsers** and devices
6. **Submit pull requests** with detailed descriptions

## Support

For questions or issues with the Storybook component library:

1. Check the component documentation
2. Review existing stories for examples
3. Test with the Controls panel
4. Create an issue with reproduction steps

---

Happy component development! 🎨✨