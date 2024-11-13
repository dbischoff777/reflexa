import React, { useEffect, useRef } from 'react';
import { useSettings } from '../Settings';

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

// Determine difficulty using game mechanics
const getDifficulty = (level) => {
  // Example difficulty progression
  if (level <= 5) return { type: 'easy', color: '#4ade80' }; // green
  if (level <= 10) return { type: 'medium', color: '#fbbf24' }; // yellow
  if (level <= 15) return { type: 'hard', color: '#ef4444' }; // red
  return { type: 'expert', color: '#8b5cf6' }; // purple
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

const LevelSelect = ({ currentLevel, maxLevel, onLevelSelect, onBack }) => {
  const svgRef = useRef(null);
  const { settings } = useSettings();

  // Add handler for first level selection
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
    // Add class when component mounts
    document.body.classList.add('level-select-open');
    
    // Remove class when component unmounts
    return () => {
      document.body.classList.remove('level-select-open');
    };
  }, []);

  useEffect(() => {
    if (svgRef.current) {
      const svg = svgRef.current;
      const path = svg.querySelector('#levelPath');
      
      const levels = Array.from({ length: 20 }, (_, i) => i + 1);
      
      levels.forEach((level, index) => {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const requirements = getLevelRequirements(level);
        const progress = getLevelProgress(level);
        const difficulty = getDifficulty(level);
        
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
        
        // Update click handler to use new function
        group.onclick = () => {
          if (level <= currentLevel) {
            handleLevelSelect(level);
          }
        };
        
        // Create main level circle
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute('r', '20');
        circle.setAttribute(level <= currentLevel ? 'done' : 'todo', '');
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
        
        // Add animations
        const animateMotion = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
        animateMotion.setAttribute('dur', `${0.5 + index * 0.1}s`);
        animateMotion.setAttribute('fill', 'freeze');
        animateMotion.setAttribute('keyPoints', `0;${index / (levels.length - 1)}`);
        animateMotion.setAttribute('keyTimes', '0;1');
        animateMotion.setAttribute('calcMode', 'linear');
        
        const mpath = document.createElementNS("http://www.w3.org/2000/svg", "mpath");
        mpath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#levelPath');
        
        animateMotion.appendChild(mpath);
        group.appendChild(animateMotion);
        
        svg.appendChild(group);
      });
    }
  }, [currentLevel, onLevelSelect, maxLevel]);

  const generatePath = (levelCount) => {
    const basePath = [
      'M200 60',  // Starting point
      'c80 40 120 80 120 120',  // Right curve
      'c0 80 -240 80 -240 200', // Left curve
      'c0 80 240 80 240 200',   // Right curve
      'c0 80 -240 80 -240 200', // Left curve
      'c0 80 240 80 240 200'    // Right curve
    ];
    
    // Calculate how many complete sets we need
    const segmentsNeeded = Math.ceil(levelCount / 12); // Each set fits about 12 levels
    const fullPath = [basePath[0]]; // Start with initial M command
    
    for (let i = 0; i < segmentsNeeded; i++) {
      // Add each segment from the base path (skipping the initial M command)
      for (let j = 1; j < basePath.length; j++) {
        fullPath.push(basePath[j]);
      }
    }
    
    // Add optional paths
    if (levelCount > 10) {
      fullPath.push('M300 400 C350 450, 400 500, 450 500'); // Branch right
      fullPath.push('M300 400 C250 450, 200 500, 150 500'); // Branch left
    }
    
    return fullPath.join(' ');
  };

  return (
    <div className="fixed inset-0 z-[5] overflow-auto bg-transparent">
      <div className={`flex flex-col items-center p-4 sm:p-8 h-full
        ${settings.theme === 'dark' 
          ? 'bg-gradient-to-b from-purple-800 to-purple-600' 
          : 'bg-gradient-to-b from-gray-100 to-gray-200'}`}
      >
        {/* Back Button */}
        <button
          onClick={onBack}
          className={`fixed top-4 left-4 sm:left-8 px-3 py-1 sm:px-4 sm:py-2 rounded-lg transition-all duration-300
                     flex items-center gap-2 shadow-lg text-sm sm:text-base w-fit
                     ${settings.theme === 'dark'
                       ? 'bg-purple-700/20 hover:bg-purple-700/30 text-white backdrop-blur-sm'
                       : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* SVG content */}
        <svg 
          ref={svgRef} 
          viewBox={`0 0 400 ${Math.max(800, 1000 * Math.ceil(maxLevel / 12))}`}
          className="w-full h-[calc(100vh-8rem-64px)] sm:h-[calc(100vh-12rem-64px)]"
          style={{ maxHeight: 'calc(100vh - 128px)', overflow: 'visible' }}
        >
          <defs>
            {/* Enhanced gradient with more stops */}
            <linearGradient id="pathGradient" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={settings.theme === 'dark' ? '#9333EA' : '#8B5CF6'} />
              <stop offset="50%" stopColor={settings.theme === 'dark' ? '#7E22CE' : '#7C3AED'} />
              <stop offset="100%" stopColor={settings.theme === 'dark' ? '#6B21A8' : '#6D28D9'} />
            </linearGradient>
            
            {/* Enhanced glow effect */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feFlood floodColor={settings.theme === 'dark' ? '#9333EA' : '#8B5CF6'} floodOpacity="0.3"/>
              <feComposite in2="coloredBlur" operator="in"/>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <style>
            {`
              circle { 
                r: 15; 
                cursor: pointer; 
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
              }
              @media (min-width: 640px) { circle { r: 20; } }
              [done] { 
                fill: url(#pathGradient);
                filter: url(#glow);
              }
              [todo] { 
                fill: ${settings.theme === 'dark' ? '#4B5563' : '#E9D5FF'};
                opacity: 0.5;
                transition: opacity 0.3s;
              }
              [todo]:hover {
                opacity: 0.7;
              }
              text { 
                fill: ${settings.theme === 'dark' ? 'white' : '#4C1D95'};
                font-weight: bold;
                pointer-events: none;
                font-size: 12px;
                filter: url(#glow);
              }
              @media (min-width: 640px) { text { font-size: 16px; } }
              .glow {
                fill: ${settings.theme === 'dark' ? 'rgba(147, 51, 234, 0.3)' : 'rgba(139, 92, 246, 0.3)'};
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
              .level-tooltip {
                opacity: 0;
                transition: opacity 0.3s;
                pointer-events: none;
              }
              .level-tooltip .tooltip-content {
                background: rgba(0,0,0,0.8);
                padding: 8px;
                border-radius: 4px;
                color: white;
              }
              g:hover .level-tooltip {
                opacity: 1;
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
              [data-difficulty='easy'] { border: 2px solid green; }
              [data-difficulty='medium'] { border: 2px solid yellow; }
              [data-difficulty='hard'] { border: 2px solid red; }
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