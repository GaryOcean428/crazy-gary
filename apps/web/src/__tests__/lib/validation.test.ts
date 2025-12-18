import { describe, it, expect, beforeEach } from 'vitest'
import { z } from 'zod'
import { 
  validateEmail, 
  validatePassword, 
  validatePhone, 
  validateUrl,
  validateDate,
  validateNumber,
  sanitizeInput,
  validateForm,
  createValidationSchema,
  ValidationError
} from '@/lib/validation'

// Mock validation utilities (these would be actual implementations)
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '')
  return phoneRegex.test(cleanPhone)
}

const validateUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const validateDate = (date: string | Date): boolean => {
  const parsed = new Date(date)
  return !isNaN(parsed.getTime())
}

const validateNumber = (value: string | number, min?: number, max?: number): boolean => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(num)) return false
  
  if (min !== undefined && num < min) return false
  if (max !== undefined && num > max) return false
  
  return true
}

const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .substring(0, 1000) // Limit length
}

const validateForm = (data: Record<string, any>, schema: z.ZodSchema): { 
  isValid: boolean; 
  errors: Record<string, string[]>; 
  data: any 
} => {
  try {
    const validatedData = schema.parse(data)
    return {
      isValid: true,
      errors: {},
      data: validatedData
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {}
      error.errors.forEach(err => {
        const path = err.path.join('.')
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(err.message)
      })
      
      return {
        isValid: false,
        errors,
        data: null
      }
    }
    
    return {
      isValid: false,
      errors: { general: ['Validation failed'] },
      data: null
    }
  }
}

const createValidationSchema = (rules: Record<string, any>) => {
  const schemaFields: Record<string, any> = {}
  
  Object.entries(rules).forEach(([field, rule]) => {
    let fieldSchema: any
    
    switch (rule.type) {
      case 'string':
        fieldSchema = z.string()
        if (rule.minLength) fieldSchema = fieldSchema.min(rule.minLength)
        if (rule.maxLength) fieldSchema = fieldSchema.max(rule.maxLength)
        if (rule.pattern) fieldSchema = fieldSchema.regex(rule.pattern)
        if (rule.email) fieldSchema = fieldSchema.email()
        break
        
      case 'number':
        fieldSchema = z.number()
        if (rule.min !== undefined) fieldSchema = fieldSchema.min(rule.min)
        if (rule.max !== undefined) fieldSchema = fieldSchema.max(rule.max)
        break
        
      case 'email':
        fieldSchema = z.string().email()
        break
        
      case 'url':
        fieldSchema = z.string().url()
        break
        
      case 'date':
        fieldSchema = z.coerce.date()
        break
        
      case 'boolean':
        fieldSchema = z.boolean()
        break
        
      default:
        fieldSchema = z.any()
    }
    
    if (rule.required === false) {
      fieldSchema = fieldSchema.optional()
    } else {
      fieldSchema = fieldSchema.refine(val => val !== undefined && val !== null && val !== '', {
        message: `${field} is required`
      })
    }
    
    schemaFields[field] = fieldSchema
  })
  
  return z.object(schemaFields)
}

class ValidationError extends Error {
  constructor(message: string, public field?: string, public code?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

describe('Validation - Email Validation', () => {
  it('should validate correct email addresses', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'user+tag@example.org',
      'firstname.lastname@subdomain.example.com'
    ]
    
    validEmails.forEach(email => {
      expect(validateEmail(email)).toBe(true)
    })
  })

  it('should reject invalid email addresses', () => {
    const invalidEmails = [
      'plainaddress',
      '@missingdomain.com',
      'missing@.com',
      'missing@domain',
      'spaces in@email.com',
      'email@',
      '@domain.com',
      'email..double.dot@example.com',
      'email@domain..com'
    ]
    
    invalidEmails.forEach(email => {
      expect(validateEmail(email)).toBe(false)
    })
  })

  it('should handle edge cases', () => {
    expect(validateEmail('')).toBe(false)
    expect(validateEmail(' ')).toBe(false)
    expect(validateEmail(null as any)).toBe(false)
    expect(validateEmail(undefined as any)).toBe(false)
  })
})

