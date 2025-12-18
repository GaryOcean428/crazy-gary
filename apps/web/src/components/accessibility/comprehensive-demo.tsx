/**
 * Comprehensive Accessibility Integration Example
 * Demonstrates all accessibility features working together in a complete application
 */

import React, { useState, useEffect } from 'react'
import {
  // Keyboard shortcuts
  useKeyboardShortcuts,
  keyboardShortcutManager,
  KeyboardShortcutsHelp,
  
  // Focus management
  EnhancedFocusTrap,
  useFocusRestore,
  useEnhancedKeyboardNavigation,
  
  // Landmarks and skip links
  SkipLinks,
  DEFAULT_SKIP_LINKS,
  Landmark,
  LANDMARK_CONFIGS,
  
  // Live regions
  useAnnouncements,
  StatusAnnouncer,
  AlertAnnouncer,
  DynamicContentAnnouncer,
  FormValidationAnnouncer,
  
  // Testing
  KeyboardTestRunner,
  AccessibleModalExample,
  AccessibleMenuExample,
  KeyboardShortcutsModal
} from '@/components/accessibility'

// Demo data for testing
const demoTasks = [
  { id: 1, name: 'Review pull requests', completed: false },
  { id: 2, name: 'Update documentation', completed: true },
  { id: 3, name: 'Fix accessibility issues', completed: false },
  { id: 4, name: 'Write unit tests', completed: false }
]

