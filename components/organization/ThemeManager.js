import { useEffect } from 'react';
import { getFromCookies } from '@/utils/utility';

const ThemeManager = () => {
    // Theme initialization with full system theme support
    useEffect(() => {
        const getSystemTheme = () => {
            if (typeof window !== 'undefined') {
                return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            return 'light';
        };

        const applyTheme = (themeToApply) => {
            if (typeof window !== 'undefined') {
                document.documentElement.setAttribute('data-theme', themeToApply);
            }
        };

        const savedTheme = getFromCookies("theme") || "system";
        const systemTheme = getSystemTheme();
        
        if (savedTheme === "system") {
            applyTheme(systemTheme);
        } else {
            applyTheme(savedTheme);
        }

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemThemeChange = (e) => {
            const newSystemTheme = e.matches ? 'dark' : 'light';
            const currentSavedTheme = getFromCookies("theme") || "system";
            
            // Only update if currently using system theme
            if (currentSavedTheme === "system") {
                applyTheme(newSystemTheme);
            }
        };

        mediaQuery.addEventListener('change', handleSystemThemeChange);

        return () => {
            mediaQuery.removeEventListener('change', handleSystemThemeChange);
        };
    }, []);

    // This component doesn't render anything
    return null;
};

export default ThemeManager;
