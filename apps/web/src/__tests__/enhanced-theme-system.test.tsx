import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, useTheme } from '@/components/theme-provider'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { ThemeValidationDashboard } from '@/components/theme-validation'
import { ThemeAwareIcon } from '@/components/theme-aware-icons'
import { ThemeValidator } from '@/components/theme-validation'
import { createThemeTokens } from '@/lib/theme-config'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock window.matchMedia
const mockMatchMedia = vi.fn()
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia
})

// Mock CSS custom properties
const mockStyle = {
  setProperty: vi.fn(),
  removeProperty: vi.fn(),
  transition: '',
  willChange: '',
}

const mockDocumentElement = {
  classList: {
    add: vi.fn(),
    remove: vi.fn(),
    contains: vi.fn(),
  },
  style: mockStyle,
}

Object.defineProperty(document, 'documentElement', {
  value: mockDocumentElement,
})

describe('Enhanced Theme System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('ThemeProvider', () => {
    it('should provide default theme configuration', () => {
      let themeContext: any

      function TestComponent() {
        themeContext = useTheme()
        return <div>Test</div>
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(themeContext.theme).toBe('system')
      expect(themeContext.config).toBeDefined()
      expect(themeContext.setTheme).toBeDefined()
      expect(themeContext.toggleTheme).toBeDefined()
    })

    it('should initialize with saved theme from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'crazy-gary-theme-mode') return 'dark'
        if (key === 'crazy-gary-theme-config') return JSON.stringify({
          transitions: { duration: 500 }
        })
        return null
      })

      let themeContext: any

      function TestComponent() {
        themeContext = useTheme()
        return <div>Test</div>
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(themeContext.theme).toBe('dark')
      expect(themeContext.config.transitions.duration).toBe(500)
    })

    it('should handle theme changes correctly', async () => {
      const user = userEvent.setup()
      
      let themeContext: any

      function TestComponent() {
        themeContext = useTheme()
        return (
          <button onClick={() => themeContext.setTheme('light')}>
            Change to Light
          </button>
        )
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(themeContext.theme).toBe('system')

      await user.click(screen.getByText('Change to Light'))

      expect(themeContext.theme).toBe('light')
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'crazy-gary-theme-mode', 
        'light'
      )
    })

    it('should toggle themes correctly', async () => {
      const user = userEvent.setup()
      
      let themeContext: any

      function TestComponent() {
        themeContext = useTheme()
        return (
          <button onClick={themeContext.toggleTheme}>
            Toggle Theme
          </button>
        )
      }

      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>
      )

      expect(themeContext.theme).toBe('light')

      await user.click(screen.getByText('Toggle Theme'))
      expect(themeContext.theme).toBe('dark')

      await user.click(screen.getByText('Toggle Theme'))
      expect(themeContext.theme).toBe('high-contrast')

      await user.click(screen.getByText('Toggle Theme'))
      expect(themeContext.theme).toBe('system')
    })

    it('should respect system theme changes', () => {
      const mockListener = vi.fn()
      const mockMediaQuery = {
        matches: false,
        addEventListener: mockListener,
        removeEventListener: vi.fn(),
      }
      mockMatchMedia.mockReturnValue(mockMediaQuery)

      let themeContext: any

      function TestComponent() {
        themeContext = useTheme()
        return <div>Test</div>
      }

      render(
        <ThemeProvider defaultTheme="system">
          <TestComponent />
        </ThemeProvider>
      )

      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)')

      // Simulate system theme change
      mockMediaQuery.matches = true
      fireEvent(mockMediaQuery, new Event('change'))

      // The theme should update to follow system preference
      expect(themeContext.systemTheme).toBe('dark')
    })
  })

  describe('ThemeSwitcher', () => {
    it('should render button variant correctly', () => {
      render(
        <ThemeProvider>
          <ThemeSwitcher variant="button" />
        </ThemeProvider>
      )

      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByLabelText(/Switch to.*theme/)).toBeInTheDocument()
    })

    it('should render dropdown variant correctly', async () => {
      const user = userEvent.setup()
      
      render(
        <ThemeProvider>
          <ThemeSwitcher variant="dropdown" />
        </ThemeProvider>
      )

      await user.click(screen.getByRole('button'))
      
      expect(screen.getByText('Choose Theme')).toBeInTheDocument()
      expect(screen.getByText('Light')).toBeInTheDocument()
      expect(screen.getByText('Dark')).toBeInTheDocument()
      expect(screen.getByText('High Contrast')).toBeInTheDocument()
      expect(screen.getByText('System')).toBeInTheDocument()
    })

    it('should render card variant correctly', () => {
      render(
        <ThemeProvider>
          <ThemeSwitcher variant="card" />
        </ThemeProvider>
      )

      expect(screen.getByText('Theme Selection')).toBeInTheDocument()
      expect(screen.getByText('Light')).toBeInTheDocument()
      expect(screen.getByText('Dark')).toBeInTheDocument()
      expect(screen.getByText('High Contrast')).toBeInTheDocument()
      expect(screen.getByText('System')).toBeInTheDocument()
    })

    it('should render floating variant correctly', () => {
      render(
        <ThemeProvider>
          <ThemeSwitcher variant="floating" />
        </ThemeProvider>
      )

      // Floating variant renders as fixed positioned element
      const floatingElement = document.querySelector('.fixed.bottom-4.right-4')
      expect(floatingElement).toBeInTheDocument()
    })

    it('should handle theme selection', async () => {
      const user = userEvent.setup()
      
      render(
        <ThemeProvider>
          <ThemeSwitcher variant="dropdown" showLabels={true} />
        </ThemeProvider>
      )

      await user.click(screen.getByRole('button'))
      await user.click(screen.getByText('Dark'))

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'crazy-gary-theme-mode',
        'dark'
      )
    })

    it('should show loading state during transitions', async () => {
      const user = userEvent.setup()
      
      let isTransitioning = false
      vi.spyOn(React, 'useState').mockReturnValue([true, vi.fn()])
      
      render(
        <ThemeProvider>
          <ThemeSwitcher variant="button" />
        </ThemeProvider>
      )

      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  describe('ThemeAwareIcon', () => {
    it('should render with automatic theme detection', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeAwareIcon>
            <svg data-testid="icon">Icon</svg>
          </ThemeAwareIcon>
        </ThemeProvider>
      )

      expect(screen.getByTestId('icon')).toBeInTheDocument()
    })

    it('should render different icons for different themes', () => {
      const SunIcon = () => <svg data-testid="sun-icon">Sun</svg>
      const MoonIcon = () => <svg data-testid="moon-icon">Moon</svg>
      
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeAwareIcon
            lightIcon={SunIcon}
            darkIcon={MoonIcon}
            variant="manual"
          >
            <svg data-testid="default-icon">Default</svg>
          </ThemeAwareIcon>
        </ThemeProvider>
      )

      // Should render the light theme icon
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
      expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument()
    })

    it('should apply theme-aware styling', () => {
      render(
        <ThemeProvider defaultTheme="high-contrast">
          <ThemeAwareIcon className="custom-class">
            <svg>Icon</svg>
          </ThemeAwareIcon>
        </ThemeProvider>
      )

      const icon = screen.getByRole('img', { hidden: true })
      expect(icon.closest('.theme-transition')).toBeInTheDocument()
      expect(icon.closest('.font-bold')).toBeInTheDocument()
    })
  })

  describe('ThemeValidator', () => {
    const mockTokens = createThemeTokens('light')

    it('should calculate contrast ratios correctly', () => {
      const ratio = ThemeValidator.getContrastRatio('#000000', '#ffffff')
      expect(ratio).toBeCloseTo(21, 1) // Maximum contrast ratio
    })

    it('should validate contrast requirements', () => {
      const result = ThemeValidator.validateContrast(mockTokens)
      
      expect(result).toHaveProperty('passed')
      expect(result).toHaveProperty('issues')
      expect(result).toHaveProperty('score')
      expect(typeof result.score).toBe('number')
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
    })

    it('should validate color harmony', () => {
      const result = ThemeValidator.validateColorHarmony(mockTokens)
      
      expect(result).toHaveProperty('passed')
      expect(result).toHaveProperty('issues')
      expect(result).toHaveProperty('score')
      expect(Array.isArray(result.issues)).toBe(true)
    })

    it('should validate theme consistency', () => {
      const result = ThemeValidator.validateThemeConsistency(mockTokens)
      
      expect(result).toHaveProperty('passed')
      expect(result).toHaveProperty('issues')
      expect(result).toHaveProperty('score')
    })

    it('should generate comprehensive validation report', () => {
      const report = ThemeValidator.generateValidationReport(mockTokens)
      
      expect(report).toHaveProperty('overall')
      expect(report).toHaveProperty('contrast')
      expect(report).toHaveProperty('harmony')
      expect(report).toHaveProperty('consistency')
      expect(report).toHaveProperty('summary')
      
      expect(report.overall).toHaveProperty('score')
      expect(report.overall).toHaveProperty('passed')
    })
  })

  describe('Theme Configuration', () => {
    it('should create theme tokens for all theme modes', () => {
      const lightTokens = createThemeTokens('light')
      const darkTokens = createThemeTokens('dark')
      const highContrastTokens = createThemeTokens('high-contrast')

      expect(lightTokens).toBeDefined()
      expect(darkTokens).toBeDefined()
      expect(highContrastTokens).toBeDefined()

      expect(lightTokens.colors).toHaveProperty('background')
      expect(darkTokens.colors).toHaveProperty('background')
      expect(highContrastTokens.colors).toHaveProperty('background')
    })

    it('should have consistent structure across themes', () => {
      const themes: Array<'light' | 'dark' | 'high-contrast'> = ['light', 'dark', 'high-contrast']
      
      themes.forEach(theme => {
        const tokens = createThemeTokens(theme)
        
        expect(tokens).toHaveProperty('colors')
        expect(tokens).toHaveProperty('gradients')
        expect(tokens).toHaveProperty('shadows')
        expect(tokens).toHaveProperty('borderRadius')
        expect(tokens).toHaveProperty('spacing')
        expect(tokens).toHaveProperty('typography')
        expect(tokens).toHaveProperty('animation')
      })
    })
  })

  describe('CSS Integration', () => {
    it('should generate CSS variables correctly', () => {
      const tokens = createThemeTokens('light')
      const cssVars = require('@/lib/theme-config').generateCSSVariables(tokens)
      
      expect(cssVars).toHaveProperty('--background')
      expect(cssVars).toHaveProperty('--foreground')
      expect(cssVars).toHaveProperty('--primary')
      expect(cssVars['--background']).toMatch(/oklch\(/)
    })
  })

  describe('Accessibility', () => {
    it('should respect reduced motion preferences', () => {
      mockMatchMedia.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })

      let themeContext: any

      function TestComponent() {
        themeContext = useTheme()
        return <div>Test</div>
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
    })

    it('should provide keyboard navigation support', async () => {
      const user = userEvent.setup()
      
      render(
        <ThemeProvider>
          <ThemeSwitcher variant="dropdown" />
        </ThemeProvider>
      )

      const button = screen.getByRole('button')
      
      await user.click(button)
      expect(screen.getByText('Choose Theme')).toBeInTheDocument()
      
      // Should be able to navigate with keyboard
      await user.tab()
      await user.tab()
      
      // Theme options should be focusable
      const lightOption = screen.getByText('Light')
      expect(lightOption).toBeInTheDocument()
    })

    it('should validate high contrast accessibility', () => {
      const tokens = createThemeTokens('high-contrast')
      const report = ThemeValidator.generateValidationReport(tokens)
      
      // High contrast should have high accessibility scores
      expect(report.contrast.score).toBeGreaterThanOrEqual(85)
      expect(report.overall.score).toBeGreaterThanOrEqual(80)
    })
  })

  describe('Performance', () => {
    it('should handle theme transitions efficiently', async () => {
      const user = userEvent.setup()
      
      render(
        <ThemeProvider enableTransitions={true}>
          <ThemeSwitcher variant="button" />
        </ThemeProvider>
      )

      const button = screen.getByRole('button')
      await user.click(button)

      // Should add transition styles
      expect(mockStyle.transition).toContain('all')
      expect(mockStyle.willChange).toContain('background-color')
    })

    it('should clean up transition timers', () => {
      const clearTimeoutMock = vi.fn()
      global.clearTimeout = clearTimeoutMock

      let themeContext: any

      function TestComponent() {
        themeContext = useTheme()
        return <div>Test</div>
      }

      const { unmount } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      unmount()

      // Transition timeout should be cleared on unmount
      expect(clearTimeoutMock).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid theme values gracefully', () => {
      let themeContext: any

      function TestComponent() {
        themeContext = useTheme()
        return (
          <button onClick={() => themeContext.setTheme('invalid-theme')}>
            Invalid Theme
          </button>
        )
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(() => {
        fireEvent.click(screen.getByText('Invalid Theme'))
      }).not.toThrow()
    })

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage not available')
      })

      expect(() => {
        render(
          <ThemeProvider>
            <div>Test</div>
          </ThemeProvider>
        )
      }).not.toThrow()
    })

    it('should validate theme accessibility', () => {
      const tokens = createThemeTokens('light')
      const isValid = ThemeValidator.validateThemeAccessibility(tokens)
      
      expect(typeof isValid).toBe('boolean')
    })
  })

  describe('Browser Compatibility', () => {
    it('should work without CSS custom properties support', () => {
      // Mock lack of CSS custom properties support
      const originalSetProperty = mockStyle.setProperty
      mockStyle.setProperty = vi.fn(() => {
        throw new Error('CSS custom properties not supported')
      })

      expect(() => {
        render(
          <ThemeProvider>
            <div>Test</div>
          </ThemeProvider>
        )
      }).not.toThrow()

      // Restore original function
      mockStyle.setProperty = originalSetProperty
    })

    it('should handle matchMedia not being available', () => {
      Object.defineProperty(window, 'matchMedia', {
        value: undefined,
        writable: true,
      })

      let themeContext: any

      function TestComponent() {
        themeContext = useTheme()
        return <div>Test</div>
      }

      expect(() => {
        render(
          <ThemeProvider>
            <TestComponent />
          </ThemeProvider>
        )
      }).not.toThrow()

      // Should default to light theme when matchMedia is not available
      expect(themeContext.systemTheme).toBe('light')
    })
  })
})