class AssetLoader {
  constructor() {
    this.cache = new Map();
  }

  async preloadImage(src) {
    if (this.cache.has(src)) {
      return this.cache.get(src);
    }

    try {
      const promise = new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      });

      this.cache.set(src, promise);
      return await promise;
    } catch (error) {
      console.error('Error loading image:', error);
      throw error;
    }
  }

  async preloadAudio(src) {
    if (this.cache.has(src)) {
      return this.cache.get(src);
    }

    try {
      const promise = new Promise((resolve, reject) => {
        const audio = new Audio();
        audio.src = src;
        audio.oncanplaythrough = () => resolve(audio);
        audio.onerror = () => reject(new Error(`Failed to load audio: ${src}`));
      });

      this.cache.set(src, promise);
      return await promise;
    } catch (error) {
      console.error('Error loading audio:', error);
      throw error;
    }
  }

  async loadAssets(assets, onProgress) {
    const total = Object.values(assets).flat().length;
    let loaded = 0;

    const loadWithProgress = async (src, loader) => {
      try {
        await loader(src);
        loaded++;
        onProgress((loaded / total) * 100);
      } catch (error) {
        console.error(`Failed to load asset: ${src}`, error);
        // Optionally implement retry logic here
      }
    };

    const loadPromises = [
      ...assets.images.map(src => loadWithProgress(src, this.preloadImage.bind(this))),
      ...assets.sounds.map(src => loadWithProgress(src, this.preloadAudio.bind(this))),
      ...assets.animations.map(src => loadWithProgress(src, this.preloadImage.bind(this)))
    ];

    await Promise.all(loadPromises);
  }

  clearCache() {
    this.cache.clear();
  }
}

export default new AssetLoader(); 