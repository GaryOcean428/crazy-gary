import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"

// Enhanced Responsive Dialog Overlay
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      // Mobile-specific optimizations
      "data-[mobile=full]:bg-black/80 data-[mobile=full]:backdrop-blur-md",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

// Enhanced Responsive Dialog Content
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'auto'
    mobileFull?: boolean
    showCloseButton?: boolean
  }
>(({ className, children, size = 'md', mobileFull = false, showCloseButton = true, ...props }, ref) => {
  const isMobile = useIsMobile()
  
  const sizeClasses = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg", 
    xl: "sm:max-w-xl",
    full: "max-w-none",
    auto: "sm:max-w-2xl md:max-w-3xl lg:max-w-4xl"
  }
  
  const isFullScreen = mobileFull || size === 'full'
  
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay 
        data-mobile={isMobile ? "full" : undefined}
      />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          // Responsive sizing
          sizeClasses[size],
          // Mobile full-screen behavior
          isMobile && isFullScreen && [
            "inset-0 top-0 left-0 right-0 bottom-0 translate-x-0 translate-y-0 w-full h-full max-w-none max-h-none rounded-none border-0 p-0",
            "data-[mobile=full]:animate-in data-[mobile=full]:fade-in-0 data-[mobile=full]:slide-in-from-bottom-full"
          ],
          // Mobile padding adjustments
          isMobile && !isFullScreen && "p-4 sm:p-6",
          // Safe area support
          "safe-area-inset",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && !isFullScreen && (
          <DialogPrimitive.Close asChild>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-4 h-8 w-8 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
})
DialogContent.displayName = DialogPrimitive.Content.displayName

// Responsive Dialog Header
const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left pb-4 border-b",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

// Responsive Dialog Footer
const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4 border-t",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

// Responsive Dialog Title
const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      // Responsive text sizing
      "text-base sm:text-lg",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

// Responsive Dialog Description
const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(
      "text-sm text-muted-foreground",
      // Mobile adjustments
      "text-xs sm:text-sm",
      className
    )}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

// Responsive Dialog Trigger
const DialogTrigger = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Trigger
    ref={ref}
    className={cn(
      "touch-manipulation",
      className
    )}
    {...props}
  />
))
DialogTrigger.displayName = DialogPrimitive.Trigger.displayName

// Responsive Dialog Close
const DialogClose = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Close
    ref={ref}
    className={cn(
      "touch-manipulation",
      className
    )}
    {...props}
  />
))
DialogClose.displayName = DialogPrimitive.Close.displayName

// Main Responsive Dialog Component
const ResponsiveDialog = DialogPrimitive.Root

const ResponsiveDialogTrigger = DialogTrigger

const ResponsiveDialogContent = DialogContent

const ResponsiveDialogHeader = DialogHeader

const ResponsiveDialogFooter = DialogFooter

const ResponsiveDialogTitle = DialogTitle

const ResponsiveDialogDescription = DialogDescription

const ResponsiveDialogClose = DialogClose

// Bottom Sheet Component (Mobile-specific)
const BottomSheet = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    title?: string
    description?: string
    showHandle?: boolean
  }
>(({ className, children, open, onOpenChange, title, description, showHandle = true, ...props }, ref) => {
  const isMobile = useIsMobile()
  
  React.useEffect(() => {
    if (open && isMobile) {
      // Prevent body scroll when bottom sheet is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [open, isMobile])
  
  if (!isMobile) {
    // Fallback to regular dialog on desktop
    return (
      <div className="hidden" />
    )
  }
  
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => onOpenChange?.(false)}
          aria-hidden="true"
        />
      )}
      
      {/* Bottom Sheet */}
      <div
        ref={ref}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 bg-background rounded-t-2xl border-t shadow-lg transform transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "translate-y-full",
          "max-h-[85vh] overflow-hidden",
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        {...props}
      >
        {/* Handle */}
        {showHandle && (
          <div className="flex justify-center py-2">
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-y-contain">
          {(title || description) && (
            <div className="px-4 pb-4 border-b">
              {title && (
                <h2 className="text-lg font-semibold text-foreground">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
          )}
          
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </>
  )
})
BottomSheet.displayName = "BottomSheet"

// Responsive Alert Dialog
const ResponsiveAlertDialog = ({
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) => (
  <DialogPrimitive.Root {...props}>
    {children}
  </DialogPrimitive.Root>
)

const ResponsiveAlertDialogTrigger = DialogTrigger

const ResponsiveAlertDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const isMobile = useIsMobile()
  
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200",
          // Mobile optimizations
          isMobile && "max-w-[calc(100vw-2rem)] mx-4 p-4",
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
})
ResponsiveAlertDialogContent.displayName = "ResponsiveAlertDialogContent"

const ResponsiveAlertDialogHeader = DialogHeader
const ResponsiveAlertDialogFooter = DialogFooter
const ResponsiveAlertDialogTitle = DialogTitle
const ResponsiveAlertDialogDescription = DialogDescription
const ResponsiveAlertDialogAction = DialogClose
const ResponsiveAlertDialogCancel = DialogClose

export {
  ResponsiveDialog,
  ResponsiveDialogTrigger,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogFooter,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogClose,
  BottomSheet,
  ResponsiveAlertDialog,
  ResponsiveAlertDialogTrigger,
  ResponsiveAlertDialogContent,
  ResponsiveAlertDialogHeader,
  ResponsiveAlertDialogFooter,
  ResponsiveAlertDialogTitle,
  ResponsiveAlertDialogDescription,
  ResponsiveAlertDialogAction,
  ResponsiveAlertDialogCancel,
  // Re-export original components for compatibility
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}

// Original Dialog components (keeping for backward compatibility)
const Dialog = ResponsiveDialog
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

// Keep all the original component exports
export {
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
  DialogPortal,
}