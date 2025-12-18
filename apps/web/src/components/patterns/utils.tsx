import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

// Generic composition utility types
export type PropsWithChildren<P = {}> = P & { children?: React.ReactNode }

export type MergeProps<T, U> = Omit<T, keyof U> & U

export type ComponentProps<T extends React.ComponentType<any>> = 
  React.ComponentPropsWithoutRef<T>

export type ForwardRefComponent<T extends React.ComponentType<any>> = 
  React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<T>>

// Props merging utility
export function mergeProps<T extends Record<string, any>, U extends Record<string, any>>(
  baseProps: T,
  overrideProps: U
): MergeProps<T, U> {
  // Merge className
  const className = cn(baseProps.className, overrideProps.className)
  
  // Merge style objects
  const style = {
    ...baseProps.style,
    ...overrideProps.style
  }
  
  // Merge event handlers
  const mergedProps = { ...baseProps, ...overrideProps }
  
  // Override specific props
  if (className) mergedProps.className = className
  if (Object.keys(style).length > 0) mergedProps.style = style
  
  return mergedProps as MergeProps<T, U>
}

// Children utilities
export function pickChildren(children: React.ReactNode, predicate: (child: React.ReactElement) => boolean): React.ReactElement[] {
  return React.Children.toArray(children).filter(
    child => React.isValidElement(child) && predicate(child)
  ) as React.ReactElement[]
}

export function omitChildren(children: React.ReactNode, predicate: (child: React.ReactElement) => boolean): React.ReactNode {
  return React.Children.toArray(children).filter(
    child => !React.isValidElement(child) || !predicate(child)
  )
}

export function replaceChildren(children: React.ReactNode, replacements: Record<string, React.ReactNode>): React.ReactNode {
  return React.Children.map(children, child => {
    if (React.isValidElement(child) && typeof child.type === 'string') {
      const replacement = replacements[child.type as string]
      if (replacement) {
        return React.cloneElement(child, {}, replacement)
      }
    }
    return child
  })
}

// Composition hooks
export function useComposition<T = any>(initialState: T) {
  const [state, setState] = useState(initialState)
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const getState = useCallback(() => stateRef.current, [])
  const setValue = useCallback((updater: T | ((prev: T) => T)) => {
    setState(updater)
  }, [])

  return { state, setValue, getState }
}

export function useEventCallback<T extends (...args: any[]) => any>(fn: T): T {
  const ref = useRef(fn)
  
  useEffect(() => {
    ref.current = fn
  })

  return useCallback(((...args: Parameters<T>) => {
    return ref.current(...args)
  }) as T, [])
}

// State composition hook
export function useComposedState<T = any>(
  ...states: Array<[string, T | undefined]>
) {
  const [composedState, setComposedState] = useState(() => {
    const initial: Record<string, T> = {}
    states.forEach(([key, value]) => {
      if (value !== undefined) {
        initial[key] = value
      }
    })
    return initial
  })

  const updateState = useCallback((key: string, value: T) => {
    setComposedState(prev => ({ ...prev, [key]: value }))
  }, [])

  const getState = useCallback((key: string) => composedState[key], [composedState])

  return { state: composedState, updateState, getState }
}

// Props composition hook
export function usePropsComposition<T extends Record<string, any>>(baseProps: T) {
  const [overrides, setOverrides] = useState<Partial<T>>({})

  const composedProps = useMemo(() => {
    return mergeProps(baseProps, overrides)
  }, [baseProps, overrides])

  const setOverride = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setOverrides(prev => ({ ...prev, [key]: value }))
  }, [])

  const resetOverrides = useCallback(() => {
    setOverrides({})
  }, [])

  return { props: composedProps, setOverride, resetOverrides }
}

// Conditional rendering hook
export function useConditionalRender(condition: boolean | (() => boolean)) {
  const shouldRender = typeof condition === 'function' ? condition() : condition
  return shouldRender
}

// Dynamic component composition
export function useDynamicComponent(
  componentMap: Record<string, React.ComponentType<any>>,
  fallback?: React.ComponentType<any>
) {
  const [currentKey, setCurrentKey] = useState<string | null>(null)

  const getComponent = useCallback((key: string) => {
    const Component = componentMap[key] || fallback
    return Component
  }, [componentMap, fallback])

  const switchTo = useCallback((key: string) => {
    if (componentMap[key] || fallback) {
      setCurrentKey(key)
    }
  }, [componentMap, fallback])

  const getCurrentComponent = useCallback(() => {
    if (!currentKey) return null
    return getComponent(currentKey)
  }, [currentKey, getComponent])

  return {
    getComponent,
    switchTo,
    getCurrentComponent,
    currentKey
  }
}

// Slot composition hook
export function useSlotComposition() {
  const [slots, setSlots] = useState<Record<string, React.ReactNode>>({})

  const registerSlot = useCallback((name: string, component: React.ReactNode) => {
    setSlots(prev => ({ ...prev, [name]: component }))
  }, [])

  const unregisterSlot = useCallback((name: string) => {
    setSlots(prev => {
      const { [name]: removed, ...rest } = prev
      return rest
    })
  }, [])

  const getSlot = useCallback((name: string) => slots[name], [slots])

  const renderSlot = useCallback((name: string, fallback?: React.ReactNode) => {
    return slots[name] || fallback
  }, [slots])

  return { slots, registerSlot, unregisterSlot, getSlot, renderSlot }
}

