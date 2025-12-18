import { MonitoringConfig, PerformanceReport, PerformanceMetric, PerformanceRegression, WebVitals } from '../types';
import { WebVitalsTracker } from '../tracking/WebVitalsTracker';
import { BundleAnalyzer } from '../tracking/BundleAnalyzer';
import { MemoryMonitor } from '../monitoring/MemoryMonitor';
import { BudgetEnforcer } from '../metrics/BudgetEnforcer';

export class ReportGenerator {
  static async generate(config: MonitoringConfig): Promise<PerformanceReport> {
    const report: PerformanceReport = {
      id: this.generateReportId(),
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      webVitals: this.collectWebVitals(),
      metrics: this.collectMetrics(),
      memoryUsage: config.enableMemoryMonitoring ? MemoryMonitor.getMemoryHistory() : [],
      bundleAnalysis: config.enableBundleAnalysis ? await BundleAnalyzer.analyzeBundle() : undefined,
      budgetViolations: BudgetEnforcer.checkAllBudgets(),
      recommendations: this.generateRecommendations()
    };

    // Store report in localStorage for persistence
    this.storeReport(report);
    
    return report;
  }

  private static generateReportId(): string {
    return `perf-report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private static collectWebVitals(): WebVitals {
    const metrics = WebVitalsTracker.getStoredMetrics();
    
    const webVitals: WebVitals = {};
    
    // Calculate averages for each metric
    Object.entries(metrics).forEach(([name, values]) => {
      if (Array.isArray(values) && values.length > 0) {
        const sum = values.reduce((acc, val: any) => acc + val.value, 0);
        const average = sum / values.length;
        webVitals[name as keyof WebVitals] = Math.round(average);
      }
    });

    return webVitals;
  }

  private static collectMetrics(): PerformanceMetric[] {
    // This would collect additional custom metrics
    // For now, return empty array
    return [];
  }

  private static generateRecommendations() {
    const recommendations = [];
    const webVitals = this.collectWebVitals();
    
    // LCP recommendations
    if (webVitals.LCP && webVitals.LCP > 2500) {
      recommendations.push({
        type: 'render-optimization' as const,
        title: 'Optimize Largest Contentful Paint',
        description: 'Consider optimizing images, reducing server response time, or implementing resource hints',
        priority: 'high' as const,
        impact: 'Significant improvement in perceived loading speed',
        effort: 'medium' as const,
        autoFixable: false
      });
    }

    // FID recommendations
    if (webVitals.FID && webVitals.FID > 100) {
      recommendations.push({
        type: 'render-optimization' as const,
        title: 'Improve First Input Delay',
        description: 'Reduce JavaScript execution time or break up long tasks',
        priority: 'high' as const,
        impact: 'Better user interaction responsiveness',
        effort: 'high' as const,
        autoFixable: false
      });
    }

    // CLS recommendations
    if (webVitals.CLS && webVitals.CLS > 0.1) {
      recommendations.push({
        type: 'render-optimization' as const,
        title: 'Fix Cumulative Layout Shift',
        description: 'Add size attributes to images and videos, avoid inserting content above existing content',
        priority: 'medium' as const,
        impact: 'More stable visual layout',
        effort: 'low' as const,
        autoFixable: false
      });
    }

    return recommendations;
  }

  static async checkRegressions(currentReport: PerformanceReport): Promise<PerformanceRegression[]> {
    const previousReports = this.getStoredReports();
    if (previousReports.length < 2) {
      return [];
    }

    const previousReport = previousReports[previousReports.length - 2];
    const regressions: PerformanceRegression[] = [];

    // Check Web Vitals regressions
    const webVitalsRegressions = this.checkWebVitalsRegressions(currentReport.webVitals, previousReport.webVitals);
    regressions.push(...webVitalsRegressions);

    // Check memory usage regression
    const memoryRegressions = this.checkMemoryRegressions(currentReport.memoryUsage, previousReport.memoryUsage);
    regressions.push(...memoryRegressions);

    return regressions;
  }

  private static checkWebVitalsRegressions(current: WebVitals, previous: WebVitals): PerformanceRegression[] {
    const regressions: PerformanceRegression[] = [];

    Object.keys(current).forEach(key => {
      const currentValue = current[key as keyof WebVitals];
      const previousValue = previous[key as keyof WebVitals];

      if (currentValue && previousValue && currentValue > previousValue) {
        const percentageChange = ((currentValue - previousValue) / previousValue) * 100;

        if (percentageChange > 20) { // 20% regression threshold
          regressions.push({
            metric: key,
            currentValue,
            previousValue,
            percentageChange,
            severity: percentageChange > 50 ? 'critical' : percentageChange > 30 ? 'major' : 'minor',
            timestamp: Date.now()
          });
        }
      }
    });

    return regressions;
  }

  private static checkMemoryRegressions(current: any[], previous: any[]): PerformanceRegression[] {
    const regressions: PerformanceRegression[] = [];

    if (current.length > 0 && previous.length > 0) {
      const currentMemory = current[current.length - 1].usedJSHeapSize;
      const previousMemory = previous[previous.length - 1].usedJSHeapSize;

      if (currentMemory > previousMemory) {
        const percentageChange = ((currentMemory - previousMemory) / previousMemory) * 100;

        if (percentageChange > 15) { // 15% memory increase threshold
          regressions.push({
            metric: 'memory-usage',
            currentValue: currentMemory,
            previousValue: previousMemory,
            percentageChange,
            severity: percentageChange > 30 ? 'critical' : percentageChange > 20 ? 'major' : 'minor',
            timestamp: Date.now()
          });
        }
      }
    }

    return regressions;
  }

  static storeReport(report: PerformanceReport) {
    try {
      const key = 'performance-reports';
      const existing = localStorage.getItem(key);
      const reports: PerformanceReport[] = existing ? JSON.parse(existing) : [];
      
      reports.push(report);
      
      // Keep only last 50 reports
      if (reports.length > 50) {
        reports.shift();
      }
      
      localStorage.setItem(key, JSON.stringify(reports));
    } catch (error) {
      console.warn('Failed to store performance report:', error);
    }
  }

  static getStoredReports(): PerformanceReport[] {
    try {
      const key = 'performance-reports';
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to retrieve stored reports:', error);
      return [];
    }
  }

  static clearStoredReports() {
    try {
      localStorage.removeItem('performance-reports');
    } catch (error) {
      console.warn('Failed to clear stored reports:', error);
    }
  }

  static generateTrendAnalysis(reports: PerformanceReport[]): {
    webVitals: Record<string, {
      trend: 'improving' | 'declining' | 'stable';
      change: number;
      data: { timestamp: number; value: number }[];
    }>;
    memory: {
      trend: 'improving' | 'declining' | 'stable';
      change: number;
      data: { timestamp: number; value: number }[];
    };
    bundleSize: {
      trend: 'improving' | 'declining' | 'stable';
      change: number;
      data: { timestamp: number; value: number }[];
    };
  } {
    if (reports.length < 2) {
      return {
        webVitals: {},
        memory: { trend: 'stable', change: 0, data: [] },
        bundleSize: { trend: 'stable', change: 0, data: [] }
      };
    }

    const webVitals: Record<string, any> = {};
    
    // Analyze Web Vitals trends
    ['LCP', 'FID', 'CLS', 'FCP', 'TTFB'].forEach(metric => {
      const data = reports
        .filter(r => r.webVitals[metric as keyof WebVitals])
        .map(r => ({
          timestamp: r.timestamp,
          value: r.webVitals[metric as keyof WebVitals] as number
        }));

      if (data.length > 1) {
        const first = data[0].value;
        const last = data[data.length - 1].value;
        const change = ((last - first) / first) * 100;

        webVitals[metric] = {
          trend: change > 5 ? 'declining' : change < -5 ? 'improving' : 'stable',
          change: Math.round(change * 100) / 100,
          data
        };
      }
    });

    // Analyze memory trend
    const memoryData = reports
      .filter(r => r.memoryUsage.length > 0)
      .map(r => ({
        timestamp: r.timestamp,
        value: r.memoryUsage[r.memoryUsage.length - 1].usedJSHeapSize / (1024 * 1024) // MB
      }));

    let memoryTrend = 'stable';
    let memoryChange = 0;
    
    if (memoryData.length > 1) {
      const first = memoryData[0].value;
      const last = memoryData[memoryData.length - 1].value;
      memoryChange = ((last - first) / first) * 100;
      memoryTrend = memoryChange > 5 ? 'declining' : memoryChange < -5 ? 'improving' : 'stable';
    }

    // Analyze bundle size trend
    const bundleData = reports
      .filter(r => r.bundleAnalysis)
      .map(r => ({
        timestamp: r.timestamp,
        value: (r.bundleAnalysis?.size || 0) / (1024 * 1024) // MB
      }));

    let bundleTrend = 'stable';
    let bundleChange = 0;
    
    if (bundleData.length > 1) {
      const first = bundleData[0].value;
      const last = bundleData[bundleData.length - 1].value;
      bundleChange = ((last - first) / first) * 100;
      bundleTrend = bundleChange > 5 ? 'declining' : bundleChange < -5 ? 'improving' : 'stable';
    }

    return {
      webVitals,
      memory: {
        trend: memoryTrend,
        change: Math.round(memoryChange * 100) / 100,
        data: memoryData
      },
      bundleSize: {
        trend: bundleTrend,
        change: Math.round(bundleChange * 100) / 100,
        data: bundleData
      }
    };
  }

  static exportReport(report: PerformanceReport, format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(report, null, 2);
    }

    // CSV export
    const csvLines = [
      'Metric,Value,Timestamp,URL,User Agent',
      ...Object.entries(report.webVitals).map(([key, value]) => 
        `${key},${value},${new Date(report.timestamp).toISOString()},${report.url},${report.userAgent}`
      )
    ];

    return csvLines.join('\n');
  }

  static generateSummary(reports: PerformanceReport[]): {
    totalReports: number;
    timeRange: {
      start: number;
      end: number;
      duration: number;
    };
    averages: {
      LCP: number;
      FID: number;
      CLS: number;
      Memory: number;
      BundleSize: number;
    };
    budgetCompliance: {
      total: number;
      violations: number;
      compliance: number;
    };
    trends: {
      webVitals: Record<string, 'improving' | 'declining' | 'stable'>;
      memory: 'improving' | 'declining' | 'stable';
      bundleSize: 'improving' | 'declining' | 'stable';
    };
  } {
    if (reports.length === 0) {
      return {
        totalReports: 0,
        timeRange: { start: 0, end: 0, duration: 0 },
        averages: { LCP: 0, FID: 0, CLS: 0, Memory: 0, BundleSize: 0 },
        budgetCompliance: { total: 0, violations: 0, compliance: 0 },
        trends: { webVitals: {}, memory: 'stable', bundleSize: 'stable' }
      };
    }

    const timeRange = {
      start: reports[0].timestamp,
      end: reports[reports.length - 1].timestamp,
      duration: reports[reports.length - 1].timestamp - reports[0].timestamp
    };

    // Calculate averages
    let totalLCP = 0, totalFID = 0, totalCLS = 0, lcpCount = 0, fidCount = 0, clsCount = 0;
    let totalMemory = 0, memoryCount = 0;
    let totalBundleSize = 0, bundleCount = 0;

    reports.forEach(report => {
      if (report.webVitals.LCP) { totalLCP += report.webVitals.LCP; lcpCount++; }
      if (report.webVitals.FID) { totalFID += report.webVitals.FID; fidCount++; }
      if (report.webVitals.CLS) { totalCLS += report.webVitals.CLS; clsCount++; }
      
      if (report.memoryUsage.length > 0) {
        const latestMemory = report.memoryUsage[report.memoryUsage.length - 1];
        totalMemory += latestMemory.usedJSHeapSize / (1024 * 1024);
        memoryCount++;
      }
      
      if (report.bundleAnalysis) {
        totalBundleSize += report.bundleAnalysis.size / (1024 * 1024);
        bundleCount++;
      }
    });

    // Calculate trends
    const trendAnalysis = this.generateTrendAnalysis(reports);

    // Calculate budget compliance
    let totalBudgets = 0;
    let totalViolations = 0;

    reports.forEach(report => {
      totalBudgets += report.budgetViolations.length;
      totalViolations += report.budgetViolations.filter(v => v.severity !== 'warning').length;
    });

    return {
      totalReports: reports.length,
      timeRange,
      averages: {
        LCP: lcpCount > 0 ? Math.round(totalLCP / lcpCount) : 0,
        FID: fidCount > 0 ? Math.round(totalFID / fidCount) : 0,
        CLS: clsCount > 0 ? Math.round((totalCLS / clsCount) * 1000) / 1000 : 0,
        Memory: memoryCount > 0 ? Math.round(totalMemory / memoryCount) : 0,
        BundleSize: bundleCount > 0 ? Math.round(totalBundleSize / bundleCount) : 0
      },
      budgetCompliance: {
        total: totalBudgets,
        violations: totalViolations,
        compliance: totalBudgets > 0 ? Math.round(((totalBudgets - totalViolations) / totalBudgets) * 100) : 100
      },
      trends: {
        webVitals: Object.fromEntries(
          Object.entries(trendAnalysis.webVitals).map(([key, value]) => [key, value.trend])
        ),
        memory: trendAnalysis.memory.trend,
        bundleSize: trendAnalysis.bundleSize.trend
      }
    };
  }
}