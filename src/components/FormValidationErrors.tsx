import React from 'react';
import { useFormData } from '../contexts/FormDataContext';
import { useFormElements } from '../contexts/FormElementContext';

interface FormValidationErrorsProps {
  showAll?: boolean;
}

export const FormValidationErrors: React.FC<FormValidationErrorsProps> = ({ 
  showAll = false 
}) => {
  const { fieldErrors, hasErrors } = useFormData();
  const { elements } = useFormElements();
  
  // Get element names by ID for better error messages
  const elementNames = elements.reduce<Record<string, string>>((acc, element) => {
    acc[element.id] = element.name;
    return acc;
  }, {});

  if (!hasErrors || Object.keys(fieldErrors).length === 0) {
    return null;
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
      <h3 className="text-red-800 font-medium text-sm mb-2">
        Form Validation Errors
      </h3>
      
      <ul className="text-red-700 text-sm list-disc pl-5 space-y-1">
        {Object.entries(fieldErrors).map(([fieldId, errors]) => {
          // Skip if no errors or not showing all
          if (errors.length === 0 || (!showAll && errors.length === 0)) {
            return null;
          }
          
          const fieldName = elementNames[fieldId] || fieldId;
          
          return errors.map((error, index) => (
            <li key={`${fieldId}-${index}`}>
              <span className="font-medium">{fieldName}:</span> {error}
            </li>
          ));
        })}
      </ul>
    </div>
  );
}; 