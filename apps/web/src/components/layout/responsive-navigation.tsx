import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useIsMobile, useIsTablet } from '@/hooks/use-mobile'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  BottomNavigation,
  BottomNavigationContent,
  BottomNavigationItem,
} from '@/components/ui/bottom-navigation'
import {
  LayoutDashboard,
  MessageSquare,
  Zap,
  ListTodo,
  Brain,
  Wrench,
  BarChart3,
  Activity,
  Settings,
  Accessibility,
  Menu,
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    description: 'Overview and status',
    badge: null,
  },
  {
    name: 'Agent Chat',
    href: '/chat',
    icon: MessageSquare,
    description: 'Chat with Crazy-Gary',
    badge: null,
  },
  {
    name: 'Heavy Mode',
    href: '/heavy',
    icon: Zap,
    description: 'Multi-agent orchestration',
    badge: 'Pro',
  },
  {
    name: 'Task Manager',
    href: '/tasks',
    icon: ListTodo,
    description: 'Create and manage tasks',
    badge: null,
  },
  {
    name: 'Model Control',
    href: '/models',
    icon: Brain,
    description: 'Manage AI models',
    badge: null,
  },
  {
    name: 'MCP Tools',
    href: '/tools',
    icon: Wrench,
    description: 'Discover MCP tools',
    badge: 'New',
  },
  {
    name: 'Advanced Dashboard',
    href: '/dashboard/advanced',
    icon: BarChart3,
    description: 'Advanced analytics',
    badge: null,
  },
  {
    name: 'Monitoring',
    href: '/monitoring',
    icon: Activity,
    description: 'System health',
    badge: null,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'App configuration',
    badge: null,
  },
  {
    name: 'Accessibility',
    href: '/accessibility-demo',
    icon: Accessibility,
    description: 'WCAG 2.1 features',
    badge: null,
  },
]

// Primary navigation items for bottom tabs (mobile)
const primaryNavigation = navigation.slice(0, 5)

interface ResponsiveNavigationProps {
  className?: string
}

export function ResponsiveNavigation({ className }: ResponsiveNavigationProps) {
  const location = useLocation()
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  // Group navigation items by category
  const navigationSections = {
    main: navigation.slice(0, 4),
    tools: navigation.slice(4, 7),
    system: navigation.slice(7, 9),
    settings: navigation.slice(9),
  }

  // Auto-close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mobileMenuOpen])

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }))
  }

  // Mobile Bottom Navigation
  if (isMobile) {
    return (
      <>
        {/* Bottom Navigation */}
        <BottomNavigation className={`fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-bottom ${className}`}>
          <BottomNavigationContent>
            {primaryNavigation.map((item) => {
              const isActive = location.pathname === item.href
              const Icon = item.icon
              
              return (
                <BottomNavigationItem
                  key={item.name}
                  asChild
                >
                  <Link
                    to={item.href}
                    className={`flex flex-col items-center justify-center py-2 px-1 min-w-0 flex-1 text-xs font-medium transition-colors touch-manipulation ${
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    aria-label={`${item.name}: ${item.description}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className="relative">
                      <Icon className="h-5 w-5 mb-1 flex-shrink-0" />
                      {item.badge && (
                        <Badge 
                          variant="secondary" 
                          className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <span className="truncate max-w-[4rem]">{item.name}</span>
                  </Link>
                </BottomNavigationItem>
              )
            })}
          </BottomNavigationContent>
        </BottomNavigation>

        {/* Floating Action Button for More Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg touch-manipulation md:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="bottom" 
            className="h-[85vh] rounded-t-2xl safe-bottom"
            aria-label="Navigation menu"
          >
            <SheetHeader className="pb-4">
              <SheetTitle className="text-left">Navigation</SheetTitle>
              <SheetDescription>
                Access all features and settings
              </SheetDescription>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto space-y-6">
              {Object.entries(navigationSections).map(([sectionName, items]) => (
                <div key={sectionName} className="space-y-3">
                  <button
                    onClick={() => toggleSection(sectionName)}
                    className="flex items-center justify-between w-full p-2 text-left hover:bg-muted/50 rounded-lg transition-colors touch-manipulation"
                    aria-expanded={expandedSections[sectionName]}
                    aria-controls={`section-${sectionName}`}
                  >
                    <h3 className="text-sm font-semibold capitalize">{sectionName}</h3>
                    {expandedSections[sectionName] ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  
                  <div 
                    id={`section-${sectionName}`}
                    className={`space-y-2 transition-all duration-300 ${
                      expandedSections[sectionName] ? 'opacity-100 max-h-96' : 'opacity-50 max-h-20 overflow-hidden'
                    }`}
                  >
                    {items.map((item) => {
                      const isActive = location.pathname === item.href
                      const Icon = item.icon
                      
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors touch-manipulation ${
                            isActive
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'hover:bg-muted/50'
                          }`}
                          aria-label={`${item.name}: ${item.description}`}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium truncate">{item.name}</span>
                              {item.badge && (
                                <Badge variant="secondary" className="text-xs">
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </>
    )
  }

  // Tablet & Desktop Navigation
  return (
    <nav 
      className={`flex flex-col space-y-1 ${className}`}
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
              className={`w-full justify-start h-10 sm:h-11 btn-touch-sm group transition-all duration-200 ${
                isActive && "bg-secondary/80 shadow-sm"
              }`}
              aria-label={`${item.name}: ${item.description}`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0 mr-2 sm:mr-3 transition-transform group-hover:scale-110" />
              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className="text-sm font-medium truncate w-full">{item.name}</span>
                <span className="text-xs text-muted-foreground truncate w-full hidden sm:block">
                  {item.description}
                </span>
              </div>
              {item.badge && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {item.badge}
                </Badge>
              )}
            </Button>
          </Link>
        )
      })}
    </nav>
  )
}

// Export the navigation sections for use in other components
export { navigation, navigationSections, primaryNavigation }