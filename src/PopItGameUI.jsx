import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import livesIcon from './images/lives.png';
import frenchieIcon from './images/frenchie.png';
// At the top of PopItGameUI.jsx with other imports
import scoreIcon from './images/score.png';
import AvatarSelector from './components/avatar/AvatarSelector';
import { FacebookIcon, TwitterIcon, WhatsAppIcon, LinkedInIcon } from './Icons';
import ScreenProtectionStatus from './components/ScreenProtectionStatus';

//visuals for multiplier
const ScoreMultiplier = ({ multiplier, theme }) => {
  if (multiplier <= 1) return null;

  return (
    <div className={`
      fixed top-20 left-4 z-50
      flex items-center gap-2 p-3 rounded-lg
      transform transition-all duration-300
      animate-pulse
      ${theme === 'dark' 
        ? 'bg-purple-900/80 text-purple-200' 
        : 'bg-purple-100/80 text-purple-600'}
      shadow-lg backdrop-blur-sm
    `}>
      <div className="flex items-center">
        <span className="text-2xl font-bold">×{multiplier}</span>
        <div className="ml-2">
          <svg 
            className={`w-6 h-6 ${
              theme === 'dark' ? 'text-purple-300' : 'text-purple-500'
            }`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

const PopItGameUI = ({
  settings,
  username,
  showUsernameInput,
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
  wakeLockActive,
  brightnessAdjusted,
  //onAnimationEnd
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
      }`} >
        {/* Add ScreenProtectionStatus component */}
        <ScreenProtectionStatus 
                theme={settings.theme} 
                wakeLockActive={wakeLockActive}
            />
      {/* Main Container */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Add Frenchie Image here, before the Game Header */}
        <div className="flex justify-center mb-6 pointer-events-none">
          <div className={`
            relative
            transition-all duration-300 ease-in-out
            ${gameState !== 'menu' 
              ? 'opacity-0 scale-95 h-0 mb-0' 
              : 'opacity-100 scale-100 h-32 mb-6'
            }
          `}>
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ 
                scale: [1, 1.05, 1],
                y: [0, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            >
              <img
                src={frenchieIcon}
                alt="Frenchie"
                className={`
                  w-32 h-32 
                  object-contain 
                  drop-shadow-lg
                  transition-all duration-300
                  hover:scale-110
                  ${settings.theme === 'dark' 
                    ? 'filter-none' 
                    : 'brightness-95'
                  }
                `}
                style={{ 
                  filter: `
                    ${settings.theme === 'dark' 
                      ? 'drop-shadow(0 0 8px rgba(147, 51, 234, 0.3))' 
                      : 'drop-shadow(0 0 5px rgba(107, 33, 168, 0.2))'
                    }
                  `
                }}
              />
            </motion.div>
            
            {/* Add decorative elements */}
            <div className="absolute -z-10 inset-0 flex items-center justify-center">
              <div className={`
                absolute 
                w-40 h-40 
                rounded-full 
                blur-2xl 
                opacity-20
                transition-all duration-300
                ${settings.theme === 'dark' 
                  ? 'bg-purple-500' 
                  : 'bg-purple-300'
                }
              `} />
            </div>
            
            {/* Enhanced decorative elements */}
            <div className="absolute -z-10 inset-0 flex items-center justify-center">
              <div className={`
                absolute 
                w-48 h-48 
                rounded-full 
                blur-2xl 
                opacity-20
                transition-all duration-300
                ${settings.theme === 'dark' 
                  ? 'bg-purple-500' 
                  : 'bg-purple-300'
                }
              `} />
              <div className={`
                absolute 
                w-40 h-40 
                rounded-full 
                blur-xl
                opacity-15
                animate-pulse-slow
                ${settings.theme === 'dark' 
                  ? 'bg-purple-400' 
                  : 'bg-purple-200'
                }
              `} />
            </div>
            
            {/* Enhanced floating particles */}
            <motion.div
              className="absolute inset-0"
              initial="hidden"
              animate="visible"
            >
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`
                    absolute 
                    rounded-full
                    ${settings.theme === 'dark' 
                      ? 'bg-purple-400' 
                      : 'bg-purple-500'
                    }
                  `}
                  style={{
                    width: Math.random() * 4 + 2 + 'px',
                    height: Math.random() * 4 + 2 + 'px',
                    opacity: Math.random() * 0.5 + 0.2
                  }}
                  initial={{ 
                    opacity: 0,
                    x: Math.random() * 100 - 50,
                    y: Math.random() * 100 - 50
                  }}
                  animate={{ 
                    opacity: [0, 0.5, 0],
                    x: Math.random() * 100 - 50,
                    y: Math.random() * 100 - 50,
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </motion.div>

            {/* Add sparkles */}
            <motion.div
              className="absolute inset-0"
              initial="hidden"
              animate="visible"
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={`sparkle-${i}`}
                  className={`
                    absolute 
                    w-1 h-1
                    rotate-45
                    ${settings.theme === 'dark' 
                      ? 'bg-purple-300' 
                      : 'bg-purple-400'
                    }
                  `}
                  initial={{ 
                    opacity: 0,
                    scale: 0
                  }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    rotate: [0, 90, 180]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut"
                  }}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                />
              ))}
            </motion.div>
          </div>
        </div>
        {/* Game Header */}
        <div className={`
          text-center
          transition-all duration-300 ease-in-out
          ${gameState !== 'menu' ? 'opacity-0 h-0 mb-0 overflow-hidden' : 'opacity-100 h-auto mb-8'}
        `}>
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
          <div className={`
            flex justify-center gap-4 mt-4
            transition-all duration-300 ease-in-out
          `}>
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
            <div className="w-full flex justify-center mb-4 sm:mb-6 md:mb-8 mt-2 sm:mt-3 md:mt-4">
              <div className={`mascot-container relative px-4 sm:px-6 md:px-8 ${
                settings.theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
              }`}>
                {showSpeechBubble && mascotMessage && (
                <div className={`
                  speech-bubble 
                  absolute left-1/2 -translate-x-1/2 
                  -top-16 sm:-top-18 md:-top-20 
                  ${settings.theme === 'dark'
                    ? 'bg-purple-900/80 text-purple-200' 
                    : 'bg-purple-100/80 text-purple-600'
                  } 
                  p-3 sm:p-4 rounded-2xl shadow-lg backdrop-blur-sm
                  max-w-[160px] sm:max-w-[180px] md:max-w-[200px] 
                  text-xs sm:text-sm z-10 whitespace-normal
                  animate-float motion-reduce:animate-none scale-100 enter:animate-scaleIn
                  hover:scale-105 transition-transform
                  ring-1 ${settings.theme === 'dark' ? 'ring-white/10' : 'ring-purple-300/30'}
                  drop-shadow-[0_0_15px_rgba(168,85,247,0.2)]
                  before:content-['']
                  before:absolute before:bottom-[-12px] before:left-1/2 before:-translate-x-1/2
                  before:border-[12px] before:border-transparent
                  ${settings.theme === 'dark'
                    ? 'before:border-t-purple-900/80'
                    : 'before:border-t-purple-100/80'
                  }
                  after:content-['']
                  after:absolute after:bottom-[-8px] after:left-[calc(50%-6px)]
                  after:border-[6px] after:border-transparent
                  ${settings.theme === 'dark'
                    ? 'after:border-t-purple-900/80'
                    : 'after:border-t-purple-100/80'
                  }
                  border
                  ${settings.theme === 'dark'
                    ? 'border-purple-700/50'
                    : 'border-purple-300/50'
                  }
                `}>
                  {mascotMessage}
                </div>
              )}
                <img 
                  src={mascotImage}
                  alt="Game Mascot"
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 object-contain animate-bounce relative z-0"
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
                    <p className="text-lg">High Score: {gameStats.highscore}</p>
                  </div>

                  {/* Share Score Section */}
                  <div className="flex flex-col gap-3 mb-4">
                    {/* Main Share Button */}
                    <button
                      onClick={async () => {
                        const shareText = `🎮 I just scored ${score} points in Fetch & Feast! Can you beat my score? 🏆`;
                        
                        try {
                          if (navigator.share) {
                            await navigator.share({
                              title: 'Fetch & Feast Game Score',
                              text: shareText,
                              url: window.location.href
                            });
                            //showToast('Score shared successfully!');
                          } else {
                            await navigator.clipboard.writeText(shareText + '\n' + window.location.href);
                            //showToast('Score copied to clipboard!');
                          }
                        } catch (error) {
                          try {
                            await navigator.clipboard.writeText(shareText + '\n' + window.location.href);
                            //showToast('Score copied to clipboard!');
                          } catch (clipboardError) {
                            //showToast('Failed to share score');
                            console.error('Share failed:', error);
                          }
                        }
                      }}
                      className={`w-full px-4 py-2 rounded-lg font-bold ${
                        settings.theme === 'dark'
                          ? 'bg-blue-600 hover:bg-blue-500 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      Share Score
                    </button>

                    {/* Social Media Share Buttons */}
                    <div className="flex justify-center gap-3">
                      {/* Facebook */}
                      <button
                        onClick={() => {
                          const shareText = `I just scored ${score} points in Fetch & Feast!`;
                          const url = encodeURIComponent(window.location.href);
                          window.open(
                            `https://facebook.com/sharer/sharer.php?u=${url}`,
                            'facebook-share',
                            'width=580,height=296'
                          );
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          settings.theme === 'dark'
                            ? 'bg-[#1877f2] hover:bg-[#0d6ce4] text-white'
                            : 'bg-[#1877f2] hover:bg-[#0d6ce4] text-white'
                        }`}
                      >
                        <FacebookIcon className="w-6 h-6" />
                      </button>

                      {/* Twitter/X */}
                      <button
                        onClick={() => {
                          const shareText = encodeURIComponent(
                            `🎮 I just scored ${score} points in Fetch & Feast! Can you beat my score? 🏆`
                          );
                          const url = encodeURIComponent(window.location.href);
                          window.open(
                            `https://twitter.com/intent/tweet?text=${shareText}&url=${url}`,
                            'twitter-share',
                            'width=550,height=235'
                          );
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          settings.theme === 'dark'
                            ? 'bg-black hover:bg-gray-800 text-white'
                            : 'bg-black hover:bg-gray-800 text-white'
                        }`}
                      >
                        <TwitterIcon className="w-6 h-6" />
                      </button>

                      {/* WhatsApp */}
                      <button
                        onClick={() => {
                          const shareText = encodeURIComponent(
                            `🎮 I just scored ${score} points in Fetch & Feast! Can you beat my score? 🏆\n${window.location.href}`
                          );
                          window.open(`https://api.whatsapp.com/send?text=${shareText}`);
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          settings.theme === 'dark'
                            ? 'bg-[#25D366] hover:bg-[#20bd5a] text-white'
                            : 'bg-[#25D366] hover:bg-[#20bd5a] text-white'
                        }`}
                      >
                        <WhatsAppIcon className="w-6 h-6" />
                      </button>

                      {/* LinkedIn */}
                      <button
                        onClick={() => {
                          const url = encodeURIComponent(window.location.href);
                          window.open(
                            `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
                            'linkedin-share',
                            'width=750,height=600'
                          );
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          settings.theme === 'dark'
                            ? 'bg-[#0077b5] hover:bg-[#006399] text-white'
                            : 'bg-[#0077b5] hover:bg-[#006399] text-white'
                        }`}
                      >
                        <LinkedInIcon className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  {/* Game Control Buttons */}
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
            <div className="w-full flex justify-center px-2 2xs:px-3 xs:px-4">
              <div className="w-[95vw] 2xs:w-[90vw] xs:w-[85vw] sm:w-[80vw] md:w-[60vw] lg:w-[50vw] max-w-[800px]">
                {/* Stats Display */}
                <div className="flex justify-between items-center mb-4 2xs:mb-5 sm:mb-6 flex-wrap gap-2 2xs:gap-3 xs:gap-4">
                  <div className={`
                    flex items-center gap-1 2xs:gap-1.5 xs:gap-2 
                    p-2 2xs:p-2.5 xs:p-3 
                    rounded-lg
                    transform transition-all duration-300
                    ${settings.theme === 'dark' 
                      ? 'bg-purple-900/80 text-purple-200' 
                      : 'bg-purple-100/80 text-purple-600'}
                    shadow-lg backdrop-blur-sm
                  `}>
                    <div className="flex items-center gap-1 2xs:gap-1.5 xs:gap-2">
                      <div className="flex gap-0.5 2xs:gap-1">
                        {Array.from({ length: lives }).map((_, i) => (
                          <div 
                            key={i} 
                            className="w-6 h-6 2xs:w-7 2xs:h-7 xs:w-8 xs:h-8"
                          >
                            <img
                              src={livesIcon}
                              alt="Life"
                              className="w-full h-full object-contain"
                              draggable="false"
                              style={{ 
                                filter: settings.theme === 'dark' 
                                  ? 'brightness(100%) hue-rotate(30deg)' 
                                  : 'brightness(90%)'
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <span className="text-xl 2xs:text-xl xs:text-2xl font-bold ml-0.5 2xs:ml-1">×{lives}</span>
                    </div>
                  </div>

                  <div className={`
                    flex items-center gap-1 2xs:gap-1.5 xs:gap-2 
                    p-2 2xs:p-2.5 xs:p-3 
                    rounded-lg
                    transform transition-all duration-300
                    ${settings.theme === 'dark' 
                      ? 'bg-purple-900/80 text-purple-200' 
                      : 'bg-purple-100/80 text-purple-600'}
                    shadow-lg backdrop-blur-sm
                  `}>
                    <div className="flex items-center gap-1 2xs:gap-1.5 xs:gap-2">
                      <span className="text-2xl 2xs:text-2xl xs:text-3xl font-bold">Score: {score}</span>
                      <div className="ml-0.5 2xs:ml-1">
                        <img
                          src={scoreIcon}
                          alt="Score"
                          className="w-5 h-5 2xs:w-5.5 2xs:h-5.5 xs:w-6 xs:h-6 object-contain"
                          draggable="false"
                          style={{ 
                            filter: settings.theme === 'dark' 
                              ? 'brightness(100%) hue-rotate(30deg)' 
                              : 'brightness(90%)'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {gameState === 'playing' && multiplier > 1 && (
                    <div className={`
                      flex items-center gap-1 2xs:gap-1.5 xs:gap-2 
                      p-2 2xs:p-2.5 xs:p-3 
                      rounded-lg
                      transform transition-all duration-300
                      ${multiplier > 1 ? 'animate-pulse' : ''}
                      ${settings.theme === 'dark' 
                        ? 'bg-purple-900/80 text-purple-200' 
                        : 'bg-purple-100/80 text-purple-600'}
                      shadow-lg backdrop-blur-sm
                    `}>
                      <div className="flex items-center gap-1 2xs:gap-1.5 xs:gap-2">
                        <span className="text-xl 2xs:text-xl xs:text-2xl font-bold">×{multiplier.toFixed(1)}</span>
                        <div className="ml-0.5 2xs:ml-1">
                          <svg 
                            className={`w-4 h-4 2xs:w-4.5 2xs:h-4.5 xs:w-5 xs:h-5 ${
                              settings.theme === 'dark' 
                                ? 'text-purple-300' 
                                : 'text-purple-500'
                            }`} 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {/* Square Aspect Ratio Container */}
                <div className="relative w-[95vw] 2xs:w-[90vw] xs:w-[85vw] sm:w-[80vw] md:w-[60vw] lg:w-[50vw] max-w-[500px] mx-auto">
                  <div className="relative aspect-square">
                    {/* Animation Overlay */}
                    {showAnimation && (
                      <div 
                        className="absolute pointer-events-none"
                        style={{
                          top: `${(animationPosition.row * 100) / settings.gridSize}%`,
                          left: `${(animationPosition.col * 100) / settings.gridSize}%`,
                          width: `${100 / settings.gridSize}%`,
                          height: `${100 / settings.gridSize}%`,
                          pointerEvents: 'none',
                          zIndex: 50
                        }}
                      >
                        <div className={`
                          absolute 
                          inset-0 
                          flex 
                          items-center 
                          justify-center 
                          rounded-lg
                          ${settings.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}
                        `}>
                          <img
                            key={Date.now()}
                            src={successAnimation}
                            alt="Success Animation"
                            className="w-2/3 2xs:w-[70%] xs:w-[72%] sm:w-3/4 object-contain pointer-events-none"
                            draggable="false"
                          />
                        </div>
                      </div>
                    )}
                    {/* Absolute Position Grid */}
                    <div 
                      className={`
                        absolute 
                        inset-0 
                        rounded-lg
                        overflow-hidden
                        ${gridShake ? 'animate-shake' : ''} 
                        ${settings.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}
                      `}
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
                </div>
                ) : (
          // Menu State Content
          <div className={`flex flex-col items-center justify-center gap-6 my-8 p-6 rounded-lg ${
            settings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
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