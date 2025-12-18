import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp } from "lucide-react"

interface ProgressiveLoaderProps {
  isLoading: boolean
  isComplete: boolean
  progress?: number
  items?: any[]
  renderItem: (item: any, index: number) => React.ReactNode
  renderSkeleton?: () => React.ReactNode
  batchSize?: number
  threshold?: number
  className?: string
  onLoadMore?: () => void
  hasMore?: boolean
  loadingText?: string
  completeText?: string
}

const ProgressiveLoader: React.FC<ProgressiveLoaderProps> = ({
  isLoading,
  isComplete,
  progress,
  items = [],
  renderItem,
  renderSkeleton,
  batchSize = 10,
  threshold = 0.8,
  className,
  onLoadMore,
  hasMore = false,
  loadingText = "Loading more...",
  completeText = "All content loaded"
}) => {
  const [visibleItems, setVisibleItems] = React.useState<any[]>([])
  const [loadingMore, setLoadingMore] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Initialize with first batch
  React.useEffect(() => {
    if (items.length > 0) {
      setVisibleItems(items.slice(0, batchSize))
    }
  }, [items, batchSize])

  // Handle progressive loading
  const handleScroll = React.useCallback(() => {
    if (!containerRef.current || !onLoadMore || loadingMore || !hasMore) return

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const scrollPercentage = scrollTop / (scrollHeight - clientHeight)

    if (scrollPercentage >= threshold && !loadingMore) {
      setLoadingMore(true)
      onLoadMore()
    }
  }, [onLoadMore, loadingMore, hasMore, threshold])

  // Load more items
  React.useEffect(() => {
    if (loadingMore && onLoadMore) {
      const newItems = items.slice(visibleItems.length, visibleItems.length + batchSize)
      if (newItems.length > 0) {
        setVisibleItems(prev => [...prev, ...newItems])
      }
      setLoadingMore(false)
    }
  }, [loadingMore, items, visibleItems.length, batchSize, onLoadMore])

  return (
    <div
      ref={containerRef}
      className={cn("space-y-4", className)}
      onScroll={handleScroll}
    >
      <AnimatePresence mode="wait">
        {isLoading && !isComplete && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {renderSkeleton ? (
              renderSkeleton()
            ) : (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
              ))
            )}
          </motion.div>
        )}

        {!isLoading && isComplete && items.length === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground">No items to display</p>
          </motion.div>
        )}

        {!isLoading && visibleItems.length > 0 && (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {visibleItems.map((item, index) => (
              <motion.div
                key={item.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {renderItem(item, index)}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      {progress !== undefined && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full bg-muted rounded-full h-2"
        >
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </motion.div>
      )}

      {/* Load more trigger */}
      {hasMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-4"
        >
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>{loadingText}</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>Load more</span>
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Completion indicator */}
      {isComplete && !hasMore && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-4 text-sm text-muted-foreground"
        >
          {completeText}
        </motion.div>
      )}
    </div>
  )
}

export { ProgressiveLoader }

// Virtual scrolling component for large datasets
interface VirtualListProps {
  items: any[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: any, index: number) => React.ReactNode
  overscan?: number
  className?: string
}

const VirtualList: React.FC<VirtualListProps> = ({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className
}) => {
  const [scrollTop, setScrollTop] = React.useState(0)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = items.slice(startIndex, endIndex + 1)
  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  return (
    <div
      ref={containerRef}
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export { VirtualList }