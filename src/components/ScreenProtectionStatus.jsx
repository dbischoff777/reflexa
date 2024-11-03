import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const ScreenProtectionStatus = ({ theme, wakeLockActive, brightnessAdjusted, gameState }) => {
    return (
        <AnimatePresence>
            {gameState !== 'playing' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className={`
                        fixed 
                        left-3
                        bottom-3
                        shadow-sm
                        rounded-lg
                        touch-manipulation
                        ${theme === 'dark' 
                            ? 'bg-gray-800/80 text-white' 
                            : 'bg-white/80 text-gray-900'
                        }
                        backdrop-blur-sm
                        z-10
                    `}
                >
                    <div className="
                        flex 
                        gap-2
                        p-2
                        pointer-events-none
                    ">
                        {/* Screen Always On Status */}
                        <div className="
                            flex items-center 
                            gap-1.5
                        ">
                            <span className={`
                                w-1.5 h-1.5
                                rounded-full
                                ${wakeLockActive 
                                    ? 'bg-green-500' 
                                    : 'bg-red-500'
                                }
                            `} />
                            <span className="
                                text-[10px]
                                font-medium
                            ">
                                Screen Always On</span>
                            
                        </div>

                        {/* Brightness Status */}
                        <div className="
                            flex items-center 
                            gap-1.5
                        ">
                            <span className={`
                                w-1.5 h-1.5
                                rounded-full
                                ${brightnessAdjusted 
                                    ? 'bg-green-500' 
                                    : 'bg-yellow-500'
                                }
                            `} />
                            <span className="
                                text-[10px]
                                font-medium
                            ">
                                Dog-Friendly Colors</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Update defaultProps
ScreenProtectionStatus.defaultProps = {
    theme: 'light',
    wakeLockActive: false,
    brightnessAdjusted: false,
    gameState: 'menu'
};

export default ScreenProtectionStatus;
