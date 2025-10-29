/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react';
import {
  Building2, ChevronDown,
  Cog, LogOut, Mail,
  Settings2,
  ChevronRight, ChevronLeft,
  MonitorPlayIcon,
  MessageCircleMoreIcon,
  MessageSquareMoreIcon,
  User,
  AlignJustify,
  FileText,
  MoonIcon,
  SunIcon,
  MonitorIcon
} from 'lucide-react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { logoutUserFromMsg91 } from '@/config';
import { useCustomSelector } from '@/customHooks/customSelector';
import { truncate } from '@/components/historyPageComponents/assistFile';
import { clearCookie, getFromCookies, openModal, toggleSidebar, setInCookies } from '@/utils/utility';
import OrgSlider from './orgSlider';
import TutorialModal from '@/components/modals/tutorialModal';
import DemoModal from '../modals/DemoModal';
import { MODAL_TYPE } from '@/utils/enums';
import Protected from '../protected';
import BridgeSlider from './bridgeSlider';
import { AddIcon, KeyIcon } from '../Icons';
import { BetaBadge, DISPLAY_NAMES, HRCollapsed, ITEM_ICONS, NAV_SECTIONS } from '@/utils/mainSliderHelper';

/* -------------------------------------------------------------------------- */
/*                                  Component                                 */
/* -------------------------------------------------------------------------- */

