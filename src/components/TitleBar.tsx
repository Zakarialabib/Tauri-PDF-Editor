import React from 'react';

export const TitleBar: React.FC = () => {
    return (
      <div className="title-bar" data-tauri-drag-region>
        {/* Title */}
        <div className="flex-1 text-center text-base font-medium" >
          PDF Form Editor
        </div>
    </div>
  )
};