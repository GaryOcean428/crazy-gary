/**
 * Accessibility Integration Quick Guide
 * Step-by-step guide for implementing accessibility features
 */

// QUICK INTEGRATION GUIDE
// ========================

// 1. BASIC SETUP (Required for all pages)
// Add these to your main App.tsx or layout component:

import {
  SkipLinks,
  DEFAULT_SKIP_LINKS,
  StatusAnnouncer,
  AlertAnnouncer
} from '@/components/accessibility'

function App() {
  return (
    <>
      {/* Skip Links */}
      <SkipLinks links={DEFAULT_SKIP_LINKS} />
      
      {/* Live Region Announcers */}
      <StatusAnnouncer />
      <AlertAnnouncer />
      
      {/* Your app content */}
      <Router>
        {/* Routes and content */}
      </Router>
    </>
  )
}

// 2. MODAL/DIALOG FOCUS TRAPPING
// ==============================

import { EnhancedFocusTrap } from '@/components/accessibility'

function MyModal({ isOpen, onClose }) {
  return isOpen ? (
    <EnhancedFocusTrap
      active={true}
      onDeactivate={onClose}
      options={{
        focusOnMount: true,
        returnFocusOnDeactivate: true,
        allowOutsideClick: true
      }}
    >
      <div className="modal-overlay">
        <div className="modal-content" role="dialog" aria-modal="true">
          <h2>Modal Title</h2>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </EnhancedFocusTrap>
  ) : null
}

// 3. KEYBOARD SHORTCUTS
// ====================

import { useKeyboardShortcuts, keyboardShortcutManager } from '@/components/accessibility'

function MyComponent() {
  useKeyboardShortcuts(
    {
      id: 'my-component',
      name: 'My Component',
      priority: 5,
      shortcuts: [
        {
          key: 'k',
          modifiers: ['ctrl'],
          action: () => {
            // Custom action
            console.log('Shortcut triggered!')
          },
          description: 'Trigger custom action',
          category: 'Actions'
        }
      ]
    },
    true // enabled
  )

  return <div>Component content</div>
}

// 4. LIVE ANNOUNCEMENTS
// ====================

import { useAnnouncements } from '@/components/accessibility'

