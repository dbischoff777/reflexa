// src/constants/powerUps.js

// Power-up types enum
export const POWER_UP_TYPES = {
    FREEZE: 'FREEZE',
    EXTRA_LIFE: 'EXTRA_LIFE',
    DOUBLE_POINTS: 'DOUBLE_POINTS',
    SHIELD: 'SHIELD',
};

// Power-up configuration
export const POWER_UP_CONFIG = {
    [POWER_UP_TYPES.FREEZE]: {
        id: 'freeze',
        name: 'Time Freeze',
        icon: '❄️',
        description: 'Slows down the game temporarily',
        duration: 5000,
        probability: 0.1,
        color: '#87CEEB',
        particleColor: '#E0FFFF',
    },
    [POWER_UP_TYPES.EXTRA_LIFE]: {
        id: 'extraLife',
        name: 'Extra Life',
        icon: '❤️',
        description: 'Grants an additional life',
        probability: 0.05,
        color: '#FF69B4',
        particleColor: '#FFB6C1',
    },
    [POWER_UP_TYPES.DOUBLE_POINTS]: {
        id: 'doublePoints',
        name: 'Double Points',
        icon: '⭐',
        description: 'Doubles points for a limited time',
        duration: 8000,
        probability: 0.08,
        color: '#FFD700',
        particleColor: '#FFFF00',
    },
    [POWER_UP_TYPES.SHIELD]: {
        id: 'shield',
        name: 'Shield',
        icon: '🛡️',
        description: 'Protects from one mistake',
        duration: 10000,
        probability: 0.06,
        color: '#98FB98',
        particleColor: '#90EE90',
    },
};

// Power-up effects
export const powerUpEffects = {
    [POWER_UP_TYPES.FREEZE]: ({setGameSpeed}) => {
        setGameSpeed(0.5);
        return () => setGameSpeed(1);
    },

    [POWER_UP_TYPES.EXTRA_LIFE]: ({setLives, maxLives = 5}) => {
        setLives(prev => Math.min(prev + 1, maxLives));
        return () => {};
    },

    [POWER_UP_TYPES.DOUBLE_POINTS]: ({setScoreMultiplier}) => {
        setScoreMultiplier(2);
        return () => setScoreMultiplier(1);
    },

    [POWER_UP_TYPES.SHIELD]: ({setShieldActive}) => {
        setShieldActive(true);
        return () => setShieldActive(false);
    },
};

// Power-up spawn logic
export const shouldSpawnPowerUp = (currentPowerUps = []) => {
    const maxPowerUps = 1;
    if (currentPowerUps.length >= maxPowerUps) return false;

    const baseSpawnChance = 0.1;
    return Math.random() < baseSpawnChance;
};

// Get random power-up
export const getRandomPowerUp = () => {
    const powerUps = Object.values(POWER_UP_CONFIG);
    const random = Math.random();
    let probabilitySum = 0;

    for (const powerUp of powerUps) {
        probabilitySum += powerUp.probability;
        if (random < probabilitySum) {
            return powerUp;
        }
    }

    return powerUps[0];
};

// Power-up utility functions
export const powerUpUtils = {
    isActive: (powerUpId, activePowerUps) => {
        return activePowerUps.some(pu => pu.id === powerUpId);
    },

    getRemainingDuration: (powerUpId, activePowerUps) => {
        const powerUp = activePowerUps.find(pu => pu.id === powerUpId);
        if (!powerUp) return 0;
        return Math.max(0, powerUp.endTime - Date.now());
    },

    formatDuration: (duration) => {
        return `${(duration / 1000).toFixed(1)}s`;
    }
};
