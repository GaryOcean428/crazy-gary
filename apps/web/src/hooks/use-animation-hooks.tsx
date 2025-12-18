import { useEffect, useState } from "react"
import { useMotionValue, useSpring, useTransform } from "framer-motion"

// Hook to detect if user prefers reduced motion
export const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  return prefersReducedMotion
}

// Hook for accessible animations
export const useAccessibleAnimation = (options: {
  duration?: number
  delay?: number
  ease?: string | number[]
  reducedMotion?: boolean
}) => {
  const prefersReducedMotion = usePrefersReducedMotion()
  const {
    duration = 0.3,
    delay = 0,
    ease = "easeOut",
    reducedMotion = prefersReducedMotion
  } = options

  const springConfig = {
    type: "spring" as const,
    stiffness: 200,
    damping: 20,
    mass: 1
  }

  const transition = reducedMotion
    ? { duration: 0.01, ease: "linear" }
    : { ...springConfig, delay }

  return { transition, reducedMotion }
}

// Hook for staggered animations
export const useStaggeredAnimation = (
  items: any[],
  staggerDelay: number = 0.1,
  reducedMotion?: boolean
) => {
  const prefersReducedMotion = usePrefersReducedMotion()
  const shouldReduceMotion = reducedMotion ?? prefersReducedMotion

  return {
    initial: "hidden",
    animate: "visible",
    variants: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: shouldReduceMotion ? 0 : staggerDelay,
          delayChildren: shouldReduceMotion ? 0 : 0.1
        }
      }
    }
  }
}

// Hook for list item animations
export const useListAnimation = (
  direction: "up" | "down" | "left" | "right" = "up",
  reducedMotion?: boolean
) => {
  const prefersReducedMotion = usePrefersReducedMotion()
  const shouldReduceMotion = reducedMotion ?? prefersReducedMotion

  const directionMap = {
    up: { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 } },
    down: { initial: { y: -20, opacity: 0 }, animate: { y: 0, opacity: 1 } },
    left: { initial: { x: 20, opacity: 0 }, animate: { x: 0, opacity: 1 } },
    right: { initial: { x: -20, opacity: 0 }, animate: { x: 0, opacity: 1 } }
  }

  return shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.1 }
      }
    : {
        initial: directionMap[direction].initial,
        animate: directionMap[direction].animate,
        exit: { opacity: 0, scale: 0.95 },
        transition: { duration: 0.3, ease: "easeOut" }
      }
}

// Hook for loading state animations
export const useLoadingAnimation = (
  type: "pulse" | "bounce" | "spin" | "wave" = "pulse",
  reducedMotion?: boolean
) => {
  const prefersReducedMotion = usePrefersReducedMotion()
  const shouldReduceMotion = reducedMotion ?? prefersReducedMotion

  const animations = {
    pulse: {
      initial: { opacity: 0.6 },
      animate: { opacity: [0.6, 1, 0.6] },
      transition: { duration: 1.5, repeat: Infinity }
    },
    bounce: {
      initial: { y: 0 },
      animate: { y: [-5, 0, -5, 0] },
      transition: { duration: 1, repeat: Infinity }
    },
    spin: {
      initial: { rotate: 0 },
      animate: { rotate: 360 },
      transition: { duration: 1, repeat: Infinity, ease: "linear" }
    },
    wave: {
      initial: { x: "-100%" },
      animate: { x: "100%" },
      transition: { duration: 2, repeat: Infinity, ease: "linear" }
    }
  }

  return shouldReduceMotion
    ? {
        initial: { opacity: 0.6 },
        animate: { opacity: 0.6 },
        transition: { duration: 0.1 }
      }
    : animations[type]
}

// Hook for notification animations
export const useNotificationAnimation = (
  position: "top-right" | "top-left" | "bottom-right" | "bottom-left" = "top-right",
  reducedMotion?: boolean
) => {
  const prefersReducedMotion = usePrefersReducedMotion()
  const shouldReduceMotion = reducedMotion ?? prefersReducedMotion

  const positionMap = {
    "top-right": { initial: { x: 100, opacity: 0 }, animate: { x: 0, opacity: 1 } },
    "top-left": { initial: { x: -100, opacity: 0 }, animate: { x: 0, opacity: 1 } },
    "bottom-right": { initial: { y: 100, opacity: 0 }, animate: { y: 0, opacity: 1 } },
    "bottom-left": { initial: { y: 100, opacity: 0 }, animate: { y: 0, opacity: 1 } }
  }

  return shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.1 }
      }
    : {
        ...positionMap[position],
        exit: { opacity: 0, scale: 0.95 },
        transition: { duration: 0.3, ease: "easeOut" }
      }
}

