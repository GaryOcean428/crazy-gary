import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "dots" | "pulse" | "ring" | "dots-bounce"
  color?: "primary" | "secondary" | "muted" | "white"
  text?: string
  fullScreen?: boolean
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = "md", variant = "default", color = "primary", text, fullScreen = false, ...props }, ref) => {
    const sizes = {
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
      xl: "h-12 w-12"
    }

    const colors = {
      primary: "text-primary",
      secondary: "text-secondary",
      muted: "text-muted-foreground",
      white: "text-white"
    }

    const SpinnerComponent = () => {
      switch (variant) {
        case "dots":
          return (
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className={cn("w-2 h-2 rounded-full bg-current", colors[color])}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          )

        case "pulse":
          return (
            <motion.div
              className={cn("rounded-full bg-current", colors[color])}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
              style={{ width: sizes[size], height: sizes[size] }}
            />
          )

        case "ring":
          return (
            <motion.div
              className={cn("border-2 border-current border-t-transparent rounded-full", colors[color])}
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{ width: sizes[size], height: sizes[size] }}
            />
          )

        case "dots-bounce":
          return (
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className={cn("w-2 h-2 rounded-full bg-current", colors[color])}
                  animate={{
                    y: [0, -8, 0]
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          )

        default:
          return (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <Loader2 className={cn(sizes[size], colors[color])} />
            </motion.div>
          )
      }
    }

    const content = (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center space-y-2",
          fullScreen && "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
          className
        )}
        {...props}
      >
        <SpinnerComponent />
        {text && (
          <motion.p
            className={cn("text-sm font-medium", colors[color])}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {text}
          </motion.p>
        )}
      </div>
    )

    if (fullScreen) {
      return content
    }

    return content
  }
)
LoadingSpinner.displayName = "LoadingSpinner"

// Button loading state
interface ButtonLoadingProps extends LoadingSpinnerProps {
  showText?: boolean
}

const ButtonLoading = React.forwardRef<HTMLDivElement, ButtonLoadingProps>(
  ({ className, showText = false, text = "Loading...", ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center justify-center space-x-2", className)}
      {...props}
    >
      <LoadingSpinner size="sm" variant="pulse" color="white" {...props} />
      {showText && <span className="text-sm text-white">{text}</span>}
    </div>
  )
)
ButtonLoading.displayName = "ButtonLoading"

// Inline loading state
const InlineLoading = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = "sm", text, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("inline-flex items-center space-x-2", className)}
      {...props}
    >
      <LoadingSpinner size={size} variant="pulse" {...props} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  )
)
InlineLoading.displayName = "InlineLoading"

// Progress loading with steps
interface StepLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: string[]
  currentStep: number
  showProgress?: boolean
}

const StepLoading = React.forwardRef<HTMLDivElement, StepLoadingProps>(
  ({ className, steps, currentStep, showProgress = true, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-4", className)} {...props}>
      {steps.map((step, index) => (
        <motion.div
          key={index}
          className="flex items-center space-x-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex-shrink-0">
            {index < currentStep ? (
              <motion.div
                className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </motion.div>
            ) : index === currentStep ? (
              <LoadingSpinner size="sm" variant="pulse" />
            ) : (
              <div className="w-6 h-6 border-2 border-muted-foreground/30 rounded-full" />
            )}
          </div>
          <span
            className={cn(
              "text-sm",
              index < currentStep
                ? "text-green-600 font-medium"
                : index === currentStep
                ? "text-foreground font-medium"
                : "text-muted-foreground"
            )}
          >
            {step}
          </span>
        </motion.div>
      ))}
      {showProgress && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{Math.round((currentStep / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              className="bg-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}
    </div>
  )
)
StepLoading.displayName = "StepLoading"

export { LoadingSpinner, ButtonLoading, InlineLoading, StepLoading }