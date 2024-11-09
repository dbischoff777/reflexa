import { useEffect } from 'react';

const MobileOptimizer = () => {
  useEffect(() => {
    // Function to apply mobile optimizations
    const applyMobileOptimizations = () => {
      // Set viewport meta
      let viewport = document.querySelector('meta[name=viewport]');
      if (!viewport) {
        viewport = document.createElement('meta');
        viewport.name = 'viewport';
        document.head.appendChild(viewport);
      }
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, minimal-ui, viewport-fit=cover';

      // Add iOS specific meta tags
      let appleCapable = document.querySelector('meta[name=apple-mobile-web-app-capable]');
      if (!appleCapable) {
        appleCapable = document.createElement('meta');
        appleCapable.name = 'apple-mobile-web-app-capable';
        document.head.appendChild(appleCapable);
      }
      appleCapable.content = 'yes';

      let appleStatusBar = document.querySelector('meta[name=apple-mobile-web-app-status-bar-style]');
      if (!appleStatusBar) {
        appleStatusBar = document.createElement('meta');
        appleStatusBar.name = 'apple-mobile-web-app-status-bar-style';
        document.head.appendChild(appleStatusBar);
      }
      appleStatusBar.content = 'black-translucent';

      // Add mobile-web-app-capable meta
      let webAppCapable = document.querySelector('meta[name=mobile-web-app-capable]');
      if (!webAppCapable) {
        webAppCapable = document.createElement('meta');
        webAppCapable.name = 'mobile-web-app-capable';
        document.head.appendChild(webAppCapable);
      }
      webAppCapable.content = 'yes';

      // Add style element
      let style = document.createElement('style');
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
      `;
      document.head.appendChild(style);
    };

    // Function to handle fullscreen
    const enterFullscreen = async () => {
      try {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          await elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
          await elem.msRequestFullscreen();
        }
      } catch (err) {
        console.log('Fullscreen request failed:', err);
      }
    };

    // Apply optimizations immediately
    applyMobileOptimizations();

    // Handle various events that might show the status bar
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        enterFullscreen();
      }
    };

    const handleResize = () => {
      enterFullscreen();
    };

    const handleOrientationChange = () => {
      enterFullscreen();
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

    // Initial fullscreen request
    enterFullscreen();

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      document.removeEventListener('touchmove', preventPullToRefresh);
    };
  }, []);

  return null;
};

export default MobileOptimizer; 