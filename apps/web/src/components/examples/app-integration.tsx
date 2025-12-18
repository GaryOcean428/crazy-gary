import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PatternShowcase } from '@/components/examples'
import { 
  CompoundComponents,
  RenderPropPatterns,
  PolymorphicComponents,
  HeadlessComponents,
  SlotPatterns,
  HOCPatterns,
  CompositionUtils
} from '@/components/patterns'

// Example integration in a real app
const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <PolymorphicComponents.Heading level={2}>
                Component Composition Demo
              </PolymorphicComponents.Heading>
              
              <nav className="flex space-x-4">
                <Link to="/">
                  <Button variant="ghost" size="sm">Home</Button>
                </Link>
                <Link to="/patterns">
                  <Button variant="ghost" size="sm">Pattern Showcase</Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">Dashboard</Button>
                </Link>
                <Link to="/tasks">
                  <Button variant="ghost" size="sm">Task Manager</Button>
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/patterns" element={<PatternShowcase />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tasks" element={<TasksPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

// Home page demonstrating basic patterns
const HomePage = () => {
  const [counter, setCounter] = React.useState(0)

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <PolymorphicComponents.Heading level={1}>
          Welcome to Component Composition Patterns
        </PolymorphicComponents.Heading>
        <PolymorphicComponents.Text color="muted" size="lg">
          Explore the power of advanced React component composition patterns
        </PolymorphicComponents.Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Compound Components</CardTitle>
            <CardDescription>
              Components that work together to form complete interfaces
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{counter}</div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={() => setCounter(c => c + 1)} size="sm">
                  Increment
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCounter(0)} 
                  size="sm"
                >
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Render Props</CardTitle>
            <CardDescription>
              Share logic between components using functions as children
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RenderPropPatterns.Toggle initial={false}>
              {({ on, toggle }) => (
                <div className="space-y-2">
                  <Button onClick={toggle} className="w-full">
                    {on ? 'Hide' : 'Show'} Features
                  </Button>
                  {on && (
                    <div className="space-y-2">
                      <Badge>Flexible</Badge>
                      <Badge>Reusable</Badge>
                      <Badge>Composable</Badge>
                    </div>
                  )}
                </div>
              )}
            </RenderPropPatterns.Toggle>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Polymorphic Components</CardTitle>
            <CardDescription>
              Components that can render as different HTML elements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <PolymorphicComponents.Button as="a" href="#polymorphic" variant="outline">
                Link Button
              </PolymorphicComponents.Button>
              <PolymorphicComponents.Button asChild variant="destructive">
                <button onClick={() => alert('Clicked!')}>
                  Custom Element
                </button>
              </PolymorphicComponents.Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>
            Explore different pattern implementations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/patterns">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <div className="text-lg font-semibold">Pattern Showcase</div>
                <div className="text-sm text-muted-foreground">See all patterns in action</div>
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <div className="text-lg font-semibold">Enhanced Dashboard</div>
                <div className="text-sm text-muted-foreground">Complex dashboard with all patterns</div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Dashboard page
const DashboardPage = () => {
  const DashboardComponent = React.lazy(() => 
    import('@/components/examples/enhanced-dashboard').then(module => ({ default: module.EnhancedDashboard }))
  )

  return (
    <HOCPatterns.withSuspense fallback={<div>Loading dashboard...</div>}>
      <DashboardComponent />
    </HOCPatterns.withSuspense>
  )
}

// Tasks page
const TasksPage = () => {
  const TaskManagerComponent = React.lazy(() => 
    import('@/components/examples/enhanced-task-manager').then(module => ({ default: module.EnhancedTaskManager }))
  )

  return (
    <HOCPatterns.withSuspense fallback={<div>Loading task manager...</div>}>
      <TaskManagerComponent />
    </HOCPatterns.withSuspense>
  )
}

// Enhanced Suspense HOC
HOCPatterns.withSuspense = function withSuspense<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback: React.ComponentType = () => <div>Loading...</div>
) {
  return function WithSuspenseComponent(props: P) {
    return (
      <React.Suspense fallback={<fallback />}>
        <WrappedComponent {...props} />
      </React.Suspense>
    )
  }
}

export default App