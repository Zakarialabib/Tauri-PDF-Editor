import { PDFPageProxy } from 'pdfjs-dist';

interface CacheEntry {
  canvas: HTMLCanvasElement;
  scale: number;
  rotation: number;
  timestamp: number;
}

interface RenderOptions {
  scale: number;
  rotation?: number;
  quality?: 'low' | 'medium' | 'high';
}

class PdfRenderingService {
  private pageCache: Map<number, CacheEntry> = new Map();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private readonly maxCacheEntries = 10;

  async renderPage(
    page: PDFPageProxy,
    canvas: HTMLCanvasElement,
    options: RenderOptions
  ): Promise<void> {
    const { scale, rotation = 0, quality = 'medium' } = options;
    
    // Check cache first
    const cachedEntry = this.pageCache.get(page.pageNumber);
    if (this.isCacheValid(cachedEntry, scale, rotation)) {
      this.copyToCanvas(cachedEntry!.canvas, canvas);
      return;
    }

    // Set up canvas and viewport
    const viewport = page.getViewport({ scale, rotation });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Adjust rendering quality based on zoom level
    const pixelRatio = this.getPixelRatio(quality);
    const scaledViewport = page.getViewport({
      scale: scale * pixelRatio,
      rotation
    });

    // Create high-resolution canvas for caching
    const cacheCanvas = document.createElement('canvas');
    cacheCanvas.width = scaledViewport.width;
    cacheCanvas.height = scaledViewport.height;

    // Render to cache canvas
    const context = cacheCanvas.getContext('2d');
    if (!context) throw new Error('Could not get canvas context');

    await page.render({
      canvasContext: context,
      viewport: scaledViewport
    }).promise;

    // Store in cache
    this.addToCache(page.pageNumber, cacheCanvas, scale, rotation);

    // Copy to display canvas
    this.copyToCanvas(cacheCanvas, canvas);
  }

  private isCacheValid(
    entry: CacheEntry | undefined,
    scale: number,
    rotation: number
  ): boolean {
    if (!entry) return false;

    const isStale = Date.now() - entry.timestamp > this.cacheTimeout;
    const scaleMatches = Math.abs(entry.scale - scale) < 0.01;
    const rotationMatches = entry.rotation === rotation;

    return !isStale && scaleMatches && rotationMatches;
  }

  private addToCache(
    pageNumber: number,
    canvas: HTMLCanvasElement,
    scale: number,
    rotation: number
  ): void {
    // Remove oldest entry if cache is full
    if (this.pageCache.size >= this.maxCacheEntries) {
      const oldestKey = Array.from(this.pageCache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
      this.pageCache.delete(oldestKey);
    }

    this.pageCache.set(pageNumber, {
      canvas,
      scale,
      rotation,
      timestamp: Date.now()
    });
  }

  private copyToCanvas(
    source: HTMLCanvasElement,
    target: HTMLCanvasElement
  ): void {
    const context = target.getContext('2d');
    if (!context) throw new Error('Could not get canvas context');

    context.drawImage(
      source,
      0, 0, source.width, source.height,
      0, 0, target.width, target.height
    );
  }

  private getPixelRatio(quality: 'low' | 'medium' | 'high'): number {
    switch (quality) {
      case 'low': return 1;
      case 'medium': return 1.5;
      case 'high': return 2;
    }
  }

  clearCache(): void {
    this.pageCache.clear();
  }
}

export const pdfRenderingService = new PdfRenderingService();