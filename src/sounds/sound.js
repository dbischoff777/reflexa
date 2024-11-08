import achievementSound from '../sounds/achievement.mp3';
import success from '../sounds/success.mp3';
import miss from '../sounds/miss.mp3';
import countdown from '../sounds/countdown.mp3';
import trySound from '../assets/sounds/Try.mp3';

class SoundManager {
    constructor() {
      this.sounds = {};
      this.muted = localStorage.getItem('soundMuted') === 'true';
      
      // Initialize sounds immediately in constructor
      this.loadSound('achievement', achievementSound);
      this.loadSound('countdown', countdown);
      this.loadSound('success', success);
      this.loadSound('try', success);
      this.loadSound('miss', miss);
    }
  
    loadSound(name, url) {
      try {
        console.log(`Loading sound: ${name} from ${url}`); // Debug log
        this.sounds[name] = new Audio(url);
        
        // Add event listeners for debugging
        this.sounds[name].addEventListener('canplaythrough', () => {
          console.log(`Sound ${name} loaded successfully`);
        });
        
        this.sounds[name].addEventListener('error', (e) => {
          console.error(`Error loading sound ${name}:`, e);
        });
      } catch (error) {
        console.error(`Failed to load sound ${name}:`, error);
      }
    }
  
    play(name) {
      console.log(`Attempting to play sound: ${name}, muted: ${this.muted}`); // Debug log
      
      if (!this.muted && this.sounds[name]) {
        try {
          // Reset the audio to start
          this.sounds[name].currentTime = 0;
          // Play the sound
          return this.sounds[name].play()
            .then(() => {
              console.log(`Sound ${name} played successfully`);
            })
            .catch(error => {
              console.warn('Error playing sound:', error);
            });
        } catch (error) {
          console.error(`Error playing sound ${name}:`, error);
        }
      }
    }
  
    toggleMute() {
      this.muted = !this.muted;
      localStorage.setItem('soundMuted', this.muted);
      console.log(`Sound muted: ${this.muted}`); // Debug log
    }
  
    isMuted() {
      return this.muted;
    }
}
  
// Create a singleton instance
const soundManager = new SoundManager();

// Export the singleton instance
export default soundManager;