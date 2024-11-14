import { useState, useCallback, useEffect, useRef } from 'react';
import { useSettings } from '../Settings';
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
import { LevelProgressManager } from '../services/LevelProgressManager';
import styles from '../styles.css';

// Add safety checks for animation constants
const getDefaultAnimations = () => {
  const defaultLargeAnimation = '/path/to/default/animation.gif'; // Replace with actual default animation path
  return {
    SUCCESS_ANIMATIONS_BY_SIZE: {
      LARGE: [defaultLargeAnimation],
      MEDIUM: [defaultLargeAnimation],
      SMALL: [defaultLargeAnimation]
    },
    TRY_ANIMATIONS_BY_SIZE: {
      LARGE: [defaultLargeAnimation],
      MEDIUM: [defaultLargeAnimation],
      SMALL: [defaultLargeAnimation]
    }
  };
};

// Add safety checks when accessing animations
const getAnimationForSize = (size, type) => {
  const animations = type === 'success' ? 
    (SUCCESS_ANIMATIONS_BY_SIZE[size] || []) : 
    (TRY_ANIMATIONS_BY_SIZE[size] || []);
  return animations.length > 0 ? animations[0] : null;
};

// Add these helper functions at the top level
const getRandomPosition = (buttonSize = 280) => {
  // Get the game container element
  const container = document.querySelector('.game-container');
  if (!container) return { x: 0, y: 0 };

  // Get container bounds
  const bounds = container.getBoundingClientRect();
  const padding = 80; // Increased padding for larger button

  // Calculate available space
  const maxWidth = bounds.width - buttonSize - (padding * 2);
  const maxHeight = bounds.height - buttonSize - (padding * 2);
  
  // Generate random position within bounds
  return {
    x: bounds.left + padding + Math.random() * maxWidth,
    y: bounds.top + padding + Math.random() * maxHeight
  };
};

