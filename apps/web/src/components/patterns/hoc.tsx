import React, { ComponentType, ReactNode } from 'react'
import { cn } from '@/lib/utils'

// Generic HOC Wrapper
interface HOCWrapperProps {
  children: ReactNode
  className?: string
  [key: string]: any
}

// Loading HOC
export function withLoading<P extends object>(
  WrappedComponent: ComponentType<P>,
  LoadingComponent: ComponentType = () => (
    <div className="animate-pulse flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  )
) {
  return function WithLoadingComponent(props: P & { isLoading?: boolean }) {
    const { isLoading, ...restProps } = props
    
    if (isLoading) {
      return <LoadingComponent {...restProps} />
    }
    
    return <WrappedComponent {...(restProps as P)} />
  }
}

// Error Boundary HOC
export function withErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  ErrorComponent?: ComponentType<{ error: Error; retry: () => void }>
) {
  return function WithErrorBoundaryComponent(props: P & { onError?: (error: Error) => void }) {
    const [error, setError] = React.useState<Error | null>(null)

    const handleError = React.useCallback((error: Error) => {
      setError(error)
      props.onError?.(error)
    }, [props])

    const retry = React.useCallback(() => {
      setError(null)
    }, [])

    React.useEffect(() => {
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        handleError(new Error(event.reason))
      }

      const handleErrorEvent = (event: ErrorEvent) => {
        handleError(new Error(event.error || event.message))
      }

      window.addEventListener('unhandledrejection', handleUnhandledRejection)
      window.addEventListener('error', handleErrorEvent)

      return () => {
        window.removeEventListener('unhandledrejection', handleUnhandledRejection)
        window.removeEventListener('error', handleErrorEvent)
      }
    }, [handleError])

    if (error) {
      if (ErrorComponent) {
        return <ErrorComponent error={error} retry={retry} />
      }
      
      return (
        <div className="error-boundary p-8 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button 
            onClick={retry}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try again
          </button>
        </div>
      )
    }

    return <WrappedComponent {...(props as P)} />
  }
}

// Authentication HOC
export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  LoginComponent: ComponentType = () => <div>Please log in</div>
) {
  return function WithAuthComponent(props: P & { isAuthenticated?: boolean; user?: any }) {
    const { isAuthenticated = false, user, ...restProps } = props
    
    if (!isAuthenticated) {
      return <LoginComponent {...restProps} />
    }
    
    return <WrappedComponent {...(restProps as P)} user={user} />
  }
}

// Theme HOC
export function withTheme<P extends object>(
  WrappedComponent: ComponentType<P>
) {
  return function WithThemeComponent(props: P & { theme?: 'light' | 'dark' }) {
    const { theme = 'light', ...restProps } = props
    
    React.useEffect(() => {
      const root = window.document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(theme)
    }, [theme])

    return <WrappedComponent {...(restProps as P)} theme={theme} />
  }
}

