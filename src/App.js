import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PopItGame from './PopItGame';
import About from './About';
import Settings from './Settings';
import { SettingsProvider } from './Settings';
import Leaderboard from './Leaderboard';
import PlayerProfile from './PlayerProfile';

function App() {
  return (
    <SettingsProvider>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<PopItGame />} />
            <Route path="/about" element={<About />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<PlayerProfile />} />
          </Routes>
        </Router>
      </div>
    </SettingsProvider>
  );
}

export default App;
