import { useEffect, useCallback } from 'react';

const MobileOptimizer = () => {
  const applyMobileOptimizations = useCallback(() => {
    try {
      // Helper function to safely add meta tags
      const setMetaTag = (name, content) => {
        try {
          let tag = document.querySelector(`meta[name="${name}"]`);
          if (!tag) {
            tag = document.createElement('meta');
            tag.name = name;
            document.head.appendChild(tag);
          }
          tag.content = content;
        } catch (err) {
          console.warn(`Failed to set meta tag ${name}:`, err);
        }
      };

      // Apply all meta tags with error handling
      const metaTags = {
        'viewport': 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, minimal-ui, viewport-fit=cover',
        'apple-mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-status-bar-style': 'black-translucent',
        'mobile-web-app-capable': 'yes',
        'theme-color': '#000000',
        'format-detection': 'telephone=no'
      };

      Object.entries(metaTags).forEach(([name, content]) => {
        setMetaTag(name, content);
      });

      // Add style element with error handling
      const addStyles = () => {
        try {
          const existingStyle = document.getElementById('mobile-optimizer-styles');
          if (existingStyle) {
            existingStyle.remove();
          }

          const style = document.createElement('style');
          style.id = 'mobile-optimizer-styles';
          style.textContent = `
            * {
              -webkit-text-size-adjust: none;
              -moz-text-size-adjust: none;
              -ms-text-size-adjust: none;
              text-size-adjust: none;
              -webkit-tap-highlight-color: transparent;
              -webkit-touch-callout: none;
            }

            html {
              height: 100%;
              width: 100%;
              background-color: var(--background-color);
            }

            body {
              height: 100%;
              width: 100%;
              -webkit-overflow-scrolling: touch;
              margin: 0;
              padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
              background-color: var(--background-color);
            }

            #root {
              height: 100%;
              width: 100%;
              background-color: var(--background-color);
            }

            input, textarea {
              -webkit-appearance: none;
              border-radius: 0;
            }
            
            * {
              -webkit-user-select: none;
              user-select: none;
            }
            
            input, textarea {
              -webkit-user-select: text;
              user-select: text;
            }
            
            @supports (-webkit-overflow-scrolling: touch) {
              body {
                -webkit-overflow-scrolling: touch;
              }
            }
          `;
          document.head.appendChild(style);
        } catch (err) {
          console.warn('Failed to apply styles:', err);
        }
      };

      addStyles();
    } catch (err) {
      console.error('Failed to apply mobile optimizations:', err);
    }
  }, []);

  const enterFullscreen = useCallback(async () => {
    try {
      const elem = document.documentElement;
      
      // Check if already in fullscreen
      if (document.fullscreenElement) return;

      // Try different fullscreen methods
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
      }
    } catch (err) {
      console.debug('Fullscreen request failed:', err);
    }
  }, []);

  useEffect(() => {
    // Track window dimensions
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;

    // Debounced resize handler
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const currentWidth = window.innerWidth;
        const currentHeight = window.innerHeight;
        if (Math.abs(lastWidth - currentWidth) > 50 || Math.abs(lastHeight - currentHeight) > 50) {
          enterFullscreen();
          lastWidth = currentWidth;
          lastHeight = currentHeight;
        }
      }, 100);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        enterFullscreen();
      }
    };

    const handleOrientationChange = () => {
      setTimeout(enterFullscreen, 100);
    };

    const preventPullToRefresh = (e) => {
      e.preventDefault();
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('focus', handleVisibilityChange);
    
    // Mobile-specific event for initial touch
    window.addEventListener('touchend', () => {
      setTimeout(enterFullscreen, 100);
    }, { once: true });

    // Initial setup
    applyMobileOptimizations();
    enterFullscreen();

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('focus', handleVisibilityChange);
      clearTimeout(resizeTimeout);
    };
  }, [applyMobileOptimizations, enterFullscreen]);

  return null;
};

export default MobileOptimizer; 