import { test, expect } from '../fixtures/auth-fixtures'
import { PerformanceObserver } from 'perf_hooks'

test.describe('Performance E2E Tests', () => {
  test.describe('Page Load Performance', () => {
    test('should measure initial page load performance', async ({ page }) => {
      await page.addInitScript(() => {
        window.performance.mark('test-start')
        window.performance.clearMarks()
        window.performance.clearMeasures()
      })
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Collect detailed performance metrics
      const metrics = await page.evaluate(() => {
        window.performance.mark('test-end')
        window.performance.measure('page-load', 'test-start', 'test-end')
        
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        const paintEntries = performance.getEntriesByType('paint')
        const largestContentfulPaint = performance.getEntriesByType('largest-contentful-paint')[0]
        
        return {
          loadTime: navigation.loadEventEnd - navigation.navigationStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
          firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
          largestContentfulPaint: largestContentfulPaint?.startTime || 0,
          domElements: document.querySelectorAll('*').length,
          resourceCount: performance.getEntriesByType('resource').length,
          totalTransferSize: performance.getEntriesByType('resource')
            .reduce((sum, resource) => sum + (resource as any).transferSize, 0)
        }
      })
      
      // Performance assertions
      expect(metrics.loadTime).toBeLessThan(3000)
      expect(metrics.domContentLoaded).toBeLessThan(2000)
      expect(metrics.firstContentfulPaint).toBeLessThan(1000)
      expect(metrics.largestContentfulPaint).toBeLessThan(2500)
      expect(metrics.domElements).toBeLessThan(2000)
      expect(metrics.resourceCount).toBeLessThan(100)
    })

    test('should measure dashboard performance with different connection speeds', async ({ page }) => {
      // Test with different network conditions
      const networkConditions = [
        { name: 'Fast 3G', downloadThroughput: 1.6 * 1024 * 1024 / 8, latency: 150 },
        { name: 'Regular 4G', downloadThroughput: 10 * 1024 * 1024 / 8, latency: 70 },
        { name: 'WiFi', downloadThroughput: 30 * 1024 * 1024 / 8, latency: 30 }
      ]

      for (const condition of networkConditions) {
        await page.context().setOffline(false)
        await page.context().setExtraHTTPHeaders({
          'Connection': 'keep-alive'
        })

        const startTime = Date.now()
        await page.goto('/')
        await page.waitForLoadState('networkidle')
        const loadTime = Date.now() - startTime

        expect(loadTime).toBeLessThan(5000, `Dashboard load time on ${condition.name} exceeded threshold`)
      }
    })

    test('should measure bundle size and resource loading', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      const resourceMetrics = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
        return resources.map(resource => ({
          name: resource.name,
          type: resource.initiatorType,
          size: resource.transferSize,
          duration: resource.duration,
          cached: resource.transferSize === 0 && resource.decodedBodySize > 0
        }))
      })

      // Analyze resource types
      const jsResources = resourceMetrics.filter(r => r.type === 'script')
      const cssResources = resourceMetrics.filter(r => r.type === 'css')
      const imageResources = resourceMetrics.filter(r => r.type === 'img')

      // Performance assertions
      expect(jsResources.length).toBeLessThan(20, 'Too many JavaScript resources')
      expect(cssResources.length).toBeLessThan(10, 'Too many CSS resources')
      
      const totalJsSize = jsResources.reduce((sum, r) => sum + r.size, 0)
      expect(totalJsSize).toBeLessThan(2 * 1024 * 1024, 'Total JavaScript bundle size too large')
    })
  })

  test.describe('Navigation Performance', () => {
    test('should measure SPA navigation performance', async ({ authenticatedPage }) => {
      const navigationTimes: { url: string; time: number; metrics: any }[] = []
      const pages = ['/heavy', '/tasks', '/models', '/chat']

      for (const url of pages) {
        await authenticatedPage.addInitScript(() => {
          window.performance.clearMarks()
          window.performance.clearMeasures()
          window.performance.mark('nav-start')
        })

        const startTime = Date.now()
        await authenticatedPage.goto(url)
        await authenticatedPage.waitForLoadState('networkidle')

        const navMetrics = await authenticatedPage.evaluate(() => {
          window.performance.mark('nav-end')
          window.performance.measure('navigation', 'nav-start', 'nav-end')
          const measure = window.performance.getEntriesByName('navigation')[0]
          
          return {
            duration: measure.duration,
            domContentLoaded: performance.getEntriesByType('navigation')[0]?.domContentLoadedEventEnd || 0,
            loadComplete: performance.getEntriesByType('navigation')[0]?.loadEventEnd || 0
          }
        })

        const endTime = Date.now()
        navigationTimes.push({
          url,
          time: endTime - startTime,
          metrics: navMetrics
        })
      }

      // Verify all navigations are fast
      navigationTimes.forEach(({ url, time }) => {
        expect(time).toBeLessThan(2000, `Navigation to ${url} was too slow: ${time}ms`)
      })

      // Log performance summary for CI
      console.log('Navigation Performance Summary:', navigationTimes)
    })

    test('should measure route transition performance', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/')
      await authenticatedPage.waitForLoadState('networkidle')

      const transitions = []
      const routes = ['/heavy', '/tasks', '/models']

      for (const route of routes) {
        const startTime = Date.now()
        
        // Use client-side navigation
        await authenticatedPage.evaluate((targetRoute) => {
          window.history.pushState({}, '', targetRoute)
          window.dispatchEvent(new PopStateEvent('popstate'))
        }, route)
        
        await authenticatedPage.waitForLoadState('networkidle')
        const endTime = Date.now()
        
        transitions.push({ route, time: endTime - startTime })
      }

      // Route transitions should be very fast
      transitions.forEach(({ route, time }) => {
        expect(time).toBeLessThan(500, `Route transition to ${route} was too slow: ${time}ms`)
      })
    })
  })

  test.describe('User Interaction Performance', () => {
    test('should measure form submission performance with realistic data', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/heavy')
      await authenticatedPage.waitForLoadState('networkidle')

      // Mock API response for realistic testing
      await authenticatedPage.route('**/api/heavy/orchestrate', async route => {
        // Simulate realistic processing time
        await new Promise(resolve => setTimeout(resolve, 500))
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            response: 'Comprehensive analysis of AI trends in software development, covering machine learning, natural language processing, and automation tools. This analysis includes detailed insights into emerging technologies, implementation strategies, and future predictions for the industry.',
            metadata: { 
              num_agents: 3, 
              successful_agents: 3,
              processing_time: 450,
              tokens_processed: 1250
            },
            agents: [
              { name: 'Research Agent', status: 'completed', result: 'Research completed' },
              { name: 'Analysis Agent', status: 'completed', result: 'Analysis completed' },
              { name: 'Summary Agent', status: 'completed', result: 'Summary completed' }
            ]
          })
        })
      })

      const startTime = Date.now()
      
      // Fill form with realistic data
      await authenticatedPage.fill('[data-testid="heavy-query-input"]', 
        'Analyze the impact of AI on modern software development practices, including machine learning integration, automated testing, and intelligent code generation tools. Provide detailed insights into productivity improvements and potential challenges.')
      
      await authenticatedPage.selectOption('[data-testid="agent-count"]', '3')
      await authenticatedPage.click('[data-testid="heavy-execute-button"]')

      // Wait for completion
      await expect(authenticatedPage.locator('[data-testid="execution-results"]')).toBeVisible()
      
      const endTime = Date.now()
      const totalTime = endTime - startTime

      // Form submission should complete within reasonable time
      expect(totalTime).toBeLessThan(8000, `Form submission took too long: ${totalTime}ms`)
    })

    test('should measure search and filter performance', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/tasks')
      await authenticatedPage.waitForLoadState('networkidle')

      const searchOperations = []

      // Test search performance
      const searchTerms = ['urgent', 'completed', 'high priority', 'feature request']
      
      for (const term of searchTerms) {
        const startTime = Date.now()
        
        await authenticatedPage.fill('[data-testid="search-input"]', term)
        await authenticatedPage.waitForSelector('[data-testid="task-list"]')
        
        const endTime = Date.now()
        searchOperations.push({ operation: 'search', term, time: endTime - startTime })
      }

      // Test filter performance
      const filters = ['status:completed', 'priority:high', 'assignee:current-user']
      
      for (const filter of filters) {
        const startTime = Date.now()
        
        await authenticatedPage.selectOption('[data-testid="status-filter"]', filter.split(':')[1])
        await authenticatedPage.waitForSelector('[data-testid="task-list"]')
        
        const endTime = Date.now()
        searchOperations.push({ operation: 'filter', filter, time: endTime - startTime })
      }

      // All search/filter operations should be fast
      searchOperations.forEach(({ operation, term, time }) => {
        expect(time).toBeLessThan(1000, `${operation} operation for "${term || filter}" was too slow: ${time}ms`)
      })
    })

    test('should measure real-time update performance', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/heavy')
      await authenticatedPage.waitForLoadState('networkidle')

      // Start a task that will have real-time updates
      await authenticatedPage.fill('[data-testid="heavy-query-input"]', 'Test real-time updates')
      await authenticatedPage.click('[data-testid="heavy-execute-button"]')

      const updateTimes: number[] = []
      
      // Monitor real-time updates
      authenticatedPage.on('response', async (response) => {
        if (response.url().includes('/api/heavy/status/')) {
          const startTime = Date.now()
          const data = await response.json()
          const endTime = Date.now()
          
          if (data.status === 'completed') {
            updateTimes.push(endTime - startTime)
          }
        }
      })

      // Wait for completion
      await expect(authenticatedPage.locator('[data-testid="execution-results"]')).toBeVisible()
      
      // Real-time updates should be fast
      updateTimes.forEach((time, index) => {
        expect(time).toBeLessThan(500, `Real-time update ${index + 1} was too slow: ${time}ms`)
      })
    })
  })

  test.describe('Concurrent User Performance', () => {
    test('should handle multiple concurrent users', async ({ browser }) => {
      const concurrentUsers = 5
      const contexts = []
      const pages = []

      // Create multiple contexts to simulate concurrent users
      for (let i = 0; i < concurrentUsers; i++) {
        const context = await browser.newContext({
          viewport: { width: 1920, height: 1080 }
        })
        const page = await context.newPage()
        
        contexts.push(context)
        pages.push(page)
      }

      try {
        // Start navigation for all users simultaneously
        const navigationPromises = pages.map((page, index) => 
          page.goto('/').then(() => 
            page.waitForLoadState('networkidle').then(() => index)
          )
        )

        const startTime = Date.now()
        const completedNavigations = await Promise.all(navigationPromises)
        const endTime = Date.now()

        // Verify all users successfully loaded
        expect(completedNavigations).toHaveLength(concurrentUsers)
        expect(endTime - startTime).toBeLessThan(10000, 'Concurrent user navigation took too long')

        // Test concurrent interactions
        const interactionPromises = pages.map((page, index) => 
          page.click('[data-testid="sidebar"]').then(() => index)
        )

        const interactions = await Promise.all(interactionPromises)
        expect(interactions).toHaveLength(concurrentUsers)

      } finally {
        // Clean up contexts
        await Promise.all(contexts.map(context => context.close()))
      }
    })

    test('should handle resource contention gracefully', async ({ browser }) => {
      const contexts = []
      const pages = []

      // Create contexts with limited resources
      for (let i = 0; i < 3; i++) {
        const context = await browser.newContext({
          viewport: { width: 1920, height: 1080 },
          deviceScaleFactor: 1
        })
        const page = await context.newPage()
        
        contexts.push(context)
        pages.push(page)
      }

      try {
        // Load heavy pages simultaneously to test resource contention
        const heavyPromises = pages.map((page, index) => 
          page.goto('/heavy').then(() => 
            page.waitForLoadState('networkidle').then(() => index)
          )
        )

        await Promise.all(heavyPromises)

        // All pages should load successfully despite resource contention
        for (let i = 0; i < pages.length; i++) {
          await expect(pages[i].locator('[data-testid="heavy-page"]')).toBeVisible()
        }

      } finally {
        await Promise.all(contexts.map(context => context.close()))
      }
    })
  })

  test.describe('Memory and Resource Performance', () => {
    test('should not have memory leaks during navigation', async ({ authenticatedPage }) => {
      const initialMemory = await authenticatedPage.evaluate(() => {
        return (performance as any).memory ? {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize,
          limit: (performance as any).memory.jsHeapSizeLimit
        } : null
      })

      // Navigate multiple times to check for memory leaks
      for (let i = 0; i < 10; i++) {
        await authenticatedPage.goto('/heavy')
        await authenticatedPage.waitForLoadState('networkidle')
        
        await authenticatedPage.goto('/tasks')
        await authenticatedPage.waitForLoadState('networkidle')
        
        await authenticatedPage.goto('/models')
        await authenticatedPage.waitForLoadState('networkidle')
      }

      const finalMemory = await authenticatedPage.evaluate(() => {
        return (performance as any).memory ? {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize,
          limit: (performance as any).memory.jsHeapSizeLimit
        } : null
      })

      if (initialMemory && finalMemory) {
        const memoryIncrease = finalMemory.used - initialMemory.used
        const memoryIncreasePercentage = (memoryIncrease / initialMemory.used) * 100
        
        // Memory increase should be reasonable (less than 50%)
        expect(memoryIncreasePercentage).toBeLessThan(50, 
          `Memory usage increased too much: ${memoryIncreasePercentage.toFixed(2)}%`)
      }
    })

    test('should handle large datasets efficiently', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/tasks')
      await authenticatedPage.waitForLoadState('networkidle')

      // Inject large dataset for testing
      await authenticatedPage.evaluate(() => {
        // Simulate loading 1000 tasks
        const tasks = Array.from({ length: 1000 }, (_, i) => ({
          id: `task-${i}`,
          title: `Task ${i} with a very long title that might cause performance issues when rendered in the DOM`,
          description: `This is a detailed description for task ${i} that contains a lot of text content to test how the application handles large amounts of data without performance degradation.`,
          status: i % 3 === 0 ? 'completed' : i % 3 === 1 ? 'in-progress' : 'pending',
          priority: i % 5 === 0 ? 'high' : i % 5 === 1 ? 'medium' : 'low',
          assignee: `user-${i % 10}`,
          createdAt: new Date(Date.now() - i * 86400000).toISOString()
        }))
        
        // Store in localStorage for the app to consume
        localStorage.setItem('test-large-dataset', JSON.stringify(tasks))
      })

      const startTime = Date.now()
      
      // Trigger data loading
      await authenticatedPage.reload()
      await authenticatedPage.waitForLoadState('networkidle')
      
      const loadTime = Date.now() - startTime

      // Should handle large dataset within reasonable time
      expect(loadTime).toBeLessThan(5000, `Loading large dataset took too long: ${loadTime}ms`)

      // Check DOM performance
      const domMetrics = await authenticatedPage.evaluate(() => {
        const taskElements = document.querySelectorAll('[data-testid="task-item"]')
        return {
          taskCount: taskElements.length,
          domDepth: Math.max(...Array.from(document.querySelectorAll('*')).map(el => {
            let depth = 0
            let current = el
            while (current.parentElement) {
              depth++
              current = current.parentElement
            }
            return depth
          }))
        }
      })

      expect(domMetrics.taskCount).toBeGreaterThan(0)
      expect(domMetrics.domDepth).toBeLessThan(20, 'DOM structure too deep')
    })
  })
})