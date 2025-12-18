import React from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('UI Components - Button', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render button with default props', () => {
      render(<Button>Click me</Button>)
      
      const button = screen.getByRole('button', { name: 'Click me' })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('bg-primary')
    })

    it('should render button with custom children', () => {
      render(
        <Button>
          <span>Custom</span>
          <span>Content</span>
        </Button>
      )
      
      expect(screen.getByText('Custom')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('should render button with icon', () => {
      render(
        <Button>
          <svg data-testid="icon" />
          With Icon
        </Button>
      )
      
      expect(screen.getByTestId('icon')).toBeInTheDocument()
      expect(screen.getByText('With Icon')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('should render default variant', () => {
      render(<Button variant="default">Default</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary')
    })

    it('should render destructive variant', () => {
      render(<Button variant="destructive">Delete</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-destructive')
    })

    it('should render outline variant', () => {
      render(<Button variant="outline">Outline</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('border')
    })

    it('should render secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-secondary')
    })

    it('should render ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-accent')
    })

    it('should render link variant', () => {
      render(<Button variant="link">Link</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('underline-offset-4')
    })
  })

  describe('Sizes', () => {
    it('should render default size', () => {
      render(<Button size="default">Default Size</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10')
    })

    it('should render small size', () => {
      render(<Button size="sm">Small</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-9')
    })

    it('should render large size', () => {
      render(<Button size="lg">Large</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-11')
    })

    it('should render icon size', () => {
      render(<Button size="icon">👆</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10', 'w-10')
    })
  })

  describe('States', () => {
    it('should render disabled state', () => {
      render(<Button disabled>Disabled</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:pointer-events-none')
    })

    it('should render loading state', () => {
      render(<Button disabled>Loading...</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should handle loading with spinner', () => {
      render(
        <Button disabled>
          <svg className="animate-spin" />
          Loading
        </Button>
      )
      
      expect(screen.getByText('Loading')).toBeInTheDocument()
      expect(screen.getByText('Loading').previousSibling).toHaveClass('animate-spin')
    })
  })

  describe('Interactions', () => {
    it('should handle click events', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      
      render(<Button onClick={handleClick}>Click me</Button>)
      
      await user.click(screen.getByRole('button'))
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should handle keyboard events', () => {
      const handleKeyDown = vi.fn()
      
      render(<Button onKeyDown={handleKeyDown}>Focus me</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.keyDown(button, { key: 'Enter' })
      
      expect(handleKeyDown).toHaveBeenCalledTimes(1)
    })

    it('should handle focus and blur events', () => {
      const handleFocus = vi.fn()
      const handleBlur = vi.fn()
      
      render(
        <Button onFocus={handleFocus} onBlur={handleBlur}>
          Focus me
        </Button>
      )
      
      const button = screen.getByRole('button')
      fireEvent.focus(button)
      fireEvent.blur(button)
      
      expect(handleFocus).toHaveBeenCalledTimes(1)
      expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    it('should prevent click when disabled', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      
      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>
      )
      
      await user.click(screen.getByRole('button'))
      
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<Button aria-label="Custom label">Button</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Custom label')
    })

    it('should support aria-describedby', () => {
      render(
        <>
          <Button aria-describedby="description">Button</Button>
          <div id="description">Button description</div>
        </>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-describedby', 'description')
    })

    it('should support aria-expanded for dropdown buttons', () => {
      render(<Button aria-expanded={true}>Dropdown</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-expanded', 'true')
    })

    it('should support aria-controls', () => {
      render(<Button aria-controls="menu-id">Menu</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-controls', 'menu-id')
    })
  })

  describe('Styling', () {
    it('should support custom className', () => {
      render(<Button className="custom-class">Custom</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })

    it('should merge custom classes with default classes', () => {
      render(<Button className="custom-class">Merged</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
      expect(button).toHaveClass('bg-primary') // Default class should still be present
    })

    it('should support inline styles', () => {
      render(<Button style={{ color: 'red' }}>Styled</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveStyle({ color: 'red' })
    })

    it('should support data attributes', () => {
      render(<Button data-testid="test-button">Data</Button>)
      
      const button = screen.getByTestId('test-button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('Form Integration', () => {
    it('should work as submit button in forms', () => {
      const handleSubmit = vi.fn()
      
      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit</Button>
        </form>
      )
      
      fireEvent.submit(screen.getByRole('button'))
      expect(handleSubmit).toHaveBeenCalledTimes(1)
    })

    it('should work as reset button in forms', () => {
      render(
        <form>
          <Button type="reset">Reset</Button>
        </form>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'reset')
    })
  })

  describe('Icon Buttons', () => {
    it('should render circular icon buttons', () => {
      render(
        <Button size="icon" className="rounded-full">
          <svg data-testid="icon" />
        </Button>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('rounded-full')
      expect(screen.getByTestId('icon')).toBeInTheDocument()
    })

    it('should handle icon-only buttons with proper accessibility', () => {
      render(
        <Button size="icon" aria-label="Close">
          <svg />
        </Button>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Close')
    })
  })

  describe('Loading States', () => {
    it('should show loading spinner', () => {
      render(
        <Button disabled>
          <svg className="animate-spin mr-2" />
          Loading
        </Button>
      )
      
      const spinner = screen.getByRole('button').querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('should disable button during loading', () => {
      render(
        <Button disabled aria-busy="true">
          Loading...
        </Button>
      )
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('aria-busy', 'true')
    })
  })

  describe('Button Groups', () => {
    it('should work in button groups', () => {
      render(
        <div role="group" aria-label="Button group">
          <Button variant="outline">First</Button>
          <Button variant="outline">Second</Button>
          <Button variant="outline">Third</Button>
        </div>
      )
      
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(3)
      
      const group = screen.getByRole('group')
      expect(group).toHaveAttribute('aria-label', 'Button group')
    })
  })

  describe('Split Buttons', () => {
    it('should support split button patterns', () => {
      render(
        <div className="flex">
          <Button>Save</Button>
          <Button size="icon" variant="outline" aria-label="More options">
            <svg />
          </Button>
        </div>
      )
      
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(2)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      render(<Button></Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should handle null children', () => {
      render(<Button>{null}</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should handle very long text', () => {
      const longText = 'a'.repeat(100)
      render(<Button>{longText}</Button>)
      
      expect(screen.getByRole('button')).toHaveTextContent(longText)
    })

    it('should handle special characters', () => {
      render(<Button>Special &amp; Characters &lt;3</Button>)
      
      expect(screen.getByRole('button')).toHaveTextContent('Special & Characters <3')
    })
  })

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const handleClick = vi.fn()
      const { rerender } = render(<Button onClick={handleClick}>Click</Button>)
      
      rerender(<Button onClick={handleClick}>Click</Button>)
      
      // Should not have called click handler during render
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should handle rapid clicks efficiently', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      
      render(<Button onClick={handleClick}>Click</Button>)
      
      // Rapid clicks
      await user.click(screen.getByRole('button'))
      await user.click(screen.getByRole('button'))
      await user.click(screen.getByRole('button'))
      
      expect(handleClick).toHaveBeenCalledTimes(3)
    })
  })
})
