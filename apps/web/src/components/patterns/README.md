# Advanced Component Composition Patterns

This directory contains a comprehensive set of advanced React component composition patterns designed to create flexible, reusable, and maintainable UI components.

## Overview

The advanced composition patterns include:

1. **Compound Components** - For complex UI structures
2. **Render Props** - For flexible component logic sharing
3. **Polymorphic Components** - For flexible element rendering
4. **Headless Components** - For logic-first component design
5. **Slot Patterns** - For flexible layout composition
6. **Higher-Order Components (HOCs)** - For cross-cutting concerns
7. **Composition Utilities** - For prop and state management

## Pattern Catalog

### 1. Compound Components

Compound components provide a way to compose complex UIs where components work together to form a complete interface.

```tsx
import { DashboardCompound, DashboardCard } from '@/components/patterns/compound'

function MyDashboard() {
  return (
    <DashboardCompound layout="grid" columns={3}>
      <DashboardCard
        title="Sales"
        description="This month's revenue"
        actions={<Badge>+$12%</Badge>}
      >
        <div className="text-3xl font-bold">$45,600</div>
      </DashboardCard>
      
      <DashboardCard title="Users" loading>
        {/* Loading state */}
      </DashboardCard>
      
      <DashboardCard title="Orders" error="Failed to load">
        {/* Error state */}
      </DashboardCard>
    </DashboardCompound>
  )
}
```

**Key Features:**
- Context-based state sharing
- Flexible child composition
- Automatic loading/error states
- Layout-aware rendering

### 2. Render Props

Render props pattern allows components to share logic by passing functions as children.

```tsx
import { Toggle, Modal, DataFetcher } from '@/components/patterns/render-props'

// Toggle Example
<Toggle initial={false}>
  {({ on, toggle, setOn }) => (
    <div>
      <Button onClick={toggle}>
        {on ? 'Hide' : 'Show'} Settings
      </Button>
      {on && <SettingsPanel />}
    </div>
  )}
</Toggle>

// Modal Example
<Modal>
  {({ open, close, openModal }) => (
    <>
      <Button onClick={openModal}>Open Modal</Button>
      {open && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Modal Content</h2>
            <Button onClick={close}>Close</Button>
          </div>
        </div>
      )}
    </>
  )}
</Modal>

// Data Fetcher Example
<DataFetcher url="/api/dashboard">
  {({ data, loading, error, refetch }) => (
    <div>
      {loading && <Spinner />}
      {error && <ErrorMessage error={error} onRetry={refetch} />}
      {data && <Dashboard data={data} />}
    </div>
  )}
</DataFetcher>
```

**Available Components:**
- `Toggle` - State toggling with render props
- `Modal` - Modal state management
- `DataFetcher` - Async data fetching
- `ListRenderer` - List rendering with loading states
- `FormRender` - Form state management
- `Conditional` - Conditional rendering
- `AsyncComponent` - Async component loading
- `Observer` - Intersection observer wrapper

### 3. Polymorphic Components

Polymorphic components allow rendering as different HTML elements or custom components while maintaining props and styling.

```tsx
import { Button, Text, Heading, Container } from '@/components/patterns/polymorphic'

// Button with different render targets
<Button as="a" href="/dashboard">Link Button</Button>
<Button as={CustomComponent}>Custom Component</Button>
<Button asChild>
  <Link href="/dashboard">Using Slot</Link>
</Button>

// Text with variants
<Text size="lg" weight="bold" color="primary">Large Bold Text</Text>
<Text align="center" className="custom-class">Centered Text</Text>

// Heading levels
<Heading level={1}>Page Title</Heading>
<Heading level={2} color="muted">Section Header</Heading>

// Container with responsive sizing
<Container size="xl" padding="lg">
  <div>Responsive container content</div>
</Container>
```

**Available Components:**
- `Button` - Flexible button with variants
- `Text` - Text with size, weight, color variants
- `Heading` - Heading with level and color variants
- `Container` - Responsive container with size/padding
- `Stack` - Flex container with direction/gap variants
- `Grid` - Grid layout with column/gap variants
- `Link` - Link with decoration variants
- `Image` - Image with size/fit variants

### 4. Headless Components

Headless components provide logic and state management without imposing visual structure.

