import { useEffect, useCallback } from 'react';

const MobileOptimizer = () => {
  // Move functions outside useEffect for better organization
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
        'theme-color': '#000000', // Added for Android
        'format-detection': 'telephone=no' // Prevent auto phone number detection
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
              position: fixed;
              width: 100%;
              height: 100%;
              overflow: hidden;
              touch-action: none;
              -ms-touch-action: none;
              background-color: black;
            }

            body {
              position: fixed;
              width: 100%;
              height: 100%;
              overflow: hidden;
              touch-action: none;
              -ms-touch-action: none;
              -webkit-overflow-scrolling: touch;
              overscroll-behavior: none;
              margin: 0;
              padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
              background-color: black;
            }

            #root {
              position: fixed;
              width: 100%;
              height: 100%;
              overflow: hidden;
              background-color: black;
            }

            /* Additional optimizations */
            input, textarea {
              -webkit-appearance: none;
              border-radius: 0;
            }
            
            /* Disable selection */
            * {
              -webkit-user-select: none;
              user-select: none;
            }
            
            /* Enable selection only for input fields */
            input, textarea {
              -webkit-user-select: text;
              user-select: text;
            }
            
            /* Smooth scrolling for iOS */
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
    // Check if fullscreen is supported
    const fullscreenEnabled = document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.msFullscreenEnabled;

    if (!fullscreenEnabled) {
      console.warn('Fullscreen not supported');
      return;
    }

    try {
      const elem = document.documentElement;
      // Check if already fullscreen
      if (document.fullscreenElement) return;

      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  }, []);

  useEffect(() => {
    // Debounce resize handler with a shorter timeout
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Only enter fullscreen on significant size changes
        const currentWidth = window.innerWidth;
        const currentHeight = window.innerHeight;
        if (Math.abs(lastWidth - currentWidth) > 50 || Math.abs(lastHeight - currentHeight) > 50) {
          enterFullscreen();
        }
      }, 100); // Reduced timeout
    };

    // Track window dimensions
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;

    // Handle various events that might show the status bar
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        enterFullscreen();
      }
    };

    const handleOrientationChange = () => {
      // Wait for orientation change to complete
      setTimeout(() => {
        enterFullscreen();
      }, 100);
    };

    // Prevent default touch behaviors
    const preventPullToRefresh = (e) => {
      e.preventDefault();
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    document.addEventListener('touchmove', preventPullToRefresh, { passive: false });

    // Add error boundary
    const handleError = (err) => {
      console.error('MobileOptimizer error:', err);
    };
    window.addEventListener('error', handleError);

    // Initial setup
    applyMobileOptimizations();
    enterFullscreen();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      document.removeEventListener('touchmove', preventPullToRefresh);
      window.removeEventListener('error', handleError);
      clearTimeout(resizeTimeout);
    };
  }, [applyMobileOptimizations, enterFullscreen]);

  return null;
};

export default MobileOptimizer; 