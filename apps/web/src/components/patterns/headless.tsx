import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'

// Headless UI Base Context
interface HeadlessContextValue {
  state: Record<string, any>
  actions: Record<string, (...args: any[]) => void>
  data: Record<string, any>
}

const HeadlessContext = createContext<HeadlessContextValue | null>(null)

const useHeadlessContext = () => {
  const context = useContext(HeadlessContext)
  if (!context) {
    throw new Error('Headless components must be used within a HeadlessProvider')
  }
  return context
}

// Headless Provider
interface HeadlessProviderProps {
  children: React.ReactNode
  initialState?: Record<string, any>
  initialActions?: Record<string, (...args: any[]) => void>
  initialData?: Record<string, any>
}

export function HeadlessProvider({ 
  children, 
  initialState = {}, 
  initialActions = {},
  initialData = {}
}: HeadlessProviderProps) {
  const value: HeadlessContextValue = {
    state: initialState,
    actions: initialActions,
    data: initialData
  }

  return (
    <HeadlessContext.Provider value={value}>
      {children}
    </HeadlessContext.Provider>
  )
}

// Headless State Hook
export function useHeadlessState<T = any>(key: string, defaultValue?: T) {
  const { state, actions } = useHeadlessContext()
  
  const [localState, setLocalState] = useState(() => state[key] ?? defaultValue)

  const updateState = useCallback((value: T) => {
    setLocalState(value)
    // Note: In a real implementation, you'd want to update the context state
  }, [])

  // Sync with context state on mount
  useEffect(() => {
    if (state[key] !== undefined) {
      setLocalState(state[key])
    }
  }, [state[key], key])

  return [localState, updateState] as const
}

// Headless Accordion
interface AccordionItem {
  id: string
  title: string
  content: React.ReactNode
  disabled?: boolean
}

interface AccordionProps {
  items: AccordionItem[]
  type?: 'single' | 'multiple'
  collapsible?: boolean
  children: (props: {
    openItems: string[]
    toggleItem: (id: string) => void
    getItemProps: (id: string) => {
      'aria-expanded': boolean
      'aria-disabled': boolean
      onClick: () => void
    }
  }) => React.ReactNode
}

export function Accordion({ 
  items, 
  type = 'single', 
  collapsible = true,
  children 
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(type === 'single' ? [] : [])

  const toggleItem = useCallback((id: string) => {
    const item = items.find(item => item.id === id)
    if (!item || item.disabled) return

    setOpenItems(prev => {
      if (type === 'single') {
        if (collapsible && prev.includes(id)) {
          return []
        }
        return [id]
      } else {
        if (prev.includes(id)) {
          return prev.filter(itemId => itemId !== id)
        }
        return [...prev, id]
      }
    })
  }, [items, type, collapsible])

  const getItemProps = useCallback((id: string) => {
    const isOpen = openItems.includes(id)
    const item = items.find(item => item.id === id)
    
    return {
      'aria-expanded': isOpen,
      'aria-disabled': item?.disabled || false,
      onClick: () => toggleItem(id)
    }
  }, [openItems, items, toggleItem])

  return children({ openItems, toggleItem, getItemProps })
}

// Headless Combobox
interface ComboboxOption {
  value: string
  label: string
  disabled?: boolean
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  children: (props: {
    value: string
    inputValue: string
    filteredOptions: ComboboxOption[]
    isOpen: boolean
    setInputValue: (value: string) => void
    setValue: (value: string) => void
    toggleOpen: () => void
    selectOption: (value: string) => void
    getInputProps: () => React.InputHTMLAttributes<HTMLInputElement>
    getOptionProps: (option: ComboboxOption, index: number) => {
      'aria-selected': boolean
      'aria-disabled': boolean
      onClick: () => void
      onMouseEnter: () => void
    }
  }) => React.ReactNode
}

export function Combobox({
  options,
  value = '',
  onValueChange,
  placeholder = 'Select an option...',
  children
}: ComboboxProps) {
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value)

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(inputValue.toLowerCase()) &&
    option.value !== selectedValue
  )

  const setValue = useCallback((newValue: string) => {
    setSelectedValue(newValue)
    onValueChange?.(newValue)
    setIsOpen(false)
  }, [onValueChange])

  const selectOption = useCallback((optionValue: string) => {
    const option = options.find(opt => opt.value === optionValue)
    if (option && !option.disabled) {
      setInputValue(option.label)
      setValue(optionValue)
    }
  }, [options, setValue])

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const getInputProps = useCallback(() => ({
    value: inputValue,
    placeholder,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value),
    onFocus: () => setIsOpen(true),
  }), [inputValue, placeholder])

  const getOptionProps = useCallback((option: ComboboxOption, index: number) => {
    const isSelected = selectedValue === option.value
    
    return {
      'aria-selected': isSelected,
      'aria-disabled': option.disabled || false,
      onClick: () => selectOption(option.value),
      onMouseEnter: () => {
        // Handle hover state if needed
      }
    }
  }, [selectedValue, selectOption])

  return children({
    value: selectedValue,
    inputValue,
    filteredOptions,
    isOpen,
    setInputValue,
    setValue,
    toggleOpen,
    selectOption,
    getInputProps,
    getOptionProps
  })
}

