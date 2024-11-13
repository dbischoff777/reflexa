import React, { useEffect, useState } from 'react';
import PopItGameUI from './PopItGameUI';
import soundManager from './sounds/sound';
import { useSettings } from './Settings';
import { useAvatar } from './hooks/useAvatar';
import { useGameHooks } from './hooks/useGameHooks';
import MusicGenerator from './services/MusicGenerator';
import Particles from "react-tsparticles";
import mascotImage from './assets/images/cute-mascot.png';
import LevelSelect from './components/LevelSelect';

// Game state constants
export const GAME_STATES = {
  MENU: 'menu',
  COUNTDOWN: 'countdown',
  PLAYING: 'playing',
  LEVELSELECT: 'levelselect',
  OVER: 'over'
};

const PopItGame = ({ gameState, setGameState }) => {
  const { settings } = useSettings();
  const { playerAvatar, setPlayerAvatar } = useAvatar();
  const game = useGameHooks(gameState, setGameState);

  // Initialize screen protection
  useEffect(() => {
    let wakeLock = null;

    const requestWakeLock = async () => {
      try {
        wakeLock = await navigator.wakeLock.request('screen');
        game.setWakeLockActive(true);
        console.log('Wake Lock is active');
      } catch (err) {
        game.setWakeLockActive(false);
        console.log('Wake Lock request failed:', err.message);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    requestWakeLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock) {
        wakeLock.release()
          .then(() => {
            game.setWakeLockActive(false);
            console.log('Wake Lock released');
          })
          .catch((err) => console.log('Error releasing Wake Lock:', err));
      }
    };
  }, []);

  // Initialize music generator
  useEffect(() => {
    MusicGenerator.generateMusic();
    return () => {
      MusicGenerator.pause();
    };
  }, []);

  // Sync settings with SoundManager
  useEffect(() => {
    if (settings.soundEnabled !== !soundManager.isMuted()) {
      soundManager.toggleMute();
    }
  }, [settings.soundEnabled]);

  // Handle mascot messages
  useEffect(() => {
    if (game.mascotMessage) {
      game.setShowSpeechBubble(true);
      const timer = setTimeout(() => {
        game.setShowSpeechBubble(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [game.mascotMessage]);

  // Handle achievement notifications
  useEffect(() => {
    if (game.newAchievement) {
      game.playSound('achievement');
      const timer = setTimeout(() => {
        game.setNewAchievement(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [game.newAchievement]);

  // Update maxMultiplier
  useEffect(() => {
    if (game.multiplier > game.maxMultiplier) {
      game.setMaxMultiplier(game.multiplier);
    }
  }, [game.multiplier, game.maxMultiplier]);

  // Game loop effects
  useEffect(() => {
    if (game.gameState === GAME_STATES.COUNTDOWN && game.countdown > 0) {
      const timer = setTimeout(() => {
        game.setCountdown(prev => prev - 1);
        game.playSound('countdown');
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (game.gameState === GAME_STATES.COUNTDOWN && game.countdown === 0) {
      game.setGameState(GAME_STATES.PLAYING);
      game.setTargetButton(game.getRandomButton());
      game.setStartTime(Date.now());
      game.playSound('trySound');
    }
  }, [game.gameState, game.countdown]);

  // Handle game over condition
  useEffect(() => {
    if (game.lives <= 0 && !game.gameOver) {
      game.handleGameOver();
    }
  }, [game.lives, game.gameOver]);

  // Save music state
  useEffect(() => {
    localStorage.setItem('isMusicPlaying', JSON.stringify(game.isMusicPlaying));
  }, [game.isMusicPlaying]);

  // Update target animation
  useEffect(() => {
    if (game.targetButton !== null) {
      const randomAnimation = game.TRY_ANIMATIONS_BY_SIZE[game.currentSize];
      game.setCurrentTargetAnimation(randomAnimation[Math.floor(Math.random() * randomAnimation.length)]);
    }
  }, [game.targetButton, game.currentSize]);

  // PopEffect component
  const PopEffect = ({ row, col, theme, gridRows, gridColumns, onComplete }) => {
    const particleColors = [
      "#9333EA", "#A855F7", "#C084FC",
      "#3B82F6", "#60A5FA", "#93C5FD",
      "#EC4899", "#F472B6", "#F9A8D4",
      "#10B981", "#34D399", "#6EE7B7",
      "#F59E0B", "#FBBF24", "#FCD34D",
      "#EF4444", "#F87171", "#FCA5A5"
    ];

    const getRandomColors = (count = 3) => {
      const shuffled = [...particleColors].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };

    const options = {
      // ... (keep existing particle options)
    };

    useEffect(() => {
      const timer = setTimeout(onComplete, 500);
      return () => clearTimeout(timer);
    }, [onComplete]);

    return (
      <div
        className="absolute pointer-events-none"
        style={{
          top: `${row * (100 / gridRows) + (50 / gridRows)}%`,
          left: `${col * (100 / gridColumns) + (50 / gridColumns)}%`,
          width: `${100 / gridColumns}%`,
          height: `${100 / gridRows}%`,
          pointerEvents: 'none',
          zIndex: 1000,
          transform: 'translate(-50%, -50%) translateZ(0)'
        }}
      >
        <Particles
          id={`pop-effect-${Date.now()}`}
          options={{
            ...options,
            particles: {
              ...options.particles,
              size: {
                ...options.particles.size,
                value: {
                  min: Math.min(100 / gridColumns, 100 / gridRows) / 15,
                  max: Math.min(100 / gridColumns, 100 / gridRows) / 8
                },
                animation: {
                  enable: true,
                  speed: 3,
                  minimumValue: 0.1,
                  sync: false,
                  startValue: "max",
                  destroy: "min"
                }
              },
              number: {
                value: Math.min(Math.max(15, (100 / gridColumns) * 2), 30) // Adaptive particle count
              },
              move: {
                ...options.particles.move,
                speed: Math.min(Math.max(15, (100 / gridColumns) * 1.5), 25) // Adaptive speed
              }
            },
            emitters: {
              ...options.emitters,
              rate: {
                ...options.emitters.rate,
                quantity: Math.min(Math.max(10, (100 / gridColumns) * 1.5), 20) // Adaptive emission rate
              }
            }
          }}
        />
      </div>
    );
  };

  return (
    <>
      {gameState === GAME_STATES.LEVELSELECT ? (
        <LevelSelect
          key="level-select"
          currentLevel={game.currentLevel || 1}
          maxLevel={game.maxLevel || 1}
          gameState={gameState}
          setGameState={setGameState}
          onLevelSelect={(level) => {
            if (typeof game.handleLevelSelect === 'function') {
              game.handleLevelSelect(level);
            }
          }}
        />
      ) : (
        <PopItGameUI
          settings={settings}
          username={game.username}
          setShowUsernameInput={game.setShowUsernameInput}
          setUsername={game.setUsername}
          showUsernameInput={game.showUsernameInput}
          startTime={game.startTime}
          setGameTime={game.setGameTime}
          newAchievement={game.newAchievement}
          score={game.score}
          lives={game.lives}
          multiplier={game.multiplier}
          gameState={game.gameState}
          setGameState={game.setGameState}
          showSpeechBubble={game.showSpeechBubble}
          mascotMessage={game.mascotMessage}
          mascotImage={mascotImage}
          countdown={game.countdown}
          showGameOver={game.showGameOver}
          gameStats={game.gameStats}
          gridShake={game.gridShake}
          flashRed={game.flashRed}
          particleEffects={game.particleEffects}
          startGame={game.startGame}
          exitGame={game.handleExit}
          renderButton={game.renderButton}
          PopEffect={PopEffect}
          setParticleEffects={game.setParticleEffects}
          playerAvatar={playerAvatar}
          setPlayerAvatar={setPlayerAvatar}
          handleButtonClick={game.handleButtonClick}
          showAnimation={game.showAnimation}
          animationPosition={game.animationPosition}
          successAnimation={game.currentSuccessAnimation}
          setShowAnimation={game.setShowAnimation}
          wakeLockActive={game.wakeLockActive}
          startMusic={() => MusicGenerator.play()}
          stopMusic={() => MusicGenerator.pause()}
          isMusicPlaying={game.isMusicPlaying}
          onMusicToggle={game.toggleMusic}
          currentLevel={game.currentLevel}
          maxLevel={game.maxLevel}
        />
      )}
    </>
  );
};

export default PopItGame;  