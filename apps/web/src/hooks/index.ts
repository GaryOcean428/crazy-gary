/**
 * Barrel export for all custom hooks
 * Centralized hook imports for cleaner code
 */

// Toast management
export * from './use-toast'

// Mobile detection and responsive design
export * from './use-mobile'

// Comprehensive responsive design hooks
export * from './use-responsive'

// Re-export hooks with commonly used aliases
export { useToast, toast } from './use-toast'

// Legacy responsive design hooks (for backward compatibility)
export {
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useScreenSize,
  useIsTouchDevice,
  useOrientation,
  useIsLandscape,
  useIsPortrait,
  useResponsiveValue,
  usePrefersReducedMotion,
  usePrefersDarkMode,
  useWindowSize,
  useDeviceInfo
} from './use-mobile'