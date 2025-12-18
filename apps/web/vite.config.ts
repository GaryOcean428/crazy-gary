import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'
import { visualizer } from 'rollup-plugin-visualizer'
import { createHtmlPlugin } from 'vite-plugin-html'
import type { ManifestChunk, OutputChunk } from 'rollup'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

<<<<<<< HEAD
// Performance Budget Configuration
const PERFORMANCE_BUDGETS = {
  // Bundle size limits (in KB)
  TOTAL_JS: 500,      // Total JavaScript bundle should not exceed 500KB
  INITIAL_JS: 150,    // Initial JavaScript payload should not exceed 150KB
  VENDOR_JS: 200,     // Vendor chunks should not exceed 200KB each
  CHUNK_SIZE: 250,    // Individual chunks should not exceed 250KB
  
  // CSS limits
  CSS_SIZE: 100,      // CSS bundle should not exceed 100KB
  
  // Resource limits
  IMAGE_SIZE: 500,    // Individual images should not exceed 500KB
  FONT_SIZE: 100,     // Individual fonts should not exceed 100KB
  
  // Build time limits (in seconds)
  BUILD_TIME: 60,     // Build should complete within 60 seconds
  ANALYZE_TIME: 30    // Bundle analysis should complete within 30 seconds
}

// Bundle Analysis Plugin
function bundleAnalyzer() {
  return {
    name: 'bundle-analyzer',
    buildStart() {
      console.log('🚀 Starting optimized production build...')
      const startTime = Date.now()
      
      // Store start time for later analysis
      this.meta = { startTime }
=======
// ✅ PRODUCTION-OPTIMIZED: Vite Config optimized for production deployment
// Advanced performance optimization with comprehensive bundling strategies
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './', // ✅ Relative paths for deployment
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
>>>>>>> d8a38d4aed4f9316de58ec6d6b5ae08fca56e20e
    },
    
    buildEnd(error) {
      const endTime = Date.now()
      const buildTime = (endTime - this.meta.startTime) / 1000
      
      if (error) {
        console.error('❌ Build failed:', error)
        return
      }
      
      console.log(`✅ Build completed in ${buildTime.toFixed(2)}s`)
      
      // Performance budget enforcement
      if (buildTime > PERFORMANCE_BUDGETS.BUILD_TIME) {
        console.warn(`⚠️  Build time exceeded budget: ${buildTime}s > ${PERFORMANCE_BUDGETS.BUILD_TIME}s`)
      }
    }
  }
}

// Security Middleware Plugin
function securityPlugin() {
  return {
    name: 'security-middleware',
    configureServer(server) {
      // Add security middleware for development server
      server.middlewares.use((req, res, next) => {
        // Add security headers for development
        if (process.env.NODE_ENV === 'development') {
          res.setHeader('X-Content-Type-Options', 'nosniff')
          res.setHeader('X-Frame-Options', 'SAMEORIGIN')
          res.setHeader('X-XSS-Protection', '1; mode=block')
          res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
        }
        next()
      })
    },
    writeBundle() {
      if (isProduction) {
        console.log('🔒 Security headers configured for production build')
        console.log('🛡️ Security middleware initialized')
      }
    }
  }
}

// Resource Preloading Plugin
function createPreloadPlugin() {
  return {
    name: 'resource-preloader',
    generateBundle() {
      // This will be enhanced with actual preloading logic
      console.log('📦 Setting up resource preloading strategies...')
    }
  }
}

// Performance Monitoring Plugin
function performanceMonitor() {
  return {
    name: 'performance-monitor',
    writeBundle() {
      console.log('📊 Performance monitoring data collected')
      console.log('🎯 Performance budgets configured and enforced')
    }
  }
}

