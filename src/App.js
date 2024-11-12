import React, { useState, useEffect } from 'react';
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
    const handleTouch = (e) => {
      const touch = e.touches[0];
      const cursor = document.createElement('div');
      cursor.className = 'touch-cursor';
      cursor.style.left = `${touch.clientX}px`;
      cursor.style.top = `${touch.clientY}px`;
      document.body.appendChild(cursor);

      setTimeout(() => {
        cursor.remove();
      }, 500); // Adjust duration as needed
    };

    document.addEventListener('touchstart', handleTouch);
    return () => document.removeEventListener('touchstart', handleTouch);
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

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<Navigate to="/game" replace />} />
      <Route 
        path="/game" 
        element={
          <AnimatedPage>
            <PopItGame />
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
            <PlayerProfile />
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
        <MobileOptimizer />
        <PlayerProvider>
          <SplashScreenWrapper 
            onComplete={handleSplashComplete} 
            loadingProgress={loadingProgress}
            loadingMessage={loadingMessage}
          />
        </PlayerProvider>
      </SettingsProvider>
    );
  }

  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

// New component to handle the themed content
function AppContent() {
  const { settings } = useSettings();
  
  return (
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
        <NavigationBar />
      </div>
    </div>
  );
}

export default App;