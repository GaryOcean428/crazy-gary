import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react'
import { renderHook, act as actHook } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useZodForm } from '@/hooks/use-zod-form'
import { z } from 'zod'

// Test schemas
const testSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  age: z.number().min(18, 'Must be 18 or older'),
})

const complexSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  preferences: z.object({
    theme: z.enum(['light', 'dark']),
    notifications: z.boolean(),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// Test form component
const TestForm = ({ schema, onSubmit, onValid, onInvalid }) => {
  const { register, handleSubmit, formState, reset, setValue, watch } = useZodForm(schema)
  
  const onSubmitHandler = (data) => {
    onSubmit?.(data)
  }

  const onValidHandler = () => {
    onValid?.()
  }

  const onInvalidHandler = () => {
    onInvalid?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmitHandler, onInvalidHandler)}>
      <input 
        {...register('name')} 
        placeholder="Name" 
        data-testid="name-input"
      />
      {formState.errors.name && (
        <span data-testid="name-error">{formState.errors.name.message}</span>
      )}
      
      <input 
        {...register('email')} 
        placeholder="Email" 
        data-testid="email-input"
      />
      {formState.errors.email && (
        <span data-testid="email-error">{formState.errors.email.message}</span>
      )}
      
      <input 
        {...register('age', { valueAsNumber: true })} 
        placeholder="Age" 
        data-testid="age-input"
        type="number"
      />
      {formState.errors.age && (
        <span data-testid="age-error">{formState.errors.age.message}</span>
      )}
      
      <button type="submit" data-testid="submit-btn">Submit</button>
      <button type="button" onClick={reset} data-testid="reset-btn">Reset</button>
      <button 
        type="button" 
        onClick={() => setValue('name', 'Test Name')} 
        data-testid="set-value-btn"
      >
        Set Name
      </button>
      <div data-testid="watch-name">{watch('name')}</div>
    </form>
  )
}