describe('Validation - Password Validation', () => {
  it('should validate strong passwords', () => {
    const strongPasswords = [
      'StrongPass1!',
      'MySecure2023#',
      'C0mpl3x@Pwd',
      'A!1b2c3d4e5f6'
    ]
    
    strongPasswords.forEach(password => {
      const result = validatePassword(password)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  it('should reject weak passwords', () => {
    const weakPasswords = [
      'weak', // Too short
      'onlylowercase', // No uppercase, numbers, or special chars
      'ONLYUPPERCASE', // No lowercase, numbers, or special chars
      'NoNumbers!', // No numbers
      'NoSpecial123', // No special characters
      '12345678', // No letters or special characters
      'AllLower123!', // No uppercase
      'ALLUPPER123!', // No lowercase
    ]
    
    weakPasswords.forEach(password => {
      const result = validatePassword(password)
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  it('should provide specific error messages', () => {
    const result = validatePassword('weak')
    
    expect(result.errors).toContain('Password must be at least 8 characters long')
    expect(result.errors).toContain('Password must contain at least one uppercase letter')
    expect(result.errors).toContain('Password must contain at least one number')
    expect(result.errors).toContain('Password must contain at least one special character')
  })

  it('should handle edge cases', () => {
    expect(validatePassword('').isValid).toBe(false)
    expect(validatePassword(' ').isValid).toBe(false)
    expect(validatePassword(null as any).isValid).toBe(false)
    expect(validatePassword(undefined as any).isValid).toBe(false)
  })
})

describe('Validation - Phone Number Validation', () => {
  it('should validate correct phone numbers', () => {
    const validPhones = [
      '+1234567890',
      '1234567890',
      '+1-234-567-8900',
      '(123) 456-7890',
      '123.456.7890',
      '123-456-7890',
      '+44 20 7123 4567'
    ]
    
    validPhones.forEach(phone => {
      expect(validatePhone(phone)).toBe(true)
    })
  })

  it('should reject invalid phone numbers', () => {
    const invalidPhones = [
      'abc123',
      '123',
      '+',
      '',
      '123456789012345678901', // Too long
      '1234567890a', // Contains letters
    ]
    
    invalidPhones.forEach(phone => {
      expect(validatePhone(phone)).toBe(false)
    })
  })

  it('should handle international formats', () => {
    const internationalPhones = [
      '+33 1 42 86 83 53', // France
      '+49 30 123456', // Germany
      '+81 3-1234-5678', // Japan
    ]
    
    internationalPhones.forEach(phone => {
      expect(validatePhone(phone)).toBe(true)
    })
  })
})

describe('Validation - URL Validation', () => {
  it('should validate correct URLs', () => {
    const validUrls = [
      'https://example.com',
      'http://example.com',
      'https://www.example.com',
      'https://example.com/path',
      'https://example.com/path?query=value',
      'https://example.com/path#fragment',
      'ftp://example.com',
      'mailto:user@example.com'
    ]
    
    validUrls.forEach(url => {
      expect(validateUrl(url)).toBe(true)
    })
  })

  it('should reject invalid URLs', () => {
    const invalidUrls = [
      'not-a-url',
      'http://',
      '://example.com',
      'http:/example.com',
      'http:example.com',
      'example.com',
      ''
    ]
    
    invalidUrls.forEach(url => {
      expect(validateUrl(url)).toBe(false)
    })
  })
})

describe('Validation - Date Validation', () => {
  it('should validate correct dates', () => {
    const validDates = [
      '2023-12-01',
      '2023-12-01T12:00:00Z',
      new Date('2023-12-01'),
      '12/01/2023',
      '01/12/2023'
    ]
    
    validDates.forEach(date => {
      expect(validateDate(date)).toBe(true)
    })
  })

  it('should reject invalid dates', () => {
    const invalidDates = [
      'invalid-date',
      '2023-13-01', // Invalid month
      '2023-12-32', // Invalid day
      '',
      'not-a-date'
    ]
    
    invalidDates.forEach(date => {
      expect(validateDate(date)).toBe(false)
    })
  })
})

describe('Validation - Number Validation', () => {
  it('should validate correct numbers', () => {
    expect(validateNumber('123')).toBe(true)
    expect(validateNumber(123)).toBe(true)
    expect(validateNumber('123.45')).toBe(true)
    expect(validateNumber(123.45)).toBe(true)
    expect(validateNumber('0')).toBe(true)
    expect(validateNumber(0)).toBe(true)
    expect(validateNumber('-123')).toBe(true)
    expect(validateNumber(-123)).toBe(true)
  })

  it('should validate numbers within range', () => {
    expect(validateNumber('50', 0, 100)).toBe(true)
    expect(validateNumber(50, 0, 100)).toBe(true)
    expect(validateNumber('0', 0, 100)).toBe(true)
    expect(validateNumber('100', 0, 100)).toBe(true)
  })

  it('should reject numbers outside range', () => {
    expect(validateNumber('150', 0, 100)).toBe(false)
    expect(validateNumber(-10, 0, 100)).toBe(false)
    expect(validateNumber('abc')).toBe(false)
    expect(validateNumber('')).toBe(false)
    expect(validateNumber(null as any)).toBe(false)
  })
})

describe('Validation - Input Sanitization', () => {
  it('should sanitize HTML input', () => {
    const dirtyInput = '  <script>alert("xss")</script>Hello World!  '
    const cleanInput = sanitizeInput(dirtyInput)
    
    expect(cleanInput).toBe('Hello World!')
    expect(cleanInput).not.toContain('<script>')
    expect(cleanInput).not.toContain('</script>')
  })

  it('should remove javascript protocols', () => {
    const dirtyInput = 'javascript:alert("xss")'
    const cleanInput = sanitizeInput(dirtyInput)
    
    expect(cleanInput).not.toContain('javascript:')
  })

  it('should trim whitespace', () => {
    const input = '   trimmed   '
    const cleanInput = sanitizeInput(input)
    
    expect(cleanInput).toBe('trimmed')
  })

  it('should limit input length', () => {
    const longInput = 'a'.repeat(2000)
    const cleanInput = sanitizeInput(longInput)
    
    expect(cleanInput.length).toBe(1000)
  })

  it('should handle edge cases', () => {
    expect(sanitizeInput('')).toBe('')
    expect(sanitizeInput('   ')).toBe('')
    expect(sanitizeInput(null as any)).toBe('')
    expect(sanitizeInput(undefined as any)).toBe('')
  })
})

describe('Validation - Form Validation', () => {
  it('should validate correct form data', () => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      age: z.number().min(18),
    })
    
    const formData = {
      email: 'test@example.com',
      password: 'strongpassword',
      age: 25,
    }
    
    const result = validateForm(formData, schema)
    
    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({})
    expect(result.data).toEqual(formData)
  })

  it('should catch validation errors', () => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      age: z.number().min(18),
    })
    
    const invalidData = {
      email: 'invalid-email',
      password: 'short',
      age: 15,
    }
    
    const result = validateForm(invalidData, schema)
    
    expect(result.isValid).toBe(false)
    expect(Object.keys(result.errors).length).toBeGreaterThan(0)
    expect(result.data).toBeNull()
  })

  it('should provide field-specific errors', () => {
    const schema = z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(8, 'Password too short'),
      name: z.string().min(1, 'Name is required'),
    })
    
    const invalidData = {
      email: 'not-an-email',
      password: '123',
      name: '',
    }
    
    const result = validateForm(invalidData, schema)
    
    expect(result.errors.email).toContain('Invalid email format')
    expect(result.errors.password).toContain('Password too short')
    expect(result.errors.name).toContain('Name is required')
  })
})

