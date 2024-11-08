import React, { useState } from 'react';
import { usePlayer } from '../utils/PlayerContext';
import { useSettings } from '../Settings';
import { Coins, ArrowLeft, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Shop = () => {
  const navigate = useNavigate();
  const { playerData, updatePlayerData } = usePlayer();
  const { settings } = useSettings();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [items, setItems] = useState([
    { 
      id: 1, 
      name: 'Premium Puppy Food', 
      description: 'High-quality nutrition for growing puppies',
      category: 'food',
      cost: 1500, 
      unlocked: false,
      image: 'https://placehold.co/400x400/png'
    },
    { 
      id: 2, 
      name: 'Cozy Bed', 
      description: 'Soft and comfortable bed for sweet dreams',
      category: 'furniture',
      cost: 900, 
      unlocked: false,
      image: 'https://placehold.co/400x400/png'
    },
    { 
      id: 3, 
      name: 'Super Toy', 
      description: 'What toy that is',
      category: 'toys',
      cost: 400, 
      unlocked: false,
      image: 'https://placehold.co/400x400/png'
    },
    {
      id: 4,
      name: 'Avocado',
      description: 'Super Tasty',
      category: 'food',
      cost: 200,
      unlocked: false,
      image: 'https://placehold.co/400x400/png'
    }
  ]);

  const categories = ['all', 'food', 'furniture', 'toys'];

  const handlePurchase = (itemId) => {
    const item = items.find(i => i.id === itemId);
    setSelectedItem(item);
    setShowConfirmation(true);
  };

  const confirmPurchase = () => {
    if (playerData.coins >= selectedItem.cost && !selectedItem.unlocked) {
      updatePlayerData({
        ...playerData,
        coins: playerData.coins - selectedItem.cost
      });

      setItems(prevItems =>
        prevItems.map(i =>
          i.id === selectedItem.id ? { ...i, unlocked: true } : i
        )
      );

      toast.success('Purchase successful!');
    } else {
      toast.error('Not enough coins!');
    }
    setShowConfirmation(false);
  };

  const filteredItems = items.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  );

  const handleBack = () => {
    navigate(-1);
  };

  const isDark = settings.theme === 'dark';

  return (
    <div className={`min-h-screen w-full flex flex-col ${
      isDark ? 'bg-gray-800' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 p-4 ${
        isDark ? 'bg-gray-800' : 'bg-gray-50'
      } shadow-md`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBack}
              className={`p-2 rounded-full transition-colors ${
                isDark 
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6 transform transition-all duration-300 hover:scale-110 hover:-translate-x-1" />
            </button>
            <h1 className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-purple-800'}`}>Puppy Supply</h1>
          </div>
          <div className="flex items-center gap-2 bg-purple-500 px-4 py-2 rounded-full shadow-lg">
            <Coins className="w-5 h-5 text-white" />
            <span className="font-bold text-white">{playerData.coins}</span>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="px-4 py-2">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full capitalize whitespace-nowrap ${
                selectedCategory === category
                  ? isDark 
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-500 text-white'
                  : isDark
                    ? 'bg-gray-700 text-gray-200'
                    : 'bg-white text-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className={`relative p-4 rounded-2xl shadow-lg transition-all duration-200 ${
                  isDark ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-900'
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
                    <div className="bg-purple-500 px-3 py-1 rounded-full flex items-center gap-2 shadow-lg">
                      <Coins className="w-4 h-4 text-white" />
                      <p className="font-medium text-white">{item.cost}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-4 text-center">
                    {item.description}
                  </p>
                  <button
                    className={`w-full px-4 py-2 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                      item.unlocked
                        ? 'bg-gray-400 cursor-not-allowed'
                        : playerData.coins >= item.cost
                          ? isDark 
                            ? 'bg-purple-600 hover:bg-purple-700 text-white'
                            : 'bg-purple-500 hover:bg-purple-600 text-white'
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

      {/* Purchase Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'} max-w-sm w-full`}>
            <h3 className="text-lg font-bold mb-4">Confirm Purchase</h3>
            <p className="mb-4">Are you sure you want to purchase {selectedItem.name} for {selectedItem.cost} coins?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 rounded-full bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmPurchase}
                className="px-4 py-2 rounded-full bg-purple-500 hover:bg-purple-600 text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;