function MainSlider({ isEmbedUser }) {
  /* --------------------------- Router & selectors ------------------------- */
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const pathParts = pathname.split('?')[0].split('/');
  const orgId = pathParts[2];

  const { userdetails, organizations } = useCustomSelector(state => ({
    userdetails: state.userDetailsReducer.userDetails,
    organizations: state.userDetailsReducer.organizations
  }));

  const orgName = useMemo(() => organizations?.[orgId]?.name || 'Organization', [organizations, orgId]);

  // Check if we're in side-by-side mode
  const isSideBySideMode = pathParts.length === 4;

  /* ------------------------------- UI state ------------------------------- */
  const [isOpen, setIsOpen] = useState(isSideBySideMode); // Default open for side-by-side
  const [hovered, setHovered] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [orgDropdownTimeout, setOrgDropdownTimeout] = useState(null);
  const [isOrgDropdownExpanded, setIsOrgDropdownExpanded] = useState(false);
  const [isMobileVisible, setIsMobileVisible] = useState(false); // New state for mobile visibility
  const [showContent, setShowContent] = useState(isSideBySideMode); // Control content visibility with delay
  
  // Theme state
  const [theme, setTheme] = useState("system");
  const [actualTheme, setActualTheme] = useState("light");

  // Effect to detect mobile screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Set mobile breakpoint at 768px
    };

    // Initialize on mount
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Effect to hide sidebar by default on mobile
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
      setIsMobileVisible(false);
    }
  }, [isMobile]);

  // Effect to handle sidebar state when path changes
  useEffect(() => {
    if (isSideBySideMode) {
      setIsOpen(true); // Always open in side-by-side mode
    } else if (pathParts.length > 4) {
      setIsOpen(false); // Automatically close when pathParts length > 4
    }
    
    // Hide on mobile by default when path changes
    if (isMobile) {
      setIsOpen(false);
      setIsMobileVisible(false);
    }
  }, [isSideBySideMode, pathParts.length, isMobile]);

  // Theme utility functions
  const getSystemTheme = () => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  const applyTheme = (themeToApply) => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      root.setAttribute('data-theme', themeToApply);
      if (themeToApply === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
      root.style.setProperty('--theme', themeToApply);
    }
  };

  // Initialize theme
  useEffect(() => {
    const savedTheme = getFromCookies("theme") || "system";
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
    
    applyTheme(themeToApply);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      
      if (theme === "system") {
        setActualTheme(newSystemTheme);
        applyTheme(newSystemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (orgDropdownTimeout) {
        clearTimeout(orgDropdownTimeout);
      }
    };
  }, [orgDropdownTimeout]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setInCookies("theme", newTheme);

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
  };

  /** Logout handler */
  const handleLogout = useCallback(async () => {
    try {
      await logoutUserFromMsg91({
        headers: { proxy_auth_token: getFromCookies('proxy_token') ?? '' }
      });
      clearCookie();
      sessionStorage.clear();
      if(process.env.NEXT_PUBLIC_ENV === 'PROD') {
        router.replace('https://gtwy.ai/');
      } else {
        router.replace('/');
      }
    } catch (e) {
      console.error(e);
    }
  }, [router]);

  /** Toggle handler - modified for side-by-side mode */
  const handleToggle = e => {
    // Clear any hover states immediately for smoother transition
    setHovered(null);
    
    // Use requestAnimationFrame for smoother state transitions
    requestAnimationFrame(() => {
      if (isSideBySideMode) {
        // In side-by-side mode, allow both opening and closing
        setIsOpen(prev => !prev);
      } else {
        // Normal toggle behavior for other modes
        if (e.detail === 2 && !isMobile) {
          setIsOpen(true);
        } else {
          setIsOpen(prev => !prev);
        }
      }
    });
  };

  // Close sidebar on outside click when in sub-routes
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pathParts.length > 4 && (isOpen || isMobileVisible)) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && !sidebar.contains(e.target)) {
          // Add a small delay to ensure smooth transition
          requestAnimationFrame(() => {
            if (isMobile) {
              setIsMobileVisible(false);
            } else {
              setIsOpen(false);
            }
          });
        }
      }
      
      // Close org dropdown on outside click
      if (isOrgDropdownExpanded) {
        const orgDropdown = e.target.closest('.org-dropdown-container');
        if (!orgDropdown) {
          setIsOrgDropdownExpanded(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isMobileVisible, pathParts.length, isMobile, isOrgDropdownExpanded]);

  /** Hover handlers – active only when collapsed (desktop) */
  const onItemEnter = (key, e) => {
    if ((isOpen && !isMobile) || (isMobile && !isMobileVisible)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({ top: rect.top + rect.height / 2, left: rect.right + 8 });
    setHovered(key);
  };
  
  const onItemLeave = () => {
    if ((!isOpen && !isMobile) || (isMobile && isMobileVisible)) {
      setHovered(null);
    }
  };

  // Hide tooltip the moment sidebar expands
  useEffect(() => {
    if (isOpen && !isMobile) setHovered(null);
  }, [isOpen, isMobile]);

  // Handle content visibility with delay for smooth transitions
  useEffect(() => {
    if (isMobile) {
      // For mobile, show content immediately when visible
      setShowContent(isMobileVisible);
    } else {
      if (isOpen) {
        // Show content immediately when opening
        setShowContent(true);
      } else {
        // Hide content after animation completes when closing
        const timer = setTimeout(() => {
          setShowContent(false);
        }, 300); // Match the CSS transition duration
        return () => clearTimeout(timer);
      }
    }
    
    // Handle side-by-side mode - always show content when in this mode
    if (isSideBySideMode && isOpen) {
      setShowContent(true);
    }
  }, [isOpen, isMobile, isMobileVisible, isSideBySideMode]);

  // Close on backdrop click (mobile)
  const handleBackdropClick = () => {
    if (isMobile && isMobileVisible) {
      setIsMobileVisible(false);
    }
  };

  // Org dropdown handlers
  const handleOrgClick = () => {
    if (showSidebarContent) {
      setIsOrgDropdownExpanded(prev => !prev);
    }
  };

  const handleSwitchOrg = () => {
    router.push('/org?redirection=false');
    if (isMobile) setIsMobileVisible(false);
    setIsOrgDropdownExpanded(false);
  };

  const handleOrgHover = () => {
    if (!showSidebarContent) {
      // Clear any existing timeout
      if (orgDropdownTimeout) {
        clearTimeout(orgDropdownTimeout);
        setOrgDropdownTimeout(null);
      }
      
      // Show dropdown with slight delay
      const timeout = setTimeout(() => {
        setIsOrgDropdownOpen(true);
      }, 150);
      setOrgDropdownTimeout(timeout);
    }
  };

  const handleOrgLeave = () => {
    if (!showSidebarContent) {
      // Clear any existing timeout
      if (orgDropdownTimeout) {
        clearTimeout(orgDropdownTimeout);
        setOrgDropdownTimeout(null);
      }
      
      // Hide dropdown with delay
      const timeout = setTimeout(() => {
        setIsOrgDropdownOpen(false);
      }, 200);
      setOrgDropdownTimeout(timeout);
    }
  };

  // Get settings menu items for dropdown
  const settingsMenuItems = useMemo(() => [
    {
      id: 'userDetails',
      label: 'User Details',
      icon: <Cog size={14} />,
      onClick: () => {
        router.push(`/org/${orgId}/userDetails`);
        if (isMobile) setIsMobileVisible(false);
        setIsOrgDropdownExpanded(false);
      }
    },
    {
      id: 'workspace',
      label: 'Workspace',
      icon: <Settings2 size={14} />,
      onClick: () => {
        router.push(`/org/${orgId}/workspaceSetting`);
        if (isMobile) setIsMobileVisible(false);
        setIsOrgDropdownExpanded(false);
      }
    },
    {
      id: 'auth',
      label: 'Auth 2.0',
      icon: <KeyIcon size={14} />,
      onClick: () => {
        router.push(`/org/${orgId}/auth_route`);
        setIsOrgDropdownExpanded(false);
      }
    },
    {
      id: 'addModel',
      label: 'Add new Model',
      icon: <AddIcon size={14} />,
      onClick: () => {
        router.push(`/org/${orgId}/addNewModel`);
        setIsOrgDropdownExpanded(false);
      }
    },
    {
      id: 'prebuiltPrompts',
      label: 'Prebuilt Prompts',
      icon: <FileText size={14} />,
      onClick: () => {
        router.push(`/org/${orgId}/prebuilt-prompts`);
        if (isMobile) setIsMobileVisible(false);
        setIsOrgDropdownExpanded(false);
      }
    }
  ], [router, orgId, isMobile]);

  // Mobile menu toggle handler
  const handleMobileMenuToggle = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setHovered(null);
    setIsMobileVisible(prev => !prev);
  }, []);

  /* ------------------------------------------------------------------------ */
  /*                                  Render                                  */
  /* ------------------------------------------------------------------------ */

  // Fixed sidebar width - always 64px collapsed, 256px expanded
  const barWidth = 'w-50';
  const spacerW = isMobile ? '50px' : isOpen ? '256px' : '50px';
  const activeKey = pathParts[3];
  
  // Determine positioning based on mode
  const sidebarPositioning = isSideBySideMode ? 'relative' : 'fixed';
  const sidebarZIndex = (isMobile || isMobileVisible) ? 'z-50' : 'z-30';

  // Determine if sidebar should show content (expanded view) with delayed hiding
  const showSidebarContent = isMobile ? false : showContent;

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isMobileVisible && (
        <div
          className="fixed inset-0 bg-black/50 lg:none z-40 sidebar transition-opacity duration-300 ease-in-out"
          onClick={handleBackdropClick}
        />
      )}

      <div className="relative">
        {/* Mobile menu toggle button - shown only on mobile when sidebar is closed */}
        {isMobile && !isMobileVisible && (
          <button 
            onClick={handleMobileMenuToggle}
            className="fixed top-3 left-2 w-8 h-8 bg-base-100 border border-base-300 rounded-lg flex items-center justify-center hover:bg-base-200 transition-colors z-50 shadow-md"
          >
            <AlignJustify size={12} />
          </button>
        )}
        
        {/* ------------------------------------------------------------------ */}
        {/*                              SIDE BAR                              */}
        {/* ------------------------------------------------------------------ */}
        <div
          className={`${sidebarPositioning} sidebar border ${isMobile ? 'overflow-hidden' : ''} border-base-content/10 left-0 top-0 h-screen bg-base-100 my-3 ${isMobile?'mx-1':'mx-3'} shadow-lg rounded-xl flex flex-col pb-5 ${sidebarZIndex}`}
          style={{ 
            width: isMobile ? (isMobileVisible ? '56px' : '0px') : (isOpen ? '220px' : '50px'),
            transform: isMobile ? (isMobileVisible ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
            opacity: isMobile ? (isMobileVisible ? '1' : '0') : '1',
            transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
            transitionProperty: 'width, transform, opacity'
          }}
        >
          {/* Mobile close button - positioned at the top-right corner */}
          {isMobile && isMobileVisible && (
            <button
              onClick={() => setIsMobileVisible(false)}
              className="absolute -right-3 top-3 w-7 h-7 bg-base-100 border border-base-300 rounded-full flex items-center justify-center hover:bg-base-200 transition-colors z-10 shadow-sm"
            >
              <ChevronLeft size={14} />
            </button>
          )}

          {/* Toggle button - only show for desktop */}
          {!isMobile && (
            <button
              onClick={handleToggle}
              className="absolute -right-3 top-[50px] w-7 h-7 bg-base-100 border border-base-300 rounded-full flex items-center justify-center hover:bg-base-200 transition-colors z-10 shadow-sm"
            >
              {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
          
          {/* -------------------------- NAVIGATION -------------------------- */}
          <div className="flex flex-col h-full">
            {/* Header section */}
            <div className="p-2 border-b border-base-300 relative">
              {/* Organization */}
              {pathParts.length >= 4 && (
                <div 
                  className="relative org-dropdown-container"
                  onMouseEnter={handleOrgHover}
                  onMouseLeave={handleOrgLeave}
                >
                  <button
                    onClick={handleOrgClick}
                    className="w-full flex items-center gap-3 py-2 rounded-lg hover:bg-base-200 transition-colors"
                  >
                    {/* First letter avatar */}
                    <div className="shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-content font-semibold text-sm">
                        {orgName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {showSidebarContent && (
                      <>
                        <div className="flex-1 text-left overflow-hidden">
                          <div className="font-semibold text-sm truncate">{truncate(orgName, 20)}</div>
                          <div className="text-xs text-base-content/60">Organization</div>
                        </div>
                        <ChevronDown size={16} className={`shrink-0 transition-transform ${isOrgDropdownExpanded ? 'rotate-180' : ''}`} />
                      </>
                    )}
                  </button>

                  {/* Dropdown for collapsed sidebar */}
                  {isOrgDropdownOpen && !showSidebarContent && (
                    <div 
                      className="absolute left-full top-0 ml-2 bg-base-100 border border-base-300 rounded-lg shadow-lg p-2 min-w-[250px] z-50 space-y-1 animate-in fade-in-0 zoom-in-95 duration-200 slide-in-from-left-2"
                      onMouseEnter={() => {
                        // Clear timeout when hovering over dropdown
                        if (orgDropdownTimeout) {
                          clearTimeout(orgDropdownTimeout);
                          setOrgDropdownTimeout(null);
                        }
                      }}
                      onMouseLeave={handleOrgLeave}
                    >
                      {/* Organization header */}
                      <div className="flex items-center gap-3 p-2 border-b border-base-300 pb-2 mb-2">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-content font-semibold text-sm">
                            {orgName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{orgName}</div>
                          <div className="text-xs text-base-content/60">Organization</div>
                        </div>
                      </div>

                      {/* User email info */}
                      <div className="flex items-center gap-3 p-2 text-sm text-base-content/70 border-b border-base-300 pb-2 mb-2">
                        <Mail size={14} className="shrink-0" />
                        <span className="truncate flex-1 text-xs">{userdetails?.email ?? 'user@email.com'}</span>
                      </div>

                      {/* Settings menu items */}
                      <div className="space-y-1">
                        {settingsMenuItems.map((item) => (
                          <button
                            key={item.id}
                            onClick={item.onClick}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 transition-colors text-sm"
                          >
                            <span className="shrink-0">{item.icon}</span>
                            <span className="truncate text-xs">{item.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Theme Section */}
                      <div className="border-t border-base-300 pt-2 mt-2">
                        <div className="flex items-center justify-between mb-2 px-2">
                          <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">Theme</span>
                        </div>
                        <div className="flex bg-base-200 rounded-lg p-1">
                          <button
                            onClick={() => handleThemeChange('light')}
                            className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all ${
                              theme === 'light' 
                                ? 'bg-base-100 text-base-content shadow-sm' 
                                : 'text-base-content/60 hover:text-base-content'
                            }`}
                          >
                            <SunIcon size={12} className="mx-auto" />
                          </button>
                          <button
                            onClick={() => handleThemeChange('dark')}
                            className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all ${
                              theme === 'dark' 
                                ? 'bg-base-100 text-base-content shadow-sm' 
                                : 'text-base-content/60 hover:text-base-content'
                            }`}
                          >
                            <MoonIcon size={12} className="mx-auto" />
                          </button>
                          <button
                            onClick={() => handleThemeChange('system')}
                            className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all ${
                              theme === 'system' 
                                ? 'bg-base-100 text-base-content shadow-sm' 
                                : 'text-base-content/60 hover:text-base-content'
                            }`}
                          >
                            <MonitorIcon size={12} className="mx-auto" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Switch Organization and Logout buttons */}
                      <div className="border-t border-base-300 pt-2 mt-2 space-y-1">
                        <button
                          onClick={handleSwitchOrg}
                          className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-base-200 transition-colors text-primary text-xs font-medium"
                        >
                          <Building2 size={14} />
                          Switch Organization
                        </button>
                        
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsOrgDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-error/10 transition-colors text-error text-xs font-medium"
                        >
                          <LogOut size={14} />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Expanded dropdown for full sidebar */}
                  {isOrgDropdownExpanded && showSidebarContent && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-base-100 border border-base-300 rounded-lg shadow-lg p-2 space-y-1 z-50 animate-in fade-in-0 zoom-in-95 duration-200 slide-in-from-top-2">
                      {/* User email info */}
                      <div className="flex items-center gap-3 p-2 text-sm text-base-content/70 border-b border-base-300 pb-2 mb-2">
                        <Mail size={14} className="shrink-0" />
                        <span className="truncate flex-1 text-xs">{userdetails?.email ?? 'user@email.com'}</span>
                      </div>

                      {/* Settings menu items */}
                      <div className="space-y-1">
                        {settingsMenuItems.map((item) => (
                          <button
                            key={item.id}
                            onClick={item.onClick}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-base-300 transition-colors text-sm"
                          >
                            <span className="shrink-0">{item.icon}</span>
                            <span className="truncate text-xs">{item.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Theme Section */}
                      <div className="border-t border-base-300 pt-2 mt-2">
                        <div className="flex items-center justify-between mb-2 px-2">
                          <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">Theme</span>
                        </div>
                        <div className="flex bg-base-300 rounded-lg p-1">
                          <button
                            onClick={() => handleThemeChange('light')}
                            className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all ${
                              theme === 'light' 
                                ? 'bg-base-100 text-base-content shadow-sm' 
                                : 'text-base-content/60 hover:text-base-content'
                            }`}
                          >
                            <SunIcon size={12} className="mx-auto" />
                          </button>
                          <button
                            onClick={() => handleThemeChange('dark')}
                            className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all ${
                              theme === 'dark' 
                                ? 'bg-base-100 text-base-content shadow-sm' 
                                : 'text-base-content/60 hover:text-base-content'
                            }`}
                          >
                            <MoonIcon size={12} className="mx-auto" />
                          </button>
                          <button
                            onClick={() => handleThemeChange('system')}
                            className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all ${
                              theme === 'system' 
                                ? 'bg-base-100 text-base-content shadow-sm' 
                                : 'text-base-content/60 hover:text-base-content'
                            }`}
                          >
                            <MonitorIcon size={12} className="mx-auto" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Switch Organization and Logout buttons */}
                      <div className="border-t border-base-300 pt-2 mt-2 space-y-1">
                        <button
                          onClick={handleSwitchOrg}
                          className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-base-300 transition-colors text-primary text-xs font-medium"
                        >
                          <Building2 size={14} />
                          Switch Organization
                        </button>
                        
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsOrgDropdownExpanded(false);
                          }}
                          className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-error/10 transition-colors text-error text-xs font-medium"
                        >
                          <LogOut size={14} />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Main navigation - scrollable */}
            <div className={`flex-1  scrollbar-hide overflow-x-hidden scroll-smooth p-2`}>
              <div className="space-y-6">
                {NAV_SECTIONS.map(({ title, items }, idx) => (
                  <div key={idx} className="space-y-1">
                    {showSidebarContent && title && (
                      <h3 className="mb-3 text-xs font-semibold text-base-content/50 uppercase tracking-wider px-2">
                        {title}
                      </h3>
                    )}
                    <div className="space-y-1">
                      {items.map(key => (
                        <button
                          key={key}
                          onClick={() => {
                            if(key === 'agents' &&  pathParts.length >  4){
                              toggleSidebar(`default-agent-sidebar`)
                            }else{
                              router.push(`/org/${orgId}/${key}`);
                            }
                            if (isMobile) setIsMobileVisible(false);
                          }}
                          onMouseEnter={e => onItemEnter(key, e)}
                          onMouseLeave={onItemLeave}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200 ${
                            activeKey === key 
                              ? 'bg-primary text-primary-content shadow-sm' 
                              : 'hover:bg-base-200 text-base-content'
                          } ${!showSidebarContent ? 'justify-center' : ''}`}
                        >
                          <div className="shrink-0">{ITEM_ICONS[key]}</div>
                          {showSidebarContent && (
                           <div className='flex items-center gap-2 justify-center'>
                             <span className="font-medium text-sm capitalize truncate">{DISPLAY_NAMES(key)}</span> 
                             <span>{key === 'orchestratal_model' && <BetaBadge/>}</span>
                           </div>
                          )}
                        </button>
                      ))}
                    </div>
                    {!showSidebarContent && idx !== NAV_SECTIONS.length - 1 && <HRCollapsed />}
                  </div>
                ))}
              </div>
            </div>

            {/* Tutorial & Help Section */}
            <div className="border-t border-base-300 p-2">
              <div className="space-y-1">
                <button
                  onClick={() => {
                    openModal(MODAL_TYPE.TUTORIAL_MODAL);
                    if (isMobile) setIsMobileVisible(false);
                  }}
                  onMouseEnter={e => onItemEnter('tutorial', e)}
                  onMouseLeave={onItemLeave}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-base-200 transition-colors ${!showSidebarContent ? 'justify-center' : ''}`}
                >
                  <MonitorPlayIcon size={16} className="shrink-0" />
                  {showSidebarContent && <span className="font-medium text-sm truncate">Tutorial</span>}
                </button>

                <button
                  onClick={() => {
                    openModal(MODAL_TYPE.DEMO_MODAL);
                    if (isMobile) setIsMobileVisible(false);
                  }}
                  onMouseEnter={e => onItemEnter('speak-to-us', e)}
                  onMouseLeave={onItemLeave}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-base-200 transition-colors ${!showSidebarContent ? 'justify-center' : ''}`}
                >
                  <MessageCircleMoreIcon size={16} className="shrink-0" />
                  {showSidebarContent && <span className="font-medium text-sm truncate">Speak to Us</span>}
                </button>

                <a
                  href="https://gtwy.featurebase.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={e => onItemEnter('feedback', e)}
                  onMouseLeave={onItemLeave}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-base-200 transition-colors ${!showSidebarContent ? 'justify-center' : ''}`}
                  onClick={() => isMobile && setIsMobileVisible(false)}
                >
                  <MessageSquareMoreIcon size={16} className="shrink-0" />
                  {showSidebarContent && <span className="font-medium text-sm truncate">Feedback</span>}
                </a>
              </div>
            </div>

            {/* GTWY Label Section */}
            <div className="border-t border-base-300 p-2">
              <div className="text-center">
                {showSidebarContent ? (
                  <span className="text-sm text-base-content/70">GTWY.AI</span>
                ) : (
                  <span className="text-xs text-base-content/50">GTWY</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/*                         CONTENT SPACER                             */}
        {/* ------------------------------------------------------------------ */}
        {/* Only show spacer in side-by-side mode and desktop */}
        {isSideBySideMode && !isMobile && (
          <div 
            className="hidden lg:block" 
            style={{ 
              width: spacerW,
              transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)'
            }} 
          />
        )}

        {/* ------------------------------------------------------------------ */}
        {/*                              TOOL‑TIP                              */}
        {/* ------------------------------------------------------------------ */}
        {hovered && !showSidebarContent && (isMobileVisible || (!isMobile && !isOpen)) && (
          <div
            className="fixed bg-base-300 text-base-content py-2 px-3 rounded-lg shadow-lg whitespace-nowrap border border-base-300 pointer-events-none z-50"
            style={{ top: tooltipPos.top - 20, left: tooltipPos.left }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-base-300 border rotate-45 -left-1 border-r-0 border-b-0 border-base-300" />
            {DISPLAY_NAMES(hovered)}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/*                               MODALS                               */}
        {/* ------------------------------------------------------------------ */}
        <OrgSlider />
        <BridgeSlider />
        <TutorialModal />
        <DemoModal speakToUs />
      </div>
    </>
  );
}

export default Protected(MainSlider);