import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { usePerformanceAwareAnimation } from './usePerformanceAwareAnimation';

export const useSidebarState = () => {
  const pathname = usePathname();
  const pathParts = pathname.split('?')[0].split('/');
  const isSideBySideMode = pathParts.length === 4;
  
  // Performance optimization hooks
  const { 
    isLowEndDevice, 
    isVeryLowEnd, 
    prefersReducedMotion, 
    frameRate, 
    getOptimizedTransition, 
    getWillChange, 
    shouldUseCSSOnlyAnimations, 
    getOptimizedDuration 
  } = usePerformanceAwareAnimation();
  const animationTimeoutRef = useRef(null);
  const isAnimatingRef = useRef(false);
  const throttleTimeoutRef = useRef(null);

  const [isOpen, setIsOpen] = useState(isSideBySideMode);
  const [hovered, setHovered] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileVisible, setIsMobileVisible] = useState(false);
  const [showContent, setShowContent] = useState(isSideBySideMode);

  // Effect to detect mobile screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Effect to hide sidebar by default on mobile
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
      setIsMobileVisible(false);
    }
  }, [isMobile]);

  // Effect to handle sidebar state when path changes
  useEffect(() => {
    if (isSideBySideMode) {
      setIsOpen(true);
    } else if (pathParts.length > 4) {
      setIsOpen(false);
    }
    
    if (isMobile) {
      setIsOpen(false);
      setIsMobileVisible(false);
    }
  }, [isSideBySideMode, pathParts.length, isMobile]);

  // Handle content visibility with performance-aware delays
  useEffect(() => {
    // Clear any existing timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    
    if (isOpen && !isMobile) {
      // Show content immediately when opening
      setShowContent(true);
      isAnimatingRef.current = false;
    } else if (!isOpen && !isMobile) {
      // Use optimized delay based on device capabilities and frame rate
      const delay = getOptimizedDuration(300);
      
      if (delay === 0 || shouldUseCSSOnlyAnimations()) {
        setShowContent(false);
        isAnimatingRef.current = false;
      } else {
        isAnimatingRef.current = true;
        animationTimeoutRef.current = setTimeout(() => {
          setShowContent(false);
          isAnimatingRef.current = false;
        }, delay);
      }
    }
    
    if (isSideBySideMode && isOpen) {
      setShowContent(true);
      isAnimatingRef.current = false;
    }
    
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [isOpen, isMobile, isSideBySideMode, getOptimizedDuration, shouldUseCSSOnlyAnimations]);

  // Hide tooltip when sidebar expands
  useEffect(() => {
    if (isOpen && !isMobile) setHovered(null);
  }, [isOpen, isMobile]);

  const handleToggle = useCallback((e) => {
    // Prevent multiple rapid toggles during animation
    if (isAnimatingRef.current && !shouldUseCSSOnlyAnimations()) {
      return;
    }
    
    // Throttle toggle operations on very low-end devices
    if (isVeryLowEnd && throttleTimeoutRef.current) {
      return;
    }
    
    setHovered(null);
    
    const performToggle = () => {
      if (isSideBySideMode) {
        setIsOpen(prev => !prev);
      } else {
        if (e?.detail === 2 && !isMobile) {
          setIsOpen(true);
        } else {
          setIsOpen(prev => !prev);
        }
      }
    };
    
    // Use immediate state update for reduced motion or very low-end devices
    if (shouldUseCSSOnlyAnimations() || isVeryLowEnd) {
      performToggle();
      
      // Add throttling for very low-end devices
      if (isVeryLowEnd) {
        throttleTimeoutRef.current = setTimeout(() => {
          throttleTimeoutRef.current = null;
        }, 100);
      }
    } else {
      // Use requestAnimationFrame for smooth devices
      requestAnimationFrame(performToggle);
    }
  }, [isSideBySideMode, isMobile, shouldUseCSSOnlyAnimations, isVeryLowEnd]);

  const handleMobileMenuToggle = useCallback(() => {
    setHovered(null);
    setIsMobileVisible(prev => !prev);
  }, []);

  const handleSettingsClick = useCallback(() => {
    if (isMobile) {
      if (!isMobileVisible) {
        setIsMobileVisible(true);
        setIsSettingsOpen(true);
      } else {
        setIsSettingsOpen(prev => !prev);
      }
    } else {
      if (!isOpen) {
        setIsOpen(true);
        setIsSettingsOpen(true);
      } else {
        setIsSettingsOpen(prev => !prev);
      }
    }
  }, [isMobile, isMobileVisible, isOpen]);

  const handleBackdropClick = useCallback(() => {
    if (isMobile && isMobileVisible) {
      setIsMobileVisible(false);
    }
  }, [isMobile, isMobileVisible]);

  return {
    isOpen,
    setIsOpen,
    hovered,
    setHovered,
    tooltipPos,
    setTooltipPos,
    isMobile,
    isSettingsOpen,
    setIsSettingsOpen,
    isMobileVisible,
    setIsMobileVisible,
    showContent,
    pathParts,
    isSideBySideMode,
    handleToggle,
    handleMobileMenuToggle,
    handleSettingsClick,
    handleBackdropClick,
    // Performance optimization props
    isLowEndDevice,
    isVeryLowEnd,
    prefersReducedMotion,
    frameRate,
    getOptimizedTransition,
    getWillChange,
    shouldUseCSSOnlyAnimations,
    getOptimizedDuration
  };
};
