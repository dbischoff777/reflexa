import React, { useState } from 'react';
import { usePlayer } from '../utils/PlayerContext';
import { useSettings } from '../Settings';
import { ShoppingCart, Coins, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Shop = () => {
  const navigate = useNavigate();
  const { playerData, updatePlayerData } = usePlayer();
  const { settings } = useSettings();
  const [items, setItems] = useState([
    { id: 1, name: 'Item 1', cost: 100, unlocked: false },
    { id: 2, name: 'Item 2', cost: 200, unlocked: false },
    { id: 3, name: 'Item 3', cost: 300, unlocked: false },
  ]);

  const handlePurchase = (itemId) => {
    const item = items.find(i => i.id === itemId);
    if (playerData.coins >= item.cost && !item.unlocked) {
        updatePlayerData(prevData => ({
        ...prevData,
        coins: prevData.coins - item.cost,
      }));
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
      isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 p-4 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      } shadow-md`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBack}
              className={`p-2 rounded-full transition-colors ${
                isDark 
                  ? 'hover:bg-gray-700' 
                  : 'hover:bg-gray-100'
              }`}
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              <h1 className="text-xl font-bold sm:text-2xl">Shop</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            <span className="font-bold">{playerData.coins}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(item => (
              <div
                key={item.id}
                className={`relative p-4 rounded-lg shadow-lg transition-all duration-200 ${
                  item.unlocked 
                    ? 'bg-green-100 dark:bg-green-900' 
                    : isDark 
                      ? 'bg-gray-800 hover:bg-gray-700' 
                      : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col h-full">
                  <h3 className="text-lg font-bold mb-2">{item.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <Coins className="w-4 h-4" />
                    <p className="font-medium">{item.cost}</p>
                  </div>
                  <button
                    className={`w-full mt-auto px-4 py-2 rounded-md transition-colors duration-200 ${
                      item.unlocked
                        ? 'bg-gray-400 cursor-not-allowed'
                        : playerData.coins >= item.cost
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-gray-300 cursor-not-allowed'
                    }`}
                    onClick={() => handlePurchase(item.id)}
                    disabled={item.unlocked || playerData.coins < item.cost}
                  >
                    {item.unlocked ? 'Unlocked' : playerData.coins >= item.cost ? 'Buy' : 'Not Enough Coins'}
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