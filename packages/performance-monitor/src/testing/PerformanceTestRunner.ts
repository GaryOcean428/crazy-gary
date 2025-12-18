/**
 * Performance Testing Framework
 * Automated performance regression testing and benchmarking
 */

import { PerformanceReport, PerformanceRegression, PerformanceMetric } from '../types';
import { ReportGenerator } from '../metrics/ReportGenerator';
import { WebVitalsTracker } from '../tracking/WebVitalsTracker';

export interface PerformanceTestCase {
  name: string;
  url: string;
  steps: TestStep[];
  thresholds: PerformanceThresholds;
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
}

export interface TestStep {
  action: 'navigate' | 'click' | 'type' | 'wait' | 'scroll' | 'custom';
  target?: string;
  value?: string;
  duration?: number;
  customAction?: () => Promise<void>;
}

export interface PerformanceThresholds {
  LCP: { max: number; warn: number };
  FID: { max: number; warn: number };
  CLS: { max: number; warn: number };
  FCP: { max: number; warn: number };
  TTFB: { max: number; warn: number };
  memory: { max: number; warn: number };
  bundleSize: { max: number; warn: number };
}

export interface TestResult {
  testCase: string;
  passed: boolean;
  metrics: Partial<PerformanceThresholds>;
  regressions: PerformanceRegression[];
  duration: number;
  timestamp: number;
  screenshot?: string;
  logs: string[];
}

export class PerformanceTestRunner {
  private baselineReports: Map<string, PerformanceReport> = new Map();
  private testResults: TestResult[] = [];

  constructor() {
    this.loadBaselineData();
  }

  /**
   * Load baseline performance data for comparison
   */
  private async loadBaselineData() {
    try {
      const reports = ReportGenerator.getStoredReports();
      
      // Group reports by URL and take the most recent as baseline
      const grouped = new Map<string, PerformanceReport[]>();
      reports.forEach(report => {
        const url = report.url;
        if (!grouped.has(url)) {
          grouped.set(url, []);
        }
        grouped.get(url)!.push(report);
      });

      // Set baseline for each URL
      grouped.forEach((urlReports, url) => {
        const sorted = urlReports.sort((a, b) => b.timestamp - a.timestamp);
        if (sorted.length > 0) {
          this.baselineReports.set(url, sorted[0]);
        }
      });

      console.log(`Loaded ${this.baselineReports.size} baseline performance reports`);
    } catch (error) {
      console.warn('Failed to load baseline data:', error);
    }
  }

