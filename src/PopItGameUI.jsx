import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react'; // Make sure to import your Heart icon

const PopItGameUI = ({
  settings,
  username,
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
  PopEffect
}) => {
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
  
        {/* Game Area Container */}
        <div className="flex flex-col items-center justify-center w-full">
          {/* Mascot Container */}
          <div className="w-full flex justify-center mb-8 mt-4">
            <div className={`mascot-container relative px-8 ${
              settings.theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
            }`}>
              {showSpeechBubble && mascotMessage && (
                <div className={`speech-bubble absolute left-1/2 -translate-x-1/2 -top-20 ${
                  settings.theme === 'dark' ? 'bg-gray-700' : 'bg-white'
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

          {/* Start Button Container */}
          {gameState === 'menu' && (
            <div className="fixed inset-0 flex items-center justify-center z-10">
              <button
                onClick={startGame}
                className={`px-12 py-6 rounded-xl font-bold text-2xl shadow-xl transition-all duration-200 transform hover:scale-105 ${
                  settings.theme === 'dark' 
                    ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                Start Game
              </button>
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
                    Multiplier: x{multiplier.toFixed(1)}
                  </div>
                )}
              </div>

              {/* Square Aspect Ratio Container */}
              <div className="relative w-full pb-[100%]">
                {/* Absolute Position Grid */}
                <div 
                  className={`absolute inset-0 ${gridShake ? 'animate-shake' : ''}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${settings.gridSize}, 1fr)`,
                    gap: '2%',
                    padding: '2%',
                    borderRadius: '12px',
                    transition: 'background-color 0.3s ease',
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
                <button
                  onClick={exitGame}
                  className={`flex-1 px-4 py-2 rounded-lg font-bold ${
                    settings.theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Exit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PopItGameUI;