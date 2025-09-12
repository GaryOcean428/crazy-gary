import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Activity, 
  Brain, 
  Zap, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Server,
  Wrench,
  Play,
  Pause
} from 'lucide-react'

export function Dashboard() {
  const [systemStats, setSystemStats] = useState({
    tasksCompleted: 0,
    tasksRunning: 0,
    modelsActive: 0,
    toolsAvailable: 0
  })
  
  const [modelStatus, setModelStatus] = useState({})
  const [mcpStatus, setMcpStatus] = useState({})
  const [recentTasks, setRecentTasks] = useState([])

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch model status
      const modelResponse = await fetch('/api/endpoints/status')
      if (modelResponse.ok) {
        const modelData = await modelResponse.json()
        setModelStatus(modelData.endpoints || {})
        
        const activeModels = Object.values(modelData.endpoints || {}).filter(
          endpoint => endpoint.status === 'running'
        ).length
        
        setSystemStats(prev => ({ ...prev, modelsActive: activeModels }))
      }

      // Fetch MCP status
      const mcpResponse = await fetch('/api/mcp/status')
      if (mcpResponse.ok) {
        const mcpData = await mcpResponse.json()
        setMcpStatus(mcpData.clients || {})
        
        const totalTools = Object.values(mcpData.clients || {}).reduce(
          (sum, client) => sum + (client.tool_count || 0), 0
        )
        
        setSystemStats(prev => ({ ...prev, toolsAvailable: totalTools }))
      }

      // Mock recent tasks data
      setRecentTasks([
        {
          id: 1,
          title: "Analyze market trends",
          status: "completed",
          duration: "2m 34s",
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString()
        },
        {
          id: 2,
          title: "Generate report summary",
          status: "running",
          duration: "1m 12s",
          timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString()
        },
        {
          id: 3,
          title: "Web scraping task",
          status: "completed",
          duration: "45s",
          timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString()
        }
      ])

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'sleeping':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      'running': 'default',
      'sleeping': 'secondary',
      'completed': 'default',
      'error': 'destructive'
    }
    return variants[status] || 'secondary'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your agentic AI system performance and status
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.tasksCompleted}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Models</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.modelsActive}</div>
            <p className="text-xs text-muted-foreground">
              {Object.keys(modelStatus).length} total endpoints
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MCP Tools</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.toolsAvailable}</div>
            <p className="text-xs text-muted-foreground">
              {Object.keys(mcpStatus).length} clients connected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Load</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23%</div>
            <Progress value={23} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Model Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Server className="h-5 w-5" />
              <span>Model Endpoints</span>
            </CardTitle>
            <CardDescription>
              Current status of AI model endpoints
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(modelStatus).map(([modelType, status]) => (
              <div key={modelType} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(status.status)}
                  <div>
                    <div className="font-medium">{modelType.toUpperCase()} Model</div>
                    <div className="text-sm text-muted-foreground">
                      {status.auto_sleep_in ? `Sleep in ${Math.floor(status.auto_sleep_in / 60)}m` : 'Ready'}
                    </div>
                  </div>
                </div>
                <Badge variant={getStatusBadge(status.status)}>
                  {status.status}
                </Badge>
              </div>
            ))}
            
            {Object.keys(modelStatus).length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                No model endpoints configured
              </div>
            )}
          </CardContent>
        </Card>

        {/* MCP Clients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wrench className="h-5 w-5" />
              <span>MCP Clients</span>
            </CardTitle>
            <CardDescription>
              Model Context Protocol integrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(mcpStatus).map(([clientName, status]) => (
              <div key={clientName} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {status.connected ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <div>
                    <div className="font-medium capitalize">{clientName}</div>
                    <div className="text-sm text-muted-foreground">
                      {status.tool_count || 0} tools available
                    </div>
                  </div>
                </div>
                <Badge variant={status.connected ? 'default' : 'destructive'}>
                  {status.connected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
            ))}
            
            {Object.keys(mcpStatus).length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                No MCP clients configured
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Recent Tasks</span>
          </CardTitle>
          <CardDescription>
            Latest agentic task executions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTasks.map((task, index) => (
              <div key={task.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {task.status === 'running' ? (
                      <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    <div>
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(task.timestamp).toLocaleTimeString()} • {task.duration}
                      </div>
                    </div>
                  </div>
                  <Badge variant={getStatusBadge(task.status)}>
                    {task.status}
                  </Badge>
                </div>
                {index < recentTasks.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
            
            {recentTasks.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No recent tasks
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

