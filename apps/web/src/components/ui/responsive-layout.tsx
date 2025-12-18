import * as React from "react"
import { cn } from "@/lib/utils"
import { useIsMobile, useIsTablet, useIsDesktop, useScreenSize } from "@/hooks/use-mobile"

// Responsive Container
const ResponsiveContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | 'none'
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
    center?: boolean
  }
>(({ className, maxWidth = 'xl', padding = 'md', center = true, children, ...props }, ref) => {
  const maxWidthClasses = {
    none: 'max-w-none',
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    '8xl': 'max-w-8xl'
  }
  
  const paddingClasses = {
    none: '',
    sm: 'px-4 sm:px-6',
    md: 'px-4 sm:px-6 lg:px-8',
    lg: 'px-6 sm:px-8 lg:px-12',
    xl: 'px-8 sm:px-12 lg:px-16'
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        "w-full",
        center && "mx-auto",
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
ResponsiveContainer.displayName = "ResponsiveContainer"

// Responsive Grid System
const ResponsiveGrid = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    cols?: 1 | 2 | 3 | 4 | 5 | 6 | 'auto' | 'fluid'
    gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    responsive?: boolean
  }
>(({ className, cols = 'auto', gap = 'md', responsive = true, children, ...props }, ref) => {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  
  const getGridCols = () => {
    if (!responsive) return `grid-cols-${cols}`
    
    // Mobile-first responsive grid
    const mobileCols = 1
    const tabletCols = isTablet ? 2 : (cols === 'auto' ? 2 : Math.min(cols as number, 3))
    const desktopCols = cols === 'auto' ? 3 : Math.min(cols as number, 4)
    const largeCols = cols === 'auto' ? 4 : Math.min(cols as number, 6)
    
    if (cols === 'fluid') {
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
    }
    
    return `grid-cols-${mobileCols} sm:grid-cols-${tabletCols} lg:grid-cols-${desktopCols} xl:grid-cols-${largeCols}`
  }
  
  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-2',
    sm: 'gap-3 sm:gap-4',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
    xl: 'gap-8 sm:gap-12'
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        "grid w-full",
        getGridCols(),
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
ResponsiveGrid.displayName = "ResponsiveGrid"

// Responsive Flex Layout
const ResponsiveFlex = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    direction?: 'row' | 'col' | 'auto'
    justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
    align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
    wrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
    gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    responsive?: boolean
  }
>(({ className, direction = 'row', justify, align, wrap, gap = 'md', responsive = true, children, ...props }, ref) => {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  
  const getFlexDirection = () => {
    if (!responsive) return `flex-${direction}`
    
    if (direction === 'auto') {
      return isMobile ? 'flex-col' : 'flex-row'
    }
    
    return `flex-${direction}`
  }
  
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  }
  
  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline'
  }
  
  const wrapClasses = {
    nowrap: 'flex-nowrap',
    wrap: 'flex-wrap',
    'wrap-reverse': 'flex-wrap-reverse'
  }
  
  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-2',
    sm: 'gap-3 sm:gap-4',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
    xl: 'gap-8 sm:gap-12'
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        "flex",
        getFlexDirection(),
        justify && justifyClasses[justify],
        align && alignClasses[align],
        wrap && wrapClasses[wrap],
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
ResponsiveFlex.displayName = "ResponsiveFlex"

// Responsive Card Grid
const ResponsiveCardGrid = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    columns?: 1 | 2 | 3 | 4 | 'auto'
    gap?: 'sm' | 'md' | 'lg'
    cardMinHeight?: string
  }
>(({ className, columns = 'auto', gap = 'md', cardMinHeight = 'auto', children, ...props }, ref) => {
  const isMobile = useIsMobile()
  
  const getColumns = () => {
    if (columns === 'auto') {
      return isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    }
    return `grid-cols-${columns}`
  }
  
  const gapClasses = {
    sm: 'gap-4 sm:gap-6',
    md: 'gap-6 sm:gap-8',
    lg: 'gap-8 sm:gap-10'
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        "grid w-full",
        getColumns(),
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <div
          key={index}
          className={cn(
            "flex flex-col",
            cardMinHeight !== 'auto' && `min-h-[${cardMinHeight}]`
          )}
        >
          {child}
        </div>
      ))}
    </div>
  )
})
ResponsiveCardGrid.displayName = "ResponsiveCardGrid"

// Responsive Stack Layout
const ResponsiveStack = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    direction?: 'vertical' | 'horizontal' | 'auto'
    spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
    align?: 'start' | 'center' | 'end' | 'stretch'
    justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
    responsive?: boolean
  }
