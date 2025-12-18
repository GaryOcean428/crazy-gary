import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'
import { 
  SkipToMain, 
  LiveRegion, 
  useAnnouncements,
  SkipLinks,
  DEFAULT_SKIP_LINKS,
  StatusAnnouncer,
  AlertAnnouncer
} from '@/components/accessibility'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Dashboard } from '@/pages/dashboard'
import { TaskManager } from '@/pages/task-manager'
import { ModelControl } from '@/pages/model-control'
import { MCPTools } from '@/pages/mcp-tools'
import { Settings } from '@/pages/settings'
import { Chat } from '@/pages/chat'
import { Heavy } from '@/pages/heavy'
import { Login } from '@/pages/login'
import { Register } from '@/pages/register'
import { Monitoring } from '@/pages/monitoring'
import { ResponsiveDesignDemo } from '@/pages/responsive-design-demo'
import { DynamicDashboardControls } from '@/features/dashboard'
import { AuthProvider } from '@/contexts/auth-context'
import { LoadingProvider } from '@/contexts/loading-context'
import { ProtectedRoute } from '@/components/protected-route'
import { RouteTransition, LoadingRouteWrapper } from '@/components/ui/route-transitions'
import { CacheDemo } from '@/lib/cache/cache-examples'
import AdvancedCacheDemoPage from '@/pages/advanced-cache-demo'
import AccessibilityShowcasePage from '@/pages/accessibility-showcase'
import { useProgressiveWebApp } from '@/lib/cache/service-worker-hooks'
import { cacheWarmupService } from '@/lib/cache/cache-warming'
import { setupApiCacheInterceptor } from '@/lib/cache/api-cache'
import { cn } from '@/lib/utils'
import type { Task } from '@/types'
import './App.css'

function App() {
  const pwa = useProgressiveWebApp();
  const { announce, LiveRegion } = useAnnouncements();
  
  useEffect(() => {
    // Announce app initialization to screen readers
    announce('Crazy-Gary application loaded successfully', 'polite');
    
    // Initialize cache systems
    const initializeCaching = async () => {
      try {
        // Setup API cache interceptor
        setupApiCacheInterceptor();
        
        // Start cache warmup
        await cacheWarmupService.warmupCache('eager');
        
        announce('Cache systems initialized successfully', 'polite');
        console.log('Cache systems initialized successfully');
      } catch (error) {
        announce('Cache initialization failed. Some features may be unavailable.', 'assertive');
        console.error('Cache initialization failed:', error);
      }
    };
    
    initializeCaching();
  }, [announce]);
  
  return (
    <AuthProvider>
      <LoadingProvider>
        <ThemeProvider defaultTheme="dark" storageKey="crazy-gary-theme">
          <Router>
            <div className="min-h-screen bg-background">
              {/* Enhanced Skip Navigation Links for Accessibility */}
              <SkipToMain />
              <SkipLinks links={DEFAULT_SKIP_LINKS} />
              
              {/* Screen Reader Announcements */}
              <LiveRegion />
              <StatusAnnouncer />
              <AlertAnnouncer />
              
              {/* Primary landmark region with route transitions */}
              <RouteTransition variant="page" className="min-h-screen">
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Accessibility Showcase Route */}
                  <Route path="/accessibility" element={<AccessibilityShowcasePage />} />
                  
                  {/* Cache Demo Routes */}
                  <Route path="/cache-demo" element={<CacheDemo />} />
                  <Route path="/advanced-cache-demo" element={<AdvancedCacheDemoPage />} />
                  
                  {/* Protected routes */}
                  <Route path="/*" element={
                    <ProtectedRoute>
                      <ProtectedApp />
                    </ProtectedRoute>
                  } />
                </Routes>
              </RouteTransition>
              
              {/* Status announcements for dynamic content */}
              <div aria-live="polite" aria-atomic="true" className="sr-only" id="app-status">
                Application status updates will appear here
              </div>
              
              <Toaster />
            </div>
          </Router>
        </ThemeProvider>
      </LoadingProvider>
    </AuthProvider>
  )
}

function ProtectedApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false) // Start closed on mobile
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setSidebarOpen(true) // Auto-open on desktop
      } else {
        setSidebarOpen(false) // Auto-close on mobile
      }
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    // Mark initial load as complete after a short delay
    const timer = setTimeout(() => setIsInitialLoad(false), 1000)
    
    return () => {
      window.removeEventListener('resize', checkIsMobile)
      clearTimeout(timer)
    }
  }, [])

  const mainContentClasses = cn(
    "transition-all duration-300 ease-in-out",
    "min-h-screen bg-background",
    // Desktop layout
    !isMobile && sidebarOpen && "ml-64",
    !isMobile && !sidebarOpen && "ml-16",
    // Mobile layout
    isMobile && "ml-0"
  )

  return (
    <>
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      
      <div 
        className={mainContentClasses}
        role="main"
        aria-label="Main application content"
      >
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          currentTask={currentTask}
        />
        
        <main 
          id="main-content" 
          className="p-responsive"
          role="main"
          aria-label="Main content area"
          tabIndex={-1}
        >
          <Routes>
            <Route path="/" element={
              <LoadingRouteWrapper isInitialLoad={isInitialLoad}>
                <Dashboard />
              </LoadingRouteWrapper>
            } />
            <Route path="/chat" element={
              <LoadingRouteWrapper isInitialLoad={isInitialLoad}>
                <Chat />
              </LoadingRouteWrapper>
            } />
            <Route path="/heavy" element={
              <LoadingRouteWrapper isInitialLoad={isInitialLoad}>
                <Heavy />
              </LoadingRouteWrapper>
            } />
            <Route 
              path="/tasks" 
              element={
                <LoadingRouteWrapper isInitialLoad={isInitialLoad}>
                  <TaskManager 
                    setCurrentTask={setCurrentTask}
                  />
                </LoadingRouteWrapper>
              } 
            />
            <Route path="/models" element={
              <LoadingRouteWrapper isInitialLoad={isInitialLoad}>
                <ModelControl />
              </LoadingRouteWrapper>
            } />
            <Route path="/tools" element={
              <LoadingRouteWrapper isInitialLoad={isInitialLoad}>
                <MCPTools />
              </LoadingRouteWrapper>
            } />
            <Route path="/monitoring" element={
              <LoadingRouteWrapper isInitialLoad={isInitialLoad}>
                <Monitoring />
              </LoadingRouteWrapper>
            } />
            <Route path="/settings" element={
              <LoadingRouteWrapper isInitialLoad={isInitialLoad}>
                <Settings />
              </LoadingRouteWrapper>
            } />
            <Route path="/dashboard/advanced" element={
              <LoadingRouteWrapper isInitialLoad={isInitialLoad}>
                <DynamicDashboardControls />
              </LoadingRouteWrapper>
            } />
            <Route path="/cache-test" element={
              <LoadingRouteWrapper isInitialLoad={isInitialLoad}>
                <CacheDemo />
              </LoadingRouteWrapper>
            } />
            <Route path="/advanced-cache-test" element={
              <LoadingRouteWrapper isInitialLoad={isInitialLoad}>
                <AdvancedCacheDemoPage />
              </LoadingRouteWrapper>
            } />
            <Route path="/accessibility-demo" element={
              <LoadingRouteWrapper isInitialLoad={isInitialLoad}>
                <AccessibilityShowcasePage />
              </LoadingRouteWrapper>
            } />
            <Route path="/responsive-demo" element={
              <LoadingRouteWrapper isInitialLoad={isInitialLoad}>
                <ResponsiveDesignDemo />
              </LoadingRouteWrapper>
            } />
          </Routes>
        </main>
      </div>
    </>
  )
}

export default App

