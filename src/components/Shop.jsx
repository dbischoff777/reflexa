import React, { useState } from 'react';
import { usePlayer } from '../utils/PlayerContext';
import { useSettings } from '../Settings';
import { Coins, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Shop = () => {
  const navigate = useNavigate();
  const { playerData, updatePlayerData } = usePlayer();
  const { settings } = useSettings();
  const [items, setItems] = useState([
    { 
      id: 1, 
      name: 'Item 1', 
      cost: 1500, 
      unlocked: false,
      image: 'https://placehold.co/400x400/png'
    },
    { 
      id: 2, 
      name: 'Item 2', 
      cost: 900, 
      unlocked: false,
      image: 'https://placehold.co/400x400/png'    },
    { 
      id: 3, 
      name: 'Item 3', 
      cost: 400, 
      unlocked: false,
      image: 'https://placehold.co/400x400/png'    },
    {
      id: 4,
      name: 'Item 4',
      cost: 200,
      unlocked: false,
      image: 'https://placehold.co/400x400/png'    }
  ]);

  const handlePurchase = (itemId) => {
    const item = items.find(i => i.id === itemId);
    if (playerData.coins >= item.cost && !item.unlocked) {
      // Subtract coins from player data
      updatePlayerData({
        ...playerData,
        coins: playerData.coins - item.cost
      });

      // Update items state to mark as unlocked
      setItems(prevItems =>
        prevItems.map(i =>
          i.id === itemId ? { ...i, unlocked: true } : i
        )
      );
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const isDark = settings.theme === 'dark';

  return (
    <div className={`min-h-screen w-full flex flex-col ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 p-4 ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      } shadow-md`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBack}
              className={`p-2 rounded-full transition-colors ${
                isDark 
                  ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6 transform transition-all duration-300 hover:scale-110 hover:-translate-x-1" />
            </button>
            <h1 className={`text-3xl font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent drop-shadow-sm transform transition-all duration-300 hover:scale-105 text-center mx-auto ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>Puppy Supply</h1>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 rounded-full shadow-lg">
            <Coins className="w-5 h-5 text-white" />
            <span className="font-bold text-white">{playerData.coins}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 gap-4">
            {items.map(item => (
              <div
                key={item.id}
                className={`relative p-4 rounded-2xl shadow-lg transition-all duration-200 ${
                  isDark ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900'
                }`}
              >
                <div className="flex flex-col items-center h-full">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-24 h-24 mb-3"
                  />
                  <h3 className="text-lg font-bold mb-2">{item.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 rounded-full flex items-center gap-2 shadow-lg">
                      <Coins className="w-4 h-4 text-white" />
                      <p className="font-medium text-white">{item.cost}</p>
                    </div>
                  </div>
                  <button
                    className={`w-full px-4 py-2 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                      item.unlocked
                        ? 'bg-gray-400 cursor-not-allowed'
                        : playerData.coins >= item.cost
                          ? isDark 
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                          : 'bg-gray-300 cursor-not-allowed'
                    }`}
                    onClick={() => handlePurchase(item.id)}
                    disabled={item.unlocked || playerData.coins < item.cost}
                  >
                    {item.unlocked ? 'Purchased' : playerData.coins >= item.cost ? 'Purchase' : 'Not Enough Coins'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;