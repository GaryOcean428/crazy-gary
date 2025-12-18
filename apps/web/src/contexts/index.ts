/**
 * Barrel export for all React contexts
 * Centralized context imports for cleaner code
 */

// Auth context
export { AuthProvider, useAuth } from './auth-context'

// Context type exports
export type {
  AuthContextType,
  AuthUser,
  AuthResponse
} from '@/types'