import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info,
  Sparkles,
  Zap,
  Heart,
  ThumbsUp,
  ThumbsDown
} from "lucide-react"
import { Button } from "@/components/ui/button"

// Hover interaction wrapper
interface HoverInteractionProps {
  children: React.ReactNode
  className?: string
  hoverScale?: number
  hoverRotate?: number
  hoverShadow?: string
  hoverBorder?: string
  hoverBackground?: string
  disabled?: boolean
  onHoverStart?: () => void
  onHoverEnd?: () => void
}

const HoverInteraction: React.FC<HoverInteractionProps> = ({
  children,
  className,
  hoverScale = 1.02,
  hoverRotate = 0,
  hoverShadow = "0 10px 25px rgba(0,0,0,0.1)",
  hoverBorder,
  hoverBackground,
  disabled = false,
  onHoverStart,
  onHoverEnd
}) => {
  return (
    <motion.div
      className={cn("cursor-pointer", className)}
      whileHover={disabled ? undefined : {
        scale: hoverScale,
        rotate: hoverRotate,
        boxShadow: hoverShadow,
        borderColor: hoverBorder,
        backgroundColor: hoverBackground,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      whileTap={disabled ? undefined : {
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
    >
      {children}
    </motion.div>
  )
}

// Card hover interaction with lift effect
interface CardHoverProps {
  children: React.ReactNode
  className?: string
  elevation?: "sm" | "md" | "lg" | "xl"
  glow?: boolean
  disabled?: boolean
}

const CardHover: React.FC<CardHoverProps> = ({
  children,
  className,
  elevation = "md",
  glow = false,
  disabled = false
}) => {
  const elevations = {
    sm: "0 2px 8px rgba(0,0,0,0.1)",
    md: "0 4px 12px rgba(0,0,0,0.1)",
    lg: "0 8px 24px rgba(0,0,0,0.12)",
    xl: "0 12px 32px rgba(0,0,0,0.15)"
  }

  return (
    <motion.div
      className={cn(
        "bg-background border rounded-lg transition-colors duration-200",
        className
      )}
      whileHover={disabled ? undefined : {
        y: -4,
        boxShadow: elevations[elevation],
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      whileTap={disabled ? undefined : {
        y: -2,
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      animate={glow ? {
        boxShadow: [
          "0 0 0 rgba(59, 130, 246, 0.4)",
          "0 0 20px rgba(59, 130, 246, 0.3)",
          "0 0 0 rgba(59, 130, 246, 0.4)"
        ]
      } : undefined}
      transition={glow ? { duration: 2, repeat: Infinity } : undefined}
    >
      {children}
    </motion.div>
  )
}

// Button micro-interactions
interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "success" | "error" | "warning" | "info"
  loading?: boolean
  success?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  variant = "default",
  loading = false,
  success = false,
  icon,
  children,
  className,
  disabled,
  onClick,
  ...props
}) => {
  const variants = {
    default: "bg-primary hover:bg-primary/90",
    success: "bg-green-500 hover:bg-green-600",
    error: "bg-red-500 hover:bg-red-600",
    warning: "bg-yellow-500 hover:bg-yellow-600",
    info: "bg-blue-500 hover:bg-blue-600"
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading && onClick) {
      onClick(e)
    }
  }

  return (
    <motion.button
      className={cn(
        "inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      whileHover={disabled || loading ? undefined : {
        scale: 1.02,
        transition: { duration: 0.1 }
      }}
      whileTap={disabled || loading ? undefined : {
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"
          />
        ) : success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="mr-2"
          >
            <CheckCircle className="w-4 h-4" />
          </motion.div>
        ) : (
          icon && (
            <motion.span
              key="icon"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="mr-2"
            >
              {icon}
            </motion.span>
          )
        )}
      </AnimatePresence>
      
      <AnimatePresence mode="wait">
        <motion.span
          key={loading ? "loading-text" : success ? "success-text" : "normal-text"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {loading ? "Loading..." : success ? "Success!" : children}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}

// Feedback animations for actions
interface FeedbackAnimationProps {
  type: "success" | "error" | "warning" | "info" | "heart" | "star" | "zap"
  show: boolean
  message?: string
  onComplete?: () => void
  className?: string
}

const FeedbackAnimation: React.FC<FeedbackAnimationProps> = ({
  type,
  show,
  message,
  onComplete,
  className
}) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
    heart: Heart,
    star: Sparkles,
    zap: Zap
  }

  const colors = {
    success: "text-green-500",
    error: "text-red-500",
    warning: "text-yellow-500",
    info: "text-blue-500",
    heart: "text-pink-500",
    star: "text-yellow-500",
    zap: "text-purple-500"
  }

  const Icon = icons[type]

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            rotate: [0, 10, -10, 0]
          }}
          exit={{ opacity: 0, scale: 0.5, y: -20 }}
          transition={{ 
            opacity: { duration: 0.2 },
            scale: { duration: 0.3, type: "spring", stiffness: 200 },
            y: { duration: 0.3 },
            rotate: { duration: 0.5, delay: 0.2 }
          }}
          onAnimationComplete={onComplete}
          className={cn(
            "fixed top-4 right-4 z-50 flex items-center space-x-2 bg-background border rounded-lg px-4 py-2 shadow-lg",
            className
          )}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          >
            <Icon className={cn("w-5 h-5", colors[type])} />
          </motion.div>
          {message && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm font-medium"
            >
              {message}
            </motion.span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Page transition wrapper
interface PageTransitionProps {
  children: React.ReactNode
  className?: string
  variant?: "slide" | "fade" | "scale" | "slide-up" | "slide-down"
  duration?: number
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className,
  variant = "slide-up",
  duration = 0.3
}) => {
  const variants = {
    slide: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 }
    },
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.05 }
    },
    "slide-up": {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 }
    },
    "slide-down": {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 }
    }
  }

  return (
    <motion.div
      className={className}
      initial={variants[variant].initial}
      animate={variants[variant].animate}
      exit={variants[variant].exit}
      transition={{ duration }}
    >
      {children}
    </motion.div>
  )
}

// Like/Dislike interaction
interface LikeDislikeProps {
  liked?: boolean
  disliked?: boolean
  onLike?: () => void
  onDislike?: () => void
  className?: string
  showLabel?: boolean
}

const LikeDislike: React.FC<LikeDislikeProps> = ({
  liked = false,
  disliked = false,
  onLike,
  onDislike,
  className,
  showLabel = true
}) => {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <motion.button
        className={cn(
          "flex items-center space-x-1 px-2 py-1 rounded transition-colors",
          liked ? "text-green-600 bg-green-50" : "text-muted-foreground hover:text-green-600"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onLike}
      >
        <motion.div
          animate={liked ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <ThumbsUp className="w-4 h-4" />
        </motion.div>
        {showLabel && <span className="text-xs">Like</span>}
      </motion.button>

      <motion.button
        className={cn(
          "flex items-center space-x-1 px-2 py-1 rounded transition-colors",
          disliked ? "text-red-600 bg-red-50" : "text-muted-foreground hover:text-red-600"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onDislike}
      >
        <motion.div
          animate={disliked ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <ThumbsDown className="w-4 h-4" />
        </motion.div>
        {showLabel && <span className="text-xs">Dislike</span>}
      </motion.button>
    </div>
  )
}

export { 
  HoverInteraction, 
  CardHover, 
  AnimatedButton, 
  FeedbackAnimation, 
  PageTransition,
  LikeDislike
}