  /**
   * Run a single performance test case
   */
  async runTest(testCase: PerformanceTestCase): Promise<TestResult> {
    const startTime = Date.now();
    const logs: string[] = [];
    
    try {
      logs.push(`Starting test: ${testCase.name}`);
      
      // Setup
      if (testCase.setup) {
        logs.push('Running test setup...');
        await testCase.setup();
      }

      // Navigate to test URL
      logs.push(`Navigating to ${testCase.url}`);
      window.location.href = testCase.url;
      await this.waitForPageLoad();

      // Clear previous metrics
      WebVitalsTracker.clearStoredMetrics();

      // Run test steps
      for (const step of testCase.steps) {
        await this.executeStep(step, logs);
      }

      // Wait for metrics to settle
      await this.wait(2000);

      // Collect metrics
      const metrics = await this.collectMetrics(testCase.thresholds);
      
      // Compare with baseline
      const baseline = this.baselineReports.get(testCase.url);
      const regressions = baseline ? this.detectRegressions(metrics, baseline) : [];

      const passed = this.evaluateTest(metrics, testCase.thresholds, regressions);
      const duration = Date.now() - startTime;

      const result: TestResult = {
        testCase: testCase.name,
        passed,
        metrics,
        regressions,
        duration,
        timestamp: Date.now(),
        logs
      };

      this.testResults.push(result);
      logs.push(`Test completed: ${passed ? 'PASSED' : 'FAILED'}`);

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      logs.push(`Test failed with error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      const result: TestResult = {
        testCase: testCase.name,
        passed: false,
        metrics: {},
        regressions: [],
        duration,
        timestamp: Date.now(),
        logs
      };

      this.testResults.push(result);
      return result;
    } finally {
      // Teardown
      if (testCase.teardown) {
        try {
          await testCase.teardown();
        } catch (error) {
          logs.push(`Teardown error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }
  }

  /**
   * Run multiple test cases
   */
  async runTestSuite(testCases: PerformanceTestCase[]): Promise<TestResult[]> {
    console.log(`Running test suite with ${testCases.length} test cases`);
    
    const results: TestResult[] = [];
    
    for (const testCase of testCases) {
      try {
        const result = await this.runTest(testCase);
        results.push(result);
        
        // Brief pause between tests
        await this.wait(1000);
      } catch (error) {
        console.error(`Test "${testCase.name}" failed:`, error);
        results.push({
          testCase: testCase.name,
          passed: false,
          metrics: {},
          regressions: [],
          duration: 0,
          timestamp: Date.now(),
          logs: [`Failed to run test: ${error instanceof Error ? error.message : 'Unknown error'}`]
        });
      }
    }

    return results;
  }

  /**
   * Execute a single test step
   */
  private async executeStep(step: TestStep, logs: string[]): Promise<void> {
    switch (step.action) {
      case 'navigate':
        if (step.target) {
          window.location.href = step.target;
          await this.waitForPageLoad();
          logs.push(`Navigated to ${step.target}`);
        }
        break;
        
      case 'click':
        if (step.target) {
          const element = document.querySelector(step.target);
          if (element) {
            element.click();
            logs.push(`Clicked ${step.target}`);
            await this.wait(step.duration || 500);
          } else {
            logs.push(`Element ${step.target} not found`);
          }
        }
        break;
        
      case 'type':
        if (step.target && step.value) {
          const element = document.querySelector(step.target) as HTMLInputElement;
          if (element) {
            element.value = step.value;
            element.dispatchEvent(new Event('input', { bubbles: true }));
            logs.push(`Typed "${step.value}" into ${step.target}`);
            await this.wait(step.duration || 500);
          } else {
            logs.push(`Input element ${step.target} not found`);
          }
        }
        break;
        
      case 'wait':
        await this.wait(step.duration || 1000);
        logs.push(`Waited ${step.duration || 1000}ms`);
        break;
        
      case 'scroll':
        window.scrollTo(0, step.duration || 1000);
        logs.push(`Scrolled ${step.duration || 1000}px`);
        await this.wait(500);
        break;
        
      case 'custom':
        if (step.customAction) {
          await step.customAction();
          logs.push('Executed custom action');
        }
        break;
    }
  }

  /**
   * Collect current performance metrics
   */
  private async collectMetrics(thresholds: PerformanceThresholds): Promise<Partial<PerformanceThresholds>> {
    // Wait a bit for metrics to be collected
    await this.wait(1000);

    const webVitals = WebVitalsTracker.getStoredMetrics();
    const memoryMonitor = await import('../monitoring/MemoryMonitor');
    const bundleAnalyzer = await import('../tracking/BundleAnalyzer');

    const metrics: Partial<PerformanceThresholds> = {};

    // Web Vitals
    Object.entries(webVitals).forEach(([name, values]) => {
      if (Array.isArray(values) && values.length > 0) {
        const latest = values[values.length - 1];
        metrics[name as keyof PerformanceThresholds] = latest.value;
      }
    });

    // Memory usage
    try {
      const memoryStats = memoryMonitor.MemoryMonitor.getCurrentMemoryStats();
      metrics.memory = memoryStats.used;
    } catch (error) {
      console.warn('Failed to collect memory metrics:', error);
    }

    // Bundle size
    try {
      const bundleBreakdown = bundleAnalyzer.BundleAnalyzer.getBundleSizeBreakdown();
      metrics.bundleSize = bundleBreakdown.total / (1024 * 1024); // Convert to MB
    } catch (error) {
      console.warn('Failed to collect bundle size:', error);
    }

    return metrics;
  }

  /**
   * Detect performance regressions compared to baseline
   */
  private detectRegressions(current: Partial<PerformanceThresholds>, baseline: PerformanceReport): PerformanceRegression[] {
    const regressions: PerformanceRegression[] = [];

    // Check Web Vitals regressions
    ['LCP', 'FID', 'CLS', 'FCP', 'TTFB'].forEach(metric => {
      const currentValue = current[metric as keyof PerformanceThresholds] as number;
      const baselineValue = baseline.webVitals[metric as keyof typeof baseline.webVitals] as number;

      if (currentValue && baselineValue) {
        const change = ((currentValue - baselineValue) / baselineValue) * 100;
        
        if (change > 20) { // 20% regression threshold
          regressions.push({
            metric,
            currentValue,
            previousValue: baselineValue,
            percentageChange: change,
            severity: change > 50 ? 'critical' : change > 30 ? 'major' : 'minor',
            timestamp: Date.now()
          });
        }
      }
    });

    return regressions;
  }

  /**
   * Evaluate if test passed based on thresholds and regressions
   */
  private evaluateTest(metrics: Partial<PerformanceThresholds>, thresholds: PerformanceThresholds, regressions: PerformanceRegression[]): boolean {
    // Check threshold violations
    const violations = [];

    if (metrics.LCP && metrics.LCP > thresholds.LCP.max) violations.push('LCP');
    if (metrics.FID && metrics.FID > thresholds.FID.max) violations.push('FID');
    if (metrics.CLS && metrics.CLS > thresholds.CLS.max) violations.push('CLS');
    if (metrics.FCP && metrics.FCP > thresholds.FCP.max) violations.push('FCP');
    if (metrics.TTFB && metrics.TTFB > thresholds.TTFB.max) violations.push('TTFB');
    if (metrics.memory && metrics.memory > thresholds.memory.max) violations.push('Memory');
    if (metrics.bundleSize && metrics.bundleSize > thresholds.bundleSize.max) violations.push('Bundle Size');

    // Check for critical regressions
    const criticalRegressions = regressions.filter(r => r.severity === 'critical');

    return violations.length === 0 && criticalRegressions.length === 0;
  }

  /**
   * Wait for page to load
   */
  private async waitForPageLoad(): Promise<void> {
    if (document.readyState === 'complete') {
      return;
    }

    return new Promise((resolve) => {
      window.addEventListener('load', () => resolve(), { once: true });
    });
  }

  /**
   * Wait for specified duration
   */
  private async wait(duration: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, duration));
  }

  /**
   * Get test results
   */
  getTestResults(): TestResult[] {
    return [...this.testResults];
  }

  /**
   * Generate performance test report
   */
  generateTestReport(): {
    summary: {
      total: number;
      passed: number;
      failed: number;
      passRate: number;
    };
    results: TestResult[];
    regressions: PerformanceRegression[];
    recommendations: string[];
  } {
    const results = this.testResults;
    const passed = results.filter(r => r.passed).length;
    const failed = results.length - passed;
    const passRate = results.length > 0 ? Math.round((passed / results.length) * 100) : 0;

    // Collect all regressions
    const allRegressions = results.flatMap(r => r.regressions);

    // Generate recommendations
    const recommendations = this.generateRecommendations(results, allRegressions);

    return {
      summary: {
        total: results.length,
        passed,
        failed,
        passRate
      },
      results,
      regressions: allRegressions,
      recommendations
    };
  }

  /**
   * Generate recommendations based on test results
   */
  private generateRecommendations(results: TestResult[], regressions: PerformanceRegression[]): string[] {
    const recommendations: string[] = [];

    // Analyze common failures
    const failedTests = results.filter(r => !r.passed);
    
    if (failedTests.length > 0) {
      recommendations.push(`${failedTests.length} performance tests failed. Review failed tests and consider optimization.`);

      // Check for common metrics causing failures
      const metricFailures = new Map<string, number>();
      failedTests.forEach(test => {
        Object.entries(test.metrics).forEach(([metric, value]) => {
          if (value !== undefined) {
            metricFailures.set(metric, (metricFailures.get(metric) || 0) + 1);
          }
        });
      });

      // Most common failure
      const mostCommonFailure = Array.from(metricFailures.entries())
        .sort((a, b) => b[1] - a[1])[0];

      if (mostCommonFailure) {
        recommendations.push(`Most common failure: ${mostCommonFailure[0]} (${mostCommonFailure[1]} tests)`);
      }
    }

    // Analyze regressions
    if (regressions.length > 0) {
      const criticalRegressions = regressions.filter(r => r.severity === 'critical');
      if (criticalRegressions.length > 0) {
        recommendations.push(`${criticalRegressions.length} critical performance regressions detected. Immediate attention required.`);
      }

      const majorRegressions = regressions.filter(r => r.severity === 'major');
      if (majorRegressions.length > 0) {
        recommendations.push(`${majorRegressions.length} major performance regressions detected. Review recent changes.`);
      }
    }

    // Memory leak detection
    const memoryTests = results.filter(r => r.metrics.memory);
    if (memoryTests.length > 2) {
      const memoryTrend = this.analyzeMemoryTrend(memoryTests);
      if (memoryTrend === 'increasing') {
        recommendations.push('Memory usage shows increasing trend. Potential memory leak detected.');
      }
    }

    return recommendations;
  }

  /**
   * Analyze memory usage trend
   */
  private analyzeMemoryTrend(results: TestResult[]): 'increasing' | 'decreasing' | 'stable' {
    const memoryValues = results
      .map(r => r.metrics.memory)
      .filter(v => v !== undefined) as number[];

    if (memoryValues.length < 3) return 'stable';

    const first = memoryValues[0];
    const last = memoryValues[memoryValues.length - 1];
    const change = ((last - first) / first) * 100;

    if (change > 10) return 'increasing';
    if (change < -10) return 'decreasing';
    return 'stable';
  }

  /**
   * Clear test results
   */
  clearResults(): void {
    this.testResults = [];
  }

  /**
   * Save baseline from current metrics
   */
  async saveBaseline(url: string): Promise<void> {
    try {
      const report = await ReportGenerator.generate({
        enabled: true,
        sampleRate: 1,
        budgets: [],
        autoReport: false,
        reportInterval: 0,
        enableMemoryMonitoring: true,
        enableBundleAnalysis: true,
        enableCodeSplittingMonitoring: true,
        alertThresholds: {
          memoryLeak: 10,
          bundleSizeIncrease: 10,
          performanceRegression: 20
        }
      });

      this.baselineReports.set(url, report);
      console.log(`Baseline saved for ${url}`);
    } catch (error) {
      console.error('Failed to save baseline:', error);
      throw error;
    }
  }
}

// Export default test runner instance
export const performanceTestRunner = new PerformanceTestRunner();

// Utility functions for creating test cases
export const createTestCase = (
  name: string,
  url: string,
  steps: TestStep[],
  thresholds: PerformanceThresholds
): PerformanceTestCase => ({
  name,
  url,
  steps,
  thresholds
});

export const defaultThresholds: PerformanceThresholds = {
  LCP: { max: 2500, warn: 2000 },
  FID: { max: 100, warn: 80 },
  CLS: { max: 0.1, warn: 0.05 },
  FCP: { max: 1800, warn: 1400 },
  TTFB: { max: 800, warn: 600 },
  memory: { max: 50, warn: 40 },
  bundleSize: { max: 500, warn: 400 }
};