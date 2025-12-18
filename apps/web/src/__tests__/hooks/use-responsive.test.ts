import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act, render } from '@testing-library/react'
import { 
  useResponsiveValue,
  useResponsiveClass,
  useResponsiveBoolean,
  useResponsiveFilter,
  useResponsiveTheme,
  useResponsiveAnimation,
  useResponsiveLayout,
  useResponsiveVisibility,
  useResponsiveDensity,
  useResponsivePerformance,
  useResponsiveAccessibility,
  useResponsiveData,
  useMediaQuery,
  usePrefersHighContrast,
  useForcedColors,
  usePrefersColorScheme
} from '@/hooks/use-responsive'

// Mock media queries
const mockMediaQuery = (matches: boolean, query: string) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((q: string) => ({
      matches: q === query ? matches : false,
      media: q,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  })
}

describe('Responsive Hooks - useResponsiveValue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return value for current breakpoint', () => {
    mockMediaQuery(true, '(max-width: 767px)')
    
    const { result } = renderHook(() => 
      useResponsiveValue({
        sm: 'small',
        md: 'medium',
        lg: 'large'
      })
    )
    
    expect(result.current).toBe('medium')
  })

  it('should fallback to smaller breakpoint', () => {
    mockMediaQuery(true, '(max-width: 767px)')
    
    const { result } = renderHook(() => 
      useResponsiveValue({
        lg: 'large'
      })
    )
    
    expect(result.current).toBeUndefined()
  })

  it('should use default value when no breakpoint matches', () => {
    mockMediaQuery(true, '(max-width: 767px)')
    
    const { result } = renderHook(() => 
      useResponsiveValue({
        lg: 'large'
      }, 'default')
    )
    
    expect(result.current).toBe('default')
  })
})

describe('Responsive Hooks - useMediaQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return true when media query matches', () => {
    mockMediaQuery(true, '(max-width: 768px)')
    
    const { result } = renderHook(() => 
      useMediaQuery('(max-width: 768px)')
    )
    
    expect(result.current).toBe(true)
  })

  it('should return false when media query does not match', () => {
    mockMediaQuery(false, '(max-width: 768px)')
    
    const { result } = renderHook(() => 
      useMediaQuery('(max-width: 768px)')
    )
    
    expect(result.current).toBe(false)
  })

  it('should update when media query changes', () => {
    const mockMediaQueryList = {
      matches: false,
      media: '(max-width: 768px)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }
    
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue(mockMediaQueryList)
    })
    
    const { result } = renderHook(() => 
      useMediaQuery('(max-width: 768px)')
    )
    
    expect(result.current).toBe(false)
    
    act(() => {
      mockMediaQueryList.matches = true
      mockMediaQueryList.onchange?.({ matches: true } as MediaQueryListEvent)
    })
    
    expect(result.current).toBe(true)
  })
})

describe('Responsive Hooks - useResponsiveFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should filter items based on current breakpoint', () => {
    mockMediaQuery(true, '(max-width: 767px)')
    
    const items = [
      { id: 1, priority: 'high' },
      { id: 2, priority: 'medium' },
      { id: 3, priority: 'low' }
    ]
    
    const { result } = renderHook(() => 
      useResponsiveFilter(items, {
        sm: (item) => item.priority !== 'low',
        md: () => true
      })
    )
    
    expect(result.current).toHaveLength(2)
    expect(result.current.map(item => item.priority)).toEqual(['high', 'medium'])
  })

  it('should return all items when no filter matches', () => {
    mockMediaQuery(true, '(max-width: 767px)')
    
    const items = [
      { id: 1, name: 'item1' },
      { id: 2, name: 'item2' }
    ]
    
    const { result } = renderHook(() => 
      useResponsiveFilter(items, {
        lg: (item) => item.name === 'item1'
      })
    )
    
    expect(result.current).toHaveLength(2)
    expect(result.current).toEqual(items)
  })
})

