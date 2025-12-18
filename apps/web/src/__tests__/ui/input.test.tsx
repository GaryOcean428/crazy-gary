import React from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/input'

describe('UI Components - Input', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render input with default props', () => {
      render(<Input placeholder="Enter text" />)
      
      const input = screen.getByPlaceholderText('Enter text')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'text')
    })

    it('should render input with custom type', () => {
      render(<Input type="email" placeholder="Email" />)
      
      const input = screen.getByPlaceholderText('Email')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('should render input with value', () => {
      render(<Input value="test value" readOnly />)
      
      const input = screen.getByDisplayValue('test value')
      expect(input).toBeInTheDocument()
    })

    it('should render input with custom className', () => {
      render(<Input className="custom-input" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('custom-input')
    })

    it('should render disabled input', () => {
      render(<Input disabled placeholder="Disabled" />)
      
      const input = screen.getByPlaceholderText('Disabled')
      expect(input).toBeDisabled()
    })

    it('should render input with autoComplete', () => {
      render(<Input autoComplete="username" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('autoComplete', 'username')
    })
  })

  describe('Form Integration', () => {
    it('should work in form with onChange', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      
      render(<Input onChange={handleChange} placeholder="Type here" />)
      
      const input = screen.getByPlaceholderText('Type here')
      await user.type(input, 'hello')
      
      expect(handleChange).toHaveBeenCalled()
      expect(input).toHaveValue('hello')
    })

    it('should work with controlled input', async () => {
      const user = userEvent.setup()
      let value = ''
      const setValue = (newValue: string) => { value = newValue }
      
      render(
        <Input 
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Controlled"
        />
      )
      
      const input = screen.getByPlaceholderText('Controlled')
      await user.type(input, 'controlled')
      
      expect(value).toBe('controlled')
      expect(input).toHaveValue('controlled')
    })

    it('should support ref forwarding', () => {
      const ref = React.createRef<HTMLInputElement>()
      
      render(<Input ref={ref} />)
      
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<Input aria-label="Custom label" aria-describedby="description" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-label', 'Custom label')
      expect(input).toHaveAttribute('aria-describedby', 'description')
    })

    it('should support required attribute', () => {
      render(<Input required placeholder="Required field" />)
      
      const input = screen.getByPlaceholderText('Required field')
      expect(input).toHaveAttribute('required')
    })

    it('should support invalid state', () => {
      render(<Input aria-invalid="true" placeholder="Invalid field" />)
      
      const input = screen.getByPlaceholderText('Invalid field')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })
  })

  describe('Input Types', () => {
    it('should render password input', () => {
      render(<Input type="password" placeholder="Password" />)
      
      const input = screen.getByPlaceholderText('Password')
      expect(input).toHaveAttribute('type', 'password')
    })

    it('should render number input', () => {
      render(<Input type="number" placeholder="Number" />)
      
      const input = screen.getByPlaceholderText('Number')
      expect(input).toHaveAttribute('type', 'number')
    })

    it('should render date input', () => {
      render(<Input type="date" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'date')
    })

    it('should render search input', () => {
      render(<Input type="search" placeholder="Search" />)
      
      const input = screen.getByPlaceholderText('Search')
      expect(input).toHaveAttribute('type', 'search')
    })
  })

  describe('Event Handling', () => {
    it('should handle focus and blur events', () => {
      const handleFocus = vi.fn()
      const handleBlur = vi.fn()
      
      render(<Input onFocus={handleFocus} onBlur={handleBlur} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.focus(input)
      fireEvent.blur(input)
      
      expect(handleFocus).toHaveBeenCalledTimes(1)
      expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    it('should handle key events', () => {
      const handleKeyDown = vi.fn()
      const handleKeyUp = vi.fn()
      
      render(<Input onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.keyDown(input, { key: 'Enter' })
      fireEvent.keyUp(input, { key: 'Enter' })
      
      expect(handleKeyDown).toHaveBeenCalledTimes(1)
      expect(handleKeyUp).toHaveBeenCalledTimes(1)
    })
  })

  describe('Input States', () => {
    it('should render input with placeholder', () => {
      render(<Input placeholder="Placeholder text" />)
      
      expect(screen.getByPlaceholderText('Placeholder text')).toBeInTheDocument()
    })

    it('should render input with defaultValue', () => {
      render(<Input defaultValue="default value" />)
      
      expect(screen.getByDisplayValue('default value')).toBeInTheDocument()
    })

    it('should handle maxLength', () => {
      render(<Input maxLength={10} placeholder="Max 10 chars" />)
      
      const input = screen.getByPlaceholderText('Max 10 chars')
      expect(input).toHaveAttribute('maxLength', '10')
    })

    it('should handle min and max for number input', () => {
      render(<Input type="number" min={0} max={100} />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('min', '0')
      expect(input).toHaveAttribute('max', '100')
    })
  })

  describe('Input Sizes', () => {
    it('should support different input sizes', () => {
      render(
        <>
          <Input size="sm" data-testid="sm-input" />
          <Input size="md" data-testid="md-input" />
          <Input size="lg" data-testid="lg-input" />
        </>
      )
      
      expect(screen.getByTestId('sm-input')).toHaveClass('h-9')
      expect(screen.getByTestId('md-input')).toHaveClass('h-10')
      expect(screen.getByTestId('lg-input')).toHaveClass('h-11')
    })
  })

  describe('Error States', () => {
    it('should show error styling', () => {
      render(<Input data-error placeholder="Error input" />)
      
      const input = screen.getByPlaceholderText('Error input')
      expect(input).toHaveAttribute('data-error')
    })

    it('should handle validation errors', async () => {
      const user = userEvent.setup()
      const handleInvalid = vi.fn()
      
      render(<Input required onInvalid={handleInvalid} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.invalid(input)
      
      expect(handleInvalid).toHaveBeenCalledTimes(1)
    })
  })

  describe('Input Groups', () => {
    it('should work in input groups', () => {
      render(
        <div className="flex">
          <span className="inline-flex items-center px-3 text-sm text-gray-900 border border-r-0 border-gray-300 rounded-l-md bg-gray-50">
            $
          </span>
          <Input className="rounded-none rounded-r-md" placeholder="Amount" />
        </div>
      )
      
      expect(screen.getByPlaceholderText('Amount')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const handleChange = vi.fn()
      const { rerender } = render(<Input onChange={handleChange} />)
      
      rerender(<Input onChange={handleChange} />)
      
      expect(handleChange).not.toHaveBeenCalled()
    })

    it('should handle rapid input changes efficiently', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      
      render(<Input onChange={handleChange} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'rapid')
      
      expect(handleChange).toHaveBeenCalled()
    })
  })
})
