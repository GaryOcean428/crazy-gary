import { describe, it, expect, beforeEach } from 'vitest'
import { 
  cn, 
  formatDate, 
  formatTime, 
  formatDateTime, 
  slugify, 
  capitalize, 
  truncate,
  debounce,
  throttle,
  sleep,
  isObject,
  isEmpty,
  deepClone,
  deepMerge,
  getNestedValue,
  setNestedValue,
  generateId,
  randomString,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  sanitizeHtml,
  escapeHtml,
  unescapeHtml,
  formatBytes,
  formatNumber,
  formatCurrency,
  parseQueryParams,
  buildQueryString,
  groupBy,
  sortBy,
  unique,
  chunk,
  range,
  clamp,
  lerp,
  rgbToHex,
  hexToRgb,
  isDarkColor,
  getContrastRatio,
  getReadableTextColor,
} from '@/lib/utils'

describe('Utils - Core Functions', () => {
  describe('cn (className utility)', () => {
    it('should combine class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
      expect(cn('base', true && 'active', false && 'hidden')).toBe('base active')
    })

    it('should handle object classes', () => {
      expect(cn('base', { active: true, disabled: false })).toBe('base active')
    })

    it('should merge tailwind classes', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2') // Later class should win
    })

    it('should handle empty and undefined values', () => {
      expect(cn('base', undefined, null, '', 'active')).toBe('base active')
    })

    it('should handle array inputs', () => {
      expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3')
    })
  })

  describe('String Utilities', () => {
    describe('capitalize', () => {
      it('should capitalize first letter', () => {
        expect(capitalize('hello')).toBe('Hello')
      })

      it('should handle empty string', () => {
        expect(capitalize('')).toBe('')
      })

      it('should handle single character', () => {
        expect(capitalize('h')).toBe('H')
      })

      it('should handle already capitalized string', () => {
        expect(capitalize('Hello')).toBe('Hello')
      })

      it('should handle null/undefined', () => {
        expect(capitalize(null as any)).toBe('')
        expect(capitalize(undefined as any)).toBe('')
      })
    })

    describe('slugify', () => {
      it('should convert to lowercase and replace spaces with hyphens', () => {
        expect(slugify('Hello World')).toBe('hello-world')
      })

      it('should remove special characters', () => {
        expect(slugify('Hello @ World!')).toBe('hello-world')
      })

      it('should handle consecutive hyphens', () => {
        expect(slugify('Hello   World')).toBe('hello-world')
      })

      it('should trim hyphens from ends', () => {
        expect(slugify('  Hello World  ')).toBe('hello-world')
      })

      it('should handle unicode characters', () => {
        expect(slugify('Café München')).toBe('cafe-munchen')
      })
    })

    describe('truncate', () => {
      it('should truncate long strings', () => {
        expect(truncate('Hello World', 5)).toBe('Hello...')
      })

      it('should not truncate short strings', () => {
        expect(truncate('Hi', 10)).toBe('Hi')
      })

      it('should handle exact length', () => {
        expect(truncate('Hello', 5)).toBe('Hello')
      })

      it('should handle custom suffix', () => {
        expect(truncate('Hello World', 5, ' [more]')).toBe('Hello [more]')
      })

      it('should handle zero length', () => {
        expect(truncate('Hello', 0)).toBe('')
      })
    })
  })

  describe('Date Utilities', () => {
    const testDate = new Date('2023-12-25T15:30:45.000Z')

    describe('formatDate', () => {
      it('should format date with default locale', () => {
        const formatted = formatDate(testDate)
        expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
      })

      it('should format date with custom format', () => {
        expect(formatDate(testDate, 'yyyy-MM-dd')).toBe('2023-12-25')
      })

      it('should format date with custom locale', () => {
        const formatted = formatDate(testDate, 'PPP', 'de-DE')
        expect(formatted).toContain('Dezember')
      })

      it('should handle invalid date', () => {
        expect(formatDate(new Date('invalid'))).toBe('Invalid Date')
      })
    })

    describe('formatTime', () => {
      it('should format time with default format', () => {
        const formatted = formatTime(testDate)
        expect(formatted).toMatch(/\d{1,2}:\d{2}/)
      })

      it('should format time with custom format', () => {
        expect(formatTime(testDate, 'HH:mm:ss')).toBe('15:30:45')
      })

      it('should format time with 12-hour format', () => {
        expect(formatTime(testDate, 'hh:mm a')).toBe('03:30 PM')
      })
    })

    describe('formatDateTime', () => {
      it('should format date and time', () => {
        const formatted = formatDateTime(testDate)
        expect(formatted).toContain('2023')
        expect(formatted).toContain('15:30')
      })

      it('should format with custom options', () => {
        const formatted = formatDateTime(testDate, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
        expect(formatted).toContain('December')
        expect(formatted).toContain('2023')
      })
    })
  })

  describe('Number Utilities', () => {
    describe('formatNumber', () => {
      it('should format numbers with default locale', () => {
        expect(formatNumber(1234567.89)).toMatch(/1,234,567/)
      })

      it('should format with custom locale', () => {
        expect(formatNumber(1234567.89, 'de-DE')).toContain('1.234.567')
      })

      it('should handle decimal places', () => {
        expect(formatNumber(123.456, 1)).toContain('123.5')
      })

      it('should handle negative numbers', () => {
        expect(formatNumber(-123.456)).toContain('-123')
      })
    })

    describe('formatCurrency', () => {
      it('should format as USD by default', () => {
        expect(formatCurrency(123.45)).toMatch(/\$123\.45/)
      })

      it('should format with different currency', () => {
        expect(formatCurrency(123.45, 'EUR')).toMatch(/€123\.45/)
      })

      it('should format with different locale', () => {
        expect(formatCurrency(123.45, 'GBP', 'en-GB')).toContain('£')
      })
    })

    describe('formatBytes', () => {
      it('should format bytes correctly', () => {
        expect(formatBytes(1024)).toBe('1 KB')
      })

      it('should format large bytes', () => {
        expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB')
      })

      it('should handle bytes', () => {
        expect(formatBytes(512)).toBe('512 B')
      })

      it('should handle zero bytes', () => {
        expect(formatBytes(0)).toBe('0 B')
      })

      it('should handle decimal precision', () => {
        expect(formatBytes(1536, 1)).toBe('1.5 KB')
      })
    })
  })

  describe('Math Utilities', () => {
    describe('clamp', () => {
      it('should clamp values within range', () => {
        expect(clamp(5, 0, 10)).toBe(5)
      })

      it('should clamp values below minimum', () => {
        expect(clamp(-5, 0, 10)).toBe(0)
      })

      it('should clamp values above maximum', () => {
        expect(clamp(15, 0, 10)).toBe(10)
      })

      it('should handle reverse ranges', () => {
        expect(clamp(5, 10, 0)).toBe(5) // Should still work
      })
    })

    describe('lerp', () => {
      it('should interpolate between values', () => {
        expect(lerp(0, 10, 0.5)).toBe(5)
      })

      it('should handle 0 interpolation', () => {
        expect(lerp(0, 10, 0)).toBe(0)
      })

      it('should handle 1 interpolation', () => {
        expect(lerp(0, 10, 1)).toBe(10)
      })

      it('should handle out of range interpolation', () => {
        expect(lerp(0, 10, 1.5)).toBe(15)
      })
    })
  })

  describe('Validation Utilities', () => {
    describe('isValidEmail', () => {
      it('should validate correct email addresses', () => {
        expect(isValidEmail('test@example.com')).toBe(true)
        expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
      })

      it('should reject invalid email addresses', () => {
        expect(isValidEmail('invalid')).toBe(false)
        expect(isValidEmail('test@')).toBe(false)
        expect(isValidEmail('@domain.com')).toBe(false)
        expect(isValidEmail('test..test@example.com')).toBe(false)
      })

      it('should handle edge cases', () => {
        expect(isValidEmail('')).toBe(false)
        expect(isValidEmail(null as any)).toBe(false)
        expect(isValidEmail(undefined as any)).toBe(false)
      })
    })

    describe('isValidPhone', () => {
      it('should validate phone numbers', () => {
        expect(isValidPhone('+1234567890')).toBe(true)
        expect(isValidPhone('(123) 456-7890')).toBe(true)
        expect(isValidPhone('123-456-7890')).toBe(true)
      })

      it('should reject invalid phone numbers', () => {
        expect(isValidPhone('123')).toBe(false)
        expect(isValidPhone('abc-def-ghij')).toBe(false)
      })
    })

    describe('isValidUrl', () => {
      it('should validate correct URLs', () => {
        expect(isValidUrl('https://example.com')).toBe(true)
        expect(isValidUrl('http://example.com')).toBe(true)
        expect(isValidUrl('https://example.com/path?query=value')).toBe(true)
      })

      it('should reject invalid URLs', () => {
        expect(isValidUrl('not-a-url')).toBe(false)
        expect(isValidUrl('ftp://example.com')).toBe(false)
      })
    })
  })

  describe('Object Utilities', () => {
    describe('isObject', () => {
      it('should identify objects', () => {
        expect(isObject({})).toBe(true)
        expect(isObject({ a: 1 })).toBe(true)
        expect(isObject(new Date())).toBe(true)
      })

      it('should reject non-objects', () => {
        expect(isObject(null)).toBe(false)
        expect(isObject(undefined)).toBe(false)
        expect(isObject('string')).toBe(false)
        expect(isObject(123)).toBe(true) // Numbers are objects in JS
        expect(isObject([])).toBe(true) // Arrays are objects
      })
    })

    describe('isEmpty', () => {
      it('should detect empty objects', () => {
        expect(isEmpty({})).toBe(true)
        expect(isEmpty([])).toBe(true)
        expect(isEmpty('')).toBe(true)
      })

      it('should detect non-empty objects', () => {
        expect(isEmpty({ a: 1 })).toBe(false)
        expect(isEmpty([1])).toBe(false)
        expect(isEmpty('text')).toBe(false)
      })
    })

    describe('deepClone', () => {
      it('should clone objects deeply', () => {
        const original = { a: 1, b: { c: 2, d: [3, 4] } }
        const cloned = deepClone(original)
        
        expect(cloned).toEqual(original)
        expect(cloned.b).not.toBe(original.b)
        expect(cloned.b.d).not.toBe(original.b.d)
      })

      it('should handle circular references', () => {
        const original: any = { a: 1 }
        original.self = original
        
        const cloned = deepClone(original)
        expect(cloned.a).toBe(1)
        expect(cloned.self).toBe(cloned)
      })

      it('should handle different data types', () => {
        const original = {
          string: 'text',
          number: 123,
          boolean: true,
          null: null,
          undefined: undefined,
          array: [1, 2, 3],
          object: { nested: 'value' },
          date: new Date('2023-01-01'),
          regex: /test/,
        }
        
        const cloned = deepClone(original)
        expect(cloned).toEqual(original)
        expect(cloned.date).toEqual(original.date)
        expect(cloned.regex).toEqual(original.regex)
      })
    })

    describe('deepMerge', () => {
      it('should merge objects deeply', () => {
        const target = { a: 1, b: { c: 2, d: 3 } }
        const source = { b: { d: 4, e: 5 }, f: 6 }
        
        const merged = deepMerge(target, source)
        
        expect(merged).toEqual({
          a: 1,
          b: { c: 2, d: 4, e: 5 },
          f: 6,
        })
      })

      it('should handle arrays in merge', () => {
        const target = { a: [1, 2] }
        const source = { a: [3, 4] }
        
        const merged = deepMerge(target, source)
        expect(merged.a).toEqual([3, 4]) // Source array replaces target
      })

      it('should handle null and undefined values', () => {
        const target = { a: 1 }
        const source = { b: null, c: undefined }
        
        const merged = deepMerge(target, source)
        expect(merged.b).toBe(null)
        expect(merged.c).toBe(undefined)
      })
    })

    describe('getNestedValue', () => {
      it('should get nested object values', () => {
        const obj = { a: { b: { c: 'value' } } }
        expect(getNestedValue(obj, 'a.b.c')).toBe('value')
      })

      it('should handle missing paths', () => {
        const obj = { a: { b: 'value' } }
        expect(getNestedValue(obj, 'a.c.d')).toBe(undefined)
      })

      it('should return default for missing paths', () => {
        const obj = { a: { b: 'value' } }
        expect(getNestedValue(obj, 'a.c.d', 'default')).toBe('default')
      })

      it('should handle array access', () => {
        const obj = { a: { b: [1, 2, 3] } }
        expect(getNestedValue(obj, 'a.b.1')).toBe(2)
      })
    })

    describe('setNestedValue', () => {
      it('should set nested object values', () => {
        const obj = { a: { b: { c: 'old' } } }
        setNestedValue(obj, 'a.b.c', 'new')
        
        expect(obj.a.b.c).toBe('new')
      })

      it('should create nested path if needed', () => {
        const obj = { a: {} }
        setNestedValue(obj, 'a.b.c.d', 'value')
        
        expect(obj.a.b.c.d).toBe('value')
      })

      it('should handle array paths', () => {
        const obj = { a: { b: [1, 2, 3] } }
        setNestedValue(obj, 'a.b.1', 'new')
        
        expect(obj.a.b[1]).toBe('new')
      })
    })
  })

  describe('Array Utilities', () => {
    describe('unique', () => {
      it('should remove duplicate values', () => {
        expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3])
      })

      it('should handle objects by reference', () => {
        const obj1 = { id: 1 }
        const obj2 = { id: 1 }
        const arr = [obj1, obj2, obj1]
        
        expect(unique(arr)).toHaveLength(2)
      })

      it('should handle primitive types', () => {
        expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c'])
        expect(unique([true, false, true])).toEqual([true, false])
      })
    })

    describe('chunk', () => {
      it('should split array into chunks', () => {
        expect(chunk([1, 2, 3, 4, 5, 6], 2)).toEqual([[1, 2], [3, 4], [5, 6]])
      })

      it('should handle last chunk smaller than chunk size', () => {
        expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
      })

      it('should handle chunk size larger than array', () => {
        expect(chunk([1, 2], 5)).toEqual([[1, 2]])
      })

      it('should handle empty array', () => {
        expect(chunk([], 2)).toEqual([])
      })
    })

    describe('groupBy', () => {
      it('should group array items by key', () => {
        const items = [
          { type: 'fruit', name: 'apple' },
          { type: 'fruit', name: 'banana' },
          { type: 'vegetable', name: 'carrot' },
        ]
        
        const grouped = groupBy(items, 'type')
        
        expect(grouped).toEqual({
          fruit: [
            { type: 'fruit', name: 'apple' },
            { type: 'fruit', name: 'banana' },
          ],
          vegetable: [
            { type: 'vegetable', name: 'carrot' },
          ],
        })
      })

      it('should group by function result', () => {
        const items = [1, 2, 3, 4, 5, 6]
        const grouped = groupBy(items, (n) => (n % 2 === 0 ? 'even' : 'odd'))
        
        expect(grouped).toEqual({
          odd: [1, 3, 5],
          even: [2, 4, 6],
        })
      })
    })

    describe('sortBy', () => {
      it('should sort array by property', () => {
        const items = [
          { name: 'Charlie', age: 30 },
          { name: 'Alice', age: 25 },
          { name: 'Bob', age: 35 },
        ]
        
        const sorted = sortBy(items, 'name')
        expect(sorted[0].name).toBe('Alice')
        expect(sorted[1].name).toBe('Bob')
        expect(sorted[2].name).toBe('Charlie')
      })

      it('should sort with custom comparator', () => {
        const items = [3, 1, 4, 1, 5, 9, 2, 6]
        const sorted = sortBy(items, (a, b) => b - a)
        
        expect(sorted).toEqual([9, 6, 5, 4, 3, 2, 1, 1])
      })

      it('should handle nested properties', () => {
        const items = [
          { user: { name: 'Alice', age: 25 } },
          { user: { name: 'Bob', age: 30 } },
        ]
        
        const sorted = sortBy(items, 'user.name')
        expect(sorted[0].user.name).toBe('Alice')
      })
    })

    describe('range', () => {
      it('should generate range from 0 to n', () => {
        expect(range(5)).toEqual([0, 1, 2, 3, 4])
      })

      it('should generate range with start and end', () => {
        expect(range(3, 7)).toEqual([3, 4, 5, 6])
      })

      it('should generate range with step', () => {
        expect(range(0, 10, 2)).toEqual([0, 2, 4, 6, 8])
      })

      it('should handle negative ranges', () => {
        expect(range(5, 0, -1)).toEqual([5, 4, 3, 2, 1])
      })
    })
  })

  describe('Async Utilities', () => {
    describe('debounce', () => {
      it('should delay function execution', async () => {
        const func = vi.fn()
        const debounced = debounce(func, 100)
        
        debounced('arg1')
        debounced('arg2')
        
        await sleep(50)
        expect(func).not.toHaveBeenCalled()
        
        await sleep(60)
        expect(func).toHaveBeenCalledWith('arg2')
        expect(func).toHaveBeenCalledTimes(1)
      })

      it('should handle multiple calls correctly', async () => {
        const func = vi.fn()
        const debounced = debounce(func, 100)
        
        debounced('first')
        await sleep(50)
        debounced('second')
        await sleep(150)
        
        expect(func).toHaveBeenCalledWith('second')
        expect(func).toHaveBeenCalledTimes(1)
      })
    })

    describe('throttle', () => {
      it('should limit function execution frequency', async () => {
        const func = vi.fn()
        const throttled = throttle(func, 100)
        
        throttled('arg1')
        throttled('arg2') // Should be ignored
        throttled('arg3') // Should be ignored
        
        await sleep(50)
        expect(func).toHaveBeenCalledWith('arg1')
        expect(func).toHaveBeenCalledTimes(1)
        
        await sleep(60)
        throttled('arg4') // Should execute
        
        await sleep(50)
        expect(func).toHaveBeenCalledWith('arg4')
        expect(func).toHaveBeenCalledTimes(2)
      })
    })

    describe('sleep', () => {
      it('should resolve after specified time', async () => {
        const start = Date.now()
        await sleep(100)
        const end = Date.now()
        
        expect(end - start).toBeGreaterThanOrEqual(90)
      })
    })
  })

  describe('HTML Utilities', () => {
    describe('escapeHtml', () => {
      it('should escape HTML entities', () => {
        expect(escapeHtml('<script>alert("xss")</script>'))
          .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
      })

      it('should escape quotes and apostrophes', () => {
        expect(escapeHtml("It's a test with 'quotes'")).toContain('&#39;')
        expect(escapeHtml('He said "Hello"')).toContain('&quot;')
      })

      it('should escape ampersands', () => {
        expect(escapeHtml('AT&T')).toBe('AT&amp;T')
      })
    })

    describe('unescapeHtml', () => {
      it('should unescape HTML entities', () => {
        expect(unescapeHtml('&lt;script&gt;')).toBe('<script>')
      })

      it('should unescape quotes', () => {
        expect(unescapeHtml('&#39;test&#39;')).toBe("'test'")
        expect(unescapeHtml('&quot;test&quot;')).toBe('"test"')
      })
    })

    describe('sanitizeHtml', () => {
      it('should remove dangerous tags', () => {
        expect(sanitizeHtml('<script>alert("xss")</script>')).toBe('')
      })

      it('should allow safe tags', () => {
        expect(sanitizeHtml('<p>Hello</p><strong>world</strong>'))
          .toBe('<p>Hello</p><strong>world</strong>')
      })

      it('should strip dangerous attributes', () => {
        expect(sanitizeHtml('<p onclick="alert()">Hello</p>'))
          .toBe('<p>Hello</p>')
      })

      it('should allow safe attributes', () => {
        expect(sanitizeHtml('<p class="text">Hello</p>'))
          .toBe('<p class="text">Hello</p>')
      })
    })
  })

  describe('URL Utilities', () => {
    describe('parseQueryParams', () => {
      it('should parse query string', () => {
        const params = parseQueryParams('?name=John&age=30&active=true')
        
        expect(params).toEqual({
          name: 'John',
          age: '30',
          active: 'true',
        })
      })

      it('should handle array parameters', () => {
        const params = parseQueryParams('?tags=js&tags=react&tags=node')
        
        expect(params.tags).toEqual(['js', 'react', 'node'])
      })

      it('should handle empty query string', () => {
        expect(parseQueryParams('')).toEqual({})
      })
    })

    describe('buildQueryString', () => {
      it('should build query string from object', () => {
        const query = buildQueryString({ name: 'John', age: 30 })
        
        expect(query).toMatch(/name=John/)
        expect(query).toMatch(/age=30/)
      })

      it('should handle arrays', () => {
        const query = buildQueryString({ tags: ['js', 'react'] })
        
        expect(query).toMatch(/tags=js/)
        expect(query).toMatch(/tags=react/)
      })

      it('should handle null and undefined values', () => {
        const query = buildQueryString({ a: 'test', b: null, c: undefined })
        
        expect(query).toMatch(/a=test/)
        expect(query).not.toMatch(/b=/)
        expect(query).not.toMatch(/c=/)
      })
    })
  })

  describe('Color Utilities', () => {
    describe('rgbToHex', () => {
      it('should convert RGB to hex', () => {
        expect(rgbToHex(255, 0, 0)).toBe('#ff0000')
        expect(rgbToHex(0, 255, 0)).toBe('#00ff00')
        expect(rgbToHex(0, 0, 255)).toBe('#0000ff')
      })

      it('should handle RGB values out of range', () => {
        expect(rgbToHex(300, -100, 50)).toBe('#000032')
      })
    })

    describe('hexToRgb', () => {
      it('should convert hex to RGB', () => {
        expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 })
        expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 })
        expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 })
      })

      it('should handle short hex notation', () => {
        expect(hexToRgb('#f00')).toEqual({ r: 255, g: 0, b: 0 })
      })

      it('should return null for invalid hex', () => {
        expect(hexToRgb('invalid')).toBeNull()
      })
    })

    describe('isDarkColor', () => {
      it('should identify dark colors', () => {
        expect(isDarkColor('#000000')).toBe(true)
        expect(isDarkColor('#333333')).toBe(true)
        expect(isDarkColor('#808080')).toBe(true)
      })

      it('should identify light colors', () => {
        expect(isDarkColor('#ffffff')).toBe(false)
        expect(isDarkColor('#cccccc')).toBe(false)
      })
    })

    describe('getContrastRatio', () => {
      it('should calculate contrast ratio', () => {
        const ratio = getContrastRatio('#000000', '#ffffff')
        expect(ratio).toBe(21) // Maximum contrast
      })

      it('should handle same colors', () => {
        const ratio = getContrastRatio('#808080', '#808080')
        expect(ratio).toBe(1) // No contrast
      })
    })

    describe('getReadableTextColor', () => {
      it('should return black for light backgrounds', () => {
        expect(getReadableTextColor('#ffffff')).toBe('#000000')
      })

      it('should return white for dark backgrounds', () => {
        expect(getReadableTextColor('#000000')).toBe('#ffffff')
      })

      it('should handle gray backgrounds', () => {
        expect(getReadableTextColor('#808080')).toBe('#000000')
      })
    })
  })

  describe('ID and Random Utilities', () => {
    describe('generateId', () => {
      it('should generate unique IDs', () => {
        const id1 = generateId()
        const id2 = generateId()
        
        expect(id1).not.toBe(id2)
        expect(id1.length).toBeGreaterThan(0)
        expect(id2.length).toBeGreaterThan(0)
      })

      it('should generate IDs with custom length', () => {
        const id = generateId(10)
        expect(id.length).toBe(10)
      })

      it('should generate IDs with custom prefix', () => {
        const id = generateId(8, 'user_')
        expect(id).toMatch(/^user_/)
      })
    })

    describe('randomString', () => {
      it('should generate random strings', () => {
        const str1 = randomString(10)
        const str2 = randomString(10)
        
        expect(str1).not.toBe(str2)
        expect(str1.length).toBe(10)
      })

      it('should use custom character set', () => {
        const str = randomString(5, 'abc')
        expect(str).toMatch(/^[abc]{5}$/)
      })

      it('should handle empty character set', () => {
        expect(() => randomString(5, '')).toThrow()
      })
    })
  })
})
