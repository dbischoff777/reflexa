class AssetLoader {
  constructor() {
    this.cache = new Map();
    this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }

  async scanProjectAssets() {
    try {
      // Import all assets using Webpack's require.context
      const imageContext = require.context('../', true, /\.(png|jpe?g|gif|svg|webp)$/);
      const soundContext = require.context('../', true, /\.(mp3|wav|ogg)$/);
      const videoContext = require.context('../', true, /\.(mp4|webm)$/);
      const animationContext = require.context('../', true, /animations\/.*\.(json|gif)$/);

      const assets = {
        images: this.getAssetPaths(imageContext),
        sounds: this.getAssetPaths(soundContext),
        videos: this.getAssetPaths(videoContext),
        animations: this.getAssetPaths(animationContext),
      };

      return assets;
    } catch (error) {
      console.error('Error scanning project assets:', error);
      throw error;
    }
  }

  getAssetPaths(context) {
    try {
      return context.keys().map(key => {
        try {
          return context(key).default || context(key);
        } catch (error) {
          console.warn(`Failed to load asset: ${key}`, error);
          return null;
        }
      }).filter(Boolean);
    } catch (error) {
      console.warn('Error processing context:', error);
      return [];
    }
  }

  async preloadImage(src) {
    if (this.cache.has(src)) {
      return this.cache.get(src);
    }

    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      
      // Add timeout for mobile devices
      const timeout = setTimeout(() => {
        if (this.isMobile) {
          console.warn(`Image load timed out: ${src}, resolving anyway`);
          resolve(img); // Resolve anyway on mobile to prevent blocking
        }
      }, 5000);

      img.onload = () => {
        clearTimeout(timeout);
        resolve(img);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error(`Failed to load image: ${src}`));
      };

      // Add loading attribute for better performance
      img.loading = 'lazy';
      img.src = src;
    });

    this.cache.set(src, promise);
    return promise;
  }

  async preloadAudio(src) {
    if (this.cache.has(src)) {
      return this.cache.get(src);
    }

    const promise = new Promise((resolve, reject) => {
      const audio = new Audio();
      
      // Add timeout for mobile devices
      const timeout = setTimeout(() => {
        if (this.isMobile) {
          console.warn(`Audio load timed out: ${src}, resolving anyway`);
          resolve(audio); // Resolve anyway on mobile to prevent blocking
        }
      }, 5000);

      audio.oncanplaythrough = () => {
        clearTimeout(timeout);
        resolve(audio);
      };

      audio.onerror = () => {
        clearTimeout(timeout);
        reject(new Error(`Failed to load audio: ${src}`));
      };

      // Mobile-specific optimizations
      if (this.isMobile) {
        audio.preload = 'metadata'; // Lighter initial load for mobile
      } else {
        audio.preload = 'auto';
      }

      audio.src = src;
    });

    this.cache.set(src, promise);
    return promise;
  }

  async loadAssets(assets, onProgress = () => {}) {
    const total = Object.values(assets).flat().length;
    let loaded = 0;

    // Batch loading for better mobile performance
    const batchSize = this.isMobile ? 3 : 10;
    const loadPromises = [];

    const loadBatch = async (items, loader) => {
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        await Promise.allSettled(
          batch.map(src =>
            loader.call(this, src)
              .then(() => {
                loaded++;
                onProgress(Math.round((loaded / total) * 100));
              })
              .catch(error => console.warn(`Failed to preload: ${src}`, error))
          )
        );
      }
    };

    // Load images first (they're usually needed first for UI)
    if (assets.images?.length) {
      await loadBatch(assets.images, this.preloadImage);
    }

    // Then load audio
    if (assets.sounds?.length) {
      await loadBatch(assets.sounds, this.preloadAudio);
    }
  }

  clearCache() {
    this.cache.clear();
  }
}

export default new AssetLoader();