// Hook for modal/dialog animations
export const useModalAnimation = (reducedMotion?: boolean) => {
  const prefersReducedMotion = usePrefersReducedMotion()
  const shouldReduceMotion = reducedMotion ?? prefersReducedMotion

  return shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.1 }
      }
    : {
        initial: { opacity: 0, scale: 0.9, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.9, y: 20 },
        transition: { duration: 0.3, ease: "easeOut" }
      }
}

// Hook for page transitions
export const usePageTransition = (
  direction: "left" | "right" | "up" | "down" = "up",
  reducedMotion?: boolean
) => {
  const prefersReducedMotion = usePrefersReducedMotion()
  const shouldReduceMotion = reducedMotion ?? prefersReducedMotion

  const directionMap = {
    left: { initial: { x: "100%", opacity: 0 }, animate: { x: "0%", opacity: 1 } },
    right: { initial: { x: "-100%", opacity: 0 }, animate: { x: "0%", opacity: 1 } },
    up: { initial: { y: "100%", opacity: 0 }, animate: { y: "0%", opacity: 1 } },
    down: { initial: { y: "-100%", opacity: 0 }, animate: { y: "0%", opacity: 1 } }
  }

  return shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.1 }
      }
    : {
        ...directionMap[direction],
        exit: { opacity: 0 },
        transition: { duration: 0.3, ease: "easeInOut" }
      }
}

// Hook for intersection observer with animation
export const useIntersectionAnimation = (
  options: {
    threshold?: number
    rootMargin?: string
    triggerOnce?: boolean
    reducedMotion?: boolean
  } = {}
) => {
  const prefersReducedMotion = usePrefersReducedMotion()
  const {
    threshold = 0.1,
    rootMargin = "0px",
    triggerOnce = true,
    reducedMotion = prefersReducedMotion
  } = options

  const [isVisible, setIsVisible] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const ref = useMotionValue(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (!triggerOnce || !hasTriggered) {
            setHasTriggered(true)
          }
        } else if (!triggerOnce) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold, rootMargin, triggerOnce, hasTriggered])

  return {
    ref,
    isVisible: triggerOnce ? hasTriggered : isVisible,
    reducedMotion
  }
}

// Hook for parallax scrolling
export const useParallax = (speed: number = 0.5, reducedMotion?: boolean) => {
  const prefersReducedMotion = usePrefersReducedMotion()
  const shouldReduceMotion = reducedMotion ?? prefersReducedMotion

  const y = useMotionValue(0)
  const scrollY = useMotionValue(0)

  useEffect(() => {
    if (shouldReduceMotion) return

    const updateScrollY = () => {
      scrollY.set(window.scrollY)
    }

    window.addEventListener("scroll", updateScrollY)
    return () => window.removeEventListener("scroll", updateScrollY)
  }, [scrollY, shouldReduceMotion])

  const parallaxY = useTransform(scrollY, [0, 1000], [0, 1000 * speed])

  return shouldReduceMotion ? y : parallaxY
}

// Hook for magnetic hover effect
export const useMagneticHover = (strength: number = 0.3, reducedMotion?: boolean) => {
  const prefersReducedMotion = usePrefersReducedMotion()
  const shouldReduceMotion = reducedMotion ?? prefersReducedMotion

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springConfig = {
    stiffness: 150,
    damping: 15,
    mass: 0.1
  }

  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (shouldReduceMotion) return

    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY

    x.set(mouseX * strength)
    y.set(mouseY * strength)
  }

  const handleMouseLeave = () => {
    if (shouldReduceMotion) return

    x.set(0)
    y.set(0)
  }

  return { x: springX, y: springY, handleMouseMove, handleMouseLeave }
}