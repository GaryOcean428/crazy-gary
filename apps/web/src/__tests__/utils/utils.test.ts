import { describe, it, expect, beforeEach } from 'vitest'
import { cn } from '@/lib/utils'

// Mock classnames for testing
describe('Utils - cn function', () => {
  it('should combine class names correctly', () => {
    const result = cn('base-class', 'additional-class')
    expect(result).toContain('base-class')
    expect(result).toContain('additional-class')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const result = cn('base-class', isActive && 'active-class', !isActive && 'inactive-class')
    expect(result).toContain('base-class')
    expect(result).toContain('active-class')
    expect(result).not.toContain('inactive-class')
  })

  it('should handle undefined and null values', () => {
    const result = cn('base-class', undefined, null, 'valid-class')
    expect(result).toContain('base-class')
    expect(result).toContain('valid-class')
  })

  it('should merge tailwind classes correctly', () => {
    const result = cn('p-4', 'p-6')
    expect(result).toContain('p-6') // Should override p-4
  })

  it('should handle empty inputs', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('should handle object inputs', () => {
    const result = cn({ 'active': true, 'disabled': false })
    expect(result).toContain('active')
    expect(result).not.toContain('disabled')
  })

  it('should handle array inputs', () => {
    const result = cn(['class1', 'class2'])
    expect(result).toContain('class1')
    expect(result).toContain('class2')
  })
})
