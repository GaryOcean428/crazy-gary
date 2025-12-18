import { useState, useEffect } from 'react'
import { useIsMobile, useIsTablet, useIsDesktop, useScreenSize, useWindowSize } from './use-mobile'

// Enhanced responsive value hook with more options
export function useResponsiveValue<T>(
  values: Partial<Record<string, T>>,
  defaultValue?: T
): T {
  const screenSize = useScreenSize()
  
  // Define breakpoint hierarchy
  const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4k'] as const
  const breakpointValues = breakpoints as any as string[]
  
  return useEffect(() => {
    // Find the largest breakpoint that has a defined value
    for (let i = breakpointValues.length - 1; i >= 0; i--) {
      const breakpoint = breakpointValues[i]
      if (values[breakpoint] !== undefined) {
        return values[breakpoint]
      }
    }
    
    // Return default or first value if no breakpoint matches
    return defaultValue ?? Object.values(values)[0]
  }, [values, screenSize, defaultValue])
}

// Hook for responsive class names
export function useResponsiveClass(
  classes: Partial<Record<string, string>>
): string {
  const screenSize = useScreenSize()
  
  return useEffect(() => {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4k'] as const
    
    // Find the largest breakpoint that has a defined class
    for (let i = breakpoints.length - 1; i >= 0; i--) {
      const breakpoint = breakpoints[i]
      if (classes[breakpoint]) {
        return classes[breakpoint]
      }
    }
    
    // Return default or empty string
    return classes.default ?? ''
  }, [classes, screenSize])
}

// Hook for responsive boolean logic
export function useResponsiveBoolean(
  conditions: Partial<Record<string, boolean>>
): boolean {
  const screenSize = useScreenSize()
  
  return useEffect(() => {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4k'] as const
    
    // Find the largest breakpoint that has a defined condition
    for (let i = breakpoints.length - 1; i >= 0; i--) {
      const breakpoint = breakpoints[i]
      if (conditions[breakpoint] !== undefined) {
        return conditions[breakpoint]
      }
    }
    
    return false
  }, [conditions, screenSize])
}

// Hook for responsive array/object filtering
export function useResponsiveFilter<T>(
  items: T[],
  filters: Partial<Record<string, (item: T) => boolean>>
): T[] {
  const screenSize = useScreenSize()
  
  return useEffect(() => {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4k'] as const
    
    // Find the largest breakpoint that has a defined filter
    for (let i = breakpoints.length - 1; i >= 0; i--) {
      const breakpoint = breakpoints[i]
      if (filters[breakpoint]) {
        return items.filter(filters[breakpoint]!)
      }
    }
    
    // Return all items if no filter matches
    return items
  }, [items, filters, screenSize])
}

// Hook for responsive theme values
export function useResponsiveTheme<T>(
  light: T,
  dark: T,
  highContrast?: T
): T {
  const [theme, setTheme] = useState<'light' | 'dark' | 'high-contrast'>('light')
  const prefersDark = usePrefersDarkMode()
  const prefersHighContrast = usePrefersHighContrast()
  
  useEffect(() => {
    if (prefersHighContrast) {
      setTheme('high-contrast')
    } else if (prefersDark) {
      setTheme('dark')
    } else {
      setTheme('light')
    }
  }, [prefersDark, prefersHighContrast])
  
  switch (theme) {
    case 'dark':
      return dark
    case 'high-contrast':
      return highContrast ?? dark
    default:
      return light
  }
}

// Hook for responsive animation preferences
export function useResponsiveAnimation(
  animations: Partial<Record<string, boolean>>
): boolean {
  const prefersReducedMotion = usePrefersReducedMotion()
  const isTouchDevice = useIsTouchDevice()
  
  return useEffect(() => {
    if (prefersReducedMotion) {
      return false
    }
    
    // Use touch-optimized animations on mobile
    if (isTouchDevice && animations.mobile !== undefined) {
      return animations.mobile
    }
    
    // Use hover-optimized animations on desktop
    if (!isTouchDevice && animations.desktop !== undefined) {
      return animations.desktop
    }
    
    // Return general setting or default
    return animations.default ?? true
  }, [animations, prefersReducedMotion, isTouchDevice])
}

// Hook for responsive layout configuration
export function useResponsiveLayout(
  configs: Partial<Record<string, {
    columns?: number
    gap?: string
    padding?: string
    fontSize?: string
  }>>
) {
  const screenSize = useScreenSize()
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  
  return useEffect(() => {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4k'] as const
    
    // Find the largest breakpoint that has a defined config
    for (let i = breakpoints.length - 1; i >= 0; i--) {
      const breakpoint = breakpoints[i]
      if (configs[breakpoint]) {
        return configs[breakpoint]
      }
    }
    
    // Return default config or empty object
    return configs.default ?? {
      columns: isMobile ? 1 : isTablet ? 2 : 3,
      gap: isMobile ? '1rem' : '1.5rem',
      padding: isMobile ? '1rem' : '2rem',
      fontSize: isMobile ? '0.875rem' : '1rem'
    }
  }, [configs, screenSize, isMobile, isTablet])
}

// Hook for responsive visibility
export function useResponsiveVisibility(
  visibility: Partial<Record<string, boolean>>
): boolean {
  const screenSize = useScreenSize()
  
  return useEffect(() => {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4k'] as const
    
    // Find the largest breakpoint that has a defined visibility
    for (let i = breakpoints.length - 1; i >= 0; i--) {
      const breakpoint = breakpoints[i]
      if (visibility[breakpoint] !== undefined) {
        return visibility[breakpoint]
      }
    }
    
    return true // Default to visible
  }, [visibility, screenSize])
}

