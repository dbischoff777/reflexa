import React, { createContext, useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, ArrowLeftIcon } from 'lucide-react';
import { useScreenProtection } from './hooks/useScreenProtection';

const SettingsContext = createContext();

const defaultSettings = {
  difficulty: 'medium',
  gridSize: 3,
  gridColumns: 3,
  gridRows: 3,
  theme: 'light',
  countdownTimer: true,
  vibration: true,
  soundEnabled: true,
};

// Optimized Switch component with better touch targets
const Switch = ({ checked, onChange, className, children }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`${className} min-w-[44px] min-h-[24px] xs:min-h-[28px]`}
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
  const { adjustBrightness, adjustColorTemperature } = useScreenProtection();

  const handleToggleSound = () => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  const handleDifficultyChange = (e) => {
    updateSettings({ difficulty: e.target.value });
  };

  const handleGridSizeChange = (e) => {
    const value = e.target.value;
    switch (value) {
      case "2x1":
        updateSettings({
          gridSize: value,
          gridColumns: 2,
          gridRows: 1
        });
        break;
      case "3x1":
        updateSettings({
          gridSize: value,
          gridColumns: 3,
          gridRows: 1
        });
        break;
      default:
        const size = parseInt(value, 10);
        updateSettings({
          gridSize: size,
          gridColumns: size,
          gridRows: size
        });
        break;
    }
  }  

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
    <div className={`
      settings-controls 
      min-h-screen w-full 
      fixed inset-0 
      ${settings.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'}
    `}>
      <div className={`
        p-2 2xs:p-3 xs:p-4 
        w-full 
        max-w-[140px] 2xs:max-w-[280px] xs:max-w-[300px] sm:max-w-[560px]
        mx-auto 
        mt-2 2xs:mt-3 xs:mt-4 sm:mt-6
        rounded-md 2xs:rounded-lg sm:rounded-xl
        shadow-md 2xs:shadow-lg
        overflow-y-auto
        ${settings.theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100'}
      `}>
        {/* Header with Game Settings title and Back button */}
        <div className="flex items-center justify-between gap-2 2xs:gap-3 xs:gap-4 mb-3 2xs:mb-4 xs:mb-5">
          <Link
            to="/"
            className={`
              inline-flex items-center
              px-2 2xs:px-3 xs:px-4
              py-1 2xs:py-1.5 xs:py-2
              text-2xs 2xs:text-xs xs:text-sm
              font-medium 
              rounded 2xs:rounded-md xs:rounded-lg
              transition-colors
              gap-1 2xs:gap-1.5 xs:gap-2
              ${settings.theme === 'dark'
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
              }
              focus:outline-none 
              focus:ring-1 2xs:focus:ring-2
              focus:ring-purple-500 
              focus:ring-offset-1 2xs:focus:ring-offset-2
            `}
          >
            <ArrowLeftIcon className="w-3 h-3 2xs:w-4 2xs:h-4 xs:w-5 xs:h-5" />
            <span className="2xs:inline">Save & Back</span>
          </Link>
          <h2 className={`
            text-base 2xs:text-lg xs:text-xl sm:text-2xl
            font-bold 
            ${settings.theme === 'dark' ? 'text-white' : 'text-purple-800'}
          `}>
            Settings
          </h2>
        </div>
  
        {/* Screen Protection Settings */}
        <div className={`
          p-2 2xs:p-3 xs:p-4
          rounded 2xs:rounded-lg
          mb-2 2xs:mb-3 xs:mb-4
          ${settings.theme === 'dark' ? 'bg-gray-600' : 'bg-white'}
          shadow-md 2xs:shadow-lg
        `}>
          <h3 className="
            text-sm 2xs:text-base xs:text-lg
            font-bold 
            mb-2 2xs:mb-3 xs:mb-4
          ">
            Screen Protection
          </h3>
          
          {/* Auto Brightness Control */}
          <div className="mb-2 2xs:mb-3 xs:mb-4">
            <div className="
              flex items-center justify-between 
              mb-1 2xs:mb-2 xs:mb-3
            ">
              <label className="
                flex items-center 
                text-2xs 2xs:text-sm xs:text-base
                gap-1 2xs:gap-1.5 xs:gap-2
              ">
                <Sun className="w-3 h-3 2xs:w-4 2xs:h-4 xs:w-5 xs:h-5" />
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
                className={`
                  ${screenProtection.autoBrightness ? 'bg-purple-600' : 'bg-gray-400'} 
                  relative inline-flex 
                  h-4 2xs:h-5 xs:h-6
                  w-7 2xs:w-9 xs:w-11
                  items-center 
                  rounded-full 
                  transition-colors
                  focus:outline-none 
                  focus:ring-2 
                  focus:ring-purple-500 
                  focus:ring-offset-2
                `}
              >
                <span className={`
                  ${screenProtection.autoBrightness ? 'translate-x-3 2xs:translate-x-4 xs:translate-x-5' : 'translate-x-1'} 
                  inline-block 
                  h-2 2xs:h-3 xs:h-4
                  w-2 2xs:w-3 xs:w-4
                  transform 
                  rounded-full 
                  bg-white 
                  transition-transform
                `} />
              </Switch>
            </div>
  
            {screenProtection.autoBrightness && (
              <div className="mt-1 2xs:mt-2 xs:mt-3">
                <label className="
                  block 
                  text-2xs 2xs:text-sm xs:text-base
                  mb-1 2xs:mb-1.5 xs:mb-2
                ">
                  Brightness Level
                </label>
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
                    className={`
                      w-full 
                      h-1.5 xs:h-2 
                      rounded-lg 
                      appearance-none 
                      cursor-pointer 
                      ${settings.theme === 'dark' ? 'bg-gray-500' : 'bg-gray-200'}
                      [&::-webkit-slider-thumb]:w-4 
                      [&::-webkit-slider-thumb]:h-4 
                      [&::-webkit-slider-thumb]:appearance-none 
                      [&::-webkit-slider-thumb]:rounded-full 
                      [&::-webkit-slider-thumb]:bg-white 
                      [&::-webkit-slider-thumb]:shadow-md 
                      [&::-webkit-slider-thumb]:cursor-pointer
                    `}
                    style={{
                      background: `linear-gradient(to right, 
                        ${settings.theme === 'dark' ? '#9333ea' : '#7e22ce'} 0%, 
                        ${settings.theme === 'dark' ? '#9333ea' : '#7e22ce'} ${((screenProtection.brightness - 20) / 80) * 100}%, 
                        ${settings.theme === 'dark' ? '#374151' : '#e5e7eb'} ${((screenProtection.brightness - 20) / 80) * 100}%, 
                        ${settings.theme === 'dark' ? '#374151' : '#e5e7eb'} 100%)`
                    }}
                  />
                </div>
                <div className="
                  flex justify-between 
                  text-xs xs:text-sm 
                  mt-1 xs:mt-2
                ">
                  <span>20%</span>
                  <span>{screenProtection.brightness}%</span>
                  <span>100%</span>
                </div>
              </div>
            )}
          </div>
            {/* Night Mode */}
            <div className="mb-3 xs:mb-4">
            <div className="
              flex items-center justify-between
              mb-2 xs:mb-3
            ">
              <label className="
                flex items-center 
                text-sm xs:text-base
                gap-1.5 xs:gap-2
              ">
                <Moon className="w-4 h-4 xs:w-5 xs:h-5" />
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
                className={`
                  ${screenProtection.nightMode ? 'bg-purple-600' : 'bg-gray-400'} 
                  relative inline-flex 
                  h-5 xs:h-6 
                  w-9 xs:w-11 
                  items-center 
                  rounded-full 
                  transition-colors
                  focus:outline-none 
                  focus:ring-2 
                  focus:ring-purple-500 
                  focus:ring-offset-2
                `}
              >
                <span className={`
                  ${screenProtection.nightMode ? 'translate-x-5 xs:translate-x-6' : 'translate-x-1'} 
                  inline-block 
                  h-3 xs:h-4 
                  w-3 xs:w-4 
                  transform 
                  rounded-full 
                  bg-white 
                  transition-transform
                `} />
              </Switch>
            </div>
          </div>
        </div>

        {/* Game Settings Section */}
        <div className={`
          p-3 xs:p-4 sm:p-6 
          rounded-lg 
          mb-3 xs:mb-4 
          ${settings.theme === 'dark' ? 'bg-gray-600' : 'bg-white'}
          shadow-lg
        `}>
          <h3 className="
            text-lg xs:text-xl 
            font-bold 
            mb-3 xs:mb-4
          ">
            Game Settings
          </h3>

          {/* Difficulty Setting */}
          <div className="mb-3 xs:mb-4">
            <label className="
              block 
              text-sm xs:text-base 
              font-medium 
              mb-1 xs:mb-2
            ">
              Difficulty Level
            </label>
            <select
              value={settings.difficulty}
              onChange={handleDifficultyChange}
              className={`
                w-full 
                px-3 
                py-2 
                text-sm xs:text-base
                rounded-lg 
                border 
                ${settings.theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-white border-gray-300'
                }
                focus:outline-none 
                focus:ring-2 
                focus:ring-purple-500
              `}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Grid Size Setting */}
          <div className="mb-3 xs:mb-4">
            <label className="
              block 
              text-sm xs:text-base 
              font-medium 
              mb-1 xs:mb-2
            ">
              Grid Size
            </label>
            <select
              value={settings.gridSize}
              onChange={handleGridSizeChange}
              className={`
                w-full 
                px-3 
                py-2 
                text-sm xs:text-base
                rounded-lg 
                border 
                ${settings.theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-white border-gray-300'
                }
                focus:outline-none 
                focus:ring-2 
                focus:ring-purple-500
              `}
            >
              <option value="1">1x1</option>
              <option value="2x1">2x1</option>
              <option value="3x1">3x1</option>
              <option value="2">2x2</option>
              <option value="3">3x3</option>
              <option value="4">4x4</option>
              <option value="5">5x5</option>
            </select>
          </div>

          {/* Theme Toggle */}
          <div className="mb-3 xs:mb-4">
            <div className="
              flex items-center justify-between
              mb-2 xs:mb-3
            ">
              <label className="
                flex items-center 
                text-sm xs:text-base
                gap-1.5 xs:gap-2
              ">
                {settings.theme === 'dark' ? (
                  <Moon className="w-4 h-4 xs:w-5 xs:h-5" />
                ) : (
                  <Sun className="w-4 h-4 xs:w-5 xs:h-5" />
                )}
                Theme
              </label>
              <Switch
                checked={settings.theme === 'dark'}
                onChange={handleThemeChange}
                className={`
                  ${settings.theme === 'dark' ? 'bg-purple-600' : 'bg-gray-400'} 
                  relative inline-flex 
                  h-5 xs:h-6 
                  w-9 xs:w-11 
                  items-center 
                  rounded-full 
                  transition-colors
                  focus:outline-none 
                  focus:ring-2 
                  focus:ring-purple-500 
                  focus:ring-offset-2
                `}
              >
                <span className={`
                  ${settings.theme === 'dark' ? 'translate-x-5 xs:translate-x-6' : 'translate-x-1'} 
                  inline-block 
                  h-3 xs:h-4 
                  w-3 xs:w-4 
                  transform 
                  rounded-full 
                  bg-white 
                  transition-transform
                `} />
              </Switch>
            </div>
          </div>

          {/* Countdown Timer Toggle */}
          <div className="mb-3 xs:mb-4">
            <div className="
              flex items-center justify-between
              mb-2 xs:mb-3
            ">
              <label className="text-sm xs:text-base">
                Countdown Timer
              </label>
              <Switch
                checked={settings.countdownTimer}
                onChange={handleToggleCountdown}
                className={`
                  ${settings.countdownTimer ? 'bg-purple-600' : 'bg-gray-400'} 
                  relative inline-flex 
                  h-5 xs:h-6 
                  w-9 xs:w-11 
                  items-center 
                  rounded-full 
                  transition-colors
                  focus:outline-none 
                  focus:ring-2 
                  focus:ring-purple-500 
                  focus:ring-offset-2
                `}
              >
                <span className={`
                  ${settings.countdownTimer ? 'translate-x-5 xs:translate-x-6' : 'translate-x-1'} 
                  inline-block 
                  h-3 xs:h-4 
                  w-3 xs:w-4 
                  transform 
                  rounded-full 
                  bg-white 
                  transition-transform
                `} />
              </Switch>
            </div>
          </div>

          {/* Sound Toggle */}
          <div className="mb-3 xs:mb-4">
            <div className="
              flex items-center justify-between
              mb-2 xs:mb-3
            ">
              <label className="text-sm xs:text-base">
                Sound Effects
              </label>
              <Switch
                checked={settings.soundEnabled}
                onChange={handleToggleSound}
                className={`
                  ${settings.soundEnabled ? 'bg-purple-600' : 'bg-gray-400'} 
                  relative inline-flex 
                  h-5 xs:h-6 
                  w-9 xs:w-11 
                  items-center 
                  rounded-full 
                  transition-colors
                  focus:outline-none 
                  focus:ring-2 
                  focus:ring-purple-500 
                  focus:ring-offset-2
                `}
              >
                <span className={`
                  ${settings.soundEnabled ? 'translate-x-5 xs:translate-x-6' : 'translate-x-1'} 
                  inline-block 
                  h-3 xs:h-4 
                  w-3 xs:w-4 
                  transform 
                  rounded-full 
                  bg-white 
                  transition-transform
                `} />
              </Switch>
            </div>
          </div>

          {/* Vibration Toggle */}
          <div className="mb-3 xs:mb-4">
            <div className="
              flex items-center justify-between
              mb-2 xs:mb-3
            ">
              <label className="text-sm xs:text-base">
                Vibration
              </label>
              <Switch
                checked={settings.vibration}
                onChange={handleToggleVibration}
                className={`
                  ${settings.vibration ? 'bg-purple-600' : 'bg-gray-400'} 
                  relative inline-flex 
                  h-5 xs:h-6 
                  w-9 xs:w-11 
                  items-center 
                  rounded-full 
                  transition-colors
                  focus:outline-none 
                  focus:ring-2 
                  focus:ring-purple-500 
                  focus:ring-offset-2
                `}
              >
                <span className={`
                  ${settings.vibration ? 'translate-x-5 xs:translate-x-6' : 'translate-x-1'} 
                  inline-block 
                  h-3 xs:h-4 
                  w-3 xs:w-4 
                  transform 
                  rounded-full 
                  bg-white 
                  transition-transform
                `} />
              </Switch>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
