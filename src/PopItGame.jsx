import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PopItGameUI from './PopItGameUI';
import soundManager from './sounds/sound';
import { useSettings } from './Settings';
import { updatePlayerStats } from './utils/playerStats';
import { checkAchievementsUnlocked, ACHIEVEMENTS} from './achievements';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import './PopItGame.css';
import mascotImage from './images/cute-mascot.png';
import blueBowl from './images/blueBowlT.png';
import foodBowl from './images/foodBowlT.png';
import successAnimation from './animations/successAnimation-unscreen.gif';
import { useAvatar } from './hooks/useAvatar';
import { useScreenProtection } from './hooks/useScreenProtection';

const PopItGame = () => {

  // keep screen awake
  useScreenProtection();

  // Add state for wake lock status
  const [wakeLockActive, setWakeLockActive] = useState(false);

  // Initialize screen protection
  useEffect(() => {
    let wakeLock = null;

    const requestWakeLock = async () => {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            setWakeLockActive(true);
            console.log('Wake Lock is active');
        } catch (err) {
            setWakeLockActive(false);
            console.log('Wake Lock request failed:', err.message);
        }
    };

    const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            requestWakeLock();
        }
    };

    // Initial wake lock request
    requestWakeLock();

    // Re-request wake lock if page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        if (wakeLock) {
            wakeLock.release()
                .then(() => {
                    setWakeLockActive(false);
                    console.log('Wake Lock released');
                })
                .catch((err) => console.log('Error releasing Wake Lock:', err));
        }
    };
  }, []);

  const { settings } = useSettings();
  
  //avatars
  const { playerAvatar, setPlayerAvatar } = useAvatar();

  //success animation
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationPosition, setAnimationPosition] = useState({ x: 0, y: 0 });
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);

  // Game state
  const [gameState, setGameState] = useState('menu'); // menu, countdown, playing, over
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
  const BASE_INTERVAL = 1500; // Base interval in milliseconds
  
  // UI states
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  // Game statistics tracking
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
    lives: 5,
    maxLives: 5,
    startTime: null,
    lastClickTime: null
  });

  //particle variables
  const [particleEffects, setParticleEffects] = useState([]);
  const maxParticleEffects = 2; // Limit concurrent effects
  
  //mascot variables
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [mascotMessage, setMascotMessage] = useState('');


  const { screenProtection } = useSettings();

  // brightness
  const adjustBrightness = () => {
    // Try native brightness API first
    if ('screen' in navigator && 'brightness' in navigator.screen) {
      try {
        navigator.screen.brightness.set(screenProtection.brightness / 100);
      } catch (error) {
        console.log('Native brightness API not available, using CSS fallback');
      }
    }
    
    // CSS fallback for brightness
    const brightnessValue = screenProtection.brightness / 100;
    document.documentElement.style.filter = `brightness(${brightnessValue})`;
  };


  // color temperature
  const adjustColorTemperature = () => {
      const hour = new Date().getHours();
      if (hour >= 18 || hour < 6) {
        // Combine brightness and night mode filters
        const brightnessValue = screenProtection.autoBrightness 
          ? screenProtection.brightness / 100 
          : 1;
        document.documentElement.style.filter = `brightness(${brightnessValue}) sepia(0.2)`;
      } else {
        // Only apply brightness if auto-brightness is on
        if (screenProtection.autoBrightness) {
          const brightnessValue = screenProtection.brightness / 100;
          document.documentElement.style.filter = `brightness(${brightnessValue})`;
        } else {
          document.documentElement.style.filter = 'none';
        }
      }
    };

  // Effect for night mode
  useEffect(() => {
    if (screenProtection.nightMode) {
      const interval = setInterval(adjustColorTemperature, 60000); // Check every minute
      adjustColorTemperature(); // Initial check
      return () => clearInterval(interval);
    } else {
      document.documentElement.style.filter = 'none';
    }
  }, [screenProtection.nightMode]);

  // Effect for brightness
  useEffect(() => {
    if (screenProtection.autoBrightness) {
      adjustBrightness();
    }
  }, [screenProtection.autoBrightness, screenProtection.brightness, adjustBrightness]);

  // Add this initialization for tsParticles
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  // Update the PopEffect component
  const PopEffect = ({ row, col, onComplete }) => {
    // Array of vibrant colors for particles
    const particleColors = [
      // Purples
      "#9333EA", "#A855F7", "#C084FC",
      // Blues
      "#3B82F6", "#60A5FA", "#93C5FD",
      // Pinks
      "#EC4899", "#F472B6", "#F9A8D4",
      // Greens
      "#10B981", "#34D399", "#6EE7B7",
      // Oranges
      "#F59E0B", "#FBBF24", "#FCD34D",
      // Reds
      "#EF4444", "#F87171", "#FCA5A5"
    ];
  
    // Get random colors from the array
    const getRandomColors = (count = 3) => {
      const shuffled = [...particleColors].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };
  
    const options = {
      fullScreen: { enable: false },
      fpsLimit: 60,
      particles: {
        number: { value: 21 },
        color: { 
          value: getRandomColors() // Use random colors
        },
        shape: { type: "circle" },
        opacity: {
          value: 1,
          animation: {
            enable: true,
            speed: 1,
            minimumValue: 0,
            sync: false
          }
        },
        size: {
          value: 3,
          random: {
            enable: true,
            minimumValue: 2
          }
        },
        move: {
          enable: true,
          gravity: { 
            enable: true, 
            acceleration: 25
          },
          speed: 20,
          direction: "top",
          random: true,
          straight: false,
          outModes: { default: "destroy" }
        }
      },
      detectRetina: true,
      emitters: {
        direction: "top",
        life: { 
          count: 1, 
          duration: 0.05
        },
        rate: { 
          delay: 0, 
          quantity: 15
        }
      }
    };
  
    useEffect(() => {
      const timer = setTimeout(onComplete, 300);
      return () => clearTimeout(timer);
    }, [onComplete]);
  
    return (
      <div
        style={{
          position: 'absolute',
          left: `${(col * (100 / settings.gridSize))}%`,
          top: `${(row * (100 / settings.gridSize))}%`,
          width: `${100 / settings.gridSize}%`,
          height: `${100 / settings.gridSize}%`,
          pointerEvents: 'none',
          zIndex: 1000
        }}
      >
        <Particles
          id={`pop-effect-${Date.now()}`}
          init={particlesInit}
          options={options}
        />
      </div>
    );
  };
  
  //mascot speechbubble
  useEffect(() => {
    if (mascotMessage) {
      setShowSpeechBubble(true);
      const timer = setTimeout(() => {
        setShowSpeechBubble(false);
      }, 8000); // Increased to 8 seconds (from 4 seconds)
  
      return () => clearTimeout(timer);
    }
  }, [mascotMessage]);

  //playSound function
  const playSound = useCallback((soundName) => {
    if (!settings.soundEnabled) return;
    soundManager.play(soundName);
  }, [settings.soundEnabled]);

  //sync settings with SoundManager
  useEffect(() => {
    if (settings.soundEnabled !== !soundManager.isMuted()) {
      soundManager.toggleMute();
    }
  }, [settings.soundEnabled]);

  const getRandomButton = useCallback(() => {
    const totalButtons = settings.gridRows * settings.gridColumns;
    return Math.floor(Math.random() * totalButtons);
  }, [settings.gridRows, settings.gridColumns]);   

  const [maxMultiplier, setMaxMultiplier] = useState(1);

  // Update maxMultiplier whenever multiplier changes
  useEffect(() => {
      if (multiplier > maxMultiplier) {
          setMaxMultiplier(multiplier);
      }
  }, [multiplier, maxMultiplier]);

  // Calculate final stats
  const calculateFinalStats = useCallback((endTime) => {
    const duration = Math.floor((endTime - gameStats.startTime) / 1000);
    return {
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
      maxLives: 5
    };
  }, [gameStats, score, gameTime, lives, maxMultiplier]);

  // Update leaderboard
  const updateLeaderboard = useCallback((newScore) => {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    const newEntry = {
      username: localStorage.getItem('username'),
      avatar: playerAvatar,
      score: newScore,
      multiplier,
      timestamp: Date.now()
    };
    
    leaderboard.push(newEntry);
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard.splice(100);
    
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
  }, [multiplier, playerAvatar]);

  // Update recent games
  const updateRecentGames = useCallback((gameStats) => {
    const recentGames = JSON.parse(localStorage.getItem('recentGames') || '[]');
    const newGame = {
      score: gameStats.score,
      multiplier: gameStats.maxMultiplier,
      duration: gameStats.duration,
      timestamp: Date.now()
    };
    
    recentGames.unshift(newGame);
    recentGames.splice(10); // Keep only last 10 games
    localStorage.setItem('recentGames', JSON.stringify(recentGames));
  }, []);
  
  // Define getMascotMessage with useCallback
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
      "COSMIC OVERLORD! 🌌👑",
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
      "Keep it up! 👍",
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
      50: "ULTIMATE MASTER! 👑💫"
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
      "Butterfingers! 🦋",
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

  // Start game
  const startGame = useCallback(() => {
    if (!username) {
      setShowUsernameInput(true);
      return;
    }
    
    // Increment games played in achievement progress
    const currentProgress = JSON.parse(localStorage.getItem('achievementProgress') || '{}');
    const updatedProgress = {
      ...currentProgress,
      gamesPlayed: (currentProgress.gamesPlayed || 0) + 1
    };

    localStorage.setItem('achievementProgress', JSON.stringify(updatedProgress));
    setGameState('countdown');
    setGameStarted(true);
    setGameOver(false);
    setShowGameOver(false);
    setScore(0);
    setLives(5);
    setMultiplier(1);
    setGameSpeed(1); // Reset game speed
    setCountdown(3);
    
    // Reset game stats
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
      maxLives: 5,
      startTime: Date.now(),
      lastClickTime: null,
    });
  
    playSound('countdown');
  }, [username, playSound]);
  
  const handleExit = useCallback(() => {
    // Remove highlight from buttons
    setTargetButton(null);
    // Reset all game states
    setGameOver(false);
    setShowGameOver(false);
    setGameState('menu');
    setScore(0);
    setLives(5);
    setMultiplier(1);
    setGameSpeed(1);
    setParticleEffects([]);
  }, []);

  // Handle game over
  const handleGameOver = useCallback(() => {
    const endTime = Date.now();
    const finalStats = calculateFinalStats(endTime);
    
    // Create final stats for UI display
    const gameUIStats = {
        score: score,
        highScore: Math.max(score, finalStats.highScore || 0), // Use finalStats.highScore
        lives: lives,
        multiplier: multiplier,
        longestStreak: gameStats.longestStreak || 0 // Use gameStats.longestStreak
    };
    
    // Update game stats for UI
    setGameStats(gameUIStats);
    
    // Update player stats
    updatePlayerStats(finalStats);
    
    // Update leaderboard
    updateLeaderboard(finalStats.score);
    
    // Update recent games
    updateRecentGames(finalStats);

    // Update achievement progress
    const currentProgress = JSON.parse(localStorage.getItem('achievementProgress') || '{}');
    // Update progress with new stats including games played
    const updatedProgress = {
        ...currentProgress,
        totalScore: (currentProgress.totalScore || 0),
        highestScore: Math.max(finalStats.score, currentProgress.highestScore || 0),
        highestMultiplier: Math.max(maxMultiplier, currentProgress.highestMultiplier || 0),
    };
    localStorage.setItem('achievementProgress', JSON.stringify(updatedProgress));
    
    // Check for newly unlocked achievements
    const unlockedAchievements = checkAchievementsUnlocked(updatedProgress);
    if (unlockedAchievements.length > 0) {
        // Get previously unlocked achievements
        const previouslyUnlocked = new Set(JSON.parse(localStorage.getItem('unlockedAchievements') || '[]'));
        
        // Find new achievements (ones that weren't previously unlocked)
        const newlyUnlocked = unlockedAchievements.filter(id => !previouslyUnlocked.has(id));
        
        // Save all unlocked achievements
        localStorage.setItem('unlockedAchievements', 
            JSON.stringify(Array.from(new Set([...previouslyUnlocked, ...unlockedAchievements])))
        );
        
        // Show achievement notification if there are new ones
        if (newlyUnlocked.length > 0) {
            // Find the achievement details for the notification
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
    setGameOver,
    setShowGameOver,
    setGameState,
    setNewAchievement,
    score,
    gameStats,
    lives,
    multiplier,
    maxMultiplier
]);

  
  // Add useEffect to handle achievement notification display
  useEffect(() => {
    if (newAchievement) {
        // Clear achievement notification after delay
        playSound('achievement')
        const timer = setTimeout(() => {
            setNewAchievement(null);
        }, 3000); // Show for 3 seconds
        
        return () => clearTimeout(timer);
    }
  }, [newAchievement]);

  const checkAndUpdateAchievements = useCallback(() => {
    const endTime = Date.now();
    const finalStats = calculateFinalStats(endTime);
    const currentProgress = JSON.parse(localStorage.getItem('achievementProgress') || '{}');
    const updatedProgress = {
        ...currentProgress,
        totalScore: (currentProgress.totalScore || 0),
        highestScore: Math.max(finalStats.score, currentProgress.highestScore || 0),
        highestMultiplier: Math.max(maxMultiplier, currentProgress.highestMultiplier || 0),
        combos: gameStats.combos,
        reactionTimes: gameStats.reactionTimes,
        avgReactionTime: finalStats.avgReactionTime,
        bestReactionTime: finalStats.bestReactionTime
    };

    localStorage.setItem('achievementProgress', JSON.stringify(updatedProgress));

    // Check for newly unlocked achievements
    const previouslyUnlocked = new Set(JSON.parse(localStorage.getItem('unlockedAchievements') || '[]'));
    const unlockedAchievements = checkAchievementsUnlocked(updatedProgress);
    
    const newlyUnlocked = unlockedAchievements.filter(id => !previouslyUnlocked.has(id));

    if (newlyUnlocked.length > 0) {
        // Save all unlocked achievements
        localStorage.setItem('unlockedAchievements', 
            JSON.stringify([...Array.from(previouslyUnlocked), ...newlyUnlocked])
        );

        // Find achievement details for notification
        const achievementDetails = Object.values(ACHIEVEMENTS)
            .flat()
            .find(achievement => achievement.id === newlyUnlocked[0]);

        setNewAchievement(achievementDetails);
    }
}, [calculateFinalStats, gameStats.combos, gameStats.reactionTimes, maxMultiplier]);

  // Call checkAndUpdateAchievements when relevant game events occur
  useEffect(() => {
    if (gameState === 'playing') {
        checkAndUpdateAchievements();
    }
  }, [score, multiplier, gameState, checkAndUpdateAchievements]);

  // Handle button click
  const handleButtonClick = useCallback((index) => {
    if (gameOver || !gameStarted || gameState !== 'playing') return;
  
    const now = Date.now();
    setGameStats(prev => ({
      ...prev,
      totalClicks: prev.totalClicks + 1,
      lastClickTime: now
    }));
    
    if (navigator.vibrate) {
      navigator.vibrate(150); // 150ms vibration
    }

    if (index === targetButton) {
      setIsAnimationPlaying(true);
      playSound('success');

      // Calculate grid position based on index and current grid dimensions
      const col = index % settings.gridColumns;
      let row;

      // Special handling for 2x1 and 3x1 grids
      if (settings.gridRows === 1) {
        row = 0;
      } else {
        // For all other grid sizes
        row = settings.gridRows - Math.floor(index / settings.gridColumns) - 1;
      }
      
      // Clear the current target immediately
      setTargetButton(null);  // Add this line to remove current target

      // Set animation position
      setAnimationPosition({ row, col });
      setShowAnimation(true);

      /* // Hide animation after it completes
      setTimeout(() => {
        setShowAnimation(false);
      }, 2000); // Adjust timing based on your animation length */

      // Update score immediately
      const newMultiplier = Math.min(multiplier + 1, 10);
      const newScore = score + Math.round(10 * multiplier);
      setScore(newScore);
      setMultiplier(newMultiplier);

      if (particleEffects.length < maxParticleEffects) {
        setParticleEffects(prev => [...prev, {
          id: Date.now(),
          row: row,
          col: col
        }]);
      }
  
     /*  // Increase game speed with successful clicks
      const newGameSpeed = Math.min(gameSpeed + 0.15, 3.0);
      setGameSpeed(newGameSpeed); */
  
      setGameStats(prev => ({
        ...prev,
        successfulClicks: prev.successfulClicks + 1,
        highestCombo: Math.max(prev.highestCombo, newMultiplier),
        reactionTimes: [...prev.reactionTimes, now - prev.lastClickTime]
      }));
      
      //setScore(newScore);
      //setMultiplier(newMultiplier);
      setMascotMessage(getMascotMessage(newMultiplier));
      //setTargetButton(getRandomButton());
      
      // Handle animation end and new target
      setTimeout(() => {
        setShowAnimation(false);
        if (gameState === 'playing') {
          setTargetButton(getRandomButton());
        }
      }, 2000, setIsAnimationPlaying(false));

    } else {

      playSound('miss')
      // Handle incorrect 
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
    settings.gridSize,
  ]);
    
  //Update the renderButton function
  const renderButton = useCallback((index) => {
    const isTarget = index === targetButton;
    
    return (
      <div
        key={index}
        className="relative aspect-square w-full"
        onClick={() => handleButtonClick(index)}
        onTouchStart={(e) => {
          e.preventDefault(); // Prevent double-firing on some devices
          handleButtonClick(index);
        }}
      >
        {!showAnimation && (
          <>
            {/* Background Button */}
            <button
              className={`absolute inset-0 rounded-full transition-all duration-200 
                ${settings.theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-gray-200 hover:bg-gray-300'
                }`}
            />
            
            {/* Image Overlay */}
            <div 
              className={`absolute inset-0 flex items-center justify-center
                ${isTarget ? 'filter drop-shadow-lg' : ''}`}
            >
              <img
                src={isTarget ? foodBowl : blueBowl}
                alt={isTarget ? "Food Bowl" : "Blue Bowl"}
                className={`w-3/4 h-3/4 object-contain pointer-events-none
                  transition-transform duration-200
                  ${isTarget ? 'hover:scale-110' : ''}`}
              />
            </div>
          </>
        )}
      </div>
    );
  }, [targetButton, settings.theme, handleButtonClick]);
  
  // Game loop effects
  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
        playSound('countdown');
      }, 1000);
      return () => clearTimeout(timer);
    }
    
    if (gameState === 'countdown' && countdown === 0) {
      setGameState('playing');
      setTargetButton(getRandomButton());
      setStartTime(Date.now());
    }
  }, [gameState, countdown, playSound, getRandomButton]);

  // Game loop effects
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (!targetButton) return; // Add this line to prevent interval during animation

    const interval = setInterval(() => {
      // Move target to new position if not clicked in time
      setTargetButton(getRandomButton());
      
      // Reduce lives and reset multiplier on timeout
      setLives(prev => {
        if (prev <= 1) {
          handleGameOver();
          return prev;
        }
        return prev - 1;
      });
      
      setMultiplier(1);
      setGameSpeed(1); // Reset speed on timeout
    }, BASE_INTERVAL / gameSpeed); // Adjust interval based on game speed
    return () => clearInterval(interval);
  }, [gameState, gameSpeed, handleGameOver, getRandomButton, targetButton]);


  useEffect(() => {
    if (lives <= 0 && !gameOver) {
      handleGameOver();
    }
  }, [lives, gameOver, handleGameOver]);

  return (
    <PopItGameUI
      settings={settings}
      username={username}
      setShowUsernameInput={setShowUsernameInput}
      setUsername={setUsername}
      showUsernameInput={showUsernameInput}
      startTime={startTime}
      setGameTime={setGameTime}
      newAchievement={newAchievement}
      score={score}
      lives={lives}
      multiplier={multiplier}
      gameState={gameState}
      showSpeechBubble={showSpeechBubble}
      mascotMessage={mascotMessage}
      mascotImage={mascotImage}
      countdown={countdown}
      showGameOver={showGameOver}
      gameStats={gameStats}
      gridShake={gridShake}
      flashRed={flashRed}
      particleEffects={particleEffects}
      startGame={startGame}
      exitGame={handleExit}
      renderButton={renderButton}
      PopEffect={PopEffect}
      setParticleEffects={setParticleEffects}
      playerAvatar={playerAvatar}
      setPlayerAvatar={setPlayerAvatar}
      handleButtonClick={handleButtonClick}
      showAnimation={showAnimation}
      animationPosition={animationPosition}
      successAnimation={successAnimation}
      setShowAnimation={setShowAnimation}
      wakeLockActive={wakeLockActive}
    />
  );
};

export default PopItGame;  