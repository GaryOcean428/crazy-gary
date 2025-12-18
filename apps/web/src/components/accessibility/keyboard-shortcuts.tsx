/**
 * Custom Keyboard Shortcuts System
 * Provides power user keyboard navigation capabilities
 */

import { useEffect, useCallback, useRef } from 'react'
import { useAnnouncements } from '@/components/accessibility'

// Types for keyboard shortcuts
export interface KeyboardShortcut {
  key: string
  modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[]
  action: () => void
  description: string
  category: string
  scope?: string
  enabled?: boolean
}

export interface KeyboardShortcutContext {
  id: string
  name: string
  shortcuts: KeyboardShortcut[]
  priority: number
}

// Hook for managing keyboard shortcuts
export const useKeyboardShortcuts = (
  context: KeyboardShortcutContext,
  enabled: boolean = true
) => {
  const { announce } = useAnnouncements()
  const activeContextRef = useRef<KeyboardShortcutContext | null>(null)

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled || !activeContextRef.current) return

    const context = activeContextRef.current
    const shortcuts = context.shortcuts.filter(s => s.enabled !== false)

    for (const shortcut of shortcuts) {
      if (matchesShortcut(event, shortcut)) {
        event.preventDefault()
        event.stopPropagation()
        
        // Announce the action for screen readers
        announce(`Executed: ${shortcut.description}`, 'polite')
        
        // Execute the action
        shortcut.action()
        break
      }
    }
  }, [enabled, announce])

  const setActiveContext = useCallback((context: KeyboardShortcutContext | null) => {
    activeContextRef.current = context
  }, [])

  const toggleShortcut = useCallback((shortcutId: string, enabled: boolean) => {
    if (activeContextRef.current) {
      const shortcut = activeContextRef.current.shortcuts.find(s => s.key === shortcutId)
      if (shortcut) {
        shortcut.enabled = enabled
      }
    }
  }, [])

  const getShortcuts = useCallback(() => {
    return activeContextRef.current?.shortcuts || []
  }, [])

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown, { capture: true })
      return () => {
        document.removeEventListener('keydown', handleKeyDown, { capture: true })
      }
    }
  }, [handleKeyDown, enabled])

  return {
    setActiveContext,
    toggleShortcut,
    getShortcuts
  }
}

// Utility function to check if a key combination matches
const matchesShortcut = (event: KeyboardEvent, shortcut: KeyboardShortcut): boolean => {
  const { key, modifiers = [] } = shortcut
  
  // Check if the key matches
  if (event.key.toLowerCase() !== key.toLowerCase()) {
    return false
  }

  // Check modifiers
  const modifierChecks = {
    ctrl: event.ctrlKey,
    alt: event.altKey,
    shift: event.shiftKey,
    meta: event.metaKey
  }

  for (const modifier of modifiers) {
    if (!modifierChecks[modifier]) {
      return false
    }
  }

  return true
}

