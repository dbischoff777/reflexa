import React from 'react';
import { motion } from 'framer-motion';
import { AVAILABLE_AVATARS } from '../../constants/avatars';

const AvatarSelector = ({ currentAvatar, onSelect, settings }) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div 
      className="flex flex-col items-center gap-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h2 
        className={`text-2xl font-bold relative
          ${settings?.theme === 'dark' ? 'text-purple-300' : 'text-purple-600'}
        `}
        variants={itemVariants}
      >
        Choose Your Avatar
        <motion.div 
          className={`absolute -bottom-2 left-0 right-0 h-1 rounded-full
            ${settings?.theme === 'dark' ? 'bg-purple-500/50' : 'bg-purple-400/50'}
          `}
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </motion.h2>

      <motion.div 
        className="flex gap-4 justify-center items-center flex-wrap max-w-md"
        variants={containerVariants}
      >
        {AVAILABLE_AVATARS.map((avatar, index) => (
          <motion.button
            key={avatar.id}
            onClick={() => onSelect(avatar.id)}
            variants={itemVariants}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`
              relative
              p-2 rounded-xl
              transition-all duration-300
              ${currentAvatar === avatar.id 
                ? `ring-2 ${settings?.theme === 'dark' ? 'ring-purple-400' : 'ring-purple-500'} ring-offset-2 
                   ${settings?.theme === 'dark' ? 'ring-offset-gray-800' : 'ring-offset-white'}` 
                : `hover:bg-gray-100 
                   ${settings?.theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`
              }
            `}
          >
            {/* Avatar Container */}
            <div className="relative group">
              {/* Avatar Image */}
              <div className={`
                relative
                w-16 h-16
                rounded-full
                overflow-hidden
                transition-transform duration-300
                ${currentAvatar === avatar.id ? 'transform scale-105' : ''}
              `}>
                <img
                  src={avatar.image}
                  alt={avatar.name}
                  className={`
                    w-full h-full
                    object-cover
                    transition-all duration-300
                    ${settings?.theme === 'dark' ? 'brightness-110' : 'brightness-100'}
                  `}
                />
                
                {/* Hover Overlay */}
                <div className={`
                  absolute inset-0
                  bg-gradient-to-b
                  from-transparent
                  to-purple-500/50
                  opacity-0
                  group-hover:opacity-100
                  transition-opacity duration-300
                `} />
              </div>

              {/* Selection Indicator */}
              {currentAvatar === avatar.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`
                    absolute -top-1 -right-1
                    w-6 h-6
                    rounded-full
                    flex items-center justify-center
                    ${settings?.theme === 'dark' ? 'bg-purple-400' : 'bg-purple-500'}
                    text-white
                    shadow-lg
                  `}
                >
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2.5" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}

              {/* Glow Effect */}
              <div className={`
                absolute inset-0
                rounded-full
                transition-opacity duration-300
                ${currentAvatar === avatar.id 
                  ? 'opacity-100' 
                  : 'opacity-0 group-hover:opacity-50'}
                ${settings?.theme === 'dark' 
                  ? 'bg-purple-500/20' 
                  : 'bg-purple-300/20'}
                blur-xl
                -z-10
              `} />
            </div>

            {/* Avatar Name */}
            <motion.p 
              className={`
                mt-2 text-sm font-medium
                transition-colors duration-300
                ${currentAvatar === avatar.id 
                  ? settings?.theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
                  : settings?.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}
              `}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              {avatar.name}
            </motion.p>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default AvatarSelector;