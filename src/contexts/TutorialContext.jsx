import React, { createContext, useContext, useState } from 'react';

const TutorialContext = createContext();

export const TutorialProvider = ({ children }) => {
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(() => {
    return localStorage.getItem('hasCompletedTutorial') === 'true';
  });
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isTutorialActive, setIsTutorialActive] = useState(false);

  const completeTutorial = () => {
    setHasCompletedTutorial(true);
    localStorage.setItem('hasCompletedTutorial', 'true');
    setIsTutorialActive(false);
  };

  const startTutorial = () => {
    setCurrentStep(0);
    setIsTutorialActive(true);
  };

  const resetTutorial = () => {
    localStorage.removeItem('hasCompletedTutorial');
    setHasCompletedTutorial(false);
    setCurrentStep(0);
  };

  return (
    <TutorialContext.Provider
      value={{
        hasCompletedTutorial,
        currentStep,
        setCurrentStep,
        isTutorialActive,
        completeTutorial,
        startTutorial,
        resetTutorial,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}; 