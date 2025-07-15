import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { networkService } from './network';

export interface ImageCacheConfig {
  maxCacheSize: number; // in MB
  maxAge: number; // in milliseconds
  compressionQuality: number; // 0-1
  enableMemoryCache: boolean;
  enableDiskCache: boolean;
}

export interface CachedImage {
  uri: string;
  localPath: string;
  timestamp: number;
  size: number;
  width?: number;
  height?: number;
  mimeType?: string;
}

class ImageCacheService {
  private static instance: ImageCacheService;
  private memoryCache: Map<string, CachedImage> = new Map();
  private config: ImageCacheConfig;
  private cacheDir: string;
  private readonly CACHE_KEY = 'IMAGE_CACHE_INDEX';

  constructor() {
    this.config = {
      maxCacheSize: 100, // 100MB
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      compressionQuality: 0.8,
      enableMemoryCache: true,
      enableDiskCache: true,
    };
    
    this.cacheDir = `${FileSystem.cacheDirectory}images/`;
    this.initializeCache();
  }

  static getInstance(): ImageCacheService {
    if (!ImageCacheService.instance) {
      ImageCacheService.instance = new ImageCacheService();
    }
    return ImageCacheService.instance;
  }

  private async initializeCache() {
    try {
      // Create cache directory if it doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(this.cacheDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.cacheDir, { intermediates: true });
      }

      // Load cache index from storage
      if (this.config.enableDiskCache) {
        await this.loadCacheIndex();
        await this.cleanupExpiredImages();
      }
    } catch (error) {
      console.error('Failed to initialize image cache:', error);
    }
  }

  private async loadCacheIndex() {
    try {
      const indexData = await AsyncStorage.getItem(this.CACHE_KEY);
      if (indexData) {
        const cachedImages: CachedImage[] = JSON.parse(indexData);
        cachedImages.forEach(image => {
          this.memoryCache.set(image.uri, image);
        });
      }
    } catch (error) {
      console.error('Failed to load cache index:', error);
    }
  }

  private async saveCacheIndex() {
    try {
      const cacheArray = Array.from(this.memoryCache.values());
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheArray));
    } catch (error) {
      console.error('Failed to save cache index:', error);
    }
  }

  private async cleanupExpiredImages() {
    const now = Date.now();
    const expiredImages: string[] = [];

    for (const [uri, cachedImage] of this.memoryCache) {
      if (now - cachedImage.timestamp > this.config.maxAge) {
        expiredImages.push(uri);
      }
    }

    for (const uri of expiredImages) {
      await this.removeFromCache(uri);
    }
  }

  private async removeFromCache(uri: string) {
    const cachedImage = this.memoryCache.get(uri);
    if (cachedImage) {
      try {
        // Remove from disk
        const fileInfo = await FileSystem.getInfoAsync(cachedImage.localPath);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(cachedImage.localPath);
        }
        
        // Remove from memory
        this.memoryCache.delete(uri);
        
        // Update cache index
        await this.saveCacheIndex();
      } catch (error) {
        console.error('Failed to remove cached image:', error);
      }
    }
  }

  private generateCacheKey(uri: string): string {
    return uri.replace(/[^a-zA-Z0-9]/g, '_');
  }

  private async getCacheSize(): Promise<number> {
    let totalSize = 0;
    for (const cachedImage of this.memoryCache.values()) {
      totalSize += cachedImage.size;
    }
    return totalSize;
  }

  private async enforceCacheSize() {
    const currentSize = await this.getCacheSize();
    const maxSizeBytes = this.config.maxCacheSize * 1024 * 1024;

    if (currentSize > maxSizeBytes) {
      // Sort by timestamp (oldest first)
      const sortedImages = Array.from(this.memoryCache.values())
        .sort((a, b) => a.timestamp - b.timestamp);

      let sizeToRemove = currentSize - maxSizeBytes;
      
      for (const image of sortedImages) {
        if (sizeToRemove <= 0) break;
        
        await this.removeFromCache(image.uri);
        sizeToRemove -= image.size;
      }
    }
  }

  async cacheImage(uri: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
  }): Promise<CachedImage | null> {
    if (!this.config.enableDiskCache) {
      return null;
    }

    try {
      // Check if already cached
      const cached = this.memoryCache.get(uri);
      if (cached) {
        // Update timestamp
        cached.timestamp = Date.now();
        return cached;
      }

      // Check network connectivity
      if (!networkService.isConnected()) {
        return null;
      }

      // Generate cache path
      const cacheKey = this.generateCacheKey(uri);
      const localPath = `${this.cacheDir}${cacheKey}`;

      // Download and cache the image
      const downloadResult = await FileSystem.downloadAsync(uri, localPath);
      
      if (downloadResult.status === 200) {
        const fileInfo = await FileSystem.getInfoAsync(localPath);
        
        const cachedImage: CachedImage = {
          uri,
          localPath,
          timestamp: Date.now(),
          size: fileInfo.size || 0,
          width: options?.width,
          height: options?.height,
        };

        // Add to memory cache
        this.memoryCache.set(uri, cachedImage);
        
        // Save cache index
        await this.saveCacheIndex();
        
        // Enforce cache size limits
        await this.enforceCacheSize();
        
        return cachedImage;
      }
    } catch (error) {
      console.error('Failed to cache image:', error);
    }

    return null;
  }

  async getCachedImage(uri: string): Promise<CachedImage | null> {
    if (!this.config.enableDiskCache) {
      return null;
    }

    const cached = this.memoryCache.get(uri);
    if (cached) {
      // Verify file still exists
      const fileInfo = await FileSystem.getInfoAsync(cached.localPath);
      if (fileInfo.exists) {
        return cached;
      } else {
        // File was deleted, remove from cache
        this.memoryCache.delete(uri);
        await this.saveCacheIndex();
      }
    }

    return null;
  }

  async preloadImages(uris: string[], options?: {
    priority?: 'high' | 'medium' | 'low';
    batchSize?: number;
  }): Promise<void> {
    const batchSize = options?.batchSize || 5;
    const batches = [];
    
    for (let i = 0; i < uris.length; i += batchSize) {
      batches.push(uris.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      await Promise.all(
        batch.map(uri => this.cacheImage(uri))
      );
    }
  }

  async clearCache(): Promise<void> {
    try {
      // Clear memory cache
      this.memoryCache.clear();
      
      // Clear disk cache
      await FileSystem.deleteAsync(this.cacheDir, { idempotent: true });
      await FileSystem.makeDirectoryAsync(this.cacheDir, { intermediates: true });
      
      // Clear cache index
      await AsyncStorage.removeItem(this.CACHE_KEY);
      
      console.log('Image cache cleared');
    } catch (error) {
      console.error('Failed to clear image cache:', error);
    }
  }

  async getCacheStats(): Promise<{
    itemCount: number;
    totalSize: number;
    maxSize: number;
    hitRate: number;
  }> {
    const totalSize = await this.getCacheSize();
    const maxSize = this.config.maxCacheSize * 1024 * 1024;
    
    return {
      itemCount: this.memoryCache.size,
      totalSize,
      maxSize,
      hitRate: 0, // TODO: Track hit rate
    };
  }

  updateConfig(newConfig: Partial<ImageCacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): ImageCacheConfig {
    return { ...this.config };
  }
}

export const imageCacheService = ImageCacheService.getInstance();
export default imageCacheService;