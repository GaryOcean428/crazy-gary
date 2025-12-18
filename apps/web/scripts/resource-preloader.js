/**
 * Resource Preloading and Prefetching Utility
 * Generates preload, prefetch, and dns-prefetch directives for optimal performance
 */

import type { ManifestChunk } from 'vite'

interface PreloadConfig {
  priority: 'high' | 'low' | 'auto'
  preload?: boolean
  prefetch?: boolean
  dnsPrefetch?: boolean
  crossorigin?: boolean
}

interface ResourcePreloadMap {
  [key: string]: PreloadConfig
}

// Default resource preloading configuration
export const DEFAULT_RESOURCE_PRELOADS: ResourcePreloadMap = {
  // Critical CSS and JS
  'main.css': { priority: 'high', preload: true, crossorigin: true },
  'main.js': { priority: 'high', preload: true, crossorigin: true },
  
  // Vendor chunks
  'react-vendor': { priority: 'high', preload: true },
  'react-router': { priority: 'medium', preload: true },
  
  // Fonts
  'font.woff2': { priority: 'high', preload: true, crossorigin: true },
  'font.ttf': { priority: 'medium', preload: true, crossorigin: true },
  
  // Images
  'hero-image.jpg': { priority: 'high', preload: true },
  'logo.svg': { priority: 'high', preload: true },
  
  // Third-party resources
  'google-fonts': { priority: 'low', dnsPrefetch: true },
  'cdn-resources': { priority: 'low', dnsPrefetch: true },
  
  // Routes (for prefetching)
  '/dashboard': { priority: 'low', prefetch: true },
  '/analytics': { priority: 'low', prefetch: true },
  '/reports': { priority: 'low', prefetch: true }
}

/**
 * Generate HTML preload tags for critical resources
 */
export function generatePreloadTags(chunks: ManifestChunk[], config: ResourcePreloadMap = DEFAULT_RESOURCE_PRELOADS): string {
  const tags: string[] = []
  
  chunks.forEach(chunk => {
    const chunkName = getChunkName(chunk)
    const preloadConfig = config[chunkName]
    
    if (!preloadConfig) return
    
    if (preloadConfig.dnsPrefetch) {
      tags.push(`<link rel="dns-prefetch" href="${chunk.file}">`)
    }
    
    if (preloadConfig.preload) {
      const as = getFileType(chunk.file)
      const priority = preloadConfig.priority === 'high' ? ' fetchpriority="high"' : ''
      const crossorigin = preloadConfig.crossorigin ? ' crossorigin' : ''
      
      tags.push(`<link rel="preload" href="${chunk.file}" as="${as}"${priority}${crossorigin}>`)
    }
    
    if (preloadConfig.prefetch) {
      const as = getFileType(chunk.file)
      tags.push(`<link rel="prefetch" href="${chunk.file}" as="${as}">`)
    }
  })
  
  return tags.join('\n')
}

/**
 * Generate service worker preloading strategy
 */
export function generateServiceWorkerPreload(): string {
  return `
    // Service Worker Preloading Strategy
    const PRELOAD_CACHE_NAME = 'preload-cache-v1'
    const PRELOAD_RESOURCES = [
      '/',
      '/static/css/main.css',
      '/static/js/main.js',
      '/static/fonts/font.woff2',
      '/static/images/logo.svg'
    ]
    
    // Preload critical resources
    self.addEventListener('install', (event) => {
      event.waitUntil(
        caches.open(PRELOAD_CACHE_NAME)
          .then(cache => cache.addAll(PRELOAD_RESOURCES))
      )
    })
    
    // Preload on demand
    self.addEventListener('fetch', (event) => {
      if (event.request.destination === 'document') {
        // Preload associated resources for navigation
        event.respondWith(
          fetch(event.request).then(response => {
            // Trigger preloading of associated resources
            preloadAssociatedResources(event.request.url)
            return response
          })
        )
      }
    })
    
    function preloadAssociatedResources(url) {
      const resources = getAssociatedResources(url)
      resources.forEach(resource => {
        caches.open(PRELOAD_CACHE_NAME).then(cache => {
          cache.add(resource)
        })
      })
    }
    
    function getAssociatedResources(url) {
      // Logic to determine which resources to preload based on the current page
      return PRELOAD_RESOURCES
    }
  `
}

/**
 * Generate dynamic import preloading for routes
 */
