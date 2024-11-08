class MusicGenerator {
  constructor() {
    this.audio = null;
    this.isPlaying = false;
    this.audioPath = '/assets/music/QuietMoments.mp3';
  }

  async generateMusic() {
    try {
      console.log('Initializing music with path:', this.audioPath);
      this.audio = new Audio(this.audioPath);
      this.audio.loop = true;
      
      this.audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        if (this.audio.error) {
          console.error('Error code:', this.audio.error.code);
          console.error('Error message:', this.audio.error.message);
        } else {
          console.error('Unknown audio error occurred');
        }
      });

      await new Promise((resolve, reject) => {
        this.audio.addEventListener('loadeddata', () => {
          console.log('Audio loaded successfully');
          resolve();
        });
        this.audio.addEventListener('error', reject);
      });

      console.log('Music generation complete');
      return this.audio;
    } catch (error) {
      console.error('Error generating music:', error);
      return null;
    }
  }

  play() {
    if (!this.audio) {
      console.warn('Attempting to play before audio is initialized');
      return;
    }

    try {
      console.log('Attempting to play music');
      const playPromise = this.audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Music started playing successfully');
            this.isPlaying = true;
            this.fadeIn();
          })
          .catch(error => {
            console.error('Playback failed:', error);
            if (error.name === 'NotAllowedError') {
              console.log('Autoplay prevented - waiting for user interaction');
              const playOnClick = () => {
                this.audio.play()
                  .then(() => {
                    console.log('Music started after user interaction');
                    this.isPlaying = true;
                    this.fadeIn();
                    document.removeEventListener('click', playOnClick);
                  })
                  .catch(err => console.error('Playback failed after click:', err));
              };
              document.addEventListener('click', playOnClick);
            }
          });
      }
    } catch (error) {
      console.error('Error in play():', error);
    }
  }

  pause() {
    if (!this.audio) return;
    
    try {
      console.log('Pausing music');
      this.isPlaying = false;
      this.fadeOut().then(() => {
        this.audio.pause();
        console.log('Music paused successfully');
      });
    } catch (error) {
      console.error('Error pausing music:', error);
    }
  }

  fadeIn(duration = 2000) {
    if (!this.audio) return;

    const steps = 20;
    const increment = 1 / steps;
    const stepTime = duration / steps;

    let volume = 0;
    const fadeInterval = setInterval(() => {
      if (volume < 1) {
        volume += increment;
        this.audio.volume = Math.min(volume, 1);
      } else {
        clearInterval(fadeInterval);
      }
    }, stepTime);
  }

  async fadeOut(duration = 2000) {
    if (!this.audio) return;

    return new Promise(resolve => {
      const steps = 20;
      const decrement = 1 / steps;
      const stepTime = duration / steps;

      let volume = this.audio.volume;
      const fadeInterval = setInterval(() => {
        if (volume > 0) {
          volume -= decrement;
          this.audio.volume = Math.max(volume, 0);
        } else {
          clearInterval(fadeInterval);
          resolve();
        }
      }, stepTime);
    });
  }

  setVolume(level) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, level));
    }
  }

  async stop() {
    if (!this.audio) return;
    
    try {
      console.log('Stopping music');
      this.isPlaying = false;
      await this.fadeOut();
      this.audio.pause();
      this.audio.currentTime = 0; // Reset playback position to beginning
      console.log('Music stopped successfully');
    } catch (error) {
      console.error('Error stopping music:', error);
    }
  }
}

export default new MusicGenerator(); 