// Data Fetching HOC
export function withDataFetching<P extends object, T = any>(
  WrappedComponent: ComponentType<P & { data: T; loading: boolean; error: Error | null }>,
  fetcher: () => Promise<T>
) {
  return function WithDataFetchingComponent(props: P & { autoFetch?: boolean }) {
    const [data, setData] = React.useState<T | null>(null)
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<Error | null>(null)
    const { autoFetch = true, ...restProps } = props

    const fetchData = React.useCallback(async () => {
      setLoading(true)
      setError(null)
      
      try {
        const result = await fetcher()
        setData(result)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }, [])

    React.useEffect(() => {
      if (autoFetch) {
        fetchData()
      }
    }, [fetchData, autoFetch])

    return (
      <WrappedComponent 
        {...(restProps as P)} 
        data={data} 
        loading={loading} 
        error={error}
        refetch={fetchData}
      />
    )
  }
}

// Form HOC
export function withForm<P extends object, T extends Record<string, any>>(
  WrappedComponent: ComponentType<P & {
    values: T
    errors: Record<string, string>
    touched: Record<string, boolean>
    handleChange: (name: keyof T, value: any) => void
    handleBlur: (name: keyof T) => void
    handleSubmit: (e: React.FormEvent) => void
    isValid: boolean
    isSubmitting: boolean
    setFieldValue: (name: keyof T, value: any) => void
    setFieldError: (name: keyof T, error: string) => void
    reset: () => void
  }>,
  initialValues: T,
  validation?: (values: T) => Record<string, string>,
  onSubmit?: (values: T) => void | Promise<void>
) {
  return function WithFormComponent(props: P) {
    const [values, setValues] = React.useState<T>(initialValues)
    const [errors, setErrors] = React.useState<Record<string, string>>({})
    const [touched, setTouched] = React.useState<Record<string, boolean>>({})
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    const handleChange = React.useCallback((name: keyof T, value: any) => {
      setValues(prev => ({ ...prev, [name]: value }))
      setTouched(prev => ({ ...prev, [name]: true }))
    }, [])

    const handleBlur = React.useCallback((name: keyof T) => {
      setTouched(prev => ({ ...prev, [name]: true }))
    }, [])

    const setFieldValue = React.useCallback((name: keyof T, value: any) => {
      handleChange(name, value)
    }, [handleChange])

    const setFieldError = React.useCallback((name: keyof T, error: string) => {
      setErrors(prev => ({ ...prev, [name]: error }))
    }, [])

    const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
      e.preventDefault()
      
      if (validation) {
        const validationErrors = validation(values)
        setErrors(validationErrors)
        
        if (Object.keys(validationErrors).length > 0) {
          return
        }
      }

      setIsSubmitting(true)
      try {
        await onSubmit?.(values)
      } finally {
        setIsSubmitting(false)
      }
    }, [values, onSubmit, validation])

    const reset = React.useCallback(() => {
      setValues(initialValues)
      setErrors({})
      setTouched({})
      setIsSubmitting(false)
    }, [initialValues])

    const isValid = Object.keys(errors).length === 0

    return (
      <WrappedComponent 
        {...props}
        values={values}
        errors={errors}
        touched={touched}
        handleChange={handleChange}
        handleBlur={handleBlur}
        handleSubmit={handleSubmit}
        isValid={isValid}
        isSubmitting={isSubmitting}
        setFieldValue={setFieldValue}
        setFieldError={setFieldError}
        reset={reset}
      />
    )
  }
}

// Modal HOC
export function withModal<P extends object>(
  WrappedComponent: ComponentType<P & { 
    isOpen: boolean
    openModal: () => void
    closeModal: () => void
    toggleModal: () => void
  }>
) {
  return function WithModalComponent(props: P & { defaultOpen?: boolean }) {
    const [isOpen, setIsOpen] = React.useState(props.defaultOpen || false)

    const openModal = React.useCallback(() => setIsOpen(true), [])
    const closeModal = React.useCallback(() => setIsOpen(false), [])
    const toggleModal = React.useCallback(() => setIsOpen(prev => !prev), [])

    return (
      <WrappedComponent 
        {...props}
        isOpen={isOpen}
        openModal={openModal}
        closeModal={closeModal}
        toggleModal={toggleModal}
      />
    )
  }
}

// Debounce HOC
export function withDebounce<P extends object>(
  WrappedComponent: ComponentType<P & { debouncedValue: any }>,
  value: any,
  delay: number
) {
  const [debouncedValue, setDebouncedValue] = React.useState(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return <WrappedComponent {...(props as P)} debouncedValue={debouncedValue} />
}

// Intersection Observer HOC
export function withIntersectionObserver<P extends object>(
  WrappedComponent: ComponentType<P & { 
    inView: boolean
    entry: IntersectionObserverEntry | null
    ref: (node: HTMLElement | null) => void
  }>,
  options?: IntersectionObserverInit
) {
  return function WithIntersectionObserverComponent(props: P) {
    const [node, setNode] = React.useState<HTMLElement | null>(null)
    const [inView, setInView] = React.useState(false)
    const [entry, setEntry] = React.useState<IntersectionObserverEntry | null>(null)

    React.useEffect(() => {
      if (!node) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          setEntry(entry)
          setInView(entry.isIntersecting)
        },
        options
      )

      observer.observe(node)

      return () => {
        observer.unobserve(node)
      }
    }, [node, options])

    const ref = React.useCallback((node: HTMLElement | null) => {
      setNode(node)
    }, [])

    return (
      <WrappedComponent 
        {...(props as P)} 
        inView={inView}
        entry={entry}
        ref={ref}
      />
    )
  }
}

