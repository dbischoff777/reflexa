import React from 'react';
import { motion } from 'framer-motion';

const TutorialHighlight = ({ targetRef, theme }) => {
  const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0, height: 0 });

  React.useEffect(() => {
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 8,
        left: rect.left - 8,
        width: rect.width + 16,
        height: rect.height + 16,
      });
    }
  }, [targetRef]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed pointer-events-none z-50"
      style={position}
    >
      <div className={`
        absolute inset-0
        rounded-lg
        border-2
        ${theme === 'dark' ? 'border-purple-400' : 'border-purple-600'}
      `} />
      <div className={`
        absolute inset-0
        rounded-lg
        animate-ping
        ${theme === 'dark' ? 'bg-purple-400/20' : 'bg-purple-600/20'}
      `} />
    </motion.div>
  );
};

export default TutorialHighlight; 