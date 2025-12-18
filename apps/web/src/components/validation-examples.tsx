import React from 'react'
import { useZodForm } from '@/hooks/use-zod-form'
import { loginSchema, registerSchema } from '@/schemas/auth'
import { createTaskRequestSchema, userSchema } from '@/schemas/api'
import { validateData, safeValidateData, validateBatch } from '@/lib/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

/**
 * Comprehensive validation examples demonstrating Zod schema usage
 */
export function ValidationExamples() {
  // 1. Form validation with React Hook Form
  const loginForm = useZodForm(loginSchema)
  const registerForm = useZodForm(registerSchema)

  // 2. Single item validation
  const handleSingleValidation = () => {
    try {
      const userData = {
        id: '123',
        email: 'user@example.com',
        name: 'John Doe',
        role: 'user' as const,
      }
      const validatedUser = validateData(userSchema, userData)
      console.log('Validated user:', validatedUser)
      alert('Single validation passed!')
    } catch (error) {
      console.error('Validation failed:', error)
      alert('Validation failed!')
    }
  }

  // 3. Safe validation (doesn't throw)
  const handleSafeValidation = () => {
    const result = safeValidateData(userSchema, {
      id: '123',
      email: 'invalid-email', // This will fail
      name: 'John Doe',
      role: 'user',
    })

    if (result.success) {
      console.log('Safe validation passed:', result.data)
      alert('Safe validation passed!')
    } else {
      console.error('Safe validation failed:', result.error)
      alert(`Safe validation failed: ${result.error}`)
    }
  }

  // 4. Batch validation
  const handleBatchValidation = () => {
    const users = [
      { id: '1', email: 'user1@example.com', name: 'User 1', role: 'user' as const },
      { id: '2', email: 'user2@example.com', name: 'User 2', role: 'admin' as const },
      { id: '3', email: 'invalid-email', name: 'User 3', role: 'user' as const }, // This will fail
    ]

    const result = validateBatch(userSchema, users)

    if (result.success) {
      console.log('Batch validation passed:', result.data)
      alert('Batch validation passed!')
    } else {
      console.error('Batch validation failed:', result.errors)
      alert(`Batch validation failed at index ${result.errors[0].index}`)
    }
  }

  // 5. API request validation
  const handleApiValidation = () => {
    try {
      const taskData = {
        title: 'Complete project documentation',
        description: 'Write comprehensive documentation for the new feature',
        priority: 'high' as const,
      }
      const validatedTask = validateData(createTaskRequestSchema, taskData)
      console.log('Validated task:', validatedTask)
      alert('API validation passed!')
    } catch (error) {
      console.error('API validation failed:', error)
      alert('API validation failed!')
    }
  }

  // 6. Conditional validation
  const handleConditionalValidation = () => {
    const data = {
      title: 'Task Title',
      description: '', // Optional field
      priority: 'medium' as const,
    }

    // Only validate required fields for partial updates
    const partialSchema = createTaskRequestSchema.partial()
    try {
      const validated = partialSchema.parse(data)
      console.log('Conditional validation passed:', validated)
      alert('Conditional validation passed!')
    } catch (error) {
      console.error('Conditional validation failed:', error)
      alert('Conditional validation failed!')
    }
  }

  return (
    <div className="space-y-8 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Zod Validation Examples</h1>
        <p className="text-muted-foreground">
          Comprehensive examples of runtime type validation using Zod schemas
        </p>
      </div>

      {/* Form Validation Examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Login Form (React Hook Form)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={loginForm.handleSubmit((data) => {
              console.log('Login form data:', data)
              alert('Login form submitted!')
            })} className="space-y-4">
              <div>
                <Label htmlFor="login-email">Email</Label>
                <Input
                  {...loginForm.register('email')}
                  id="login-email"
                  type="email"
                  placeholder="Enter email"
                  className={loginForm.formState.errors.email ? 'border-red-500' : ''}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="login-password">Password</Label>
                <Input
                  {...loginForm.register('password')}
                  id="login-password"
                  type="password"
                  placeholder="Enter password"
                  className={loginForm.formState.errors.password ? 'border-red-500' : ''}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button 
                type="submit" 
                disabled={!loginForm.formState.isValid}
                className="w-full"
              >
                Login
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Register Form (React Hook Form)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={registerForm.handleSubmit((data) => {
              console.log('Register form data:', data)
              alert('Register form submitted!')
            })} className="space-y-4">
              <div>
                <Label htmlFor="register-name">Name</Label>
                <Input
                  {...registerForm.register('name')}
                  id="register-name"
                  placeholder="Enter name"
                  className={registerForm.formState.errors.name ? 'border-red-500' : ''}
                />
                {registerForm.formState.errors.name && (
                  <p className="text-sm text-red-500 mt-1">
                    {registerForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="register-email">Email</Label>
                <Input
                  {...registerForm.register('email')}
                  id="register-email"
                  type="email"
                  placeholder="Enter email"
                  className={registerForm.formState.errors.email ? 'border-red-500' : ''}
                />
                {registerForm.formState.errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="register-password">Password</Label>
                <Input
                  {...registerForm.register('password')}
                  id="register-password"
                  type="password"
                  placeholder="Enter password"
                  className={registerForm.formState.errors.password ? 'border-red-500' : ''}
                />
                {registerForm.formState.errors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="register-confirmPassword">Confirm Password</Label>
                <Input
                  {...registerForm.register('confirmPassword')}
                  id="register-confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  className={registerForm.formState.errors.confirmPassword ? 'border-red-500' : ''}
                />
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">
                    {registerForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <Button 
                type="submit" 
                disabled={!registerForm.formState.isValid}
                className="w-full"
              >
                Register
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Validation Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Runtime Validation Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button onClick={handleSingleValidation} variant="outline">
              Single Item Validation
            </Button>
            <Button onClick={handleSafeValidation} variant="outline">
              Safe Validation (No Throw)
            </Button>
            <Button onClick={handleBatchValidation} variant="outline">
              Batch Validation
            </Button>
            <Button onClick={handleApiValidation} variant="outline">
              API Request Validation
            </Button>
            <Button onClick={handleConditionalValidation} variant="outline">
              Conditional Validation
            </Button>
          </div>
          
          <Alert>
            <AlertDescription>
              Check the browser console to see validation results and data flow.
              All validation is done at runtime, ensuring type safety beyond TypeScript's compile-time checks.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Schema Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Schema Validation Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>✅ <strong>Runtime Type Safety:</strong> Validates data at runtime, not just compile time</li>
            <li>✅ <strong>Form Validation:</strong> Automatic integration with React Hook Form</li>
            <li>✅ <strong>API Validation:</strong> Validate requests and responses with same schemas</li>
            <li>✅ <strong>Error Handling:</strong> Clear, structured error messages</li>
            <li>✅ <strong>Type Inference:</strong> Automatic TypeScript type generation</li>
            <li>✅ <strong>Data Transformation:</strong> Built-in parsing and transformation</li>
            <li>✅ <strong>Reusable Schemas:</strong> Share validation logic across frontend and backend</li>
            <li>✅ <strong>Conditional Validation:</strong> Dynamic validation based on data</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}