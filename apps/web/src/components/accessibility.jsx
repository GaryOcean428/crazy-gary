/**
 * Accessibility utilities and components following WCAG 2.1 guidelines
 * Provides reusable patterns for better screen reader support
 */

import React, { useEffect, useRef, useState } from 'react'

// Skip to main content link
export const SkipToMain = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
  >
    Skip to main content
  </a>
)

// Screen reader only text
export const ScreenReaderOnly = ({ children, as: Component = 'span' }) => (
  <Component className="sr-only">
    {children}
  </Component>
)

// Visually hidden but accessible to screen readers
export const VisuallyHidden = ({ children, ...props }) => (
  <span
    className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
    style={{
      clip: 'rect(0, 0, 0, 0)',
      clipPath: 'inset(50%)',
    }}
    {...props}
  >
    {children}
  </span>
)

// Focus trap for modals and dialogs
export const FocusTrap = ({ children, active = true }) => {
  const containerRef = useRef(null)
  const firstFocusableRef = useRef(null)
  const lastFocusableRef = useRef(null)

  useEffect(() => {
    if (!active || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (focusableElements.length === 0) return

    firstFocusableRef.current = focusableElements[0]
    lastFocusableRef.current = focusableElements[focusableElements.length - 1]

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstFocusableRef.current) {
          e.preventDefault()
          lastFocusableRef.current?.focus()
        }
      } else {
        if (document.activeElement === lastFocusableRef.current) {
          e.preventDefault()
          firstFocusableRef.current?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    firstFocusableRef.current?.focus()

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }, [active])

  return (
    <div ref={containerRef}>
      {children}
    </div>
  )
}

// Live region for announcing dynamic content changes
export const LiveRegion = ({ 
  children, 
  politeness = 'polite',
  atomic = false,
  relevant = 'additions text'
}) => (
  <div
    aria-live={politeness}
    aria-atomic={atomic}
    aria-relevant={relevant}
    className="sr-only"
  >
    {children}
  </div>
)

// Hook for managing announcements to screen readers
export const useAnnouncements = () => {
  const [announcement, setAnnouncement] = useState('')

  const announce = React.useCallback((message, politeness = 'polite') => {
    setAnnouncement('')
    setTimeout(() => {
      setAnnouncement(message)
    }, 100)
  }, [])

  return {
    announcement,
    announce,
    LiveRegion: () => announcement ? (
      <LiveRegion politeness="polite">
        {announcement}
      </LiveRegion>
    ) : null
  }
}

// Hook for managing focus
export const useFocusManagement = () => {
  const [focusedElement, setFocusedElement] = useState(null)

  const saveFocus = React.useCallback(() => {
    setFocusedElement(document.activeElement)
  }, [])

  const restoreFocus = React.useCallback(() => {
    if (focusedElement && typeof focusedElement.focus === 'function') {
      focusedElement.focus()
    }
  }, [focusedElement])

  const focusFirst = React.useCallback((container) => {
    const focusableElement = container?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    focusableElement?.focus()
  }, [])

  return {
    saveFocus,
    restoreFocus,
    focusFirst
  }
}

// Accessible button component with proper ARIA attributes
export const AccessibleButton = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  ariaLabel,
  ariaDescribedBy,
  onClick,
  type = 'button',
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
  
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
  }
  
  const sizeClasses = {
    small: 'h-9 px-3 text-sm',
    medium: 'h-10 px-4 py-2',
    large: 'h-11 px-8 text-lg',
    icon: 'h-10 w-10'
  }

  return (
    <button
      ref={ref}
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
})

AccessibleButton.displayName = 'AccessibleButton'

// Accessible form field with proper labeling
export const AccessibleField = ({
  label,
  required = false,
  error,
  help,
  children,
  id,
  className = ''
}) => {
  const fieldId = id || React.useId()
  const errorId = error ? `${fieldId}-error` : undefined
  const helpId = help ? `${fieldId}-help` : undefined

  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={fieldId}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      
      {React.cloneElement(children, {
        id: fieldId,
        'aria-invalid': !!error,
        'aria-describedby': [errorId, helpId].filter(Boolean).join(' ') || undefined,
        'aria-required': required
      })}
      
      {help && (
        <p id={helpId} className="text-sm text-muted-foreground">
          {help}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// Hook for keyboard navigation
export const useKeyboardNavigation = (items, options = {}) => {
  const { orientation = 'vertical', loop = true } = options
  const [activeIndex, setActiveIndex] = useState(0)
  
  const handleKeyDown = React.useCallback((e) => {
    const isVertical = orientation === 'vertical'
    const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight'
    const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft'
    
    switch (e.key) {
      case nextKey:
        e.preventDefault()
        setActiveIndex(current => {
          const next = current + 1
          return next >= items.length ? (loop ? 0 : current) : next
        })
        break
        
      case prevKey:
        e.preventDefault()
        setActiveIndex(current => {
          const prev = current - 1
          return prev < 0 ? (loop ? items.length - 1 : current) : prev
        })
        break
        
      case 'Home':
        e.preventDefault()
        setActiveIndex(0)
        break
        
      case 'End':
        e.preventDefault()
        setActiveIndex(items.length - 1)
        break
    }
  }, [items.length, orientation, loop])
  
  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown
  }
}

export default {
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
}