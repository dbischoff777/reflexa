class AssetLoader {
  constructor() {
    this.cache = new Map();
    this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    this.assetsLoaded = false;
    this.loadingPromise = null;
    this.batchSizes = {
      images: this.isMobile ? 3 : 8,
      sounds: this.isMobile ? 2 : 4,
      videos: this.isMobile ? 1 : 2,
      animations: this.isMobile ? 2 : 4
    };
    this.loadingMessages = {
      images: [
        "Loading those pretty pictures... 🎨",
        "Downloading pixels... 📸",
        "Making things look beautiful... ✨",
      ],
      sounds: [
        "Getting the tunes ready... 🎵",
        "Warming up the speakers... 🔊",
        "Loading awesome sound effects... 🎶",
      ],
      videos: [
        "Buffering cool videos... 🎬",
        "Preparing moving pictures... 📽️",
        "Loading cinematic content... 🎥",
      ],
      animations: [
        "Making things move... 💫",
        "Preparing smooth animations... 🎭",
        "Loading the fancy moves... 💃",
      ]
    };
    this.timeouts = {
      images: this.isMobile ? 5000 : 10000,
      sounds: this.isMobile ? 8000 : 10000,
      videos: this.isMobile ? 10000 : 15000
    };
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
      }, this.timeouts.images);

      img.loading = this.isMobile ? 'lazy' : 'eager';
      img.decoding = 'async';
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve(img);
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

  async preloadAudio(src) {
    if (this.cache.has(src)) {
      return this.cache.get(src);
    }

    const promise = new Promise((resolve, reject) => {
      const audio = new Audio();
      
      if (this.isMobile) {
        audio.preload = 'metadata';
        audio.load();
      } else {
        audio.preload = 'auto';
      }

      audio.oncanplaythrough = () => {
        resolve(audio);
      };

      audio.onerror = (e) => {
        console.error(`❌ Audio load error for ${src}:`, e);
        reject(new Error(`Failed to load audio: ${src}`));
      };

      audio.src = src;
    });

    this.cache.set(src, promise);
    return promise;
  }

  async loadAssets(assets, onProgress = () => {}) {
    const total = Object.values(assets).flat().length;
    let loaded = 0;

    const getRandomMessage = (type) => {
      const messages = this.loadingMessages[type];
      return messages[Math.floor(Math.random() * messages.length)];
    };

    console.log('🚀 Starting optimized asset loading for', this.isMobile ? 'mobile' : 'desktop');

    const loadOrder = this.isMobile ? [
      ['images', this.preloadImage],
      ['animations', this.preloadImage],
      ['sounds', this.preloadAudio],
      ['videos', this.preloadVideo]
    ] : [
      ['images', this.preloadImage],
      ['animations', this.preloadImage, 'sounds', this.preloadAudio],
      ['videos', this.preloadVideo]
    ];

    try {
      for (const batch of loadOrder) {
        if (Array.isArray(batch[0])) {
          await Promise.all(batch.map(([type, loader]) => 
            this.loadBatch(assets[type], loader, type, onProgress)
          ));
        } else {
          const [type, loader] = batch;
          await this.loadBatch(assets[type], loader, type, onProgress);
        }
      }

      console.log('✅ All assets loaded successfully');
      return true;
    } catch (error) {
      console.error('❌ Error in loadAssets:', error);
      if (this.isMobile) {
        console.log('Continuing despite error on mobile...');
        return true;
      }
      return false;
    }
  }

  async loadBatch(items, loader, type, onProgress) {
    if (!items?.length) return;
    
    const batchSize = this.batchSizes[type];
    const currentMessage = this.getRandomMessage(type);
    const batchDelay = this.isMobile ? 100 : 50;
    
    // Initialize tracking variables at the start
    let loadedCount = 0;
    const totalItems = items.length;

    console.log(`\n${currentMessage}`);
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      try {
        const results = await Promise.allSettled(
          batch.map(async (src) => {
            try {
              await loader.call(this, src);
              loadedCount++;
              const progress = Math.round((loadedCount / totalItems) * 100);
              const fileName = src.split('/').pop();
              console.log(`✅ Loaded: ${fileName} (${loadedCount}/${totalItems}) - ${progress}%`);
              onProgress(progress, currentMessage);
              return true;
            } catch (error) {
              console.warn(`❌ Failed: ${src.split('/').pop()}`);
              loadedCount++;
              const progress = Math.round((loadedCount / totalItems) * 100);
              onProgress(progress, currentMessage);
              return false;
            }
          })
        );

        // Check results if needed
        const failedInBatch = results.filter(r => r.status === 'rejected').length;
        if (failedInBatch > 0) {
          console.warn(`${failedInBatch} items failed to load in this batch`);
        }

      } catch (error) {
        console.error(`Batch error for ${type}:`, error);
        batch.forEach(() => {
          loadedCount++;
          const progress = Math.round((loadedCount / totalItems) * 100);
          onProgress(progress, currentMessage);
        });
      }

      await new Promise(resolve => setTimeout(resolve, batchDelay));
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
        } else {
          reject(new Error(`Timeout loading video: ${src}`));
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

  clearCacheByType(type) {
    for (const [key, value] of this.cache.entries()) {
      if (key.match(new RegExp(`\.(${type})$`, 'i'))) {
        this.cache.delete(key);
      }
    }
  }

  async preloadCriticalAssets(criticalAssets) {
    if (this.isMobile) {
      const results = await Promise.allSettled(
        criticalAssets.map(src => this.preloadImage(src))
      );
      return results.every(result => result.status === 'fulfilled');
    }
    return true;
  }

  async loadCriticalAssets(assets) {
    const criticalAssets = {
      images: assets.images.filter(img => 
        img.includes('ui/') || 
        img.includes('mascot/') || 
        img.includes('buttons/')
      ),
      sounds: assets.sounds.filter(sound => 
        sound.includes('ui/') || 
        sound.includes('effects/basic/')
      )
    };

    try {
      await this.loadAssets(criticalAssets, () => {});
      return true;
    } catch (error) {
      console.error('Failed to load critical assets:', error);
      return this.isMobile; // Continue on mobile even if critical assets fail
    }
  }
}

const assetLoader = new AssetLoader();
export default assetLoader;