// Headless Dialog
interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: (props: {
    open: boolean
    setOpen: (open: boolean) => void
    close: () => void
    getTriggerProps: () => React.ButtonHTMLAttributes<HTMLButtonElement>
    getDialogProps: () => {
      role: string
      'aria-modal': boolean
      onKeyDown: (e: React.KeyboardEvent) => void
    }
    getOverlayProps: () => {
      onClick: () => void
    }
    getContentProps: () => {
      onKeyDown: (e: React.KeyboardEvent) => void
    }
  }) => React.ReactNode
}

export function Dialog({ open = false, onOpenChange, children }: DialogProps) {
  const [internalOpen, setInternalOpen] = useState(open)
  
  const isControlled = open !== undefined
  const actualOpen = isControlled ? open : internalOpen

  const setOpen = useCallback((newOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newOpen)
    } else {
      setInternalOpen(newOpen)
    }
  }, [isControlled, onOpenChange])

  const close = useCallback(() => setOpen(false), [setOpen])

  const getTriggerProps = useCallback(() => ({
    onClick: () => setOpen(true)
  }), [setOpen])

  const getDialogProps = useCallback(() => ({
    role: 'dialog',
    'aria-modal': true,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
      }
    }
  }), [close])

  const getOverlayProps = useCallback(() => ({
    onClick: close
  }), [close])

  const getContentProps = useCallback(() => ({
    onKeyDown: (e: React.KeyboardEvent) => {
      // Prevent event bubbling
      e.stopPropagation()
    }
  }), [])

  return children({
    open: actualOpen,
    setOpen,
    close,
    getTriggerProps,
    getDialogProps,
    getOverlayProps,
    getContentProps
  })
}

// Headless Popover
interface PopoverProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: (props: {
    open: boolean
    setOpen: (open: boolean) => void
    getTriggerProps: () => React.ButtonHTMLAttributes<HTMLButtonElement>
    getContentProps: () => {
      onKeyDown: (e: React.KeyboardEvent) => void
    }
  }) => React.ReactNode
}

export function Popover({ open = false, onOpenChange, children }: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(open)
  
  const isControlled = open !== undefined
  const actualOpen = isControlled ? open : internalOpen

  const setOpen = useCallback((newOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newOpen)
    } else {
      setInternalOpen(newOpen)
    }
  }, [isControlled, onOpenChange])

  const getTriggerProps = useCallback(() => ({
    onClick: () => setOpen(!actualOpen)
  }), [setOpen, actualOpen])

  const getContentProps = useCallback(() => ({
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
  }), [setOpen])

  return children({
    open: actualOpen,
    setOpen,
    getTriggerProps,
    getContentProps
  })
}

// Headless Tabs
interface TabItem {
  id: string
  label: string
  content: React.ReactNode
  disabled?: boolean
}

