import React, { useState } from 'react';
import { usePlayer } from './utils/PlayerContext';
import { WEEKLY_QUEST_TIERS } from './utils/questTiers';
import { toast } from 'react-toastify';

const WeeklyQuests = ({ onClose, theme }) => {
    const { playerData, updatePlayerData, addCoins } = usePlayer();
    const [claimedRewards, setClaimedRewards] = useState([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const bgColor = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const textColor = theme === 'dark' ? 'text-white' : 'text-gray-800';
    const buttonClass = `px-4 py-2 rounded ${
        theme === 'dark'
        ? 'bg-purple-600 hover:bg-purple-700 text-white'
        : 'bg-purple-600 hover:bg-purple-700 text-white'
    }`;

    const getCurrentTier = (questType, playerProgress) => {
        const tiers = WEEKLY_QUEST_TIERS[questType];
        return tiers.find(tier => playerProgress < tier) || tiers[tiers.length - 1];
      };

      const quests = [
        { 
            id: 1, 
            type: 'GAMES_PLAYED',
            description: `Play ${getCurrentTier('GAMES_PLAYED', playerData.weeklyGamesPlayed)} games`, 
            progress: Math.min(playerData.weeklyGamesPlayed || 0, getCurrentTier('GAMES_PLAYED', playerData.weeklyGamesPlayed)),
            total: getCurrentTier('GAMES_PLAYED', playerData.weeklyGamesPlayed), 
            reward: '500 coins' 
        },
        { 
            id: 2, 
            type: 'SCORE_SINGLE',
            description: `Score ${getCurrentTier('SCORE_SINGLE', playerData.weeklyHighScore)} points in a single game`, 
            progress: Math.min(playerData.weeklyHighScore || 0, getCurrentTier('SCORE_SINGLE', playerData.weeklyHighScore)),
            total: getCurrentTier('SCORE_SINGLE', playerData.weeklyHighScore), 
            reward: '1000 coins' 
        },
        { 
            id: 3, 
            type: 'MULTIPLIER',
            description: `Get a ${getCurrentTier('MULTIPLIER', playerData.weeklyHighestMultiplier)}x multiplier`, 
            progress: Math.min(playerData.weeklyHighestMultiplier || 0, getCurrentTier('MULTIPLIER', playerData.weeklyHighestMultiplier)),
            total: getCurrentTier('MULTIPLIER', playerData.weeklyHighestMultiplier), 
            reward: '1500 coins' 
        },
    ];    

    const handleClaimRewards = () => {
      let totalCoinsEarned = 0;
      const newClaimedRewards = [];
      const updatedPlayerData = { ...playerData };

      quests.forEach(quest => {
          if (quest.progress >= quest.total && !claimedRewards.includes(quest.id)) {
              const coinsEarned = parseInt(quest.reward);
              addCoins(coinsEarned);
              totalCoinsEarned += coinsEarned;
              newClaimedRewards.push(quest.id);

              // Reset the progress for the claimed quest
              switch(quest.type) {
                  case 'GAMES_PLAYED':
                      updatedPlayerData.weeklyGamesPlayed = 0;
                      break;
                  case 'SCORE_SINGLE':
                      updatedPlayerData.weeklyHighScore = 0;
                      break;
                  case 'MULTIPLIER':
                      updatedPlayerData.weeklyHighestMultiplier = 0;
                      break;
              }
          }
      });

      if (totalCoinsEarned > 0) {
          setClaimedRewards(prev => [...prev, ...newClaimedRewards]);
          updatePlayerData(updatedPlayerData);
          showFloatingCoins(totalCoinsEarned);
          toast.success(`Congratulations! You earned ${totalCoinsEarned} coins!`);
      } else {
          toast.info("No rewards to claim at this time.");
      }
  };

  const showFloatingCoins = (amount) => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 2000); // Animation duration
  };

  // Disable claim button if all rewards have been claimed
  const allRewardsClaimed = quests.every(quest => claimedRewards.includes(quest.id));

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
            <div className={`${bgColor} ${textColor} p-6 rounded-lg shadow-xl max-w-md w-full relative`}>
                {isAnimating && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-yellow-400 text-6xl animate-bounce">🪙</div>
                    </div>
                )}
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
                        {claimedRewards.includes(quest.id) && (
                            <p className="text-green-500 mt-2">Claimed</p>
                        )}
                    </div>
                ))}
                <div className="flex justify-between mt-4">
                    <button 
                        onClick={onClose}
                        className={buttonClass}
                    >
                        Close
                    </button>
                    <button 
                        className={`${buttonClass} ${allRewardsClaimed || !quests.some(q => q.progress >= q.total) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={allRewardsClaimed || !quests.some(q => q.progress >= q.total)}
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
