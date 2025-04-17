import React from 'react';

interface ToolbarProps {
  onOpenFile: () => void;
  onSaveFile: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  currentZoom: number;
  canSave: boolean;
  fileName?: string;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onOpenFile,
  onSaveFile,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  currentZoom,
  canSave,
  fileName,
}) => {
  return (
    <div className="toolbar flex items-center justify-start gap-2 p-1 bg-gray-100 border-b border-gray-200">
      <div className="toolbar-section flex items-center gap-1 border-r border-gray-200 pr-2">
        <button 
          className="toolbar-button"
          onClick={onOpenFile}
          title="Open PDF"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"></path>
            <polyline points="8 9 12 5 16 9"></polyline>
            <line x1="12" y1="5" x2="12" y2="15" className="stroke-current"></line>
          </svg>
          <span className='text-xs'>Open</span>
        </button>
        
        <button 
          className="toolbar-button"
          onClick={onSaveFile}
          disabled={!canSave}
          title="Save PDF"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
             </svg>
          <span className='text-xs'>Save</span>
        </button>
      </div>
      
      <div className="toolbar-section flex items-center gap-1 border-r border-gray-200 pr-2">
       <button 
          className="toolbar-button"
          onClick={onZoomOut}
          title="Zoom Out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </button>

        <span className="text-sm px-2">
        {Math.round(currentZoom * 100)}%
        </span>
        
        <button 
          className="toolbar-button"
          onClick={onZoomIn}
          title="Zoom In"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </button>
        
        <button 
          className="toolbar-button px-1"
          onClick={onZoomReset}
          title="Reset Zoom"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="11" x2="11" y2="11" className="stroke-current"></line>
          </svg>
           <span className="text-xs">Reset</span>
        </button>
      </div>
      
      {fileName && (
        <div className="file-info ml-auto mr-2 p-1 bg-gray-200 rounded text-sm">
          <span className="file-name" title={fileName}>
            {fileName}
          </span>
        </div>
      )}
    </div>
  );
};

export default Toolbar; 