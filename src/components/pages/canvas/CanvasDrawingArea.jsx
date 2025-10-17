"use client";

import { useState, useRef, useEffect } from 'react';
import { 
  Pencil, 
  Eraser, 
  RotateCcw, 
  RotateCw, 
  Download, 
  Palette,
  Sliders,
  Sparkles,
  Trash2
} from "lucide-react";

export default function CanvasDrawingArea() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#C15F3C');
  const [tool, setTool] = useState('pencil');
  const [opacity, setOpacity] = useState(100);

  const colors = [
    '#C15F3C', '#F59B7B', '#FFCEBC', '#F9F3F0', 
    '#8B4513', '#D2691E', '#CD853F', '#DEB887',
    '#000000', '#FFFFFF', '#808080', '#C0C0C0'
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 600;
    canvas.height = 600;
    
    // Set initial styles
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    
    // Set brush properties
    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : brushColor;
    ctx.lineWidth = brushSize;
    ctx.globalAlpha = opacity / 100;
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'canvas-drawing.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const generateFromCanvas = () => {
    // This would integrate with your AI generation API
    console.log('Generating from canvas...');
  };

  return (
    <div className="flex-1 flex">
      {/* Main Canvas Area */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-200 relative">
        {/* Top Toolbar */}
        <div className="absolute top-4 left-4 flex space-x-2 z-10">
          <button 
            onClick={() => setTool('pencil')}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
              tool === 'pencil' ? 'bg-[#C15F3C] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setTool('eraser')}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
              tool === 'eraser' ? 'bg-[#C15F3C] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Eraser className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
            <RotateCcw className="w-5 h-5 text-gray-600" />
          </button>
          <button className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
            <RotateCw className="w-5 h-5 text-gray-600" />
          </button>
          <button 
            onClick={downloadCanvas}
            className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5 text-gray-600" />
          </button>
          <button 
            onClick={clearCanvas}
            className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-5 h-5 text-red-600" />
          </button>
        </div>

        {/* Canvas */}
        <div className="w-full h-full flex items-center justify-center p-8">
          <canvas
            ref={canvasRef}
            className="border border-gray-200 rounded-xl cursor-crosshair shadow-sm"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>

        {/* Generate Button */}
        <div className="absolute bottom-4 right-4">
          <button 
            onClick={generateFromCanvas}
            className="bg-[#C15F3C] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#A54F32] transition-colors flex items-center space-x-2 shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate</span>
          </button>
        </div>
      </div>

      {/* Right Sidebar - Tools */}
      <div className="w-20 ml-4 flex flex-col items-center space-y-4">
        {/* Color Palette */}
        <div className="bg-white rounded-2xl p-3 flex flex-col space-y-2">
          <div className="text-xs text-gray-500 font-medium text-center mb-2">Colors</div>
          {colors.map((color, index) => (
            <button
              key={index}
              onClick={() => setBrushColor(color)}
              className={`w-8 h-8 rounded-lg border-2 transition-all ${
                brushColor === color ? 'border-gray-800 scale-110' : 'border-gray-200 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Brush Size */}
        <div className="bg-white rounded-2xl p-3 flex flex-col items-center">
          <div className="text-xs text-gray-500 font-medium mb-2">Size</div>
          <input
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-8 h-32 bg-gray-100 rounded-lg appearance-none cursor-pointer"
            style={{
              writingMode: 'bt-lr',
              WebkitAppearance: 'slider-vertical'
            }}
          />
          <div className="mt-2 text-xs text-gray-500 font-medium">
            {brushSize}
          </div>
        </div>

        {/* Opacity */}
        <div className="bg-white rounded-2xl p-3 flex flex-col items-center">
          <div className="text-xs text-gray-500 font-medium mb-2">Opacity</div>
          <input
            type="range"
            min="10"
            max="100"
            value={opacity}
            onChange={(e) => setOpacity(parseInt(e.target.value))}
            className="w-8 h-32 bg-gray-100 rounded-lg appearance-none cursor-pointer"
            style={{
              writingMode: 'bt-lr',
              WebkitAppearance: 'slider-vertical'
            }}
          />
          <div className="mt-2 text-xs text-gray-500 font-medium">
            {opacity}%
          </div>
        </div>
      </div>
    </div>
  );
}









