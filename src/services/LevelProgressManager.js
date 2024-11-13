export class LevelProgressManager {
  static updateProgress(level, stats) {
    const savedProgress = JSON.parse(localStorage.getItem('levelProgress') || '{}');
    const currentProgress = savedProgress[level] || {
      highScore: 0,
      bestTime: null,
      attempts: 0,
      stars: 0
    };
    
    // Update progress
    savedProgress[level] = {
      highScore: Math.max(stats.score, currentProgress.highScore),
      bestTime: stats.time < (currentProgress.bestTime || Infinity) ? stats.time : currentProgress.bestTime,
      attempts: currentProgress.attempts + 1,
      stars: this.calculateStars(stats, level)
    };
    
    localStorage.setItem('levelProgress', JSON.stringify(savedProgress));
  }
  
  static calculateStars(stats, level) {
    const requirements = this.getLevelRequirements(level);
    let stars = 0;
    
    // Basic completion
    if (stats.score > requirements.scoreTarget * 0.5) stars++;
    // Good performance
    if (stats.score > requirements.scoreTarget) stars++;
    // Excellence
    if (stats.score > requirements.scoreTarget * 1.5 && 
        stats.multiplier >= requirements.minMultiplier) stars++;
    
    return stars;
  }
  
  static getLevelRequirements(level) {
    return {
      scoreTarget: 5000 + (level - 1) * 1000,
      timeLimit: Math.max(60 - (level - 1) * 2, 30),
      minMultiplier: Math.min(1 + Math.floor((level - 1) / 5), 5)
    };
  }
} 