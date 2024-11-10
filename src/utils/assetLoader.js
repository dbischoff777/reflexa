class AssetLoader {
  constructor() {
    this.cache = new Map();
    this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    this.assetsLoaded = false;
    this.loadingPromise = null;
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
      
      const timeout = setTimeout(() => {
        if (this.isMobile) {
          console.warn(`⚠️ Image load timed out: ${src}, resolving anyway`);
          resolve(img);
        } else {
          reject(new Error(`Timeout loading image: ${src}`));
        }
      }, 10000);

      img.onload = () => {
        clearTimeout(timeout);
        resolve(img);
      };
      
      img.onerror = (e) => {
        clearTimeout(timeout);
        console.error(`❌ Image load error for ${src}:`, e);
        reject(new Error(`Failed to load image: ${src}`));
      };

      img.loading = 'eager';
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
      
      const timeout = setTimeout(() => {
        if (this.isMobile) {
          console.warn(`⚠️ Audio load timed out: ${src}, resolving anyway`);
          resolve(audio);
        } else {
          reject(new Error(`Timeout loading audio: ${src}`));
        }
      }, 10000);

      audio.oncanplaythrough = () => {
        clearTimeout(timeout);
        resolve(audio);
      };

      audio.onerror = (e) => {
        clearTimeout(timeout);
        console.error(`❌ Audio load error for ${src}:`, e);
        reject(new Error(`Failed to load audio: ${src}`));
      };

      audio.preload = this.isMobile ? 'metadata' : 'auto';
      audio.src = src;
    });

    this.cache.set(src, promise);
    return promise;
  }

  async loadAssets(assets, onProgress = () => {}) {
    const total = Object.values(assets).flat().length;
    let loaded = 0;

    console.log('Assets to load:', {
      images: assets.images?.length || 0,
      sounds: assets.sounds?.length || 0,
      videos: assets.videos?.length || 0,
      animations: assets.animations?.length || 0
    });

    const batchSize = this.isMobile ? 3 : 5;

    const loadBatch = async (items, loader, type) => {
      if (!items?.length) return;
      
      console.log(`Starting to load ${type}:`, items.length);
      
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        
        console.log(`Loading ${type} batch ${i/batchSize + 1}:`, batch);

        try {
          const results = await Promise.allSettled(
            batch.map(async (src) => {
              try {
                await loader.call(this, src);
                loaded++;
                const progress = Math.round((loaded / total) * 100);
                console.log(`✅ Loaded ${type}:`, src, `(${loaded}/${total}) - ${progress}%`);
                onProgress(progress);
                return true;
              } catch (error) {
                console.warn(`❌ Failed to load ${type}:`, src, error);
                loaded++;
                const progress = Math.round((loaded / total) * 100);
                onProgress(progress);
                return false;
              }
            })
          );

          const batchResults = results.map((result, index) => ({
            asset: batch[index],
            status: result.status,
            success: result.status === 'fulfilled' && result.value
          }));
          console.log(`Batch results:`, batchResults);

        } catch (error) {
          console.error(`Batch error for ${type}:`, error);
          batch.forEach(() => {
            loaded++;
            const progress = Math.round((loaded / total) * 100);
            onProgress(progress);
          });
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }
    };

    try {
      await loadBatch(assets.images, this.preloadImage, 'images');
      await loadBatch(assets.sounds, this.preloadAudio, 'sounds');
      await loadBatch(assets.videos, this.preloadVideo, 'videos');
      await loadBatch(assets.animations, this.preloadImage, 'animations');

      console.log('✅ All assets loaded. Final count:', loaded);
      return true;
    } catch (error) {
      console.error('❌ Error in loadAssets:', error);
      return false;
    }
  }

  async preloadVideo(src) {
    if (this.cache.has(src)) {
      return this.cache.get(src);
    }

    const promise = new Promise((resolve, reject) => {
      const video = document.createElement('video');
      
      const timeout = setTimeout(() => {
        if (this.isMobile) {
          console.warn(`Video load timed out: ${src}, resolving anyway`);
          resolve(video);
        }
      }, 5000);

      video.oncanplaythrough = () => {
        clearTimeout(timeout);
        resolve(video);
      };

      video.onerror = () => {
        clearTimeout(timeout);
        reject(new Error(`Failed to load video: ${src}`));
      };

      if (this.isMobile) {
        video.preload = 'metadata';
      } else {
        video.preload = 'auto';
      }

      video.src = src;
    });

    this.cache.set(src, promise);
    return promise;
  }

  async loadAssetsOnce(assets, onProgress = () => {}) {
    if (this.assetsLoaded) {
      console.log('✅ Assets already loaded, skipping...');
      onProgress(100);
      return true;
    }

    if (this.loadingPromise) {
      console.log('⏳ Asset loading already in progress, waiting...');
      return this.loadingPromise;
    }

    this.loadingPromise = this.loadAssets(assets, onProgress)
      .then(result => {
        if (result) {
          this.assetsLoaded = true;
          console.log('✅ Initial asset load complete');
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
  }
}

const assetLoader = new AssetLoader();
export default assetLoader;