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
                        inset-x-0
                        bottom-0
                        px-3 xs:px-4
                        pb-[calc(env(safe-area-inset-bottom)+12px)]
                        pt-3 xs:pt-4
                        shadow-lg
                        touch-manipulation
                        ${theme === 'dark' 
                            ? 'bg-gray-800/90 text-white' 
                            : 'bg-white/90 text-gray-900'
                        }
                        backdrop-blur-md
                        z-50
                    `}
                >
                    <div className="
                        max-w-screen-xl
                        mx-auto
                        grid grid-cols-2 
                        gap-2 xs:gap-3
                        pointer-events-none
                    ">
                        {/* Screen Always On Status */}
                        <div className="
                            flex items-center 
                            gap-2 xs:gap-3
                            p-2 xs:p-3
                            rounded-lg
                            bg-opacity-10
                            ${wakeLockActive 
                                ? 'bg-green-500/10' 
                                : 'bg-red-500/10'
                            }
                        ">
                            <span className={`
                                w-2.5 h-2.5 xs:w-3 xs:h-3
                                rounded-full
                                ${wakeLockActive 
                                    ? 'bg-green-500' 
                                    : 'bg-red-500'
                                }
                            `} />
                            <span className="
                                text-xs xs:text-sm
                                font-medium
                                truncate
                            ">
                                Screen Always On</span>
                            
                        </div>

                        {/* Brightness Status */}
                        <div className="
                            flex items-center 
                            gap-2 xs:gap-3
                            p-2 xs:p-3
                            rounded-lg
                            bg-opacity-10
                            ${brightnessAdjusted 
                                ? 'bg-green-500/10' 
                                : 'bg-yellow-500/10'
                            }
                        ">
                            <span className={`
                                w-2.5 h-2.5 xs:w-3 xs:h-3
                                rounded-full
                                ${brightnessAdjusted 
                                    ? 'bg-green-500' 
                                    : 'bg-yellow-500'
                                }
                            `} />
                            <span className="
                                text-xs xs:text-sm
                                font-medium
                                truncate
                            ">
                                Dog-Friendly</span>
                            
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Update defaultProps to use gameState
ScreenProtectionStatus.defaultProps = {
    theme: 'light',
    wakeLockActive: false,
    brightnessAdjusted: false,
    gameState: 'menu'
};

export default ScreenProtectionStatus;
