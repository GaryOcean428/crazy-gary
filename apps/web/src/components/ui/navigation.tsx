import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Badge } from './badge'
import { 
  ChevronDown, 
  Menu, 
  X, 
  MoreHorizontal,
  Home,
  User,
  Settings,
  HelpCircle
} from 'lucide-react'

// Responsive Navigation Menu
interface NavigationItem {
  id: string
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string | number
  children?: NavigationItem[]
  active?: boolean
  disabled?: boolean
}

interface ResponsiveNavProps {
  items: NavigationItem[]
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'pills' | 'underline' | 'tabs'
  mobileVariant?: 'dropdown' | 'sheet' | 'accordion'
  className?: string
  onItemClick?: (item: NavigationItem) => void
}

export const ResponsiveNav: React.FC<ResponsiveNavProps> = ({
  items,
  orientation = 'horizontal',
  variant = 'default',
  mobileVariant = 'dropdown',
  className,
  onItemClick
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  const handleItemClick = (item: NavigationItem) => {
    onItemClick?.(item)
    setActiveDropdown(null)
    setMobileMenuOpen(false)
  }

  const navClasses = cn(
    'flex',
    orientation === 'vertical' ? 'flex-col space-y-1' : 'flex-row space-x-1',
    className
  )

  const itemClasses = (item: NavigationItem) => cn(
    'btn-touch-sm transition-all duration-200',
    variant === 'default' && 'hover:bg-accent hover:text-accent-foreground',
    variant === 'pills' && 'rounded-full px-4 py-2 hover:bg-accent',
    variant === 'underline' && 'border-b-2 border-transparent hover:border-primary',
    variant === 'tabs' && 'border-b-2 border-transparent data-[active]:border-primary data-[active]:text-primary',
    item.disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
    item.active && 'bg-accent text-accent-foreground'
  )

  const renderNavItem = (item: NavigationItem) => {
    const Icon = item.icon
    return (
      <div key={item.id} className="relative">
        <Button
          variant="ghost"
          size="sm"
          className={itemClasses(item)}
          onClick={() => handleItemClick(item)}
          data-active={item.active}
          disabled={item.disabled}
        >
          {Icon && <Icon className="h-4 w-4 mr-2" />}
          <span className="truncate">{item.label}</span>
          {item.badge && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {item.badge}
            </Badge>
          )}
          {item.children && item.children.length > 0 && (
            <ChevronDown className="h-3 w-3 ml-1" />
          )}
        </Button>
        
        {item.children && item.children.length > 0 && activeDropdown === item.id && (
          <div className="absolute top-full left-0 mt-1 w-56 bg-popover border rounded-md shadow-lg z-50">
            <div className="p-1">
              {item.children.map(child => (
                <Button
                  key={child.id}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleItemClick(child)}
                >
                  {child.icon && <child.icon className="h-4 w-4 mr-2" />}
                  <span>{child.label}</span>
                  {child.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {child.badge}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="relative">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="btn-touch"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" />
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 mt-2 w-80 bg-popover border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            <div className="p-2">
              {items.map(item => renderNavItem(item))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <nav className={navClasses}>
      {items.map(item => renderNavItem(item))}
    </nav>
  )
}

// Responsive Breadcrumb Navigation
interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
}

interface ResponsiveBreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: React.ComponentType<{ className?: string }>
  className?: string
}

export const ResponsiveBreadcrumb: React.FC<ResponsiveBreadcrumbProps> = ({
  items,
  separator: Separator = ({ className }) => <span className={cn("text-muted-foreground", className)}>/</span>,
  className
}) => {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center space-x-2 text-sm", className)}>
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <Separator className="h-4 w-4 mx-2" />}
            {item.href ? (
              <a 
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center"
              >
                {item.icon && <item.icon className="h-4 w-4 mr-1" />}
                <span className="truncate max-w-32 sm:max-w-none">{item.label}</span>
              </a>
            ) : (
              <span className="flex items-center">
                {item.icon && <item.icon className="h-4 w-4 mr-1" />}
                <span className="truncate max-w-32 sm:max-w-none">{item.label}</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// Responsive Tab Navigation
interface ResponsiveTabsProps {
  tabs: {
    id: string
    label: string
    icon?: React.ComponentType<{ className?: string }>
    content?: React.ReactNode
    disabled?: boolean
    badge?: string | number
  }[]
  defaultTab?: string
  onTabChange?: (tabId: string) => void
  variant?: 'default' | 'pills' | 'underline' | 'segmented'
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export const ResponsiveTabs: React.FC<ResponsiveTabsProps> = ({
  tabs,
  defaultTab,
  onTabChange,
  variant = 'default',
  orientation = 'horizontal',
  className
}) => {
  const [activeTab, setActiveTab] = React.useState(defaultTab || tabs[0]?.id)

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    onTabChange?.(tabId)
  }

  const tabListClasses = cn(
    'flex',
    orientation === 'vertical' ? 'flex-col space-y-1 w-48' : 'flex-row space-x-1',
    variant === 'segmented' && 'bg-muted p-1 rounded-lg',
    className
  )

  const tabClasses = (tab: typeof tabs[0]) => cn(
    'btn-touch-sm transition-all duration-200',
    variant === 'default' && 'data-[active]:bg-accent data-[active]:text-accent-foreground',
    variant === 'pills' && 'rounded-full data-[active]:bg-primary data-[active]:text-primary-foreground',
    variant === 'underline' && 'border-b-2 border-transparent data-[active]:border-primary',
    variant === 'segmented' && 'rounded-md data-[active]:bg-background data-[active]:shadow-sm',
    tab.disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
  )

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content

  return (
    <div className={orientation === 'vertical' ? 'flex gap-6' : 'w-full'}>
      <div className={tabListClasses} role="tablist">
        {tabs.map(tab => (
          <Button
            key={tab.id}
            variant="ghost"
            size="sm"
            className={tabClasses(tab)}
            onClick={() => !tab.disabled && handleTabChange(tab.id)}
            data-active={activeTab === tab.id}
            disabled={tab.disabled}
            role="tab"
            aria-selected={activeTab === tab.id}
          >
            {tab.icon && <tab.icon className="h-4 w-4 mr-2" />}
            <span className="truncate">{tab.label}</span>
            {tab.badge && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {tab.badge}
              </Badge>
            )}
          </Button>
        ))}
      </div>
      
      {activeTabContent && (
        <div className="flex-1 mt-4 sm:mt-0">
          {activeTabContent}
        </div>
      )}
    </div>
  )
}

// Responsive Pagination
interface ResponsivePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showPageNumbers?: boolean
  maxVisiblePages?: number
  className?: string
}

export const ResponsivePagination: React.FC<ResponsivePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = true,
  maxVisiblePages = 5,
  className
}) => {
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const half = Math.floor(maxVisiblePages / 2)
    let start = Math.max(1, currentPage - half)
    let end = Math.min(totalPages, start + maxVisiblePages - 1)

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1)
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages

  return (
    <nav aria-label="Pagination" className={cn("flex items-center justify-center space-x-2", className)}>
      <Button
        variant="outline"
        size="sm"
        className="btn-touch-sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrevious}
        aria-label="Previous page"
      >
        Previous
      </Button>

      {showPageNumbers && (
        <div className="flex items-center space-x-1">
          {getVisiblePages().map(page => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              className="btn-touch-sm w-10 h-10"
              onClick={() => onPageChange(page)}
              aria-label={`Go to page ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </Button>
          ))}
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        className="btn-touch-sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        aria-label="Next page"
      >
        Next
      </Button>
    </nav>
  )
}