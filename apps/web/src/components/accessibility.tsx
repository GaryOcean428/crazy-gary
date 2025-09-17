/**
 * Accessibility utilities and components following WCAG 2.1 guidelines
 * Provides reusable patterns for better screen reader support
 */

import React, { useEffect, useRef, useState, forwardRef } from 'react'

// Add JSX namespace reference
/// <reference types="react/jsx-runtime" />

// Type definitions for accessibility components
interface ScreenReaderOnlyProps {
  children: React.ReactNode
  as?: React.ElementType
}

interface VisuallyHiddenProps {
  children: React.ReactNode
  [key: string]: any
}

interface LiveRegionProps {
  children: React.ReactNode
  _politeness?: 'polite' | 'assertive' | 'off'
  atomic?: boolean
  relevant?: string
}

interface AnnouncementProps {
  message: string
  politeness?: 'polite' | 'assertive'
}

interface FocusManagementProps {
  children: React.ReactNode
}

interface AccessibleButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'small' | 'medium' | 'large' | 'icon'
  loading?: boolean
  disabled?: boolean
  ariaLabel?: string
  ariaDescribedBy?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

interface FormFieldProps {
  label: string
  children: React.ReactNode
  error?: string
  help?: string
  required?: boolean
  id: string
  className?: string
}

interface KeyboardNavigationOptions {
  orientation?: 'horizontal' | 'vertical'
  loop?: boolean
}

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
export const ScreenReaderOnly: React.FC<ScreenReaderOnlyProps> = ({ children, as = 'span' }) => {
  const Component = as
  return React.createElement(Component, { className: "sr-only" }, children)
}

// Visually hidden but accessible to screen readers
export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({ children, ...props }) => (
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
export const FocusTrap: React.FC<FocusManagementProps & { active?: boolean }> = ({ children, active = true }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLElement>(null)
  const lastFocusableRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!active || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (focusableElements.length === 0) return

    firstFocusableRef.current = focusableElements[0] as HTMLElement
    lastFocusableRef.current = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleKeyDown = (e: KeyboardEvent) => {
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
export const LiveRegion: React.FC<LiveRegionProps> = ({ 
  children, 
  _politeness = 'polite',
  atomic = false,
  relevant = 'additions text'
}) => {
  const ariaLiveValue: "off" | "polite" | "assertive" = _politeness as "off" | "polite" | "assertive"
  
  return (
    <div
      aria-live={ariaLiveValue}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className="sr-only"
    >
      {children}
    </div>
  )
}

// Hook for managing announcements to screen readers
export const useAnnouncements = () => {
  const [announcement, setAnnouncement] = useState('')

  const announce = React.useCallback((message: string, _politeness: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement('')
    setTimeout(() => {
      setAnnouncement(message)
    }, 100)
  }, [])

  return {
    announcement,
    announce,
    LiveRegion: () => announcement ? (
      <LiveRegion _politeness="polite">
        {announcement}
      </LiveRegion>
    ) : null
  }
}

// Hook for managing focus
export const useFocusManagement = () => {
  const [focusedElement, setFocusedElement] = useState<Element | null>(null)

  const saveFocus = React.useCallback(() => {
    setFocusedElement(document.activeElement)
  }, [])

  const restoreFocus = React.useCallback(() => {
    if (focusedElement && 'focus' in focusedElement && typeof focusedElement.focus === 'function') {
      (focusedElement as HTMLElement).focus()
    }
  }, [focusedElement])

  const focusFirst = React.useCallback((container: HTMLElement | null) => {
    const focusableElement = container?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusableElement && 'focus' in focusableElement) {
      (focusableElement as HTMLElement).focus()
    }
  }, [])

  return {
    saveFocus,
    restoreFocus,
    focusFirst
  }
}

// Accessible button component with proper ARIA attributes
export const AccessibleButton = React.forwardRef<HTMLButtonElement, AccessibleButtonProps>(({
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
  
  const variantClasses: Record<string, string> = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
  }
  
  const sizeClasses: Record<string, string> = {
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
export const AccessibleField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  help,
  children,
  id,
  className = ''
}) => {
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`
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
      
      {React.cloneElement(children as React.ReactElement, {
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
export const useKeyboardNavigation = (items: any[], options: KeyboardNavigationOptions = {}) => {
  const { orientation = 'vertical', loop = true } = options
  const [activeIndex, setActiveIndex] = useState(0)
  
  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
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