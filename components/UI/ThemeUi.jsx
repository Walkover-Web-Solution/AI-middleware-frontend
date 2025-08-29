import { MoonIcon, SunIcon, MonitorIcon, ChevronDownIcon } from "lucide-react";
import { useState, useEffect } from "react";
import LoadingSpinner from "../loadingSpinner";
import { useCustomSelector } from "@/customHooks/customSelector";

export default function ThemeToggle() {
  const [actualTheme, setActualTheme] = useState("light");
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const userTheme = useCustomSelector(state => state.userDetailsReducer.userDetails?.meta?.theme);
  const [theme, setTheme] = useState(userTheme || "system");

  // Get system theme preference
  const getSystemTheme = () => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Apply theme to document - updated to handle multiple methods
  const applyTheme = (themeToApply) => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      
      // Method 1: Set data-theme attribute (for DaisyUI and similar frameworks)
      root.setAttribute('data-theme', themeToApply);
      
      // Method 2: Add/remove dark class (for Tailwind and similar frameworks)
      if (themeToApply === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
      
      // Method 3: Set CSS custom property (for custom CSS variables)
      root.style.setProperty('--theme', themeToApply);
    }
  };

  // Initialize component state from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "system";
    const systemTheme = getSystemTheme();
    
    setTheme(savedTheme);
    
    let themeToApply;
    if (savedTheme === "system") {
      themeToApply = systemTheme;
      setActualTheme(systemTheme);
    } else {
      themeToApply = savedTheme;
      setActualTheme(savedTheme);
    }
    
    // Apply the theme immediately
    applyTheme(themeToApply);
  }, []);

  // Listen for system theme changes to update display
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      
      // Only update display if currently using system theme
      if (theme === "system") {
        setActualTheme(newSystemTheme);
        applyTheme(newSystemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdownElement = event.target.closest('[data-dropdown="theme-toggle"]');
      if (!dropdownElement && isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleThemeChange = (newTheme) => {
    setLoading(true);
    setIsDropdownOpen(false);

    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    // Apply the theme
    let themeToApply;
    if (newTheme === "system") {
      const systemTheme = getSystemTheme();
      themeToApply = systemTheme;
      setActualTheme(systemTheme);
    } else {
      themeToApply = newTheme;
      setActualTheme(newTheme);
    }
    
    applyTheme(themeToApply);

    setTimeout(() => setLoading(false), 500);
  };

  const getThemeLabel = () => {
    if (theme === "system") {
      return `System (${actualTheme === "dark" ? "Dark" : "Light"})`;
    }
    return theme === "light" ? "Light Theme" : "Dark Theme";
  };

  const getThemeIcon = () => {
    if (theme === "system") {
      return <MonitorIcon size={16} />;
    }
    return theme === "light" ? <SunIcon size={16} /> : <MoonIcon size={16} />;
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <>
      <div className="w-full" data-dropdown="theme-toggle">
        <button 
          onClick={toggleDropdown}
          className="btn btn-ghost btn-sm w-full justify-between normal-case font-normal text-xs h-8"
        >
          <div className="flex items-center gap-2">
            {getThemeIcon()}
            {theme === "system" && (
              <div className="badge badge-xs badge-primary opacity-70">Auto</div>
            )}
            <span className="hidden sm:block">
              {getThemeLabel()}
            </span>
          </div>
          <ChevronDownIcon 
            className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
          />
        </button>
        
        {isDropdownOpen && (
          <div className="menu bg-base-200 w-full rounded-lg mt-1 p-1 shadow border border-base-300">
            <li>
              <button
                className={`flex items-center gap-2 p-2 rounded text-xs hover:bg-base-300 transition-colors ${theme === "light" ? 'bg-base-300' : ''}`}
                onClick={() => handleThemeChange("light")}
                disabled={theme === "light"}
              >
                <SunIcon size={14} />
                <span className="flex-1 text-left">Light</span>
                {theme === "light" && <div className="badge badge-xs badge-success">✓</div>}
              </button>
            </li>
            
            <li>
              <button
                className={`flex items-center gap-2 p-2 rounded text-xs hover:bg-base-300 transition-colors ${theme === "dark" ? 'bg-base-300' : ''}`}
                onClick={() => handleThemeChange("dark")}
                disabled={theme === "dark"}
              >
                <MoonIcon size={14} />
                <span className="flex-1 text-left">Dark</span>
                {theme === "dark" && <div className="badge badge-xs badge-success">✓</div>}
              </button>
            </li>
            
            <li>
              <button
                className={`flex items-center gap-2 p-2 rounded text-xs hover:bg-base-300 transition-colors ${theme === "system" ? 'bg-base-300' : ''}`}
                onClick={() => handleThemeChange("system")}
                disabled={theme === "system"}
              >
                <MonitorIcon size={14} />
                <span className="flex-1 text-left">System</span>
                {theme === "system" && <div className="badge badge-xs badge-success">✓</div>}
              </button>
            </li>
          </div>
        )}
      </div>
    </>
  );
}