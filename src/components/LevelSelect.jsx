import React, { useEffect, useRef } from 'react';
import { useSettings } from '../Settings';
import { useNavigate } from 'react-router-dom';
import { GAME_STATES } from '../PopItGame';

// Helper function to get level data (move this to a game state manager in a real app)
const getLevelData = (level) => {
  // Simulated level data - replace with actual game data storage
  const mockData = {
    bestScore: Math.floor(Math.random() * 10000),
    bestTime: Math.floor(Math.random() * 300), // in seconds
    attempts: Math.floor(Math.random() * 10),
    completed: true,
  };
  return mockData;
};

// Calculate stars based on actual metrics
const getLevelStars = (level) => {
  const { bestScore, bestTime } = getLevelData(level);
  
  // Example scoring criteria (adjust based on your game)
  if (bestScore > 8000 && bestTime < 120) return 3;
  if (bestScore > 5000 && bestTime < 180) return 2;
  if (bestScore > 3000) return 1;
  return 0;
};

// Format time for display
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Add this to your style section
const additionalStyles = `
  .level-tooltip {
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
    width: 200px;
    height: 120px;
    transform: translate(-50%, -140%);
  }
  
  .tooltip-content {
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(4px);
    padding: 12px;
    border-radius: 8px;
    color: white;
    font-size: 14px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .tooltip-content h3 {
    margin: 0 0 8px 0;
    color: #f3f4f6;
    font-size: 16px;
    font-weight: bold;
  }
  
  .tooltip-content p {
    margin: 4px 0;
    color: #d1d5db;
  }
  
  .tooltip-stats {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .star {
    fill: none;
    stroke: #fbbf24;
    stroke-width: 2;
    transition: fill 0.3s;
  }
  
  .star.earned {
    fill: #fbbf24;
  }
  
  .difficulty-indicator {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }
  
  // Add responsive tooltip styles
  @media (max-width: 480px) {
    .level-tooltip {
      width: 160px;
      height: 100px;
      transform: translate(-50%, -130%);
    }
    
    .tooltip-content {
      padding: 8px;
      font-size: 12px;
    }
    
    .tooltip-content h3 {
      font-size: 14px;
      margin: 0 0 4px 0;
    }
    
    .tooltip-stats {
      margin-top: 4px;
      padding-top: 4px;
    }
  }
`;

// Add these helper functions at the top
const getLevelRequirements = (level) => {
  return {
    scoreTarget: 5000 + (level - 1) * 1000,
    timeLimit: Math.max(60 - (level - 1) * 2, 30),
    minMultiplier: Math.min(1 + Math.floor((level - 1) / 5), 5)
  };
};

const getLevelProgress = (level) => {
  const savedProgress = JSON.parse(localStorage.getItem('levelProgress') || '{}');
  return savedProgress[level] || {
    highScore: 0,
    bestTime: null,
    attempts: 0,
    stars: 0
  };
};

