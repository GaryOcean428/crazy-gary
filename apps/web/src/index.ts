/**
 * Master barrel export for the entire src directory
 * Provides centralized imports for all major modules
 * 
 * Usage:
 * import { Button, useAuth, type User } from '@/'
 */

// Components
export * from './components'

// Library utilities
export * from './lib'

// Custom hooks
export * from './hooks'

// Type definitions
export * from './types'

// React contexts
export * from './contexts'

// Feature modules
export * from './features'

// Page components
export * from './pages'

// Assets
export * from './assets'

// Re-export commonly used items for convenience
export { cn } from './lib/utils'
export { useToast, toast } from './hooks/use-toast'
export { useAuth } from './contexts/auth-context'

// Type aliases for common imports
export type { User, Task, AuthUser, Theme } from './types'