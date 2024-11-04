// src/achievements.js
import React from 'react';
import { Trophy, Target, Zap, Star, Award, Crosshair, Flame } from 'lucide-react';

export const ACHIEVEMENTS = [
  {
    id: 'games_10',
    type: 'GAMES_PLAYED',
    requirement: 10,
    title: 'Dedicated Player',
    description: 'Play 10 games',
    icon: <Target size={24} />
  },
  {
    id: 'games_50',
    type: 'GAMES_PLAYED',
    requirement: 50,
    title: 'Gaming Enthusiast',
    description: 'Play 50 games',
    icon: <Trophy size={24} />
  },
  {
    id: 'score_500',
    type: 'SCORE_SINGLE',
    requirement: 500,
    title: 'Rising Star',
    description: 'Score 500 points in a single game',
    icon: <Star size={24} />
  },
  {
    id: 'score_1000',
    type: 'SCORE_SINGLE',
    requirement: 1000,
    title: 'Score Master',
    description: 'Score 1000 points in a single game',
    icon: <Award size={24} />
  },
  {
    id: 'perfect_game',
    type: 'PERFECT_GAMES',
    requirement: 1,
    title: 'Flawless Victory',
    description: 'Score 500+ points without losing lives',
    icon: <Star size={24} />
  },
  {
    id: 'reaction_master',
    type: 'REACTION_TIME',
    requirement: 200,
    title: 'Lightning Reflexes',
    description: 'Average reaction time under 200ms',
    icon: <Zap size={24} />
  },
  {
    id: 'accuracy_king',
    type: 'ACCURACY',
    requirement: 95,
    title: 'Sharpshooter',
    description: 'Achieve 95% accuracy in a single game',
    icon: <Crosshair size={24} />
  },
  {
    id: 'streak_master',
    type: 'STREAK',
    requirement: 5,
    title: 'Winning Streak',
    description: 'Win 5 games in a row',
    icon: <Flame size={24} />
  }
];

export const updateAchievementProgress = (stats, currentProgress) => {
  const newProgress = { ...currentProgress };
  
  // Update basic stats
  newProgress.gamesPlayed = (newProgress.gamesPlayed || 0) + 1;
  newProgress.highestScore = Math.max(stats.basic.highestScore || 0, newProgress.highestScore || 0);
  newProgress.accuracy = Math.max(stats.performance.accuracy || 0, newProgress.accuracy || 0);
  newProgress.bestReactionTime = Math.min(stats.performance.bestReactionTime || Infinity, newProgress.bestReactionTime || Infinity);
  newProgress.longestStreak = Math.max(stats.session.longestStreak || 0, newProgress.longestStreak || 0);
  newProgress.perfectGames = (newProgress.perfectGames || 0) + (stats.performance.perfectGames ? 1 : 0);

  return newProgress;
};

export const checkAchievementsUnlocked = (progress) => {
  return ACHIEVEMENTS.filter(achievement => {
    switch (achievement.type) {
      case 'GAMES_PLAYED':
        return (progress.gamesPlayed || 0) >= achievement.requirement;
      case 'SCORE_SINGLE':
        return (progress.highestScore || 0) >= achievement.requirement;
      case 'ACCURACY':
        return (progress.accuracy || 0) >= (achievement.requirement / 100);
      case 'REACTION_TIME':
        return (progress.bestReactionTime || Infinity) <= achievement.requirement;
      case 'STREAK':
        return (progress.longestStreak || 0) >= achievement.requirement;
      case 'PERFECT_GAMES':
        return (progress.perfectGames || 0) >= achievement.requirement;
      default:
        return false;
    }
  }).map(achievement => achievement.id);
};

export const getAllAchievements = () => ACHIEVEMENTS;
