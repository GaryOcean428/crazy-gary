import * as React from 'react'
import { cn } from '@/lib/utils'

// Responsive Image Component with Lazy Loading
interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  aspectRatio?: 'square' | 'video' | 'wide' | 'tall' | 'responsive'
  fallback?: string
  loading?: 'lazy' | 'eager'
  priority?: boolean
}

export const ResponsiveImage = React.forwardRef<HTMLImageElement, ResponsiveImageProps>(
  ({ 
    className, 
    aspectRatio = 'responsive',
    fallback,
    loading = 'lazy',
    priority = false,
    src,
    alt,
    ...props 
  }, ref) => {
    const [imageError, setImageError] = React.useState(false)
    const [imageLoading, setImageLoading] = React.useState(true)
    
    const aspectRatioClasses = {
      square: 'aspect-square',
      video: 'aspect-video',
      wide: 'aspect-[16/9]',
      tall: 'aspect-[3/4]',
      responsive: 'aspect-responsive'
    }

    const handleError = () => {
      setImageError(true)
      setImageLoading(false)
    }

    const handleLoad = () => {
      setImageLoading(false)
    }

    const finalSrc = imageError && fallback ? fallback : src

    return (
      <div className={cn('relative overflow-hidden', aspectRatioClasses[aspectRatio])}>
        {imageLoading && (
          <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <img
          ref={ref}
          src={finalSrc}
          alt={alt}
          loading={priority ? 'eager' : loading}
          onError={handleError}
          onLoad={handleLoad}
          className={cn(
            'img-responsive transition-opacity duration-300',
            imageLoading ? 'opacity-0' : 'opacity-100',
            className
          )}
          {...props}
        />
      </div>
    )
  }
)

ResponsiveImage.displayName = 'ResponsiveImage'

// Responsive Grid Component
interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
    large?: number
  }
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  autoFit?: boolean
  minItemWidth?: string
}

export const ResponsiveGrid = React.forwardRef<HTMLDivElement, ResponsiveGridProps>(
  ({ 
    className, 
    cols = { mobile: 1, tablet: 2, desktop: 3, large: 4 },
    gap = 'md',
    autoFit = false,
    minItemWidth = '280px',
    children,
    ...props 
  }, ref) => {
    const gapClasses = {
      sm: 'gap-2 sm:gap-3 lg:gap-4',
      md: 'gap-4 sm:gap-5 lg:gap-6',
      lg: 'gap-6 sm:gap-8 lg:gap-10',
      xl: 'gap-8 sm:gap-10 lg:gap-12'
    }

    const gridClasses = autoFit 
      ? `grid grid-cols-[repeat(auto-fit,minmax(${minItemWidth},1fr))] ${gapClasses[gap]}`
      : `grid grid-cols-1 sm:grid-cols-${cols.tablet || 2} lg:grid-cols-${cols.desktop || 3} xl:grid-cols-${cols.large || 4} ${gapClasses[gap]}`

    return (
      <div ref={ref} className={cn(gridClasses, className)} {...props}>
        {children}
      </div>
    )
  }
)

ResponsiveGrid.displayName = 'ResponsiveGrid'

// Responsive Container Component
interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '7xl' | 'full'
  padding?: 'sm' | 'md' | 'lg' | 'none'
  center?: boolean
}

export const ResponsiveContainer = React.forwardRef<HTMLDivElement, ResponsiveContainerProps>(
  ({ 
    className, 
    maxWidth = '7xl',
    padding = 'md',
    center = true,
    children,
    ...props 
  }, ref) => {
    const maxWidthClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '3xl': 'max-w-3xl',
      '4xl': 'max-w-4xl',
      '7xl': 'max-w-7xl',
      full: 'max-w-full'
    }

    const paddingClasses = {
      none: '',
      sm: 'px-4 sm:px-6',
      md: 'px-4 sm:px-6 lg:px-8',
      lg: 'px-6 sm:px-8 lg:px-12'
    }

    const containerClasses = cn(
      'w-full',
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      center && 'mx-auto',
      className
    )

    return (
      <div ref={ref} className={containerClasses} {...props}>
        {children}
      </div>
    )
  }
)