```tsx
import { Accordion, Tabs, Select, Combobox } from '@/components/patterns/headless'

// Accordion Example
<Accordion
  type="multiple"
  items={[
    { id: '1', title: 'Section 1', content: 'Content 1' },
    { id: '2', title: 'Section 2', content: 'Content 2' }
  ]}
>
  {({ openItems, toggleItem, getItemProps }) => (
    <div>
      {items.map(item => (
        <div key={item.id}>
          <button {...getItemProps(item.id)}>
            {item.title}
          </button>
          {openItems.includes(item.id) && (
            <div>{item.content}</div>
          )}
        </div>
      ))}
    </div>
  )}
</Accordion>

// Tabs Example
<Tabs
  items={[
    { id: 'tab1', label: 'Tab 1', content: 'Content 1' },
    { id: 'tab2', label: 'Tab 2', content: 'Content 2' }
  ]}
>
  {({ value, setValue, getTabListProps, getTabProps }) => (
    <div>
      <div {...getTabListProps()}>
        {items.map(item => (
          <button
            key={item.id}
            {...getTabProps(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.find(item => item.id === value)?.content}
    </div>
  )}
</Tabs>

// Select Example
<Select
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' }
  ]}
  onValueChange={(value) => console.log(value)}
>
  {({ value, isOpen, setIsOpen, getTriggerProps, getOptionProps }) => (
    <>
      <Button {...getTriggerProps()}>
        {value || 'Select option...'}
      </Button>
      {isOpen && (
        <div>
          {options.map(option => (
            <div
              key={option.value}
              {...getOptionProps(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </>
  )}
</Select>
```

**Available Components:**
- `Accordion` - Expandable sections
- `Combobox` - Searchable select with filtering
- `Dialog` - Modal dialog management
- `Popover` - Overlay popover
- `Tabs` - Tab interface
- `Select` - Select dropdown

### 5. Slot Patterns

Slot patterns provide a flexible way to compose layouts by injecting content into predefined positions.

```tsx
import { 
  SlotRegistryProvider, 
  NamedSlot, 
  SlotLayout,
  FlexibleLayout 
} from '@/components/patterns/slots'

// Slot Registry Example
<SlotRegistryProvider>
  <div>
    <NamedSlot name="header">
      <h1>Page Header</h1>
    </NamedSlot>
    
    <NamedSlot name="sidebar">
      <nav>Sidebar Navigation</nav>
    </NamedSlot>
    
    <NamedSlot name="main">
      <main>Main Content Area</main>
    </NamedSlot>
    
    <NamedSlot name="footer">
      <footer>Page Footer</footer>
    </NamedSlot>
  </div>
</SlotRegistryProvider>

// Flexible Layout Example
<FlexibleLayout
  layout="header-sidebar-main"
  header={<Header />}
  sidebar={<Sidebar />}
  main={<MainContent />}
  footer={<Footer />}
  gap="lg"
/>

// Template Slot Example
<TemplateSlot
  template="Welcome [[slot:user-name]]! You have [[slot:notification-count]] notifications."
  slots={{
    'user-name': <strong>John Doe</strong>,
    'notification-count': <Badge>5</Badge>
  }}
/>

// Composite Slot Example
<CompositeSlot
  slots={{
    header: <h1>Title</h1>,
    content: <p>Content</p>,
    actions: <Button>Action</Button>
  }}
  composition={[
    { slot: 'header', order: 1 },
    { slot: 'content', order: 2 },
    { slot: 'actions', order: 3 }
  ]}
/>
```

**Available Patterns:**
- `SlotRegistryProvider` - Context provider for slot management
- `NamedSlot` - Register content for a specific slot
- `SlotLayout` - Layout component that renders named slots
- `FlexibleLayout` - Predefined layout patterns
- `TemplateSlot` - Template-based slot rendering
- `CompositeSlot` - Compose multiple slots in order

### 6. Higher-Order Components (HOCs)

HOCs wrap components to add cross-cutting concerns like loading states, authentication, or error handling.

```tsx
import { 
  withLoading, 
  withErrorBoundary, 
  withAuth,
  withDataFetching,
  compose 
} from '@/components/patterns/hoc'

// Loading HOC
const ProtectedComponent = withAuth(MyComponent, LoginComponent)

// Data Fetching HOC
const DashboardWithData = withDataFetching(
  ({ data, loading, error }) => <Dashboard data={data} loading={loading} error={error} />,
  () => fetch('/api/dashboard').then(r => r.json())
)

// Composed HOCs
const EnhancedComponent = compose(
  withLoading,
  withErrorBoundary,
  withAuth,
  withTheme
)(MyComponent)

// Form HOC
const MyForm = withForm(
  ({ values, errors, handleChange, handleSubmit, isValid, isSubmitting }) => (
    <form onSubmit={handleSubmit}>
      <input
        value={values.email}
        onChange={(e) => handleChange('email', e.target.value)}
      />
      {errors.email && <span>{errors.email}</span>}
      <button type="submit" disabled={!isValid || isSubmitting}>
        Submit
      </button>
    </form>
  ),
  { email: '' },
  (values) => ({
    email: !values.email ? 'Email is required' : undefined
  }),
  async (values) => {
    await submitForm(values)
  }
)
```

**Available HOCs:**
- `withLoading` - Add loading state management
- `withErrorBoundary` - Add error boundary functionality
- `withAuth` - Add authentication checking
- `withTheme` - Add theme support
- `withDataFetching` - Add data fetching capabilities
- `withForm` - Add form state management
- `withModal` - Add modal state management
- `withIntersectionObserver` - Add intersection observer
- `withResponsive` - Add responsive behavior
- `compose` - Compose multiple HOCs

