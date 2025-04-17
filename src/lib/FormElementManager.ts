import { v4 as uuidv4 } from 'uuid';

// Define the base form element type
export interface FormElement {
  id: string;
  name: string;
  type: FormElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  zIndex: number;
  properties: Record<string, any>;
}

// Form element types
export enum FormElementType {
  TextField = 'text-field',
  Checkbox = 'checkbox',
  Dropdown = 'dropdown',
  SignatureField = 'signature-field',
}

// Form element factory options
export interface FormElementOptions {
  name?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  page?: number;
  zIndex?: number;
  properties?: Record<string, any>;
}

// Default properties for each element type
const defaultProperties = {
  [FormElementType.TextField]: {
    value: '',
    placeholder: 'Enter text',
    fontSize: 14,
  },
  [FormElementType.Checkbox]: {
    checked: false,
    label: 'Checkbox',
  },
  [FormElementType.Dropdown]: {
    options: ['Option 1', 'Option 2', 'Option 3'],
    selectedOption: '',
  },
  [FormElementType.SignatureField]: {
    signatureData: null,
  },
};

// Default dimensions for each element type
const defaultDimensions = {
  [FormElementType.TextField]: { width: 200, height: 40 },
  [FormElementType.Checkbox]: { width: 150, height: 30 },
  [FormElementType.Dropdown]: { width: 200, height: 40 },
  [FormElementType.SignatureField]: { width: 300, height: 100 },
};

export class FormElementManager {
  private elements: FormElement[] = [];
  private nextZIndex: number = 100;

  /**
   * Get all form elements
   */
  getElements(): FormElement[] {
    return [...this.elements];
  }

  /**
   * Get a form element by ID
   */
  getElementById(id: string): FormElement | undefined {
    return this.elements.find(element => element.id === id);
  }

  /**
   * Create a new form element
   */
  createFormElement(type: FormElementType, options: FormElementOptions = {}): FormElement {
    const id = uuidv4();
    const name = options.name || `${type}-${id.substring(0, 8)}`;
    const zIndex = options.zIndex !== undefined ? options.zIndex : this.nextZIndex;
    
    // Get default dimensions for this element type
    const defaultSize = defaultDimensions[type];
    
    const element: FormElement = {
      id,
      name,
      type,
      x: options.x || 0,
      y: options.y || 0,
      width: options.width || defaultSize.width,
      height: options.height || defaultSize.height,
      page: options.page || 1,
      zIndex,
      properties: {
        ...defaultProperties[type],
        ...(options.properties || {}),
      },
    };

    this.elements.push(element);
    this.nextZIndex += 10;
    
    return element;
  }

  /**
   * Update a form element
   */
  updateElement(id: string, updates: Partial<Omit<FormElement, 'id' | 'type'>>): FormElement | null {
    const index = this.elements.findIndex(element => element.id === id);
    if (index === -1) return null;

    const updatedElement = {
      ...this.elements[index],
      ...updates,
      properties: {
        ...this.elements[index].properties,
        ...(updates.properties || {}),
      },
    };

    this.elements[index] = updatedElement;
    return updatedElement;
  }

  /**
   * Delete a form element
   */
  deleteElement(id: string): boolean {
    const initialLength = this.elements.length;
    this.elements = this.elements.filter(element => element.id !== id);
    return this.elements.length !== initialLength;
  }

  /**
   * Update element property
   */
  updateElementProperty(id: string, propertyKey: string, value: any): FormElement | null {
    const element = this.getElementById(id);
    if (!element) return null;

    return this.updateElement(id, {
      properties: {
        ...element.properties,
        [propertyKey]: value,
      },
    });
  }

  /**
   * Bring element to front
   */
  bringToFront(id: string): FormElement | null {
    const element = this.getElementById(id);
    if (!element) return null;

    // Find the highest z-index
    const highestZIndex = Math.max(...this.elements.map(el => el.zIndex));
    
    // Set this element's z-index higher than the highest
    return this.updateElement(id, { zIndex: highestZIndex + 10 });
  }

  /**
   * Send element to back
   */
  sendToBack(id: string): FormElement | null {
    const element = this.getElementById(id);
    if (!element) return null;

    // Find the lowest z-index
    const lowestZIndex = Math.min(...this.elements.map(el => el.zIndex));
    
    // Set this element's z-index lower than the lowest
    return this.updateElement(id, { zIndex: lowestZIndex - 10 });
  }

  /**
   * Get elements on a specific page
   */
  getElementsByPage(page: number): FormElement[] {
    return this.elements.filter(element => element.page === page);
  }

  /**
   * Serialize all elements to JSON
   */
  serialize(): string {
    return JSON.stringify(this.elements);
  }

  /**
   * Load elements from JSON
   */
  deserialize(json: string): void {
    try {
      const elements = JSON.parse(json) as FormElement[];
      this.elements = elements;
      
      // Update nextZIndex to be higher than any existing element
      if (elements.length > 0) {
        this.nextZIndex = Math.max(...elements.map(el => el.zIndex)) + 10;
      }
    } catch (error) {
      console.error('Failed to deserialize form elements:', error);
    }
  }

  /**
   * Clear all elements
   */
  clear(): void {
    this.elements = [];
    this.nextZIndex = 100;
  }
} 