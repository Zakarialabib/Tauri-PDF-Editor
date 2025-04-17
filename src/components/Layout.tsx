import React from 'react';
import { TitleBar } from './TitleBar';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen bg-gray-100 text-gray-900 font-sans">
      {/* Custom title bar with window controls */}
      <TitleBar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with navigation and tools */}
        <Sidebar />

        {/* Main content area */}
        <main className="flex-1 overflow-auto bg-white p-2">
          {children}
        </main>
      </div>

      {/* Status bar */}
      <footer className="bg-gray-200 text-sm p-1 flex justify-end items-center border-t border-gray-300">
        <div>
          {/* Removed status and zoom, keeping only page info */}
          <span>1 / 5</span>
        </div>

      </footer>
    </div>
  );
};