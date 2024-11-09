import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
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

// Create a wrapper component to access the context
const AppRoutes = () => {
  const { settings } = useSettings();
  
  return (
    <>
      <Routes>
        {/* Show NavigationBar for all routes except root "/" */}
        <Route path="/*" element={
          <>
            <NavigationBar theme={settings.theme} />
            <Routes>
              <Route path="/about" element={<About settings={settings} />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/profile" element={<PlayerProfile />} />
              <Route path="/shop" element={<Shop />} />
            </Routes>
          </>
        } />
        <Route path="/" element={<PopItGame />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <MobileOptimizer />
      <SettingsProvider>
        <PlayerProvider>
          <ToastContainer />
          <Toaster position="top-center" />
          <div className="App">
            <AppRoutes />
          </div>
        </PlayerProvider>
      </SettingsProvider>
    </Router>
  );
}

export default App;