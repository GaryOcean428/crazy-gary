'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Cpu, 
  Database, 
  HardDrive, 
  MemoryStick,
  RefreshCw,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react'

export function Monitoring() {
  const [dashboardData, setDashboardData] = useState(null)
  const [userLimits, setUserLimits] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/monitoring/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      } else {
        throw new Error('Failed to fetch dashboard data')
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast({
        title: "Error",
        description: "Failed to load monitoring data",
        variant: "destructive"
      })
    }
  }

  const fetchUserLimits = async () => {
    try {
      const response = await fetch('/api/monitoring/limits/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUserLimits(data)
      }
    } catch (error) {
      console.error('Error fetching user limits:', error)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await Promise.all([fetchDashboardData(), fetchUserLimits()])
    setRefreshing(false)
  }

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchDashboardData(), fetchUserLimits()])
      setLoading(false)
    }

    loadData()

    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'degraded': return 'text-yellow-600'
      case 'unhealthy': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'unhealthy': return <AlertTriangle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">System Monitoring</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time system health and performance metrics
          </p>
        </div>
        <Button 
          onClick={refreshData} 
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* System Status Overview */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                {getStatusIcon(dashboardData.health.status)}
                <div>
                  <p className="text-sm font-medium">System Status</p>
                  <p className={`text-2xl font-bold ${getStatusColor(dashboardData.health.status)}`}>
                    {dashboardData.health.status}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Requests/Hour</p>
                  <p className="text-2xl font-bold">{dashboardData.stats.requests_last_hour}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Avg Response</p>
                  <p className="text-2xl font-bold">{dashboardData.stats.avg_response_time_ms}ms</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium">Error Rate</p>
                  <p className="text-2xl font-bold">{dashboardData.stats.error_rate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="health">Health Checks</TabsTrigger>
          <TabsTrigger value="limits">Rate Limits</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* System Resources */}
          {dashboardData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.health.system.cpu_percent}%</div>
                  <Progress value={dashboardData.health.system.cpu_percent} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                  <MemoryStick className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.health.system.memory_percent}%</div>
                  <Progress value={dashboardData.health.system.memory_percent} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.health.system.disk_percent}%</div>
                  <Progress value={dashboardData.health.system.disk_percent} className="mt-2" />
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          {dashboardData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(dashboardData.health.health_checks).map(([name, check]) => (
                <Card key={name}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{name}</CardTitle>
                      <Badge variant={check.status === 'healthy' ? 'default' : 'destructive'}>
                        {check.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{check.message}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>Response: {check.response_time_ms}ms</span>
                      <span>Last check: {new Date(check.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="limits" className="space-y-6">
          {userLimits && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Usage Limits</CardTitle>
                  <CardDescription>
                    Current tier: <Badge>{userLimits.tier}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(userLimits.limits).map(([limitType, limit]) => {
                    const percentage = (limit.current / limit.limit) * 100
                    return (
                      <div key={limitType} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{limitType.replace(/_/g, ' ')}</span>
                          <span>{limit.current} / {limit.limit}</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        {limit.reset_time && (
                          <p className="text-xs text-muted-foreground">
                            Resets: {new Date(limit.reset_time).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Requests (Last Hour)</p>
                        <p className="text-2xl font-bold">{userLimits.requests_last_hour}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium">Tokens (Last Hour)</p>
                        <p className="text-2xl font-bold">{userLimits.tokens_last_hour}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Cost (Last Hour)</p>
                        <p className="text-2xl font-bold">${userLimits.cost_last_hour}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                System performance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Performance charts will be displayed here</p>
                <p className="text-sm">Real-time metrics and historical data</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