// Main accessibility demo component
export const ComprehensiveAccessibilityDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tasks, setTasks] = useState(demoTasks)
  const [previousTasks, setPreviousTasks] = useState(demoTasks)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [selectedTask, setSelectedTask] = useState<number | null>(null)
  
  const { announce, announceSuccess, announceError } = useAnnouncements()
  const { saveFocus, restoreFocus } = useFocusRestore()
  
  // Set up keyboard shortcuts
  const { setActiveContext } = useKeyboardShortcuts(
    keyboardShortcutManager.getContext('global') || 
    keyboardShortcutManager.getContext('navigation') || 
    keyboardShortcutManager.getContext('application'),
    true
  )

  // Keyboard navigation for task list
  const {
    activeIndex,
    handleKeyDown: handleListKeyDown,
    handleFocus: handleListFocus
  } = useEnhancedKeyboardNavigation(
    tasks,
    {
      orientation: 'vertical',
      loop: true,
      onActivate: (task) => {
        setSelectedTask(task.id)
        announce(`Selected task: ${task.name}`, 'polite')
      }
    }
  )

  // Task management functions
  const addTask = (name: string) => {
    const newTask = {
      id: Date.now(),
      name,
      completed: false
    }
    
    setPreviousTasks([...tasks])
    setTasks([...tasks, newTask])
    announceSuccess(`Added new task: ${name}`)
  }

  const toggleTask = (id: number) => {
    const taskIndex = tasks.findIndex(task => task.id === id)
    if (taskIndex === -1) return

    const updatedTasks = [...tasks]
    updatedTasks[taskIndex].completed = !updatedTasks[taskIndex].completed
    
    setPreviousTasks([...tasks])
    setTasks(updatedTasks)
    
    const task = updatedTasks[taskIndex]
    announceSuccess(`Task "${task.name}" ${task.completed ? 'completed' : 'reopened'}`)
  }

  const removeTask = (id: number) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    setPreviousTasks([...tasks])
    setTasks(tasks.filter(t => t.id !== id))
    announceSuccess(`Removed task: ${task.name}`)
    
    if (selectedTask === id) {
      setSelectedTask(null)
    }
  }

  const openModal = () => {
    saveFocus('[data-trigger="add-task"]')
    setIsModalOpen(true)
    announce('Add task modal opened', 'assertive')
  }

  const closeModal = () => {
    setIsModalOpen(false)
    restoreFocus()
    announce('Add task modal closed', 'polite')
  }

  const simulateFormValidation = () => {
    setIsValidating(true)
    announce('Validating form...', 'polite')
    
    setTimeout(() => {
      setIsValidating(false)
      setIsSubmitted(true)
      
      const errors = []
      if (Math.random() > 0.5) {
        errors.push('Task name is required')
      }
      if (Math.random() > 0.7) {
        errors.push('Task name must be at least 3 characters')
      }
      
      setValidationErrors(errors)
      
      if (errors.length === 0) {
        announceSuccess('Form submitted successfully', 'polite')
        setTimeout(() => {
          setIsSubmitted(false)
          setValidationErrors([])
        }, 3000)
      } else {
        announceError(`${errors.length} validation error${errors.length > 1 ? 's' : ''} found`, 'assertive')
      }
    }, 2000)
  }

  // Keyboard shortcut handlers
  useEffect(() => {
    const handleCustomShortcuts = (e: KeyboardEvent) => {
      // Add custom shortcuts for this demo
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault()
        openModal()
      }
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault()
        // Toggle dark/light theme (simulated)
        announce('Theme toggle not implemented in demo', 'polite')
      }
    }

    document.addEventListener('keydown', handleCustomShortcuts)
    return () => document.removeEventListener('keydown', handleCustomShortcuts)
  }, [announce])

  return (
    <div className="min-h-screen bg-background">
      {/* Skip Links */}
      <SkipLinks links={DEFAULT_SKIP_LINKS} />
      
      {/* Live Region Announcers */}
      <StatusAnnouncer />
      <AlertAnnouncer />
      
      {/* Live Regions for Dynamic Content */}
      <DynamicContentAnnouncer
        content={tasks}
        previousContent={previousTasks}
        announceOnChange={true}
        ariaLabel="task list"
      />
      
      <FormValidationAnnouncer
        errors={validationErrors}
        isValidating={isValidating}
        isSubmitted={isSubmitted}
      />

      {/* Header with Landmark */}
      <Landmark config={LANDMARK_CONFIGS.banner}>
        <header className="bg-primary text-primary-foreground p-4">
          <h1 className="text-2xl font-bold">Comprehensive Accessibility Demo</h1>
          <p className="text-primary-foreground/80 mt-1">
            WCAG 2.1 AA compliant task manager with full keyboard navigation
          </p>
        </header>
      </Landmark>

      <div className="flex">
        {/* Navigation Sidebar */}
        <Landmark config={LANDMARK_CONFIGS.navigation}>
          <nav className="w-64 bg-muted/50 border-r p-4" id="navigation">
            <h2 className="text-lg font-semibold mb-4">Navigation</h2>
            <ul className="space-y-2">
              <li><a href="#" className="text-blue-600 hover:underline">Dashboard</a></li>
              <li><a href="#" className="text-blue-600 hover:underline">Tasks</a></li>
              <li><a href="#" className="text-blue-600 hover:underline">Settings</a></li>
            </ul>
          </nav>
        </Landmark>

        {/* Main Content */}
        <Landmark config={LANDMARK_CONFIGS.main} id="main-content" className="flex-1 p-6">
          <main>
            <h2 className="text-xl font-semibold mb-4">Task Manager</h2>
            
            {/* Controls */}
            <div className="flex gap-4 mb-6">
              <button
                data-trigger="add-task"
                onClick={openModal}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Add Task (Ctrl+N)
              </button>
              
              <AccessibleMenuExample />
            </div>

            {/* Task List with Keyboard Navigation */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Tasks</h3>
              <ul 
                className="space-y-2"
                onKeyDown={handleListKeyDown}
                role="listbox"
                aria-label="Task list"
                aria-activedescendant={selectedTask ? `task-${selectedTask}` : undefined}
              >
                {tasks.map((task, index) => (
                  <li
                    key={task.id}
                    id={`task-${task.id}`}
                    role="option"
                    aria-selected={selectedTask === task.id}
                    tabIndex={index === activeIndex ? 0 : -1}
                    onFocus={handleListFocus}
                    data-index={index}
                    className={`p-3 border rounded cursor-pointer ${
                      index === activeIndex ? 'bg-muted border-primary' : 'bg-background'
                    } ${task.completed ? 'opacity-60' : ''}`}
                    onClick={() => {
                      setSelectedTask(task.id)
                      announce(`Selected task: ${task.name}`, 'polite')
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTask(task.id)}
                          aria-label={`Mark "${task.name}" as ${task.completed ? 'incomplete' : 'complete'}`}
                          className="h-4 w-4"
                        />
                        <span className={task.completed ? 'line-through' : ''}>
                          {task.name}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeTask(task.id)
                        }}
                        className="text-red-600 hover:text-red-800 px-2 py-1"
                        aria-label={`Remove task: ${task.name}`}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              
              <div className="mt-2 text-sm text-muted-foreground">
                Use arrow keys to navigate, Enter to select, Space to toggle completion
              </div>
            </div>

            {/* Keyboard Shortcuts Help */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Interactive Examples</h3>
                <div className="space-y-4">
                  <AccessibleModalExample />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Testing</h3>
                <KeyboardTestRunner />
              </div>
            </div>
          </main>
        </Landmark>

        {/* Sidebar for additional content */}
        <Landmark config={LANDMARK_CONFIGS.complementary}>
          <aside className="w-64 bg-muted/30 border-l p-4">
            <h3 className="text-lg font-semibold mb-4">Accessibility Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <strong>Current selection:</strong>
                <br />
                {selectedTask ? 
                  tasks.find(t => t.id === selectedTask)?.name : 
                  'No task selected'
                }
              </div>
              <div>
                <strong>Active task index:</strong> {activeIndex}
              </div>
              <div>
                <strong>Total tasks:</strong> {tasks.length}
              </div>
              <div>
                <strong>Completed tasks:</strong> {tasks.filter(t => t.completed).length}
              </div>
            </div>
          </aside>
        </Landmark>
      </div>

      {/* Footer */}
      <Landmark config={LANDMARK_CONFIGS.contentinfo}>
        <footer className="bg-muted/20 border-t p-4 text-center" id="footer">
          <p className="text-sm text-muted-foreground">
            WCAG 2.1 AA compliant • Full keyboard navigation • Screen reader optimized
          </p>
        </footer>
      </Landmark>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal />

      {/* Add Task Modal */}
      {isModalOpen && (
        <EnhancedFocusTrap
          active={true}
          onDeactivate={closeModal}
          options={{
            focusOnMount: true,
            returnFocusOnDeactivate: true,
            allowOutsideClick: true
          }}
        >
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
              <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
              
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target as HTMLFormElement)
                const taskName = formData.get('taskName') as string
                if (taskName) {
                  addTask(taskName)
                  closeModal()
                }
              }}>
                <div className="mb-4">
                  <label htmlFor="taskName" className="block text-sm font-medium mb-2">
                    Task Name
                  </label>
                  <input
                    type="text"
                    id="taskName"
                    name="taskName"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    minLength={3}
                    autoFocus
                  />
                </div>
                
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                  >
                    Add Task
                  </button>
                </div>
              </form>
              
              <div className="mt-4 p-3 bg-muted rounded text-sm">
                <strong>Form Validation Demo:</strong>
                <br />
                <button
                  onClick={simulateFormValidation}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={isValidating}
                >
                  {isValidating ? 'Validating...' : 'Simulate Validation'}
                </button>
              </div>
            </div>
          </div>
        </EnhancedFocusTrap>
      )}
    </div>
  )
}

export default ComprehensiveAccessibilityDemo