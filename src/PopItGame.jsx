import React, { useEffect } from 'react';
import PopItGameUI from './PopItGameUI';
import { useSettings } from './Settings';
import { useAvatar } from './hooks/useAvatar';
import { useGameHooks } from './hooks/useGameHooks';
import mascotImage from './assets/images/cute-mascot.png';
import LevelSelect from './components/LevelSelect';
import MusicGenerator from './services/MusicGenerator';
import Particles from "react-tsparticles";

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

  // PopEffect component (keep this as it's UI specific)
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
                value: Math.min(Math.max(15, (100 / gridColumns) * 2), 30)
              },
              move: {
                ...options.particles.move,
                speed: Math.min(Math.max(15, (100 / gridColumns) * 1.5), 25)
              }
            },
            emitters: {
              ...options.emitters,
              rate: {
                ...options.emitters.rate,
                quantity: Math.min(Math.max(10, (100 / gridColumns) * 1.5), 20)
              }
            }
          }}
        />
      </div>
    );
  };

  return (
    <div>
      {gameState === GAME_STATES.LEVELSELECT ? (
        <LevelSelect
          currentLevel={game.currentLevel}
          maxLevel={game.maxLevel}
          onLevelSelect={game.handleLevelSelect}
          gameState={gameState}
          setGameState={setGameState}
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
          containerRef={game.containerRef}
          buttonPosition={game.buttonPosition}
          setButtonPosition={game.setButtonPosition}
          getRandomPosition={game.getRandomPosition}
        />
      )}
    </div>
  );
};

export default PopItGame;  