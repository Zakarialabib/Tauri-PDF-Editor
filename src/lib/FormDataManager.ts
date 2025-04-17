import { FormElement, FormElementType } from './FormElementManager';

/**
 * Interface for form data validation rules
 */
export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  message: string;
  value?: any; // For minLength, maxLength, pattern
  validator?: (value: any) => boolean; // For custom validation
}

/**
 * Interface for validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string[]>;
}

/**
 * Form data manager class
 * Handles collection, validation, and persistence of form data
 */
export class FormDataManager {
  private formData: Record<string, any> = {};
  private validationRules: Record<string, ValidationRule[]> = {};
  private elements: FormElement[] = [];

  /**
   * Initialize the form data manager with form elements
   */
  constructor(elements: FormElement[] = []) {
    this.setElements(elements);
  }

  /**
   * Set form elements and initialize form data
   */
  setElements(elements: FormElement[]): void {
    this.elements = [...elements];
    this.initializeFormData();
  }

  /**
   * Initialize form data from elements
   */
  private initializeFormData(): void {
    // Clear existing form data
    this.formData = {};
    
    // Initialize form data based on element types
    this.elements.forEach(element => {
      const fieldId = element.id;
      
      switch (element.type) {
        case FormElementType.TextField:
          this.formData[fieldId] = element.properties.value || '';
          break;
        
        case FormElementType.Checkbox:
          this.formData[fieldId] = element.properties.checked || false;
          break;
        
        case FormElementType.Dropdown:
          this.formData[fieldId] = element.properties.selectedOption || '';
          break;
        
        case FormElementType.SignatureField:
          this.formData[fieldId] = element.properties.signatureData || null;
          break;
      }
    });
  }

  /**
   * Get all form data
   */
  getFormData(): Record<string, any> {
    return { ...this.formData };
  }

  /**
   * Get form data for a specific field
   */
  getFieldValue(fieldId: string): any {
    return this.formData[fieldId];
  }

  /**
   * Set form data for a specific field
   */
  setFieldValue(fieldId: string, value: any): void {
    this.formData[fieldId] = value;
  }

  /**
   * Update form data from element properties
   */
  updateFromElements(elements: FormElement[]): void {
    this.elements = [...elements];
    
    elements.forEach(element => {
      const fieldId = element.id;
      
      switch (element.type) {
        case FormElementType.TextField:
          this.formData[fieldId] = element.properties.value || '';
          break;
        
        case FormElementType.Checkbox:
          this.formData[fieldId] = element.properties.checked || false;
          break;
        
        case FormElementType.Dropdown:
          this.formData[fieldId] = element.properties.selectedOption || '';
          break;
        
        case FormElementType.SignatureField:
          this.formData[fieldId] = element.properties.signatureData || null;
          break;
      }
    });
  }

  /**
   * Set validation rules for a field
   */
  setValidationRules(fieldId: string, rules: ValidationRule[]): void {
    this.validationRules[fieldId] = [...rules];
  }

  /**
   * Get validation rules for a field
   */
  getValidationRules(fieldId: string): ValidationRule[] {
    return this.validationRules[fieldId] || [];
  }

  /**
   * Clear validation rules for a field
   */
  clearValidationRules(fieldId: string): void {
    delete this.validationRules[fieldId];
  }

  /**
   * Validate a specific field
   */
  validateField(fieldId: string): string[] {
    const value = this.formData[fieldId];
    const rules = this.validationRules[fieldId] || [];
    const errors: string[] = [];

    rules.forEach(rule => {
      let isValid = true;

      switch (rule.type) {
        case 'required':
          isValid = value !== undefined && value !== null && value !== '';
          break;
        
        case 'minLength':
          isValid = typeof value === 'string' && value.length >= (rule.value || 0);
          break;
        
        case 'maxLength':
          isValid = typeof value === 'string' && value.length <= (rule.value || 0);
          break;
        
        case 'pattern':
          isValid = typeof value === 'string' && new RegExp(rule.value).test(value);
          break;
        
        case 'custom':
          isValid = rule.validator ? rule.validator(value) : true;
          break;
      }

      if (!isValid) {
        errors.push(rule.message);
      }
    });

    return errors;
  }

  /**
   * Validate all form data
   */
  validateAll(): ValidationResult {
    const errors: Record<string, string[]> = {};
    let valid = true;

    // Validate each field with rules
    Object.keys(this.validationRules).forEach(fieldId => {
      const fieldErrors = this.validateField(fieldId);
      
      if (fieldErrors.length > 0) {
        errors[fieldId] = fieldErrors;
        valid = false;
      }
    });

    return { valid, errors };
  }

  /**
   * Serialize form data to JSON
   */
  serialize(): string {
    return JSON.stringify({
      formData: this.formData,
      validationRules: this.validationRules
    });
  }

  /**
   * Deserialize form data from JSON
   */
  deserialize(json: string): void {
    try {
      const data = JSON.parse(json);
      
      if (data.formData) {
        this.formData = data.formData;
      }
      
      if (data.validationRules) {
        this.validationRules = data.validationRules;
      }
    } catch (error) {
      console.error('Failed to deserialize form data:', error);
    }
  }

  /**
   * Clear all form data
   */
  clear(): void {
    this.formData = {};
    this.validationRules = {};
  }
} 