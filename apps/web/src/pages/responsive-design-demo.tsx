import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveFlex,
  ResponsiveCardGrid,
  ResponsiveStack,
  ResponsiveSection,
  ResponsiveWidget
} from '@/components/ui/responsive-layout'
import {
  ResponsiveForm,
  ResponsiveInput,
  ResponsiveTextarea,
  FormButtonGroup,
  ResponsiveCheckbox
} from '@/components/ui/responsive-form'
import {
  ResponsiveTableContainer,
  ResponsiveTable,
  TableRow,
  TableCell,
  TableCardItem,
  TableListItem
} from '@/components/ui/responsive-table'
import {
  ResponsiveImageContainer,
  ResponsiveImage,
  MediaGallery
} from '@/components/ui/responsive-media'
import {
  ResponsiveDialog,
  ResponsiveDialogTrigger,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  BottomSheet
} from '@/components/ui/responsive-dialog'
import { useIsMobile, useScreenSize } from '@/hooks/use-mobile'
import { useResponsiveValue, useResponsiveLayout, useResponsiveVisibility } from '@/hooks/use-responsive'
import {
  Smartphone,
  Tablet,
  Monitor,
  Tv,
  Eye,
  Settings,
  Palette,
  Layout,
  Users,
  Calendar,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Menu,
  X
} from 'lucide-react'

