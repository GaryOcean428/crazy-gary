import React, { useState, useCallback } from 'react';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Sun, 
  Moon, 
  Contrast, 
  Monitor, 
  Palette, 
  Settings, 
  Eye, 
  Zap,
  Check,
  RefreshCw
} from 'lucide-react';

interface ThemeSwitcherProps {
  variant?: 'button' | 'dropdown' | 'card' | 'floating';
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  showIndicators?: boolean;
  enableCustomization?: boolean;
  className?: string;
  onCustomize?: (config: any) => void;
}

const themeOptions = [
  {
    value: 'light' as const,
    label: 'Light',
    icon: Sun,
    description: 'Clean and bright interface',
    gradient: 'from-yellow-400 to-orange-500',
  },
  {
    value: 'dark' as const,
    label: 'Dark',
    icon: Moon,
    description: 'Easy on the eyes',
    gradient: 'from-purple-500 to-blue-600',
  },
  {
    value: 'high-contrast' as const,
    label: 'High Contrast',
    icon: Contrast,
    description: 'Maximum accessibility',
    gradient: 'from-red-500 to-yellow-500',
  },
  {
    value: 'system' as const,
    label: 'System',
    icon: Monitor,
    description: 'Follows your device',
    gradient: 'from-green-400 to-blue-500',
  },
];

export function ThemeSwitcher({
  variant = 'dropdown',
  size = 'md',
  showLabels = false,
  showIndicators = true,
  enableCustomization = true,
  className,
  onCustomize,
}: ThemeSwitcherProps) {
  const { theme, config, setTheme, toggleTheme, resetToSystem, isTransitioning } = useTheme();
  const [showCustomization, setShowCustomization] = useState(false);

  const handleThemeChange = useCallback((newTheme: typeof theme) => {
    setTheme(newTheme);
  }, [setTheme]);

  const handleQuickToggle = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 16;
      case 'lg': return 24;
      default: return 20;
    }
  };

  const iconSize = getIconSize();

  // Button variant - simple theme toggle
  if (variant === 'button') {
    const IconComponent = theme === 'dark' || theme === 'high-contrast' ? Sun : Moon;
    
    return (
      <Button
        variant="outline"
        size={size}
        onClick={handleQuickToggle}
        disabled={isTransitioning}
        className={cn('theme-transition', className)}
        title={`Switch to ${theme === 'dark' || theme === 'high-contrast' ? 'light' : 'dark'} theme`}
      >
        {isTransitioning ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <IconComponent className="h-4 w-4" />
        )}
        {showLabels && (
          <span className="ml-2">
            {theme === 'dark' || theme === 'high-contrast' ? 'Light' : 'Dark'}
          </span>
        )}
      </Button>
    );
  }

  // Dropdown variant - full theme selection
  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size={size}
            disabled={isTransitioning}
            className={cn('theme-transition', className)}
          >
            {isTransitioning ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Settings className="h-4 w-4" />
            )}
            {showLabels && <span className="ml-2">Theme</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Choose Theme</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {themeOptions.map((option) => {
            const IconComponent = option.icon;
            const isSelected = theme === option.value;
            
            return (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleThemeChange(option.value)}
                className="cursor-pointer"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className={cn(
                    'p-1.5 rounded-md bg-gradient-to-br',
                    option.gradient
                  )}>
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{option.label}</span>
                      {showIndicators && isSelected && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            );
          })}
          {enableCustomization && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowCustomization(true)}
                className="cursor-pointer"
              >
                <Palette className="h-4 w-4 mr-3" />
                Customize Theme
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Card variant - visual theme selector
  if (variant === 'card') {
    return (
      <Card className={cn('p-4 theme-transition', className)}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              Theme Selection
            </h3>
            {isTransitioning && (
              <Badge variant="secondary" className="animate-pulse">
                <Zap className="h-3 w-3 mr-1" />
                Applying
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {themeOptions.map((option) => {
              const IconComponent = option.icon;
              const isSelected = theme === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value)}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all duration-200 text-left',
                    'hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-ring',
                    isSelected 
                      ? 'border-primary bg-primary/10 shadow-md' 
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      'p-2 rounded-md bg-gradient-to-br flex-shrink-0',
                      option.gradient
                    )}>
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{option.label}</span>
                        {showIndicators && isSelected && (
                          <Check className="h-3 w-3 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          
          {enableCustomization && (
            <div className="pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCustomization(true)}
                className="w-full"
              >
                <Settings className="h-4 w-4 mr-2" />
                Advanced Settings
              </Button>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Floating variant - compact theme switcher
  if (variant === 'floating') {
    return (
      <div className={cn(
        'fixed bottom-4 right-4 z-50',
        className
      )}>
        <Card className="p-2 shadow-lg">
          <div className="flex items-center space-x-1">
            {themeOptions.slice(0, 3).map((option) => {
              const IconComponent = option.icon;
              const isSelected = theme === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value)}
                  className={cn(
                    'p-2 rounded-md transition-all duration-200',
                    'hover:bg-accent focus:bg-accent focus:outline-none focus:ring-2 focus:ring-ring',
                    isSelected && 'bg-primary text-primary-foreground'
                  )}
                  title={option.label}
                >
                  <IconComponent className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    );
  }

  return null;
}

// Theme Customization Panel Component
interface ThemeCustomizationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (config: any) => void;
}

export function ThemeCustomizationPanel({
  open,
  onOpenChange,
  onSave,
}: ThemeCustomizationPanelProps) {
  const { config, setConfig } = useTheme();
  const [localConfig, setLocalConfig] = useState(config);

  const handleSave = useCallback(() => {
    setConfig(localConfig);
    onSave?.(localConfig);
    onOpenChange(false);
  }, [localConfig, setConfig, onSave, onOpenChange]);

  const handleReset = useCallback(() => {
    setLocalConfig(config);
  }, [config]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 theme-transition">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Theme Customization
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              ×
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Transition Duration</label>
              <input
                type="range"
                min="0"
                max="1000"
                step="50"
                value={localConfig.transitions.duration}
                onChange={(e) => setLocalConfig({
                  ...localConfig,
                  transitions: {
                    ...localConfig.transitions,
                    duration: parseInt(e.target.value)
                  }
                })}
                className="w-full mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Instant</span>
                <span>{localConfig.transitions.duration}ms</span>
                <span>Slow</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Enable Transitions</label>
              <input
                type="checkbox"
                checked={localConfig.transitions.enableTransitions}
                onChange={(e) => setLocalConfig({
                  ...localConfig,
                  transitions: {
                    ...localConfig.transitions,
                    enableTransitions: e.target.checked
                  }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Sync with System</label>
              <input
                type="checkbox"
                checked={localConfig.persistence.syncWithSystem}
                onChange={(e) => setLocalConfig({
                  ...localConfig,
                  persistence: {
                    ...localConfig.persistence,
                    syncWithSystem: e.target.checked
                  }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Respect Reduced Motion</label>
              <input
                type="checkbox"
                checked={localConfig.accessibility.respectReducedMotion}
                onChange={(e) => setLocalConfig({
                  ...localConfig,
                  accessibility: {
                    ...localConfig.accessibility,
                    respectReducedMotion: e.target.checked
                  }
                })}
              />
            </div>
          </div>

          <div className="flex space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex-1"
            >
              Reset
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="flex-1"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ThemeSwitcher;