function MyFormComponent() {
  const { announce, announceSuccess, announceError } = useAnnouncements()

  const handleSubmit = async (formData) => {
    try {
      announce('Submitting form...', 'polite')
      
      await submitForm(formData)
      
      announceSuccess('Form submitted successfully!')
    } catch (error) {
      announceError('Form submission failed. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit">Submit</button>
    </form>
  )
}

// 5. ENHANCED LIST/GRID NAVIGATION
// ================================

import { useEnhancedKeyboardNavigation } from '@/components/accessibility'

function MyList({ items, onSelect }) {
  const {
    activeIndex,
    handleKeyDown,
    handleFocus
  } = useEnhancedKeyboardNavigation(
    items,
    {
      orientation: 'vertical',
      loop: true,
      onActivate: (item) => onSelect(item)
    }
  )

  return (
    <ul 
      role="listbox"
      aria-label="Selectable items"
      onKeyDown={handleKeyDown}
    >
      {items.map((item, index) => (
        <li
          key={item.id}
          role="option"
          aria-selected={index === activeIndex}
          tabIndex={index === activeIndex ? 0 : -1}
          onFocus={handleFocus}
          data-index={index}
          className={index === activeIndex ? 'focused' : ''}
        >
          {item.name}
        </li>
      ))}
    </ul>
  )
}

// 6. FOCUS RESTORATION
// ====================

import { useFocusRestore } from '@/components/accessibility'

function MyComponent() {
  const { saveFocus, restoreFocus } = useFocusRestore()

  const openDialog = () => {
    saveFocus('[data-trigger]') // Save current focus
    // Open dialog
  }

  const closeDialog = () => {
    // Close dialog
    restoreFocus() // Restore previous focus
  }

  return (
    <button data-trigger onClick={openDialog}>
      Open Dialog
    </button>
  )
}

// 7. DYNAMIC CONTENT ANNOUNCEMENTS
// ================================

import { DynamicContentAnnouncer } from '@/components/accessibility'

function MyListComponent() {
  const [items, setItems] = useState([])
  const [previousItems, setPreviousItems] = useState([])

  // When items change, announce updates
  useEffect(() => {
    setPreviousItems(items)
  }, [items])

  return (
    <div>
      <DynamicContentAnnouncer
        content={items}
        previousContent={previousItems}
        announceOnChange={true}
        announceOnAdd={true}
        announceOnRemove={false}
        ariaLabel="task list"
      />
      
      {/* Your list content */}
      <ul>
        {items.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  )
}

// 8. FORM VALIDATION ANNOUNCEMENTS
// ================================

import { FormValidationAnnouncer } from '@/components/accessibility'

function MyForm() {
  const [errors, setErrors] = useState([])
  const [isValidating, setIsValidating] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const validateForm = () => {
    setIsValidating(true)
    setIsSubmitted(false)
    
    // Validation logic
    const newErrors = validateFields()
    setErrors(newErrors)
    
    setIsValidating(false)
    setIsSubmitted(true)
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      validateForm()
    }}>
      <FormValidationAnnouncer
        errors={errors}
        isValidating={isValidating}
        isSubmitted={isSubmitted}
      />
      
      {/* Form fields */}
      <button type="submit">Submit</button>
    </form>
  )
}

// 9. PROGRESS ANNOUNCEMENTS
// ========================

import { ProgressAnnouncer } from '@/components/accessibility'

function MyProgressComponent() {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const simulateProgress = () => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 10
        if (newProgress >= 100) {
          setIsComplete(true)
          clearInterval(interval)
        }
        return newProgress
      })
    }, 500)
  }

  return (
    <div>
      <ProgressAnnouncer
        progress={progress}
        label="File upload"
        isComplete={isComplete}
      />
      
      <div className="progress-bar">
        <div style={{ width: `${progress}%` }} />
      </div>
      
      <button onClick={simulateProgress}>
        Start Upload
      </button>
    </div>
  )
}

// 10. LANDMARK STRUCTURE
// =====================

import { Landmark, LANDMARK_CONFIGS } from '@/components/accessibility'

function MyLayout() {
  return (
    <>
      <Landmark config={LANDMARK_CONFIGS.banner}>
        <header>
          <h1>My Application</h1>
        </header>
      </Landmark>

      <div className="flex">
        <Landmark config={LANDMARK_CONFIGS.navigation}>
          <nav aria-label="Main navigation">
            {/* Navigation items */}
          </nav>
        </Landmark>

        <Landmark config={LANDMARK_CONFIGS.main} id="main-content">
          <main>
            {/* Main content */}
          </main>
        </Landmark>

        {showSidebar && (
          <Landmark config={LANDMARK_CONFIGS.complementary}>
            <aside>
              {/* Sidebar content */}
            </aside>
          </Landmark>
        )}
      </div>

      <Landmark config={LANDMARK_CONFIGS.contentinfo}>
        <footer>
          <p>&copy; 2024 My Application</p>
        </footer>
      </Landmark>
    </>
  )
}

// 11. ACCESSIBILITY TESTING
// =========================

import { KeyboardTestRunner, KEYBOARD_TEST_SCENARIOS } from '@/components/accessibility'

function AccessibilityTestingPage() {
  return (
    <div>
      <h1>Accessibility Testing</h1>
      
      {/* Run automated tests */}
      <KeyboardTestRunner />
      
      {/* Manual testing checklist */}
      <div>
        <h2>Manual Testing Checklist</h2>
        <ul>
          <li>
            <input type="checkbox" id="test1" />
            <label htmlFor="test1">
              Tab navigation works through all interactive elements
            </label>
          </li>
          <li>
            <input type="checkbox" id="test2" />
            <label htmlFor="test2">
              Focus indicators are clearly visible
            </label>
          </li>
          <li>
            <input type="checkbox" id="test3" />
            <label htmlFor="test3">
              Modal focus trapping works correctly
            </label>
          </li>
          <li>
            <input type="checkbox" id="test4" />
            <label htmlFor="test4">
              Screen reader announcements work for dynamic content
            </label>
          </li>
        </ul>
      </div>
    </div>
  )
}

