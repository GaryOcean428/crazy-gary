/**
 * Enhanced Focus Management System
 * Provides comprehensive focus trapping, restoration, and management
 */

import { useEffect, useRef, useState, useCallback, ReactNode } from 'react'

// Types for focus management
export interface FocusTrapOptions {
  focusOnMount?: boolean
  focusOnUnmount?: boolean
  escapeDeactivates?: boolean
  returnFocusOnDeactivate?: boolean
  initialFocus?: string | HTMLElement | (() => HTMLElement)
  finalFocus?: string | HTMLElement | (() => HTMLElement)
  allowOutsideClick?: boolean | ((clickEvent: MouseEvent) => boolean)
  allowEscapeKey?: boolean
}

export interface FocusRestoreOptions {
  focusTarget?: HTMLElement | string | null
  preventScroll?: boolean
}

// Enhanced focus trap component
export const EnhancedFocusTrap: React.FC<{
  active?: boolean
  children: ReactNode
  options?: FocusTrapOptions
  onDeactivate?: () => void
}> = ({ 
  active = true, 
  children, 
  options = {},
  onDeactivate 
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedElement = useRef<HTMLElement | null>(null)
  const {
    focusOnMount = true,
    focusOnUnmount = true,
    escapeDeactivates = true,
    returnFocusOnDeactivate = true,
    initialFocus,
    finalFocus,
    allowOutsideClick = false,
    allowEscapeKey = true
  } = options

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return []
    
    const selector = [
      'a[href]',
      'area[href]',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ')
    
    return Array.from(containerRef.current.querySelectorAll(selector))
      .filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'))
  }, [])

  const getInitialFocus = useCallback((): HTMLElement | null => {
    if (initialFocus) {
      if (typeof initialFocus === 'string') {
        return containerRef.current?.querySelector(initialFocus) as HTMLElement || null
      }
      if (typeof initialFocus === 'function') {
        return initialFocus()
      }
      return initialFocus
    }

    const focusableElements = getFocusableElements()
    const firstFocusable = focusableElements[0] as HTMLElement
    const preferred = containerRef.current?.querySelector('[data-focus-preference]') as HTMLElement
    
    return preferred || firstFocusable
  }, [initialFocus, getFocusableElements])

  const getFinalFocus = useCallback((): HTMLElement | null => {
    if (finalFocus) {
      if (typeof finalFocus === 'string') {
        return document.querySelector(finalFocus) as HTMLElement || null
      }
      if (typeof finalFocus === 'function') {
        return finalFocus()
      }
      return finalFocus
    }
    return previouslyFocusedElement.current
  }, [finalFocus])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!active || !containerRef.current) return

    // Handle escape key
    if (allowEscapeKey && e.key === 'Escape' && escapeDeactivates) {
      e.preventDefault()
      onDeactivate?.()
      return
    }

    // Handle Tab key for focus trapping
    if (e.key === 'Tab') {
      const focusableElements = getFocusableElements()
      
      if (focusableElements.length === 0) {
        e.preventDefault()
        return
      }

      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }
  }, [active, allowEscapeKey, escapeDeactivates, onDeactivate, getFocusableElements])

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (!active || !containerRef.current) return

    if (typeof allowOutsideClick === 'function') {
      if (allowOutsideClick(e)) {
        onDeactivate?.()
      }
    } else if (allowOutsideClick && !containerRef.current.contains(e.target as Node)) {
      onDeactivate?.()
    }
  }, [active, allowOutsideClick, onDeactivate])

  useEffect(() => {
    if (!active || !containerRef.current) return

    // Save the previously focused element
    previouslyFocusedElement.current = document.activeElement as HTMLElement

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown, true)
    document.addEventListener('mousedown', handleClickOutside, true)

    // Focus the initial element
    if (focusOnMount) {
      const initialElement = getInitialFocus()
      initialElement?.focus()
    }

    // Prevent body scroll when modal is active
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      // Restore focus
      if (returnFocusOnDeactivate && focusOnUnmount) {
        const finalElement = getFinalFocus()
        finalElement?.focus()
      }

      // Remove event listeners
      document.removeEventListener('keydown', handleKeyDown, true)
      document.removeEventListener('mousedown', handleClickOutside, true)

      // Restore body scroll
      document.body.style.overflow = originalOverflow
    }
  }, [
    active,
    handleKeyDown,
    handleClickOutside,
    getInitialFocus,
    getFinalFocus,
    focusOnMount,
    focusOnUnmount,
    returnFocusOnDeactivate
  ])

  return (
    <div ref={containerRef} data-focus-trap="active">
      {children}
    </div>
  )
}

