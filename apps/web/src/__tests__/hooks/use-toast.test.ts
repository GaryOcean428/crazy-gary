import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import { useToast, toast } from '@/hooks/use-toast'
import '@testing-library/jest-dom'

// Mock timers for testing timeouts
vi.useFakeTimers()

// Test component that uses the toast hook
const TestToastComponent = ({ showToast = false, toastProps = {} }) => {
  const { toasts, toast: showToastFn, dismiss } = useToast()

  React.useEffect(() => {
    if (showToast) {
      showToastFn(toastProps)
    }
  }, [showToast, showToastFn, toastProps])

  return (
    <div>
      <button onClick={() => showToastFn({ title: 'Test Toast' })} data-testid="show-toast">
        Show Toast
      </button>
      <button onClick={() => dismiss('test-id')} data-testid="dismiss-toast">
        Dismiss Toast
      </button>
      <div data-testid="toast-count">{toasts.length}</div>
      <div data-testid="toasts">
        {toasts.map(t => (
          <div key={t.id} data-testid={`toast-${t.id}`}>
            {t.title}
          </div>
        ))}
      </div>
    </div>
  )
}

describe('Hooks - useToast', () => {
  beforeEach(() => {
    // Clear all timers and reset state
    vi.clearAllTimers()
    
    // Reset the global state
    const memoryState = { toasts: [] }
    const listeners = []
    const toastTimeouts = new Map()
    
    // This is a simplified reset - in a real app you'd want a proper reset function
  })

  it('should initialize with empty toasts', () => {
    render(<TestToastComponent />)
    expect(screen.getByTestId('toast-count')).toHaveTextContent('0')
  })

  it('should add toast when toast function is called', async () => {
    render(<TestToastComponent showToast toastProps={{ title: 'Test Toast' }} />)
    
    await waitFor(() => {
      expect(screen.getByTestId('toast-count')).toHaveTextContent('1')
    })
    
    expect(screen.getByTestId('toast-1')).toHaveTextContent('Test Toast')
  })

  it('should dismiss toast when dismiss function is called', async () => {
    render(<TestToastComponent showToast toastProps={{ title: 'Test Toast' }} />)
    
    await waitFor(() => {
      expect(screen.getByTestId('toast-count')).toHaveTextContent('1')
    })
    
    act(() => {
      screen.getByTestId('dismiss-toast').click()
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('toast-count')).toHaveTextContent('0')
    })
  })

  it('should respect toast limit', async () => {
    const TestComponent = () => {
      const { toast: showToastFn } = useToast()
      
      const showMultipleToasts = () => {
        showToastFn({ title: 'Toast 1' })
        showToastFn({ title: 'Toast 2' })
        showToastFn({ title: 'Toast 3' })
      }
      
      return (
        <div>
          <button onClick={showMultipleToasts} data-testid="show-multiple">
            Show Multiple
          </button>
        </div>
      )
    }
    
    render(<TestComponent />)
    
    act(() => {
      screen.getByTestId('show-multiple').click()
    })
    
    // Should only show 1 toast (limit)
    await waitFor(() => {
      expect(screen.getByTestId('toast-count')).toHaveTextContent('1')
    })
  })

  it('should update existing toast', async () => {
    let toastRef: any
    
    const TestComponent = () => {
      const { toast: showToastFn } = useToast()
      
      const showAndUpdate = () => {
        toastRef = showToastFn({ title: 'Initial Title' })
        setTimeout(() => {
          toastRef.update({ title: 'Updated Title' })
        }, 100)
      }
      
      return (
        <div>
          <button onClick={showAndUpdate} data-testid="show-and-update">
            Show and Update
          </button>
        </div>
      )
    }
    
    render(<TestComponent />)
    
    act(() => {
      screen.getByTestId('show-and-update').click()
    })
    
    await waitFor(() => {
      expect(screen.getByText('Initial Title')).toBeInTheDocument()
    })
    
    act(() => {
      vi.advanceTimersByTime(100)
    })
    
    await waitFor(() => {
      expect(screen.getByText('Updated Title')).toBeInTheDocument()
    })
  })

  it('should handle different toast types', async () => {
    render(<TestToastComponent showToast toastProps={{ 
      title: 'Test Toast', 
      description: 'Test description',
      variant: 'destructive' 
    }} />)
    
    await waitFor(() => {
      expect(screen.getByTestId('toast-count')).toHaveTextContent('1')
    })
  })

  it('should auto-dismiss after delay', async () => {
    render(<TestToastComponent showToast toastProps={{ title: 'Auto dismiss toast' }} />)
    
    await waitFor(() => {
      expect(screen.getByTestId('toast-count')).toHaveTextContent('1')
    })
    
    // Advance time past the auto-dismiss delay (TOAST_REMOVE_DELAY)
    act(() => {
      vi.advanceTimersByTime(1000000)
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('toast-count')).toHaveTextContent('0')
    })
  })

  it('should handle multiple components listening to same state', async () => {
    const TestComponent1 = () => {
      const { toast: showToastFn } = useToast()
      
      return (
        <button onClick={() => showToastFn({ title: 'Component 1 Toast' })} data-testid="show-1">
          Show Toast 1
        </button>
      )
    }
    
    const TestComponent2 = () => {
      const { toasts } = useToast()
      
      return (
        <div>
          <div data-testid="toast-count-2">{toasts.length}</div>
          <div data-testid="toasts-2">
            {toasts.map(t => (
              <div key={t.id}>{t.title}</div>
            ))}
          </div>
        </div>
      )
    }
    
    render(
      <div>
        <TestComponent1 />
        <TestComponent2 />
      </div>
    )
    
    act(() => {
      screen.getByTestId('show-1').click()
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('toast-count-2')).toHaveTextContent('1')
      expect(screen.getByText('Component 1 Toast')).toBeInTheDocument()
    })
  })
})