### 7. Composition Utilities

Utilities for managing component composition, state, and props.

```tsx
import { 
  useComposition,
  useComposedState,
  usePropsComposition,
  useDynamicComponent,
  useSlotComposition 
} from '@/components/patterns/utils'

// State Composition
const { state, updateState, getState } = useComposedState(
  ['user', undefined],
  ['loading', false],
  ['error', null]
)

// Props Composition
const { props, setOverride, resetOverrides } = usePropsComposition({
  className: 'base-class',
  style: { color: 'blue' }
})

// Dynamic Component
const { getComponent, switchTo } = useDynamicComponent({
  card: CardComponent,
  list: ListComponent,
  table: TableComponent
})

// Slot Composition
const { registerSlot, getSlot } = useSlotComposition()

// Form Composition
const {
  values,
  errors,
  touched,
  setFieldValue,
  handleSubmit
} = useFormComposition({ email: '', name: '' })
```

**Available Utilities:**
- `useComposition` - Generic composition state
- `useComposedState` - Multi-state composition
- `usePropsComposition` - Props merging and overrides
- `useDynamicComponent` - Dynamic component switching
- `useSlotComposition` - Slot management
- `useThemeComposition` - Theme state management
- `useFormComposition` - Form state management
- `useListComposition` - List state management
- `useModalComposition` - Modal state management

## Usage Examples

### Complete Dashboard Example

```tsx
import { EnhancedDashboard } from '@/components/examples'

function DashboardPage() {
  return (
    <EnhancedDashboard />
  )
}
```

### Complete Task Manager Example

```tsx
import { EnhancedTaskManager } from '@/components/examples'

function TaskManagerPage() {
  return (
    <EnhancedTaskManager />
  )
}
```

## Best Practices

1. **Choose the Right Pattern**
   - Use **Compound Components** for complex, related UI elements
   - Use **Render Props** when you need flexible logic sharing
   - Use **Polymorphic Components** when you need different HTML elements
   - Use **Headless Components** when you need logic without visual constraints
   - Use **Slots** for layout composition
   - Use **HOCs** for cross-cutting concerns

2. **Composition Over Inheritance**
   - Prefer composition patterns over class inheritance
   - Use multiple small, focused components over large monolithic ones

3. **Type Safety**
   - All patterns include TypeScript support
   - Use proper typing for props and state
   - Leverage union types for variants and states

4. **Performance Considerations**
   - Use React.memo for expensive components
   - Optimize re-renders with useMemo and useCallback
   - Consider lazy loading for large component trees

5. **Accessibility**
   - All components include proper ARIA attributes
   - Keyboard navigation support
   - Screen reader compatibility

## Pattern Combinations

These patterns work well together:

- **Compound + Slots**: Use slots within compound components for maximum flexibility
- **Headless + Polymorphic**: Create headless logic with polymorphic rendering
- **Render Props + HOCs**: Enhance render props with cross-cutting concerns
- **Polymorphic + Utils**: Use polymorphic components with composition utilities

## Getting Started

1. Import the patterns you need:
```tsx
import { 
  CompoundComponents, 
  RenderPropPatterns, 
  PolymorphicComponents,
  HeadlessComponents,
  SlotPatterns,
  HOCPatterns,
  CompositionUtils 
} from '@/components/patterns'
```

2. Start with simple patterns and gradually add complexity:
```tsx
// Start simple
<Button>Click me</Button>

// Add polymorphism
<Button as="a" href="/link">Link Button</Button>

// Add render props
<Modal>
  {({ open, openModal }) => (
    <Button onClick={openModal}>Open</Button>
  )}
</Modal>
```

3. Combine patterns for complex functionality:
```tsx
// Complex example combining multiple patterns
<SlotRegistryProvider>
  <HOCPatterns.withErrorBoundary(
    HOCPatterns.withLoading(
      <HeadlessComponents.Accordion items={items}>
        {({ openItems, toggleItem, getItemProps }) => (
          <CompoundComponents.Dashboard>
            {items.map(item => (
              <CompoundComponents.DashboardCard
                key={item.id}
                title={item.title}
                actions={
                  <Button 
                    as={PolymorphicComponents.Button}
                    variant="outline"
                    onClick={() => toggleItem(item.id)}
                  >
                    {openItems.includes(item.id) ? 'Collapse' : 'Expand'}
                  </Button>
                }
              >
                {openItems.includes(item.id) && item.content}
              </CompoundComponents.DashboardCard>
            ))}
          </CompoundComponents.Dashboard>
        )}
      </HeadlessComponents.Accordion>
    )
  </HOCPatterns.withErrorBoundary>
</SlotRegistryProvider>
```

## Contributing

When adding new patterns:

1. Follow the established naming conventions
2. Include TypeScript types
3. Add JSDoc documentation
4. Include usage examples
5. Test accessibility features
6. Ensure patterns can be composed with others

This pattern library provides a solid foundation for building complex, maintainable React applications with clean, reusable component architecture.