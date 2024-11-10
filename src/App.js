import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
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

// Add the SplashScreen component
const SplashScreen = ({ onAnimationEnd }) => {
  const handleSkip = () => {
    const splash = document.querySelector('.splash-screen');
    splash.classList.add('fade-out');
    
    const handleAnimationEnd = () => {
      splash.removeEventListener('animationend', handleAnimationEnd);
      onAnimationEnd();
    };
    
    splash.addEventListener('animationend', handleAnimationEnd);
  };

  useEffect(() => {
    // Create particles
    const createParticles = () => {
      const particlesContainer = document.querySelector('.particles');
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.width = Math.random() * 4 + 2 + 'px';
        particle.style.height = particle.style.width;
        particle.style.animationDelay = Math.random() * 2 + 's';
        particlesContainer.appendChild(particle);
      }
    };

    createParticles();

    const timer = setTimeout(() => {
      const splash = document.querySelector('.splash-screen');
      if (splash) {
        splash.classList.add('fade-out');
        
        const handleAnimationEnd = () => {
          splash.removeEventListener('animationend', handleAnimationEnd);
          onAnimationEnd();
        };
        
        splash.addEventListener('animationend', handleAnimationEnd);
      }
    }, 3000);

    return () => {
      clearTimeout(timer);
      const splash = document.querySelector('.splash-screen');
      if (splash) {
        splash.removeEventListener('animationend', onAnimationEnd);
      }
    };
  }, [onAnimationEnd]);

  return (
    <>
      <MobileOptimizer />
      <div className="splash-screen">
        <div className="particles"></div>
        <div className="logo-container">
          <img 
            src="/assets/logo/debis-high-res-logo-transp.png" 
            alt="Game Logo" 
            className="logo"
            style={{
              maxWidth: '90vw',
              height: 'auto',
              maxHeight: '50vh'
            }}
          />
        </div>
        <button 
          className="skip-button" 
          onClick={handleSkip}
          style={{
            position: 'absolute',
            bottom: '10vh',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 20px',
            fontSize: 'clamp(14px, 4vw, 18px)'
          }}
        >
          Skip Intro
        </button>
      </div>
    </>
  );
};

// Create a separate component for the main app content
const MainContent = () => {
  const { settings } = useSettings();
  const location = useLocation();
  
  return (
    <>
      <MobileOptimizer />
      <ToastContainer />
      <Toaster position="top-center" />
      <div className="App">
        <AnimatePresence mode="sync">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={
              <AnimatedPage>
                <PopItGame />
              </AnimatedPage>
            } />
            <Route path="/about" element={
              <AnimatedPage>
                <NavigationBar theme={settings.theme} />
                <About settings={settings} />
              </AnimatedPage>
            } />
            <Route path="/settings" element={
              <AnimatedPage>
                <NavigationBar theme={settings.theme} />
                <Settings />
              </AnimatedPage>
            } />
            <Route path="/leaderboard" element={
              <AnimatedPage>
                <NavigationBar theme={settings.theme} />
                <Leaderboard />
              </AnimatedPage>
            } />
            <Route path="/profile" element={
              <AnimatedPage>
                <NavigationBar theme={settings.theme} />
                <PlayerProfile />
              </AnimatedPage>
            } />
            <Route path="/shop" element={
              <AnimatedPage>
                <NavigationBar theme={settings.theme} />
                <Shop />
              </AnimatedPage>
            } />
          </Routes>
        </AnimatePresence>
      </div>
    </>
  );
};

// Create a wrapper component for the splash screen that handles navigation
const SplashScreenWrapper = ({ onComplete }) => {
  const navigate = useNavigate();

  const handleAnimationEnd = () => {
    onComplete();
    navigate('/');
  };

  return <SplashScreen onAnimationEnd={handleAnimationEnd} />;
};

// Add this new component
const AnimatedPage = ({ children }) => {
  const { settings } = useSettings();
  
  const isDark = settings.theme === 'dark';
  const initialBg = isDark ? 'rgba(88, 28, 135, 0.4)' : 'rgba(243, 232, 255, 0.4)';
  const finalBg = isDark ? 'rgba(88, 28, 135, 0.4)' : 'rgba(243, 232, 255, 0.4)';
  
  return (
    <motion.div
      initial={{ 
        opacity: 0,
        backgroundColor: initialBg,
        scale: 1.1,
        y: 20,
        filter: isDark 
          ? 'brightness(0.3) saturate(1.2)' 
          : 'none',
      }}
      animate={{ 
        opacity: 1,
        backgroundColor: finalBg,
        scale: 1,
        y: 0,
        filter: 'none',
      }}
      exit={{ 
        opacity: 0,
        backgroundColor: initialBg,
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
        position: 'absolute',
        top: 0,
        left: 0,
        willChange: 'transform, opacity',
        backgroundColor: isDark ? '#1a1a1a' : undefined,
        overflow: 'hidden'
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
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

// Main App component
function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    console.log('Splash screen complete');
    setShowSplash(false);
  };

  return (
    <SettingsProvider>
      <PlayerProvider>
        {showSplash ? (
          <SplashScreenWrapper onComplete={handleSplashComplete} />
        ) : (
          <MainContent />
        )}
      </PlayerProvider>
    </SettingsProvider>
  );
}

export default App;