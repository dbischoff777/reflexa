import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PopItGameUI from './PopItGameUI';
import { useSettings } from './Settings';
import { updatePlayerStats } from './utils/playerStats';
import { checkAchievementsUnlocked, updateAchievementProgress, ACHIEVEMENTS} from './achievements';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import './PopItGame.css';
import mascotImage from './images/cute-mascot.png';


const PopItGame = () => {
  const { settings } = useSettings();
  
  // Game state
  const [gameState, setGameState] = useState('menu'); // menu, countdown, playing, over
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  
  // Game mechanics
  const [multiplier, setMultiplier] = useState(1);
  const [lives, setLives] = useState(5);
  const [targetButton, setTargetButton] = useState(null);
  const [gridShake, setGridShake] = useState(false);
  
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
    maxMultiplier: 1,
    lives: 5,
    maxLives: 5,
    startTime: null,
    lastClickTime: null
  });

  //new particle and mascot variables
  const [particleEffects, setParticleEffects] = useState([]);
  const maxParticleEffects = 2; // Limit concurrent effects
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [mascotMessage, setMascotMessage] = useState('');

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
  

  // Audio Management
  const audioEffects = useMemo(() => ({
    countdown: new Audio('/sounds/countdown.mp3'),
    pop: new Audio('/sounds/pop.mp3'),
    miss: new Audio('/sounds/miss.mp3'),
    gameOver: new Audio('/sounds/gameover.mp3')
  }), []);

  const playSound = useCallback((soundType) => {
    if (settings.soundEnabled) {
      audioEffects[soundType].currentTime = 0;
      audioEffects[soundType].play().catch(error => console.log('Audio play failed:', error));
    }
  }, [settings.soundEnabled, audioEffects]);

  // Get random button for target
  const getRandomButton = useCallback(() => {
    return Math.floor(Math.random() * (settings.gridSize * settings.gridSize));
  }, [settings.gridSize]);

  // Calculate final stats
  const calculateFinalStats = useCallback((endTime) => {
    const duration = Math.floor((endTime - gameStats.startTime) / 1000);
    return {
      ...gameStats,
      score,
      duration,
      gameTime,
      averageCombo: gameStats.combos.reduce((a, b) => a + b, 0) / gameStats.combos.length || 0,
      avgReactionTime: gameStats.reactionTimes.reduce((a, b) => a + b, 0) / gameStats.reactionTimes.length || 0,
      bestReactionTime: Math.min(...gameStats.reactionTimes) || 0,
      scorePerMinute: score / (duration / 60),
      lives,
      maxLives: 5
    };
  }, [gameStats, score, gameTime, lives]);

  // Update leaderboard
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
    leaderboard.splice(100); // Keep only top 100 scores
    
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
  }, [multiplier]);

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
    if (combos >= 8) return "AMAZING! 🌟";
    if (combos >= 5) return "Great combo! 🎯";
    if (combos >= 3) return "Keep it up! 👍";
    return "Good job! 😊";
  }, []); // No dependencies needed since it's a pure function

  // Start game
  const startGame = useCallback(() => {
    if (!username) {
      setShowUsernameInput(true);
      return;
    }
    
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
      lastClickTime: null
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
    setLives(3);
    setMultiplier(1);
    setGameSpeed(1);
    setParticleEffects([]);
  }, []);

  // Handle game over
  const handleGameOver = useCallback(() => {
      const endTime = Date.now();
      const finalStats = calculateFinalStats(endTime);
      
      // Update player stats
      updatePlayerStats(finalStats);
      
      // Update leaderboard
      updateLeaderboard(finalStats.score);
      
      // Update recent games
      updateRecentGames(finalStats);
      
      // Update achievement progress
      const currentProgress = JSON.parse(localStorage.getItem('achievementProgress') || '{}');
      const newProgress = updateAchievementProgress(finalStats, currentProgress);
      localStorage.setItem('achievementProgress', JSON.stringify(newProgress));
      
      // Check for newly unlocked achievements
      const unlockedAchievements = checkAchievementsUnlocked(newProgress);
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
    }, [calculateFinalStats, updateLeaderboard, updateRecentGames, playSound]);
  
  // Handle button click
  const handleButtonClick = useCallback((index) => {
    if (gameState !== 'playing') return;
  
    const now = Date.now();
    setGameStats(prev => ({
      ...prev,
      totalClicks: prev.totalClicks + 1,
      lastClickTime: now
    }));
  
    if (index === targetButton) {
      // Calculate grid position based on index
      const gridSize = settings.gridSize;
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      
      if (particleEffects.length < maxParticleEffects) {
        setParticleEffects(prev => [...prev, {
          id: Date.now(),
          row: row,
          col: col
        }]);
      }
  
      const newMultiplier = Math.min(multiplier + 1, 10);
      const newScore = score + Math.round(10 * multiplier);
  
      // Increase game speed with successful clicks
      const newGameSpeed = Math.min(gameSpeed + 0.15, 3.0);
      setGameSpeed(newGameSpeed);
  
      setGameStats(prev => ({
        ...prev,
        successfulClicks: prev.successfulClicks + 1,
        highestCombo: Math.max(prev.highestCombo, newMultiplier),
        reactionTimes: [...prev.reactionTimes, now - prev.lastClickTime]
      }));
  
      setScore(newScore);
      setMultiplier(newMultiplier);
      setMascotMessage(getMascotMessage(newMultiplier));
      setTargetButton(getRandomButton());
  
    } else {
      // Handle incorrect click
      setGridShake(true);
      setTimeout(() => setGridShake(false), 300);
      
      // Reset speed and multiplier on miss
      setGameSpeed(1);
      setLives(prev => prev - 1);
      setMultiplier(1);
      setMascotMessage('Oops! Try again!');
  
      if (lives <= 1) {
        handleGameOver();
      }
    }
  }, [
    gameState,
    targetButton,
    multiplier,
    score,
    lives,
    handleGameOver,
    getRandomButton,
    getMascotMessage,
    particleEffects.length,
    settings.gridSize,
    gameSpeed
  ]);
    
  //Update the renderButton function
  const renderButton = (index) => {
    const isTarget = targetButton === index;
    return (
      <div 
        key={index}
        className="relative w-full h-full p-[3%]" // Use percentage padding for consistent spacing
      >
        <div className="relative w-full h-full">
          <button
            className={`bowl-button absolute inset-0 rounded-full transition-colors duration-200 ${isTarget ? 'target' : ''}`}
            onClick={() => handleButtonClick(index)}
            disabled={!gameStarted || gameOver}
            style={{
              backgroundColor: isTarget ? '#9333ea' : 'transparent',
              background: isTarget ? 'radial-gradient(circle, #0000FF 20%, #9333ea 60%)' : 'transparent',
              border: '2px solid #9333ea',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          />
        </div>
      </div>
    );
  };
     
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

  useEffect(() => {
    if (gameState !== 'playing') return;
  
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
  }, [gameState, gameSpeed, handleGameOver, getRandomButton]);

  useEffect(() => {
    if (lives <= 0 && !gameOver) {
      handleGameOver();
    }
  }, [lives, gameOver, handleGameOver]);

  // Username input handling
  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem('username', username.trim());
      setShowUsernameInput(false);
      startGame();
    }
  };

  return (
    <PopItGameUI
      settings={settings}
      username={username}
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
      particleEffects={particleEffects}
      startGame={startGame}
      exitGame={handleExit}
      renderButton={renderButton}
      PopEffect={PopEffect}
      setParticleEffects={setParticleEffects}
    />
  );
};

  
export default PopItGame;  