import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { FormDataManager, ValidationRule, ValidationResult } from '../lib/FormDataManager';
import { useFormElements } from './FormElementContext';

interface FormDataContextType {
  // Form data operations
  getFormData: () => Record<string, any>;
  getFieldValue: (fieldId: string) => any;
  setFieldValue: (fieldId: string, value: any) => void;
  
  // Validation operations
  setValidationRules: (fieldId: string, rules: ValidationRule[]) => void;
  getValidationRules: (fieldId: string) => ValidationRule[];
  clearValidationRules: (fieldId: string) => void;
  validateField: (fieldId: string) => string[];
  validateAll: () => ValidationResult;
  
  // Serialization
  saveFormData: () => string;
  loadFormData: (json: string) => void;
  clearFormData: () => void;
  
  // Field errors
  fieldErrors: Record<string, string[]>;
  hasErrors: boolean;
}

const FormDataContext = createContext<FormDataContextType | undefined>(undefined);

export const FormDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { elements } = useFormElements();
  const [manager] = useState(() => new FormDataManager());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [hasErrors, setHasErrors] = useState(false);

  // Update form data when elements change
  useEffect(() => {
    manager.updateFromElements(elements);
  }, [elements, manager]);

  // Form data operations
  const getFormData = useCallback(() => {
    return manager.getFormData();
  }, [manager]);

  const getFieldValue = useCallback((fieldId: string) => {
    return manager.getFieldValue(fieldId);
  }, [manager]);

  const setFieldValue = useCallback((fieldId: string, value: any) => {
    manager.setFieldValue(fieldId, value);
    
    // Validate the field after value change
    const errors = manager.validateField(fieldId);
    setFieldErrors(prev => ({
      ...prev,
      [fieldId]: errors
    }));
    
    // Update hasErrors state
    setHasErrors(Object.values(fieldErrors).some(errors => errors.length > 0));
  }, [manager, fieldErrors]);

  // Validation operations
  const setValidationRules = useCallback((fieldId: string, rules: ValidationRule[]) => {
    manager.setValidationRules(fieldId, rules);
  }, [manager]);

  const getValidationRules = useCallback((fieldId: string) => {
    return manager.getValidationRules(fieldId);
  }, [manager]);

  const clearValidationRules = useCallback((fieldId: string) => {
    manager.clearValidationRules(fieldId);
    
    // Clear errors for this field
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldId];
      return newErrors;
    });
    
    // Update hasErrors state
    setHasErrors(Object.values(fieldErrors).some(errors => errors.length > 0));
  }, [manager, fieldErrors]);

  const validateField = useCallback((fieldId: string) => {
    const errors = manager.validateField(fieldId);
    
    // Update errors state
    setFieldErrors(prev => ({
      ...prev,
      [fieldId]: errors
    }));
    
    // Update hasErrors state
    setHasErrors(Object.values({ ...fieldErrors, [fieldId]: errors }).some(errors => errors.length > 0));
    
    return errors;
  }, [manager, fieldErrors]);

  const validateAll = useCallback(() => {
    const result = manager.validateAll();
    
    // Update errors state
    setFieldErrors(result.errors);
    setHasErrors(!result.valid);
    
    return result;
  }, [manager]);

  // Serialization
  const saveFormData = useCallback(() => {
    return manager.serialize();
  }, [manager]);

  const loadFormData = useCallback((json: string) => {
    manager.deserialize(json);
    
    // Validate all fields after loading
    const result = manager.validateAll();
    setFieldErrors(result.errors);
    setHasErrors(!result.valid);
  }, [manager]);

  const clearFormData = useCallback(() => {
    manager.clear();
    setFieldErrors({});
    setHasErrors(false);
  }, [manager]);

  const contextValue: FormDataContextType = {
    getFormData,
    getFieldValue,
    setFieldValue,
    setValidationRules,
    getValidationRules,
    clearValidationRules,
    validateField,
    validateAll,
    saveFormData,
    loadFormData,
    clearFormData,
    fieldErrors,
    hasErrors,
  };

  return (
    <FormDataContext.Provider value={contextValue}>
      {children}
    </FormDataContext.Provider>
  );
};

export const useFormData = (): FormDataContextType => {
  const context = useContext(FormDataContext);
  if (context === undefined) {
    throw new Error('useFormData must be used within a FormDataProvider');
  }
  return context;
}; 