import React from 'react';
import { motion } from 'framer-motion';
import frenchieIcon from '../images/frenchie.png';

const LoadingScreen = ({ 
  theme, 
  progress, 
  error = null,
  onRetry = null 
}) => (
  <div className={`
    fixed inset-0 
    flex flex-col items-center justify-center 
    ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}
    z-50
  `}>
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="text-center px-4"
    >
      {/* Loading Image */}
      <img
        src={frenchieIcon}
        alt="Loading..."
        className={`
          w-24 h-24 mb-4
          ${!error ? 'animate-bounce' : ''}
          ${theme === 'dark' ? 'filter brightness-110' : ''}
        `}
      />
      
      {/* Progress Bar */}
      {!error && (
        <div className={`
          w-64 h-2 mb-4
          rounded-full
          overflow-hidden
          ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}
        `}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            className={`
              h-full rounded-full
              ${theme === 'dark' 
                ? 'bg-purple-500' 
                : 'bg-purple-600'
              }
            `}
          />
        </div>
      )}

      {/* Loading Text or Error Message */}
      {error ? (
        <div className="space-y-4">
          <p className={`
            text-sm font-medium
            ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}
          `}>
            {error}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className={`
                px-4 py-2 
                rounded-lg 
                font-medium 
                transition-all 
                duration-200
                ${theme === 'dark'
                  ? 'bg-purple-600 hover:bg-purple-500 text-white'
                  : 'bg-purple-500 hover:bg-purple-400 text-white'
                }
              `}
            >
              Retry Loading
            </button>
          )}
        </div>
      ) : (
        <p className={`
          text-sm font-medium
          ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}
        `}>
          Loading... {Math.round(progress)}%
        </p>
      )}

      {/* Loading Tips */}
      <div className={`
        mt-8 
        text-xs 
        max-w-xs 
        mx-auto
        ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
      `}>
        <p className="animate-pulse">
          {getRandomTip()}
        </p>
      </div>
    </motion.div>
  </div>
);

// Loading tips to show while loading
const loadingTips = [
  "Collecting treats for your puppies...",
  "Warming up the game engine...",
  "Preparing your adventure...",
  "Getting everything ready...",
  "Loading fun times...",
];

const getRandomTip = () => {
  return loadingTips[Math.floor(Math.random() * loadingTips.length)];
};

export default LoadingScreen; 