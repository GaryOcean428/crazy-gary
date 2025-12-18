# Crazy-Gary Component Library & Design System

## Overview

The Crazy-Gary Component Library is a comprehensive, accessible, and responsive design system built with React, TypeScript, and Tailwind CSS. This library provides a complete set of UI components, layouts, and utilities for building consistent user interfaces.

## Design Principles

### 1. Accessibility First
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management
- ARIA attributes

### 2. Responsive Design
- Mobile-first approach
- Flexible grid system
- Touch-friendly interactions
- Adaptive layouts

### 3. Theme Support
- Light/Dark mode
- System theme detection
- Custom theme variables
- High contrast mode

### 4. Performance
- Optimized bundle sizes
- Tree-shaking support
- Lazy loading capabilities
- Efficient re-renders

## Component Categories

### 1. UI Components
#### Basic Elements
- **Button** - Interactive element with multiple variants
- **Input** - Form input fields
- **Label** - Form labels
- **Badge** - Status indicators and tags

#### Composite Components
- **Card** - Flexible container component
- **Alert** - Message and notification displays
- **Dialog** - Modal windows and overlays

#### Form Components
- **Form** - Form containers and validation
- **Checkbox** - Checkbox inputs
- **Select** - Dropdown selections
- **Radio Group** - Radio button groups

#### Navigation Components
- **Breadcrumb** - Navigation breadcrumb
- **Command** - Command palette
- **Navigation Menu** - Navigation menus
- **Tabs** - Tab interfaces

#### Data Display
- **Avatar** - User avatars
- **Chart** - Data visualization
- **Table** - Data tables
- **Tooltip** - Hover information

#### Feedback Components
- **Toast** - Temporary notifications
- **Progress** - Progress indicators
- **Skeleton** - Loading placeholders
- **Spinner** - Loading indicators

### 2. Layout Components
- **Header** - Application header
- **Sidebar** - Navigation sidebar
- **Footer** - Page footer
- **Container** - Layout containers

### 3. Page Templates
- **Dashboard** - Dashboard layouts
- **Login/Register** - Authentication pages
- **Settings** - Configuration pages

## Component Features

### Accessibility Features
- Semantic HTML structure
- ARIA labels and descriptions
- Keyboard navigation
- Focus management
- Color contrast compliance
- Screen reader support

### Responsive Features
- Mobile-first design
- Touch-friendly sizing
- Flexible layouts
- Adaptive typography

### Interactive Features
- Hover states
- Focus indicators
- Loading states
- Error states
- Success states
- Animation support

### Theme Features
- Light/Dark mode
- Custom color schemes
- High contrast mode
- System theme detection

## Usage Guidelines

### Getting Started

1. **Installation**
   ```bash
   npm install @crazy-gary/ui
   ```

2. **Theme Provider Setup**
   ```tsx
   import { ThemeProvider } from '@/components/theme-provider'
   
   function App() {
     return (
       <ThemeProvider>
         <YourApp />
       </ThemeProvider>
     )
   }
   ```

3. **Component Usage**
   ```tsx
   import { Button } from '@/components/ui/button'
   import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
   
   function MyComponent() {
     return (
       <Card>
         <CardHeader>
           <CardTitle>Card Title</CardTitle>
         </CardHeader>
         <CardContent>
           <Button>Click me</Button>
         </CardContent>
       </Card>
     )
   }
   ```

### Best Practices

1. **Accessibility**
   - Always provide proper labels
   - Ensure keyboard navigation
   - Test with screen readers
   - Maintain color contrast

2. **Responsive Design**
   - Use mobile-first approach
   - Test on various screen sizes
   - Ensure touch-friendly interactions

3. **Performance**
   - Use appropriate component variants
   - Lazy load heavy components
   - Optimize re-renders

4. **Consistency**
   - Follow established patterns
   - Use design tokens consistently
   - Maintain visual hierarchy

## Design Tokens

### Colors
- Primary: Used for main actions and highlights
- Secondary: Used for secondary actions and backgrounds
- Destructive: Used for destructive actions and errors
- Success: Used for success states and confirmations
- Warning: Used for warning states
- Muted: Used for subtle text and backgrounds

### Typography
- Font families: Inter (primary), system fonts (fallback)
- Font sizes: Responsive scale from text-xs to text-5xl
- Font weights: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- Line heights: Optimized for readability

### Spacing
- Consistent spacing scale (0, 1, 2, 3, 4, 6, 8, 12, 16, 20, 24)
- Responsive spacing adjustments
- Component-specific spacing patterns

### Border Radius
- Small: 0.125rem (2px)
- Default: 0.375rem (6px)
- Medium: 0.5rem (8px)
- Large: 0.75rem (12px)
- Full: 9999px (for circular elements)

### Shadows
- Subtle: For elevated elements
- Default: For cards and modals
- Strong: For floating elements
- Colored: For colored shadows

## Animation Guidelines

### Principles
- Purposeful animations that enhance UX
- Consistent timing and easing
- Respect for reduced motion preferences
- Performance-optimized animations

### Animation Types
- **Enter/Exit**: For modal dialogs and overlays
- **Hover**: For interactive elements
- **Focus**: For form elements and buttons
- **Loading**: For async operations
- **Page Transitions**: For route changes

### Timing
- Fast interactions: 150ms
- Standard animations: 200-300ms
- Complex animations: 300-500ms
- Page transitions: 300-600ms

## Browser Support

### Modern Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile Browsers
- iOS Safari 14+
- Chrome Mobile 90+
- Samsung Internet 13+

### Progressive Enhancement
- Core functionality without JavaScript
- Enhanced features with JavaScript
- Graceful degradation for older browsers

## Testing Strategy

### Unit Testing
- Component behavior testing
- Props validation
- Event handling
- State management

### Integration Testing
- Component interactions
- Form submissions
- Navigation flows
- Theme switching

### Accessibility Testing
- Keyboard navigation
- Screen reader compatibility
- Color contrast validation
- ARIA compliance

### Visual Regression Testing
- Component appearance
- Responsive behavior
- Theme variations
- Animation states

## Development Workflow

### Component Development
1. Design and plan component
2. Implement core functionality
3. Add accessibility features
4. Create comprehensive stories
5. Write unit tests
6. Perform accessibility testing
7. Optimize performance

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Husky for git hooks

### Documentation
- Component stories with examples
- API documentation
- Usage guidelines
- Best practices

## Contributing

### Component Guidelines
- Follow established patterns
- Maintain accessibility standards
- Write comprehensive tests
- Document thoroughly

### Pull Request Process
1. Create feature branch
2. Implement changes
3. Add/update tests
4. Update documentation
5. Submit pull request
6. Code review and merge

### Issue Reporting
- Bug reports with reproduction steps
- Feature requests with use cases
- Accessibility issues with details
- Performance problems with metrics

## Resources

### Design Tools
- Figma component library
- Design tokens
- Icon library
- Color palette

### Development Tools
- Storybook for component development
- Testing libraries
- Build tools
- Linting tools

### Documentation
- Component API docs
- Usage examples
- Best practices guide
- Migration guides

---

This design system provides a solid foundation for building consistent, accessible, and performant user interfaces. For detailed information about individual components, please refer to their respective Storybook stories and documentation.