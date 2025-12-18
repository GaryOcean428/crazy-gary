/**
 * Comprehensive Accessibility Components Index
 * Exports all accessibility components and utilities
 */

// Original accessibility components
export {
  SkipToMain,
  ScreenReaderOnly,
  VisuallyHidden,
  FocusTrap,
  LiveRegion,
  AccessibleButton,
  AccessibleField,
  useAnnouncements,
  useFocusManagement,
  useKeyboardNavigation
} from './accessibility'

// Keyboard shortcuts system
export {
  useKeyboardShortcuts,
  KeyboardShortcutManager,
  keyboardShortcutManager,
  KeyboardShortcutsHelp,
  DEFAULT_SHORTCUT_CONTEXTS,
  type KeyboardShortcut,
  type KeyboardShortcutContext
} from './keyboard-shortcuts'

// Enhanced focus management
export {
  EnhancedFocusTrap,
  useFocusRestore,
  useEnhancedKeyboardNavigation,
  manageTabOrder,
  AccessibleList,
  type FocusTrapOptions,
  type FocusRestoreOptions
} from './focus-management'

// Skip links and landmarks
export {
  Landmark,
  LANDMARK_CONFIGS,
  SkipLinks,
  DEFAULT_SKIP_LINKS,
  AccessibleLayout,
  createCustomLandmark,
  HeadingHierarchy,
  PageStructureAnalyzer,
  AccessibilityTreeViewer,
  AccessiblePageRegions,
  type LandmarkConfig,
  type SkipLinkConfig
} from './landmarks'

// ARIA live regions
export {
  useLiveRegionManager,
  LiveRegion,
  LIVE_REGION_CONFIGS,
  LiveRegionsContainer,
  StatusAnnouncer,
  AlertAnnouncer,
  DynamicContentAnnouncer,
  ProgressAnnouncer,
  FormValidationAnnouncer,
  MenuAnnouncer,
  ModalAnnouncer,
  useAnnouncements as useLiveAnnouncements,
  type LiveRegionConfig,
  type Announcement
} from './live-regions'

// Keyboard navigation examples and testing
export {
  KEYBOARD_TEST_SCENARIOS,
  KeyboardTestRunner,
  AccessibleModalExample,
  AccessibleMenuExample,
  KeyboardShortcutsModal,
  KeyboardNavigationExamples,
  type KeyboardTestScenario,
  type TestStep
} from './keyboard-examples'

// Documentation
export {
  AccessibilityDocumentation
} from './documentation'

// Re-export useAnnouncements from live-regions for convenience
export { useAnnouncements } from './live-regions'

// Default export with all components
const AccessibilityComponents = {
  // Original components
  SkipToMain,
  ScreenReaderOnly,
  VisuallyHidden,
  FocusTrap,
  LiveRegion,
  AccessibleButton,
  AccessibleField,
  useAnnouncements,
  useFocusManagement,
  useKeyboardNavigation,
  
  // Keyboard shortcuts
  useKeyboardShortcuts,
  KeyboardShortcutManager,
  keyboardShortcutManager,
  KeyboardShortcutsHelp,
  DEFAULT_SHORTCUT_CONTEXTS,
  
  // Focus management
  EnhancedFocusTrap,
  useFocusRestore,
  useEnhancedKeyboardNavigation,
  manageTabOrder,
  AccessibleList,
  
  // Landmarks
  Landmark,
  LANDMARK_CONFIGS,
  SkipLinks,
  DEFAULT_SKIP_LINKS,
  AccessibleLayout,
  createCustomLandmark,
  HeadingHierarchy,
  PageStructureAnalyzer,
  AccessibilityTreeViewer,
  AccessiblePageRegions,
  
  // Live regions
  useLiveRegionManager,
  LIVE_REGION_CONFIGS,
  LiveRegionsContainer,
  StatusAnnouncer,
  AlertAnnouncer,
  DynamicContentAnnouncer,
  ProgressAnnouncer,
  FormValidationAnnouncer,
  MenuAnnouncer,
  ModalAnnouncer,
  useLiveAnnouncements,
  
  // Testing
  KEYBOARD_TEST_SCENARIOS,
  KeyboardTestRunner,
  AccessibleModalExample,
  AccessibleMenuExample,
  KeyboardShortcutsModal,
  KeyboardNavigationExamples,
  
  // Documentation
  AccessibilityDocumentation
}

export default AccessibilityComponents