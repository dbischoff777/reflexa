// achievements.js
export const updateAchievementProgress = (stats, currentProgress) => {
  const newProgress = { ...currentProgress };
  
  // Track games played
  newProgress.gamesPlayed = (newProgress.gamesPlayed || 0) + 1;
  
  // Track total score
  newProgress.totalScore = (newProgress.totalScore || 0) + stats.score;
  
  // Track playtime (in minutes)
  newProgress.playtime = (newProgress.playtime || 0) + (stats.gameTime / 60);
  
  // Track highest single game score
  newProgress.highestScore = Math.max(
    stats.score, 
    newProgress.highestScore || 0
  );
  
  // Track highest multiplier
  newProgress.highestMultiplier = Math.max(
    stats.multiplier,
    newProgress.highestMultiplier || 0
  );
  
  // Check for perfect game (500+ points without losing lives)
  if (stats.score >= 500 && stats.livesLost === 0) {
    newProgress.perfectGames = (newProgress.perfectGames || 0) + 1;
  }
  
  // Check for speed demon (1000+ points under 2 minutes)
  if (stats.score >= 1000 && stats.gameTime < 120) {
    newProgress.speedDemons = (newProgress.speedDemons || 0) + 1;
  }
  
  return newProgress;
};

export const checkAchievementsUnlocked = (progress) => {
  const unlockedAchievements = new Set();
  
  // Check GAMES_PLAYED achievements
  ACHIEVEMENTS.GAMES_PLAYED.forEach(achievement => {
    if (progress.gamesPlayed >= achievement.target) {
      unlockedAchievements.add(achievement.id);
    }
  });
  
  // Check SCORE_SINGLE achievements
  ACHIEVEMENTS.SCORE_SINGLE.forEach(achievement => {
    if (progress.highestScore >= achievement.target) {
      unlockedAchievements.add(achievement.id);
    }
  });
  
  // Check TOTAL_SCORE achievements
  ACHIEVEMENTS.TOTAL_SCORE.forEach(achievement => {
    if (progress.totalScore >= achievement.target) {
      unlockedAchievements.add(achievement.id);
    }
  });
  
  // Check PLAYTIME achievements
  ACHIEVEMENTS.PLAYTIME.forEach(achievement => {
    if (progress.playtime >= achievement.target) {
      unlockedAchievements.add(achievement.id);
    }
  });
  
  // Check MULTIPLIER achievements
  ACHIEVEMENTS.MULTIPLIER.forEach(achievement => {
    if (progress.highestMultiplier >= achievement.target) {
      unlockedAchievements.add(achievement.id);
    }
  });
  
  // Check SPECIAL achievements
  if (progress.perfectGames > 0) {
    unlockedAchievements.add('perfect_game');
  }
  if (progress.speedDemons > 0) {
    unlockedAchievements.add('speed_demon');
  }
  
  return Array.from(unlockedAchievements);
};

export const ACHIEVEMENTS = {
    GAMES_PLAYED: [
      { id: 'games_10', target: 10, title: 'Dedicated Player', description: 'Play 10 games', icon: '🎯' },
      { id: 'games_50', target: 50, title: 'Gaming Enthusiast', description: 'Play 50 games', icon: '🏆' },
      { id: 'games_100', target: 100, title: 'Gaming Veteran', description: 'Play 100 games', icon: '👑' }
    ],
    SCORE_SINGLE: [
      { id: 'score_500', target: 500, title: 'Rising Star', description: 'Score 500 points in a single game', icon: '⭐' },
      { id: 'score_1000', target: 1000, title: 'Score Master', description: 'Score 1000 points in a single game', icon: '🌟' },
      { id: 'score_2000', target: 2000, title: 'Score Legend', description: 'Score 2000 points in a single game', icon: '💫' }
    ],
    TOTAL_SCORE: [
      { id: 'total_score_5k', target: 5000, title: 'Point Collector', description: 'Accumulate 5,000 total points', icon: '📈' },
      { id: 'total_score_10k', target: 10000, title: 'Score Hoarder', description: 'Accumulate 10,000 total points', icon: '🎯' }
    ],
    PLAYTIME: [
      { id: 'playtime_1h', target: 60, title: 'Time Flies', description: 'Play for 1 hour', icon: '⏰' },
      { id: 'playtime_3h', target: 180, title: 'Dedicated Gamer', description: 'Play for 3 hours', icon: '⌛' }
    ],
    MULTIPLIER: [
      { id: 'multiplier_2x', type: 'MULTIPLIER', requirement: 2, title: 'Double Trouble', description: 'Reach a 2x multiplier', icon: '✨' },
      { id: 'multiplier_3x', type: 'MULTIPLIER', requirement: 3, title: 'Triple Threat', description: 'Reach a 3x multiplier', icon: '🔥' }
    ],
    SPECIAL: [
      { id: 'perfect_game', target: 1, title: 'Flawless Victory', description: 'Score 500+ points without losing lives', icon: '💎' },
      { id: 'speed_demon', target: 1, title: 'Speed Demon', description: 'Score 1000+ points in under 2 minutes', icon: '⚡' }
    ]
  };
  