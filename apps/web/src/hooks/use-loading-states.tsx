import { useState, useCallback, useRef, useEffect } from 'react'
import { useLoading } from '@/contexts/loading-context'

// Hook for managing component loading states
export const useComponentLoading = (componentId: string) => {
  const { setComponentLoading, clearComponentLoading, isLoading } = useLoading()
  const [loading, setLoading] = useState(false)

  const startLoading = useCallback(() => {
    setLoading(true)
    setComponentLoading(componentId, true)
  }, [componentId, setComponentLoading])

  const stopLoading = useCallback(() => {
    setLoading(false)
    setComponentLoading(componentId, false)
    // Clear after a delay to prevent flickering
    setTimeout(() => clearComponentLoading(componentId), 100)
  }, [componentId, setComponentLoading, clearComponentLoading])

  const withLoading = useCallback(async <T>(promise: Promise<T>): Promise<T> => {
    startLoading()
    try {
      const result = await promise
      return result
    } finally {
      stopLoading()
    }
  }, [startLoading, stopLoading])

  return {
    loading,
    isLoading: isLoading(componentId),
    startLoading,
    stopLoading,
    withLoading
  }
}

// Hook for managing action loading states
export const useActionLoading = (actionId: string) => {
  const { setActionLoading, clearActionLoading, isLoading } = useLoading()
  const [loading, setLoading] = useState(false)

  const startLoading = useCallback(() => {
    setLoading(true)
    setActionLoading(actionId, true)
  }, [actionId, setActionLoading])

  const stopLoading = useCallback(() => {
    setLoading(false)
    setActionLoading(actionId, false)
    setTimeout(() => clearActionLoading(actionId), 100)
  }, [actionId, setActionLoading, clearActionLoading])

  const withLoading = useCallback(async <T>(promise: Promise<T>): Promise<T> => {
    startLoading()
    try {
      return await promise
    } finally {
      stopLoading()
    }
  }, [startLoading, stopLoading])

  return {
    loading,
    isLoading: isLoading(undefined, actionId),
    startLoading,
    stopLoading,
    withLoading
  }
}

// Hook for progressive loading with progress tracking
export const useProgressiveLoading = (id: string) => {
  const { updateProgressiveLoading, getProgressiveProgress } = useLoading()
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const updateProgress = useCallback((newProgress: number) => {
    const clampedProgress = Math.max(0, Math.min(100, newProgress))
    setProgress(clampedProgress)
    updateProgressiveLoading(id, clampedProgress)
  }, [id, updateProgressiveLoading])

  const startLoading = useCallback(() => {
    setIsLoading(true)
    updateProgress(0)
  }, [updateProgress])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
    updateProgress(100)
    // Clear progress after a delay
    setTimeout(() => {
      updateProgress(0)
    }, 2000)
  }, [updateProgress])

  const withProgressiveLoading = useCallback(async <T>(
    promise: Promise<T>,
    progressCallback?: (progress: number) => void
  ): Promise<T> => {
    startLoading()
    try {
      // Simulate progressive loading for demonstration
      // In real usage, you'd update progress based on actual loading events
      let currentProgress = 0
      const progressInterval = setInterval(() => {
        currentProgress += Math.random() * 20
        if (currentProgress >= 90) {
          currentProgress = 90
          clearInterval(progressInterval)
        }
        updateProgress(currentProgress)
        progressCallback?.(currentProgress)
      }, 100)

      const result = await promise
      clearInterval(progressInterval)
      return result
    } finally {
      stopLoading()
    }
  }, [startLoading, stopLoading, updateProgress])

  return {
    progress,
    isLoading,
    storedProgress: getProgressiveProgress(id),
    updateProgress,
    startLoading,
    stopLoading,
    withProgressiveLoading
  }
}

// Hook for handling async operations with loading states
export const useAsyncOperation = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<any>(null)

  const execute = useCallback(async <T>(
    asyncFunction: () => Promise<T>,
    options?: {
      onStart?: () => void
      onSuccess?: (data: T) => void
      onError?: (error: Error) => void
      onFinally?: () => void
      resetData?: boolean
    }
  ): Promise<T | null> => {
    const { onStart, onSuccess, onError, onFinally, resetData = true } = options || {}
    
    setIsLoading(true)
    setError(null)
    if (resetData) setData(null)
    
    try {
      onStart?.()
      const result = await asyncFunction()
      setData(result)
      onSuccess?.(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      onError?.(error)
      return null
    } finally {
      setIsLoading(false)
      onFinally?.()
    }
  }, [])

  const reset = useCallback(() => {
    setIsLoading(false)
    setError(null)
    setData(null)
  }, [])

  return {
    isLoading,
    error,
    data,
    execute,
    reset
  }
}

// Hook for debounced loading states (useful for search, filtering, etc.)
export const useDebouncedLoading = (delay: number = 300) => {
  const [isLoading, setIsLoading] = useState(false)
  const [debouncedLoading, setDebouncedLoading] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading)
    
    if (loading) {
      setDebouncedLoading(true)
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        setDebouncedLoading(false)
      }, delay)
    }
  }, [delay])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    isLoading,
    debouncedLoading,
    setLoading
  }
}

// Hook for managing multiple loading states
export const useMultipleLoading = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading
    }))
  }, [])

  const isLoading = useCallback((key?: string) => {
    if (key) {
      return loadingStates[key] || false
    }
    return Object.values(loadingStates).some(Boolean)
  }, [loadingStates])

  const clearLoading = useCallback((key: string) => {
    setLoadingStates(prev => {
      const { [key]: removed, ...rest } = prev
      return rest
    })
  }, [])

  const clearAll = useCallback(() => {
    setLoadingStates({})
  }, [])

  return {
    loadingStates,
    isLoading,
    setLoading,
    clearLoading,
    clearAll
  }
}

// Hook for loading state with timeout protection
export const useTimeoutLoading = (timeout: number = 10000) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const startLoading = useCallback(() => {
    setIsLoading(true)
    setError(null)
    
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false)
      setError(new Error(`Operation timed out after ${timeout}ms`))
    }, timeout)
  }, [timeout])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  const withTimeout = useCallback(async <T>(promise: Promise<T>): Promise<T> => {
    startLoading()
    try {
      const result = await promise
      stopLoading()
      return result
    } catch (error) {
      stopLoading()
      throw error
    }
  }, [startLoading, stopLoading])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    withTimeout
  }
}

// Hook for conditional loading based on dependencies
export const useConditionalLoading = (dependencies: any[], loader: () => Promise<any>) => {
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await loader()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Loading failed'))
    } finally {
      setIsLoading(false)
    }
  }, [loader])

  useEffect(() => {
    load()
  }, dependencies)

  return {
    isLoading,
    data,
    error,
    reload: load
  }
}