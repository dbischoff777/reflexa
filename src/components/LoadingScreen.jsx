import React from 'react';
import { motion } from 'framer-motion';
import frenchieIcon from '../images/frenchie.png';

const LoadingScreen = ({ theme, progress }) => (
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
      className="text-center"
    >
      <img
        src={frenchieIcon}
        alt="Loading..."
        className={`
          w-24 h-24 mb-4
          animate-bounce
          ${theme === 'dark' ? 'filter brightness-110' : ''}
        `}
      />
      
      {/* Progress Bar */}
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

      <p className={`
        text-sm font-medium
        ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}
      `}>
        Loading... {Math.round(progress)}%
      </p>
    </motion.div>
  </div>
);

export default LoadingScreen; 