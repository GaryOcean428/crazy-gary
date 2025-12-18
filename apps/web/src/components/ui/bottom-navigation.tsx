import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

// Bottom Navigation Component
const BottomNavigation = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed bottom-0 left-0 right-0 z-50 flex border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}
    role="navigation"
    aria-label="Bottom navigation"
    {...props}
  />
))
BottomNavigation.displayName = "BottomNavigation"

const BottomNavigationContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-1 items-center justify-around px-2 py-1", className)}
    {...props}
  />
))
BottomNavigationContent.displayName = "BottomNavigationContent"

const BottomNavigationItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex-1 flex items-center justify-center min-w-0",
      className
    )}
    {...props}
  />
))
BottomNavigationItem.displayName = "BottomNavigationItem"

// Enhanced Responsive Tabs
const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      // Mobile-first responsive
      "w-full max-w-full",
      // Tablet
      "md:inline-flex md:w-auto md:max-w-none",
      // Touch-friendly
      "touch-manipulation",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      // Mobile-first design
      "flex-1 min-w-0 text-xs sm:text-sm",
      // Touch optimization
      "touch-manipulation min-h-[44px]",
      // Tablet adjustments
      "md:flex-initial md:min-w-0 md:px-4 md:text-sm",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      // Responsive sizing
      "w-full",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

// Responsive Tab Variants
const TabsListResponsive = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: 'mobile' | 'desktop' | 'auto'
  }
>(({ className, variant = 'auto', ...props }, ref) => {
  const baseClasses = "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground touch-manipulation"
  
  const variantClasses = {
    mobile: "w-full max-w-full flex-col space-y-1 h-auto py-1",
    desktop: "inline-flex w-auto max-w-none flex-row space-x-1 h-10",
    auto: "w-full max-w-full flex-col space-y-1 h-auto py-1 md:inline-flex md:w-auto md:max-w-none md:flex-row md:space-x-1 md:h-10 md:py-0"
  }
  
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    />
  )
})
TabsListResponsive.displayName = "TabsListResponsive"

const TabsTriggerResponsive = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    variant?: 'mobile' | 'desktop' | 'auto'
  }
>(({ className, variant = 'auto', ...props }, ref) => {
  const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm touch-manipulation min-h-[44px]"
  
  const variantClasses = {
    mobile: "flex-1 min-w-0 text-xs w-full justify-start px-4",
    desktop: "flex-initial min-w-0 px-4 text-sm",
    auto: "flex-1 min-w-0 text-xs w-full justify-start px-4 md:flex-initial md:min-w-0 md:px-4 md:text-sm"
  }
  
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    />
  )
})
TabsTriggerResponsive.displayName = "TabsTriggerResponsive"

export {
  BottomNavigation,
  BottomNavigationContent,
  BottomNavigationItem,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsListResponsive,
  TabsTriggerResponsive,
}