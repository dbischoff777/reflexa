import { useState, useCallback } from 'react';
import { useSettings } from '../Settings';
import { usePlayer } from '../utils/PlayerContext';
import soundManager from '../sounds/sound';
import MusicGenerator from '../services/MusicGenerator';
import { updatePlayerStats } from '../utils/playerStats';
import { checkAchievementsUnlocked, ACHIEVEMENTS } from '../utils/achievements';
import { 
  SUCCESS_ANIMATIONS_BY_SIZE, 
  TRY_ANIMATIONS_BY_SIZE,
  ANIMATION_DURATIONS,
  FAILURES_BEFORE_ANIMATION_CHANGE,
} from '../constants/animations';
import { GAME_STATES } from '../PopItGame';

export const useGameHooks = () => {
  // Wake Lock state
  const [wakeLockActive, setWakeLockActive] = useState(false);

  // Music state
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Settings and player context
  const { settings } = useSettings();
  const { playerData, updatePlayerData } = usePlayer();

  // Animation states
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationPosition, setAnimationPosition] = useState({ x: 0, y: 0 });
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);

  // Game state
  const [gameState, setGameState] = useState('menu');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  // Game mechanics
  const [multiplier, setMultiplier] = useState(1);
  const [lives, setLives] = useState(5);
  const [targetButton, setTargetButton] = useState(null);
  const [gridShake, setGridShake] = useState(false);
  const [flashRed, setFlashRed] = useState(false);
  
  // Timing and stats
  const [startTime, setStartTime] = useState(null);
  const [gameTime, setGameTime] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(1);
  
  // UI states
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  // Game statistics
  const [gameStats, setGameStats] = useState({
    score: 0,
    duration: 0,
    successfulClicks: 0,
    missedClicks: 0,
    totalClicks: 0,
    longestStreak: 0,
    currentStreak: 0,
    highestCombo: 0,
    combos: [],
    reactionTimes: [],
    multiplier: 1,
    lives: 9,
    maxLives: 9,
    startTime: null,
    lastClickTime: null
  });

  // Particle effects
  const [particleEffects, setParticleEffects] = useState([]);
  const maxParticleEffects = 2;
  
  // Mascot states
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [mascotMessage, setMascotMessage] = useState('');

  // Animation states
  const [gameStep, setGameStep] = useState(1);
  const [currentSize, setCurrentSize] = useState('LARGE');
  const [currentDuration, setCurrentDuration] = useState(ANIMATION_DURATIONS.LONG);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [currentSuccessAnimation, setCurrentSuccessAnimation] = useState(SUCCESS_ANIMATIONS_BY_SIZE.LARGE[0]);
  const [currentTargetAnimation, setCurrentTargetAnimation] = useState(TRY_ANIMATIONS_BY_SIZE.LARGE[0]);
  const [maxMultiplier, setMaxMultiplier] = useState(1);

  // Level states
  const [currentLevel, setCurrentLevel] = useState(1);
  const [maxLevel, setMaxLevel] = useState(() => {
    const saved = localStorage.getItem('maxLevel');
    return saved ? parseInt(saved) : 1;
  });

  // Add timeLimit state
  const [timeLimit, setTimeLimit] = useState(60); // Default 60 seconds

  // Helper functions
  const getAnimationConfig = useCallback((step) => {
    if (step <= 3) {
      return {
        duration: ANIMATION_DURATIONS.LONG,
        sizes: ['LARGE', 'MEDIUM', 'SMALL']
      };
    } else if (step <= 6) {
      return {
        duration: ANIMATION_DURATIONS.MEDIUM,
        sizes: ['LARGE', 'MEDIUM', 'SMALL']
      };
    } else {
      return {
        duration: ANIMATION_DURATIONS.SHORT,
        sizes: ['LARGE', 'MEDIUM', 'SMALL']
      };
    }
  }, []);

  const getRandomButton = useCallback(() => {
    const totalButtons = settings.gridRows * settings.gridColumns;
    return Math.floor(Math.random() * totalButtons);
  }, [settings.gridRows, settings.gridColumns]);

  // Sound functions
  const playSound = useCallback((soundName) => {
    if (!settings.soundEnabled) return;
    soundManager.play(soundName);
  }, [settings.soundEnabled]);

  // Music controls
  const toggleMusic = useCallback(() => {
    if (!isMusicPlaying) {
      MusicGenerator.play();
      setIsMusicPlaying(true);
    } else {
      MusicGenerator.pause();
      setIsMusicPlaying(false);
    }
  }, [isMusicPlaying]);

  // Calculate final stats
  const calculateFinalStats = useCallback((endTime) => {
    const duration = Math.floor((endTime - gameStats.startTime) / 1000);
    const baseExperience = Math.floor(score / 10);
    const timeBonus = Math.floor(duration / 10);
    const multiplierBonus = Math.floor(maxMultiplier * 5);
    const experienceGained = baseExperience + timeBonus + multiplierBonus;

    const finalStats = {
      ...gameStats,
      score,
      multiplier: maxMultiplier,
      maxMultiplier,
      duration,
      gameTime,
      averageCombo: gameStats.combos.reduce((a, b) => a + b, 0) / gameStats.combos.length || 0,
      avgReactionTime: gameStats.reactionTimes.reduce((a, b) => a + b, 0) / gameStats.reactionTimes.length || 0,
      bestReactionTime: Math.min(...gameStats.reactionTimes) || 0,
      scorePerMinute: score / (duration / 60),
      lives,
      maxLives: 9,
      experienceGained
    };

    return finalStats;
  }, [gameStats, score, gameTime, lives, maxMultiplier]);

  // Update functions
  const updateLeaderboard = useCallback((newScore) => {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    const newEntry = {
      username: localStorage.getItem('username'),
      score: newScore,
      multiplier,
      timestamp: Date.now()
    };
    
    leaderboard.push(newEntry);
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard.splice(100);
    
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
  }, [multiplier]);

  const updateRecentGames = useCallback((gameStats) => {
    const recentGames = JSON.parse(localStorage.getItem('recentGames') || '[]');
    const newGame = {
      score: gameStats.score,
      multiplier: gameStats.maxMultiplier,
      duration: gameStats.duration,
      timestamp: Date.now()
    };
    
    recentGames.unshift(newGame);
    recentGames.splice(10);
    localStorage.setItem('recentGames', JSON.stringify(recentGames));
  }, []);

  // Message generators
  const getMascotMessage = useCallback((combos) => {
    const epicMessages = [
      "INCREDIBLE! 🌟✨",
      "YOU'RE ON FIRE! 🔥",
      "UNSTOPPABLE! ⚡",
      "LEGENDARY! 👑",
      "PHENOMENAL! 🌈",
      "MIND-BLOWING! 💫",
      "SPECTACULAR! ⭐",
      "EXTRAORDINARY! 🎯",
      "MAGNIFICENT! 🌠",
      "PHENOMENAL! 🎪"
    ];
  
    const ultraMessages = [
      "COSMIC POWER! 🌌✨",
      "DIVINE COMBO! 🔮💫",
      "TRANSCENDENT! 🎇",
      "ASTRONOMICAL! 🚀",
      "SUPERNATURAL! 🌟",
      "GODLIKE MOVES! ⚡👑",
      "REALITY BENDING! 🌈✨",
      "DIMENSION BREAKER! 💫",
      "BEYOND EPIC! 🎭",
      "CELESTIAL MASTERY! 🌠"
    ];
  
    const supremeMessages = [
      "UNIVERSAL DOMINATION! 🌍✨",
      "INFINITE POWER! 💫⚡",
      "COSMIC OVERLORD! ��👑",
      "REALITY SHAPER! 🎇✨",
      "OMNIPOTENT! 🔮💫",
      "BEYOND LEGENDARY! 🎪✨",
      "ABSOLUTE PERFECTION! 💯",
      "QUANTUM MASTERY! 🚀",
      "ETHEREAL BRILLIANCE! 🌟",
      "TRANSCENDENT BEING! 🎭"
    ];
  
    const greatMessages = [
      "Awesome combo! 🎯",
      "Spectacular! ⭐",
      "Brilliant moves! 💫",
      "You're crushing it! 💪",
      "Outstanding! 🌟",
      "Fantastic work! 🎨"
    ];
  
    const goodMessages = [
      "Keep it up! 🎯",
      "You're doing great! 🌟",
      "Nice rhythm! 🎵",
      "That's the spirit! ✨",
      "Getting better! 🎯",
      "Keep going! 💫"
    ];
  
    const startingMessages = [
      "Good job! 😊",
      "Nice one! 👍",
      "You got this! ⭐",
      "Keep playing! 🎮",
      "Having fun! 🎪",
      "That's it! 💫"
    ];
  
    const rareMessages = [
      "COSMIC COMBO! 🌌",
      "ABSOLUTELY RADICAL! 🎸",
      "SPECTACULAR MOVES! 🌠",
      "DIMENSIONAL SHIFT! 🎇",
      "REALITY WARPING! 🌈",
      "TIME BENDER! ⌛"
    ];
  
    const milestoneMessages = {
      15: "NEW RECORD! 🏆",
      20: "GODLIKE! ⚡👑⚡",
      25: "BEYOND LEGENDARY! 🌈✨",
      30: "COSMIC ACHIEVEMENT! 🌌",
      40: "IMPOSSIBLE FEAT! 💫",
      50: "ULTIMATE MASTER! 👑🎪"
    };
  
    const comboSpecificMessages = {
      5: "High Five! 🖐️",
      7: "Lucky Seven! 🎲",
      10: "Perfect Ten! 💯",
      12: "Dozen of Glory! 🌟",
      15: "Fantastic Fifteen! 🎯",
      20: "Twenty Terror! 🔥",
      25: "Quarter Century! 💫",
      30: "Thirty Thunder! ⚡",
      40: "Forty Phenomenon! 🌈",
      50: "Fifty Frenzy! 🎪"
    };
  
    const getRandomMessage = (arr) => arr[Math.floor(Math.random() * arr.length)];
  
    // Check milestones first
    if (milestoneMessages[combos]) {
      return milestoneMessages[combos];
    }
  
    // Check combo-specific messages
    if (comboSpecificMessages[combos]) {
      return comboSpecificMessages[combos];
    }
  
    // Check for rare messages (10% chance for high combos)
    if (combos >= 7 && Math.random() < 0.1) {
      return getRandomMessage(rareMessages);
    }
  
    // Regular combo messages with extended tiers
    if (combos >= 30) return getRandomMessage(supremeMessages);
    if (combos >= 20) return getRandomMessage(ultraMessages);
    if (combos >= 10) return getRandomMessage(epicMessages);
    if (combos >= 7) return getRandomMessage(greatMessages);
    if (combos >= 4) return getRandomMessage(goodMessages);
    return getRandomMessage(startingMessages);
  }, []);

  const getFailureMessage = useCallback(() => {
    const failureMessages = [
      // Encouraging failures
      "Oops! Try again! 💫",
      "Almost had it! 🎯",
      "So close! 💫",
      "Keep trying! 🌟",
      "You can do it! ⭐",
      "Don't give up! 💪",
  
      // Playful failures
      "Whoopsie! 🎪",
      "Aw snap! 🎭",
      "Oh no! 🙈",
      "Oopsie-daisy! 🌼",
      "Not quite! 🎯",
      "Nearly there! ✨",
  
      // Motivational failures
      "One more try! 🎮",
      "Practice makes perfect! 📝",
      "Getting better! 💫",
      "Learning in progress! 🎓",
      "Keep at it! 🌟",
      "You're improving! 📈",
  
      // Humorous failures
      "Butterfingers! 🍳",
      "Oops-a-doodle! 🐣",
      "That was sneaky! 🦊",
      "Tricky one! 🎲",
      "Plot twist! 🎬",
      "Surprise move! 🎪"
    ];
  
    // Special messages for consecutive failures (if you track them)
    const persistenceMessages = [
      "Never give up! 💪",
      "Persistence is key! 🔑",
      "You're getting closer! 🎯",
      "The next one's yours! ⭐"
    ];
  
    // Random selection with a twist
    const getRandomMessage = (arr) => arr[Math.floor(Math.random() * arr.length)];
  
    // Add this if you track consecutive failures
    if (consecutiveFailures >= 3) {
      return getRandomMessage(persistenceMessages);
    }
  
    return getRandomMessage(failureMessages);
  }, [consecutiveFailures]); // Add consecutiveFailures as dependency

  // Game control functions
  const handleGameOver = useCallback(() => {
    const endTime = Date.now();
    const finalStats = calculateFinalStats(endTime);

    updatePlayerData({
      dailyGamesPlayed: (playerData.dailyGamesPlayed || 0) + 1,
      weeklyGamesPlayed: (playerData.weeklyGamesPlayed || 0) + 1,
      dailyHighScore: Math.max(playerData.dailyHighScore || 0, finalStats.score),
      weeklyHighScore: Math.max(playerData.weeklyHighScore || 0, finalStats.score),
      dailyHighestMultiplier: Math.max(playerData.dailyHighestMultiplier || 0, finalStats.maxMultiplier),
      weeklyHighestMultiplier: Math.max(playerData.weeklyHighestMultiplier || 0, finalStats.maxMultiplier),
      totalGamesPlayed: (playerData.totalGamesPlayed || 0) + 1,
      totalScore: (playerData.totalScore || 0) + finalStats.score,
      bestScore: Math.max(playerData.bestScore || 0, finalStats.score),
      bestMultiplier: Math.max(playerData.bestMultiplier || 0, finalStats.maxMultiplier),
      totalGameTime: (playerData.totalGameTime || 0) + finalStats.duration,
      averageScore: ((playerData.averageScore || 0) * (playerData.totalGamesPlayed || 0) + finalStats.score) / ((playerData.totalGamesPlayed || 0) + 1),
      averageMultiplier: ((playerData.averageMultiplier || 0) * (playerData.totalGamesPlayed || 0) + finalStats.maxMultiplier) / ((playerData.totalGamesPlayed || 0) + 1),
    });

    const gameUIStats = {
      score: score,
      highScore: Math.max(score, finalStats.highScore || 0),
      lives: lives,
      multiplier: multiplier,
      longestStreak: gameStats.longestStreak || 0
    };
    
    setGameStats(gameUIStats);
    updatePlayerStats(finalStats);
    updateLeaderboard(finalStats.score);
    updateRecentGames(finalStats);

    const currentProgress = JSON.parse(localStorage.getItem('achievementProgress') || '{}');
    const updatedProgress = {
      ...currentProgress,
      totalScore: (currentProgress.totalScore || 0),
      highestScore: Math.max(finalStats.score, currentProgress.highestScore || 0),
      highestMultiplier: Math.max(maxMultiplier, currentProgress.highestMultiplier || 0),
    };
    localStorage.setItem('achievementProgress', JSON.stringify(updatedProgress));
    
    const unlockedAchievements = checkAchievementsUnlocked(updatedProgress);
    if (unlockedAchievements.length > 0) {
      const previouslyUnlocked = new Set(JSON.parse(localStorage.getItem('unlockedAchievements') || '[]'));
      const newlyUnlocked = unlockedAchievements.filter(id => !previouslyUnlocked.has(id));
      
      localStorage.setItem('unlockedAchievements', 
        JSON.stringify(Array.from(new Set([...previouslyUnlocked, ...unlockedAchievements])))
      );
      
      if (newlyUnlocked.length > 0) {
        const achievementDetails = Object.values(ACHIEVEMENTS)
          .flat()
          .find(achievement => achievement.id === newlyUnlocked[0]);
          
        setNewAchievement(achievementDetails);
      }
    }
    
    playSound('gameOver');
    setGameOver(true);
    setShowGameOver(true);
    setGameState('over');
  }, [
    calculateFinalStats,
    updatePlayerStats,
    updateLeaderboard,
    updateRecentGames,
    playSound,
    score,
    gameStats,
    lives,
    multiplier,
    maxMultiplier,
    updatePlayerData,
    playerData
  ]);

  const startGame = useCallback(() => {
    if (!username) {
      setShowUsernameInput(true);
      return;
    }
    
    const currentProgress = JSON.parse(localStorage.getItem('achievementProgress') || '{}');
    const updatedProgress = {
      ...currentProgress,
      gamesPlayed: (currentProgress.gamesPlayed || 0) + 1
    };

    localStorage.setItem('achievementProgress', JSON.stringify(updatedProgress));
    
    setGameStarted(true);
    setGameOver(false);
    setShowGameOver(false);

    if (settings.countdownTimer) {
      setGameState('countdown');
      setCountdown(3);
      playSound('countdown');
    } else {
      setGameState('playing');
      setTargetButton(getRandomButton());
      setStartTime(Date.now());
      playSound('trySound');
    }

    // Reset all game states
    setScore(0);
    setLives(9);
    setMultiplier(1);
    setGameSpeed(1);
    setGameStep(1);
    setCurrentSize('LARGE');
    setCurrentDuration(ANIMATION_DURATIONS.LONG);
    setConsecutiveFailures(0);
    setCurrentSuccessAnimation(SUCCESS_ANIMATIONS_BY_SIZE.LARGE[0]);
    setCurrentTargetAnimation(TRY_ANIMATIONS_BY_SIZE.LARGE[0]);
    
    setGameStats({
      score: 0,
      duration: 0,
      successfulClicks: 0,
      missedClicks: 0,
      totalClicks: 0,
      longestStreak: 0,
      currentStreak: 0,
      highestCombo: 0,
      combos: [],
      reactionTimes: [],
      maxMultiplier: 1,
      lives: 5,
      maxLives: 9,
      startTime: Date.now(),
      lastClickTime: null,
    });
  }, [
    username,
    playSound,
    settings.countdownTimer,
    getRandomButton
  ]);

  const handleExit = useCallback(() => {
    setTargetButton(null);
    setGameOver(false);
    setShowGameOver(false);
    setGameState('menu');
    setScore(0);
    setLives(5);
    setMultiplier(1);
    setGameSpeed(1);
    setParticleEffects([]);
  }, []);

  const handleButtonClick = useCallback((index) => {
    if (gameOver || !gameStarted || gameState !== 'playing') return;
  
    const now = Date.now();
    setGameStats(prev => ({
      ...prev,
      totalClicks: prev.totalClicks + 1,
      lastClickTime: now
    }));
    
    if (navigator.vibrate) {
      navigator.vibrate(150);
    }

    if (index === targetButton) {
      setIsAnimationPlaying(true);
      soundManager.stop('trySound');
      playSound('success');

      // Calculate grid position
      const col = index % settings.gridColumns;
      const row = settings.gridRows === 1 ? 0 : 
        settings.gridRows - Math.floor(index / settings.gridColumns) - 1;
      
      // Clear the current target immediately
      setTargetButton(null);

      // Update game step and animations
      setGameStep(prev => {
        const nextStep = prev >= 7 ? 4 : prev + 1; // Reset to step 4 after step 7
        const config = getAnimationConfig(nextStep);
        const stepIndex = (nextStep - 1) % 3; // 0, 1, or 2 for size selection
        
        const newSize = config.sizes[stepIndex];
        setCurrentSize(newSize);
        setCurrentDuration(config.duration);
      
        // Set new animations based on size
        const successAnims = SUCCESS_ANIMATIONS_BY_SIZE[newSize];
        const tryAnims = TRY_ANIMATIONS_BY_SIZE[newSize];
      
        setCurrentSuccessAnimation(successAnims[Math.floor(Math.random() * successAnims.length)]);
        setCurrentTargetAnimation(tryAnims[0]); // Start with first animation of new size
      
        return nextStep;
      });

      setConsecutiveFailures(0); // Reset consecutive failures on success

      // Randomly select a new success animation
      const randomAnimation = SUCCESS_ANIMATIONS_BY_SIZE[currentSize];
      setCurrentSuccessAnimation(randomAnimation[Math.floor(Math.random() * randomAnimation.length)]);

      // Set animation position
      setAnimationPosition({ row, col });
      setShowAnimation(true);

      // Update score and multiplier
      const newMultiplier = Math.min(multiplier + 1, 10);
      const newScore = score + Math.round(200 * multiplier);
      setScore(newScore);
      setMultiplier(newMultiplier);

      if (particleEffects.length < maxParticleEffects) {
        setParticleEffects(prev => [...prev, {
          id: Date.now(),
          row: row,
          col: col
        }]);
      }
  
      setGameStats(prev => ({
        ...prev,
        successfulClicks: prev.successfulClicks + 1,
        highestCombo: Math.max(prev.highestCombo, newMultiplier),
        reactionTimes: [...prev.reactionTimes, now - prev.lastClickTime]
      }));
      
      setMascotMessage(getMascotMessage(newMultiplier));
      
      // Handle animation end and new target with a delay
      setTimeout(() => {
        setShowAnimation(false);
        if (gameState === 'playing') {
          setTargetButton(getRandomButton());  // This will trigger a new timeout in the game loop
          // Add a small delay before playing the sound
          setTimeout(() => {
            playSound('trySound');
          }, 100); // 100ms delay for the sound
        }
      }, 2000);
      setIsAnimationPlaying(false);

    } else {
      playSound('miss')
      // Update consecutive failures and change animation if needed
      setConsecutiveFailures(prev => {
        const newFailures = prev + 1;
        if (newFailures >= FAILURES_BEFORE_ANIMATION_CHANGE) {
          // Change the target animation when failures threshold is reached
          const tryAnims = TRY_ANIMATIONS_BY_SIZE[currentSize];
          const currentIndex = tryAnims.indexOf(currentTargetAnimation);
          const nextIndex = (currentIndex + 1) % tryAnims.length;
          setCurrentTargetAnimation(tryAnims[nextIndex]);
          return 0; // Reset failures after changing animation
        }
        return newFailures;
      });

      // Handle incorrect
      setGameStep(1); // Reset to step 1 on failure
      setCurrentSize('LARGE');
      setCurrentDuration(ANIMATION_DURATIONS.LONG); 
      setGridShake(true);
      setFlashRed(true);
      setTimeout(() => {
        setGridShake(false);
        setFlashRed(false);
      }, 300);
      
      // Reset speed and multiplier on miss
      setGameSpeed(1);
      setLives(prev => prev - 1);
      setMultiplier(1);
      setMascotMessage(getFailureMessage());
  
      if (lives <= 1) {
        handleGameOver();
      }
    }
  }, [
    gameState,
    gameOver,
    gameStarted,
    getFailureMessage,
    getAnimationConfig,
    currentSize,
    currentTargetAnimation,
    targetButton,
    multiplier,
    score,
    lives,
    handleGameOver,
    getRandomButton,
    getMascotMessage,
    playSound,
    particleEffects.length,
    settings.gridColumns,
    settings.gridRows,
  ]);

  const renderButton = useCallback((index) => {
    const isTarget = index === targetButton;
    
    return (
      <div
        key={index}
        className="relative aspect-square w-full"
        onClick={() => handleButtonClick(index)}
        onTouchStart={(e) => {
          e.preventDefault();
          handleButtonClick(index);
        }}
      >
        {!showAnimation && !gameOver && isTarget && (
          <div className="absolute inset-0 flex items-center justify-center filter drop-shadow-lg">
            <img
              src={currentTargetAnimation}
              alt="Target Animation"
              className="w-4/5 2xs:w-[85%] xs:w-[87%] sm:w-[90%] object-contain pointer-events-none mix-blend-screen"
              draggable="false"
            />
          </div>
        )}
      </div>
    );
  }, [targetButton, showAnimation, gameOver, currentTargetAnimation, handleButtonClick]);

  const handleLevelComplete = useCallback(() => {
    if (currentLevel === maxLevel) {
      const newMaxLevel = maxLevel + 1;
      setMaxLevel(newMaxLevel);
      localStorage.setItem('maxLevel', newMaxLevel);
    }
  }, [currentLevel, maxLevel]);

  const handleLevelSelect = useCallback((level) => {
    // Input validation
    if (!level || level < 1) {
      console.warn('Invalid level selected');
      return;
    }

    // Ensure level doesn't exceed maxLevel
    if (level > maxLevel) {
      console.warn('Selected level exceeds max level');
      return;
    }

    // Update states with proper validation
    setCurrentLevel(level);
    setGameState(GAME_STATES.COUNTDOWN);
    
    // Calculate size (ensure it stays within bounds)
    const calculatedSize = Math.min(3 + Math.floor(level / 2), 8);
    setCurrentSize(calculatedSize);
    
    // Calculate time limit (ensure it stays within bounds)
    const calculatedTimeLimit = Math.max(60 - (level * 2), 30);
    setTimeLimit(calculatedTimeLimit);

    // Reset necessary game states
    setScore(0);
    setMultiplier(1);
    setLives(9);
    setGameSpeed(1);
    setGameStep(1);
    setConsecutiveFailures(0);
    
    // Reset animations to initial state
    setCurrentSuccessAnimation(SUCCESS_ANIMATIONS_BY_SIZE.LARGE[0]);
    setCurrentTargetAnimation(TRY_ANIMATIONS_BY_SIZE.LARGE[0]);
    
    // Clear any existing effects or messages
    setParticleEffects([]);
    setMascotMessage('');
    setShowAnimation(false);
  }, [maxLevel, GAME_STATES.COUNTDOWN]);

  return {
    // Game states
    wakeLockActive,
    isMusicPlaying,
    showAnimation,
    animationPosition,
    isAnimationPlaying,
    gameState,
    gameStarted,
    gameOver,
    showGameOver,
    countdown,
    score,
    highScore,
    longestStreak,
    multiplier,
    lives,
    targetButton,
    gridShake,
    flashRed,
    startTime,
    gameTime,
    gameSpeed,
    showUsernameInput,
    newAchievement,
    username,
    gameStats,
    particleEffects,
    showSpeechBubble,
    mascotMessage,
    gameStep,
    currentSize,
    currentDuration,
    consecutiveFailures,
    currentSuccessAnimation,
    currentTargetAnimation,
    maxMultiplier,
    currentLevel,
    maxLevel,
    timeLimit,

    // Setters
    setWakeLockActive,
    setIsMusicPlaying,
    setShowAnimation,
    setAnimationPosition,
    setIsAnimationPlaying,
    setGameState,
    setGameStarted,
    setGameOver,
    setShowGameOver,
    setCountdown,
    setScore,
    setHighScore,
    setLongestStreak,
    setMultiplier,
    setLives,
    setTargetButton,
    setGridShake,
    setFlashRed,
    setStartTime,
    setGameTime,
    setGameSpeed,
    setShowUsernameInput,
    setNewAchievement,
    setUsername,
    setGameStats,
    setParticleEffects,
    setShowSpeechBubble,
    setMascotMessage,
    setGameStep,
    setCurrentSize,
    setCurrentDuration,
    setConsecutiveFailures,
    setCurrentSuccessAnimation,
    setCurrentTargetAnimation,
    setMaxMultiplier,
    setCurrentLevel,
    setMaxLevel,
    setTimeLimit,

    // Functions
    getAnimationConfig,
    getRandomButton,
    playSound,
    toggleMusic,
    calculateFinalStats,
    updateLeaderboard,
    updateRecentGames,
    getMascotMessage,
    getFailureMessage,
    handleGameOver,
    startGame,
    handleExit,
    renderButton,
    handleButtonClick,
    handleLevelComplete,
    handleLevelSelect,

    // Constants
    SUCCESS_ANIMATIONS_BY_SIZE,
    TRY_ANIMATIONS_BY_SIZE,
    ANIMATION_DURATIONS,
    currentSuccessAnimation,
    currentTargetAnimation,
    currentSize,
    currentDuration,
    consecutiveFailures,
    setCurrentSuccessAnimation,
    setCurrentTargetAnimation,
    setCurrentSize,
    setCurrentDuration,
    setConsecutiveFailures,
  };
}; 