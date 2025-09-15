/**
 * Shared utility functions for common component patterns
 * Reducing redundancy by centralizing common logic
 */

import { STATUS_VARIANTS, STATUS_ICONS, MODEL_STATUS_CONFIG, MCP_STATUS_CONFIG } from './icons'

/**
 * Format system stats for consistent display
 */
export const formatSystemStats = (stats) => ({
  tasksCompleted: stats.tasksCompleted || 0,
  tasksRunning: stats.tasksRunning || 0,
  modelsActive: stats.modelsActive || 0,
  toolsAvailable: stats.toolsAvailable || 0
})

/**
 * Get status configuration for consistent status display
 */
export const getStatusConfig = (status, type = 'default') => {
  const configs = {
    model: MODEL_STATUS_CONFIG,
    mcp: MCP_STATUS_CONFIG,
    default: {
      success: { icon: STATUS_ICONS.success, variant: STATUS_VARIANTS.success },
      running: { icon: STATUS_ICONS.running, variant: STATUS_VARIANTS.running },
      idle: { icon: STATUS_ICONS.idle, variant: STATUS_VARIANTS.idle },
      error: { icon: STATUS_ICONS.error, variant: STATUS_VARIANTS.error },
      loading: { icon: STATUS_ICONS.loading, variant: STATUS_VARIANTS.running }
    }
  }
  
  return configs[type]?.[status] || configs.default[status] || configs.default.idle
}

/**
 * Format percentage for progress displays
 */
export const formatPercentage = (value, decimals = 0) => {
  if (typeof value !== 'number') return '0%'
  return `${value.toFixed(decimals)}%`
}

/**
 * Format large numbers for display (e.g., 1.2K, 3.4M)
 */
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

/**
 * Generate consistent card props for status cards
 */
export const createStatusCard = (title, value, status, description = '') => ({
  title,
  value,
  status,
  description,
  config: getStatusConfig(status)
})

/**
 * Common loading states for consistent UX
 */
export const createLoadingState = (message = 'Loading...') => ({
  loading: true,
  message,
  icon: STATUS_ICONS.loading
})

/**
 * Common error states for consistent error handling
 */
export const createErrorState = (message = 'An error occurred', details = '') => ({
  error: true,
  message,
  details,
  icon: STATUS_ICONS.error
})

/**
 * Debounce utility for input handlers
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Common validation patterns
 */
export const validators = {
  email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  password: (password) => password.length >= 8,
  required: (value) => value && value.trim().length > 0
}

/**
 * Format timestamp for display
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Never'
  const date = new Date(timestamp)
  return date.toLocaleString()
}

/**
 * Calculate relative time (e.g., "2 minutes ago")
 */
export const getRelativeTime = (timestamp) => {
  if (!timestamp) return 'Never'
  
  const now = new Date()
  const past = new Date(timestamp)
  const diffMs = now - past
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}

/**
 * Common color schemes for consistent theming
 */
export const colorSchemes = {
  status: {
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    info: 'text-blue-600',
    neutral: 'text-gray-600'
  },
  background: {
    success: 'bg-green-50',
    warning: 'bg-yellow-50',
    error: 'bg-red-50',
    info: 'bg-blue-50',
    neutral: 'bg-gray-50'
  }
}