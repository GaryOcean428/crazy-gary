import { test, expect } from '../fixtures'
import { takeScreenshot, testResponsiveBreakpoints, switchTheme, visualTestConfig } from '../utils'

test.describe('Accessibility Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Focus Management', () => {
    test('should show focus indicators on interactive elements', async ({ page }) => {
      await page.evaluate(() => {
        const container = document.createElement('div')
        container.style.cssText = 'padding: 20px; max-width: 400px;'
        container.innerHTML = `
          <button style="padding: 10px 20px; margin: 5px; border: 2px solid #ccc; background: white;">Button 1</button>
          <button style="padding: 10px 20px; margin: 5px; border: 2px solid #ccc; background: white;">Button 2</button>
          <input type="text" placeholder="Text input" style="padding: 10px; margin: 5px; border: 2px solid #ccc; width: 200px;" />
          <a href="#" style="padding: 10px 20px; margin: 5px; display: inline-block; border: 2px solid #ccc;">Link</a>
        `
        document.body.appendChild(container)
      })

      // Test focus states for different elements
      const buttons = page.locator('button')
      const buttonCount = await buttons.count()
      
      for (let i = 0; i < Math.min(buttonCount, 3); i++) {
        await buttons.nth(i).focus()
        await page.waitForTimeout(200)
        await takeScreenshot(page, `focus-button-${i + 1}`)
      }

      const input = page.locator('input')
      await input.focus()
      await takeScreenshot(page, 'focus-input')
    })

    test('should maintain focus visibility in dark theme', async ({ page }) => {
      await switchTheme(page, 'dark')
      await page.evaluate(() => {
        const container = document.createElement('div')
        container.style.cssText = 'padding: 20px; max-width: 400px;'
        container.innerHTML = `
          <button style="padding: 10px 20px; margin: 5px; border: 2px solid #374151; background: #1f2937; color: white;">Dark Button</button>
          <input type="text" placeholder="Text input" style="padding: 10px; margin: 5px; border: 2px solid #374151; background: #1f2937; color: white; width: 200px;" />
        `
        document.body.appendChild(container)
      })

      await page.locator('button').focus()
      await page.waitForTimeout(200)
      await takeScreenshot(page, 'focus-dark-theme')
    })
  })

  test.describe('Color Contrast', () => {
    test('should maintain sufficient contrast in light theme', async ({ page }) => {
      await page.evaluate(() => {
        const container = document.createElement('div')
        container.style.cssText = 'padding: 20px; background: white; color: black;'
        container.innerHTML = `
          <h1 style="margin: 0 0 20px 0;">High Contrast Test</h1>
          <p style="margin: 0 0 10px 0;">This text should have high contrast against the background.</p>
          <button style="padding: 10px 20px; background: #000; color: #fff; border: none; margin: 5px;">High Contrast Button</button>
          <button style="padding: 10px 20px; background: #333; color: #fff; border: none; margin: 5px;">Medium Contrast Button</button>
          <a href="#" style="color: #0066cc; text-decoration: underline;">Link with good contrast</a>
        `
        document.body.appendChild(container)
      })
      await takeScreenshot(page, 'contrast-light-theme')
    })

    test('should maintain sufficient contrast in dark theme', async ({ page }) => {
      await switchTheme(page, 'dark')
      await page.evaluate(() => {
        const container = document.createElement('div')
        container.style.cssText = 'padding: 20px; background: #1a1a1a; color: white;'
        container.innerHTML = `
          <h1 style="margin: 0 0 20px 0;">High Contrast Test</h1>
          <p style="margin: 0 0 10px 0;">This text should have high contrast against the background.</p>
          <button style="padding: 10px 20px; background: #fff; color: #000; border: none; margin: 5px;">High Contrast Button</button>
          <button style="padding: 10px 20px; background: #ccc; color: #000; border: none; margin: 5px;">Medium Contrast Button</button>
          <a href="#" style="color: #66b3ff; text-decoration: underline;">Link with good contrast</a>
        `
        document.body.appendChild(container)
      })
      await takeScreenshot(page, 'contrast-dark-theme')
    })

    test('should handle reduced motion preferences', async ({ page }) => {
      await page.addStyleTag({
        content: `
          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `
      })

      await page.evaluate(() => {
        const container = document.createElement('div')
        container.style.cssText = 'padding: 20px;'
        container.innerHTML = `
          <div style="width: 100px; height: 100px; background: #3b82f6; border-radius: 50%; animation: pulse 2s infinite;"></div>
          <div style="width: 200px; height: 20px; background: #e5e7eb; margin: 20px 0; position: relative; overflow: hidden;">
            <div style="width: 40%; height: 100%; background: #3b82f6; animation: loading 2s infinite;"></div>
          </div>
          <style>
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.1); opacity: 0.7; }
            }
            @keyframes loading {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(250%); }
            }
          </style>
        `
        document.body.appendChild(container)
      })
      await takeScreenshot(page, 'reduced-motion')
    })
  })

  test.describe('Screen Reader Support', () => {
    test('should have proper ARIA labels and landmarks', async ({ page }) => {
      await page.evaluate(() => {
        const container = document.createElement('div')
        container.style.cssText = 'padding: 20px;'
        container.innerHTML = `
          <header role="banner">
            <nav role="navigation" aria-label="Main navigation">
              <ul style="list-style: none; padding: 0; display: flex; gap: 20px;">
                <li><a href="#" aria-label="Home page">Home</a></li>
                <li><a href="#" aria-label="About page">About</a></li>
                <li><a href="#" aria-label="Contact page">Contact</a></li>
              </ul>
            </nav>
          </header>
          <main role="main">
            <section aria-labelledby="main-heading">
              <h1 id="main-heading">Main Content</h1>
              <form role="form" aria-labelledby="form-heading">
                <h2 id="form-heading">Contact Form</h2>
                <div>
                  <label for="name">Name (required)</label>
                  <input id="name" type="text" aria-required="true" aria-describedby="name-error" />
                  <div id="name-error" role="alert" aria-live="polite" style="color: red; display: none;">
                    Please enter your name
                  </div>
                </div>
                <button type="submit" aria-describedby="submit-help">Submit</button>
                <div id="submit-help" class="sr-only">This will send your form data</div>
              </form>
            </section>
          </main>
          <aside role="complementary" aria-label="Related information">
            <h2>Related Links</h2>
            <ul>
              <li><a href="#" aria-label="Privacy policy">Privacy Policy</a></li>
              <li><a href="#" aria-label="Terms of service">Terms of Service</a></li>
            </ul>
          </aside>
          <footer role="contentinfo">
            <p>&copy; 2024 Your Company</p>
          </footer>
        `
        document.body.appendChild(container)
      })
      await takeScreenshot(page, 'aria-landmarks')
    })
  })

  test.describe('Keyboard Navigation', () => {
    test('should show tab order and focus management', async ({ page }) => {
      await page.evaluate(() => {
        const container = document.createElement('div')
        container.style.cssText = 'padding: 20px; max-width: 500px;'
        container.innerHTML = `
          <form>
            <div style="margin-bottom: 16px;">
              <label for="first-name">First Name</label>
              <input id="first-name" type="text" tabindex="1" style="display: block; margin-top: 4px; padding: 8px; border: 1px solid #ccc;" />
            </div>
            <div style="margin-bottom: 16px;">
              <label for="last-name">Last Name</label>
              <input id="last-name" type="text" tabindex="2" style="display: block; margin-top: 4px; padding: 8px; border: 1px solid #ccc;" />
            </div>
            <div style="margin-bottom: 16px;">
              <label for="email">Email</label>
              <input id="email" type="email" tabindex="3" style="display: block; margin-top: 4px; padding: 8px; border: 1px solid #ccc;" />
            </div>
            <button type="submit" tabindex="4" style="padding: 10px 20px;">Submit</button>
            <button type="reset" tabindex="5" style="padding: 10px 20px; margin-left: 8px;">Reset</button>
          </form>
        `
        document.body.appendChild(container)
      })

      // Simulate keyboard navigation
      await page.keyboard.press('Tab')
      await takeScreenshot(page, 'keyboard-nav-1')

      await page.keyboard.press('Tab')
      await takeScreenshot(page, 'keyboard-nav-2')

      await page.keyboard.press('Tab')
      await takeScreenshot(page, 'keyboard-nav-3')

      await page.keyboard.press('Tab')
      await takeScreenshot(page, 'keyboard-nav-4')
    })

    test('should handle skip links', async ({ page }) => {
      await page.evaluate(() => {
        const container = document.createElement('div')
        container.style.cssText = 'padding: 20px;'
        container.innerHTML = `
          <a href="#main-content" class="skip-link" style="position: absolute; top: -40px; left: 6px; background: #000; color: #fff; padding: 8px; text-decoration: none; z-index: 1000;">
            Skip to main content
          </a>
          <nav style="background: #f3f4f6; padding: 10px; margin-bottom: 20px;">
            <a href="#" style="margin-right: 15px;">Nav Item 1</a>
            <a href="#" style="margin-right: 15px;">Nav Item 2</a>
            <a href="#" style="margin-right: 15px;">Nav Item 3</a>
          </nav>
          <main id="main-content" style="padding: 20px; border: 1px solid #e5e7eb;">
            <h1>Main Content Area</h1>
            <p>This is the main content that should be accessible via skip link.</p>
          </main>
        `
        document.body.appendChild(container)
      })

      // Press Tab to show skip link
      await page.keyboard.press('Tab')
      await takeScreenshot(page, 'skip-link-visible')

      // Press Enter on skip link
      await page.keyboard.press('Enter')
      await takeScreenshot(page, 'skip-link-focused-main')
    })
  })

  test.describe('High Contrast Mode', () => {
    test('should render correctly in high contrast mode', async ({ page }) => {
      // Simulate high contrast mode
      await page.addStyleTag({
        content: `
          * {
            background-color: white !important;
            color: black !important;
            border-color: black !important;
          }
          button, input, select, textarea {
            background-color: white !important;
            color: black !important;
            border: 2px solid black !important;
          }
          a {
            color: blue !important;
            text-decoration: underline !important;
          }
          .high-contrast-border {
            border: 3px solid black !important;
          }
        `
      })

      await page.evaluate(() => {
        const container = document.createElement('div')
        container.style.cssText = 'padding: 20px;'
        container.innerHTML = `
          <h1>High Contrast Mode Test</h1>
          <button>Button 1</button>
          <button>Button 2</button>
          <input type="text" placeholder="Text input" />
          <a href="#">Link text</a>
          <div style="border: 1px solid; padding: 10px; margin: 10px 0;">
            Box with border
          </div>
        `
        document.body.appendChild(container)
      })
      await takeScreenshot(page, 'high-contrast-mode')
    })
  })

  test.describe('Responsive Accessibility', () => {
    test('should maintain accessibility on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      
      await page.evaluate(() => {
        const container = document.createElement('div')
        container.style.cssText = 'padding: 10px;'
        container.innerHTML = `
          <nav style="background: #f3f4f6; padding: 10px; position: relative;">
            <button aria-label="Toggle menu" style="background: none; border: none; font-size: 18px;">☰</button>
            <div style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #ccc;">
              <a href="#" style="display: block; padding: 10px; text-decoration: none; color: #000;">Mobile Link 1</a>
              <a href="#" style="display: block; padding: 10px; text-decoration: none; color: #000;">Mobile Link 2</a>
            </div>
          </nav>
          <main style="padding: 10px;">
            <h1 style="font-size: 18px;">Mobile Accessible Content</h1>
            <button style="padding: 12px 20px; width: 100%; margin: 5px 0;">Full Width Button</button>
            <input type="text" placeholder="Mobile input" style="padding: 12px; width: 100%; margin: 5px 0;" />
          </main>
        `
        document.body.appendChild(container)
      })
      await takeScreenshot(page, 'mobile-accessibility')
    })
  })
})

