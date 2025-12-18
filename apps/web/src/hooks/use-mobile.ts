import * as React from "react"

// Enhanced breakpoint system
const BREAKPOINTS = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 1920,
  '4k': 2560,
} as const

type Breakpoint = keyof typeof BREAKPOINTS

// Hook for checking if device is mobile (below md breakpoint)
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS.md - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.md)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < BREAKPOINTS.md)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

// Hook for checking if device is tablet (between md and lg breakpoints)
export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`)
    const onChange = () => {
      const width = window.innerWidth
      setIsTablet(width >= BREAKPOINTS.md && width < BREAKPOINTS.lg)
    }
    mql.addEventListener("change", onChange)
    const width = window.innerWidth
    setIsTablet(width >= BREAKPOINTS.md && width < BREAKPOINTS.lg)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isTablet
}

// Hook for checking if device is desktop (above lg breakpoint)
export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${BREAKPOINTS.lg}px)`)
    const onChange = () => {
      setIsDesktop(window.innerWidth >= BREAKPOINTS.lg)
    }
    mql.addEventListener("change", onChange)
    setIsDesktop(window.innerWidth >= BREAKPOINTS.lg)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isDesktop
}

// Hook for getting current screen size category
export function useScreenSize() {
  const [screenSize, setScreenSize] = React.useState<Breakpoint>('sm')

  React.useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth
      
      if (width < BREAKPOINTS.xs) setScreenSize('xs')
      else if (width < BREAKPOINTS.sm) setScreenSize('sm')
      else if (width < BREAKPOINTS.md) setScreenSize('md')
      else if (width < BREAKPOINTS.lg) setScreenSize('lg')
      else if (width < BREAKPOINTS.xl) setScreenSize('xl')
      else if (width < BREAKPOINTS['2xl']) setScreenSize('2xl')
      else if (width < BREAKPOINTS['3xl']) setScreenSize('3xl')
      else setScreenSize('4k')
    }

    updateScreenSize()
    
    const mediaQueries = Object.entries(BREAKPOINTS).map(([name, breakpoint]) => {
      const query = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
      query.addEventListener('change', updateScreenSize)
      return query
    })

    return () => {
      mediaQueries.forEach(query => query.removeEventListener('change', updateScreenSize))
    }
  }, [])

  return screenSize
}

// Hook for checking if device supports touch
export function useIsTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = React.useState(false)

  React.useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }

    checkTouch()
  }, [])

  return isTouchDevice
}

// Hook for checking device orientation
export function useOrientation() {
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('portrait')

  React.useEffect(() => {
    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    checkOrientation()
    
    window.addEventListener('resize', checkOrientation)
    return () => window.removeEventListener('resize', checkOrientation)
  }, [])

  return orientation
}

// Hook for checking if device is in landscape mode
export function useIsLandscape() {
  const orientation = useOrientation()
  return orientation === 'landscape'
}

// Hook for checking if device is in portrait mode
export function useIsPortrait() {
  const orientation = useOrientation()
  return orientation === 'portrait'
}

// Hook for responsive value based on breakpoints
export function useResponsiveValue<T>(values: Partial<Record<Breakpoint, T>>) {
  const screenSize = useScreenSize()
  
  return React.useMemo(() => {
    const sortedBreakpoints = Object.keys(BREAKPOINTS).sort((a, b) => 
      BREAKPOINTS[a as Breakpoint] - BREAKPOINTS[b as Breakpoint]
    )
    
    for (let i = sortedBreakpoints.length - 1; i >= 0; i--) {
      const breakpoint = sortedBreakpoints[i] as Breakpoint
      if (BREAKPOINTS[breakpoint] <= BREAKPOINTS[screenSize] && values[breakpoint] !== undefined) {
        return values[breakpoint]!
      }
    }
    
    // Return the smallest defined value as fallback
    const firstValue = Object.values(values)[0]
    return firstValue
  }, [values, screenSize])
}

// Hook for checking if device prefers reduced motion
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return prefersReducedMotion
}

// Hook for checking if device is in dark mode
export function usePrefersDarkMode() {
  const [prefersDarkMode, setPrefersDarkMode] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setPrefersDarkMode(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => {
      setPrefersDarkMode(event.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return prefersDarkMode
}

// Hook for window dimensions with throttling
export function useWindowSize(throttleMs = 100) {
  const [windowSize, setWindowSize] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  React.useEffect(() => {
    let ticking = false

    const updateSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
      ticking = false
    }

    const handleResize = () => {
      if (!ticking) {
        requestAnimationFrame(updateSize)
        ticking = true
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [throttleMs])

  return windowSize
}

// Composite hook for comprehensive device detection
export function useDeviceInfo() {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const isDesktop = useIsDesktop()
  const isTouchDevice = useIsTouchDevice()
  const orientation = useOrientation()
  const screenSize = useScreenSize()
  const prefersReducedMotion = usePrefersReducedMotion()
  const prefersDarkMode = usePrefersDarkMode()
  const windowSize = useWindowSize()

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    orientation,
    screenSize,
    prefersReducedMotion,
    prefersDarkMode,
    windowSize,
    isLandscape: orientation === 'landscape',
    isPortrait: orientation === 'portrait',
  }
}
