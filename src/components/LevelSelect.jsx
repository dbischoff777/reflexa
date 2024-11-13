import React, { useEffect, useRef } from 'react';
import { useSettings } from '../Settings';

const LevelSelect = ({ currentLevel, maxLevel, onLevelSelect, onBack }) => {
  const svgRef = useRef(null);
  const { settings } = useSettings();

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
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        const glow = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        
        // Add glow effect for completed levels
        if (level <= currentLevel) {
          glow.setAttribute('r', '25');
          glow.setAttribute('class', 'glow');
          group.appendChild(glow);
        }
        
        circle.setAttribute('r', '20');
        circle.setAttribute(level <= currentLevel ? 'done' : 'todo', '');
        
        text.textContent = level;
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('alignment-baseline', 'middle');
        
        group.appendChild(circle);
        group.appendChild(text);
        
        // Add progress indicator for current level
        if (level === currentLevel) {
          const progressRing = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          progressRing.setAttribute('r', '23');
          progressRing.setAttribute('class', 'progress-ring');
          group.appendChild(progressRing);
        }
        
        const animateMotion = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
        animateMotion.setAttribute('dur', `${0.5 + index * 0.1}s`); // Staggered animation
        animateMotion.setAttribute('fill', 'freeze');
        animateMotion.setAttribute('keyPoints', `0;${index / (levels.length - 1)}`);
        animateMotion.setAttribute('keyTimes', '0;1');
        animateMotion.setAttribute('calcMode', 'linear');
        
        const mpath = document.createElementNS("http://www.w3.org/2000/svg", "mpath");
        mpath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#levelPath');
        
        animateMotion.appendChild(mpath);
        group.appendChild(animateMotion);
        
        // Add hover and click effects
        group.onclick = () => {
          if (level <= currentLevel) {
            group.classList.add('click');
            setTimeout(() => group.classList.remove('click'), 200);
            onLevelSelect(level);
          }
        };
        
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