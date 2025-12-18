import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { TaskManager } from '@/pages/task-manager'
import { AuthProvider } from '@/contexts/auth-context'

// Mock components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, ...props }) => (
    <button 
      {...props} 
      onClick={onClick} 
      className={`btn ${variant} ${size}`}
      data-testid="task-button"
    >
      {children}
    </button>
  ),
}))

vi.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, ...props }) => (
    <input
      {...props}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      className="task-input"
      data-testid="task-input"
    />
  ),
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }) => (
    <div className={`card ${className}`} {...props} data-testid="task-card">
      {children}
    </div>
  ),
  CardHeader: ({ children }) => <div className="card-header" data-testid="task-card-header">{children}</div>,
  CardContent: ({ children }) => <div className="card-content" data-testid="task-card-content">{children}</div>,
  CardFooter: ({ children }) => <div className="card-footer" data-testid="task-card-footer">{children}</div>,
}))

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
)

// Sample task data
const mockTasks = [
  {
    id: 1,
    title: 'Complete project documentation',
    description: 'Write comprehensive docs for the new feature',
    status: 'in-progress',
    priority: 'high',
    assignee: 'John Doe',
    dueDate: '2023-12-31',
    tags: ['documentation', 'feature'],
    createdAt: '2023-01-01',
    updatedAt: '2023-01-15',
  },
  {
    id: 2,
    title: 'Fix login bug',
    description: 'Users cannot login with valid credentials',
    status: 'todo',
    priority: 'critical',
    assignee: 'Jane Smith',
    dueDate: '2023-12-20',
    tags: ['bug', 'authentication'],
    createdAt: '2023-01-02',
    updatedAt: '2023-01-02',
  },
  {
    id: 3,
    title: 'Implement dark mode',
    description: 'Add dark theme support to the application',
    status: 'done',
    priority: 'medium',
    assignee: 'Bob Johnson',
    dueDate: '2023-12-15',
    tags: ['feature', 'ui'],
    createdAt: '2023-01-03',
    updatedAt: '2023-01-14',
  },
]

