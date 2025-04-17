import React from 'react';

export const TitleBar: React.FC = () => {
  return (
    <div className="title-bar" data-tauri-drag-region>
      {/* App icon */}
      <div className="px-2">
        <img src="/app-icon.png" alt="App Icon" className="h-4 w-4" />
      </div>
      
      {/* Title */}
      <div className="flex-1 text-sm font-medium" data-tauri-drag-region>
        PDF Form Editor
      </div>
    </div>
  );
}; 