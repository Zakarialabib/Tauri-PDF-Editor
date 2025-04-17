import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog'; 

export interface FormField {
  name: string;
  field_type: string;
  value: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

export interface PdfDocument {
  path: string;
  pages: number;
  formFields: FormField[];
}

export class PdfService {
  static async openPdf(): Promise<PdfDocument> {
    try {
      const filePath = await open({
        filters: [{
          name: 'PDF Document',
          extensions: ['pdf']
        }]
      });

      if (!filePath || typeof filePath !== 'string') {
        throw new Error('No file selected');
      }

      const result = await invoke('open_pdf', { path: filePath });
      return result as PdfDocument;
    } catch (error) {
      console.error('Error opening PDF:', error);
      throw error;
    }
  }

  static async savePdf(path: string, formFields: FormField[]): Promise<void> {
    try {
      const savePath = await save({
        filters: [{
          name: 'PDF Document',
          extensions: ['pdf']
        }]
      });

      if (!savePath) {
        throw new Error('No save location selected');
      }

      await invoke('save_pdf', {
        sourcePath: path,
        targetPath: savePath,
        formFields
      });
    } catch (error) {
      console.error('Error saving PDF:', error);
      throw error;
    }
  }

  static async addFormField(path: string, field: Omit<FormField, 'name'>): Promise<FormField> {
    try {
      const result = await invoke('add_form_field', {
        path,
        field
      });
      return result as FormField;
    } catch (error) {
      console.error('Error adding form field:', error);
      throw error;
    }
  }

  static async updateFormField(path: string, field: FormField): Promise<void> {
    try {
      await invoke('update_form_field', {
        path,
        field
      });
    } catch (error) {
      console.error('Error updating form field:', error);
      throw error;
    }
  }

  static async deleteFormField(path: string, fieldName: string): Promise<void> {
    try {
      await invoke('delete_form_field', {
        path,
        fieldName
      });
    } catch (error) {
      console.error('Error deleting form field:', error);
      throw error;
    }
  }

  static async extractFormFields(path: string): Promise<FormField[]> {
    try {
      const result = await invoke('extract_form_fields', { path });
      return result as FormField[];
    } catch (error) {
      console.error('Error extracting form fields:', error);
      throw error;
    }
  }
}