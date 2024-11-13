// PlayerContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const DEFAULT_PLAYER_DATA = {
  username: 'Player',
  avatar: 'default',
  coins: 0,
  stats: {
    totalGames: 0,
    highScore: 0,
    averageScore: 0,
    totalPlayTime: 0,
    averageAccuracy: 0,
    bestStreak: 0,
    averageReactionTime: 0
  },
  gameHistory: []
};

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [playerData, setPlayerData] = useState(() => {
    const savedData = localStorage.getItem('playerData');
    return savedData ? 
      { ...DEFAULT_PLAYER_DATA, ...JSON.parse(savedData) } : 
      DEFAULT_PLAYER_DATA;
  });

  useEffect(() => {
    localStorage.setItem('playerData', JSON.stringify(playerData));
  }, [playerData]);

  const updatePlayerStats = (newStats) => {
    setPlayerData(prevData => ({
      ...prevData,
      ...newStats,
      stats: {
        ...prevData.stats,
        ...newStats.stats
      }
    }));
  };

  return (
    <PlayerContext.Provider value={{ playerData, updatePlayerStats }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};