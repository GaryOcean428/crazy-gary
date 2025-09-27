/**
 * Dynamic Dashboard Control Panel
 * 
 * Advanced dashboard component that provides real-time data visualization,
 * interactive filtering, and customizable layouts. This component serves as
 * the main dashboard interface for comprehensive data analysis and monitoring.
 * 
 * Features:
 * - Real-time data filtering with complex conditional logic
 * - Interactive visualizations with live metric updates  
 * - Customizable dashboard layouts (grid, flex, masonry)
 * - Template system for saving/loading configurations
 * - Advanced personalization with themes and preferences
 * 
 * The component is designed as a flexible building block that empowers users
 * to create unique workflows and data analysis solutions.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Settings, 
  Filter, 
  BarChart3, 
  TrendingUp, 
  Zap, 
  Eye, 
  RefreshCw, 
  Save, 
  Download, 
  Upload,
  Layers,
  PieChart,
  Activity,
  Clock,
  Target
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'
import type { DashboardConfig, FilterConfig, VisualizationConfig, MetricData } from '../types'
import { useRealtimeMetrics, useDashboardTemplates, useDashboardFilters } from '../hooks'

export function DynamicDashboardControls() {
  // State management for the dashboard configuration
  const [config, setConfig] = useState<DashboardConfig>({
    id: 'default',
    name: 'My Dashboard',
    layout: 'grid',
    filters: [],
    visualizations: [],
    realTimeEnabled: true,
    refreshInterval: 5000,
    theme: 'auto',
    customizations: {}
  })

  const [activeTab, setActiveTab] = useState('overview')
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  
  const { toast } = useToast()
  
  // Use custom hooks for business logic separation
  const realTimeData = useRealtimeMetrics(config.realTimeEnabled, config.refreshInterval)
  const { savedTemplates, saveTemplate, loadTemplate } = useDashboardTemplates()
  const { isLoading, applyFilters } = useDashboardFilters()

  // Save dashboard configuration with user preferences
  const saveDashboardTemplate = useCallback(async () => {
    const newTemplate = saveTemplate(config)
    toast({
      title: "Template Saved",
      description: `Dashboard saved as "${newTemplate.name}"`,
    })
  }, [config, saveTemplate, toast])

  // Load dashboard template with smooth transitions
  const loadDashboardTemplate = useCallback((template: DashboardConfig) => {
    setConfig(loadTemplate(template))
    toast({
      title: "Template Loaded",
      description: `Loaded "${template.name}" configuration`,
    })
  }, [loadTemplate, toast])

  // Apply filters with toast notification
  const handleApplyFilters = useCallback(async (filters: FilterConfig[]) => {
    const activeFilters = await applyFilters(filters)
    if (activeFilters.length > 0) {
      toast({
        title: "Filters Applied",
        description: `${activeFilters.length} filter(s) applied successfully`,
      })
    }
  }, [applyFilters, toast])

  // Memoized calculations for performance optimization
  const metrics = useMemo(() => {
    return realTimeData.map(metric => ({
      ...metric,
      formattedValue: metric.label.includes('Rate') || metric.label.includes('Time')
        ? metric.label.includes('Rate') 
          ? `${metric.value.toFixed(1)}%`
          : `${metric.value.toFixed(0)}ms`
        : metric.value.toString(),
      changeFormatted: `${metric.change > 0 ? '+' : ''}${metric.change.toFixed(1)}${
        metric.label.includes('Rate') ? '%' : metric.label.includes('Time') ? 'ms' : ''
      }`
    }))
  }, [realTimeData])

  // Animation variants for micro-interactions
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    hover: { scale: 1.02, transition: { duration: 0.2 } }
  }

  const metricVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.4 } }
  }

  return (
    <div className="w-full space-y-6 p-6">
      {/* Header with advanced controls */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <motion.div
              animate={{ rotate: config.realTimeEnabled ? 360 : 0 }}
              transition={{ duration: 2, repeat: config.realTimeEnabled ? Infinity : 0, ease: "linear" }}
            >
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </motion.div>
            Dynamic Dashboard Controls
          </h1>
          <p className="text-muted-foreground mt-1">
            Advanced data visualization with real-time filtering and customization
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant={config.realTimeEnabled ? "default" : "secondary"}
            className="flex items-center gap-1"
          >
            <Activity className="h-3 w-3" />
            {config.realTimeEnabled ? 'Live' : 'Static'}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setFilterPanelOpen(!filterPanelOpen)}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm" onClick={saveDashboardTemplate}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </div>
      </motion.div>

      {/* Advanced Filter Panel */}
      <AnimatePresence>
        {filterPanelOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Advanced Filtering Controls
                </CardTitle>
                <CardDescription>
                  Configure real-time data filters with complex conditional logic
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Filter Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select filter type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text Search</SelectItem>
                        <SelectItem value="range">Value Range</SelectItem>
                        <SelectItem value="date">Date Range</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Condition</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="contains">Contains</SelectItem>
                        <SelectItem value="greater">Greater Than</SelectItem>
                        <SelectItem value="less">Less Than</SelectItem>
                        <SelectItem value="between">Between</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Value</Label>
                    <Input placeholder="Enter filter value" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="real-time-filtering" 
                      checked={config.realTimeEnabled}
                      onCheckedChange={(checked) => 
                        setConfig(prev => ({ ...prev, realTimeEnabled: checked }))
                      }
                    />
                    <Label htmlFor="real-time-filtering">Real-time filtering</Label>
                  </div>
                  
                  <Button onClick={() => handleApplyFilters(config.filters)} disabled={isLoading}>
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4 mr-2" />
                    )}
                    Apply Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Dashboard Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="customization">Customization</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Real-time Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                variants={metricVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
              >
                <Card className="relative overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {metric.label}
                        </p>
                        <p className={`text-2xl font-bold ${metric.color}`}>
                          {metric.formattedValue}
                        </p>
                        <p className={`text-xs flex items-center gap-1 mt-1 ${
                          metric.trend === 'up' ? 'text-green-600' : 
                          metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          <TrendingUp className={`h-3 w-3 ${
                            metric.trend === 'down' ? 'rotate-180' : ''
                          }`} />
                          {metric.changeFormatted}
                        </p>
                      </div>
                      <div className={`p-2 rounded-full bg-opacity-10 ${
                        metric.color.replace('text-', 'bg-').replace('-600', '-100')
                      }`}>
                        {metric.label.includes('Task') && <Target className="h-4 w-4" />}
                        {metric.label.includes('Rate') && <PieChart className="h-4 w-4" />}
                        {metric.label.includes('Time') && <Clock className="h-4 w-4" />}
                        {metric.label.includes('Error') && <Activity className="h-4 w-4" />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Interactive Visualization */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Interactive Data Visualization
                </CardTitle>
                <CardDescription>
                  Real-time charts that respond to your filtering and customization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Live Data</Badge>
                      <Badge variant="outline">{metrics.length} Metrics</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Full Screen
                      </Button>
                    </div>
                  </div>
                  
                  {/* Simulated Chart Area */}
                  <div className="h-64 bg-muted/10 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/20 relative">
                    <div className="text-center space-y-2">
                      <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50" />
                      <p className="text-muted-foreground">Interactive Chart Visualization</p>
                      <p className="text-sm text-muted-foreground/70">
                        Real-time data visualization would appear here
                      </p>
                    </div>
                    
                    {isLoading && (
                      <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-lg">
                        <div className="text-center space-y-2">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                          <p className="text-sm text-muted-foreground">Updating visualization...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="customization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Dashboard Customization
              </CardTitle>
              <CardDescription>
                Personalize your dashboard layout, theme, and behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Dashboard Layout</Label>
                    <Select 
                      value={config.layout} 
                      onValueChange={(value) => 
                        setConfig(prev => ({ ...prev, layout: value as 'grid' | 'flex' | 'masonry' }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grid">Grid Layout</SelectItem>
                        <SelectItem value="flex">Flexible Layout</SelectItem>
                        <SelectItem value="masonry">Masonry Layout</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Theme Preference</Label>
                    <Select 
                      value={config.theme} 
                      onValueChange={(value) => 
                        setConfig(prev => ({ ...prev, theme: value as 'light' | 'dark' | 'auto' }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light Theme</SelectItem>
                        <SelectItem value="dark">Dark Theme</SelectItem>
                        <SelectItem value="auto">Auto (System)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Refresh Interval (seconds)</Label>
                    <Slider
                      value={[config.refreshInterval / 1000]}
                      onValueChange={([value]) => 
                        setConfig(prev => ({ ...prev, refreshInterval: value * 1000 }))
                      }
                      max={30}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground">
                      Current: {config.refreshInterval / 1000} seconds
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="animations">Enable Animations</Label>
                    <Switch id="animations" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications">Push Notifications</Label>
                    <Switch id="notifications" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Dashboard Templates
              </CardTitle>
              <CardDescription>
                Save, load, and manage your custom dashboard configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {savedTemplates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No saved templates yet</p>
                    <p className="text-sm">Save your current configuration to create a template</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedTemplates.map((template) => (
                      <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{template.name}</h3>
                            <Badge variant="outline">{template.layout}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            {template.visualizations.length} visualizations, 
                            {template.filters.length} filters
                          </p>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => loadDashboardTemplate(template)}
                              className="flex-1"
                            >
                              Load
                            </Button>
                            <Button size="sm" variant="outline">
                              <Upload className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Performance and Usage Analytics */}
      {config.realTimeEnabled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Alert>
            <Activity className="h-4 w-4" />
            <AlertDescription>
              Real-time mode active. Dashboard updates every {config.refreshInterval / 1000} seconds.
              {metrics.length > 0 && ` Last update: ${new Date().toLocaleTimeString()}`}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </div>
  )
}

export default DynamicDashboardControls