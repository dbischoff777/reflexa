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
        px-3 py-4 xs:p-4 sm:p-6
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
              max-w-[280px] xs:max-w-[320px] sm:max-w-[400px]
              mx-auto
              rounded-xl
              p-4 xs:p-5 sm:p-6
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
                p-4
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
              <ArrowLeft className="w-6 h-6" />
            </Link>
      
            {/* Title Section */}
            <div className="
              text-center 
              mt-8 xs:mt-10
              mb-4 xs:mb-5 sm:mb-6
            ">
              <motion.h1 
                className={`
                  text-xl xs:text-2xl sm:text-3xl
                  font-bold 
                  mb-2 xs:mb-3
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
                className="h-1 mx-auto rounded-full bg-purple-500 w-16 xs:w-20"
                initial={{ width: 0 }}
                animate={{ width: '4rem' }}
                transition={{ duration: 0.3, delay: 0.2 }}
              />
            </div>
      
            {/* Content Section */}
            <div className={`
              space-y-4 xs:space-y-5
              ${settings?.theme === 'dark'
                ? 'text-gray-200'
                : 'text-gray-700'
              }
            `}>
              <motion.p 
                className="
                  text-sm xs:text-base
                  leading-relaxed
                "
                variants={listItemVariants}
              >
                Fetch & Feast is a delightful reaction game where playful pups chase 
                after tasty treats. Test your reflexes and see how many treats you can help
                them catch!
              </motion.p>
              
              <motion.div 
                className="space-y-3 xs:space-y-4"
                variants={listItemVariants}
              >
                <h2 className="
                  text-lg xs:text-xl
                  font-bold
                ">
                  How to Play:
                </h2>
                <ul className="
                  list-disc 
                  space-y-2.5
                  text-left 
                  pl-4 xs:pl-5
                  text-sm xs:text-base
                ">
                  {[
                    "Click the Start Game button to begin your adventure",
                    "Watch for the countdown timer",
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
                  p-3 xs:p-4 
                  rounded-lg 
                  mt-4 xs:mt-5
                  ${settings?.theme === 'dark' 
                    ? 'bg-gray-600/50'
                    : 'bg-purple-100/80'
                  }
                `}
                variants={listItemVariants}
              >
                <h2 className={`
                  text-lg xs:text-xl
                  font-bold 
                  mb-2 xs:mb-3
                  ${settings?.theme === 'dark'
                    ? 'text-purple-300'
                    : 'text-purple-700'
                  }
                `}>
                  Pro Tips:
                </h2>
                <ul className={`
                  list-disc
                  space-y-2
                  text-left
                  pl-4 xs:pl-5
                  text-sm xs:text-base
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
                className="text-center space-y-2 mt-4 xs:mt-5"
                variants={listItemVariants}
              >
                <p className={`
                  text-xs xs:text-sm
                  ${settings?.theme === 'dark'
                    ? 'text-gray-300'
                    : 'text-gray-600'
                  }
                `}>
                  © {new Date().getFullYear()} Dennis Bischoff. All rights reserved.
                </p>
              <p className={`
                text-xs xs:text-sm sm:text-base
                italic flex items-center justify-center gap-2
                ${settings?.theme === 'dark'
                  ? 'text-gray-300'
                  : 'text-gray-600'
                }
              `}>
                Created with React and 
                <Heart className="w-4 h-4 text-red-500 animate-pulse" />
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
