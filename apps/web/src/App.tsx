import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'
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
import { DynamicDashboardControls } from '@/features/dashboard'
import { AuthProvider } from '@/contexts/auth-context'
import { ProtectedRoute } from '@/components/protected-route'
import type { Task } from '@/types'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="crazy-gary-theme">
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route path="/*" element={
                <ProtectedRoute>
                  <ProtectedApp />
                </ProtectedRoute>
              } />
            </Routes>
            
            <Toaster />
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  )
}

function ProtectedApp() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentTask, setCurrentTask] = useState<Task | null>(null)

  return (
    <>
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          currentTask={currentTask}
        />
        
        <main className="p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/heavy" element={<Heavy />} />
            <Route 
              path="/tasks" 
              element={
                <TaskManager 
                  setCurrentTask={setCurrentTask}
                />
              } 
            />
            <Route path="/models" element={<ModelControl />} />
            <Route path="/tools" element={<MCPTools />} />
            <Route path="/monitoring" element={<Monitoring />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/dashboard/advanced" element={<DynamicDashboardControls />} />
          </Routes>
        </main>
      </div>
    </>
  )
}

export default App