describe('Validation - Schema Creation', () => {
  it('should create string validation schema', () => {
    const schema = createValidationSchema({
      name: { type: 'string', required: true, minLength: 2, maxLength: 50 },
      bio: { type: 'string', required: false, maxLength: 500 },
    })
    
    const validData = { name: 'John Doe', bio: 'Software developer' }
    const invalidData = { name: 'A', bio: 'a'.repeat(600) }
    
    expect(validateForm(validData, schema).isValid).toBe(true)
    expect(validateForm(invalidData, schema).isValid).toBe(false)
  })

  it('should create email validation schema', () => {
    const schema = createValidationSchema({
      email: { type: 'email', required: true },
    })
    
    expect(validateForm({ email: 'test@example.com' }, schema).isValid).toBe(true)
    expect(validateForm({ email: 'invalid' }, schema).isValid).toBe(false)
    expect(validateForm({}, schema).isValid).toBe(false)
  })

  it('should create number validation schema', () => {
    const schema = createValidationSchema({
      age: { type: 'number', required: true, min: 18, max: 120 },
      score: { type: 'number', required: false, min: 0, max: 100 },
    })
    
    expect(validateForm({ age: 25 }, schema).isValid).toBe(true)
    expect(validateForm({ age: 25, score: 85 }, schema).isValid).toBe(true)
    expect(validateForm({ age: 17 }, schema).isValid).toBe(false)
    expect(validateForm({ age: 125 }, schema).isValid).toBe(false)
  })

  it('should create URL validation schema', () => {
    const schema = createValidationSchema({
      website: { type: 'url', required: false },
    })
    
    expect(validateForm({ website: 'https://example.com' }, schema).isValid).toBe(true)
    expect(validateForm({ website: 'not-a-url' }, schema).isValid).toBe(false)
    expect(validateForm({}, schema).isValid).toBe(true) // Optional field
  })

  it('should create date validation schema', () => {
    const schema = createValidationSchema({
      birthDate: { type: 'date', required: true },
    })
    
    expect(validateForm({ birthDate: '1990-01-01' }, schema).isValid).toBe(true)
    expect(validateForm({ birthDate: 'invalid-date' }, schema).isValid).toBe(false)
  })

  it('should create boolean validation schema', () => {
    const schema = createValidationSchema({
      newsletter: { type: 'boolean', required: false },
    })
    
    expect(validateForm({ newsletter: true }, schema).isValid).toBe(true)
    expect(validateForm({ newsletter: false }, schema).isValid).toBe(true)
    expect(validateForm({}, schema).isValid).toBe(true)
  })
})

