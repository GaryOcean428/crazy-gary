import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import { Textarea } from './textarea'
import { Checkbox } from './checkbox'
import { RadioGroup, RadioGroupItem } from './radio-group'
import { Switch } from './switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { Calendar } from './calendar'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { CalendarIcon, AlertCircle, CheckCircle, Info, X } from 'lucide-react'
import { format } from 'date-fns'

// Responsive Form Field Wrapper
interface FormFieldProps {
  label?: string
  description?: string
  error?: string
  required?: boolean
  children: React.ReactNode
  className?: string
  labelClassName?: string
  descriptionClassName?: string
  errorClassName?: string
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  description,
  error,
  required,
  children,
  className,
  labelClassName,
  descriptionClassName,
  errorClassName
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className={cn("text-responsive-sm font-medium", labelClassName)}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {children}
      {description && !error && (
        <p className={cn("text-responsive-xs text-muted-foreground", descriptionClassName)}>
          {description}
        </p>
      )}
      {error && (
        <div className={cn("flex items-center space-x-1 text-destructive", errorClassName)}>
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <span className="text-responsive-xs">{error}</span>
        </div>
      )}
    </div>
  )
}

// Responsive Input with Label
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  description?: string
  error?: string
  required?: boolean
  icon?: React.ComponentType<{ className?: string }>
  iconPosition?: 'left' | 'right'
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, description, error, required, icon: Icon, iconPosition = 'left', className, ...props }, ref) => {
    const InputIcon = Icon

    return (
      <FormField
        label={label}
        description={description}
        error={error}
        required={required}
      >
        <div className="relative">
          {InputIcon && iconPosition === 'left' && (
            <InputIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          )}
          <Input
            ref={ref}
            className={cn(
              InputIcon && iconPosition === 'left' && "pl-10",
              InputIcon && iconPosition === 'right' && "pr-10",
              error && "border-destructive focus-visible:ring-destructive/20",
              className
            )}
            {...props}
          />
          {InputIcon && iconPosition === 'right' && (
            <InputIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </FormField>
    )
  }
)

FormInput.displayName = 'FormInput'

// Responsive Textarea with Label
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  description?: string
  error?: string
  required?: boolean
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, description, error, required, resize = 'vertical', className, ...props }, ref) => {
    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize'
    }

    return (
      <FormField
        label={label}
        description={description}
        error={error}
        required={required}
      >
        <Textarea
          ref={ref}
          className={cn(
            resizeClasses[resize],
            error && "border-destructive focus-visible:ring-destructive/20",
            className
          )}
          {...props}
        />
      </FormField>
    )
  }
)

FormTextarea.displayName = 'FormTextarea'

// Responsive Select with Label
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  description?: string
  error?: string
  required?: boolean
  placeholder?: string
  children: React.ReactNode
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, description, error, required, placeholder, className, children, ...props }, ref) => {
    return (
      <FormField
        label={label}
        description={description}
        error={error}
        required={required}
      >
        <Select>
          <SelectTrigger className={cn(error && "border-destructive", className)}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {children}
          </SelectContent>
        </Select>
      </FormField>
    )
  }
)

FormSelect.displayName = 'FormSelect'

// Responsive Checkbox with Label
interface FormCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
  error?: string
  children?: React.ReactNode
}

export const FormCheckbox: React.FC<FormCheckboxProps> = ({
  label,
  description,
  error,
  children,
  className,
  ...props
}) => {
  return (
    <FormField
      label={label}
      description={description}
      error={error}
    >
      <div className="flex items-start space-x-3">
        <Checkbox
          className={cn("mt-1", className)}
          {...props}
        />
        {children && (
          <div className="flex-1">
            {children}
          </div>
        )}
      </div>
    </FormField>
  )
}

// Responsive Radio Group
interface FormRadioGroupProps {
  label?: string
  description?: string
  error?: string
  options: {
    value: string
    label: string
    description?: string
    disabled?: boolean
  }[]
  value?: string
  onValueChange?: (value: string) => void
  orientation?: 'vertical' | 'horizontal'
  className?: string
}

