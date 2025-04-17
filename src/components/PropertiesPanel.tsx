import React from 'react';

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
}

interface PropertiesPanelProps {
  selectedField: FormField | null;
  onFieldUpdate: (field: FormField) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedField,
  onFieldUpdate,
}) => {
  if (!selectedField) {
    return (
      <div className="p-4 text-center text-gray-400">
        <p>No element selected</p>
        <p className="text-xs mt-2">Select an element to edit its properties</p>
      </div>
    );
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFieldUpdate({
      ...selectedField,
      name: e.target.value,
    });
  };

  const handlePositionChange = (property: 'x' | 'y' | 'width' | 'height', value: number) => {
    onFieldUpdate({
      ...selectedField,
      [property]: value,
    });
  };

  const handlePropertyChange = (property: string, value: any) => {
    onFieldUpdate({
      ...selectedField,
      properties: {
        ...selectedField.properties,
        [property]: value,
      },
    });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="text-lg font-medium">{selectedField.type.charAt(0).toUpperCase() + selectedField.type.slice(1)} Properties</div>
      
      {/* Common properties */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Name
          <input
            type="text"
            value={selectedField.name}
            onChange={handleNameChange}
            className="mt-1 block w-full px-3 py-2 bg-primarydark border border-primaryhover rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
        
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-sm font-medium">
            X Position
            <input
              type="number"
              value={selectedField.x}
              onChange={(e) => handlePositionChange('x', Number(e.target.value))}
              className="mt-1 block w-full px-3 py-2 bg-primarydark border border-primaryhover rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          
          <label className="block text-sm font-medium">
            Y Position
            <input
              type="number"
              value={selectedField.y}
              onChange={(e) => handlePositionChange('y', Number(e.target.value))}
              className="mt-1 block w-full px-3 py-2 bg-primarydark border border-primaryhover rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          
          <label className="block text-sm font-medium">
            Width
            <input
              type="number"
              value={selectedField.width}
              onChange={(e) => handlePositionChange('width', Number(e.target.value))}
              className="mt-1 block w-full px-3 py-2 bg-primarydark border border-primaryhover rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          
          <label className="block text-sm font-medium">
            Height
            <input
              type="number"
              value={selectedField.height}
              onChange={(e) => handlePositionChange('height', Number(e.target.value))}
              className="mt-1 block w-full px-3 py-2 bg-primarydark border border-primaryhover rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>
        
        <label className="block text-sm font-medium">
          Page
          <input
            type="number"
            value={selectedField.page}
            readOnly
            className="mt-1 block w-full px-3 py-2 bg-primarydark border border-primaryhover rounded-md shadow-sm opacity-70"
          />
        </label>
      </div>
      
      {/* Type-specific properties */}
      <div className="space-y-2">
        <div className="text-sm font-medium border-t border-primaryhover pt-2">Type-specific Properties</div>
        
        {selectedField.type === 'text' && (
          <>
            <label className="block text-sm font-medium">
              Placeholder
              <input
                type="text"
                value={selectedField.properties.placeholder || ''}
                onChange={(e) => handlePropertyChange('placeholder', e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-primarydark border border-primaryhover rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            
            <label className="block text-sm font-medium">
              Font Size
              <input
                type="number"
                value={selectedField.properties.fontSize || 14}
                onChange={(e) => handlePropertyChange('fontSize', Number(e.target.value))}
                className="mt-1 block w-full px-3 py-2 bg-primarydark border border-primaryhover rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </>
        )}
        
        {selectedField.type === 'checkbox' && (
          <>
            <label className="block text-sm font-medium">
              Label
              <input
                type="text"
                value={selectedField.properties.label || ''}
                onChange={(e) => handlePropertyChange('label', e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-primarydark border border-primaryhover rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            
            <label className="flex items-center text-sm font-medium">
              <input
                type="checkbox"
                checked={selectedField.properties.checked || false}
                onChange={(e) => handlePropertyChange('checked', e.target.checked)}
                className="mr-2 h-4 w-4"
              />
              Default Checked
            </label>
          </>
        )}
        
        {selectedField.type === 'dropdown' && (
          <>
            <label className="block text-sm font-medium">
              Options (one per line)
              <textarea
                value={(selectedField.properties.options || []).join('\n')}
                onChange={(e) => handlePropertyChange('options', e.target.value.split('\n').filter(Boolean))}
                rows={4}
                className="mt-1 block w-full px-3 py-2 bg-primarydark border border-primaryhover rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            
            <label className="block text-sm font-medium">
              Default Selected Option
              <select
                value={selectedField.properties.selectedOption || ''}
                onChange={(e) => handlePropertyChange('selectedOption', e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-primarydark border border-primaryhover rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None</option>
                {(selectedField.properties.options || []).map((option: string, index: number) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
        
        {selectedField.type === 'signature' && (
          <div className="text-sm">
            <p>Signature field properties</p>
            <button
              onClick={() => handlePropertyChange('signatureData', '')}
              className="mt-2 px-3 py-1 bg-primaryhover hover:bg-primaryactive rounded text-sm"
            >
              Clear Signature
            </button>
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="pt-4 border-t border-primaryhover">
        <button
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
          onClick={() => {
            // This would typically call a delete function passed as a prop
            alert('Delete functionality would be implemented here');
          }}
        >
          Delete Element
        </button>
      </div>
    </div>
  );
}; 