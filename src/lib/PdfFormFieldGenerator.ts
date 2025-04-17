import { FormElement, FormElementType } from './FormElementManager';
import { addFormFieldsToPdf, generateAppearanceStreams, PdfFormField as RustPdfFormField } from './commands';

/**
 * Interface for PDF form field properties
 */
export interface PdfFormField {
  id: string;
  name: string;
  type: string;
  value: any;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  page: number;
  properties: Record<string, any>;
}

/**
 * PDF Form Field Generator class
 * Handles generation of PDF form fields from form elements
 */
export class PdfFormFieldGenerator {
  /**
   * Convert form elements to PDF form fields and add them to the PDF
   */
  static async generateFormFields(
    elements: FormElement[],
    pdfPath: string,
    outputPath: string
  ): Promise<void> {
    // Process each form element
    const formFields: RustPdfFormField[] = [];
    
    for (const element of elements) {
      const field = this.convertElementToField(element);
      if (field) {
        formFields.push(field);
      }
    }
    
    // Apply naming system
    this.setFieldNamingSystem(formFields);
    
    // Call Rust backend to add form fields to PDF
    try {
      await addFormFieldsToPdf(pdfPath, formFields, outputPath);
    } catch (error) {
      console.error('Error adding form fields to PDF:', error);
      throw new Error(`Failed to add form fields to PDF: ${error}`);
    }
  }
  
  /**
   * Convert a form element to a PDF form field
   */
  private static convertElementToField(
    element: FormElement
  ): RustPdfFormField | null {
    // Create the base field object
    const field: RustPdfFormField = {
      id: element.id,
      name: element.name || element.id,
      field_type: '',
      value: undefined,
      rect: [
        element.x,
        element.y,
        element.x + element.width,
        element.y + element.height
      ],
      page: element.page,
      properties: this.mapElementPropertiesToFieldProperties(element)
    };
    
    // Set field type and properties based on element type
    switch (element.type) {
      case FormElementType.TextField:
        field.field_type = 'text';
        field.value = element.properties?.value || '';
        break;
        
      case FormElementType.Checkbox:
        field.field_type = 'checkbox';
        field.value = element.properties?.checked ? 'true' : 'false';
        break;
        
      case FormElementType.Dropdown:
        field.field_type = 'dropdown';
        field.value = element.properties?.selectedOption || '';
        
        // Add options as a comma-separated string
        if (element.properties?.options) {
          field.properties.options = element.properties.options.join(',');
        }
        break;
        
      case FormElementType.SignatureField:
        field.field_type = 'signature';
        break;
        
      default:
        console.warn(`Unsupported element type: ${element.type}`);
        return null;
    }
    
    return field;
  }
  
  /**
   * Generate appearance streams for form fields
   */
  static async generateAppearanceStreams(
    pdfPath: string,
    outputPath: string
  ): Promise<void> {
    try {
      await generateAppearanceStreams(pdfPath, outputPath);
    } catch (error) {
      console.error('Error generating appearance streams:', error);
      throw new Error(`Failed to generate appearance streams: ${error}`);
    }
  }
  
  /**
   * Set a consistent naming system for form fields
   */
  static setFieldNamingSystem(formFields: RustPdfFormField[]): void {
    // Create a map to track counts for each field type
    const typeCount: Record<string, number> = {
      text: 0,
      checkbox: 0,
      dropdown: 0,
      signature: 0
    };
    
    // Update field names based on type and count
    for (const field of formFields) {
      const type = field.field_type;
      
      if (type in typeCount) {
        typeCount[type]++;
        
        // Generate name based on type and count
        switch (type) {
          case 'text':
            field.name = `TextField${typeCount[type]}`;
            break;
          case 'checkbox':
            field.name = `Checkbox${typeCount[type]}`;
            break;
          case 'dropdown':
            field.name = `Dropdown${typeCount[type]}`;
            break;
          case 'signature':
            field.name = `Signature${typeCount[type]}`;
            break;
        }
      }
    }
  }
  
  /**
   * Map element properties to field properties
   */
  static mapElementPropertiesToFieldProperties(
    element: FormElement
  ): Record<string, string> {
    const properties: Record<string, string> = {};
    
    // Map common properties
    if (element.properties) {
      // Convert properties to strings
      Object.entries(element.properties).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          properties[key] = String(value);
        }
      });
    }
    
    return properties;
  }
} 