const LevelSelect = ({ 
  currentLevel = 1, 
  maxLevel = 20, 
  onLevelSelect, 
  gameState, 
  setGameState 
}) => {
  const svgRef = useRef(null);
  const { settings } = useSettings();
  const navigate = useNavigate();

  // Add handleLevelSelect function
  const handleLevelSelect = (level) => {
    if (level === 1) {
      // Check if username exists
      const username = localStorage.getItem('username');
      if (!username) {
        // Prompt for username if not set
        const newUsername = prompt('Please enter your username to start:');
        if (newUsername?.trim()) {
          localStorage.setItem('username', newUsername.trim());
          onLevelSelect(level);
        }
      } else {
        onLevelSelect(level);
      }
    } else {
      onLevelSelect(level);
    }
  };

  useEffect(() => {
    if (svgRef.current) {
      const svg = svgRef.current;
      const path = svg.querySelector('#levelPath');
      
      const levels = Array.from({ length: maxLevel }, (_, i) => i + 1);
      
      levels.forEach((level, index) => {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const requirements = getLevelRequirements(level);
        const progress = getLevelProgress(level);
        
        // Get difficulty color based on current theme
        const difficulty = (() => {
          if (settings.theme === 'dark') {
            if (level <= 5) return { type: 'easy', color: '#4ADE80' }; // Bright green
            if (level <= 10) return { type: 'medium', color: '#FBB224' }; // Bright yellow/orange
            if (level <= 15) return { type: 'hard', color: '#EF4444' }; // Bright red
            return { type: 'expert', color: '#B975F9' }; // Bright neon purple
          } else {
            if (level <= 5) return { type: 'easy', color: '#22C55E' }; // Softer green
            if (level <= 10) return { type: 'medium', color: '#F59E0B' }; // Softer orange
            if (level <= 15) return { type: 'hard', color: '#DC2626' }; // Softer red
            return { type: 'expert', color: '#7C3AED' }; // Softer purple
          }
        })();
        
        // Create tooltip with level info
        const tooltip = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
        tooltip.setAttribute('class', 'level-tooltip');
        tooltip.innerHTML = `
          <div class="tooltip-content">
            <h3>Level ${level}</h3>
            <div class="tooltip-stats">
              <div>
                <p>Target Score: ${requirements.scoreTarget.toLocaleString()}</p>
                <p>Time Limit: ${requirements.timeLimit}s</p>
                <p>Min Multiplier: ${requirements.minMultiplier}x</p>
              </div>
              ${progress.attempts > 0 ? `
                <div class="progress-stats">
                  <p>Best Score: ${progress.highScore.toLocaleString()}</p>
                  <p>Best Time: ${progress.bestTime ? formatTime(progress.bestTime) : 'N/A'}</p>
                  <p>Attempts: ${progress.attempts}</p>
                </div>
              ` : ''}
            </div>
          </div>
        `;
        
        // Update click handler to use handleLevelSelect
        group.onclick = () => {
          if (level <= currentLevel) {
            handleLevelSelect(level);
          }
        };
        
        // Create main level circle
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute('r', '20');
        circle.setAttribute(level <= currentLevel ? 'done' : 'todo', '');
        if (level === currentLevel) {
          circle.setAttribute('current-level', '');
        }
        circle.style.stroke = difficulty.color;
        circle.style.strokeWidth = '2';
        
        // Add level number
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.textContent = level;
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('alignment-baseline', 'middle');
        
        // Add stars for completed levels
        if (level < currentLevel) {
          for (let i = 0; i < 3; i++) {
            const star = document.createElementNS("http://www.w3.org/2000/svg", "path");
            star.setAttribute('class', `star ${i < getLevelStars(level) ? 'earned' : ''}`);
            star.setAttribute('d', 'M0,-5 L2,-2 L5,-1 L2,1 L3,5 L0,3 L-3,5 L-2,1 L-5,-1 L-2,-2 Z');
            star.setAttribute('transform', `translate(${(i-1)*15}, 25)`);
            group.appendChild(star);
          }
        }
        
        // Add all elements to group
        group.appendChild(circle);
        group.appendChild(text);
        
        // Fix the keyPoints calculation
        const keyPointValue = levels.length > 1 ? index / (levels.length - 1) : 0;
        const animateMotion = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
        animateMotion.setAttribute('dur', `${0.5 + index * 0.1}s`);
        animateMotion.setAttribute('fill', 'freeze');
        animateMotion.setAttribute('keyPoints', `0;${keyPointValue}`);
        animateMotion.setAttribute('keyTimes', '0;1');
        animateMotion.setAttribute('calcMode', 'linear');
        
        const mpath = document.createElementNS("http://www.w3.org/2000/svg", "mpath");
        mpath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#levelPath');
        
        animateMotion.appendChild(mpath);
        group.appendChild(animateMotion);
        
        svg.appendChild(group);
      });
    }
  }, [currentLevel, onLevelSelect, maxLevel, settings?.theme]);

  const generatePath = (levelCount) => {
    // Adjust curve size and spacing based on screen width
    const isMobile = window.innerWidth < 480;
    const curveSize = isMobile ? 120 : 180;  // Smaller curves on mobile
    const spacing = isMobile ? 180 : 250;    // Reduced spacing on mobile
    
    let path = `M200 60`;
    const curves = Math.ceil(levelCount / 4);
    
    for (let i = 0; i < curves; i++) {
      if (i % 2 === 0) {
        path += ` C${200 + curveSize} ${60 + i * spacing},` +
                ` ${200 + curveSize} ${60 + (i + 1) * spacing},` +
                ` 200 ${60 + (i + 1) * spacing}`;
      } else {
        path += ` C${200 - curveSize} ${60 + i * spacing},` +
                ` ${200 - curveSize} ${60 + (i + 1) * spacing},` +
                ` 200 ${60 + (i + 1) * spacing}`;
      }
    }
    
    return path;
  };

  const handleBackClick = () => {
    // Handle state update and navigation directly
    if (typeof setGameState === 'function') {
      setGameState(GAME_STATES.MENU);
    }
    navigate('/');
  };

  return (
    <div className="fixed inset-0 z-[5] overflow-auto scrollbar-hide">
      <div className={`flex flex-col items-center p-2 xs:p-4 sm:p-8 min-h-full
        ${settings.theme === 'dark' 
          ? 'bg-gradient-to-b from-[#1F2937] to-[#111827]' // Dark theme: Navy gradient
          : 'bg-gradient-to-b from-gray-100 to-gray-200'   // Light theme: Light gray gradient
        }`}
      >
        <button
          onClick={handleBackClick}
          className={`fixed top-2 xs:top-4 left-2 xs:left-4 sm:left-8 
                     px-2 py-1 xs:px-3 xs:py-1 sm:px-4 sm:py-2 
                     rounded-lg transition-all duration-300
                     flex items-center gap-1 xs:gap-2 
                     text-xs xs:text-sm sm:text-base w-fit
                     ${settings.theme === 'dark'
                       ? 'bg-[#B975F9] hover:bg-[#9D5CF7] shadow-[0_0_10px_rgba(185,117,249,0.5)]'
                       : 'bg-[#7C3AED] hover:bg-[#6D28D9] shadow-[0_0_10px_rgba(124,58,237,0.5)]'
                     }
                     text-white font-medium
                     hover:shadow-[0_0_15px_rgba(124,58,237,0.6)]`}
        >
          <svg className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* SVG content - Updated viewBox and styles */}
        <svg 
          ref={svgRef} 
          viewBox={`0 0 400 ${Math.max(800, 200 * Math.ceil(maxLevel / 4))}`}
          className="w-full max-w-[400px] mx-auto"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="pathGradient" gradientUnits="userSpaceOnUse">
              {settings.theme === 'dark' ? (
                <>
                  <stop offset="0%" stopColor="#B975F9" />  // Dark theme: Bright neon purple
                  <stop offset="50%" stopColor="#9D5CF7" /> // Dark theme: Medium neon purple
                  <stop offset="100%" stopColor="#7B3AED" /> // Dark theme: Darker neon purple
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#8B5CF6" />  // Light theme: Softer purple
                  <stop offset="50%" stopColor="#7C3AED" /> // Light theme: Medium purple
                  <stop offset="100%" stopColor="#6D28D9" /> // Light theme: Darker purple
                </>
              )}
            </linearGradient>
            
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feFlood 
                floodColor="#B975F9" 
                floodOpacity="0.5"
              />
              <feComposite in2="coloredBlur" operator="in"/>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <style>
            {`
              // Update circle sizes for mobile
              circle { 
                r: 12; 
                cursor: pointer; 
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
              }
              @media (min-width: 480px) { circle { r: 15; } }
              @media (min-width: 640px) { circle { r: 20; } }
              
              // Update text sizes for mobile
              text { 
                font-size: 10px;
              }
              @media (min-width: 480px) { text { font-size: 12px; } }
              @media (min-width: 640px) { text { font-size: 16px; } }
              
              // Update star positioning for mobile
              .star {
                transform: scale(0.8);
              }
              @media (min-width: 480px) { 
                .star { transform: scale(0.9); }
              }
              @media (min-width: 640px) { 
                .star { transform: scale(1); }
              }
              
              [done] { 
                fill: url(#pathGradient);
                filter: url(#glow);
              }
              [todo] { 
                fill: ${settings.theme === 'dark' ? '#374151' : '#E5E7EB'}; // Adjust gray based on theme
                opacity: ${settings.theme === 'dark' ? '0.6' : '0.8'};
                transition: opacity 0.3s;
              }
              [todo]:hover {
                opacity: ${settings.theme === 'dark' ? '0.8' : '0.9'};
              }
              .glow {
                fill: ${settings.theme === 'dark' 
                  ? 'rgba(185, 117, 249, 0.3)' // Dark theme: Neon purple
                  : 'rgba(124, 58, 237, 0.3)'  // Light theme: Softer purple
                };
                animation: pulse 3s ease-in-out infinite;
              }
              .progress-ring {
                fill: none;
                stroke: #FFD700;
                stroke-width: 2;
                stroke-dasharray: 145;
                stroke-dashoffset: 145;
                animation: progress 2s ease-in-out infinite;
                filter: url(#glow);
              }
              @keyframes pulse {
                0% { opacity: 0.3; r: 20; }
                50% { opacity: 0.6; r: 23; }
                100% { opacity: 0.3; r: 20; }
              }
              @keyframes progress {
                0% { stroke-dashoffset: 145; }
                50% { stroke-dashoffset: 0; }
                100% { stroke-dashoffset: 145; }
              }
              g:hover circle[done] {
                transform: scale(1.15);
              }
              .click circle[done] {
                transform: scale(0.85);
              }
              #levelPath {
                stroke-dasharray: 10;
                animation: pathDash 60s linear infinite;
              }
              @keyframes pathDash {
                to {
                  stroke-dashoffset: -1000;
                }
              }
              .explosion {
                r: 0;
                fill: none;
                stroke: gold;
                stroke-width: 2;
                animation: explode 0.5s ease-out forwards;
              }
              @keyframes explode {
                0% { r: 20; opacity: 1; }
                100% { r: 50; opacity: 0; }
              }
              /* Hide scrollbar for Chrome, Safari and Opera */
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }

              /* Hide scrollbar for IE, Edge and Firefox */
              .scrollbar-hide {
                -ms-overflow-style: none;  /* IE and Edge */
                scrollbar-width: none;  /* Firefox */
              }
            `}
          </style>

          {/* Path with enhanced styling */}
          <path 
            id="levelPath" 
            fill="none" 
            stroke="url(#pathGradient)"
            strokeWidth="3" 
            filter="url(#glow)"
            d={generatePath(maxLevel)}
            style={{
              strokeLinecap: 'round',
              strokeLinejoin: 'round'
            }}
          />
        </svg>
      </div>
    </div>
  );
};

export default LevelSelect;