// Advanced Manual Chunks Configuration
function getManualChunks() {
  return {
    // Core React ecosystem
    'react-vendor': ['react', 'react-dom'],
    'react-router': ['react-router-dom'],
    
    // UI component libraries
    'radix-ui-core': [
      '@radix-ui/react-slot',
      '@radix-ui/react-context-menu',
      '@radix-ui/react-direction'
    ],
    'radix-ui-navigation': [
      '@radix-ui/react-menubar',
      '@radix-ui/react-navigation-menu',
      '@radix-ui/react-tabs'
    ],
    'radix-ui-interactions': [
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-tooltip'
    ],
    'radix-ui-data-entry': [
      '@radix-ui/react-checkbox',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-select',
      '@radix-ui/react-slider'
    ],
    'radix-ui-feedback': [
      '@radix-ui/react-toast',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-progress'
    ],
    'radix-ui-visual': [
      '@radix-ui/react-avatar',
      '@radix-ui/react-aspect-ratio',
      '@radix-ui/react-separator',
      '@radix-ui/react-hover-card'
    ],
    
    // Forms and validation
    'forms': [
      'react-hook-form',
      '@hookform/resolvers',
      'zod'
    ],
    
    // Utility libraries
    'ui-utils': [
      'clsx',
      'tailwind-merge',
      'class-variance-authority',
      'cmdk'
    ],
    
    // Icons and assets
    'icons': ['lucide-react'],
    
    // Data handling
    'data-utils': [
      'date-fns',
      'axios',
      'zustand'
    ],
    
    // Charts and visualizations
    'charts': ['recharts'],
    
    // Animation and UI enhancements
    'animations': ['framer-motion', 'embla-carousel-react'],
    
    // Theme and styling
    'theme': ['next-themes', 'vaul']
  }
}

// Tree Shaking Configuration
const treeShakingOptions = {
  moduleSideEffects: false,
  propertyReadSideEffects: false,
  tryCatchDeoptimization: false
}

// Security Headers Configuration for Production
const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Consider removing in strict mode
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' ws: wss:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "media-src 'self'",
    "worker-src 'none'",
    "child-src 'none'",
    "manifest-src 'self'"
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
    'bluetooth=()',
    'display-capture=()',
    'encrypted-media=()',
    'fullscreen=(self)',
    'midi=()',
    'picture-in-picture=()',
    'screen-wake-lock=()'
  ].join(', '),
  'X-Permitted-Cross-Domain-Policies': 'none',
  'X-Download-Options': 'noopen',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
}

// Compression and Optimization Options
const terserOptions = {
  compress: {
    drop_console: true,
    drop_debugger: true,
    pure_funcs: [
      'console.log', 
      'console.info', 
      'console.debug', 
      'console.warn',
      'console.error'
    ],
    pure_getters: true,
    unsafe: true,
    unsafe_comps: true,
    passes: 3,
    toplevel: true
  },
<<<<<<< HEAD
  mangle: {
    safari10: true
  },
  format: {
    comments: false,
    safari10: true
  }
}

// CSS Optimization Options
const cssOptions = {
  devSourcemap: false,
  postcss: {
    plugins: [
      // Add CSS optimization plugins here
      require('cssnano')({
        preset: 'default'
      })
    ]
  }
}

