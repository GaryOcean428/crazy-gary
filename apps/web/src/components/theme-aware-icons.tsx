import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import {
  Sun,
  Moon,
  Monitor,
  Contrast,
  Palette,
  Eye,
  Zap,
  Star,
  Heart,
  Coffee,
  BookOpen,
  Code,
  Lightbulb,
  Sparkles,
  Rainbow,
} from 'lucide-react';

// Theme-aware icon wrapper component
interface ThemeAwareIconProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'auto' | 'manual';
  lightIcon?: React.ComponentType<any>;
  darkIcon?: React.ComponentType<any>;
  highContrastIcon?: React.ComponentType<any>;
  size?: number;
}

export function ThemeAwareIcon({
  children,
  className,
  variant = 'auto',
  lightIcon: LightIcon,
  darkIcon: DarkIcon,
  highContrastIcon: HighContrastIcon,
  size = 24,
  ...props
}: ThemeAwareIconProps) {
  const { theme, systemTheme } = useTheme();

  // Determine the effective theme
  const getEffectiveTheme = () => {
    if (variant === 'manual') return theme;
    if (theme === 'system') return systemTheme;
    return theme;
  };

  const effectiveTheme = getEffectiveTheme();

  // If using manual variant with different icons for each theme
  if (variant === 'manual' && (LightIcon || DarkIcon || HighContrastIcon)) {
    const IconComponent = 
      effectiveTheme === 'high-contrast' && HighContrastIcon ? HighContrastIcon :
      effectiveTheme === 'dark' && DarkIcon ? DarkIcon :
      LightIcon || DarkIcon || HighContrastIcon || (() => children);

    return (
      <IconComponent 
        className={cn('theme-transition', className)} 
        size={size} 
        {...props} 
      />
    );
  }

  // Default behavior - return children with theme-aware styling
  return (
    <div 
      className={cn(
        'theme-transition',
        effectiveTheme === 'dark' && 'text-foreground',
        effectiveTheme === 'light' && 'text-foreground',
        effectiveTheme === 'high-contrast' && 'text-foreground font-bold',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Pre-built theme-aware icon components
export const ThemeAwareSun: React.FC<{ className?: string; size?: number }> = ({ 
  className, 
  size = 24 
}) => {
  const { theme, systemTheme } = useTheme();
  const effectiveTheme = theme === 'system' ? systemTheme : theme;
  
  return (
    <Sun 
      className={cn(
        'theme-transition',
        effectiveTheme === 'high-contrast' && 'stroke-[3px]',
        className
      )} 
      size={size} 
    />
  );
};

export const ThemeAwareMoon: React.FC<{ className?: string; size?: number }> = ({ 
  className, 
  size = 24 
}) => {
  const { theme, systemTheme } = useTheme();
  const effectiveTheme = theme === 'system' ? systemTheme : theme;
  
  return (
    <Moon 
      className={cn(
        'theme-transition',
        effectiveTheme === 'high-contrast' && 'stroke-[3px]',
        className
      )} 
      size={size} 
    />
  );
};

export const ThemeAwareMonitor: React.FC<{ className?: string; size?: number }> = ({ 
  className, 
  size = 24 
}) => {
  const { theme, systemTheme } = useTheme();
  const effectiveTheme = theme === 'system' ? systemTheme : theme;
  
  return (
    <Monitor 
      className={cn(
        'theme-transition',
        effectiveTheme === 'high-contrast' && 'stroke-[3px]',
        className
      )} 
      size={size} 
    />
  );
};

export const ThemeAwareContrast: React.FC<{ className?: string; size?: number }> = ({ 
  className, 
  size = 24 
}) => {
  const { theme, systemTheme } = useTheme();
  const effectiveTheme = theme === 'system' ? systemTheme : theme;
  
  return (
    <Contrast 
      className={cn(
        'theme-transition',
        effectiveTheme === 'high-contrast' && 'stroke-[3px] text-yellow-400',
        className
      )} 
      size={size} 
    />
  );
};

// Theme-aware illustration components
interface ThemeAwareIllustrationProps {
  className?: string;
  size?: number;
  animated?: boolean;
}

export const ThemeAwareLogo: React.FC<ThemeAwareIllustrationProps> = ({ 
  className, 
  size = 64,
  animated = true 
}) => {
  const { theme, systemTheme } = useTheme();
  const effectiveTheme = theme === 'system' ? systemTheme : theme;

  return (
    <div 
      className={cn(
        'theme-transition relative',
        animated && 'animate-pulse',
        className
      )}
      style={{ width: size, height: size }}
    >
      {/* Logo background with theme-aware gradient */}
      <div 
        className={cn(
          'absolute inset-0 rounded-xl theme-transition',
          effectiveTheme === 'light' && 'bg-gradient-to-br from-blue-500 to-purple-600',
          effectiveTheme === 'dark' && 'bg-gradient-to-br from-purple-600 to-blue-700',
          effectiveTheme === 'high-contrast' && 'bg-gradient-to-br from-yellow-400 to-red-500'
        )}
      />
      
      {/* Logo icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Sparkles 
          className={cn(
            'text-white theme-transition',
            effectiveTheme === 'high-contrast' && 'stroke-[3px]'
          )} 
          size={size * 0.4} 
        />
      </div>
      
      {/* Glow effect for non-high-contrast themes */}
      {effectiveTheme !== 'high-contrast' && (
        <div 
          className={cn(
            'absolute inset-0 rounded-xl blur-xl opacity-30 theme-transition',
            effectiveTheme === 'light' && 'bg-gradient-to-br from-blue-500 to-purple-600',
            effectiveTheme === 'dark' && 'bg-gradient-to-br from-purple-600 to-blue-700'
          )}
        />
      )}
    </div>
  );
};

export const ThemeAwareHero: React.FC<ThemeAwareIllustrationProps> = ({ 
  className, 
  size = 200,
  animated = true 
}) => {
  const { theme, systemTheme } = useTheme();
  const effectiveTheme = theme === 'system' ? systemTheme : theme;

  return (
    <div 
      className={cn(
        'relative theme-transition',
        animated && 'animate-float',
        className
      )}
      style={{ width: size, height: size * 0.6 }}
    >
      {/* Background shapes */}
      <div 
        className={cn(
          'absolute inset-0 rounded-3xl theme-transition',
          effectiveTheme === 'light' && 'bg-gradient-to-br from-indigo-100 to-purple-100',
          effectiveTheme === 'dark' && 'bg-gradient-to-br from-indigo-900/50 to-purple-900/50',
          effectiveTheme === 'high-contrast' && 'bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-white'
        )}
      />
      
      {/* Central icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Lightbulb 
          className={cn(
            'theme-transition',
            effectiveTheme === 'light' && 'text-indigo-600',
            effectiveTheme === 'dark' && 'text-indigo-400',
            effectiveTheme === 'high-contrast' && 'text-yellow-400 stroke-[3px]'
          )} 
          size={size * 0.3} 
        />
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-4 left-4">
        <Star 
          className={cn(
            'theme-transition',
            effectiveTheme === 'light' && 'text-yellow-400',
            effectiveTheme === 'dark' && 'text-yellow-300',
            effectiveTheme === 'high-contrast' && 'text-yellow-400 stroke-[3px]'
          )} 
          size={size * 0.1} 
        />
      </div>
      
      <div className="absolute bottom-4 right-4">
        <Heart 
          className={cn(
            'theme-transition',
            effectiveTheme === 'light' && 'text-pink-400',
            effectiveTheme === 'dark' && 'text-pink-300',
            effectiveTheme === 'high-contrast' && 'text-pink-400 stroke-[3px]'
          )} 
          size={size * 0.08} 
        />
      </div>
      
      {/* Code brackets for developer theme */}
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
        <Code 
          className={cn(
            'theme-transition',
            effectiveTheme === 'light' && 'text-green-500',
            effectiveTheme === 'dark' && 'text-green-400',
            effectiveTheme === 'high-contrast' && 'text-green-400 stroke-[3px]'
          )} 
          size={size * 0.12} 
        />
      </div>
    </div>
  );
};

export const ThemeAwareFeatureCard: React.FC<ThemeAwareIllustrationProps & {
  feature: 'palette' | 'zap' | 'book' | 'coffee' | 'star' | 'rainbow';
}> = ({ 
  className, 
  size = 48,
  animated = true,
  feature 
}) => {
  const { theme, systemTheme } = useTheme();
  const effectiveTheme = theme === 'system' ? systemTheme : theme;

  const getFeatureIcon = () => {
    switch (feature) {
      case 'palette': return Palette;
      case 'zap': return Zap;
      case 'book': return BookOpen;
      case 'coffee': return Coffee;
      case 'star': return Star;
      case 'rainbow': return Rainbow;
      default: return Palette;
    }
  };

  const FeatureIcon = getFeatureIcon();

  return (
    <div 
      className={cn(
        'relative theme-transition',
        animated && 'animate-bounce-subtle',
        className
      )}
      style={{ width: size, height: size }}
    >
      {/* Background circle */}
      <div 
        className={cn(
          'absolute inset-0 rounded-full theme-transition flex items-center justify-center',
          effectiveTheme === 'light' && 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200',
          effectiveTheme === 'dark' && 'bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-blue-800',
          effectiveTheme === 'high-contrast' && 'bg-black border-2 border-white'
        )}
      />
      
      {/* Feature icon */}
      <FeatureIcon 
        className={cn(
          'theme-transition relative z-10',
          effectiveTheme === 'light' && 'text-blue-600',
          effectiveTheme === 'dark' && 'text-blue-400',
          effectiveTheme === 'high-contrast' && 'text-white stroke-[2px]'
        )} 
        size={size * 0.5} 
      />
    </div>
  );
};

// Animation keyframes for theme-aware animations
const themeAwareAnimations = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes bounce-subtle {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
  }
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;

// Add animations to document if they don't exist
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = themeAwareAnimations;
  document.head.appendChild(styleSheet);
}

// Export all theme-aware components
export {
  ThemeAwareIcon as Icon,
  ThemeAwareSun as SunIcon,
  ThemeAwareMoon as MoonIcon,
  ThemeAwareMonitor as MonitorIcon,
  ThemeAwareContrast as ContrastIcon,
  ThemeAwareLogo as Logo,
  ThemeAwareHero as Hero,
  ThemeAwareFeatureCard as FeatureCard,
};