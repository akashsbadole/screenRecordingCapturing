"use client";

import { useRef, useEffect, useCallback, useState } from 'react';
import { usePerformanceMonitor } from '@/hooks/use-performance-monitor';

interface Point {
  x: number;
  y: number;
}

interface DrawingPath {
  tool: string;
  color: string;
  size: number;
  opacity: number;
  points: Point[];
  timestamp: number;
}

interface AnnotationCanvasProps {
  width: number;
  height: number;
  tool: string;
  color: string;
  size: number;
  opacity: number;
  onAnnotationChange?: (annotations: DrawingPath[]) => void;
  className?: string;
}

export function EnhancedAnnotationCanvas({
  width,
  height,
  tool,
  color,
  size,
  opacity,
  onAnnotationChange,
  className = '',
}: AnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [annotations, setAnnotations] = useState<DrawingPath[]>([]);
  const [undoStack, setUndoStack] = useState<DrawingPath[][]>([]);
  const [redoStack, setRedoStack] = useState<DrawingPath[][]>([]);
  const currentPathRef = useRef<DrawingPath | null>(null);
  const drawQueueRef = useRef<(() => void)[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const { trackRenderTime, metrics } = usePerformanceMonitor({
    fpsTarget: 60,
    autoOptimize: true,
  });

  // Optimized drawing queue system
  const flushDrawQueue = useCallback(() => {
    const startTime = performance.now();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Process all queued drawing operations
    while (drawQueueRef.current.length > 0) {
      const drawOp = drawQueueRef.current.shift();
      if (drawOp) drawOp();
    }

    const renderTime = performance.now() - startTime;
    trackRenderTime(renderTime);
    animationFrameRef.current = null;
  }, [trackRenderTime]);

  const queueDraw = useCallback((drawOperation: () => void) => {
    drawQueueRef.current.push(drawOperation);
    
    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(flushDrawQueue);
    }
  }, [flushDrawQueue]);

  // Optimized path drawing
  const drawPath = useCallback((path: DrawingPath) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.globalAlpha = path.opacity;
    ctx.strokeStyle = path.color;
    ctx.lineWidth = path.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (path.tool === 'highlighter') {
      ctx.globalCompositeOperation = 'multiply';
    } else if (path.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    }

    if (path.points.length > 1) {
      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);
      
      // Use quadratic curves for smoother lines
      for (let i = 1; i < path.points.length - 1; i++) {
        const currentPoint = path.points[i];
        const nextPoint = path.points[i + 1];
        const controlX = (currentPoint.x + nextPoint.x) / 2;
        const controlY = (currentPoint.y + nextPoint.y) / 2;
        ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, controlX, controlY);
      }
      
      // Draw the last point
      if (path.points.length > 1) {
        const lastPoint = path.points[path.points.length - 1];
        ctx.lineTo(lastPoint.x, lastPoint.y);
      }
      
      ctx.stroke();
    }

    ctx.restore();
  }, []);

  // Redraw all annotations
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    queueDraw(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      annotations.forEach(annotation => drawPath(annotation));
    });
  }, [annotations, drawPath, queueDraw]);

  // Mouse/touch event handlers
  const getEventPoint = useCallback((e: MouseEvent | TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  }, []);

  const startDrawing = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    
    const point = getEventPoint(e);
    currentPathRef.current = {
      tool,
      color,
      size,
      opacity,
      points: [point],
      timestamp: Date.now(),
    };
  }, [tool, color, size, opacity, getEventPoint]);

  const draw = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDrawing || !currentPathRef.current) return;
    
    e.preventDefault();
    const point = getEventPoint(e);
    currentPathRef.current.points.push(point);
    
    queueDraw(() => drawPath(currentPathRef.current!));
  }, [isDrawing, getEventPoint, drawPath, queueDraw]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing || !currentPathRef.current) return;
    
    setIsDrawing(false);
    
    // Add to annotations and update undo stack
    const newAnnotations = [...annotations, currentPathRef.current];
    setAnnotations(newAnnotations);
    setUndoStack(prev => [...prev, annotations]);
    setRedoStack([]); // Clear redo stack when new action is performed
    
    onAnnotationChange?.(newAnnotations);
    currentPathRef.current = null;
  }, [isDrawing, annotations, onAnnotationChange]);

  // Undo/Redo functionality
  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    
    const previousState = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, annotations]);
    setUndoStack(prev => prev.slice(0, -1));
    setAnnotations(previousState);
    onAnnotationChange?.(previousState);
  }, [undoStack, annotations, onAnnotationChange]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, annotations]);
    setRedoStack(prev => prev.slice(0, -1));
    setAnnotations(nextState);
    onAnnotationChange?.(nextState);
  }, [redoStack, annotations, onAnnotationChange]);

  const clear = useCallback(() => {
    setUndoStack(prev => [...prev, annotations]);
    setRedoStack([]);
    setAnnotations([]);
    onAnnotationChange?.([]);
  }, [annotations, onAnnotationChange]);

  // Setup event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    // Touch events
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [startDrawing, draw, stopDrawing]);

  // Redraw when annotations change
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    canvasRef,
    annotations,
    undo,
    redo,
    clear,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    performanceMetrics: metrics,
    Canvas: (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`absolute top-0 left-0 cursor-crosshair ${className}`}
        style={{ touchAction: 'none' }}
      />
    ),
  };
}