// Responsive HOC
export function withResponsive<P extends object>(
  WrappedComponent: ComponentType<P & { 
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
    screenSize: 'mobile' | 'tablet' | 'desktop'
  }>
) {
  return function WithResponsiveComponent(props: P) {
    const [screenSize, setScreenSize] = React.useState<'mobile' | 'tablet' | 'desktop'>('desktop')

    React.useEffect(() => {
      const handleResize = () => {
        const width = window.innerWidth
        if (width < 768) {
          setScreenSize('mobile')
        } else if (width < 1024) {
          setScreenSize('tablet')
        } else {
          setScreenSize('desktop')
        }
      }

      handleResize()
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }, [])

    const isMobile = screenSize === 'mobile'
    const isTablet = screenSize === 'tablet'
    const isDesktop = screenSize === 'desktop'

    return (
      <WrappedComponent 
        {...(props as P)}
        isMobile={isMobile}
        isTablet={isTablet}
        isDesktop={isDesktop}
        screenSize={screenSize}
      />
    )
  }
}

// Conditional Rendering HOC
export function withConditional<P extends object>(
  WrappedComponent: ComponentType<P>,
  condition: (props: P) => boolean,
  fallback?: ComponentType
) {
  return function WithConditionalComponent(props: P) {
    if (condition(props)) {
      return <WrappedComponent {...props} />
    }
    
    if (fallback) {
      return <fallback {...props} />
    }
    
    return null
  }
}

// Logging HOC
export function withLogging<P extends object>(
  WrappedComponent: ComponentType<P>,
  logger?: (action: string, props: P) => void
) {
  return function WithLoggingComponent(props: P) {
    React.useEffect(() => {
      logger?.('mount', props)
      return () => {
        logger?.('unmount', props)
      }
    }, [logger])

    React.useEffect(() => {
      logger?.('update', props)
    })

    return <WrappedComponent {...props} />
  }
}

// Performance HOC
export function withPerformance<P extends object>(
  WrappedComponent: ComponentType<P>,
  name?: string
) {
  return function WithPerformanceComponent(props: P) {
    const renderCount = React.useRef(0)
    const renderTime = React.useRef(performance.now())

    React.useEffect(() => {
      renderCount.current += 1
    })

    React.useEffect(() => {
      const now = performance.now()
      const renderDuration = now - renderTime.current
      renderTime.current = now
      
      if (name) {
        console.log(`${name} render #${renderCount.current} took ${renderDuration.toFixed(2)}ms`)
      }
    })

    return <WrappedComponent {...props} />
  }
}

// Compose multiple HOCs
export function compose<P extends object>(...hocs: Array<(Component: ComponentType<any>) => ComponentType<any>>) {
  return function(OriginalComponent: ComponentType<P>) {
    return hocs.reduceRight((acc, hoc) => hoc(acc), OriginalComponent)
  }
}

// Async HOC
export function withAsync<P extends object, T = any>(
  WrappedComponent: ComponentType<P & { 
    data: T | null
    loading: boolean
    error: Error | null
    refetch: () => void
  }>,
  asyncFunction: () => Promise<T>
) {
  return function WithAsyncComponent(props: P & { autoFetch?: boolean }) {
    const [data, setData] = React.useState<T | null>(null)
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<Error | null>(null)
    const { autoFetch = true, ...restProps } = props

    const refetch = React.useCallback(async () => {
      setLoading(true)
      setError(null)
      
      try {
        const result = await asyncFunction()
        setData(result)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }, [])

    React.useEffect(() => {
      if (autoFetch) {
        refetch()
      }
    }, [refetch, autoFetch])

    return (
      <WrappedComponent 
        {...(restProps as P)} 
        data={data}
        loading={loading}
        error={error}
        refetch={refetch}
      />
    )
  }
}

export const HOCPatterns = {
  withLoading,
  withErrorBoundary,
  withAuth,
  withTheme,
  withDataFetching,
  withForm,
  withModal,
  withDebounce,
  withIntersectionObserver,
  withResponsive,
  withConditional,
  withLogging,
  withPerformance,
  compose,
  withAsync
}