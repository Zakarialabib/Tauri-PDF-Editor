import React, { useState, useRef } from 'react';

export interface FormElementProps {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  isSelected: boolean;
  onClick: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
  children?: React.ReactNode;
}

export const BaseFormElement: React.FC<FormElementProps> = ({
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
  children,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Handle element click
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(id);
  };

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width,
      height,
    });
    setIsResizing(true);
  };

  // Handle mouse move (for both dragging and resizing)
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Calculate new position
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        // Update position
        onMove(id, newX, newY);
      } else if (isResizing) {
        // Calculate new dimensions
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        
        const newWidth = Math.max(50, resizeStart.width + deltaX);
        const newHeight = Math.max(20, resizeStart.height + deltaY);
        
        // Update dimensions
        onResize(id, newWidth, newHeight);
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };
    
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [id, isDragging, isResizing, dragOffset, resizeStart, onMove, onResize]);

  return (
    <div
      ref={elementRef}
      className={`absolute ${isSelected ? 'z-10' : 'z-1'}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
      onClick={handleClick}
    >
      {/* Form element content */}
      <div 
        className={`w-full h-full ${isSelected ? 'border-2 border-blue-500' : 'border border-gray-300 hover:border-blue-300'} bg-white rounded overflow-hidden`}
        onMouseDown={handleDragStart}
      >
        {children}
      </div>
      
      {/* Element label */}
      {isSelected && (
        <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
          {name}
        </div>
      )}
      
      {/* Resize handle */}
      {isSelected && (
        <div 
          className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize"
          onMouseDown={handleResizeStart}
        />
      )}
    </div>
  );
}; 