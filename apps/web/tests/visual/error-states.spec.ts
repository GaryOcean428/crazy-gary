import { test, expect } from '../fixtures'
import { takeScreenshot, switchTheme } from '../utils'

test.describe('Error States and Loading States', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Error Boundary States', () => {
    test('should render error boundary with fallback UI', async ({ page }) => {
      await page.evaluate(() => {
        const errorContainer = document.createElement('div')
        errorContainer.style.cssText = 'padding: 40px; text-align: center; max-width: 600px; margin: 0 auto;'
        errorContainer.innerHTML = `
          <div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 8px; padding: 24px; color: #991b1b;">
            <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
            <h2 style="margin: 0 0 12px 0;">Something went wrong</h2>
            <p style="margin: 0 0 20px 0;">An unexpected error has occurred. Please try refreshing the page.</p>
            <div style="display: flex; gap: 12px; justify-content: center;">
              <button style="padding: 10px 20px; background: #dc2626; color: white; border: none; border-radius: 6px;">
                Try Again
              </button>
              <button style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 6px;">
                Go Home
              </button>
            </div>
          </div>
          <details style="margin-top: 20px;">
            <summary style="cursor: pointer; color: #6b7280;">Technical Details</summary>
            <pre style="background: #f3f4f6; padding: 12px; border-radius: 4px; overflow: auto; text-align: left; margin-top: 8px; font-size: 12px;">
Error: Component rendering failed
    at Component.render (Component.js:15:10)
    at ReactDOM.render (ReactDOM.js:25:5)
            </pre>
          </details>
        `
        document.body.appendChild(errorContainer)
      })
      await takeScreenshot(page, 'error-boundary-default')
    })

    test('should render error boundary in dark theme', async ({ page }) => {
      await switchTheme(page, 'dark')
      await page.evaluate(() => {
        const errorContainer = document.createElement('div')
        errorContainer.style.cssText = 'padding: 40px; text-align: center; max-width: 600px; margin: 0 auto;'
        errorContainer.innerHTML = `
          <div style="background: #7f1d1d; border: 1px solid #991b1b; border-radius: 8px; padding: 24px; color: #fca5a5;">
            <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
            <h2 style="margin: 0 0 12px 0;">Something went wrong</h2>
            <p style="margin: 0 0 20px 0;">An unexpected error has occurred. Please try refreshing the page.</p>
            <div style="display: flex; gap: 12px; justify-content: center;">
              <button style="padding: 10px 20px; background: #dc2626; color: white; border: none; border-radius: 6px;">
                Try Again
              </button>
              <button style="padding: 10px 20px; background: #4b5563; color: white; border: none; border-radius: 6px;">
                Go Home
              </button>
            </div>
          </div>
        `
        document.body.appendChild(errorContainer)
      })
      await takeScreenshot(page, 'error-boundary-dark')
    })
  })

  test.describe('Network Error States', () => {
    test('should display network error page', async ({ page }) => {
      await page.evaluate(() => {
        const errorContainer = document.createElement('div')
        errorContainer.style.cssText = 'padding: 40px; text-align: center; max-width: 600px; margin: 0 auto;'
        errorContainer.innerHTML = `
          <div style="font-size: 64px; margin-bottom: 20px;">🔌</div>
          <h1 style="margin: 0 0 16px 0; color: #dc2626;">Connection Lost</h1>
          <p style="margin: 0 0 24px 0; color: #6b7280;">
            We're having trouble connecting to our servers. Please check your internet connection and try again.
          </p>
          <div style="display: flex; gap: 12px; justify-content: center;">
            <button style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 6px;">
              Retry Connection
            </button>
            <button style="padding: 12px 24px; background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; border-radius: 6px;">
              Go Offline
            </button>
          </div>
          <div style="margin-top: 32px; padding: 16px; background: #fef3c7; border: 1px solid #fed7aa; border-radius: 6px; color: #92400e;">
            <strong>Tip:</strong> Make sure you're connected to the internet and try refreshing the page.
          </div>
        `
        document.body.appendChild(errorContainer)
      })
      await takeScreenshot(page, 'network-error')
    })

    test('should display API error response', async ({ page }) => {
      await page.evaluate(() => {
        const errorContainer = document.createElement('div')
        errorContainer.style.cssText = 'padding: 40px; text-align: center; max-width: 600px; margin: 0 auto;'
        errorContainer.innerHTML = `
          <div style="font-size: 64px; margin-bottom: 20px;">❌</div>
          <h1 style="margin: 0 0 16px 0; color: #dc2626;">Request Failed</h1>
          <div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: left;">
            <h3 style="margin: 0 0 12px 0; color: #991b1b;">Error Details</h3>
            <div style="margin-bottom: 8px;"><strong>Status:</strong> <span style="color: #dc2626;">500 Internal Server Error</span></div>
            <div style="margin-bottom: 8px;"><strong>Message:</strong> <span style="color: #374151;">Internal server error occurred</span></div>
            <div style="margin-bottom: 8px;"><strong>Request ID:</strong> <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">req_123456789</code></div>
            <div><strong>Timestamp:</strong> <span style="color: #6b7280;">2024-01-15 10:30:45 UTC</span></div>
          </div>
          <button style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 6px;">
            Try Again
          </button>
        `
        document.body.appendChild(errorContainer)
      })
      await takeScreenshot(page, 'api-error')
    })
  })

  test.describe('Validation Error States', () => {
    test('should display form validation errors', async ({ page }) => {
      await page.evaluate(() => {
        const form = document.createElement('div')
        form.style.cssText = 'padding: 20px; max-width: 500px; margin: 0 auto;'
        form.innerHTML = `
          <h2 style="margin: 0 0 24px 0;">Contact Form</h2>
          <form style="display: flex; flex-direction: column; gap: 16px;">
            <div>
              <label style="display: block; margin-bottom: 4px;">Email *</label>
              <input type="email" value="invalid-email" style="width: 100%; padding: 12px; border: 2px solid #dc2626; border-radius: 4px;" />
              <div style="color: #dc2626; font-size: 14px; margin-top: 4px;">
                Please enter a valid email address
              </div>
            </div>
            <div>
              <label style="display: block; margin-bottom: 4px;">Password *</label>
              <input type="password" value="123" style="width: 100%; padding: 12px; border: 2px solid #dc2626; border-radius: 4px;" />
              <div style="color: #dc2626; font-size: 14px; margin-top: 4px;">
                Password must be at least 8 characters long
              </div>
            </div>
            <div>
              <label style="display: block; margin-bottom: 4px;">Phone Number</label>
              <input type="tel" value="123" style="width: 100%; padding: 12px; border: 2px solid #dc2626; border-radius: 4px;" />
              <div style="color: #dc2626; font-size: 14px; margin-top: 4px;">
                Please enter a valid phone number
              </div>
            </div>
            <button type="submit" style="padding: 12px 24px; background: #dc2626; color: white; border: none; border-radius: 6px;">
              Submit (3 errors)
            </button>
          </form>
        `
        document.body.appendChild(form)
      })
      await takeScreenshot(page, 'validation-errors')
    })

    test('should display field-level validation errors', async ({ page }) => {
      await page.evaluate(() => {
        const form = document.createElement('div')
        form.style.cssText = 'padding: 20px; max-width: 500px; margin: 0 auto;'
        form.innerHTML = `
          <h2 style="margin: 0 0 24px 0;">User Profile</h2>
          <form style="display: flex; flex-direction: column; gap: 20px;">
            <div style="border: 2px solid #dc2626; border-radius: 8px; padding: 16px;">
              <label style="display: block; margin-bottom: 4px; color: #dc2626;">Profile Picture</label>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 64px; height: 64px; border: 2px dashed #dc2626; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #dc2626;">
                  📷
                </div>
                <div>
                  <button type="button" style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px;">
                    Upload Photo
                  </button>
                  <div style="color: #dc2626; font-size: 14px; margin-top: 4px;">
                    Please upload a profile picture
                  </div>
                </div>
              </div>
            </div>
            <div style="border: 2px solid #10b981; border-radius: 8px; padding: 16px;">
              <label style="display: block; margin-bottom: 4px; color: #10b981;">Bio</label>
              <textarea style="width: 100%; padding: 12px; border: 2px solid #10b981; border-radius: 4px; height: 80px;">This is a valid bio text that meets the requirements.</textarea>
              <div style="color: #10b981; font-size: 14px; margin-top: 4px;">
                ✓ Looks good!
              </div>
            </div>
          </form>
        `
        document.body.appendChild(form)
      })
      await takeScreenshot(page, 'field-validation-mixed')
    })
  })

  test.describe('Loading States', () => {
    test('should display loading spinner', async ({ page }) => {
      await page.evaluate(() => {
        const loading = document.createElement('div')
        loading.style.cssText = 'padding: 40px; text-align: center;'
        loading.innerHTML = `
          <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f4f6; border-top: 4px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          <p style="margin: 16px 0 0 0; color: #6b7280;">Loading content...</p>
          <style>
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        `
        document.body.appendChild(loading)
      })
      await takeScreenshot(page, 'loading-spinner')
    })

    test('should display skeleton loading', async ({ page }) => {
      await page.evaluate(() => {
        const skeleton = document.createElement('div')
        skeleton.style.cssText = 'padding: 20px; max-width: 600px; margin: 0 auto;'
        skeleton.innerHTML = `
          <h2 style="margin: 0 0 20px 0;">Loading Content</h2>
          <div style="display: flex; gap: 16px; margin-bottom: 20px;">
            <div style="width: 64px; height: 64px; background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%); background-size: 200% 100%; animation: shimmer 2s infinite; border-radius: 50%;"></div>
            <div style="flex: 1;">
              <div style="height: 20px; background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%); background-size: 200% 100%; animation: shimmer 2s infinite; border-radius: 4px; margin-bottom: 8px; width: 60%;"></div>
              <div style="height: 16px; background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%); background-size: 200% 100%; animation: shimmer 2s infinite; border-radius: 4px; width: 40%;"></div>
            </div>
          </div>
          <div style="space-y: 12px;">
            <div style="height: 16px; background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%); background-size: 200% 100%; animation: shimmer 2s infinite; border-radius: 4px; margin-bottom: 12px; width: 100%;"></div>
            <div style="height: 16px; background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%); background-size: 200% 100%; animation: shimmer 2s infinite; border-radius: 4px; margin-bottom: 12px; width: 90%;"></div>
            <div style="height: 16px; background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%); background-size: 200% 100%; animation: shimmer 2s infinite; border-radius: 4px; margin-bottom: 12px; width: 80%;"></div>
          </div>
          <div style="display: flex; gap: 12px; margin-top: 20px;">
            <div style="width: 100px; height: 36px; background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%); background-size: 200% 100%; animation: shimmer 2s infinite; border-radius: 6px;"></div>
            <div style="width: 120px; height: 36px; background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%); background-size: 200% 100%; animation: shimmer 2s infinite; border-radius: 6px;"></div>
          </div>
          <style>
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
          </style>
        `
        document.body.appendChild(skeleton)
      })
      await takeScreenshot(page, 'loading-skeleton')
    })

    test('should display loading progress bar', async ({ page }) => {
      await page.evaluate(() => {
        const progress = document.createElement('div')
        progress.style.cssText = 'padding: 40px; text-align: center; max-width: 400px; margin: 0 auto;'
        progress.innerHTML = `
          <h3 style="margin: 0 0 20px 0;">Uploading File...</h3>
          <div style="background: #f3f4f6; border-radius: 8px; height: 8px; overflow: hidden; margin-bottom: 12px;">
            <div style="background: #3b82f6; height: 100%; width: 65%; animation: progress 3s ease-in-out infinite;"></div>
          </div>
          <p style="margin: 0; color: #6b7280;">65% complete</p>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: #9ca3af;">Processing document.pdf</p>
          <style>
            @keyframes progress {
              0%, 100% { width: 65%; }
              50% { width: 75%; }
            }
          </style>
        `
        document.body.appendChild(progress)
      })
      await takeScreenshot(page, 'loading-progress')
    })

    test('should display button loading state', async ({ page }) => {
      await page.evaluate(() => {
        const buttonContainer = document.createElement('div')
        buttonContainer.style.cssText = 'padding: 20px; display: flex; gap: 16px; justify-content: center;'
        buttonContainer.innerHTML = `
          <button style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 6px; display: flex; align-items: center; gap: 8px; cursor: not-allowed;">
            <div style="width: 16px; height: 16px; border: 2px solid transparent; border-top: 2px solid white; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            Loading...
          </button>
          <button style="padding: 12px 24px; background: #10b981; color: white; border: none; border-radius: 6px; display: flex; align-items: center; gap: 8px; cursor: not-allowed;">
            <div style="width: 16px; height: 16px; border: 2px solid transparent; border-top: 2px solid white; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            Processing...
          </button>
          <style>
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        `
        document.body.appendChild(buttonContainer)
      })
      await takeScreenshot(page, 'button-loading-states')
    })

    test('should display table loading state', async ({ page }) => {
      await page.evaluate(() => {
        const tableContainer = document.createElement('div')
        tableContainer.style.cssText = 'padding: 20px; max-width: 800px; margin: 0 auto;'
        tableContainer.innerHTML = `
          <h3 style="margin: 0 0 20px 0;">Loading Data...</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Name</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Email</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Status</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${Array.from({ length: 5 }, () => `
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #f3f4f6;">
                    <div style="height: 16px; background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%); background-size: 200% 100%; animation: shimmer 2s infinite; border-radius: 4px; width: 120px;"></div>
                  </td>
                  <td style="padding: 12px; border-bottom: 1px solid #f3f4f6;">
                    <div style="height: 16px; background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%); background-size: 200% 100%; animation: shimmer 2s infinite; border-radius: 4px; width: 180px;"></div>
                  </td>
                  <td style="padding: 12px; border-bottom: 1px solid #f3f4f6;">
                    <div style="height: 20px; background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%); background-size: 200% 100%; animation: shimmer 2s infinite; border-radius: 4px; width: 80px;"></div>
                  </td>
                  <td style="padding: 12px; border-bottom: 1px solid #f3f4f6;">
                    <div style="display: flex; gap: 8px;">
                      <div style="height: 24px; width: 60px; background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%); background-size: 200% 100%; animation: shimmer 2s infinite; border-radius: 4px;"></div>
                      <div style="height: 24px; width: 60px; background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%); background-size: 200% 100%; animation: shimmer 2s infinite; border-radius: 4px;"></div>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <style>
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
          </style>
        `
        document.body.appendChild(tableContainer)
      })
      await takeScreenshot(page, 'table-loading')
    })
  })

  test.describe('Empty States', () => {
    test('should display empty data state', async ({ page }) => {
      await page.evaluate(() => {
        const emptyState = document.createElement('div')
        emptyState.style.cssText = 'padding: 60px 20px; text-align: center; max-width: 500px; margin: 0 auto;'
        emptyState.innerHTML = `
          <div style="font-size: 64px; margin-bottom: 20px; opacity: 0.3;">📊</div>
          <h3 style="margin: 0 0 12px 0; color: #6b7280;">No data available</h3>
          <p style="margin: 0 0 24px 0; color: #9ca3af;">
            There's no data to display at the moment. Start by adding some content to get insights.
          </p>
          <div style="display: flex; gap: 12px; justify-content: center;">
            <button style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 6px;">
              Add Data
            </button>
            <button style="padding: 12px 24px; background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; border-radius: 6px;">
              Import File
            </button>
          </div>
        `
        document.body.appendChild(emptyState)
      })
      await takeScreenshot(page, 'empty-data-state')
    })

    test('should display empty search results', async ({ page }) => {
      await page.evaluate(() => {
        const searchState = document.createElement('div')
        searchState.style.cssText = 'padding: 40px 20px; text-align: center; max-width: 400px; margin: 0 auto;'
        searchState.innerHTML = `
          <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;">🔍</div>
          <h3 style="margin: 0 0 8px 0; color: #374151;">No results found</h3>
          <p style="margin: 0 0 20px 0; color: #6b7280;">
            We couldn't find any items matching "nonexistent search"
          </p>
          <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <h4 style="margin: 0 0 12px 0; font-size: 14px; color: #374151;">Suggestions:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px;">
              <li>Check your spelling</li>
              <li>Try different keywords</li>
              <li>Use more general terms</li>
              <li>Remove some filters</li>
            </ul>
          </div>
          <button style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 6px;">
            Clear Search
          </button>
        `
        document.body.appendChild(searchState)
      })
      await takeScreenshot(page, 'empty-search-results')
    })

    test('should display offline state', async ({ page }) => {
      await page.evaluate(() => {
        const offlineState = document.createElement('div')
        offlineState.style.cssText = 'padding: 40px 20px; text-align: center; max-width: 400px; margin: 0 auto;'
        offlineState.innerHTML = `
          <div style="font-size: 64px; margin-bottom: 20px;">📱</div>
          <h3 style="margin: 0 0 12px 0; color: #374151;">You're offline</h3>
          <p style="margin: 0 0 24px 0; color: #6b7280;">
            Check your internet connection and try again.
          </p>
          <button style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 6px;">
            Try Again
          </button>
          <div style="margin-top: 24px; padding: 16px; background: #fef3c7; border: 1px solid #fed7aa; border-radius: 8px;">
            <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #92400e;">Available offline:</h4>
            <p style="margin: 0; font-size: 14px; color: #92400e;">
              Some features may still work. Check your dashboard for cached data.
            </p>
          </div>
        `
        document.body.appendChild(offlineState)
      })
      await takeScreenshot(page, 'offline-state')
    })
  })

  test.describe('Progressive Loading States', () => {
    test('should show content progressively loading', async ({ page }) => {
      await page.evaluate(() => {
        const container = document.createElement('div')
        container.style.cssText = 'padding: 20px; max-width: 600px; margin: 0 auto;'
        container.innerHTML = `
          <h2 style="margin: 0 0 20px 0;">Dashboard Overview</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
              <h4 style="margin: 0 0 8px 0; color: #6b7280;">Total Users</h4>
              <div style="height: 32px; background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%); background-size: 200% 100%; animation: shimmer 2s infinite; border-radius: 4px;"></div>
            </div>
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
              <h4 style="margin: 0 0 8px 0; color: #6b7280;">Revenue</h4>
              <div style="height: 32px; background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%); background-size: 200% 100%; animation: shimmer 2s infinite; border-radius: 4px;"></div>
            </div>
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
              <h4 style="margin: 0 0 8px 0; color: #6b7280;">Growth</h4>
              <div style="height: 32px; background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%); background-size: 200% 100%; animation: shimmer 2s infinite; border-radius: 4px;"></div>
            </div>
          </div>
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
            <h4 style="margin: 0 0 16px 0;">Recent Activity</h4>
            <div style="space-y: 12px;">
              <div style="display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                <div style="width: 40px; height: 40px; background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%); background-size: 200% 100%; animation: shimmer 2s infinite; border-radius: 50%;"></div>
                <div style="flex: 1;">
                  <div style="height: 16px; background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%); background-size: 200% 100%; animation: shimmer 2s infinite; border-radius: 4px; margin-bottom: 4px; width: 60%;"></div>
                  <div style="height: 14px; background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%); background-size: 200% 100%; animation: shimmer 2s infinite; border-radius: 4px; width: 40%;"></div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                <div style="width: 40px; height: 40px; background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%); background-size: 200% 100%; animation: shimmer 2s infinite; border-radius: 50%;"></div>
                <div style="flex: 1;">
                  <div style="height: 16px; background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%); background-size: 200% 100%; animation: shimmer 2s infinite; border-radius: 4px; margin-bottom: 4px; width: 70%;"></div>
                  <div style="height: 14px; background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%); background-size: 200% 100%; animation: shimmer 2s infinite; border-radius: 4px; width: 50%;"></div>
                </div>
              </div>
            </div>
          </div>
          <style>
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
          </style>
        `
        document.body.appendChild(container)
      })
      await takeScreenshot(page, 'progressive-loading')
    })
  })

  test.describe('Error States in Dark Theme', () => {
    test('should maintain error visibility in dark theme', async ({ page }) => {
      await switchTheme(page, 'dark')
      await page.evaluate(() => {
        const container = document.createElement('div')
        container.style.cssText = 'padding: 20px; max-width: 500px; margin: 0 auto;'
        container.innerHTML = `
          <h2 style="margin: 0 0 20px 0;">Form with Errors</h2>
          <div style="border: 2px solid #dc2626; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 4px; color: #fca5a5;">Required Field</label>
            <input type="text" style="width: 100%; padding: 12px; border: 2px solid #dc2626; background: #1f2937; color: white; border-radius: 4px;" />
            <div style="color: #fca5a5; font-size: 14px; margin-top: 4px;">
              This field is required
            </div>
          </div>
          <div style="background: #7f1d1d; border: 1px solid #991b1b; border-radius: 8px; padding: 16px; color: #fca5a5;">
            <h4 style="margin: 0 0 8px 0;">Server Error</h4>
            <p style="margin: 0; color: #d1d5db;">Unable to process your request. Please try again later.</p>
          </div>
        `
        document.body.appendChild(container)
      })
      await takeScreenshot(page, 'errors-dark-theme')
    })
  })
})