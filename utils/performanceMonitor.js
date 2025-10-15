// Performance monitoring utilities for low-end devices
export class PerformanceMonitor {
  constructor() {
    this.renderTimes = [];
    this.memoryUsage = [];
    this.isLowEndDevice = this.detectLowEndDevice();
  }

  // Detect if device is low-end based on various metrics
  detectLowEndDevice() {
    const navigator = window.navigator;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    // Check device memory (if available)
    const deviceMemory = navigator.deviceMemory;
    if (deviceMemory && deviceMemory <= 4) {
      return true;
    }

    // Check hardware concurrency (CPU cores)
    const hardwareConcurrency = navigator.hardwareConcurrency;
    if (hardwareConcurrency && hardwareConcurrency <= 2) {
      return true;
    }

    // Check network connection
    if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
      return true;
    }

    // Check if device is mobile with limited resources
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile && window.screen.width <= 768) {
      return true;
    }

    return false;
  }

  // Start performance measurement
  startMeasure(label) {
    if (this.isLowEndDevice) {
      performance.mark(`${label}-start`);
    }
  }

  // End performance measurement
  endMeasure(label) {
    if (this.isLowEndDevice) {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
      
      const measure = performance.getEntriesByName(label)[0];
      this.renderTimes.push({
        label,
        duration: measure.duration,
        timestamp: Date.now()
      });

      // Clean up marks
      performance.clearMarks(`${label}-start`);
      performance.clearMarks(`${label}-end`);
      performance.clearMeasures(label);
    }
  }

  // Monitor memory usage
  checkMemoryUsage() {
    if (this.isLowEndDevice && performance.memory) {
      this.memoryUsage.push({
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        timestamp: Date.now()
      });
    }
  }

  // Get performance report
  getReport() {
    return {
      isLowEndDevice: this.isLowEndDevice,
      averageRenderTime: this.renderTimes.length > 0 
        ? this.renderTimes.reduce((sum, time) => sum + time.duration, 0) / this.renderTimes.length 
        : 0,
      renderTimes: this.renderTimes.slice(-10), // Last 10 measurements
      memoryUsage: this.memoryUsage.slice(-5), // Last 5 memory checks
      recommendations: this.getRecommendations()
    };
  }

  // Get performance recommendations
  getRecommendations() {
    const recommendations = [];
    
    if (this.isLowEndDevice) {
      recommendations.push('Device detected as low-end - performance optimizations active');
    }

    const avgRenderTime = this.renderTimes.length > 0 
      ? this.renderTimes.reduce((sum, time) => sum + time.duration, 0) / this.renderTimes.length 
      : 0;

    if (avgRenderTime > 16.67) { // 60fps threshold
      recommendations.push('Render times exceed 60fps threshold - consider reducing component complexity');
    }

    if (this.memoryUsage.length > 0) {
      const latestMemory = this.memoryUsage[this.memoryUsage.length - 1];
      const memoryUsagePercent = (latestMemory.used / latestMemory.limit) * 100;
      
      if (memoryUsagePercent > 80) {
        recommendations.push('High memory usage detected - consider implementing component cleanup');
      }
    }

    return recommendations;
  }

  // Reset monitoring data
  reset() {
    this.renderTimes = [];
    this.memoryUsage = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export const usePerformanceMonitor = (componentName) => {
  const startRender = () => performanceMonitor.startMeasure(`${componentName}-render`);
  const endRender = () => performanceMonitor.endMeasure(`${componentName}-render`);
  
  return { startRender, endRender, isLowEndDevice: performanceMonitor.isLowEndDevice };
};
