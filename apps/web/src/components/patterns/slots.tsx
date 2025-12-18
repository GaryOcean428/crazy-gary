import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

// Slot Registry Context
interface SlotRegistryValue {
  slots: Record<string, React.ReactNode>
  registerSlot: (name: string, component: React.ReactNode) => void
  unregisterSlot: (name: string) => void
  getSlot: (name: string) => React.ReactNode
}

const SlotRegistryContext = createContext<SlotRegistryValue | null>(null)

const useSlotRegistry = () => {
  const context = useContext(SlotRegistryContext)
  if (!context) {
    throw new Error('Slot components must be used within a SlotRegistryProvider')
  }
  return context
}

// Slot Registry Provider
interface SlotRegistryProviderProps {
  children: React.ReactNode
  initialSlots?: Record<string, React.ReactNode>
}

export function SlotRegistryProvider({ children, initialSlots = {} }: SlotRegistryProviderProps) {
  const [slots, setSlots] = useState<Record<string, React.ReactNode>>(initialSlots)

  const registerSlot = useCallback((name: string, component: React.ReactNode) => {
    setSlots(prev => ({ ...prev, [name]: component }))
  }, [])

  const unregisterSlot = useCallback((name: string) => {
    setSlots(prev => {
      const { [name]: removed, ...rest } = prev
      return rest
    })
  }, [])

  const getSlot = useCallback((name: string) => slots[name], [slots])

  const value: SlotRegistryValue = {
    slots,
    registerSlot,
    unregisterSlot,
    getSlot
  }

  return (
    <SlotRegistryContext.Provider value={value}>
      {children}
    </SlotRegistryContext.Provider>
  )
}

// Slot Component
interface SlotProps {
  name: string
  fallback?: React.ReactNode
  className?: string
  as?: React.ComponentType<any>
  [key: string]: any
}

export function Slot({ 
  name, 
  fallback = null, 
  className,
  as: Component = 'div',
  ...props 
}: SlotProps) {
  const { getSlot } = useSlotRegistry()
  const slotContent = getSlot(name)

  if (!slotContent) {
    return fallback ? <>{fallback}</> : null
  }

  if (Component !== 'div') {
    return React.cloneElement(slotContent as React.ReactElement, {
      className: cn(className),
      ...props
    })
  }

  return (
    <div className={cn('slot', className)} {...props}>
      {slotContent}
    </div>
  )
}

// Named Slot Component
interface NamedSlotProps {
  name: string
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

export function NamedSlot({ name, children, className, asChild = false }: NamedSlotProps) {
  const { registerSlot } = useSlotRegistry()

  React.useEffect(() => {
    registerSlot(name, children)
    return () => {
      // Note: We can't easily unregister here as it would remove on every re-render
      // In a real implementation, you'd want more sophisticated cleanup
    }
  }, [name, children, registerSlot])

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: cn(className, children.props.className)
    })
  }

  return (
    <Slot name={name} className={className}>
      {children}
    </Slot>
  )
}

// Slot Layout Component
interface SlotLayoutProps {
  children: React.ReactNode
  template?: Record<string, string>
  className?: string
}

export function SlotLayout({ children, template = {}, className }: SlotLayoutProps) {
  const { registerSlot } = useSlotRegistry()

  React.useEffect(() => {
    // Register all named slots from children
    React.Children.forEach(children, child => {
      if (React.isValidElement(child) && child.type === NamedSlot) {
        const slotName = child.props.name
        registerSlot(slotName, child.props.children)
      }
    })
  }, [children, registerSlot])

  return (
    <div className={cn('slot-layout', className)} style={template}>
      {children}
    </div>
  )
}

// Dynamic Slot Manager
interface DynamicSlotManagerProps {
  slots: Record<string, React.ReactNode>
  layout?: 'grid' | 'flex' | 'columns'
  className?: string
  children: (props: {
    renderSlot: (name: string) => React.ReactNode
    renderAllSlots: () => React.ReactNode[]
    hasSlot: (name: string) => boolean
  }) => React.ReactNode
}