// Hook for responsive content density
export function useResponsiveDensity(
  densities: Partial<Record<string, 'compact' | 'normal' | 'spacious'>>
): 'compact' | 'normal' | 'spacious' {
  const screenSize = useScreenSize()
  
  return useEffect(() => {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4k'] as const
    
    // Find the largest breakpoint that has a defined density
    for (let i = breakpoints.length - 1; i >= 0; i--) {
      const breakpoint = breakpoints[i]
      if (densities[breakpoint]) {
        return densities[breakpoint]
      }
    }
    
    // Return adaptive density based on screen size
    if (screenSize === 'xs' || screenSize === 'sm') {
      return 'compact'
    } else if (screenSize === 'xl' || screenSize === '2xl' || screenSize === '3xl' || screenSize === '4k') {
      return 'spacious'
    }
    
    return 'normal'
  }, [densities, screenSize])
}

// Hook for responsive performance optimization
export function useResponsivePerformance(
  settings: Partial<Record<string, {
    imageQuality?: number
    animationDuration?: number
    debounceMs?: number
    throttleMs?: number
    batchSize?: number
  }>>
) {
  const screenSize = useScreenSize()
  const isMobile = useIsMobile()
  
  return useEffect(() => {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4k'] as const
    
    // Find the largest breakpoint that has defined settings
    for (let i = breakpoints.length - 1; i >= 0; i--) {
      const breakpoint = breakpoints[i]
      if (settings[breakpoint]) {
        return settings[breakpoint]
      }
    }
    
    // Return adaptive settings based on device capability
    return {
      imageQuality: isMobile ? 0.7 : 0.9,
      animationDuration: isMobile ? 150 : 300,
      debounceMs: isMobile ? 100 : 50,
      throttleMs: isMobile ? 200 : 100,
      batchSize: isMobile ? 5 : 20
    }
  }, [settings, screenSize, isMobile])
}

// Hook for responsive accessibility
export function useResponsiveAccessibility(
  settings: Partial<Record<string, {
    focusIndicator?: boolean
    reducedMotion?: boolean
    highContrast?: boolean
    largeTouchTargets?: boolean
    keyboardNavigation?: boolean
  }>>
) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const prefersHighContrast = usePrefersHighContrast()
  const isTouchDevice = useIsTouchDevice()
  
  return useEffect(() => {
    // Always respect user preferences first
    const baseSettings = {
      focusIndicator: true,
      reducedMotion: prefersReducedMotion,
      highContrast: prefersHighContrast,
      largeTouchTargets: isTouchDevice,
      keyboardNavigation: true
    }
    
    // Apply responsive overrides
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4k'] as const
    
    for (let i = breakpoints.length - 1; i >= 0; i--) {
      const breakpoint = breakpoints[i]
      if (settings[breakpoint]) {
        return {
          ...baseSettings,
          ...settings[breakpoint]
        }
      }
    }
    
    return baseSettings
  }, [settings, prefersReducedMotion, prefersHighContrast, isTouchDevice])
}

// Hook for responsive data fetching
export function useResponsiveData<T>(
  fetchConfig: Partial<Record<string, {
    limit?: number
    pageSize?: number
    batchSize?: number
    cacheTime?: number
  }>>,
  deps: any[] = []
) {
  const screenSize = useScreenSize()
  
  return useEffect(() => {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4k'] as const
    
    // Find the largest breakpoint that has defined fetch config
    for (let i = breakpoints.length - 1; i >= 0; i--) {
      const breakpoint = breakpoints[i]
      if (fetchConfig[breakpoint]) {
        return fetchConfig[breakpoint]
      }
    }
    
    // Return adaptive config based on screen size
    return {
      limit: screenSize === 'xs' ? 10 : screenSize === 'sm' ? 20 : 50,
      pageSize: screenSize === 'xs' ? 5 : screenSize === 'sm' ? 10 : 20,
      batchSize: screenSize === 'xs' ? 5 : screenSize === 'sm' ? 10 : 25,
      cacheTime: 5 * 60 * 1000 // 5 minutes default
    }
  }, [fetchConfig, screenSize, ...deps])
}

// Hook for responsive media queries
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  
  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    
    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)
    
    return () => media.removeEventListener('change', listener)
  }, [query, matches])
  
  return matches
}

// Hook for high contrast preference
export function usePrefersHighContrast(): boolean {
  return useMediaQuery('(prefers-contrast: high)')
}

// Hook for forced colors preference (Windows High Contrast)
export function useForcedColors(): boolean {
  return useMediaQuery('(forced-colors: active)')
}

// Hook for color scheme preference
export function usePrefersColorScheme(): 'light' | 'dark' {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light')
  
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    setColorScheme(media.matches ? 'dark' : 'light')
    
    const listener = (e: MediaQueryListEvent) => {
      setColorScheme(e.matches ? 'dark' : 'light')
    }
    
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [])
  
  return colorScheme
}

// Enhanced exports
export {
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useScreenSize,
  useWindowSize,
  useIsTouchDevice,
  useOrientation,
  useIsLandscape,
  useIsPortrait,
  usePrefersReducedMotion,
  usePrefersDarkMode,
  useDeviceInfo
}