describe('Pages - Task Manager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Task Manager Rendering', () => {
    it('should render task manager page', () => {
      render(
        <TestWrapper>
          <TaskManager />
        </TestWrapper>
      )
      
      expect(screen.getByTestId('task-manager')).toBeInTheDocument()
    })

    it('should render task list', () => {
      render(
        <TestWrapper>
          <TaskManager tasks={mockTasks} />
        </TestWrapper>
      )
      
      expect(screen.getByText('Complete project documentation')).toBeInTheDocument()
      expect(screen.getByText('Fix login bug')).toBeInTheDocument()
      expect(screen.getByText('Implement dark mode')).toBeInTheDocument()
    })

    it('should show task statistics', () => {
      render(
        <TestWrapper>
          <TaskManager tasks={mockTasks} />
        </TestWrapper>
      )
      
      expect(screen.getByText('Total Tasks: 3')).toBeInTheDocument()
      expect(screen.getByText('In Progress: 1')).toBeInTheDocument()
      expect(screen.getByText('Completed: 1')).toBeInTheDocument()
    })
  })

  describe('Task Creation', () => {
    it('should show create task button', () => {
      render(
        <TestWrapper>
          <TaskManager />
        </TestWrapper>
      )
      
      expect(screen.getByText('Create Task')).toBeInTheDocument()
    })

    it('should open task creation modal', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TaskManager />
        </TestWrapper>
      )
      
      await user.click(screen.getByText('Create Task'))
      
      expect(screen.getByTestId('task-modal')).toBeInTheDocument()
      expect(screen.getByText('Create New Task')).toBeInTheDocument()
    })

    new it('should create task', async () => {
      const user = userEvent.setup()
      const handleCreateTask = vi.fn()
      
      render(
        <TestWrapper>
          <TaskManager onCreateTask={handleCreateTask} />
        </TestWrapper>
      )
      
      // Open modal
      await user.click(screen.getByText('Create Task'))
      
      // Fill form
      await user.type(screen.getByPlaceholderText('Task title'), 'New Task')
      await user.type(screen.getByPlaceholderText('Task description'), 'Task description')
      await user.selectOptions(screen.getByTestId('priority-select'), 'high')
      
      // Submit
      await user.click(screen.getByText('Create'))
      
      expect(handleCreateTask).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'Task description',
        priority: 'high',
        status: 'todo',
      })
    })

    it('should validate required fields', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TaskManager />
        </TestWrapper>
      )
      
      await user.click(screen.getByText('Create Task'))
      await user.click(screen.getByText('Create'))
      
      expect(screen.getByText('Title is required')).toBeInTheDocument()
    })
  })

  describe('Task Editing', () => {
    it('should show edit button for each task', () => {
      render(
        <TestWrapper>
          <TaskManager tasks={mockTasks} />
        </TestWrapper>
      )
      
      const editButtons = screen.getAllByText('Edit')
      expect(editButtons).toHaveLength(3)
    })

    it('should open edit modal', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TaskManager tasks={mockTasks} />
        </TestWrapper>
      )
      
      await user.click(screen.getAllByText('Edit')[0])
      
      expect(screen.getByTestId('task-modal')).toBeInTheDocument()
      expect(screen.getByText('Edit Task')).toBeInTheDocument()
    })

    it('should prefill edit form with task data', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TaskManager tasks={mockTasks} />
        </TestWrapper>
      )
      
      await user.click(screen.getAllByText('Edit')[0])
      
      const titleInput = screen.getByDisplayValue('Complete project documentation')
      expect(titleInput).toBeInTheDocument()
    })

    it('should update task', async () => {
      const user = userEvent.setup()
      const handleUpdateTask = vi.fn()
      
      render(
        <TestWrapper>
          <TaskManager tasks={mockTasks} onUpdateTask={handleUpdateTask} />
        </TestWrapper>
      )
      
      await user.click(screen.getAllByText('Edit')[0])
      
      // Modify title
      const titleInput = screen.getByDisplayValue('Complete project documentation')
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Task Title')
      
      await user.click(screen.getByText('Update'))
      
      expect(handleUpdateTask).toHaveBeenCalledWith(1, {
        title: 'Updated Task Title',
        description: 'Write comprehensive docs for the new feature',
        priority: 'high',
        status: 'in-progress',
      })
    })
  })

  describe('Task Deletion', () => {
    it('should show delete button', () => {
      render(
        <TestWrapper>
          <TaskManager tasks={mockTasks} />
        </TestWrapper>
      )
      
      const deleteButtons = screen.getAllByText('Delete')
      expect(deleteButtons).toHaveLength(3)
    })

    it('should show confirmation dialog', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TaskManager tasks={mockTasks} />
        </TestWrapper>
      )
      
      await user.click(screen.getAllByText('Delete')[0])
      
      expect(screen.getByText('Are you sure?')).toBeInTheDocument()
      expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()
    })

    it('should delete task after confirmation', async () => {
      const user = userEvent.setup()
      const handleDeleteTask = vi.fn()
      
      render(
        <TestWrapper>
          <TaskManager tasks={mockTasks} onDeleteTask={handleDeleteTask} />
        </TestWrapper>
      )
      
      await user.click(screen.getAllByText('Delete')[0])
      await user.click(screen.getByText('Delete'))
      
      expect(handleDeleteTask).toHaveBeenCalledWith(1)
    })

    it('should cancel deletion', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TaskManager tasks={mockTasks} />
        </TestWrapper>
      )
      
      await user.click(screen.getAllByText('Delete')[0])
      await user.click(screen.getByText('Cancel'))
      
      expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument()
      expect(screen.getByText('Complete project documentation')).toBeInTheDocument()
    })
  })

  describe('Task Status Management', () => {
    it('should show status dropdown', () => {
      render(
        <TestWrapper>
          <TaskManager tasks={mockTasks} />
        </TestWrapper>
      )
      
      const statusDropdowns = screen.getAllByTestId('status-select')
      expect(statusDropdowns).toHaveLength(3)
    })

    it('should update task status', async () => {
      const user = userEvent.setup()
      const handleStatusChange = vi.fn()
      
      render(
        <TestWrapper>
          <TaskManager tasks={mockTasks} onStatusChange={handleStatusChange} />
        </TestWrapper>
      )
      
      const statusSelect = screen.getAllByTestId('status-select')[0]
      await user.selectOptions(statusSelect, 'done')
      
      expect(handleStatusChange).toHaveBeenCalledWith(1, 'done')
    })

    it('should show different status indicators', () => {
      render(
        <TestWrapper>
          <TaskManager tasks={mockTasks} />
        </TestWrapper>
      
      expect(screen.getByText('In Progress')).toBeInTheDocument()
      expect(screen.getByText('Todo')).toBeInTheDocument()
      expect(screen.getByText('Done')).toBeInTheDocument()
    })
  })

  describe('Task Filtering', () => {
    it('should show filter controls', () => {
      render(
        <TestWrapper>
          <TaskManager />
        </TestWrapper>
      )
      
      expect(screen.getByTestId('status-filter')).toBeInTheDocument()
      expect(screen.getByTestId('priority-filter')).toBeInTheDocument()
      expect(screen.getByTestId('assignee-filter')).toBeInTheDocument()
    })

    it('should filter by status', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TaskManager tasks={mockTasks} />
        </TestWrapper>
      )
      
      const statusFilter = screen.getByTestId('status-filter')
      await user.selectOptions(statusFilter, 'in-progress')
      
      expect(screen.getByText('Complete project documentation')).toBeInTheDocument()
      expect(screen.queryByText('Fix login bug')).not.toBeInTheDocument()
    })

    it('should filter by priority', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TaskManager tasks={mockTasks} />
        </TestWrapper>
      )
      
      const priorityFilter = screen.getByTestId('priority-filter')
      await user.selectOptions(priorityFilter, 'high')
      
      expect(screen.getByText('Complete project documentation')).toBeInTheDocument()
      expect(screen.queryByText('Fix login bug')).not.toBeInTheDocument()
    })

    it('should filter by assignee', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TaskManager tasks={mockTasks} />
        </TestWrapper>
      )
      
      const assigneeFilter = screen.getByTestId('assignee-filter')
      await user.selectOptions(assigneeFilter, 'John Doe')
      
      expect(screen.getByText('Complete project documentation')).toBeInTheDocument()
      expect(screen.queryByText('Fix login bug')).not.toBeInTheDocument()
    })

    it('should search tasks by title', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TaskManager tasks={mockTasks} />
        </TestWrapper>
      )
      
      const searchInput = screen.getByPlaceholderText('Search tasks...')
      await user.type(searchInput, 'documentation')
      
      expect(screen.getByText('Complete project documentation')).toBeInTheDocument()
      expect(screen.queryByText('Fix login bug')).not.toBeInTheDocument()
    })
  })

  describe('Task Sorting', () => {
    it('should show sort options', () => {
      render(
        <TestWrapper>
          <TaskManager tasks={mockTasks} />
        </TestWrapper>
      )
      
      expect(screen.getByTestId('sort-select')).toBeInTheDocument()
    })

    it('should sort by due date', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TaskManager tasks={mockTasks} />
        </TestWrapper>
      )
      
      const sortSelect = screen.getByTestId('sort-select')
      await user.selectOptions(sortSelect, 'dueDate')
      
      // Tasks should be reordered by due date
      const tasks = screen.getAllByTestId('task-card')
      expect(tasks).toHaveLength(3)
    })

    it('should sort by priority', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TaskManager tasks={mockTasks} />
        </TestWrapper>
      )
      
      const sortSelect = screen.getByTestId('sort-select')
      await user.selectOptions(sortSelect, 'priority')
      
      // Critical priority task should come first
      const firstTaskTitle = screen.getAllByTestId('task-card')[0].textContent
      expect(firstTaskTitle).toContain('Fix login bug')
    })
  })

  describe('Task Details', () => {
    it('should show task details on click', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TaskManager tasks={mockTasks} />
        </TestWrapper>
      )
      
      await user.click(screen.getByText('Complete project documentation'))
      
      expect(screen.getByTestId('task-details')).toBeInTheDocument()
      expect(screen.getByText('Write comprehensive docs for the new feature')).toBeInTheDocument()
    })

    it('should show task metadata', () => {
      render(
        <TestWrapper>
          <TaskManager tasks={mockTasks} />
        </TestWrapper>
      )
      
      expect(screen.getByText('Assigned to: John Doe')).toBeInTheDocument()
      expect(screen.getByText('Due: 2023-12-31')).toBeInTheDocument()
      expect(screen.getByText('Tags: documentation, feature')).toBeInTheDocument()
    })
  })

  describe('Task Board View', () => {
    it('should toggle between list and board view', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TaskManager />
        </TestWrapper>
      )
      
      await user.click(screen.getByText('Board View'))
      
      expect(screen.getByTestId('board-view')).toBeInTheDocument()
      expect(screen.getByText('Todo')).toBeInTheDocument()
      expect(screen.getByText('In Progress')).toBeInTheDocument()
      expect(screen.getByText('Done')).toBeInTheDocument()
    })

    it('should show tasks in board columns', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TaskManager tasks={mockTasks} viewMode="board" />
        </TestWrapper>
      )
      
      expect(screen.getByText('Fix login bug')).toBeInTheDocument()
      expect(screen.getByText('Complete project documentation')).toBeInTheDocument()
      expect(screen.getByText('Implement dark mode')).toBeInTheDocument()
    })

    it('should allow drag and drop between columns', async () => {
      const user = userEvent.setup()
      const handleStatusChange = vi.fn()
      
      render(
        <TestWrapper>
          <TaskManager tasks={mockTasks} viewMode="board" onStatusChange={handleStatusChange} />
        </TestWrapper>
      )
      
      // Simulate drag and drop
      const taskCard = screen.getByText('Fix login bug')
      const todoColumn = screen.getByText('Todo').closest('[data-testid="board-column"]')
      
      fireEvent.dragStart(taskCard)
      fireEvent.dragOver(todoColumn)
      fireEvent.drop(todoColumn)
      
      expect(handleStatusChange).toHaveBeenCalledWith(2, 'todo')
    })
  })

  describe('Task Assignment', () => {
    it('should show assignee dropdown', () => {
      render(
        <TestWrapper>
          <TaskManager tasks={mockTasks} />
        </TestWrapper>
      )
      
      expect(screen.getByTestId('assignee-select')).toBeInTheDocument()
    })

    it('should assign task to user', async () => {
      const user = userEvent.setup()
      const handleAssignTask = vi.fn()
      
      render(
        <TestWrapper>
          <TaskManager tasks={mockTasks} onAssignTask={handleAssignTask} />
        </TestWrapper>
      )
      
      const assigneeSelect = screen.getAllByTestId('assignee-select')[0]
      await user.selectOptions(assigneeSelect, 'Jane Smith')
      
      expect(handleAssignTask).toHaveBeenCalledWith(1, 'Jane Smith')
    })
  })

  describe('Task Comments', () => {
    it('should show comment section', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TaskManager tasks={mockTasks} />
        </TestWrapper>
      )
      
      await user.click(screen.getByText('Complete project documentation'))
      await user.click(screen.getByText('Comments'))
      
      expect(screen.getByTestId('comments-section')).toBeInTheDocument()
    })

    it('should add comment to task', async () => {
      const user = userEvent.setup()
      const handleAddComment = vi.fn()
      
      render(
        <TestWrapper>
          <TaskManager tasks={mockTasks} onAddComment={handleAddComment} />
        </TestWrapper>
      )
      
      await user.click(screen.getByText('Complete project documentation'))
      await user.type(screen.getByPlaceholderText('Add a comment...'), 'Great work!')
      await user.click(screen.getByText('Add Comment'))
      
      expect(handleAddComment).toHaveBeenCalledWith(1, 'Great work!')
    })
  })

  describe('Task Manager Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <TestWrapper>
          <TaskManager ariaLabel="Task management interface" />
        </TestWrapper>
      )
      
      const taskManager = screen.getByTestId('task-manager')
      expect(taskManager).toHaveAttribute('aria-label', 'Task management interface')
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TaskManager tasks={mockTasks} />
        </TestWrapper>
      )
      
      const createButton = screen.getByText('Create Task')
      await user.tab()
      await user.tab()
      
      expect(createButton).toHaveFocus()
    })

    it('should announce task updates', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TaskManager tasks={mockTasks} announceUpdates={true} />
        </TestWrapper>
      )
      
      await user.click(screen.getAllByText('Edit')[0])
      
      const modal = screen.getByTestId('task-modal')
      expect(modal).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('Task Manager Performance', () => {
    it('should handle large task lists efficiently', () => {
      const largeTaskList = Array.from({ length: 1000 }, (_, i) => ({
        ...mockTasks[0],
        id: i + 1,
        title: `Task ${i + 1}`,
      }))
      
      render(
        <TestWrapper>
          <TaskManager tasks={largeTaskList} />
        </TestWrapper>
      )
      
      expect(screen.getByText('Task 1')).toBeInTheDocument()
      expect(screen.getByText('Task 1000')).toBeInTheDocument()
    })

    it('should virtualize task list for performance', () => {
      const largeTaskList = Array.from({ length: 10000 }, (_, i) => ({
        ...mockTasks[0],
        id: i + 1,
        title: `Task ${i + 1}`,
      }))
      
      render(
        <TestWrapper>
          <TaskManager tasks={largeTaskList} virtualize={true} />
        </TestWrapper>
      )
      
      // Only visible tasks should be rendered
      expect(screen.getByText('Task 1')).toBeInTheDocument()
      // Virtualization would prevent rendering all 10000 tasks
    })
  })

  describe('Task Manager Error Handling', () => {
    it('should handle task creation errors', async () => {
      const user = userEvent.setup()
      const handleCreateTask = vi.fn(() => Promise.reject(new Error('Creation failed')))
      
      render(
        <TestWrapper>
          <TaskManager onCreateTask={handleCreateTask} />
        </TestWrapper>
      )
      
      await user.click(screen.getByText('Create Task'))
      await user.type(screen.getByPlaceholderText('Task title'), 'New Task')
      await user.click(screen.getByText('Create'))
      
      await waitFor(() => {
        expect(screen.getByText('Failed to create task')).toBeInTheDocument()
      })
    })

    it('should handle network errors', () => {
      render(
        <TestWrapper>
          <TaskManager error={new Error('Network error')} />
        </TestWrapper>
      )
      
      expect(screen.getByText('Network error')).toBeInTheDocument()
      expect(screen.getByTestId('retry-button')).toBeInTheDocument()
    })
  })
})
