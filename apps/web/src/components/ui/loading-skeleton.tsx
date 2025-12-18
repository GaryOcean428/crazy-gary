import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const LoadingSkeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "text" | "circular" | "rectangular" | "card" | "table"
    size?: "sm" | "md" | "lg"
    animation?: "pulse" | "shimmer" | "wave"
  }
>(({ className, variant = "default", size = "md", animation = "pulse", ...props }, ref) => {
  const variants = {
    default: "rounded-md",
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
    card: "rounded-lg",
    table: "rounded"
  }

  const sizes = {
    sm: "h-3",
    md: "h-4",
    lg: "h-6"
  }

  const animations = {
    pulse: "animate-pulse",
    shimmer: "animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent",
    wave: "animate-wave bg-gradient-to-r from-muted via-muted/50 to-muted"
  }

  return (
    <div
      ref={ref}
      className={cn(
        "bg-muted",
        variants[variant],
        sizes[size],
        animations[animation],
        className
      )}
      {...props}
    />
  )
})
LoadingSkeleton.displayName = "LoadingSkeleton"

// Specific skeleton components
export const TextSkeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <LoadingSkeleton
    ref={ref}
    variant="text"
    className={cn("w-full", className)}
    {...props}
  />
))
TextSkeleton.displayName = "TextSkeleton"

export const CircularSkeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { size?: number }
>(({ className, size = 40, ...props }, ref) => (
  <LoadingSkeleton
    ref={ref}
    variant="circular"
    className={cn("flex-shrink-0", className)}
    style={{ width: size, height: size }}
    {...props}
  />
))
CircularSkeleton.displayName = "CircularSkeleton"

export const RectangularSkeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { width?: string | number; height?: string | number }
>(({ className, width, height, ...props }, ref) => (
  <LoadingSkeleton
    ref={ref}
    variant="rectangular"
    className={cn("flex-shrink-0", className)}
    style={{ width, height }}
    {...props}
  />
))
RectangularSkeleton.displayName = "RectangularSkeleton"

// Card skeleton for loading card content
export const CardSkeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <motion.div
    ref={ref}
    className={cn("border rounded-lg p-6 space-y-4", className)}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    {...props}
  >
    <div className="flex items-center space-x-4">
      <CircularSkeleton size={48} />
      <div className="space-y-2 flex-1">
        <TextSkeleton className="h-4 w-3/4" />
        <TextSkeleton className="h-3 w-1/2" />
      </div>
    </div>
    <div className="space-y-2">
      <TextSkeleton />
      <TextSkeleton className="w-5/6" />
      <TextSkeleton className="w-4/6" />
    </div>
  </motion.div>
))
CardSkeleton.displayName = "CardSkeleton"

// Table skeleton for loading table content
export const TableSkeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { rows?: number; columns?: number }
>(({ className, rows = 5, columns = 4, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-3", className)} {...props}>
    {/* Header */}
    <div className="flex space-x-4 pb-2 border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <TextSkeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, j) => (
          <TextSkeleton key={j} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
))
TableSkeleton.displayName = "TableSkeleton"

// List skeleton for loading list content
export const ListSkeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { items?: number }
>(({ className, items = 5, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-3", className)} {...props}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-3">
        <CircularSkeleton size={32} />
        <div className="space-y-1 flex-1">
          <TextSkeleton className="h-4 w-3/4" />
          <TextSkeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
))
ListSkeleton.displayName = "ListSkeleton"

export { LoadingSkeleton }