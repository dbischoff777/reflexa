import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, Medal, Trophy, Search, ArrowUp, ArrowDown, Award, Target, Zap } from 'lucide-react';
import { useSettings } from './Settings';

const Leaderboard = () => {
  const { settings } = useSettings();
  const [scores, setScores] = useState(() => {
    const savedScores = localStorage.getItem('leaderboard');
    return savedScores ? JSON.parse(savedScores) : [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'score', direction: 'desc' });
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({ total: 0, average: 0, highest: 0 });

  useEffect(() => {
    // Calculate statistics
    const filteredScores = filterScores(scores);
    const total = filteredScores.length;
    const average = total > 0 
      ? Math.round(filteredScores.reduce((acc, curr) => acc + curr.score, 0) / total) 
      : 0;
    const highest = total > 0 
      ? Math.max(...filteredScores.map(score => score.score)) 
      : 0;
    setStats({ total, average, highest });
  }, [scores, filter]);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - timestamp) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
      }
    }
    return 'Just now';
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 0:
        return (
          <div className="animate-bounce">
            <Trophy className="w-5 h-5 text-yellow-400" fill="currentColor" />
          </div>
        );
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" fill="currentColor" />;
      case 2:
        return <Medal className="w-5 h-5 text-amber-600" fill="currentColor" />;
      default:
        return null;
    }
  };

  const filterScores = (scores) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const week = new Date(now.setDate(now.getDate() - 7));
    const month = new Date(now.setMonth(now.getMonth() - 1));

    return scores.filter(score => {
      const scoreDate = new Date(score.timestamp);
      switch (filter) {
        case 'today':
          return scoreDate >= today;
        case 'week':
          return scoreDate >= week;
        case 'month':
          return scoreDate >= month;
        default:
          return true;
      }
    });
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const sortedScores = React.useMemo(() => {
    let filteredScores = filterScores(scores);
    
    if (searchTerm) {
      filteredScores = filteredScores.filter(score => 
        score.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return [...filteredScores].sort((a, b) => {
      if (sortConfig.key === 'timestamp') {
        return sortConfig.direction === 'desc' 
          ? b.timestamp - a.timestamp 
          : a.timestamp - b.timestamp;
      }
      if (sortConfig.key === 'username') {
        return sortConfig.direction === 'desc'
          ? b.username.localeCompare(a.username)
          : a.username.localeCompare(b.username);
      }
      return sortConfig.direction === 'desc' 
        ? b[sortConfig.key] - a[sortConfig.key] 
        : a[sortConfig.key] - b[sortConfig.key];
    });
  }, [scores, sortConfig, searchTerm, filter]);

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return null;
    return sortConfig.direction === 'desc' ? 
      <ArrowDown className="w-4 h-4 inline ml-1" /> : 
      <ArrowUp className="w-4 h-4 inline ml-1" />;
  };

  return (
  <div className={`min-h-screen ${
    settings.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
  }`}>
    <div className="px-2 2xs:px-3 xs:px-4 py-4 2xs:py-6 xs:py-8">
      {/* Back Button */}
      <Link 
        to="/" 
        className={`
          inline-flex items-center gap-1 2xs:gap-1.5 xs:gap-2
          mb-3 2xs:mb-4 xs:mb-6
          text-2xs 2xs:text-xs xs:text-sm
          font-medium
          ${settings.theme === 'dark' 
            ? 'text-purple-300 hover:text-purple-400' 
            : 'text-purple-600 hover:text-purple-700'
          }
        `}
      >
        <ArrowLeftIcon className="w-3 h-3 2xs:w-4 2xs:h-4 xs:w-5 xs:h-5" />
        Back to Game
      </Link>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 2xs:gap-3 xs:gap-4 mb-3 2xs:mb-4 xs:mb-6">
        {/* Total Games Card */}
        <div className={`
          p-2 2xs:p-3 xs:p-4 
          rounded 2xs:rounded-lg 
          ${settings.theme === 'dark' ? 'bg-gray-700' : 'bg-white'}
          shadow-md 2xs:shadow-lg
        `}>
          <div className="flex items-center gap-1 2xs:gap-1.5 xs:gap-2">
            <Target className="w-3 h-3 2xs:w-4 2xs:h-4 xs:w-5 xs:h-5 text-purple-500" />
            <h3 className="text-xs 2xs:text-sm xs:text-base font-semibold">Total Games</h3>
          </div>
          <p className="text-base 2xs:text-lg xs:text-2xl font-bold mt-1 2xs:mt-1.5 xs:mt-2">
            {stats.total}
          </p>
        </div>

        {/* Average Score Card */}
        <div className={`
          p-2 2xs:p-3 xs:p-4 
          rounded 2xs:rounded-lg 
          ${settings.theme === 'dark' ? 'bg-gray-700' : 'bg-white'}
          shadow-md 2xs:shadow-lg
        `}>
          <div className="flex items-center gap-1 2xs:gap-1.5 xs:gap-2">
            <Award className="w-3 h-3 2xs:w-4 2xs:h-4 xs:w-5 xs:h-5 text-purple-500" />
            <h3 className="text-xs 2xs:text-sm xs:text-base font-semibold">Average Score</h3>
          </div>
          <p className="text-base 2xs:text-lg xs:text-2xl font-bold mt-1 2xs:mt-1.5 xs:mt-2">
            {stats.average}
          </p>
        </div>

        {/* Highest Score Card */}
        <div className={`
          p-2 2xs:p-3 xs:p-4 
          rounded 2xs:rounded-lg 
          ${settings.theme === 'dark' ? 'bg-gray-700' : 'bg-white'}
          shadow-md 2xs:shadow-lg
        `}>
          <div className="flex items-center gap-1 2xs:gap-1.5 xs:gap-2">
            <Zap className="w-3 h-3 2xs:w-4 2xs:h-4 xs:w-5 xs:h-5 text-purple-500" />
            <h3 className="text-xs 2xs:text-sm xs:text-base font-semibold">Highest Score</h3>
          </div>
          <p className="text-base 2xs:text-lg xs:text-2xl font-bold mt-1 2xs:mt-1.5 xs:mt-2">
            {stats.highest}
          </p>
        </div>
      </div>

      {/* Leaderboard Header */}
      <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2 2xs:gap-3 xs:gap-4 mb-3 2xs:mb-4 xs:mb-6">
        <h1 className={`
          text-lg 2xs:text-xl xs:text-2xl sm:text-3xl 
          font-bold 
          ${settings.theme === 'dark' ? 'text-purple-300' : 'text-purple-800'}
        `}>
          Leaderboard
        </h1>
        
        <div className="flex flex-col 2xs:flex-row gap-2 2xs:gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={`
              rounded 2xs:rounded-md
              px-2 2xs:px-3 
              py-1 
              text-2xs 2xs:text-xs xs:text-sm
              ${settings.theme === 'dark' 
                ? 'bg-gray-700 text-white' 
                : 'bg-white text-gray-900'
              }
            `}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          <div className="relative">
            <Search className="
              absolute 
              left-2 2xs:left-3 
              top-1/2 
              transform -translate-y-1/2 
              w-3 h-3 2xs:w-4 2xs:h-4 
              text-gray-400
            " />
            <input
              type="text"
              placeholder="Search player..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`
                w-full
                pl-8 2xs:pl-10 
                pr-2 2xs:pr-3
                py-1 
                rounded 2xs:rounded-md
                text-2xs 2xs:text-xs xs:text-sm
                ${settings.theme === 'dark' 
                  ? 'bg-gray-700 text-white placeholder-gray-400' 
                  : 'bg-white text-gray-900 placeholder-gray-500'
                }
              `}
            />
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className={`
        rounded 2xs:rounded-lg 
        shadow-md 2xs:shadow-lg 
        overflow-hidden
        ${settings.theme === 'dark' ? 'bg-gray-700' : 'bg-white'}
      `}>
        {sortedScores.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`
                ${settings.theme === 'dark' ? 'bg-gray-600' : 'bg-purple-100'}
              `}>
                
                <tr>
                <th className="
                  px-2 2xs:px-3 xs:px-4 
                  py-2 2xs:py-2.5 xs:py-3
                  text-left 
                  text-2xs 2xs:text-xs xs:text-sm
                  font-medium
                ">
                  Rank
                </th>
                <th className="
                  px-2 2xs:px-3 xs:px-4 
                  py-2 2xs:py-2.5 xs:py-3
                  text-left 
                  text-2xs 2xs:text-xs xs:text-sm
                  font-medium
                  cursor-pointer
                " 
                  onClick={() => handleSort('username')}
                >
                  Player <SortIcon column="username" />
                </th>
                <th className="
                  px-2 2xs:px-3 xs:px-4 
                  py-2 2xs:py-2.5 xs:py-3
                  text-left 
                  text-2xs 2xs:text-xs xs:text-sm
                  font-medium
                  cursor-pointer
                " 
                  onClick={() => handleSort('score')}
                >
                  Score <SortIcon column="score" />
                </th>
                <th className="
                  hidden xs:table-cell
                  px-2 2xs:px-3 xs:px-4 
                  py-2 2xs:py-2.5 xs:py-3
                  text-left 
                  text-2xs 2xs:text-xs xs:text-sm
                  font-medium
                  cursor-pointer
                " 
                  onClick={() => handleSort('timestamp')}
                >
                  Date & Time <SortIcon column="timestamp" />
                </th>
                <th className="
                  hidden sm:table-cell
                  px-2 2xs:px-3 xs:px-4 
                  py-2 2xs:py-2.5 xs:py-3
                  text-left 
                  text-2xs 2xs:text-xs xs:text-sm
                  font-medium
                ">
                  Time Ago
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedScores.map((score, index) => (
                <tr 
                  key={score.timestamp}
                  className={`
                    ${settings.theme === 'dark' 
                      ? 'border-gray-600 hover:bg-gray-600' 
                      : 'border-gray-200 hover:bg-purple-50'
                    } 
                    border-b 
                    transition-colors
                  `}
                >
                  <td className="
                    px-2 2xs:px-3 xs:px-4 
                    py-2 2xs:py-2.5 xs:py-3
                  ">
                    <div className="flex items-center gap-1 2xs:gap-1.5 xs:gap-2">
                      {getRankIcon(index)}
                      <span className={`
                        text-2xs 2xs:text-xs xs:text-sm
                        ${index < 3 ? 'font-bold' : ''}
                      `}>
                        {index + 1}</span>
                      
                    </div>
                  </td>
                  <td className="
                    px-2 2xs:px-3 xs:px-4 
                    py-2 2xs:py-2.5 xs:py-3
                  ">
                    <span className={`
                      text-2xs 2xs:text-xs xs:text-sm
                      ${index === 0 ? 'text-yellow-400 font-bold' : ''}
                    `}>
                      {score.username}</span>
                    
                  </td>
                  <td className="
                    px-2 2xs:px-3 xs:px-4 
                    py-2 2xs:py-2.5 xs:py-3
                  ">
                    <span className={`
                      text-2xs 2xs:text-xs xs:text-sm
                      ${index === 0 ? 'text-yellow-400 font-bold' : ''}
                    `}>
                      {score.score}</span>
                    
                  </td>
                  <td className="
                    hidden xs:table-cell
                    px-2 2xs:px-3 xs:px-4 
                    py-2 2xs:py-2.5 xs:py-3
                  ">
                    <div className="flex flex-col">
                      <span className="text-2xs 2xs:text-xs xs:text-sm">
                        {formatDate(score.timestamp)}</span>
                      
                      <span className="
                        text-3xs 2xs:text-2xs xs:text-xs
                        text-gray-500
                      ">
                        {formatTime(score.timestamp)}</span>
                      
                    </div>
                  </td>
                  <td className="
                    hidden sm:table-cell
                    px-2 2xs:px-3 xs:px-4 
                    py-2 2xs:py-2.5 xs:py-3
                    text-2xs 2xs:text-xs xs:text-sm
                    text-gray-500
                  ">
                    {getTimeAgo(score.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="
          p-3 2xs:p-4 xs:p-6 
          text-center
          text-2xs 2xs:text-xs xs:text-sm
        ">
          {searchTerm 
            ? 'No matching players found.' 
            : 'No scores yet. Start playing to set some records!'
          }
        </div>
      )}
    </div>
  </div>
</div>
);

};

export default Leaderboard;
