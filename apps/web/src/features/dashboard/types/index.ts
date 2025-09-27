/**
 * Dashboard domain types and interfaces
 * TypeScript types for the dashboard feature domain
 */

export interface DashboardConfig {
  id: string
  name: string
  layout: 'grid' | 'flex' | 'masonry'
  filters: FilterConfig[]
  visualizations: VisualizationConfig[]
  realTimeEnabled: boolean
  refreshInterval: number
  theme: 'light' | 'dark' | 'auto'
  customizations: Record<string, unknown>
}

export interface FilterConfig {
  id: string
  type: 'text' | 'select' | 'range' | 'date' | 'boolean'
  field: string
  label: string
  value: unknown
  options?: string[]
  condition: 'equals' | 'contains' | 'greater' | 'less' | 'between'
  enabled: boolean
}

export interface VisualizationConfig {
  id: string
  type: 'chart' | 'metric' | 'table' | 'heatmap'
  title: string
  data: unknown[]
  position: { x: number; y: number }
  size: { width: number; height: number }
  config: Record<string, unknown>
}

export interface MetricData {
  label: string
  value: number
  change: number
  trend: 'up' | 'down' | 'stable'
  color: string
}