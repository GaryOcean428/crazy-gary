import * as React from "react"
import { cn } from "@/lib/utils"
import { useIsMobile, useIsTouchDevice } from "@/hooks/use-mobile"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"

// Responsive Form Container
const ResponsiveForm = React.forwardRef<
  HTMLFormElement,
  React.FormHTMLAttributes<HTMLFormElement> & {
    layout?: 'vertical' | 'horizontal' | 'grid'
    spacing?: 'compact' | 'normal' | 'relaxed'
  }
>(({ className, layout = 'vertical', spacing = 'normal', children, ...props }, ref) => {
  const isMobile = useIsMobile()
  
  const layoutClasses = {
    vertical: "space-y-4 sm:space-y-6",
    horizontal: "flex flex-col sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0 space-y-4",
    grid: "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
  }
  
  const spacingClasses = {
    compact: "space-y-2 sm:space-y-3",
    normal: "space-y-4 sm:space-y-6", 
    relaxed: "space-y-6 sm:space-y-8"
  }
  
  return (
    <form
      ref={ref}
      className={cn(
        "w-full",
        layoutClasses[layout],
        spacingClasses[spacing],
        // Touch optimization
        isMobile && "touch-manipulation",
        className
      )}
      {...props}
    >
      {children}
    </form>
  )
})
ResponsiveForm.displayName = "ResponsiveForm"

// Form Field Group
const FormFieldGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    label?: string
    description?: string
    error?: string
    required?: boolean
    layout?: 'vertical' | 'horizontal'
    hideLabelOnMobile?: boolean
  }
