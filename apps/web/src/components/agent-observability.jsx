import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { 
  Activity, 
  Eye, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Bot,
  Zap,
  TrendingUp,
  PauseCircle,
  PlayCircle,
  Brain,
  Settings,
  BarChart3,
  Filter,
  Refresh,
  Download,
  Search
} from 'lucide-react'

export function AgentObservability() {
  const [metrics, setMetrics] = useState(null)
  const [activeTraces, setActiveTraces] = useState([])
  const [completedTraces, setCompletedTraces] = useState([])
  const [selectedTrace, setSelectedTrace] = useState(null)
  const [realTimeEvents, setRealTimeEvents] = useState([])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [filter, _setFilter] = useState({
    eventTypes: [],
    agentId: '',
    taskId: ''
  })
  const { toast } = useToast()
  const intervalRef = useRef(null)
  const maxEvents = 1000

  useEffect(() => {
    fetchMetrics()
    fetchActiveTraces()
    fetchCompletedTraces()
    
    // Set up polling for real-time updates
    if (isMonitoring) {
      intervalRef.current = setInterval(() => {
        fetchMetrics()
        fetchActiveTraces()
        fetchRealTimeEvents()
      }, 2000)
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isMonitoring, fetchMetrics, fetchActiveTraces, fetchCompletedTraces, fetchRealTimeEvents])

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/observability/metrics')
      const data = await response.json()
      if (data.success) {
        setMetrics(data.metrics)
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    }
  }, [])

  const fetchActiveTraces = useCallback(async () => {
    try {
      const response = await fetch('/api/observability/traces/active')
      const data = await response.json()
      if (data.success) {
        setActiveTraces(data.traces)
      }
    } catch (error) {
      console.error('Failed to fetch active traces:', error)
    }
  }, [])

  const fetchCompletedTraces = useCallback(async () => {
    try {
      const response = await fetch('/api/observability/traces/completed?limit=20')
      const data = await response.json()
      if (data.success) {
        setCompletedTraces(data.traces)
      }
    } catch (error) {
      console.error('Failed to fetch completed traces:', error)
    }
  }, [])

  const fetchRealTimeEvents = useCallback(async () => {
    try {
      const since = realTimeEvents.length > 0 
        ? Math.max(...realTimeEvents.map(e => e.timestamp))
        : Date.now() / 1000 - 60 // Last minute
      
      const params = new URLSearchParams({ since: since.toString() })
      
      if (filter.eventTypes.length > 0) {
        filter.eventTypes.forEach(type => params.append('event_types', type))
      }
      if (filter.agentId) {
        params.append('agent_id', filter.agentId)
      }
      if (filter.taskId) {
        params.append('task_id', filter.taskId)
      }
      
      const response = await fetch(`/api/observability/events/stream?${params}`)
      const data = await response.json()
      
      if (data.success && data.events.length > 0) {
        setRealTimeEvents(prev => {
          const newEvents = [...data.events, ...prev].slice(0, maxEvents)
          return newEvents.sort((a, b) => b.timestamp - a.timestamp)
        })
      }
    } catch (error) {
      console.error('Failed to fetch real-time events:', error)
    }
  }, [realTimeEvents, filter, maxEvents])

  const fetchTraceDetails = async (traceId) => {
    try {
      const response = await fetch(`/api/observability/traces/${traceId}`)
      const data = await response.json()
      if (data.success) {
        setSelectedTrace(data.trace)
      }
    } catch (error) {
      console.error('Failed to fetch trace details:', error)
      toast({
        title: "Error",
        description: "Failed to fetch trace details",
        variant: "destructive",
      })
    }
  }

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring)
    if (!isMonitoring) {
      toast({
        title: "Monitoring Started",
        description: "Real-time agent monitoring is now active",
      })
    } else {
      toast({
        title: "Monitoring Stopped",
        description: "Real-time agent monitoring has been paused",
      })
    }
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString()
  }

  const formatDuration = (durationMs) => {
    if (!durationMs) return 'N/A'
    if (durationMs < 1000) return `${durationMs.toFixed(0)}ms`
    if (durationMs < 60000) return `${(durationMs / 1000).toFixed(1)}s`
    return `${(durationMs / 60000).toFixed(1)}m`
  }

  const getEventIcon = (eventType) => {
    const iconMap = {
      'task_start': <PlayCircle className="h-4 w-4 text-blue-500" />,
      'task_complete': <CheckCircle className="h-4 w-4 text-green-500" />,
      'task_failed': <AlertCircle className="h-4 w-4 text-red-500" />,
      'step_start': <Activity className="h-4 w-4 text-blue-400" />,
      'step_complete': <CheckCircle className="h-4 w-4 text-green-400" />,
      'step_failed': <AlertCircle className="h-4 w-4 text-red-400" />,
      'tool_call': <Settings className="h-4 w-4 text-purple-500" />,
      'tool_result': <Zap className="h-4 w-4 text-purple-400" />,
      'planning': <Brain className="h-4 w-4 text-orange-500" />,
      'reasoning': <Brain className="h-4 w-4 text-orange-400" />,
      'monologue': <Bot className="h-4 w-4 text-cyan-500" />,
      'error': <AlertCircle className="h-4 w-4 text-red-600" />,
      'warning': <AlertCircle className="h-4 w-4 text-yellow-500" />,
      'info': <Activity className="h-4 w-4 text-blue-300" />
    }
    return iconMap[eventType] || <Activity className="h-4 w-4 text-gray-400" />
  }

  const getStateIcon = (state) => {
    const iconMap = {
      'idle': <PauseCircle className="h-4 w-4 text-gray-400" />,
      'planning': <Brain className="h-4 w-4 text-orange-500 animate-pulse" />,
      'executing': <Activity className="h-4 w-4 text-blue-500 animate-spin" />,
      'thinking': <Brain className="h-4 w-4 text-purple-500 animate-pulse" />,
      'tool_using': <Settings className="h-4 w-4 text-purple-600 animate-spin" />,
      'verifying': <Eye className="h-4 w-4 text-cyan-500 animate-pulse" />,
      'completed': <CheckCircle className="h-4 w-4 text-green-500" />,
      'failed': <AlertCircle className="h-4 w-4 text-red-500" />,
      'paused': <PauseCircle className="h-4 w-4 text-yellow-500" />
    }
    return iconMap[state] || <Activity className="h-4 w-4 text-gray-400" />
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 animate-in fade-in slide-up">
      {/* Metrics Overview */}
      <div className="lg:col-span-3">
        <Card className="glass-effect">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle className="text-xl">Agent Observability Dashboard</CardTitle>
                  <CardDescription>Real-time monitoring of agent activities and performance</CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={toggleMonitoring}
                  variant={isMonitoring ? "destructive" : "default"}
                  size="sm"
                >
                  {isMonitoring ? (
                    <>
                      <PauseCircle className="h-4 w-4 mr-2" />
                      Stop Monitoring
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Start Monitoring
                    </>
                  )}
                </Button>
                <Button onClick={fetchMetrics} variant="outline" size="sm">
                  <Refresh className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {metrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium">Active Traces</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{metrics.active_traces}</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium">Success Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {(metrics.success_rate * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <span className="text-sm font-medium">Avg Duration</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatDuration(metrics.average_duration_ms)}
                  </p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-purple-500" />
                    <span className="text-sm font-medium">Total Events</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{metrics.total_events}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Traces */}
      <Card className="glass-effect">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary animate-pulse" />
            <div>
              <CardTitle className="text-lg">Active Traces</CardTitle>
              <CardDescription>Currently running agent tasks</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {activeTraces.length > 0 ? (
              <div className="space-y-3">
                {activeTraces.map((trace) => (
                  <div 
                    key={trace.id} 
                    className="p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => fetchTraceDetails(trace.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStateIcon(trace.current_state)}
                        <span className="font-medium text-sm truncate">
                          Task {trace.task_id?.substring(0, 8)}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {trace.current_state}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p>Agent: {trace.agent_id}</p>
                      <p>Events: {trace.event_count}</p>
                      <p>Started: {formatTimestamp(trace.start_time)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No active traces</p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Real-time Events */}
      <Card className="glass-effect">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">Real-time Events</CardTitle>
                <CardDescription>Live agent activity stream</CardDescription>
              </div>
            </div>
            <Badge variant={isMonitoring ? "default" : "secondary"}>
              {isMonitoring ? 'Live' : 'Paused'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {realTimeEvents.length > 0 ? (
              <div className="space-y-2">
                {realTimeEvents.slice(0, 50).map((event) => (
                  <div key={event.id} className="flex items-start space-x-2 p-2 rounded border-l-2 border-l-primary/20">
                    {getEventIcon(event.event_type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{event.message}</p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{formatTimestamp(event.timestamp)}</span>
                        <Badge variant="outline" className="text-xs">
                          {event.event_type}
                        </Badge>
                        {event.duration_ms && (
                          <span>{formatDuration(event.duration_ms)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {isMonitoring ? 'Waiting for events...' : 'Start monitoring to see events'}
              </p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Completed Traces */}
      <Card className="glass-effect">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-chart-1" />
            <div>
              <CardTitle className="text-lg">Recent Traces</CardTitle>
              <CardDescription>Recently completed tasks</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {completedTraces.length > 0 ? (
              <div className="space-y-3">
                {completedTraces.map((trace) => (
                  <div 
                    key={trace.id}
                    className="p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => fetchTraceDetails(trace.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStateIcon(trace.current_state)}
                        <span className="font-medium text-sm truncate">
                          Task {trace.task_id?.substring(0, 8)}
                        </span>
                      </div>
                      <Badge 
                        variant={trace.success ? "default" : "destructive"} 
                        className="text-xs"
                      >
                        {trace.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p>Duration: {formatDuration(trace.duration_ms)}</p>
                      <p>Events: {trace.event_count}</p>
                      <p>Agent: {trace.agent_id}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No completed traces</p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Trace Details Modal */}
      {selectedTrace && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStateIcon(selectedTrace.current_state)}
                  <div>
                    <CardTitle className="text-xl">
                      Trace Details - {selectedTrace.task_id?.substring(0, 8)}
                    </CardTitle>
                    <CardDescription>
                      Agent: {selectedTrace.agent_id} | 
                      Duration: {formatDuration(selectedTrace.duration_ms)} |
                      Events: {selectedTrace.event_count}
                    </CardDescription>
                  </div>
                </div>
                <Button 
                  onClick={() => setSelectedTrace(null)}
                  variant="ghost" 
                  size="sm"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh]">
                <div className="space-y-3">
                  {selectedTrace.events?.map((event) => (
                    <div key={event.id} className="border rounded-lg p-3">
                      <div className="flex items-start space-x-3">
                        {getEventIcon(event.event_type)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">{event.message}</h4>
                            <Badge variant="outline" className="text-xs">
                              {event.event_type}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {formatTimestamp(event.timestamp)}
                            {event.duration_ms && ` • ${formatDuration(event.duration_ms)}`}
                          </div>
                          {event.data && Object.keys(event.data).length > 0 && (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-primary">Show details</summary>
                              <pre className="mt-2 p-2 bg-muted/30 rounded text-xs overflow-x-auto">
                                {JSON.stringify(event.data, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default AgentObservability