describe('Responsive Hooks - useResponsiveLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return layout config for current breakpoint', () => {
    mockMediaQuery(true, '(max-width: 767px)')
    
    const { result } = renderHook(() => 
      useResponsiveLayout({
        sm: { columns: 1, gap: '0.5rem' },
        md: { columns: 2, gap: '1rem' },
        lg: { columns: 3, gap: '1.5rem' }
      })
    )
    
    expect(result.current).toEqual({
      columns: 1,
      gap: '0.5rem',
      padding: '1rem',
      fontSize: '0.875rem'
    })
  })

  it('should return adaptive layout for undefined config', () => {
    mockMediaQuery(true, '(max-width: 767px)')
    
    const { result } = renderHook(() => 
      useResponsiveLayout({})
    )
    
    expect(result.current).toEqual({
      columns: 1,
      gap: '1rem',
      padding: '1rem',
      fontSize: '0.875rem'
    })
  })
})

describe('Responsive Hooks - useResponsiveVisibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return visibility based on current breakpoint', () => {
    mockMediaQuery(true, '(max-width: 767px)')
    
    const { result } = renderHook(() => 
      useResponsiveVisibility({
        sm: false,
        md: true
      })
    )
    
    expect(result.current).toBe(false)
  })

  it('should default to visible when no visibility defined', () => {
    mockMediaQuery(true, '(max-width: 767px)')
    
    const { result } = renderHook(() => 
      useResponsiveVisibility({
        lg: false
      })
    )
    
    expect(result.current).toBe(true)
  })
})

describe('Responsive Hooks - useResponsiveDensity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return density based on current breakpoint', () => {
    mockMediaQuery(true, '(max-width: 767px)')
    
    const { result } = renderHook(() => 
      useResponsiveDensity({
        sm: 'compact',
        md: 'normal',
        lg: 'spacious'
      })
    )
    
    expect(result.current).toBe('compact')
  })

  it('should adapt density based on screen size', () => {
    mockMediaQuery(true, '(max-width: 767px)')
    
    const { result } = renderHook(() => 
      useResponsiveDensity({})
    )
    
    expect(result.current).toBe('compact')
  })

  it('should return spacious for large screens', () => {
    // Mock large screen
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1920
    })
    
    mockMediaQuery(false, '(max-width: 767px)')
    
    const { result } = renderHook(() => 
      useResponsiveDensity({})
    )
    
    expect(result.current).toBe('spacious')
  })
})

describe('Responsive Hooks - useResponsivePerformance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return performance settings for current breakpoint', () => {
    mockMediaQuery(true, '(max-width: 767px)')
    
    const { result } = renderHook(() => 
      useResponsivePerformance({
        sm: {
          imageQuality: 0.8,
          animationDuration: 200,
          debounceMs: 150
        },
        lg: {
          imageQuality: 0.95,
          animationDuration: 300,
          debounceMs: 50
        }
      })
    )
    
    expect(result.current).toEqual({
      imageQuality: 0.8,
      animationDuration: 200,
      debounceMs: 150,
      throttleMs: 200,
      batchSize: 5
    })
  })

  it('should return adaptive settings when no config matches', () => {
    mockMediaQuery(true, '(max-width: 767px)')
    
    const { result } = renderHook(() => 
      useResponsivePerformance({})
    )
    
    expect(result.current).toEqual({
      imageQuality: 0.7,
      animationDuration: 150,
      debounceMs: 100,
      throttleMs: 200,
      batchSize: 5
    })
  })
})

describe('Responsive Hooks - useResponsiveAccessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should respect user preferences', () => {
    mockMediaQuery(true, '(prefers-reduced-motion: reduce)')
    mockMediaQuery(true, '(prefers-contrast: high)')
    
    const { result } = renderHook(() => 
      useResponsiveAccessibility({
        sm: { animationDuration: 100 }
      })
    )
    
    expect(result.current).toEqual({
      focusIndicator: true,
      reducedMotion: true,
      highContrast: true,
      largeTouchTargets: true,
      keyboardNavigation: true,
      animationDuration: 100
    })
  })

  it('should provide base accessibility settings', () => {
    mockMediaQuery(false, '(prefers-reduced-motion: reduce)')
    mockMediaQuery(false, '(prefers-contrast: high)')
    
    const { result } = renderHook(() => 
      useResponsiveAccessibility({})
    )
    
    expect(result.current).toEqual({
      focusIndicator: true,
      reducedMotion: false,
      highContrast: false,
      largeTouchTargets: true,
      keyboardNavigation: true
    })
  })
})