export function generateRoutePreloading(): string {
  return `
    // Route-based preloading strategy
    const routePreloadMap = {
      '/dashboard': () => import('./pages/Dashboard.js'),
      '/analytics': () => import('./pages/Analytics.js'),
      '/reports': () => import('./pages/Reports.js'),
      '/settings': () => import('./pages/Settings.js')
    }
    
    // Preload routes based on user interaction patterns
    function preloadRoute(route) {
      if (routePreloadMap[route]) {
        routePreloadMap[route]().catch(() => {
          // Handle preload error gracefully
          console.warn(\`Failed to preload route: \${route}\`)
        })
      }
    }
    
    // Intersection Observer for viewport-based preloading
    function setupViewportPreloading() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const route = entry.target.getAttribute('data-preload-route')
            if (route) {
              preloadRoute(route)
              observer.unobserve(entry.target)
            }
          }
        })
      }, {
        rootMargin: '50px' // Start preloading 50px before entering viewport
      })
      
      // Observe elements with preload routes
      document.querySelectorAll('[data-preload-route]').forEach(el => {
        observer.observe(el)
      })
    }
    
    // Mouse/touch based preloading
    function setupInteractionPreloading() {
      // Preload on hover
      document.addEventListener('mouseover', (e) => {
        const link = e.target.closest('[data-preload-route]')
        if (link) {
          const route = link.getAttribute('data-preload-route')
          setTimeout(() => preloadRoute(route), 100)
        }
      })
      
      // Preload on touch
      document.addEventListener('touchstart', (e) => {
        const link = e.target.closest('[data-preload-route]')
        if (link) {
          const route = link.getAttribute('data-preload-route')
          preloadRoute(route)
        }
      })
    }
    
    // Initialize preloading strategies
    if (typeof window !== 'undefined') {
      setupViewportPreloading()
      setupInteractionPreloading()
    }
  `
}

/**
 * Generate performance metrics collection
 */
export function generatePerformanceMetrics(): string {
  return `
    // Performance metrics collection
    class PerformanceMonitor {
      constructor() {
        this.metrics = {}
        this.startTime = performance.now()
      }
      
      // Core Web Vitals
      collectCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          this.metrics.lcp = lastEntry.startTime
        }).observe({ entryTypes: ['largest-contentful-paint'] })
        
        // First Input Delay (FID)
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach(entry => {
            this.metrics.fid = entry.processingStart - entry.startTime
          })
        }).observe({ entryTypes: ['first-input'] })
        
        // Cumulative Layout Shift (CLS)
        let clsScore = 0
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach(entry => {
            if (!entry.hadRecentInput) {
              clsScore += entry.value
            }
          })
          this.metrics.cls = clsScore
        }).observe({ entryTypes: ['layout-shift'] })
      }
      
      // Bundle loading performance
      collectBundleMetrics() {
        // Measure resource loading times
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach(entry => {
            if (entry.name.includes('.js') || entry.name.includes('.css')) {
              const resourceName = entry.name.split('/').pop()
              this.metrics[resourceName] = {
                loadTime: entry.responseEnd - entry.requestStart,
                transferSize: entry.transferSize,
                decodedBodySize: entry.decodedBodySize
              }
            }
          })
        })
        
        observer.observe({ entryTypes: ['resource'] })
      }
      
      // Navigation timing
      collectNavigationMetrics() {
        window.addEventListener('load', () => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
          
          this.metrics.navigation = {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            firstByte: navigation.responseStart - navigation.requestStart,
            domInteractive: navigation.domInteractive - navigation.navigationStart
          }
        })
      }
      
      // Report metrics
      reportMetrics() {
        return {
          timestamp: Date.now(),
          ...this.metrics,
          // Add budget comparisons
          budgets: {
            lcp: { value: this.metrics.lcp, budget: 2500, passed: (this.metrics.lcp || 0) <= 2500 },
            fid: { value: this.metrics.fid, budget: 100, passed: (this.metrics.fid || 0) <= 100 },
            cls: { value: this.metrics.cls, budget: 0.1, passed: (this.metrics.cls || 0) <= 0.1 }
          }
        }
      }
      
      // Initialize monitoring
      init() {
        this.collectCoreWebVitals()
        this.collectBundleMetrics()
        this.collectNavigationMetrics()
        
        // Report initial metrics
        setTimeout(() => {
          console.log('Performance Metrics:', this.reportMetrics())
        }, 1000)
      }
    }
    
    // Auto-initialize performance monitoring
    if (typeof window !== 'undefined') {
      const performanceMonitor = new PerformanceMonitor()
      performanceMonitor.init()
      
      // Export for manual use
      window.PerformanceMonitor = performanceMonitor
    }
  `
}

/**
 * Helper functions
 */
function getChunkName(chunk: ManifestChunk): string {
  // Extract meaningful name from chunk file
  const fileName = chunk.file
  const baseName = fileName.replace(/\.[^.]+$/, '')
  
  // Map to human-readable names
  const nameMappings: Record<string, string> = {
    'main': 'main',
    'vendor': 'react-vendor',
    'chunk': baseName
  }
  
  return nameMappings[baseName] || baseName
}

function getFileType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase()
  
  const typeMap: Record<string, string> = {
    'js': 'script',
    'css': 'style',
    'woff': 'font',
    'woff2': 'font',
    'ttf': 'font',
    'otf': 'font',
    'jpg': 'image',
    'jpeg': 'image',
    'png': 'image',
    'gif': 'image',
    'svg': 'image',
    'webp': 'image'
  }
  
  return typeMap[ext || ''] || 'fetch'
}

/**
 * Generate complete performance optimization bundle
 */
export function generatePerformanceBundle(): string {
  return `
    ${generateServiceWorkerPreload()}
    
    ${generateRoutePreloading()}
    
    ${generatePerformanceMetrics()}
  `
}

export default {
  generatePreloadTags,
  generateServiceWorkerPreload,
  generateRoutePreloading,
  generatePerformanceMetrics,
  generatePerformanceBundle,
  DEFAULT_RESOURCE_PRELOADS
}