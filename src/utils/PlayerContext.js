import React, { createContext, useState, useContext, useEffect } from 'react';

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  const [playerData, setPlayerData] = useState(() => {
    const savedData = localStorage.getItem('playerData');
    return savedData ? JSON.parse(savedData) : { coins: 0 };
  });

  useEffect(() => {
    localStorage.setItem('playerData', JSON.stringify(playerData));
  }, [playerData]);

  const addCoins = (amount) => {
    setPlayerData(prevData => ({
      ...prevData,
      coins: prevData.coins + amount
    }));
  };

  return (
    <PlayerContext.Provider value={{ playerData, addCoins }}>
      {children}
    </PlayerContext.Provider>
  );
};
