import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { usePrefersReducedMotion } from "@/hooks/use-animation-hooks"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "text" | "circular" | "rectangular"
  size?: "sm" | "md" | "lg"
  animation?: "pulse" | "shimmer" | "wave"
}

function Skeleton({
  className,
  variant = "default",
  size = "md",
  animation = "pulse",
  ...props
}: SkeletonProps) {
  const prefersReducedMotion = usePrefersReducedMotion()

  const variants = {
    default: "rounded-md",
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg"
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
    <motion.div
      data-slot="skeleton"
      className={cn(
        "bg-muted",
        variants[variant],
        sizes[size],
        !prefersReducedMotion && animations[animation],
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      {...props}
    />
  )
}

export { Skeleton }
