import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import AvatarSelector from './components/avatar/AvatarSelector';

const PopItGameUI = ({
  settings,
  username,
  showUsernameInput,
  setShowUsernameInput,
  setUsername,
  score,
  lives,
  multiplier,
  gameState,
  showSpeechBubble,
  mascotMessage,
  mascotImage,
  countdown,
  showGameOver,
  gameStats,
  gridShake,
  particleEffects,
  setParticleEffects,
  startGame,
  exitGame,
  renderButton,
  PopEffect,
  playerAvatar,
  setPlayerAvatar,
  newAchievement,
  showAnimation,
  animationPosition,
  successAnimation,
  setShowAnimation
}) => {
  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem('username', username.trim());
      startGame();
    }
  };
  
  return (
      <div className={`min-h-screen w-full fixed inset-0 ${
        settings.theme === 'dark'
          ? gridShake 
            ? 'flash-red bg-gray-800 text-white'
            : 'bg-gray-800 text-white'
          : gridShake
            ? 'flash-red bg-gray-100 text-gray-900'
            : 'bg-gray-100 text-gray-900'
      }`}>
      {/* Main Container */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Game Header */}
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${
            settings.theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
          }`}>
            Fetch & Feast
          </h1>
          <p className={`text-lg ${
            settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Fetch as many treats as you can!
          </p>
          
          {/* Navigation Links */}
          <div className="flex justify-center gap-4 mt-4">
            <Link
              to="/profile"
              className={`px-4 py-2 rounded-lg transition-colors ${
                settings.theme === 'dark'
                  ? 'text-purple-300 hover:bg-gray-700'
                  : 'text-purple-600 hover:bg-gray-200'
              }`}
            >
              Profile
            </Link>
            <Link
              to="/leaderboard"
              className={`px-4 py-2 rounded-lg transition-colors ${
                settings.theme === 'dark'
                  ? 'text-purple-300 hover:bg-gray-700'
                  : 'text-purple-600 hover:bg-gray-200'
              }`}
            >
              Leaderboard
            </Link>
            <Link
              to="/settings"
              className={`px-4 py-2 rounded-lg transition-colors ${
                settings.theme === 'dark'
                  ? 'text-purple-300 hover:bg-gray-700'
                  : 'text-purple-600 hover:bg-gray-200'
              }`}
            >
              Settings
            </Link>
            <Link
              to="/about"
              className={`px-4 py-2 rounded-lg transition-colors ${
                settings.theme === 'dark'
                  ? 'text-purple-300 hover:bg-gray-700'
                  : 'text-purple-600 hover:bg-gray-200'
              }`}
            >
              About
            </Link>
          </div>
        </div>
  
        {/* Achievement Notification */}
        {newAchievement && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in-achievement">
            <div className={`flex items-center gap-3 p-4 rounded-lg shadow-lg ${
              settings.theme === 'dark' 
                ? 'bg-gray-700 text-white border border-purple-500' 
                : 'bg-white text-gray-900 border border-purple-300'
            }`}>
              <div className="text-2xl">🏆</div>
              <div className="flex flex-col">
                <h3 className={`font-bold ${
                  settings.theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
                }`}>
                  Achievement Unlocked!
                </h3>
                <p className="font-medium">{newAchievement.title}</p>
                <p className={`text-sm ${
                  settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {newAchievement.description}
                </p>
              </div>
            </div>
          </div>
        )}
  
        {/* Game Area Container */}
        {gameState !== 'menu' ? (
          <div className="w-full flex flex-col items-center justify-center">
            {/* Mascot Container */}
            <div className="w-full flex justify-center mb-8 mt-4">
              <div className={`mascot-container relative px-8 ${
                settings.theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
              }`}>
                {showSpeechBubble && mascotMessage && (
                  <div className={`speech-bubble absolute left-1/2 -translate-x-1/2 -top-20 ${
                    settings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  } p-3 rounded-lg shadow-lg max-w-[200px] text-sm z-10 whitespace-normal`}>
                    {mascotMessage}
                  </div>
                )}
                <img 
                  src={mascotImage}
                  alt="Game Mascot"
                  className="w-32 h-32 object-contain animate-bounce relative z-0"
                />
              </div>
            </div>

            {/* Countdown Overlay */}
            {gameState === 'countdown' && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[1000]">
                <div className={`text-6xl font-bold ${
                  settings.theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                } animate-pulse`}>
                  {countdown}
                </div>
              </div>
            )}

            {/* Game Over Overlay */}
            {showGameOver && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[1000]">
                <div className={`p-8 rounded-lg text-center ${
                  settings.theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <h2 className={`text-4xl font-bold mb-4 ${
                    settings.theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                  }`}>
                    Game Over!
                  </h2>
                  <div className={`mb-6 ${
                    settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <p className="text-xl mb-2">Final Score: {gameStats.score}</p>
                    <p className="text-lg">High Score: {gameStats.highScore}</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={startGame}
                      className={`w-full px-4 py-2 rounded-lg font-bold ${
                        settings.theme === 'dark'
                          ? 'bg-purple-600 hover:bg-purple-500 text-white'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                    >
                      Play Again
                    </button>
                    <Link
                      to="/profile"
                      className={`w-full px-4 py-2 rounded-lg font-bold text-center ${
                        settings.theme === 'dark'
                          ? 'bg-gray-600 hover:bg-gray-500 text-white'
                          : 'bg-gray-400 hover:bg-gray-500 text-white'
                      }`}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={exitGame}
                      className={`w-full px-4 py-2 rounded-lg font-bold ${
                        settings.theme === 'dark'
                          ? 'bg-gray-600 hover:bg-gray-500 text-white'
                          : 'bg-gray-400 hover:bg-gray-500 text-white'
                      }`}
                    >
                      Exit
                    </button>
                  </div>
                </div>
              </div>
            )}


            {/* Responsive Grid Container */}
            <div className="w-full flex justify-center px-4">
              <div className="w-full" style={{ maxWidth: 'min(95vh, 95vw, 800px)' }}>
                {/* Stats Display */}
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                  <div className="flex gap-1">
                    {Array.from({ length: lives }).map((_, i) => (
                      <Heart
                        key={i}
                        className={`w-6 h-6 ${
                          settings.theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
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
  
                {/* Square Aspect Ratio Container */}
                <div className="relative w-full pb-[100%]">
                  {/* Animation Overlay */}
                  {showAnimation && (
                    <div 
                      className="absolute pointer-events-none"
                      style={{
                        top: `${(animationPosition.row * 100) / settings.gridSize}%`,
                        left: `${(animationPosition.col * 100) / settings.gridSize}%`,
                        width: `${100 / settings.gridSize}%`,
                        height: `${100 / settings.gridSize}%`,
                        zIndex: 50
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <video
                          autoPlay
                          muted
                          playsInline  // Added for better mobile support
                          className="w-3/4 h-3/4 object-contain"  // Matched to foodBowl size
                          onEnded={() => setShowAnimation(false)}
                        >
                          <source src={successAnimation} type="video/mp4" />
                        </video>
                      </div>
                    </div>
                  )}
                  {/* Absolute Position Grid */}
                  <div 
                    className={`absolute inset-0 ${gridShake ? 'animate-shake' : ''} ${
                      settings.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                    }`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${settings.gridSize}, 1fr)`,
                      gap: '2%',
                      padding: '2%',
                    }}
                  >
                    {Array.from({ length: settings.gridSize * settings.gridSize }).map((_, index) => 
                      renderButton(index)
                    )}
                  </div>
                  {/* Particle Effects */}
                  {particleEffects.map(effect => (
                    <PopEffect
                      key={effect.id}
                      row={effect.row}
                      col={effect.col}
                      theme={settings.theme}
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
          </div>
        ) : (
          // Menu State Content
          <div className={`flex flex-col items-center justify-center gap-6 my-8 p-6 rounded-lg ${
            settings.theme === 'dark' ? 'bg-gray-700' : 'bg-white'
          }`}>
            <div className="w-256 h-256"> 
              <AvatarSelector 
                currentAvatar={playerAvatar}
                onSelect={setPlayerAvatar}
                className="w-full h-full [image-rendering:-webkit-optimize-contrast]"
              />
            </div>
            {showUsernameInput ? (
              <form onSubmit={handleUsernameSubmit} className="w-full max-w-xs">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className={`w-full px-4 py-2 rounded-lg mb-4 ${
                    settings.theme === 'dark'
                      ? 'bg-gray-600 text-white border-gray-500'
                      : 'bg-white text-gray-900 border-purple-300'
                  }`}
                  maxLength={15}
                />
                <button
                  type="submit"
                  className={`w-full py-2 px-4 rounded-lg font-semibold ${
                    settings.theme === 'dark'
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  Start Game
                </button>
              </form>
            ) : (
              <button
                onClick={startGame}
                className={`w-full max-w-xs py-2 px-4 rounded-lg font-semibold ${
                  settings.theme === 'dark'
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                Start Game
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PopItGameUI;