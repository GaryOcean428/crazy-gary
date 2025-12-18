import React, { createContext, useContext, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

// Compound Component Context
interface CompoundContextValue {
  state: Record<string, any>
  updateState: (key: string, value: any) => void
  getValue: (key: string) => any
  registerChild: (id: string, child: React.ReactNode) => void
  unregisterChild: (id: string) => void
  children: Record<string, React.ReactNode>
}

const CompoundContext = createContext<CompoundContextValue | null>(null)

const useCompoundContext = () => {
  const context = useContext(CompoundContext)
  if (!context) {
    throw new Error('Compound components must be used within a CompoundProvider')
  }
  return context
}

// Compound Component Provider
interface CompoundProviderProps {
  children: React.ReactNode
  initialState?: Record<string, any>
}

export function CompoundProvider({ children, initialState = {} }: CompoundProviderProps) {
  const [state, setState] = useState(initialState)
  const [childrenMap, setChildrenMap] = useState<Record<string, React.ReactNode>>({})

  const updateState = useCallback((key: string, value: any) => {
    setState(prev => ({ ...prev, [key]: value }))
  }, [])

  const getValue = useCallback((key: string) => state[key], [state])

  const registerChild = useCallback((id: string, child: React.ReactNode) => {
    setChildrenMap(prev => ({ ...prev, [id]: child }))
  }, [])

  const unregisterChild = useCallback((id: string) => {
    setChildrenMap(prev => {
      const { [id]: removed, ...rest } = prev
      return rest
    })
  }, [])

  const value = {
    state,
    updateState,
    getValue,
    registerChild,
    unregisterChild,
    children: childrenMap
  }

  return (
    <CompoundContext.Provider value={value}>
      {children}
    </CompoundContext.Provider>
  )
}

// Compound Component Wrapper
interface CompoundWrapperProps {
  children: React.ReactNode
  className?: string
  as?: React.ComponentType<any>
  [key: string]: any
}

export function CompoundWrapper({ 
  children, 
  className, 
  as: Component = 'div',
  ...props 
}: CompoundWrapperProps) {
  const compound = useCompoundContext()
  
  return (
    <Component className={cn('compound-wrapper', className)} {...props}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            ...child.props,
            compound
          } as any)
        }
        return child
      })}
    </Component>
  )
}

// Compound Child Component
interface CompoundChildProps {
  id?: string
  children: React.ReactNode | ((compound: CompoundContextValue) => React.ReactNode)
  className?: string
  as?: React.ComponentType<any>
  [key: string]: any
}

export function CompoundChild({ 
  id, 
  children, 
  className,
  as: Component = 'div',
  ...props 
}: CompoundChildProps) {
  const compound = useCompoundContext()
  
  React.useEffect(() => {
    if (id) {
      compound.registerChild(id, children)
      return () => compound.unregisterChild(id)
    }
  }, [id, children, compound])

  const content = typeof children === 'function' ? children(compound) : children
  
  return (
    <Component className={cn('compound-child', className)} {...props}>
      {content}
    </Component>
  )
}

// Compound State Hook
export function useCompoundState<T = any>(key: string, defaultValue?: T) {
  const compound = useCompoundContext()
  const [state, setState] = useState(() => compound.getValue(key) ?? defaultValue)

  const updateValue = useCallback((value: T) => {
    setState(value)
    compound.updateState(key, value)
  }, [key, compound])

  return [state, updateValue] as const
}

// Compound Registry Component
export function CompoundRegistry() {
  const compound = useCompoundContext()
  
  return (
    <div className="compound-registry" style={{ display: 'none' }}>
      {Object.entries(compound.children).map(([id, child]) => (
        <div key={id} data-compound-child={id}>
          {child}
        </div>
      ))}
    </div>
  )
}

// Dashboard Compound Components
interface DashboardCompoundProps {
  children: React.ReactNode
  className?: string
  layout?: 'grid' | 'flex' | 'tabs'
  columns?: number
}

export function DashboardCompound({ children, className, layout = 'grid', columns = 3 }: DashboardCompoundProps) {
  const layoutClass = {
    grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`,
    flex: 'flex flex-wrap gap-6',
    tabs: 'flex flex-col space-y-6'
  }

  return (
    <CompoundProvider>
      <CompoundWrapper 
        className={cn(
          'dashboard-compound',
          layoutClass[layout],
          columns !== 3 && layout === 'grid' && `grid-cols-${columns}`,
          className
        )}
      >
        {children}
      </CompoundWrapper>
    </CompoundProvider>
  )
}

interface DashboardCardProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  actions?: React.ReactNode
  loading?: boolean
  error?: string
}

export function DashboardCard({ 
  title, 
  description, 
  children, 
  className, 
  actions,
  loading,
  error 
}: DashboardCardProps) {
  return (
    <CompoundChild id="dashboard-card" className={cn('dashboard-card', className)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        {(title || description || actions) && (
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>}
                {description && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{description}</p>}
              </div>
              {actions && <div className="flex items-center space-x-2">{actions}</div>}
            </div>
          </div>
        )}
        
        <div className="px-6 py-4">
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-sm">{error}</div>
          ) : (
            children
          )}
        </div>
      </div>
    </CompoundChild>
  )
}

// Task Manager Compound Components
interface TaskListProps {
  children: React.ReactNode
  className?: string
  empty?: React.ReactNode
}

export function TaskList({ children, className, empty }: TaskListProps) {
  return (
    <CompoundChild id="task-list" className={cn('task-list space-y-4', className)}>
      {children || empty || (
        <div className="text-center py-12 text-gray-500">
          <p>No tasks found</p>
        </div>
      )}
    </CompoundChild>
  )
}

interface TaskItemProps {
  children: React.ReactNode
  task: any
  onSelect?: (task: any) => void
  selected?: boolean
  className?: string
}

export function TaskItem({ children, task, onSelect, selected, className }: TaskItemProps) {
  return (
    <CompoundChild id={`task-${task.id}`} className={cn('task-item', selected && 'selected', className)}>
      <div 
        className={cn(
          'bg-white dark:bg-gray-800 rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md',
          selected && 'ring-2 ring-blue-500 border-blue-500'
        )}
        onClick={() => onSelect?.(task)}
      >
        {children}
      </div>
    </CompoundChild>
  )
}

interface TaskHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function TaskHeader({ title, description, actions }: TaskHeaderProps) {
  return (
    <CompoundChild id="task-header" className="task-header mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          {description && <p className="text-gray-600 dark:text-gray-300 mt-1">{description}</p>}
        </div>
        {actions && <div className="flex items-center space-x-2">{actions}</div>}
      </div>
    </CompoundChild>
  )
}

export const DashboardCompoundComponents = {
  Provider: CompoundProvider,
  Wrapper: CompoundWrapper,
  Child: CompoundChild,
  State: useCompoundState,
  Registry: CompoundRegistry,
  Card: DashboardCard
}

export const TaskManagerCompoundComponents = {
  List: TaskList,
  Item: TaskItem,
  Header: TaskHeader
}