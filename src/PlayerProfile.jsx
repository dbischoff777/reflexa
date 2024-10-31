// PlayerProfile.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Star, Clock, Target, Award, ArrowLeft, Zap, 
         Crosshair, Flame, Crown } from 'lucide-react';
import { useSettings } from './Settings';
import { getPlayerStats } from './utils/playerStats';
import { ACHIEVEMENTS } from './achievements';
import { getAvatarImage } from './constants/avatars';

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

const PlayerProfile = () => {
  const { settings } = useSettings();
  const [stats, setStats] = useState(() => getPlayerStats());
  const [achievementProgress, setAchievementProgress] = useState({});
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [recentGames, setRecentGames] = useState([]);
  const [playerAvatar] = useState(() => localStorage.getItem('playerAvatar') || 'ninja');

  // Load data on mount
  useEffect(() => {
    // Load recent games
    const savedGames = JSON.parse(localStorage.getItem('recentGames') || '[]');
    setRecentGames(savedGames);

    // Load achievements progress
    const savedProgress = JSON.parse(localStorage.getItem('achievementProgress') || '{}');
    setAchievementProgress(savedProgress);

    // Load unlocked achievements
    const savedUnlocked = JSON.parse(localStorage.getItem('unlockedAchievements') || '[]');
    setUnlockedAchievements(savedUnlocked);
  }, []);

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

  // Calculate achievement progress percentage
  const getProgressPercentage = (achievement) => {
    const progress = achievementProgress || {};
    
    switch (achievement.type) {
      case 'GAMES_PLAYED':
        const gamesPlayed = progress.gamesPlayed || 0;
        return Math.min(100, (gamesPlayed / achievement.requirement) * 100);
      case 'HIGH_SCORE':
        return Math.min(100, ((progress.highestScore || 0) / achievement.requirement) * 100);
      case 'TOTAL_SCORE':
        return Math.min(100, ((progress.totalScore || 0) / achievement.requirement) * 100);
      case 'ACCURACY':
        return Math.min(100, ((progress.accuracy || 0) * 100));
      case 'REACTION_TIME':
        return progress.bestReactionTime <= achievement.requirement ? 100 : 
          Math.min(100, (achievement.requirement / (progress.bestReactionTime || Infinity)) * 100);
      case 'STREAK':
        return Math.min(100, ((progress.longestStreak || 0) / achievement.requirement) * 100);
      case 'PERFECT_GAMES':
        return Math.min(100, ((progress.perfectGames || 0) / achievement.requirement) * 100);
      case 'MULTIPLIER':
        //Add null check and default value
        const highestMultiplier = progress.highestMultiplier || 0;
        const percentage = (highestMultiplier / achievement.requirement) * 100;
        return Math.min(100, percentage || 0);
      default:
        return unlockedAchievements.includes(achievement.id) ? 100 : 0;
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

       {/* Profile Header */}
        <div className={`rounded-lg shadow-lg p-6 mb-6 ${
          settings.theme === 'dark' ? 'bg-gray-700' : 'bg-white'
        }`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <img
                src={getAvatarImage(playerAvatar)}
                alt={`${localStorage.getItem('username')}'s avatar`}
                className="w-16 h-16 rounded-full object-cover border-2 border-purple-500"
              />
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
                        Multiplier: x {game.multiplier.toFixed(1)}
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

        {/* Achievements */}
        <div className={`rounded-lg shadow-lg p-6 ${
          settings.theme === 'dark' ? 'bg-gray-700' : 'bg-white'
        }`}>
          <h2 className="text-xl font-bold mb-4">
            Achievements ({unlockedAchievements.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(ACHIEVEMENTS).flat().map((achievement) => {
              const isUnlocked = unlockedAchievements.includes(achievement.id);
              const progress = getProgressPercentage(achievement);
              
              return (
                <div 
                  key={achievement.id}
                  className={`p-4 rounded-lg ${
                    settings.theme === 'dark' 
                      ? isUnlocked ? 'bg-gray-600' : 'bg-gray-700 opacity-75'
                      : isUnlocked ? 'bg-white' : 'bg-gray-50 opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Award className={isUnlocked ? 'text-yellow-400' : 'text-gray-400'} />
                    <h3 className="font-bold">{achievement.title}</h3>
                  </div>
                  <p className={`text-sm mb-2 ${
                    settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {achievement.description}
                  </p>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-purple-600 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-right text-sm mt-1">
                    {Math.round(progress)}%
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

export default PlayerProfile;