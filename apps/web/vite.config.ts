import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ✅ PRODUCTION-OPTIMIZED: Vite Config optimized for production deployment
// Advanced performance optimization with comprehensive bundling strategies
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './', // ✅ Relative paths for deployment
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
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
  }
})
