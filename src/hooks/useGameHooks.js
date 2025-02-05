import { useState, useCallback, useEffect, useRef } from 'react';
import { useSettings } from '../Settings';
import soundManager from '../sounds/sound';
import MusicGenerator from '../services/MusicGenerator';
import { updatePlayerStats } from '../utils/playerStats';
import { checkAchievementsUnlocked, ACHIEVEMENTS } from '../utils/achievements';
import { 
  SUCCESS_ANIMATIONS_BY_SIZE, 
  TRY_ANIMATIONS_BY_SIZE,
  FIREWORKS_BY_SIZE,
  ANIMATION_DURATIONS,
  FAILURE_OVERLAY
} from '../constants/animations';
import { GAME_STATES } from '../PopItGame';
import { LevelProgressManager } from '../services/LevelProgressManager';
import TrailElement from '../components/TrailElement';

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

const RAF_TIMESTAMP = typeof performance !== 'undefined' 
  ? () => performance.now() 
  : () => Date.now();

// Update timing constants to be in sync
const ANIMATION_WINDOW = 3000;  // Time window for clicking (3 seconds)
const FADE_DURATION = 1000;      // Duration of fade out animation
const FAILURE_INTERVAL = 10000; // Set to 10 seconds
const FAILURE_DURATION = FADE_DURATION;    // Match the fade duration

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
  // Add new state for fireworks
  const [showFireworks, setShowFireworks] = useState(false);
  const [currentFirework, setCurrentFirework] = useState(null);
  const fireworkTimerRef = useRef(null);

  // Helper function to get matching firework for current animation
  const getMatchingFirework = useCallback((tryAnimationIndex) => {
    const currentSize = 'LARGE'; // We're using LARGE size for main gameplay
    return FIREWORKS_BY_SIZE[currentSize][tryAnimationIndex];
  }, []);

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

  // 1. First define generateRandomPath
  const generateRandomPath = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Use 70% of height and 80% of width for better coverage
    const usableWidth = width * 0.8;
    const usableHeight = height * 0.7;
    
    // Center the usable area
    const offsetX = (width - usableWidth) / 2;
    const offsetY = (height - usableHeight) / 2;
    
    // Randomly choose a pattern type
    const patterns = ['topToBottom', 'bottomToTop'];
    const patternType = patterns[Math.floor(Math.random() * patterns.length)];
    
    const points = [];
    let path = '';
    
    // Shared wave parameters
    const baseAmplitude = usableWidth * 0.3; // 30% of usable width
    const numWaves = 4 //Math.floor(Math.random() * 2) + 2; // 2-3 waves
    
    switch (patternType) {
      case 'topToBottom': 
      default: {
        // Create vertical wave pattern from top to bottom
        const numPoints = 50;
        for (let i = 0; i <= numPoints; i++) {
          const progress = i / numPoints;
          const wavePhase = progress * Math.PI * 2 * numWaves;
          const yOffset = Math.sin(wavePhase) * baseAmplitude; // Apply wave to Y instead of X
          
          points.push({
            x: offsetX + (progress * usableWidth), // Straight line horizontally
            y: (offsetY + usableHeight * 0.6) + yOffset // Add wave pattern to vertical movement
          });
        }
        break;
      }
        
      case 'bottomToTop': {
        // Create vertical wave pattern from bottom to top
        const numPoints = 50;
        for (let i = 0; i <= numPoints; i++) {
          const progress = i / numPoints;
          const wavePhase = progress * Math.PI * 2 * numWaves;
          const yOffset = Math.sin(wavePhase) * baseAmplitude; // Apply wave to Y instead of X
          
          points.push({
            x: offsetX + (progress * usableWidth), // Straight line horizontally
            y: (offsetY + usableHeight * 0.6) - yOffset // Start from bottom and wave upward
          });
        }
        break;
      }
        
      /* case 'wave':
      default: {
        // Horizontal wave pattern
        const numPoints = 50; // Increase number of points for smoother waves
        for (let i = 0; i <= numPoints; i++) {
          const progress = i / numPoints;
          const wavePhase = progress * Math.PI * 2 * numWaves;
          const xOffset = Math.sin(wavePhase) * baseAmplitude;
          
          points.push({
            x: offsetX + (usableWidth * 0.5) + xOffset,
            y: offsetY + (progress * usableHeight)
          });
        }
        break;
      } */
    }
    
    // Create the path with Bezier curves for smooth waves
    path = `M ${points[0].x},${points[0].y}`;
    
    // Use cubic Bezier curves to create smooth transitions
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      
      // Calculate control points for smooth curves
      const dx = next.x - current.x;
      const dy = next.y - current.y;
      
      const cp1x = current.x + dx * 0.25;
      const cp1y = current.y + dy * 0.25;
      const cp2x = current.x + dx * 0.75;
      const cp2y = current.y + dy * 0.75;
      
      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`;
    }
    
    return path;
  }, []);

  // First define updatePathRef
  const updatePathRef = useRef();

  // Then define the ref implementation
  updatePathRef.current = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }

    startTimeRef.current = RAF_TIMESTAMP();
    setTrailElements([]);
    setCurrentPath(generateRandomPath());
    setSegmentSpeeds(generateSegmentSpeeds());
    setIsPathPaused(false);
    setCurrentProgress(0);
    
    startNewSegmentRef.current(0, 0);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }
    };
  };

  // Now create the updatePath function
  const updatePath = useCallback(() => {
    if (updatePathRef.current) {
      return updatePathRef.current();
    }
  }, []);

  // Move any hooks that depend on updatePath after its definition
  useEffect(() => {
    if (gameState === GAME_STATES.PLAYING) {
      updatePath();
    }
    
    return () => {
      setIsPathPaused(true);
      setCurrentProgress(0);
    };
  }, [gameState, updatePath]);

  // First, declare all state variables
  const [currentObjectIndex, setCurrentObjectIndex] = useState(0);
  //const [failureOverlay, setFailureOverlay] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [currentPath, setCurrentPath] = useState(generateRandomPath());
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isPathPaused, setIsPathPaused] = useState(false);
  const [animationTimer, setAnimationTimer] = useState(null);

  // Constants
  const NUM_SEGMENTS = 5;       // Number of movement segments
  const MIN_SPEED = 0.2;        // Minimum speed multiplier
  const MAX_SPEED = 0.4;        // Maximum speed multiplier

  // Each segment will move 20% of the path (1/NUM_SEGMENTS)
  const SEGMENT_PROGRESS = 1 / NUM_SEGMENTS;

  // Refs
  const startTimeRef = useRef(null);
  const animationFrameRef = useRef();
  const pauseTimerRef = useRef();
  const fadeTimerRef = useRef();
  const animateRef = useRef();
  const failureTimerRef = useRef(null);

  // Add new state for segment speeds
  const [segmentSpeeds, setSegmentSpeeds] = useState([]);

  // Add this function to generate random speeds for each segment
  const generateSegmentSpeeds = useCallback(() => {
    return Array(NUM_SEGMENTS).fill(0).map(() => 
      MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED)
    );
  }, []);

  // Add new state for debug timer
  const [debugTimer, setDebugTimer] = useState(0);

  // First define the TIMING constants
  const TIMING = {
    TOTAL_CYCLE: 20000,    // 20 seconds total cycle
    FIRST_ZOOM: 5000,      // First zoom at 5 seconds
    SECOND_OBJECT: 10000,  // Second object appears at 10 seconds
    SECOND_ZOOM: 15000,    // Second zoom at 15 seconds
    ZOOM_DURATION: 800,    // Duration of zoom effect
    CYCLE_DURATION: 20000  // Add this explicit cycle duration
  };

  // Update animateRef to use linear progress based on total time
  animateRef.current = (startTimestamp, startProgress, endProgress, segmentIndex) => {
    const now = RAF_TIMESTAMP();
    const elapsedTotal = now - startTimeRef.current;
    
    // Update debug timer
    setDebugTimer(elapsedTotal);
    
    // Check if we've exceeded the total cycle time
    if (elapsedTotal >= TIMING.CYCLE_DURATION) {
      // Reset the cycle
      startTimeRef.current = now; // Reset the start time first
      setCurrentProgress(0);
      setCurrentPath(generateRandomPath());
      setDebugTimer(0);
      
      // Reset object index and animation
      setCurrentObjectIndex(0);
      setCurrentTargetAnimation(TRY_ANIMATIONS_BY_SIZE[currentSize][0]);
      
      // Clear existing animation timer
      if (animationTimer) {
        clearTimeout(animationTimer);
        setAnimationTimer(null);
      }
      
      // Start the next cycle immediately
      requestAnimationFrame(() => {
        startObjectTimer();
        startNewSegmentRef.current(0, 0);
      });
      return;
    }

    // Calculate linear progress based on total elapsed time
    const newProgress = Math.min(elapsedTotal / TIMING.TOTAL_CYCLE, 1);
    
    setCurrentProgress(newProgress);
    
    animationFrameRef.current = requestAnimationFrame(() => 
      animateRef.current(startTimestamp, startProgress, endProgress, segmentIndex)
    );
  };

  // Add new state for fade transition
  const [isFading, setIsFading] = useState(false);
  const [previousObjectIndex, setPreviousObjectIndex] = useState(0);

  // Update startObjectTimer to include fade transitions
  const startObjectTimer = useCallback(() => {
    if (animationTimer) {
        clearTimeout(animationTimer);
    }

    // Sync with current time
    const cycleStartTime = startTimeRef.current || RAF_TIMESTAMP();
    const timeOffset = RAF_TIMESTAMP() - cycleStartTime;

    // First firework at 6.8 seconds
    const firstFirework = setTimeout(() => {
        setShowFireworks(true);
        setCurrentFirework(FIREWORKS_BY_SIZE[currentSize][0]);
        
        setTimeout(() => {
            setShowFireworks(false);
        }, 800);
    }, Math.max(0, 6800 - timeOffset));

    // First zoom occurs 5 seconds into cycle
    const firstZoom = setTimeout(() => {
        setIsPathPaused(true);
        setTimeout(() => {
            setIsPathPaused(false);
        }, TIMING.ZOOM_DURATION);
    }, Math.max(0, TIMING.FIRST_ZOOM - timeOffset));

    // Start fade transition before changing object
    const startFadeOut = setTimeout(() => {
        setIsFading(true);
        setPreviousObjectIndex(currentObjectIndex);
    }, Math.max(0, TIMING.SECOND_OBJECT - 1500)); // Start fade 1.5s before object change

    // Second object appears at 10 seconds (halfway)
    const secondObject = setTimeout(() => {
        setCurrentObjectIndex(1);
        setCurrentTargetAnimation(TRY_ANIMATIONS_BY_SIZE[currentSize][1]);
        // Remove fade after transition completes
        setTimeout(() => {
            setIsFading(false);
        }, 1500);
    }, Math.max(0, TIMING.SECOND_OBJECT - timeOffset));

    // Second firework at 12.6 seconds
    const secondFirework = setTimeout(() => {
        setShowFireworks(true);
        setCurrentFirework(FIREWORKS_BY_SIZE[currentSize][1]);
        
        setTimeout(() => {
            setShowFireworks(false);
        }, 800);
    }, Math.max(0, 12600 - timeOffset));

    // Second zoom occurs at 15 seconds
    const secondZoom = setTimeout(() => {
        setIsPathPaused(true);
        setTimeout(() => {
            setIsPathPaused(false);
        }, TIMING.ZOOM_DURATION);
    }, Math.max(0, TIMING.SECOND_ZOOM - timeOffset));

    // Reset the entire cycle after 20 seconds
    const resetTimer = setTimeout(() => {
        setIsFading(true);
        setPreviousObjectIndex(currentObjectIndex);
        
        setTimeout(() => {
            setCurrentObjectIndex(0);
            setCurrentTargetAnimation(TRY_ANIMATIONS_BY_SIZE[currentSize][0]);
            setIsFading(false);
            startObjectTimer(); // Start next cycle
        }, 1500);
    }, Math.max(0, TIMING.TOTAL_CYCLE - 1500 - timeOffset));

    setAnimationTimer(resetTimer);

    return () => {
        clearTimeout(firstFirework);
        clearTimeout(firstZoom);
        clearTimeout(startFadeOut);
        clearTimeout(secondObject);
        clearTimeout(secondFirework);
        clearTimeout(secondZoom);
        clearTimeout(resetTimer);
    };
}, [currentSize, currentObjectIndex]);

  // Ensure the failure overlay timer is reset when the game state changes
  useEffect(() => {
    if (gameState === GAME_STATES.PLAYING) {
        startObjectTimer(); // Start the timer when the game is playing
    }

    return () => {
        if (failureTimerRef.current) {
            clearTimeout(failureTimerRef.current);
        }
    };
  }, [gameState, startObjectTimer]);

  // Update handleButtonClick to avoid circular dependencies
  const handleButtonClick = useCallback(() => {
    if (gameState !== GAME_STATES.PLAYING || isFadingOut) return;

    // Clear existing timers
    if (animationTimer) {
      clearTimeout(animationTimer);
      setAnimationTimer(null);
    }
    if (fireworkTimerRef.current) {
      clearTimeout(fireworkTimerRef.current);
    }

    // Hide fireworks on click
    setShowFireworks(false);

    // Get click coordinates from the button element
    const buttonElement = buttonRef.current;
    if (!buttonElement) return;

    const rect = buttonElement.getBoundingClientRect();
    const clickPosition = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    }; 

    const currentTime = Date.now();
    const reactionTime = currentTime - startTime;
    const pointsEarned = 100 * multiplier;

    // Batch state updates
    setGameStats(prev => ({
        ...prev,
        totalClicks: prev.totalClicks + 1,
        reactionTimes: [...prev.reactionTimes, reactionTime],
        successfulClicks: prev.successfulClicks + 1,
        currentStreak: prev.currentStreak + 1,
        score: prev.score + pointsEarned
    }));

    setScore(prev => prev + pointsEarned);
    
    // Show success animation immediately
    setShowAnimation(true);
    setAnimationPosition(clickPosition);

    // Select random success animation
    const randomSuccessAnimation = SUCCESS_ANIMATIONS_BY_SIZE[currentSize][
        Math.floor(Math.random() * SUCCESS_ANIMATIONS_BY_SIZE[currentSize].length)
    ];
    setCurrentSuccessAnimation(randomSuccessAnimation);

    playSound('success');

    // Use a single timeout for transitions
    setTimeout(() => {
        setShowAnimation(false);
        const nextIndex = (currentObjectIndex + 1) % TRY_ANIMATIONS_BY_SIZE[currentSize].length;
        setCurrentObjectIndex(nextIndex);
        setCurrentTargetAnimation(TRY_ANIMATIONS_BY_SIZE[currentSize][nextIndex]);
        
        // Update button position based on the current path progress
        const newProgress = currentProgress + SEGMENT_PROGRESS; // Move forward along the path
        if (newProgress <= 1) {
            setCurrentProgress(newProgress); // Update the current progress
        } else {
            // Handle the case when the path is completed
            setCurrentProgress(0); // Reset progress or handle as needed
            // Optionally, you can call updatePath() here if you want to generate a new path
            updatePath();
        }

        // Update the button position based on the current progress
        setButtonPosition(getButtonPositionFromProgress(newProgress)); // Function to calculate position from progress

        // Only update the path here if needed
        //updatePath(); // Uncomment if you want to generate a new path after completing the current one
        playSound('trySound');

        // Start new timer after state updates are complete
        requestAnimationFrame(startObjectTimer);
    }, ANIMATION_DURATIONS.MEDIUM); // Use success animation duration

    // Update streak and multiplier
    const newStreak = gameStats.currentStreak + 1;
    if (newStreak > gameStats.longestStreak) {
        setGameStats(prev => ({ ...prev, longestStreak: newStreak }));
    }

    if (newStreak % 5 === 0) {
        setMultiplier(prev => Math.min(prev + 1, 10));
        setMascotMessage(getMascotMessage(newStreak));
    }

    setConsecutiveFailures(0);
}, [
    gameState,
    isFadingOut,
    startTime,
    multiplier,
    currentSize,
    currentObjectIndex,
    gameStats.currentStreak,
    playSound,
    getMascotMessage,
    updatePath,
    startObjectTimer,
    setShowFireworks,
    animationTimer,
    currentProgress // Add currentProgress to dependencies
]);

  const [trailElements, setTrailElements] = useState([]);
  const lastTrailTime = useRef(0);
  const TRAIL_INTERVAL = 400; // Increased to XXXms for more spacing
  const TRAIL_DURATION = 2000; // X seconds fade duration
  const MAX_TRAIL_ELEMENTS = 9; // Keep X elements max
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

  // Update the updateTrail function to use path progress
  const updateTrail = useCallback(() => {
    const currentTime = Date.now();
    
    // Only create new trail if enough time has passed
    if (currentTime - lastTrailTime.current >= TRAIL_INTERVAL) {
      setTrailElements(prevElements => {
        const newElement = {
          id: Date.now() + Math.random(),
          progress: currentProgress, // Store the current progress instead of x,y coordinates
          opacity: 1,
          timestamp: currentTime
        };
        
        const updatedElements = prevElements
          .filter(element => currentTime - element.timestamp < TRAIL_DURATION)
          .map(element => ({
            ...element,
            opacity: 1 - (currentTime - element.timestamp) / TRAIL_DURATION
          }))
          .slice(-MAX_TRAIL_ELEMENTS);

        return [...updatedElements, newElement];
      });

      lastTrailTime.current = currentTime;
    }
  }, [currentProgress]); // Add currentProgress as dependency

  // Reference to the animated button
  const buttonRef = useRef(null);

  // Set up animation frame for trail updates
  useEffect(() => {
    let animationFrameId;
    
    const animate = () => {
      if (buttonRef.current) {
        updateTrail(buttonRef.current);
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [updateTrail]);

  // Add new state for debug visualization
  const [showDebugPath, setShowDebugPath] = useState(false);

  // Update renderButton to include fade transitions
  const renderButton = useCallback(() => {
    if (gameState !== GAME_STATES.PLAYING) {
      return null;
    }   
  
    return (
      <div className="absolute inset-0">
        {/* Debug timer display */}
        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-md font-mono z-50">
          Cycle: {(debugTimer / 1000).toFixed(1)}s
        </div>

        {/* Debug visualization overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 100 }}>
          <path
            d={currentPath}
            stroke="rgba(255, 0, 0, 0.5)"
            strokeWidth="2"
            fill="none"
          />
        </svg>

        {/* Update fireworks with doubled size */}
        {showFireworks && (
          <div
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 button-animation
              ${isPathPaused ? 'scale-125 transition-transform duration-300' : ''}`}
            style={{
              offsetPath: `path("${currentPath}")`,
              offsetDistance: `${currentProgress * 100}%`,
              offsetRotate: "0deg",
              touchAction: 'none',
              willChange: 'transform',
              zIndex: 9,
              transform: `rotate(${Math.sin(Date.now() / 300) * 15}deg) scale(2)`, // Added scale(2)
              transition: isPathPaused ? 'none' : 'offset-distance 0.016s linear'
            }}
          >
            <img
              src={currentFirework}
              alt="Fireworks"
              className="w-[200px] h-[200px] xs:w-[240px] xs:h-[240px] sm:w-[280px] sm:h-[280px] object-contain pointer-events-none mix-blend-screen"
              style={{
                imageRendering: 'pixelated',
                willChange: 'transform',
                opacity: 0.8,
                filter: 'brightness(1.5)',
              }}
            />
          </div>
        )}

        {/* Existing success animation */}
        {showAnimation && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: animationPosition.x,
              top: animationPosition.y,
              zIndex: 20,
            }}
          >
            <img
              src={currentSuccessAnimation}
              alt="Success"
              className="w-[200px] h-[200px] xs:w-[240px] xs:h-[240px] sm:w-[280px] sm:h-[280px] object-contain pointer-events-none mix-blend-screen"
              style={{
                imageRendering: 'pixelated',
                willChange: 'transform',
              }}
            />
          </div>
        )}

        {/* Trail elements */}
        {gameState === GAME_STATES.PLAYING && !showAnimation && trailElements.map(element => (
          <div
            key={element.id}
            className="absolute pointer-events-none"
            style={{
              offsetPath: `path("${currentPath}")`,
              offsetDistance: `${element.progress * 96}%`,
              offsetRotate: "0deg",
              opacity: element.opacity,
              transition: 'opacity 1s ease-out',
              transformOrigin: 'center center',
              willChange: 'transform',
              transform: `translate(-50%, -50%) rotate(${getAngleAtProgress(element.progress) + 90}deg)`,
              zIndex: 5,
            }}
          >
            <TrailElement type="paw" />
          </div>
        ))}

        {/* Motion path */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <path
            d={currentPath}
            fill="none"
            stroke="transparent"
            id="motionPath"
          />
        </svg>

        {/* Button container with fade transitions */}
        <div
          ref={buttonRef}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 button-animation
            ${isPathPaused ? 'paused' : ''}`}
          style={{
            offsetPath: `path("${currentPath}")`,
            offsetDistance: `${currentProgress * 100}%`,
            offsetRotate: "0deg",
            touchAction: 'none',
            willChange: 'transform, offset-distance, opacity',
            zIndex: 10,
            transform: `rotate(${Math.sin(Date.now() / 300) * 15}deg)`,
            transition: `
              ${isPathPaused ? 'none' : 'offset-distance 0.016s linear'},
              opacity 1500ms cubic-bezier(0.4, 0, 0.2, 1)
            `
          }}
        >
          {/* Previous animation fading out */}
          {isFading && (
            <img
              src={TRY_ANIMATIONS_BY_SIZE[currentSize][previousObjectIndex]}
              alt="Previous Target"
              className="absolute w-[200px] h-[200px] xs:w-[240px] xs:h-[240px] sm:w-[280px] sm:h-[280px] object-contain pointer-events-none mix-blend-screen"
              style={{
                imageRendering: 'pixelated',
                opacity: 0,
                transition: 'opacity 1500ms cubic-bezier(0.4, 0, 0.2, 1)',
                willChange: 'opacity',
              }}
            />
          )}
          
          {/* Current animation fading in */}
          {!showAnimation && (
            <img
              src={currentTargetAnimation}
              alt="Target"
              className="w-[200px] h-[200px] xs:w-[240px] xs:h-[240px] sm:w-[280px] sm:h-[280px] object-contain pointer-events-none mix-blend-screen"
              style={{
                imageRendering: 'pixelated',
                opacity: isFading ? 0 : 1,
                transition: 'opacity 1500ms cubic-bezier(0.4, 0, 0.2, 1)',
                willChange: 'opacity, transform',
              }}
              draggable="false"
            />
          )}
        </div>

        {/* Separate failure overlay container
        {failureOverlay && !showAnimation && (
          <div
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 button-animation
              ${isPathPaused ? 'paused' : ''}
              ${isFadingOut ? 'failure-overlay-exit' : 'failure-overlay'}`}
            style={{
              offsetPath: `path("${currentPath}")`,
              offsetDistance: `${currentProgress * 100}%`,
              offsetRotate: "0deg",
              touchAction: 'none',
              willChange: 'transform',
              zIndex: 10,
              //transition: isPathPaused ? 'none' : 'offset-distance 0.016s linear',
            }}
          >
            <img
              src={FAILURE_OVERLAY.IMAGE}
              alt="Failure"
              className="w-[200px] h-[200px] xs:w-[240px] xs:h-[240px] sm:w-[280px] sm:h-[280px] object-contain pointer-events-none mix-blend-screen"
              style={{
                imageRendering: 'pixelated',
              }}
            />
          </div>
        )} */}
      </div>
    );
  }, [
    currentPath,
    currentProgress,
    isFadingOut,
    isPathPaused,
    showAnimation,
    currentTargetAnimation,
    handleButtonClick,
    showFireworks,
    currentFirework,
    showDebugPath,
    debugTimer,
    isFading,
    previousObjectIndex,
  ]);

  // Add debug toggle function
  const toggleDebugPath = useCallback(() => {
    setShowDebugPath(prev => !prev);
  }, []);

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

  // Update the game state effect
  useEffect(() => {
    let timeoutId;
    
    if (gameState === GAME_STATES.PLAYING && !animationTimer) {
      timeoutId = setTimeout(startObjectTimer, 100); // Small delay to avoid immediate updates
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (animationTimer) {
        clearTimeout(animationTimer);
        setAnimationTimer(null);
      }
    };
  }, [gameState, animationTimer, startObjectTimer]);

  // Add a cleanup effect for animations
  useEffect(() => {
    return () => {
      if (animationTimer) {
        clearTimeout(animationTimer);
        setAnimationTimer(null);
      }
    };
  }, [animationTimer]);

  // Add effect to start movement when game starts
  useEffect(() => {
    if (gameState === GAME_STATES.PLAYING) {
      updatePath();
    }
    
    return () => {
      setIsPathPaused(true);
      setCurrentProgress(0);
    };
  }, [gameState, updatePath]);

  // Prevent any clicks outside the button from affecting the animation
  const handleContainerClick = useCallback((event) => {
    const buttonElement = buttonRef.current;
    if (buttonElement && !buttonElement.contains(event.target)) {
        // Prevent any action if the click is outside the button
        return;
    }
  }, []);

  // Add event listener for clicks on the container
  useEffect(() => {
    const container = document.querySelector('.game-container');
    if (container) {
        container.addEventListener('click', handleContainerClick);
    }
    return () => {
        if (container) {
            container.removeEventListener('click', handleContainerClick);
        }
    };
  }, [handleContainerClick]);

  // Add cleanup effect for fireworks timer
  useEffect(() => {
    return () => {
      if (fireworkTimerRef.current) {
        clearTimeout(fireworkTimerRef.current);
      }
    };
  }, []);

  // Function to calculate button position based on current progress
  const getButtonPositionFromProgress = (progress) => {
    const container = document.querySelector('.game-container');
    if (!container) return { x: 0, y: 0 };

    const bounds = container.getBoundingClientRect();
    const maxWidth = bounds.width;
    const maxHeight = bounds.height;

    // Calculate the button's position based on the current progress along the path
    const x = progress * maxWidth; // Adjust this calculation based on your path logic
    const y = Math.sin(progress * Math.PI * 2) * (maxHeight / 2) + (maxHeight / 2); // Example for a wave-like path

    return { x, y };
  };

  // Add this helper function to calculate the angle at a given progress point
  const getAngleAtProgress = useCallback((progress) => {
    // Validate progress is a finite number between 0 and 1
    if (!Number.isFinite(progress) || progress < 0 || progress > 1) {
      return 0;
    }

    // Get two nearby points to calculate direction
    const delta = 0.01; // Small delta for calculating tangent
    const p1 = progress;
    const p2 = Math.min(progress + delta, 1);
    
    // Get points from SVG path
    const path = document.querySelector('#motionPath');
    if (!path) return 0;
    
    const totalLength = path.getTotalLength();
    if (!Number.isFinite(totalLength) || totalLength <= 0) return 0;
    
    try {
      const point1 = path.getPointAtLength(p1 * totalLength);
      const point2 = path.getPointAtLength(p2 * totalLength);
      
      // Validate points
      if (!point1 || !point2 || 
          !Number.isFinite(point1.x) || !Number.isFinite(point1.y) ||
          !Number.isFinite(point2.x) || !Number.isFinite(point2.y)) {
        return 0;
      }
      
      // Calculate angle between points
      const angle = Math.atan2(
        point2.y - point1.y,
        point2.x - point1.x
      ) * (180 / Math.PI);
      
      return Number.isFinite(angle) ? angle : 0;
    } catch (error) {
      console.warn('Error calculating path angle:', error);
      return 0;
    }
  }, []);

  // Add startNewSegmentRef definition
  const startNewSegmentRef = useRef();

  // Define the startNewSegment implementation
  startNewSegmentRef.current = (startProgress, segmentIndex) => {
    const now = RAF_TIMESTAMP();
    
    if (startProgress === 0) {
      startTimeRef.current = now;
    }
    
    animateRef.current(now, startProgress, 1, segmentIndex);
  };

  // Then define updatePathRef implementation
  updatePathRef.current = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }

    startTimeRef.current = RAF_TIMESTAMP();
    setTrailElements([]);
    setCurrentPath(generateRandomPath());
    setSegmentSpeeds(generateSegmentSpeeds());
    setIsPathPaused(false);
    setCurrentProgress(0);
    
    startNewSegmentRef.current(0, 0);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }
    };
  };

  // Move any hooks that depend on updatePath after its definition
  useEffect(() => {
    if (gameState === GAME_STATES.PLAYING) {
      updatePath();
    }
    
    return () => {
      setIsPathPaused(true);
      setCurrentProgress(0);
    };
  }, [gameState, updatePath]);

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
    //failureOverlay,
    isFadingOut,
    currentObjectIndex,
    showFireworks,
    currentFirework,
    showDebugPath,
    

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
    //setFailureOverlay,
    setIsFadingOut,
    setCurrentObjectIndex,
    setShowFireworks,
    setCurrentFirework,
    setShowDebugPath,

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
    startObjectTimer,
    toggleDebugPath,
  };
}; 