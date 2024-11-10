import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
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
    <div className="splash-screen">
      <div className="particles"></div>
      <div className="logo-container">
        <img src="/assets/logo/debis-high-res-logo-transp.png" alt="Game Logo" className="logo" />
      </div>
      <button className="skip-button" onClick={handleSkip}>
        Skip Intro
      </button>
    </div>
  );
};

// Create a separate component for the main app content
const MainContent = () => {
  const { settings } = useSettings();
  
  return (
    <>
      <MobileOptimizer />
      <ToastContainer />
      <Toaster position="top-center" />
      <div className="App">
        <Routes>
          <Route path="/" element={<PopItGame />} />
          <Route path="/about" element={
            <>
              <NavigationBar theme={settings.theme} />
              <About settings={settings} />
            </>
          } />
          <Route path="/settings" element={
            <>
              <NavigationBar theme={settings.theme} />
              <Settings />
            </>
          } />
          <Route path="/leaderboard" element={
            <>
              <NavigationBar theme={settings.theme} />
              <Leaderboard />
            </>
          } />
          <Route path="/profile" element={
            <>
              <NavigationBar theme={settings.theme} />
              <PlayerProfile />
            </>
          } />
          <Route path="/shop" element={
            <>
              <NavigationBar theme={settings.theme} />
              <Shop />
            </>
          } />
        </Routes>
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