import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { FormElementManager, FormElement, FormElementType, FormElementOptions } from '../lib/FormElementManager';

interface FormElementContextType {
  // Form element management
  elements: FormElement[];
  selectedElementId: string | null;
  
  // Element operations
  createElement: (type: FormElementType, options?: FormElementOptions) => FormElement;
  updateElement: (id: string, updates: Partial<Omit<FormElement, 'id' | 'type'>>) => FormElement | null;
  deleteElement: (id: string) => boolean;
  updateElementProperty: (id: string, propertyKey: string, value: any) => FormElement | null;
  
  // Selection operations
  selectElement: (id: string | null) => void;
  getSelectedElement: () => FormElement | null;
  
  // Z-index operations
  bringToFront: (id: string) => FormElement | null;
  sendToBack: (id: string) => FormElement | null;
  
  // Serialization
  saveElements: () => string;
  loadElements: (json: string) => void;
  clearElements: () => void;
}

const FormElementContext = createContext<FormElementContextType | undefined>(undefined);

export const FormElementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [manager] = useState(() => new FormElementManager());
  const [elements, setElements] = useState<FormElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Update elements state when manager changes
  const refreshElements = useCallback(() => {
    setElements(manager.getElements());
  }, [manager]);

  // Element operations
  const createElement = useCallback((type: FormElementType, options?: FormElementOptions) => {
    const element = manager.createFormElement(type, options);
    refreshElements();
    return element;
  }, [manager, refreshElements]);

  const updateElement = useCallback((id: string, updates: Partial<Omit<FormElement, 'id' | 'type'>>) => {
    const result = manager.updateElement(id, updates);
    refreshElements();
    return result;
  }, [manager, refreshElements]);

  const deleteElement = useCallback((id: string) => {
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
    const result = manager.deleteElement(id);
    refreshElements();
    return result;
  }, [manager, refreshElements, selectedElementId]);

  const updateElementProperty = useCallback((id: string, propertyKey: string, value: any) => {
    const result = manager.updateElementProperty(id, propertyKey, value);
    refreshElements();
    return result;
  }, [manager, refreshElements]);

  // Selection operations
  const selectElement = useCallback((id: string | null) => {
    setSelectedElementId(id);
  }, []);

  const getSelectedElement = useCallback(() => {
    if (!selectedElementId) return null;
    return manager.getElementById(selectedElementId) || null;
  }, [manager, selectedElementId]);

  // Z-index operations
  const bringToFront = useCallback((id: string) => {
    const result = manager.bringToFront(id);
    refreshElements();
    return result;
  }, [manager, refreshElements]);

  const sendToBack = useCallback((id: string) => {
    const result = manager.sendToBack(id);
    refreshElements();
    return result;
  }, [manager, refreshElements]);

  // Serialization
  const saveElements = useCallback(() => {
    return manager.serialize();
  }, [manager]);

  const loadElements = useCallback((json: string) => {
    manager.deserialize(json);
    refreshElements();
    setSelectedElementId(null);
  }, [manager, refreshElements]);

  const clearElements = useCallback(() => {
    manager.clear();
    refreshElements();
    setSelectedElementId(null);
  }, [manager, refreshElements]);

  // Initial load
  useEffect(() => {
    refreshElements();
  }, [refreshElements]);

  const contextValue: FormElementContextType = {
    elements,
    selectedElementId,
    createElement,
    updateElement,
    deleteElement,
    updateElementProperty,
    selectElement,
    getSelectedElement,
    bringToFront,
    sendToBack,
    saveElements,
    loadElements,
    clearElements,
  };

  return (
    <FormElementContext.Provider value={contextValue}>
      {children}
    </FormElementContext.Provider>
  );
};

export const useFormElements = (): FormElementContextType => {
  const context = useContext(FormElementContext);
  if (context === undefined) {
    throw new Error('useFormElements must be used within a FormElementProvider');
  }
  return context;
}; 