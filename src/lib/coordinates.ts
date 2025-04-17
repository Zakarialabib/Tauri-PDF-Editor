/**
 * Utility functions for coordinate transformations between screen and PDF coordinates
 */

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PageDimensions {
  width: number;
  height: number;
  rotation: number;
}

/**
 * Convert screen coordinates to PDF coordinates
 * @param point Screen coordinates
 * @param pageDimensions PDF page dimensions
 * @param scale Current zoom scale
 * @param pageOffset Page offset in the viewport
 */
export function screenToPdfCoordinates(
  point: Point,
  pageDimensions: PageDimensions,
  scale: number,
  pageOffset: Point
): Point {
  // Adjust for page offset and scale
  const adjustedX = (point.x - pageOffset.x) / scale;
  const adjustedY = (point.y - pageOffset.y) / scale;

  // Handle page rotation if needed
  switch (pageDimensions.rotation) {
    case 90:
      return {
        x: pageDimensions.height - adjustedY,
        y: adjustedX,
      };
    case 180:
      return {
        x: pageDimensions.width - adjustedX,
        y: pageDimensions.height - adjustedY,
      };
    case 270:
      return {
        x: adjustedY,
        y: pageDimensions.width - adjustedX,
      };
    default:
      return {
        x: adjustedX,
        y: adjustedY,
      };
  }
}

/**
 * Convert PDF coordinates to screen coordinates
 * @param point PDF coordinates
 * @param pageDimensions PDF page dimensions
 * @param scale Current zoom scale
 * @param pageOffset Page offset in the viewport
 */
export function pdfToScreenCoordinates(
  point: Point,
  pageDimensions: PageDimensions,
  scale: number,
  pageOffset: Point
): Point {
  let adjustedX = point.x;
  let adjustedY = point.y;

  // Handle page rotation if needed
  switch (pageDimensions.rotation) {
    case 90:
      adjustedX = point.y;
      adjustedY = pageDimensions.height - point.x;
      break;
    case 180:
      adjustedX = pageDimensions.width - point.x;
      adjustedY = pageDimensions.height - point.y;
      break;
    case 270:
      adjustedX = pageDimensions.width - point.y;
      adjustedY = point.x;
      break;
  }

  // Apply scale and offset
  return {
    x: adjustedX * scale + pageOffset.x,
    y: adjustedY * scale + pageOffset.y,
  };
}

/**
 * Convert a rectangle from screen coordinates to PDF coordinates
 * @param rect Rectangle in screen coordinates
 * @param pageDimensions PDF page dimensions
 * @param scale Current zoom scale
 * @param pageOffset Page offset in the viewport
 */
export function screenToPdfRect(
  rect: Rect,
  pageDimensions: PageDimensions,
  scale: number,
  pageOffset: Point
): Rect {
  const topLeft = screenToPdfCoordinates(
    { x: rect.x, y: rect.y },
    pageDimensions,
    scale,
    pageOffset
  );
  
  // Adjust width and height for scale
  return {
    x: topLeft.x,
    y: topLeft.y,
    width: rect.width / scale,
    height: rect.height / scale,
  };
}

/**
 * Convert a rectangle from PDF coordinates to screen coordinates
 * @param rect Rectangle in PDF coordinates
 * @param pageDimensions PDF page dimensions
 * @param scale Current zoom scale
 * @param pageOffset Page offset in the viewport
 */
export function pdfToScreenRect(
  rect: Rect,
  pageDimensions: PageDimensions,
  scale: number,
  pageOffset: Point
): Rect {
  const topLeft = pdfToScreenCoordinates(
    { x: rect.x, y: rect.y },
    pageDimensions,
    scale,
    pageOffset
  );
  
  // Adjust width and height for scale
  return {
    x: topLeft.x,
    y: topLeft.y,
    width: rect.width * scale,
    height: rect.height * scale,
  };
}

/**
 * Check if a point is within the boundaries of a page
 * @param point Point in PDF coordinates
 * @param pageDimensions PDF page dimensions
 */
export function isPointWithinPage(
  point: Point,
  pageDimensions: PageDimensions
): boolean {
  return (
    point.x >= 0 &&
    point.y >= 0 &&
    point.x <= pageDimensions.width &&
    point.y <= pageDimensions.height
  );
}

/**
 * Ensure a rectangle is within the boundaries of a page
 * @param rect Rectangle in PDF coordinates
 * @param pageDimensions PDF page dimensions
 */
export function constrainRectToPage(
  rect: Rect,
  pageDimensions: PageDimensions
): Rect {
  const x = Math.max(0, Math.min(rect.x, pageDimensions.width - rect.width));
  const y = Math.max(0, Math.min(rect.y, pageDimensions.height - rect.height));
  
  const width = Math.min(rect.width, pageDimensions.width - x);
  const height = Math.min(rect.height, pageDimensions.height - y);
  
  return { x, y, width, height };
}

/**
 * Serialize a form element position for storage
 * @param rect Rectangle in PDF coordinates
 * @param page Page number
 */
export function serializePosition(rect: Rect, page: number): string {
  return JSON.stringify({
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    page,
  });
}

/**
 * Deserialize a form element position from storage
 * @param serialized Serialized position string
 */
export function deserializePosition(serialized: string): { rect: Rect; page: number } {
  const { x, y, width, height, page } = JSON.parse(serialized);
  return {
    rect: { x, y, width, height },
    page,
  };
} 