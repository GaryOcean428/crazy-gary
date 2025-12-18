import * as React from "react"
import { cn } from "@/lib/utils"
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile"

// Responsive Image Container
const ResponsiveImageContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    aspectRatio?: 'auto' | 'square' | 'video' | 'photo' | 'landscape' | 'portrait' | 'wide' | 'ultrawide'
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
    loading?: 'lazy' | 'eager'
    sizes?: string
  }
>(({ className, aspectRatio = 'auto', objectFit = 'cover', loading = 'lazy', sizes, children, ...props }, ref) => {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  
  const aspectRatioClasses = {
    auto: '',
    square: 'aspect-square',
    video: 'aspect-video',
    photo: 'aspect-[4/3]',
    landscape: 'aspect-[3/2]',
    portrait: 'aspect-[2/3]',
    wide: 'aspect-[16/9]',
    ultrawide: 'aspect-[21/9]'
  }
  
  const objectFitClasses = {
    contain: 'object-contain',
    cover: 'object-cover',
    fill: 'object-fill',
    none: 'object-none',
    'scale-down': 'object-scale-down'
  }
  
  // Generate responsive sizes attribute
  const getSizes = () => {
    if (sizes) return sizes
    if (isMobile) return '(max-width: 640px) 100vw, (max-width: 768px) 100vw'
    if (isTablet) return '(max-width: 1024px) 100vw, 768px'
    return '(max-width: 1024px) 100vw, 1024px'
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden bg-muted/20",
        aspectRatioClasses[aspectRatio],
        className
      )}
      {...props}
    >
      {React.cloneElement(children as React.ReactElement, {
        className: cn(
          'w-full h-full',
          objectFitClasses[objectFit],
          (children as React.ReactElement).props.className
        ),
        loading,
        sizes: getSizes()
      })}
    </div>
  )
})
ResponsiveImageContainer.displayName = "ResponsiveImageContainer"

// Responsive Image Component
const ResponsiveImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement> & {
    fallbackSrc?: string
    placeholderSrc?: string
    showPlaceholder?: boolean
    priority?: boolean
  }
>(({ 
  className, 
  fallbackSrc, 
  placeholderSrc, 
  showPlaceholder = true, 
  priority = false,
  src, 
  alt,
  ...props 
}, ref) => {
  const [imageSrc, setImageSrc] = React.useState(src)
  const [imageError, setImageError] = React.useState(false)
  const [isLoaded, setIsLoaded] = React.useState(false)
  
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  
  // Determine image size based on device
  const getImageSizes = () => {
    if (isMobile) return 'w:320px 320w, w:640px 640w'
    if (isTablet) return 'w:640px 640w, w:768px 768w, w:1024px 1024w'
    return 'w:768px 768w, w:1024px 1024w, w:1920px 1920w'
  }
  
  React.useEffect(() => {
    setImageSrc(src)
    setImageError(false)
    setIsLoaded(false)
  }, [src])
  
  const handleError = () => {
    if (!imageError && fallbackSrc) {
      setImageSrc(fallbackSrc)
      setImageError(true)
    }
  }
  
  const handleLoad = () => {
    setIsLoaded(true)
  }
  
  return (
    <>
      {/* Placeholder */}
      {showPlaceholder && !isLoaded && placeholderSrc && (
        <img
          src={placeholderSrc}
          alt=""
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
            isLoaded && "opacity-0"
          )}
          aria-hidden="true"
        />
      )}
      
      {/* Loading skeleton */}
      {showPlaceholder && !isLoaded && !placeholderSrc && (
        <div className="absolute inset-0 bg-muted/20 animate-pulse" />
      )}
      
      {/* Main image */}
      <img
        ref={ref}
        src={imageSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    </>
  )
})
ResponsiveImage.displayName = "ResponsiveImage"

// Responsive Picture Component
const ResponsivePicture = React.forwardRef<
  HTMLPictureElement,
  React.HTMLAttributes<HTMLPictureElement>
>(({ className, children, ...props }, ref) => (
  <picture
    ref={ref}
    className={cn("block w-full h-full", className)}
    {...props}
  >
    {children}
  </picture>
))
ResponsivePicture.displayName = "ResponsivePicture"

// Responsive Source Component
const ResponsiveSource = React.forwardRef<
  HTMLSourceElement,
  React.SourceHTMLAttributes<HTMLSourceElement> & {
    media?: string
    type?: string
    srcSet?: string
  }
>(({ className, media, type, srcSet, ...props }, ref) => (
  <source
    ref={ref}
    media={media}
    type={type}
    srcSet={srcSet}
    className={className}
    {...props}
  />
))
ResponsiveSource.displayName = "ResponsiveSource"

// Responsive Video Component
const ResponsiveVideo = React.forwardRef<
  HTMLVideoElement,
  React.VideoHTMLAttributes<HTMLVideoElement> & {
    poster?: string
    autoPlay?: boolean
    muted?: boolean
    controls?: boolean
    loop?: boolean
    preload?: 'none' | 'metadata' | 'auto'
  }
