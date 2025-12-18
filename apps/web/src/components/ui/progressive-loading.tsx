import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from './loading-spinner'
import { Card, CardContent } from './card'
import { Button } from './button'
import { 
  ChevronDown, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { usePrefersReducedMotion } from '@/hooks/use-animation-hooks'

interface ProgressiveLoadingProps {
  id: string
  title: string
  description?: string
  progress: number
  totalItems?: number
  loadedItems?: number
  estimatedTimeRemaining?: number
  status?: 'loading' | 'processing' | 'complete' | 'error'
  showDetails?: boolean
  onLoadMore?: () => void
  onRetry?: () => void
  className?: string
  children?: React.ReactNode
}

// Main Progressive Loading Component
export const ProgressiveLoading: React.FC<ProgressiveLoadingProps> = ({
  id,
  title,
  description,
  progress,
  totalItems = 0,
  loadedItems = 0,
  estimatedTimeRemaining,
  status = 'loading',
  showDetails = false,
  onLoadMore,
  onRetry,
  className,
  children
}) => {
  const [showDetailsState, setShowDetailsState] = useState(showDetails)
  const prefersReducedMotion = usePrefersReducedMotion()

  const getStatusConfig = () => {
    switch (status) {
      case 'complete':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          label: 'Complete'
        }
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          label: 'Error'
        }
      case 'processing':
        return {
          icon: Loader2,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
          label: 'Processing'
        }
      default:
        return {
          icon: Loader2,
          color: 'text-primary',
          bgColor: 'bg-primary/10',
          label: 'Loading'
        }
    }
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {/* Progress Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(progress, 100)}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      
      <CardContent className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={cn("p-2 rounded-full", statusConfig.bgColor)}>
              <StatusIcon 
                className={cn(
                  "h-5 w-5",
                  statusConfig.color,
                  status === 'loading' || status === 'processing' ? "animate-spin" : ""
                )}
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{title}</h3>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetailsState(!showDetailsState)}
            className="ml-4"
          >
            {showDetailsState ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              className="bg-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Details Section */}
        <AnimatePresence>
          {showDetailsState && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3 border-t pt-4"
            >
              {totalItems > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items loaded</span>
                  <span className="font-medium">{loadedItems} / {totalItems}</span>
                </div>
              )}
              
              {estimatedTimeRemaining && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Time remaining</span>
                  <span className="font-medium">{Math.round(estimatedTimeRemaining)}s</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className={cn("font-medium", statusConfig.color)}>
                  {statusConfig.label}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        {status === 'error' && onRetry && (
          <div className="flex justify-end mt-4">
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        )}
      </CardContent>

      {/* Content Area */}
      {children && (
        <div className="px-6 pb-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: progress > 50 ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </Card>
  )
}

// Progressive List Component for rendering items as they load
interface ProgressiveListProps<T> {
  id: string
  items: T[]
  loading: boolean
  error?: string | null
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T, index: number) => string | number
  batchSize?: number
  className?: string
  emptyComponent?: React.ReactNode
  errorComponent?: React.ReactNode
  loadingComponent?: React.ReactNode
  onLoadMore?: () => void
  hasMore?: boolean
}

export function ProgressiveList<T>({
  id,
  items,
  loading,
  error,
  renderItem,
  keyExtractor,
  batchSize = 10,
  className,
  emptyComponent,
  errorComponent,
  loadingComponent,
  onLoadMore,
  hasMore = false
}: ProgressiveListProps<T>) {
  const [visibleItems, setVisibleItems] = useState(batchSize)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    setVisibleItems(Math.min(batchSize, items.length))
  }, [items.length, batchSize])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const newVisibleItems = Math.min(visibleItems + batchSize, items.length)
      setVisibleItems(newVisibleItems)
      onLoadMore?.()
    }
  }, [loading, hasMore, visibleItems, batchSize, items.length, onLoadMore])

  if (error) {
    return (
      <div className={cn("space-y-4", className)}>
        {errorComponent || (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <p className="text-muted-foreground">{error}</p>
          </div>
        )}
      </div>
    )
  }

  if (items.length === 0 && !loading) {
    return (
      <div className={cn("space-y-4", className)}>
        {emptyComponent || (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No items to display</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Render visible items */}
      <AnimatePresence>
        {items.slice(0, visibleItems).map((item, index) => (
          <motion.div
            key={keyExtractor(item, index)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ 
              duration: prefersReducedMotion ? 0.1 : 0.3, 
              delay: prefersReducedMotion ? 0 : index * 0.05 
            }}
          >
            {renderItem(item, index)}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Loading more indicator */}
      {loading && items.length > visibleItems && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center py-4"
        >
          {loadingComponent || <LoadingSpinner text="Loading more items..." />}
        </motion.div>
      )}

      {/* Load more button */}
      {!loading && hasMore && items.length > visibleItems && (
        <div className="flex justify-center">
          <Button onClick={loadMore} variant="outline">
            <ChevronDown className="h-4 w-4 mr-2" />
            Load More ({items.length - visibleItems} remaining)
          </Button>
        </div>
      )}

      {/* Complete indicator */}
      {!loading && !hasMore && items.length > batchSize && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          All {items.length} items loaded
        </div>
      )}
    </div>
  )
}

// Progressive Image Component
interface ProgressiveImageProps {
  id: string
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  placeholder?: React.ReactNode
  onLoad?: () => void
  onError?: () => void
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  id,
  src,
  alt,
  width,
  height,
  className,
  placeholder,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [showImage, setShowImage] = useState(false)

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    setTimeout(() => setShowImage(true), 100)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setHasError(true)
    onError?.()
  }, [onError])

  return (
    <div 
      className={cn("relative overflow-hidden", className)}
      style={{ width, height }}
    >
      {/* Placeholder */}
      {!isLoaded && !hasError && (
        <motion.div
          className="absolute inset-0 bg-muted animate-pulse"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {placeholder || <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50" />}
        </motion.div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
      )}

      {/* Actual image */}
      <AnimatePresence>
        {showImage && !hasError && (
          <motion.img
            src={src}
            alt={alt}
            width={width}
            height={height}
            onLoad={handleLoad}
            onError={handleError}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}