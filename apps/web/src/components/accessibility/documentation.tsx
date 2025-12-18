/**
 * Comprehensive Accessibility Documentation
 * Provides detailed documentation for all accessibility features
 */

import React, { useState } from 'react'

// Types for documentation sections
export interface DocSection {
  id: string
  title: string
  content: React.ReactNode
  subsections?: DocSection[]
}

// Main accessibility documentation component
export const AccessibilityDocumentation: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview')

  const sections: DocSection[] = [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <div className="space-y-4">
          <p>
            This comprehensive accessibility system provides WCAG 2.1 AA compliant features
            and keyboard navigation patterns for power users. The system includes:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Custom keyboard shortcuts with context-aware navigation</li>
            <li>Enhanced focus management with trapping and restoration</li>
            <li>ARIA live regions for dynamic content announcements</li>
            <li>Skip links and landmark navigation</li>
            <li>Comprehensive keyboard navigation patterns</li>
            <li>Automated accessibility testing scenarios</li>
          </ul>
        </div>
      )
    },
    {
      id: 'keyboard-shortcuts',
      title: 'Keyboard Shortcuts',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Overview</h3>
            <p>
              The keyboard shortcuts system provides power user functionality with 
              context-aware shortcuts that can be customized and managed dynamically.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Basic Usage</h3>
            <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`import { useKeyboardShortcuts, keyboardShortcutManager } from '@/components/accessibility/keyboard-shortcuts'

const MyComponent = () => {
  const { setActiveContext } = useKeyboardShortcuts({
    id: 'my-context',
    name: 'My Context',
    priority: 5,
    shortcuts: [
      {
        key: 'k',
        modifiers: ['ctrl'],
        action: () => console.log('Custom action'),
        description: 'Execute custom action',
        category: 'Custom'
      }
    ]
  }, true)

  return <div>Component content</div>
}`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Predefined Shortcuts</h3>
            <div className="space-y-2">
              <div><strong>Global:</strong> Ctrl+K (search), Shift+? (help), Escape (close modals)</div>
              <div><strong>Navigation:</strong> Ctrl+H (home), Ctrl+T (tasks), Ctrl+C (chat), Ctrl+S (settings)</div>
              <div><strong>Application:</strong> Ctrl+N (new), Ctrl+F (filter), Ctrl+R (refresh), Ctrl+D (toggle theme)</div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Context Management</h3>
            <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`// Register custom context
keyboardShortcutManager.registerContext({
  id: 'my-app',
  name: 'My App Shortcuts',
  priority: 10,
  shortcuts: [...]
})

// Set active context
keyboardShortcutManager.setActiveContext('my-app')

// Get all contexts
const contexts = keyboardShortcutManager.getAllContexts()`}
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 'focus-management',
      title: 'Focus Management',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Enhanced Focus Trap</h3>
            <p>
              Provides comprehensive focus trapping with advanced options for modal dialogs
              and complex interactive components.
            </p>
            <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`import { EnhancedFocusTrap } from '@/components/accessibility/focus-management'

<EnhancedFocusTrap
  active={isModalOpen}
  onDeactivate={() => setIsModalOpen(false)}
  options={{
    focusOnMount: true,
    focusOnUnmount: true,
    escapeDeactivates: true,
    returnFocusOnDeactivate: true,
    initialFocus: '[data-focus="first"]',
    allowOutsideClick: true
  }}
>
  <div className="modal-content">
    {/* Modal content */}
  </div>
</EnhancedFocusTrap>`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Focus Restoration</h3>
            <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`import { useFocusRestore } from '@/components/accessibility/focus-management'

const MyComponent = () => {
  const { saveFocus, restoreFocus } = useFocusRestore()

  const openModal = () => {
    saveFocus('[data-trigger]') // Save current focus
    // Open modal
  }

  const closeModal = () => {
    restoreFocus() // Restore previous focus
    // Close modal
  }

  return <button onClick={openModal} data-trigger>Open</button>
}`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Enhanced Keyboard Navigation</h3>
            <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`import { useEnhancedKeyboardNavigation } from '@/components/accessibility/focus-management'

const MyList = ({ items }) => {
  const { activeIndex, handleKeyDown, handleFocus } = useEnhancedKeyboardNavigation(
    items,
    {
      orientation: 'vertical',
      loop: true,
      onActivate: (item) => selectItem(item)
    }
  )

  return (
    <ul onKeyDown={handleKeyDown}>
      {items.map((item, index) => (
        <li
          key={item.id}
          tabIndex={index === activeIndex ? 0 : -1}
          onFocus={handleFocus}
          data-index={index}
        >
          {item.name}
        </li>
      ))}
    </ul>
  )
}`}
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 'landmarks',
      title: 'Skip Links & Landmarks',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Skip Links</h3>
            <p>
              Skip links allow keyboard users to jump directly to important page sections.
            </p>
            <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`import { SkipLinks, DEFAULT_SKIP_LINKS } from '@/components/accessibility/landmarks'

// Use default skip links
<SkipLinks links={DEFAULT_SKIP_LINKS} />

// Or custom skip links
<SkipLinks links={[
  { href: '#main', text: 'Skip to main content' },
  { href: '#nav', text: 'Skip to navigation' }
]} />`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Landmarks</h3>
            <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`import { Landmark, LANDMARK_CONFIGS } from '@/components/accessibility/landmarks'

<Landmark config={LANDMARK_CONFIGS.banner}>
  <header>Header content</header>
</Landmark>

<Landmark config={LANDMARK_CONFIGS.navigation}>
  <nav>Navigation content</nav>
</Landmark>

<Landmark config={LANDMARK_CONFIGS.main} id="main-content">
  <main>Main content</main>
</Landmark>`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Page Structure Analysis</h3>
            <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`import { PageStructureAnalyzer } from '@/components/accessibility/landmarks'

// Add to your layout for debugging
<PageStructureAnalyzer />`}
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 'live-regions',
      title: 'ARIA Live Regions',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Live Region Manager</h3>
            <p>
              Provides a queue-based system for managing dynamic content announcements
              to screen readers with priority handling.
            </p>
            <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`import { useAnnouncements } from '@/components/accessibility/live-regions'

const MyComponent = () => {
  const { announce, announceSuccess, announceError } = useAnnouncements()

  const handleAction = async () => {
    try {
      // Perform action
      announce('Processing request...')
      await performAction()
      announceSuccess('Action completed successfully')
    } catch (error) {
      announceError('Action failed. Please try again.')
    }
  }

  return <button onClick={handleAction}>Perform Action</button>
}`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Dynamic Content Announcements</h3>
            <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`import { DynamicContentAnnouncer } from '@/components/accessibility/live-regions'

<DynamicContentAnnouncer
  content={items}
  previousContent={previousItems}
  announceOnChange={true}
  announceOnAdd={true}
  ariaLabel="task list"
/>`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Form Validation Announcements</h3>
            <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`import { FormValidationAnnouncer } from '@/components/accessibility/live-regions'

<FormValidationAnnouncer
  errors={validationErrors}
  isValidating={isValidating}
  isSubmitted={isSubmitted}
/>`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Progress Announcements</h3>
            <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`import { ProgressAnnouncer } from '@/components/accessibility/live-regions'

<ProgressAnnouncer
  progress={uploadProgress}
  label="File upload"
  isComplete={uploadComplete}
/>`}
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 'testing',
      title: 'Accessibility Testing',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Keyboard Navigation Tests</h3>
            <p>
              Automated testing scenarios for keyboard-only navigation patterns.
            </p>
            <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`import { KeyboardTestRunner, KEYBOARD_TEST_SCENARIOS } from '@/components/accessibility/keyboard-examples'

// Add to your testing page
<KeyboardTestRunner />

// Use predefined scenarios
KEYBOARD_TEST_SCENARIOS.forEach(scenario => {
  console.log(\`Testing: \${scenario.name}\`)
  console.log(\`Requirements: \${scenario.accessibilityRequirements.join(', ')}\`)
})`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Testing Checklist</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="test-1" />
                <label htmlFor="test-1">Tab navigation works through all interactive elements</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="test-2" />
                <label htmlFor="test-2">Focus indicators are visible and clearly defined</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="test-3" />
                <label htmlFor="test-3">Modal focus trapping works correctly</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="test-4" />
                <label htmlFor="test-4">Escape key closes modals and dropdowns</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="test-5" />
                <label htmlFor="test-5">Arrow keys navigate menus and lists</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="test-6" />
                <label htmlFor="test-6">Screen reader announcements work for dynamic content</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="test-7" />
                <label htmlFor="test-7">Skip links work and are discoverable</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="test-8" />
                <label htmlFor="test-8">Landmarks are properly labeled and structured</label>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Manual Testing Guidelines</h3>
            <div className="space-y-3">
              <div>
                <strong>Keyboard Only Testing:</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Navigate entire application using only keyboard</li>
                  <li>Test all interactive elements are reachable</li>
                  <li>Verify focus indicators are clearly visible</li>
                  <li>Ensure logical tab order throughout application</li>
                </ul>
              </div>
              
              <div>
                <strong>Screen Reader Testing:</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Test with NVDA (Windows) or VoiceOver (macOS)</li>
                  <li>Verify all content is announced properly</li>
                  <li>Check that dynamic updates are announced</li>
                  <li>Ensure form labels and error messages are clear</li>
                </ul>
              </div>
              
              <div>
                <strong>Visual Testing:</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Test with high contrast mode enabled</li>
                  <li>Verify focus indicators work in all themes</li>
                  <li>Check color contrast ratios meet WCAG AA standards</li>
                  <li>Test with text scaled to 200%</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'implementation-guide',
      title: 'Implementation Guide',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Step-by-Step Implementation</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">1. Setup Accessibility Configuration</h4>
                <pre className="bg-muted p-3 rounded text-sm">
{`// src/config/accessibility-config.ts
export const accessibilityConfig = {
  // Configuration already exists in the project
}`}
                </pre>
              </div>
              
              <div>
                <h4 className="font-semibold">2. Add to Main Layout</h4>
                <pre className="bg-muted p-3 rounded text-sm">
{`// src/App.tsx
import { SkipLinks, DEFAULT_SKIP_LINKS } from '@/components/accessibility/landmarks'
import { StatusAnnouncer, AlertAnnouncer } from '@/components/accessibility/live-regions'

function App() {
  return (
    <>
      <SkipLinks links={DEFAULT_SKIP_LINKS} />
      <StatusAnnouncer />
      <AlertAnnouncer />
      {/* Rest of your app */}
    </>
  )
}`}
                </pre>
              </div>
              
              <div>
                <h4 className="font-semibold">3. Update Components</h4>
                <pre className="bg-muted p-3 rounded text-sm">
{`// Add keyboard shortcuts to relevant pages
import { useKeyboardShortcuts, keyboardShortcutManager } from '@/components/accessibility/keyboard-shortcuts'

function Dashboard() {
  const { setActiveContext } = useKeyboardShortcuts(
    keyboardShortcutManager.getContext('dashboard') || 
    keyboardShortcutManager.getContext('global'),
    true
  )
  // Component logic
}`}
                </pre>
              </div>
              
              <div>
                <h4 className="font-semibold">4. Test Accessibility</h4>
                <pre className="bg-muted p-3 rounded text-sm">
{`// Add to your testing page or component
import { KeyboardTestRunner } from '@/components/accessibility/keyboard-examples'

function AccessibilityTesting() {
  return <KeyboardTestRunner />
}`}
                </pre>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Best Practices</h3>
            <div className="space-y-2">
              <div>
                <strong>Focus Management:</strong>
                <ul className="list-disc list-inside ml-4">
                  <li>Always restore focus when closing modals</li>
                  <li>Use logical tab order throughout your application</li>
                  <li>Provide clear visual focus indicators</li>
                  <li>Trap focus within modals and complex widgets</li>
                </ul>
              </div>
              
              <div>
                <strong>Keyboard Navigation:</strong>
                <ul className="list-disc list-inside ml-4">
                  <li>Support standard keyboard shortcuts</li>
                  <li>Use arrow keys for menu and list navigation</li>
                  <li>Support Home/End keys for navigation boundaries</li>
                  <li>Always provide Escape key to close dialogs</li>
                </ul>
              </div>
              
              <div>
                <strong>Screen Reader Support:</strong>
                <ul className="list-disc list-inside ml-4">
                  <li>Use proper ARIA labels and descriptions</li>
                  <li>Announce dynamic content changes</li>
                  <li>Provide meaningful form labels</li>
                  <li>Use live regions for status updates</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'api-reference',
      title: 'API Reference',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Keyboard Shortcuts API</h3>
            <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`// useKeyboardShortcuts hook
const { setActiveContext, toggleShortcut, getShortcuts } = useKeyboardShortcuts(
  context: KeyboardShortcutContext,
  enabled?: boolean
)

// KeyboardShortcutManager
keyboardShortcutManager.registerContext(context: KeyboardShortcutContext)
keyboardShortcutManager.setActiveContext(contextId: string)
keyboardShortcutManager.getActiveContext(): KeyboardShortcutContext | null
keyboardShortcutManager.getAllContexts(): KeyboardShortcutContext[]`}
            </pre>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Focus Management API</h3>
            <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`// EnhancedFocusTrap component
<EnhancedFocusTrap
  active?: boolean
  onDeactivate?: () => void
  options?: {
    focusOnMount?: boolean
    focusOnUnmount?: boolean
    escapeDeactivates?: boolean
    returnFocusOnDeactivate?: boolean
    initialFocus?: string | HTMLElement | (() => HTMLElement)
    finalFocus?: string | HTMLElement | (() => HTMLElement)
    allowOutsideClick?: boolean | ((clickEvent: MouseEvent) => boolean)
    allowEscapeKey?: boolean
  }
>

// useFocusRestore hook
const { saveFocus, restoreFocus, clearSavedFocus, hasSavedFocus } = useFocusRestore()`}
            </pre>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Live Regions API</h3>
            <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`// useAnnouncements hook
const { 
  announce, 
  announceSuccess,, 
  announceWarning, 
  
  announceError announceInfo, 
  announceAction 
} = useAnnouncements()

// Live region configurations
const config: LiveRegionConfig = {
  politeness: 'polite' | 'assertive' | 'off'
  atomic?: boolean
  relevant?: 'additions' | 'removals' | 'text' | 'all'
  live?: 'polite' | 'assertive' | 'off'
}`}
            </pre>
          </div>
        </div>
      )
    }
  ]

  const currentSection = sections.find(s => s.id === activeSection)

  return (
    <div className="flex h-screen">
      {/* Sidebar navigation */}
      <nav className="w-64 bg-background border-r overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Accessibility Guide</h2>
          <ul className="space-y-1">
            {sections.map(section => (
              <li key={section.id}>
                <button
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded hover:bg-muted ${
                    activeSection === section.id ? 'bg-muted' : ''
                  }`}
                >
                  {section.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          {currentSection && (
            <div>
              <h1 className="text-3xl font-bold mb-6">{currentSection.title}</h1>
              <div className="prose max-w-none">
                {currentSection.content}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default AccessibilityDocumentation