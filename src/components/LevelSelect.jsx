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
      
      const levels = Array.from({ length: 10 }, (_, i) => i + 1);
      
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
  }, [currentLevel, onLevelSelect]);

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
          viewBox="0 0 400 800" 
          className="w-full h-[calc(100vh-8rem-64px)] sm:h-[calc(100vh-12rem-64px)]"
          style={{ maxHeight: 'calc(100vh - 128px)' }}
        >
          <defs>
            {/* Add gradient and filter effects */}
            <linearGradient id="pathGradient" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={settings.theme === 'dark' ? '#9333EA' : '#8B5CF6'}/>
              <stop offset="100%" stopColor={settings.theme === 'dark' ? '#7E22CE' : '#7C3AED'}/>
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <style>
            {`
              circle { r: 15; cursor: pointer; transition: transform 0.2s; }
              @media (min-width: 640px) { circle { r: 20; } }
              [done] { 
                fill: url(#pathGradient);
                filter: url(#glow);
              }
              [todo] { 
                fill: ${settings.theme === 'dark' ? '#4B5563' : '#E9D5FF'};
                opacity: 0.7;
              }
              text { 
                fill: ${settings.theme === 'dark' ? 'white' : '#4C1D95'};
                font-weight: bold;
                pointer-events: none;
                font-size: 12px;
              }
              @media (min-width: 640px) { text { font-size: 16px; } }
              .glow {
                fill: ${settings.theme === 'dark' ? 'rgba(147, 51, 234, 0.3)' : 'rgba(139, 92, 246, 0.3)'};
                animation: pulse 2s infinite;
              }
              .progress-ring {
                fill: none;
                stroke: #FFD700;
                stroke-width: 2;
                stroke-dasharray: 145;
                stroke-dashoffset: 145;
                animation: progress 2s linear infinite;
              }
              @keyframes pulse {
                0% { opacity: 0.3; r: 20; }
                50% { opacity: 0.6; r: 22; }
                100% { opacity: 0.3; r: 20; }
              }
              @keyframes progress {
                to { stroke-dashoffset: 0; }
              }
              g:hover circle[done] {
                transform: scale(1.1);
              }
              .click circle[done] {
                transform: scale(0.9);
              }
            `}
          </style>
          <path 
            id="levelPath" 
            fill="none" 
            stroke="url(#pathGradient)"
            strokeWidth="3" 
            filter="url(#glow)"
            d="M200 60 
               c80 40 120 80 120 120
               c0 40 -240 40 -240 120
               c0 40 240 40 240 120
               c0 40 -240 40 -240 120
               c0 40 240 40 240 120"
          />
        </svg>
      </div>
    </div>
  );
};

export default LevelSelect;