import { useEffect } from 'react';

export const useOutsideClick = (isOpen, isMobileVisible, pathParts, isMobile, setIsOpen, setIsMobileVisible) => {
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pathParts.length > 4 && (isOpen || isMobileVisible)) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && !sidebar.contains(e.target)) {
          requestAnimationFrame(() => {
            if (isMobile) {
              setIsMobileVisible(false);
            } else {
              setIsOpen(false);
            }
          });
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isMobileVisible, pathParts.length, isMobile, setIsOpen, setIsMobileVisible]);
};