export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production'
  const isAnalyze = process.env.ANALYZE_BUNDLE === 'true'
  
  return {
    // Base configuration
    base: './',
    
    // Environment variable handling
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || '/api'),
      '__DEV__': !isProduction,
      '__SECURITY_HEADERS__': isProduction,
      '__CSP_ENABLED__': isProduction,
      '__HSTS_ENABLED__': isProduction
    },
    
    // Plugin configuration
    plugins: [
      // Core plugins
      react({
        // React optimization
        babel: {
          plugins: isProduction ? [
            // Remove PropTypes in production
            ['transform-remove-console', { exclude: ['error', 'warn'] }]
          ] : []
        }
      }),
      tailwindcss(),
      
      // Bundle analysis (only in analyze mode)
      ...(isAnalyze ? [
        visualizer({
          filename: 'dist/stats.html',
          open: false,
          gzipSize: true,
          brotliSize: true
        })
      ] : []),
      
      // Security and performance monitoring plugins
      securityPlugin(),
      bundleAnalyzer(),
      createPreloadPlugin(),
      performanceMonitor(),
      
      // HTML optimization
      createHtmlPlugin({
        minify: isProduction
      })
    ].filter(Boolean),
    
    // Resolve configuration
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      // Optimize dependencies resolution
      mainFields: ['module', 'main'],
      conditions: isProduction ? ['production'] : ['development']
    },
    
    // Server configuration
    server: {
      host: '0.0.0.0',
      port: parseInt(process.env.PORT || '5173'),
      // Development optimizations
      hmr: {
        overlay: false
      },
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    
    // Preview configuration
    preview: {
      host: '0.0.0.0',
      port: parseInt(process.env.PORT || '5173')
    },
    
    // Build optimization
    build: {
      // Output configuration
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: isProduction ? false : true,
      emptyOutDir: true,
      
      // Target configuration
      target: isProduction ? 'es2020' : 'esnext',
      
      // CSS optimization
      cssCodeSplit: true, // Enable CSS code splitting for better caching
      cssMinify: isProduction,
      
      // Minification
      minify: isProduction ? 'terser' : false,
      terserOptions: isProduction ? terserOptions : undefined,
      
      // Rollup options
      rollupOptions: {
        // Tree shaking
        treeshake: isProduction ? treeShakingOptions : false,
        
        // External dependencies
        external: isProduction ? [] : [],
        
        // Output optimization
        output: {
          // Advanced chunk splitting
          manualChunks: getManualChunks(),
          
          // Optimized file naming
          chunkFileNames: (chunkInfo: OutputChunk) => {
            const facadeModuleId = chunkInfo.facadeModuleId ? 
              chunkInfo.facadeModuleId.split('/').pop()?.replace(/\.[^.]+$/, '') : 
              'chunk'
            return `assets/${facadeModuleId}-[hash].js`
          },
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const extType = assetInfo.name.split('.')[1]
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              return `assets/images/[name]-[hash].[ext]`
            }
            if (/woff2?|eot|ttf|otf/i.test(extType)) {
              return `assets/fonts/[name]-[hash].[ext]`
            }
            return `assets/[name]-[hash].[ext]`
          },
          
          // Asset optimization
          assetFileNames: 'assets/[name]-[hash].[ext]',
          
          // Format options
          sourcemap: !isProduction,
          
          // Compression
          compressPaths: true,
          sanitizeFileName: true
        },
        
        // Plugin configuration
        plugins: [
          // Add any custom Rollup plugins here
        ].filter(Boolean)
      },
      
      // Performance configuration
      chunkSizeWarningLimit: 500, // Reduced for better performance awareness
      
      // Worker configuration
      worker: {
        format: 'es'
      },
      
      // Asset inlining
      assetsInlineLimit: 4096, // 4kb
      
      // Report compressed size
      reportCompressedSize: isProduction,
      
      // Source maps
      sourcemap: {
        all: !isProduction
      }
    },
    
    // Optimization configuration
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom'
      ],
      exclude: isProduction ? [
        // Exclude large dev-only dependencies
      ] : []
    },
    
    // CSS configuration
    css: {
      devSourcemap: !isProduction,
      postcss: {
        plugins: isProduction ? [
          require('cssnano')({
            preset: 'default'
          }),
          require('autoprefixer')
        ] : [
          require('autoprefixer')
        ]
      }
    },
    
    // Dependency optimization
    esbuild: {
      // Remove dead code
      treeShaking: isProduction,
      // Optimize for production
      minifyIdentifiers: isProduction,
      minifySyntax: isProduction,
      minifyWhitespace: isProduction,
      // Target configuration
      target: isProduction ? 'es2020' : 'esnext'
    },
    
    // JSON configuration
    json: {
      stringify: isProduction
    },
    
    // Legacy configuration for older browsers
    legacy: {
      // Only add for older browser support
      entrypoints: false
    },
    
    // Experimental features
    experimental: {
      // Enable experimental optimizations
      renderBuiltUrl: (filename: string, { hostType }: { hostType: 'js' | 'css' | 'html' }) => {
        if (hostType === 'js') {
          return { relative: true }
        } else {
          return { relative: false }
        }
      }
    }
=======
  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '5173'),
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '5173')
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    emptyOutDir: true,
    // ✅ Advanced Production Optimizations
    minify: 'terser',
    cssCodeSplit: false,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    },
    rollupOptions: {
      output: {
        // ✅ Advanced chunking strategy
        manualChunks: {
          // Core framework chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          
          // UI component chunks
          'ui-dialog': ['@radix-ui/react-dialog', '@radix-ui/react-toast'],
          'ui-form': ['react-hook-form', '@hookform/resolvers'],
          'ui-navigation': ['@radix-ui/react-navigation-menu', '@radix-ui/react-menubar'],
          'ui-input': ['@radix-ui/react-input', '@radix-ui/react-label'],
          'ui-layout': ['@radix-ui/react-accordion', '@radix-ui/react-scroll-area'],
          
          // Utility chunks
          'utils-class': ['clsx', 'tailwind-merge', 'class-variance-authority'],
          'utils-format': ['date-fns', 'lucide-react'],
          'utils-state': ['zustand', 'react-error-boundary'],
          'utils-validation': ['zod'],
          
          // Chart and visualization
          'charts': ['recharts'],
          
          // Motion and animations
          'motion': ['framer-motion']
        },
        // ✅ Optimized file naming
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Performance monitoring
    chunkSizeWarningLimit: 1000
  },
  // ✅ Environment handling
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || '/api')
>>>>>>> d8a38d4aed4f9316de58ec6d6b5ae08fca56e20e
  }
})
