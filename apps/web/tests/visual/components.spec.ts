import { test, expect } from '../fixtures'
import { takeScreenshot, switchTheme, visualTestConfig } from '../utils'

test.describe('Component Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Button Components', () => {
    test('should match button variants in light theme', async ({ page }) => {
      await page.evaluate(() => {
        const container = document.createElement('div')
        container.innerHTML = `
          <div style="padding: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-primary">Primary Button</button>
            <button class="btn btn-secondary">Secondary Button</button>
            <button class="btn btn-outline">Outline Button</button>
            <button class="btn btn-ghost">Ghost Button</button>
            <button class="btn btn-destructive">Destructive Button</button>
            <button disabled class="btn btn-primary">Disabled Button</button>
            <button class="btn btn-primary btn-sm">Small Button</button>
            <button class="btn btn-primary btn-lg">Large Button</button>
          </div>
        `
        document.body.appendChild(container)
      })
      await takeScreenshot(page, 'buttons-light')
    })

    test('should match button variants in dark theme', async ({ page }) => {
      await switchTheme(page, 'dark')
      await page.evaluate(() => {
        const container = document.createElement('div')
        container.innerHTML = `
          <div style="padding: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-primary">Primary Button</button>
            <button class="btn btn-secondary">Secondary Button</button>
            <button class="btn btn-outline">Outline Button</button>
            <button class="btn btn-ghost">Ghost Button</button>
            <button class="btn btn-destructive">Destructive Button</button>
            <button disabled class="btn btn-primary">Disabled Button</button>
            <button class="btn btn-primary btn-sm">Small Button</button>
            <button class="btn btn-primary btn-lg">Large Button</button>
          </div>
        `
        document.body.appendChild(container)
      })
      await takeScreenshot(page, 'buttons-dark')
    })

    test('should match button loading states', async ({ page }) => {
      await page.evaluate(() => {
        const container = document.createElement('div')
        container.innerHTML = `
          <div style="padding: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-primary" data-loading="true">Loading Button</button>
            <button class="btn btn-secondary" data-loading="true">Loading Secondary</button>
          </div>
        `
        document.body.appendChild(container)
      })
      await takeScreenshot(page, 'buttons-loading')
    })
  })

  test.describe('Form Components', () => {
    test('should match form inputs in light theme', async ({ page }) => {
      await page.evaluate(() => {
        const container = document.createElement('div')
        container.style.cssText = 'padding: 20px; max-width: 400px;'
        container.innerHTML = `
          <form style="display: flex; flex-direction: column; gap: 16px;">
            <div>
              <label>Text Input</label>
              <input type="text" placeholder="Enter text" style="width: 100%; padding: 8px; border: 1px solid #ccc;" />
            </div>
            <div>
              <label>Email Input</label>
              <input type="email" placeholder="Enter email" style="width: 100%; padding: 8px; border: 1px solid #ccc;" />
            </div>
            <div>
              <label>Password Input</label>
              <input type="password" placeholder="Enter password" style="width: 100%; padding: 8px; border: 1px solid #ccc;" />
            </div>
            <div>
              <label>Textarea</label>
              <textarea placeholder="Enter message" style="width: 100%; padding: 8px; border: 1px solid #ccc; height: 80px;"></textarea>
            </div>
            <div>
              <label>Select</label>
              <select style="width: 100%; padding: 8px; border: 1px solid #ccc;">
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>
            <div>
              <label>
                <input type="checkbox" /> Checkbox Option
              </label>
            </div>
            <div>
              <label>
                <input type="radio" name="radio" /> Radio Option 1
              </label>
              <label>
                <input type="radio" name="radio" /> Radio Option 2
              </label>
            </div>
          </form>
        `
        document.body.appendChild(container)
      })
      await takeScreenshot(page, 'form-inputs-light')
    })

    test('should match form inputs in dark theme', async ({ page }) => {
      await switchTheme(page, 'dark')
      await page.evaluate(() => {
        const container = document.createElement('div')
        container.style.cssText = 'padding: 20px; max-width: 400px;'
        container.innerHTML = `
          <form style="display: flex; flex-direction: column; gap: 16px;">
            <div>
              <label>Text Input</label>
              <input type="text" placeholder="Enter text" style="width: 100%; padding: 8px; border: 1px solid #444; background: #333; color: #fff;" />
            </div>
            <div>
              <label>Email Input</label>
              <input type="email" placeholder="Enter email" style="width: 100%; padding: 8px; border: 1px solid #444; background: #333; color: #fff;" />
            </div>
            <div>
              <label>Password Input</label>
              <input type="password" placeholder="Enter password" style="width: 100%; padding: 8px; border: 1px solid #444; background: #333; color: #fff;" />
            </div>
            <div>
              <label>Textarea</label>
              <textarea placeholder="Enter message" style="width: 100%; padding: 8px; border: 1px solid #444; background: #333; color: #fff; height: 80px;"></textarea>
            </div>
            <div>
              <label>Select</label>
              <select style="width: 100%; padding: 8px; border: 1px solid #444; background: #333; color: #fff;">
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>
            <div>
              <label>
                <input type="checkbox" /> Checkbox Option
              </label>
            </div>
            <div>
              <label>
                <input type="radio" name="radio" /> Radio Option 1
              </label>
              <label>
                <input type="radio" name="radio" /> Radio Option 2
              </label>
            </div>
          </form>
        `
        document.body.appendChild(container)
      })
      await takeScreenshot(page, 'form-inputs-dark')
    })

    test('should match form validation states', async ({ page }) => {
      await page.evaluate(() => {
        const container = document.createElement('div')
        container.style.cssText = 'padding: 20px; max-width: 400px;'
        container.innerHTML = `
          <form style="display: flex; flex-direction: column; gap: 16px;">
            <div>
              <label>Valid Input</label>
              <input type="text" value="Valid text" style="width: 100%; padding: 8px; border: 1px solid #28a745;" />
            </div>
            <div>
              <label>Invalid Input</label>
              <input type="email" value="invalid-email" style="width: 100%; padding: 8px; border: 1px solid #dc3545;" />
              <div style="color: #dc3545; font-size: 0.875rem; margin-top: 4px;">Please enter a valid email address</div>
            </div>
            <div>
              <label>Required Input</label>
              <input type="text" placeholder="Required field" style="width: 100%; padding: 8px; border: 1px solid #ffc107;" />
              <div style="color: #856404; font-size: 0.875rem; margin-top: 4px;">This field is required</div>
            </div>
          </form>
        `
        document.body.appendChild(container)
      })
      await takeScreenshot(page, 'form-validation')
    })
  })

  test.describe('Card Components', () => {
    test('should match card variants in light theme', async ({ page }) => {
      await page.evaluate(() => {
        const container = document.createElement('div')
        container.style.cssText = 'padding: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;'
        container.innerHTML = `
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; background: white;">
            <h3>Basic Card</h3>
            <p>This is a basic card component.</p>
          </div>
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; background: white;">
            <div style="margin-bottom: 12px;">
              <h3>Card with Header</h3>
            </div>
            <p>This card has a header section.</p>
            <div style="margin-top: 16px;">
              <button style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px;">Action</button>
            </div>
          </div>
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 0; background: white; overflow: hidden;">
            <div style="height: 100px; background: #f3f4f6;"></div>
            <div style="padding: 20px;">
              <h3>Card with Image</h3>
              <p>This card includes an image at the top.</p>
            </div>
          </div>
        `
        document.body.appendChild(container)
      })
      await takeScreenshot(page, 'cards-light')
    })

    test('should match card variants in dark theme', async ({ page }) => {
      await switchTheme(page, 'dark')
      await page.evaluate(() => {
        const container = document.createElement('div')
        container.style.cssText = 'padding: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;'
        container.innerHTML = `
          <div style="border: 1px solid #374151; border-radius: 8px; padding: 20px; background: #1f2937;">
            <h3>Basic Card</h3>
            <p>This is a basic card component.</p>
          </div>
          <div style="border: 1px solid #374151; border-radius: 8px; padding: 20px; background: #1f2937;">
            <div style="margin-bottom: 12px;">
              <h3>Card with Header</h3>
            </div>
            <p>This card has a header section.</p>
            <div style="margin-top: 16px;">
              <button style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px;">Action</button>
            </div>
          </div>
          <div style="border: 1px solid #374151; border-radius: 8px; padding: 0; background: #1f2937; overflow: hidden;">
            <div style="height: 100px; background: #374151;"></div>
            <div style="padding: 20px;">
              <h3>Card with Image</h3>
              <p>This card includes an image at the top.</p>
            </div>
          </div>
        `
        document.body.appendChild(container)
      })
      await takeScreenshot(page, 'cards-dark')
    })
  })

  test.describe('Modal/Dialog Components', () => {
    test('should match modal in light theme', async ({ page }) => {
      await page.evaluate(() => {
        const overlay = document.createElement('div')
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;'
        
        const modal = document.createElement('div')
        modal.style.cssText = 'background: white; border-radius: 8px; padding: 24px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;'
        modal.innerHTML = `
          <h2 style="margin: 0 0 16px 0;">Modal Dialog</h2>
          <p style="margin: 0 0 20px 0;">This is a modal dialog component.</p>
          <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button style="padding: 8px 16px; border: 1px solid #d1d5db; background: white; border-radius: 4px;">Cancel</button>
            <button style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px;">Confirm</button>
          </div>
        `
        
        overlay.appendChild(modal)
        document.body.appendChild(overlay)
      })
      await takeScreenshot(page, 'modal-light')
    })

    test('should match modal in dark theme', async ({ page }) => {
      await switchTheme(page, 'dark')
      await page.evaluate(() => {
        const overlay = document.createElement('div')
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;'
        
        const modal = document.createElement('div')
        modal.style.cssText = 'background: #1f2937; border-radius: 8px; padding: 24px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;'
        modal.innerHTML = `
          <h2 style="margin: 0 0 16px 0; color: white;">Modal Dialog</h2>
          <p style="margin: 0 0 20px 0; color: #d1d5db;">This is a modal dialog component.</p>
          <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button style="padding: 8px 16px; border: 1px solid #374151; background: #1f2937; color: #d1d5db; border-radius: 4px;">Cancel</button>
            <button style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px;">Confirm</button>
          </div>
        `
        
        overlay.appendChild(modal)
        document.body.appendChild(overlay)
      })
      await takeScreenshot(page, 'modal-dark')
    })
  })

  test.describe('Navigation Components', () => {
    test('should match navigation in light theme', async ({ page }) => {
      await page.evaluate(() => {
        const nav = document.createElement('nav')
        nav.style.cssText = 'background: white; border-bottom: 1px solid #e5e7eb; padding: 12px 20px;'
        nav.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; max-width: 1200px; margin: 0 auto;">
            <div style="font-weight: bold; font-size: 18px;">Logo</div>
            <div style="display: flex; gap: 24px;">
              <a href="#" style="text-decoration: none; color: #374151;">Home</a>
              <a href="#" style="text-decoration: none; color: #374151;">Dashboard</a>
              <a href="#" style="text-decoration: none; color: #374151;">Settings</a>
              <a href="#" style="text-decoration: none; color: #3b82f6;">Profile</a>
            </div>
            <div>
              <button style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px;">Sign Out</button>
            </div>
          </div>
        `
        document.body.appendChild(nav)
      })
      await takeScreenshot(page, 'navigation-light')
    })

    test('should match navigation in dark theme', async ({ page }) => {
      await switchTheme(page, 'dark')
      await page.evaluate(() => {
        const nav = document.createElement('nav')
        nav.style.cssText = 'background: #1f2937; border-bottom: 1px solid #374151; padding: 12px 20px;'
        nav.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; max-width: 1200px; margin: 0 auto;">
            <div style="font-weight: bold; font-size: 18px; color: white;">Logo</div>
            <div style="display: flex; gap: 24px;">
              <a href="#" style="text-decoration: none; color: #d1d5db;">Home</a>
              <a href="#" style="text-decoration: none; color: #d1d5db;">Dashboard</a>
              <a href="#" style="text-decoration: none; color: #d1d5db;">Settings</a>
              <a href="#" style="text-decoration: none; color: #60a5fa;">Profile</a>
            </div>
            <div>
              <button style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px;">Sign Out</button>
            </div>
          </div>
        `
        document.body.appendChild(nav)
      })
      await takeScreenshot(page, 'navigation-dark')
    })

    test('should match mobile navigation', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.evaluate(() => {
        const nav = document.createElement('nav')
        nav.style.cssText = 'background: white; border-bottom: 1px solid #e5e7eb; padding: 8px 16px; position: relative;'
        nav.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="font-weight: bold; font-size: 16px;">Logo</div>
            <button style="border: none; background: none; font-size: 20px;">☰</button>
          </div>
          <div style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border-bottom: 1px solid #e5e7eb; padding: 16px;">
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <a href="#" style="text-decoration: none; color: #374151;">Home</a>
              <a href="#" style="text-decoration: none; color: #374151;">Dashboard</a>
              <a href="#" style="text-decoration: none; color: #374151;">Settings</a>
            </div>
          </div>
        `
        document.body.appendChild(nav)
      })
      await takeScreenshot(page, 'navigation-mobile')
    })
  })

  test.describe('Loading States', () => {
    test('should match loading spinner', async ({ page }) => {
      await page.evaluate(() => {
        const container = document.createElement('div')
        container.style.cssText = 'padding: 40px; display: flex; justify-content: center; align-items: center; min-height: 200px;'
        container.innerHTML = `
          <div style="width: 40px; height: 40px; border: 4px solid #f3f4f6; border-top: 4px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          <style>
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        `
        document.body.appendChild(container)
      })
      await takeScreenshot(page, 'loading-spinner')
    })

    test('should match skeleton loading', async ({ page }) => {
      await page.evaluate(() => {
        const container = document.createElement('div')
        container.style.cssText = 'padding: 20px; max-width: 600px;'
        container.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div style="display: flex; gap: 12px;">
              <div style="width: 48px; height: 48px; background: #f3f4f6; border-radius: 50%;"></div>
              <div style="flex: 1;">
                <div style="height: 16px; background: #f3f4f6; border-radius: 4px; margin-bottom: 8px; width: 60%;"></div>
                <div style="height: 12px; background: #f3f4f6; border-radius: 4px; width: 40%;"></div>
              </div>
            </div>
            <div style="height: 100px; background: #f3f4f6; border-radius: 8px;"></div>
            <div style="display: flex; gap: 8px;">
              <div style="height: 32px; background: #f3f4f6; border-radius: 4px; width: 80px;"></div>
              <div style="height: 32px; background: #f3f4f6; border-radius: 4px; width: 100px;"></div>
            </div>
          </div>
        `
        document.body.appendChild(container)
      })
      await takeScreenshot(page, 'skeleton-loading')
    })
  })

  test.describe('Error States', () => {
    test('should match error message display', async ({ page }) => {
      await page.evaluate(() => {
        const container = document.createElement('div')
        container.style.cssText = 'padding: 20px; max-width: 600px;'
        container.innerHTML = `
          <div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; color: #991b1b;">
            <h3 style="margin: 0 0 8px 0;">Error Occurred</h3>
            <p style="margin: 0;">Something went wrong. Please try again.</p>
          </div>
          <div style="background: #fef3c7; border: 1px solid #fed7aa; border-radius: 8px; padding: 16px; color: #92400e; margin-top: 16px;">
            <h3 style="margin: 0 0 8px 0;">Warning</h3>
            <p style="margin: 0;">Please check your input and try again.</p>
          </div>
          <div style="background: #dbeafe; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; color: #1e40af; margin-top: 16px;">
            <h3 style="margin: 0 0 8px 0;">Info</h3>
            <p style="margin: 0;">This is an informational message.</p>
          </div>
        `
        document.body.appendChild(container)
      })
      await takeScreenshot(page, 'error-states')
    })

    test('should match empty state display', async ({ page }) => {
      await page.evaluate(() => {
        const container = document.createElement('div')
        container.style.cssText = 'padding: 40px; text-align: center; max-width: 600px;'
        container.innerHTML = `
          <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;">📝</div>
          <h3 style="margin: 0 0 8px 0; color: #6b7280;">No items found</h3>
          <p style="margin: 0 0 20px 0; color: #9ca3af;">Get started by creating your first item.</p>
          <button style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 6px;">Create Item</button>
        `
        document.body.appendChild(container)
      })
      await takeScreenshot(page, 'empty-state')
    })
  })
})