export function ResponsiveDesignDemo() {
  const isMobile = useIsMobile()
  const screenSize = useScreenSize()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  
  // Sample data for demonstrations
  const sampleUsers = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'active' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User', status: 'inactive' },
    { id: 3, name: 'Carol Davis', email: 'carol@example.com', role: 'Editor', status: 'active' },
    { id: 4, name: 'David Wilson', email: 'david@example.com', role: 'User', status: 'pending' }
  ]
  
  const sampleTasks = [
    { id: 1, title: 'Design responsive layout', priority: 'high', assignee: 'Alice' },
    { id: 2, title: 'Implement mobile navigation', priority: 'medium', assignee: 'Bob' },
    { id: 3, title: 'Optimize images for web', priority: 'low', assignee: 'Carol' },
    { id: 4, title: 'Write responsive tests', priority: 'high', assignee: 'David' }
  ]

  return (
    <ResponsiveSection padding="lg" background="subtle">
      <ResponsiveContainer maxWidth="6xl">
        {/* Header Section */}
        <ResponsiveStack spacing="xl" className="text-center mb-12">
          <div>
            <h1 className="text-responsive-3xl font-bold tracking-tight mb-4">
              Responsive Design System
            </h1>
            <p className="text-responsive-base text-muted-foreground max-w-2xl mx-auto">
              A comprehensive responsive design system optimized for all screen sizes and devices. 
              Experience seamless layouts from mobile to 4K displays.
            </p>
          </div>
          
          <ResponsiveFlex justify="center" gap="md">
            <Badge variant="secondary" className="text-sm">
              <Smartphone className="h-3 w-3 mr-1" />
              Mobile First
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <Tablet className="h-3 w-3 mr-1" />
              Tablet Optimized
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <Monitor className="h-3 w-3 mr-1" />
              Desktop Enhanced
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <Tv className="h-3 w-3 mr-1" />
              4K Ready
            </Badge>
          </ResponsiveFlex>
        </ResponsiveStack>

        {/* Screen Size Indicator */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <ResponsiveFlex justify="between" align="center">
              <div>
                <h3 className="font-semibold">Current Screen Info</h3>
                <p className="text-sm text-muted-foreground">
                  Size: {screenSize} | Mobile: {isMobile ? 'Yes' : 'No'}
                </p>
              </div>
              <Badge variant="outline">
                {screenSize.toUpperCase()}
              </Badge>
            </ResponsiveFlex>
          </CardContent>
        </Card>

        {/* Responsive Layouts */}
        <ResponsiveSection padding="md" className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Responsive Layouts
              </CardTitle>
              <CardDescription>
                Dynamic grid and flex layouts that adapt to screen size
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Responsive Grid */}
              <div>
                <h4 className="font-semibold mb-3">Responsive Grid</h4>
                <ResponsiveGrid cols={4} gap="md">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                    <Card key={item} className="p-4 text-center">
                      <div className="text-sm font-medium">Grid Item {item}</div>
                    </Card>
                  ))}
                </ResponsiveGrid>
              </div>

              <Separator />

              {/* Responsive Flex */}
              <div>
                <h4 className="font-semibold mb-3">Responsive Flex</h4>
                <ResponsiveFlex direction="auto" justify="between" align="center" gap="md">
                  <Card className="flex-1 p-4">
                    <div className="text-sm font-medium">Left Item</div>
                  </Card>
                  <Card className="flex-1 p-4">
                    <div className="text-sm font-medium">Center Item</div>
                  </Card>
                  <Card className="flex-1 p-4">
                    <div className="text-sm font-medium">Right Item</div>
                  </Card>
                </ResponsiveFlex>
              </div>

              <Separator />

              {/* Responsive Stack */}
              <div>
                <h4 className="font-semibold mb-3">Responsive Stack</h4>
                <ResponsiveStack spacing="md">
                  <Card className="p-4">
                    <div className="text-sm font-medium">Stack Item 1</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm font-medium">Stack Item 2</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm font-medium">Stack Item 3</div>
                  </Card>
                </ResponsiveStack>
              </div>
            </CardContent>
          </Card>
        </ResponsiveSection>

        {/* Responsive Forms */}
        <ResponsiveSection padding="md" className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Responsive Forms
              </CardTitle>
              <CardDescription>
                Mobile-optimized forms with proper keyboard types and validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveForm layout="vertical" spacing="normal">
                <ResponsiveInput
                  label="Email Address"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  description="We'll never share your email"
                  required
                />
                
                <ResponsiveInput
                  label="Phone Number"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+1 (555) 123-4567"
                />
                
                <ResponsiveTextarea
                  label="Message"
                  rows={4}
                  resize="vertical"
                  placeholder="Tell us about your project..."
                />
                
                <ResponsiveCheckbox
                  label="Subscribe to newsletter"
                  description="Get updates on new features"
                />
                
                <FormButtonGroup justify="end">
                  <Button variant="outline">Cancel</Button>
                  <Button type="submit">Submit</Button>
                </FormButtonGroup>
              </ResponsiveForm>
            </CardContent>
          </Card>
        </ResponsiveSection>

        {/* Responsive Tables */}
        <ResponsiveSection padding="md" className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Responsive Data Display
              </CardTitle>
              <CardDescription>
                Tables that adapt to screen size with card layouts on mobile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveTableContainer orientation="horizontal" scrollable>
                <ResponsiveTable variant="card">
                  <TableRow>
                    <TableCell priority="high">Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell priority="medium">Role</TableCell>
                    <TableCell priority="low" hideOnMobile>Status</TableCell>
                  </TableRow>
                  {sampleUsers.map((user) => (
                    <TableRow key={user.id} clickable>
                      <TableCell priority="high">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell priority="medium">{user.role}</TableCell>
                      <TableCell priority="low" hideOnMobile>
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </ResponsiveTable>
              </ResponsiveTableContainer>
            </CardContent>
          </Card>
        </ResponsiveSection>

        {/* Responsive Media */}
        <ResponsiveSection padding="md" className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Responsive Media
              </CardTitle>
              <CardDescription>
                Images and media that adapt to different screen sizes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MediaGallery columns="auto" gap="md" aspectRatio="square">
                <ResponsiveImageContainer aspectRatio="square" objectFit="cover">
                  <ResponsiveImage
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
                    alt="Profile 1"
                    placeholderSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3C/svg%3E"
                  />
                </ResponsiveImageContainer>
                <ResponsiveImageContainer aspectRatio="square" objectFit="cover">
                  <ResponsiveImage
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face"
                    alt="Profile 2"
                    placeholderSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3C/svg%3E"
                  />
                </ResponsiveImageContainer>
                <ResponsiveImageContainer aspectRatio="square" objectFit="cover">
                  <ResponsiveImage
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
                    alt="Profile 3"
                    placeholderSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3C/svg%3E"
                  />
                </ResponsiveImageContainer>
                <ResponsiveImageContainer aspectRatio="square" objectFit="cover">
                  <ResponsiveImage
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face"
                    alt="Profile 4"
                    placeholderSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3C/svg%3E"
                  />
                </ResponsiveImageContainer>
              </MediaGallery>
            </CardContent>
          </Card>
        </ResponsiveSection>

        {/* Responsive Dialogs */}
        <ResponsiveSection padding="md" className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Responsive Dialogs
              </CardTitle>
              <CardDescription>
                Modals that adapt to screen size and become full-screen on mobile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveFlex gap="md" justify="center">
                <ResponsiveDialog>
                  <ResponsiveDialogTrigger asChild>
                    <Button>Open Dialog</Button>
                  </ResponsiveDialogTrigger>
                  <ResponsiveDialogContent size="lg">
                    <ResponsiveDialogHeader>
                      <ResponsiveDialogTitle>Responsive Dialog</ResponsiveDialogTitle>
                      <ResponsiveDialogDescription>
                        This dialog adapts to your screen size. On mobile, it becomes full-screen for better usability.
                      </ResponsiveDialogDescription>
                    </ResponsiveDialogHeader>
                    <div className="py-4">
                      <p>Dialog content goes here...</p>
                    </div>
                    <ResponsiveDialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button>Confirm</Button>
                    </ResponsiveDialogFooter>
                  </ResponsiveDialogContent>
                </ResponsiveDialog>

                <Button 
                  variant="outline"
                  onClick={() => setSheetOpen(true)}
                >
                  Open Bottom Sheet
                </Button>
              </ResponsiveFlex>
            </CardContent>
          </Card>
        </ResponsiveSection>

        {/* Performance Metrics */}
        <ResponsiveSection padding="md">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                How the responsive system optimizes performance based on your device
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveGrid cols={3} gap="md">
                <ResponsiveWidget size="md" variant="elevated">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">98%</div>
                    <div className="text-sm text-muted-foreground">Lighthouse Score</div>
                  </div>
                </ResponsiveWidget>
                
                <ResponsiveWidget size="md" variant="elevated">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {isMobile ? '< 2s' : '< 1s'}
                    </div>
                    <div className="text-sm text-muted-foreground">Load Time</div>
                  </div>
                </ResponsiveWidget>
                
                <ResponsiveWidget size="md" variant="elevated">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {isMobile ? 'Adaptive' : 'Full'}
                    </div>
                    <div className="text-sm text-muted-foreground">Features</div>
                  </div>
                </ResponsiveWidget>
              </ResponsiveGrid>
            </CardContent>
          </Card>
        </ResponsiveSection>

        {/* Bottom Sheet */}
        <BottomSheet 
          open={sheetOpen} 
          onOpenChange={setSheetOpen}
          title="Responsive Design Features"
          description="Mobile-optimized modal for better usability"
        >
          <ResponsiveStack spacing="md">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="font-medium">Mobile-First Design</span>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="font-medium">Touch Optimization</span>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="font-medium">Performance Adaptive</span>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="font-medium">WCAG 2.1 AA Compliant</span>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            
            <Button 
              className="w-full mt-4"
              onClick={() => setSheetOpen(false)}
            >
              Got it!
            </Button>
          </ResponsiveStack>
        </BottomSheet>
      </ResponsiveContainer>
    </ResponsiveSection>
  )
}