>(({ className, label, description, error, required, layout = 'vertical', hideLabelOnMobile = false, children, ...props }, ref) => {
  const isMobile = useIsMobile()
  
  return (
    <div
      ref={ref}
      className={cn(
        "space-y-2",
        // Responsive layout
        layout === 'horizontal' && !isMobile && "flex items-center space-x-3 space-y-0",
        className
      )}
      {...props}
    >
      {label && (
        <Label 
          className={cn(
            "text-sm font-medium",
            hideLabelOnMobile && isMobile && "sr-only"
          )}
          htmlFor={props.id}
        >
          {label}
          {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
        </Label>
      )}
      
      {description && !error && (
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      
      {children}
      
      {error && (
        <p className="text-xs text-destructive" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  )
})
FormFieldGroup.displayName = "FormFieldGroup"

// Responsive Input with keyboard types
const ResponsiveInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string
    description?: string
    error?: string
    required?: boolean
    layout?: 'vertical' | 'horizontal'
    inputMode?: 'text' | 'email' | 'tel' | 'url' | 'numeric' | 'decimal' | 'search'
    pattern?: string
    autoComplete?: string
  }
>(({ className, label, description, error, required, layout = 'vertical', inputMode, pattern, autoComplete, type = 'text', ...props }, ref) => {
  const isMobile = useIsMobile()
  const isTouch = useIsTouchDevice()
  
  // Determine input mode based on type
  const getInputMode = () => {
    if (inputMode) return inputMode
    if (type === 'email') return 'email'
    if (type === 'tel') return 'tel'
    if (type === 'url') return 'url'
    if (type === 'number') return 'numeric'
    return 'text'
  }
  
  // Enhanced autocomplete for mobile
  const getAutoComplete = () => {
    if (autoComplete) return autoComplete
    if (type === 'email') return 'email'
    if (type === 'tel') return 'tel'
    if (type === 'url') return 'url'
    if (type === 'password') return 'current-password'
    return 'on'
  }
  
  const inputProps = {
    ref,
    type,
    inputMode: getInputMode(),
    autoComplete: getAutoComplete(),
    // Mobile optimizations
    'aria-describedby': description ? `${props.id}-description` : error ? `${props.id}-error` : undefined,
    'aria-invalid': !!error || undefined,
    className: cn(
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      // Mobile-specific optimizations
      isMobile && [
        "min-h-[44px]", // iOS minimum touch target
        "text-base", // Prevent zoom on iOS
        "appearance-none", // Remove iOS styling
      ],
      // Touch device optimizations
      isTouch && "touch-manipulation",
      // Error state
      error && "border-destructive focus-visible:ring-destructive",
      className
    ),
    ...props
  }
  
  if (label) {
    return (
      <FormFieldGroup
        label={label}
        description={description}
        error={error}
        required={required}
        layout={layout}
        id={props.id}
      >
        <Input {...inputProps} />
      </FormFieldGroup>
    )
  }
  
  return <Input {...inputProps} />
})
ResponsiveInput.displayName = "ResponsiveInput"

// Responsive Textarea
const ResponsiveTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string
    description?: string
    error?: string
    required?: boolean
    layout?: 'vertical' | 'horizontal'
    rows?: number
    resize?: 'none' | 'vertical' | 'horizontal' | 'both'
  }
>(({ className, label, description, error, required, layout = 'vertical', rows = 3, resize = 'vertical', ...props }, ref) => {
  const isMobile = useIsMobile()
  const isTouch = useIsTouchDevice()
  
  const textareaProps = {
    ref,
    rows,
    resize,
    'aria-describedby': description ? `${props.id}-description` : error ? `${props.id}-error` : undefined,
    'aria-invalid': !!error || undefined,
    className: cn(
      "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      // Mobile optimizations
      isMobile && [
        "min-h-[100px]",
        "text-base", // Prevent zoom on iOS
        "resize-y", // Only vertical resize on mobile
      ],
      // Touch optimizations
      isTouch && "touch-manipulation",
      // Error state
      error && "border-destructive focus-visible:ring-destructive",
      resize === 'none' && "resize-none",
      resize === 'horizontal' && "resize-x",
      resize === 'both' && "resize",
      className
    ),
    ...props
  }
  
  if (label) {
    return (
      <FormFieldGroup
        label={label}
        description={description}
        error={error}
        required={required}
        layout={layout}
        id={props.id}
      >
        <Textarea {...textareaProps} />
      </FormFieldGroup>
    )
  }
  
  return <Textarea {...textareaProps} />
})
ResponsiveTextarea.displayName = "ResponsiveTextarea"

// Responsive Select
const ResponsiveSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    label?: string
    description?: string
    error?: string
    required?: boolean
    layout?: 'vertical' | 'horizontal'
    placeholder?: string
  }
>(({ className, label, description, error, required, layout = 'vertical', placeholder, children, ...props }, ref) => {
  const isMobile = useIsMobile()
  const isTouch = useIsTouchDevice()
  
  const selectProps = {
    ref,
    'aria-describedby': description ? `${props.id}-description` : error ? `${props.id}-error` : undefined,
    'aria-invalid': !!error || undefined,
    className: cn(
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      // Mobile optimizations
      isMobile && [
        "min-h-[44px]",
        "appearance-none", // Native mobile select styling
        "bg-[length:20px_20px]", // Custom arrow indicator
        "bg-[center_right_1rem]", // Arrow position
        "bg-[no-repeat]", // Remove default arrow
        "pr-8", // Space for custom arrow
      ],
      // Touch optimizations
      isTouch && "touch-manipulation",
      // Error state
      error && "border-destructive focus-visible:ring-destructive",
      className
    ),
    ...props
  }
  
  if (label) {
    return (
      <FormFieldGroup
        label={label}
        description={description}
        error={error}
        required={required}
        layout={layout}
        id={props.id}
      >
        <select {...selectProps}>
          {placeholder && <option value="">{placeholder}</option>}
          {children}
        </select>
      </FormFieldGroup>
    )
  }
  
  return (
    <select {...selectProps}>
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
  )
})
ResponsiveSelect.displayName = "ResponsiveSelect"

// Responsive Button Group
const FormButtonGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    layout?: 'vertical' | 'horizontal' | 'stacked'
    justify?: 'start' | 'center' | 'end' | 'between' | 'around'
  }
>(({ className, layout = 'vertical', justify = 'end', children, ...props }, ref) => {
  const isMobile = useIsMobile()
  
  const layoutClasses = {
    vertical: "space-y-3 sm:space-y-0 sm:flex sm:space-x-3",
    horizontal: "flex space-x-3",
    stacked: "space-y-3"
  }
  
  const justifyClasses = {
    start: "justify-start",
    center: "justify-center", 
    end: "justify-end",
    between: "justify-between",
    around: "justify-around"
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        "flex",
        layout === 'vertical' && !isMobile && "sm:justify-end",
        layout === 'horizontal' && justifyClasses[justify],
        layout === 'stacked' && "flex-col sm:flex-row sm:justify-end sm:space-x-3 sm:space-y-0 space-y-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
FormButtonGroup.displayName = "FormButtonGroup"

// Responsive Checkbox
const ResponsiveCheckbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string
    description?: string
    error?: string
    layout?: 'vertical' | 'horizontal'
  }
>(({ className, label, description, error, layout = 'horizontal', ...props }, ref) => {
  const isMobile = useIsMobile()
  const isTouch = useIsTouchDevice()
  
  const checkboxProps = {
    ref,
    type: 'checkbox',
    'aria-describedby': description ? `${props.id}-description` : error ? `${props.id}-error` : undefined,
    'aria-invalid': !!error || undefined,
    className: cn(
      "h-4 w-4 rounded border border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      // Touch optimizations
      isTouch && "touch-manipulation scale-110", // Larger touch target
      // Error state
      error && "border-destructive",
      className
    ),
    ...props
  }
  
  if (label) {
    return (
      <FormFieldGroup
        layout={layout}
        id={props.id}
      >
        <div className={cn(
          "flex items-start space-x-3",
          layout === 'vertical' && "flex-col space-x-0 space-y-2 sm:flex-row sm:space-x-3 sm:space-y-0"
        )}>
          <input {...checkboxProps} />
          <div className="flex-1">
            <Label 
              htmlFor={props.id}
              className="text-sm font-medium cursor-pointer"
            >
              {label}
              {props.required && <span className="text-destructive ml-1" aria-label="required">*</span>}
            </Label>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
      </FormFieldGroup>
    )
  }
  
  return <input {...checkboxProps} />
})
ResponsiveCheckbox.displayName = "ResponsiveCheckbox"

// Form validation helpers
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePhone = (phone: string) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s|-|\(|\)/g, ''))
}

const validateUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export {
  ResponsiveForm,
  FormFieldGroup,
  ResponsiveInput,
  ResponsiveTextarea,
  ResponsiveSelect,
  FormButtonGroup,
  ResponsiveCheckbox,
  validateEmail,
  validatePhone,
  validateUrl,
}