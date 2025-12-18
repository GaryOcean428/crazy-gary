/**
 * Accessibility Features Showcase Page
 * Comprehensive demonstration of all accessibility features
 */

import React from 'react'
import {
  ComprehensiveAccessibilityDemo,
  KeyboardNavigationExamples,
  AccessibilityDocumentation,
  PageStructureAnalyzer,
  AccessibilityTreeViewer
} from '@/components/accessibility'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const AccessibilityShowcasePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Accessibility Features Showcase</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive WCAG 2.1 AA compliant accessibility features including keyboard navigation,
            focus management, screen reader support, and automated testing.
          </p>
        </div>

        {/* Feature Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Keyboard Navigation</CardTitle>
              <CardDescription>Power user shortcuts and navigation patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1">
                <li>• Context-aware shortcuts</li>
                <li>• Modal focus trapping</li>
                <li>• Menu navigation</li>
                <li>• List navigation</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Focus Management</CardTitle>
              <CardDescription>Enhanced focus handling and restoration</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1">
                <li>• Focus restoration</li>
                <li>• Tab order management</li>
                <li>• Focus indicators</li>
                <li>• Skip links</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ARIA Live Regions</CardTitle>
              <CardDescription>Dynamic content announcements</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1">
                <li>• Status announcements</li>
                <li>• Error notifications</li>
                <li>• Progress updates</li>
                <li>• Dynamic content</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Testing & Validation</CardTitle>
              <CardDescription>Automated accessibility testing</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1">
                <li>• Keyboard scenarios</li>
                <li>• Page structure analysis</li>
                <li>• Accessibility tree</li>
                <li>• WCAG compliance</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="demo" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="demo">Live Demo</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
            <TabsTrigger value="docs">Documentation</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
          </TabsList>

          {/* Live Demo Tab */}
          <TabsContent value="demo" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Comprehensive Accessibility Demo</CardTitle>
                <CardDescription>
                  Interactive task manager demonstrating all accessibility features working together
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ComprehensiveAccessibilityDemo />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Examples Tab */}
          <TabsContent value="examples" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Keyboard Navigation Examples</CardTitle>
                <CardDescription>
                  Interactive examples of accessibility patterns and components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KeyboardNavigationExamples />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="docs" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Accessibility Documentation</CardTitle>
                <CardDescription>
                  Comprehensive guide to implementing and using accessibility features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AccessibilityDocumentation />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testing Tab */}
          <TabsContent value="testing" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Page Structure Analysis</CardTitle>
                  <CardDescription>
                    Analyze the current page structure for accessibility compliance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PageStructureAnalyzer />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Accessibility Tree</CardTitle>
                  <CardDescription>
                    View the accessibility tree for the current page
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AccessibilityTreeViewer />
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Keyboard Navigation Testing</CardTitle>
                <CardDescription>
                  Run automated keyboard navigation tests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KeyboardNavigationExamples />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Start Guide */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Start Guide</CardTitle>
            <CardDescription>
              How to implement accessibility features in your application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">1. Basic Setup</h3>
                <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`// Add to your main layout
import { SkipLinks, DEFAULT_SKIP_LINKS } from '@/components/accessibility'

function App() {
  return (
    <>
      <SkipLinks links={DEFAULT_SKIP_LINKS} />
      {/* Your app content */}
    </>
  )
}`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2. Live Announcements</h3>
                <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`// Add live region announcers
import { StatusAnnouncer, AlertAnnouncer } from '@/components/accessibility'

function App() {
  return (
    <>
      <StatusAnnouncer />
      <AlertAnnouncer />
      {/* Your app content */}
    </>
  )
}`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3. Keyboard Shortcuts</h3>
                <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`// Add keyboard shortcuts
import { useKeyboardShortcuts } from '@/components/accessibility'

function MyComponent() {
  useKeyboardShortcuts({
    id: 'my-context',
    shortcuts: [...]
  }, true)
  
  return <div>Content</div>
}`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">4. Focus Management</h3>
                <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`// Add modal focus trapping
import { EnhancedFocusTrap } from '@/components/accessibility'

<EnhancedFocusTrap active={isOpen} onDeactivate={() => setIsOpen(false)}>
  <div>Modal content</div>
</EnhancedFocusTrap>`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Checklist */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Accessibility Implementation Checklist</CardTitle>
            <CardDescription>
              Essential features for WCAG 2.1 AA compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Keyboard Navigation</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <input type="checkbox" id="check1" />
                    <label htmlFor="check1">Tab navigation works through all interactive elements</label>
                  </li>
                  <li className="flex items-center gap-2">
                    <input type="checkbox" id="check2" />
                    <label htmlFor="check2">Focus indicators are clearly visible</label>
                  </li>
                  <li className="flex items-center gap-2">
                    <input type="checkbox" id="check3" />
                    <label htmlFor="check3">Keyboard shortcuts are implemented</label>
                  </li>
                  <li className="flex items-center gap-2">
                    <input type="checkbox" id="check4" />
                    <label htmlFor="check4">Modal focus trapping works</label>
                  </li>
                  <li className="flex items-center gap-2">
                    <input type="checkbox" id="check5" />
                    <label htmlFor="check5">Escape key closes modals and dropdowns</label>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Screen Reader Support</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <input type="checkbox" id="check6" />
                    <label htmlFor="check6">Skip links are implemented</label>
                  </li>
                  <li className="flex items-center gap-2">
                    <input type="checkbox" id="check7" />
                    <label htmlFor="check7">Landmarks are properly labeled</label>
                  </li>
                  <li className="flex items-center gap-2">
                    <input type="checkbox" id="check8" />
                    <label htmlFor="check8">Dynamic content is announced</label>
                  </li>
                  <li className="flex items-center gap-2">
                    <input type="checkbox" id="check9" />
                    <label htmlFor="check9">Form validation messages are clear</label>
                  </li>
                  <li className="flex items-center gap-2">
                    <input type="checkbox" id="check10" />
                    <label htmlFor="check10">Progress updates are announced</label>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AccessibilityShowcasePage