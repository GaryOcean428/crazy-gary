/**
 * Dashboard-specific custom hooks
 * Business logic separation for dashboard functionality
 */

import { useState, useEffect, useCallback } from 'react'
import type { MetricData, DashboardConfig, FilterConfig } from '../types'

/**
 * Hook for managing real-time metrics data
 */
export function useRealtimeMetrics(enabled: boolean, refreshInterval: number) {
  const [metrics, setMetrics] = useState<MetricData[]>([])
  
  const generateMockMetrics = useCallback((): MetricData[] => [
    {
      label: 'Active Tasks',
      value: Math.floor(Math.random() * 50) + 10,
      change: (Math.random() - 0.5) * 20,
      trend: Math.random() > 0.5 ? 'up' : 'down',
      color: 'text-blue-600'
    },
    {
      label: 'Completion Rate',
      value: Math.floor(Math.random() * 30) + 70,
      change: (Math.random() - 0.5) * 10,
      trend: Math.random() > 0.3 ? 'up' : 'down',
      color: 'text-green-600'
    },
    {
      label: 'Response Time',
      value: Math.floor(Math.random() * 500) + 100,
      change: (Math.random() - 0.5) * 100,
      trend: Math.random() > 0.4 ? 'down' : 'up',
      color: 'text-orange-600'
    },
    {
      label: 'Error Rate',
      value: Math.random() * 5,
      change: (Math.random() - 0.5) * 2,
      trend: Math.random() > 0.6 ? 'down' : 'up',
      color: 'text-red-600'
    }
  ], [])

  useEffect(() => {
    if (!enabled) return

    const interval = setInterval(() => {
      setMetrics(generateMockMetrics())
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [enabled, refreshInterval, generateMockMetrics])

  return metrics
}

/**
 * Hook for managing dashboard templates
 */
export function useDashboardTemplates() {
  const [savedTemplates, setSavedTemplates] = useState<DashboardConfig[]>([])

  const saveTemplate = useCallback((config: DashboardConfig) => {
    const templateName = `Dashboard ${savedTemplates.length + 1}`
    const newTemplate: DashboardConfig = {
      ...config,
      id: `template-${Date.now()}`,
      name: templateName
    }
    
    setSavedTemplates(prev => [...prev, newTemplate])
    return newTemplate
  }, [savedTemplates])

  const loadTemplate = useCallback((template: DashboardConfig) => {
    return template
  }, [])

  return {
    savedTemplates,
    saveTemplate,
    loadTemplate
  }
}

/**
 * Hook for managing dashboard filters
 */
export function useDashboardFilters() {
  const [isLoading, setIsLoading] = useState(false)

  const applyFilters = useCallback(async (filters: FilterConfig[]) => {
    setIsLoading(true)
    
    // Simulate async filtering
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const activeFilters = filters.filter(f => f.enabled)
    setIsLoading(false)
    
    return activeFilters
  }, [])

  return {
    isLoading,
    applyFilters
  }
}