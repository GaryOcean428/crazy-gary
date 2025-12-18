import React, { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Polymorphic Component Utility Types
export type AsProp<E extends React.ElementType = React.ElementType> = {
  as?: E
}

export type PolymorphicProps<E extends React.ElementType> = 
  & React.ComponentPropsWithoutRef<E>
  & AsProp<E>
  & VariantProps<any>

export type PolymorphicRef<E extends React.ElementType> = 
  React.ComponentPropsWithRef<E>['ref']

// Polymorphic Component Base
export function createPolymorphicComponent<
  E extends React.ElementType,
  V extends Record<string, any>
>({
  defaultComponent,
  defaultVariants,
  variants
}: {
  defaultComponent: E
  defaultVariants?: V
  variants?: Record<string, Record<string, string>>
}) {
  const polymorphicCva = cva('', {
    variants: variants || {},
    defaultVariants
  })

  type ComponentProps<E extends React.ElementType> = PolymorphicProps<E> & {
    className?: string
    children?: React.ReactNode
  }

  const Component = <E extends React.ElementType = typeof defaultComponent>(
    {
      as,
      className,
      children,
      ...props
    }: ComponentProps<E>,
    ref: PolymorphicRef<E>
  ) => {
    const Comp = as || defaultComponent
    
    return (
      <Comp
        ref={ref}
        className={cn(polymorphicCva(props as V), className)}
        {...(props as any)}
      >
        {children}
      </Comp>
    )
  }

  Component.displayName = `Polymorphic${defaultComponent}`

  return Component
}

// Enhanced Polymorphic Component with Slot Support
export function createEnhancedPolymorphicComponent<
  E extends React.ElementType,
  V extends Record<string, any>
>({
  defaultComponent,
  defaultVariants,
  variants,
  className: baseClassName
}: {
  defaultComponent: E
  defaultVariants?: V
  variants?: Record<string, Record<string, string>>
  className?: string
}) {
  const polymorphicCva = cva(baseClassName || '', {
    variants: variants || {},
    defaultVariants
  })

  type ComponentProps<E extends React.ElementType> = PolymorphicProps<E> & {
    className?: string
    children?: React.ReactNode
    asChild?: boolean
  }

  const Component = <E extends React.ElementType = typeof defaultComponent>(
    {
      as,
      className,
      children,
      asChild = false,
      ...props
    }: ComponentProps<E>,
    ref: PolymorphicRef<E>
  ) => {
    const Comp = asChild ? Slot : (as || defaultComponent)
    
    return (
      <Comp
        ref={ref}
        className={cn(polymorphicCva(props as V), className)}
        {...(props as any)}
      >
        {children}
      </Comp>
    )
  }

  Component.displayName = `EnhancedPolymorphic${defaultComponent}`

  return Component
}

// Button Variants
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Polymorphic Button
export type ButtonProps<E extends React.ElementType = 'button'> = PolymorphicProps<E> & 
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

export const Button = createEnhancedPolymorphicComponent<'button', typeof buttonVariants>({
  defaultComponent: 'button',
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
  variants: buttonVariants,
  className: "cursor-pointer"
})

Button.displayName = 'Button'

// Text Variants
const textVariants = cva('', {
  variants: {
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      '2xl': "text-2xl",
      '3xl': "text-3xl",
      '4xl': "text-4xl",
      '5xl': "text-5xl",
    },
    weight: {
      thin: "font-thin",
      light: "font-light",
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
      extrabold: "font-extrabold",
      black: "font-black",
    },
    color: {
      primary: "text-primary",
      secondary: "text-secondary",
      muted: "text-muted-foreground",
      accent: "text-accent-foreground",
      destructive: "text-destructive",
      success: "text-green-600",
      warning: "text-yellow-600",
      error: "text-red-600",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
      justify: "text-justify",
    }
  },
  defaultVariants: {
    size: 'base',
    weight: 'normal',
    color: 'primary',
    align: 'left',
  }
})

export type TextProps<E extends React.ElementType = 'span'> = PolymorphicProps<E> & 
  VariantProps<typeof textVariants> & {
    asChild?: boolean
  }

export const Text = createEnhancedPolymorphicComponent<'span', typeof textVariants>({
  defaultComponent: 'span',
  variants: textVariants,
})

// Container Variants
const containerVariants = cva('mx-auto', {
  variants: {
    size: {
      sm: "max-w-sm",
      md: "max-w-md", 
      lg: "max-w-lg",
      xl: "max-w-xl",
      '2xl': "max-w-2xl",
      '3xl': "max-w-3xl",
      '4xl': "max-w-4xl",
      '5xl': "max-w-5xl",
      '6xl': "max-w-6xl",
      '7xl': "max-w-7xl",
      full: "max-w-full",
      screen: "max-w-screen",
    },
    padding: {
      none: "px-0",
      sm: "px-4",
      md: "px-6",
      lg: "px-8",
      xl: "px-12",
    }
  },
  defaultVariants: {
    size: 'xl',
    padding: 'md',
  }
})

export type ContainerProps<E extends React.ElementType = 'div'> = PolymorphicProps<E> & 
  VariantProps<typeof containerVariants> & {
    asChild?: boolean
  }

export const Container = createEnhancedPolymorphicComponent<'div', typeof containerVariants>({
  defaultComponent: 'div',
  variants: containerVariants,
})

// Stack (Flex Container) Variants
const stackVariants = cva('flex', {
  variants: {
    direction: {
      row: "flex-row",
      'row-reverse': "flex-row-reverse", 
      col: "flex-col",
      'col-reverse': "flex-col-reverse",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
      baseline: "items-baseline",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly",
    },
    gap: {
      none: "gap-0",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
      '2xl': "gap-12",
    },
    wrap: {
      nowrap: "flex-nowrap",
      wrap: "flex-wrap",
      'wrap-reverse': "flex-wrap-reverse",
    }
  },
  defaultVariants: {
    direction: 'col',
    align: 'stretch',
    justify: 'start',
    gap: 'md',
    wrap: 'nowrap',
  }
})

export type StackProps<E extends React.ElementType = 'div'> = PolymorphicProps<E> & 
  VariantProps<typeof stackVariants> & {
    asChild?: boolean
  }

export const Stack = createEnhancedPolymorphicComponent<'div', typeof stackVariants>({
  defaultComponent: 'div',
  variants: stackVariants,
})

// Grid Variants
const gridVariants = cva('grid', {
  variants: {
    cols: {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3", 
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
      12: "grid-cols-12",
    },
    gap: {
      none: "gap-0",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    },
    auto: {
      fit: "grid-cols-[repeat(auto-fit,minmax(0,1fr))]",
      fill: "grid-cols-[repeat(auto-fill,minmax(0,1fr))]",
    }
  },
  defaultVariants: {
    cols: 1,
    gap: 'md',
  }
})

export type GridProps<E extends React.ElementType = 'div'> = PolymorphicProps<E> & 
  VariantProps<typeof gridVariants> & {
    asChild?: boolean
  }

export const Grid = createEnhancedPolymorphicComponent<'div', typeof gridVariants>({
  defaultComponent: 'div',
  variants: gridVariants,
})

// Link Variants  
const linkVariants = cva('underline-offset-4 hover:underline', {
  variants: {
    variant: {
      default: "text-primary hover:text-primary/80",
      subtle: "text-muted-foreground hover:text-foreground",
      destructive: "text-destructive hover:text-destructive/80",
    },
    decoration: {
      none: "no-underline",
      underline: "underline",
      dotted: "underline decoration-dotted",
      wavy: "underline decoration-wavy",
    }
  },
  defaultVariants: {
    variant: 'default',
    decoration: 'underline',
  }
})

export type LinkProps<E extends React.ElementType = 'a'> = PolymorphicProps<E> & 
  VariantProps<typeof linkVariants> & {
    asChild?: boolean
    href?: string
    target?: string
    rel?: string
  }

export const Link = createEnhancedPolymorphicComponent<'a', typeof linkVariants>({
  defaultComponent: 'a',
  variants: linkVariants,
})

// Image Variants
const imageVariants = cva('', {
  variants: {
    size: {
      xs: "w-8 h-8",
      sm: "w-12 h-12",
      md: "w-16 h-16",
      lg: "w-24 h-24",
      xl: "w-32 h-32",
      '2xl': "w-40 h-40",
      full: "w-full h-full",
      auto: "w-auto h-auto",
    },
    fit: {
      cover: "object-cover",
      contain: "object-contain",
      fill: "object-fill",
      none: "object-none",
      scale: "object-scale-down",
    },
    rounded: {
      none: "rounded-none",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      '2xl': "rounded-2xl",
      full: "rounded-full",
    }
  },
  defaultVariants: {
    size: 'auto',
    fit: 'cover',
    rounded: 'md',
  }
})

export type ImageProps<E extends React.ElementType = 'img'> = PolymorphicProps<E> & 
  VariantProps<typeof imageVariants> & {
    asChild?: boolean
    src: string
    alt: string
    loading?: 'lazy' | 'eager'
  }

export const Image = createEnhancedPolymorphicComponent<'img', typeof imageVariants>({
  defaultComponent: 'img',
  variants: imageVariants,
  className: "block"
})

// Heading Variants
const headingVariants = cva('font-bold tracking-tight', {
  variants: {
    level: {
      1: "text-3xl lg:text-4xl",
      2: "text-2xl lg:text-3xl", 
      3: "text-xl lg:text-2xl",
      4: "text-lg lg:text-xl",
      5: "text-base lg:text-lg",
      6: "text-sm lg:text-base",
    },
    color: {
      primary: "text-primary",
      secondary: "text-secondary",
      muted: "text-muted-foreground",
      accent: "text-accent-foreground",
      destructive: "text-destructive",
      success: "text-green-600",
      warning: "text-yellow-600", 
      error: "text-red-600",
    }
  },
  defaultVariants: {
    level: 1,
    color: 'primary',
  }
})

export type HeadingProps<E extends React.ElementType = 'h1'> = PolymorphicProps<E> & 
  VariantProps<typeof headingVariants> & {
    asChild?: boolean
  }

export const Heading = createEnhancedPolymorphicComponent<'h1', typeof headingVariants>({
  defaultComponent: 'h1',
  variants: headingVariants,
})

// Create polymorphic components map
export const PolymorphicComponents = {
  Button,
  Text,
  Container,
  Stack,
  Grid,
  Link,
  Image,
  Heading,
}

// Create polymorphic variants map
export const PolymorphicVariants = {
  button: buttonVariants,
  text: textVariants,
  container: containerVariants,
  stack: stackVariants,
  grid: gridVariants,
  link: linkVariants,
  image: imageVariants,
  heading: headingVariants,
}