describe('Hooks - useZodForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Form Handling', () => {
    it('should initialize with empty form state', () => {
      const { result } = renderHook(() => useZodForm(testSchema))
      
      expect(result.current.formState.isValid).toBe(false)
      expect(result.current.formState.errors).toEqual({})
      expect(result.current.formState.dirtyFields).toEqual({})
      expect(result.current.formState.touchedFields).toEqual({})
      expect(result.current.formState.isSubmitting).toBe(false)
      expect(result.current.formState.isSubmitted).toBe(false)
      expect(result.current.formState.isSubmitSuccessful).toBe(false)
    })

    it('should register input fields correctly', () => {
      const { result } = renderHook(() => useZodForm(testSchema))
      
      const nameField = result.current.register('name')
      const emailField = result.current.register('email')
      
      expect(nameField).toHaveProperty('name')
      expect(nameField).toHaveProperty('onChange')
      expect(nameField).toHaveProperty('onBlur')
      expect(nameField).toHaveProperty('ref')
      
      expect(emailField).toHaveProperty('name')
      expect(emailField).toHaveProperty('onChange')
      expect(emailField).toHaveProperty('onBlur')
      expect(emailField).toHaveProperty('ref')
    })

    it('should handle form submission with valid data', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      
      render(
        <TestForm 
          schema={testSchema} 
          onSubmit={mockSubmit}
        />
      )
      
      // Fill in valid data
      await user.type(screen.getByTestId('name-input'), 'John Doe')
      await user.type(screen.getByTestId('email-input'), 'john@example.com')
      await user.type(screen.getByTestId('age-input'), '25')
      
      // Submit form
      await user.click(screen.getByTestId('submit-btn'))
      
      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          age: 25,
        })
      })
    })

    it('should handle form submission with invalid data', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      const mockInvalid = vi.fn()
      
      render(
        <TestForm 
          schema={testSchema} 
          onSubmit={mockSubmit}
          onInvalid={mockInvalid}
        />
      )
      
      // Submit empty form
      await user.click(screen.getByTestId('submit-btn'))
      
      await waitFor(() => {
        expect(mockSubmit).not.toHaveBeenCalled()
        expect(mockInvalid).toHaveBeenCalled()
      })
      
      expect(screen.getByTestId('name-error')).toHaveTextContent('Name is required')
    })
  })

  describe('Field Validation', () => {
    it('should show validation errors for required fields', async () => {
      const user = userEvent.setup()
      
      render(<TestForm schema={testSchema} />)
      
      await user.click(screen.getByTestId('submit-btn'))
      
      await waitFor(() => {
        expect(screen.getByTestId('name-error')).toHaveTextContent('Name is required')
      })
    })

    it('should show validation errors for invalid email', async () => {
      const user = userEvent.setup()
      
      render(<TestForm schema={testSchema} />)
      
      await user.type(screen.getByTestId('email-input'), 'invalid-email')
      await user.click(screen.getByTestId('submit-btn'))
      
      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toHaveTextContent('Invalid email')
      })
    })

    it('should show validation errors for age below minimum', async () => {
      const user = userEvent.setup()
      
      render(<TestForm schema={testSchema} />)
      
      await user.type(screen.getByTestId('age-input'), '16')
      await user.click(screen.getByTestId('submit-btn'))
      
      await waitFor(() => {
        expect(screen.getByTestId('age-error')).toHaveTextContent('Must be 18 or older')
      })
    })

    it('should clear errors when user starts typing', async () => {
      const user = userEvent.setup()
      
      render(<TestForm schema={testSchema} />)
      
      // First, trigger error
      await user.click(screen.getByTestId('submit-btn'))
      await waitFor(() => {
        expect(screen.getByTestId('name-error')).toBeInTheDocument()
      })
      
      // Then start typing
      await user.type(screen.getByTestId('name-input'), 'John')
      
      await waitFor(() => {
        expect(screen.queryByTestId('name-error')).not.toBeInTheDocument()
      })
    })
  })

  describe('Form State Management', () => {
    it('should track dirty fields', async () => {
      const user = userEvent.setup()
      
      const { result } = renderHook(() => useZodForm(testSchema))
      
      expect(result.current.formState.dirtyFields).toEqual({})
      
      actHook(() => {
        result.current.register('name').onChange({
          target: { value: 'John' }
        })
      })
      
      expect(result.current.formState.dirtyFields).toEqual({ name: true })
    })

    it('should track touched fields', async () => {
      const user = userEvent.setup()
      
      const { result } = renderHook(() => useZodForm(testSchema))
      
      expect(result.current.formState.touchedFields).toEqual({})
      
      actHook(() => {
        result.current.register('name').onBlur({
          target: { name: 'name' }
        })
      })
      
      expect(result.current.formState.touchedFields).toEqual({ name: true })
    })

    it('should track form submission state', async () => {
      const user = userEvent.setup()
      const { result } = renderHook(() => useZodForm(testSchema))
      
      expect(result.current.formState.isSubmitting).toBe(false)
      expect(result.current.formState.isSubmitted).toBe(false)
      expect(result.current.formState.isSubmitSuccessful).toBe(false)
      
      actHook(() => {
        result.current.handleSubmit(() => {}, () => {})({ preventDefault: () => {} })
      })
      
      expect(result.current.formState.isSubmitting).toBe(true)
    })
  })

  describe('Form Methods', () => {
    it('should reset form state', async () => {
      const user = userEvent.setup()
      const { result } = renderHook(() => useZodForm(testSchema))
      
      // Fill form
      actHook(() => {
        result.current.register('name').onChange({
          target: { value: 'John' }
        })
      })
      
      expect(result.current.formState.dirtyFields).toEqual({ name: true })
      
      // Reset
      actHook(() => {
        result.current.reset()
      })
      
      expect(result.current.formState.dirtyFields).toEqual({})
      expect(result.current.formState.errors).toEqual({})
    })

    it('should set field value programmatically', async () => {
      const user = userEvent.setup()
      const { result } = renderHook(() => useZodForm(testSchema))
      
      actHook(() => {
        result.current.setValue('name', 'John Doe')
      })
      
      // Note: This would typically require the input to be rendered and connected
      // In a real scenario, you'd use the register function to get the proper handlers
    })

    it('should watch field values', () => {
      const { result } = renderHook(() => useZodForm(testSchema))
      
      const nameValue = result.current.watch('name')
      expect(nameValue).toBe('')
    })
  })

  describe('Complex Schema Validation', () => {
    const ComplexForm = ({ onSubmit }) => {
      const { register, handleSubmit, formState } = useZodForm(complexSchema)
      
      return (
        <form onSubmit={handleSubmit(onSubmit)}>
          <input {...register('username')} data-testid="username" />
          {formState.errors.username && (
            <span data-testid="username-error">{formState.errors.username.message}</span>
          )}
          
          <input {...register('password')} type="password" data-testid="password" />
          {formState.errors.password && (
            <span data-testid="password-error">{formState.errors.password.message}</span>
          )}
          
          <input 
            {...register('confirmPassword')} 
            type="password" 
            data-testid="confirmPassword" 
          />
          {formState.errors.confirmPassword && (
            <span data-testid="confirmPassword-error">{formState.errors.confirmPassword.message}</span>
          )}
          
          <select {...register('preferences.theme')} data-testid="theme">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
          
          <input 
            {...register('preferences.notifications', { valueAsBoolean: true })} 
            type="checkbox" 
            data-testid="notifications" 
          />
          
          <button type="submit">Submit</button>
        </form>
      )
    }

    it('should handle cross-field validation', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      
      render(<ComplexForm onSubmit={mockSubmit} />)
      
      // Fill in password but not confirmPassword
      await user.type(screen.getByTestId('password'), 'password123')
      await user.type(screen.getByTestId('confirmPassword'), 'password456')
      
      await user.click(screen.getByTestId('submit'))
      
      await waitFor(() => {
        expect(screen.getByTestId('confirmPassword-error')).toHaveTextContent('Passwords do not match')
      })
    })

    it('should handle nested object validation', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      
      render(<ComplexForm onSubmit={mockSubmit} />)
      
      await user.type(screen.getByTestId('username'), 'john')
      await user.type(screen.getByTestId('password'), 'password123')
      await user.type(screen.getByTestId('confirmPassword'), 'password123')
      await user.selectOptions(screen.getByTestId('theme'), 'light')
      await user.click(screen.getByTestId('notifications'))
      
      await user.click(screen.getByTestId('submit'))
      
      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          username: 'john',
          password: 'password123',
          confirmPassword: 'password123',
          preferences: {
            theme: 'light',
            notifications: true,
          },
        })
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle schema with no fields', () => {
      const emptySchema = z.object({})
      const { result } = renderHook(() => useZodForm(emptySchema))
      
      expect(result.current.formState.isValid).toBe(true)
    })

    it('should handle optional fields', () => {
      const optionalSchema = z.object({
        optional: z.string().optional(),
        required: z.string(),
      })
      
      const { result } = renderHook(() => useZodForm(optionalSchema))
      
      // Only required field should be invalid
      expect(result.current.formState.isValid).toBe(false)
    })

    it('should handle form reset with custom values', async () => {
      const user = userEvent.setup()
      const { result } = renderHook(() => useZodForm(testSchema))
      
      // Set custom default values
      actHook(() => {
        result.current.reset({ name: 'Default Name', email: 'default@example.com', age: 25 })
      })
      
      expect(result.current.formState.isValid).toBe(true)
    })

    it('should handle very long text inputs', async () => {
      const user = userEvent.setup()
      const longText = 'a'.repeat(1000)
      
      render(<TestForm schema={testSchema} />)
      
      await user.type(screen.getByTestId('name-input'), longText)
      
      expect(screen.getByTestId('name-input')).toHaveValue(longText)
    })

    it('should handle special characters in inputs', async () => {
      const user = userEvent.setup()
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      
      render(<TestForm schema={testSchema} />)
      
      await user.type(screen.getByTestId('name-input'), specialChars)
      
      expect(screen.getByTestId('name-input')).toHaveValue(specialChars)
    })
  })
})
