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
  Pause,
  Sparkles,
  BarChart3,
  LineChart,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Cpu,
  HardDrive,
  Network,
  Eye
} from 'lucide-react'

export function Dashboard() {
  const [systemStats, setSystemStats] = useState({
    tasksCompleted: 156,
    tasksRunning: 3,
    modelsActive: 5,
    toolsAvailable: 12
  })
  
  const [modelStatus, setModelStatus] = useState({
    'gpt-4': { status: 'running', load: 45, requests: 1247 },
    'claude-3': { status: 'running', load: 32, requests: 892 },
    'gemini-pro': { status: 'idle', load: 0, requests: 0 },
    'llama-2': { status: 'error', load: 0, requests: 0 },
    'mistral': { status: 'running', load: 78, requests: 2156 }
  })
  
  const [mcpStatus, setMcpStatus] = useState({
    'file-system': { status: 'connected', operations: 45 },
    'web-scraper': { status: 'connected', operations: 23 },
    'database': { status: 'disconnected', operations: 0 },
    'email-client': { status: 'connected', operations: 12 }
  })
  
  const [recentTasks, setRecentTasks] = useState([
    {
      id: 1,
      name: 'Analyze market trends',
      status: 'completed',
      duration: '2m 34s',
      timestamp: '8:44:05 AM',
      progress: 100
    },
    {
      id: 2,
      name: 'Generate report summary',
      status: 'running',
      duration: '1m 12s',
      timestamp: '8:47:05 AM',
      progress: 67
    },
    {
      id: 3,
      name: 'Web scraping task',
      status: 'completed',
      duration: '45s',
      timestamp: '8:39:05 AM',
      progress: 100
    },
    {
      id: 4,
      name: 'Data processing pipeline',
      status: 'running',
      duration: '5m 23s',
      timestamp: '8:42:15 AM',
      progress: 34
    }
  ])

  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 23,
    memory: 67,
    disk: 45,
    network: 12
  })

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Simulate real-time data updates
      setSystemStats(prev => ({
        ...prev,
        tasksCompleted: prev.tasksCompleted + Math.floor(Math.random() * 3),
        tasksRunning: Math.max(0, prev.tasksRunning + (Math.random() > 0.7 ? 1 : -1))
      }))

      setSystemMetrics(prev => ({
        cpu: Math.max(0, Math.min(100, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(0, Math.min(100, prev.memory + (Math.random() - 0.5) * 5)),
        disk: Math.max(0, Math.min(100, prev.disk + (Math.random() - 0.5) * 2)),
        network: Math.max(0, Math.min(100, prev.network + (Math.random() - 0.5) * 15))
      }))

      // Fetch model status (keep existing logic)
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
        
        const connectedTools = Object.values(mcpData.clients || {}).filter(
          client => client.status === 'connected'
        ).length
        
        setSystemStats(prev => ({ ...prev, toolsAvailable: connectedTools }))
      }

      // Fetch recent tasks
      const tasksResponse = await fetch('/api/tasks/recent')
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json()
        setRecentTasks(tasksData.tasks || [])
        
        const completedTasks = tasksData.tasks?.filter(
          task => task.status === 'completed'
        ).length || 0
        
        setSystemStats(prev => ({ ...prev, tasksCompleted: completedTasks }))
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
  }

  const _getStatusColor = (status) => {
    switch (status) {
      case 'running':
      case 'connected':
      case 'completed':
        return 'text-green-500'
      case 'idle':
      case 'paused':
        return 'text-yellow-500'
      case 'error':
      case 'disconnected':
      case 'failed':
        return 'text-red-500'
      default:
        return 'text-muted-foreground'
    }
  }

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'running':
      case 'connected':
      case 'completed':
        return 'default'
      case 'idle':
      case 'paused':
        return 'secondary'
      case 'error':
      case 'disconnected':
      case 'failed':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const StatCard = ({ title, value, change, icon: Icon, trend = 'up' }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {title}
            </p>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              {change && (
                <div className={`flex items-center text-xs font-medium ${
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trend === 'up' ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {change}
                </div>
              )}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-2 bg-primary/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-8 animate-in fade-in slide-up">
      {/* Enhanced Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <Sparkles className="h-6 w-6 text-primary animate-pulse" />
        </div>
        <p className="text-lg text-muted-foreground">
          Real-time insights into your agentic AI system performance and health
        </p>
        <div className="flex items-center space-x-4 text-sm">
          <Badge variant="outline" className="border-green-500/20 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            Live Data
          </Badge>
          <span className="text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tasks Completed"
          value={systemStats.tasksCompleted.toLocaleString()}
          change="+12% from last hour"
          icon={CheckCircle}
          trend="up"
        />
        <StatCard
          title="Active Models"
          value={systemStats.modelsActive}
          change={`${Object.keys(modelStatus).length} total endpoints`}
          icon={Brain}
        />
        <StatCard
          title="MCP Tools"
          value={systemStats.toolsAvailable}
          change={`${Object.values(mcpStatus).filter(c => c.status === 'connected').length} clients connected`}
          icon={Wrench}
        />
        <StatCard
          title="System Load"
          value={`${systemMetrics.cpu}%`}
          change="Optimal performance"
          icon={Cpu}
          trend="down"
        />
      </div>

      {/* Enhanced System Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'CPU Usage', value: systemMetrics.cpu, icon: Cpu, color: 'bg-blue-500' },
          { label: 'Memory', value: systemMetrics.memory, icon: HardDrive, color: 'bg-green-500' },
          { label: 'Disk I/O', value: systemMetrics.disk, icon: HardDrive, color: 'bg-yellow-500' },
          { label: 'Network', value: systemMetrics.network, icon: Network, color: 'bg-purple-500' }
        ].map((metric) => (
          <Card key={metric.label} className="hover:shadow-soft transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <metric.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{metric.label}</span>
                </div>
                <span className="text-sm font-bold">{metric.value}%</span>
              </div>
              <Progress 
                value={metric.value} 
                className="h-2"
                style={{
                  '--progress-foreground': metric.color
                }}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Enhanced Model Endpoints */}
        <Card className="glass-effect hover:shadow-strong transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Server className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Model Endpoints</CardTitle>
                  <CardDescription>AI model performance and status</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.keys(modelStatus).length > 0 ? (
              Object.entries(modelStatus).map(([name, endpoint]) => (
                <div key={name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      endpoint.status === 'running' ? 'bg-green-500 animate-pulse' :
                      endpoint.status === 'idle' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium capitalize">{name}</p>
                      <p className="text-xs text-muted-foreground">
                        {endpoint.requests?.toLocaleString() || 0} requests
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={getStatusBadgeVariant(endpoint.status)} className="text-xs">
                      {endpoint.status}
                    </Badge>
                    {endpoint.load !== undefined && (
                      <p className="text-xs text-muted-foreground">{endpoint.load}% load</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No model endpoints configured</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Add Endpoint
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced MCP Clients */}
        <Card className="glass-effect hover:shadow-strong transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Wrench className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl">MCP Clients</CardTitle>
                  <CardDescription>Model Context Protocol integrations</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.keys(mcpStatus).length > 0 ? (
              Object.entries(mcpStatus).map(([name, client]) => (
                <div key={name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      client.status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium capitalize">{name.replace('-', ' ')}</p>
                      <p className="text-xs text-muted-foreground">
                        {client.operations || 0} operations
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusBadgeVariant(client.status)} className="text-xs">
                    {client.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No MCP clients configured</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Add Client
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Recent Tasks */}
      <Card className="glass-effect hover:shadow-strong transition-all duration-500">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-chart-1/10 rounded-lg">
                <Activity className="h-5 w-5 text-chart-1" />
              </div>
              <div>
                <CardTitle className="text-xl">Recent Tasks</CardTitle>
                <CardDescription>Latest agentic task executions and their status</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              View All
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentTasks.length > 0 ? (
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div key={task.id} className="group flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-all duration-200 hover:scale-[1.01]">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      task.status === 'completed' 
                        ? 'bg-green-500' 
                        : task.status === 'running' 
                        ? 'bg-blue-500 animate-pulse' 
                        : 'bg-gray-500'
                    }`}>
                      {task.status === 'completed' ? (
                        <CheckCircle className="h-3 w-3 text-white" />
                      ) : task.status === 'running' ? (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium group-hover:text-primary transition-colors truncate">
                        {task.name}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {task.timestamp}
                        </span>
                        <span>• {task.duration}</span>
                        {task.status === 'running' && (
                          <span className="flex items-center">
                            • {task.progress}% complete
                          </span>
                        )}
                      </div>
                      {task.status === 'running' && (
                        <Progress value={task.progress} className="mt-2 h-1" />
                      )}
                    </div>
                  </div>
                  <Badge variant={getStatusBadgeVariant(task.status)} className="ml-4">
                    {task.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">No recent tasks</p>
              <p className="text-sm mb-4">Start your first agentic task to see activity here</p>
              <Button>
                <Play className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
