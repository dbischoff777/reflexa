// AchievementNotification.jsx
import React, { useEffect, useState } from 'react'; // Add useState to imports
import { useSettings } from './Settings';
import soundManager from './sounds/sound';
import { Volume2, VolumeX } from 'lucide-react';

const AchievementNotification = ({ achievement, onClose }) => {
  const { settings } = useSettings();
  const [isMuted, setIsMuted] = useState(soundManager.isMuted());

  useEffect(() => {
    // Play sound when notification appears
    soundManager.play('achievement');

    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const toggleMute = () => {
    soundManager.toggleMute();
    setIsMuted(soundManager.isMuted());
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 transform transition-transform duration-500 ease-out animate-slide-in">
      <div className={`p-4 rounded-lg shadow-lg ${
        settings.theme === 'dark' ? 'bg-gray-700' : 'bg-white'
      } max-w-sm`}>
        <div className="flex items-center gap-3">
          <div className="text-3xl">{achievement.icon}</div>
          <div className="flex-1">
            <div className="font-bold text-lg">Achievement Unlocked!</div>
            <div className={`font-semibold ${
              settings.theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
            }`}>
              {achievement.title}
            </div>
            <div className={`text-sm ${
              settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {achievement.description}
            </div>
          </div>
          <button
            onClick={toggleMute}
            className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
              settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AchievementNotification;