import React, { useRef, useEffect } from 'react';
import { Page } from 'react-pdf';
import { pdfRenderingService } from '../services/pdfRenderingService';

interface PdfCanvasRendererProps {
  pageNumber: number;
  scale: number;
  rotation?: number;
  quality?: 'low' | 'medium' | 'high';
  onRenderSuccess?: () => void;
  onRenderError?: (error: Error) => void;
}

export const PdfCanvasRenderer: React.FC<PdfCanvasRendererProps> = ({
  pageNumber,
  scale,
  rotation = 0,
  quality = 'medium',
  onRenderSuccess,
  onRenderError,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pageRef = useRef<any>(null);

  useEffect(() => {
    const renderPage = async () => {
      if (!pageRef.current || !canvasRef.current) return;

      try {
        await pdfRenderingService.renderPage(pageRef.current, canvasRef.current, {
          scale,
          rotation,
          quality
        });
        onRenderSuccess?.();
      } catch (error) {
        console.error('Error rendering PDF page:', error);
        onRenderError?.(error as Error);
      }
    };

    renderPage();
  }, [pageNumber, scale, rotation, quality, onRenderSuccess, onRenderError]);

  return (
    <div className="pdf-canvas-renderer">
      <canvas ref={canvasRef} className="pdf-canvas" />
      <div style={{ display: 'none' }}>
        <Page
          pageNumber={pageNumber}
          scale={scale}
          rotate={rotation}
          onLoadSuccess={(page) => {
            pageRef.current = page;
          }}
        />
      </div>
    </div>
  );
};