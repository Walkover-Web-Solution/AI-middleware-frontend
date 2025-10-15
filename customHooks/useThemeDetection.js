import { useState, useEffect } from 'react';
import { getFromCookies } from '@/utils/utility';

export const useThemeDetection = () => {
  const [currentTheme, setCurrentTheme] = useState('light');

  useEffect(() => {
    const getInitialTheme = () => {
      return getFromCookies("theme");
    };

    setCurrentTheme(getInitialTheme());

    const handleStorageChange = () => {
      const newTheme = getFromCookies("theme");
      if (newTheme === "dark" || newTheme === "light") {
        setCurrentTheme(newTheme);
      } else {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setCurrentTheme(systemTheme);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('themeChange', handleStorageChange);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          const newTheme = document.documentElement.getAttribute('data-theme');
          if (newTheme === 'dark' || newTheme === 'light') {
            setCurrentTheme(newTheme);
          }
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('themeChange', handleStorageChange);
      observer.disconnect();
    };
  }, []);

  return currentTheme;
};
