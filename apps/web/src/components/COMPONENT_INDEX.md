# Crazy-Gary Component Library Index

## Overview

This index provides a comprehensive overview of all components available in the Crazy-Gary component library, organized by category and purpose.

## Table of Contents

1. [UI Components](#ui-components)
2. [Layout Components](#layout-components)
3. [Page Templates](#page-templates)
4. [Design Patterns](#design-patterns)
5. [Utilities](#utilities)
6. [Hooks](#hooks)

---

## UI Components

### Basic Elements

#### Button
**Location**: `src/components/ui/button.tsx`  
**Stories**: `src/components/ui/button.stories.tsx`

A versatile, accessible button component with multiple variants and states.

**Variants**:
- `default` - Primary action button
- `secondary` - Secondary actions
- `outline` - Outlined button
- `ghost` - Subtle button
- `destructive` - Destructive actions
- `link` - Link-style button
- `success` - Success states
- `warning` - Warning states

**Sizes**:
- `sm` - Small (32px height)
- `default` - Default (40px height)
- `lg` - Large (48px height)
- `icon` - Icon-only button

**Features**:
- Loading states with spinner
- Success states with checkmark
- Framer Motion animations
- Touch-friendly interactions
- Accessibility compliant

```tsx
import { Button } from '@/components/ui/button'

<Button variant="default" size="lg" loading={isLoading}>
  Submit Form
</Button>
```

#### Input
**Location**: `src/components/ui/input.tsx`  
**Stories**: `src/components/ui/input.stories.tsx`

A flexible text input component with built-in accessibility features.

**Types**: text, email, password, number, tel, url, search, file

**Features**:
- Responsive design
- Focus states with ring indicators
- Error states with destructive styling
- File input support
- Touch-friendly interactions

```tsx
import { Input } from '@/components/ui/input'

<Input 
  type="email" 
  placeholder="Enter your email"
  disabled={isSubmitting}
/>
```

#### Label
**Location**: `src/components/ui/label.tsx`

Form labels with proper association support.

**Features**:
- Proper HTML label element
- Accessibility attributes
- Responsive typography

```tsx
import { Label } from '@/components/ui/label'

<Label htmlFor="email">Email Address</Label>
<Input id="email" type="email" />
```

#### Badge
**Location**: `src/components/ui/badge.tsx`  
**Stories**: `src/components/ui/badge.stories.tsx`

Small elements used to highlight status, count, or category information.

**Variants**:
- `default` - Primary badge
- `secondary` - Secondary badge
- `destructive` - Error/status badge
- `outline` - Outlined badge

**Features**:
- Icon support
- Status indicators
- Category labels
- Notification counts

```tsx
import { Badge } from '@/components/ui/badge'

<Badge variant="default">New Feature</Badge>
<Badge variant="destructive">Error</Badge>
```

### Composite Components

#### Card
**Location**: `src/components/ui/card.tsx`  
**Stories**: `src/components/ui/card.stories.tsx`

A flexible container component for organizing content.

**Sub-components**:
- `Card` - Main container
- `CardHeader` - Top section
- `CardTitle` - Card title
- `CardDescription` - Description text
- `CardContent` - Main content area
- `CardFooter` - Bottom actions
- `CardAction` - Header actions

**Features**:
- Flexible layout with grid system
- Responsive design
- Multiple layout variations

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

#### Alert
**Location**: `src/components/ui/alert.tsx`  
**Stories**: `src/components/ui/alert.stories.tsx`

Components for displaying important messages and notifications.

**Variants**:
- `default` - Information message
- `destructive` - Error/critical message

**Sub-components**:
- `Alert` - Main container
- `AlertTitle` - Alert heading
- `AlertDescription` - Alert content

**Features**:
- Icon support
- Multiple severity levels
- Accessible with proper ARIA roles

```tsx
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

<Alert>
  <AlertTitle>Success!</AlertTitle>
  <AlertDescription>
    Your changes have been saved successfully.
  </AlertDescription>
</Alert>
```

#### Dialog
**Location**: `src/components/ui/dialog.tsx`  
**Stories**: `src/components/ui/dialog.stories.tsx`

Modal windows that appear on top of main content.

**Sub-components**:
- `Dialog` - Root component
- `DialogTrigger` - Opens the dialog
- `DialogContent` - Main container
- `DialogHeader` - Top section
- `DialogTitle` - Dialog title
- `DialogDescription` - Description
- `DialogFooter` - Action buttons
- `DialogClose` - Close button

**Features**:
- Focus management and trap
- Escape key to close
- Overlay click to close
- Animated transitions
- Accessible with proper ARIA attributes

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    Dialog content goes here
  </DialogContent>
</Dialog>
```

### Form Components

#### Form
**Location**: `src/components/ui/form.tsx`

Form containers with validation support.

#### Checkbox
**Location**: `src/components/ui/checkbox.tsx`

Checkbox input components.

#### Select
**Location**: `src/components/ui/select.tsx`

Dropdown selection components.

#### Radio Group
**Location**: `src/components/ui/radio-group.tsx`

Radio button group components.

### Navigation Components

#### Breadcrumb
**Location**: `src/components/ui/breadcrumb.tsx`

Navigation breadcrumb component.

#### Command
**Location**: `src/components/ui/command.tsx`

Command palette component.

#### Navigation Menu
**Location**: `src/components/ui/navigation-menu.tsx`

Navigation menu component.

#### Tabs
**Location**: `src/components/ui/tabs.tsx`

Tab interface component.

### Data Display

#### Avatar
**Location**: `src/components/ui/avatar.tsx`

User avatar component.

#### Chart
**Location**: `src/components/ui/chart.tsx`

Data visualization component.

#### Table
**Location**: `src/components/ui/table.tsx`

Data table component.

#### Tooltip
**Location**: `src/components/ui/tooltip.tsx`

Hover information component.

### Feedback Components

#### Toast
**Location**: `src/components/ui/toast.tsx`

Temporary notification component.

#### Progress
**Location**: `src/components/ui/progress.tsx`

Progress indicator component.

#### Skeleton
**Location**: `src/components/ui/skeleton.tsx`

Loading placeholder component.

#### Spinner
**Location**: `src/components/ui/loading-spinner.tsx`

Loading indicator component.

---

## Layout Components

### Header
**Location**: `src/components/layout/header.tsx`  
**Stories**: `src/components/layout/header.stories.tsx`

Main application header with navigation and controls.

**Features**:
- Mobile menu toggle
- Current task indicator
- System status indicators
- Theme toggle
- User menu
- Responsive design

```tsx
import { Header } from '@/components/layout/header'

<Header 
  sidebarOpen={sidebarOpen}
  setSidebarOpen={setSidebarOpen}
  currentTask={{
    title: 'Processing data',
    status: 'In Progress'
  }}
/>
```

### Sidebar
**Location**: `src/components/layout/sidebar.tsx`

Navigation sidebar component.

### Footer
**Location**: `src/components/layout/footer.tsx`

Page footer component.

### Container
**Location**: `src/components/layout/container.tsx`

Layout container component.

---

## Page Templates

### Dashboard
**Location**: `src/pages/dashboard.tsx`

Dashboard layout template.

### Authentication Pages
**Location**: `src/pages/login.tsx`, `src/pages/register.tsx`

Login and registration page templates.

### Settings
**Location**: `src/pages/settings.tsx`

Settings page template.

### Chat
**Location**: `src/pages/chat.tsx`

Chat interface template.

### Task Manager
**Location**: `src/pages/task-manager.tsx`

Task management interface template.

---

## Design Patterns

### Compound Components
**Location**: `src/components/patterns/compound.tsx`

Examples of compound component patterns.

### Headless Components
**Location**: `src/components/patterns/headless.tsx`

Headless component implementations.

### Higher-Order Components
**Location**: `src/components/patterns/hoc.tsx`

HOC pattern examples.

### Render Props
**Location**: `src/components/patterns/render-props.tsx`

Render props pattern examples.

### Polymorphic Components
**Location**: `src/components/patterns/polymorphic.tsx`

Polymorphic component examples.

### Slots Pattern
**Location**: `src/components/patterns/slots.tsx`

Slots pattern implementation.

### Utility Components
**Location**: `src/components/patterns/utils.tsx`

Utility component patterns.

---

## Utilities

### Theme System
**Location**: `src/components/theme-provider.tsx`

Theme context and provider.

### Error Boundary
**Location**: `src/components/error-boundary.tsx`

Error boundary component.

### Accessibility
**Location**: `src/components/accessibility.tsx`

Accessibility utility components.

### Protected Route
**Location**: `src/components/protected-route.tsx`

Route protection component.

### Validation
**Location**: `src/components/validation-examples.tsx`

Form validation examples.

---

## Hooks

### use-mobile
**Location**: `src/hooks/use-mobile.ts`

Hook for mobile detection.

### use-responsive
**Location**: `src/hooks/use-responsive.ts`

Hook for responsive design utilities.

### use-toast
**Location**: `src/hooks/use-toast.ts`

Hook for toast notifications.

### use-zod-form
**Location**: `src/hooks/use-zod-form.ts`

Hook for Zod form validation.

### use-loading-states
**Location**: `src/hooks/use-loading-states.ts`

Hook for loading state management.

### use-animation-hooks
**Location**: `src/hooks/use-animation-hooks.ts`

Hook for animation utilities.

---

## Component Usage Examples

### Basic Button Usage
```tsx
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function ContactForm() {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Contact Us</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Your name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="your@email.com" />
        </div>
        <Button className="w-full">Send Message</Button>
      </CardContent>
    </Card>
  )
}
```

### Complex Layout Example
```tsx
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex">
        <Sidebar open={sidebarOpen} />
        <main className="flex-1 p-6">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,234</div>
                  </CardContent>
                </Card>
                {/* More cards */}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
```

---

## Component Status

### ✅ Production Ready
- Button
- Input
- Card
- Alert
- Badge
- Header

### 🔄 In Development
- Dialog (completed stories)
- Form components
- Data visualization

### 📋 Planned
- Advanced charts
- Calendar components
- File upload components
- Advanced navigation patterns

---

## Getting Started

1. **Import components** from the appropriate paths
2. **Wrap your app** with the ThemeProvider for theme support
3. **Use components** following the examples provided
4. **Check stories** in Storybook for interactive examples
5. **Read documentation** for detailed usage guidelines

For detailed information about any component, please refer to its Storybook stories and source code documentation.