import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useSettings } from './Settings';
import { updatePlayerStats } from './utils/playerStats';
import { checkAchievementsUnlocked, updateAchievementProgress, ACHIEVEMENTS} from './achievements';

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

  const handleSuccess = useCallback(() => {
    const now = Date.now();
    const timeToClick = gameStats.lastClickTime ? now - gameStats.lastClickTime : 0;
    const newMultiplier = Math.min(multiplier + 1, 10);
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

    // Update achievement progress in localStorage
    const currentProgress = JSON.parse(localStorage.getItem('achievementProgress') || '{}');
    const updatedProgress = {
      ...currentProgress,
      highestMultiplier: Math.max(newMultiplier, currentProgress.highestMultiplier || 0)
    };
    localStorage.setItem('achievementProgress', JSON.stringify(updatedProgress));

    // Check for multiplier achievements
    if (newMultiplier >= 2) {
      // Get previously unlocked achievements
      const previouslyUnlocked = new Set(JSON.parse(localStorage.getItem('unlockedAchievements') || '[]'));
      const multiplierAchievements = ACHIEVEMENTS.MULTIPLIER;
      
      multiplierAchievements.forEach(achievement => {
        if (newMultiplier >= achievement.requirement && !previouslyUnlocked.has(achievement.id)) {
          const newUnlocked = Array.from(new Set([...previouslyUnlocked, achievement.id]));
          localStorage.setItem('unlockedAchievements', JSON.stringify(newUnlocked));
          setNewAchievement(achievement);
        }
      });
    }

    playSound('pop');
    setTargetButton(getRandomButton());
  }, [multiplier, score, gameStats.lastClickTime, playSound, getRandomButton]);




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
    setTimeout(() => {
      setGridShake(false);
    }, 500);
  }, [playSound]);

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
    const handleButtonClick = useCallback((buttonIndex) => {
      if (!gameStarted || gameOver) return;
      
      if (buttonIndex === targetButton) {
        handleSuccess();
      } else {
        handleMiss();
      }
    }, [gameStarted, gameOver, targetButton, handleSuccess, handleMiss]);
  
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
      if (gameState === 'playing') {
        const timer = setInterval(() => {
          setGameTime(prev => prev + 1);
        }, 1000);
        setGameTimer(timer);
        return () => clearInterval(timer);
      }
    }, [gameState]);
  
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
        settings.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
      }`}>
        <div className="container mx-auto px-4 py-8">
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
  
          {/* Game Area */}
          <div className={`max-w-2xl mx-auto rounded-lg overflow-hidden ${
            gridShake ? 'flash-red' : ''
          }`}>
            {/* Stats Display */}
            <div className="flex justify-between items-center mb-4">
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
            <div className={`aspect-square grid gap-2 ${
              gridShake ? 'animate-shake' : ''
            }`} 
            style={{
              gridTemplateColumns: `repeat(${settings.gridSize}, 1fr)`
            }}>
              {Array.from({ length: settings.gridSize * settings.gridSize }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleButtonClick(index)}
                  disabled={gameState !== 'playing'}
                  className={`
                    aspect-square rounded-lg transition-all duration-100
                    ${index === targetButton && gameState === 'playing'
                      ? settings.theme === 'dark'
                        ? 'bg-purple-500 hover:bg-purple-400'
                        : 'bg-purple-600 hover:bg-purple-500'
                      : settings.theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-gray-200 hover:bg-gray-300'
                    }
                    ${gameState !== 'playing' ? 'cursor-not-allowed opacity-50' : ''}
                  `}
                />
              ))}
            </div>
            {/* Countdown Overlay - Centered over grid */}
            {gameState === 'countdown' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                <div className={`text-8xl font-bold animate-pulse ${
                  settings.theme === 'dark' 
                    ? 'text-purple-400' 
                    : 'text-purple-600'
                }`}>
                  {countdown}
                </div>
              </div>
            )}
            {/* Game State Overlays */}
            {gameState === 'menu' && (
              <div className="text-center mt-8">
                <button
                  onClick={startGame}
                  className={`px-8 py-4 rounded-lg text-xl font-bold ${
                    settings.theme === 'dark'
                      ? 'bg-purple-600 hover:bg-purple-500'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  Start Game
                </button>
              </div>
            )}
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
      </div>
    );
  };
  
export default PopItGame;  