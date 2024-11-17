import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import PopItGame from './PopItGame';
import About from './About';
import Settings from './Settings';
import { SettingsProvider, useSettings } from './Settings';
import Leaderboard from './Leaderboard';
import PlayerProfile from './PlayerProfile';
import { PlayerProvider } from './utils/PlayerContext';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { Toaster } from 'react-hot-toast';
import Shop from './components/Shop';
import NavigationBar from './components/NavigationBar';
import MobileOptimizer from './components/MobileOptimizer';
import './styles/SplashScreen.css';
import { AnimatePresence, motion } from 'framer-motion';
import assetLoader from './utils/assetLoader';
import LevelSelect from './components/LevelSelect';
import { GAME_STATES } from './PopItGame';

// Create a GameStateContext
export const GameStateContext = createContext();

// Update SplashScreen component
const SplashScreen = ({ onAnimationEnd, loadingProgress, loadingMessage }) => {
  useEffect(() => {
    if (loadingProgress === 100) {
      const splash = document.querySelector('.splash-screen');
      splash.classList.add('fade-out');
      
      const handleAnimationEnd = () => {
        splash.removeEventListener('animationend', handleAnimationEnd);
        onAnimationEnd();
      };
      
      splash.addEventListener('animationend', handleAnimationEnd);
    }
  }, [loadingProgress, onAnimationEnd]);

  return (
    <div className="splash-screen">
      <div className="particles"></div>
      <div className="logo-container">
        <img 
          src="/assets/logo/debis-high-res-logo-transp.png" 
          alt="Game Logo" 
          className="logo"
          style={{
            maxWidth: '80vw',
            width: 'auto',
            height: 'auto',
            maxHeight: '40vh',
            objectFit: 'contain',
            margin: '0 auto'
          }}
        />
        <div className="loading-container"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            marginTop: '20px'
          }}>
          <div className="loading-message"
            style={{
              fontSize: 'clamp(14px, 3vw, 20px)',
              textAlign: 'center',
              minHeight: '24px',
              color: '#ffffff',
              textShadow: '0 0 10px rgba(255,255,255,0.5)'
            }}>
            {loadingMessage || 'Loading...'}
          </div>
          <div className="loading-progress"
            style={{
              fontSize: 'clamp(16px, 4vw, 24px)',
              textAlign: 'center',
              color: '#ffffff',
              textShadow: '0 0 10px rgba(255,255,255,0.5)'
            }}>
            {loadingProgress}%
          </div>
        </div>
      </div>
    </div>
  );
};

// Update SplashScreenWrapper
const SplashScreenWrapper = ({ onComplete, loadingProgress, loadingMessage }) => {
  const navigate = useNavigate();

  const handleAnimationEnd = () => {
    onComplete();
    navigate('/game');
  };

  return (
    <SplashScreen 
      onAnimationEnd={handleAnimationEnd} 
      loadingProgress={loadingProgress}
      loadingMessage={loadingMessage}
    />
  );
};

// Add this new component
const TouchCursorHandler = () => {
  useEffect(() => {
    const cursor = document.createElement('div');
    cursor.className = 'touch-cursor';
    cursor.style.display = 'none';
    document.body.appendChild(cursor);

    const handleTouch = (e) => {
      // Don't prevent default behavior - allow buttons to work
      // Only prevent default for specific elements if needed
      const target = e.target;
      if (target.tagName === 'IMG') {
        e.preventDefault();
      }
      
      if (!e.touches[0]) return;
      
      const touch = e.touches[0];
      
      // Show and position the cursor
      cursor.style.display = 'block';
      cursor.style.left = `${touch.clientX}px`;
      cursor.style.top = `${touch.clientY}px`;
      
      // Reset animation
      cursor.classList.remove('active');
      void cursor.offsetWidth;
      cursor.classList.add('active');
    };

    const handleTouchEnd = () => {
      cursor.style.display = 'none';
      cursor.classList.remove('active');
    };

    // Add event listeners with passive: true for better performance
    document.addEventListener('touchstart', handleTouch, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      document.removeEventListener('touchstart', handleTouch);
      document.removeEventListener('touchend', handleTouchEnd);
      cursor.remove();
    };
  }, []);

  return null;
};

