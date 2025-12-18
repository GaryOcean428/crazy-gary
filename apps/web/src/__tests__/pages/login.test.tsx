import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Login } from '@/pages/login'
import { BrowserRouter } from 'react-router-dom'

// Mock hooks and context
jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    login: jest.fn()
  })
}))

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}))

jest.mock('@/hooks/use-zod-form', () => ({
  useZodForm: (schema: any) => ({
    register: jest.fn().mockReturnValue({
      onChange: jest.fn(),
      onBlur: jest.fn(),
      ref: jest.fn(),
      name: 'test'
    }),
    handleSubmit: jest.fn().mockImplementation((fn) => (e: any) => {
      e.preventDefault()
      fn({ email: 'test@example.com', password: 'password' })
    }),
    setValue: jest.fn(),
    formState: {
      errors: {},
      isValid: true
    }
  })
}))

jest.mock('@/schemas/auth', () => ({
  loginSchema: {
    parse: jest.fn().mockReturnValue({ email: 'test@example.com', password: 'password' })
  },
  type: {
    LoginFormData: {} as any
  }
}))

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="card">{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h2 data-testid="card-title">{children}</h2>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <p data-testid="card-description">{children}</p>
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type, variant, className, disabled, ...props }: any) => (
    <button 
      type={type} 
      onClick={onClick} 
      className={className} 
      disabled={disabled}
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  )
}))

jest.mock('@/components/ui/input', () => ({
  Input: ({ disabled, className, ...props }: any) => (
    <input disabled={disabled} className={className} {...props} />
  )
}))

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
    <label htmlFor={htmlFor} data-testid="label">{children}</label>
  )
}))

jest.mock('@/components/ui/alert', () => ({
  Alert: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <div data-variant={variant} data-testid="alert">{children}</div>
  ),
  AlertDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="alert-description">{children}</div>
}))

