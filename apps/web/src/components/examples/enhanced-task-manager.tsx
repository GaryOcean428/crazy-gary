import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { 
  TaskManagerCompoundComponents,
  PolymorphicComponents,
  RenderPropPatterns,
  HeadlessComponents,
  SlotPatterns,
  HOCPatterns,
  CompositionUtils
} from '../patterns'

// Task types
interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  priority: 'low' | 'medium' | 'high'
  assignee?: string
  dueDate?: string
  tags: string[]
  progress: number
  createdAt: Date
  updatedAt: Date
}

interface TaskFilters {
  status?: Task['status']
  priority?: Task['priority']
  assignee?: string
  search?: string
}

// Enhanced Task Manager using composition patterns
const EnhancedTaskManager = HOCPatterns.withErrorBoundary(
  HOCPatterns.withAuth(
    function TaskManager({ user }: { user?: any }) {
      const [tasks, setTasks] = useState<Task[]>([
        {
          id: '1',
          title: 'Implement user authentication',
          description: 'Add login/logout functionality with JWT tokens',
          status: 'running',
          priority: 'high',
          assignee: 'John Doe',
          dueDate: '2024-01-15',
          tags: ['backend', 'security'],
          progress: 65,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-10')
        },
        {
          id: '2',
          title: 'Design responsive layout',
          description: 'Create mobile-first responsive design for the dashboard',
          status: 'pending',
          priority: 'medium',
          assignee: 'Jane Smith',
          dueDate: '2024-01-20',
          tags: ['frontend', 'design'],
          progress: 0,
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-05')
        },
        {
          id: '3',
          title: 'Write unit tests',
          description: 'Add comprehensive test coverage for all components',
          status: 'completed',
          priority: 'low',
          assignee: 'Bob Wilson',
          tags: ['testing', 'quality'],
          progress: 100,
          createdAt: new Date('2023-12-28'),
          updatedAt: new Date('2024-01-08')
        }
      ])

      const [filters, setFilters] = useState<TaskFilters>({})
      const [selectedTask, setSelectedTask] = useState<Task | null>(null)

      // Using composition utilities
      const { 
        state: filterState, 
        updateState: updateFilters 
      } = CompositionUtils.useComposedState('filters', filters)

      // Filter and sort tasks
      const filteredTasks = React.useMemo(() => {
        return tasks.filter(task => {
          if (filterState.status && task.status !== filterState.status) return false
          if (filterState.priority && task.priority !== filterState.priority) return false
          if (filterState.assignee && task.assignee !== filterState.assignee) return false
          if (filterState.search && !task.title.toLowerCase().includes(filterState.search.toLowerCase())) return false
          return true
        })
      }, [tasks, filterState])

      // Task actions using event callbacks
      const updateTaskStatus = useCallback((taskId: string, status: Task['status']) => {
        setTasks(prev => prev.map(task => 
          task.id === taskId 
            ? { ...task, status, updatedAt: new Date() }
            : task
        ))
      }, [])

      const deleteTask = useCallback((taskId: string) => {
        setTasks(prev => prev.filter(task => task.id !== taskId))
        if (selectedTask?.id === taskId) {
          setSelectedTask(null)
        }
      }, [selectedTask])

      return (
        <div className="space-y-6 p-6">
          {/* Header using Slots Pattern */}
          <SlotPatterns.Named name="task-manager-header">
            <div className="flex items-center justify-between">
              <div>
                <PolymorphicComponents.Heading level={1}>Task Manager</PolymorphicComponents.Heading>
                <PolymorphicComponents.Text color="muted" className="mt-1">
                  Manage and track your team's tasks efficiently
                </PolymorphicComponents.Text>
              </div>
              <div className="flex space-x-2">
                <Button>Add Task</Button>
                <Button variant="outline">Import</Button>
                <Button variant="outline">Export</Button>
              </div>
            </div>
          </SlotPatterns.Named>

          {/* Task List using Compound Components */}
          <TaskManagerCompoundComponents.Header
            title="Tasks"
            description={`${filteredTasks.length} of ${tasks.length} tasks`}
            actions={
              <RenderPropPatterns.Toggle initial={false}>
                {({ on, toggle }) => (
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant={on ? "default" : "outline"} 
                      size="sm"
                      onClick={toggle}
                    >
                      {on ? 'Hide Filters' : 'Show Filters'}
                    </Button>
                    <Button variant="outline" size="sm">
                      Sort
                    </Button>
                  </div>
                )}
              </RenderPropPatterns.Toggle>
            }
          />

          {/* Filters using Headless Components */}
          <RenderPropPatterns.Conditional 
            condition={() => true} // Could be controlled by toggle above
            fallback={null}
          >
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Status</label>
                  <HeadlessComponents.Select
                    value={filterState.status || ''}
                    onValueChange={(value) => updateFilters('status', value || undefined)}
                    placeholder="All Statuses"
                  >
                    {({ value, getTriggerProps, getOptionProps }) => (
                      <>
                        <Button variant="outline" {...getTriggerProps()}>
                          {value || 'All Statuses'}
                        </Button>
                        <div className="hidden">
                          {['pending', 'running', 'completed', 'failed'].map(status => (
                            <div key={status} {...getOptionProps({ value: status, label: status })}>
                              {status}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </HeadlessComponents.Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Priority</label>
                  <HeadlessComponents.Select
                    value={filterState.priority || ''}
                    onValueChange={(value) => updateFilters('priority', value || undefined)}
                    placeholder="All Priorities"
                  >
                    {({ value, getTriggerProps, getOptionProps }) => (
                      <>
                        <Button variant="outline" {...getTriggerProps()}>
                          {value || 'All Priorities'}
                        </Button>
                        <div className="hidden">
                          {['low', 'medium', 'high'].map(priority => (
                            <div key={priority} {...getOptionProps({ value: priority, label: priority })}>
                              {priority}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </HeadlessComponents.Select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1 block">Search</label>
                  <Input
                    placeholder="Search tasks..."
                    value={filterState.search || ''}
                    onChange={(e) => updateFilters('search', e.target.value)}
                  />
                </div>
              </div>
            </Card>
          </RenderPropPatterns.Conditional>

          {/* Task Grid using Polymorphic Components */}
          <SlotPatterns.FlexibleLayout
            layout="sidebar-main"
            className="min-h-[600px]"
          >
            {/* Task List */}
            <div className="flex-1">
              <PolymorphicComponents.Grid cols={1} gap="lg">
                <TaskManagerCompoundComponents.List>
                  {filteredTasks.map(task => (
                    <TaskManagerCompoundComponents.Item
                      key={task.id}
                      task={task}
                      selected={selectedTask?.id === task.id}
                      onSelect={setSelectedTask}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <PolymorphicComponents.Text weight="semibold" size="lg">
                              {task.title}
                            </PolymorphicComponents.Text>
                            <PolymorphicComponents.Text color="muted" size="sm" className="mt-1">
                              {task.description}
                            </PolymorphicComponents.Text>
                          </div>
                          <Badge 
                            variant={
                              task.status === 'completed' ? 'default' :
                              task.status === 'running' ? 'secondary' :
                              task.status === 'failed' ? 'destructive' : 'outline'
                            }
                          >
                            {task.status}
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <span>Priority:</span>
                            <Badge 
                              variant={
                                task.priority === 'high' ? 'destructive' :
                                task.priority === 'medium' ? 'default' : 'secondary'
                              }
                              className="text-xs"
                            >
                              {task.priority}
                            </Badge>
                          </div>
                          {task.assignee && (
                            <div className="flex items-center space-x-1">
                              <span>Assignee:</span>
                              <span className="font-medium">{task.assignee}</span>
                            </div>
                          )}
                          {task.dueDate && (
                            <div className="flex items-center space-x-1">
                              <span>Due:</span>
                              <span className="font-medium">{task.dueDate}</span>
                            </div>
                          )}
                        </div>

                        {task.progress > 0 && task.status === 'running' && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{task.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1">
                          {task.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <PolymorphicComponents.Text size="sm" color="muted">
                            Updated {task.updatedAt.toLocaleDateString()}
                          </PolymorphicComponents.Text>
                          <div className="flex space-x-1">
                            {task.status === 'pending' && (
                              <Button 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  updateTaskStatus(task.id, 'running')
                                }}
                              >
                                Start
                              </Button>
                            )}
                            {task.status === 'running' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  updateTaskStatus(task.id, 'completed')
                                }}
                              >
                                Complete
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteTask(task.id)
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TaskManagerCompoundComponents.Item>
                  ))}
                </TaskManagerCompoundComponents.List>
              </PolymorphicComponents.Grid>
            </div>

            {/* Task Details Sidebar */}
            <div className="w-80 border-l pl-6">
              {selectedTask ? (
                <TaskDetails task={selectedTask} onUpdate={updateTaskStatus} />
              ) : (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    Select a task to view details
                  </CardContent>
                </Card>
              )}
            </div>
          </SlotPatterns.FlexibleLayout>
        </div>
      )
    }
  )
)

// Task Details Component using Render Props
const TaskDetails = ({ task, onUpdate }: { task: Task; onUpdate: (id: string, status: Task['status']) => void }) => {
  const [isEditing, setIsEditing] = useState(false)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{task.title}</CardTitle>
        <CardDescription>{task.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RenderPropPatterns.FormRender
          initialValues={{ title: task.title, description: task.description }}
          onSubmit={(values) => {
            console.log('Update task:', values)
            setIsEditing(false)
          }}
        >
          {({ values, handleChange, handleSubmit, isSubmitting }) => (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={values.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={values.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  disabled={!isEditing}
                  rows={3}
                />
              </div>
              <div className="flex space-x-2">
                {!isEditing ? (
                  <Button type="button" onClick={() => setIsEditing(true)} size="sm">
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button type="submit" disabled={isSubmitting} size="sm">
                      Save
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </form>
          )}
        </RenderPropPatterns.FormRender>
        
        <div className="pt-4 border-t">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={
                task.status === 'completed' ? 'default' :
                task.status === 'running' ? 'secondary' :
                task.status === 'failed' ? 'destructive' : 'outline'
              }>
                {task.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Priority:</span>
              <Badge variant={
                task.priority === 'high' ? 'destructive' :
                task.priority === 'medium' ? 'default' : 'secondary'
              }>
                {task.priority}
              </Badge>
            </div>
            {task.assignee && (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Assignee:</span>
                <span className="text-sm">{task.assignee}</span>
              </div>
            )}
            {task.dueDate && (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Due Date:</span>
                <span className="text-sm">{task.dueDate}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm font-medium">Progress:</span>
              <span className="text-sm">{task.progress}%</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-2 pt-4">
          {task.status === 'pending' && (
            <Button onClick={() => onUpdate(task.id, 'running')} size="sm" className="flex-1">
              Start Task
            </Button>
          )}
          {task.status === 'running' && (
            <Button onClick={() => onUpdate(task.id, 'completed')} size="sm" className="flex-1">
              Complete
            </Button>
          )}
          <Button variant="destructive" size="sm">
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default EnhancedTaskManager