import React, { useState } from 'react';
import { useFormData } from '../contexts/FormDataContext';
import { ValidationRule } from '../lib/FormDataManager';
import { FormElementType } from '../lib/FormElementManager';

interface FormValidationRulesProps {
  elementId: string;
  elementType: FormElementType;
}

export const FormValidationRules: React.FC<FormValidationRulesProps> = ({
  elementId,
  elementType,
}) => {
  const { 
    getValidationRules, 
    setValidationRules, 
    clearValidationRules,
    validateField
  } = useFormData();
  
  const [rules, setRules] = useState<ValidationRule[]>(
    getValidationRules(elementId)
  );

  // Apply rules to the field
  const applyRules = () => {
    setValidationRules(elementId, rules);
    validateField(elementId);
  };

  // Clear all rules
  const clearRules = () => {
    clearValidationRules(elementId);
    setRules([]);
  };

  // Add a new rule
  const addRule = (type: ValidationRule['type']) => {
    const newRule: ValidationRule = {
      type,
      message: getDefaultMessage(type),
      value: getDefaultValue(type),
    };
    
    setRules([...rules, newRule]);
  };

  // Remove a rule
  const removeRule = (index: number) => {
    const newRules = [...rules];
    newRules.splice(index, 1);
    setRules(newRules);
  };

  // Update a rule
  const updateRule = (index: number, field: keyof ValidationRule, value: any) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [field]: value };
    setRules(newRules);
  };

  // Get default message for a rule type
  const getDefaultMessage = (type: ValidationRule['type']): string => {
    switch (type) {
      case 'required':
        return 'This field is required';
      case 'minLength':
        return 'This field must be at least {value} characters';
      case 'maxLength':
        return 'This field must be at most {value} characters';
      case 'pattern':
        return 'This field must match the pattern';
      case 'custom':
        return 'This field is invalid';
      default:
        return '';
    }
  };

  // Get default value for a rule type
  const getDefaultValue = (type: ValidationRule['type']): any => {
    switch (type) {
      case 'minLength':
        return 3;
      case 'maxLength':
        return 50;
      case 'pattern':
        return '.*';
      default:
        return undefined;
    }
  };

  // Render available rule types based on element type
  const renderAvailableRuleTypes = () => {
    const availableTypes: ValidationRule['type'][] = [];
    
    switch (elementType) {
      case FormElementType.TextField:
        availableTypes.push('required', 'minLength', 'maxLength', 'pattern');
        break;
      case FormElementType.Checkbox:
        availableTypes.push('required');
        break;
      case FormElementType.Dropdown:
        availableTypes.push('required');
        break;
      case FormElementType.SignatureField:
        availableTypes.push('required');
        break;
    }
    
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Add Validation Rule
        </label>
        <div className="flex space-x-2">
          <select 
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            onChange={(e) => addRule(e.target.value as ValidationRule['type'])}
            value=""
          >
            <option value="" disabled>Select rule type</option>
            {availableTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  // Render rule configuration based on rule type
  const renderRuleConfig = (rule: ValidationRule, index: number) => {
    return (
      <div key={index} className="mb-4 p-3 border border-gray-200 rounded-md bg-gray-50">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-gray-700">
            {rule.type.charAt(0).toUpperCase() + rule.type.slice(1)}
          </h4>
          <button
            type="button"
            className="text-red-600 hover:text-red-800"
            onClick={() => removeRule(index)}
          >
            Remove
          </button>
        </div>
        
        {/* Rule value configuration */}
        {(rule.type === 'minLength' || rule.type === 'maxLength') && (
          <div className="mb-2">
            <label className="block text-xs text-gray-600 mb-1">
              Length
            </label>
            <input
              type="number"
              min="0"
              className="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={rule.value || 0}
              onChange={(e) => updateRule(index, 'value', parseInt(e.target.value, 10))}
            />
          </div>
        )}
        
        {rule.type === 'pattern' && (
          <div className="mb-2">
            <label className="block text-xs text-gray-600 mb-1">
              Regex Pattern
            </label>
            <input
              type="text"
              className="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={rule.value || ''}
              onChange={(e) => updateRule(index, 'value', e.target.value)}
            />
          </div>
        )}
        
        {/* Error message configuration */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Error Message
          </label>
          <input
            type="text"
            className="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={rule.message}
            onChange={(e) => updateRule(index, 'message', e.target.value)}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        Validation Rules
      </h3>
      
      {rules.length === 0 ? (
        <p className="text-sm text-gray-500 mb-4">
          No validation rules set for this field.
        </p>
      ) : (
        <div className="mb-4">
          {rules.map((rule, index) => renderRuleConfig(rule, index))}
        </div>
      )}
      
      {renderAvailableRuleTypes()}
      
      <div className="flex space-x-2 mt-4">
        <button
          type="button"
          className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          onClick={applyRules}
        >
          Apply Rules
        </button>
        
        <button
          type="button"
          className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
          onClick={clearRules}
        >
          Clear All Rules
        </button>
      </div>
    </div>
  );
}; 