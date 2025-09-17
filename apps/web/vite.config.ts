import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ✅ RAILWAY FIX: Vite Config optimized for Railway deployment
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './', // ✅ Relative paths for Railway
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0', // ✅ Correct host binding
    port: parseInt(process.env.PORT || '5173'), // ✅ Railway PORT support
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    host: '0.0.0.0', // ✅ Correct host binding for Railway
    port: parseInt(process.env.PORT || '5173') // ✅ Railway PORT support
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    emptyOutDir: true,
    // ✅ Railway Performance optimizations
    minify: 'terser',
    cssCodeSplit: false, // ✅ Ensure CSS is bundled
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-toast'],
          forms: ['react-hook-form', '@hookform/resolvers'],
          icons: ['lucide-react'],
          utils: ['clsx', 'tailwind-merge', 'class-variance-authority']
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Increase chunk size warning limit for Railway deployment
    chunkSizeWarningLimit: 1000
  },
  // Environment variable handling
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || '/api')
  }
})
