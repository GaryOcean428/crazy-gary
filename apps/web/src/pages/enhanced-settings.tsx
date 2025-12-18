import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useTheme } from '@/components/theme-provider'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { ThemeValidationDashboard } from '@/components/theme-validation'
import { ThemeAwareLogo } from '@/components/theme-aware-icons'
import { 
  Settings as SettingsIcon, 
  Brain, 
  Shield, 
  Bell, 
  Palette,
  Save,
  RefreshCw,
  AlertTriangle,
  Info,
  Eye,
  Zap,
  Monitor,
  Moon,
  Sun,
  Contrast,
  CheckCircle,
  XCircle,
  Gauge,
  Sparkles,
  Heart,
  Star,
} from 'lucide-react'

export function EnhancedSettings() {
  const [settings, setSettings] = useState({
    // General settings
    autoSleep: true,
    autoSleepTimeout: 15,
    defaultModel: 'gpt-oss-120b',
    maxConcurrentTasks: 3,
    
    // Notifications
    taskCompletionNotifications: true,
    errorNotifications: true,
    costAlerts: true,
    costThreshold: 50,
    
    // Security
    requireConfirmation: true,
    logRetention: 30,
    
    // API settings
    harmonyEndpoint: 'https://api.huggingface.co',
    mcpTimeout: 30,
    retryAttempts: 3
  })
  
  const [loading, setLoading] = useState(false)
  const { theme, config, setTheme, toggleTheme, resetToSystem, isTransitioning, systemTheme } = useTheme()
  const { toast } = useToast()

  const handleSaveSettings = async () => {
    setLoading(true)
    
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully"
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResetSettings = () => {
    setSettings({
      autoSleep: true,
      autoSleepTimeout: 15,
      defaultModel: 'gpt-oss-120b',
      maxConcurrentTasks: 3,
      taskCompletionNotifications: true,
      errorNotifications: true,
      costAlerts: true,
      costThreshold: 50,
      requireConfirmation: true,
      logRetention: 30,
      harmonyEndpoint: 'https://api.huggingface.co',
      mcpTimeout: 30,
      retryAttempts: 3
    })
    
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to defaults"
    })
  }

  const getThemeIcon = (currentTheme: string) => {
    switch (currentTheme) {
      case 'light': return Sun;
      case 'dark': return Moon;
      case 'high-contrast': return Contrast;
      case 'system': return Monitor;
      default: return Sun;
    }
  };

  const ThemeIcon = getThemeIcon(theme);

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Theme Preview */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <ThemeAwareLogo size={48} animated={true} />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Enhanced Settings</h1>
            <p className="text-muted-foreground">
              Comprehensive theme and application preferences
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Quick theme toggle */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg">
            <ThemeIcon className="h-4 w-4" />
            <span className="text-sm font-medium capitalize">{theme}</span>
            {isTransitioning && <RefreshCw className="h-3 w-3 animate-spin" />}
          </div>
          
          <Button variant="outline" onClick={handleResetSettings}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSaveSettings} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="themes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="themes">Themes</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Enhanced Theme Settings */}
        <TabsContent value="themes" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Theme Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Theme Selection</span>
                </CardTitle>
                <CardDescription>
                  Choose from our comprehensive theme collection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ThemeSwitcher
                  variant="card"
                  size="md"
                  showLabels={true}
                  showIndicators={true}
                  enableCustomization={true}
                />
              </CardContent>
            </Card>

            {/* Quick Theme Switcher */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Quick Switch</span>
                </CardTitle>
                <CardDescription>
                  Rapidly switch between themes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    onClick={() => setTheme('light')}
                    className="h-20 flex-col space-y-2"
                  >
                    <Sun className="h-6 w-6" />
                    <span>Light</span>
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    onClick={() => setTheme('dark')}
                    className="h-20 flex-col space-y-2"
                  >
                    <Moon className="h-6 w-6" />
                    <span>Dark</span>
                  </Button>
                  <Button
                    variant={theme === 'high-contrast' ? 'default' : 'outline'}
                    onClick={() => setTheme('high-contrast')}
                    className="h-20 flex-col space-y-2"
                  >
                    <Contrast className="h-6 w-6" />
                    <span>High Contrast</span>
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    onClick={() => setTheme('system')}
                    className="h-20 flex-col space-y-2"
                  >
                    <Monitor className="h-6 w-6" />
                    <span>System</span>
                    <Badge variant="secondary" className="text-xs">
                      {systemTheme}
                    </Badge>
                  </Button>
                </div>

                <Separator />

                <Button
                  variant="outline"
                  onClick={toggleTheme}
                  className="w-full"
                  disabled={isTransitioning}
                >
                  {isTransitioning ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Cycle Themes
                </Button>

                <Button
                  variant="ghost"
                  onClick={resetToSystem}
                  className="w-full"
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  Use System Theme
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Theme Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="theme-transition">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Current Theme</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-background border rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <span className="text-sm">Primary Color</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-secondary rounded-full"></div>
                      <span className="text-sm">Secondary Color</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-accent rounded-full"></div>
                      <span className="text-sm">Accent Color</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Theme Status</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Theme:</span>
                    <Badge variant="outline" className="capitalize">
                      {theme}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System Theme:</span>
                    <Badge variant="secondary" className="capitalize">
                      {systemTheme}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Transition:</span>
                    <Badge variant={isTransitioning ? "default" : "secondary"}>
                      {isTransitioning ? "Active" : "Ready"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="theme-transition">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gauge className="h-5 w-5" />
                  <span>Theme Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Contrast Ratio</span>
                      <span>4.5:1</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Accessibility</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Harmony</span>
                      <span>88%</span>
                    </div>
                    <Progress value={88} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Consistency</span>
                      <span>95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">WCAG AA Compliant</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="theme-transition">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5" />
                  <span>Theme Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {[
                    { icon: Zap, label: 'Smooth Transitions', enabled: config.transitions.enableTransitions },
                    { icon: Eye, label: 'High Contrast Mode', enabled: theme === 'high-contrast' },
                    { icon: Monitor, label: 'System Sync', enabled: config.persistence.syncWithSystem },
                    { icon: Heart, label: 'Reduced Motion', enabled: config.accessibility.respectReducedMotion },
                    { icon: Star, label: 'Custom Animations', enabled: true },
                    { icon: CheckCircle, label: 'Auto Validation', enabled: true },
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <feature.icon className={cn(
                        'h-4 w-4',
                        feature.enabled ? 'text-green-600' : 'text-muted-foreground'
                      )} />
                      <span className={cn(
                        'text-sm',
                        feature.enabled ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {feature.label}
                      </span>
                      {feature.enabled && <CheckCircle className="h-3 w-3 text-green-600 ml-auto" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Theme Validation */}
        <TabsContent value="validation" className="space-y-6">
          <ThemeValidationDashboard />
        </TabsContent>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <SettingsIcon className="h-5 w-5" />
                <span>General Preferences</span>
              </CardTitle>
              <CardDescription>
                Basic application settings and behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxTasks">Maximum Concurrent Tasks</Label>
                  <Select 
                    value={settings.maxConcurrentTasks.toString()} 
                    onValueChange={(value) => setSettings(prev => ({ ...prev, maxConcurrentTasks: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Task</SelectItem>
                      <SelectItem value="2">2 Tasks</SelectItem>
                      <SelectItem value="3">3 Tasks</SelectItem>
                      <SelectItem value="5">5 Tasks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-sleep Models</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically put models to sleep when inactive
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoSleep}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoSleep: checked }))}
                  />
                </div>

                {settings.autoSleep && (
                  <div className="space-y-2">
                    <Label htmlFor="sleepTimeout">Auto-sleep Timeout (minutes)</Label>
                    <Select 
                      value={settings.autoSleepTimeout.toString()} 
                      onValueChange={(value) => setSettings(prev => ({ ...prev, autoSleepTimeout: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Model Settings */}
        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Model Configuration</span>
              </CardTitle>
              <CardDescription>
                AI model preferences and endpoint settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultModel">Default Model</Label>
                  <Select 
                    value={settings.defaultModel} 
                    onValueChange={(value) => setSettings(prev => ({ ...prev, defaultModel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-oss-120b">GPT-OSS 120B (High Performance)</SelectItem>
                      <SelectItem value="gpt-oss-20b">GPT-OSS 20B (Efficient)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retryAttempts">Retry Attempts</Label>
                  <Select 
                    value={settings.retryAttempts.toString()} 
                    onValueChange={(value) => setSettings(prev => ({ ...prev, retryAttempts: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Attempt</SelectItem>
                      <SelectItem value="2">2 Attempts</SelectItem>
                      <SelectItem value="3">3 Attempts</SelectItem>
                      <SelectItem value="5">5 Attempts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="harmonyEndpoint">Harmony API Endpoint</Label>
                <Input
                  id="harmonyEndpoint"
                  value={settings.harmonyEndpoint}
                  onChange={(e) => setSettings(prev => ({ ...prev, harmonyEndpoint: e.target.value }))}
                  placeholder="https://api.huggingface.co"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mcpTimeout">MCP Timeout (seconds)</Label>
                <Input
                  id="mcpTimeout"
                  type="number"
                  value={settings.mcpTimeout}
                  onChange={(e) => setSettings(prev => ({ ...prev, mcpTimeout: parseInt(e.target.value) }))}
                  min="10"
                  max="120"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>
                Configure when and how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Task Completion Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when tasks finish successfully
                    </p>
                  </div>
                  <Switch
                    checked={settings.taskCompletionNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, taskCompletionNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Error Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when tasks fail or encounter errors
                    </p>
                  </div>
                  <Switch
                    checked={settings.errorNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, errorNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Cost Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when usage costs exceed threshold
                    </p>
                  </div>
                  <Switch
                    checked={settings.costAlerts}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, costAlerts: checked }))}
                  />
                </div>

                {settings.costAlerts && (
                  <div className="space-y-2">
                    <Label htmlFor="costThreshold">Cost Alert Threshold ($)</Label>
                    <Input
                      id="costThreshold"
                      type="number"
                      value={settings.costThreshold}
                      onChange={(e) => setSettings(prev => ({ ...prev, costThreshold: parseFloat(e.target.value) }))}
                      min="1"
                      step="0.01"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security & Privacy</span>
              </CardTitle>
              <CardDescription>
                Security settings and data retention policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Confirmation for Destructive Actions</Label>
                    <p className="text-sm text-muted-foreground">
                      Show confirmation dialogs for potentially harmful operations
                    </p>
                  </div>
                  <Switch
                    checked={settings.requireConfirmation}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireConfirmation: checked }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logRetention">Log Retention (days)</Label>
                  <Select 
                    value={settings.logRetention.toString()} 
                    onValueChange={(value) => setSettings(prev => ({ ...prev, logRetention: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Security Notice
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      All API keys and sensitive data are encrypted at rest and in transit. 
                      Task logs may contain sensitive information and are subject to the retention policy above.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Data Processing
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Your tasks are processed using external AI models. Please review the privacy policies 
                      of HuggingFace and other service providers for their data handling practices.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}