'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { 
  Brain, 
  Zap, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Loader2,
  Settings,
  Play,
  BarChart3,
  Network,
  Cpu
} from 'lucide-react'

export function Heavy() {
  const [query, setQuery] = useState('')
  const [numAgents, setNumAgents] = useState(4)
  const [isExecuting, setIsExecuting] = useState(false)
  const [result, setResult] = useState(null)
  const [progress, setProgress] = useState({})
  const [config, setConfig] = useState(null)
  const [tools, setTools] = useState({})
  const { toast } = useToast()

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/heavy/config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setConfig(data)
        setNumAgents(data.num_agents)
      }
    } catch (error) {
      console.error('Error fetching config:', error)
    }
  }

  const fetchTools = async () => {
    try {
      const response = await fetch('/api/heavy/tools', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTools(data)
      }
    } catch (error) {
      console.error('Error fetching tools:', error)
    }
  }

  const pollProgress = useCallback(async () => {
    if (!isExecuting) return

    try {
      const response = await fetch('/api/heavy/progress', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProgress(data)
      }
    } catch (error) {
      console.error('Error polling progress:', error)
    }
  }, [isExecuting])

  const executeHeavyTask = async () => {
    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Please enter a query",
        variant: "destructive"
      })
      return
    }

    setIsExecuting(true)
    setResult(null)
    setProgress({})

    try {
      const response = await fetch('/api/heavy/orchestrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          query: query,
          num_agents: numAgents
        })
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        toast({
          title: "Success",
          description: "Heavy orchestration completed successfully"
        })
      } else {
        throw new Error(data.error || 'Heavy orchestration failed')
      }
    } catch (error) {
      console.error('Error executing heavy task:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to execute heavy task",
        variant: "destructive"
      })
    } finally {
      setIsExecuting(false)
    }
  }

  const updateConfig = async () => {
    try {
      const response = await fetch('/api/heavy/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          num_agents: numAgents
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Configuration updated successfully"
        })
        fetchConfig()
      } else {
        throw new Error('Failed to update configuration')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    fetchConfig()
    fetchTools()
  }, [])

  useEffect(() => {
    let interval
    if (isExecuting) {
      interval = setInterval(pollProgress, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isExecuting, pollProgress])

  const getAgentStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'processing': return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'timeout': return <Clock className="h-4 w-4 text-yellow-600" />
      default: return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getAgentStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'processing': return 'text-blue-600'
      case 'error': return 'text-red-600'
      case 'timeout': return 'text-yellow-600'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-600" />
            Heavy Orchestration
          </h1>
          <p className="text-muted-foreground">
            Multi-agent AI system for comprehensive task analysis
          </p>
        </div>
        <Badge variant="outline" className="text-purple-600 border-purple-600">
          Make It Heavy
        </Badge>
      </div>

      {/* Configuration Overview */}
      {config && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Active Agents</p>
                  <p className="text-2xl font-bold">{config.num_agents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Timeout</p>
                  <p className="text-2xl font-bold">{config.task_timeout}s</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">Tools</p>
                  <p className="text-2xl font-bold">{Object.keys(tools).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Network className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-2xl font-bold text-green-600">Ready</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="orchestrate" className="space-y-6">
        <TabsList>
          <TabsTrigger value="orchestrate">Orchestrate</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="orchestrate" className="space-y-6">
          {/* Task Input */}
          <Card>
            <CardHeader>
              <CardTitle>Heavy Task Orchestration</CardTitle>
              <CardDescription>
                Enter your query and let multiple AI agents analyze it from different perspectives
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="query">Task Query</Label>
                <Textarea
                  id="query"
                  placeholder="Enter your complex query here... (e.g., 'Analyze the impact of AI on software development in 2024')"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  rows={4}
                  disabled={isExecuting}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numAgents">Number of Agents</Label>
                  <Input
                    id="numAgents"
                    type="number"
                    min="1"
                    max="8"
                    value={numAgents}
                    onChange={(e) => setNumAgents(parseInt(e.target.value))}
                    disabled={isExecuting}
                  />
                </div>

                <div className="flex items-end">
                  <Button 
                    onClick={executeHeavyTask} 
                    disabled={isExecuting || !query.trim()}
                    className="w-full"
                  >
                    {isExecuting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Orchestrating...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Execute Heavy Task
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real-time Progress */}
          {isExecuting && progress.agent_progress && (
            <Card>
              <CardHeader>
                <CardTitle>Agent Progress</CardTitle>
                <CardDescription>
                  Real-time status of all agents working on your task
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(progress.agent_progress).map(([agentId, status]) => (
                    <div key={agentId} className="flex items-center space-x-3 p-3 border rounded-lg">
                      {getAgentStatusIcon(status)}
                      <div className="flex-1">
                        <p className="font-medium">Agent {agentId}</p>
                        <p className={`text-sm ${getAgentStatusColor(status)}`}>
                          {status.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Heavy Tools</CardTitle>
              <CardDescription>
                Tools available to agents during task execution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(tools).map(([toolName, tool]) => (
                  <Card key={toolName} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{tool.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {tool.description}
                      </p>
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          {Object.keys(tool.parameters?.properties || {}).length} parameters
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Heavy Configuration</CardTitle>
              <CardDescription>
                Configure the heavy orchestration system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="configAgents">Number of Agents</Label>
                  <Input
                    id="configAgents"
                    type="number"
                    min="1"
                    max="8"
                    value={numAgents}
                    onChange={(e) => setNumAgents(parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    More agents provide deeper analysis but take longer
                  </p>
                </div>

                <div className="flex items-end">
                  <Button onClick={updateConfig} className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Update Configuration
                  </Button>
                </div>
              </div>

              {config && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Current Features</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(config.features || {}).map(([feature, enabled]) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <CheckCircle className={`h-3 w-3 ${enabled ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className={enabled ? 'text-foreground' : 'text-muted-foreground'}>
                          {feature.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {result ? (
            <div className="space-y-6">
              {/* Final Result */}
              <Card>
                <CardHeader>
                  <CardTitle>Synthesized Result</CardTitle>
                  <CardDescription>
                    Combined analysis from {result.metadata?.num_agents} agents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{result.response}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Execution Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Total Time</p>
                        <p className="text-lg font-bold">{result.execution_time?.toFixed(2)}s</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Successful</p>
                        <p className="text-lg font-bold">{result.metadata?.successful_agents}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Cpu className="h-4 w-4 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium">Synthesis</p>
                        <p className="text-lg font-bold">{result.synthesis_time?.toFixed(2)}s</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium">Tokens</p>
                        <p className="text-lg font-bold">{result.metadata?.total_tokens}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Individual Agent Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Individual Agent Results</CardTitle>
                  <CardDescription>
                    Detailed results from each agent
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.agents?.map((agent) => (
                      <div key={agent.agent_id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Agent {agent.agent_id}</h4>
                          <Badge variant={agent.status === 'completed' ? 'default' : 'destructive'}>
                            {agent.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Question:</strong> {agent.question}
                        </p>
                        {agent.result && (
                          <div className="text-sm">
                            <strong>Result:</strong>
                            <p className="mt-1 whitespace-pre-wrap">{agent.result}</p>
                          </div>
                        )}
                        {agent.error && (
                          <Alert className="mt-2">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{agent.error}</AlertDescription>
                          </Alert>
                        )}
                        {agent.execution_time && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Execution time: {agent.execution_time.toFixed(2)}s
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Results Yet</h3>
                <p className="text-muted-foreground">
                  Execute a heavy task to see comprehensive multi-agent analysis results here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