// Predefined keyboard shortcut contexts
export const DEFAULT_SHORTCUT_CONTEXTS: KeyboardShortcutContext[] = [
  {
    id: 'global',
    name: 'Global Shortcuts',
    priority: 1,
    shortcuts: [
      {
        key: 'k',
        modifiers: ['ctrl'],
        action: () => {
          // Focus search
          const searchInput = document.querySelector('[data-shortcut="search"]') as HTMLInputElement
          searchInput?.focus()
        },
        description: 'Focus search input',
        category: 'Navigation'
      },
      {
        key: '?',
        modifiers: ['shift'],
        action: () => {
          // Show keyboard shortcuts help
          const modal = document.querySelector('[data-modal="shortcuts-help"]') as HTMLElement
          modal?.click()
        },
        description: 'Show keyboard shortcuts help',
        category: 'Help'
      },
      {
        key: 'Escape',
        action: () => {
          // Close any open modals or dropdowns
          const openModal = document.querySelector('[role="dialog"][aria-hidden="false"]') as HTMLElement
          const openDropdown = document.querySelector('[role="menu"][aria-hidden="false"]') as HTMLElement
          
          if (openModal) {
            const closeButton = openModal.querySelector('[aria-label="Close"]') as HTMLElement
            closeButton?.click()
          } else if (openDropdown) {
            openDropdown.click()
          }
        },
        description: 'Close modals and dropdowns',
        category: 'Global Actions'
      }
    ]
  },
  {
    id: 'navigation',
    name: 'Navigation Shortcuts',
    priority: 2,
    shortcuts: [
      {
        key: 'h',
        modifiers: ['ctrl'],
        action: () => {
          // Go to home/dashboard
          window.location.href = '/'
        },
        description: 'Go to home',
        category: 'Navigation'
      },
      {
        key: 't',
        modifiers: ['ctrl'],
        action: () => {
          // Go to tasks
          window.location.href = '/tasks'
        },
        description: 'Go to tasks',
        category: 'Navigation'
      },
      {
        key: 'c',
        modifiers: ['ctrl'],
        action: () => {
          // Go to chat
          window.location.href = '/chat'
        },
        description: 'Go to chat',
        category: 'Navigation'
      },
      {
        key: 's',
        modifiers: ['ctrl'],
        action: () => {
          // Go to settings
          window.location.href = '/settings'
        },
        description: 'Go to settings',
        category: 'Navigation'
      }
    ]
  },
  {
    id: 'application',
    name: 'Application Shortcuts',
    priority: 3,
    shortcuts: [
      {
        key: 'n',
        modifiers: ['ctrl'],
        action: () => {
          // Create new item (context dependent)
          const newButton = document.querySelector('[data-action="create-new"]') as HTMLElement
          newButton?.click()
        },
        description: 'Create new item',
        category: 'Actions'
      },
      {
        key: 'f',
        modifiers: ['ctrl'],
        action: () => {
          // Open filter/search
          const filterButton = document.querySelector('[data-action="open-filter"]') as HTMLElement
          filterButton?.click()
        },
        description: 'Open filter panel',
        category: 'Actions'
      },
      {
        key: 'r',
        modifiers: ['ctrl'],
        action: () => {
          // Refresh current view
          window.location.reload()
        },
        description: 'Refresh current page',
        category: 'Actions'
      },
      {
        key: 'd',
        modifiers: ['ctrl'],
        action: () => {
          // Toggle dark/light theme
          const themeToggle = document.querySelector('[data-action="toggle-theme"]') as HTMLElement
          themeToggle?.click()
        },
        description: 'Toggle theme',
        category: 'Display'
      }
    ]
  }
]

// Context manager for keyboard shortcuts
export class KeyboardShortcutManager {
  private contexts: Map<string, KeyboardShortcutContext> = new Map()
  private activeContext: KeyboardShortcutContext | null = null

  registerContext(context: KeyboardShortcutContext) {
    this.contexts.set(context.id, context)
  }

  setActiveContext(contextId: string) {
    const context = this.contexts.get(contextId)
    if (context) {
      this.activeContext = context
    }
  }

  getActiveContext() {
    return this.activeContext
  }

  getAllContexts() {
    return Array.from(this.contexts.values())
  }

  getContext(id: string) {
    return this.contexts.get(id)
  }
}

// Global instance
export const keyboardShortcutManager = new KeyboardShortcutManager()

// Register all default contexts
DEFAULT_SHORTCUT_CONTEXTS.forEach(context => {
  keyboardShortcutManager.registerContext(context)
})

// Keyboard shortcuts help component
export const KeyboardShortcutsHelp: React.FC = () => {
  const contexts = keyboardShortcutManager.getAllContexts()
    .sort((a, b) => a.priority - b.priority)

  const formatShortcut = (shortcut: KeyboardShortcut): string => {
    const parts = []
    
    if (shortcut.modifiers?.includes('ctrl')) parts.push('Ctrl')
    if (shortcut.modifiers?.includes('alt')) parts.push('Alt')
    if (shortcut.modifiers?.includes('shift')) parts.push('Shift')
    if (shortcut.modifiers?.includes('meta')) parts.push('Cmd')
    
    parts.push(shortcut.key.toUpperCase())
    return parts.join(' + ')
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Keyboard Shortcuts</h2>
      
      {contexts.map(context => (
        <div key={context.id} className="mb-8">
          <h3 className="text-lg font-semibold mb-4">{context.name}</h3>
          
          <div className="space-y-2">
            {context.shortcuts
              .filter(shortcut => shortcut.enabled !== false)
              .map((shortcut, index) => (
                <div 
                  key={`${context.id}-${index}`}
                  className="flex justify-between items-center py-2 px-4 border rounded"
                >
                  <span className="text-sm">{shortcut.description}</span>
                  <kbd className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-mono">
                    {formatShortcut(shortcut)}
                  </kbd>
                </div>
              ))}
          </div>
        </div>
      ))}
      
      <div className="mt-8 p-4 bg-muted rounded">
        <p className="text-sm text-muted-foreground">
          Press <kbd className="px-1 py-0.5 bg-background border rounded text-xs">?</kbd> to open this help dialog.
        </p>
      </div>
    </div>
  )
}

export default {
  useKeyboardShortcuts,
  KeyboardShortcutManager,
  keyboardShortcutManager,
  KeyboardShortcutsHelp,
  DEFAULT_SHORTCUT_CONTEXTS
}