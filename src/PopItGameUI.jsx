import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react'; // Make sure to import your Heart icon
import AvatarSelector from './components/avatar/AvatarSelector';
import PlayerAvatar from './components/avatar/PlayerAvatar';

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
}) => {
  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem('username', username.trim());
      startGame();
    }
  };
  
  return (
    <div className={`min-h-screen ${
      settings.theme === 'dark' ? 'bg-gray-800 text-white' : '',
      gridShake ? 'flash-red' : 'bg-gray-100 text-gray-900'
    }`}>
      {/* Main Container */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Game Header */}
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${
            settings.theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
          }`}>
            Reflexa
          </h1>
          <p className={`text-lg ${
            settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Test your reflexes!
          </p>
          
          {/* Navigation Links */}
          <div className="flex justify-center gap-4 mt-4">
            <Link
              to="/profile"
              className={`px-4 py-2 rounded-lg transition-colors ${
                settings.theme === 'dark'
                  ? 'text-purple-300 hover:bg-purple-900'
                  : 'text-purple-600 hover:bg-purple-100'
              }`}
            >
              Profile
            </Link>
            <Link
              to="/leaderboard"
              className={`px-4 py-2 rounded-lg transition-colors ${
                settings.theme === 'dark'
                  ? 'text-purple-300 hover:bg-purple-900'
                  : 'text-purple-600 hover:bg-purple-100'
              }`}
            >
              Leaderboard
            </Link>
            <Link
              to="/settings"
              className={`px-4 py-2 rounded-lg transition-colors ${
                settings.theme === 'dark'
                  ? 'text-purple-300 hover:bg-purple-900'
                  : 'text-purple-600 hover:bg-purple-100'
              }`}
            >
              Settings
            </Link>
            <Link
              to="/about"
              className={`px-4 py-2 rounded-lg transition-colors ${
                settings.theme === 'dark'
                  ? 'text-purple-300 hover:bg-purple-900'
                  : 'text-purple-600 hover:bg-purple-100'
              }`}
            >
              About
            </Link>
          </div>
        </div>
  
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
                      Multiplier: x {multiplier.toFixed(1)}
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
        ) : (
          // Menu State Content
          <div className="flex flex-col items-center justify-center gap-6 my-8">
            <AvatarSelector 
              currentAvatar={playerAvatar}
              onSelect={setPlayerAvatar}
            />
            {localStorage.getItem('username') ? (
              <button
                onClick={handleUsernameSubmit}
                className={`px-12 py-6 rounded-xl font-bold text-2xl shadow-xl transition-all duration-200 transform hover:scale-105 ${
                  settings.theme === 'dark' 
                    ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                Start Game
              </button>
            ) : (
              <>
                {!showUsernameInput ? (
                  <button
                    onClick={() => setShowUsernameInput(true)}
                    className={`px-12 py-6 rounded-xl font-bold text-2xl shadow-xl transition-all duration-200 transform hover:scale-105 ${
                      settings.theme === 'dark' 
                        ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    Start Game
                  </button>
                ) : (
                  <div className="w-full max-w-md mx-auto">
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (username.trim()) {
                        localStorage.setItem('username', username.trim());
                        handleUsernameSubmit(e);
                      }
                    }} className="flex flex-col gap-4">
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        className={`w-full px-4 py-2 rounded-lg border ${
                          settings.theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        maxLength={20}
                        required
                        autoFocus
                      />
                      <div className="flex gap-4">
                        <button
                          type="submit"
                          className={`flex-1 px-6 py-2 rounded-lg font-bold transition-all duration-200 ${
                            settings.theme === 'dark'
                              ? 'bg-purple-600 hover:bg-purple-500 text-white'
                              : 'bg-purple-600 hover:bg-purple-700 text-white'
                          }`}
                        >
                          Start
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowUsernameInput(false)}
                          className={`px-6 py-2 rounded-lg font-bold transition-all duration-200 ${
                            settings.theme === 'dark'
                              ? 'bg-gray-600 hover:bg-gray-500 text-white'
                              : 'bg-gray-400 hover:bg-gray-500 text-white'
                          }`}
                        >
                          Back
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
  
      {/* Countdown Overlay */}
        {gameState === 'countdown' && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className={`text-6xl font-bold ${
              settings.theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
            } animate-pulse`}>
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
            <div className="flex items-center gap-4 mb-4">
              <PlayerAvatar 
                avatarId={playerAvatar}
                username={username}
              />
              <h2 className={`text-2xl font-bold ${
                settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Game Over!
              </h2>
            </div>
            <div className={`space-y-2 mb-6 ${
              settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <p>Final Score: {score}</p>
              <p>Highest Combo: {gameStats.highestCombo}x</p>
              <p>Accuracy: {((gameStats.successfulClicks / gameStats.totalClicks) * 100 || 0).toFixed(1)}%</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={startGame}
                className={`flex-1 px-4 py-2 rounded-lg font-bold ${
                  settings.theme === 'dark'
                    ? 'bg-purple-600 hover:bg-purple-500 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                Play Again
              </button>
              <Link
                to="/profile"
                className={`px-4 py-2 rounded-lg font-bold text-center ${
                  settings.theme === 'dark'
                    ? 'bg-gray-600 hover:bg-gray-500 text-white'
                    : 'bg-gray-400 hover:bg-gray-500 text-white'
                }`}
              >
                Profile
              </Link>
              <button
                onClick={exitGame}
                className={`px-4 py-2 rounded-lg font-bold ${
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
    </div>
  );
  
  
};

export default PopItGameUI;