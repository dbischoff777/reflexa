import React from 'react';
import { Paper } from '@mui/material';
import { ArrowLeft, Github, Coffee, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const About = ({ settings }) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className={`
      min-h-screen w-full
      fixed inset-0
      overflow-y-auto
      ${settings?.theme === 'dark' 
        ? 'bg-gray-800 text-white' 
        : 'bg-gray-50 text-gray-900'
      }
    `}>
      <div className="
        min-h-full
        flex items-center justify-center
        px-1 py-2 2xs:px-2 xs:px-3 sm:px-6 
        pb-safe
      ">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="w-full my-auto"
        >
          <Paper 
            elevation={3}
            className={`
              relative 
              w-full
              max-w-[240px] 2xs:max-w-[280px] xs:max-w-[320px] sm:max-w-[400px]
              mx-auto
              rounded-md xs:rounded-lg sm:rounded-xl
              p-2 2xs:p-3 xs:p-4 sm:p-6
              ${settings?.theme === 'dark' 
                ? 'bg-gray-700' 
                : 'bg-gray-100'
              }
            `}
            sx={{
              backgroundColor: settings?.theme === 'dark' ? '#374151' : '#f3f4f6',
              position: 'relative',
            }}
          >
            {/* Back Button - Increased touch target */}
            <Link 
              to="/" 
              className={`
                absolute 
                top-0 left-0
                p-2 2xs:p-3 xs:p-4
                touch-manipulation
                active:opacity-70
                transition-opacity
                ${settings?.theme === 'dark'
                  ? 'text-purple-400'
                  : 'text-purple-600'
                }
              `}
              aria-label="Back to home"
            >
              <ArrowLeft className="w-4 h-4 2xs:w-5 2xs:h-5 sm:w-6 sm:h-6" />
            </Link>
      
            {/* Title Section */}
            <div className="
              text-center 
              mt-4 2xs:mt-6 xs:mt-8 sm:mt-10
              mb-2 2xs:mb-3 xs:mb-4 sm:mb-6
            ">
              <motion.h1 
                className={`
                  text-base 2xs:text-lg xs:text-xl sm:text-3xl
                  font-bold 
                  mb-1 2xs:mb-1.5 xs:mb-2 sm:mb-3
                  ${settings?.theme === 'dark'
                    ? 'text-purple-300'
                    : 'text-purple-600'
                  }
                `}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                About Fetch & Feast
              </motion.h1>
              <motion.div 
                className="h-0.5 2xs:h-1 mx-auto rounded-full bg-purple-500 w-8 2xs:w-12 xs:w-16 sm:w-20"
                initial={{ width: 0 }}
                animate={{ width: '2rem' }}
                transition={{ duration: 0.3, delay: 0.2 }}
              />
            </div>
      
            {/* Content Section */}
            <div className={`
              space-y-2 2xs:space-y-3 xs:space-y-4 sm:space-y-5
              ${settings?.theme === 'dark'
                ? 'text-gray-200'
                : 'text-gray-700'
              }
            `}>
              <motion.p 
                className="
                  text-[11px] 2xs:text-xs xs:text-sm sm:text-base
                  leading-relaxed
                "
                variants={listItemVariants}
              >
                Fetch & Feast is a delightful reaction game where playful pups chase 
                after tasty treats.
              </motion.p>
              
              <motion.div 
                className="space-y-1.5 2xs:space-y-2 xs:space-y-3 sm:space-y-4"
                variants={listItemVariants}
              >
                <h2 className="
                  text-sm 2xs:text-base xs:text-lg sm:text-xl
                  font-bold
                ">
                  How to Play:
                </h2>
                <ul className="
                  list-disc 
                  space-y-1 2xs:space-y-1.5 xs:space-y-2
                  text-left 
                  pl-2 2xs:pl-3 xs:pl-4 sm:pl-5
                  text-[11px] 2xs:text-xs xs:text-sm sm:text-base
                ">
                  {[
                    "Click the Start Game button to begin your adventure",
                    "Click or tap the treats as they appear",
                    "Score points for each successful catch",
                    "Be careful! Missing treats or wrong clicks cost lives!"
                  ].map((item, index) => (
                    <motion.li 
                      key={index}
                      variants={listItemVariants}
                      className="touch-manipulation"
                    >
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
  
              {/* Pro Tips Section */}
              <motion.div 
                className={`
                  p-1.5 2xs:p-2 xs:p-3 sm:p-4
                  rounded-md xs:rounded-lg 
                  mt-2 2xs:mt-3 xs:mt-4 sm:mt-5
                  ${settings?.theme === 'dark' 
                    ? 'bg-gray-600/50'
                    : 'bg-purple-100/80'
                  }
                `}
                variants={listItemVariants}
              >
                <h2 className={`
                  text-sm 2xs:text-base xs:text-lg sm:text-xl
                  font-bold 
                  mb-1 2xs:mb-1.5 xs:mb-2 sm:mb-3
                  ${settings?.theme === 'dark'
                    ? 'text-purple-300'
                    : 'text-purple-700'
                  }
                `}>
                  Pro Tips:
                </h2>
                <ul className={`
                  list-disc
                  space-y-1 2xs:space-y-1.5 xs:space-y-2
                  text-left
                  pl-2 2xs:pl-3 xs:pl-4 sm:pl-5
                  text-[11px] 2xs:text-xs xs:text-sm sm:text-base
                  ${settings?.theme === 'dark'
                    ? 'text-gray-200'
                    : 'text-gray-700'
                  }
                `}>
                  {[
                    "Keep your eyes near the center for faster reactions",
                    "Watch for patterns in treat appearances",
                    "Take short breaks between games to maintain focus"
                  ].map((tip, index) => (
                    <li key={index} className="touch-manipulation">
                      {tip}
                    </li>
                  ))}
                </ul>
              </motion.div>
  
              {/* Footer Section */}
              <motion.div 
                className="text-center space-y-1 2xs:space-y-1.5 xs:space-y-2 mt-2 2xs:mt-3 xs:mt-4 sm:mt-5"
                variants={listItemVariants}
              >
                <p className={`
                  text-[9px] 2xs:text-[10px] xs:text-xs sm:text-sm
                  ${settings?.theme === 'dark'
                    ? 'text-gray-300'
                    : 'text-gray-600'
                  }
                `}>
                  © {new Date().getFullYear()} Dennis Bischoff. All rights reserved.
                </p>
              <p className={`
                text-[9px] 2xs:text-[10px] xs:text-xs sm:text-base
                italic flex items-center justify-center gap-1 2xs:gap-1.5 xs:gap-2
                ${settings?.theme === 'dark'
                  ? 'text-gray-300'
                  : 'text-gray-600'
                }
              `}>
                Created with React and 
                <Heart className="w-2.5 h-2.5 2xs:w-3 2xs:h-3 xs:w-4 xs:h-4 text-red-500 animate-pulse" />
              </p>
              </motion.div>
            </div>
          </Paper>
        </motion.div>
      </div>
    </div>
  );  
};

export default About;
