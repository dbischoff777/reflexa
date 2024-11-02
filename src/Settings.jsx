import React, { createContext, useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useScreenProtection } from './hooks/useScreenProtection';

const SettingsContext = createContext();

const defaultSettings = {
  difficulty: 'medium',
  gridSize: 4,
  theme: 'light',
  countdownTimer: true,
  vibration: true,
  soundEnabled: true,
};

const Switch = ({ checked, onChange, className, children }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={className}
    >
      {children}
    </button>
  );
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('gameSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  const [screenProtection, setScreenProtection] = useState(() => {
    const savedSettings = localStorage.getItem('screenProtection');
    return savedSettings ? JSON.parse(savedSettings) : {
      autoBrightness: true,
      nightMode: true,
      brightness: 70,
    };
  });

  useEffect(() => {
    localStorage.setItem('gameSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('screenProtection', JSON.stringify(screenProtection));
  }, [screenProtection]);

  const updateSettings = (newSettings) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, screenProtection, setScreenProtection }}>
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

const Settings = () => {
  const { settings, updateSettings, screenProtection, setScreenProtection } = useSettings();
  const navigate = useNavigate();
  const { adjustBrightness, adjustColorTemperature } = useScreenProtection();

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
    <div className={`settings-controls min-h-screen w-full fixed inset-0 ${
      settings.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className={`p-4 max-w-md mx-auto mt-16 rounded-lg shadow-lg overflow-y-auto ${
        settings.theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100'
      }`}>
        <h2 className={`text-2xl font-bold mb-6 ${
          settings.theme === 'dark' ? 'text-white' : 'text-purple-800'
        }`}>
          Game Settings
        </h2>

        {/* Screen Protection Settings */}
        <div className={`p-6 rounded-lg mb-4 ${
          settings.theme === 'dark' ? 'bg-gray-600' : 'bg-white'
        } shadow-lg`}>
          <h3 className="text-xl font-bold mb-4">Screen Protection</h3>
          
          {/* Auto Brightness Control */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center">
                <Sun className="w-5 h-5 mr-2" />
                Auto Brightness
              </label>
              <Switch
                checked={screenProtection.autoBrightness}
                onChange={(checked) => {
                  setScreenProtection(prev => ({...prev, autoBrightness: checked}));
                  if (checked) {
                    adjustBrightness();
                  }
                }}
                className={`${
                  screenProtection.autoBrightness ? 'bg-purple-600' : 'bg-gray-400'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span
                  className={`${
                    screenProtection.autoBrightness ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
            </div>
            {screenProtection.autoBrightness && (
            <div className="mt-2">
              <label className="block text-sm mb-1">Brightness Level</label>
              <div className="relative">
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={screenProtection.brightness}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setScreenProtection(prev => ({...prev, brightness: value}));
                  }}
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer 
                    ${settings.theme === 'dark' ? 'bg-gray-500' : 'bg-gray-200'}
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-white
                    [&::-webkit-slider-thumb]:shadow-md
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:translate-y-[-3px]
                    [&::-moz-range-thumb]:appearance-none
                    [&::-moz-range-thumb]:w-4
                    [&::-moz-range-thumb]:h-4
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-white
                    [&::-moz-range-thumb]:shadow-md
                    [&::-moz-range-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:border-0
                    [&::-ms-thumb]:appearance-none
                    [&::-ms-thumb]:w-4
                    [&::-ms-thumb]:h-4
                    [&::-ms-thumb]:rounded-full
                    [&::-ms-thumb]:bg-white
                    [&::-ms-thumb]:shadow-md
                    [&::-ms-thumb]:cursor-pointer`}
                  style={{
                    background: `linear-gradient(to right, 
                      ${settings.theme === 'dark' ? '#9333ea' : '#7e22ce'} 0%, 
                      ${settings.theme === 'dark' ? '#9333ea' : '#7e22ce'} ${((screenProtection.brightness - 20) / 80) * 100}%, 
                      ${settings.theme === 'dark' ? '#374151' : '#e5e7eb'} ${((screenProtection.brightness - 20) / 80) * 100}%, 
                      ${settings.theme === 'dark' ? '#374151' : '#e5e7eb'} 100%)`
                  }}
                />
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>20%</span>
                <span>{screenProtection.brightness}%</span>
                <span>100%</span>
              </div>
            </div>
          )}
          </div>

          {/* Night Mode */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <Moon className="w-5 h-5 mr-2" />
                Night Mode (Auto)
              </label>
              <Switch
                checked={screenProtection.nightMode}
                onChange={(checked) => {
                  setScreenProtection(prev => ({...prev, nightMode: checked}));
                  if (checked) {
                    adjustColorTemperature();
                  } else {
                    document.documentElement.style.filter = 'none';
                  }
                }}
                className={`${
                  screenProtection.nightMode ? 'bg-purple-600' : 'bg-gray-400'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span
                  className={`${
                    screenProtection.nightMode ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Automatically adjusts color temperature between 6 PM and 6 AM
            </p>
          </div>
        </div>

        {/* Game Settings */}
        <div className="space-y-6">
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
                settings.theme === 'dark' ? 'text-white' : 'text-gray-700'
              }`}>Sound Effects</span>
            </label>
          </div>

          {/* Difficulty Settings */}
          <div className="mb-6">
            <label className={`block font-medium mb-2 ${
              settings.theme === 'dark' ? 'text-white' : 'text-gray-700'
            }`}>
              Difficulty
            </label>
            <select
              value={settings.difficulty}
              onChange={handleDifficultyChange}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                settings.theme === 'dark'
                  ? 'bg-gray-600 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-700'
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
              settings.theme === 'dark' ? 'text-white' : 'text-gray-700'
            }`}>
              Grid Size
            </label>
            <select
              value={settings.gridSize}
              onChange={handleGridSizeChange}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                settings.theme === 'dark'
                  ? 'bg-gray-600 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-700'
              }`}
            >
              <option value="2">2x2</option>
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
                settings.theme === 'dark' ? 'text-white' : 'text-gray-700'
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
                settings.theme === 'dark' ? 'text-white' : 'text-gray-700'
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
                settings.theme === 'dark' ? 'text-white' : 'text-gray-700'
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
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              Save & Return to Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