>(({ className, poster, autoPlay, muted, controls, loop, preload = 'metadata', ...props }, ref) => {
  const isMobile = useIsMobile()
  
  return (
    <video
      ref={ref}
      poster={poster}
      autoPlay={autoPlay}
      muted={muted}
      controls={controls}
      loop={loop}
      preload={isMobile ? 'metadata' : preload}
      className={cn(
        "w-full h-full object-cover",
        isMobile && "playsinline", // Important for mobile
        className
      )}
      {...props}
    />
  )
})
ResponsiveVideo.displayName = "ResponsiveVideo"

// Responsive Iframe Component
const ResponsiveIframe = React.forwardRef<
  HTMLIFrameElement,
  React.IframeHTMLAttributes<HTMLIFrameElement> & {
    allowFullScreen?: boolean
    loading?: 'lazy' | 'eager'
  }
>(({ className, allowFullScreen = true, loading = 'lazy', ...props }, ref) => {
  const isMobile = useIsMobile()
  
  return (
    <iframe
      ref={ref}
      loading={loading}
      allowFullScreen={allowFullScreen}
      className={cn(
        "w-full h-full border-0",
        isMobile && "min-h-[250px]", // Ensure minimum height on mobile
        className
      )}
      {...props}
    />
  )
})
ResponsiveIframe.displayName = "ResponsiveIframe"

// Media Gallery Component
const MediaGallery = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    columns?: 1 | 2 | 3 | 4 | 'auto'
    gap?: 'sm' | 'md' | 'lg'
    aspectRatio?: 'auto' | 'square' | 'video' | 'photo'
  }
>(({ className, columns = 'auto', gap = 'md', aspectRatio = 'auto', children, ...props }, ref) => {
  const isMobile = useIsMobile()
  
  const columnsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2', 
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    auto: isMobile ? 'grid-cols-2' : 'grid-cols-3 md:grid-cols-4'
  }
  
  const gapClasses = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-3 sm:gap-4',
    lg: 'gap-4 sm:gap-6'
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        "grid w-full",
        columnsClasses[columns],
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <div
          key={index}
          className={cn(
            "relative overflow-hidden rounded-lg bg-muted/20",
            aspectRatio !== 'auto' && [
              aspectRatio === 'square' && 'aspect-square',
              aspectRatio === 'video' && 'aspect-video',
              aspectRatio === 'photo' && 'aspect-[4/3]'
            ]
          )}
        >
          {child}
        </div>
      ))}
    </div>
  )
})
MediaGallery.displayName = "MediaGallery"

// Lazy Loading Wrapper
const LazyLoadWrapper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    threshold?: number
    rootMargin?: string
    placeholder?: React.ReactNode
  }
>(({ className, threshold = 0.1, rootMargin = '50px', placeholder, children, ...props }, ref) => {
  const [isVisible, setIsVisible] = React.useState(false)
  const [hasLoaded, setHasLoaded] = React.useState(false)
  const elementRef = React.useRef<HTMLDivElement>(null)
  
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          setHasLoaded(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )
    
    if (elementRef.current) {
      observer.observe(elementRef.current)
    }
    
    return () => observer.disconnect()
  }, [threshold, rootMargin])
  
  return (
    <div
      ref={(node) => {
        elementRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      className={cn("relative", className)}
      {...props}
    >
      {!hasLoaded && placeholder && (
        <div className="absolute inset-0 flex items-center justify-center">
          {placeholder}
        </div>
      )}
      {isVisible && children}
    </div>
  )
})
LazyLoadWrapper.displayName = "LazyLoadWrapper"

// Image with responsive srcSet
const createResponsiveSrcSet = (
  baseSrc: string,
  sizes: Array<{ width: number; suffix?: string }>
) => {
  return sizes
    .map(({ width, suffix = '' }) => {
      const url = baseSrc.replace(/\.(jpg|jpeg|png|webp|avif)$/i, `${suffix}.$1`)
      return `${url} ${width}w`
    })
    .join(', ')
}

// Responsive Art Direction Component
const ResponsiveArtDirection = ({
  mobile,
  tablet,
  desktop,
  fallback,
  alt,
  className,
  ...props
}: {
  mobile: string
  tablet?: string
  desktop?: string
  fallback: string
  alt: string
  className?: string
} & React.ImgHTMLAttributes<HTMLImageElement>) => {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  
  const getCurrentSrc = () => {
    if (isMobile && mobile) return mobile
    if (isTablet && tablet) return tablet
    if (desktop) return desktop
    return fallback
  }
  
  return (
    <ResponsiveImage
      src={getCurrentSrc()}
      alt={alt}
      className={className}
      {...props}
    />
  )
}

export {
  ResponsiveImageContainer,
  ResponsiveImage,
  ResponsivePicture,
  ResponsiveSource,
  ResponsiveVideo,
  ResponsiveIframe,
  MediaGallery,
  LazyLoadWrapper,
  createResponsiveSrcSet,
  ResponsiveArtDirection,
}