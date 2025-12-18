import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { 
  CompoundComponents,
  RenderPropPatterns,
  PolymorphicComponents,
  HeadlessComponents,
  SlotPatterns,
  HOCPatterns,
  CompositionUtils
} from '@/components/patterns'
import { 
  EnhancedDashboard, 
  EnhancedTaskManager 
} from '@/components/examples'

// Pattern Showcase Component
const PatternShowcase = () => {
  const [currentExample, setCurrentExample] = useState<'dashboard' | 'task-manager'>('dashboard')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <PolymorphicComponents.Heading level={1}>
            Advanced Component Composition Patterns
          </PolymorphicComponents.Heading>
          <PolymorphicComponents.Text color="muted" size="lg">
            A comprehensive collection of React component composition patterns and utilities
          </PolymorphicComponents.Text>
          <div className="flex justify-center space-x-2">
            <Badge variant="outline">Compound Components</Badge>
            <Badge variant="outline">Render Props</Badge>
            <Badge variant="outline">Polymorphic Components</Badge>
            <Badge variant="outline">Headless UI</Badge>
            <Badge variant="outline">Slot Patterns</Badge>
            <Badge variant="outline">HOCs</Badge>
          </div>
        </div>

        {/* Pattern Examples Tabs */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="task-manager">Task Manager</TabsTrigger>
            <TabsTrigger value="patterns">Pattern Library</TabsTrigger>
            <TabsTrigger value="utilities">Utilities</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Dashboard Example</CardTitle>
                <CardDescription>
                  Demonstrates compound components, render props, polymorphic components, and slots
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="task-manager" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Task Manager Example</CardTitle>
                <CardDescription>
                  Shows headless components, HOCs, form composition, and complex state management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedTaskManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-6">
            <PatternLibrary />
          </TabsContent>

          <TabsContent value="utilities" className="space-y-6">
            <UtilitiesShowcase />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Pattern Library Showcase
const PatternLibrary = () => {
  return (
    <div className="space-y-8">
      {/* Compound Components */}
      <Card>
        <CardHeader>
          <CardTitle>Compound Components</CardTitle>
          <CardDescription>
            Components that work together to form a complete interface
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompoundComponents.Provider initialState={{ count: 0 }}>
            <CompoundComponents.Wrapper className="space-y-4">
              <CompoundComponents.State key="count" defaultValue={0} />
              
              <div className="flex space-x-4">
                <Button 
                  onClick={() => {/* Increment logic would go here */}}
                  size="sm"
                >
                  Increment
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                >
                  Decrement
                </Button>
              </div>
              
              <CompoundComponents.Child className="text-center">
                <div className="text-2xl font-bold">Count: {/* count would be displayed here */}</div>
              </CompoundComponents.Child>
            </CompoundComponents.Wrapper>
          </CompoundComponents.Provider>
        </CardContent>
      </Card>

      {/* Render Props */}
      <Card>
        <CardHeader>
          <CardTitle>Render Props Pattern</CardTitle>
          <CardDescription>
            Share logic between components using functions as children
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <RenderPropPatterns.Toggle initial={false}>
              {({ on, toggle }) => (
                <div className="space-y-2">
                  <Button onClick={toggle}>
                    {on ? 'Hide' : 'Show'} Content
                  </Button>
                  {on && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                      <p>This content is conditionally rendered using render props!</p>
                    </div>
                  )}
                </div>
              )}
            </RenderPropPatterns.Toggle>

            <RenderPropPatterns.AsyncComponent
              loader={() => Promise.resolve('Async data loaded!')}
              fallback={<div className="animate-pulse">Loading...</div>}
              errorFallback={<div className="text-red-500">Failed to load</div>}
            >
              {({ data, loading, error }) => (
                <div className="p-4 border rounded">
                  {loading && <div>Loading...</div>}
                  {error && <div className="text-red-500">Error: {error.message}</div>}
                  {data && <div className="text-green-600">✅ {data}</div>}
                </div>
              )}
            </RenderPropPatterns.AsyncComponent>
          </div>
        </CardContent>
      </Card>

      {/* Polymorphic Components */}
      <Card>
        <CardHeader>
          <CardTitle>Polymorphic Components</CardTitle>
          <CardDescription>
            Components that can render as different HTML elements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <PolymorphicComponents.Button variant="default">
                Default Button
              </PolymorphicComponents.Button>
              
              <PolymorphicComponents.Button variant="outline" size="sm">
                Small Outline
              </PolymorphicComponents.Button>
              
              <PolymorphicComponents.Button as="a" href="#polymorphic" variant="ghost">
                Link Button
              </PolymorphicComponents.Button>
              
              <PolymorphicComponents.Button asChild variant="destructive">
                <button onClick={() => alert('Slot button clicked!')}>
                  Slot Button
                </button>
              </PolymorphicComponents.Button>
            </div>

            <div className="space-y-2">
              <PolymorphicComponents.Heading level={2} color="primary">
                Polymorphic Heading
              </PolymorphicComponents.Heading>
              
              <PolymorphicComponents.Text size="lg" weight="medium">
                Large medium weight text
              </PolymorphicComponents.Text>
              
              <PolymorphicComponents.Text color="muted" align="center">
                Centered muted text
              </PolymorphicComponents.Text>
            </div>

            <PolymorphicComponents.Container size="md" padding="sm" className="bg-gray-50">
              <div className="text-center">
                <PolymorphicComponents.Text weight="semibold">
                  Responsive Container
                </PolymorphicComponents.Text>
              </div>
            </PolymorphicComponents.Container>
          </div>
        </CardContent>
      </Card>

      {/* Headless Components */}
      <Card>
        <CardHeader>
          <CardTitle>Headless Components</CardTitle>
          <CardDescription>
            Logic without visual constraints - you control the UI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HeadlessComponents.Accordion
            type="single"
            items={[
              {
                id: '1',
                title: 'What are Headless Components?',
                content: 'Components that provide logic and state management without imposing visual structure.',
                disabled: false
              },
              {
                id: '2',
                title: 'Why use Headless Components?',
                content: 'They give you maximum flexibility in how you present the UI while handling complex state.',
                disabled: false
              },
              {
                id: '3',
                title: 'When to use them?',
                content: 'When you need complex state management but want complete control over the visual presentation.',
                disabled: true
              }
            ]}
          >
            {({ openItems, toggleItem, getItemProps }) => (
              <div className="space-y-2">
                {[
                  { id: '1', title: 'What are Headless Components?', content: 'Components that provide logic and state management without imposing visual structure.' },
                  { id: '2', title: 'Why use Headless Components?', content: 'They give you maximum flexibility in how you present the UI while handling complex state.' },
                  { id: '3', title: 'When to use them?', content: 'When you need complex state management but want complete control over the visual presentation.' }
                ].map(item => {
                  const isOpen = openItems.includes(item.id)
                  const isDisabled = item.id === '3'
                  
                  return (
                    <div key={item.id} className="border rounded">
                      <button
                        {...getItemProps(item.id)}
                        className={cn(
                          "w-full p-4 text-left flex justify-between items-center",
                          isDisabled && "opacity-50 cursor-not-allowed"
                        )}
                        disabled={isDisabled}
                      >
                        <span className="font-medium">{item.title}</span>
                        <span className={cn("transform transition-transform", isOpen && "rotate-180")}>
                          ▼
                        </span>
                      </button>
                      {isOpen && (
                        <div className="p-4 border-t bg-gray-50">
                          <p className="text-gray-600">{item.content}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </HeadlessComponents.Accordion>
        </CardContent>
      </Card>
    </div>
  )
}

// Utilities Showcase
const UtilitiesShowcase = () => {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Composition utilities examples
  const { state, updateState } = CompositionUtils.useComposedState(
    ['count', count],
    ['loading', isLoading]
  )

  return (
    <div className="space-y-8">
      {/* State Composition */}
      <Card>
        <CardHeader>
          <CardTitle>State Composition</CardTitle>
          <CardDescription>
            Compose multiple state values into a single interface
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{state.count}</div>
              <div className="text-sm text-gray-600">
                Loading: {state.loading ? 'Yes' : 'No'}
              </div>
            </div>
            
            <div className="flex justify-center space-x-2">
              <Button 
                onClick={() => updateState('count', state.count + 1)}
                disabled={state.loading}
              >
                Increment
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => updateState('loading', !state.loading)}
                disabled={state.count === 0}
              >
                Toggle Loading
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Component */}
      <Card>
        <CardHeader>
          <CardTitle>Dynamic Component Switching</CardTitle>
          <CardDescription>
            Switch between different components based on state
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DynamicComponentDemo />
        </CardContent>
      </Card>

      {/* Slot Composition */}
      <Card>
        <CardHeader>
          <CardTitle>Slot Composition</CardTitle>
          <CardDescription>
            Flexible layout composition using slots
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SlotCompositionDemo />
        </CardContent>
      </Card>
    </div>
  )
}

// Dynamic Component Demo
const DynamicComponentDemo = () => {
  const { getComponent, switchTo, currentKey } = CompositionUtils.useDynamicComponent({
    card: ({ children }) => (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-2xl">📋 {children}</div>
        </CardContent>
      </Card>
    ),
    badge: ({ children }) => (
      <div className="inline-block px-4 py-2 bg-blue-500 text-white rounded-full">
        🏷️ {children}
      </div>
    ),
    alert: ({ children }) => (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        ⚠️ {children}
      </div>
    )
  })

  const Component = getComponent(currentKey || 'card')

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Button 
          size="sm"
          onClick={() => switchTo('card')}
          variant={currentKey === 'card' ? 'default' : 'outline'}
        >
          Card
        </Button>
        <Button 
          size="sm"
          onClick={() => switchTo('badge')}
          variant={currentKey === 'badge' ? 'default' : 'outline'}
        >
          Badge
        </Button>
        <Button 
          size="sm"
          onClick={() => switchTo('alert')}
          variant={currentKey === 'alert' ? 'default' : 'outline'}
        >
          Alert
        </Button>
      </div>
      
      {Component && (
        <div className="min-h-[120px] flex items-center justify-center">
          <Component>Dynamic Content</Component>
        </div>
      )}
    </div>
  )
}

// Slot Composition Demo
const SlotCompositionDemo = () => {
  const { registerSlot, getSlot } = CompositionUtils.useSlotComposition()

  React.useEffect(() => {
    registerSlot('header', <div className="text-xl font-bold">🎯 Slot Demo Header</div>)
    registerSlot('content', <div className="text-gray-600">This content is injected via slots</div>)
    registerSlot('actions', <Button size="sm">Action Button</Button>)
  }, [registerSlot])

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Button 
          size="sm" 
          onClick={() => registerSlot('sidebar', <div className="text-sm">📱 Sidebar content</div>)}
        >
          Add Sidebar
        </Button>
        <Button 
          size="sm" 
          onClick={() => registerSlot('footer', <div className="text-xs text-gray-500">© 2024 Demo</div>)}
        >
          Add Footer
        </Button>
      </div>
      
      <div className="space-y-2">
        {getSlot('header') && (
          <div className="p-3 bg-gray-50 rounded">{getSlot('header')}</div>
        )}
        
        {getSlot('content') && (
          <div className="p-3 border rounded">{getSlot('content')}</div>
        )}
        
        {getSlot('sidebar') && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            {getSlot('sidebar')}
          </div>
        )}
        
        {getSlot('actions') && (
          <div className="flex justify-center">{getSlot('actions')}</div>
        )}
        
        {getSlot('footer') && (
          <div className="p-2 bg-gray-100 rounded text-center">{getSlot('footer')}</div>
        )}
      </div>
    </div>
  )
}

export default PatternShowcase