import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSettings } from './Settings';
import { updatePlayerStats } from './utils/playerStats';
import AchievementNotification from './AchievementNotification';
import { Heart } from 'lucide-react';

const PopItGame = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  
  // Game state management
  const [gameState, setGameState] = useState('idle');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [countdown, setCountdown] = useState(3);
  
  // Game mechanics
  const [score, setScore] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [lives, setLives] = useState(5);
  const [targetButton, setTargetButton] = useState(null);
  const [gridShake, setGridShake] = useState(false);
  
  // Timing and stats
  const [startTime, setStartTime] = useState(null);
  const [gameTime, setGameTime] = useState(0);
  const [gameTimer, setGameTimer] = useState(null);
  const [gameSpeed, setGameSpeed] = useState(1000);
  
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

  const handleSuccess = useCallback(() => {
    const now = Date.now();
    const timeToClick = gameStats.lastClickTime ? now - gameStats.lastClickTime : 0;
    const newMultiplier = Math.min(multiplier + 0.1, 3);
    const newScore = score + Math.round(10 * multiplier);

    setGameStats(prev => ({
      ...prev,
      successfulClicks: prev.successfulClicks + 1,
      totalClicks: prev.totalClicks + 1,
      currentStreak: prev.currentStreak + 1,
      longestStreak: Math.max(prev.currentStreak + 1, prev.longestStreak),
      reactionTimes: [...prev.reactionTimes, timeToClick],
      maxMultiplier: Math.max(prev.maxMultiplier, newMultiplier),
      lastClickTime: now,
      highestCombo: Math.max(prev.highestCombo, prev.currentStreak + 1)
    }));

    setScore(newScore);
    setMultiplier(newMultiplier);
    playSound('pop');
  }, [multiplier, score, gameStats.lastClickTime, playSound]);

  const handleMiss = useCallback(() => {
    setLives(prev => prev - 1);
    setMultiplier(1);
    setGridShake(true);
    
    setGameStats(prev => ({
      ...prev,
      missedClicks: prev.missedClicks + 1,
      totalClicks: prev.totalClicks + 1,
      currentStreak: 0,
      combos: [...prev.combos, prev.currentStreak]
    }));

    playSound('miss');
    // Reset the shake and flash after animation completes
    setTimeout(() => {
      setGridShake(false);
      }, 500);
    }, [playSound]);

  const endGame = useCallback(() => {
    const endTime = Date.now();
    const finalStats = calculateFinalStats(endTime);
    
    updatePlayerStats(finalStats);
    updateLeaderboard(score);
    
    setGameState('gameOver');
    setGameOver(true);
    setShowGameOver(true); // Add this line
    playSound('gameOver');
  }, [score, calculateFinalStats, updateLeaderboard, playSound]);

  const startGame = useCallback(() => {
    if (!username) {
      setShowUsernameInput(true);
      return;
    }

    const now = Date.now();
    setGameState('countdown');
    setCountdown(3);
    setGameStarted(true);
    setScore(0);
    setMultiplier(1);
    setLives(5);
    setGameOver(false);
    setGameTime(0);
    setStartTime(now);
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
      startTime: now,
      lastClickTime: null
    });

    setTargetButton(getRandomButton());
  }, [username, getRandomButton]);

  // Handle username change
  const handleChangeUsername = useCallback(() => {
    setShowUsernameInput(true);
  }, []);

  // Countdown effect
  useEffect(() => {
    let timer;
    if (gameState === 'countdown' && countdown > 0) {
      playSound('countdown');
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (gameState === 'countdown' && countdown === 0) {
      setGameState('playing');
    }
    return () => clearTimeout(timer);
  }, [gameState, countdown, playSound]);

  // Game timer effect
  useEffect(() => {
    if (gameState !== 'playing') {
      gameTimer && clearInterval(gameTimer);
      return;
    }

    const timer = setInterval(() => {
      setGameTime(prev => prev + 1000);
    }, 1000);
    
    setGameTimer(timer);
    return () => clearInterval(timer);
  }, [gameState]);

  // Game over check effect
  useEffect(() => {
    if (lives <= 0 && gameStarted && !gameOver) {
      endGame();
    }
  }, [lives, gameStarted, gameOver, endGame]);

  // Format time for display
  const formatGameTime = useCallback((ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  return (
    <div className={`min-h-screen ${
      settings.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
    }`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header/Navigation Bar */}
        <nav className={`fixed top-0 left-0 right-0 z-50 ${
          settings.theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              {/* Left side - Username */}
              <div className="flex items-center">
                <Link 
                  to="/profile" 
                  className={`text-lg font-semibold ${
                    settings.theme === 'dark' ? 'text-purple-300 hover:text-purple-400' : 'text-purple-600 hover:text-purple-700'
                  }`}
                >
                  {username || 'Player'}
                </Link>
              </div>

              {/* Right side - Settings and About */}
              <div className="flex items-center space-x-4">
              <Link
                to="/leaderboard"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  settings.theme === 'dark' 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Leaderboard
              </Link>
                <Link
                  to="/settings"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    settings.theme === 'dark' 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Settings
                </Link>
                <Link
                  to="/about"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    settings.theme === 'dark' 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  About
                </Link>
              </div>
            </div>
          </div>
        </nav>
  
        {/* Main Game Area */}
        <div className="pt-20">
          {/* Stats Section - Moved outside and above the game grid */}
          <div className="flex justify-center mb-4">
            <div className={`bg-opacity-80 rounded-lg px-4 py-2 ${
              settings.theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex items-center gap-6">
                {/* Lives */}
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
                {/* Score */}
                <div className={`text-2xl font-bold ${
                  settings.theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
                }`}>
                  Score: {score}
                </div>
                {/* Multiplier */}
                {gameState === 'playing' && (
                  <div className={`text-lg ${
                    settings.theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
                  }`}>
                    Multiplier: x{multiplier.toFixed(1)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Game Grid Container */}
          <div 
            className={`flex justify-center items-center min-h-[60vh] relative ${
              gridShake ? 'flash-red' : ''
            }`}
          >
            {/* Countdown Overlay */}
            {gameState === 'countdown' && (
              <div className="absolute inset-0 flex items-center justify-center z-50">
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg" />
                <div className={`relative text-8xl font-bold animate-pulse ${
                  settings.theme === 'dark' ? 'text-purple-300' : 'text-purple-500'
                }`}>
                  {countdown}
                </div>
              </div>
            )}
            
            {/* Game Grid */}
            <div 
              className={`grid gap-2 w-full max-w-2xl mx-auto ${
                gridShake ? 'animate-shake' : ''
              }`}

              style={{
                gridTemplateColumns: `repeat(${settings.gridSize}, minmax(0, 1fr))`,
                aspectRatio: '1/1'
              }}
            >
              {Array.from({ length: settings.gridSize * settings.gridSize }).map((_, index) => (
                <button
                  key={index}
                  className={`aspect-square rounded-lg transition-all duration-200 ${
                    targetButton === index
                      ? settings.theme === 'dark'
                        ? 'bg-purple-500 hover:bg-purple-400'
                        : 'bg-purple-600 hover:bg-purple-500'
                      : settings.theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-white hover:bg-gray-50'
                  } ${gameState !== 'playing' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={() => {
                    if (gameState === 'playing') {
                      if (index === targetButton) {
                        handleSuccess();
                        setTargetButton(getRandomButton());
                      } else {
                        handleMiss();
                      }
                    }
                  }}
                  disabled={gameState !== 'playing'}
                />
              ))}
            </div>
          </div>
  
          {/* Game State UI */}
          {gameState === 'idle' && (
            <div className="text-center mt-8">
              <button
                onClick={startGame}
                className={`px-6 py-3 rounded-lg text-lg font-semibold ${
                  settings.theme === 'dark'
                    ? 'bg-purple-500 hover:bg-purple-400 text-white'
                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                }`}
              >
                Start Game
              </button>
            </div>
          )}
          {/* Game Over Overlay */}
          {showGameOver && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className={`p-8 rounded-lg ${
                settings.theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } shadow-xl max-w-md w-full mx-4`}>
                <h2 className="text-3xl font-bold mb-4 text-center">Game Over!</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Final Score:</span>
                    <span className="font-bold text-xl">{score}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Highest Combo:</span>
                    <span>{gameStats.highestCombo}x</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Time:</span>
                    <span>{formatGameTime(gameTime)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Accuracy:</span>
                    <span>
                      {Math.round(
                        (gameStats.successfulClicks / gameStats.totalClicks) * 100 || 0
                      )}%</span>
                    
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => {
                      setShowGameOver(false);
                      startGame();
                    }}
                    className={`px-6 py-2 rounded-lg font-semibold ${
                      settings.theme === 'dark'
                        ? 'bg-purple-500 hover:bg-purple-400 text-white'
                        : 'bg-purple-600 hover:bg-purple-500 text-white'
                    }`}
                  >
                    Play Again
                  </button>
                  <button
                    onClick={() => {
                      setShowGameOver(false);
                      navigate('/leaderboard');
                    }}
                    className={`px-6 py-2 rounded-lg font-semibold ${
                      settings.theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                  >
                    Leaderboard
                  </button>
                  <button
                    onClick={() => {
                      setShowGameOver(false);
                      setGameState('idle');
                      navigate('/');
                    }}
                    className={`px-6 py-2 rounded-lg font-semibold ${
                      settings.theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                  >
                    Return Home
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* Username Input Modal */}
        {showUsernameInput && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className={`p-6 rounded-lg ${
              settings.theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-xl max-w-md w-full mx-4`}>
              <h3 className="text-xl font-semibold mb-4">Enter Your Username</h3>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg mb-4 ${
                  settings.theme === 'dark'
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
                placeholder="Username"
                maxLength={15}
              />
              <button
                onClick={() => {
                  if (username.trim()) {
                    localStorage.setItem('username', username);
                    setShowUsernameInput(false);
                    startGame();
                  }
                }}
                className={`w-full py-2 rounded-lg font-semibold ${
                  settings.theme === 'dark'
                    ? 'bg-purple-500 hover:bg-purple-400 text-white'
                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                }`}
              >
                Start Playing
              </button>
            </div>
          </div>
        )}

        {/* Achievement Notification */}
        {newAchievement && (
          <AchievementNotification
            achievement={newAchievement}
            onClose={() => setNewAchievement(null)}
          />
        )}
      </div>
    </div>
  </div>
);
};

export default PopItGame;