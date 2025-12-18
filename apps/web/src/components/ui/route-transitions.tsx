import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/hooks/use-animation-hooks'

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    x: -20,
    y: 0,
    scale: 0.98
  },
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: {
    opacity: 0,
    x: 20,
    y: 0,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

const slideVariants = {
  initial: {
    opacity: 0,
    x: "100%",
    y: 0
  },
  animate: {
    opacity: 1,
    x: "0%",
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: {
    opacity: 0,
    x: "-100%",
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

const fadeVariants = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
}

const scaleVariants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    y: 20
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: {
    opacity: 0,
    scale: 1.1,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

const bounceVariants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    y: 50
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
      mass: 1
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: -50,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
}

// Main Route Transition Component
interface RouteTransitionProps {
  children: React.ReactNode
  variant?: "slide" | "fade" | "scale" | "bounce" | "page"
  className?: string
  duration?: number
  delay?: number
  reducedMotion?: boolean
}

export const RouteTransition: React.FC<RouteTransitionProps> = ({
  children,
  variant = "page",
  className,
  duration = 0.3,
  delay = 0,
  reducedMotion: reducedMotionProp
}) => {
  const location = useLocation()
  const prefersReducedMotion = usePrefersReducedMotion()
  const reducedMotion = reducedMotionProp ?? prefersReducedMotion

  const variants = {
    slide: slideVariants,
    fade: fadeVariants,
    scale: scaleVariants,
    bounce: bounceVariants,
    page: pageVariants
  }

  // Skip animation for very fast route changes
  const [skipAnimation, setSkipAnimation] = useState(false)
  const [lastRoute, setLastRoute] = useState(location.pathname)

  useEffect(() => {
    const timeDiff = Date.now() - (window as any).__lastRouteChange || 0
    if (timeDiff < 100) {
      setSkipAnimation(true)
      setTimeout(() => setSkipAnimation(false), 50)
    }
    ;(window as any).__lastRouteChange = Date.now()
    setLastRoute(location.pathname)
  }, [location.pathname])

  if (reducedMotion || skipAnimation) {
    return (
      <div className={cn("min-h-screen", className)}>
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          variants={variants[variant]}
          initial="initial"
          animate="animate"
          exit="exit"
          className={cn("min-h-screen", className)}
          transition={{
            duration,
            delay,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// Page Loading Overlay
interface PageLoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  text?: string
  variant?: "fade" | "slide" | "scale"
  backgroundBlur?: boolean
}

export const PageLoadingOverlay: React.FC<PageLoadingOverlayProps> = ({
  isLoading,
  children,
  text = "Loading...",
  variant = "fade",
  backgroundBlur = true
}) => {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div className="relative min-h-screen">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Background */}
            <div 
              className={cn(
                "absolute inset-0 bg-background",
                backgroundBlur && "backdrop-blur-sm"
              )}
            />
            
            {/* Loading Content */}
            <motion.div
              variants={{
                fade: {
                  initial: { opacity: 0, scale: 0.9 },
                  animate: { opacity: 1, scale: 1 },
                  exit: { opacity: 0, scale: 0.9 }
                },
                slide: {
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: -20 }
                },
                scale: {
                  initial: { opacity: 0, scale: 0.8 },
                  animate: { opacity: 1, scale: 1 },
                  exit: { opacity: 0, scale: 0.8 }
                }
              }}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ 
                duration: prefersReducedMotion ? 0.1 : 0.3,
                ease: "easeOut" 
              }}
              className="relative bg-background border rounded-lg p-6 shadow-lg"
            >
              <div className="flex flex-col items-center space-y-4">
                <motion.div
                  className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                />
                <p className="text-sm font-medium text-muted-foreground">
                  {text}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div
        animate={{
          opacity: isLoading ? 0.5 : 1,
          filter: isLoading ? "blur(1px)" : "blur(0px)"
        }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </div>
  )
}

// Loading Route Wrapper with transition effects
interface LoadingRouteWrapperProps {
  isLoading: boolean
  isInitialLoad?: boolean
  children: React.ReactNode
  loadingComponent?: React.ReactNode
  className?: string
}

export const LoadingRouteWrapper: React.FC<LoadingRouteWrapperProps> = ({
  isLoading,
  isInitialLoad = false,
  children,
  loadingComponent,
  className
}) => {
  const [showContent, setShowContent] = useState(!isInitialLoad)

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowContent(true), 100)
      return () => clearTimeout(timer)
    } else {
      setShowContent(false)
    }
  }, [isLoading, isInitialLoad])

  return (
    <div className={cn("relative min-h-screen", className)}>
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="absolute inset-0 z-40 bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-center h-full">
              {loadingComponent || (
                <div className="flex flex-col items-center space-y-4">
                  <motion.div
                    className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ 
                      duration: 1, 
                      repeat: Infinity, 
                      ease: "linear" 
                    }}
                  />
                  <p className="text-lg font-medium text-muted-foreground">
                    Loading...
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Content */}
      <motion.div
        animate={{
          opacity: showContent ? 1 : 0,
          y: showContent ? 0 : 20
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </div>
  )
}

// Staggered children animation for lists and grids
interface StaggeredContainerProps {
  children: React.ReactNode
  staggerDelay?: number
  className?: string
  reducedMotion?: boolean
}

export const StaggeredContainer: React.FC<StaggeredContainerProps> = ({
  children,
  staggerDelay = 0.1,
  className,
  reducedMotion: reducedMotionProp
}) => {
  const prefersReducedMotion = usePrefersReducedMotion()
  const reducedMotion = reducedMotionProp ?? prefersReducedMotion

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reducedMotion ? 0 : staggerDelay,
        delayChildren: reducedMotion ? 0 : 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reducedMotion ? 0.1 : 0.3,
        ease: "easeOut"
      }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="staggered-item"
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

// Page transition manager hook
export const usePageTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionVariant, setTransitionVariant] = useState<"slide" | "fade" | "scale" | "bounce" | "page">("page")

  const startTransition = (variant: "slide" | "fade" | "scale" | "bounce" | "page" = "page") => {
    setIsTransitioning(true)
    setTransitionVariant(variant)
    
    // Reset after animation completes
    setTimeout(() => {
      setIsTransitioning(false)
    }, 500)
  }

  return {
    isTransitioning,
    transitionVariant,
    startTransition
  }
}