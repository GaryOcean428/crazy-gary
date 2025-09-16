/**
 * Performance optimization utilities for React applications
 * Provides hooks and components for better performance
 */

import React, { useCallback, useMemo, useRef, useEffect, useState, ReactNode } from 'react'
import ErrorBoundary from '../components/error-boundary'

// Debounce hook for input handling
export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Throttle hook for scroll/resize events
export const useThrottle = <T extends (...args: any[]) => any,>(callback: T, delay: number) => {
  const lastRun = useRef(Date.now())

  return useCallback((...args: Parameters<T>) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args)
      lastRun.current = Date.now()
    }
  }, [callback, delay])
}

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (options: IntersectionObserverInit = {}) => {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
  const elementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => setEntry(entry),
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )

    observer.observe(element)

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [options])

  return [elementRef, entry]
}

// Lazy loading component
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  alt, 
  placeholder = '/placeholder.svg',
  className = '',
  ...props 
}) => {
  const [elementRef, entry] = useIntersectionObserver()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageSrc, setImageSrc] = useState(placeholder)

  useEffect(() => {
    if (entry?.isIntersecting && !imageLoaded) {
      setImageSrc(src)
      setImageLoaded(true)
    }
  }, [entry, src, imageLoaded])

  return (
    <img
      ref={elementRef as React.RefObject<HTMLImageElement>}
      src={imageSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${
        imageLoaded && imageSrc !== placeholder ? 'opacity-100' : 'opacity-70'
      } ${className}`}
      loading="lazy"
      {...props}
    />
  )
}

// Virtual scrolling hook for large lists
interface UseVirtualScrollProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export const useVirtualScroll = ({ 
  items, 
  itemHeight, 
  containerHeight, 
  overscan = 5 
}: UseVirtualScrollProps) => {
  const [scrollTop, setScrollTop] = useState(0)
  
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight)
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    )
    
    return {
      start: Math.max(0, start - overscan),
      end
    }
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length])

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      ...item,
      index: visibleRange.start + index
    }))
  }, [items, visibleRange])

  const totalHeight = items.length * itemHeight

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    offsetY: visibleRange.start * itemHeight
  }
}

// Virtual list component
interface VirtualListProps {
  items: any[];
  itemHeight: number;
  height: number;
  renderItem: (item: any, index: number) => ReactNode;
  className?: string;
}

export const VirtualList: React.FC<VirtualListProps> = ({
  items,
  itemHeight,
  height,
  renderItem,
  className = ''
}) => {
  const { visibleItems, totalHeight, handleScroll, offsetY } = useVirtualScroll({
    items,
    itemHeight,
    containerHeight: height
  })

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item) => (
            <div
              key={item.index}
              style={{ height: itemHeight }}
              className="w-full"
            >
              {renderItem(item, item.index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Memoized component wrapper
export const memo = <P extends object,>(
  Component: React.ComponentType<P>, 
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
) => {
  return React.memo(Component, propsAreEqual)
}

// Performance monitoring hook
export const usePerformanceMonitor = (name: string) => {
  const renderCount = useRef(0)
  const renderTimes = useRef<number[]>([])

  useEffect(() => {
    renderCount.current += 1
    const renderTime = performance.now()
    renderTimes.current.push(renderTime)

    // Keep only last 10 render times
    if (renderTimes.current.length > 10) {
      renderTimes.current = renderTimes.current.slice(-10)
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`${name} rendered ${renderCount.current} times`)
      
      if (renderTimes.current.length > 1) {
        const lastTwo = renderTimes.current.slice(-2)
        const renderDuration = lastTwo[1] - lastTwo[0]
        console.log(`${name} render duration: ${renderDuration.toFixed(2)}ms`)
      }
    }
  })

  return {
    renderCount: renderCount.current,
    averageRenderTime: renderTimes.current.length > 1 
      ? (renderTimes.current[renderTimes.current.length - 1] - renderTimes.current[0]) / (renderTimes.current.length - 1)
      : 0
  }
}

// Bundle analyzer component (development only)
interface BundleChunk {
  name: string;
  size: string;
  gzipSize: string;
}

interface BundleStats {
  totalSize: string;
  gzipSize: string;
  chunks: BundleChunk[];
}

export const BundleAnalyzer: React.FC = () => {
  const [bundleStats, setBundleStats] = useState<BundleStats | null>(null)

  useEffect(() => {
    // Simulate bundle analysis (in real app, this would come from webpack-bundle-analyzer)
    const stats = {
      totalSize: '1.2MB',
      gzipSize: '340KB',
      chunks: [
        { name: 'main', size: '450KB', gzipSize: '120KB' },
        { name: 'vendor', size: '600KB', gzipSize: '180KB' },
        { name: 'router', size: '150KB', gzipSize: '40KB' }
      ]
    }
    setBundleStats(stats)
  }, [])

  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'development') {
    return null
  }

  if (!bundleStats) return null

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs z-50">
      <h3 className="font-bold mb-2">Bundle Stats</h3>
      <p>Total: {bundleStats.totalSize} ({bundleStats.gzipSize} gzipped)</p>
      {bundleStats.chunks.map(chunk => (
        <p key={chunk.name}>
          {chunk.name}: {chunk.size} ({chunk.gzipSize} gzipped)
        </p>
      ))}
    </div>
  )
}

// Code splitting utility
export const lazy = (importFunc) => {
  return React.lazy(importFunc)
}

// Suspense wrapper with loading state
export const SuspenseWrapper = ({ 
  children, 
  fallback,
  errorBoundary = true 
}) => {
  const LoadingFallback = fallback || (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )

  const content = (
    <React.Suspense fallback={LoadingFallback}>
      {children}
    </React.Suspense>
  )

  if (errorBoundary) {
    return (
      <ErrorBoundary>
        {content}
      </ErrorBoundary>
    )
  }

  return content
}

// Image optimization component
export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  quality = 75,
  format = 'webp',
  className = '',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // In a real app, this would use a service like Cloudinary or Vercel Image Optimization
    const optimizedSrc = `${src}?w=${width}&h=${height}&q=${quality}&f=${format}`
    setImageSrc(optimizedSrc)
  }, [src, width, height, quality, format])

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">Failed to load image</span>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  )
}

// Performance budget checker
export const checkPerformanceBudget = () => {
  if (typeof window === 'undefined' || (typeof process !== 'undefined' && process.env.NODE_ENV !== 'development')) {
    return
  }

  // Check bundle size budget
  const _budgets = {
    javascript: 500 * 1024, // 500KB
    css: 100 * 1024, // 100KB
    images: 1 * 1024 * 1024, // 1MB
    fonts: 200 * 1024 // 200KB
  }

  // This would integrate with actual bundle analysis in a real app
  console.group('Performance Budget Check')
  console.log('JavaScript Budget: 500KB')
  console.log('CSS Budget: 100KB')
  console.log('Images Budget: 1MB')
  console.log('Fonts Budget: 200KB')
  console.groupEnd()
}

// Initialize performance monitoring
export const initPerformanceMonitoring = () => {
  if (typeof window === 'undefined') return

  // Web Vitals monitoring
  const vitals = {
    FCP: null, // First Contentful Paint
    LCP: null, // Largest Contentful Paint
    FID: null, // First Input Delay
    CLS: null  // Cumulative Layout Shift
  }

  // Performance observer for Core Web Vitals
  if ('PerformanceObserver' in window) {
    // FCP and LCP
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          vitals.FCP = entry.startTime
        }
        if (entry.entryType === 'largest-contentful-paint') {
          vitals.LCP = entry.startTime
        }
      }
    }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] })

    // FID
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.processingStart > entry.startTime) {
          vitals.FID = entry.processingStart - entry.startTime
        }
      }
    }).observe({ entryTypes: ['first-input'] })

    // CLS
    new PerformanceObserver((list) => {
      let clsValue = 0
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      }
      vitals.CLS = clsValue
    }).observe({ entryTypes: ['layout-shift'] })
  }

  // Log vitals after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      console.group('Core Web Vitals')
      console.log('First Contentful Paint:', vitals.FCP?.toFixed(2) + 'ms')
      console.log('Largest Contentful Paint:', vitals.LCP?.toFixed(2) + 'ms')
      console.log('First Input Delay:', vitals.FID?.toFixed(2) + 'ms')
      console.log('Cumulative Layout Shift:', vitals.CLS?.toFixed(4))
      console.groupEnd()
    }, 1000)
  })
}

export default {
  useDebounce,
  useThrottle,
  useIntersectionObserver,
  useVirtualScroll,
  usePerformanceMonitor,
  LazyImage,
  VirtualList,
  SuspenseWrapper,
  OptimizedImage,
  BundleAnalyzer,
  checkPerformanceBudget,
  initPerformanceMonitoring
}