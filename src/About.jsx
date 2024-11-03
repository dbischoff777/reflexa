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
      flex min-h-screen items-center justify-center fixed inset-0 
      px-2 py-4 2xs:p-3 xs:p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12
      overflow-y-auto
      ${settings?.theme === 'dark' 
        ? 'bg-gray-800 text-white' 
        : 'bg-gray-50 text-gray-900'
      }
    `}>
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
            max-w-[280px] xs:max-w-[300px] sm:max-w-[400px] md:max-w-[450px] lg:max-w-[500px] xl:max-w-[550px]
            mx-auto
            rounded-lg 2xs:rounded-xl sm:rounded-2xl md:rounded-3xl
            p-4 xs:p-6 sm:p-7 md:p-8 lg:p-9 xl:p-10
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
          <Link 
            to="/" 
            className={`
              absolute 
              top-3 xs:top-4 
              left-3 xs:left-4 
              transition-transform 
              hover:scale-105 sm:hover:scale-110
              ${settings?.theme === 'dark'
                ? 'text-purple-400 hover:text-purple-300'
                : 'text-purple-600 hover:text-purple-500'
              }
            `}
          >
            <ArrowLeft className="w-5 h-5 xs:w-6 xs:h-6" />
          </Link>
    
          <div className="text-center mb-4 xs:mb-6 sm:mb-7 md:mb-8">
            <motion.h1 
              className={`
                text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl
                font-bold 
                mb-2 xs:mb-3 sm:mb-4
                ${settings?.theme === 'dark'
                  ? 'text-purple-300'
                  : 'text-purple-600'
                }
              `}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              About Fetch & Feast
            </motion.h1>
            <motion.div 
              className="h-0.5 xs:h-1 mx-auto rounded-full bg-purple-500 w-16 xs:w-20 sm:w-24"
              initial={{ width: 0 }}
              animate={{ width: '4rem' }}
              transition={{ duration: 0.5, delay: 0.3 }}
            />
          </div>
    
          <div className={`
            space-y-4 xs:space-y-5 sm:space-y-6
            ${settings?.theme === 'dark'
              ? 'text-gray-200'
              : 'text-gray-700'
            }
          `}>
            <motion.p 
              className="
                text-sm xs:text-base sm:text-lg md:text-xl
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
                text-base xs:text-lg sm:text-xl md:text-2xl 
                font-bold
              ">
                How to Play:
              </h2>
              <ul className="
                list-disc 
                space-y-2
                text-left 
                pl-4 xs:pl-5
                text-sm xs:text-base sm:text-lg
              ">
                <motion.li variants={listItemVariants}>Click the Start Game button to begin your adventure</motion.li>
                <motion.li variants={listItemVariants}>Watch for the countdown timer</motion.li>
                <motion.li variants={listItemVariants}>Click or tap the treats as they appear</motion.li>
                <motion.li variants={listItemVariants}>Score points for each successful catch</motion.li>
                <motion.li variants={listItemVariants}>Be careful! Missing treats or wrong clicks cost lives!</motion.li>
              </ul>
            </motion.div>

            <motion.div 
              className={`
                p-3 xs:p-4 
                rounded-lg 
                mt-4 xs:mt-5 sm:mt-6
                ${settings?.theme === 'dark' 
                  ? 'bg-gray-600/50'
                  : 'bg-purple-100/80'
                }
              `}
              variants={listItemVariants}
            >
              <h2 className={`
                text-base xs:text-lg sm:text-xl
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
                space-y-1.5 xs:space-y-2
                text-left
                pl-4 xs:pl-5
                text-sm xs:text-base
                ${settings?.theme === 'dark'
                  ? 'text-gray-200'
                  : 'text-gray-700'
                }
              `}>
                <li>Keep your cursor near the center for faster reactions</li>
                <li>Watch for patterns in treat appearances</li>
                <li>Take short breaks between games to maintain focus</li>
              </ul>
            </motion.div>

            <motion.div 
              className="flex justify-center space-x-4 xs:space-x-5 mt-5 xs:mt-6"
              variants={listItemVariants}
            >
              <a 
                href="https://github.com/dbischoff777" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`
                  transition-transform hover:scale-105 sm:hover:scale-110
                  ${settings?.theme === 'dark'
                    ? 'text-purple-400 hover:text-purple-300'
                    : 'text-purple-600 hover:text-purple-500'
                  }
                `}
              >
                <Github className="w-5 h-5 xs:w-6 xs:h-6" />
              </a>
              <a 
                href="https://buymeacoffee.com/yourusername" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`
                  transition-transform hover:scale-105 sm:hover:scale-110
                  ${settings?.theme === 'dark'
                    ? 'text-purple-400 hover:text-purple-300'
                    : 'text-purple-600 hover:text-purple-500'
                  }
                `}
              >
                <Coffee className="w-5 h-5 xs:w-6 xs:h-6" />
              </a>
            </motion.div>

            <motion.div 
              className="text-center space-y-2 mt-5 xs:mt-6"
              variants={listItemVariants}
            >
              <p className={`
                text-xs xs:text-sm sm:text-base
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
  );
};

export default About;
