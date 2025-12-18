/**
 * Barrel export for all library utilities and helpers
 * Centralized utility imports for cleaner code
 */

// Core utilities
export * from './utils'

// Component utilities
export * from './component-utils'

// API client
export * from './api-client'

// Performance utilities
export * from './performance'

// Icons and status configurations
export * from './icons'

// Test utilities
export * from './test-utils'

// Re-export frequently used utilities with shorter aliases
export { cn } from './utils'

// Utility type helpers
export type {
  ClassValue
} from 'clsx'