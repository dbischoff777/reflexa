import React, { createContext, useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 

const SettingsContext = createContext();

const defaultSettings = {
  difficulty: 'medium', // easy, medium, hard
  gridSize: 4, // 4x4 default
  theme: 'light', // light, dark
  countdownTimer: true,
  vibration: true,
  soundEnabled: true,
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    // Try to load settings from localStorage on initial render
    const savedSettings = localStorage.getItem('gameSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('gameSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

// Settings component
const Settings = () => {
  const { settings, updateSettings } = useSettings();
  const navigate = useNavigate(); // Add navigation hook

  const handleToggleSound = () => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  const handleDifficultyChange = (e) => {
    updateSettings({ difficulty: e.target.value });
  };

  const handleGridSizeChange = (e) => {
    updateSettings({ gridSize: parseInt(e.target.value) });
  };

  const handleThemeChange = () => {
    updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' });
  };

  const handleToggleCountdown = () => {
    updateSettings({ countdownTimer: !settings.countdownTimer });
  };

  const handleToggleVibration = () => {
    updateSettings({ vibration: !settings.vibration });
  };

  return (
    <div className={`min-h-screen w-full fixed inset-0 ${
      settings.theme === 'dark' 
        ? 'bg-gray-800 text-white' 
        : 'bg-gray-50 text-gray-900'  // Changed from bg-gray-100
    }`}>
      <div className={`p-4 max-w-md mx-auto mt-16 rounded-lg shadow-lg overflow-y-auto ${
        settings.theme === 'dark'
          ? 'bg-gray-700 text-white'
          : 'bg-gray-100'  // Changed from bg-gradient-to-b from-purple-100 to-white
      }`}>
        <h2 className={`text-2xl font-bold mb-6 ${
          settings.theme === 'dark' ? 'text-white' : 'text-purple-800'
        }`}>
          Game Settings
        </h2>
  
        {/* Sound Settings */}
        <div className="mb-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={handleToggleSound}
              className="form-checkbox h-5 w-5 text-purple-800 rounded focus:ring-purple-800"
            />
            <span className={`font-medium ${
              settings.theme === 'dark' ? 'text-white' : 'text-gray-700'  // Changed from text-purple-900
            }`}>Sound Effects</span>
          </label>
        </div>
  
        {/* Difficulty Settings */}
        <div className="mb-6">
          <label className={`block font-medium mb-2 ${
            settings.theme === 'dark' ? 'text-white' : 'text-gray-700'  // Changed from text-purple-900
          }`}>
            Difficulty
          </label>
          <select
            value={settings.difficulty}
            onChange={handleDifficultyChange}
            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
              settings.theme === 'dark'
                ? 'bg-gray-600 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-700'  // Changed from border-purple-300 text-purple-900
            }`}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
  
        {/* Grid Size Settings */}
        <div className="mb-6">
          <label className={`block font-medium mb-2 ${
            settings.theme === 'dark' ? 'text-white' : 'text-gray-700'  // Changed from text-purple-900
          }`}>
            Grid Size
          </label>
          <select
            value={settings.gridSize}
            onChange={handleGridSizeChange}
            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
              settings.theme === 'dark'
                ? 'bg-gray-600 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-700'  // Changed from border-purple-300 text-purple-900
            }`}
          >
            <option value="3">3x3</option>
            <option value="4">4x4</option>
            <option value="5">5x5</option>
          </select>
        </div>
  
        {/* Theme Toggle */}
        <div className="mb-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.theme === 'dark'}
              onChange={handleThemeChange}
              className="form-checkbox h-5 w-5 text-purple-800 rounded focus:ring-purple-800"
            />
            <span className={`font-medium ${
              settings.theme === 'dark' ? 'text-white' : 'text-gray-700'  // Changed from text-purple-900
            }`}>Dark Theme</span>
          </label>
        </div>
  
        {/* Countdown Timer Toggle */}
        <div className="mb-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.countdownTimer}
              onChange={handleToggleCountdown}
              className="form-checkbox h-5 w-5 text-purple-800 rounded focus:ring-purple-800"
            />
            <span className={`font-medium ${
              settings.theme === 'dark' ? 'text-white' : 'text-gray-700'  // Changed from text-purple-900
            }`}>Show Countdown Timer</span>
          </label>
        </div>
  
        {/* Vibration Toggle */}
        <div className="mb-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.vibration}
              onChange={handleToggleVibration}
              className="form-checkbox h-5 w-5 text-purple-800 rounded focus:ring-purple-800"
            />
            <span className={`font-medium ${
              settings.theme === 'dark' ? 'text-white' : 'text-gray-700'  // Changed from text-purple-900
            }`}>Vibration</span>
          </label>
        </div>
  
        {/* Save Button */}
        <div className="mt-8">
          <button
            onClick={() => navigate('/')}
            className={`w-full py-3 px-4 rounded-md transition-colors duration-200 font-semibold shadow-md hover:shadow-lg ${
              settings.theme === 'dark'
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'  // Kept consistent for button
            }`}
          >
            Save & Return to Game
          </button>
        </div>
      </div>
    </div>
  );
  

};

export default Settings;