/**
 * Barrel export for all feature modules
 * Centralized feature imports for cleaner code
 */

// Dashboard feature
export * from './dashboard'

// Future features can be exported here
// export * from './chat'
// export * from './settings'
// export * from './monitoring'

// Feature-specific type exports
export type {
  DashboardConfig,
  FilterConfig,
  VisualizationConfig,
  MetricData
} from './dashboard/types'