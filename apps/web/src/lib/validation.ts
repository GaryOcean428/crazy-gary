import { z, ZodSchema, ZodError } from 'zod'
import type { FieldErrors, Control } from 'react-hook-form'
import type { UseFormReturn, FieldValues, Path } from 'react-hook-form'

// Validation utilities
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export function validateData<T>(schema: ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ')
      throw new ValidationError(`Validation failed: ${fieldErrors}`)
    }
    throw new ValidationError('Unknown validation error')
  }
}

export function safeValidateData<T>(schema: ZodSchema<T>, data: unknown): { 
  success: true; 
  data: T 
} | { 
  success: false; 
  error: string 
} {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ')
      return { success: false, error: fieldErrors }
    }
    return { success: false, error: 'Unknown validation error' }
  }
}

// Transform Zod errors to React Hook Form errors
export function zodErrorsToFieldErrors(error: ZodError): FieldErrors {
  const fieldErrors: FieldErrors = {}
  
  error.errors.forEach((err) => {
    const path = err.path.join('.')
    if (!fieldErrors[path]) {
      fieldErrors[path] = {}
    }
    
    fieldErrors[path].message = err.message
  })
  
  return fieldErrors
}

// Create a resolver for React Hook Form with Zod
export function createZodResolver<T extends FieldValues>(schema: ZodSchema<T>) {
  return {
    validate: async (data: T) => {
      try {
        const result = await schema.parseAsync(data)
        return { values: result, errors: {} }
      } catch (error) {
        if (error instanceof ZodError) {
          return {
            values: {},
            errors: zodErrorsToFieldErrors(error),
          }
        }
        return {
          values: {},
          errors: { _error: 'Validation failed' },
        }
      }
    },
    setError: (error: FieldErrors) => error,
  }
}

// Hook form field validation helper
export function createFieldValidator<T extends FieldValues>(
  schema: ZodSchema<T>,
  field: Path<T>
) {
  return async (value: any) => {
    try {
      // Create a partial schema for single field validation
      const partialSchema = schema.pick({ [field]: true } as any)
      await partialSchema.parseAsync({ [field]: value } as any)
      return true
    } catch (error) {
      if (error instanceof ZodError) {
        return error.errors[0]?.message || 'Invalid value'
      }
      return 'Invalid value'
    }
  }
}

// Async validator for server-side validation
export async function validateAsync<T>(
  schema: ZodSchema<T>,
  data: unknown,
  context?: any
): Promise<{ success: true; data: T } | { success: false; errors: string[] }> {
  try {
    const result = await schema.parseAsync(data, { context })
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      return { success: false, errors }
    }
    return { success: false, errors: ['Unknown validation error'] }
  }
}

// Batch validation for multiple items
export function validateBatch<T>(
  schema: ZodSchema<T>,
  items: unknown[]
): { success: true; data: T[] } | { success: false; errors: Array<{ index: number; errors: string[] }> } {
  const results: T[] = []
  const errors: Array<{ index: number; errors: string[] }> = []
  
  items.forEach((item, index) => {
    try {
      const result = schema.parse(item)
      results.push(result)
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        errors.push({ index, errors: fieldErrors })
      }
    }
  })
  
  if (errors.length > 0) {
    return { success: false, errors }
  }
  
  return { success: true, data: results }
}

// Validation middleware for API responses
export function validateApiResponse<T>(
  schema: ZodSchema<T>,
  response: unknown,
  context?: string
): T {
  try {
    return schema.parse(response, { context })
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ')
      throw new ValidationError(`API response validation failed: ${fieldErrors}`)
    }
    throw new ValidationError('Unknown API response validation error')
  }
}

// Form submission validation helper
export async function validateFormSubmission<T extends FieldValues>(
  form: UseFormReturn<T>,
  schema: ZodSchema<T>
) {
  const data = form.getValues()
  
  try {
    const validatedData = await schema.parseAsync(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors = zodErrorsToFieldErrors(error)
      
      // Set form errors
      Object.entries(fieldErrors).forEach(([field, error]) => {
        if (field !== '_root') {
          form.setError(field as any, error)
        }
      })
      
      return { success: false, errors: fieldErrors }
    }
    return { success: false, errors: { _root: 'Validation failed' } }
  }
}

// Real-time validation helpers
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Schema transformation helpers
export function createPartialSchema<T extends z.ZodTypeAny>(schema: T) {
  return schema.partial()
}

export function createRequiredSchema<T extends z.ZodTypeAny>(schema: T) {
  return schema.required()
}

// Environment validation
export function validateEnvironment() {
  const requiredEnvVars = ['VITE_API_URL', 'VITE_APP_NAME']
  const missing = requiredEnvVars.filter(envVar => !import.meta.env[envVar])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
  
  return {
    API_URL: import.meta.env.VITE_API_URL,
    APP_NAME: import.meta.env.VITE_APP_NAME,
    NODE_ENV: import.meta.env.NODE_ENV,
  }
}

// Type guards for runtime type checking
export function isValidEmail(email: unknown): email is string {
  if (typeof email !== 'string') return false
  return z.string().email().safeParse(email).success
}

export function isValidUUID(id: unknown): id is string {
  if (typeof id !== 'string') return false
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
}

export function isValidDate(date: unknown): date is string {
  if (typeof date !== 'string') return false
  const parsedDate = new Date(date)
  return !isNaN(parsedDate.getTime())
}