export const FormRadioGroup: React.FC<FormRadioGroupProps> = ({
  label,
  description,
  error,
  options,
  value,
  onValueChange,
  orientation = 'vertical',
  className
}) => {
  return (
    <FormField
      label={label}
      description={description}
      error={error}
    >
      <RadioGroup
        value={value}
        onValueChange={onValueChange}
        className={cn(
          orientation === 'horizontal' ? 'flex flex-row space-x-4' : 'space-y-3',
          className
        )}
      >
        {options.map(option => (
          <div key={option.value} className="flex items-start space-x-2">
            <RadioGroupItem
              value={option.value}
              id={option.value}
              disabled={option.disabled}
              className="mt-1"
            />
            <div className="flex-1">
              <Label
                htmlFor={option.value}
                className={cn(
                  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                  option.disabled && "opacity-50"
                )}
              >
                {option.label}
              </Label>
              {option.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {option.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </RadioGroup>
    </FormField>
  )
}

// Responsive Switch
interface FormSwitchProps {
  label?: string
  description?: string
  error?: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export const FormSwitch: React.FC<FormSwitchProps> = ({
  label,
  description,
  error,
  checked,
  onCheckedChange,
  disabled,
  className
}) => {
  return (
    <FormField
      label={label}
      description={description}
      error={error}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {label && (
            <Label className="text-sm font-medium">
              {label}
            </Label>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          className={className}
        />
      </div>
    </FormField>
  )
}

// Responsive Date Picker
interface FormDatePickerProps {
  label?: string
  description?: string
  error?: string
  value?: Date
  onValueChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export const FormDatePicker: React.FC<FormDatePickerProps> = ({
  label,
  description,
  error,
  value,
  onValueChange,
  placeholder = "Pick a date",
  disabled,
  className
}) => {
  return (
    <FormField
      label={label}
      description={description}
      error={error}
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
              error && "border-destructive",
              className
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onValueChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </FormField>
  )
}

// Responsive Form Actions
interface FormActionsProps {
  onCancel?: () => void
  onSubmit?: () => void
  submitLabel?: string
  cancelLabel?: string
  loading?: boolean
  disabled?: boolean
  variant?: 'horizontal' | 'vertical'
  className?: string
}

export const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  onSubmit,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  loading = false,
  disabled = false,
  variant = 'horizontal',
  className
}) => {
  return (
    <div className={cn(
      "flex gap-3",
      variant === 'horizontal' ? 'flex-row justify-end' : 'flex-col sm:flex-row',
      className
    )}>
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="btn-touch-sm"
        >
          {cancelLabel}
        </Button>
      )}
      <Button
        type="submit"
        onClick={onSubmit}
        disabled={disabled || loading}
        loading={loading}
        className="btn-touch-sm"
      >
        {submitLabel}
      </Button>
    </div>
  )
}

// Form Alert/Message Component
interface FormAlertProps {
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  onDismiss?: () => void
  className?: string
}

export const FormAlert: React.FC<FormAlertProps> = ({
  type = 'info',
  title,
  message,
  onDismiss,
  className
}) => {
  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200'
  }

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info
  }

  const Icon = icons[type]

  return (
    <div className={cn(
      "flex items-start space-x-3 p-4 rounded-lg border",
      typeStyles[type],
      className
    )}>
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="text-sm font-medium mb-1">
            {title}
          </h4>
        )}
        <p className="text-sm">
          {message}
        </p>
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-6 w-6 p-0 hover:bg-black/10 dark:hover:bg-white/10"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

// Responsive Form Layout
interface ResponsiveFormProps {
  children: React.ReactNode
  onSubmit?: (e: React.FormEvent) => void
  className?: string
}

export const ResponsiveForm: React.FC<ResponsiveFormProps> = ({
  children,
  onSubmit,
  className
}) => {
  return (
    <form 
      onSubmit={onSubmit}
      className={cn("form-responsive max-w-2xl", className)}
    >
      {children}
    </form>
  )
}