// Focus restoration hook
export const useFocusRestore = () => {
  const [savedFocus, setSavedFocus] = useState<HTMLElement | null>(null)

  const saveFocus = useCallback((element?: HTMLElement | string | null) => {
    if (typeof element === 'string') {
      const target = document.querySelector(element) as HTMLElement
      setSavedFocus(target)
    } else if (element) {
      setSavedFocus(element)
    } else {
      setSavedFocus(document.activeElement as HTMLElement)
    }
  }, [])

  const restoreFocus = useCallback((options?: FocusRestoreOptions) => {
    const { focusTarget, preventScroll = false } = options || {}
    
    let target: HTMLElement | null = null
    
    if (typeof focusTarget === 'string') {
      target = document.querySelector(focusTarget) as HTMLElement
    } else if (focusTarget) {
      target = focusTarget
    } else {
      target = savedFocus
    }

    if (target && typeof target.focus === 'function') {
      const scrollOptions: ScrollIntoViewOptions = {
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      }
      
      if (!preventScroll) {
        target.scrollIntoView(scrollOptions)
      }
      
      target.focus()
    }
  }, [savedFocus])

  const clearSavedFocus = useCallback(() => {
    setSavedFocus(null)
  }, [])

  return {
    saveFocus,
    restoreFocus,
    clearSavedFocus,
    hasSavedFocus: savedFocus !== null
  }
}

// Focus management context
export interface FocusContextValue {
  activeTrap: string | null
  setActiveTrap: (trapId: string | null) => void
  saveFocus: (element?: HTMLElement | string | null) => void
  restoreFocus: (options?: FocusRestoreOptions) => void
  clearSavedFocus: () => void
  hasSavedFocus: boolean
}

// Focus context provider (simplified version for demonstration)
export const useFocusContext = (): FocusContextValue => {
  // In a real implementation, this would use React context
  // For now, we'll return a mock implementation
  return {
    activeTrap: null,
    setActiveTrap: () => {},
    saveFocus: () => {},
    restoreFocus: () => {},
    clearSavedFocus: () => {},
    hasSavedFocus: false
  }
}

