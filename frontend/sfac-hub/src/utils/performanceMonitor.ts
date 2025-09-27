// Performance monitoring utilities for image loading and page performance

interface PerformanceMetrics {
  imageLoadTime: number;
  pageLoadTime: number;
  cacheHitRate: number;
  totalImages: number;
  failedImages: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    imageLoadTime: 0,
    pageLoadTime: 0,
    cacheHitRate: 0,
    totalImages: 0,
    failedImages: 0
  };

  private imageLoadTimes: number[] = [];
  private cacheHits = 0;
  private cacheMisses = 0;

  /**
   * Start monitoring page load time
   */
  startPageLoadMonitoring(): void {
    if (typeof window !== 'undefined' && window.performance) {
      window.addEventListener('load', () => {
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        this.metrics.pageLoadTime = loadTime;
        console.log(`Page loaded in ${loadTime}ms`);
      });
    }
  }

  /**
   * Track image load performance
   */
  trackImageLoad(startTime: number, fromCache: boolean = false): void {
    const loadTime = Date.now() - startTime;
    this.imageLoadTimes.push(loadTime);
    this.metrics.totalImages++;

    if (fromCache) {
      this.cacheHits++;
    } else {
      this.cacheMisses++;
    }

    this.updateMetrics();
  }

  /**
   * Track failed image loads
   */
  trackImageError(): void {
    this.metrics.failedImages++;
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance report
   */
  getPerformanceReport(): string {
    const avgLoadTime = this.imageLoadTimes.length > 0 
      ? this.imageLoadTimes.reduce((a, b) => a + b, 0) / this.imageLoadTimes.length 
      : 0;

    return `
Performance Report:
- Page Load Time: ${this.metrics.pageLoadTime}ms
- Average Image Load Time: ${Math.round(avgLoadTime)}ms
- Total Images: ${this.metrics.totalImages}
- Failed Images: ${this.metrics.failedImages}
- Cache Hit Rate: ${this.metrics.cacheHitRate.toFixed(1)}%
- Success Rate: ${((this.metrics.totalImages - this.metrics.failedImages) / this.metrics.totalImages * 100).toFixed(1)}%
    `.trim();
  }

  /**
   * Update metrics calculations
   */
  private updateMetrics(): void {
    this.metrics.imageLoadTime = this.imageLoadTimes.length > 0 
      ? this.imageLoadTimes.reduce((a, b) => a + b, 0) / this.imageLoadTimes.length 
      : 0;

    const totalCacheRequests = this.cacheHits + this.cacheMisses;
    this.metrics.cacheHitRate = totalCacheRequests > 0 
      ? (this.cacheHits / totalCacheRequests) * 100 
      : 0;
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.metrics = {
      imageLoadTime: 0,
      pageLoadTime: 0,
      cacheHitRate: 0,
      totalImages: 0,
      failedImages: 0
    };
    this.imageLoadTimes = [];
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions for performance tracking
export const trackImageLoad = (startTime: number, fromCache: boolean = false) => {
  performanceMonitor.trackImageLoad(startTime, fromCache);
};

export const trackImageError = () => {
  performanceMonitor.trackImageError();
};

export const getPerformanceMetrics = () => {
  return performanceMonitor.getMetrics();
};

export const getPerformanceReport = () => {
  return performanceMonitor.getPerformanceReport();
};

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  performanceMonitor.startPageLoadMonitoring();
}

// Web Vitals monitoring
export const initWebVitals = () => {
  if (typeof window !== 'undefined' && 'web-vitals' in window) {
    // This would integrate with web-vitals library if available
    console.log('Web Vitals monitoring initialized');
  }
};

// Memory usage monitoring
export const getMemoryUsage = () => {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit
    };
  }
  return null;
};

// Network information monitoring
export const getNetworkInfo = () => {
  if (typeof window !== 'undefined' && 'connection' in navigator) {
    const connection = (navigator as any).connection;
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }
  return null;
};
