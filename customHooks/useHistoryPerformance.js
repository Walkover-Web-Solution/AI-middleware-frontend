import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Custom hook for history page performance optimizations
 * - Debounced operations to prevent excessive API calls
 * - Virtual scrolling helpers for large datasets
 * - Memory management for thread data
 * - Performance monitoring and optimization
 */
export const useHistoryPerformance = () => {
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: 0,
    apiCallCount: 0,
    memoryUsage: 0,
    lastOptimization: Date.now()
  });

  const renderStartTime = useRef(0);
  const apiCallCountRef = useRef(0);
  const debounceTimeouts = useRef({});

  // Performance monitoring
  const startRenderTimer = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const endRenderTimer = useCallback(() => {
    if (renderStartTime.current > 0) {
      const renderTime = performance.now() - renderStartTime.current;
      setPerformanceMetrics(prev => ({
        ...prev,
        renderTime,
        lastOptimization: Date.now()
      }));
      renderStartTime.current = 0;
    }
  }, []);

  // Debounced function creator
  const createDebouncedFunction = useCallback((func, delay = 300, key = 'default') => {
    return (...args) => {
      if (debounceTimeouts.current[key]) {
        clearTimeout(debounceTimeouts.current[key]);
      }
      
      debounceTimeouts.current[key] = setTimeout(() => {
        func(...args);
        delete debounceTimeouts.current[key];
      }, delay);
    };
  }, []);

  // API call tracking
  const trackApiCall = useCallback(() => {
    apiCallCountRef.current += 1;
    setPerformanceMetrics(prev => ({
      ...prev,
      apiCallCount: apiCallCountRef.current
    }));
  }, []);

  // Memory usage estimation
  const estimateMemoryUsage = useCallback((data) => {
    try {
      const jsonString = JSON.stringify(data);
      const sizeInBytes = new Blob([jsonString]).size;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      
      setPerformanceMetrics(prev => ({
        ...prev,
        memoryUsage: sizeInMB
      }));
      
      return sizeInMB;
    } catch (error) {
      console.warn('Failed to estimate memory usage:', error);
      return 0;
    }
  }, []);

  // Virtual scrolling helper
  const useVirtualScrolling = useCallback((items, containerHeight = 600, itemHeight = 80) => {
    const [scrollTop, setScrollTop] = useState(0);
    
    const visibleItems = useMemo(() => {
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(
        startIndex + Math.ceil(containerHeight / itemHeight) + 1,
        items.length
      );
      
      return {
        startIndex,
        endIndex,
        visibleItems: items.slice(startIndex, endIndex),
        totalHeight: items.length * itemHeight,
        offsetY: startIndex * itemHeight
      };
    }, [items, scrollTop, containerHeight, itemHeight]);

    const handleScroll = useCallback((e) => {
      setScrollTop(e.target.scrollTop);
    }, []);

    return {
      ...visibleItems,
      handleScroll
    };
  }, []);

  // Memory cleanup for large datasets
  const cleanupMemory = useCallback((threshold = 100) => {
    if (performanceMetrics.memoryUsage > threshold) {
      // Force garbage collection hint
      if (window.gc) {
        window.gc();
      }
      
      // Clear timeout references
      Object.keys(debounceTimeouts.current).forEach(key => {
        if (debounceTimeouts.current[key]) {
          clearTimeout(debounceTimeouts.current[key]);
          delete debounceTimeouts.current[key];
        }
      });
      
      setPerformanceMetrics(prev => ({
        ...prev,
        lastOptimization: Date.now()
      }));
    }
  }, [performanceMetrics.memoryUsage]);

  // Batch operations helper
  const batchOperations = useCallback((operations, batchSize = 10) => {
    return new Promise((resolve) => {
      let index = 0;
      const results = [];
      
      const processBatch = () => {
        const batch = operations.slice(index, index + batchSize);
        
        batch.forEach(operation => {
          try {
            const result = operation();
            results.push(result);
          } catch (error) {
            console.warn('Batch operation failed:', error);
            results.push(null);
          }
        });
        
        index += batchSize;
        
        if (index < operations.length) {
          // Use requestAnimationFrame for non-blocking processing
          requestAnimationFrame(processBatch);
        } else {
          resolve(results);
        }
      };
      
      processBatch();
    });
  }, []);

  // Performance optimization recommendations
  const getOptimizationRecommendations = useCallback(() => {
    const recommendations = [];
    
    if (performanceMetrics.renderTime > 100) {
      recommendations.push({
        type: 'render',
        message: 'Consider implementing virtual scrolling for large lists',
        priority: 'high'
      });
    }
    
    if (performanceMetrics.apiCallCount > 50) {
      recommendations.push({
        type: 'api',
        message: 'Too many API calls detected. Consider implementing caching',
        priority: 'medium'
      });
    }
    
    if (performanceMetrics.memoryUsage > 50) {
      recommendations.push({
        type: 'memory',
        message: 'High memory usage detected. Consider data pagination',
        priority: 'high'
      });
    }
    
    return recommendations;
  }, [performanceMetrics]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      Object.keys(debounceTimeouts.current).forEach(key => {
        if (debounceTimeouts.current[key]) {
          clearTimeout(debounceTimeouts.current[key]);
        }
      });
    };
  }, []);

  // Auto cleanup effect
  useEffect(() => {
    const interval = setInterval(() => {
      cleanupMemory();
    }, 30000); // Cleanup every 30 seconds

    return () => clearInterval(interval);
  }, [cleanupMemory]);

  return {
    // Performance monitoring
    performanceMetrics,
    startRenderTimer,
    endRenderTimer,
    trackApiCall,
    estimateMemoryUsage,
    
    // Optimization helpers
    createDebouncedFunction,
    useVirtualScrolling,
    batchOperations,
    cleanupMemory,
    
    // Recommendations
    getOptimizationRecommendations
  };
};

export default useHistoryPerformance;
