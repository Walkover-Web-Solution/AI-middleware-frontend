import { useCallback } from 'react';

/**
 * Custom hook for handling Enter key submission in forms and modals
 * @param {Function} callback - Function to execute when Enter is pressed
 * @param {Array} dependencies - Dependencies array for useCallback
 * @param {Object} options - Additional options
 * @param {boolean} options.preventDefault - Whether to prevent default behavior (default: true)
 * @param {boolean} options.stopPropagation - Whether to stop event propagation (default: false)
 * @returns {Function} Event handler function for onKeyDown
 */
export const useEnterKeySubmit = (callback, dependencies = [], options = {}) => {
  const { preventDefault = true, stopPropagation = false } = options;

  return useCallback((e) => {
    if (e.key === "Enter") {
      if (preventDefault) {
        e.preventDefault();
      }
      if (stopPropagation) {
        e.stopPropagation();
      }
      callback(e);
    }
  }, [callback, preventDefault, stopPropagation, ...dependencies]);
};

export default useEnterKeySubmit;
