import React from 'react';
import { Paper } from '@mui/material';
import { ArrowLeft, Github, Twitter, Coffee, Heart } from 'lucide-react';
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
    <div className={`flex min-h-screen items-center justify-center fixed inset-0 ${
      settings?.theme === 'dark' 
        ? 'bg-gray-800 text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Paper 
          elevation={3}
          className={`relative w-96 rounded-3xl p-8 ${
            settings?.theme === 'dark' 
              ? 'bg-gray-700' 
              : 'bg-gray-100'
          }`}
          sx={{
            backgroundColor: settings?.theme === 'dark' ? '#374151' : '#f3f4f6',
            borderRadius: '1.5rem',
            position: 'relative',
            width: '24rem',
            padding: '2rem'
          }}
        >
          <Link 
            to="/" 
            className={`absolute top-4 left-4 transition-transform hover:scale-110 ${
              settings?.theme === 'dark'
                ? 'text-purple-400 hover:text-purple-300'
                : 'text-purple-600 hover:text-purple-500'
            }`}
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
    
          <div className="text-center mb-8">
            <motion.h1 
              className={`text-3xl font-bold mb-4 ${
                settings?.theme === 'dark'
                  ? 'text-purple-300'
                  : 'text-purple-600'
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              About Fetch & Feast
            </motion.h1>
            <motion.div 
              className="w-16 h-1 mx-auto rounded-full bg-purple-500"
              initial={{ width: 0 }}
              animate={{ width: 64 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            />
          </div>
    
          <div className={`space-y-6 ${
            settings?.theme === 'dark'
              ? 'text-gray-200'
              : 'text-gray-700'
          }`}>
            <motion.p 
              className="text-lg leading-relaxed"
              variants={listItemVariants}
            >
              Fetch & Feast is a delightful reaction game where playful pups chase 
              after tasty treats. Test your reflexes and see how many treats you can help
              them catch!
            </motion.p>
            
            <motion.div 
              className="space-y-4"
              variants={listItemVariants}
            >
              <h2 className="text-xl font-bold">How to Play:</h2>
              <ul className="list-disc list-inside space-y-2 text-left ml-2">
                <motion.li variants={listItemVariants}>Click the Start Game button to begin your adventure</motion.li>
                <motion.li variants={listItemVariants}>Watch for the countdown timer</motion.li>
                <motion.li variants={listItemVariants}>Click or tap the treats as they appear</motion.li>
                <motion.li variants={listItemVariants}>Score points for each successful catch</motion.li>
                <motion.li variants={listItemVariants}>Be careful! Missing treats or wrong clicks cost lives!</motion.li>
              </ul>
            </motion.div>

            <motion.div 
              className={`p-4 rounded-lg mt-6 ${
                settings?.theme === 'dark' 
                  ? 'bg-gray-600/50' // Semi-transparent dark background
                  : 'bg-purple-100/80' // Semi-transparent light purple background
              }`}
              variants={listItemVariants}
            >
              <h2 className={`text-lg font-bold mb-2 ${
                settings?.theme === 'dark'
                  ? 'text-purple-300'
                  : 'text-purple-700'
              }`}>Pro Tips:</h2>
              <ul className={`list-disc list-inside space-y-1 text-left ${
                settings?.theme === 'dark'
                  ? 'text-gray-200'
                  : 'text-gray-700'
              }`}>
                <li>Keep your cursor near the center for faster reactions</li>
                <li>Watch for patterns in treat appearances</li>
                <li>Take short breaks between games to maintain focus</li>
              </ul>
            </motion.div>

            <motion.div 
              className="flex justify-center space-x-4 mt-6"
              variants={listItemVariants}
            >
              <a 
                href="https://github.com/dbischoff777" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`transition-transform hover:scale-110 ${
                  settings?.theme === 'dark'
                    ? 'text-purple-400 hover:text-purple-300'
                    : 'text-purple-600 hover:text-purple-500'
                }`}
              >
                <Github className="w-6 h-6" />
              </a>
              <a 
                href="https://buymeacoffee.com/yourusername" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`transition-transform hover:scale-110 ${
                  settings?.theme === 'dark'
                    ? 'text-purple-400 hover:text-purple-300'
                    : 'text-purple-600 hover:text-purple-500'
                }`}
              >
                <Coffee className="w-6 h-6" />
              </a>
            </motion.div>

            <motion.div 
              className="text-center space-y-2 mt-8"
              variants={listItemVariants}
            >
              <p className={`text-sm ${
                settings?.theme === 'dark'
                  ? 'text-gray-300'
                  : 'text-gray-600'
              }`}>
                © {new Date().getFullYear()} Dennis Bischoff. All rights reserved.
              </p>
              <p className={`text-sm italic flex items-center justify-center gap-2 ${
                settings?.theme === 'dark'
                  ? 'text-gray-300'
                  : 'text-gray-600'
              }`}>
                Created with React and <Heart className="w-4 h-4 text-red-500 animate-pulse" />
              </p>
            </motion.div>
          </div>
        </Paper>
      </motion.div>
    </div>
  );
};

export default About;