// 12. KEYBOARD SHORTCUTS HELP
// ==========================

import { KeyboardShortcutsModal } from '@/components/accessibility'

function MyApp() {
  const [showShortcuts, setShowShortcuts] = useState(false)

  return (
    <>
      {/* Your app content */}
      
      {/* Keyboard shortcuts modal */}
      <KeyboardShortcutsModal />
      
      {/* Button to show shortcuts (optional) */}
      <button onClick={() => setShowShortcuts(true)}>
        Show Keyboard Shortcuts
      </button>
    </>
  )
}

// 13. ADVANCED: CUSTOM CONTEXT MANAGEMENT
// ======================================

import { keyboardShortcutManager } from '@/components/accessibility'

// Register custom contexts
keyboardShortcutManager.registerContext({
  id: 'dashboard',
  name: 'Dashboard Shortcuts',
  priority: 5,
  shortcuts: [
    {
      key: 'r',
      modifiers: ['ctrl'],
      action: () => {
        // Refresh dashboard data
        refreshDashboard()
      },
      description: 'Refresh dashboard data',
      category: 'Data'
    },
    {
      key: 'f',
      modifiers: ['ctrl'],
      action: () => {
        // Open filter panel
        openFilterPanel()
      },
      description: 'Open filter panel',
      category: 'View'
    }
  ]
})

// Set active context based on current route
function useContextRouting() {
  const location = useLocation()
  
  useEffect(() => {
    if (location.pathname.startsWith('/dashboard')) {
      keyboardShortcutManager.setActiveContext('dashboard')
    } else if (location.pathname.startsWith('/chat')) {
      keyboardShortcutManager.setActiveContext('chat')
    } else {
      keyboardShortcutManager.setActiveContext('global')
    }
  }, [location.pathname])
}

// 14. INTEGRATION CHECKLIST
// ========================

/*
✅ Basic Setup:
  - Add SkipLinks to main layout
  - Add StatusAnnouncer and AlertAnnouncer
  - Add accessibility route to navigation

✅ Modal/Dialogs:
  - Use EnhancedFocusTrap for all modals
  - Ensure proper ARIA attributes
  - Test focus trapping and restoration

✅ Forms:
  - Use FormValidationAnnouncer for validation
  - Ensure all inputs have proper labels
  - Test with screen readers

✅ Lists/Grids:
  - Use useEnhancedKeyboardNavigation
  - Ensure proper ARIA roles
  - Test keyboard navigation

✅ Dynamic Content:
  - Add DynamicContentAnnouncer for content changes
  - Use useAnnouncements for user feedback
  - Test with screen readers

✅ Progress/Loading:
  - Use ProgressAnnouncer for long operations
  - Announce completion and errors

✅ Testing:
  - Run KeyboardTestRunner regularly
  - Test keyboard-only navigation
  - Test with screen readers
  - Validate WCAG compliance
*/

// 15. ROUTING INTEGRATION
// =======================

// Add to your main router
import AccessibilityShowcasePage from '@/pages/accessibility-showcase'

function App() {
  return (
    <Router>
      <Routes>
        {/* Other routes */}
        <Route path="/accessibility-demo" element={<AccessibilityShowcasePage />} />
        {/* Protected routes */}
        <Route path="/*" element={<ProtectedRoutes />} />
      </Routes>
    </Router>
  )
}

// Add to sidebar navigation
const navigation = [
  // Other items...
  {
    name: 'Accessibility',
    href: '/accessibility-demo',
    icon: Accessibility,
    description: 'WCAG 2.1 AA accessibility features'
  }
]

export default {
  // This guide provides all the necessary patterns
  // for implementing comprehensive accessibility features
  // in your React application.
}