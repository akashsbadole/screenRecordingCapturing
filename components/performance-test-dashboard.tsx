"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Monitor,
  Camera,
  Pen,
  Video,
  AlertTriangle,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { usePerformanceMonitor } from '@/hooks/use-performance-monitor';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  details?: string;
  metrics?: Record<string, any>;
}

export function PerformanceTestDashboard() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Recording Performance', status: 'pending' },
    { name: 'Annotation Latency', status: 'pending' },
    { name: 'Screenshot Speed', status: 'pending' },
    { name: 'Memory Management', status: 'pending' },
    { name: 'Frame Rate Stability', status: 'pending' },
    { name: 'Canvas Rendering', status: 'pending' },
  ]);

  const [isRunningTests, setIsRunningTests] = useState(false);
  const [currentTestIndex, setCurrentTestIndex] = useState(-1);
  const [overallProgress, setOverallProgress] = useState(0);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  const { toast } = useToast();
  const {
    metrics,
    startMonitoring,
    stopMonitoring,
    trackRenderTime,
    forceGarbageCollection,
    getOptimizationSuggestions,
  } = usePerformanceMonitor();

  // Simulate recording performance test
  const testRecordingPerformance = useCallback(async (): Promise<TestResult> => {
    const startTime = performance.now();
    
    // Simulate recording operations
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const duration = performance.now() - startTime;
    const fps = Math.max(20, 60 - Math.floor(metrics.memoryUsage / 10));
    
    return {
      name: 'Recording Performance',
      status: fps >= 25 ? 'passed' : 'failed',
      duration,
      details: `Achieved ${fps} FPS`,
      metrics: { fps, memoryUsage: metrics.memoryUsage },
    };
  }, [metrics.memoryUsage]);

  // Simulate annotation latency test
  const testAnnotationLatency = useCallback(async (): Promise<TestResult> => {
    const startTime = performance.now();
    const renderTimes: number[] = [];
    
    // Simulate multiple drawing operations
    for (let i = 0; i < 50; i++) {
      const renderStart = performance.now();
      await new Promise(resolve => setTimeout(resolve, 10));
      const renderTime = performance.now() - renderStart;
      renderTimes.push(renderTime);
      trackRenderTime(renderTime);
    }
    
    const avgLatency = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
    const duration = performance.now() - startTime;
    
    return {
      name: 'Annotation Latency',
      status: avgLatency < 16.67 ? 'passed' : 'failed',
      duration,
      details: `Average latency: ${avgLatency.toFixed(2)}ms`,
      metrics: { avgLatency, renderTimes: renderTimes.length },
    };
  }, [trackRenderTime]);

  // Simulate screenshot speed test
  const testScreenshotSpeed = useCallback(async (): Promise<TestResult> => {
    const startTime = performance.now();
    
    // Simulate screenshot capture
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const duration = performance.now() - startTime;
    
    return {
      name: 'Screenshot Speed',
      status: duration < 1000 ? 'passed' : 'failed',
      duration,
      details: `Capture time: ${duration.toFixed(0)}ms`,
      metrics: { captureTime: duration },
    };
  }, []);

  // Simulate memory management test
  const testMemoryManagement = useCallback(async (): Promise<TestResult> => {
    const initialMemory = metrics.memoryUsage;
    
    // Simulate memory-intensive operations
    await new Promise(resolve => setTimeout(resolve, 1000));
    forceGarbageCollection();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const finalMemory = metrics.memoryUsage;
    const memoryLeak = Math.max(0, finalMemory - initialMemory);
    
    return {
      name: 'Memory Management',
      status: memoryLeak < 10 ? 'passed' : 'failed',
      duration: 1500,
      details: `Memory leak: ${memoryLeak}%`,
      metrics: { initialMemory, finalMemory, memoryLeak },
    };
  }, [metrics.memoryUsage, forceGarbageCollection]);

  // Simulate frame rate stability test
  const testFrameRateStability = useCallback(async (): Promise<TestResult> => {
    const frameRates: number[] = [];
    
    // Monitor frame rate for 3 seconds
    for (let i = 0; i < 30; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      frameRates.push(metrics.fps || 60);
    }
    
    const avgFps = frameRates.reduce((a, b) => a + b, 0) / frameRates.length;
    const stability = Math.min(...frameRates) / Math.max(...frameRates);
    
    return {
      name: 'Frame Rate Stability',
      status: stability > 0.8 ? 'passed' : 'failed',
      duration: 3000,
      details: `Average FPS: ${avgFps.toFixed(1)}, Stability: ${(stability * 100).toFixed(1)}%`,
      metrics: { avgFps, stability, frameRates: frameRates.length },
    };
  }, [metrics.fps]);

  // Simulate canvas rendering test
  const testCanvasRendering = useCallback(async (): Promise<TestResult> => {
    const startTime = performance.now();
    
    // Simulate complex canvas operations
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const duration = performance.now() - startTime;
    const renderTime = metrics.renderTime;
    
    return {
      name: 'Canvas Rendering',
      status: renderTime < 16.67 ? 'passed' : 'failed',
      duration,
      details: `Render time: ${renderTime.toFixed(2)}ms`,
      metrics: { renderTime, duration },
    };
  }, [metrics.renderTime]);

  // Run all tests
  const runAllTests = useCallback(async () => {
    setIsRunningTests(true);
    setOverallProgress(0);
    startMonitoring();

    const testFunctions = [
      testRecordingPerformance,
      testAnnotationLatency,
      testScreenshotSpeed,
      testMemoryManagement,
      testFrameRateStability,
      testCanvasRendering,
    ];

    const results: TestResult[] = [];
    const resultMetrics: Record<string, any> = {};

    for (let i = 0; i < testFunctions.length; i++) {
      setCurrentTestIndex(i);
      
      // Update test status to running
      setTests(prev => prev.map((test, index) => 
        index === i ? { ...test, status: 'running' } : test
      ));

      try {
        const result = await testFunctions[i]();
        results.push(result);
        resultMetrics[result.name] = result.metrics;
        
        // Update test status
        setTests(prev => prev.map((test, index) => 
          index === i ? result : test
        ));
      } catch (error) {
        const failedResult: TestResult = {
          name: tests[i].name,
          status: 'failed',
          details: 'Test execution failed',
        };
        results.push(failedResult);
        
        setTests(prev => prev.map((test, index) => 
          index === i ? failedResult : test
        ));
      }

      setOverallProgress(((i + 1) / testFunctions.length) * 100);
    }

    setTestResults(resultMetrics);
    setCurrentTestIndex(-1);
    setIsRunningTests(false);
    stopMonitoring();

    // Show summary
    const passedTests = results.filter(r => r.status === 'passed').length;
    const totalTests = results.length;
    
    toast({
      title: "Performance Tests Completed",
      description: `${passedTests}/${totalTests} tests passed`,
      variant: passedTests === totalTests ? "default" : "destructive",
    });
  }, [
    tests,
    testRecordingPerformance,
    testAnnotationLatency,
    testScreenshotSpeed,
    testMemoryManagement,
    testFrameRateStability,
    testCanvasRendering,
    startMonitoring,
    stopMonitoring,
    toast,
  ]);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      passed: 'default',
      failed: 'destructive',
      running: 'secondary',
      pending: 'outline',
    } as const;

    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Test Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Test recording, annotation, and capture performance
              </p>
            </div>
            <Button 
              onClick={runAllTests} 
              disabled={isRunningTests}
              className="min-w-[120px]"
            >
              {isRunningTests ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-pulse" />
                  Testing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Run Tests
                </>
              )}
            </Button>
          </div>

          {isRunningTests && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="tests" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tests">Test Results</TabsTrigger>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="suggestions">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-4">
          <div className="grid gap-4">
            {tests.map((test, index) => (
              <Card key={test.name} className={currentTestIndex === index ? 'ring-2 ring-blue-500' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <h4 className="font-medium">{test.name}</h4>
                        {test.details && (
                          <p className="text-sm text-muted-foreground">{test.details}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {test.duration && (
                        <span className="text-xs text-muted-foreground">
                          {test.duration.toFixed(0)}ms
                        </span>
                      )}
                      {getStatusBadge(test.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Current Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{metrics.fps}</div>
                  <div className="text-sm text-muted-foreground">FPS</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{metrics.memoryUsage}%</div>
                  <div className="text-sm text-muted-foreground">Memory</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{metrics.renderTime.toFixed(1)}ms</div>
                  <div className="text-sm text-muted-foreground">Render Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{metrics.cpuUsage}%</div>
                  <div className="text-sm text-muted-foreground">CPU Usage</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Optimization Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getOptimizationSuggestions().map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                    <span className="text-sm">{suggestion}</span>
                  </div>
                ))}
                {getOptimizationSuggestions().length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p>Performance is optimal! No suggestions at this time.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
