'use client'

import { useState, useEffect, useRef } from 'react'
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
  Clock,
  CheckCircle,
  AlertCircle,
  Brain,
  Zap,
  Sparkles,
  MessageSquare,
  ArrowUp,
  Copy,
  Trash2,
  MoreVertical,
  Settings,
  Mic,
  MicOff,
  Image as ImageIcon,
  Paperclip
} from 'lucide-react'

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
      startTime: Date.now() - 1200000 // 20 minutes ago
    },
    {
      id: 2,
      name: 'Report Generation',
      progress: 78,
      status: 'running',
      startTime: Date.now() - 600000 // 10 minutes ago
    }
  ])
  const [recentTasks, setRecentTasks] = useState([
    {
      id: 3,
      name: 'Market Research',
      status: 'completed',
      duration: '5m 23s',
      completedAt: Date.now() - 3600000 // 1 hour ago
    },
    {
      id: 4,
      name: 'Email Campaign',
      status: 'completed',
      duration: '2m 45s',
      completedAt: Date.now() - 7200000 // 2 hours ago
    }
  ])
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef(null)
  const { toast } = useToast()

  useEffect(() => {
    // Add enhanced welcome message
    setMessages([{
      id: '1',
      type: 'bot',
      content: "👋 **Welcome to Crazy-Gary!** I'm your advanced autonomous AI agent.\n\nI can help you with:\n• **Complex data analysis** and processing\n• **Automated research** and report generation\n• **Multi-step workflows** with tool orchestration\n• **Real-time monitoring** and task management\n\nJust describe what you need, and I'll break it down into executable steps!",
      timestamp: Date.now(),
      enhanced: true
    }])
    }])
    
    // Fetch initial tasks
    fetchTasks()
    
    // Set up polling for task updates
    const interval = setInterval(fetchTasks, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const data = await response.json()
        const tasks = data.tasks || []
        
        setActiveTasks(tasks.filter(t => 
          ['planning', 'executing', 'verifying'].includes(t.status)
        ))
        
        setRecentTasks(tasks.filter(t => 
          ['completed', 'failed', 'stopped'].includes(t.status)
        ).slice(0, 5))
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    }
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
    setInputMessage('')
    setIsLoading(true)

    try {
      // Send message to agent chat endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: inputMessage,
          model: selectedModel
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        const botMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: data.response,
          timestamp: Date.now(),
          taskId: data.task_id
        }

        setMessages(prev => [...prev, botMessage])
        
        toast({
          title: "Task Created",
          description: `Started working on your request (Task: ${data.task_id.slice(0, 8)}...)`
        })
        
        // Refresh tasks
        fetchTasks()
      } else {
        throw new Error('Failed to send message')
      }
    } catch {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: Date.now(),
        error: true
      }
      
      setMessages(prev => [...prev, errorMessage])
      
      toast({
        title: "Error",
        description: "Failed to process your message",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleStopTask = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/stop`, {
        method: 'POST'
      })
      
      if (response.ok) {
        toast({
          title: "Task Stopped",
          description: `Task ${taskId.slice(0, 8)}... has been stopped`
        })
        fetchTasks()
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to stop task",
        variant: "destructive"
      })
    }
  }

  const handleViewTask = async (taskId) => {
    // This would open a detailed task view
    toast({
      title: "Task Details",
      description: `Viewing details for task ${taskId.slice(0, 8)}...`
    })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'planning':
        return <Brain className="h-4 w-4 text-blue-500" />
      case 'executing':
        return <Zap className="h-4 w-4 text-yellow-500 animate-pulse" />
      case 'verifying':
        return <Eye className="h-4 w-4 text-purple-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'stopped':
        return <Square className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'executing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'verifying':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'stopped':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6">
      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="h-5 w-5" />
                  <span>Crazy-Gary Agent Chat</span>
                </CardTitle>
                <CardDescription>
                  Describe any task and I'll plan, execute, and verify it autonomously
                </CardDescription>
              </div>
              
              <div className="flex items-center space-x-2">
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-oss-120b">GPT-OSS 120B</SelectItem>
                    <SelectItem value="gpt-oss-20b">GPT-OSS 20B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : message.error
                          ? 'bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-200'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.type === 'bot' ? (
                          <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        ) : (
                          <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          {message.taskId && (
                            <div className="mt-2 text-xs opacity-70">
                              Task ID: {message.taskId.slice(0, 8)}...
                            </div>
                          )}
                          <div className="mt-1 text-xs opacity-70">
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-4 w-4" />
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe what you'd like me to work on..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={isLoading || !inputMessage.trim()}
                  size="sm"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Task Sidebar */}
      <div className="w-80 space-y-4">
        {/* Active Tasks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Active Tasks</CardTitle>
            <CardDescription>Currently running tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active tasks
              </p>
            ) : (
              activeTasks.map((task) => (
                <div key={task.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(task.status)}
                      <span className="text-sm font-medium truncate">
                        {task.title}
                      </span>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                      {task.status}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {task.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {task.steps?.length || 0} steps
                    </span>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewTask(task.id)}
                        className="h-6 px-2"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStopTask(task.id)}
                        className="h-6 px-2"
                      >
                        <Square className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        
        {/* Recent Tasks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Tasks</CardTitle>
            <CardDescription>Recently completed tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent tasks
              </p>
            ) : (
              recentTasks.map((task) => (
                <div key={task.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(task.status)}
                      <span className="text-sm font-medium truncate">
                        {task.title}
                      </span>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                      {task.status}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {task.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {task.completed_at ? formatTime(task.completed_at * 1000) : 'N/A'}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewTask(task.id)}
                      className="h-6 px-2"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

