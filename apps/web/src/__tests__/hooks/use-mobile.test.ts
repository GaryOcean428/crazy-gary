import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMobile } from '@/hooks/use-mobile'

// Mock matchMedia
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

describe('Hooks - useMobile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return false for desktop viewport', () => {
    mockMatchMedia(false) // Desktop
    
    const { result } = renderHook(() => useMobile())
    
    expect(result.current).toBe(false)
  })

  it('should return true for mobile viewport', () => {
    mockMatchMedia(true) // Mobile
    
    const { result } = renderHook(() => useMobile())
    
    expect(result.current).toBe(true)
  })

  it('should update when viewport changes', () => {
    mockMatchMedia(false) // Start with desktop
    
    const { result, rerender } = renderHook(() => useMobile())
    expect(result.current).toBe(false)
    
    // Change to mobile
    mockMatchMedia(true)
    rerender()
    expect(result.current).toBe(true)
  })

  it('should handle media query changes', () => {
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
      value: vi.fn().mockReturnValue(mockMediaQueryList),
    })
    
    const { result } = renderHook(() => useMobile())
    expect(result.current).toBe(false)
    
    // Simulate media query change
    act(() => {
      mockMediaQueryList.matches = true
      mockMediaQueryList.onchange?.({ matches: true } as MediaQueryListEvent)
    })
    
    expect(result.current).toBe(true)
  })

  it('should handle different breakpoints', () => {
    // Test mobile breakpoint (max-width: 768px)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query.includes('max-width') && query.includes('768px'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
    
    const { result, rerender } = renderHook(() => useMobile())
    expect(result.current).toBe(true)
  })

  it('should handle window resize events', () => {
    mockMatchMedia(false)
    
    const { result } = renderHook(() => useMobile())
    expect(result.current).toBe(false)
    
    // Simulate window resize that changes viewport
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })
    
    // Should still respect the matchMedia mock
    expect(result.current).toBe(false)
  })

  it('should handle browser back/forward navigation', () => {
    mockMatchMedia(false)
    
    const { result } = renderHook(() => useMobile())
    expect(result.current).toBe(false)
    
    // Simulate popstate event (back/forward navigation)
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    
    expect(result.current).toBe(false)
  })
})

describe('Hooks - useMobile - Integration', () => {
  it('should work with responsive components', () => {
    mockMatchMedia(true) // Mobile
    
    const TestComponent = () => {
      const isMobile = useMobile()
      return <div>{isMobile ? 'Mobile View' : 'Desktop View'}</div>
    }
    
    const { container } = render(<TestComponent />)
    
    expect(container.textContent).toBe('Mobile View')
  })

  it('should handle multiple components using the hook', () => {
    mockMatchMedia(true)
    
    const Component1 = () => {
      const isMobile = useMobile()
      return <div data-testid="comp1">{isMobile ? 'Mobile' : 'Desktop'}</div>
    }
    
    const Component2 = () => {
      const isMobile = useMobile()
      return <div data-testid="comp2">{isMobile ? 'Mobile' : 'Desktop'}</div>
    }
    
    const { getByTestId } = render(
      <div>
        <Component1 />
        <Component2 />
      </div>
    )
    
    expect(getByTestId('comp1')).toHaveTextContent('Mobile')
    expect(getByTestId('comp2')).toHaveTextContent('Mobile')
  })
})

describe('Hooks - useMobile - Edge Cases', () => {
  it('should handle null window object', () => {
    const originalWindow = global.window
    delete global.window
    
    const { result } = renderHook(() => useMobile())
    
    expect(result.current).toBe(false) // Should default to false
    
    global.window = originalWindow
  })

  it('should handle undefined matchMedia', () => {
    Object.defineProperty(window, 'matchMedia', {
      value: undefined,
      writable: true,
    })
    
    const { result } = renderHook(() => useMobile())
    
    expect(result.current).toBe(false)
  })

  it('should handle matchMedia throwing error', () => {
    Object.defineProperty(window, 'matchMedia', {
      value: () => {
        throw new Error('matchMedia not supported')
      },
      writable: true,
    })
    
    const { result } = renderHook(() => useMobile())
    
    expect(result.current).toBe(false)
  })

  it('should handle very narrow viewports', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query.includes('max-width') && (query.includes('320px') || query.includes('375px')),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
    
    const { result } = renderHook(() => useMobile())
    
    expect(result.current).toBe(true)
  })

  it('should handle very wide viewports', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query.includes('max-width') && query.includes('1920px'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
    
    const { result } = renderHook(() => useMobile())
    
    expect(result.current).toBe(false)
  })
})
