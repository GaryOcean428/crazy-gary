import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from './dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription, DrawerClose } from './drawer'
import { X, AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react'

// Responsive Modal/Dialog
interface ResponsiveModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  mobileVariant?: 'modal' | 'drawer' | 'fullscreen'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  className?: string
  overlayClassName?: string
}

export const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = 'md',
  mobileVariant = 'modal',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className,
  overlayClassName
}) => {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-full'
  }

  const shouldUseDrawer = isMobile && mobileVariant === 'drawer'
  const shouldUseFullscreen = isMobile && mobileVariant === 'fullscreen'

  if (shouldUseDrawer) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="drawer-responsive max-h-[85vh]">
          {(title || description) && (
            <DrawerHeader>
              {title && <DrawerTitle>{title}</DrawerTitle>}
              {description && <DrawerDescription>{description}</DrawerDescription>}
            </DrawerHeader>
          )}
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {children}
          </div>
          
          <DrawerFooter className="px-4 sm:px-6 pb-4 sm:pb-6">
            {showCloseButton && (
              <DrawerClose asChild>
                <Button variant="outline" className="btn-touch-sm">
                  Close
                </Button>
              </DrawerClose>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          sizeClasses[size],
          shouldUseFullscreen && "modal-mobile-full",
          className
        )}
        overlayClassName={overlayClassName}
        onInteractOutside={closeOnOverlayClick ? undefined : (e) => e.preventDefault()}
      >
        {(title || description || showCloseButton) && (
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                {title && <DialogTitle>{title}</DialogTitle>}
                {description && <DialogDescription>{description}</DialogDescription>}
              </div>
              {showCloseButton && (
                <DialogClose asChild>
                  <Button variant="ghost" size="sm" className="btn-touch">
                    <X className="h-4 w-4" />
                  </Button>
                </DialogClose>
              )}
            </div>
          </DialogHeader>
        )}
        
        <div className="py-4 sm:py-6">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Responsive Alert Modal
interface ResponsiveAlertProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title?: string
  message: string
  type?: 'info' | 'warning' | 'error' | 'success'
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  onCancel?: () => void
  loading?: boolean
  showCancel?: boolean
}

export const ResponsiveAlert: React.FC<ResponsiveAlertProps> = ({
  open,
  onOpenChange,
  title,
  message,
  type = 'info',
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  showCancel = false
}) => {
  const typeStyles = {
    info: 'text-blue-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    success: 'text-green-600'
  }

  const icons = {
    info: Info,
    warning: AlertTriangle,
    error: AlertCircle,
    success: CheckCircle
  }

  const Icon = icons[type]

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title={title || (type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : type === 'success' ? 'Success' : 'Information')}
      size="sm"
      mobileVariant="drawer"
    >
      <div className="flex items-start space-x-4">
        <Icon className={cn("h-6 w-6 flex-shrink-0 mt-0.5", typeStyles[type])} />
        <div className="flex-1">
          <p className="text-responsive-sm">{message}</p>
        </div>
      </div>
      
      <div className="flex gap-3 mt-6 justify-end">
        {showCancel && (
          <Button
            variant="outline"
            onClick={() => {
              onCancel?.()
              onOpenChange?.(false)
            }}
            disabled={loading}
            className="btn-touch-sm"
          >
            {cancelLabel}
          </Button>
        )}
        <Button
          onClick={() => {
            onConfirm?.()
            onOpenChange?.(false)
          }}
          disabled={loading}
          loading={loading}
          className="btn-touch-sm"
        >
          {confirmLabel}
        </Button>
      </div>
    </ResponsiveModal>
  )
}

// Responsive Confirm Dialog
interface ResponsiveConfirmProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  onCancel?: () => void
  loading?: boolean
  type?: 'danger' | 'warning' | 'info'
}

export const ResponsiveConfirm: React.FC<ResponsiveConfirmProps> = ({
  open,
  onOpenChange,
  title = 'Confirm Action',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  type = 'warning'
}) => {
  const typeStyles = {
    danger: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  }

  const buttonVariants = {
    danger: 'destructive',
    warning: 'default',
    info: 'default'
  }

  const icons = {
    danger: AlertCircle,
    warning: AlertTriangle,
    info: Info
  }

  const Icon = icons[type]

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      size="sm"
      mobileVariant="drawer"
    >
      <div className="flex items-start space-x-4">
        <Icon className={cn("h-6 w-6 flex-shrink-0 mt-0.5", typeStyles[type])} />
        <div className="flex-1">
          <p className="text-responsive-sm">{message}</p>
        </div>
      </div>
      
      <div className="flex gap-3 mt-6 justify-end">
        <Button
          variant="outline"
          onClick={() => {
            onCancel?.()
            onOpenChange?.(false)
          }}
          disabled={loading}
          className="btn-touch-sm"
        >
          {cancelLabel}
        </Button>
        <Button
          variant={buttonVariants[type]}
          onClick={() => {
            onConfirm?.()
            onOpenChange?.(false)
          }}
          disabled={loading}
          loading={loading}
          className="btn-touch-sm"
        >
          {confirmLabel}
        </Button>
      </div>
    </ResponsiveModal>
  )
}

// Responsive Toast/Notification
interface ResponsiveToastProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title?: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export const ResponsiveToast: React.FC<ResponsiveToastProps> = ({
  open,
  onOpenChange,
  title,
  message,
  type = 'info',
  duration = 5000,
  action
}) => {
  React.useEffect(() => {
    if (open && duration > 0) {
      const timer = setTimeout(() => {
        onOpenChange?.(false)
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [open, duration, onOpenChange])

  const typeStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200',
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200'
  }

  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle
  }

  const Icon = icons[type]

  if (!open) return null

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 w-full max-w-sm p-4 rounded-lg border shadow-lg",
      "animate-slide-up-mobile",
      typeStyles[type]
    )}>
      <div className="flex items-start space-x-3">
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="text-sm font-medium mb-1">
              {title}
            </h4>
          )}
          <p className="text-sm">
            {message}
          </p>
          {action && (
            <Button
              variant="ghost"
              size="sm"
              onClick={action.onClick}
              className="mt-2 h-6 px-2 text-xs"
            >
              {action.label}
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onOpenChange?.(false)}
          className="h-6 w-6 p-0 hover:bg-black/10 dark:hover:bg-white/10"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

// Responsive Bottom Sheet (Mobile)
interface ResponsiveBottomSheetProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title?: string
  children: React.ReactNode
  height?: 'auto' | 'half' | 'full'
  showHandle?: boolean
  className?: string
}

export const ResponsiveBottomSheet: React.FC<ResponsiveBottomSheetProps> = ({
  open,
  onOpenChange,
  title,
  children,
  height = 'auto',
  showHandle = true,
  className
}) => {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  const heightClasses = {
    auto: 'max-h-[85vh]',
    half: 'max-h-[50vh]',
    full: 'max-h-[95vh]'
  }

  // On desktop, use modal instead
  if (!isMobile) {
    return (
      <ResponsiveModal
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        size="lg"
      >
        {children}
      </ResponsiveModal>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className={cn("mx-auto w-full max-w-md", heightClasses[height], className)}>
        {showHandle && (
          <div className="flex justify-center mb-4">
            <div className="w-8 h-1 bg-muted rounded-full" />
          </div>
        )}
        
        {title && (
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
        )}
        
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

// Export responsive components as a grouped export
export const ResponsiveComponents = {
  Modal: ResponsiveModal,
  Alert: ResponsiveAlert,
  Confirm: ResponsiveConfirm,
  Toast: ResponsiveToast,
  BottomSheet: ResponsiveBottomSheet
}