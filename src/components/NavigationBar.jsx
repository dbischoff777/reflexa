import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LucideUser, LucideSettings, LucideInfo, Home } from 'lucide-react';
import { Trophy } from 'lucide-react';
import { GAME_STATES } from '../PopItGame';

const NavigationBar = ({ theme, gameState }) => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Home', icon: <Home className="w-5 h-5" />, path: '/' },
    { name: 'Profile', icon: <LucideUser className="w-5 h-5" />, path: '/profile' },
    { name: 'Leaderboard', icon: <Trophy className="w-5 h-5" />, path: '/leaderboard' },
    { name: 'Settings', icon: <LucideSettings className="w-5 h-5" />, path: '/settings' },
    { name: 'About', icon: <LucideInfo className="w-5 h-5" />, path: '/about' }
  ];

  // Direct comparison with gameState
  if (gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.COUNTDOWN) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-transparent">
      <div className={`
        backdrop-blur-md
        ${theme === 'dark' 
          ? 'bg-transparent'
          : 'bg-transparent'
        }
        border-t
        ${theme === 'dark'
          ? 'border-transparent'
          : 'border-transparent'
        }
      `}>
        <div className="max-w-lg mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            {navItems.map(({ name, icon, path }) => {
              const isActive = location.pathname === path;
              
              return (
                <Link
                  key={name}
                  to={path}
                  className={`
                    group relative
                    p-2
                    rounded-xl
                    transition-all duration-200
                    flex flex-col items-center
                    min-w-[3rem]
                    ${isActive
                      ? theme === 'dark'
                        ? 'text-purple-300'
                        : 'text-purple-600'
                      : theme === 'dark'
                        ? 'text-gray-400 hover:text-purple-300'
                        : 'text-gray-500 hover:text-purple-600'
                    }
                  `}
                  aria-label={name}
                >
                  {icon}
                  <span className={`
                    text-[0.65rem]
                    mt-1
                    transition-all duration-200
                    ${isActive ? 'opacity-100' : 'opacity-70'}
                  `}>
                    {name}
                  </span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <span className={`
                      absolute -top-0.5 left-1/2 -translate-x-1/2
                      w-1 h-1
                      rounded-full
                      ${theme === 'dark' ? 'bg-purple-400' : 'bg-purple-500'}
                    `} />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{ 
        height: 'env(safe-area-inset-bottom)',
        backgroundColor: theme === 'dark' ? 'rgba(17, 24, 39, 0.3)' : 'rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(12px)'
      }} />
    </nav>
  );
};

export default NavigationBar;