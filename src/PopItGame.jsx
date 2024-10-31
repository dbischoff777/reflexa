import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useSettings } from './Settings';
import { updatePlayerStats } from './utils/playerStats';
import { checkAchievementsUnlocked, updateAchievementProgress, ACHIEVEMENTS} from './achievements';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import './PopItGame.css';
import mascotImage from './images/cute-mascot.png';  // Adjust the path if needed


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
  const getMascotMessage = useCallback((multiplier) => {
    if (multiplier >= 8) return "AMAZING! 🌟";
    if (multiplier >= 5) return "Great combo! 🎯";
    if (multiplier >= 3) return "Keep it up! 👍";
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
    
    // Update the renderButton function
    const renderButton = (index) => {
      const isTarget = index === targetButton;
      const buttonSize = Math.min(100 / settings.gridSize, 8); // Limit maximum size
    
      return (
        <button
          key={index}
          className={`bowl-button ${isTarget ? 'target' : ''}`}
          onClick={() => handleButtonClick(index)}
          style={{
            width: `${buttonSize}vw`, // Use viewport width for responsive sizing
            height: `${buttonSize}vw`,
            padding: `${buttonSize * 0.1}vw`, // Proportional padding
            margin: `${buttonSize * 0.05}vw`, // Proportional margin
          }}
        />
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
      <div className={`min-h-screen ${
        settings.theme === 'dark' ? 'bg-gray-800 text-white' : '',
        gridShake ? 'flash-red' : 'bg-gray-100 text-gray-900'
      }`}>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Game Header */}
          <div className="flex justify-between items-center mb-8">
            <Link 
              to="/profile" 
              className={`text-lg font-bold ${
                settings.theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
              }`}
            >
              {username || 'Player'}
            </Link>
            <div className="flex items-center gap-4">
              <Link 
                to="/leaderboard"
                className={`${
                  settings.theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
                }`}
              >
                Leaderboard
              </Link>
              <Link 
                to="/settings"
                className={`${
                  settings.theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
                }`}
              >
                Settings
              </Link>
              <Link 
                to="/about"
                className={`${
                  settings.theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
                }`}
              >
                About
              </Link>
            </div>
          </div>
    
          {/* Game Area with Grid and Mascot */}
          <div className="relative flex justify-center mt-32">
            {/* Mascot Container - Centered above game grid */}
            <div className="absolute left-1/2 -top-32 transform -translate-x-1/2">
              <div className={`mascot-container relative ${
                settings.theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
              }`}>
                <img 
                  src={mascotImage}
                  alt="Game Mascot"
                  className="w-32 h-32 object-contain animate-bounce"
                />
                {showSpeechBubble && mascotMessage && (
                  <div className={`speech-bubble ${
                    settings.theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                  } p-3 rounded-lg shadow-lg`}>
                    {mascotMessage}
                  </div>
                )}
              </div>
            </div>
    
            {/* Start Button Container */}
            {gameState === 'menu' && (
              <div className="absolute left-1/2 top-0 transform -translate-x-1/2">
                <button
                  onClick={startGame}
                  className={`px-8 py-4 rounded-lg font-bold text-xl shadow-lg transition-all duration-200 ${
                    settings.theme === 'dark' 
                      ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  Start Game
                </button>
              </div>
            )}
    
            {/* Game Grid Container */}
            <div className="w-full max-w-[800px] px-4">
              {/* Stats Display */}
              <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <div className="flex gap-1">
                  {Array.from({ length: lives }).map((_, i) => (
                    <Heart
                      key={i}
                      className={`w-6 h-6 ${
                        settings.theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                      }`}
                      fill="currentColor"
                    />
                  ))}
                </div>
                <div className={`text-2xl font-bold ${
                  settings.theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
                }`}>
                  Score: {score}
                </div>
                {gameState === 'playing' && (
                  <div className={`text-lg ${
                    settings.theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
                  }`}>
                    Multiplier: x {multiplier.toFixed(1)}
                  </div>
                )}
              </div>

              {/* Game Grid */}
              <div 
                className={`aspect-square grid relative ${
                  gridShake ? 'animate-shake' : ''
                }`} 
                style={{
                  gridTemplateColumns: `repeat(${settings.gridSize}, 1fr)`,
                  width: '90vw',
                  maxWidth: '800px',
                  maxHeight: '400px',
                  margin: '0 auto',
                  padding: '20px',
                  borderRadius: '12px', // Added for better flash effect visibility
                  transition: 'background-color 0.3s ease', // Smooth transition for flash effect
                }}
              >
                {Array.from({ length: settings.gridSize * settings.gridSize }).map((_, index) =>
                  renderButton(index)
                )}

                {/* Particle Effects */}
                {particleEffects.map(effect => (
                  <PopEffect
                    key={effect.id}
                    row={effect.row}
                    col={effect.col}
                    onComplete={() => {
                      setParticleEffects(prev => 
                        prev.filter(e => e.id !== effect.id)
                      );
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
    
          {/* Countdown Overlay */}
          {gameState === 'countdown' && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-6xl font-bold text-purple-600 animate-pulse">
                {countdown}
              </div>
            </div>
          )}
    
          {/* Game Over Overlay */}
          {showGameOver && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className={`p-8 rounded-lg ${
                settings.theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } shadow-xl max-w-md w-full mx-4`}>
                <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
                <div className="space-y-2 mb-6">
                  <p>Final Score: {score}</p>
                  <p>Highest Combo: {gameStats.highestCombo}x</p>
                  <p>Accuracy: {((gameStats.successfulClicks / gameStats.totalClicks) * 100 || 0).toFixed(1)}%</p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={startGame}
                    className={`flex-1 px-4 py-2 rounded-lg font-bold ${
                      settings.theme === 'dark'
                        ? 'bg-purple-600 hover:bg-purple-500'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    Play Again
                  </button>
                  <Link
                    to="/profile"
                    className={`flex-1 px-4 py-2 rounded-lg font-bold text-center ${
                      settings.theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          )}
    
          {/* Username Input Modal */}
          {showUsernameInput && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className={`p-8 rounded-lg ${
                settings.theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } shadow-xl max-w-md w-full mx-4`}>
                <h2 className="text-2xl font-bold mb-4">Enter Your Username</h2>
                <form onSubmit={handleUsernameSubmit}>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg mb-4 ${
                      settings.theme === 'dark'
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-100'
                    }`}
                    placeholder="Username"
                    maxLength={20}
                    required
                  />
                  <button
                    type="submit"
                    className={`w-full px-4 py-2 rounded-lg font-bold ${
                      settings.theme === 'dark'
                        ? 'bg-purple-600 hover:bg-purple-500'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    Start Game
                  </button>
                </form>
              </div>
            </div>
          )}
    
          {/* Achievement Notification */}
          {newAchievement && (
            <div className="fixed bottom-4 right-4 animate-slide-up">
              <div className={`p-4 rounded-lg shadow-lg ${
                settings.theme === 'dark' ? 'bg-gray-700' : 'bg-white'
              }`}>
                <div className="font-bold mb-1">Achievement Unlocked!</div>
                <div>{newAchievement.title}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
    
  };
  
export default PopItGame;  