describe('Responsive Hooks - useResponsiveData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return data fetch config for current breakpoint', () => {
    mockMediaQuery(true, '(max-width: 767px)')
    
    const { result } = renderHook(() => 
      useResponsiveData({
        sm: { limit: 10, pageSize: 5 },
        md: { limit: 20, pageSize: 10 }
      })
    )
    
    expect(result.current).toEqual({
      limit: 10,
      pageSize: 5,
      batchSize: 5,
      cacheTime: 300000
    })
  })

  it('should adapt config based on screen size', () => {
    mockMediaQuery(true, '(max-width: 767px)')
    
    const { result } = renderHook(() => 
      useResponsiveData({})
    )
    
    expect(result.current).toEqual({
      limit: 10,
      pageSize: 5,
      batchSize: 5,
      cacheTime: 300000
    })
  })
})

describe('Responsive Utility Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should handle prefers-high-contrast media query', () => {
    mockMediaQuery(true, '(prefers-contrast: high)')
    
    const { result } = renderHook(() => 
      usePrefersHighContrast()
    )
    
    expect(result.current).toBe(true)
  })

  it('should handle forced-colors media query', () => {
    mockMediaQuery(true, '(forced-colors: active)')
    
    const { result } = renderHook(() => 
      useForcedColors()
    )
    
    expect(result.current).toBe(true)
  })

  it('should handle prefers-color-scheme media query', () => {
    const mockMediaQueryList = {
      matches: true,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }
    
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((q: string) => {
        if (q === '(prefers-color-scheme: dark)') {
          return mockMediaQueryList
        }
        return {
          matches: false,
          media: q,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }
      })
    })
    
    const { result } = renderHook(() => 
      usePrefersColorScheme()
    )
    
    expect(result.current).toBe('dark')
  })
})

// Integration tests for responsive components
describe('Responsive Integration Tests', () => {
  it('should work with responsive components', () => {
    const TestComponent = () => {
      const layout = useResponsiveLayout({
        sm: { columns: 1 },
        md: { columns: 2 },
        lg: { columns: 3 }
      })
      
      return <div data-columns={layout.columns}>Content</div>
    }
    
    mockMediaQuery(true, '(max-width: 767px)')
    
    const { container } = render(<TestComponent />)
    
    expect(container.firstChild).toHaveAttribute('data-columns', '1')
  })

  it('should handle responsive visibility in components', () => {
    const TestComponent = () => {
      const isVisible = useResponsiveVisibility({
        sm: false,
        md: true
      })
      
      return <div data-visible={isVisible}>Content</div>
    }
    
    mockMediaQuery(true, '(max-width: 767px)')
    
    const { container } = render(<TestComponent />)
    
    expect(container.firstChild).toHaveAttribute('data-visible', 'false')
  })
})

// Edge case tests
describe('Responsive Edge Cases', () => {
  it('should handle undefined window object', () => {
    const originalWindow = global.window
    delete (global as any).window
    
    const { result } = renderHook(() => 
      useMediaQuery('(max-width: 768px)')
    )
    
    expect(result.current).toBe(false)
    
    global.window = originalWindow
  })

  it('should handle invalid media queries gracefully', () => {
    mockMediaQuery(true, '(max-width: 768px)')
    
    const { result } = renderHook(() => 
      useMediaQuery('invalid-query')
    )
    
    expect(result.current).toBe(false)
  })

  it('should handle empty responsive configs', () => {
    mockMediaQuery(true, '(max-width: 767px)')
    
    const { result } = renderHook(() => 
      useResponsiveValue({})
    )
    
    expect(result.current).toBeUndefined()
  })

  it('should handle null and undefined values', () => {
    mockMediaQuery(true, '(max-width: 767px)')
    
    const { result } = renderHook(() => 
      useResponsiveValue({
        sm: null,
        md: undefined,
        lg: 'value'
      })
    )
    
    expect(result.current).toBe('value')
  })
})