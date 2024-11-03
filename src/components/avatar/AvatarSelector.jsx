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
      className="flex flex-col items-center 
                 gap-2 2xs:gap-3 xs:gap-4 sm:gap-5 md:gap-6
                 px-2 2xs:px-3 xs:px-4 sm:px-6 md:px-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h2 
        className={`
          text-lg 2xs:text-xl xs:text-2xl sm:text-3xl md:text-4xl 
          font-bold relative
          ${settings?.theme === 'dark' ? 'text-purple-300' : 'text-purple-600'}
        `}
        variants={itemVariants}
      >
        Choose Your Avatar
        <motion.div 
          className={`
            absolute -bottom-1 2xs:-bottom-1.5 xs:-bottom-2 
            left-0 right-0 
            h-0.5 xs:h-1 
            rounded-full
            ${settings?.theme === 'dark' ? 'bg-purple-500/50' : 'bg-purple-400/50'}
          `}
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </motion.h2>
  
      <motion.div 
        className="flex gap-2 2xs:gap-3 xs:gap-4 
                   justify-center items-center flex-wrap 
                   w-full max-w-[144px] 2xs:max-w-[280px] xs:max-w-md"
        variants={containerVariants}
      >
        {AVAILABLE_AVATARS.map((avatar, index) => (
          <motion.button
            key={avatar.id}
            onClick={() => onSelect(avatar.id)}
            variants={itemVariants}
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.95 }}
            className={`
              relative
              p-1 2xs:p-1.5 xs:p-2
              rounded-lg xs:rounded-xl
              transition-all duration-300
              ${currentAvatar === avatar.id 
                ? `ring-1 xs:ring-2 
                   ${settings?.theme === 'dark' ? 'ring-purple-400' : 'ring-purple-500'} 
                   ring-offset-1 xs:ring-offset-2
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
                w-10 h-10 2xs:w-12 2xs:h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20
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
                    w-3 h-3 2xs:w-4 2xs:h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6
                    rounded-full
                    flex items-center justify-center
                    ${settings?.theme === 'dark' ? 'bg-purple-400' : 'bg-purple-500'}
                    text-white
                    shadow-lg
                  `}
                >
                  <svg 
                    className="w-2 h-2 2xs:w-2.5 2xs:h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4" 
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
  
              {/* Avatar Name */}
              <motion.p 
                className={`
                  mt-1 2xs:mt-1.5 xs:mt-2
                  text-[10px] 2xs:text-xs xs:text-sm sm:text-base
                  font-medium
                  transition-colors duration-300
                  ${currentAvatar === avatar.id 
                    ? settings?.theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
                    : settings?.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }
                `}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                {avatar.name}
              </motion.p>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );  
};

export default AvatarSelector;