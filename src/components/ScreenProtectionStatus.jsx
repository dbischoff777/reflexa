import React from 'react';

export const ScreenProtectionStatus = ({ theme, wakeLockActive, brightnessAdjusted }) => {
    return (
        <div className={`fixed bottom-4 right-4 p-3 rounded-lg shadow-lg 
            ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
            transition-all duration-300 backdrop-blur-sm bg-opacity-90`}
        >
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${wakeLockActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-sm">Screen Always On</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${brightnessAdjusted ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                    <span className="text-sm">Dog-Friendly Brightness</span>
                </div>
            </div>
        </div>
    );
};

export default ScreenProtectionStatus;