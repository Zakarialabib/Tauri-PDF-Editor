import React from 'react';
import { useFormElements } from '../contexts/FormElementContext';
import { FormElementType } from '../lib/FormElementManager';
import { FormValidationRules } from './FormValidationRules';

export const FormElementProperties: React.FC = () => {
  const { 
    getSelectedElement, 
    updateElement, 
    updateElementProperty, 
    deleteElement,
    bringToFront,
    sendToBack
  } = useFormElements();

  const selectedElement = getSelectedElement();

  if (!selectedElement) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        No element selected. Click on an element to edit its properties.
      </div>
    );
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateElement(selectedElement.id, { name: e.target.value });
  };

  const handlePositionChange = (axis: 'x' | 'y', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      updateElement(selectedElement.id, { [axis]: numValue });
    }
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      updateElement(selectedElement.id, { [dimension]: numValue });
    }
  };

  const handlePropertyChange = (key: string, value: any) => {
    updateElementProperty(selectedElement.id, key, value);
  };

  const handleDelete = () => {
    deleteElement(selectedElement.id);
  };

  // Render specific properties based on element type
  const renderTypeSpecificProperties = () => {
    switch (selectedElement.type) {
      case FormElementType.TextField:
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placeholder
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedElement.properties.placeholder || ''}
                onChange={(e) => handlePropertyChange('placeholder', e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Font Size
              </label>
              <input
                type="number"
                min="8"
                max="36"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedElement.properties.fontSize || 14}
                onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value, 10))}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedElement.properties.value || ''}
                onChange={(e) => handlePropertyChange('value', e.target.value)}
              />
            </div>
          </>
        );
        
      case FormElementType.Checkbox:
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Label
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedElement.properties.label || ''}
                onChange={(e) => handlePropertyChange('label', e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={selectedElement.properties.checked || false}
                  onChange={(e) => handlePropertyChange('checked', e.target.checked)}
                />
                <span className="ml-2 text-sm text-gray-700">Checked</span>
              </label>
            </div>
          </>
        );
        
      case FormElementType.Dropdown:
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Options (one per line)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={5}
                value={(selectedElement.properties.options || []).join('\n')}
                onChange={(e) => {
                  const options = e.target.value.split('\n').filter(option => option.trim() !== '');
                  handlePropertyChange('options', options);
                }}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selected Option
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedElement.properties.selectedOption || ''}
                onChange={(e) => handlePropertyChange('selectedOption', e.target.value)}
              >
                <option value="">Select an option</option>
                {(selectedElement.properties.options || []).map((option: string, index: number) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </>
        );
        
      case FormElementType.SignatureField:
        return (
          <div className="mb-4">
            <p className="text-sm text-gray-700 mb-2">
              {selectedElement.properties.signatureData 
                ? 'Signature is present' 
                : 'No signature added yet'}
            </p>
            {selectedElement.properties.signatureData && (
              <button
                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                onClick={() => handlePropertyChange('signatureData', null)}
              >
                Clear Signature
              </button>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="p-4 overflow-y-auto">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Element Properties</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={selectedElement.name}
          onChange={handleNameChange}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            X Position
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={selectedElement.x.toFixed(2)}
            onChange={(e) => handlePositionChange('x', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Y Position
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={selectedElement.y.toFixed(2)}
            onChange={(e) => handlePositionChange('y', e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Width
          </label>
          <input
            type="number"
            min="10"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={selectedElement.width.toFixed(2)}
            onChange={(e) => handleSizeChange('width', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Height
          </label>
          <input
            type="number"
            min="10"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={selectedElement.height.toFixed(2)}
            onChange={(e) => handleSizeChange('height', e.target.value)}
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Page
        </label>
        <input
          type="number"
          min="1"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={selectedElement.page}
          onChange={(e) => {
            const page = parseInt(e.target.value, 10);
            if (page > 0) {
              updateElement(selectedElement.id, { page });
            }
          }}
        />
      </div>
      
      <div className="border-t border-gray-200 pt-4 mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Element-Specific Properties</h4>
        {renderTypeSpecificProperties()}
      </div>
      
      {/* Form Validation Rules */}
      <FormValidationRules 
        elementId={selectedElement.id}
        elementType={selectedElement.type}
      />
      
      <div className="border-t border-gray-200 pt-4 mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Z-Index Controls</h4>
        <div className="flex space-x-2">
          <button
            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
            onClick={() => bringToFront(selectedElement.id)}
          >
            Bring to Front
          </button>
          <button
            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
            onClick={() => sendToBack(selectedElement.id)}
          >
            Send to Back
          </button>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4">
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={handleDelete}
        >
          Delete Element
        </button>
      </div>
    </div>
  );
}; 