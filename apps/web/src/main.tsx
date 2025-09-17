import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// ✅ RAILWAY FIX: Apply theme BEFORE React renders to prevent FOUC
document.documentElement.className = localStorage.getItem('vite-ui-theme') || 'dark';

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Failed to find the root element')

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
