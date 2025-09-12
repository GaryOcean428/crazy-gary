import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { 
  Brain, 
  Zap, 
  Clock, 
  Activity, 
  Power, 
  PowerOff,
  Settings,
  AlertCircle,
  CheckCircle,
  Timer,
  DollarSign
} from 'lucide-react'

export function ModelControl() {
  const [endpoints, setEndpoints] = useState({})
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({})
  const { toast } = useToast()

  useEffect(() => {
    fetchEndpointStatus()
    const interval = setInterval(fetchEndpointStatus, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchEndpointStatus = async () => {
    try {
      const response = await fetch('/api/endpoints/status')
      if (response.ok) {
        const data = await response.json()
        setEndpoints(data.endpoints || {})
      }
    } catch (error) {
      console.error('Failed to fetch endpoint status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWakeEndpoint = async (modelType) => {
    setActionLoading(prev => ({ ...prev, [modelType]: true }))
    
    try {
      const response = await fetch(`/api/endpoints/wake/${modelType}`, {
        method: 'POST'
      })
      
      if (response.ok) {
        toast({
          title: "Model Waking Up",
          description: `${modelType.toUpperCase()} model is starting...`
        })
        
        // Refresh status after a delay
        setTimeout(fetchEndpointStatus, 2000)
      } else {
        throw new Error('Failed to wake endpoint')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to wake ${modelType} model`,
        variant: "destructive"
      })
    } finally {
      setActionLoading(prev => ({ ...prev, [modelType]: false }))
    }
  }

  const handleSleepEndpoint = async (modelType) => {
    setActionLoading(prev => ({ ...prev, [modelType]: true }))
    
    try {
      const response = await fetch(`/api/endpoints/sleep/${modelType}`, {
        method: 'POST'
      })
      
      if (response.ok) {
        toast({
          title: "Model Sleeping",
          description: `${modelType.toUpperCase()} model is going to sleep...`
        })
        
        // Refresh status after a delay
        setTimeout(fetchEndpointStatus, 2000)
      } else {
        throw new Error('Failed to sleep endpoint')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to sleep ${modelType} model`,
        variant: "destructive"
      })
    } finally {
      setActionLoading(prev => ({ ...prev, [modelType]: false }))
    }
  }

  const handleWakeAll = async () => {
    setActionLoading(prev => ({ ...prev, all: true }))
    
    try {
      const response = await fetch('/api/endpoints/wake', {
        method: 'POST'
      })
      
      if (response.ok) {
        toast({
          title: "All Models Waking Up",
          description: "Starting all available model endpoints..."
        })
        
        setTimeout(fetchEndpointStatus, 3000)
      } else {
        throw new Error('Failed to wake all endpoints')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to wake all models",
        variant: "destructive"
      })
    } finally {
      setActionLoading(prev => ({ ...prev, all: false }))
    }
  }

  const handleSleepAll = async () => {
    setActionLoading(prev => ({ ...prev, all: true }))
    
    try {
      const response = await fetch('/api/endpoints/sleep', {
        method: 'POST'
      })
      
      if (response.ok) {
        toast({
          title: "All Models Sleeping",
          description: "Putting all model endpoints to sleep..."
        })
        
        setTimeout(fetchEndpointStatus, 2000)
      } else {
        throw new Error('Failed to sleep all endpoints')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sleep all models",
        variant: "destructive"
      })
    } finally {
      setActionLoading(prev => ({ ...prev, all: false }))
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'sleeping':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'starting':
        return <Activity className="h-5 w-5 text-blue-500 animate-spin" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      'running': 'default',
      'sleeping': 'secondary',
      'starting': 'default',
      'error': 'destructive'
    }
    return variants[status] || 'secondary'
  }

  const formatTimeRemaining = (seconds) => {
    if (!seconds) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getModelInfo = (modelType) => {
    const info = {
      '120b': {
        name: 'GPT-OSS 120B',
        description: 'Large model for complex reasoning tasks',
        parameters: '120 billion',
        cost: '$0.12/hour'
      },
      '20b': {
        name: 'GPT-OSS 20B',
        description: 'Efficient model for general tasks',
        parameters: '20 billion',
        cost: '$0.03/hour'
      }
    }
    return info[modelType] || {
      name: modelType.toUpperCase(),
      description: 'AI model endpoint',
      parameters: 'Unknown',
      cost: 'Variable'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Model Control</h1>
          <p className="text-muted-foreground">Loading model endpoints...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-full"></div>
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
          <h1 className="text-3xl font-bold tracking-tight">Model Control</h1>
          <p className="text-muted-foreground">
            Manage AI model endpoints and resource usage
          </p>
        </div>
        
        <div className="flex space-x-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={actionLoading.all}>
                <PowerOff className="mr-2 h-4 w-4" />
                Sleep All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sleep All Models?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will put all running model endpoints to sleep to save costs. 
                  You can wake them up again when needed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSleepAll}>
                  Sleep All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button onClick={handleWakeAll} disabled={actionLoading.all}>
            <Power className="mr-2 h-4 w-4" />
            Wake All
          </Button>
        </div>
      </div>

      {/* Model Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {Object.entries(endpoints).map(([modelType, endpoint]) => {
          const modelInfo = getModelInfo(modelType)
          const isLoading = actionLoading[modelType]
          
          return (
            <Card key={modelType} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(endpoint.status)}
                    <div>
                      <CardTitle className="text-xl">{modelInfo.name}</CardTitle>
                      <CardDescription>{modelInfo.description}</CardDescription>
                    </div>
                  </div>
                  
                  <Badge variant={getStatusBadge(endpoint.status)}>
                    {endpoint.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Model Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Parameters:</span>
                    <span className="font-medium">{modelInfo.parameters}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Cost:</span>
                    <span className="font-medium">{modelInfo.cost}</span>
                  </div>
                </div>
                
                <Separator />
                
                {/* Status Information */}
                <div className="space-y-3">
                  {endpoint.status === 'running' && endpoint.auto_sleep_in && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Timer className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Auto-sleep in:</span>
                      </div>
                      <span className="text-sm font-medium">
                        {formatTimeRemaining(endpoint.auto_sleep_in)}
                      </span>
                    </div>
                  )}
                  
                  {endpoint.status === 'running' && endpoint.activity_count !== undefined && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Activity count:</span>
                      </div>
                      <span className="text-sm font-medium">{endpoint.activity_count}</span>
                    </div>
                  )}
                  
                  {endpoint.last_activity && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Last activity:</span>
                      </div>
                      <span className="text-sm font-medium">
                        {new Date(endpoint.last_activity).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                {/* Controls */}
                <div className="flex space-x-2">
                  {endpoint.status === 'sleeping' && (
                    <Button 
                      onClick={() => handleWakeEndpoint(modelType)}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      <Power className="mr-2 h-4 w-4" />
                      {isLoading ? 'Waking...' : 'Wake Up'}
                    </Button>
                  )}
                  
                  {endpoint.status === 'running' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          disabled={isLoading}
                          className="flex-1"
                        >
                          <PowerOff className="mr-2 h-4 w-4" />
                          Sleep
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Sleep {modelInfo.name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will put the model endpoint to sleep to save costs. 
                            You can wake it up again when needed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleSleepEndpoint(modelType)}>
                            Sleep Model
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  
                  <Button variant="outline" size="sm" className="px-3">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
        
        {Object.keys(endpoints).length === 0 && (
          <Card className="md:col-span-2">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-2">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-medium">No Model Endpoints</h3>
                <p className="text-muted-foreground">
                  No model endpoints are currently configured
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Cost Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Cost Management</span>
          </CardTitle>
          <CardDescription>
            Monitor and control your AI model usage costs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">$0.00</div>
              <div className="text-sm text-muted-foreground">Current Hour</div>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-600">$2.45</div>
              <div className="text-sm text-muted-foreground">Today</div>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-purple-600">$18.30</div>
              <div className="text-sm text-muted-foreground">This Month</div>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>💡 <strong>Tip:</strong> Models automatically sleep after 15 minutes of inactivity to save costs.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

