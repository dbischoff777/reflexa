export const initialPlayerStats = {
    basic: {
      gamesPlayed: 0,
      totalScore: 0,
      highestScore: 0,
      averageScore: 0,
      totalPlayTime: 0,
      lastPlayed: null,
      joinDate: Date.now(),
    },
    performance: {
      accuracy: 0,
      reactionTime: [],
      bestReactionTime: 0,
      avgReactionTime: 0,
      maxMultiplier: 0,
      perfectGames: 0,
    },
    session: {
      longestStreak: 0,
      highestCombo: 0,
      averageCombo: 0,
      totalClicks: 0,
      successfulClicks: 0,
      missedClicks: 0,
    },
    timeStats: {
      bestMinute: 0,
      averageGameLength: 0,
      totalSessionTime: 0,
      playStreak: 0,
      longestPlayStreak: 0,
    },
    progress: {
      achievementsEarned: 0,
      skillRating: 0,
      level: 1,
      experience: 0,
    }
  };
  
  export const getPlayerStats = () => {
    try {
      const saved = localStorage.getItem('playerStats');
      return saved ? JSON.parse(saved) : initialPlayerStats;
    } catch (error) {
      console.error('Error loading player stats:', error);
      return initialPlayerStats;
    }
  };
  
  export const updatePlayerStats = (gameData) => {
    try {
      const stats = getPlayerStats();
      const now = Date.now();
  
      // Update basic stats
      stats.basic.gamesPlayed++;
      stats.basic.totalScore += gameData.score;
      stats.basic.highestScore = Math.max(stats.basic.highestScore, gameData.score);
      stats.basic.averageScore = stats.basic.totalScore / stats.basic.gamesPlayed;
      stats.basic.totalPlayTime += gameData.duration;
      stats.basic.lastPlayed = now;
  
      // Update performance stats
      const accuracy = gameData.successfulClicks / (gameData.successfulClicks + gameData.missedClicks);
      stats.performance.accuracy = (stats.performance.accuracy * (stats.basic.gamesPlayed - 1) + accuracy) / stats.basic.gamesPlayed;
      stats.performance.reactionTime.push(gameData.avgReactionTime);
      stats.performance.bestReactionTime = Math.min(
        stats.performance.bestReactionTime || Infinity,
        gameData.bestReactionTime
      );
      stats.performance.maxMultiplier = Math.max(
        stats.performance.maxMultiplier,
        gameData.maxMultiplier
      );
      if (gameData.lives === gameData.maxLives) {
        stats.performance.perfectGames++;
      }
  
      // Update session stats
      stats.session.longestStreak = Math.max(
        stats.session.longestStreak,
        gameData.longestStreak
      );
      stats.session.highestCombo = Math.max(
        stats.session.highestCombo,
        gameData.highestCombo
      );
      stats.session.totalClicks += gameData.totalClicks;
      stats.session.successfulClicks += gameData.successfulClicks;
      stats.session.missedClicks += gameData.missedClicks;
      stats.session.averageCombo = (stats.session.averageCombo * (stats.basic.gamesPlayed - 1) + gameData.averageCombo) / stats.basic.gamesPlayed;
  
      // Update time stats
      stats.timeStats.bestMinute = Math.max(
        stats.timeStats.bestMinute,
        gameData.scorePerMinute || 0
      );
      stats.timeStats.averageGameLength = (
        stats.timeStats.averageGameLength * (stats.basic.gamesPlayed - 1) + gameData.duration
      ) / stats.basic.gamesPlayed;
      stats.timeStats.totalSessionTime += gameData.duration;
  
      // Update progress
      const xpGained = gameData.experienceGained;
      stats.progress.experience += xpGained;

      // Calculate new level
      const newLevel = Math.floor(Math.sqrt(stats.progress.experience / 100)) + 1;

      // If level increased, update level and reset experience
      if (newLevel > stats.progress.level) {
        stats.progress.level = newLevel;
        stats.progress.experience = 0;
      }

      stats.progress.skillRating = calculateSkillRating(stats);

      stats.progress.skillRating = calculateSkillRating(stats);
  
      // Save stats
      localStorage.setItem('playerStats', JSON.stringify(stats));
      return stats;
    } catch (error) {
      console.error('Error updating player stats:', error);
      return getPlayerStats();
    }
  };
  
  const calculateSkillRating = (stats) => {
    const accuracyWeight = 0.3;
    const scoreWeight = 0.3;
    const streakWeight = 0.2;
    const reactionWeight = 0.2;
  
    const accuracyScore = stats.performance.accuracy * 1000;
    const scoreScore = Math.min(stats.basic.averageScore, 1000);
    const streakScore = Math.min(stats.session.longestStreak * 10, 1000);
    const reactionScore = Math.max(0, 1000 - (stats.performance.avgReactionTime || 0));
  
    return Math.floor(
      accuracyScore * accuracyWeight +
      scoreScore * scoreWeight +
      streakScore * streakWeight +
      reactionScore * reactionWeight
    );
  };  