interface TabsProps {
  items: TabItem[]
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
  children: (props: {
    value: string
    setValue: (value: string) => void
    getTabListProps: () => React.HTMLAttributes<HTMLDivElement>
    getTabProps: (id: string) => {
      role: string
      'aria-selected': boolean
      'aria-disabled': boolean
      tabIndex: number
      onClick: () => void
      onKeyDown: (e: React.KeyboardEvent) => void
    }
    getTabPanelProps: (id: string) => {
      role: string
      'aria-labelledby': string
      tabIndex: number
    }
  }) => React.ReactNode
}

export function Tabs({
  items,
  defaultValue,
  value: controlledValue,
  onValueChange,
  orientation = 'horizontal',
  children
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue || items[0]?.id || '')
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue! : internalValue

  const setValue = useCallback((newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }, [isControlled, onValueChange])

  const getTabListProps = useCallback(() => ({
    role: 'tablist',
    'aria-orientation': orientation
  }), [orientation])

  const getTabProps = useCallback((id: string) => {
    const item = items.find(item => item.id === id)
    const isSelected = value === id
    
    return {
      role: 'tab',
      'aria-selected': isSelected,
      'aria-disabled': item?.disabled || false,
      tabIndex: isSelected ? 0 : -1,
      onClick: () => !item?.disabled && setValue(id),
      onKeyDown: (e: React.KeyboardEvent) => {
        const currentIndex = items.findIndex(item => item.id === id)
        let newIndex = currentIndex

        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            e.preventDefault()
            newIndex = (currentIndex + 1) % items.length
            break
          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault()
            newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1
            break
          case 'Home':
            e.preventDefault()
            newIndex = 0
            break
          case 'End':
            e.preventDefault()
            newIndex = items.length - 1
            break
        }

        if (newIndex !== currentIndex) {
          const newTab = items[newIndex]
          if (!newTab?.disabled) {
            setValue(newTab.id)
          }
        }
      }
    }
  }, [items, value, setValue])

  const getTabPanelProps = useCallback((id: string) => ({
    role: 'tabpanel',
    'aria-labelledby': `tab-${id}`,
    tabIndex: 0
  }), [])

  return children({
    value,
    setValue,
    getTabListProps,
    getTabProps,
    getTabPanelProps
  })
}

// Headless Select
interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps {
  options: SelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  children: (props: {
    value: string
    isOpen: boolean
    setValue: (value: string) => void
    setIsOpen: (open: boolean) => void
    getTriggerProps: () => React.ButtonHTMLAttributes<HTMLButtonElement>
    getOptionProps: (option: SelectOption) => {
      'aria-selected': boolean
      'aria-disabled': boolean
      onClick: () => void
      onMouseEnter: () => void
    }
  }) => React.ReactNode
}

export function Select({
  options,
  value = '',
  onValueChange,
  placeholder = 'Select an option...',
  children
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value)

  const setValue = useCallback((newValue: string) => {
    setSelectedValue(newValue)
    onValueChange?.(newValue)
    setIsOpen(false)
  }, [onValueChange])

  const setIsOpenState = useCallback((open: boolean) => {
    setIsOpen(open)
  }, [])

  const getTriggerProps = useCallback(() => ({
    onClick: () => setIsOpen(!isOpen),
    'aria-expanded': isOpen,
    'aria-haspopup': 'listbox'
  }), [isOpen])

  const getOptionProps = useCallback((option: SelectOption) => ({
    'aria-selected': selectedValue === option.value,
    'aria-disabled': option.disabled || false,
    onClick: () => !option.disabled && setValue(option.value),
    onMouseEnter: () => {
      // Handle hover state if needed
    }
  }), [selectedValue, setValue])

  const selectedOption = options.find(opt => opt.value === selectedValue)
  const displayValue = selectedOption?.label || placeholder

  return children({
    value: selectedValue,
    isOpen,
    setValue,
    setIsOpen: setIsOpenState,
    getTriggerProps,
    getOptionProps
  })
}

export const HeadlessComponents = {
  Provider: HeadlessProvider,
  useState: useHeadlessState,
  Accordion,
  Combobox,
  Dialog,
  Popover,
  Tabs,
  Select
}