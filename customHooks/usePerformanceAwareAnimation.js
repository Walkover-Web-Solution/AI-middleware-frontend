import { useState, useEffect, useCallback } from 'react';

export const usePerformanceAwareAnimation = () => {
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [shouldUseGPU, setShouldUseGPU] = useState(true);
  const [frameRate, setFrameRate] = useState(60);
  const [isVeryLowEnd, setIsVeryLowEnd] = useState(false);

  useEffect(() => {
    // Detect reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    // Detect frame rate and device capabilities
    const detectDeviceCapabilities = () => {
      const cores = navigator.hardwareConcurrency || 2;
      const memory = navigator.deviceMemory || 2;
      const connection = navigator.connection?.effectiveType;
      
      // Consider device low-end if:
      // - Less than 4 CPU cores
      // - Less than 4GB RAM
      // - Slow network connection
      const isLowEnd = cores < 4 || memory < 4 || connection === '2g' || connection === 'slow-2g';
      const isVeryLowEndDevice = cores < 2 || memory < 2 || connection === 'slow-2g';
      
      setIsLowEndDevice(isLowEnd);
      setIsVeryLowEnd(isVeryLowEndDevice);
      
      // Disable GPU acceleration on very low-end devices
      setShouldUseGPU(!isVeryLowEndDevice);
    };
    
    // Measure frame rate for performance optimization
    const measureFrameRate = () => {
      let frames = 0;
      let startTime = performance.now();
      
      const countFrames = () => {
        frames++;
        const currentTime = performance.now();
        
        if (currentTime - startTime >= 1000) {
          const fps = Math.round((frames * 1000) / (currentTime - startTime));
          setFrameRate(fps);
          
          // Stop measuring after getting a reading
          return;
        }
        
        if (frames < 120) { // Measure for max 2 seconds
          requestAnimationFrame(countFrames);
        }
      };
      
      requestAnimationFrame(countFrames);
    };

    detectDeviceCapabilities();
    
    // Measure frame rate on capable devices
    if (!prefersReducedMotion) {
      measureFrameRate();
    }

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const getOptimizedTransition = useCallback((duration = 300) => {
    if (prefersReducedMotion) {
      return 'none';
    }
    
    if (isVeryLowEnd || frameRate < 30) {
      // Use very short duration for very low-end devices or low frame rates
      return `all ${Math.min(duration, 100)}ms linear`;
    }
    
    if (isLowEndDevice || frameRate < 45) {
      // Use shorter duration and simpler easing for low-end devices
      return `all ${Math.min(duration, 150)}ms ease-out`;
    }
    
    // Full transition for capable devices
    return `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
  }, [isLowEndDevice, isVeryLowEnd, prefersReducedMotion, frameRate]);

  const getOptimizedTransform = useCallback((transform) => {
    if (prefersReducedMotion) {
      return 'none';
    }
    
    if (!shouldUseGPU) {
      // Fallback to simpler transforms for devices without good GPU support
      return transform.replace('translateX', 'left').replace('translateY', 'top');
    }
    
    return transform;
  }, [shouldUseGPU, prefersReducedMotion]);

  const getWillChange = useCallback((properties = 'transform') => {
    if (prefersReducedMotion || isLowEndDevice) {
      return 'auto';
    }
    return properties;
  }, [isLowEndDevice, prefersReducedMotion]);

  const shouldUseCSSOnlyAnimations = useCallback(() => {
    return isVeryLowEnd || frameRate < 20 || prefersReducedMotion;
  }, [isVeryLowEnd, frameRate, prefersReducedMotion]);
  
  const getOptimizedDuration = useCallback((baseDuration = 300) => {
    if (prefersReducedMotion) return 0;
    if (isVeryLowEnd || frameRate < 30) return Math.min(baseDuration, 100);
    if (isLowEndDevice || frameRate < 45) return Math.min(baseDuration, 150);
    return baseDuration;
  }, [isLowEndDevice, isVeryLowEnd, prefersReducedMotion, frameRate]);

  return {
    isLowEndDevice,
    isVeryLowEnd,
    prefersReducedMotion,
    shouldUseGPU,
    frameRate,
    getOptimizedTransition,
    getOptimizedTransform,
    getWillChange,
    shouldUseCSSOnlyAnimations,
    getOptimizedDuration
  };
};
