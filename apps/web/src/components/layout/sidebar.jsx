import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
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
  Activity
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
  }
]

export function Sidebar({ open, onOpenChange }) {
  const location = useLocation()

  return (
    <div className={cn(
      "fixed left-0 top-0 z-40 h-screen bg-card border-r transition-all duration-300",
      open ? "w-64" : "w-16"
    )}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b">
          {open && (
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Crazy-Gary</span>
                <span className="text-xs text-muted-foreground">Agentic AI</span>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(!open)}
            className="h-8 w-8 p-0"
          >
            {open ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              const Icon = item.icon

              return (
                <Link key={item.name} to={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start h-10",
                      !open && "px-2",
                      isActive && "bg-secondary/80"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", open && "mr-3")} />
                    {open && (
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      </div>
                    )}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-4">
          {open ? (
            <div className="text-xs text-muted-foreground">
              <div className="font-medium">Status: Online</div>
              <div>Version 1.0.0</div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="h-2 w-2 rounded-full bg-green-500" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