>(({ className, direction = 'vertical', spacing = 'md', align, justify, responsive = true, children, ...props }, ref) => {
  const isMobile = useIsMobile()
  
  const getDirection = () => {
    if (!responsive) return direction
    
    if (direction === 'auto') {
      return isMobile ? 'vertical' : 'horizontal'
    }
    
    return direction
  }
  
  const spacingClasses = {
    none: 'space-y-0',
    xs: 'space-y-2 sm:space-y-3',
    sm: 'space-y-3 sm:space-y-4',
    md: 'space-y-4 sm:space-y-6',
    lg: 'space-y-6 sm:space-y-8',
    xl: 'space-y-8 sm:space-y-12',
    '2xl': 'space-y-12 sm:space-y-16'
  }
  
  const directionClasses = {
    vertical: spacingClasses[spacing],
    horizontal: `space-x-3 sm:space-x-4 lg:space-x-6`
  }
  
  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  }
  
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        "flex w-full",
        directionClasses[getDirection()],
        align && alignClasses[align],
        justify && justifyClasses[justify],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
ResponsiveStack.displayName = "ResponsiveStack"

// Responsive Section Layout
const ResponsiveSection = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
    background?: 'none' | 'subtle' | 'muted' | 'primary' | 'secondary'
    border?: boolean
    rounded?: boolean
  }
>(({ className, padding = 'md', background = 'none', border = false, rounded = false, children, ...props }, ref) => {
  const isMobile = useIsMobile()
  
  const paddingClasses = {
    none: '',
    sm: 'py-8 sm:py-12',
    md: 'py-12 sm:py-16 lg:py-20',
    lg: 'py-16 sm:py-20 lg:py-24',
    xl: 'py-20 sm:py-24 lg:py-32'
  }
  
  const backgroundClasses = {
    none: '',
    subtle: 'bg-muted/20',
    muted: 'bg-muted',
    primary: 'bg-primary/5',
    secondary: 'bg-secondary/50'
  }
  
  return (
    <section
      ref={ref}
      className={cn(
        "w-full",
        paddingClasses[padding],
        backgroundClasses[background],
        border && "border-t border-border",
        rounded && "rounded-lg sm:rounded-xl",
        className
      )}
      {...props}
    >
      {children}
    </section>
  )
})
ResponsiveSection.displayName = "ResponsiveSection"

// Responsive Dashboard Layout
const ResponsiveDashboard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    sidebar?: boolean
    header?: boolean
    footer?: boolean
    layout?: 'sidebar' | 'full-width' | 'centered'
  }
>(({ className, sidebar = true, header = true, footer = false, layout = 'sidebar', children, ...props }, ref) => {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  
  const getLayoutClasses = () => {
    if (layout === 'full-width') {
      return 'w-full'
    }
    
    if (layout === 'centered') {
      return 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
    }
    
    // Sidebar layout (default)
    if (sidebar && !isMobile) {
      return isTablet ? 'ml-16' : 'ml-64'
    }
    
    return 'w-full'
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        "min-h-screen flex flex-col",
        getLayoutClasses(),
        className
      )}
      {...props}
    >
      {header && <div className="sticky top-0 z-30">{/* Header would go here */}</div>}
      
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      
      {footer && <div className="border-t">{/* Footer would go here */}</div>}
    </div>
  )
})
ResponsiveDashboard.displayName = "ResponsiveDashboard"

// Responsive Widget Container
const ResponsiveWidget = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    variant?: 'default' | 'elevated' | 'outlined' | 'ghost'
    padding?: 'none' | 'sm' | 'md' | 'lg'
    interactive?: boolean
  }
>(({ className, size = 'md', variant = 'default', padding = 'md', interactive = false, children, ...props }, ref) => {
  const isMobile = useIsMobile()
  
  const sizeClasses = {
    sm: 'col-span-1',
    md: 'col-span-1 sm:col-span-2',
    lg: 'col-span-1 sm:col-span-2 lg:col-span-3',
    xl: 'col-span-1 sm:col-span-2 lg:col-span-4',
    full: 'col-span-full'
  }
  
  const variantClasses = {
    default: 'bg-card border border-border',
    elevated: 'bg-card shadow-md hover:shadow-lg transition-shadow',
    outlined: 'bg-background border-2 border-border',
    ghost: 'bg-transparent'
  }
  
  const paddingClasses = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg",
        sizeClasses[size],
        variantClasses[variant],
        paddingClasses[padding],
        interactive && "cursor-pointer touch-manipulation hover:bg-muted/50 active:bg-muted/70 transition-colors",
        isMobile && "touch-manipulation",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
ResponsiveWidget.displayName = "ResponsiveWidget"

export {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveFlex,
  ResponsiveCardGrid,
  ResponsiveStack,
  ResponsiveSection,
  ResponsiveDashboard,
  ResponsiveWidget,
}