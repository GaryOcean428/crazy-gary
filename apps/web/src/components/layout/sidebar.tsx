import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  LayoutDashboard, 
  ListTodo, 
  Brain, 
  Wrench, 
  Settings, 
  Zap,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Activity,
  BarChart3,
  Accessibility
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    description: 'Overview and status'
  },
  {
    name: 'Agent Chat',
    href: '/chat',
    icon: MessageSquare,
    description: 'Chat with Crazy-Gary'
  },
  {
    name: 'Heavy Mode',
    href: '/heavy',
    icon: Zap,
    description: 'Multi-agent orchestration'
  },
  {
    name: 'Task Manager',
    href: '/tasks',
    icon: ListTodo,
    description: 'Create and manage agentic tasks'
  },
  {
    name: 'Model Control',
    href: '/models',
    icon: Brain,
    description: 'Manage AI models and endpoints'
  },
  {
    name: 'MCP Tools',
    href: '/tools',
    icon: Wrench,
    description: 'Discover and use MCP tools'
  },
  {
    name: 'Advanced Dashboard',
    href: '/dashboard/advanced',
    icon: BarChart3,
    description: 'Advanced dashboard controls and analytics'
  },
  {
    name: 'Monitoring',
    href: '/monitoring',
    icon: Activity,
    description: 'System health and metrics'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Application configuration'
  },
  {
    name: 'Accessibility',
    href: '/accessibility-demo',
    icon: Accessibility,
    description: 'WCAG 2.1 AA accessibility features and testing'
  }
]

export function Sidebar({ open, onOpenChange }) {
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // Auto-close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile && open) {
      onOpenChange(false)
    }
  }, [location.pathname, isMobile, open, onOpenChange])

  const sidebarClasses = cn(
    "sidebar-responsive",
    !open && "-translate-x-full",
    "bg-card border-r border-border"
  )

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && open && (
        <div 
          className="sidebar-overlay" 
          onClick={() => onOpenChange(false)}
          aria-hidden="true"
        />
      )}
      
      <div className={sidebarClasses}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-3 sm:px-4 border-b border-border">
            {open && (
              <div className="flex items-center space-x-2 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary flex-shrink-0">
                  <Zap className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold truncate">Crazy-Gary</span>
                  <span className="text-xs text-muted-foreground truncate">Agentic AI</span>
                </div>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(!open)}
              className="h-8 w-8 p-0 btn-touch"
              aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
            >
              {open ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-2 sm:px-3 py-3 sm:py-4">
            <nav 
              className="space-y-1 sm:space-y-2"
              role="navigation"
              aria-label="Main navigation"
            >
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                const Icon = item.icon

                return (
                  <Link key={item.name} to={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start h-10 sm:h-11 btn-touch-sm",
                        !open && "px-2 sm:px-3",
                        isActive && "bg-secondary/80"
                      )}
                      aria-label={`${item.name}: ${item.description}`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon className={cn("h-4 w-4 flex-shrink-0", open && "mr-2 sm:mr-3")} />
                      {open && (
                        <div className="flex flex-col items-start min-w-0">
                          <span className="text-sm font-medium truncate w-full">{item.name}</span>
                          <span className="text-xs text-muted-foreground truncate w-full hidden sm:block">
                            {item.description}
                          </span>
                        </div>
                      )}
                      {!open && (
                        <span className="text-sm font-medium truncate ml-2 sm:ml-3 sm:hidden">
                          {item.name}
                        </span>
                      )}
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t border-border p-3 sm:p-4 safe-bottom">
            {open ? (
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="font-medium">Status: Online</div>
                <div>Version 1.0.0</div>
                <div className="text-xs text-muted-foreground/80">
                  {isMobile ? 'Mobile' : 'Desktop'} Mode
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div className="text-xs text-muted-foreground text-center">
                  v1.0.0
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

