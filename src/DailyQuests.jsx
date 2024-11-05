import React, { useState, useEffect } from 'react';
import { usePlayer } from './utils/PlayerContext';
import { DAILY_QUEST_TIERS } from './utils/questTiers';
import { toast } from 'react-toastify';



const DailyQuests = ({ onClose, theme }) => {
    const { playerData, updatePlayerData, addCoins } = usePlayer();
    const [claimedRewards, setClaimedRewards] = useState([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [lastClaimDate, setLastClaimDate] = useState(null);
    const [animationAmount, setAnimationAmount] = useState(0);

    const bgColor = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const textColor = theme === 'dark' ? 'text-white' : 'text-gray-800';
    const buttonClass = `px-4 py-2 rounded ${
        theme === 'dark'
        ? 'bg-purple-600 hover:bg-purple-700 text-white'
        : 'bg-purple-600 hover:bg-purple-700 text-white'
    }`
    
    useEffect(() => {
      // Load last claim date from localStorage
      const savedLastClaimDate = localStorage.getItem('lastDailyQuestClaimDate');
      if (savedLastClaimDate) {
          setLastClaimDate(new Date(savedLastClaimDate));
      }
    }, []);

    const getCurrentTier = (questType, playerProgress) => {
        const tiers = DAILY_QUEST_TIERS[questType];
        return tiers.find(tier => playerProgress < tier) || tiers[tiers.length - 1];
      };

    const gamesPlayedProgress = playerData.dailyGamesPlayed || 0;
    const currentGamesPlayedTier = getCurrentTier('GAMES_PLAYED', gamesPlayedProgress);

    const quests = [
      { 
          id: 1, 
          type: 'GAMES_PLAYED',
          description: `Play ${getCurrentTier('GAMES_PLAYED', playerData.dailyGamesPlayed)} games`, 
          progress: Math.min(playerData.dailyGamesPlayed || 0, getCurrentTier('GAMES_PLAYED', playerData.dailyGamesPlayed)),
          total: getCurrentTier('GAMES_PLAYED', playerData.dailyGamesPlayed), 
          reward: '100 coins' 
      },
      { 
          id: 2, 
          type: 'SCORE_SINGLE',
          description: `Score ${getCurrentTier('SCORE_SINGLE', playerData.dailyHighScore)} points in a single game`, 
          progress: Math.min(playerData.dailyHighScore || 0, getCurrentTier('SCORE_SINGLE', playerData.dailyHighScore)),
          total: getCurrentTier('SCORE_SINGLE', playerData.dailyHighScore), 
          reward: '200 coins' 
      },
      { 
          id: 3, 
          type: 'MULTIPLIER',
          description: `Get a ${getCurrentTier('MULTIPLIER', playerData.dailyHighestMultiplier)}x multiplier`, 
          progress: Math.min(playerData.dailyHighestMultiplier || 0, getCurrentTier('MULTIPLIER', playerData.dailyHighestMultiplier)),
          total: getCurrentTier('MULTIPLIER', playerData.dailyHighestMultiplier), 
          reward: '300 coins' 
      },
  ];

    const isNewDay = () => {
      if (!lastClaimDate) return true;
      const now = new Date();
      return now.getDate() !== lastClaimDate.getDate() ||
            now.getMonth() !== lastClaimDate.getMonth() ||
            now.getFullYear() !== lastClaimDate.getFullYear();
    };

    const handleClaimRewards = () => {
      if (!isNewDay()) {
        toast.info("Daily quests can only be claimed once per day. Please come back tomorrow!");
        return;
      }

      let totalCoinsEarned = 0;
      const newClaimedRewards = [];
      const updatedPlayerData = { ...playerData };

      quests.forEach(quest => {
        if (quest.progress >= quest.total) {
            const coinsEarned = parseInt(quest.reward);
            addCoins(coinsEarned);
            totalCoinsEarned += coinsEarned;
            newClaimedRewards.push(quest.id);

            // Reset the progress for the claimed quest
            switch(quest.type) {
                case 'GAMES_PLAYED':
                    updatedPlayerData.dailyGamesPlayed = 0;
                    break;
                case 'SCORE_SINGLE':
                    updatedPlayerData.dailyHighScore = 0;
                    break;
                case 'MULTIPLIER':
                    updatedPlayerData.dailyHighestMultiplier = 0;
                    break;
            }
        }
    });

    if (totalCoinsEarned > 0) {
        setClaimedRewards(newClaimedRewards);
        updatePlayerData(updatedPlayerData);
        showFloatingCoins(totalCoinsEarned);
        toast.success(`Congratulations! You earned ${totalCoinsEarned} coins!`);

        // Update last claim date
        const now = new Date();
        setLastClaimDate(now);
        localStorage.setItem('lastDailyQuestClaimDate', now.toISOString());
    } else {
        toast.info("No rewards to claim at this time.");
    }
  };

  const showFloatingCoins = (amount) => {
    setIsAnimating(true);
    setAnimationAmount(amount);
    setTimeout(() => {
        setIsAnimating(false);
        setAnimationAmount(0);
    }, 2000); // Animation duration
};

  // disable claim button if all rewards have been claimed
  const canClaimRewards = isNewDay() && quests.some(quest => quest.progress >= quest.total && !claimedRewards.includes(quest.id));

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
                    <div className="text-yellow-400 text-4xl animate-bounce flex items-center">
                        <span className="mr-2">🪙</span>
                        <span className="font-bold">+{animationAmount}</span>
                    </div>
                </div>
            )}
            <h2 className="text-2xl font-bold mb-4">Daily Quests</h2>
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
                    className={`${buttonClass} ${!canClaimRewards ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!canClaimRewards}
                    onClick={handleClaimRewards}
                >
                    Claim Rewards
                </button>
            </div>
        </div>
    </div>
  );
};

export default DailyQuests;
