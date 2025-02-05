const ASSET_CACHE_VERSION = '1.0';

class AssetLoader {
  constructor() {
    this.cache = new Map();
    this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    this.assetsLoaded = false;
    this.loadingPromise = null;
    
    this.timeouts = {
      images: 30000, // 30 seconds
      audio: 30000,
      video: 60000
    };
    
    if (localStorage.getItem('assetCacheVersion') !== ASSET_CACHE_VERSION) {
      this.clearCache();
      localStorage.setItem('assetCacheVersion', ASSET_CACHE_VERSION);
    }
    
    this.loadCacheFromStorage();
    
    // If no cache was loaded, scan for assets
    if (!this.assetsLoaded) {
      console.log('No cache found, scanning for assets...');
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.scanProjectAssets();
        });
      } else {
        this.scanProjectAssets();
      }
    }
  }

  loadCacheFromStorage() {
    try {
      const cachedAssets = localStorage.getItem('assetCache');
      if (cachedAssets) {
        const parsedCache = JSON.parse(cachedAssets);
        let loadedCount = 0;
        
        // Convert stored base64 strings back to Image/Audio/Video objects
        Object.entries(parsedCache).forEach(([key, value]) => {
          if (key.match(/\.(png|jpe?g|gif|svg|webp)$/i)) {
            const img = new Image();
            img.src = value;
            this.cache.set(key, Promise.resolve(img));
            loadedCount++;
          } else if (key.match(/\.(mp3|wav|ogg)$/i)) {
            const audio = new Audio();
            audio.src = value;
            this.cache.set(key, Promise.resolve(audio));
            loadedCount++;
          } else if (key.match(/\.(mp4|webm)$/i)) {
            const video = document.createElement('video');
            video.src = value;
            this.cache.set(key, Promise.resolve(video));
            loadedCount++;
          }
        });
        
        // Only set assetsLoaded to true if we actually loaded something
        this.assetsLoaded = loadedCount > 0;
        console.log(`Loaded ${loadedCount} assets from cache`);
      } else {
        console.log('No assets found in cache');
        this.assetsLoaded = false;
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
      this.assetsLoaded = false;
    }
  }

  saveCacheToStorage() {
    try {
      const cacheToStore = {};
      this.cache.forEach((promise, key) => {
        // Only store the src URLs in localStorage
        promise.then(asset => {
          cacheToStore[key] = asset.src;
        });
      });
      localStorage.setItem('assetCache', JSON.stringify(cacheToStore));
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
    }
  }

  async preloadImage(src) {
    if (this.cache.has(src)) {
      return this.cache.get(src);
    }

    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      
      const timeout = setTimeout(() => {
        if (this.isMobile) {
          console.warn(`⚠️ Image load timed out: ${src}, resolving anyway`);
          resolve(img);
        } else {
          reject(new Error(`Timeout loading image: ${src}`));
        }
      }, this.timeouts.images);

      img.onload = () => {
        clearTimeout(timeout);
        resolve(img);
        this.saveCacheToStorage(); // Save to localStorage when loaded
      };
      
      img.onerror = (e) => {
        clearTimeout(timeout);
        console.error(`❌ Image load error for ${src}:`, e);
        reject(new Error(`Failed to load image: ${src}`));
      };

      img.src = src;
    });

    this.cache.set(src, promise);
    return promise;
  }

  // Similar updates for preloadAudio and preloadVideo methods...

  async loadAssets(assets, onProgress = () => {}) {
    if (!assets) {
      console.warn('No assets provided for loading');
      return false;
    }

    // Calculate total assets across all types
    const totalAssets = (
      (assets.images?.length || 0) +
      (assets.audio?.length || 0) +
      (assets.video?.length || 0)
    );
    
    console.log(`Total assets to load: ${totalAssets}`); // Debug log
    let loadedAssets = 0;

    try {
      onProgress(0);

      const allPromises = [];

      // Handle images
      if (assets.images) {
        const imagePromises = assets.images.map(async (src) => {
          try {
            await this.preloadImage(src);
            loadedAssets++;
            onProgress(Math.round((loadedAssets / totalAssets) * 100));
          } catch (error) {
            console.warn(`Failed to load image ${src}:`, error);
            if (!this.isMobile) throw error;
          }
        });
        allPromises.push(...imagePromises);
      }

      // Handle audio
      if (assets.audio) {
        const audioPromises = assets.audio.map(async (src) => {
          try {
            await this.preloadAudio(src);
            loadedAssets++;
            onProgress(Math.round((loadedAssets / totalAssets) * 100));
          } catch (error) {
            console.warn(`Failed to load audio ${src}:`, error);
            if (!this.isMobile) throw error;
          }
        });
        allPromises.push(...audioPromises);
      }

      // Handle video
      if (assets.video) {
        const videoPromises = assets.video.map(async (src) => {
          try {
            await this.preloadVideo(src);
            loadedAssets++;
            onProgress(Math.round((loadedAssets / totalAssets) * 100));
          } catch (error) {
            console.warn(`Failed to load video ${src}:`, error);
            if (!this.isMobile) throw error;
          }
        });
        allPromises.push(...videoPromises);
      }

      await Promise.all(allPromises);
      console.log('✅ All assets loaded successfully');
      return true;
    } catch (error) {
      console.error('❌ Error loading assets:', error);
      if (this.isMobile) {
        return true;
      }
      return false;
    }
  }

  async loadAssetsOnce(assets, onProgress = () => {}) {
    if (this.assetsLoaded) {
      console.log('✅ Assets already loaded from cache');
      onProgress(100);
      return true;
    }

    if (this.loadingPromise) {
      console.log('⏳ Asset loading in progress, waiting...');
      return this.loadingPromise;
    }

    this.loadingPromise = this.loadAssets(assets, onProgress)
      .then(result => {
        if (result) {
          this.assetsLoaded = true;
          this.saveCacheToStorage();
          console.log('✅ Initial asset load complete and cached');
        }
        this.loadingPromise = null;
        return result;
      })
      .catch(error => {
        this.loadingPromise = null;
        throw error;
      });

    return this.loadingPromise;
  }

  clearCache() {
    this.cache.clear();
    this.assetsLoaded = false;
    localStorage.removeItem('assetCache'); // Clear localStorage cache
  }

  clearCacheByType(type) {
    for (const [key, value] of this.cache.entries()) {
      if (key.match(new RegExp(`\.(${type})$`, 'i'))) {
        this.cache.delete(key);
      }
    }
    this.saveCacheToStorage(); // Update localStorage after clearing
  }

  async scanProjectAssets() {
    try {
      // Reset loading state
      this.assetsLoaded = false;
      this.cache.clear();
      
      // Find all assets in the document
      const assets = {
        images: Array.from(document.getElementsByTagName('img')).map(img => img.src),
        audio: Array.from(document.getElementsByTagName('audio')).map(audio => audio.src),
        video: Array.from(document.getElementsByTagName('video')).map(video => video.src)
      };

      // Also scan for background images in CSS
      const elements = document.getElementsByTagName('*');
      for (const element of elements) {
        const style = window.getComputedStyle(element);
        const bgImage = style.backgroundImage;
        if (bgImage && bgImage !== 'none') {
          const url = bgImage.slice(4, -1).replace(/['"]/g, '');
          if (!assets.images.includes(url)) {
            assets.images.push(url);
          }
        }
      }

      // Scan for assets in data attributes
      const dataAssets = document.querySelectorAll('[data-src], [data-background]');
      dataAssets.forEach(element => {
        const src = element.dataset.src || element.dataset.background;
        if (src) {
          if (src.match(/\.(png|jpe?g|gif|svg|webp)$/i)) {
            if (!assets.images.includes(src)) {
              assets.images.push(src);
            }
          } else if (src.match(/\.(mp3|wav|ogg)$/i)) {
            if (!assets.audio.includes(src)) {
              assets.audio.push(src);
            }
          } else if (src.match(/\.(mp4|webm)$/i)) {
            if (!assets.video.includes(src)) {
              assets.video.push(src);
            }
          }
        }
      });

      console.log('Found assets:', assets);

      // Load all discovered assets
      const result = await this.loadAssets(assets, (progress) => {
        console.log(`Loading progress: ${progress}%`);
      });

      if (result) {
        this.assetsLoaded = true;
        this.saveCacheToStorage();
        console.log('✅ All assets scanned and cached');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error scanning assets:', error);
      if (this.isMobile) {
        return true;
      }
      return false;
    }
  }

  async loadCriticalAssets(assets) {
    if (!assets || !assets.images) {
      console.warn('No critical assets provided for loading');
      return;
    }

    try {
      // First check cache
      if (this.assetsLoaded) {
        console.log('✅ Critical assets already loaded from cache');
        return true;
      }

      console.log('⏳ Loading critical assets...');
      const imagePromises = assets.images.map(src => this.preloadImage(src));
      await Promise.all(imagePromises);
      
      this.assetsLoaded = true;
      this.saveCacheToStorage();
      console.log('✅ Critical assets loaded and cached');
      return true;
    } catch (error) {
      console.error('❌ Error loading critical assets:', error);
      if (this.isMobile) {
        this.assetsLoaded = true;
        return true; // Continue on mobile despite errors
      }
      return false;
    }
  }
}

const assetLoader = new AssetLoader();
export default assetLoader;