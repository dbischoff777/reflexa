import { useState, useEffect, useCallback } from 'react';
import { POWER_UP_CONFIG, powerUpEffects } from '../constants/powerUps';

export const usePowerUps = () => {
    const [activePowerUps, setActivePowerUps] = useState([]);
    const [powerUpPosition, setPowerUpPosition] = useState(null);
    const [currentPowerUp, setCurrentPowerUp] = useState(null);

    // Activate a power-up
    const activatePowerUp = useCallback((powerUp, gameControls) => {
        const cleanup = powerUpEffects[powerUp.id](gameControls);
        
        setActivePowerUps(prev => [...prev, {
            ...powerUp,
            startTime: Date.now(),
            endTime: Date.now() + (powerUp.duration || 0),
            cleanup
        }]);

        // Clear power-up from grid
        setPowerUpPosition(null);
        setCurrentPowerUp(null);
    }, []);

    // Manage active power-ups lifecycle
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setActivePowerUps(prev => {
                const expired = prev.filter(pu => pu.endTime <= now);
                const active = prev.filter(pu => pu.endTime > now);
                
                // Run cleanup functions for expired power-ups
                expired.forEach(pu => pu.cleanup && pu.cleanup());
                
                return active;
            });
        }, 100);

        return () => clearInterval(interval);
    }, []);

    return {
        activePowerUps,
        powerUpPosition,
        currentPowerUp,
        setPowerUpPosition,
        setCurrentPowerUp,
        activatePowerUp
    };
};
