import React, { useState, useEffect } from 'react';
import { usePlayer } from './utils/PlayerContext';
import { WEEKLY_QUEST_TIERS } from './utils/questTiers';
import { toast } from 'react-toastify';

const WeeklyQuests = ({ onClose, theme }) => {
    const { playerData, updatePlayerData, addCoins, updateExperience } = usePlayer();
    const [claimedRewards, setClaimedRewards] = useState([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [lastClaimDate, setLastClaimDate] = useState(null);
    const [animationAmount, setAnimationAmount] = useState(0);
    const [randomTiers, setRandomTiers] = useState({});

    const bgColor = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const textColor = theme === 'dark' ? 'text-white' : 'text-gray-800';
    const buttonClass = `px-4 py-2 rounded ${
        theme === 'dark'
        ? 'bg-purple-600 hover:bg-purple-700 text-white'
        : 'bg-purple-600 hover:bg-purple-700 text-white'
    }`;

    useEffect(() => {
        // Load last claim date from localStorage
        const savedLastClaimDate = localStorage.getItem('lastWeeklyQuestClaimDate');
        if (savedLastClaimDate) {
            setLastClaimDate(new Date(savedLastClaimDate));
        }

        // Generate random tiers
        setRandomTiers(getRandomTier(WEEKLY_QUEST_TIERS));
    }, []);

    const getRandomTier = (tiers) => {
        const randomTiers = {};
        for (const [key, values] of Object.entries(tiers)) {
            const randomIndex = Math.floor(Math.random() * values.length);
            randomTiers[key] = values[randomIndex];
        }
        return randomTiers;
    };

    const quests = [
        { 
            id: 1, 
            type: 'GAMES_PLAYED',
            description: `Play ${randomTiers.GAMES_PLAYED || 20} games this week`, 
            progress: Math.min(playerData.weeklyGamesPlayed || 0, randomTiers.GAMES_PLAYED || 20),
            total: randomTiers.GAMES_PLAYED || 20, 
            reward: '500 coins' 
        },
        { 
            id: 2, 
            type: 'SCORE_SINGLE',
            description: `Score ${randomTiers.SCORE_SINGLE || 500} points in a single game this week`, 
            progress: Math.min(playerData.weeklyHighScore || 0, randomTiers.SCORE_SINGLE || 500),
            total: randomTiers.SCORE_SINGLE || 500, 
            reward: '750 coins' 
        },
        { 
            id: 3, 
            type: 'MULTIPLIER',
            description: `Get a ${randomTiers.MULTIPLIER || 5}x multiplier this week`, 
            progress: Math.min(playerData.weeklyHighestMultiplier || 0, randomTiers.MULTIPLIER || 5),
            total: randomTiers.MULTIPLIER || 5, 
            reward: '1000 coins' 
        },
    ];

    const isNewWeek = () => {
        if (!lastClaimDate) return true;
        const now = new Date();
        const weekDiff = Math.floor((now - lastClaimDate) / (7 * 24 * 60 * 60 * 1000));
        return weekDiff >= 1;
    };

    const handleClaimRewards = () => {
        if (!isNewWeek()) {
            toast.info("Weekly quests can only be claimed once per week. Please come back next week!");
            return;
        }

        let totalCoinsEarned = 0;
        let totalXpEarned = 0;
        const newClaimedRewards = [];
        const updatedPlayerData = { ...playerData };

        quests.forEach(quest => {
            if (quest.progress >= quest.total) {
                const coinsEarned = parseInt(quest.reward);
                const xpEarned = quest.xpReward;
                addCoins(coinsEarned);
                totalCoinsEarned += coinsEarned;
                totalXpEarned += xpEarned;
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
            setClaimedRewards(newClaimedRewards);
            updatePlayerData(updatedPlayerData);
            addCoins(totalCoinsEarned); // This should update the coins in the context
            showFloatingCoins(totalCoinsEarned);
            toast.success(`Congratulations! You earned ${totalCoinsEarned} coins`, {
                duration: 1000 // Duration in milliseconds (1 seconds in this case)
            });
            // Update last claim date
            const now = new Date();
            setLastClaimDate(now);
            localStorage.setItem('lastWeeklyQuestClaimDate', now.toISOString());
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

  // Disable claim button if all rewards have been claimed
  const canClaimRewards = isNewWeek() && quests.some(quest => quest.progress >= quest.total && !claimedRewards.includes(quest.id));

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

export default WeeklyQuests;
