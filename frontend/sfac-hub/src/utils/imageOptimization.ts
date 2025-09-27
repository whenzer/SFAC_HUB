// Image optimization and caching utilities

interface ImageCache {
  [key: string]: {
    url: string;
    timestamp: number;
    compressed?: boolean;
  };
}

class ImageOptimizer {
  private cache: ImageCache = {};
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_CACHE_SIZE = 50; // Maximum number of cached images

  /**
   * Get optimized image URL with caching
   */
  getOptimizedImageUrl(originalUrl: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  }): string {
    const cacheKey = this.generateCacheKey(originalUrl, options);
    
    // Check if image is already cached and not expired
    if (this.cache[cacheKey] && this.isCacheValid(this.cache[cacheKey].timestamp)) {
      return this.cache[cacheKey].url;
    }

    // Generate optimized URL
    const optimizedUrl = this.generateOptimizedUrl(originalUrl, options);
    
    // Cache the optimized URL
    this.cacheImage(cacheKey, optimizedUrl);
    
    return optimizedUrl;
  }

  /**
   * Preload images for better performance
   */
  preloadImages(urls: string[]): Promise<void[]> {
    const preloadPromises = urls.map(url => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
      });
    });

    return Promise.all(preloadPromises);
  }

  /**
   * Generate cache key for image
   */
  private generateCacheKey(originalUrl: string, options?: any): string {
    const optionsStr = options ? JSON.stringify(options) : '';
    return `${originalUrl}_${optionsStr}`;
  }

  /**
   * Check if cache entry is still valid
   */
  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  /**
   * Generate optimized URL (in a real app, this would use a service like Cloudinary)
   */
  private generateOptimizedUrl(originalUrl: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  }): string {
    // For demo purposes, we'll use the original URL
    // In production, you would integrate with an image optimization service
    // like Cloudinary, ImageKit, or AWS CloudFront
    
    if (this.isPicsumUrl(originalUrl)) {
      // Optimize Picsum URLs with parameters
      const url = new URL(originalUrl);
      if (options?.width) url.searchParams.set('w', options.width.toString());
      if (options?.height) url.searchParams.set('h', options.height.toString());
      if (options?.quality) url.searchParams.set('q', options.quality.toString());
      return url.toString();
    }
    
    return originalUrl;
  }

  /**
   * Check if URL is from Picsum (placeholder service)
   */
  private isPicsumUrl(url: string): boolean {
    return url.includes('picsum.photos');
  }

  /**
   * Cache image URL
   */
  private cacheImage(key: string, url: string): void {
    // Remove oldest entries if cache is full
    if (Object.keys(this.cache).length >= this.MAX_CACHE_SIZE) {
      const oldestKey = Object.keys(this.cache).reduce((oldest, current) => {
        return this.cache[current].timestamp < this.cache[oldest].timestamp ? current : oldest;
      });
      delete this.cache[oldestKey];
    }

    this.cache[key] = {
      url,
      timestamp: Date.now(),
      compressed: true
    };
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    Object.keys(this.cache).forEach(key => {
      if (!this.isCacheValid(this.cache[key].timestamp)) {
        delete this.cache[key];
      }
    });
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: Object.keys(this.cache).length,
      entries: Object.keys(this.cache)
    };
  }
}

// Create singleton instance
export const imageOptimizer = new ImageOptimizer();

// Utility functions for common image operations
export const getOptimizedImageUrl = (url: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}) => imageOptimizer.getOptimizedImageUrl(url, options);

export const preloadImages = (urls: string[]) => imageOptimizer.preloadImages(urls);

// Image compression utilities
export const compressImage = (file: File, quality: number = 0.8): Promise<Blob> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx?.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        resolve(blob || file);
      }, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Lazy loading utility
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
): IntersectionObserver => {
  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  });
};

// Clean up cache on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    imageOptimizer.clearExpiredCache();
  });
}
