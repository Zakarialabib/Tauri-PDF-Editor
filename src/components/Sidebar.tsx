import React, { useState } from 'react';

interface ToolPanelProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const ToolPanel: React.FC<ToolPanelProps> = ({ title, icon, children }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-1">
      <button
        className="w-full flex items-center py-1 px-2 text-left hover:bg-[#2b2d31]"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="mr-2 h-4 w-4">{icon}</span>
        <span className="text-xs font-medium">{title}</span>
        <span className="ml-auto text-xs">
          {isExpanded ? '▼' : '►'}
        </span>
      </button>

      {isExpanded && (
        <div className="p-2">
          {children}
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC = () => {
  return (
    <div className="w-64 overflow-y-auto bg-[#1e1f22] p-1 flex flex-col">
    
    
    
    
      <ToolPanel
        title="Form Elements"
        icon={<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1.5" />
          <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.5" />
          <line x1="8" y1="16" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" />
        </svg>}
      >
        <div className="grid grid-cols-2 gap-2">
          <button className="p-2 bg-[#36373d] hover:bg-[#404249] rounded text-sm">Text Field</button>
          <button className="p-2 bg-[#36373d] hover:bg-[#404249] rounded text-sm">Checkbox</button>
          <button className="p-2 bg-[#36373d] hover:bg-[#404249] rounded text-sm">Dropdown</button>
          <button className="p-2 bg-[#36373d] hover:bg-[#404249] rounded text-sm">Signature</button>
        </div>
      </ToolPanel>

      <ToolPanel
        title="Properties"
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
        <path d="M12 8V16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>}
      >
        <div className="space-y-2">
          {/* This will be dynamically populated based on selected element */}
          <div className="text-xs text-gray-400">No element selected</div>
        </div>
      </ToolPanel>

      <ToolPanel
        title="Pages"
        icon={<svg  viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 7H17" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 12H17" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 17H13" stroke="currentColor" strokeWidth="1.5" />
        </svg>}
      >
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs">Page 1 of 5</span>
            <div className="flex space-x-1 text-xs">
              <button className="px-1 bg-[#36373d] hover:bg-[#404249] rounded">◀</button>
              <button className="px-1 bg-[#36373d] hover:bg-[#404249] rounded">▶</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="aspect-[3/4] bg-white rounded overflow-hidden">
              <img src="/page-thumbnail-1.png" alt="Page 1" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-[3/4] bg-white rounded overflow-hidden">
              <img src="/page-thumbnail-2.png" alt="Page 2" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </ToolPanel>
    </div>
  );
}; 