// Add these styles to your existing AnimatedPage component
const AnimatedPage = ({ children }) => {
  const { settings } = useSettings();
  
  const isDark = settings.theme === 'dark';
    
  return (
    <motion.div
      initial={{ 
        opacity: 0,
        scale: 1.1,
        y: 20,
        filter: isDark 
          ? 'brightness(0.3) saturate(1.2)' 
          : 'none',
      }}
      animate={{ 
        opacity: 1,
        scale: 1,
        y: 0,
        filter: 'none',
      }}
      exit={{ 
        opacity: 0,
        scale: 0.95,
        y: -20,
        filter: isDark 
          ? 'brightness(0.3) saturate(1.2)' 
          : 'none',
      }}
      transition={{ 
        type: "spring",
        stiffness: 400,
        damping: 30,
        mass: 0.8,
        duration: 0.3
      }}
      style={{
        width: '100%',
        minHeight: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        willChange: 'transform, opacity',
        overflowY: 'auto',
        overflowX: 'hidden',
        zIndex: 1,
        cursor: 'url(/assets/images/pawCursor.png), auto',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
        WebkitUserDrag: 'none',
        touchAction: 'manipulation',
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
          mass: 0.8,
          delay: 0.1
        }}
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

// Add this new component
const ScrollHandler = () => {
  const { settings } = useSettings();
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 0;
      setIsSticky(isScrolled);
      
      // Set background color based on theme when scrolled
      document.body.style.backgroundColor = isScrolled 
        ? settings.theme === 'dark' ? 'bg-gray-800' : '#bg-gray-100'
        : '';
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [settings.theme]);

  return null;
};

// Separate Routes component to use settings context
const AppRoutes = () => {
  const { settings } = useSettings();
  const location = useLocation();
  const { gameState, setGameState } = useContext(GameStateContext);

  return (
    <Routes location={location} key={location.pathname}>
      <Route 
        path="/" 
        element={
          <AnimatedPage>
            <PopItGame gameState={gameState} setGameState={setGameState} />
          </AnimatedPage>
        } 
      />
      <Route 
        path="/game" 
        element={
          <AnimatedPage>
            <PopItGame gameState={gameState} setGameState={setGameState} />
          </AnimatedPage>
        } 
      />
      <Route 
        path="/about" 
        element={
          <AnimatedPage>
            <About settings={settings} />
          </AnimatedPage>
        } 
      />
      <Route 
        path="/levels" 
        element={
          <AnimatedPage>
            <LevelSelect gameState={gameState} setGameState={setGameState} />
          </AnimatedPage>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <AnimatedPage>
            <Settings />
          </AnimatedPage>
        } 
      />
      <Route 
        path="/leaderboard" 
        element={
          <AnimatedPage>
            <Leaderboard />
          </AnimatedPage>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <AnimatedPage>
            <PlayerProfile gameState={gameState} setGameState={setGameState} />
          </AnimatedPage>
        } 
      />
      <Route 
        path="/shop" 
        element={
          <AnimatedPage>
            <Shop />
          </AnimatedPage>
        } 
      />
    </Routes>
  );
};

// Main App component
function App() {
  const [showSplash, setShowSplash] = useState(() => {
    return !localStorage.getItem('hasVisited');
  });
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [gameState, setGameState] = useState(() => {
    const savedState = localStorage.getItem('gameState');
    return savedState ? JSON.parse(savedState) : GAME_STATES.MENU;
  });

  useEffect(() => {
    const loadGameAssets = async () => {
      if (assetLoader.assetsLoaded) {
        setAssetsLoaded(true);
        setLoadingProgress(100);
        return;
      }

      try {
        const assets = await assetLoader.scanProjectAssets();
        await assetLoader.loadAssetsOnce(assets, (progress, message) => {
          setLoadingProgress(Math.round(progress));
          if (message) setLoadingMessage(message);
        });
        setAssetsLoaded(true);
      } catch (error) {
        console.error('Failed to load assets:', error);
        setAssetsLoaded(true);
      }
    };

    loadGameAssets();
  }, []);

  const handleSplashComplete = () => {
    localStorage.setItem('hasVisited', 'true');
    setShowSplash(false);
  };

  // Only show splash on first ever visit
  if (showSplash && !localStorage.getItem('hasVisited')) {
    return (
      <SettingsProvider>
        <GameStateContext.Provider value={{ gameState, setGameState }}>
          <MobileOptimizer />
          <PlayerProvider>
            <SplashScreenWrapper 
              onComplete={handleSplashComplete} 
              loadingProgress={loadingProgress}
              loadingMessage={loadingMessage}
            />
          </PlayerProvider>
        </GameStateContext.Provider>
      </SettingsProvider>
    );
  }

  return (
    <SettingsProvider>
      <GameStateContext.Provider value={{ gameState, setGameState }}>
        <AppContent />
      </GameStateContext.Provider>
    </SettingsProvider>
  );
}

// New component to handle the themed content
function AppContent() {
  const { settings } = useSettings();
  const location = useLocation();
  const { gameState, setGameState } = useContext(GameStateContext);
  
  // Add effect to save state changes
  useEffect(() => {
    try {
      localStorage.setItem('gameState', JSON.stringify(gameState));
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }, [gameState]);
  
  // Debug log to check state changes
  useEffect(() => {
    console.log('Current game state:', gameState);
  }, [gameState]);

  return (
    <GameStateContext.Provider value={{ gameState, setGameState }}>
      <div className={`app-wrapper ${
        settings.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
      }`}>
        <div className="content-container">
          <MobileOptimizer />
          <PlayerProvider>
            <div className="App">
              <TouchCursorHandler />
              <ScrollHandler /> 
              <ToastContainer />
              <Toaster position="top-center" />
              <AnimatePresence mode="sync">
                <AppRoutes />
              </AnimatePresence>
            </div>
          </PlayerProvider>
          <div className={`
            transition-opacity duration-300
            ${(gameState !== GAME_STATES.MENU && location.pathname === '/') 
              ? 'opacity-0 pointer-events-none' 
              : 'opacity-100'
            }`}>
            <NavigationBar gameState={gameState} setGameState={setGameState}/>
          </div>
        </div>
      </div>
    </GameStateContext.Provider>
  );
}

export default App;