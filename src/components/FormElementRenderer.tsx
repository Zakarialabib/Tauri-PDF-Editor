import React from 'react';
import { useFormElements } from '../contexts/FormElementContext';
import { useFormData } from '../contexts/FormDataContext';
import { FormElementType } from '../lib/FormElementManager';
import { pdfToScreenCoordinates, PageDimensions, Point } from '../lib/coordinates';
import { 
  TextField, 
  Checkbox, 
  Dropdown, 
  SignatureField 
} from './form-elements';

interface FormElementRendererProps {
  currentPage: number;
  scale: number;
  rotation: number;
  pageDimensions: {
    width: number;
    height: number;
  };
}

export const FormElementRenderer: React.FC<FormElementRendererProps> = ({
  currentPage,
  scale,
  rotation,
  pageDimensions,
}) => {
  const { 
    elements, 
    selectedElementId, 
    selectElement, 
    updateElement,
    updateElementProperty,
    bringToFront
  } = useFormElements();
  
  const {
    fieldErrors,
    validateField,
    setFieldValue
  } = useFormData();

  // Filter elements for the current page
  const pageElements = elements.filter(element => element.page === currentPage);

  // Sort elements by z-index
  const sortedElements = [...pageElements].sort((a, b) => a.zIndex - b.zIndex);

  const handleElementClick = (id: string) => {
    selectElement(id);
    bringToFront(id);
  };

  const handleElementMove = (id: string, x: number, y: number) => {
    updateElement(id, { x, y });
  };

  const handleElementResize = (id: string, width: number, height: number) => {
    updateElement(id, { width, height });
  };

  const handleTextChange = (id: string, value: string) => {
    updateElementProperty(id, 'value', value);
    setFieldValue(id, value);
    validateField(id);
  };

  const handleCheckboxChange = (id: string, checked: boolean) => {
    updateElementProperty(id, 'checked', checked);
    setFieldValue(id, checked);
    validateField(id);
  };

  const handleDropdownChange = (id: string, selectedOption: string) => {
    updateElementProperty(id, 'selectedOption', selectedOption);
    setFieldValue(id, selectedOption);
    validateField(id);
  };

  const handleSignatureChange = (id: string, signatureData: string) => {
    updateElementProperty(id, 'signatureData', signatureData);
    setFieldValue(id, signatureData);
    validateField(id);
  };

  const handleSignatureClear = (id: string) => {
    updateElementProperty(id, 'signatureData', null);
    setFieldValue(id, null);
    validateField(id);
  };

  // Check if an element has validation errors
  const hasErrors = (id: string): boolean => {
    return fieldErrors[id] !== undefined && fieldErrors[id].length > 0;
  };

  // Get error message for an element
  const getErrorMessage = (id: string): string => {
    if (!hasErrors(id)) return '';
    return fieldErrors[id][0];
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {sortedElements.map(element => {
        // Create PageDimensions object with rotation
        const pageDimensionsWithRotation: PageDimensions = {
          width: pageDimensions.width,
          height: pageDimensions.height,
          rotation: rotation
        };
        
        // Page offset (assuming centered in viewport)
        const pageOffset: Point = { x: 0, y: 0 };
        
        // Convert PDF coordinates to screen coordinates
        const screenCoords = pdfToScreenCoordinates(
          { x: element.x, y: element.y },
          pageDimensionsWithRotation,
          scale,
          pageOffset
        );

        // Calculate screen dimensions
        const screenWidth = element.width * scale;
        const screenHeight = element.height * scale;

        // Common props for all form elements
        const commonProps = {
          id: element.id,
          name: element.name,
          x: screenCoords.x,
          y: screenCoords.y,
          width: screenWidth,
          height: screenHeight,
          page: element.page,
          isSelected: element.id === selectedElementId,
          onClick: handleElementClick,
          onMove: handleElementMove,
          onResize: handleElementResize,
        };

        // Render the appropriate element based on type
        return (
          <div key={element.id} className="relative">
            {hasErrors(element.id) && (
              <div 
                className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-1 py-0.5 rounded z-50"
                style={{
                  left: `${screenCoords.x}px`,
                  top: `${screenCoords.y - 20}px`,
                }}
              >
                {getErrorMessage(element.id)}
              </div>
            )}
            
            {(() => {
              switch (element.type) {
                case FormElementType.TextField:
                  return (
                    <TextField
                      {...commonProps}
                      value={element.properties.value}
                      placeholder={element.properties.placeholder}
                      fontSize={element.properties.fontSize}
                      onChange={handleTextChange}
                    />
                  );

                case FormElementType.Checkbox:
                  return (
                    <Checkbox
                      {...commonProps}
                      checked={element.properties.checked}
                      label={element.properties.label}
                      onChange={handleCheckboxChange}
                    />
                  );

                case FormElementType.Dropdown:
                  return (
                    <Dropdown
                      {...commonProps}
                      options={element.properties.options}
                      selectedOption={element.properties.selectedOption}
                      onChange={handleDropdownChange}
                    />
                  );

                case FormElementType.SignatureField:
                  return (
                    <SignatureField
                      {...commonProps}
                      signatureData={element.properties.signatureData}
                      onSign={handleSignatureChange}
                      onClear={handleSignatureClear}
                    />
                  );

                default:
                  return null;
              }
            })()}
          </div>
        );
      })}
    </div>
  );
}; 