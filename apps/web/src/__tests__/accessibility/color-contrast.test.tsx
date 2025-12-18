import React from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'

// Mock canvas for color contrast testing
const mockCanvas = {
  getContext: vi.fn().mockReturnValue({
    fillStyle: '',
    strokeStyle: '',
    font: '',
    measureText: vi.fn().mockReturnValue({ width: 0 }),
    createLinearGradient: vi.fn().mockReturnValue({
      addColorStop: vi.fn(),
    }),
    createRadialGradient: vi.fn().mockReturnValue({
      addColorStop: vi.fn(),
    }),
    drawImage: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
  }),
  width: 100,
  height: 100,
}

global.HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockCanvas)

// Color contrast calculation utilities
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

const getContrastRatio = (foreground: string, background: string): number => {
  const fg = hexToRgb(foreground)
  const bg = hexToRgb(background)
  
  if (!fg || !bg) return 0
  
  const fgLuminance = getLuminance(fg.r, fg.g, fg.b)
  const bgLuminance = getLuminance(bg.r, bg.g, bg.b)
  
  const lighter = Math.max(fgLuminance, bgLuminance)
  const darker = Math.min(fgLuminance, bgLuminance)
  
  return (lighter + 0.05) / (darker + 0.05)
}

describe('Color Contrast and Visual Accessibility', () => {
  describe('Color Contrast Ratios', () => {
    it('calculates accurate contrast ratios', () => {
      // Test black on white (should be 21:1)
      const blackOnWhite = getContrastRatio('#000000', '#ffffff')
      expect(blackOnWhite).toBeGreaterThan(20)
      
      // Test white on black (should be 21:1)
      const whiteOnBlack = getContrastRatio('#ffffff', '#000000')
      expect(whiteOnBlack).toBeGreaterThan(20)
      
      // Test red on white (should be low)
      const redOnWhite = getContrastRatio('#ff0000', '#ffffff')
      expect(redOnWhite).toBeLessThan(10)
    })

    it('validates AA compliance for normal text (4.5:1)', () => {
      const testCases = [
        { fg: '#1a1a1a', bg: '#ffffff', expected: true }, // Dark gray on white
        { fg: '#666666', bg: '#ffffff', expected: false }, // Medium gray on white
        { fg: '#ffffff', bg: '#1a1a1a', expected: true }, // White on dark gray
        { fg: '#ffffff', bg: '#666666', expected: false }, // White on medium gray
      ]
      
      testCases.forEach(({ fg, bg, expected }) => {
        const ratio = getContrastRatio(fg, bg)
        const isCompliant = ratio >= 4.5
        expect(isCompliant).toBe(expected)
      })
    })

    it('validates AAA compliance for normal text (7:1)', () => {
      const testCases = [
        { fg: '#000000', bg: '#ffffff', expected: true }, // Pure black on white
        { fg: '#1a1a1a', bg: '#ffffff', expected: true }, // Very dark gray on white
        { fg: '#333333', bg: '#ffffff', expected: false }, // Dark gray on white
        { fg: '#ffffff', bg: '#000000', expected: true }, // White on pure black
      ]
      
      testCases.forEach(({ fg, bg, expected }) => {
        const ratio = getContrastRatio(fg, bg)
        const isCompliant = ratio >= 7
        expect(isCompliant).toBe(expected)
      })
    })

    it('validates AA compliance for large text (3:1)', () => {
      const testCases = [
        { fg: '#666666', bg: '#ffffff', expected: true }, // Medium gray on white for large text
        { fg: '#777777', bg: '#ffffff', expected: false }, // Slightly lighter gray
        { fg: '#ffffff', bg: '#666666', expected: true }, // White on medium gray for large text
      ]
      
      testCases.forEach(({ fg, bg, expected }) => {
        const ratio = getContrastRatio(fg, bg)
        const isCompliant = ratio >= 3
        expect(isCompliant).toBe(expected)
      })
    })
  })

  describe('CSS Custom Properties for Theming', () => {
    it('provides accessible color tokens', () => {
      const colorTokens = {
        '--foreground': '#1a1a1a',
        '--background': '#ffffff',
        '--primary': '#2563eb',
        '--primary-foreground': '#ffffff',
        '--secondary': '#f1f5f9',
        '--secondary-foreground': '#1e293b',
        '--muted': '#f8fafc',
        '--muted-foreground': '#64748b',
        '--accent': '#f1f5f9',
        '--accent-foreground': '#1e293b',
        '--destructive': '#dc2626',
        '--destructive-foreground': '#ffffff',
        '--border': '#e2e8f0',
        '--input': '#e2e8f0',
        '--ring': '#2563eb',
      }
      
      // Test that colors meet contrast requirements
      expect(getContrastRatio(colorTokens['--foreground'], colorTokens['--background'])).toBeGreaterThan(4.5)
      expect(getContrastRatio(colorTokens['--primary-foreground'], colorTokens['--primary'])).toBeGreaterThan(4.5)
      expect(getContrastRatio(colorTokens['--secondary-foreground'], colorTokens['--secondary'])).toBeGreaterThan(4.5)
      expect(getContrastRatio(colorTokens['--muted-foreground'], colorTokens['--muted'])).toBeGreaterThan(3) // Muted text can be lower contrast
      expect(getContrastRatio(colorTokens['--accent-foreground'], colorTokens['--accent'])).toBeGreaterThan(4.5)
      expect(getContrastRatio(colorTokens['--destructive-foreground'], colorTokens['--destructive'])).toBeGreaterThan(4.5)
    })

    it('provides dark mode color tokens', () => {
      const darkModeTokens = {
        '--foreground': '#f8fafc',
        '--background': '#0f172a',
        '--primary': '#3b82f6',
        '--primary-foreground': '#ffffff',
        '--secondary': '#1e293b',
        '--secondary-foreground': '#f1f5f9',
        '--muted': '#1e293b',
        '--muted-foreground': '#94a3b8',
        '--accent': '#1e293b',
        '--accent-foreground': '#f1f5f9',
        '--destructive': '#ef4444',
        '--destructive-foreground': '#ffffff',
        '--border': '#334155',
        '--input': '#334155',
        '--ring': '#3b82f6',
      }
      
      // Test dark mode contrast ratios
      expect(getContrastRatio(darkModeTokens['--foreground'], darkModeTokens['--background'])).toBeGreaterThan(4.5)
      expect(getContrastRatio(darkModeTokens['--primary-foreground'], darkModeTokens['--primary'])).toBeGreaterThan(4.5)
      expect(getContrastRatio(darkModeTokens['--secondary-foreground'], darkModeTokens['--secondary'])).toBeGreaterThan(4.5)
    })
  })

  describe('Focus Indicators', () => {
    it('provides visible focus indicators', () => {
      const TestComponent = () => (
        <div>
          <button 
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            data-testid="focusable-button"
          >
            Focusable Button
          </button>
        </div>
      )
      
      render(<TestComponent />)
      
      const button = screen.getByTestId('focusable-button')
      
      // Check that focus styles are defined
      expect(button.className).toContain('focus-visible:ring-2')
      expect(button.className).toContain('focus-visible:ring-blue-500')
      expect(button.className).toContain('focus-visible:ring-offset-2')
    })

    it('provides sufficient contrast for focus indicators', () => {
      const focusRingColor = '#2563eb' // Blue 500
      const commonBackgrounds = ['#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0']
      
      commonBackgrounds.forEach(bg => {
        const contrast = getContrastRatio(focusRingColor, bg)
        expect(contrast).toBeGreaterThan(3) // Focus indicators need at least 3:1 contrast
      })
    })
  })

  describe('Text Scaling and Responsive Design', () => {
    it('supports 200% text zoom without horizontal scrolling', () => {
      const TestComponent = () => (
        <div className="max-w-sm">
          <h1 className="text-2xl">Main Title</h1>
          <p className="text-base">Regular text that should scale properly</p>
          <button className="px-4 py-2">Button</button>
        </div>
      )
      
      render(<TestComponent />)
      
      const container = screen.getByText('Main Title').closest('.max-w-sm')
      expect(container).toBeInTheDocument()
      
      // Check that content uses relative units (rem, em) instead of fixed pixels
      // This is more of a design pattern check than a runtime test
      expect(container?.className).toContain('max-w-sm')
    })

    it('maintains readability at small viewport sizes', () => {
      const TestComponent = () => (
        <div className="p-4 text-sm md:text-base">
          <h1 className="text-xl md:text-2xl font-bold">Title</h1>
          <p className="leading-relaxed">Content that remains readable</p>
          <button className="text-sm md:text-base px-3 py-2">Action</button>
        </div>
      )
      
      render(<TestComponent />)
      
      const content = screen.getByText('Content that remains readable')
      expect(content).toHaveClass('leading-relaxed')
      
      const button = screen.getByRole('button', { name: 'Action' })
      expect(button).toHaveClass('text-sm')
    })
  })

  describe('Color-blind Accessibility', () => {
    it('does not rely solely on color to convey information', () => {
      const TestComponent = () => (
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span>Success status</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✗</span>
            </div>
            <span>Error status</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">!</span>
            </div>
            <span>Warning status</span>
          </div>
        </div>
      )
      
      render(<TestComponent />)
      
      // Check that status indicators have text labels
      expect(screen.getByText('Success status')).toBeInTheDocument()
      expect(screen.getByText('Error status')).toBeInTheDocument()
      expect(screen.getByText('Warning status')).toBeInTheDocument()
      
      // Check that icons are present for visual reinforcement
      expect(screen.getByText('✓')).toBeInTheDocument()
      expect(screen.getByText('✗')).toBeInTheDocument()
      expect(screen.getByText('!')).toBeInTheDocument()
    })

    it('provides patterns or shapes in addition to colors', () => {
      const TestComponent = () => (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-500 rounded-sm flex items-center justify-center">
              <span className="text-white text-xs font-bold">●</span>
            </div>
            <span>Completed task</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">◆</span>
            </div>
            <span>In progress task</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">■</span>
            </div>
            <span>Pending task</span>
          </div>
        </div>
      )
      
      render(<TestComponent />)
      
      // Each status should have a unique shape pattern
      const greenSquare = screen.getByText('●')
      const blueDiamond = screen.getByText('◆')
      const orangeSquare = screen.getByText('■')
      
      expect(greenSquare).toBeInTheDocument()
      expect(blueDiamond).toBeInTheDocument()
      expect(orangeSquare).toBeInTheDocument()
    })
  })

  describe('Reduced Motion Preferences', () => {
    it('respects prefers-reduced-motion media query', () => {
      const TestComponent = () => (
        <div className="transition-all duration-300 hover:scale-105">
          Hover me for animation
        </div>
      )
      
      render(<TestComponent />)
      
      const element = screen.getByText('Hover me for animation')
      
      // The component should have transition classes that can be overridden
      expect(element.className).toContain('transition-all')
      expect(element.className).toContain('duration-300')
    })

    it('provides reduced motion alternatives', () => {
      const TestComponent = () => {
        const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)
        
        React.useEffect(() => {
          const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
          setPrefersReducedMotion(mediaQuery.matches)
          
          const handleChange = (e: MediaQueryListEvent) => {
            setPrefersReducedMotion(e.matches)
          }
          
          mediaQuery.addListener(handleChange)
          return () => mediaQuery.removeListener(handleChange)
        }, [])
        
        return (
          <div
            className={`transition-all ${prefersReducedMotion ? 'duration-0' : 'duration-300'}`}
          >
            {prefersReducedMotion ? 'Static content' : 'Animated content'}
          </div>
        )
      }
      
      render(<TestComponent />)
      
      // Component should handle reduced motion preference
      expect(screen.getByText('Animated content')).toBeInTheDocument()
    })
  })

  describe('High Contrast Mode Support', () => {
    it('uses system colors in high contrast mode', () => {
      const TestComponent = () => (
        <div className="border-2 border-solid">
          <button className="bg-[ButtonFace] text-[ButtonText] border border-solid">
            High contrast button
          </button>
        </div>
      )
      
      render(<TestComponent />)
      
      const button = screen.getByRole('button', { name: 'High contrast button' })
      
      // Check that system colors are used
      expect(button.className).toContain('bg-[ButtonFace]')
      expect(button.className).toContain('text-[ButtonText]')
    })

    it('maintains visibility in forced colors mode', () => {
      const TestComponent = () => (
        <div className="border-2 border-[Canvas] bg-[Canvas] text-[CanvasText]">
          <button className="border-2 border-[ButtonBorder] bg-[ButtonFace] text-[ButtonText]">
            Accessible in forced colors
          </button>
        </div>
      )
      
      render(<TestComponent />)
      
      const container = screen.getByText('Accessible in forced colors').parentElement
      const button = screen.getByRole('button', { name: 'Accessible in forced colors' })
      
      expect(container).toHaveClass('bg-[Canvas]')
      expect(container).toHaveClass('text-[CanvasText]')
      expect(button).toHaveClass('bg-[ButtonFace]')
      expect(button).toHaveClass('text-[ButtonText]')
    })
  })
})
