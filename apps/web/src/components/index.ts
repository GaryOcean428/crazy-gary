/**
 * Barrel export for all components
 * Centralized component imports for cleaner code
 */

// UI Components (comprehensive export from ui directory)
export * from './ui'

// Layout Components
export * from './layout/header'
export * from './layout/sidebar'
export * from './layout/responsive-navigation'

// Layout Components
export * from './layout/header'
export * from './layout/sidebar'

// Shared Components
export * from './shared/status-components'

// Feature Components
export * from './accessibility'
export * from './agent-observability'
export * from './error-boundary'
export * from './protected-route'
export * from './theme-provider'

// Component Type Definitions
export type {
  SidebarProps,
  HeaderProps,
  TaskManagerProps
} from '@/types'

// Re-export commonly used UI components with shorter aliases
export { Button } from './ui/button'
export { Card } from './ui/card'
export { Input } from './ui/input'
export { Label } from './ui/label'
export { Badge } from './ui/badge'
export { Dialog } from './ui/dialog'
export { Alert } from './ui/alert'