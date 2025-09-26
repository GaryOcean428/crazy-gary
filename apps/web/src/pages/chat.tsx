'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Play,
  Square,
  Eye,
  EyeOff,
  Brain,
  Sparkles,
  MessageSquare,
  ArrowUp,
  Copy,
  Trash2,
  MoreVertical,
  Settings,
  Mic,
  MicOff,
  ImageIcon,
  Paperclip,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  Cpu
} from '@/lib/icons'


export function Chat() {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gpt-oss-120b')
  const [activeTasks, setActiveTasks] = useState([
    {
      id: 1,
      name: 'Data Analysis Pipeline',
      progress: 45,
      status: 'running',
      startTime: Date.now() - 1200000, // 20 minutes ago
      description: 'Processing customer data for quarterly report'
    },
    {
      id: 2,
      name: 'Report Generation',
      progress: 78,
      status: 'running',
      startTime: Date.now() - 600000, // 10 minutes ago
      description: 'Creating comprehensive business intelligence report'
    }
  ])
  const [recentTasks, _setRecentTasks] = useState([
    {
      id: 3,
      name: 'Market Research Analysis',
      status: 'completed',
      duration: '5m 23s',
      completedAt: Date.now() - 3600000, // 1 hour ago
      accuracy: 98
    },
    {
      id: 4,
      name: 'Email Campaign Optimization',
      status: 'completed',
      duration: '2m 45s',
      completedAt: Date.now() - 7200000, // 2 hours ago
      accuracy: 95
    },
    {
      id: 5,
      name: 'Database Migration',
      status: 'failed',
      duration: '12m 15s',
      completedAt: Date.now() - 10800000, // 3 hours ago
      error: 'Connection timeout'
    }
  ])
  const [isListening, setIsListening] = useState(false)
  const [agentMonologue, setAgentMonologue] = useState([])
  const [currentTaskId, setCurrentTaskId] = useState(null)
  const [showAgentThoughts, setShowAgentThoughts] = useState(true)
  const messagesEndRef = useRef(null)
  const agentMonitoringCleanupRef = useRef(null)
  const { toast } = useToast()

  const fetchAgentEvents = useCallback(async (taskId) => {
    try {
      const response = await fetch(`/api/observability/events/task/${taskId}`)
      const data = await response.json()
      
      if (data.success && data.events.length > 0) {
        // Filter for monologue and planning events
        const thoughts = data.events.filter(event => 
          event.event_type === 'monologue' || 
          event.event_type === 'planning' || 
          event.event_type === 'reasoning'
        )
        
        setAgentMonologue(prev => {
          const newThoughts = thoughts.filter(thought => 
            !prev.some(existing => existing.id === thought.id)
          )
          return [...prev, ...newThoughts].slice(-20) // Keep last 20 thoughts
        })
      }
    } catch (error) {
      console.error('Failed to fetch agent events:', error)
    }
  }, [])

  const startAgentMonitoring = useCallback(() => {
    try {
      // Clear any existing monitoring
      if (agentMonitoringCleanupRef.current) {
        agentMonitoringCleanupRef.current()
      }

      // Poll for real-time agent events
      const eventInterval = setInterval(async () => {
        if (currentTaskId) {
          await fetchAgentEvents(currentTaskId)
        }
      }, 2000)
      
      // Store cleanup function
      agentMonitoringCleanupRef.current = () => clearInterval(eventInterval)
    } catch (error) {
      console.error('Failed to start agent monitoring:', error)
    }
  }, [currentTaskId, fetchAgentEvents])

  const stopAgentMonitoring = useCallback(() => {
    if (agentMonitoringCleanupRef.current) {
      agentMonitoringCleanupRef.current()
      agentMonitoringCleanupRef.current = null
    }
  }, [])

  useEffect(() => {
    // Add enhanced welcome message
    setMessages([{
      id: '1',
      type: 'bot',
      content: "👋 **Welcome to Crazy-Gary!** I'm your advanced autonomous AI agent.\n\nI can help you with:\n• **Complex data analysis** and processing\n• **Automated research** and report generation\n• **Multi-step workflows** with tool orchestration\n• **Real-time monitoring** and task management\n\nJust describe what you need, and I'll break it down into executable steps!",
      timestamp: Date.now(),
      enhanced: true
    }])
    
    // Simulate task updates
    const interval = setInterval(() => {
      setActiveTasks(prev => prev.map(task => ({
        ...task,
        progress: Math.min(100, task.progress + Math.random() * 5)
      })))
    }, 3000)
    
    // Start real-time monitoring for agent events
    startAgentMonitoring()
    
    return () => {
      clearInterval(interval)
      stopAgentMonitoring()
    }
  }, [startAgentMonitoring, stopAgentMonitoring])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    const messageToSend = inputMessage
    setInputMessage('')
    setIsLoading(true)

    try {
      // Create a task using the agent API
      const taskResponse = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `User Request: ${messageToSend.substring(0, 50)}...`,
          description: messageToSend,
          model: selectedModel
        })
      })
      
      const taskData = await taskResponse.json()
      
      if (taskData.task_id) {
        setCurrentTaskId(taskData.task_id)
        
        // Start the task
        await fetch(`/api/tasks/${taskData.task_id}/start`, {
          method: 'POST'
        })
        
        // Add agent thinking message
        const thinkingMessage = {
          id: (Date.now() + 1).toString(),
          type: 'agent-thinking',
          content: `🤔 I'm analyzing your request and creating an execution plan...`,
          timestamp: Date.now() + 1,
          taskId: taskData.task_id
        }
        
        setMessages(prev => [...prev, thinkingMessage])
        
        // Simulate agent response with real task integration
        setTimeout(async () => {
          const botMessage = {
            id: (Date.now() + 2).toString(),
            type: 'bot',
            content: `I understand you want me to: "${messageToSend}"\n\n**My Plan:**\n\n**Step 1:** Analyze requirements and available tools\n**Step 2:** Create detailed execution strategy\n**Step 3:** Execute with appropriate tools\n**Step 4:** Verify results and provide summary\n\n*I'm now executing this plan autonomously. You can monitor my progress in real-time!*`,
            timestamp: Date.now() + 2,
            actions: ['view_progress', 'modify', 'cancel'],
            taskId: taskData.task_id
          }
          
          setMessages(prev => [...prev, botMessage])
          setIsLoading(false)
          
          toast({
            title: "Task started",
            description: `Created task ${taskData.task_id.substring(0, 8)} - monitoring progress`,
            duration: 3000,
          })
        }, 3000)
      } else {
        // Fallback to original behavior
        setTimeout(() => {
          const botMessage = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            content: `I understand you want me to: "${messageToSend}"\n\nLet me break this down into actionable steps:\n\n**Step 1:** Analyze requirements\n**Step 2:** Plan execution strategy\n**Step 3:** Execute with tools\n**Step 4:** Verify results\n\nShall I proceed with this task?`,
            timestamp: Date.now() + 1,
            actions: ['approve', 'modify', 'cancel']
          }
          
          setMessages(prev => [...prev, botMessage])
          setIsLoading(false)
          
          toast({
            title: "Task planning complete",
            description: "Ready to execute your request",
            duration: 3000,
          })
        }, 2000)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setIsLoading(false)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (startTime) => {
    const duration = Date.now() - startTime
    const minutes = Math.floor(duration / 60000)
    const seconds = Math.floor((duration % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const MessageBubble = ({ message }) => (
    <div className={`flex gap-3 mb-6 group ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
      {(message.type === 'bot' || message.type === 'agent-thinking') && (
        <div className="relative">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full shadow-soft ${
            message.type === 'agent-thinking' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-primary'
          }`}>
            {message.type === 'agent-thinking' ? (
              <Brain className="w-5 h-5 text-white animate-pulse" />
            ) : (
              <Bot className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse"></div>
        </div>
      )}
      
      <div className={`max-w-2xl ${message.type === 'user' ? 'order-first' : ''}`}>
        <div className={`p-4 rounded-2xl shadow-soft transition-all duration-200 group-hover:shadow-lg ${
          message.type === 'user' 
            ? 'bg-primary text-primary-foreground' 
            : message.type === 'agent-thinking'
            ? 'bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200'
            : 'bg-card border border-border/50'
        }`}>
          <div className="space-y-2">
            {message.content.split('\n').map((line, i) => (
              <p key={i} className={`${line.startsWith('**') ? 'font-semibold' : ''} ${line.startsWith('•') ? 'ml-4' : ''} ${
                message.type === 'agent-thinking' ? 'text-purple-800 italic' : ''
              }`}>
                {line.replace(/\*\*/g, '')}
              </p>
            ))}
          </div>
          
          {message.actions && (
            <div className="flex gap-2 mt-4 pt-3 border-t border-border/20">
              {message.actions.includes('approve') && (
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve
                </Button>
              )}
              {message.actions.includes('view_progress') && (
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Eye className="w-4 h-4 mr-1" />
                  View Progress
                </Button>
              )}
              {message.actions.includes('modify') && (
                <Button size="sm" variant="outline">
                  <Settings className="w-4 h-4 mr-1" />
                  Modify
                </Button>
              )}
              {message.actions.includes('cancel') && (
                <Button size="sm" variant="destructive">
                  <Square className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              )}
            </div>
          )}
          
          {message.taskId && (
            <div className="mt-3 pt-3 border-t border-border/20">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className="w-3 h-3" />
                <span>Task ID: {message.taskId.substring(0, 8)}</span>
                <Badge variant="secondary" className="text-xs">
                  Monitoring
                </Badge>
              </div>
            </div>
          )}
        </div>
        
        <div className={`flex items-center gap-2 mt-2 text-xs text-muted-foreground ${
          message.type === 'user' ? 'justify-end' : 'justify-start'
        }`}>
          <span>{formatTime(message.timestamp)}</span>
          {message.type === 'user' && (
            <Button variant="ghost" size="sm" className="h-auto p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Copy className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
      
      {message.type === 'user' && (
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-secondary shadow-soft">
          <User className="w-5 h-5 text-foreground" />
        </div>
      )}
    </div>
  )

  const AgentThoughts = () => (
    <Card className="glass-effect">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-500 animate-pulse" />
            <div>
              <CardTitle className="text-lg">Agent Thoughts</CardTitle>
              <CardDescription>Real-time agent reasoning and planning</CardDescription>
            </div>
          </div>
          <Button 
            onClick={() => setShowAgentThoughts(!showAgentThoughts)}
            variant="ghost" 
            size="sm"
          >
            {showAgentThoughts ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showAgentThoughts && (
          <ScrollArea className="h-[300px]">
            {agentMonologue.length > 0 ? (
              <div className="space-y-3">
                {agentMonologue.slice(-10).map((thought) => (
                  <div key={thought.id} className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                    <div className="flex items-start space-x-2">
                      <Brain className="w-4 h-4 text-purple-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-purple-800 italic">{thought.message}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-purple-600">
                          <span>{formatTime(thought.timestamp)}</span>
                          <Badge variant="outline" className="text-xs">
                            {thought.event_type}
                          </Badge>
                        </div>
                        {thought.data?.reasoning && (
                          <p className="text-xs text-purple-600 mt-1">
                            💭 {thought.data.reasoning}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Agent thoughts will appear here during task execution
              </p>
            )}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)] animate-in fade-in slide-up">
      {/* Main Chat Area */}
      <div className="lg:col-span-2 flex flex-col">
        <Card className="flex-1 flex flex-col glass-effect">
          <CardHeader className="pb-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="p-2 bg-gradient-primary rounded-lg shadow-soft">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500 animate-pulse" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Crazy-Gary Agent Chat</CardTitle>
                  <CardDescription className="text-base">
                    Autonomous agent with real-time observability and monitoring
                  </CardDescription>
                </div>
              </div>
              
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-48 border-border/50">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-4 w-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-oss-120b">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>GPT-OSS 120B</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="claude-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Claude-3 Sonnet</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="gpt-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>GPT-4 Turbo</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-primary">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-card border border-border/50 p-4 rounded-2xl shadow-soft">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-muted-foreground">Crazy-Gary is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-6 border-t border-border/50 bg-muted/20">
              <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe what you'd like me to work on..."
                    disabled={isLoading}
                    className="pr-24 py-3 text-base resize-none bg-background border-border/50 focus:border-primary transition-colors"
                  />
                  <div className="absolute right-2 top-2 flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setIsListening(!isListening)}
                    >
                      {isListening ? (
                        <MicOff className="h-4 w-4 text-red-500" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="lg"
                  className="bg-gradient-primary hover:shadow-lg transition-all duration-200 px-6"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUp className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar with Tasks and Agent Thoughts */}
      <div className="lg:col-span-2 space-y-6">
        {/* Agent Thoughts */}
        <AgentThoughts />
        
        {/* Active Tasks */}
        <Card className="glass-effect">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">Active Tasks</CardTitle>
                <CardDescription>Currently running autonomous tasks</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeTasks.length > 0 ? (
              activeTasks.map((task) => (
                <div key={task.id} className="p-3 rounded-lg bg-muted/30 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{task.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                    </div>
                    {getStatusIcon(task.status)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Progress</span>
                      <span>{Math.round(task.progress)}%</span>
                    </div>
                    <Progress value={task.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Duration: {formatDuration(task.startTime)}</span>
                      <Badge variant="secondary" className="text-xs">
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No active tasks</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card className="glass-effect">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-chart-1" />
              <div>
                <CardTitle className="text-lg">Recent Tasks</CardTitle>
                <CardDescription>Recently completed tasks</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <div key={task.id} className="p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm truncate">{task.name}</p>
                    {getStatusIcon(task.status)}
                  </div>
                  
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Duration: {task.duration}</span>
                      <Badge 
                        variant={task.status === 'completed' ? 'default' : 'destructive'} 
                        className="text-xs"
                      >
                        {task.status}
                      </Badge>
                    </div>
                    {task.accuracy && (
                      <div className="flex justify-between">
                        <span>Accuracy: {task.accuracy}%</span>
                      </div>
                    )}
                    {task.error && (
                      <div className="text-red-500 text-xs">
                        Error: {task.error}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No recent tasks</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}