export function DynamicSlotManager({ 
  slots, 
  layout = 'flex', 
  className,
  children 
}: DynamicSlotManagerProps) {
  const renderSlot = useCallback((name: string) => {
    return slots[name] || null
  }, [slots])

  const renderAllSlots = useCallback(() => {
    return Object.values(slots)
  }, [slots])

  const hasSlot = useCallback((name: string) => {
    return name in slots
  }, [slots])

  const layoutClass = {
    grid: 'grid gap-4',
    flex: 'flex gap-4',
    columns: 'columns-2 gap-4'
  }

  return (
    <div className={cn('dynamic-slot-manager', layoutClass[layout], className)}>
      {children({ renderSlot, renderAllSlots, hasSlot })}
    </div>
  )
}

// Template Slot Component
interface TemplateSlotProps {
  template: string
  data?: Record<string, any>
  slots?: Record<string, React.ReactNode>
  className?: string
}

export function TemplateSlot({ template, data = {}, slots = {}, className }: TemplateSlotProps) {
  // Simple template parser that replaces {{key}} with data values
  const parsedTemplate = useMemo(() => {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match
    })
  }, [template, data])

  // Parse slot placeholders like [[slot:name]]
  const slotElements = useMemo(() => {
    const slotPattern = /\[\[slot:(\w+)\]\]/g
    const elements: { before: string; slotName: string; after: string; index: number }[] = []
    let lastIndex = 0
    let match

    while ((match = slotPattern.exec(parsedTemplate)) !== null) {
      const [fullMatch, slotName] = match
      const before = parsedTemplate.slice(lastIndex, match.index)
      elements.push({
        before,
        slotName,
        after: '',
        index: elements.length
      })
      lastIndex = match.index + fullMatch.length
    }

    const after = parsedTemplate.slice(lastIndex)
    if (after) {
      elements.push({ before: after, slotName: '', after: '', index: elements.length })
    }

    return elements
  }, [parsedTemplate])

  return (
    <div className={cn('template-slot', className)}>
      {slotElements.map((element, index) => {
        if (element.slotName) {
          return (
            <React.Fragment key={index}>
              {element.before}
              {slots[element.slotName] || `[[slot:${element.slotName}]]`}
            </React.Fragment>
          )
        }
        return <React.Fragment key={index}>{element.before}</React.Fragment>
      })}
    </div>
  )
}

// Conditional Slot Component
interface ConditionalSlotProps {
  condition: boolean | (() => boolean)
  slotName: string
  fallbackSlotName?: string
  data?: Record<string, any>
}

export function ConditionalSlot({ 
  condition, 
  slotName, 
  fallbackSlotName,
  data = {} 
}: ConditionalSlotProps) {
  const { getSlot } = useSlotRegistry()
  
  const shouldRender = typeof condition === 'function' ? condition() : condition
  
  const slot = shouldRender ? getSlot(slotName) : getSlot(fallbackSlotName || '')
  
  if (!slot) {
    return null
  }

  // Clone the slot with data if it has slot props
  if (React.isValidElement(slot)) {
    return React.cloneElement(slot, { ...data })
  }

  return slot
}

// Portal Slot Component
interface PortalSlotProps {
  name: string
  target?: HTMLElement | string
  className?: string
}

export function PortalSlot({ name, target, className }: PortalSlotProps) {
  const { getSlot } = useSlotRegistry()
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null)
  const slotContent = getSlot(name)

  React.useEffect(() => {
    let element: HTMLElement | null = null

    if (typeof target === 'string') {
      element = document.querySelector(target)
    } else if (target instanceof HTMLElement) {
      element = target
    } else {
      // Default to document body
      element = document.body
    }

    setPortalElement(element)
  }, [target])

  if (!portalElement || !slotContent) {
    return null
  }

  return (
    <div className={cn('portal-slot', className)}>
      {ReactDOM.createPortal(slotContent, portalElement)}
    </div>
  )
}

// Import ReactDOM for portal
import ReactDOM from 'react-dom'

// Composite Slot Component
interface CompositeSlotProps {
  slots: Record<string, React.ReactNode>
  composition: Array<{
    slot: string
    order: number
    wrapper?: React.ComponentType<{ children: React.ReactNode }>
  }>
  className?: string
}

