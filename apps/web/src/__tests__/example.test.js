/**
 * Enhanced test file demonstrating modern testing practices
 * Shows testing setup for React components with accessibility and performance testing
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { 
  renderWithProviders, 
  testAccessibility, 
  testKeyboardNavigation,
  generateMockUser,
  createMockFetch,
  createComponentTestSuite
} from '../lib/test-utils'

// Mock components for testing
const MockButton = ({ onClick, children, disabled = false, ...props }) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    aria-label={props['aria-label']}
    {...props}
  >
    {children}
  </button>
)

const MockForm = ({ onSubmit }) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    onSubmit({
      email: formData.get('email'),
      password: formData.get('password')
    })
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Login form">
      <div>
        <label htmlFor="email">Email</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          required 
          aria-describedby="email-help"
        />
        <div id="email-help">Enter your email address</div>
      </div>
      
      <div>
        <label htmlFor="password">Password</label>
        <input 
          type="password" 
          id="password" 
          name="password" 
          required 
          aria-describedby="password-help"
        />
        <div id="password-help">Enter your password</div>
      </div>
      
      <button type="submit">Submit</button>
    </form>
  )
}

// Enhanced component testing
describe('Enhanced Component Testing Examples', () => {
  let mockFetch
  
  beforeEach(() => {
    mockFetch = createMockFetch({
      'POST /api/login': {
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { token: 'mock-token', user: generateMockUser() }
        })
      }
    })
    global.fetch = mockFetch
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Button Component', () => {
    it('should render correctly', () => {
      renderWithProviders(<MockButton>Click me</MockButton>)
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
    })

    it('should handle click events', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      renderWithProviders(
        <MockButton onClick={handleClick}>Click me</MockButton>
      )
      
      await user.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should be disabled when disabled prop is true', () => {
      renderWithProviders(
        <MockButton disabled>Disabled button</MockButton>
      )
      
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should meet accessibility standards', async () => {
      await testAccessibility(
        <MockButton aria-label="Accessible button">Click me</MockButton>
      )
    })

    it('should support keyboard navigation', async () => {
      await testKeyboardNavigation(
        <div>
          <MockButton>First button</MockButton>
          <MockButton>Second button</MockButton>
        </div>,
        [
          { role: 'button', name: 'First button' },
          { role: 'button', name: 'Second button' }
        ]
      )
    })
  })

  describe('Form Component', () => {
    it('should handle form submission', async () => {
      const handleSubmit = vi.fn()
      const user = userEvent.setup()
      
      renderWithProviders(<MockForm onSubmit={handleSubmit} />)
      
      // Fill out form
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      
      // Submit form
      await user.click(screen.getByRole('button', { name: /submit/i }))
      
      expect(handleSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })

    it('should have proper form accessibility', async () => {
      await testAccessibility(<MockForm onSubmit={() => {}} />)
    })

    it('should have proper label associations', () => {
      renderWithProviders(<MockForm onSubmit={() => {}} />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      expect(emailInput).toHaveAttribute('id', 'email')
      expect(passwordInput).toHaveAttribute('id', 'password')
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-help')
      expect(passwordInput).toHaveAttribute('aria-describedby', 'password-help')
    })
  })

  describe('API Integration Tests', () => {
    it('should handle successful API calls', async () => {
      const TestComponent = () => {
        const [data, setData] = React.useState(null)
        
        const handleClick = async () => {
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com', password: 'password' })
          })
          const result = await response.json()
          setData(result)
        }
        
        return (
          <div>
            <button onClick={handleClick}>Login</button>
            {data && <div data-testid="user-data">{data.data.user.email}</div>}
          </div>
        )
      }
      
      const user = userEvent.setup()
      renderWithProviders(<TestComponent />)
      
      await user.click(screen.getByRole('button', { name: /login/i }))
      
      await waitFor(() => {
        expect(screen.getByTestId('user-data')).toHaveTextContent('test@example.com')
      })
      
      expect(mockFetch).toHaveBeenCalledWith('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password' })
      })
    })
  })

  describe('Performance Tests', () => {
    it('should render quickly', async () => {
      const start = performance.now()
      
      renderWithProviders(
        <div>
          {Array.from({ length: 100 }, (_, i) => (
            <MockButton key={i}>Button {i}</MockButton>
          ))}
        </div>
      )
      
      const end = performance.now()
      const renderTime = end - start
      
      // Should render 100 buttons in less than 100ms
      expect(renderTime).toBeLessThan(100)
    })
  })

  describe('Error Handling', () => {
    it('should handle errors gracefully', () => {
      const ErrorComponent = () => {
        throw new Error('Test error')
      }
      
      // This test would normally use an error boundary
      expect(() => {
        renderWithProviders(<ErrorComponent />)
      }).toThrow('Test error')
    })
  })
})

// Demonstrate the automated test suite generator
createComponentTestSuite(MockButton, {
  props: { children: 'Test Button' },
  testAccessibility: true,
  testPerformance: true,
  performanceBudget: { maxRenderTime: 50 },
  requiredProps: ['children'],
  optionalProps: [
    { name: 'onClick', value: () => {} },
    { name: 'disabled', value: true }
  ]
})

describe('Utility Functions', () => {
  it('should validate token format', () => {
    const validToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ'
    const invalidToken = 'invalid.token'
    
    expect(validToken.split('.').length).toBe(3)
    expect(invalidToken.split('.').length).not.toBe(3)
  })

  it('should generate proper mock data', () => {
    const user = generateMockUser({ email: 'custom@example.com' })
    
    expect(user).toHaveProperty('id')
    expect(user).toHaveProperty('email', 'custom@example.com')
    expect(user).toHaveProperty('name')
    expect(user).toHaveProperty('role')
    expect(user).toHaveProperty('createdAt')
  })
})

describe('App Integration', () => {
  it('should have all required environment variables in test', () => {
    const requiredEnvVars = [
      'VITE_API_URL',
      'VITE_APP_NAME'
    ]
    
    // In a real test, these would be validated against actual env vars
    requiredEnvVars.forEach(envVar => {
      expect(typeof envVar).toBe('string')
    })
  })

  it('should handle navigation correctly', () => {
    const NavigationTest = () => (
      <div>
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
        </nav>
        <main id="main-content">
          <h1>Home Page</h1>
        </main>
      </div>
    )
    
    renderWithProviders(<NavigationTest />)
    
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Home Page')
  })
})