import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PopItGame from './PopItGame';
import About from './About';
import Settings from './Settings';
import { SettingsProvider, useSettings } from './Settings';
import Leaderboard from './Leaderboard';
import PlayerProfile from './PlayerProfile';
import { PlayerProvider } from './utils/PlayerContext';

// Create a wrapper component to access the context
const AppRoutes = () => {
  const { settings } = useSettings(); // Using the custom hook instead of useContext
  
  return (
    <Routes>
      <Route path="/" element={<PopItGame />} />
      <Route path="/about" element={<About settings={settings} />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/profile" element={<PlayerProfile />} />
    </Routes>
  );
};

function App() {
  return (
    <SettingsProvider>
      <PlayerProvider>
        <div className="App">
          <Router>
            <AppRoutes />
          </Router>
        </div>
      </PlayerProvider>
    </SettingsProvider>
  );
}

export default App;