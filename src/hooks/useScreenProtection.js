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
    
      return { adjustBrightness, adjustColorTemperature };

    // Additional screen protection features
    useEffect(() => {
        const preventZoom = (e) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
            }
        };

        const preventPullToRefresh = (e) => {
            if (e.touches.length === 1 && e.touches[0].clientY < 10) {
                e.preventDefault();
            }
        };

        // Prevent zooming
        document.addEventListener('wheel', preventZoom, { passive: false });
        document.addEventListener('keydown', preventZoom);

        // Prevent pull-to-refresh
        document.addEventListener('touchstart', preventPullToRefresh, { passive: false });

        // Optional: Prevent context menu
        document.addEventListener('contextmenu', (e) => e.preventDefault());

        return () => {
            document.removeEventListener('wheel', preventZoom);
            document.removeEventListener('keydown', preventZoom);
            document.removeEventListener('touchstart', preventPullToRefresh);
            document.removeEventListener('contextmenu', (e) => e.preventDefault());
        };
    }, []);
};
