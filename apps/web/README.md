# Crazy Gary Web Application

A modern React web application with comprehensive barrel exports for improved code organization and maintainability.

## Features

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Comprehensive barrel exports** for clean imports
- **Feature-based architecture** with modular structure
- **TypeScript-first** development with strict type checking

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Import Structure

This application uses a comprehensive barrel export system for clean and maintainable imports:

### Clean Imports
```typescript
// Instead of deep imports like this:
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'
import type { User } from '@/types'

// You can import everything cleanly:
import { Button, useAuth, cn, type User } from '@/'
```

### Component Imports
```typescript
// Import UI components
import { Button, Card, Input, Dialog } from '@/components'

// Import layout components  
import { Header, Sidebar } from '@/components'

// Import feature components
import { DynamicDashboardControls } from '@/features'
```

### Utility Imports
```typescript
// Import utilities
import { cn, formatNumber, getStatusConfig } from '@/lib'

// Import hooks
import { useToast, useMobile } from '@/hooks'

// Import contexts
import { useAuth, AuthProvider } from '@/contexts'
```

### Type Imports
```typescript
// Import types
import type { User, Task, AuthUser, Theme } from '@/types'

// Import feature-specific types
import type { DashboardConfig, MetricData } from '@/features'
```

## Project Structure

```
src/
├── components/          # UI Components
│   ├── ui/             # Reusable UI components
│   ├── layout/         # Layout components
│   ├── shared/         # Shared utilities
│   └── index.ts        # Component barrel export
├── lib/                # Utilities & Helpers
│   ├── utils.ts        # Core utilities
│   ├── component-utils.ts # Component utilities
│   ├── api-client.ts   # API client
│   └── index.ts        # Library barrel export
├── hooks/              # Custom React Hooks
│   ├── use-toast.ts    # Toast notifications
│   ├── use-mobile.ts   # Mobile detection
│   └── index.ts        # Hooks barrel export
├── types/              # TypeScript Definitions
│   └── index.ts        # Types barrel export
├── contexts/           # React Contexts
│   ├── auth-context.tsx # Authentication
│   └── index.ts        # Contexts barrel export
├── features/           # Feature Modules
│   ├── dashboard/      # Dashboard feature
│   └── index.ts        # Features barrel export
├── pages/              # Page Components
│   ├── dashboard.tsx   # Dashboard page
│   ├── chat.tsx        # Chat page
│   └── index.ts        # Pages barrel export
└── index.ts            # Master barrel export
```

## Development Guidelines

### 1. Use Barrel Exports
Always prefer importing from barrel exports rather than deep file paths:

```typescript
// ✅ Good
import { Button } from '@/components'

// ❌ Avoid
import { Button } from '@/components/ui/button'
```

### 2. Group Related Imports
Group related imports in the same statement when possible:

```typescript
// ✅ Good
import { Button, Card, Input } from '@/components'
import { useAuth, useToast } from '@/'

// ❌ Avoid separate statements
import { Button } from '@/components'
import { Card } from '@/components'
import { useAuth } from '@/contexts'
```

### 3. Use Type Imports
Use explicit type imports for better tree-shaking:

```typescript
// ✅ Good
import type { User, Task } from '@/types'

// ✅ Also good for runtime usage
import { type User, type Task } from '@/types'
```

### 4. Feature-Based Organization
Organize code by features rather than by technical layers:

```
features/
├── dashboard/
│   ├── components/     # Dashboard-specific components
│   ├── hooks/         # Dashboard-specific hooks
│   ├── types/         # Dashboard-specific types
│   └── index.ts       # Feature barrel export
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible UI primitives
- **Lucide React** - Icons
- **React Hook Form** - Form management
- **React Router** - Routing

## Path Aliases

The application uses the following path aliases:

- `@/` - src directory
- `@/components/*` - components directory
- `@/lib/*` - lib directory
- `@/hooks/*` - hooks directory
- `@/types/*` - types directory
- `@/contexts/*` - contexts directory
- `@/features/*` - features directory
- `@/pages/*` - pages directory

## Contributing

When adding new components, utilities, or features:

1. Create them in the appropriate directory
2. Export them from the corresponding barrel export (`index.ts`)
3. Update the master barrel export if needed
4. Add TypeScript types where appropriate
5. Follow the existing naming conventions

## Documentation

- [Barrel Exports Documentation](./BARREL_EXPORTS.md) - Detailed guide on barrel exports
- [Development Guide](../docs/DEVELOPMENT_GUIDE.md) - General development guidelines
- [API Documentation](../docs/API.md) - API reference