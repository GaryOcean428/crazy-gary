import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { 
  FileX, 
  MessageSquare, 
  Activity, 
  Search, 
  Settings, 
  Plus,
  RefreshCw,
  Home,
  HelpCircle,
  AlertCircle
} from "lucide-react"

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    icon?: React.ComponentType<{ className?: string }>
    variant?: "default" | "outline" | "ghost"
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    icon?: React.ComponentType<{ className?: string }>
  }
  children?: React.ReactNode
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "search" | "error" | "success" | "warning"
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  children,
  className,
  size = "md",
  variant = "default"
}) => {
  const sizes = {
    sm: { container: "py-8", icon: "h-12 w-12", title: "text-lg", description: "text-sm" },
    md: { container: "py-12", icon: "h-16 w-16", title: "text-xl", description: "text-base" },
    lg: { container: "py-16", icon: "h-20 w-20", title: "text-2xl", description: "text-lg" }
  }

  const variants = {
    default: { icon: FileX, color: "text-muted-foreground" },
    search: { icon: Search, color: "text-muted-foreground" },
    error: { icon: HelpCircle, color: "text-destructive" },
    success: { icon: Activity, color: "text-green-500" },
    warning: { icon: AlertCircle, color: "text-yellow-500" }
  }

  const defaultIcon = variants[variant].icon
  const ComponentIcon = Icon || defaultIcon

  return (
    <motion.div
      className={cn(
        "flex flex-col items-center justify-center text-center space-y-4",
        sizes[size].container,
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className={cn(
          "flex items-center justify-center rounded-full bg-muted/50",
          sizes[size].icon
        )}
      >
        <ComponentIcon className={cn(sizes[size].icon, variants[variant].color)} />
      </motion.div>

      <div className="space-y-2 max-w-md">
        <motion.h3
          className={cn("font-semibold", sizes[size].title)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {title}
        </motion.h3>
        <motion.p
          className={cn("text-muted-foreground", sizes[size].description)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {description}
        </motion.p>
      </div>

      {children && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {children}
        </motion.div>
      )}

      {(action || secondaryAction) && (
        <motion.div
          className="flex items-center space-x-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || "default"}
              className="space-x-2"
            >
              {action.icon && <action.icon className="h-4 w-4" />}
              <span>{action.label}</span>
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="ghost"
              size="sm"
              className="space-x-1"
            >
              {secondaryAction.icon && <secondaryAction.icon className="h-3 w-3" />}
              <span>{secondaryAction.label}</span>
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

// Predefined empty states for common scenarios
export const EmptyChatState = React.forwardRef<
  HTMLDivElement,
  Omit<EmptyStateProps, "icon" | "title" | "description">
>(({ action, ...props }, ref) => (
  <EmptyState
    ref={ref}
    icon={MessageSquare}
    title="Start a conversation"
    description="Begin chatting with the AI agent to get assistance with your tasks."
    action={action || {
      label: "Send a message",
      onClick: () => console.log("Focus input"),
      icon: Plus
    }}
    {...props}
  />
))
EmptyChatState.displayName = "EmptyChatState"

export const EmptyTasksState = React.forwardRef<
  HTMLDivElement,
  Omit<EmptyStateProps, "icon" | "title" | "description">
>(({ action, ...props }, ref) => (
  <EmptyState
    ref={ref}
    icon={Activity}
    title="No tasks yet"
    description="Create your first AI-powered task to get started with automation."
    action={action || {
      label: "Create task",
      onClick: () => console.log("Create task"),
      icon: Plus
    }}
    secondaryAction={{
      label: "Learn more",
      onClick: () => console.log("Learn more"),
      icon: HelpCircle
    }}
    {...props}
  />
))
EmptyTasksState.displayName = "EmptyTasksState"

export const EmptyDashboardState = React.forwardRef<
  HTMLDivElement,
  Omit<EmptyStateProps, "icon" | "title" | "description">
>(({ action, ...props }, ref) => (
  <EmptyState
    ref={ref}
    icon={Home}
    title="Welcome to your dashboard"
    description="Your personalized AI control center is ready. Start by creating your first task or exploring the available features."
    action={action || {
      label: "Create first task",
      onClick: () => console.log("Create task"),
      icon: Plus
    }}
    secondaryAction={{
      label: "View documentation",
      onClick: () => console.log("Documentation"),
      icon: HelpCircle
    }}
    {...props}
  />
))
EmptyDashboardState.displayName = "EmptyDashboardState"

export const EmptySearchState = React.forwardRef<
  HTMLDivElement,
  Omit<EmptyStateProps, "icon" | "title" | "description">
>(({ action, ...props }, ref) => (
  <EmptyState
    ref={ref}
    icon={Search}
    title="No results found"
    description="Try adjusting your search terms or browse different categories."
    action={action || {
      label: "Clear filters",
      onClick: () => console.log("Clear filters"),
      icon: RefreshCw
    }}
    variant="search"
    {...props}
  />
))
EmptySearchState.displayName = "EmptySearchState"

export const EmptyErrorState = React.forwardRef<
  HTMLDivElement,
  Omit<EmptyStateProps, "icon" | "title" | "description">
>(({ action, ...props }, ref) => (
  <EmptyState
    ref={ref}
    icon={HelpCircle}
    title="Something went wrong"
    description="We encountered an error while loading this content. Please try again."
    action={action || {
      label: "Try again",
      onClick: () => console.log("Retry"),
      icon: RefreshCw
    }}
    secondaryAction={{
      label: "Contact support",
      onClick: () => console.log("Contact support"),
      icon: Settings
    }}
    variant="error"
    {...props}
  />
))
EmptyErrorState.displayName = "EmptyErrorState"

export { EmptyState }