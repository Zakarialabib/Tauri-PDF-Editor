import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist/types/src/display/api';
import { readFile } from '@tauri-apps/plugin-fs';
import { PdfDocument, PdfPage } from '../lib/commands';
import { FormElementRenderer } from './FormElementRenderer';

// Set the worker path to use the local version from pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

interface FormField {
  id: string;
  type: 'text' | 'checkbox' | 'signature' | 'dropdown';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  zIndex: number;
  properties: any;
  selected?: boolean;
}

interface PdfViewerProps {
  pdfPath?: string;
  pdfDocument?: PdfDocument;
  scale?: number;
  rotation?: number;
  pageNumber?: number;
  formFields?: FormField[];
  onFieldSelect?: (field: FormField) => void;
  onFieldMove?: (field: FormField, x: number, y: number) => void;
  onFieldResize?: (field: FormField, width: number, height: number) => void;
  onPageChange?: (pageNumber: number) => void;
  onDocumentLoaded?: (document: PDFDocumentProxy) => void;
  onPageDimensionsChange?: (width: number, height: number) => void;
  onZoomChange?: (scale: number) => void;
  onRotationChange?: (rotation: number) => void;
}

const PdfViewer: React.FC<PdfViewerProps> = ({
  pdfPath,
  pdfDocument,
  scale = 1.0,
  rotation = 0,
  pageNumber = 1,
  formFields = [],
  onFieldSelect,
  onFieldMove,
  onFieldResize,
  onPageChange,
  onDocumentLoaded,
  onPageDimensionsChange,
  onZoomChange,
  onRotationChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(pageNumber);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentScale, setCurrentScale] = useState<number>(scale);
  const [currentRotation, setCurrentRotation] = useState<number>(rotation);

  // Load the PDF document when the path changes
  useEffect(() => {
    if (!pdfPath) return;

    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);

        let pdfData;
        
        if (pdfPath.startsWith('http') || pdfPath.startsWith('/')) {
          // For web URLs or relative paths
          const response = await fetch(pdfPath);
          const arrayBuffer = await response.arrayBuffer();
          pdfData = new Uint8Array(arrayBuffer);
        } else {
          // For local files
          pdfData = await readFile(pdfPath);
        }
        
        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        const pdfDocument = await loadingTask.promise;
        
        setPdfDoc(pdfDocument);
        setTotalPages(pdfDocument.numPages);
        setCurrentPage(1);
        
        if (onDocumentLoaded) {
          onDocumentLoaded(pdfDocument);
        }
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError(`Failed to load PDF: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    loadPdf();
  }, [pdfPath, onDocumentLoaded]);

  // Update scale when scale prop changes
  useEffect(() => {
    if (scale !== currentScale) {
      setCurrentScale(scale);
    }
  }, [scale]);

  // Update rotation when rotation prop changes
  useEffect(() => {
    if (rotation !== currentRotation) {
      setCurrentRotation(rotation);
    }
  }, [rotation]);

  // Notify parent when scale changes
  useEffect(() => {
    if (onZoomChange && currentScale !== scale) {
      onZoomChange(currentScale);
    }
  }, [currentScale, onZoomChange, scale]);

  // Notify parent when rotation changes
  useEffect(() => {
    if (onRotationChange && currentRotation !== rotation) {
      onRotationChange(currentRotation);
    }
  }, [currentRotation, onRotationChange, rotation]);

  // Render the current page when it changes
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        setLoading(true);
        
        const page = await pdfDoc.getPage(currentPage);
        const canvas = canvasRef.current!;
        const context = canvas.getContext('2d')!;
        
        const viewport = page.getViewport({ 
          scale: currentScale,
          rotation: currentRotation
        });
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        
        await page.render(renderContext).promise;

        if (onPageDimensionsChange) {
          const originalViewport = page.getViewport({ scale: 1.0, rotation: 0 });
          onPageDimensionsChange(originalViewport.width, originalViewport.height);
        }
      } catch (err) {
        console.error('Error rendering page:', err);
        setError(`Failed to render page: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    renderPage();
  }, [pdfDoc, currentPage, currentScale, currentRotation, onPageDimensionsChange]);

  // Update current page when pageNumber prop changes
  useEffect(() => {
    if (pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
    }
  }, [pageNumber]);

  // Notify parent when page changes
  useEffect(() => {
    if (onPageChange && currentPage !== pageNumber) {
      onPageChange(currentPage);
    }
  }, [currentPage, onPageChange, pageNumber]);

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const zoomIn = () => {
    setCurrentScale(prev => Math.min(prev + 0.1, 3.0));
  };

  const zoomOut = () => {
    setCurrentScale(prev => Math.max(prev - 0.1, 0.5));
  };

  const rotateClockwise = () => {
    setCurrentRotation(prev => (prev + 90) % 360);
  };

  const rotateCounterClockwise = () => {
    setCurrentRotation(prev => (prev - 90 + 360) % 360);
  };

  const handleFieldClick = (field: FormField) => {
    if (onFieldSelect) {
      onFieldSelect(field);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (onFieldSelect && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const clickedField = formFields.find(field => 
        field.page === currentPage &&
        x >= field.x && x <= field.x + field.width &&
        y >= field.y && y <= field.y + field.height
      );
      
      if (!clickedField) {
        onFieldSelect(null as any);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center p-2 bg-gray-100 mb-2 rounded">
        <div className="flex items-center space-x-2 mr-4">
          <button 
            className="tool-button"
            onClick={goToPreviousPage}
            disabled={currentPage <= 1}
          >
            ◀
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages || '?'}
          </span>
          <button 
            className="tool-button"
            onClick={goToNextPage}
            disabled={currentPage >= (totalPages || 1)}
          >
            ▶
          </button>
        </div>
        
        <div className="flex items-center space-x-2 mr-4">
          <button 
            className="tool-button"
            onClick={zoomOut}
          >
            -
          </button>
          <span className="text-sm text-gray-700">{Math.round(currentScale * 100)}%</span>
          <button 
            className="tool-button"
            onClick={zoomIn}
          >
            +
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            className="tool-button"
            onClick={rotateCounterClockwise}
          >
            ↺
          </button>
          <span className="text-sm text-gray-700">{currentRotation}°</span>
          <button 
            className="tool-button"
            onClick={rotateClockwise}
          >
            ↻
          </button>
        </div>
      </div>
      
      {/* PDF Viewer */}
      <div 
        ref={containerRef}
        className="relative flex-1 bg-gray-800 rounded overflow-auto flex items-center justify-center"
        onClick={handleCanvasClick}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="text-white">Loading...</div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-50 z-50">
            <div className="text-white p-4 bg-red-800 rounded">{error}</div>
          </div>
        )}
        
        <div className="relative shadow-lg">
          <canvas ref={canvasRef} className="block" />
          
          {/* Form Elements Layer */}
          {pdfDoc && (
            <FormElementRenderer
              currentPage={currentPage}
              scale={currentScale}
              rotation={currentRotation}
              pageDimensions={{
                width: canvasRef.current?.width || 612,
                height: canvasRef.current?.height || 792,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;