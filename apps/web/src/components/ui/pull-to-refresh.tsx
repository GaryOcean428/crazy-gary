import * as React from "react"
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"
import { RefreshCw, ChevronDown } from "lucide-react"

interface PullToRefreshProps {
  children: React.ReactNode
  onRefresh: () => Promise<void> | void
  threshold?: number
  maxPullDistance?: number
  disabled?: boolean
  loading?: boolean
  className?: string
  pullText?: string
  releaseText?: string
  refreshingText?: string
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  threshold = 80,
  maxPullDistance = 120,
  disabled = false,
  loading = false,
  className,
  pullText = "Pull to refresh",
  releaseText = "Release to refresh",
  refreshingText = "Refreshing..."
}) => {
  const [isPulling, setIsPulling] = React.useState(false)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [pullDistance, setPullDistance] = React.useState(0)
  const [startY, setStartY] = React.useState(0)

  const y = useMotionValue(0)
  const opacity = useTransform(y, [0, threshold], [0, 1])
  const rotation = useTransform(y, [0, threshold], [0, 180])

  const handleDragStart = (event: MouseEvent | TouchEvent | PointerEvent) => {
    if (disabled || isRefreshing) return
    
    const point = "touches" in event ? event.touches[0] : event
    setStartY(point.clientY)
    setIsPulling(true)
  }

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled || isRefreshing || !isPulling) return

    const point = "touches" in event ? event.touches[0] : event
    const currentY = point.clientY
    const distance = Math.max(0, currentY - startY)
    const clampedDistance = Math.min(distance, maxPullDistance)
    
    setPullDistance(clampedDistance)
    y.set(clampedDistance)
  }

  const handleDragEnd = async () => {
    if (disabled || isRefreshing || !isPulling) return

    setIsPulling(false)

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      y.set(threshold)
      
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
        y.set(0)
      }
    } else {
      setPullDistance(0)
      y.set(0)
    }
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Pull indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center z-10"
        style={{ 
          height: threshold,
          opacity,
          y: useTransform(y, [0, threshold], [-threshold, 0])
        }}
      >
        <div className="flex flex-col items-center space-y-1 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 border">
          <motion.div
            style={{ rotate: rotation }}
            className={cn(
              "transition-colors",
              pullDistance >= threshold ? "text-primary" : "text-muted-foreground"
            )}
          >
            {isRefreshing ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </motion.div>
          <motion.span 
            className="text-xs font-medium"
            style={{ opacity: useTransform(y, [0, threshold], [0, 1]) }}
          >
            {isRefreshing 
              ? refreshingText 
              : pullDistance >= threshold 
              ? releaseText 
              : pullText
            }
          </motion.span>
        </div>
      </motion.div>

      {/* Scrollable content */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.2, bottom: 0 }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className={cn(
          "cursor-grab active:cursor-grabbing",
          (isPulling || isRefreshing) && "cursor-default"
        )}
      >
        {children}
      </motion.div>
    </div>
  )
}

// Hook for detecting pull-to-refresh on mobile
interface UsePullToRefreshOptions {
  threshold?: number
  onRefresh: () => Promise<void> | void
  disabled?: boolean
}

const usePullToRefresh = ({
  threshold = 80,
  onRefresh,
  disabled = false
}: UsePullToRefreshOptions) => {
  const [isPulling, setIsPulling] = React.useState(false)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [pullDistance, setPullDistance] = React.useState(0)
  const [startY, setStartY] = React.useState(0)
  const [scrollTop, setScrollTop] = React.useState(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshing || scrollTop > 0) return
    setStartY(e.touches[0].clientY)
    setIsPulling(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || isRefreshing || !isPulling || scrollTop > 0) return
    
    e.preventDefault()
    const currentY = e.touches[0].clientY
    const distance = Math.max(0, currentY - startY)
    setPullDistance(distance)
  }

  const handleTouchEnd = async () => {
    if (disabled || isRefreshing || !isPulling) return

    setIsPulling(false)

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  return {
    isPulling,
    isRefreshing,
    pullDistance,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onScroll: handleScroll
    }
  }
}

export { PullToRefresh, usePullToRefresh }