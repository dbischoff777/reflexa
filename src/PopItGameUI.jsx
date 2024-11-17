import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import livesIcon from './assets/images/lives.png';
import frenchieIcon from './assets/images/frenchie.png';
import scoreIcon from './assets/images/score.png';
import { FacebookIcon, TwitterIcon, WhatsAppIcon } from './Icons';
import DailyQuests from './DailyQuests';
import WeeklyQuests from './WeeklyQuests';
import { LucidePlay, LucideCalendar, ShoppingCart, Clock, Volume2, VolumeX, X, Layers } from 'lucide-react';
import floorBackground from './assets/images/gameBackgrounds/floor1.png';
import { GAME_STATES } from './PopItGame';
import { TutorialProvider, useTutorial } from './contexts/TutorialContext';
import Tutorial from './components/Tutorial';
import { useSettings } from './Settings';
import NavigationBar from './components/NavigationBar';
import './styles.css';
import { ScreenOrientation } from '@capacitor/screen-orientation';

const GameContent = ({
  settings,
  username,
  showUsernameInput,
  setUsername,
  score,
  lives,
  multiplier,
  gameState,
  setGameState,
  showSpeechBubble,
  mascotMessage,
  mascotImage,
  countdown,
  showGameOver,
  gameStats,
  gridShake,
  startGame,
  exitGame,
  renderButton,
  newAchievement,
  showAnimation,
  successAnimation,
  isMusicPlaying,
  onMusicToggle,
  containerRef,
}) => {
  const { hasCompletedTutorial, startTutorial } = useTutorial();
  const { updateSettings } = useSettings();
  const navigate = useNavigate();
  
  //quest buttons
  const [showDailyQuests, setShowDailyQuests] = useState(false);
  const [showWeeklyQuests, setShowWeeklyQuests] = useState(false);

  const handleMusicToggle = () => {
    onMusicToggle();
  };

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem('username', username.trim());
      startGame();
    }
  };

  const handleStartGame = () => {
    if (username.trim() && username !== localStorage.getItem('username')) {
      localStorage.setItem('username', username.trim());
    }
    startGame();
  };

  const StatBox = ({ theme, children, extraClasses = '' }) => (
    <div className={`
      flex items-center gap-1.5 xs:gap-2 
      p-2.5 xs:p-3 
      rounded-xl
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

  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleExitApp = async () => {
    // Check if running in Capacitor (mobile)
    if (window.Capacitor) {
      const { App } = await import('@capacitor/app');
      await App.exitApp();
    } else {
      // Web fallback
      window.close();
      
      // Electron fallback
      if (window.electron) {
        window.electron.closeApp();
      }
    }
  };

  const MusicToggleButton = ({ isMusicPlaying, handleMusicToggle }) => {
    const { settings, updateSettings } = useSettings();
    
    const handleSoundToggle = () => {
      updateSettings({ soundEnabled: !settings.soundEnabled });
    };

    return (
      <div className="flex flex-col gap-2">
        {/* Exit Button */}
        <button
          onClick={() => setShowExitConfirm(true)}
          className={`
            group relative 
            p-2 xs:p-2.5
            rounded-xl
            font-medium 
            transition-all duration-300 ease-out
            hover:scale-105
            flex items-center justify-center
            ${settings.theme === 'dark'
              ? 'bg-red-900/40 text-red-300 hover:text-red-200'
              : 'bg-red-100/40 text-red-600 hover:text-red-500'
            }
          `}
          aria-label="Exit Application"
        >
          <span className="text-sm font-medium">Exit App</span>
          <div className={`
            absolute inset-0
            rounded-xl
            transition-all duration-300
            opacity-0 group-hover:opacity-100
            ${settings.theme === 'dark'
              ? 'bg-red-500/15 shadow-[0_0_25px_rgba(239,68,68,0.6)] border border-red-400/20' 
              : 'bg-red-500/10 shadow-[0_0_25px_rgba(239,68,68,0.4)] border border-red-500/20'
            }
          `} />
        </button>

        {/* Music and Sound Controls */}
          {/* Music Toggle Button */}
          <button
            onClick={handleMusicToggle}
            className={`
              group relative 
              px-3 py-2 xs:px-4 xs:py-2.5
              rounded-xl
              font-medium 
              transition-all duration-300 ease-out
              hover:scale-105
              flex items-center gap-2
              ${settings.theme === 'dark'
                ? 'bg-purple-900/40 text-purple-300 hover:text-purple-200'
                : 'bg-purple-100/40 text-purple-600 hover:text-purple-500'
              }
            `}
            aria-label={isMusicPlaying ? "Turn music off" : "Turn music on"}
          >
            {isMusicPlaying ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            <span className="text-sm font-medium">Music</span>
            
            {/* Link Glow Effect */}
            <div className={`
              absolute inset-0
              rounded-xl
              transition-all duration-300
              opacity-0 group-hover:opacity-100
              ${settings.theme === 'dark'
                ? 'bg-purple-500/15 shadow-[0_0_25px_rgba(168,85,247,0.6)] border border-purple-400/20' 
                : 'bg-purple-500/10 shadow-[0_0_25px_rgba(147,51,234,0.4)] border border-purple-500/20'
              }
            `} />
          </button>

          {/* Sound Effects Toggle Button */}
          <button
            onClick={handleSoundToggle}
            className={`
              group relative 
              px-3 py-2 xs:px-4 xs:py-2.5
              rounded-xl
              font-medium 
              transition-all duration-300 ease-out
              hover:scale-105
              flex items-center gap-2
              ${settings.theme === 'dark'
                ? 'bg-purple-900/40 text-purple-300 hover:text-purple-200'
                : 'bg-purple-100/40 text-purple-600 hover:text-purple-500'
              }
            `}
            aria-label={settings.soundEnabled ? "Turn sound effects off" : "Turn sound effects on"}
          >
          {settings.soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          <span className="text-sm font-medium">Sound</span>
          
          {/* Link Glow Effect */}
          <div className={`
            absolute inset-0
            rounded-xl
            transition-all duration-300
            opacity-0 group-hover:opacity-100
            ${settings.theme === 'dark'
              ? 'bg-purple-500/15 shadow-[0_0_25px_rgba(168,85,247,0.6)] border border-purple-400/20' 
              : 'bg-purple-500/10 shadow-[0_0_25px_rgba(147,51,234,0.4)] border border-purple-500/20'
            }
          `} />
        </button>
      </div>
    );
  };

  // Add mobile optimization logic
  useEffect(() => {
    const handleResize = () => {
      // Prevent zoom on double tap for iOS
      const meta = document.querySelector('meta[name="viewport"]');
      if (meta) {
        meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
    };

    // Prevent pull-to-refresh
    const preventPullToRefresh = (e) => {
      if (gameState === GAME_STATES.PLAYING) {
        e.preventDefault();
      }
    };

    // Prevent context menu
    const preventContextMenu = (e) => {
      if (gameState === GAME_STATES.PLAYING) {
        e.preventDefault();
      }
    };

    // Add event listeners
    window.addEventListener('resize', handleResize);
    document.addEventListener('touchmove', preventPullToRefresh, { passive: false });
    document.addEventListener('contextmenu', preventContextMenu);
    handleResize(); // Initial call

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('touchmove', preventPullToRefresh);
      document.removeEventListener('contextmenu', preventContextMenu);
      
      // Reset viewport meta on cleanup
      const meta = document.querySelector('meta[name="viewport"]');
      if (meta) {
        meta.setAttribute('content', 'width=device-width, initial-scale=1.0');
      }
    };
  }, [gameState]);

  // Add transition classes to prevent flickering
  const transitionClasses = {
    base: "transition-all duration-300 ease-in-out will-change-auto",
    fade: "transition-opacity duration-300 ease-in-out will-change-opacity",
    transform: "transition-transform duration-300 ease-in-out will-change-transform",
  };

  // Add performance optimization constants
  const ANIMATION_CONFIG = {
    frenchie: {
      floatDuration: 3,
      particleCount: window.innerWidth < 768 ? 8 : 12, // Reduce particles on mobile
      sparkleCount: window.innerWidth < 768 ? 4 : 6,   // Reduce sparkles on mobile
    }
  };

  // Add animation performance optimizations
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Optimize Frenchie animation
  const frenchieAnimationProps = useMemo(() => ({
    initial: { scale: 0.9, y: 10, rotate: -5 },
    animate: isReducedMotion ? {} : { 
      scale: [1, 1.05, 1],  // Reduced scale range
      y: [0, -6, 0],        // Reduced movement range
      rotate: [-3, 3, -3]   // Reduced rotation range
    },
    transition: {
      duration: ANIMATION_CONFIG.frenchie.floatDuration,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
      // Use CSS transforms for better performance
      type: "tween",
      optimizeLegibility: true,
    },
    whileHover: isReducedMotion ? {} : {
      scale: 1.1,           // Reduced hover scale
      transition: {
        duration: 0.2       // Faster hover transition
      }
    }
  }), [isReducedMotion]);

  // Optimize particle animations
  const renderParticles = useCallback(() => {
    if (isReducedMotion) return null;

    return [...Array(ANIMATION_CONFIG.frenchie.particleCount)].map((_, i) => (
      <motion.div
        key={i}
        className={`
          absolute rounded-full
          ${settings.theme === 'dark' ? 'bg-purple-400' : 'bg-purple-500'}
          will-change-transform
        `}
        style={{
          width: `${Math.random() * 3 + 2}px`,    // Reduced size variation
          height: `${Math.random() * 3 + 2}px`,   // Reduced size variation
          opacity: Math.random() * 0.4 + 0.2      // Reduced opacity range
        }}
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [0, 0.4, 0],                   // Reduced opacity range
          x: Math.random() * 80 - 40,             // Reduced movement range
          y: Math.random() * 80 - 40,             // Reduced movement range
          scale: [0.8, 1.1, 0.8]                  // Reduced scale range
        }}
        transition={{
          duration: 1.5 + Math.random(),          // Reduced duration variation
          repeat: Infinity,
          delay: i * 0.15,                        // Reduced delay between particles
          ease: "easeInOut",
          type: "tween",                          // Use CSS transforms
          optimizeLegibility: true
        }}
      />
    ));
  }, [isReducedMotion, settings.theme]);

  // Optimize sparkle animations
  const renderSparkles = useCallback(() => {
    if (isReducedMotion) return null;

    return [...Array(ANIMATION_CONFIG.frenchie.sparkleCount)].map((_, i) => (
      <motion.div
        key={`sparkle-${i}`}
        className={`
          absolute w-1 h-1 rotate-45
          ${settings.theme === 'dark' ? 'bg-purple-300' : 'bg-purple-400'}
          will-change-transform
        `}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: [0, 0.8, 0],
          scale: [0, 1, 0],
          rotate: [0, 45, 90]                     // Reduced rotation range
        }}
        transition={{
          duration: 3,                          // Reduced duration
          repeat: Infinity,
          delay: i * 0.25,                        // Reduced delay between sparkles
          ease: "easeInOut",
          type: "tween",                          // Use CSS transforms
          optimizeLegibility: true
        }}
        style={{
          left: `${Math.random() * 80 + 10}%`,    // Keep within bounds
          top: `${Math.random() * 80 + 10}%`,     // Keep within bounds
        }}
      />
    ));
  }, [isReducedMotion, settings.theme]);

  // Add state for confirmation dialog
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  // Add handler for quit button
  const handleQuitClick = () => {
    setShowQuitConfirm(true);
  };

  // Add handler for confirming quit
  const handleConfirmQuit = () => {
    setShowQuitConfirm(false);
    exitGame();
  };

  // Inside GameContent component, add this effect:
  useEffect(() => {
    const lockOrientation = async () => {
      try {
        // Check if we're running in Capacitor
        if (window.Capacitor) {
          if (gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.COUNTDOWN) {
            // Force landscape in Capacitor
            await ScreenOrientation.lock({
              orientation: 'landscape'
            });
          } else {
            // Allow any orientation when not playing
            await ScreenOrientation.unlock();
          }
        } else {
          // Web fallback using Screen Orientation API
          if (window?.screen?.orientation?.lock && typeof window.screen.orientation.lock === 'function') {
            if (gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.COUNTDOWN) {
              await window.screen.orientation.lock('landscape');
            } else {
              await window.screen.orientation.unlock();
            }
          }
        }
      } catch (error) {
        // Log error but don't throw - orientation locking is enhancement, not critical
        console.debug('Orientation lock not available:', error);
      }
    };

    lockOrientation();

    // Cleanup function
    return () => {
      const unlockOrientation = async () => {
        try {
          if (window.Capacitor) {
            await ScreenOrientation.unlock();
          } else if (window?.screen?.orientation?.unlock) {
            await window.screen.orientation.unlock();
          }
        } catch (error) {
          console.debug('Error unlocking orientation:', error);
        }
      };
      
      unlockOrientation();
    };
  }, [gameState]);
  
  return (
    <div className="relative">
      <div 
        className={`
          min-h-screen w-full fixed inset-0 
          ${transitionClasses.base}
          ${settings.theme === 'dark'
            ? gridShake 
              ? 'animate-shake-and-flash bg-gray-800 text-white'
              : 'bg-gray-800 text-white'
            : gridShake
              ? 'animate-shake-and-flash bg-gray-100 text-gray-900'
              : 'bg-gray-100 text-gray-900'
          }
        `}
        /* onTouchStart={(e) => {
          if (gameState === GAME_STATES.PLAYING) {
            e.preventDefault();
          }
        }} */
        style={{
          WebkitTouchCallout: 'none', // Disable touch callout
          WebkitUserSelect: 'none', // Disable text selection
          KhtmlUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          userSelect: 'none',
          overscrollBehavior: 'none', // Prevent overscroll bounce
        }}
      >
        {gameState !== GAME_STATES.PLAYING && (
          <div className={`
            ${transitionClasses.fade}
            ${gameState === GAME_STATES.PLAYING ? 'opacity-0 pointer-events-none' : 'opacity-100'}
          `}>
          </div>
        )}
        
        <div className="container mx-auto px-1 xs:px-2 sm:px-4 lg:px-6 py-1 xs:py-2 sm:py-4 lg:py-6 max-w-7xl mb-8 xs:mb-12 pt-16 xs:pt-20">
          {/* Main Container */}
          <div className="container mx-auto px-1 xs:px-2 sm:px-4 lg:px-6 py-1 xs:py-2 sm:py-4 lg:py-6 max-w-7xl">
            {/* Frenchie Image Container */}
            <div className="flex justify-center mb-1 xs:mb-2 sm:mb-4 pointer-events-none">
              <div className={`
                relative
                ${transitionClasses.base}
                transform-gpu
                ${gameState !== 'menu' 
                  ? 'opacity-0 scale-95 h-0 mb-0 overflow-hidden' 
                  : `opacity-100 scale-100 
                    h-16 2xs:h-20 xs:h-24 sm:h-28 md:h-32 lg:h-36 xl:h-40
                    mb-2 2xs:mb-3 xs:mb-4 sm:mb-5 md:mb-6
                    animate-float`
              }
              `}>
                  <motion.div {...frenchieAnimationProps}>
                    <img
                      src={frenchieIcon}
                      alt="Frenchie"
                      className={`
                        w-32 h-32 
                        object-contain 
                        drop-shadow-xl
                        transform-gpu                           // Force GPU acceleration
                        ${settings.theme === 'dark' 
                          ? 'filter-none' 
                          : 'brightness-100 contrast-105'
                        }
                      `}
                      style={{ 
                        filter: settings.theme === 'dark' 
                          ? 'drop-shadow(0 0 12px rgba(147, 51, 234, 0.4)) brightness(1.1)' 
                          : 'drop-shadow(0 0 8px rgba(107, 33, 168, 0.3))',
                        willChange: 'transform',                // Hint to browser for optimization
                      }}
                    />
                  </motion.div>
                  
                  {/* Particles */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial="hidden"
                    animate="visible"
                  >
                    {renderParticles()}
                  </motion.div>
                  
                  {/* Sparkles */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial="hidden"
                    animate="visible"
                  >
                    {renderSparkles()}
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
                </div>
              </div>
            </div>
          </div>
        {/* Game Header */}
          <div className={`
            text-center 
            ${transitionClasses.base}
            transform-gpu
            ${gameState !== 'menu' 
              ? 'opacity-0 h-0 overflow-hidden translate-y-2' 
              : 'opacity-100 h-auto mb-2 xs:mb-4 sm:mb-6 translate-y-0'
            }
          `}>
            <div className="text-center mb-2 xs:mb-3 sm:mb-4">
              <h1 className={`
                relative inline-block 
                text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl
                font-extrabold 
                mb-1 xs:mb-2 sm:mb-3 
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
                text-xs xs:text-sm sm:text-base md:text-lg
                font-medium 
                mb-2 xs:mb-3 sm:mb-4
                mx-auto 
                max-w-[95%] xs:max-w-md sm:max-w-lg
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
            absolute top-2 right-2 xs:top-3 xs:right-3 sm:top-4 sm:right-4
            flex flex-col gap-2 
            transition-all duration-300 ease-in-out ${
              gameState !== 'menu' 
                ? 'opacity-0 scale-95 pointer-events-none' 
                : 'opacity-100 scale-100'
            }`}>
            {/* Music Toggle and Exit Button */}
            <MusicToggleButton 
              isMusicPlaying={isMusicPlaying} 
              handleMusicToggle={handleMusicToggle}
            />
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
            <div className={`fixed inset-0 w-screen h-screen overflow-hidden bg-black ${gameState !== 'menu' ? 'landscape-container' : 'landscape-disabled'}`}>
              <div 
                className={`game-container absolute inset-0 ${gameState !== 'menu' ? 'landscape-content' : ''}`}
                ref={containerRef}
                style={{
                  backgroundImage: `url(${floorBackground})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                }}
              >
                {/* Quit Button - Only show during PLAYING state */}
                {gameState === GAME_STATES.PLAYING && (
                  <>
                    <div className="absolute top-2 right-2 xs:top-3 xs:right-3 sm:top-4 sm:right-4 z-50">
                      <button
                        onClick={handleQuitClick}
                        className={`
                          group relative 
                          px-3 py-2 xs:px-4 xs:py-2.5
                          rounded-xl
                          font-medium 
                          transition-all duration-300 ease-out
                          hover:scale-105
                          flex items-center gap-2
                          ${settings.theme === 'dark'
                            ? 'bg-red-900/40 text-red-300 hover:text-red-200'
                            : 'bg-red-100/40 text-red-600 hover:text-red-500'
                          }
                        `}
                        aria-label="Quit Game"
                      >
                        <X className="h-5 w-5" />
                        <span className="text-sm font-medium">Quit</span>
                        
                        {/* Link Glow Effect */}
                        <div className={`
                          absolute inset-0
                          rounded-xl
                          transition-all duration-300
                          opacity-0 group-hover:opacity-100
                          ${settings.theme === 'dark'
                            ? 'bg-red-500/15 shadow-[0_0_25px_rgba(239,68,68,0.6)] border border-red-400/20' 
                            : 'bg-red-500/10 shadow-[0_0_25px_rgba(239,68,68,0.4)] border border-red-500/20'
                          }
                        `} />
                      </button>
                    </div>

                    {/* Quit Confirmation Dialog - Only show when showQuitConfirm is true */}
                    {showQuitConfirm && (
                      <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[1000]">
                        <div className={`
                          p-4 xs:p-5 sm:p-6 
                          rounded-xl 
                          text-center 
                          shadow-2xl
                          transform transition-all duration-300 ease-out
                          animate-fadeIn scale-100 
                          max-w-[320px] xs:max-w-[360px] w-full 
                          mx-4
                          ${settings.theme === 'dark' 
                            ? 'bg-gray-800/95 border border-red-500/20' 
                            : 'bg-white/95 border border-red-200'
                          }
                        `}>
                          <h2 className={`
                            text-xl xs:text-2xl font-bold mb-4
                            ${settings.theme === 'dark' ? 'text-red-300' : 'text-red-600'}
                          `}>
                            Quit Game?
                          </h2>
                          
                          <p className={`
                            mb-6 text-sm xs:text-base
                            ${settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
                          `}>
                            Are you sure you want to quit? Your current progress will be lost.
                          </p>

                          <div className="flex gap-3">
                            <button
                              onClick={() => setShowQuitConfirm(false)}
                              className={`
                                flex-1 px-4 py-2 rounded-lg font-bold text-sm xs:text-base
                                transition-all duration-200
                                hover:scale-105 active:scale-95
                                ${settings.theme === 'dark'
                                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }
                              `}
                            >
                              Cancel
                            </button>
                            
                            <button
                              onClick={handleConfirmQuit}
                              className={`
                                flex-1 px-4 py-2 rounded-lg font-bold text-sm xs:text-base
                                transition-all duration-200
                                hover:scale-105 active:scale-95
                                ${settings.theme === 'dark'
                                  ? 'bg-red-600 text-white hover:bg-red-500'
                                  : 'bg-red-500 text-white hover:bg-red-400'
                                }
                              `}
                            >
                              Quit Game
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Countdown Overlay */}
                {gameState === GAME_STATES.COUNTDOWN && countdown > 0 && (
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
                  <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-[1000] p-2 xs:p-4">
                    <div className={`
                      p-3 xs:p-4 sm:p-6 
                      rounded-xl 
                      text-center 
                      shadow-2xl
                      transform transition-all duration-300 ease-out
                      animate-fadeIn scale-100 
                      w-full
                      max-w-[280px] xs:max-w-[320px] sm:max-w-[360px]
                      mx-auto
                      overflow-y-auto
                      max-h-[95vh]
                      ${settings.theme === 'dark' 
                        ? 'bg-gray-800/95 border border-purple-500/20' 
                        : 'bg-white/95 border border-purple-200'
                      }
                    `}>
                      <h2 className={`
                        text-3xl xs:text-4xl sm:text-5xl font-bold 
                        mb-3 xs:mb-4 sm:mb-6
                        bg-gradient-to-r from-purple-400 to-pink-400 
                        bg-clip-text text-transparent
                        drop-shadow-lg
                      `}>
                        Game Over!
                      </h2>
                      
                      <div className={`
                        mb-4 xs:mb-6 sm:mb-8 space-y-2 xs:space-y-3
                        ${settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
                      `}>
                        <p className="text-xl xs:text-2xl font-semibold">
                          Final Score: <span className="text-purple-500">{gameStats.score}</span>
                        </p>
                        <p className="text-lg xs:text-xl">
                          High Score: <span className="text-purple-500">{gameStats.highscore}</span>
                        </p>
                      </div>

                      {/* Share Score Section */}
                      <div className="flex flex-col gap-3 xs:gap-4 mb-4 xs:mb-6">
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
                            w-full px-4 xs:px-6 py-2 xs:py-3 
                            rounded-xl font-bold 
                            text-base xs:text-lg
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
                        <div className="flex justify-center gap-2 xs:gap-4">
                          {/* Social Media Buttons */}
                          {['facebook', 'twitter', 'whatsapp'].map((platform) => (
                            <button
                              key={platform}
                              onClick={() => {
                                const shareText = encodeURIComponent(
                                  `🎮 I just scored ${score} points in Fetch & Feast! Can you beat my score? 🏆`
                                );
                                const url = encodeURIComponent(window.location.href);
                                const shareUrls = {
                                  facebook: `https://facebook.com/sharer/sharer.php?u=${url}&quote=${shareText}`,
                                  twitter: `https://twitter.com/intent/tweet?text=${shareText}&url=${url}`,
                                  whatsapp: `https://api.whatsapp.com/send?text=${shareText}\n${url}`
                                };
                                window.open(shareUrls[platform]);
                              }}
                              className={`
                                p-2 xs:p-3 rounded-xl 
                                transition-all duration-200
                                hover:scale-110 active:scale-95
                                shadow-lg
                                ${platform === 'facebook' ? 'bg-[#1877f2] hover:bg-[#0d6ce4] hover:shadow-[#1877f2]/30' :
                                  platform === 'twitter' ? 'bg-black hover:bg-gray-800 hover:shadow-black/30' :
                                  'bg-[#25D366] hover:bg-[#20bd5a] hover:shadow-[#25D366]/30'}
                                text-white
                              `}
                            >
                              {platform === 'facebook' ? <FacebookIcon className="w-5 h-5 xs:w-7 xs:h-7" /> :
                               platform === 'twitter' ? <TwitterIcon className="w-5 h-5 xs:w-7 xs:h-7" /> :
                               <WhatsAppIcon className="w-5 h-5 xs:w-7 xs:h-7" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Game Area Container */}
                <div 
                  className="absolute inset-0 p-4"
                  style={{
                    touchAction: 'none',
                  }}
                >
                  {renderButton()}
                </div>
              </div>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center gap-2 xs:gap-3 sm:gap-4 my-2 xs:my-4 p-2 xs:p-4 rounded-lg ${
              settings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              {showUsernameInput && !localStorage.getItem('username') ? (
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
                <div className="flex flex-col gap-2 xs:gap-3 items-center">
                <button
                  onClick={handleStartGame}
                  className={`
                    w-full max-w-[280px] py-3 xs:py-3.5 px-4 xs:px-6 
                    rounded-xl
                    font-bold text-base xs:text-lg
                    transition-all duration-200 transform 
                    hover:scale-[1.02] active:scale-[0.98]
                    flex items-center justify-center gap-2
                    shadow-lg hover:shadow-xl
                    ${settings.theme === 'dark'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                      : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white'
                    }
                  `}
                >
                  <LucidePlay className="h-5 w-5" />
                  Quick Play
                </button>

                {/* Add Level Select Button */}
                <button
                  onClick={() => {
                    setGameState(GAME_STATES.LEVELSELECT);
                    navigate('/levels');
                  }}
                  className={`
                    w-full max-w-[280px] py-3 xs:py-3.5 px-4 xs:px-6 
                    rounded-xl
                    font-bold text-base xs:text-lg
                    transition-all duration-200 transform 
                    hover:scale-[1.02] active:scale-[0.98]
                    flex items-center justify-center gap-2
                    shadow-lg hover:shadow-xl
                    ${settings.theme === 'dark'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white'
                    }
                  `}
                >
                  <Layers className="h-5 w-5" />
                  Select Level
                </button>

                {/* Shop Button */}
                <Link
                  to="/shop"
                  className={`w-full max-w-xs py-2 xs:py-3 px-4 xs:px-6 rounded-lg font-semibold text-center 
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
                <h3 className={`
                  text-base xs:text-lg sm:text-xl
                  font-bold
                  mt-2 xs:mt-3 mb-1 xs:mb-2
                  text-center
                  ${settings.theme === 'dark' ? 'text-purple-200' : 'text-purple-700'}
                `}>
                  Your Puppies Quests
                </h3>

                <div className="flex w-full max-w-xs gap-2">
                  {/* Daily Quests Button */}
                  <button
                    onClick={() => setShowDailyQuests(true)}
                    className={`
                      flex-1 py-2 px-3 rounded-lg font-bold
                      text-sm xs:text-base
                      transition-all duration-200 transform hover:scale-105
                      flex items-center justify-center gap-1 xs:gap-2
                      shadow-lg hover:shadow-xl
                      min-w-[100px] w-1/2
                      ${settings.theme === 'dark'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                        : 'bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white'
                      }
                    `}
                  >
                    <Clock className="h-4 w-4 xs:h-5 xs:w-5" />
                    Daily
                  </button>

                  {/* Weekly Quests Button */}
                  <button
                    onClick={() => setShowWeeklyQuests(true)}
                    className={`
                      flex-1 py-2 px-3 rounded-lg font-bold
                      text-sm xs:text-base
                      transition-all duration-200 transform hover:scale-105
                      flex items-center justify-center gap-1 xs:gap-2
                      shadow-lg hover:shadow-xl
                      min-w-[100px] w-1/2
                      ${settings.theme === 'dark'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white'
                        : 'bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 text-white'
                      }
                    `}
                  >
                    <LucideCalendar className="h-4 w-4 xs:h-5 xs:w-5" />
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

                {/* Tutorial trigger button */}
                {!hasCompletedTutorial && (
                  <button
                    onClick={startTutorial}
                    className={`
                      w-full max-w-xs py-2 px-4
                      text-sm xs:text-base
                      rounded-lg font-bold
                      transition-all duration-200 
                      transform hover:scale-105
                      mt-1 xs:mt-2
                      ${settings.theme === 'dark'
                        ? 'bg-purple-600 hover:bg-purple-500 text-white'
                        : 'bg-purple-500 hover:bg-purple-400 text-white'
                      }
                    `}
                  >
                    Start Tutorial
                  </button>
                )}
              </div>
              )}
            </div>
          )}
            {/* Exit Confirmation Dialog - Position it in the center of the viewport */}
            {showExitConfirm && (
              <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[99999]" style={{ position: 'fixed', zIndex: 99999 }}>
                <div className={`
                  p-4 xs:p-5 
                  rounded-xl 
                  text-center 
                  shadow-2xl
                  transform transition-all duration-300 ease-out
                  animate-fadeIn scale-100 
                  w-[280px] xs:w-[320px]
                  ${settings.theme === 'dark' 
                    ? 'bg-gray-800/95 border border-red-500/20' 
                    : 'bg-white/95 border border-red-200'
                  }
                `}>
                  <h2 className={`
                    text-xl font-bold mb-3
                    ${settings.theme === 'dark' ? 'text-red-300' : 'text-red-600'}
                  `}>
                    Exit Application?
                  </h2>
                  
                  <p className={`
                    mb-4 text-base
                    ${settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
                  `}>
                    Are you sure you want to exit?
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowExitConfirm(false)}
                      className={`
                        flex-1 px-4 py-2.5 
                        rounded-lg 
                        font-bold 
                        text-base
                        transition-all duration-200
                        hover:scale-105 active:scale-95
                        ${settings.theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }
                      `}
                    >
                      Cancel
                    </button>
                    
                    <button
                      onClick={handleExitApp}
                      className={`
                        flex-1 px-4 py-2.5
                        rounded-lg 
                        font-bold 
                        text-base
                        transition-all duration-200
                        hover:scale-105 active:scale-95
                        ${settings.theme === 'dark'
                          ? 'bg-red-600 text-white hover:bg-red-500'
                          : 'bg-red-500 text-white hover:bg-red-400'
                        }
                      `}
                    >
                      Exit
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Tutorial component */}
            <Tutorial theme={settings.theme} />
        </div>
      </div>
  );
};

const PopItGameUI = (props) => {
  return (
    <TutorialProvider>
      <GameContent {...props} />
    </TutorialProvider>
  );
};

export default PopItGameUI;