import React from 'react';
import { TitleBar } from './TitleBar';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen bg-primarydark text-white">
      {/* Custom title bar with window controls */}
      <TitleBar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with navigation and tools */}
        <Sidebar />
        
        {/* Main content area */}
        <main className="flex-1 overflow-auto bg-primarylight p-4">
          {children}
        </main>
      </div>
      
      {/* Status bar */}
      <footer className="bg-primarymedium text-sm p-2 flex justify-between items-center border-t border-primarydark">
        <div>
          <span>Status: Ready</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Zoom: 100%</span>
          <span>Page: 1 of 5</span>
        </div>
      </footer>
    </div>
  );
};