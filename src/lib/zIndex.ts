/**
 * Utility functions for managing z-index of form elements
 */

const Z_INDEX_BASE = 100;
const Z_INDEX_STEP = 10;

/**
 * Calculate z-index for an element based on its position in the elements array
 * @param index Position in the elements array
 * @returns Z-index value
 */
export function calculateZIndex(index: number): number {
  return Z_INDEX_BASE + (index * Z_INDEX_STEP);
}

/**
 * Get the z-index for a selected element
 * @param baseZIndex The base z-index of the element
 * @returns Z-index value for selected state
 */
export function getSelectedZIndex(baseZIndex: number): number {
  return baseZIndex + 1000; // Ensure selected elements are always on top
}

/**
 * Sort elements by their z-index
 * @param elements Array of elements with z-index property
 * @returns Sorted array
 */
export function sortByZIndex<T extends { zIndex: number }>(elements: T[]): T[] {
  return [...elements].sort((a, b) => a.zIndex - b.zIndex);
}

/**
 * Bring an element to the front by updating z-indices
 * @param elements Array of elements with z-index property
 * @param elementId ID of the element to bring to front
 * @returns Updated elements array
 */
export function bringToFront<T extends { id: string; zIndex: number }>(
  elements: T[],
  elementId: string
): T[] {
  // Find the highest z-index
  const highestZIndex = Math.max(...elements.map(el => el.zIndex));
  
  // Create a new array with updated z-indices
  return elements.map(element => {
    if (element.id === elementId) {
      return { ...element, zIndex: highestZIndex + Z_INDEX_STEP };
    }
    return element;
  });
}

/**
 * Send an element to the back by updating z-indices
 * @param elements Array of elements with z-index property
 * @param elementId ID of the element to send to back
 * @returns Updated elements array
 */
export function sendToBack<T extends { id: string; zIndex: number }>(
  elements: T[],
  elementId: string
): T[] {
  // Find the lowest z-index
  const lowestZIndex = Math.min(...elements.map(el => el.zIndex));
  
  // Create a new array with updated z-indices
  return elements.map(element => {
    if (element.id === elementId) {
      return { ...element, zIndex: lowestZIndex - Z_INDEX_STEP };
    }
    return element;
  });
}

/**
 * Normalize z-indices to ensure they are properly spaced and start from the base value
 * @param elements Array of elements with z-index property
 * @returns Updated elements array with normalized z-indices
 */
export function normalizeZIndices<T extends { zIndex: number }>(elements: T[]): T[] {
  // Sort elements by current z-index
  const sorted = sortByZIndex(elements);
  
  // Assign new z-indices based on position
  return sorted.map((element, index) => ({
    ...element,
    zIndex: calculateZIndex(index),
  }));
} 