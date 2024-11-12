import React, { useEffect, useRef } from 'react';

const LevelSelect = ({ currentLevel, maxLevel, onLevelSelect, onBack }) => {
  const levels = Array.from({ length: 10 }, (_, i) => i + 1);
  const svgRef = useRef(null);

  useEffect(() => {
    if (svgRef.current) {
      const svg = svgRef.current;
      const path = svg.querySelector('#levelPath');
      const totalLength = path.getTotalLength();

      levels.forEach((level, index) => {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        
        circle.setAttribute('r', '20');
        circle.setAttribute(level <= currentLevel ? 'done' : 'todo', '');
        
        text.textContent = level;
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('alignment-baseline', 'middle');
        
        group.appendChild(circle);
        group.appendChild(text);
        
        const animateMotion = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
        animateMotion.setAttribute('dur', '1s');
        animateMotion.setAttribute('fill', 'freeze');
        animateMotion.setAttribute('keyPoints', `0;${index / (levels.length - 1)}`);
        animateMotion.setAttribute('keyTimes', '0;1');
        animateMotion.setAttribute('calcMode', 'linear');
        
        const mpath = document.createElementNS("http://www.w3.org/2000/svg", "mpath");
        mpath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#levelPath');
        
        animateMotion.appendChild(mpath);
        group.appendChild(animateMotion);
        
        group.onclick = () => onLevelSelect(level);
        
        svg.appendChild(group);
      });
    }
  }, [currentLevel, levels, onLevelSelect]);

  return (
    <div className="flex flex-col items-center p-8 bg-gradient-to-b from-purple-300 to-purple-500 min-h-screen relative">
      <button
        onClick={onBack}
        className="absolute top-4 left-4 px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 shadow-md transition-colors"
      >
        Back to Menu
      </button>

      <h2 className="text-3xl font-bold text-white mb-4">Select Level</h2>
      
      <svg ref={svgRef} viewBox="0 0 400 800" className="w-full h-[800px]">
        <style>
          {`
            circle { r: 20; cursor: pointer; }
            [done] { fill: #FCD34D; }
            [todo] { fill: #D1D5DB; }
            text { fill: white; font-weight: bold; pointer-events: none; }
          `}
        </style>
        <path 
          id="levelPath" 
          fill="none" 
          stroke="gold" 
          strokeWidth="4" 
          d="M200 20 
             c100 50 150 100 150 150
             c0 50 -300 50 -300 150
             c0 50 300 50 300 150
             c0 50 -300 50 -300 150
             c0 50 300 50 300 150"
        />
      </svg>
    </div>
  );
};

export default LevelSelect;