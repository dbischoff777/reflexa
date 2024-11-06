import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import livesIcon from './images/lives.png';
import frenchieIcon from './images/frenchie.png';
import scoreIcon from './images/score.png';
import { FacebookIcon, TwitterIcon, WhatsAppIcon } from './Icons';
import ScreenProtectionStatus from './components/ScreenProtectionStatus';
import DailyQuests from './DailyQuests';
import WeeklyQuests from './WeeklyQuests';
import { LucideUser, LucideSettings, LucideBarChart2, LucideInfo, LucidePlay, LucideCalendar, ShoppingCart, Clock, Trophy } from 'lucide-react';

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
  newAchievement,
  showAnimation,
  animationPosition,
  successAnimation,
  wakeLockActive,
  brightnessAdjusted,
  //onAnimationEnd
}) => {
  
  //quest buttons
  const [showDailyQuests, setShowDailyQuests] = useState(false);
  const [showWeeklyQuests, setShowWeeklyQuests] = useState(false);

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem('username', username.trim());
      startGame();
    }
  };

  const calculateHeight = () => {
    if (settings.gridRows === 1) {
      if (settings.gridColumns === 2) return '150%';
      if (settings.gridColumns === 3) return '165%';
    }
    return `${100 / settings.gridRows}%`;
  };

  const StatBox = ({ theme, children, extraClasses = '' }) => (
    <div className={`
      flex items-center gap-1 sm:gap-2 
      p-2 sm:p-3 
      rounded-lg
      transform transition-all duration-300
      ${theme === 'dark' ? 'bg-purple-900/80 text-purple-200' : 'bg-purple-100/80 text-purple-600'}
      shadow-lg backdrop-blur-sm
      ${extraClasses}
    `}>
      {children}
    </div>
  );
  
  const StatIcon = ({ src, alt, theme }) => (
    <div className="ml-0.5 sm:ml-1">
      <img
        src={src}
        alt={alt}
        className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
        draggable="false"
        loading="lazy"
        style={{ 
          filter: theme === 'dark' ? 'brightness(100%) hue-rotate(30deg)' : 'brightness(90%)'
        }}
      />
    </div>
  );
  
  const LivesIcons = ({ lives, theme }) => (
    <div className="flex gap-0.5 sm:gap-1">
      {Array.from({ length: lives }).map((_, i) => (
        <div key={i} className="w-6 h-6 sm:w-7 sm:h-7">
          <img
            src={livesIcon}
            alt="Life"
            className="w-full h-full object-contain"
            draggable="false"
            loading="lazy"
            style={{ 
              filter: theme === 'dark' ? 'brightness(100%) hue-rotate(30deg)' : 'brightness(90%)'
            }}
          />
        </div>
      ))}
    </div>
  );
  
  const MultiplierIcon = ({ theme }) => (
    <svg 
      className={`w-4 h-4 sm:w-5 sm:h-5 ${theme === 'dark' ? 'text-purple-300' : 'text-purple-500'}`} 
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
  );
  
  return (
    <div className={`min-h-screen w-full fixed inset-0 ${
      settings.theme === 'dark'
        ? gridShake 
          ? 'animate-shake-and-flash bg-gray-800 text-white'
          : 'bg-gray-800 text-white'
        : gridShake
          ? 'animate-shake-and-flash bg-gray-100 text-gray-900'
          : 'bg-gray-100 text-gray-900'
    }`}>
      <ScreenProtectionStatus 
        theme={settings.theme} 
        wakeLockActive={wakeLockActive}
        brightnessAdjusted={brightnessAdjusted}
        gameState={gameState}
      />
      
      {/* Main Container */}
      <div className="container mx-auto 
                      px-2 2xs:px-3 xs:px-4 sm:px-6 lg:px-8 
                      py-2 2xs:py-3 xs:py-4 sm:py-6 lg:py-8 
                      max-w-7xl">
  
      {/* Frenchie Image Container */}
      <div className="flex justify-center 
                      mb-2 2xs:mb-3 xs:mb-4 sm:mb-5 md:mb-6 
                      pointer-events-none">
          <div className={`
            relative
            transition-all duration-300 ease-in-out
            ${gameState !== 'menu' 
              ? 'opacity-0 scale-95 h-0 mb-0 overflow-hidden' 
              : `opacity-100 scale-100 
                h-16 2xs:h-20 xs:h-24 sm:h-28 md:h-32 lg:h-36 xl:h-40
                mb-2 2xs:mb-3 xs:mb-4 sm:mb-5 md:mb-6
                animate-float`
            }
          `}>
            <motion.div
              initial={{ scale: 0.9, y: 10, rotate: -5 }}
              animate={{ 
                scale: [1, 1.08, 1],
                y: [0, -8, 0],
                rotate: [-5, 5, -5]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              whileHover={{
                scale: 1.15,
                rotate: [-5, 5],
                transition: {
                  duration: 0.3
                }
              }}
            >
              <img
                src={frenchieIcon}
                alt="Frenchie"
                className={`
                  w-32 h-32 
                  object-contain 
                  drop-shadow-xl
                  transition-all duration-300
                  hover:scale-110
                  hover:rotate-6
                  ${settings.theme === 'dark' 
                    ? 'filter-none' 
                    : 'brightness-100 contrast-105'
                  }
                `}
                style={{ 
                  filter: `
                    ${settings.theme === 'dark' 
                      ? 'drop-shadow(0 0 12px rgba(147, 51, 234, 0.4)) brightness(1.1)' 
                      : 'drop-shadow(0 0 8px rgba(107, 33, 168, 0.3))'
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
          ${gameState !== 'menu' 
            ? 'opacity-0 h-0 overflow-hidden' 
            : 'opacity-100 h-auto mb-4 2xs:mb-5 xs:mb-6 sm:mb-7 md:mb-8'
          }
        `}>
          <div className="text-center mb-3 2xs:mb-4 xs:mb-6 sm:mb-7 md:mb-8">
            <h1 className={`
              relative inline-block 
              text-2xl 2xs:text-3xl xs:text-4xl sm:text-5xl md:text-6xl
              font-extrabold 
              mb-2 2xs:mb-3 xs:mb-4 
              ${settings.theme === 'dark' ? 'text-purple-300' : 'text-purple-600'}
              transition-all duration-300 
              hover:scale-[1.02] xs:hover:scale-[1.03] sm:hover:scale-105 
              transform
            `}>
              <span className="relative inline-block">
                Fetch & Feast</span>
              
              <span className={`
                absolute 
                -bottom-1 2xs:-bottom-1.5 xs:-bottom-2 
                left-0 w-full 
                h-0.5 xs:h-1 
                rounded-full 
                transform scale-x-0 
                transition-transform duration-300 
                group-hover:scale-x-100
                ${settings.theme === 'dark' ? 'bg-purple-400/50' : 'bg-purple-500/50'}
              `}></span>
            </h1>
            
            <p className={`
              relative 
              text-sm 2xs:text-base xs:text-lg sm:text-xl md:text-2xl
              font-medium 
              mb-3 2xs:mb-4 xs:mb-5 sm:mb-6 
              mx-auto 
              max-w-[90%] xs:max-w-md sm:max-w-lg
              ${settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}
              after:content-[''] 
              after:block 
              after:w-12 2xs:after:w-16 xs:after:w-20 
              after:h-0.5 xs:after:h-1 
              after:mx-auto 
              after:mt-2 2xs:after:mt-3 xs:after:mt-4 
              after:rounded-full
              ${settings.theme === 'dark' 
                ? 'after:bg-gradient-to-r after:from-purple-400/20 after:to-transparent' 
                : 'after:bg-gradient-to-r after:from-purple-500/20 after:to-transparent'}
            `}>
              Fetch as many treats as you can!
            </p>
          </div>
        </div>
        {/* Navigation Links */}
        <div className={`
          flex flex-wrap justify-center 
          gap-2 2xs:gap-3 xs:gap-4 sm:gap-6
          transition-all duration-300 ease-in-out
          ${gameState !== 'menu' 
            ? 'opacity-0 scale-95 h-0 mt-0 overflow-hidden' 
            : 'opacity-100 scale-100 mt-4 2xs:mt-5 xs:mt-6 sm:mt-8'
          }
        `}>
          {['Profile', 'Leaderboard', 'Settings', 'About'].map((item) => (
            <Link
              key={item}
              to={`/${item.toLowerCase()}`}
              className={`
                group relative 
                px-3 2xs:px-4 xs:px-5 
                py-2 2xs:py-2.5 
                rounded-lg xs:rounded-xl 
                font-medium 
                transition-all duration-300 ease-out
                hover:scale-105
                ${settings.theme === 'dark'
                  ? 'text-purple-300 hover:text-purple-200'
                  : 'text-purple-600 hover:text-purple-500'
                }
              `}
            >
              {/* Icons for each nav item */}
              {item === 'Profile' && (
                <LucideUser className="h-6 w-6" />
              )}
              {item === 'Leaderboard' && (
                <Trophy className="h-6 w-6" />
              )}
              {item === 'Settings' && (
                <LucideSettings className="h-6 w-6" />
              )}
              {item === 'About' && (
                <LucideInfo className="h-6 w-6" />
              )}
              
              {/* Link Glow Effect */}
              <div className={`
                absolute inset-0
                rounded-lg xs:rounded-xl
                transition-all duration-300
                opacity-0 group-hover:opacity-100
                transform group-hover:scale-105
                ${settings.theme === 'dark'
                  ? 'bg-purple-500/15 shadow-[0_0_25px_rgba(168,85,247,0.6)] border border-purple-400/20' 
                  : 'bg-purple-500/10 shadow-[0_0_25px_rgba(147,51,234,0.4)] border border-purple-500/20'
                }
              `} />
              {/* Subtle Gradient Overlay */}
              <div className={`
                absolute inset-0 
                rounded-lg xs:rounded-xl
                opacity-0 group-hover:opacity-100
                transition-opacity duration-300
                ${settings.theme === 'dark'
                  ? 'bg-gradient-to-br from-purple-400/5 to-purple-600/5'
                  : 'bg-gradient-to-br from-purple-300/5 to-purple-500/5'
                }
              `} />
            </Link>
          ))}
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
              <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[1000]">
                <div className={`
                  relative
                  flex items-center justify-center
                  w-32 h-32 sm:w-40 sm:h-40
                  rounded-full
                  ${settings.theme === 'dark' ? 'bg-purple-900/40' : 'bg-purple-100/40'}
                  shadow-lg
                  before:absolute before:inset-0
                  before:rounded-full
                  before:animate-ping
                  before:bg-purple-500/20
                `}>
                  <div className={`
                    text-7xl sm:text-8xl font-bold
                    ${settings.theme === 'dark' ? 'text-purple-300' : 'text-purple-600'}
                    animate-bounce
                    drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]
                  `}>
                    {countdown}
                  </div>
                </div>
              </div>
            )}

            {/* Game Over Overlay */}
            {showGameOver && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-[1000]">
                <div className={`
                  p-8 rounded-2xl text-center shadow-2xl
                  transform transition-all duration-300 ease-out
                  animate-fadeIn scale-100 
                  max-w-md w-full mx-4
                  ${settings.theme === 'dark' 
                    ? 'bg-gray-800/95 border border-purple-500/20' 
                    : 'bg-white/95 border border-purple-200'
                  }
                `}>
                  <h2 className={`
                    text-5xl font-bold mb-6
                    bg-gradient-to-r from-purple-400 to-pink-400 
                    bg-clip-text text-transparent
                    drop-shadow-lg
                  `}>
                    Game Over!
                  </h2>
                  
                  <div className={`
                    mb-8 space-y-3
                    ${settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
                  `}>
                    <p className="text-2xl font-semibold">
                      Final Score: <span className="text-purple-500">{gameStats.score}</span>
                    </p>
                    <p className="text-xl">
                      High Score: <span className="text-purple-500">{gameStats.highscore}</span>
                    </p>
                  </div>

                  {/* Share Score Section */}
                  <div className="flex flex-col gap-4 mb-6">
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
                          } else {
                            await navigator.clipboard.writeText(shareText + '\n' + window.location.href);
                          }
                        } catch (error) {
                          try {
                            await navigator.clipboard.writeText(shareText + '\n' + window.location.href);
                          } catch (clipboardError) {
                            console.error('Share failed:', error);
                          }
                        }
                      }}
                      className={`
                        w-full px-6 py-3 rounded-xl font-bold text-lg
                        transform transition-all duration-200
                        hover:scale-105 active:scale-95
                        ${settings.theme === 'dark'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-lg hover:shadow-blue-500/30'
                          : 'bg-gradient-to-r from-blue-500 to-blue-400 text-white shadow-lg hover:shadow-blue-500/30'
                        }
                      `}
                    >
                      Share Score
                    </button>

                    {/* Social Media Share Buttons */}
                    <div className="flex justify-center gap-4">
                      {/* Facebook */}
                      <button
                        onClick={() => {
                          const shareText = encodeURIComponent(`I just scored ${score} points in Fetch & Feast!`);
                          const url = encodeURIComponent(window.location.href);
                          window.open(
                            `https://facebook.com/sharer/sharer.php?u=${url}&quote=${shareText}`,
                            'facebook-share',
                            'width=580,height=296'
                          );
                        }}
                        className={`
                          p-3 rounded-xl transition-all duration-200
                          hover:scale-110 active:scale-95
                          shadow-lg hover:shadow-[#1877f2]/30
                          bg-[#1877f2] hover:bg-[#0d6ce4] text-white
                        `}
                      >
                        <FacebookIcon className="w-7 h-7" />
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
                        className={`
                          p-3 rounded-xl transition-all duration-200
                          hover:scale-110 active:scale-95
                          shadow-lg hover:shadow-black/30
                          bg-black hover:bg-gray-800 text-white
                        `}
                      >
                        <TwitterIcon className="w-7 h-7" />
                      </button>

                      {/* WhatsApp */}
                      <button
                        onClick={() => {
                          const shareText = encodeURIComponent(
                            `🎮 I just scored ${score} points in Fetch & Feast! Can you beat my score? 🏆\n${window.location.href}`
                          );
                          window.open(`https://api.whatsapp.com/send?text=${shareText}`);
                        }}
                        className={`
                          p-3 rounded-xl transition-all duration-200
                          hover:scale-110 active:scale-95
                          shadow-lg hover:shadow-[#25D366]/30
                          bg-[#25D366] hover:bg-[#20bd5a] text-white
                        `}
                      >
                        <WhatsAppIcon className="w-7 h-7" />
                      </button>
                    </div>
                  </div>

                  {/* Game Control Buttons */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={startGame}
                      className={`
                        w-full px-6 py-3 rounded-xl font-bold text-lg
                        transform transition-all duration-200
                        hover:scale-105 active:scale-95
                        ${settings.theme === 'dark'
                          ? 'bg-gradient-to-r from-purple-600 to-purple-400 text-white shadow-lg hover:shadow-purple-500/30'
                          : 'bg-gradient-to-r from-purple-500 to-purple-400 text-white shadow-lg hover:shadow-purple-500/30'
                        }
                      `}
                    >
                      Play Again
                    </button>
                    
                    <Link
                      to="/profile"
                      className={`
                        w-full px-6 py-3 rounded-xl font-bold text-lg
                        transform transition-all duration-200
                        hover:scale-105 active:scale-95
                        ${settings.theme === 'dark'
                          ? 'bg-gradient-to-r from-gray-600 to-gray-500 text-white shadow-lg hover:shadow-gray-500/30'
                          : 'bg-gradient-to-r from-gray-500 to-gray-400 text-white shadow-lg hover:shadow-gray-500/30'
                        }
                      `}
                    >
                      Profile
                    </Link>
                    
                    <button
                      onClick={exitGame}
                      className={`
                        w-full px-6 py-3 rounded-xl font-bold text-lg
                        transform transition-all duration-200
                        hover:scale-105 active:scale-95
                        ${settings.theme === 'dark'
                          ? 'bg-gradient-to-r from-gray-600 to-gray-500 text-white shadow-lg hover:shadow-gray-500/30'
                          : 'bg-gradient-to-r from-gray-500 to-gray-400 text-white shadow-lg hover:shadow-gray-500/30'
                        }
                      `}
                    >
                      Exit
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Responsive Grid Container */}
            <div className="w-full flex justify-center px-2 sm:px-4">
              <div className="w-full max-w-[95vw] sm:max-w-[80vw] md:max-w-[60vw] lg:max-w-[50vw] xl:max-w-[800px]">
                <div className="flex justify-between items-center mb-4 sm:mb-6 flex-wrap gap-2 sm:gap-4">
                  <StatBox theme={settings.theme} extraClasses="hover:scale-105 transition-transform">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <LivesIcons lives={1} theme={settings.theme} />
                      <span className="text-lg sm:text-xl font-bold tracking-tight">×{lives}</span>
                    </div>
                  </StatBox>
                  <StatBox theme={settings.theme} extraClasses="hover:scale-105 transition-transform">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="text-lg sm:text-xl font-bold tracking-tight">Score: {score.toLocaleString()}</span>
                      <StatIcon src={scoreIcon} alt="Score" theme={settings.theme} />
                    </div>
                  </StatBox>
                  {gameState === 'playing' && multiplier > 1 && (
                    <StatBox 
                      theme={settings.theme} 
                      extraClasses={`
                        ${multiplier > 1 ? 'animate-pulse' : ''}
                        hover:scale-105 transition-transform
                        ${multiplier >= 3 ? 'ring-2 ring-purple-400' : ''}
                      `}
                    >
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="text-lg sm:text-xl font-bold tracking-tight">×{multiplier.toFixed(1)}</span>
                        <MultiplierIcon theme={settings.theme} />
                      </div>
                    </StatBox>
                  )}
                </div>
              </div>
            </div>
              {/* Square Aspect Ratio Container */}
              <div className="relative w-[95vw] 2xs:w-[90vw] xs:w-[85vw] sm:w-[80vw] md:w-[60vw] lg:w-[50vw] max-w-[500px] mx-auto">
                <div className="relative aspect-square">
                  {/* Animation Overlay */}
                  {showAnimation && (
                  <div 
                    className="absolute pointer-events-none"
                    style={{
                      bottom: `${animationPosition.row * (100 / settings.gridRows)}%`,
                      left: `${animationPosition.col * (100 / settings.gridColumns)}%`,
                      width: `${100 / settings.gridColumns}%`,
                      height: calculateHeight(),
                      pointerEvents: 'none',
                      zIndex: 50,
                    }}
                  >
                    <div className={`
                      absolute 
                      inset-0 
                      flex 
                      items-center 
                      justify-center 
                      rounded-lg
                      ${settings.theme === 'dark' ? 'transparent' : 'transparent'}
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
                    ${gridShake ? 'animate-shake-and-flash' : ''} 
                    ${settings.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}
                  `}
                  style={{
                    '--grid-aspect-ratio': `${settings.gridColumns} / ${settings.gridRows}`,
                    display: 'grid',
                    gridTemplateColumns: `repeat(${settings.gridColumns}, 1fr)`,
                    gridTemplateRows: `repeat(${settings.gridRows}, 1fr)`,
                    gap: '2%',
                    padding: '2%',
                  }}
                >
                  {Array.from({ length: settings.gridColumns * settings.gridRows }).map((_, index) => (
                    <div key={index} className="relative w-full h-full">
                      {renderButton(index)}
                    </div>
                  ))}
                </div>
                {/* Particle Effects */}
                {particleEffects.map(effect => (
                  <PopEffect
                    key={effect.id}
                    row={effect.row}
                    col={effect.col}
                    theme={settings.theme}
                    gridRows={settings.gridRows}
                    gridColumns={settings.gridColumns}
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
          ) : (
          // Menu State Content
          <div className={`flex flex-col items-center justify-center gap-6 my-8 p-6 rounded-lg ${
            settings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
           
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
              <div className="flex flex-col items-center gap-4 mt-6">
              <button
                onClick={startGame}
                className={`w-full max-w-xs py-3 px-6 rounded-lg font-bold
                  transition-all duration-200 transform hover:scale-105
                  flex items-center justify-center gap-2
                  shadow-lg hover:shadow-xl
                  ${settings.theme === 'dark'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                    : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white'
                  }`}
              >
                <LucidePlay className="h-6 w-6" />
                Start Game
              </button>

              {/* Shop Button */}
              <Link
                to="/shop"
                className={`w-full max-w-xs py-3 px-6 rounded-lg font-semibold text-center 
                  transition-all duration-200 transform hover:scale-105
                  flex items-center justify-center gap-2
                  shadow-lg hover:shadow-xl
                  ${settings.theme === 'dark'
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white'
                    : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white'
                  }`}
              >
                <ShoppingCart className="h-5 w-5" />
                Shop
              </Link>

              {/* Header for Quests */}
              <h3 className={`text-lg font-semibold mt-4 ${
                settings.theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Your Puppies Quests
              </h3>

              <div className="flex w-full max-w-xs gap-2">
                {/* Daily Quests Button */}
                <button
                  onClick={() => setShowDailyQuests(true)}
                  className={`
                    flex-1 py-3 px-4 rounded-lg font-bold
                    transition-all duration-200 transform hover:scale-105
                    flex items-center justify-center gap-2
                    shadow-lg hover:shadow-xl
                    min-w-[120px] w-1/2
                    ${settings.theme === 'dark'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                      : 'bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white'
                    }
                  `}
                >
                  <Clock className="h-5 w-5" />
                  Daily
                </button>

                {/* Weekly Quests Button */}
                <button
                  onClick={() => setShowWeeklyQuests(true)}
                  className={`
                    flex-1 py-3 px-4 rounded-lg font-bold
                    transition-all duration-200 transform hover:scale-105 
                    flex items-center justify-center gap-2
                    shadow-lg hover:shadow-xl
                    min-w-[120px] w-1/2
                    ${settings.theme === 'dark'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white'
                      : 'bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 text-white'
                    }
                  `}
                >
                  <LucideCalendar className="h-5 w-5" />
                  Weekly
                </button>
              </div>

              {showDailyQuests && (
                <DailyQuests 
                  onClose={() => setShowDailyQuests(false)} 
                  theme={settings.theme}
                />
              )}
              {showWeeklyQuests && (
                <WeeklyQuests 
                  onClose={() => setShowWeeklyQuests(false)} 
                  theme={settings.theme}
                />
              )}
            </div>
            )}
          </div>
          )}
        </div>
      </div>
  );
};

export default PopItGameUI;