import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const isProduction = process.env.NODE_ENV === 'production'

// Production-optimized Vite configuration for Railway deployment
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  
  // Relative paths for deployment
  base: './',
  
  // Path aliases
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
      "@/pages": path.resolve(__dirname, "./src/pages"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
      "@/types": path.resolve(__dirname, "./src/types"),
      "@/contexts": path.resolve(__dirname, "./src/contexts"),
      "@/features": path.resolve(__dirname, "./src/features"),
      "@/styles": path.resolve(__dirname, "./src/styles"),
      "@/assets": path.resolve(__dirname, "./src/assets"),
    }
  },
  
  // Development server configuration
  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '5675'), // Using 5675 instead of default 5173 to avoid conflicts
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  
  // Preview server configuration
  preview: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '5676')
  },
  
  // Production build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    emptyOutDir: true,
    
    // Minification with terser for better compression
    minify: 'terser',
    
    // CSS code splitting for granular caching and parallel loading
    cssCodeSplit: true,
    
    // Terser options for production
    terserOptions: {
      compress: {
        drop_console: isProduction,
        drop_debugger: isProduction,
        pure_funcs: isProduction ? ['console.log', 'console.info', 'console.debug'] : []
      },
      format: {
        comments: false
      }
    },
    
    // Rollup options for advanced chunking
    rollupOptions: {
      output: {
        // Advanced chunking strategy for optimal caching
        manualChunks: {
          // Core framework chunks
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
          'router-vendor': ['react-router-dom'],
          
          // UI component library chunks
          'ui-radix-core': [
            '@radix-ui/react-slot',
            '@radix-ui/react-label',
            '@radix-ui/react-separator'
          ],
          'ui-radix-overlay': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-popover',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-hover-card'
          ],
          'ui-radix-navigation': [
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-menubar',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-accordion'
          ],
          'ui-radix-form': [
            '@radix-ui/react-checkbox',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-select',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch'
          ],
          
          // Form handling
          'form-vendor': ['react-hook-form', '@hookform/resolvers'],
          
          // Utility chunks
          'utils-class': ['clsx', 'tailwind-merge', 'class-variance-authority'],
          'utils-format': ['date-fns'],
          'utils-state': ['zustand', 'react-error-boundary'],
          'utils-validation': ['zod'],
          'utils-icons': ['lucide-react'],
          
          // Charts and visualization
          'charts': ['recharts'],
          
          // Motion and animations
          'motion': ['framer-motion'],
          
          // Other UI components
          'ui-misc': [
            '@radix-ui/react-toast',
            '@radix-ui/react-progress',
            '@radix-ui/react-avatar',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            'sonner',
            'cmdk'
          ]
        },
        
        // Optimized file naming for caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    
    // Performance monitoring - warn if chunks are too large
    chunkSizeWarningLimit: 1000,
    
    // Target modern browsers for better optimization
    target: 'es2020'
  },
  
  // Environment variable definitions
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || '/api')
  },
  
  // Optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      'zod',
      '@hookform/resolvers/zod'
    ],
    exclude: ['@tailwindcss/vite']
  }
})