describe('Validation - Custom Error Classes', () => {
  it('should create validation errors with field context', () => {
    const error = new ValidationError('Email is required', 'email', 'REQUIRED')
    
    expect(error.message).toBe('Email is required')
    expect(error.field).toBe('email')
    expect(error.code).toBe('REQUIRED')
    expect(error.name).toBe('ValidationError')
  })

  it('should handle validation error inheritance', () => {
    const error = new ValidationError('Test error')
    
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(ValidationError)
  })
})

describe('Validation - Complex Scenarios', () => {
  it('should validate user registration form', () => {
    const schema = createValidationSchema({
      email: { type: 'email', required: true },
      password: { type: 'string', required: true, minLength: 8 },
      confirmPassword: { type: 'string', required: true },
      firstName: { type: 'string', required: true, minLength: 2 },
      lastName: { type: 'string', required: true, minLength: 2 },
      phone: { type: 'string', required: false },
      website: { type: 'url', required: false },
      birthDate: { type: 'date', required: false },
      age: { type: 'number', required: false, min: 13, max: 120 },
      agreeToTerms: { type: 'boolean', required: true },
    })
    
    const validData = {
      email: 'user@example.com',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      website: 'https://johndoe.com',
      birthDate: '1990-01-01',
      age: 33,
      agreeToTerms: true,
    }
    
    const result = validateForm(validData, schema)
    expect(result.isValid).toBe(true)
  })

  it('should validate product form', () => {
    const schema = createValidationSchema({
      name: { type: 'string', required: true, minLength: 3, maxLength: 100 },
      description: { type: 'string', required: false, maxLength: 1000 },
      price: { type: 'number', required: true, min: 0.01 },
      category: { type: 'string', required: true },
      inStock: { type: 'boolean', required: true },
      sku: { type: 'string', required: false, minLength: 5, maxLength: 20 },
    })
    
    const validData = {
      name: 'Awesome Product',
      description: 'This is a great product',
      price: 29.99,
      category: 'Electronics',
      inStock: true,
      sku: 'ELEC-001',
    }
    
    const result = validateForm(validData, schema)
    expect(result.isValid).toBe(true)
  })

  it('should handle cross-field validation', () => {
    // This would require more complex schema logic
    const schema = z.object({
      password: z.string().min(8),
      confirmPassword: z.string(),
    }).refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    })
    
    const matchingData = {
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
    }
    
    const nonMatchingData = {
      password: 'SecurePass123!',
      confirmPassword: 'DifferentPass123!',
    }
    
    expect(validateForm(matchingData, schema).isValid).toBe(true)
    expect(validateForm(nonMatchingData, schema).isValid).toBe(false)
  })
})

describe('Validation - Performance', () => {
  it('should handle large form data efficiently', () => {
    const schema = createValidationSchema({
      field1: { type: 'string', required: true, maxLength: 100 },
      field2: { type: 'email', required: true },
      field3: { type: 'number', required: true, min: 0, max: 1000 },
    })
    
    const largeData = {
      field1: 'a'.repeat(100),
      field2: 'test@example.com',
      field3: 500,
    }
    
    const startTime = Date.now()
    const result = validateForm(largeData, schema)
    const endTime = Date.now()
    
    expect(result.isValid).toBe(true)
    expect(endTime - startTime).toBeLessThan(100) // Should complete within 100ms
  })

  it('should handle many validation rules efficiently', () => {
    const rules: Record<string, any> = {}
    
    // Create 50 validation rules
    for (let i = 0; i < 50; i++) {
      rules[`field${i}`] = { 
        type: 'string', 
        required: true, 
        minLength: 2, 
        maxLength: 100 
      }
    }
    
    const schema = createValidationSchema(rules)
    
    const data: Record<string, string> = {}
    for (let i = 0; i < 50; i++) {
      data[`field${i}`] = 'valid data'
    }
    
    const startTime = Date.now()
    const result = validateForm(data, schema)
    const endTime = Date.now()
    
    expect(result.isValid).toBe(true)
    expect(endTime - startTime).toBeLessThan(200)
  })
})
