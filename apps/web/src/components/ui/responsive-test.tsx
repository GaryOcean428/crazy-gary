import * as React from 'react'
import { cn } from '@/lib/utils'
import { useDeviceInfo } from '@/hooks/use-mobile'
import { ResponsiveImage, ResponsiveGrid, ResponsiveContainer, ResponsiveText, ResponsiveSection } from '@/components/ui/responsive'
import { ResponsiveNav, ResponsiveTabs, ResponsiveBreadcrumb, ResponsivePagination } from '@/components/ui/navigation'
import { ResponsiveForm, FormInput, FormTextarea, FormSelect, FormCheckbox, FormRadioGroup, FormSwitch } from '@/components/ui/forms'
import { ResponsiveModal, ResponsiveAlert, ResponsiveConfirm } from '@/components/ui/modals'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Eye, 
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react'

// Comprehensive Responsive Design Testing Component
export const ResponsiveDesignTest: React.FC = () => {
  const deviceInfo = useDeviceInfo()
  const [showTestPanel, setShowTestPanel] = React.useState(true)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [alertOpen, setAlertOpen] = React.useState(false)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [activeTab, setActiveTab] = React.useState('overview')

  const testData = [
    { id: 1, name: 'Test Item 1', status: 'active', description: 'First test item' },
    { id: 2, name: 'Test Item 2', status: 'inactive', description: 'Second test item' },
    { id: 3, name: 'Test Item 3', status: 'pending', description: 'Third test item' },
  ]

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', href: '#', icon: Monitor, badge: '3' },
    { id: 'mobile', label: 'Mobile', href: '#', icon: Smartphone },
    { id: 'tablet', label: 'Tablet', href: '#', icon: Tablet },
  ]

  const tabItems = [
    { id: 'overview', label: 'Overview', content: <div className="p-4">Overview content</div> },
    { id: 'details', label: 'Details', content: <div className="p-4">Details content</div> },
    { id: 'settings', label: 'Settings', content: <div className="p-4">Settings content</div> },
  ]

  const breadcrumbItems = [
    { label: 'Home', href: '#' },
    { label: 'Tests', href: '#' },
    { label: 'Responsive Design', href: '#' },
    { label: 'Current' }
  ]

  if (!showTestPanel) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          size="sm"
          onClick={() => setShowTestPanel(true)}
          className="btn-touch-sm"
        >
          <Eye className="h-4 w-4 mr-2" />
          Show Tests
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Test Panel Header */}
      <ResponsiveSection padding="lg" background="accent" className="border-b">
        <div className="flex items-center justify-between">
          <ResponsiveText as="h1" size="xl" weight="bold">
            Responsive Design Testing Panel
          </ResponsiveText>
          <div className="flex items-center gap-2">
            <Badge variant={deviceInfo.isMobile ? "default" : "secondary"}>
              {deviceInfo.screenSize}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowTestPanel(false)}
              className="btn-touch-sm"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <ResponsiveText className="mt-2 text-muted-foreground">
          Current device: {deviceInfo.isMobile ? 'Mobile' : deviceInfo.isTablet ? 'Tablet' : 'Desktop'} 
          ({deviceInfo.windowSize.width} × {deviceInfo.windowSize.height})
        </ResponsiveText>
      </ResponsiveSection>

      <ResponsiveContainer maxWidth="7xl" className="space-responsive-lg p-responsive">
        
        {/* Device Information Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Device Information</CardTitle>
            <CardDescription>
              Real-time device and viewport information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <ResponsiveText size="sm" weight="semibold">Screen Size</ResponsiveText>
                <ResponsiveText className="text-muted-foreground">
                  {deviceInfo.windowSize.width} × {deviceInfo.windowSize.height}
                </ResponsiveText>
              </div>
              <div className="space-y-2">
                <ResponsiveText size="sm" weight="semibold">Device Type</ResponsiveText>
                <div className="flex items-center gap-2">
                  {deviceInfo.isMobile ? (
                    <Smartphone className="h-4 w-4 text-blue-500" />
                  ) : deviceInfo.isTablet ? (
                    <Tablet className="h-4 w-4 text-green-500" />
                  ) : (
                    <Monitor className="h-4 w-4 text-purple-500" />
                  )}
                  <ResponsiveText className="text-muted-foreground">
                    {deviceInfo.isMobile ? 'Mobile' : deviceInfo.isTablet ? 'Tablet' : 'Desktop'}
                  </ResponsiveText>
                </div>
              </div>
              <div className="space-y-2">
                <ResponsiveText size="sm" weight="semibold">Orientation</ResponsiveText>
                <ResponsiveText className="text-muted-foreground">
                  {deviceInfo.orientation}
                </ResponsiveText>
              </div>
              <div className="space-y-2">
                <ResponsiveText size="sm" weight="semibold">Touch Device</ResponsiveText>
                <div className="flex items-center gap-2">
                  {deviceInfo.isTouchDevice ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <ResponsiveText className="text-muted-foreground">
                    {deviceInfo.isTouchDevice ? 'Yes' : 'No'}
                  </ResponsiveText>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responsive Components Test */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Navigation Components */}
          <Card>
            <CardHeader>
              <CardTitle>Navigation Components</CardTitle>
              <CardDescription>
                Testing responsive navigation patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-responsive">
              <div>
                <ResponsiveText size="sm" weight="semibold" className="mb-2">Responsive Navigation</ResponsiveText>
                <ResponsiveNav items={navigationItems} />
              </div>
              
              <div>
                <ResponsiveText size="sm" weight="semibold" className="mb-2">Breadcrumb</ResponsiveText>
                <ResponsiveBreadcrumb items={breadcrumbItems} />
              </div>

              <div>
                <ResponsiveText size="sm" weight="semibold" className="mb-2">Pagination</ResponsiveText>
                <ResponsivePagination
                  currentPage={currentPage}
                  totalPages={10}
                  onPageChange={setCurrentPage}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tab Navigation */}
          <Card>
            <CardHeader>
              <CardTitle>Tab Navigation</CardTitle>
              <CardDescription>
                Testing responsive tab components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveTabs
                tabs={tabItems}
                defaultTab={activeTab}
                onTabChange={setActiveTab}
                variant="default"
              />
            </CardContent>
          </Card>

          {/* Form Components */}
          <Card>
            <CardHeader>
              <CardTitle>Form Components</CardTitle>
              <CardDescription>
                Testing responsive form elements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveForm>
                <FormInput
                  label="Username"
                  placeholder="Enter your username"
                  description="This will be your public identifier"
                />
                <FormTextarea
                  label="Description"
                  placeholder="Enter a description"
                  description="Tell us about yourself"
                />
                <FormCheckbox
                  label="Subscribe to newsletter"
                  description="Receive updates via email"
                >
                  <ResponsiveText size="sm" className="text-muted-foreground">
                    You can unsubscribe at any time
                  </ResponsiveText>
                </FormCheckbox>
                <FormRadioGroup
                  label="Preferred contact method"
                  options={[
                    { value: 'email', label: 'Email' },
                    { value: 'phone', label: 'Phone' },
                    { value: 'sms', label: 'SMS' }
                  ]}
                />
                <FormSwitch
                  label="Enable notifications"
                  description="Receive push notifications"
                  checked={true}
                />
              </ResponsiveForm>
            </CardContent>
          </Card>

          {/* Modal Components */}
          <Card>
            <CardHeader>
              <CardTitle>Modal Components</CardTitle>
              <CardDescription>
                Testing responsive modal patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-responsive">
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={() => setModalOpen(true)}
                  className="btn-touch-sm"
                >
                  Open Modal
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setAlertOpen(true)}
                  className="btn-touch-sm"
                >
                  Show Alert
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => setConfirmOpen(true)}
                  className="btn-touch-sm"
                >
                  Show Confirm
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table Component Test */}
        <Card>
          <CardHeader>
            <CardTitle>Responsive Table</CardTitle>
            <CardDescription>
              Testing responsive table patterns with horizontal scroll on mobile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant={
                        item.status === 'active' ? 'default' :
                        item.status === 'inactive' ? 'secondary' :
                        'outline'
                      }>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {item.description}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="btn-touch-sm">
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" className="btn-touch-sm text-destructive">
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Grid Layout Test */}
        <Card>
          <CardHeader>
            <CardTitle>Responsive Grid Layouts</CardTitle>
            <CardDescription>
              Testing different responsive grid patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 3, large: 4 }} gap="md">
              {Array.from({ length: 8 }, (_, i) => (
                <Card key={i} className="interactive-mobile">
                  <CardHeader>
                    <CardTitle>Card {i + 1}</CardTitle>
                    <CardDescription>
                      This card demonstrates responsive grid behavior
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveText className="text-muted-foreground">
                      Content adapts to screen size automatically
                    </ResponsiveText>
                  </CardContent>
                </Card>
              ))}
            </ResponsiveGrid>
          </CardContent>
        </Card>

        {/* Image Component Test */}
        <Card>
          <CardHeader>
            <CardTitle>Responsive Images</CardTitle>
            <CardDescription>
              Testing responsive image components with different aspect ratios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <ResponsiveText size="sm" weight="semibold">Square</ResponsiveText>
                <ResponsiveImage
                  aspectRatio="square"
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%233b82f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Arial' font-size='24'%3ESquare%3C/text%3E%3C/svg%3E"
                  alt="Square aspect ratio"
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <ResponsiveText size="sm" weight="semibold">Video</ResponsiveText>
                <ResponsiveImage
                  aspectRatio="video"
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225' viewBox='0 0 400 225'%3E%3Crect width='400' height='225' fill='%2310b981'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Arial' font-size='24'%3EVideo%3C/text%3E%3C/svg%3E"
                  alt="Video aspect ratio"
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <ResponsiveText size="sm" weight="semibold">Responsive</ResponsiveText>
                <ResponsiveImage
                  aspectRatio="responsive"
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='300' viewBox='0 0 500 300'%3E%3Crect width='500' height='300' fill='%23f59e0b'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Arial' font-size='24'%3EResponsive%3C/text%3E%3C/svg%3E"
                  alt="Responsive aspect ratio"
                  className="rounded-lg"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </ResponsiveContainer>

      {/* Modal Components */}
      <ResponsiveModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Responsive Modal Test"
        description="This modal adapts to different screen sizes"
      >
        <ResponsiveText className="mb-4">
          The modal automatically switches between full-screen on mobile and 
          centered modal on desktop. Try resizing your browser to see the difference!
        </ResponsiveText>
        <div className="space-responsive">
          <FormInput label="Test Input" placeholder="Enter text..." />
          <Button onClick={() => setModalOpen(false)} className="btn-touch-sm">
            Close Modal
          </Button>
        </div>
      </ResponsiveModal>

      <ResponsiveAlert
        open={alertOpen}
        onOpenChange={setAlertOpen}
        title="Responsive Alert"
        message="This alert demonstrates responsive behavior with touch-friendly buttons."
        type="info"
        confirmLabel="Got it"
      />

      <ResponsiveConfirm
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm Action"
        message="Are you sure you want to perform this action? This dialog is fully responsive."
        confirmLabel="Yes, proceed"
        cancelLabel="Cancel"
        type="warning"
      />
    </div>
  )
}

export default ResponsiveDesignTest