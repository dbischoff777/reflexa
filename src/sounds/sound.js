import achievementSound from '../sounds/achievement.mp3';

class SoundManager {
    constructor() {
      this.sounds = {};
      this.muted = localStorage.getItem('soundMuted') === 'true';
    }
  
    loadSound(name, url) {
      this.sounds[name] = new Audio(url);
    }
  
    play(name) {
      if (!this.muted && this.sounds[name]) {
        // Reset the audio to start
        this.sounds[name].currentTime = 0;
        // Play the sound
        this.sounds[name].play().catch(error => {
          console.warn('Error playing sound:', error);
        });
      }
    }
  
    toggleMute() {
      this.muted = !this.muted;
      localStorage.setItem('soundMuted', this.muted);
    }
  
    isMuted() {
      return this.muted;
    }
  }
  
  // Create a singleton instance
  const soundManager = new SoundManager();
  
  // Load sounds
  soundManager.loadSound('achievement', achievementSound);
  
  export default soundManager;  