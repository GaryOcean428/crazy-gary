import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'

// Generic Render Props Component
interface RenderPropsProps<T = any> {
  children: (props: T) => React.ReactNode
  data?: any
  loading?: boolean
  error?: Error | null
  [key: string]: any
}

export function RenderProps<T = any>({ 
  children, 
  data, 
  loading = false, 
  error = null,
  ...props 
}: RenderPropsProps<T>) {
  const renderProps = {
    data,
    loading,
    error,
    ...props
  } as T

  if (loading) {
    return <div className="animate-pulse">Loading...</div>
  }

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>
  }

  return children(renderProps)
}

// Data Fetcher with Render Props
interface DataFetcherProps<T = any> {
  url: string
  children: (props: {
    data: T | null
    loading: boolean
    error: Error | null
    refetch: () => void
  }) => React.ReactNode
  autoFetch?: boolean
  dependencies?: any[]
}

export function DataFetcher<T = any>({ 
  url, 
  children, 
  autoFetch = true, 
  dependencies = [] 
}: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [url, ...dependencies])

  useEffect(() => {
    if (autoFetch) {
      fetchData()
    }
  }, [fetchData, autoFetch])

  return children({ data, loading, error, refetch: fetchData })
}

// Toggle Component with Render Props
interface ToggleProps {
  initial?: boolean
  onChange?: (value: boolean) => void
  children: (props: {
    on: boolean
    toggle: () => void
    setOn: (value: boolean) => void
  }) => React.ReactNode
}

export function Toggle({ initial = false, onChange, children }: ToggleProps) {
  const [on, setOn] = useState(initial)

  const toggle = useCallback(() => {
    setOn(prev => {
      const newValue = !prev
      onChange?.(newValue)
      return newValue
    })
  }, [onChange])

  const setOnValue = useCallback((value: boolean) => {
    setOn(value)
    onChange?.(value)
  }, [onChange])

  return children({ on, toggle, setOn: setOnValue })
}

// Modal with Render Props
interface ModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: (props: {
    open: boolean
    close: () => void
    openModal: () => void
  }) => React.ReactNode
}

export function Modal({ open = false, onOpenChange, children }: ModalProps) {
  const [internalOpen, setInternalOpen] = useState(open)

  const isControlled = open !== undefined
  const actualOpen = isControlled ? open : internalOpen

  const close = useCallback(() => {
    if (isControlled) {
      onOpenChange?.(false)
    } else {
      setInternalOpen(false)
    }
  }, [isControlled, onOpenChange])

  const openModal = useCallback(() => {
    if (isControlled) {
      onOpenChange?.(true)
    } else {
      setInternalOpen(true)
    }
  }, [isControlled, onOpenChange])

  return children({ open: actualOpen, close, openModal })
}

// List Renderer with Render Props
interface ListRendererProps<T = any> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T, index: number) => string | number
  loading?: boolean
  empty?: React.ReactNode
  children?: (props: {
    items: React.ReactNode[]
    count: number
    loading: boolean
  }) => React.ReactNode
}

export function ListRenderer<T = any>({ 
  items, 
  renderItem, 
  keyExtractor, 
  loading = false, 
  empty, 
  children 
}: ListRendererProps<T>) {
  const renderedItems = useMemo(() => {
    if (loading) {
      return Array.from({ length: 3 }, (_, index) => (
        <div key={`skeleton-${index}`} className="animate-pulse bg-gray-200 h-20 rounded"></div>
      ))
    }

    if (items.length === 0) {
      return empty || <div className="text-gray-500 text-center py-8">No items found</div>
    }

    return items.map((item, index) => (
      <div key={keyExtractor(item, index)}>
        {renderItem(item, index)}
      </div>
    ))
  }, [items, renderItem, keyExtractor, loading, empty])

  if (children) {
    return children({ items: renderedItems, count: items.length, loading })
  }

  return <>{renderedItems}</>
}

// Form with Render Props
interface FormRenderProps<T = any> {
  initialValues: T
  onSubmit: (values: T) => void | Promise<void>
  validation?: (values: T) => Record<string, string>
  children: (props: {
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
  }) => React.ReactNode
}

export function FormRender<T extends Record<string, any>>({
  initialValues,
  onSubmit,
  validation,
  children
}: FormRenderProps<T>) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
    setTouched(prev => ({ ...prev, [name]: true }))
  }, [])

  const handleBlur = useCallback((name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }))
  }, [])

  const setFieldValue = useCallback((name: keyof T, value: any) => {
    handleChange(name, value)
  }, [handleChange])

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }))
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
      await onSubmit(values)
    } finally {
      setIsSubmitting(false)
    }
  }, [values, onSubmit, validation])

  const isValid = Object.keys(errors).length === 0

  return children({
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isValid,
    isSubmitting,
    setFieldValue,
    setFieldError
  })
}

// Conditional Render Props
interface ConditionalProps {
  condition: boolean | (() => boolean)
  children: React.ReactNode | ((condition: boolean) => React.ReactNode)
  fallback?: React.ReactNode
}

export function Conditional({ condition, children, fallback = null }: ConditionalProps) {
  const shouldRender = typeof condition === 'function' ? condition() : condition
  
  if (!shouldRender) {
    return <>{fallback}</>
  }

  if (typeof children === 'function') {
    return children(shouldRender)
  }

  return <>{children}</>
}

// Async Component with Render Props
interface AsyncComponentProps<T = any> {
  loader: () => Promise<T>
  children: (props: {
    data: T | null
    loading: boolean
    error: Error | null
    retry: () => void
  }) => React.ReactNode
  fallback?: React.ReactNode
  errorFallback?: React.ReactNode
}

export function AsyncComponent<T = any>({
  loader,
  children,
  fallback = <div className="animate-pulse">Loading...</div>,
  errorFallback = <div className="text-red-500">Failed to load</div>
}: AsyncComponentProps<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await loader()
      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [loader])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return fallback
  }

  if (error) {
    return (
      <div>
        {errorFallback}
        <button onClick={load} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
          Retry
        </button>
      </div>
    )
  }

  return children({ data, loading, error, retry: load })
}

// Observer Component for Intersection API
interface ObserverProps {
  children: (props: {
    ref: (node: HTMLElement | null) => void
    inView: boolean
    entry: IntersectionObserverEntry | null
  }) => React.ReactNode
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

export function Observer({ 
  children, 
  threshold = 0.1, 
  rootMargin = '0px',
  triggerOnce = true 
}: ObserverProps) {
  const [node, setNode] = useState<HTMLElement | null>(null)
  const [inView, setInView] = useState(false)
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)

  useEffect(() => {
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry)
        setInView(entry.isIntersecting)
        
        if (triggerOnce && entry.isIntersecting) {
          observer.unobserve(node)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(node)

    return () => {
      observer.unobserve(node)
    }
  }, [node, threshold, rootMargin, triggerOnce])

  const ref = useCallback((node: HTMLElement | null) => {
    setNode(node)
  }, [])

  return children({ ref, inView, entry })
}

export const RenderPropPatterns = {
  RenderProps,
  DataFetcher,
  Toggle,
  Modal,
  ListRenderer,
  FormRender,
  Conditional,
  AsyncComponent,
  Observer
}