// Enhanced keyboard navigation for complex widgets
export const useEnhancedKeyboardNavigation = <T extends unknown>(
  items: T[],
  options: {
    orientation?: 'horizontal' | 'vertical'
    loop?: boolean
    homeEndKeys?: boolean
    roving?: boolean
    onActivate?: (item: T, index: number) => void
    getItemId?: (item: T, index: number) => string
  } = {}
) => {
  const {
    orientation = 'vertical',
    loop = true,
    homeEndKeys = true,
    roving = true,
    onActivate,
    getItemId
  } = options

  const [activeIndex, setActiveIndex] = useState(0)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const containerRef = useRef<HTMLElement>(null)

  const getItemByIndex = useCallback((index: number): T | null => {
    if (index >= 0 && index < items.length) {
      return items[index]
    }
    return null
  }, [items])

  const getNextIndex = useCallback((currentIndex: number, direction: 'next' | 'previous'): number => {
    const isVertical = orientation === 'vertical'
    const shouldMove = direction === 'next' ? !isVertical && orientation === 'horizontal' : isVertical && orientation === 'vertical'

    if (!shouldMove) return currentIndex

    const next = direction === 'next' ? currentIndex + 1 : currentIndex - 1
    
    if (next >= items.length) {
      return loop ? 0 : items.length - 1
    } else if (next < 0) {
      return loop ? items.length - 1 : 0
    }
    
    return next
  }, [items.length, orientation, loop])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement
    const currentIndex = focusedIndex

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault()
        const nextIndex = getNextIndex(currentIndex, 'next')
        setFocusedIndex(nextIndex)
        if (roving) {
          const nextElement = document.getElementById(getItemId?.(items[nextIndex], nextIndex) || `item-${nextIndex}`)
          nextElement?.focus()
        }
        break

      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault()
        const prevIndex = getNextIndex(currentIndex, 'previous')
        setFocusedIndex(prevIndex)
        if (roving) {
          const prevElement = document.getElementById(getItemId?.(items[prevIndex], prevIndex) || `item-${prevIndex}`)
          prevElement?.focus()
        }
        break

      case 'Home':
        if (homeEndKeys) {
          e.preventDefault()
          setFocusedIndex(0)
          if (roving) {
            const firstElement = document.getElementById(getItemId?.(items[0], 0) || 'item-0')
            firstElement?.focus()
          }
        }
        break

      case 'End':
        if (homeEndKeys) {
          e.preventDefault()
          const lastIndex = items.length - 1
          setFocusedIndex(lastIndex)
          if (roving) {
            const lastElement = document.getElementById(getItemId?.(items[lastIndex], lastIndex) || `item-${lastIndex}`)
            lastElement?.focus()
          }
        }
        break

      case 'Enter':
      case ' ':
        e.preventDefault()
        const currentItem = getItemByIndex(focusedIndex)
        if (currentItem && onActivate) {
          onActivate(currentItem, focusedIndex)
        }
        break

      case 'Escape':
        e.preventDefault()
        containerRef.current?.blur()
        break
    }
  }, [
    focusedIndex,
    items,
    orientation,
    loop,
    homeEndKeys,
    roving,
    onActivate,
    getItemId,
    getItemByIndex,
    getNextIndex
  ])

  const handleFocus = useCallback((e: React.FocusEvent) => {
    const target = e.target as HTMLElement
    const index = parseInt(target.getAttribute('data-index') || '-1', 10)
    setFocusedIndex(index)
  }, [])

  return {
    activeIndex,
    focusedIndex,
    setActiveIndex,
    setFocusedIndex,
    containerRef,
    handleKeyDown,
    handleFocus,
    getItemByIndex,
    getNextIndex
  }
}

// Utility function to manage tab order
export const manageTabOrder = (container: HTMLElement) => {
  const focusableElements = container.querySelectorAll(
    'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
  )
  
  focusableElements.forEach((element, index) => {
    element.setAttribute('tabindex', index.toString())
  })
}

// Component for managing focus in lists
export const AccessibleList: React.FC<{
  items: ReactNode[]
  getItemProps?: (index: number) => React.HTMLAttributes<HTMLLIElement>
  className?: string
}> = ({ items, getItemProps, className }) => {
  const { handleKeyDown, handleFocus, focusedIndex, containerRef } = useEnhancedKeyboardNavigation(
    items,
    {
      orientation: 'vertical',
      loop: true,
      roving: true
    }
  )

  return (
    <ul 
      ref={containerRef}
      role="listbox"
      className={className}
      onKeyDown={handleKeyDown}
    >
      {items.map((item, index) => (
        <li
          key={index}
          role="option"
          aria-selected={index === focusedIndex}
          tabIndex={index === focusedIndex ? 0 : -1}
          data-index={index}
          onFocus={handleFocus}
          {...getItemProps?.(index)}
        >
          {item}
        </li>
      ))}
    </ul>
  )
}

export default {
  EnhancedFocusTrap,
  useFocusRestore,
  useEnhancedKeyboardNavigation,
  manageTabOrder,
  AccessibleList
}