export function CompositeSlot({ slots, composition, className }: CompositeSlotProps) {
  const sortedComposition = useMemo(() => {
    return [...composition].sort((a, b) => a.order - b.order)
  }, [composition])

  return (
    <div className={cn('composite-slot', className)}>
      {sortedComposition.map(({ slot, wrapper: Wrapper, order }) => {
        const slotContent = slots[slot]
        if (!slotContent) return null

        if (Wrapper) {
          return (
            <Wrapper key={slot}>
              {slotContent}
            </Wrapper>
          )
        }

        return (
          <div key={slot} data-slot={slot}>
            {slotContent}
          </div>
        )
      })}
    </div>
  )
}

// Flexible Layout with Slots
interface FlexibleLayoutProps {
  header?: React.ReactNode
  sidebar?: React.ReactNode
  main?: React.ReactNode
  footer?: React.ReactNode
  aside?: React.ReactNode
  layout?: 'header-sidebar-main' | 'header-main-aside' | 'sidebar-main' | 'full-width'
  className?: string
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

export function FlexibleLayout({ 
  header, 
  sidebar, 
  main, 
  footer, 
  aside,
  layout = 'header-sidebar-main',
  className,
  gap = 'md'
}: FlexibleLayoutProps) {
  const gapClass = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  }

  const layoutClasses = {
    'header-sidebar-main': 'grid grid-rows-[auto_1fr_auto] grid-cols-[auto_1fr]',
    'header-main-aside': 'grid grid-rows-[auto_1fr_auto] grid-cols-[1fr_auto]',
    'sidebar-main': 'grid grid-cols-[auto_1fr]',
    'full-width': 'flex flex-col'
  }

  return (
    <div className={cn(
      'flexible-layout',
      layoutClasses[layout],
      gapClass[gap],
      className
    )}>
      {header && (
        <header className="layout-header">
          {header}
        </header>
      )}
      
      {layout === 'header-sidebar-main' && (
        <>
          {sidebar && (
            <aside className="layout-sidebar">
              {sidebar}
            </aside>
          )}
          {main && (
            <main className="layout-main">
              {main}
            </main>
          )}
        </>
      )}

      {layout === 'header-main-aside' && (
        <>
          {main && (
            <main className="layout-main">
              {main}
            </main>
          )}
          {aside && (
            <aside className="layout-aside">
              {aside}
            </aside>
          )}
        </>
      )}

      {layout === 'sidebar-main' && (
        <>
          {sidebar && (
            <aside className="layout-sidebar">
              {sidebar}
            </aside>
          )}
          {main && (
            <main className="layout-main">
              {main}
            </main>
          )}
        </>
      )}

      {layout === 'full-width' && (
        <>
          {main}
          {sidebar}
          {aside}
        </>
      )}
      
      {footer && (
        <footer className="layout-footer">
          {footer}
        </footer>
      )}
    </div>
  )
}

// Slot Composition Utilities
export const SlotUtils = {
  merge: (slots: Record<string, React.ReactNode>) => slots,
  filter: (slots: Record<string, React.ReactNode>, predicate: (key: string) => boolean) => {
    return Object.fromEntries(
      Object.entries(slots).filter(([key]) => predicate(key))
    )
  },
  map: (slots: Record<string, React.ReactNode>, mapper: (key: string, component: React.ReactNode) => React.ReactNode) => {
    return Object.fromEntries(
      Object.entries(slots).map(([key, component]) => [key, mapper(key, component)])
    )
  },
  reorder: (slots: Record<string, React.ReactNode>, order: string[]) => {
    const reordered: Record<string, React.ReactNode> = {}
    order.forEach(key => {
      if (slots[key]) {
        reordered[key] = slots[key]
      }
    })
    // Add any remaining slots not in the order
    Object.keys(slots).forEach(key => {
      if (!order.includes(key)) {
        reordered[key] = slots[key]
      }
    })
    return reordered
  }
}

export const SlotPatterns = {
  Provider: SlotRegistryProvider,
  Component: Slot,
  Named: NamedSlot,
  Layout: SlotLayout,
  Manager: DynamicSlotManager,
  Template: TemplateSlot,
  Conditional: ConditionalSlot,
  Portal: PortalSlot,
  Composite: CompositeSlot,
  FlexibleLayout,
  Utils: SlotUtils
}