// Theme composition hook
export function useThemeComposition(theme: 'light' | 'dark' | 'auto' = 'auto') {
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      setResolvedTheme(mediaQuery.matches ? 'dark' : 'light')

      const handler = (e: MediaQueryListEvent) => {
        setResolvedTheme(e.matches ? 'dark' : 'light')
      }

      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    } else {
      setResolvedTheme(theme)
    }
  }, [theme])

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolvedTheme)
  }, [resolvedTheme])

  return { theme: resolvedTheme, setTheme: setResolvedTheme }
}

// Form composition hook
export function useFormComposition<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
  }, [])

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }))
  }, [])

  const setFieldTouched = useCallback((name: keyof T, touched: boolean = true) => {
    setTouched(prev => ({ ...prev, [name]: touched }))
  }, [])

  const validateField = useCallback((name: keyof T, validator: (value: any) => string | undefined) => {
    const error = validator(values[name])
    setFieldError(name, error || '')
    return !error
  }, [values, setFieldError])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  const handleSubmit = useCallback((onSubmit: (values: T) => void | Promise<void>) => {
    return async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)
      try {
        await onSubmit(values)
      } finally {
        setIsSubmitting(false)
      }
    }
  }, [values])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    validateField,
    reset,
    handleSubmit
  }
}

// List composition hook
export function useListComposition<T = any>(initialItems: T[] = []) {
  const [items, setItems] = useState<T[]>(initialItems)
  const [selectedItems, setSelectedItems] = useState<T[]>([])
  const [filter, setFilter] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(null)

  const filteredItems = useMemo(() => {
    if (!filter) return items
    return items.filter(item => 
      JSON.stringify(item).toLowerCase().includes(filter.toLowerCase())
    )
  }, [items, filter])

  const sortedItems = useMemo(() => {
    if (!sortConfig) return filteredItems
    return [...filteredItems].sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredItems, sortConfig])

  const addItem = useCallback((item: T) => {
    setItems(prev => [...prev, item])
  }, [])

  const removeItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }, [])

  const updateItem = useCallback((index: number, item: T) => {
    setItems(prev => prev.map((it, i) => i === index ? item : it))
  }, [])

  const selectItem = useCallback((item: T) => {
    setSelectedItems(prev => [...prev, item])
  }, [])

  const deselectItem = useCallback((item: T) => {
    setSelectedItems(prev => prev.filter(it => it !== item))
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedItems([])
  }, [])

  const sort = useCallback((key: keyof T, direction: 'asc' | 'desc' = 'asc') => {
    setSortConfig({ key, direction })
  }, [])

  return {
    items: sortedItems,
    selectedItems,
    filter,
    setFilter,
    sortConfig,
    addItem,
    removeItem,
    updateItem,
    selectItem,
    deselectItem,
    clearSelection,
    sort
  }
}

// Modal composition hook
export function useModalComposition(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [stack, setStack] = useState<string[]>([])

  const open = useCallback(() => {
    setIsOpen(true)
    setStack(prev => [...prev, 'modal'])
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setStack(prev => prev.slice(0, -1))
  }, [])

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const reset = useCallback(() => {
    setIsOpen(false)
    setStack([])
  }, [])

  return { isOpen, stack, open, close, toggle, reset }
}

// Component registry composition
export function useComponentRegistry<T extends Record<string, React.ComponentType<any>>>() {
  const [components, setComponents] = useState<T>({} as T)

  const register = useCallback(<K extends keyof T>(key: K, component: T[K]) => {
    setComponents(prev => ({ ...prev, [key]: component }))
  }, [])

  const unregister = useCallback(<K extends keyof T>(key: K) => {
    setComponents(prev => {
      const { [key]: removed, ...rest } = prev
      return rest
    })
  }, [])

  const get = useCallback(<K extends keyof T>(key: K): T[K] | undefined => {
    return components[key]
  }, [components])

  const has = useCallback(<K extends keyof T>(key: K): boolean => {
    return key in components
  }, [components])

  const keys = useCallback(() => Object.keys(components) as Array<keyof T>, [components])

  return { components, register, unregister, get, has, keys }
}

// Performance monitoring composition
export function usePerformanceMonitor(name: string) {
  const renderCount = useRef(0)
  const lastRender = useRef(performance.now())

  useEffect(() => {
    renderCount.current += 1
    const now = performance.now()
    const duration = now - lastRender.current
    lastRender.current = now
    
    console.log(`${name} render #${renderCount.current} took ${duration.toFixed(2)}ms`)
  })

  return { renderCount: renderCount.current }
}

// Async state composition
export function useAsyncState<T = any>(initialState: T | null = null) {
  const [data, setData] = useState<T | null>(initialState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(async (asyncFn: () => Promise<T>) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await asyncFn()
      setData(result)
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setData(initialState)
    setLoading(false)
    setError(null)
  }, [initialState])

  return { data, loading, error, execute, reset }
}

// Conditional props composition
export function useConditionalProps<T extends Record<string, any>>(
  baseProps: T,
  conditions: Array<{
    when: (props: T) => boolean
    props: Partial<T>
  }>
) {
  return useMemo(() => {
    const conditionalProps = conditions.reduce((acc, condition) => {
      if (condition.when(baseProps)) {
        return mergeProps(acc, condition.props)
      }
      return acc
    }, baseProps)
    
    return conditionalProps
  }, [baseProps, conditions])
}

export const CompositionUtils = {
  mergeProps,
  pickChildren,
  omitChildren,
  replaceChildren,
  useComposition,
  useEventCallback,
  useComposedState,
  usePropsComposition,
  useConditionalRender,
  useDynamicComponent,
  useSlotComposition,
  useThemeComposition,
  useFormComposition,
  useListComposition,
  useModalComposition,
  useComponentRegistry,
  usePerformanceMonitor,
  useAsyncState,
  useConditionalProps
}