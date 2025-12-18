import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/components/theme-provider';
import { ThemeTokens, Theme } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  Zap,
  Palette,
  Shield,
  Gauge,
  RefreshCw,
} from 'lucide-react';

// Theme validation utilities
export class ThemeValidator {
  private static contrastCache = new Map<string, number>();

  /**
   * Calculate relative luminance for contrast ratio calculation
   */
  private static getLuminance(color: string): number {
    // Parse RGB values from various color formats
    const rgb = this.parseColor(color);
    if (!rgb) return 0;

    const [r, g, b] = rgb.map(c => {
      const channel = c / 255;
      return channel <= 0.03928 
        ? channel / 12.92 
        : Math.pow((channel + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Parse color string to RGB values
   */
  private static parseColor(color: string): [number, number, number] | null {
    // Handle hex colors
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      if (hex.length === 3) {
        const r = parseInt(hex[0] + hex[0], 16);
        const g = parseInt(hex[1] + hex[1], 16);
        const b = parseInt(hex[2] + hex[2], 16);
        return [r, g, b];
      }
      if (hex.length === 6) {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return [r, g, b];
      }
    }

    // Handle rgb/rgba colors
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      return [
        parseInt(rgbMatch[1]),
        parseInt(rgbMatch[2]),
        parseInt(rgbMatch[3]),
      ];
    }

    // Handle OKLCH colors (simplified)
    const oklchMatch = color.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
    if (oklchMatch) {
      // Convert OKLCH to approximate RGB (simplified conversion)
      const l = parseFloat(oklchMatch[1]);
      const c = parseFloat(oklchMatch[2]);
      const h = parseFloat(oklchMatch[3]) * (Math.PI / 180);
      
      // Simplified OKLCH to RGB conversion
      const r = Math.round(255 * (l + c * Math.cos(h) * 0.3));
      const g = Math.round(255 * (l + c * Math.sin(h) * 0.3));
      const b = Math.round(255 * (l - c * Math.cos(h) * 0.2));
      
      return [Math.max(0, Math.min(255, r)), Math.max(0, Math.min(255, g)), Math.max(0, Math.min(255, b))];
    }

    return null;
  }

  /**
   * Calculate contrast ratio between two colors
   */
  static getContrastRatio(foreground: string, background: string): number {
    const cacheKey = `${foreground}-${background}`;
    if (this.contrastCache.has(cacheKey)) {
      return this.contrastCache.get(cacheKey)!;
    }

    const fgLuminance = this.getLuminance(foreground);
    const bgLuminance = this.getLuminance(background);
    
    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);
    
    const ratio = (lighter + 0.05) / (darker + 0.05);
    this.contrastCache.set(cacheKey, ratio);
    
    return ratio;
  }

  /**
   * Validate contrast ratios for accessibility
   */
  static validateContrast(tokens: ThemeTokens): {
    passed: boolean;
    issues: Array<{ pair: string; ratio: number; expected: number; actual: string }>;
    score: number;
  } {
    const issues: Array<{ pair: string; ratio: number; expected: number; actual: string }> = [];
    let totalChecks = 0;
    let passedChecks = 0;

    // WCAG AA requirements (4.5:1 for normal text, 3:1 for large text)
    const requirements = {
      normal: 4.5,
      large: 3.0,
      ui: 3.0,
    };

    // Check primary text combinations
    const textCombinations = [
      { fg: tokens.colors.foreground, bg: tokens.colors.background, type: 'normal', name: 'Text on Background' },
      { fg: tokens.colors.cardForeground, bg: tokens.colors.card, type: 'normal', name: 'Card Text' },
      { fg: tokens.colors.popoverForeground, bg: tokens.colors.popover, type: 'normal', name: 'Popover Text' },
      { fg: tokens.colors.mutedForeground, bg: tokens.colors.muted, type: 'normal', name: 'Muted Text' },
    ];

    textCombinations.forEach(({ fg, bg, type, name }) => {
      totalChecks++;
      const ratio = this.getContrastRatio(fg, bg);
      const required = requirements[type as keyof typeof requirements];
      
      if (ratio >= required) {
        passedChecks++;
      } else {
        issues.push({
          pair: name,
          ratio,
          expected: required,
          actual: `${ratio.toFixed(2)}:1`,
        });
      }
    });

    // Check button and interactive element combinations
    const buttonCombinations = [
      { fg: tokens.colors.primaryForeground, bg: tokens.colors.primary, type: 'ui', name: 'Primary Button' },
      { fg: tokens.colors.secondaryForeground, bg: tokens.colors.secondary, type: 'ui', name: 'Secondary Button' },
      { fg: tokens.colors.accentForeground, bg: tokens.colors.accent, type: 'ui', name: 'Accent Button' },
    ];

    buttonCombinations.forEach(({ fg, bg, type, name }) => {
      totalChecks++;
      const ratio = this.getContrastRatio(fg, bg);
      const required = requirements[type as keyof typeof requirements];
      
      if (ratio >= required) {
        passedChecks++;
      } else {
        issues.push({
          pair: name,
          ratio,
          expected: required,
          actual: `${ratio.toFixed(2)}:1`,
        });
      }
    });

    const score = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 100;
    
    return {
      passed: issues.length === 0,
      issues,
      score: Math.round(score),
    };
  }

  /**
   * Validate color harmony and consistency
   */
  static validateColorHarmony(tokens: ThemeTokens): {
    passed: boolean;
    issues: string[];
    score: number;
  } {
    const issues: string[] = [];
    let totalChecks = 8;
    let passedChecks = 0;

    // Check if primary colors are sufficiently different
    const primaryContrast = this.getContrastRatio(tokens.colors.primary, tokens.colors.secondary);
    if (primaryContrast >= 1.5) {
      passedChecks++;
    } else {
      issues.push('Primary and secondary colors are too similar');
    }

    // Check if accent color provides enough contrast
    const accentContrast = this.getContrastRatio(tokens.colors.accent, tokens.colors.background);
    if (accentContrast >= 1.5) {
      passedChecks++;
    } else {
      issues.push('Accent color lacks sufficient contrast with background');
    }

    // Check if destructive color is distinct
    const destructiveContrast = this.getContrastRatio(tokens.colors.destructive, tokens.colors.primary);
    if (destructiveContrast >= 2.0) {
      passedChecks++;
    } else {
      issues.push('Destructive color is not sufficiently distinct from primary color');
    }

    // Check muted color is appropriately subtle
    const mutedContrast = this.getContrastRatio(tokens.colors.mutedForeground, tokens.colors.muted);
    if (mutedContrast >= 3.0) {
      passedChecks++;
    } else {
      issues.push('Muted text color lacks sufficient contrast');
    }

    // Check border visibility
    const borderContrast = this.getContrastRatio(tokens.colors.border, tokens.colors.background);
    if (borderContrast >= 1.2) {
      passedChecks++;
    } else {
      issues.push('Border color is too subtle');
    }

    // Check input field visibility
    const inputContrast = this.getContrastRatio(tokens.colors.input, tokens.colors.background);
    if (inputContrast >= 1.2) {
      passedChecks++;
    } else {
      issues.push('Input field background lacks sufficient contrast');
    }

    // Check ring/focus indicator visibility
    const ringContrast = this.getContrastRatio(tokens.colors.ring, tokens.colors.background);
    if (ringContrast >= 1.5) {
      passedChecks++;
    } else {
      issues.push('Focus ring color lacks sufficient contrast');
    }

    // Check sidebar consistency
    const sidebarContrast = this.getContrastRatio(tokens.colors.sidebarForeground, tokens.colors.sidebar);
    if (sidebarContrast >= 4.5) {
      passedChecks++;
    } else {
      issues.push('Sidebar text lacks sufficient contrast');
    }

    const score = (passedChecks / totalChecks) * 100;
    
    return {
      passed: issues.length === 0,
      issues,
      score: Math.round(score),
    };
  }

  /**
   * Validate theme consistency across all elements
   */
  static validateThemeConsistency(tokens: ThemeTokens): {
    passed: boolean;
    issues: string[];
    score: number;
  } {
    const issues: string[] = [];
    let totalChecks = 5;
    let passedChecks = 0;

    // Check if foreground colors are consistent
    const foregroundColors = [
      tokens.colors.foreground,
      tokens.colors.cardForeground,
      tokens.colors.popoverForeground,
      tokens.colors.secondaryForeground,
    ];

    const uniqueForegroundColors = new Set(foregroundColors);
    if (uniqueForegroundColors.size <= 2) {
      passedChecks++;
    } else {
      issues.push('Multiple different foreground colors detected - consider simplifying');
    }

    // Check if background colors are consistent
    const backgroundColors = [
      tokens.colors.background,
      tokens.colors.card,
      tokens.colors.popover,
      tokens.colors.input,
    ];

    const uniqueBackgroundColors = new Set(backgroundColors);
    if (uniqueBackgroundColors.size <= 2) {
      passedChecks++;
    } else {
      issues.push('Multiple different background colors detected - consider simplifying');
    }

    // Check spacing consistency (using CSS custom properties)
    const spacingValues = Object.values(tokens.spacing);
    const uniqueSpacingValues = new Set(spacingValues);
    if (uniqueSpacingValues.size >= 3) {
      passedChecks++;
    } else {
      issues.push('Spacing system lacks sufficient variety');
    }

    // Check border radius consistency
    const radiusValues = Object.values(tokens.borderRadius);
    const hasConsistentRadius = radiusValues.some(radius => 
      radius.includes('var(--radius)') || radius.includes('0.75rem')
    );
    if (hasConsistentRadius) {
      passedChecks++;
    } else {
      issues.push('Border radius system lacks base consistency');
    }

    // Check animation consistency
    const animationValues = Object.values(tokens.animation.duration);
    const uniqueAnimationDurations = new Set(animationValues);
    if (uniqueAnimationDurations.size >= 2) {
      passedChecks++;
    } else {
      issues.push('Animation duration system lacks sufficient variety');
    }

    const score = (passedChecks / totalChecks) * 100;
    
    return {
      passed: issues.length === 0,
      issues,
      score: Math.round(score),
    };
  }

  /**
   * Generate comprehensive theme validation report
   */
  static generateValidationReport(tokens: ThemeTokens) {
    const contrast = this.validateContrast(tokens);
    const harmony = this.validateColorHarmony(tokens);
    const consistency = this.validateThemeConsistency(tokens);

    const overallScore = Math.round((contrast.score + harmony.score + consistency.score) / 3);

    return {
      overall: {
        score: overallScore,
        passed: contrast.passed && harmony.passed && consistency.passed,
      },
      contrast,
      harmony,
      consistency,
      summary: {
        totalIssues: contrast.issues.length + harmony.issues.length + consistency.issues.length,
        criticalIssues: contrast.issues.filter(issue => issue.ratio < 3).length,
        warnings: harmony.issues.length + consistency.issues.length,
      },
    };
  }
}

// Theme Validation Dashboard Component
export function ThemeValidationDashboard() {
  const { theme, config } = useTheme();
  const [validationReport, setValidationReport] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidated, setLastValidated] = useState<Date | null>(null);

  const runValidation = useCallback(async () => {
    setIsValidating(true);
    
    // Simulate validation process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real implementation, you would generate actual tokens
    const mockTokens = {
      colors: {
        background: 'oklch(1 0 0)',
        foreground: 'oklch(0.145 0 0)',
        primary: 'oklch(0.446 0.268 275.75)',
        primaryForeground: 'oklch(0.985 0 0)',
        // ... other colors
      } as any,
      spacing: config.tokens?.spacing || { xs: '0.25rem', sm: '0.5rem', md: '1rem' },
      borderRadius: config.tokens?.borderRadius || { sm: '0.25rem', md: '0.5rem' },
      animation: config.tokens?.animation || { duration: { fast: '150ms', normal: '300ms' } },
    };
    
    const report = ThemeValidator.generateValidationReport(mockTokens);
    setValidationReport(report);
    setLastValidated(new Date());
    setIsValidating(false);
  }, [config]);

  useEffect(() => {
    runValidation();
  }, [runValidation]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  if (isValidating) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <div>
            <h3 className="font-semibold">Validating Theme...</h3>
            <p className="text-sm text-muted-foreground">
              Checking accessibility, harmony, and consistency
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!validationReport) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">No Validation Data</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Run validation to check your theme's accessibility and consistency
          </p>
          <Button onClick={runValidation}>
            <Gauge className="h-4 w-4 mr-2" />
            Run Validation
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Shield className="h-6 w-6 mr-2" />
            Theme Validation Report
          </h2>
          <div className="flex items-center space-x-2">
            <Badge variant={getScoreBadgeVariant(validationReport.overall.score)}>
              {validationReport.overall.score}% Score
            </Badge>
            {validationReport.overall.passed ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
          </div>
        </div>

        {lastValidated && (
          <p className="text-sm text-muted-foreground mb-4">
            Last validated: {lastValidated.toLocaleString()}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Accessibility Score */}
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">
              <span className={getScoreColor(validationReport.contrast.score)}>
                {validationReport.contrast.score}%
              </span>
            </div>
            <h3 className="font-medium flex items-center justify-center">
              <Eye className="h-4 w-4 mr-1" />
              Accessibility
            </h3>
            <p className="text-xs text-muted-foreground">
              {validationReport.contrast.issues.length} issues found
            </p>
          </div>

          {/* Harmony Score */}
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">
              <span className={getScoreColor(validationReport.harmony.score)}>
                {validationReport.harmony.score}%
              </span>
            </div>
            <h3 className="font-medium flex items-center justify-center">
              <Palette className="h-4 w-4 mr-1" />
              Color Harmony
            </h3>
            <p className="text-xs text-muted-foreground">
              {validationReport.harmony.issues.length} issues found
            </p>
          </div>

          {/* Consistency Score */}
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">
              <span className={getScoreColor(validationReport.consistency.score)}>
                {validationReport.consistency.score}%
              </span>
            </div>
            <h3 className="font-medium flex items-center justify-center">
              <Zap className="h-4 w-4 mr-1" />
              Consistency
            </h3>
            <p className="text-xs text-muted-foreground">
              {validationReport.consistency.issues.length} issues found
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="font-medium">Issues Summary:</span>
              <span className="ml-2">
                {validationReport.summary.criticalIssues} critical, {validationReport.summary.warnings} warnings
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={runValidation}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Re-validate
            </Button>
          </div>
        </div>
      </Card>

      {/* Detailed Issues */}
      {(validationReport.contrast.issues.length > 0 || 
        validationReport.harmony.issues.length > 0 || 
        validationReport.consistency.issues.length > 0) && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Issues Found</h3>
          <div className="space-y-4">
            {validationReport.contrast.issues.map((issue: any, index: number) => (
              <div key={`contrast-${index}`} className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-900 dark:text-red-100">{issue.pair}</h4>
                  <p className="text-sm text-red-700 dark:text-red-200">
                    Contrast ratio {issue.actual} (expected {issue.expected}:1)
                  </p>
                </div>
              </div>
            ))}

            {validationReport.harmony.issues.map((issue: string, index: number) => (
              <div key={`harmony-${index}`} className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Color Harmony</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-200">{issue}</p>
                </div>
              </div>
            ))}

            {validationReport.consistency.issues.map((issue: string, index: number) => (
              <div key={`consistency-${index}`} className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">Consistency</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-200">{issue}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default ThemeValidationDashboard;