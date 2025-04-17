import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { PdfService, PdfDocument, FormField } from '../services/pdfService';
// import { PdfDocument, FormField } from './types';

interface PdfState {
  currentDocument: PdfDocument | null;
  zoom: number;
  selectedField: FormField | null;
  activeTool: 'select' | 'text' | 'checkbox' | 'radio';
  isLoading: boolean;
  error: string | null;
  undoStack: PdfDocument[];
  redoStack: PdfDocument[];
}

type PdfAction =
  | { type: 'SET_DOCUMENT'; payload: PdfDocument }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SELECT_FIELD'; payload: FormField | null }
  | { type: 'SET_ACTIVE_TOOL'; payload: PdfState['activeTool'] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'PUSH_UNDO'; payload: PdfDocument }
  | { type: 'UNDO' }
  | { type: 'REDO' };

const initialState: PdfState = {
  currentDocument: null,
  zoom: 1,
  selectedField: null,
  activeTool: 'select',
  isLoading: false,
  error: null,
  undoStack: [],
  redoStack: []
};

const pdfReducer = (state: PdfState, action: PdfAction): PdfState => {
  switch (action.type) {
    case 'SET_DOCUMENT':
      return { ...state, currentDocument: action.payload, error: null };
    case 'SET_ZOOM':
      return { ...state, zoom: action.payload };
    case 'SELECT_FIELD':
      return { ...state, selectedField: action.payload };
    case 'SET_ACTIVE_TOOL':
      return { ...state, activeTool: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'PUSH_UNDO':
      return {
        ...state,
        undoStack: [...state.undoStack, action.payload],
        redoStack: []
      };
    case 'UNDO':
      if (state.undoStack.length === 0) return state;
      const prevDoc = state.undoStack[state.undoStack.length - 1];
      return {
        ...state,
        currentDocument: prevDoc,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: state.currentDocument ? [...state.redoStack, state.currentDocument] : state.redoStack
      };
    case 'REDO':
      if (state.redoStack.length === 0) return state;
      const nextDoc = state.redoStack[state.redoStack.length - 1];
      return {
        ...state,
        currentDocument: nextDoc,
        redoStack: state.redoStack.slice(0, -1),
        undoStack: state.currentDocument ? [...state.undoStack, state.currentDocument] : state.undoStack
      };
    default:
      return state;
  }
};

interface PdfContextType extends PdfState {
  openPdf: () => Promise<void>;
  savePdf: () => Promise<void>;
  addFormField: (field: Omit<FormField, 'name'>) => Promise<void>;
  updateFormField: (field: FormField) => Promise<void>;
  deleteFormField: (fieldName: string) => Promise<void>;
  setZoom: (zoom: number) => void;
  setActiveTool: (tool: PdfState['activeTool']) => void;
  undo: () => void;
  redo: () => void;
}

const PdfContext = createContext<PdfContextType | null>(null);

export const PdfProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(pdfReducer, initialState);

  const openPdf = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const document = await PdfService.openPdf();
      dispatch({ type: 'SET_DOCUMENT', payload: document });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to open PDF' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const savePdf = useCallback(async () => {
    if (!state.currentDocument) return;
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await PdfService.savePdf(state.currentDocument.path, state.currentDocument.formFields);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to save PDF' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.currentDocument]);

  const addFormField = useCallback(async (field: Omit<FormField, 'name'>) => {
    if (!state.currentDocument) return;
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newField = await PdfService.addFormField(state.currentDocument.path, field);
      const updatedDoc = {
        ...state.currentDocument,
        formFields: [...state.currentDocument.formFields, newField]
      };
      dispatch({ type: 'PUSH_UNDO', payload: state.currentDocument });
      dispatch({ type: 'SET_DOCUMENT', payload: updatedDoc });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to add form field' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.currentDocument]);

  const updateFormField = useCallback(async (field: FormField) => {
    if (!state.currentDocument) return;
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await PdfService.updateFormField(state.currentDocument.path, field);
      const updatedDoc = {
        ...state.currentDocument,
        formFields: state.currentDocument.formFields.map(f =>
          f.name === field.name ? field : f
        )
      };
      dispatch({ type: 'PUSH_UNDO', payload: state.currentDocument });
      dispatch({ type: 'SET_DOCUMENT', payload: updatedDoc });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update form field' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.currentDocument]);

  const deleteFormField = useCallback(async (fieldName: string) => {
    if (!state.currentDocument) return;
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await PdfService.deleteFormField(state.currentDocument.path, fieldName);
      const updatedDoc = {
        ...state.currentDocument,
        formFields: state.currentDocument.formFields.filter(f => f.name !== fieldName)
      };
      dispatch({ type: 'PUSH_UNDO', payload: state.currentDocument });
      dispatch({ type: 'SET_DOCUMENT', payload: updatedDoc });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete form field' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.currentDocument]);

  const setZoom = useCallback((zoom: number) => {
    dispatch({ type: 'SET_ZOOM', payload: zoom });
  }, []);

  const setActiveTool = useCallback((tool: PdfState['activeTool']) => {
    dispatch({ type: 'SET_ACTIVE_TOOL', payload: tool });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  return (
    <PdfContext.Provider
      value={{
        ...state,
        openPdf,
        savePdf,
        addFormField,
        updateFormField,
        deleteFormField,
        setZoom,
        setActiveTool,
        undo,
        redo
      }}
    >
      {children}
    </PdfContext.Provider>
  );
};

export const usePdf = () => {
  const context = useContext(PdfContext);
  if (!context) {
    throw new Error('usePdf must be used within a PdfProvider');
  }
  return context;
};