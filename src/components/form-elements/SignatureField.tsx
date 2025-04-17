import React, { useRef, useState, useEffect } from 'react';
import { BaseFormElement, FormElementProps } from './BaseFormElement';

interface SignatureFieldProps extends FormElementProps {
  signatureData: string | null;
  onSign: (id: string, signatureData: string) => void;
  onClear: (id: string) => void;
}

export const SignatureField: React.FC<SignatureFieldProps> = ({
  id,
  name,
  x,
  y,
  width,
  height,
  page,
  isSelected,
  onClick,
  onMove,
  onResize,
  signatureData,
  onSign,
  onClear,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(!!signatureData);

  // Initialize canvas with existing signature data if available
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw existing signature if available
    if (signatureData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        setHasSignature(true);
      };
      img.src = signatureData;
    } else {
      setHasSignature(false);
    }
  }, [signatureData]);

  // Resize canvas to match container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;
      
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      
      // Redraw signature if exists
      if (signatureData) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = signatureData;
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [signatureData]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
    
    // Prevent parent element from handling the event
    e.stopPropagation();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Prevent parent element from handling the event
    e.stopPropagation();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Save signature data
    const signatureData = canvas.toDataURL('image/png');
    onSign(id, signatureData);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onClear(id);
  };

  return (
    <BaseFormElement
      id={id}
      name={name}
      x={x}
      y={y}
      width={width}
      height={height}
      page={page}
      isSelected={isSelected}
      onClick={onClick}
      onMove={onMove}
      onResize={onResize}
    >
      <div className="relative w-full h-full flex flex-col">
        <div className="flex-1 border border-gray-300 bg-white">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        
        {isSelected && (
          <div className="absolute bottom-0 right-0 p-1 bg-white bg-opacity-75 rounded-tl">
            <button
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              onClick={handleClear}
              disabled={!hasSignature}
            >
              Clear
            </button>
          </div>
        )}
        
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-gray-400 text-sm">Sign here</span>
          </div>
        )}
      </div>
    </BaseFormElement>
  );
}; 