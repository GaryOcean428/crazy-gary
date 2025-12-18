import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  ThemeSwitcher,
  ThemeCustomizationPanel 
} from '@/components/theme-switcher'
import { 
  ThemeAwareLogo, 
  ThemeAwareHero, 
  ThemeAwareFeatureCard,
  ThemeAwareSun,
  ThemeAwareMoon,
  ThemeAwareMonitor,
  ThemeAwareContrast
} from '@/components/theme-aware-icons'
import { ThemeValidationDashboard } from '@/components/theme-validation'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'
import { 
  Palette,
  Zap,
  Eye,
  Shield,
  Sparkles,
  Star,
  Heart,
  Coffee,
  BookOpen,
  Code,
  Lightbulb,
  Rainbow,
  CheckCircle,
  Info,
  AlertTriangle,
  RefreshCw,
  Settings,
  Gauge,
  Monitor,
  Sun,
  Moon,
  Contrast,
} from 'lucide-react'

export function ThemeShowcase() {
  const { theme, config, systemTheme, isTransitioning } = useTheme()
  const [showCustomization, setShowCustomization] = useState(false)
  const [activeDemo, setActiveDemo] = useState('overview')

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun, color: 'from-yellow-400 to-orange-500' },
    { value: 'dark', label: 'Dark', icon: Moon, color: 'from-purple-500 to-blue-600' },
    { value: 'high-contrast', label: 'High Contrast', icon: Contrast, color: 'from-red-500 to-yellow-500' },
    { value: 'system', label: 'System', icon: Monitor, color: 'from-green-400 to-blue-500' },
  ]

  const features = [
    {
      icon: Palette,
      title: 'Multiple Themes',
      description: 'Light, Dark, High Contrast, and System themes',
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      icon: Zap,
      title: 'Smooth Transitions',
      description: 'Beautiful animations between theme changes',
      gradient: 'from-yellow-400 to-orange-500'
    },
    {
      icon: Eye,
      title: 'Accessibility First',
      description: 'WCAG AA compliant with high contrast support',
      gradient: 'from-green-500 to-teal-600'
    },
    {
      icon: Shield,
      title: 'Theme Validation',
      description: 'Real-time accessibility and consistency checking',
      gradient: 'from-red-500 to-pink-600'
    },
    {
      icon: Sparkles,
      title: 'Custom Animations',
      description: 'Theme-aware animations respecting user preferences',
      gradient: 'from-purple-500 to-indigo-600'
    },
    {
      icon: Gauge,
      title: 'Performance Optimized',
      description: 'Efficient theme switching with minimal layout shifts',
      gradient: 'from-cyan-500 to-blue-600'
    },
  ]

  const colorExamples = [
    { name: 'Primary', variable: '--primary', description: 'Main brand color' },
    { name: 'Secondary', variable: '--secondary', description: 'Supporting color' },
    { name: 'Accent', variable: '--accent', description: 'Highlight color' },
    { name: 'Success', variable: '--success', description: 'Success state' },
    { name: 'Warning', variable: '--warning', description: 'Warning state' },
    { name: 'Error', variable: '--error', description: 'Error state' },
  ]

  const componentExamples = [
    {
      title: 'Buttons',
      component: (
        <div className="flex flex-wrap gap-3">
          <Button>Primary Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      )
    },
    {
      title: 'Form Elements',
      component: (
        <div className="space-y-4 max-w-sm">
          <div>
            <Label htmlFor="demo-input">Input Field</Label>
            <input 
              id="demo-input"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter text..."
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="demo-switch" />
            <Label htmlFor="demo-switch">Toggle Switch</Label>
          </div>
        </div>
      )
    },
    {
      title: 'Status Indicators',
      component: (
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            Success
          </Badge>
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
            Warning
          </Badge>
        </div>
      )
    },
    {
      title: 'Cards',
      component: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card description text</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Card content goes here with theme-aware styling.</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>Muted Card</CardTitle>
              <CardDescription>Secondary card variant</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card uses muted background colors.</p>
            </CardContent>
          </Card>
        </div>
      )
    },
  ]

  return (
    <div className="min-h-screen bg-background theme-transition">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ThemeAwareLogo size={64} animated={true} />
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Theme System Showcase</h1>
                <p className="text-xl text-muted-foreground mt-2">
                  Explore our comprehensive dark/light theme system with advanced features
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Current theme indicator */}
              <div className="flex items-center space-x-2 px-4 py-2 bg-muted rounded-lg">
                {theme === 'light' && <Sun className="h-5 w-5" />}
                {theme === 'dark' && <Moon className="h-5 w-5" />}
                {theme === 'high-contrast' && <Contrast className="h-5 w-5" />}
                {theme === 'system' && <Monitor className="h-5 w-5" />}
                <div>
                  <div className="font-medium capitalize">{theme}</div>
                  {theme === 'system' && (
                    <div className="text-xs text-muted-foreground">
                      System: {systemTheme}
                    </div>
                  )}
                </div>
              </div>
              
              <ThemeSwitcher 
                variant="button" 
                showLabels={true}
                onCustomize={() => setShowCustomization(true)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Navigation */}
        <div className="flex space-x-1 mb-8 bg-muted p-1 rounded-lg w-fit">
          {[
            { id: 'overview', label: 'Overview', icon: Sparkles },
            { id: 'themes', label: 'Themes', icon: Palette },
            { id: 'components', label: 'Components', icon: Code },
            { id: 'validation', label: 'Validation', icon: Shield },
            { id: 'customization', label: 'Customization', icon: Settings },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveDemo(id)}
              className={cn(
                'flex items-center space-x-2 px-4 py-2 rounded-md transition-all',
                activeDemo === id 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Overview Section */}
        {activeDemo === 'overview' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center py-12">
              <ThemeAwareHero size={300} animated={true} />
              <h2 className="text-3xl font-bold mt-8 mb-4">
                Beautiful, Accessible, and Performant Themes
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our enhanced theme system provides a comprehensive solution for dark/light themes 
                with accessibility features, smooth transitions, and real-time validation.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <Card key={index} className="theme-transition interactive">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          'p-2 rounded-lg bg-gradient-to-br',
                          feature.gradient
                        )}>
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Accessibility Features</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">WCAG AA Compliant</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">High Contrast Mode</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reduced Motion Support</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Keyboard Navigation</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Screen Reader Compatible</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    <span>Performance Features</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">CSS Custom Properties</span>
                    <Badge variant="secondary">Fast</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">GPU Accelerating Animations</span>
                    <Badge variant="secondary">Smooth</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Minimal Layout Shifts</span>
                    <Badge variant="secondary">Optimized</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cached Validation</span>
                    <Badge variant="secondary">Efficient</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Lazy Loading</span>
                    <Badge variant="secondary">Smart</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Themes Section */}
        {activeDemo === 'themes' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Theme Collection</h2>
              <p className="text-muted-foreground">
                Choose from our carefully crafted theme collection
              </p>
            </div>

            {/* Theme Switcher Variants */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dropdown Theme Selector</CardTitle>
                  <CardDescription>Comprehensive theme selection with descriptions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ThemeSwitcher 
                    variant="dropdown"
                    showLabels={true}
                    showIndicators={true}
                    enableCustomization={true}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Visual Theme Cards</CardTitle>
                  <CardDescription>Interactive theme preview cards</CardDescription>
                </CardHeader>
                <CardContent>
                  <ThemeSwitcher 
                    variant="card"
                    showLabels={true}
                    showIndicators={true}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Theme Previews */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {themeOptions.map((option) => {
                const IconComponent = option.icon
                const isActive = theme === option.value
                
                return (
                  <Card 
                    key={option.value}
                    className={cn(
                      'cursor-pointer transition-all duration-200',
                      isActive && 'ring-2 ring-primary shadow-lg scale-105'
                    )}
                  >
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className={cn(
                          'mx-auto w-16 h-16 rounded-full bg-gradient-to-br flex items-center justify-center',
                          option.color
                        )}>
                          <IconComponent className="h-8 w-8 text-white" />
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-lg">{option.label}</h3>
                          {isActive && (
                            <Badge variant="default" className="mt-2">
                              Active
                            </Badge>
                          )}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {option.value === 'light' && 'Clean and bright interface'}
                          {option.value === 'dark' && 'Easy on the eyes'}
                          {option.value === 'high-contrast' && 'Maximum accessibility'}
                          {option.value === 'system' && 'Follows your device'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Color Palette Showcase */}
            <Card>
              <CardHeader>
                <CardTitle>Color Palette</CardTitle>
                <CardDescription>
                  Theme-aware color system with semantic meaning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {colorExamples.map((color) => (
                    <div key={color.name} className="text-center space-y-2">
                      <div 
                        className="w-full h-20 rounded-lg border-2 border-border"
                        style={{ 
                          backgroundColor: `var(${color.variable})`,
                          background: `var(${color.variable})`
                        }}
                      />
                      <div>
                        <div className="font-medium text-sm">{color.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {color.variable}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {color.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Components Section */}
        {activeDemo === 'components' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Component Examples</h2>
              <p className="text-muted-foreground">
                See how components adapt to different themes
              </p>
            </div>

            {componentExamples.map((example, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{example.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {example.component}
                </CardContent>
              </Card>
            ))}

            {/* Theme-aware Icons */}
            <Card>
              <CardHeader>
                <CardTitle>Theme-Aware Icons</CardTitle>
                <CardDescription>
                  Icons that automatically adapt to the current theme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center space-y-2">
                    <ThemeAwareSun size={48} />
                    <div className="text-sm">Sun Icon</div>
                  </div>
                  <div className="text-center space-y-2">
                    <ThemeAwareMoon size={48} />
                    <div className="text-sm">Moon Icon</div>
                  </div>
                  <div className="text-center space-y-2">
                    <ThemeAwareMonitor size={48} />
                    <div className="text-sm">Monitor Icon</div>
                  </div>
                  <div className="text-center space-y-2">
                    <ThemeAwareContrast size={48} />
                    <div className="text-sm">Contrast Icon</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature Cards */}
            <Card>
              <CardHeader>
                <CardTitle>Feature Showcase</CardTitle>
                <CardDescription>
                  Theme-aware feature demonstration cards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { feature: 'palette', label: 'Palette' },
                    { feature: 'zap', label: 'Performance' },
                    { feature: 'book', label: 'Documentation' },
                    { feature: 'coffee', label: 'Comfort' },
                    { feature: 'star', label: 'Quality' },
                    { feature: 'rainbow', label: 'Colors' },
                  ].map((item) => (
                    <div key={item.feature} className="text-center space-y-2">
                      <ThemeAwareFeatureCard feature={item.feature as any} size={48} />
                      <div className="text-sm">{item.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Validation Section */}
        {activeDemo === 'validation' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Theme Validation</h2>
              <p className="text-muted-foreground">
                Real-time accessibility and consistency checking
              </p>
            </div>

            <ThemeValidationDashboard />
          </div>
        )}

        {/* Customization Section */}
        {activeDemo === 'customization' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Theme Customization</h2>
              <p className="text-muted-foreground">
                Fine-tune your theme experience
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Configuration</CardTitle>
                  <CardDescription>
                    Your active theme settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Transition Duration</Label>
                    <Badge variant="outline">
                      {config.transitions.duration}ms
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Enable Transitions</Label>
                    <Switch 
                      checked={config.transitions.enableTransitions}
                      disabled
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>System Sync</Label>
                    <Switch 
                      checked={config.persistence.syncWithSystem}
                      disabled
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Reduced Motion</Label>
                    <Switch 
                      checked={config.accessibility.respectReducedMotion}
                      disabled
                    />
                  </div>

                  <Separator />

                  <Button 
                    onClick={() => setShowCustomization(true)}
                    className="w-full"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Open Customization Panel
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Theme Statistics</CardTitle>
                  <CardDescription>
                    Real-time theme usage and performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Theme Consistency</span>
                        <span>95%</span>
                      </div>
                      <Progress value={95} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Accessibility Score</span>
                        <span>92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Performance</span>
                        <span>98%</span>
                      </div>
                      <Progress value={98} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>User Satisfaction</span>
                        <span>89%</span>
                      </div>
                      <Progress value={89} className="h-2" />
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">All systems optimal</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transition Demo */}
            <Card>
              <CardHeader>
                <CardTitle>Transition Demo</CardTitle>
                <CardDescription>
                  Experience smooth theme transitions in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-12 bg-muted/50 rounded-lg">
                  <div className="text-center space-y-4">
                    {isTransitioning ? (
                      <>
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto" />
                        <p className="text-muted-foreground">Applying theme transition...</p>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-8 w-8 mx-auto" />
                        <p className="text-muted-foreground">
                          Switch themes to see smooth transitions
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Theme Customization Panel */}
        <ThemeCustomizationPanel
          open={showCustomization}
          onOpenChange={setShowCustomization}
        />
      </div>
    </div>
  )
}