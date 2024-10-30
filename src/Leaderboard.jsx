import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { useSettings } from './Settings';

const Leaderboard = () => {
  const { settings } = useSettings();
  const [scores, setScores] = useState(() => {
    const savedScores = localStorage.getItem('leaderboard');
    return savedScores ? JSON.parse(savedScores) : [];
  });

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getCrownStyle = (rank) => {
    if (rank === 0) {
      return 'text-yellow-400 animate-bounce';
    }
    return '';
  };

  return (
    <div className={`min-h-screen ${
      settings.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
    }`}>
      <div className="container mx-auto px-4 py-8">
        <Link 
          to="/" 
          className={`inline-block mb-6 ${
            settings.theme === 'dark' ? 'text-purple-300 hover:text-purple-400' : 'text-purple-600 hover:text-purple-700'
          }`}
        >
          <button className="text-sm font-medium">
            ← Back to Game
          </button>
        </Link>

        <h1 className={`text-3xl font-bold mb-6 ${
          settings.theme === 'dark' ? 'text-purple-300' : 'text-purple-800'
        }`}>
          Leaderboard
        </h1>

        <div className={`rounded-lg shadow-lg overflow-hidden ${
          settings.theme === 'dark' ? 'bg-gray-700' : 'bg-white'
        }`}>
          {scores.length > 0 ? (
            <table className="w-full">
              <thead className={`${
                settings.theme === 'dark' ? 'bg-gray-600' : 'bg-purple-100'
                }`}>
                <tr>
                    <th className="px-6 py-3 text-left">Rank</th>
                    <th className="px-6 py-3 text-left">Player</th>
                    <th className="px-6 py-3 text-left">Score</th>
                    <th className="px-6 py-3 text-left">Date</th>
                </tr>
                </thead>
                <tbody>
                {scores
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 10)
                    .map((score, index) => (
                    <tr 
                        key={score.timestamp}
                        className={`${
                        settings.theme === 'dark' 
                            ? 'border-gray-600 hover:bg-gray-600' 
                            : 'border-gray-200 hover:bg-purple-50'
                        } border-b transition-colors ${
                        index === 0 ? 'font-bold' : ''
                        }`}
                    >
                        <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                            {index === 0 && (
                            <Crown 
                                className={`w-5 h-5 ${getCrownStyle(index)}`}
                                fill="currentColor"
                            />
                            )}
                            {index + 1}
                        </div>
                        </td>
                        <td className="px-6 py-4">
                        <span className={index === 0 ? 'text-yellow-400' : ''}>
                            {score.username}</span>
                        </td>
                        <td className="px-6 py-4">
                        <span className={index === 0 ? 'text-yellow-400' : ''}>
                            {score.score}</span>
                        
                        </td>
                        <td className="px-6 py-4">{formatDate(score.timestamp)}</td>
                    </tr>
                    ))}
                </tbody>
            </table>
          ) : (
            <div className="p-6 text-center">
              No scores yet. Start playing to set some records!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
