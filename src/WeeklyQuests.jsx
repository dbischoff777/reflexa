import React from 'react';
import { usePlayer } from './utils/PlayerContext';

const WeeklyQuests = ({ onClose, theme }) => {
    const { playerData, addCoins } = usePlayer();
    const bgColor = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const textColor = theme === 'dark' ? 'text-white' : 'text-gray-800';
    const buttonClass = `px-4 py-2 rounded ${
        theme === 'dark'
        ? 'bg-purple-600 hover:bg-purple-700 text-white'
        : 'bg-purple-600 hover:bg-purple-700 text-white'
    }`;

  const quests = [
    { id: 1, description: 'Complete 20 games', progress: 12, total: 20, reward: '500 coins' },
    { id: 2, description: 'Achieve a total score of 50,000 points', progress: 32000, total: 50000, reward: '1000 coins' },
    { id: 3, description: 'Get a 10x multiplier', progress: 0, total: 1, reward: '1500 coins' },
    { id: 4, description: 'Play the game for 7 days in a row', progress: 5, total: 7, reward: '2000 coins' },
  ];

  const handleClaimRewards = () => {
    quests.forEach(quest => {
      if (quest.progress >= quest.total) {
        addCoins(parseInt(quest.reward));
      }
    });
    // You might want to add some visual feedback here
    onClose();
  };

  const renderProgressBar = (progress, total) => {
    const percentage = (progress / total) * 100;
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 dark:bg-gray-700">
        <div 
          className="bg-purple-600 h-2.5 rounded-full" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className={`${bgColor} ${textColor} p-6 rounded-lg shadow-xl max-w-md w-full`}>
        <h2 className="text-2xl font-bold mb-4">Weekly Quests</h2>
        <p className="mb-4">Current Coins: {playerData.coins}</p>
          {quests.map(quest => (
            <div key={quest.id} className="border-b pb-4 last:border-b-0">
              <p className="font-semibold mb-2">{quest.description}</p>
              {renderProgressBar(quest.progress, quest.total)}
              <div className="flex justify-between text-sm">
                <span>Progress: {quest.progress}/{quest.total}</span>
                <span>Reward: {quest.reward}</span>
              </div>
            </div>
          ))}
        <div className="flex justify-between">
          <button 
            onClick={onClose}
            className={buttonClass}
          >
            Close
          </button>
          <button 
            className={`${buttonClass} ${quests.some(q => q.progress >= q.total) ? '' : 'opacity-50 cursor-not-allowed'}`}
            disabled={!quests.some(q => q.progress >= q.total)}
            onClick={handleClaimRewards}
          >
            Claim Rewards
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeeklyQuests;
