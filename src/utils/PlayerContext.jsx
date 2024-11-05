// PlayerContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  const [playerData, setPlayerData] = useState(() => {
    const savedData = localStorage.getItem('playerData');
    return savedData ? JSON.parse(savedData) : {
      coins: 0,
      dailyGamesPlayed: 0,
      weeklyGamesPlayed: 0,
      dailyHighScore: 0,
      weeklyHighScore: 0,
      dailyHighestMultiplier: 0,
      weeklyHighestMultiplier: 0,
      totalGamesPlayed: 0,
      totalScore: 0,
      bestScore: 0,
      bestMultiplier: 0,
      totalGameTime: 0,
      averageScore: 0,
      averageMultiplier: 0,
    };
  });

  const updatePlayerData = (newData) => {
    setPlayerData(prevData => {
      const updatedData = { ...prevData, ...newData };
      localStorage.setItem('playerData', JSON.stringify(updatedData));
      return updatedData;
    });
  };

  const addCoins = (amount) => {
    setPlayerData(prevData => ({
      ...prevData,
      coins: prevData.coins + amount
    }));
  };

  return (
    <PlayerContext.Provider value={{ playerData, updatePlayerData, addCoins }}>
      {children}
    </PlayerContext.Provider>
  );
};