export const useGameHooks = (gameState, setGameState) => {
  // Wake Lock state
  const [wakeLockActive, setWakeLockActive] = useState(false);

  // Music state
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Settings and player context
  const { settings } = useSettings();

  // Animation states
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationPosition, setAnimationPosition] = useState({ x: 0, y: 0 });
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);

  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  // Game mechanics
  const [multiplier, setMultiplier] = useState(1);
  const [lives, setLives] = useState(9);
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
  const [currentLevel, setCurrentLevel] = useState(parseInt(localStorage.getItem('currentLevel')) || 1);
  const [maxLevel, setMaxLevel] = useState(parseInt(localStorage.getItem('maxLevel')) || 1);
  const [timeLimit, setTimeLimit] = useState(60);

  // Add new state for button position
  const [buttonPosition, setButtonPosition] = useState(getRandomPosition());
  
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

  // Move these functions before calculateFinalStats
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

  // Now define calculateFinalStats after the update functions
  const calculateFinalStats = useCallback(() => {
    const gameEndTime = Date.now();
    const gameDuration = (gameEndTime - startTime) / 1000;
    const averageReactionTime = gameStats.reactionTimes.length > 0
      ? gameStats.reactionTimes.reduce((a, b) => a + b, 0) / gameStats.reactionTimes.length / 1000
      : 0;

    const finalStats = {
      score,
      duration: gameDuration,
      level: currentLevel,
      maxMultiplier: maxMultiplier,
      successfulClicks: gameStats.successfulClicks,
      missedClicks: gameStats.missedClicks,
      accuracy: gameStats.totalClicks > 0 
        ? (gameStats.successfulClicks / gameStats.totalClicks * 100).toFixed(1) 
        : 0,
      averageReactionTime: averageReactionTime.toFixed(3),
      longestStreak: gameStats.longestStreak,
      timestamp: new Date().toISOString(),
    };

    // Save to local storage
    const savedStats = JSON.parse(localStorage.getItem('gameHistory') || '[]');
    savedStats.unshift(finalStats);
    localStorage.setItem('gameHistory', JSON.stringify(savedStats.slice(0, 50)));

    // Update leaderboard and recent games
    updateLeaderboard(finalStats.score);
    updateRecentGames(finalStats);

    // Update level progress
    LevelProgressManager.updateProgress(currentLevel, {
      score: finalStats.score,
      time: finalStats.duration,
      accuracy: finalStats.accuracy,
      multiplier: finalStats.maxMultiplier
    });

    return finalStats;
  }, [
    score,
    startTime,
    currentLevel,
    maxMultiplier,
    gameStats,
    updateLeaderboard,
    updateRecentGames
  ]);

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
      "COSMIC OVERLORD! 👑",
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
      "Nice rhythm! ",
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

  // Define handleLevelComplete first
  const handleLevelComplete = useCallback(() => {
    if (currentLevel === maxLevel) {
      const newMaxLevel = maxLevel + 1;
      setMaxLevel(newMaxLevel);
      localStorage.setItem('maxLevel', newMaxLevel.toString());
    }
    
    const newLevel = currentLevel + 1;
    setCurrentLevel(newLevel);
    localStorage.setItem('currentLevel', newLevel.toString());
    
    setMascotMessage(`Level ${currentLevel} Complete! 🎉`);
  }, [currentLevel, maxLevel]);

  // Handle level selection
  const handleLevelSelect = useCallback(
    (level) => {
      if (level <= maxLevel) {
        setCurrentLevel(level);
        localStorage.setItem('currentLevel', level.toString());

        // Adjust game difficulty based on level
        const baseSpeed = 1;
        const speedIncrease = 0.1;
        setGameSpeed(baseSpeed + (level - 1) * speedIncrease);

        // Adjust time limit based on level
        const baseTime = 60;
        const timeDecrease = 2;
        setTimeLimit(Math.max(baseTime - (level - 1) * timeDecrease, 30));

        // Start the game
        setGameState(GAME_STATES.COUNTDOWN);
        setCountdown(3);
      } else {
        console.warn(`Level ${level} is locked.`);
      }
    },
    [maxLevel, setGameSpeed, setGameState, setCountdown]
  );

  // Handle game over
  const handleGameOver = useCallback(() => {
    setGameOver(true);
    setShowGameOver(true);
    playSound('gameOver');
    
    // Calculate final stats
    const finalStats = calculateFinalStats();
    setGameStats(finalStats);
    
    // Update player context with new game stats
    updatePlayerStats(finalStats);
    
    // Check if level is complete
    const requirements = LevelProgressManager.getLevelRequirements(currentLevel);
    if (score > requirements.scoreTarget) {
      handleLevelComplete();
    }
    
    setGameState(GAME_STATES.OVER);

  }, [
    score, 
    currentLevel, 
    maxMultiplier, 
    startTime, 
    handleLevelComplete,
    calculateFinalStats,
    playSound,
    updatePlayerStats
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
    
    // Safely initialize animations
    const initialSuccessAnimation = getAnimationForSize('LARGE', 'success');
    const initialTryAnimation = getAnimationForSize('LARGE', 'try');

    if (!initialSuccessAnimation || !initialTryAnimation) {
      console.error('Failed to initialize animations');
      return;
    }

    setGameStarted(true);
    setGameOver(false);
    setShowGameOver(false);

    // Initialize all game states with proper default values
    const initialGameStats = {
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
      lives: 9,
      maxLives: 9,
      startTime: Date.now(),
      lastClickTime: null,
      highScore: 0
    };

    if (settings.countdownTimer) {
      setGameState(GAME_STATES.COUNTDOWN);
      setCountdown(3);
      playSound('countdown');
    } else {
      setGameState(GAME_STATES.PLAYING);
      setButtonPosition(getRandomPosition());
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
    setCurrentDuration(ANIMATION_DURATIONS.LONG || 1000);
    setConsecutiveFailures(0);
    setCurrentSuccessAnimation(initialSuccessAnimation);
    setCurrentTargetAnimation(initialTryAnimation);
    setParticleEffects([]);
    setMascotMessage('');
    setShowAnimation(false);
    setGameStats(initialGameStats);
    setMaxMultiplier(1);
    
  }, [
    username,
    playSound,
    settings.countdownTimer,
    setGameState
  ]);

  const handleExit = useCallback(() => {
    setTargetButton(null);
    setGameOver(false);
    setShowGameOver(false);
    setGameState(GAME_STATES.MENU);
    setScore(0);
    setLives(9);
    setMultiplier(1);
    setGameSpeed(1);
    setParticleEffects([]);
    setGameStarted(false);
    setStartTime(null);
  }, [setGameState]);

  // Define handleButtonClick first
  const handleButtonClick = useCallback(() => {
    if (gameState !== GAME_STATES.PLAYING) return;
    
    const currentTime = Date.now();
    const reactionTime = currentTime - startTime;
    
    setGameStats(prev => ({
      ...prev,
      totalClicks: prev.totalClicks + 1,
      reactionTimes: [...prev.reactionTimes, reactionTime]
    }));

    playSound('success');

    const pointsEarned = 100 * multiplier;
    setScore(prev => prev + pointsEarned);
    
    setShowAnimation(true);
    setAnimationPosition(buttonPosition);

    const randomSuccessAnimation = SUCCESS_ANIMATIONS_BY_SIZE[currentSize];
    setCurrentSuccessAnimation(
      randomSuccessAnimation[Math.floor(Math.random() * randomSuccessAnimation.length)]
    );

    setTimeout(() => {
      setShowAnimation(false);
      const randomAnimation = TRY_ANIMATIONS_BY_SIZE[currentSize];
      setCurrentTargetAnimation(
        randomAnimation[Math.floor(Math.random() * randomAnimation.length)]
      );
    }, currentDuration);

    setGameStats(prev => ({
      ...prev,
      successfulClicks: prev.successfulClicks + 1,
      currentStreak: prev.currentStreak + 1,
      score: prev.score + pointsEarned
    }));

    const newStreak = gameStats.currentStreak + 1;
    if (newStreak > gameStats.longestStreak) {
      setGameStats(prev => ({ ...prev, longestStreak: newStreak }));
    }

    if (newStreak % 5 === 0) {
        setMultiplier(prev => Math.min(prev + 1, 10));
      setMascotMessage(getMascotMessage(newStreak));
    }

    setConsecutiveFailures(0);
    setButtonPosition(getRandomPosition()); // Set new position
    playSound('trySound');
  }, [
    gameState,
    startTime,
    multiplier,
    currentSize,
    currentDuration,
    gameStats.currentStreak,
    buttonPosition,
    playSound,
    getMascotMessage
  ]);

  const [pathDuration, setPathDuration] = useState(8000); // Increased to 8 seconds default

  const generateRandomPath = useCallback(() => {
    const padding = 100; // Keep away from edges
    const height = window.innerHeight;
    const width = window.innerWidth;
    
    // Define possible path types
    const pathTypes = [
      'leftToRight',
      'rightToLeft',
      'bottomLeftToTopRight',
      'bottomRightToTopLeft'
    ];
    
    const selectedPath = pathTypes[Math.floor(Math.random() * pathTypes.length)];
    let startPoint, endPoint, controlPoint;
    
    switch (selectedPath) {
      case 'leftToRight':
        startPoint = {
          x: padding,
          y: height / 2 + (Math.random() * 200 - 100) // Slight vertical variation
        };
        endPoint = {
          x: width - padding,
          y: height / 2 + (Math.random() * 200 - 100)
        };
        controlPoint = {
          x: width / 2,
          y: height / 2 + (Math.random() * 300 - 150) // More vertical variation in middle
        };
        break;
        
      case 'rightToLeft':
        startPoint = {
          x: width - padding,
          y: height / 2 + (Math.random() * 200 - 100)
        };
        endPoint = {
          x: padding,
          y: height / 2 + (Math.random() * 200 - 100)
        };
        controlPoint = {
          x: width / 2,
          y: height / 2 + (Math.random() * 300 - 150)
        };
        break;
        
      case 'bottomLeftToTopRight':
        startPoint = {
          x: padding,
          y: height - padding
        };
        endPoint = {
          x: width - padding,
          y: padding
        };
        controlPoint = {
          x: width / 2,
          y: height / 2 + (Math.random() * 200 - 100)
        };
        break;
        
      case 'bottomRightToTopLeft':
        startPoint = {
          x: width - padding,
          y: height - padding
        };
        endPoint = {
          x: padding,
          y: padding
        };
        controlPoint = {
          x: width / 2,
          y: height / 2 + (Math.random() * 200 - 100)
        };
        break;
    }
    
    // Create a quadratic bezier curve path
    return `M ${startPoint.x} ${startPoint.y} Q ${controlPoint.x} ${controlPoint.y}, ${endPoint.x} ${endPoint.y}`;
  }, []);

  const [currentPath, setCurrentPath] = useState(generateRandomPath());

  // Update path when button is clicked
  const updatePath = useCallback(() => {
    setCurrentPath(generateRandomPath());
    // Random duration between 7-9 seconds
    setPathDuration(Math.random() * 2000 + 7000);
  }, [generateRandomPath]);

  // Then define renderButton
  const renderButton = useCallback(() => {
    return (
      <div 
        className="absolute inset-0"
        onClick={handleButtonClick}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <path
            d={currentPath}
            fill="none"
            stroke="transparent"
            id="motionPath"
          />
        </svg>
        
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{
            offsetPath: `path("${currentPath}")`,
            animation: `moveAlongPath ${pathDuration}ms linear infinite`,
            touchAction: 'none',
            willChange: 'transform',
            zIndex: 10,
          }}
        >
          <button
            className="game-button relative flex items-center justify-center"
            style={{
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          >
            {!showAnimation && (
              <img
                src={currentTargetAnimation}
                alt="Target"
                className="w-[200px] h-[200px] xs:w-[240px] xs:h-[240px] sm:w-[280px] sm:h-[280px] object-contain pointer-events-none mix-blend-screen"
                style={{
                  imageRendering: 'pixelated',
                  WebkitMaskImage: '-webkit-radial-gradient(white, black)',
                  willChange: 'transform',
                }}
                draggable="false"
              />
            )}
          </button>
        </div>
      </div>
    );
  }, [
    currentPath,
    pathDuration,
    showAnimation,
    currentTargetAnimation,
    handleButtonClick
  ]);

  // Effect to set initial position
  useEffect(() => {
    if (gameState === GAME_STATES.PLAYING) {
      setButtonPosition(getRandomPosition());
    }
  }, [gameState]);

  // Add ref for container measurements
  const containerRef = useRef(null);

  // Update button position when container size changes
  useEffect(() => {
    const updatePosition = () => {
      if (gameState === GAME_STATES.PLAYING) {
        setButtonPosition(getRandomPosition());
      }
    };

    const resizeObserver = new ResizeObserver(updatePosition);
    const container = document.querySelector('.game-container');
    
    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [gameState]);

  // Game loop effects
  useEffect(() => {
    if (gameState === GAME_STATES.COUNTDOWN && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
        playSound('countdown');
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (gameState === GAME_STATES.COUNTDOWN && countdown === 0) {
      setGameState(GAME_STATES.PLAYING);
      setButtonPosition(getRandomPosition());
      setStartTime(Date.now());
      playSound('trySound');
    }
  }, [gameState, countdown, playSound, setGameState]);

  return {
    // Game states
    wakeLockActive,
    isMusicPlaying,
    showAnimation,
    animationPosition,
    isAnimationPlaying,
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
    buttonPosition,

    // Setters
    setWakeLockActive,
    setIsMusicPlaying,
    setShowAnimation,
    setAnimationPosition,
    setIsAnimationPlaying,
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
    setButtonPosition,

    // Functions
    getAnimationConfig,
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

    // Game state
    gameState,
    setGameState,
    containerRef,
  };
}; 