ResponsiveContainer.displayName = 'ResponsiveContainer'

// Responsive Typography Component
interface ResponsiveTextProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  align?: 'left' | 'center' | 'right' | 'justify'
  truncate?: boolean
}

export const ResponsiveText = React.forwardRef<
  HTMLHeadingElement | HTMLParagraphElement | HTMLSpanElement | HTMLDivElement,
  ResponsiveTextProps
>(({ 
  className, 
  as: Component = 'p',
  size = 'base',
  weight = 'normal',
  align = 'left',
  truncate = false,
  children,
  ...props 
}, ref) => {
  const sizeClasses = {
    xs: 'text-responsive-xs',
    sm: 'text-responsive-sm',
    base: 'text-responsive-base',
    lg: 'text-responsive-lg',
    xl: 'text-responsive-xl',
    '2xl': 'text-responsive-2xl',
    '3xl': 'text-responsive-3xl',
    '4xl': 'text-4xl sm:text-5xl lg:text-6xl'
  }

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  }

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify'
  }

  const textClasses = cn(
    sizeClasses[size],
    weightClasses[weight],
    alignClasses[align],
    truncate && 'truncate-responsive',
    className
  )

  return (
    <Component ref={ref as any} className={textClasses} {...props}>
      {children}
    </Component>
  )
})

ResponsiveText.displayName = 'ResponsiveText'

// Responsive Spacing Component
interface ResponsiveSpacingProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'vertical' | 'horizontal' | 'both'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
}

export const ResponsiveSpacing = React.forwardRef<HTMLDivElement, ResponsiveSpacingProps>(
  ({ 
    className, 
    direction = 'vertical',
    size = 'md',
    children,
    ...props 
  }, ref) => {
    const spacingClasses = {
      xs: 'space-responsive-sm',
      sm: 'space-responsive',
      md: 'space-responsive',
      lg: 'space-responsive-lg',
      xl: 'space-y-8 sm:space-y-12 lg:space-y-16'
    }

    const directionClasses = {
      vertical: spacingClasses[size],
      horizontal: 'flex-responsive-stack',
      both: `${spacingClasses[size]} flex-responsive-stack`
    }

    return (
      <div ref={ref} className={cn(directionClasses[direction], className)} {...props}>
        {children}
      </div>
    )
  }
)

ResponsiveSpacing.displayName = 'ResponsiveSpacing'

// Responsive Section Component
interface ResponsiveSectionProps extends React.HTMLAttributes<HTMLElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  background?: 'default' | 'muted' | 'card' | 'accent'
  container?: boolean
  as?: keyof JSX.IntrinsicElements
}

export const ResponsiveSection = React.forwardRef<HTMLElement, ResponsiveSectionProps>(
  ({ 
    className, 
    padding = 'md',
    background = 'default',
    container = true,
    as: Component = 'section',
    children,
    ...props 
  }, ref) => {
    const paddingClasses = {
      none: '',
      sm: 'p-4 sm:p-6',
      md: 'p-responsive',
      lg: 'p-responsive-lg',
      xl: 'py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8'
    }

    const backgroundClasses = {
      default: 'bg-background',
      muted: 'bg-muted/50',
      card: 'bg-card',
      accent: 'bg-accent/10'
    }

    const sectionClasses = cn(
      paddingClasses[padding],
      backgroundClasses[background],
      className
    )

    const content = container ? (
      <ResponsiveContainer>
        {children}
      </ResponsiveContainer>
    ) : children

    return (
      <Component ref={ref} className={sectionClasses} {...props}>
        {content}
      </Component>
    )
  }
)

ResponsiveSection.displayName = 'ResponsiveSection'