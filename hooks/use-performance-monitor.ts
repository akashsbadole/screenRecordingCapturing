import { useState, useEffect, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  cpuUsage: number;
  renderTime: number;
  frameDrops: number;
  timestamp: number;
}

interface PerformanceConfig {
  monitoringInterval: number;
  fpsTarget: number;
  memoryThreshold: number;
  autoOptimize: boolean;
}

export function usePerformanceMonitor(config: Partial<PerformanceConfig> = {}) {
  const defaultConfig: PerformanceConfig = {
    monitoringInterval: 1000,
    fpsTarget: 30,
    memoryThreshold: 80,
    autoOptimize: true,
    ...config,
  };

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    renderTime: 0,
    frameDrops: 0,
    timestamp: Date.now(),
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [performanceIssues, setPerformanceIssues] = useState<string[]>([]);
  
  const monitoringRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(performance.now());
  const renderTimesRef = useRef<number[]>([]);

  // FPS monitoring using requestAnimationFrame
  const measureFPS = useCallback(() => {
    frameCountRef.current++;
    const currentTime = performance.now();
    const deltaTime = currentTime - lastFrameTimeRef.current;
    
    if (deltaTime >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / deltaTime);
      frameCountRef.current = 0;
      lastFrameTimeRef.current = currentTime;
      
      setMetrics(prev => ({
        ...prev,
        fps,
        frameDrops: Math.max(0, defaultConfig.fpsTarget - fps),
        timestamp: Date.now(),
      }));
    }
    
    if (isMonitoring) {
      requestAnimationFrame(measureFPS);
    }
  }, [isMonitoring, defaultConfig.fpsTarget]);

  // Memory and CPU monitoring
  const measureSystemMetrics = useCallback(() => {
    try {
      // Memory usage (if available)
      const memoryInfo = (performance as any).memory;
      let memoryUsage = 0;
      
      if (memoryInfo) {
        memoryUsage = Math.round(
          (memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100
        );
      }

      // Estimate CPU usage based on render times
      const avgRenderTime = renderTimesRef.current.length > 0
        ? renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length
        : 0;
      
      const cpuUsage = Math.min(100, Math.round(avgRenderTime * 6)); // Rough estimation

      setMetrics(prev => ({
        ...prev,
        memoryUsage,
        cpuUsage,
        renderTime: avgRenderTime,
      }));

      // Check for performance issues
      const issues: string[] = [];
      if (memoryUsage > defaultConfig.memoryThreshold) {
        issues.push('High memory usage detected');
      }
      if (prev.fps < defaultConfig.fpsTarget * 0.8) {
        issues.push('Low frame rate detected');
      }
      if (avgRenderTime > 16.67) { // 60fps threshold
        issues.push('High render time detected');
      }
      
      setPerformanceIssues(issues);

      // Clear render times array to prevent memory buildup
      renderTimesRef.current = renderTimesRef.current.slice(-10);
      
    } catch (error) {
      console.warn('Performance monitoring error:', error);
    }
  }, [defaultConfig.memoryThreshold, defaultConfig.fpsTarget]);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;
    
    setIsMonitoring(true);
    frameCountRef.current = 0;
    lastFrameTimeRef.current = performance.now();
    
    // Start FPS monitoring
    requestAnimationFrame(measureFPS);
    
    // Start system metrics monitoring
    monitoringRef.current = window.setInterval(
      measureSystemMetrics,
      defaultConfig.monitoringInterval
    );
  }, [isMonitoring, measureFPS, measureSystemMetrics, defaultConfig.monitoringInterval]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    
    if (monitoringRef.current) {
      clearInterval(monitoringRef.current);
      monitoringRef.current = null;
    }
    
    setMetrics({
      fps: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      renderTime: 0,
      frameDrops: 0,
      timestamp: Date.now(),
    });
    
    setPerformanceIssues([]);
  }, []);

  // Track render time for operations
  const trackRenderTime = useCallback((renderTime: number) => {
    renderTimesRef.current.push(renderTime);
  }, []);

  // Force garbage collection (if available)
  const forceGarbageCollection = useCallback(() => {
    if (window.gc && typeof window.gc === 'function') {
      window.gc();
    }
  }, []);

  // Auto-optimization suggestions
  const getOptimizationSuggestions = useCallback(() => {
    const suggestions: string[] = [];
    
    if (metrics.memoryUsage > 80) {
      suggestions.push('Consider reducing recording quality or clearing cache');
    }
    
    if (metrics.fps < defaultConfig.fpsTarget * 0.8) {
      suggestions.push('Lower frame rate or resolution for better performance');
    }
    
    if (metrics.renderTime > 16.67) {
      suggestions.push('Reduce annotation complexity or disable real-time effects');
    }
    
    return suggestions;
  }, [metrics, defaultConfig.fpsTarget]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    metrics,
    isMonitoring,
    performanceIssues,
    startMonitoring,
    stopMonitoring,
    trackRenderTime,
    forceGarbageCollection,
    getOptimizationSuggestions,
  };
}
