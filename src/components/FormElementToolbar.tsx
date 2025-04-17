import React from 'react';
import { useFormElements } from '../contexts/FormElementContext';
import { FormElementType } from '../lib/FormElementManager';
import { screenToPdfCoordinates } from '../lib/coordinates';

interface FormElementToolbarProps {
  currentPage: number;
  scale: number;
  rotation: number;
  pageDimensions: {
    width: number;
    height: number;
  };
}

export const FormElementToolbar: React.FC<FormElementToolbarProps> = ({
  currentPage,
  scale,
  rotation,
  pageDimensions,
}) => {
  const { createElement, selectElement } = useFormElements();

  const handleAddElement = (type: FormElementType) => {
    // Create element in the center of the page
    const centerX = pageDimensions.width / 2;
    const centerY = pageDimensions.height / 2;

    // Create the element
    const element = createElement(type, {
      x: centerX,
      y: centerY,
      page: currentPage,
    });

    // Select the newly created element
    selectElement(element.id);
  };

  return (
    <div className="flex flex-col bg-white border-r border-gray-200 p-2 shadow-md">
      <h3 className="text-sm font-semibold mb-3 text-gray-700">Form Elements</h3>
      
      <button
        className="flex items-center justify-start px-3 py-2 mb-2 text-sm rounded hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors"
        onClick={() => handleAddElement(FormElementType.TextField)}
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Text Field
      </button>
      
      <button
        className="flex items-center justify-start px-3 py-2 mb-2 text-sm rounded hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors"
        onClick={() => handleAddElement(FormElementType.Checkbox)}
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Checkbox
      </button>
      
      <button
        className="flex items-center justify-start px-3 py-2 mb-2 text-sm rounded hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors"
        onClick={() => handleAddElement(FormElementType.Dropdown)}
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        Dropdown
      </button>
      
      <button
        className="flex items-center justify-start px-3 py-2 mb-2 text-sm rounded hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors"
        onClick={() => handleAddElement(FormElementType.SignatureField)}
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        Signature
      </button>
      
      <div className="border-t border-gray-200 my-2"></div>
      
      <div className="text-xs text-gray-500 mt-2">
        <p>Drag elements to position</p>
        <p>Click to select and edit</p>
      </div>
    </div>
  );
}; 