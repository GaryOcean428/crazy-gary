/**
 * ARIA Live Regions System
 * Provides comprehensive live region management for dynamic content announcements
 */

import React, { useState, useEffect, useRef, useCallback, ReactNode } from 'react'

// Types for live regions
export interface LiveRegionConfig {
  politeness: 'off' | 'polite' | 'assertive'
  atomic?: boolean
  relevant?: 'additions' | 'removals' | 'text' | 'all'
  live?: 'off' | 'polite' | 'assertive'
}

// Types for announcements
export interface Announcement {
  id: string
  message: string
  politeness: 'polite' | 'assertive'
  timestamp: number
  category?: string
  priority?: 'low' | 'medium' | 'high'
}

// Live region manager hook
export const useLiveRegionManager = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null)
  const announcementQueue = useRef<Announcement[]>([])
  const isProcessing = useRef(false)

  const createAnnouncement = useCallback((
    message: string, 
    options: {
      politeness?: 'polite' | 'assertive'
      category?: string
      priority?: 'low' | 'medium' | 'high'
    } = {}
  ): string => {
    const id = `announcement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const announcement: Announcement = {
      id,
      message,
      politeness: options.politeness || 'polite',
      timestamp: Date.now(),
      category: options.category,
      priority: options.priority || 'medium'
    }

    // Add to queue
    announcementQueue.current.push(announcement)
    setAnnouncements(prev => [...prev, announcement])

    return id
  }, [])

  const processQueue = useCallback(() => {
    if (isProcessing.current || announcementQueue.current.length === 0) {
      return
    }

    isProcessing.current = true

    // Sort by priority and timestamp
    const sortedAnnouncements = announcementQueue.current.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const priorityDiff = (priorityOrder[b.priority || 'medium'] || 2) - (priorityOrder[a.priority || 'medium'] || 2)
      
      if (priorityDiff !== 0) return priorityDiff
      return a.timestamp - b.timestamp
    })

    const nextAnnouncement = sortedAnnouncements.shift()
    if (nextAnnouncement) {
      setCurrentAnnouncement(nextAnnouncement)
      
      // Remove from queue
      announcementQueue.current = sortedAnnouncements
      setAnnouncements(prev => prev.filter(a => a.id !== nextAnnouncement.id))

      // Process next announcement after a delay
      setTimeout(() => {
        setCurrentAnnouncement(null)
        isProcessing.current = false
        
        // Small delay before processing next announcement
        setTimeout(() => {
          processQueue()
        }, 100)
      }, 3000) // Show for 3 seconds
    } else {
      isProcessing.current = false
    }
  }, [])

  const announce = useCallback((
    message: string,
    options?: {
      politeness?: 'polite' | 'assertive'
      category?: string
      priority?: 'low' | 'medium' | 'high'
    }
  ) => {
    createAnnouncement(message, options)
    processQueue()
  }, [createAnnouncement, processQueue])

  const removeAnnouncement = useCallback((id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id))
    announcementQueue.current = announcementQueue.current.filter(a => a.id !== id)
  }, [])

  const clearAllAnnouncements = useCallback(() => {
    setAnnouncements([])
    announcementQueue.current = []
    setCurrentAnnouncement(null)
  }, [])

  // Auto-process queue when new announcements are added
  useEffect(() => {
    if (!isProcessing.current) {
      processQueue()
    }
  }, [announcements, processQueue])

  return {
    announcements,
    currentAnnouncement,
    announce,
    removeAnnouncement,
    clearAllAnnouncements,
    queueLength: announcementQueue.current.length
  }
}

// Live region component
export const LiveRegion: React.FC<{
  children?: ReactNode
  config: LiveRegionConfig
  className?: string
}> = ({ children, config, className = '' }) => {
  const { politeness, atomic = false, relevant = 'additions text', live = 'polite' } = config

  return (
    <div
      aria-live={live}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={`sr-only ${className}`}
    >
      {children}
    </div>
  )
}

// Predefined live region configurations
export const LIVE_REGION_CONFIGS = {
  polite: {
    politeness: 'polite' as const,
    atomic: false,
    relevant: 'additions text',
    live: 'polite'
  },
  assertive: {
    politeness: 'assertive' as const,
    atomic: true,
    relevant: 'all',
    live: 'assertive'
  },
  off: {
    politeness: 'off' as const,
    atomic: false,
    relevant: 'additions text',
    live: 'off'
  }
}

// Multiple live regions container
export const LiveRegionsContainer: React.FC<{
  politeAnnouncement?: string
  assertiveAnnouncement?: string
  politenessConfig?: LiveRegionConfig
  assertivenessConfig?: LiveRegionConfig
}> = ({
  politeAnnouncement,
  assertivenessAnnouncement,
  politenessConfig = LIVE_REGION_CONFIGS.polite,
  assertivenessConfig = LIVE_REGION_CONFIGS.assertive
}) => {
  return (
    <>
      <LiveRegion config={politenessConfig}>
        {politeAnnouncement}
      </LiveRegion>
      <LiveRegion config={assertivenessConfig}>
        {assertivenessAnnouncement}
      </LiveRegion>
    </>
  )
}

// Status announcer component
export const StatusAnnouncer: React.FC = () => {
  const { currentAnnouncement } = useLiveRegionManager()

  if (!currentAnnouncement) return null

  return (
    <LiveRegion config={LIVE_REGION_CONFIGS.polite}>
      {currentAnnouncement.message}
    </LiveRegion>
  )
}

// Alert announcer for important messages
export const AlertAnnouncer: React.FC = () => {
  const { currentAnnouncement } = useLiveRegionManager()

  // Only announce if it's a high priority or alert category
  if (!currentAnnouncement || 
      (currentAnnouncement.priority !== 'high' && currentAnnouncement.category !== 'alert')) {
    return null
  }

  return (
    <LiveRegion config={LIVE_REGION_CONFIGS.assertive}>
      {currentAnnouncement.message}
    </LiveRegion>
  )
}

// Dynamic content announcer
export const DynamicContentAnnouncer: React.FC<{
  content: any
  previousContent?: any
  announceOnChange?: boolean
  announceOnAdd?: boolean
  announceOnRemove?: boolean
  politeness?: 'polite' | 'assertive'
  ariaLabel?: string
}> = ({
  content,
  previousContent,
  announceOnChange = true,
  announceOnAdd = true,
  announceOnRemove = false,
  politeness = 'polite',
  ariaLabel = 'Content updates'
}) => {
  const [announcement, setAnnouncement] = useState('')
  const { announce } = useLiveRegionManager()

  useEffect(() => {
    if (!announceOnChange || !content || !previousContent) return

    const contentArray = Array.isArray(content) ? content : [content]
    const previousArray = Array.isArray(previousContent) ? previousContent : [previousContent]

    const addedItems = contentArray.filter(
      item => !previousArray.some(prev => JSON.stringify(prev) === JSON.stringify(item))
    )

    const removedItems = previousArray.filter(
      prevItem => !contentArray.some(item => JSON.stringify(item) === JSON.stringify(prevItem))
    )

    if (addedItems.length > 0 && announceOnAdd) {
      announce(
        `${addedItems.length} new item${addedItems.length > 1 ? 's' : ''} added to ${ariaLabel}`,
        { politeness }
      )
    } else if (removedItems.length > 0 && announceOnRemove) {
      announce(
        `${removedItems.length} item${removedItems.length > 1 ? 's' : 's'} removed from ${ariaLabel}`,
        { politeness }
      )
    }
  }, [content, previousContent, announceOnChange, announceOnAdd, announceOnRemove, politeness, ariaLabel, announce])

  return (
    <LiveRegion config={LIVE_REGION_CONFIGS.polite}>
      {announcement}
    </LiveRegion>
  )
}

// Progress announcer
export const ProgressAnnouncer: React.FC<{
  progress: number
  label: string
  isComplete?: boolean
  showPercentage?: boolean
}> = ({ progress, label, isComplete = false, showPercentage = false }) => {
  const { announce } = useLiveRegionManager()
  const [lastAnnounced, setLastAnnounced] = useState(0)

  useEffect(() => {
    // Announce at key progress points
    const keyPoints = [0, 25, 50, 75, 100]
    const shouldAnnounce = keyPoints.some(point => 
      progress >= point && lastAnnounced < point
    )

    if (shouldAnnounce) {
      let message = `${label}: ${progress}% complete`
      
      if (isComplete) {
        message = `${label} completed`
      }
      
      announce(message, { politeness: 'polite' })
      setLastAnnounced(progress)
    }
  }, [progress, label, isComplete, announce, lastAnnounced])

  return null
}

// Form validation announcer
export const FormValidationAnnouncer: React.FC<{
  errors: string[]
  isValidating?: boolean
  isSubmitted?: boolean
}> = ({ errors, isValidating = false, isSubmitted = false }) => {
  const { announce } = useLiveRegionManager()

  useEffect(() => {
    if (isValidating) {
      announce('Validating form', { politeness: 'polite' })
    } else if (isSubmitted) {
      if (errors.length === 0) {
        announce('Form submitted successfully', { politeness: 'polite' })
      } else {
        announce(`${errors.length} error${errors.length > 1 ? 's' : ''} found in form`, { 
          politeness: 'assertive',
          priority: 'high'
        })
      }
    }
  }, [errors, isValidating, isSubmitted, announce])

  return (
    <LiveRegion config={errors.length > 0 ? LIVE_REGION_CONFIGS.assertive : LIVE_REGION_CONFIGS.polite}>
      {errors.map((error, index) => (
        <div key={index} role="alert">
          {error}
        </div>
      ))}
    </LiveRegion>
  )
}

// Menu/widget announcer
export const MenuAnnouncer: React.FC<{
  isOpen: boolean
  menuLabel: string
  selectedItem?: string
  itemCount?: number
}> = ({ isOpen, menuLabel, selectedItem, itemCount }) => {
  const { announce } = useLiveRegionManager()

  useEffect(() => {
    if (isOpen) {
      let message = `${menuLabel} menu opened`
      if (itemCount !== undefined) {
        message += `, ${itemCount} items available`
      }
      if (selectedItem) {
        message += `, ${selectedItem} selected`
      }
      announce(message, { politeness: 'polite' })
    } else {
      announce(`${menuLabel} menu closed`, { politeness: 'polite' })
    }
  }, [isOpen, menuLabel, selectedItem, itemCount, announce])

  return null
}

// Modal/dialog announcer
export const ModalAnnouncer: React.FC<{
  isOpen: boolean
  title: string
  description?: string
  type?: 'dialog' | 'alertdialog'
}> = ({ isOpen, title, description, type = 'dialog' }) => {
  const { announce } = useLiveRegionManager()

  useEffect(() => {
    if (isOpen) {
      let message = `${title} dialog opened`
      if (description) {
        message += `. ${description}`
      }
      announce(message, { politeness: 'assertive', priority: 'high' })
    } else {
      announce(`${title} dialog closed`, { politeness: 'polite' })
    }
  }, [isOpen, title, description, announce])

  return null
}

// Generic announcement hook
export const useAnnouncements = () => {
  const { announce, announcements, currentAnnouncement } = useLiveRegionManager()

  const announceSuccess = useCallback((message: string) => {
    announce(message, { politeness: 'polite', category: 'success' })
  }, [announce])

  const announceError = useCallback((message: string) => {
    announce(message, { politeness: 'assertive', priority: 'high', category: 'error' })
  }, [announce])

  const announceWarning = useCallback((message: string) => {
    announce(message, { politeness: 'assertive', priority: 'high', category: 'warning' })
  }, [announce])

  const announceInfo = useCallback((message: string) => {
    announce(message, { politeness: 'polite', category: 'info' })
  }, [announce])

  const announceAction = useCallback((message: string) => {
    announce(message, { politeness: 'polite', category: 'action' })
  }, [announce])

  return {
    announce,
    announceSuccess,
    announceError,
    announceWarning,
    announceInfo,
    announceAction,
    announcements,
    currentAnnouncement
  }
}

export default {
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
  useAnnouncements
}