test.describe('Responsive Visual Tests', () => {
  test.describe('Breakpoint Testing', () => {
    test('should maintain layout integrity across all breakpoints', async ({ page }) => {
      await page.goto('/')
      
      for (const breakpoint of visualTestConfig.breakpoints) {
        await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height })
        await page.waitForTimeout(300)
        await takeScreenshot(page, `homepage-${breakpoint.name}`, { fullPage: true })
      }
    })

    test('should handle responsive navigation', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Test navigation at different breakpoints
      await page.setViewportSize({ width: 1024, height: 768 })
      await takeScreenshot(page, 'dashboard-nav-desktop')

      await page.setViewportSize({ width: 768, height: 1024 })
      await takeScreenshot(page, 'dashboard-nav-tablet')

      await page.setViewportSize({ width: 320, height: 568 })
      await takeScreenshot(page, 'dashboard-nav-mobile')
    })

    test('should maintain form usability on mobile', async ({ page }) => {
      await page.goto('/login')
      await page.setViewportSize({ width: 320, height: 568 })
      
      await page.evaluate(() => {
        // Add mobile-specific styles
        const style = document.createElement('style')
        style.textContent = `
          @media (max-width: 768px) {
            input, button, select, textarea {
              font-size: 16px; /* Prevent zoom on iOS */
            }
          }
        `
        document.head.appendChild(style)
      })
      
      await takeScreenshot(page, 'login-mobile-form', { fullPage: true })
    })

    test('should handle responsive data tables', async ({ page }) => {
      await page.goto('/settings')
      await page.setViewportSize({ width: 1024, height: 768 })
      
      await page.evaluate(() => {
        const table = document.createElement('table')
        table.style.cssText = 'width: 100%; border-collapse: collapse; margin: 20px 0;'
        table.innerHTML = `
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 12px; border: 1px solid #d1d5db; text-align: left;">ID</th>
              <th style="padding: 12px; border: 1px solid #d1d5db; text-align: left;">Name</th>
              <th style="padding: 12px; border: 1px solid #d1d5db; text-align: left;">Email</th>
              <th style="padding: 12px; border: 1px solid #d1d5db; text-align: left;">Status</th>
              <th style="padding: 12px; border: 1px solid #d1d5db; text-align: left;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 12px; border: 1px solid #d1d5db;">1</td>
              <td style="padding: 12px; border: 1px solid #d1d5db;">John Doe</td>
              <td style="padding: 12px; border: 1px solid #d1d5db;">john@example.com</td>
              <td style="padding: 12px; border: 1px solid #d1d5db;">Active</td>
              <td style="padding: 12px; border: 1px solid #d1d5db;">
                <button style="padding: 4px 8px; margin-right: 4px;">Edit</button>
                <button style="padding: 4px 8px;">Delete</button>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #d1d5db;">2</td>
              <td style="padding: 12px; border: 1px solid #d1d5db;">Jane Smith</td>
              <td style="padding: 12px; border: 1px solid #d1d5db;">jane@example.com</td>
              <td style="padding: 12px; border: 1px solid #d1d5db;">Inactive</td>
              <td style="padding: 12px; border: 1px solid #d1d5db;">
                <button style="padding: 4px 8px; margin-right: 4px;">Edit</button>
                <button style="padding: 4px 8px;">Delete</button>
              </td>
            </tr>
          </tbody>
        `
        document.body.appendChild(table)
      })
      
      await takeScreenshot(page, 'data-table-desktop')

      // Test mobile view
      await page.setViewportSize({ width: 320, height: 568 })
      await takeScreenshot(page, 'data-table-mobile')
    })
  })

  test.describe('Touch Interface', () => {
    test('should provide adequate touch targets on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      
      await page.evaluate(() => {
        const container = document.createElement('div')
        container.style.cssText = 'padding: 10px;'
        container.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <button style="padding: 16px; min-height: 44px;">Touch Target 1</button>
            <button style="padding: 16px; min-height: 44px;">Touch Target 2</button>
            <input type="checkbox" id="checkbox1" style="width: 24px; height: 24px;" />
            <label for="checkbox1">Large checkbox with label</label>
            <a href="#" style="display: block; padding: 16px; text-decoration: none; background: #f3f4f6; border-radius: 4px;">Touch Link</a>
          </div>
        `
        document.body.appendChild(container)
      })
      await takeScreenshot(page, 'touch-targets-mobile')
    })
  })
})