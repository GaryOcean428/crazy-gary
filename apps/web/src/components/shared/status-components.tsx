import { Badge } from '@/components/ui/badge'
import { getStatusConfig } from '@/lib/component-utils'

/**
 * Reusable status display component to reduce code duplication
 * Follows DRY principle by centralizing status rendering logic
 */
export function StatusDisplay({ status, type = 'default', className = '' }) {
  const config = getStatusConfig(status, type)
  const IconComponent = config.icon
  
  return (
    <Badge variant={config.variant} className={`${config.color} ${className}`}>
      <IconComponent className="w-3 h-3 mr-1" />
      {status}
    </Badge>
  )
}

/**
 * Model status card component for consistent display
 */
export function ModelStatusCard({ name, status, load }) {
  const config = getStatusConfig(status, 'model')
  const IconComponent = config.icon
  
  return (
    <div className="flex items-center justify-between p-2 rounded-lg border">
      <div className="flex items-center space-x-2">
        <IconComponent className={`w-4 h-4 ${config.color}`} />
        <span className="font-medium">{name}</span>
      </div>
      <div className="flex items-center space-x-2">
        <StatusDisplay status={status} type="model" size="sm" />
        {status === 'running' && (
          <span className="text-sm text-muted-foreground">{load}% load</span>
        )}
      </div>
    </div>
  )
}

/**
 * MCP tool status card component
 */
export function McpStatusCard({ name, status, operations }) {
  const config = getStatusConfig(status, 'mcp')
  const IconComponent = config.icon
  
  return (
    <div className="flex items-center justify-between p-2 rounded-lg border">
      <div className="flex items-center space-x-2">
        <IconComponent className={`w-4 h-4 ${config.color}`} />
        <span className="font-medium">{name}</span>
      </div>
      <div className="flex items-center space-x-2">
        <StatusDisplay status={status} type="mcp" size="sm" />
        <span className="text-sm text-muted-foreground">{operations} ops</span>
      </div>
    </div>
  )
}

/**
 * System metric card component
 */
export function SystemMetricCard({ title, value, percentage, icon: _IconComponent, trend }) {
  const getTrendColor = (trend) => {
    if (trend > 0) return 'text-green-600'
    if (trend < 0) return 'text-red-600'
    return 'text-gray-600'
  }
  
  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <_IconComponent className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        {trend !== undefined && (
          <span className={`text-xs ${getTrendColor(trend)}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {percentage !== undefined && (
        <div className="text-sm text-muted-foreground">{percentage}% usage</div>
      )}
    </div>
  )
}