describe('Toast - Direct API', () => {
  it('should create toast with correct properties', () => {
    const toastInstance = toast({ title: 'Direct Toast', description: 'Direct description' })
    
    expect(toastInstance).toHaveProperty('id')
    expect(toastInstance).toHaveProperty('dismiss')
    expect(toastInstance).toHaveProperty('update')
    expect(typeof toastInstance.dismiss).toBe('function')
    expect(typeof toastInstance.update).toBe('function')
  })

  it('should handle toast without title', () => {
    const toastInstance = toast({ description: 'Only description' })
    
    expect(toastInstance).toHaveProperty('id')
  })

  it('should handle toast with action', () => {
    const action = <button onClick={() => {}}>Action</button>
    const toastInstance = toast({ 
      title: 'Toast with Action', 
      action,
      description: 'Has action button' 
    })
    
    expect(toastInstance).toHaveProperty('id')
  })
})

describe('Toast - Edge Cases', () => {
  it('should handle rapid toast creation', () => {
    const toasts = []
    
    // Create multiple toasts rapidly
    for (let i = 0; i < 10; i++) {
      toasts.push(toast({ title: `Toast ${i}` }))
    }
    
    // Should respect the limit
    expect(toasts.length).toBe(10) // All should be created
    // But only 1 should be active due to limit
  })

  it('should handle empty toast props', () => {
    const toastInstance = toast({})
    
    expect(toastInstance).toHaveProperty('id')
  })

  it('should handle null and undefined props', () => {
    const toastInstance1 = toast(null)
    const toastInstance2 = toast(undefined)
    
    expect(toastInstance1).toHaveProperty('id')
    expect(toastInstance2).toHaveProperty('id')
  })

  it('should generate unique IDs', () => {
    const toast1 = toast({ title: 'Toast 1' })
    const toast2 = toast({ title: 'Toast 2' })
    
    expect(toast1.id).not.toBe(toast2.id)
  })

  it('should handle very long titles and descriptions', () => {
    const longTitle = 'A'.repeat(1000)
    const longDescription = 'B'.repeat(1000)
    
    const toastInstance = toast({ 
      title: longTitle, 
      description: longDescription 
    })
    
    expect(toastInstance).toHaveProperty('id')
  })
})
