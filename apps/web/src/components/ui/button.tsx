import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { usePrefersReducedMotion } from "@/hooks/use-animation-hooks"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-responsive-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive group relative overflow-hidden interactive-mobile",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md active:shadow-sm transform active:scale-[0.98]",
        destructive:
          "bg-destructive text-white shadow-sm hover:bg-destructive/90 hover:shadow-md active:shadow-sm transform active:scale-[0.98] focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:shadow-md active:shadow-sm transform active:scale-[0.98] dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md active:shadow-sm transform active:scale-[0.98]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground hover:shadow-sm active:shadow-sm transform active:scale-[0.98] dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline active:no-underline",
        success:
          "bg-green-500 text-white shadow-sm hover:bg-green-600 hover:shadow-md active:shadow-sm transform active:scale-[0.98]",
        warning:
          "bg-yellow-500 text-white shadow-sm hover:bg-yellow-600 hover:shadow-md active:shadow-sm transform active:scale-[0.98]",
      },
      size: {
        default: "h-10 sm:h-9 px-4 sm:px-4 py-2 has-[>svg]:px-3 btn-touch",
        sm: "h-8 sm:h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 btn-touch-sm",
        lg: "h-12 sm:h-10 rounded-md px-6 sm:px-6 has-[>svg]:px-4 btn-touch-lg",
        icon: "size-10 sm:size-9 btn-touch",
      },
      loading: {
        true: "pointer-events-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  success?: boolean
  successText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    loadingText,
    success = false,
    successText,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    const prefersReducedMotion = usePrefersReducedMotion()

    const isDisabled = disabled || loading

    return (
      <motion.div
        whileHover={!isDisabled ? { scale: 1.02 } : undefined}
        whileTap={!isDisabled ? { scale: 0.98 } : undefined}
        transition={{ duration: 0.1 }}
      >
        <Comp
          data-slot="button"
          className={cn(buttonVariants({ variant, size, loading, className }))}
          ref={ref}
          disabled={isDisabled}
          {...props}
        >
          {/* Ripple effect for touch devices */}
          <motion.div
            className="absolute inset-0 bg-white/20 rounded-md"
            initial={{ scale: 0, opacity: 1 }}
            whileTap={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
          
          <span className="relative z-10 flex items-center justify-center">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {loadingText || "Loading..."}
              </>
            ) : success ? (
              <>
                <motion.svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </motion.svg>
                {successText || "Success!"}
              </>
            ) : (
              children
            )}
          </span>
        </Comp>
      </motion.div>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
