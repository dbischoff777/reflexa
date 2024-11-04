// PlayerProfile.jsx
import React, { useCallback, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Star, Clock, Target, ArrowLeft, Zap, 
         Crosshair, Flame, Crown, Medal, BarChart, History } from 'lucide-react';
import { useSettings } from './Settings';
import { getPlayerStats } from './utils/playerStats';
import { 
  ACHIEVEMENTS, 
  updateAchievementProgress, 
  checkAchievementsUnlocked,  
} from './achievements';
import { getAvatarImage } from './constants/avatars';
import AvatarSelector from './components/avatar/AvatarSelector';
import { motion, AnimatePresence } from 'framer-motion';

const StatCard = ({ icon, label, value, theme }) => (
  <div className={`p-4 rounded-lg ${
    theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'
  }`}>
    <div className="flex items-center gap-2 mb-2">
      <span className={theme === 'dark' ? 'text-purple-300' : 'text-purple-600'}>
        {icon}</span>
      <span className="font-medium">{label}</span>
    </div>
    <div className="text-xl font-bold">{value}</div>
  </div>
);

const ProfileHeader = ({ username, avatar, level, experience, theme, onAvatarClick }) => (
  <div className={`rounded-lg shadow-lg p-6 mb-6 ${
    theme === 'dark' ? 'bg-gray-700' : 'bg-white'
  }`}>
    <div className="flex items-center gap-4">
    <div className="relative cursor-pointer" onClick={onAvatarClick}>
        <img
          src={getAvatarImage(avatar)}
          alt={`${username}'s avatar`}
          className="w-16 h-16 rounded-full object-cover border-2 border-purple-500"
        />
        <div className="absolute -bottom-1 -right-1 bg-purple-500 rounded-full p-1">
          <Medal size={16} className="text-white" />
        </div>
      </div>
      <div className="flex-1">
        <h1 className="text-2xl font-bold">{username}</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Level {level || 1}</span>
            <div className="w-32">
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-purple-600 rounded-full"
                  style={{ width: `${((experience % 100) / 100) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <span className="text-sm text-gray-500">
            {experience || 0} / {(Math.floor(experience / 100) + 1) * 100 || 0} XP</span>
        </div>
      </div>
    </div>
  </div>
);

const TabNavigation = ({ activeTab, onTabChange, theme }) => {
  const tabs = [
    { id: 'stats', label: 'Statistics', icon: <BarChart size={20} /> },
    { id: 'achievements', label: 'Achievements', icon: <Trophy size={20} /> },
    { id: 'history', label: 'Past', icon: <History size={20} /> }
  ];

  return (
    <div className="flex space-x-2 mb-6">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg transition-all
            ${activeTab === tab.id
              ? theme === 'dark'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-100 text-purple-700'
              : theme === 'dark'
              ? 'text-gray-400 hover:bg-gray-700'
              : 'text-gray-600 hover:bg-gray-100'
            }
          `}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

const AchievementCard = ({ achievement, progress, unlocked, theme }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className={`p-4 rounded-lg ${
      theme === 'dark' 
        ? unlocked ? 'bg-purple-700' : 'bg-gray-700'
        : unlocked ? 'bg-purple-100' : 'bg-white'
    } shadow-lg`}
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${
        unlocked ? 'bg-purple-500' : 'bg-gray-400'
      }`}>
        {achievement.icon}
      </div>
      <div>
        <h3 className="font-bold">{achievement.title}</h3>
        <p className="text-sm text-gray-500">{achievement.description}</p>
      </div>
    </div>
    <div className="mt-3">
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="h-2 bg-purple-600 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-right text-sm mt-1">
        {progress}%
      </div>
    </div>
  </motion.div>
);

const PlayerProfile = () => {
  const { settings } = useSettings();
  const [stats, setStats] = useState(() => getPlayerStats());
  const [achievementProgress, setAchievementProgress] = useState({});
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [recentGames, setRecentGames] = useState([]);
  const [playerAvatar, setPlayerAvatar] = useState(() => localStorage.getItem('playerAvatar') || 'default');
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('stats');

  // Calculate achievement progress percentage
  const getProgressPercentage = useCallback((achievement) => {
  const progress = achievementProgress || {};
  
  switch (achievement.type) {
    case 'GAMES_PLAYED':
      return Math.min(100, ((progress.gamesPlayed || 0) / achievement.requirement) * 100);
    case 'HIGH_SCORE':
      return Math.min(100, ((progress.highestScore || 0) / achievement.requirement) * 100);
    case 'ACCURACY':
      return Math.min(100, ((progress.accuracy || 0) * 100));
    case 'REACTION_TIME':
      return progress.bestReactionTime <= achievement.requirement ? 100 : 
        Math.min(100, (achievement.requirement / (progress.bestReactionTime || Infinity)) * 100);
    case 'STREAK':
      return Math.min(100, ((progress.longestStreak || 0) / achievement.requirement) * 100);
    case 'PERFECT_GAMES':
      return Math.min(100, ((progress.perfectGames || 0) / achievement.requirement) * 100);
    default:
      return unlockedAchievements.includes(achievement.id) ? 100 : 0;
    }
  }, [achievementProgress, unlockedAchievements]);

  // Add the checkProgress function
  const checkProgress = useCallback(() => {
    const currentStats = getPlayerStats();
    setStats(currentStats);
  
    // Update achievement progress
    const newProgress = updateAchievementProgress(currentStats, achievementProgress);
    const newUnlocked = checkAchievementsUnlocked(newProgress);
  
    setAchievementProgress(newProgress);
    setUnlockedAchievements(prev => {
      const combined = [...new Set([...prev, ...newUnlocked])];
      localStorage.setItem('unlockedAchievements', JSON.stringify(combined));
      return combined;
    });
  
    localStorage.setItem('achievementProgress', JSON.stringify(newProgress));
  }, [achievementProgress]);

  // Add storage event listener
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'achievementProgress') {
        const newProgress = JSON.parse(e.newValue || '{}');
        setAchievementProgress(newProgress);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const intervalId = setInterval(checkProgress, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [checkProgress]);

  // Add storage event listener
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'achievementProgress') {
        const newProgress = JSON.parse(e.newValue || '{}');
        setAchievementProgress(newProgress);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const intervalId = setInterval(checkProgress, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [checkProgress]);

  // Load data on mount
  useEffect(() => {
    const savedGames = JSON.parse(localStorage.getItem('recentGames') || '[]');
    setRecentGames(savedGames);

    const savedProgress = JSON.parse(localStorage.getItem('achievementProgress') || '{}');
    setAchievementProgress(savedProgress);

    const savedUnlocked = JSON.parse(localStorage.getItem('unlockedAchievements') || '[]');
    setUnlockedAchievements(savedUnlocked);
  }, []);

  // Format functions
  const formatNumber = (num) => new Intl.NumberFormat().format(Math.round(num));
  const formatPercent = (num) => {
    // Check if num is null, undefined, or 0
    if (!num && num !== 0) return '0%';
    return `${(num * 100).toFixed(1)}%`;
  };
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleAvatarClick = () => {
    setIsAvatarSelectorOpen(true);
  };

  const handleAvatarChange = (newAvatar) => {
    setPlayerAvatar(newAvatar);
    localStorage.setItem('playerAvatar', newAvatar);
    setIsAvatarSelectorOpen(false);
  };

  return (
    <div className={`
      min-h-screen w-full
      ${settings.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}
    `}>
      <div className="
        px-3 xs:px-4 sm:px-6
        py-4 xs:py-6 sm:py-8
        mx-auto
        w-full
        max-w-screen-lg
      ">
        {/* Back Button */}
        <div className="mb-4 xs:mb-6">
          <Link 
            to="/" 
            className={`
              inline-flex items-center 
              min-h-[44px]
              px-2
              gap-2
              text-sm font-medium
              ${settings.theme === 'dark' ? 'text-purple-300 active:text-purple-400' : 'text-purple-600 active:text-purple-700'}
            `}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Game</span>
          </Link>
        </div>
  
        {/* Profile Header */}
        <div className="mb-6">
          <ProfileHeader
            username={stats.username}
            avatar={playerAvatar}
            level={Math.floor(stats.experience / 100) + 1}
            experience={stats.experience}
            theme={settings.theme}
            onAvatarClick={handleAvatarClick}
          />
        </div>
  
        {/* Tab Navigation */}
        <div className="mb-6">
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            theme={settings.theme}
          />
        </div>
  
        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'stats' && (
              <div className="
                grid 
                grid-cols-1 xs:grid-cols-2 md:grid-cols-4 
                gap-3 xs:gap-4
              ">
                <StatCard
                  icon={<Trophy className="w-5 h-5" />}
                  label="Highest Score"
                  value={formatNumber(stats.basic.highestScore)}
                  theme={settings.theme}
                />
                <StatCard
                  icon={<Crosshair className="w-5 h-5" />}
                  label="Accuracy"
                  value={formatPercent(stats.performance.accuracy)}
                  theme={settings.theme}
                />
                <StatCard
                  icon={<Zap className="w-5 h-5" />}
                  label="Best Reaction"
                  value={`${stats.performance.bestReactionTime || 0}ms`}
                  theme={settings.theme}
                />
                <StatCard
                  icon={<Star className="w-5 h-5" />}
                  label="Games Played"
                  value={formatNumber(stats.basic.gamesPlayed)}
                  theme={settings.theme}
                />
                <StatCard
                  icon={<Flame className="w-5 h-5" />}
                  label="Longest Streak"
                  value={formatNumber(stats.session.longestStreak)}
                  theme={settings.theme}
                />
                <StatCard
                  icon={<Crown className="w-5 h-5" />}
                  label="Perfect Games"
                  value={formatNumber(stats.performance.perfectGames)}
                  theme={settings.theme}
                />
                <StatCard
                  icon={<Clock className="w-5 h-5" />}
                  label="Play Time"
                  value={formatTime(stats.basic.totalPlayTime)}
                  theme={settings.theme}
                />
                <StatCard
                  icon={<Target className="w-5 h-5" />}
                  label="Skill Rating"
                  value={formatNumber(stats.progress.skillRating)}
                  theme={settings.theme}
                />
              </div>
            )}
  
            {activeTab === 'achievements' && (
              <div className="
                grid 
                grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 
                gap-3 xs:gap-4
              ">
                {ACHIEVEMENTS.map(achievement => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    progress={getProgressPercentage(achievement)}
                    unlocked={unlockedAchievements.includes(achievement.id)}
                    theme={settings.theme}
                  />
                ))}
              </div>
            )}
  
            {activeTab === 'history' && (
              <div className="space-y-3 xs:space-y-4">
                {recentGames.map((game, index) => (
                  <div
                    key={index}
                    className={`
                      p-4
                      rounded-lg
                      ${settings.theme === 'dark' ? 'bg-gray-700' : 'bg-white'}
                    `}
                  >
                    <div className="
                      grid 
                      grid-cols-1 xs:grid-cols-3
                      gap-2 xs:gap-4
                      text-sm
                    ">
                      <div>Score: {formatNumber(game.score)}</div>
                      <div>Accuracy: {formatPercent(game.accuracy)}</div>
                      <div>Time: {formatTime(game.duration)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        {/* Avatar Selector Modal */}
        {isAvatarSelectorOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 w-full max-w-[320px] max-h-[90vh] flex flex-col">
              <div className="flex-grow overflow-y-clip">
                <AvatarSelector
                  currentAvatar={playerAvatar}
                  onSelect={handleAvatarChange}
                  className="w-full h-full [image-rendering:-webkit-optimize-contrast]"
                />
              </div>
              <button
                className="mt-4 w-full bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors duration-200"
                onClick={() => setIsAvatarSelectorOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerProfile;
