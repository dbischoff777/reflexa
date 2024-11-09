import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTutorial } from '../contexts/TutorialContext';
import { TUTORIAL_STEPS } from '../config/tutorialSteps';

const Tutorial = ({ theme }) => {
  const {
    currentStep,
    setCurrentStep,
    completeTutorial,
    isTutorialActive,
  } = useTutorial();

  const currentTutorialStep = TUTORIAL_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const handleTryIt = () => {
    const element = document.querySelector(currentTutorialStep.targetSelector);
    if (element) {
      // Add temporary highlight animation class
      element.classList.add('tutorial-highlight');
      
      // Allow interaction with the element
      const cleanup = () => {
        element.classList.remove('tutorial-highlight');
        element.removeEventListener('click', handleInteraction);
      };

      const handleInteraction = () => {
        cleanup();
        handleNext();
      };

      element.addEventListener('click', handleInteraction);

      // Fallback timeout in case user doesn't interact
      const timeoutId = setTimeout(() => {
        cleanup();
        handleNext();
      }, 8000);

      // Cleanup if tutorial is closed early
      return () => {
        clearTimeout(timeoutId);
        cleanup();
      };
    } else {
      // Fallback if no target element
      setTimeout(handleNext, 5000);
    }
  };

  const videoRef = useRef(null);

  return (
    <AnimatePresence>
      {isTutorialActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className={`
              relative
              max-w-md w-[90%]
              p-6 rounded-xl
              ${theme === 'dark' 
                ? 'bg-gray-800 text-white' 
                : 'bg-white text-gray-900'
              }
              shadow-xl
            `}
          >
            {/* Tutorial Content */}
            <div className="mb-6">
              <h2 className={`
                text-2xl font-bold mb-3
                ${theme === 'dark' ? 'text-purple-300' : 'text-purple-600'}
              `}>
                {currentTutorialStep.title}
              </h2>
              <p className="text-lg mb-4">
                {currentTutorialStep.content}
              </p>
              
              {/* Video Player */}
              {currentTutorialStep.animation && (
                <div className="relative w-full flex justify-center mb-4">
                  <div 
                    className="relative aspect-[9/16] bg-black w-full"
                    style={{ maxWidth: '300px' }} // Limit maximum width for larger screens
                  >
                    <video
                      ref={videoRef}
                      className="absolute inset-0 w-full h-full object-cover"
                      autoPlay={false}
                      playsInline
                      preload="auto"
                      onEnded={handleNext}
                      onError={(e) => console.error("Video error:", e)}
                    >
                      <source 
                        src={currentTutorialStep.animation}
                        type="video/mp4" 
                      />
                    </video>
                  </div>
                </div>
              )}
            </div>

            {/* Tutorial Navigation */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {TUTORIAL_STEPS.map((_, index) => (
                  <div
                    key={index}
                    className={`
                      w-2 h-2 rounded-full
                      ${index === currentStep
                        ? theme === 'dark'
                          ? 'bg-purple-400'
                          : 'bg-purple-600'
                        : theme === 'dark'
                          ? 'bg-gray-600'
                          : 'bg-gray-300'
                      }
                    `}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                {currentTutorialStep.action === 'try' ? (
                  <button
                    onClick={() => {
                      console.log("Try It clicked");
                      console.log("Video source:", currentTutorialStep.animation);
                      if (videoRef.current) {
                        videoRef.current.src = currentTutorialStep.animation;
                        videoRef.current.currentTime = 0;
                        videoRef.current.play()
                          .then(() => console.log("Try It video started playing"))
                          .catch(error => console.error("Error playing video:", error));
                      }
                    }}
                    className={`
                      px-6 py-2 rounded-lg
                      font-semibold
                      transition-all duration-200
                      ${theme === 'dark'
                        ? 'bg-purple-600 hover:bg-purple-500 text-white'
                        : 'bg-purple-500 hover:bg-purple-400 text-white'
                      }
                    `}
                  >
                    Show Me!
                  </button>
                ) : currentTutorialStep.action === 'fail' ? (
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.src = currentTutorialStep.animation;
                        videoRef.current.currentTime = 0;
                        videoRef.current.play()
                          .then(() => console.log("Fail video started playing"))
                          .catch(error => console.error("Error playing video:", error));
                      }
                      setTimeout(handleNext, 2000);
                    }}
                    className={`
                      px-6 py-2 rounded-lg
                      font-semibold
                      transition-all duration-200
                      ${theme === 'dark'
                        ? 'bg-purple-600 hover:bg-purple-500 text-white'
                        : 'bg-purple-500 hover:bg-purple-400 text-white'
                      }
                    `}
                  >
                    Show Me!
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className={`
                      px-6 py-2 rounded-lg
                      font-semibold
                      transition-all duration-200
                      ${theme === 'dark'
                        ? 'bg-purple-600 hover:bg-purple-500 text-white'
                        : 'bg-purple-500 hover:bg-purple-400 text-white'
                      }
                    `}
                  >
                    {currentStep === TUTORIAL_STEPS.length - 1 ? 'Start Playing' : 'Next'}
                  </button>
                )}
              </div>
            </div>

            {/* Highlight Element */}
            {currentTutorialStep.highlight && (
              <div
                className="absolute"
                style={{
                  // Position this based on the highlighted element
                  // You'll need to implement the positioning logic
                }}
              >
                <div className="animate-ping absolute inset-0 rounded-lg bg-purple-400 opacity-20" />
                <div className="relative rounded-lg border-2 border-purple-400" />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Tutorial; 