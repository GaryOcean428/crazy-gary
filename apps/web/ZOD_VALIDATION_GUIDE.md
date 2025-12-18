# Zod Schema Validation Implementation

This document provides a comprehensive guide to the Zod schema validation implementation throughout the Crazy-Gary application.

## Overview

The application now includes comprehensive runtime type validation using Zod schemas, providing type safety beyond TypeScript's compile-time checks. This ensures data integrity, better error handling, and improved developer experience.

## Architecture

### Core Components

1. **Schema Definitions** (`/src/schemas/`)
   - `auth.ts` - Authentication-related schemas
   - `api.ts` - API request/response schemas
   - `index.ts` - Centralized exports

2. **Validation Utilities** (`/src/lib/validation.ts`)
   - Core validation functions
   - Error handling utilities
   - Type guards and helpers

3. **React Hook Form Integration** (`/src/hooks/use-zod-form.ts`)
   - Enhanced form validation hook
   - Real-time validation
   - Error handling integration

4. **Enhanced API Client** (`/src/lib/api-client.ts`)
   - Request/response validation
   - Automatic schema validation
   - Better error handling

## Schema Categories

### Authentication Schemas (`auth.ts`)

```typescript
// Login validation
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(1, 'Password is required').min(8, 'Too short'),
})

// Registration with password confirmation
const registerSchema = z.object({
  name: z.string().min(2).max(50).regex(/^[a-zA-Z\s]+$/),
  email: z.string().email(),
  password: z.string()
    .min(8)
    .regex(/[A-Z]/, 'Uppercase required')
    .regex(/[a-z]/, 'Lowercase required')
    .regex(/\d/, 'Number required')
    .regex(/[!@#$%^&*()]/, 'Special char required'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
```

### API Schemas (`api.ts`)

```typescript
// API response validation
const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
  })

// Entity schemas
const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['user', 'admin', 'enterprise']),
  createdAt: z.string().datetime().optional(),
})

// Request validation
const createTaskRequestSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
})
```

## Usage Examples

### 1. Form Validation with React Hook Form

```typescript
import { useZodForm } from '@/hooks/use-zod-form'
import { loginSchema } from '@/schemas/auth'

function LoginForm() {
  const form = useZodForm(loginSchema)

  const onSubmit = async (data) => {
    // Data is already validated
    await login(data.email, data.password)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('email')} />
      {form.formState.errors.email && (
        <p>{form.formState.errors.email.message}</p>
      )}
      <input {...form.register('password')} />
      {form.formState.errors.password && (
        <p>{form.formState.errors.password.message}</p>
      )}
      <button type="submit" disabled={!form.formState.isValid}>
        Login
      </button>
    </form>
  )
}
```

### 2. API Request/Response Validation

```typescript
import apiClient from '@/lib/api-client'
import { userSchema, createTaskRequestSchema } from '@/schemas/api'

// Validated GET request
const user = await apiClient.validatedGet('/users/123', userSchema)

// Validated POST request with request/response validation
const newTask = await apiClient.validatedPost(
  '/tasks',
  taskData, // Will be validated against createTaskRequestSchema
  createTaskRequestSchema,
  taskSchema // Response will be validated against taskSchema
)
```

### 3. Standalone Validation

```typescript
import { validateData, safeValidateData } from '@/lib/validation'
import { userSchema } from '@/schemas/api'

// Throws on validation failure
try {
  const user = validateData(userSchema, userData)
  // User is properly typed
} catch (error) {
  console.error('Validation failed:', error)
}

// Returns result object, doesn't throw
const result = safeValidateData(userSchema, userData)
if (result.success) {
  // Use result.data (properly typed)
} else {
  console.error('Validation failed:', result.error)
}
```

### 4. Batch Validation

```typescript
import { validateBatch } from '@/lib/validation'
import { userSchema } from '@/schemas/api'

const users = [userData1, userData2, userData3]
const result = validateBatch(userSchema, users)

if (result.success) {
  // All users validated successfully
  // result.data is an array of validated users
} else {
  // Some validation failed
  result.errors.forEach(({ index, errors }) => {
    console.error(`User at index ${index} failed:`, errors)
  })
}
```

## Enhanced Features

### Real-time Validation
```typescript
const form = useZodForm(loginSchema, {
  mode: 'onChange' // Validates on every change
})

// Debounced validation
const debouncedEmailValidation = form.debouncedValidateField('email', 500)
```

### Conditional Validation
```typescript
const conditionalSchema = z.object({
  isCompany: z.boolean(),
  companyName: z.string().optional(),
}).refine((data) => {
  if (data.isCompany && !data.companyName) {
    return false
  }
  return true
}, {
  message: 'Company name is required for companies',
  path: ['companyName'],
})
```

### Custom Validation Rules
```typescript
const customSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only alphanumeric and underscore allowed')
    .refine(async (username) => {
      // Async validation (e.g., check if username is taken)
      const isAvailable = await checkUsernameAvailability(username)
      return isAvailable
    }, 'Username is already taken'),
})
```

## TypeScript Integration

### Automatic Type Inference
```typescript
// Types are automatically generated from schemas
type LoginFormData = z.infer<typeof loginSchema>
type User = z.infer<typeof userSchema>

// These types are equivalent to manually defined interfaces
// but with runtime validation guarantees
```

### Schema-driven Development
```typescript
// Define schema first, get types automatically
const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
})

// Type is automatically available
const user: z.infer<typeof userSchema> = {
  id: '123',
  email: 'user@example.com',
  name: 'John Doe',
}
```

## Error Handling

### Structured Error Messages
```typescript
try {
  validateData(userSchema, invalidData)
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`Field: ${error.field}, Message: ${error.message}`)
  }
}
```

### Form Error Integration
```typescript
// Zod errors are automatically converted to React Hook Form errors
const form = useZodForm(schema)

// form.formState.errors contains properly structured error objects
// that work seamlessly with UI components
```

## Best Practices

### 1. Schema Organization
- Keep schemas close to their usage
- Use descriptive names for validation rules
- Group related schemas in separate files

### 2. Error Messages
- Write clear, actionable error messages
- Include field names in complex validations
- Use consistent error formatting

### 3. Performance
- Use `safeValidateData` for non-critical validations
- Implement debouncing for real-time validation
- Consider caching for expensive validations

### 4. Testing
- Test validation schemas with various inputs
- Include edge cases in test data
- Verify error messages are user-friendly

### 5. Integration
- Use consistent schema patterns across the application
- Leverage TypeScript inference to reduce manual typing
- Integrate with existing form libraries

## Migration Guide

### From Manual Validation
```typescript
// Before: Manual validation
if (!email || !email.includes('@')) {
  setError('Please enter a valid email')
  return
}

// After: Schema validation
const result = safeValidateData(loginSchema, formData)
if (!result.success) {
  setError(result.error)
  return
}
```

### From Basic Types
```typescript
// Before: Basic TypeScript types
interface User {
  id: string
  email: string
  name: string
}

// After: Schema with validation
const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1),
})

type User = z.infer<typeof userSchema>
```

## Future Enhancements

1. **Custom Validators**: Add domain-specific validation rules
2. **Performance Optimization**: Implement validation caching
3. **Schema Versioning**: Support schema evolution
4. **Integration Testing**: Add comprehensive validation tests
5. **Documentation**: Auto-generate schema documentation

## Conclusion

The Zod validation implementation provides robust runtime type safety, improved developer experience, and better error handling throughout the application. By leveraging schemas as the single source of truth for data validation, we ensure consistency and reliability across all layers of the application.