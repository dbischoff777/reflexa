import { useEffect } from 'react';

export const useScreenProtection = () => {
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

    // Add to useScreenProtection.js
    const adjustBrightness = () => {
        if ('screen' in navigator && 'brightness' in navigator.screen) {
            navigator.screen.brightness.set(0.7); // Set to 70% brightness
        }
    };

    // Add to useScreenProtection.js
    const adjustColorTemperature = () => {
        const hour = new Date().getHours();
        if (hour >= 18 || hour < 6) {
            document.documentElement.style.filter = 'brightness(0.9) sepia(0.2)';
        }
    };

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
