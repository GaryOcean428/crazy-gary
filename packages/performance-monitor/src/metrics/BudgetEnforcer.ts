import { PerformanceBudget, PerformanceReport, BudgetViolation, WebVitals } from '../types';

export class BudgetEnforcer {
  private static budgets: PerformanceBudget[] = [];
  private static isInitialized = false;

  static initialize(budgets: PerformanceBudget[]) {
    this.budgets = budgets;
    this.isInitialized = true;
  }

  static updateBudgets(budgets: PerformanceBudget[]) {
    this.budgets = budgets;
  }

  static checkAllBudgets(report?: PerformanceReport): BudgetViolation[] {
    if (!this.isInitialized || !report) return [];

    const violations: BudgetViolation[] = [];

    this.budgets.forEach(budget => {
      const violation = this.checkBudget(budget, report);
      if (violation) {
        violations.push(violation);
      }
    });

    return violations;
  }

  static checkBudget(budget: PerformanceBudget, report: PerformanceReport): BudgetViolation | null {
    let actualValue: number | null = null;

    switch (budget.type) {
      case 'largest-contentful-paint':
        actualValue = report.webVitals.LCP;
        break;
      case 'first-input-delay':
        actualValue = report.webVitals.FID;
        break;
      case 'cumulative-layout-shift':
        actualValue = report.webVitals.CLS;
        break;
      case 'bundle-size':
        if (report.bundleAnalysis) {
          actualValue = report.bundleAnalysis.size;
        }
        break;
      case 'memory':
        if (report.memoryUsage.length > 0) {
          const latest = report.memoryUsage[report.memoryUsage.length - 1];
          actualValue = latest.usedJSHeapSize / (1024 * 1024); // Convert to MB
        }
        break;
      default:
        return null;
    }

    if (actualValue === null || actualValue === undefined) return null;

    // Check if budget is violated
    const isViolated = this.isBudgetViolated(budget, actualValue);
    
    if (isViolated) {
      return {
        budget,
        actualValue,
        severity: this.getSeverity(budget, actualValue),
        timestamp: Date.now()
      };
    }

    return null;
  }

  private static isBudgetViolated(budget: PerformanceBudget, actualValue: number): boolean {
    switch (budget.threshold) {
      case 'good':
        return actualValue > budget.value;
      case 'needs-improvement':
        return actualValue > budget.value;
      case 'poor':
        return actualValue > budget.value;
      default:
        return false;
    }
  }

  private static getSeverity(budget: PerformanceBudget, actualValue: number): 'warning' | 'error' | 'critical' {
    const ratio = actualValue / budget.value;
    
    if (ratio <= 1.1) return 'warning';
    if (ratio <= 1.5) return 'error';
    return 'critical';
  }

  static getBudgetStatus(budget: PerformanceBudget, currentValue: number): 'good' | 'warning' | 'error' | 'critical' {
    const ratio = currentValue / budget.value;
    
    if (ratio <= 0.8) return 'good';
    if (ratio <= 1.0) return 'good';
    if (ratio <= 1.2) return 'warning';
    if (ratio <= 1.5) return 'error';
    return 'critical';
  }

  static getAllBudgets(): PerformanceBudget[] {
    return [...this.budgets];
  }

  static addBudget(budget: PerformanceBudget) {
    this.budgets.push(budget);
  }

  static removeBudget(budgetName: string) {
    this.budgets = this.budgets.filter(budget => budget.name !== budgetName);
  }

  static updateBudget(budgetName: string, updates: Partial<PerformanceBudget>) {
    const index = this.budgets.findIndex(budget => budget.name === budgetName);
    if (index !== -1) {
      this.budgets[index] = { ...this.budgets[index], ...updates };
    }
  }

  static getBudgetSummary(): {
    total: number;
    violated: number;
    warnings: number;
    healthy: number;
  } {
    if (!this.isInitialized) {
      return { total: 0, violated: 0, warnings: 0, healthy: 0 };
    }

    const currentMetrics = this.getCurrentMetrics();
    
    let violated = 0;
    let warnings = 0;
    let healthy = 0;

    this.budgets.forEach(budget => {
      const value = currentMetrics[budget.type];
      if (value !== undefined) {
        const status = this.getBudgetStatus(budget, value);
        switch (status) {
          case 'good':
            healthy++;
            break;
          case 'warning':
            warnings++;
            break;
          case 'error':
          case 'critical':
            violated++;
            break;
        }
      }
    });

    return {
      total: this.budgets.length,
      violated,
      warnings,
      healthy
    };
  }

  private static getCurrentMetrics(): Partial<WebVitals & { bundleSize: number; memoryUsage: number }> {
    // This would be populated with real-time metrics
    // For now, return empty object - this would be connected to actual metrics
    return {};
  }

  static generateBudgetReport(): {
    budgets: Array<{
      name: string;
      currentValue: number | null;
      budget: number;
      unit: string;
      status: 'good' | 'warning' | 'error' | 'critical' | 'unknown';
      percentage: number;
    }>;
    summary: {
      total: number;
      violated: number;
      warnings: number;
      healthy: number;
    };
  } {
    const currentMetrics = this.getCurrentMetrics();
    const budgetData = this.budgets.map(budget => {
      let currentValue: number | null = null;

      switch (budget.type) {
        case 'largest-contentful-paint':
          currentValue = currentMetrics.LCP || null;
          break;
        case 'first-input-delay':
          currentValue = currentMetrics.FID || null;
          break;
        case 'cumulative-layout-shift':
          currentValue = currentMetrics.CLS || null;
          break;
        case 'bundle-size':
          currentValue = currentMetrics.bundleSize || null;
          break;
        case 'memory':
          currentValue = currentMetrics.memoryUsage || null;
          break;
      }

      const status = currentValue !== null 
        ? this.getBudgetStatus(budget, currentValue)
        : 'unknown';

      const percentage = currentValue !== null 
        ? Math.round((currentValue / budget.value) * 100)
        : 0;

      return {
        name: budget.name,
        currentValue,
        budget: budget.value,
        unit: budget.unit,
        status,
        percentage
      };
    });

    return {
      budgets: budgetData,
      summary: this.getBudgetSummary()
    };
  }
}