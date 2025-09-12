import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { 
  Plus, 
  Play, 
  Pause, 
  Square, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Brain,
  Zap,
  FileText,
  Settings
} from 'lucide-react'

export function TaskManager({ currentTask, setCurrentTask }) {
  const [tasks, setTasks] = useState([])
  const [newTaskOpen, setNewTaskOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    model: 'gpt-oss-120b'
  })
  const [selectedTask, setSelectedTask] = useState(null)
  const { toast } = useToast()

  useEffect(() => {
    // Load mock tasks
    setTasks([
      {
        id: 1,
        title: "Analyze quarterly sales data",
        description: "Review Q3 sales performance and identify trends",
        status: "completed",
        priority: "high",
        model: "gpt-oss-120b",
        created: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        completed: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        duration: "1m 45s",
        result: "Analysis complete. Revenue increased 15% compared to Q2."
      },
      {
        id: 2,
        title: "Generate marketing content",
        description: "Create social media posts for product launch",
        status: "running",
        priority: "medium",
        model: "gpt-oss-20b",
        created: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        progress: 65
      },
      {
        id: 3,
        title: "Research competitor analysis",
        description: "Gather information about top 5 competitors",
        status: "pending",
        priority: "low",
        model: "gpt-oss-120b",
        created: new Date(Date.now() - 1000 * 60 * 5).toISOString()
      }
    ])
  }, [])

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive"
      })
      return
    }

    const task = {
      id: Date.now(),
      ...newTask,
      status: 'pending',
      created: new Date().toISOString()
    }

    setTasks(prev => [task, ...prev])
    setNewTask({ title: '', description: '', priority: 'medium', model: 'gpt-oss-120b' })
    setNewTaskOpen(false)
    
    toast({
      title: "Task Created",
      description: `"${task.title}" has been added to the queue`
    })
  }

  const handleStartTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, status: 'running', started: new Date().toISOString() }
        : t
    ))
    
    setCurrentTask(task)
    
    toast({
      title: "Task Started",
      description: `"${task.title}" is now running`
    })

    // Simulate task execution
    setTimeout(() => {
      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { 
              ...t, 
              status: 'completed', 
              completed: new Date().toISOString(),
              duration: '2m 15s',
              result: 'Task completed successfully with AI assistance.'
            }
          : t
      ))
      setCurrentTask(null)
      
      toast({
        title: "Task Completed",
        description: `"${task.title}" has finished successfully`
      })
    }, 5000)
  }

  const handleStopTask = (taskId) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, status: 'stopped', stopped: new Date().toISOString() }
        : t
    ))
    setCurrentTask(null)
    
    toast({
      title: "Task Stopped",
      description: "Task execution has been halted"
    })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <Play className="h-4 w-4 text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'stopped':
        return <Square className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      'running': 'default',
      'completed': 'default',
      'pending': 'secondary',
      'stopped': 'destructive'
    }
    return variants[status] || 'secondary'
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Manager</h1>
          <p className="text-muted-foreground">
            Create and manage autonomous AI tasks
          </p>
        </div>
        
        <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Define a new agentic task for AI execution
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Enter task title..."
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Describe what you want the AI to accomplish..."
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select 
                    value={newTask.priority} 
                    onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Model</label>
                  <Select 
                    value={newTask.model} 
                    onValueChange={(value) => setNewTask(prev => ({ ...prev, model: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-oss-120b">GPT-OSS 120B</SelectItem>
                      <SelectItem value="gpt-oss-20b">GPT-OSS 20B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setNewTaskOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTask}>
                Create Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Task List */}
      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(task.status)}
                  <div>
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {task.description}
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusBadge(task.status)}>
                    {task.status}
                  </Badge>
                  
                  {task.status === 'pending' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleStartTask(task.id)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {task.status === 'running' && (
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleStopTask(task.id)}
                    >
                      <Square className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Brain className="h-3 w-3" />
                    <span>{task.model}</span>
                  </div>
                  
                  <div className={`flex items-center space-x-1 ${getPriorityColor(task.priority)}`}>
                    <Zap className="h-3 w-3" />
                    <span className="capitalize">{task.priority}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(task.created).toLocaleString()}</span>
                  </div>
                </div>
                
                {task.duration && (
                  <div className="flex items-center space-x-1">
                    <span>Duration: {task.duration}</span>
                  </div>
                )}
              </div>
              
              {task.result && (
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">Result</span>
                  </div>
                  <p className="text-sm">{task.result}</p>
                </div>
              )}
              
              {task.status === 'running' && task.progress && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">{task.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {tasks.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-medium">No tasks yet</h3>
                <p className="text-muted-foreground">
                  Create your first agentic task to get started
                </p>
                <Button onClick={() => setNewTaskOpen(true)} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Task
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