describe('Login', () => {
  const mockLogin = jest.fn()
  const mockToast = jest.fn()
  const mockNavigate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup mocks
    const { useAuth } = require('@/contexts/auth-context')
    useAuth.mockReturnValue({ login: mockLogin })
    
    const { useToast } = require('@/hooks/use-toast')
    useToast.mockReturnValue({ toast: mockToast })

    // Mock useNavigate
    jest.doMock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate
    }))
  })

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )
  }

  it('renders login page with all elements', () => {
    renderLogin()

    expect(screen.getByText('Crazy-Gary')).toBeInTheDocument()
    expect(screen.getByText('Enterprise Agentic AI Platform')).toBeInTheDocument()
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByText('Enter your credentials to access your AI workspace')).toBeInTheDocument()
  })

  it('renders email input field', () => {
    renderLogin()

    const emailInput = screen.getByLabelText(/email address/i)
    expect(emailInput).toBeInTheDocument()
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('placeholder', 'you@company.com')
  })

  it('renders password input field', () => {
    renderLogin()

    const passwordInput = screen.getByLabelText(/password/i)
    expect(passwordInput).toBeInTheDocument()
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('placeholder', 'Enter your password')
  })

  it('renders password visibility toggle', () => {
    renderLogin()

    const toggleButton = screen.getByRole('button', { name: '' })
    expect(toggleButton).toBeInTheDocument()
    expect(toggleButton).toHaveAttribute('type', 'button')
  })

  it('renders sign in button', () => {
    renderLogin()

    const signInButton = screen.getByRole('button', { name: /sign in/i })
    expect(signInButton).toBeInTheDocument()
    expect(signInButton).toHaveAttribute('type', 'submit')
  })

  it('renders demo button', () => {
    renderLogin()

    const demoButton = screen.getByText('Try Demo Account')
    expect(demoButton).toBeInTheDocument()
  })

  it('shows demo info section', () => {
    renderLogin()

    expect(screen.getByText('Enterprise Demo')).toBeInTheDocument()
    expect(screen.getByText('Experience the full power of our AI platform')).toBeInTheDocument()
  })

  it('handles form submission with valid credentials', async () => {
    mockLogin.mockResolvedValue({ success: true })

    renderLogin()

    const form = screen.getByTestId('card').querySelector('form')
    expect(form).toBeInTheDocument()

    await act(async () => {
      fireEvent.submit(form!)
    })

    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password')
    expect(mockToast).toHaveBeenCalledWith({
      title: "Welcome back!",
      description: "You have been successfully logged in.",
      duration: 3000
    })
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('handles login failure', async () => {
    mockLogin.mockResolvedValue({ success: false, error: 'Invalid credentials' })

    renderLogin()

    const form = screen.getByTestId('card').querySelector('form')
    
    await act(async () => {
      fireEvent.submit(form!)
    })

    expect(mockLogin).toHaveBeenCalled()
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
  })

  it('handles unexpected errors during login', async () => {
    mockLogin.mockRejectedValue(new Error('Network error'))

    renderLogin()

    const form = screen.getByTestId('card').querySelector('form')
    
    await act(async () => {
      fireEvent.submit(form!)
    })

    expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument()
  })

  it('shows loading state during form submission', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    renderLogin()

    const form = screen.getByTestId('card').querySelector('form')
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await act(async () => {
      fireEvent.submit(form!)
    })

    expect(screen.getByText('Signing in...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('handles demo login successfully', async () => {
    mockLogin.mockResolvedValue({ success: true })

    renderLogin()

    const demoButton = screen.getByText('Try Demo Account')
    
    await act(async () => {
      fireEvent.click(demoButton)
    })

    // Should set demo values
    expect(mockLogin).toHaveBeenCalledWith('demo@crazy-gary.ai', 'demo123')
    expect(mockToast).toHaveBeenCalledWith({
      title: "Demo mode activated!",
      description: "Exploring Crazy-Gary with demo account.",
      duration: 3000
    })
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    
    renderLogin()

    const toggleButton = screen.getByRole('button', { name: '' })
    const passwordInput = screen.getByLabelText(/password/i)

    await user.click(toggleButton)

    expect(passwordInput).toHaveAttribute('type', 'text')

    await user.click(toggleButton)

    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('shows form validation errors', () => {
    const { useZodForm } = require('@/hooks/use-zod-form')
    useZodForm.mockReturnValue({
      register: jest.fn().mockReturnValue({
        onChange: jest.fn(),
        onBlur: jest.fn(),
        ref: jest.fn(),
        name: 'test'
      }),
      handleSubmit: jest.fn(),
      setValue: jest.fn(),
      formState: {
        errors: {
          email: { message: 'Email is required' },
          password: { message: 'Password is required' }
        },
        isValid: false
      }
    })

    renderLogin()

    expect(screen.getByText('Email is required')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
  })

  it('disables submit button when form is invalid', () => {
    const { useZodForm } = require('@/hooks/use-zod-form')
    useZodForm.mockReturnValue({
      register: jest.fn().mockReturnValue({
        onChange: jest.fn(),
        onBlur: jest.fn(),
        ref: jest.fn(),
        name: 'test'
      }),
      handleSubmit: jest.fn(),
      setValue: jest.fn(),
      formState: {
        errors: { email: { message: 'Invalid email' } },
        isValid: false
      }
    })

    renderLogin()

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    expect(submitButton).toBeDisabled()
  })

  it('disables form inputs during loading', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    renderLogin()

    const form = screen.getByTestId('card').querySelector('form')
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)

    await act(async () => {
      fireEvent.submit(form!)
    })

    expect(emailInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()
  })

  it('shows correct animations and visual states', () => {
    renderLogin()

    const card = screen.getByTestId('card')
    expect(card).toHaveClass('animate-in', 'fade-in', 'slide-up')
  })

  it('renders background decorative elements', () => {
    renderLogin()

    // Should have animated background elements
    const animatedElements = document.querySelectorAll('.animate-pulse')
    expect(animatedElements.length).toBeGreaterThan(0)
  })

  it('handles registration link navigation', () => {
    renderLogin()

    const registerLink = screen.getByText('Create account')
    expect(registerLink).toHaveAttribute('href', '/register')
  })

  it('handles forgot password link', () => {
    renderLogin()

    const forgotPasswordLink = screen.getByText('Forgot your password?')
    expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password')
  })

  it('shows demo features list', () => {
    renderLogin()

    expect(screen.getByText('• Live Dashboard')).toBeInTheDocument()
    expect(screen.getByText('• AI Models')).toBeInTheDocument()
    expect(screen.getByText('• Real-time Data')).toBeInTheDocument()
  })

  it('renders with proper accessibility attributes', () => {
    renderLogin()

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument()
  })

  it('handles mounting state correctly', () => {
    // Test that mounted state is handled properly
    renderLogin()

    // Should not show loading state after mounting
    expect(screen.queryByTestId('mounting-loader')).not.toBeInTheDocument()
  })

  it('maintains consistent styling and layout', () => {
    renderLogin()

    const container = screen.getByText('Crazy-Gary').closest('div')
    expect(container).toHaveClass('min-h-screen', 'relative', 'overflow-hidden')
  })

  it('handles responsive design elements', () => {
    renderLogin()

    // Check that responsive classes are applied
    const card = screen.getByTestId('card')
    expect(card).toHaveClass('w-full', 'max-w-md')
  })

  it('shows proper branding and visual identity', () => {
    renderLogin()

    expect(screen.getByText('Powered by AI • Secured • Scalable')).toBeInTheDocument()
    expect(screen.getByText('Or')).toBeInTheDocument()
  })
})