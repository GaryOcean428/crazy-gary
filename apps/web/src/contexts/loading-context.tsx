import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react'

// Types
interface LoadingState {
  global: boolean
  components: Record<string, boolean>
  actions: Record<string, boolean>
  progressive: Record<string, number>
}

interface LoadingContextType {
  state: LoadingState
  setGlobalLoading: (loading: boolean) => void
  setComponentLoading: (componentId: string, loading: boolean) => void
  setActionLoading: (actionId: string, loading: boolean) => void
  updateProgressiveLoading: (id: string, progress: number) => void
  clearComponentLoading: (componentId: string) => void
  clearActionLoading: (actionId: string) => void
  isLoading: (componentId?: string, actionId?: string) => boolean
  getProgressiveProgress: (id: string) => number
  clearAllLoading: () => void
}

// Initial state
const initialState: LoadingState = {
  global: false,
  components: {},
  actions: {},
  progressive: {}
}

// Action types
type LoadingAction =
  | { type: 'SET_GLOBAL_LOADING'; payload: boolean }
  | { type: 'SET_COMPONENT_LOADING'; payload: { componentId: string; loading: boolean } }
  | { type: 'SET_ACTION_LOADING'; payload: { actionId: string; loading: boolean } }
  | { type: 'UPDATE_PROGRESSIVE_LOADING'; payload: { id: string; progress: number } }
  | { type: 'CLEAR_COMPONENT_LOADING'; payload: string }
  | { type: 'CLEAR_ACTION_LOADING'; payload: string }
  | { type: 'CLEAR_ALL_LOADING' }

// Reducer
const loadingReducer = (state: LoadingState, action: LoadingAction): LoadingState => {
  switch (action.type) {
    case 'SET_GLOBAL_LOADING':
      return { ...state, global: action.payload }
    
    case 'SET_COMPONENT_LOADING':
      return {
        ...state,
        components: {
          ...state.components,
          [action.payload.componentId]: action.payload.loading
        }
      }
    
    case 'SET_ACTION_LOADING':
      return {
        ...state,
        actions: {
          ...state.actions,
          [action.payload.actionId]: action.payload.loading
        }
      }
    
    case 'UPDATE_PROGRESSIVE_LOADING':
      return {
        ...state,
        progressive: {
          ...state.progressive,
          [action.payload.id]: action.payload.progress
        }
      }
    
    case 'CLEAR_COMPONENT_LOADING':
      const { [action.payload]: removedComponent, ...remainingComponents } = state.components
      return { ...state, components: remainingComponents }
    
    case 'CLEAR_ACTION_LOADING':
      const { [action.payload]: removedAction, ...remainingActions } = state.actions
      return { ...state, actions: remainingActions }
    
    case 'CLEAR_ALL_LOADING':
      return {
        ...state,
        global: false,
        components: {},
        actions: {},
        progressive: {}
      }
    
    default:
      return state
  }
}

// Context
const LoadingContext = createContext<LoadingContextType | null>(null)

// Provider component
interface LoadingProviderProps {
  children: ReactNode
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(loadingReducer, initialState)

  const setGlobalLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_GLOBAL_LOADING', payload: loading })
  }, [])

  const setComponentLoading = useCallback((componentId: string, loading: boolean) => {
    dispatch({ type: 'SET_COMPONENT_LOADING', payload: { componentId, loading } })
  }, [])

  const setActionLoading = useCallback((actionId: string, loading: boolean) => {
    dispatch({ type: 'SET_ACTION_LOADING', payload: { actionId, loading } })
  }, [])

  const updateProgressiveLoading = useCallback((id: string, progress: number) => {
    dispatch({ type: 'UPDATE_PROGRESSIVE_LOADING', payload: { id, progress } })
  }, [])

  const clearComponentLoading = useCallback((componentId: string) => {
    dispatch({ type: 'CLEAR_COMPONENT_LOADING', payload: componentId })
  }, [])

  const clearActionLoading = useCallback((actionId: string) => {
    dispatch({ type: 'CLEAR_ACTION_LOADING', payload: actionId })
  }, [])

  const isLoading = useCallback((componentId?: string, actionId?: string) => {
    if (componentId && componentId in state.components) {
      return state.components[componentId]
    }
    if (actionId && actionId in state.actions) {
      return state.actions[actionId]
    }
    return state.global
  }, [state])

  const getProgressiveProgress = useCallback((id: string) => {
    return state.progressive[id] || 0
  }, [state])

  const clearAllLoading = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_LOADING' })
  }, [])

  const value: LoadingContextType = {
    state,
    setGlobalLoading,
    setComponentLoading,
    setActionLoading,
    updateProgressiveLoading,
    clearComponentLoading,
    clearActionLoading,
    isLoading,
    getProgressiveProgress,
    clearAllLoading
  }

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  )
}

// Hook
export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

export default LoadingContext