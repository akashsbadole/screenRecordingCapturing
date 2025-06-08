"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Pen,
  Square,
  Circle,
  ArrowRight,
  Type,
  Highlighter,
  Eraser,
  Undo,
  Redo,
  Palette,
  Star,
  Heart,
  Triangle,
  Minus,
  Plus,
  Eye,
  EyeOff,
  Download,
  Save,
  Trash2,
  MousePointer,
  Move,
  RotateCcw,
  Crop,
  Filter,
  Stamp,
  Image as ImageIcon,
  Droplets,
} from "lucide-react";

interface AnnotationToolbarProps {
  onToolChange: (tool: string) => void;
  onColorChange: (color: string) => void;
  onSizeChange: (size: number) => void;
  onOpacityChange: (opacity: number) => void;
  activeTool: string;
  activeColor: string;
  activeSize: number;
  activeOpacity: number;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onSave: () => void;
  onDownload: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function AnnotationToolbar({
  onToolChange,
  onColorChange,
  onSizeChange,
  onOpacityChange,
  activeTool,
  activeColor,
  activeSize,
  activeOpacity,
  onUndo,
  onRedo,
  onClear,
  onSave,
  onDownload,
  canUndo,
  canRedo,
}: AnnotationToolbarProps) {
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showStamps, setShowStamps] = useState(false);

  const tools = [
    { id: "select", icon: MousePointer, label: "Select" },
    { id: "pen", icon: Pen, label: "Pen" },
    { id: "highlighter", icon: Highlighter, label: "Highlighter" },
    { id: "line", icon: Minus, label: "Line" },
    { id: "arrow", icon: ArrowRight, label: "Arrow" },
    { id: "rectangle", icon: Square, label: "Rectangle" },
    { id: "circle", icon: Circle, label: "Circle" },
    { id: "triangle", icon: Triangle, label: "Triangle" },
    { id: "text", icon: Type, label: "Text" },
    { id: "blur", icon: Filter, label: "Blur" },
    { id: "eraser", icon: Eraser, label: "Eraser" },
  ];

  const colors = [
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#ff00ff",
    "#00ffff",
    "#000000",
    "#ffffff",
    "#808080",
    "#800000",
    "#008000",
    "#000080",
    "#808000",
    "#800080",
    "#008080",
    "#c0c0c0",
    "#ffa500",
    "#ffc0cb",
  ];

  const stamps = [
    { id: "star", icon: Star, label: "Star" },
    { id: "heart", icon: Heart, label: "Heart" },
    { id: "check", icon: Plus, label: "Check" },
    { id: "cross", icon: Plus, label: "Cross" },
    { id: "arrow-up", icon: ArrowRight, label: "Arrow Up" },
    { id: "arrow-down", icon: ArrowRight, label: "Arrow Down" },
  ];

  return (
    <Card className="w-full bg-white/95 backdrop-blur-sm border shadow-lg">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Drawing Tools */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {tools.map((tool) => (
              <Button
                key={tool.id}
                variant={activeTool === tool.id ? "default" : "ghost"}
                size="sm"
                onClick={() => onToolChange(tool.id)}
                className="h-8 w-8 p-0"
                title={tool.label}
              >
                <tool.icon className="h-4 w-4" />
              </Button>
            ))}
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Stamps */}
          <div className="relative">
            <Button
              variant={showStamps ? "default" : "outline"}
              size="sm"
              onClick={() => setShowStamps(!showStamps)}
              className="h-8"
            >
              <Stamp className="h-4 w-4 mr-1" />
              Stamps
            </Button>
            {showStamps && (
              <div className="absolute top-10 left-0 z-50 bg-white border rounded-lg shadow-lg p-2">
                <div className="grid grid-cols-3 gap-1">
                  {stamps.map((stamp) => (
                    <Button
                      key={stamp.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onToolChange(`stamp-${stamp.id}`);
                        setShowStamps(false);
                      }}
                      className="h-8 w-8 p-0"
                      title={stamp.label}
                    >
                      <stamp.icon className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Color Picker */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowColorPalette(!showColorPalette)}
              className="h-8 w-16 p-1"
            >
              <div
                className="w-full h-full rounded border"
                style={{ backgroundColor: activeColor }}
              />
            </Button>
            {showColorPalette && (
              <div className="absolute top-10 left-0 z-50 bg-white border rounded-lg shadow-lg p-2">
                <div className="grid grid-cols-6 gap-1 mb-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded border border-gray-300 cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        onColorChange(color);
                        setShowColorPalette(false);
                      }}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={activeColor}
                  onChange={(e) => onColorChange(e.target.value)}
                  className="w-full h-8 rounded border cursor-pointer"
                />
              </div>
            )}
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Size Control */}
          <div className="flex items-center gap-2 min-w-[120px]">
            <Label className="text-xs">Size:</Label>
            <Slider
              value={[activeSize]}
              onValueChange={(value) => onSizeChange(value[0])}
              max={20}
              min={1}
              step={1}
              className="flex-1"
            />
            <span className="text-xs w-6 text-center">{activeSize}</span>
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Opacity Control */}
          <div className="flex items-center gap-2 min-w-[120px]">
            <Label className="text-xs">Opacity:</Label>
            <Slider
              value={[activeOpacity * 100]}
              onValueChange={(value) => onOpacityChange(value[0] / 100)}
              max={100}
              min={10}
              step={10}
              className="flex-1"
            />
            <span className="text-xs w-8 text-center">
              {Math.round(activeOpacity * 100)}%
            </span>
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              className="h-8 w-8 p-0"
              title="Undo"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              className="h-8 w-8 p-0"
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              className="h-8 w-8 p-0"
              title="Clear All"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Save/Download */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onSave}
              className="h-8"
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onDownload}
              className="h-8"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </div>

        {/* Advanced Options Row */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t">
          <div className="flex items-center gap-2">
            <Label className="text-xs">Advanced:</Label>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              <Crop className="h-3 w-3 mr-1" />
              Crop
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              <RotateCcw className="h-3 w-3 mr-1" />
              Rotate
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              <Droplets className="h-3 w-3 mr-1" />
              Watermark
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              <ImageIcon className="h-3 w-3 mr-1" />
              Template
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
