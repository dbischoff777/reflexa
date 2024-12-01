const ASSET_CACHE_VERSION = '1.0';

class AssetLoader {
  constructor() {
    this.cache = new Map();
    this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    this.assetsLoaded = false;
    this.loadingPromise = null;
    
    if (localStorage.getItem('assetCacheVersion') !== ASSET_CACHE_VERSION) {
      this.clearCache();
      localStorage.setItem('assetCacheVersion', ASSET_CACHE_VERSION);
    }
    
    this.loadCacheFromStorage();
  }

  loadCacheFromStorage() {
    try {
      const cachedAssets = localStorage.getItem('assetCache');
      if (cachedAssets) {
        const parsedCache = JSON.parse(cachedAssets);
        // Convert stored base64 strings back to Image/Audio/Video objects
        Object.entries(parsedCache).forEach(([key, value]) => {
          if (key.match(/\.(png|jpe?g|gif|svg|webp)$/i)) {
            const img = new Image();
            img.src = value;
            this.cache.set(key, Promise.resolve(img));
          } else if (key.match(/\.(mp3|wav|ogg)$/i)) {
            const audio = new Audio();
            audio.src = value;
            this.cache.set(key, Promise.resolve(audio));
          } else if (key.match(/\.(mp4|webm)$/i)) {
            const video = document.createElement('video');
            video.src = value;
            this.cache.set(key, Promise.resolve(video));
          }
        });
        this.assetsLoaded = true;
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
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

    const totalAssets = (assets.images || []).length;
    let loadedAssets = 0;

    try {
      if (assets.images) {
        const imagePromises = assets.images.map(async (src) => {
          await this.preloadImage(src);
          loadedAssets++;
          onProgress((loadedAssets / totalAssets) * 100);
        });

        await Promise.all(imagePromises);
      }

      console.log('✅ All assets loaded successfully');
      return true;
    } catch (error) {
      console.error('❌ Error loading assets:', error);
      if (this.isMobile) {
        return true; // Continue on mobile despite errors
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

  async scanProjectAssets(assets) {
    if (!assets || !assets.images) {
      console.warn('No assets provided for scanning');
      return;
    }

    try {
      const imagePromises = assets.images.map(src => this.preloadImage(src));
      await Promise.all(imagePromises);
      
      console.log('✅ All assets scanned and cached');
      this.saveCacheToStorage();
      return true;
    } catch (error) {
      console.error('❌ Error scanning assets:', error);
      if (this.isMobile) {
        return true; // Continue on mobile despite errors
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