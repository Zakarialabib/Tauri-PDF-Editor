import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from '@tauri-apps/plugin-fs';
import { basename, join, appLocalDataDir } from '@tauri-apps/api/path';
import { exists, copyFile } from '@tauri-apps/plugin-fs';
import { Layout } from "./components/Layout";
import PdfViewer from "./components/PdfViewer";
import { FormElementToolbar } from "./components/FormElementToolbar";
import { FormElementProperties } from "./components/FormElementProperties";
import { FormElementProvider } from "./contexts/FormElementContext";
import { FormDataProvider } from "./contexts/FormDataContext";
import { FormValidationErrors } from "./components/FormValidationErrors";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PdfFormGenerator } from "./components/PdfFormGenerator";
import "./App.css";

interface PdfDocument {
  page_count: number; 
  // Add other properties as needed
}

function App() {
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [pdfDocument, setPdfDocument] = useState<PdfDocument | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [pageDimensions, setPageDimensions] = useState({ width: 612, height: 792 }); // Default US Letter size
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Open a PDF file
  const openPdfFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'PDF Files',
          extensions: ['pdf']
        }]
      });
      
      if (selected && !Array.isArray(selected)) {
        setIsLoading(true);
        setPdfPath(selected);
        
        // Reset state when opening a new file
        setCurrentPage(1);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error opening PDF file:', error);
      setIsLoading(false);
    }
  };

  // Load demo PDF
  const loadDemoPdf = async () => {
    try {
      setIsLoading(true);
      
      // Use the demo PDF from the public directory
      setPdfPath('/pdf/demo.pdf');
      setCurrentPage(1);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading demo PDF:', error);
      setIsLoading(false);
      
      // Show error to user
      alert('Failed to load demo PDF. Please try opening your own PDF file.');
    }
  };

  // Handle document loaded
  const handleDocumentLoaded = (document: any) => {
    setPdfDocument({
      page_count: document.numPages,
    });
  };

  // Handle page dimensions change
  const handlePageDimensionsChange = (width: number, height: number) => {
    setPageDimensions({ width, height });
  };

  // Handle zoom change
  const handleZoomChange = (newScale: number) => {
    setScale(newScale);
  };

  // Handle rotation change
  const handleRotationChange = (newRotation: number) => {
    setRotation(newRotation);
  };

  // Toggle validation errors display
  const toggleValidationErrors = () => {
    setShowValidationErrors(!showValidationErrors);
  };

  return (
    <ThemeProvider>
      <FormElementProvider>
        <FormDataProvider>
          <Layout>
            {pdfPath ? (
              <div className="flex h-full">
                {/* Left Sidebar - Form Element Toolbar */}
                <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-800">Form Elements</h2>
                    <p className="text-sm text-gray-600 mt-1">Drag elements to the PDF</p>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto">
                    <FormElementToolbar
                      currentPage={currentPage}
                      scale={scale}
                      rotation={rotation}
                      pageDimensions={pageDimensions}
                    />
                  </div>
                  
                  {/* PDF Form Generator */}
                  <div className="mt-auto border-t border-gray-200">
                    <PdfFormGenerator pdfPath={pdfPath} />
                  </div>
                </div>
                
                {/* Main Content - PDF Viewer */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Toolbar */}
                  <div className="flex justify-between items-center p-2 border-b border-gray-200 bg-gray-50">
                    <div>
                      <button
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
                        onClick={openPdfFile}
                      >
                        Open PDF
                      </button>
                      
                      <button
                        className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                        onClick={loadDemoPdf}
                      >
                        Load Demo
                      </button>
                    </div>
                    
                    <div className="flex items-center">
                      <button
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={toggleValidationErrors}
                      >
                        {showValidationErrors ? 'Hide Validation' : 'Show Validation'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Validation Errors */}
                  {showValidationErrors && (
                    <div className="p-2 bg-white border-b border-gray-200">
                      <FormValidationErrors showAll={true} />
                    </div>
                  )}
                  
                  {/* PDF Viewer */}
                  <div className="flex-1 overflow-hidden">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                      </div>
                    ) : (
                      <PdfViewer
                        pdfPath={pdfPath}
                        scale={scale}
                        rotation={rotation}
                        pageNumber={currentPage}
                        onPageChange={setCurrentPage}
                        onDocumentLoaded={handleDocumentLoaded}
                        onPageDimensionsChange={handlePageDimensionsChange}
                        onZoomChange={handleZoomChange}
                        onRotationChange={handleRotationChange}
                      />
                    )}
                  </div>
                </div>
                
                {/* Right Sidebar - Properties Panel */}
                <div className="w-72 bg-white border-l border-gray-200 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-800">Properties</h2>
                    <p className="text-sm text-gray-600 mt-1">Edit element properties</p>
                  </div>
                  <FormElementProperties />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-gray-100 p-8">
                <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">PDF Form Editor</h2>
                  
                  <p className="text-gray-600 mb-8 text-center">
                    Create interactive PDF forms by adding form elements, configuring their properties, and generating fillable PDFs.
                  </p>
                  
                  {isLoading ? (
                    <div className="flex justify-center my-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-4">
                      <button
                        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium transition-colors"
                        onClick={openPdfFile}
                      >
                        Open PDF File
                      </button>
                      
                      <button
                        className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 rounded-md text-white font-medium transition-colors"
                        onClick={loadDemoPdf}
                      >
                        Try Demo PDF
                      </button>
                      
                      <div className="text-sm text-gray-500 text-center mt-4">
                        Start by opening a PDF file or try our demo to explore the features.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Layout>
        </FormDataProvider>
      </FormElementProvider>
    </ThemeProvider>
  );
}

export default App;
