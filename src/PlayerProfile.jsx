// PlayerProfile.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Star, Clock, Target, Award, ArrowLeft, Zap, 
         Heart, Crosshair, Flame, Crown } from 'lucide-react';
import { useSettings } from './Settings';
import { getPlayerStats } from './utils/playerStats';
import { ACHIEVEMENTS } from './achievements';

const PlayerProfile = () => {
  const { settings } = useSettings();
  const [stats, setStats] = useState(() => getPlayerStats());
  const [profile, setProfile] = useState({
    achievements: [],
    recentGames: []
  });
  const [achievementProgress, setAchievementProgress] = useState({});
  const [recentGames, setRecentGames] = useState([]);

  // Load profile data on mount
  useEffect(() => {
    // Load recent games from localStorage
    const savedGames = JSON.parse(localStorage.getItem('recentGames') || '[]');
    setRecentGames(savedGames);

    // Load achievements
    const savedAchievements = JSON.parse(localStorage.getItem('achievements') || '[]');
    setProfile(prev => ({
      ...prev,
      achievements: savedAchievements
    }));

    // Calculate achievement progress
    const progress = {};
    Object.values(ACHIEVEMENTS).flat().forEach(achievement => {
      // This is a simple example - adjust based on your achievement criteria
      progress[achievement.id] = calculateAchievementProgress(achievement, stats);
    });
    setAchievementProgress(progress);
  }, [stats]);

  // Format functions
  const formatNumber = (num) => new Intl.NumberFormat().format(Math.round(num));
  const formatPercent = (num) => `${(num * 100).toFixed(1)}%`;
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate achievement progress
  const calculateAchievementProgress = (achievement, stats) => {
    switch (achievement.id) {
      case 'GAMES_PLAYED':
        return Math.min((stats.basic.gamesPlayed / achievement.requirement) * 100, 100);
      case 'HIGH_SCORE':
        return Math.min((stats.basic.highestScore / achievement.requirement) * 100, 100);
      case 'PERFECT_ACCURACY':
        return Math.min((stats.performance.accuracy * 100), 100);
      case 'REACTION_MASTER':
        return stats.performance.bestReactionTime <= achievement.requirement ? 100 : 0;
      case 'STREAK_MASTER':
        return Math.min((stats.session.longestStreak / achievement.requirement) * 100, 100);
      default:
        return 0;
    }
  };

  return (
    <div className={`min-h-screen ${
      settings.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
    }`}>
      <div className="container mx-auto px-4 py-8">
        <Link 
          to="/" 
          className={`inline-flex items-center gap-2 mb-6 ${
            settings.theme === 'dark' ? 'text-purple-300 hover:text-purple-400' : 'text-purple-600 hover:text-purple-700'
          }`}
        >
          <ArrowLeft size={20} />
          <span>Back to Game</span>
        </Link>

        {/* Profile Header with Level */}
        <div className={`rounded-lg shadow-lg p-6 mb-6 ${
          settings.theme === 'dark' ? 'bg-gray-700' : 'bg-white'
        }`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
              settings.theme === 'dark' ? 'bg-purple-600' : 'bg-purple-100'
            }`}>
              {localStorage.getItem('username')?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{localStorage.getItem('username')}</h1>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${
                  settings.theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
                }`}></span>
                  Level {stats.progress.level}
                
                <div className="flex-1 h-2 bg-gray-200 rounded-full w-32">
                  <div
                    className="h-2 bg-purple-600 rounded-full"
                    style={{
                      width: `${((stats.progress.experience % 100) / 100) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Trophy />}
              label="Highest Score"
              value={formatNumber(stats.basic.highestScore)}
              theme={settings.theme}
            />
            <StatCard
              icon={<Crosshair />}
              label="Accuracy"
              value={formatPercent(stats.performance.accuracy)}
              theme={settings.theme}
            />
            <StatCard
              icon={<Zap />}
              label="Best Reaction"
              value={`${stats.performance.bestReactionTime}ms`}
              theme={settings.theme}
            />
            <StatCard
              icon={<Star />}
              label="Games Played"
              value={formatNumber(stats.basic.gamesPlayed)}
              theme={settings.theme}
            />
            <StatCard
              icon={<Flame />}
              label="Longest Streak"
              value={formatNumber(stats.session.longestStreak)}
              theme={settings.theme}
            />
            <StatCard
              icon={<Crown />}
              label="Perfect Games"
              value={formatNumber(stats.performance.perfectGames)}
              theme={settings.theme}
            />
            <StatCard
              icon={<Clock />}
              label="Play Time"
              value={formatTime(stats.basic.totalPlayTime)}
              theme={settings.theme}
            />
            <StatCard
              icon={<Target />}
              label="Skill Rating"
              value={formatNumber(stats.progress.skillRating)}
              theme={settings.theme}
            />
          </div>
        </div>

        {/* Recent Games */}
        <div className={`rounded-lg shadow-lg p-6 mb-6 ${
          settings.theme === 'dark' ? 'bg-gray-700' : 'bg-white'
        }`}>
          <h2 className="text-xl font-bold mb-4">Recent Games</h2>
          {recentGames.length > 0 ? (
            <div className="space-y-4">
              {recentGames.map((game) => (
                <div 
                  key={game.timestamp}
                  className={`p-4 rounded-lg ${
                    settings.theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold">Score: {game.score}</div>
                      <div className={`text-sm ${
                        settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Multiplier: x{game.multiplier.toFixed(1)}
                      </div>
                    </div>
                    <div className={`text-sm ${
                      settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {formatDate(game.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              No games played yet
            </div>
          )}
        </div>

        {/* Achievements section */}
        <div className={`rounded-lg shadow-lg p-6 ${
          settings.theme === 'dark' ? 'bg-gray-700' : 'bg-white'
        }`}>
          <h2 className="text-xl font-bold mb-4">
            Achievements ({profile.achievements.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(ACHIEVEMENTS).flat().map((achievement) => {
              const isEarned = profile.achievements.some(a => a.id === achievement.id);
              const progress = achievementProgress[achievement.id] || 0;
              
              return (
                <div 
                  key={achievement.id}
                  className={`p-4 rounded-lg ${
                    settings.theme === 'dark' 
                      ? isEarned ? 'bg-gray-600' : 'bg-gray-700 opacity-75' 
                      : isEarned ? 'bg-gray-50' : 'bg-gray-100 opacity-75'
                  } transform hover:scale-105 transition-transform duration-200`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`text-2xl ${!isEarned && 'opacity-50'}`}>
                      {achievement.icon}
                    </div>
                    <div>
                      <div className="font-bold">{achievement.title}</div>
                      <div className={`text-sm ${
                        settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {achievement.description}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-2">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          isEarned ? 'bg-green-500' : 'bg-purple-500'
                        } transition-all duration-1000`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="text-xs mt-1 text-right">
                      {isEarned ? 'Completed!' : `${Math.round(progress)}%`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, label, value, theme }) => (
  <div className={`p-4 rounded-lg ${
    theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'
  }`}>
    <div className="flex items-center gap-3">
      <div className={`text-2xl ${
        theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
      }`}>
        {icon}
      </div>
      <div>
        <div className={`text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {label}
        </div>
        <div className="text-lg font-bold">{value}</div>
      </div>
    </div>
  </div>
);

export default PlayerProfile;