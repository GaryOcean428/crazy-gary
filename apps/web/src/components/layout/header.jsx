import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/components/theme-provider'
import { 
  Menu, 
  Sun, 
  Moon, 
  Monitor, 
  User, 
  Settings, 
  LogOut,
  Activity,
  Zap,
  AlertCircle
} from 'lucide-react'

export function Header({ sidebarOpen, setSidebarOpen, currentTask }) {
  const { theme, setTheme } = useTheme()
  const [systemStatus, setSystemStatus] = useState('online')
  const [modelStatus, setModelStatus] = useState('checking')

  useEffect(() => {
    // Check system status
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/harmony/health')
        if (response.ok) {
          setSystemStatus('online')
        } else {
          setSystemStatus('degraded')
        }
      } catch (error) {
        setSystemStatus('offline')
      }
    }

    // Check model status
    const checkModels = async () => {
      try {
        const response = await fetch('/api/endpoints/status')
        if (response.ok) {
          const data = await response.json()
          const hasRunningModel = Object.values(data.endpoints || {}).some(
            endpoint => endpoint.status === 'running'
          )
          setModelStatus(hasRunningModel ? 'ready' : 'sleeping')
        } else {
          setModelStatus('error')
        }
      } catch (error) {
        setModelStatus('error')
      }
    }

    checkStatus()
    checkModels()
    
    // Refresh status every 30 seconds
    const interval = setInterval(() => {
      checkStatus()
      checkModels()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
      case 'ready':
        return 'bg-green-500'
      case 'degraded':
      case 'sleeping':
        return 'bg-yellow-500'
      case 'offline':
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'online': return 'System Online'
      case 'degraded': return 'System Degraded'
      case 'offline': return 'System Offline'
      case 'ready': return 'Models Ready'
      case 'sleeping': return 'Models Sleeping'
      case 'error': return 'Model Error'
      case 'checking': return 'Checking...'
      default: return 'Unknown'
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      <div className="flex items-center space-x-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Current task indicator */}
        {currentTask && (
          <div className="flex items-center space-x-2">
            <div className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm font-medium">
              Task: {currentTask.title}
            </span>
            <Badge variant="secondary" className="text-xs">
              {currentTask.status}
            </Badge>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {/* Status indicators */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <div className={`h-2 w-2 rounded-full ${getStatusColor(systemStatus)}`} />
            <span className="text-xs text-muted-foreground">
              {getStatusText(systemStatus)}
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Zap className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {getStatusText(modelStatus)}
            </span>
          </div>
        </div>

        {/* Theme toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" />
              <span>Light</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Monitor className="mr-2 h-4 w-4" />
              <span>System</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <User className="h-4 w-4" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Agent User</p>
                <p className="text-xs leading-none text-muted-foreground">
                  agent@crazy-gary.ai
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Activity className="mr-2 h-4 w-4" />
              <span>Activity Log</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

