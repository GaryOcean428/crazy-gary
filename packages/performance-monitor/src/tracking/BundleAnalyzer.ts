import { BundleAnalysis, BundleDependency, BundleChunk, CodeSplittingMetrics, LazyImportMetrics } from '../types';

export class BundleAnalyzer {
  private static isInitialized = false;
  private static currentAnalysis: BundleAnalysis | null = null;
  private static codeSplittingMetrics: CodeSplittingMetrics = {
    chunksLoaded: 0,
    totalChunks: 0,
    loadingTime: 0,
    failedChunks: [],
    lazyImports: []
  };
  private static originalConsoleLog = console.log;
  private static chunkLoadTimes: Map<string, number> = new Map();

  static initialize() {
    if (this.isInitialized) return;

    try {
      // Monitor chunk loading
      this.monitorChunkLoading();
      
      // Analyze initial bundle
      this.analyzeInitialBundle();
      
      // Monitor dynamic imports
      this.monitorDynamicImports();
      
      this.isInitialized = true;
      console.log('Bundle analyzer initialized');
    } catch (error) {
      console.error('Failed to initialize bundle analyzer:', error);
    }
  }

  static stop() {
    // Restore original console.log
    console.log = this.originalConsoleLog;
    this.isInitialized = false;
  }

  private static analyzeInitialBundle() {
    // This would typically analyze the webpack stats or use webpack-bundle-analyzer
    // For now, we'll create a mock analysis based on what's typically available
    try {
      // Try to get bundle info from performance API
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const transferSize = navigation.transferSize || 0;
        const encodedBodySize = navigation.encodedBodySize || 0;
        
        this.currentAnalysis = {
          name: 'main-bundle',
          size: encodedBodySize,
          gzippedSize: Math.round(encodedBodySize * 0.3), // Rough estimate
          dependencies: this.extractDependencies(),
          chunks: this.extractChunks()
        };
      }
    } catch (error) {
      console.warn('Failed to analyze initial bundle:', error);
    }
  }

  private static monitorChunkLoading() {
    // Override console.log to intercept chunk loading messages
    console.log = (...args) => {
      const message = args.join(' ');
      
      // Detect chunk loading
      if (message.includes('chunk') && message.includes('loaded')) {
        this.handleChunkLoad(message);
      }
      
      this.originalConsoleLog.apply(console, args);
    };

    // Monitor performance entries for resource loading
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource' && entry.name.includes('.js')) {
          this.analyzeResourceEntry(entry as PerformanceResourceTiming);
        }
      }
    });
    
    observer.observe({ entryTypes: ['resource'] });
  }

  private static handleChunkLoad(message: string) {
    const chunkMatch = message.match(/chunk\s+(\w+)\s+loaded/i);
    if (chunkMatch) {
      const chunkName = chunkMatch[1];
      const loadTime = Date.now();
      
      this.chunkLoadTimes.set(chunkName, loadTime);
      this.codeSplittingMetrics.chunksLoaded++;
      
      console.log(`Chunk ${chunkName} loaded at ${loadTime}`);
    }
  }

  private static analyzeResourceEntry(entry: PerformanceResourceTiming) {
    if (entry.initiatorType === 'script') {
      const fileName = entry.name.split('/').pop() || 'unknown';
      
      // Check if this is a chunk file
      if (fileName.includes('.') && !fileName.includes('main')) {
        const loadTime = entry.responseEnd - entry.requestStart;
        
        // Update lazy import metrics
        const existingImport = this.codeSplittingMetrics.lazyImports.find(
          imp => imp.path === entry.name
        );
        
        if (existingImport) {
          existingImport.loadTime = loadTime;
          existingImport.loaded = true;
        }
      }
    }
  }

  private static monitorDynamicImports() {
    // Wrap dynamic import to track lazy loading
    const originalImport = window.import;
    
    if (originalImport) {
      (window as any).import = async (modulePath: string) => {
        const startTime = performance.now();
        
        try {
          const result = await originalImport(modulePath);
          const loadTime = performance.now() - startTime;
          
          // Track the lazy import
          this.trackLazyImport(modulePath, loadTime, true);
          
          return result;
        } catch (error) {
          const loadTime = performance.now() - startTime;
          
          // Track failed lazy import
          this.trackLazyImport(modulePath, loadTime, false, error instanceof Error ? error.message : 'Unknown error');
          
          throw error;
        }
      };
    }
  }

  private static trackLazyImport(path: string, loadTime: number, loaded: boolean, error?: string) {
    const existingImport = this.codeSplittingMetrics.lazyImports.find(imp => imp.path === path);
    
    if (existingImport) {
      existingImport.loadTime = loadTime;
      existingImport.loaded = loaded;
      if (error) existingImport.error = error;
    } else {
      this.codeSplittingMetrics.lazyImports.push({
        path,
        loadTime,
        fileSize: 0, // Would need to be calculated
        loaded,
        error
      });
    }
  }

  private static extractDependencies(): BundleDependency[] {
    // This would typically parse the webpack stats or use import analysis
    // For now, return common dependencies
    return [
      { name: 'react', version: '19.1.0', size: 0, isDuplicate: false },
      { name: 'react-dom', version: '19.1.0', size: 0, isDuplicate: false },
      { name: 'axios', version: '1.7.0', size: 0, isDuplicate: false }
    ];
  }

  private static extractChunks(): BundleChunk[] {
    // This would analyze webpack chunks
    return [
      {
        id: 'main',
        name: 'main',
        size: 0,
        files: ['main.js']
      }
    ];
  }

  static getCurrentAnalysis(): BundleAnalysis | null {
    return this.currentAnalysis;
  }

  static getCodeSplittingMetrics(): CodeSplittingMetrics {
    return { ...this.codeSplittingMetrics };
  }

  static async analyzeBundle(): Promise<BundleAnalysis> {
    // This would perform a comprehensive bundle analysis
    // For now, update the current analysis
    
    if (!this.currentAnalysis) {
      this.analyzeInitialBundle();
    }

    return this.currentAnalysis || {
      name: 'unknown',
      size: 0,
      gzippedSize: 0,
      dependencies: [],
      chunks: []
    };
  }

  static getBundleSizeBreakdown(): {
    total: number;
    gzipped: number;
    chunks: Array<{
      name: string;
      size: number;
      percentage: number;
    }>;
    dependencies: Array<{
      name: string;
      size: number;
      version: string;
    }>;
  } {
    const analysis = this.currentAnalysis;
    
    if (!analysis) {
      return {
        total: 0,
        gzipped: 0,
        chunks: [],
        dependencies: []
      };
    }

    const totalSize = analysis.size;
    
    const chunks = analysis.chunks.map(chunk => ({
      name: chunk.name,
      size: chunk.size,
      percentage: Math.round((chunk.size / totalSize) * 100)
    }));

    const dependencies = analysis.dependencies.map(dep => ({
      name: dep.name,
      size: dep.size,
      version: dep.version
    }));

    return {
      total: totalSize,
      gzipped: analysis.gzippedSize,
      chunks,
      dependencies
    };
  }

  static generateBundleReport(): {
    analysis: BundleAnalysis | null;
    codeSplitting: CodeSplittingMetrics;
    recommendations: Array<{
      type: 'bundle-optimization' | 'code-splitting' | 'lazy-loading';
      title: string;
      description: string;
      impact: 'high' | 'medium' | 'low';
      effort: 'high' | 'medium' | 'low';
    }>;
    performance: {
      totalLoadTime: number;
      averageChunkLoadTime: number;
      failedChunks: number;
      lazyLoadSuccessRate: number;
    };
  } {
    const analysis = this.currentAnalysis;
    const codeSplitting = this.codeSplittingMetrics;
    
    // Calculate performance metrics
    const totalLoadTime = Array.from(this.chunkLoadTimes.values()).reduce((sum, time) => sum + time, 0);
    const averageChunkLoadTime = this.chunkLoadTimes.size > 0 
      ? totalLoadTime / this.chunkLoadTimes.size 
      : 0;
    
    const failedChunks = codeSplitting.failedChunks.length;
    const lazyImports = codeSplitting.lazyImports;
    const successfulLazyImports = lazyImports.filter(imp => imp.loaded).length;
    const lazyLoadSuccessRate = lazyImports.length > 0 
      ? (successfulLazyImports / lazyImports.length) * 100 
      : 100;

    // Generate recommendations
    const recommendations = this.generateRecommendations(analysis, codeSplitting);

    return {
      analysis,
      codeSplitting,
      recommendations,
      performance: {
        totalLoadTime: Math.round(totalLoadTime),
        averageChunkLoadTime: Math.round(averageChunkLoadTime),
        failedChunks,
        lazyLoadSuccessRate: Math.round(lazyLoadSuccessRate)
      }
    };
  }

  private static generateRecommendations(analysis: BundleAnalysis | null, codeSplitting: CodeSplittingMetrics) {
    const recommendations = [];

    if (analysis && analysis.size > 500 * 1024) { // 500KB threshold
      recommendations.push({
        type: 'bundle-optimization',
        title: 'Large Bundle Size',
        description: 'Consider splitting the main bundle or removing unused dependencies',
        impact: 'high',
        effort: 'medium'
      });
    }

    if (codeSplitting.failedChunks.length > 0) {
      recommendations.push({
        type: 'code-splitting',
        title: 'Chunk Loading Failures',
        description: 'Some chunks failed to load. Check network connectivity and chunk availability',
        impact: 'high',
        effort: 'low'
      });
    }

    if (codeSplitting.lazyImports.length === 0) {
      recommendations.push({
        type: 'lazy-loading',
        title: 'No Lazy Loading',
        description: 'Consider implementing lazy loading for non-critical components',
        impact: 'medium',
        effort: 'medium'
      });
    }

    return recommendations;
  }

  static clearAnalysis() {
    this.currentAnalysis = null;
    this.codeSplittingMetrics = {
      chunksLoaded: 0,
      totalChunks: 0,
      loadingTime: 0,
      failedChunks: [],
      lazyImports: []
    };
    this.chunkLoadTimes.clear();
  }
}