import { useEffect } from 'react';
import { useSettings } from '../Settings';

export const useScreenProtection = () => {
    const { screenProtection } = useSettings();

    useEffect(() => {
        let wakeLock = null;

        const requestWakeLock = async () => {
            try {
                wakeLock = await navigator.wakeLock.request('screen');
                console.log('Wake Lock is active');
            } catch (err) {
                console.log('Wake Lock request failed:', err.message);
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                requestWakeLock();
            }
        };

        // Initial wake lock request
        requestWakeLock();

        // Re-request wake lock if page visibility changes
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Cleanup
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (wakeLock) {
                wakeLock.release()
                    .then(() => console.log('Wake Lock released'))
                    .catch((err) => console.log('Error releasing Wake Lock:', err));
            }
        };
    }, []);

    // brightness
    const adjustBrightness = () => {
        // Try native brightness API first
        if ('screen' in navigator && 'brightness' in navigator.screen) {
          try {
            navigator.screen.brightness.set(screenProtection.brightness / 100);
          } catch (error) {
            console.log('Native brightness API not available, using CSS fallback');
          }
        }
        
        // CSS fallback for brightness
        const brightnessValue = screenProtection.brightness / 100;
        document.documentElement.style.filter = `brightness(${brightnessValue})`;
      };
    

    // color temperature
    const adjustColorTemperature = () => {
        const hour = new Date().getHours();
        if (hour >= 18 || hour < 6) {
          // Combine brightness and night mode filters
          const brightnessValue = screenProtection.autoBrightness 
            ? screenProtection.brightness / 100 
            : 1;
          document.documentElement.style.filter = `brightness(${brightnessValue}) sepia(0.2)`;
        } else {
          // Only apply brightness if auto-brightness is on
          if (screenProtection.autoBrightness) {
            const brightnessValue = screenProtection.brightness / 100;
            document.documentElement.style.filter = `brightness(${brightnessValue})`;
          } else {
            document.documentElement.style.filter = 'none';
          }
        }
      };

      useEffect(() => {
        if (screenProtection.nightMode) {
          const interval = setInterval(adjustColorTemperature, 60000);
          adjustColorTemperature();
          return () => clearInterval(interval);
        } else if (screenProtection.autoBrightness) {
          // If night mode is off but auto-brightness is on, just adjust brightness
          adjustBrightness();
        } else {
          document.documentElement.style.filter = 'none';
        }
      }, [screenProtection.nightMode]);
    
      useEffect(() => {
        if (screenProtection.autoBrightness) {
          adjustBrightness();
        }
      }, [screenProtection.autoBrightness, screenProtection.brightness]);
    
      useEffect(() => {
        if (screenProtection.autoBrightness) {
          if (!screenProtection.nightMode) {
            // Only adjust brightness if night mode is off
            adjustBrightness();
          } else {
            // If night mode is on, update both
            adjustColorTemperature();
          }
        } else if (!screenProtection.nightMode) {
          // If both features are off, remove filters
          document.documentElement.style.filter = 'none';
        }
      }, [screenProtection.autoBrightness, screenProtection.brightness]);
      

      // Additional screen protection features
      useEffect(() => {
        // Prevent zooming with wheel/trackpad/pinch
        const preventZoom = (e) => {
          // Prevent ctrl/cmd + wheel zoom
          if ((e.ctrlKey || e.metaKey) && e.type === 'wheel') {
            e.preventDefault();
            return false;
          }
    
          // Prevent ctrl/cmd + +/- zoom
          if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=')) {
            e.preventDefault();
            return false;
          }
        };
    
        // Prevent pull-to-refresh on mobile
        const preventPullToRefresh = (e) => {
          // Prevent overscroll
          if (window.scrollY === 0 && e.touches.length === 1) {
            e.preventDefault();
          }
        };
    
        // Prevent pinch zoom on mobile
        const preventTouchZoom = (e) => {
          if (e.touches.length > 1) {
            e.preventDefault();
          }
        };
    
        // Add meta viewport tag to prevent scaling
        const metaViewport = document.createElement('meta');
        metaViewport.name = 'viewport';
        metaViewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(metaViewport);
    
        // Add CSS to prevent overscroll behavior
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        document.body.style.overscrollBehavior = 'none';
        document.documentElement.style.overscrollBehavior = 'none';
        document.documentElement.style.touchAction = 'none';
    
        // Add event listeners with capture and passive false
        document.addEventListener('wheel', preventZoom, { passive: false, capture: true });
        document.addEventListener('keydown', preventZoom, { passive: false, capture: true });
        document.addEventListener('touchstart', preventPullToRefresh, { passive: false, capture: true });
        document.addEventListener('touchmove', preventTouchZoom, { passive: false, capture: true });
        document.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false, capture: true });
        document.addEventListener('gesturechange', (e) => e.preventDefault(), { passive: false, capture: true });
        document.addEventListener('gestureend', (e) => e.preventDefault(), { passive: false, capture: true });
    
        // Prevent context menu
        document.addEventListener('contextmenu', (e) => e.preventDefault(), { capture: true });
    
        // Cleanup function
        return () => {
          // Remove meta viewport tag
          metaViewport.remove();
    
          // Reset CSS
          document.body.style.removeProperty('overflow');
          document.body.style.removeProperty('position');
          document.body.style.removeProperty('width');
          document.body.style.removeProperty('height');
          document.body.style.removeProperty('overscroll-behavior');
          document.documentElement.style.removeProperty('overscroll-behavior');
          document.documentElement.style.removeProperty('touch-action');
    
          // Remove event listeners
          document.removeEventListener('wheel', preventZoom, { capture: true });
          document.removeEventListener('keydown', preventZoom, { capture: true });
          document.removeEventListener('touchstart', preventPullToRefresh, { capture: true });
          document.removeEventListener('touchmove', preventTouchZoom, { capture: true });
          document.removeEventListener('gesturestart', (e) => e.preventDefault(), { capture: true });
          document.removeEventListener('gesturechange', (e) => e.preventDefault(), { capture: true });
          document.removeEventListener('gestureend', (e) => e.preventDefault(), { capture: true });
          document.removeEventListener('contextmenu', (e) => e.preventDefault(), { capture: true });
        };
      }, []);

    return { adjustBrightness, adjustColorTemperature };      
};
