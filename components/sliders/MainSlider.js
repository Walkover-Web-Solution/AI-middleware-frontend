/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react';

// Add CSS animation for the gradient border
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes gradientMove {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }
  `;
  if (!document.head.querySelector('style[data-gradient-animation]')) {
    style.setAttribute('data-gradient-animation', 'true');
    document.head.appendChild(style);
  }
}

import { useDispatch } from 'react-redux';
import { ChevronDown,
  LogOut,
  ChevronRight, ChevronLeft,
  User,
  AlignJustify,
  ArrowLeft
} from 'lucide-react';

import { usePathname, useRouter } from 'next/navigation';
import { logoutUserFromMsg91, switchOrg, switchUser } from '@/config/index';
import { useCustomSelector } from '@/customHooks/customSelector';
import { truncate } from '@/components/historyPageComponents/AssistFile';
import { clearCookie, getFromCookies, openModal, setInCookies } from '@/utils/utility';
import { setCurrentOrgIdAction } from '@/store/action/orgAction';
import OrgSlider from './OrgSlider';
import TutorialModal from '@/components/modals/TutorialModal';
import DemoModal from '../modals/DemoModal';
import { MODAL_TYPE } from '@/utils/enums';
import Protected from '../Protected';
import BridgeSlider from './BridgeSlider';
import { BetaBadge, DISPLAY_NAMES, HRCollapsed, ITEM_ICONS, NAV_SECTIONS } from '@/utils/mainSliderHelper';
import InviteUserModal from '../modals/InviteuserModal';

/* -------------------------------------------------------------------------- */
/*                                  Component                                 */
/* -------------------------------------------------------------------------- */

function MainSlider({ isEmbedUser }) {
  /* --------------------------- Router & selectors ------------------------- */
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const pathParts = pathname.split('?')[0].split('/');
  const orgId = pathParts[2];

  const { userdetails, organizations, currrentOrgDetail } = useCustomSelector(state => ({
    userdetails: state.userDetailsReducer.userDetails,
    organizations: state.userDetailsReducer.organizations,
    currrentOrgDetail: state?.userDetailsReducer?.organizations?.[orgId]
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
  const [isAdminMode, setIsAdminMode] = useState(false); // New state for admin settings mode
  
  // Theme detection placeholder (not actively used)

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (orgDropdownTimeout) {
        clearTimeout(orgDropdownTimeout);
      }
    };
  }, [orgDropdownTimeout]);

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

  const handleSwitchOrg = useCallback(async (id, name) => {
    if (!id || !name) {
      // If no id/name provided, go to org selection page
      router.push('/org?redirection=false');
      if (isMobile) setIsMobileVisible(false);
      setIsOrgDropdownExpanded(false);
      setIsOrgDropdownOpen(false);
      return;
    }

    try {
      const response = await switchOrg(id);
      const localToken = await switchUser({ orgId: id, orgName: name });
      setInCookies('local_token', localToken.token);
      
      router.push(`/org/${id}/agents`);
      dispatch(setCurrentOrgIdAction(id));
      if (isMobile) setIsMobileVisible(false);
      setIsOrgDropdownExpanded(false);
      setIsOrgDropdownOpen(false);
      
      if (response.status === 200) {
        console.log("Organization switched successfully", response.data);
      } else {
        console.error("Failed to switch organization", response.data);
      }
    } catch (error) {
      console.error("Error switching organization", error);
    }
  }, [dispatch, router, isMobile]);

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

  // Admin settings toggle handler
  const handleAdminToggle = useCallback(() => {
    setIsAdminMode(prev => !prev);
  }, []);

  // Get settings menu items for sidebar
  const settingsMenuItems = useMemo(() => [
    {
      id: 'workspace',
      label: 'Workspace',
      icon: ITEM_ICONS.workspace,
      onClick: () => {
        setIsOrgDropdownExpanded(false);
        setIsOrgDropdownOpen(false);
        if (isMobile) setIsMobileVisible(false);
        router.push(`/org/${orgId}/workspaceSetting`);
      }
    },
    {
      id: 'userDetails',
      label: 'User Details',
      icon: ITEM_ICONS.userDetails,
      onClick: () => {
        setIsOrgDropdownExpanded(false);
        setIsOrgDropdownOpen(false);
        if (isMobile) setIsMobileVisible(false);
        router.push(`/org/${orgId}/userDetails`);
      }
    },
    {
      id: 'Members',
      label: 'Members',
      icon: ITEM_ICONS.invite,
      onClick: () => {
        setIsOrgDropdownExpanded(false);
        setIsOrgDropdownOpen(false);
        if (isMobile) setIsMobileVisible(false);
        router.push(`/org/${orgId}/invite`);
      }
    },
    {
      id: 'auth',
      label: 'Auth 2.0',
      icon: ITEM_ICONS.auth,
      onClick: () => {
        setIsOrgDropdownExpanded(false);
        setIsOrgDropdownOpen(false);
        router.push(`/org/${orgId}/auth_route`);
      }
    },
    {
      id: 'addModel',
      label: 'Add new Model',
      icon: ITEM_ICONS.addModel,
      onClick: () => {
        setIsOrgDropdownExpanded(false);
        setIsOrgDropdownOpen(false);
        router.push(`/org/${orgId}/addNewModel`);
      }
    },
    {
      id: 'prebuiltPrompts',
      label: 'GTWY Tools',
      icon: ITEM_ICONS.prebuiltPrompts,
      onClick: () => {
        setIsOrgDropdownExpanded(false);
        setIsOrgDropdownOpen(false);
        if (isMobile) setIsMobileVisible(false);
        router.push(`/org/${orgId}/prebuilt-prompts`);
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

  // Reusable function for rendering organization dropdown content
  const renderOrganizationDropdown = useCallback(() => {
    return (
      <>
        {/* User info */}
        <div className="flex items-start gap-3 p-3 border-b border-base-300 mb-3">
          <User size={16} className="text-base-content/60 mt-3  flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-base-content truncate">{userdetails?.name}</div>
            <div className="text-xs text-base-content/60 truncate mt-0.5">{userdetails?.email ?? 'user@email.com'}</div>
          </div>
        </div>

        {/* Organizations List */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 mb-2">
            <div className="text-xs font-medium text-base-content/50 uppercase tracking-wider">
              Organizations
            </div>
            <button 
              onClick={() => {
                setIsOrgDropdownExpanded(false);
                setIsOrgDropdownOpen(false);
                openModal(MODAL_TYPE.INVITE_USER);
              }}
              className="text-xs text-blue-400 hover:text-blue-600 transition-colors font-medium"
            >
              + Invite User
            </button>
          </div>
          
          {/* Current Organization - shown as selected */}
          {organizations?.[orgId] && (
            <div className="w-full flex items-center cursor-pointer gap-3 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-primary truncate">{organizations[orgId].name}</div>
              </div>
            </div>
          )}
          
          {/* Other Organizations */}
          {Object.entries(organizations || {})
            .filter(([id]) => id !== orgId) // Exclude current org
            .slice(0, 2) // Show only first 2
            .map(([id, org]) => (
              <button
                key={id}
                onClick={() => handleSwitchOrg(id, org.name)}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-base-200 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-base-content truncate">{org.name}</div>
                </div>
              </button>
            ))}
          
          <button
            onClick={() => handleSwitchOrg()}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-base-200 transition-colors text-left text-primary"
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-blue-400 text-sm truncate">
                more {Object.keys(organizations || {}).filter(id => id !== orgId).length > 2 && 
                  `(+${Object.keys(organizations || {}).filter(id => id !== orgId).length - 2})`
                }
              </div>
            </div>
          </button>
          
          <hr className="border-base-300 my-2" />
          
          <button
            onClick={() => {
              handleLogout();
              setIsOrgDropdownOpen(false);
              setIsOrgDropdownExpanded(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-error/10 transition-colors text-left text-error"
          >
            <LogOut size={14} className="flex-shrink-0" />
            <div className="font-medium text-sm">Logout</div>
          </button>
        </div>
      </>
    );
  }, [userdetails, organizations, orgId, handleSwitchOrg, handleLogout]);

  /* ------------------------------------------------------------------------ */
  /*                                  Render                                  */
  /* ------------------------------------------------------------------------ */

  // Fixed sidebar width - always 64px collapsed, 256px expanded
  const spacerW = isMobile ? '50px' : isOpen ? '256px' : '50px';
  const activeKey = pathParts[3];
  
  // Determine positioning based on mode
  const sidebarPositioning = isSideBySideMode ? 'relative' : 'fixed';
  const sidebarZIndex = (isMobile || isMobileVisible) ? 'z-50' : 'z-30';

  // Determine if sidebar should show content (expanded view) with delayed hiding
  const showSidebarContent = isMobile ? false : showContent;

  return (
    <>
      {/* Custom Keyframes for Smooth Animations */}
      <style jsx>{`
        @keyframes slideInLeft {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideInRight {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>

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
          className={`${sidebarPositioning} sidebar bg-base-300 border ${isMobile ? 'overflow-hidden' : ''} border-base-content/10 left-0 top-0 h-screen bg-base-100 my-3 ${isMobile?'mx-1':'mx-3'} shadow-lg rounded-xl flex flex-col pb-5 ${sidebarZIndex}`}
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
                      className="absolute left-full top-0 ml-2 bg-base-100 border border-base-300 rounded-lg shadow-lg p-2 w-[320px] z-50 animate-in fade-in-0 zoom-in-95 duration-200 slide-in-from-top-2"
                      onMouseEnter={() => {
                        // Clear timeout when hovering over dropdown
                        if (orgDropdownTimeout) {
                          clearTimeout(orgDropdownTimeout);
                          setOrgDropdownTimeout(null);
                        }
                      }}
                      onMouseLeave={handleOrgLeave}
                    >
                      {renderOrganizationDropdown()}
                    </div>
                  )}

                  {/* Expanded dropdown for full sidebar - positioned from left edge */}
                  {isOrgDropdownExpanded && showSidebarContent && (
                    <div className="absolute top-0 left-0 mt-2 bg-base-100 border border-base-300 rounded-lg shadow-lg p-2 w-[320px] z-50 animate-in fade-in-0 zoom-in-95 duration-200 slide-in-from-top-2">
                      {renderOrganizationDropdown()}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Main navigation - scrollable */}
            <div className={`flex-1  scrollbar-hide overflow-x-hidden scroll-smooth p-2`}>
              <div className="">
                {/* Main Menu Button - Show only in Admin Mode */}
                {isAdminMode && (
                  <div className="mb-4">
                    <button
                      onClick={handleAdminToggle}
                      onMouseEnter={e => onItemEnter('main-menu', e)}
                      onMouseLeave={onItemLeave}
                      className={`w-full flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-200 hover:bg-base-200 text-base-content ${!showSidebarContent ? 'justify-center' : ''}`}
                    >
                      <div className="shrink-0">
                        <ArrowLeft size={16} />
                      </div>
                      {showSidebarContent && (
                        <span className="text-sm truncate">Main Menu</span>
                      )}
                    </button>
                  </div>
                )}

                {!isAdminMode ? (
                  // Normal Navigation with slide from left animation
                  <div 
                    key="main-nav"
                    style={{
                      animation: 'slideInLeft 0.3s ease-out both'
                    }}
                  >
                    {NAV_SECTIONS.map(({ title, items }, idx) => (
                      <div key={idx} className="">
                        {showSidebarContent && title && (
                          <h3 className="my-2 text-[10px] text-base-content/50 uppercase tracking-wider px-2">
                            {title}
                          </h3>
                        )}
                        <div className="space-y-1">
                          {items.map(key => (
                            <button
                              key={key}
                              onClick={() => {
                                  router.push(`/org/${orgId}/${key}`);
                                if (isMobile) setIsMobileVisible(false);
                              }}
                              onMouseEnter={e => onItemEnter(key, e)}
                              onMouseLeave={onItemLeave}
                              className={`w-full flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-200 ${
                                activeKey === key 
                                  ? 'bg-primary text-primary-content shadow-sm' 
                                  : 'hover:bg-base-200 text-base-content'
                              } ${!showSidebarContent ? 'justify-center' : ''}`}
                            >
                              <div className="shrink-0">{ITEM_ICONS[key]}</div>
                              {showSidebarContent && (
                               <div className='flex items-center gap-2 justify-center'>
                                 <span className="text-sm capitalize truncate">{DISPLAY_NAMES(key)}</span> 
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
                ) : (
                  // Admin Settings Navigation with slide from right animation
                  <div 
                    key="admin-nav"
                    style={{
                      animation: 'slideInRight 0.3s ease-out both'
                    }}
                  >
                    {showSidebarContent && (
                      <h3 className="my-2 text-xs text-base-content/50 uppercase tracking-wider px-2">
                        Admin Settings
                      </h3>
                    )}
                    <div className="space-y-1">
                      {settingsMenuItems.map(item => (
                        <button
                          key={item.id}
                          onClick={() => {
                            item.onClick();
                            if (isMobile) setIsMobileVisible(false);
                          }}
                          onMouseEnter={e => onItemEnter(item.id, e)}
                          onMouseLeave={onItemLeave}
                          className={`w-full flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-200 hover:bg-base-200 text-base-content ${!showSidebarContent ? 'justify-center' : ''}`}
                        >
                          <div className="shrink-0">{item.icon}</div>
                          {showSidebarContent && (
                            <span className="text-sm truncate">{item.label}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Tutorial & Help Section */}
            <div className="border-t border-base-content/20 p-2 rounded-t-lg ">
              <div className="">
                                {/* Admin Settings Button */}
                <button
                  onClick={handleAdminToggle}
                  onMouseEnter={e => onItemEnter('admin-toggle', e)}
                  onMouseLeave={onItemLeave}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                    isAdminMode 
                      ? 'bg-primary text-primary-content shadow-sm' 
                      : 'hover:bg-base-200 text-base-content'
                  } ${!showSidebarContent ? 'justify-center' : ''}`}
                >
                  {ITEM_ICONS.adminSettings}
                  {showSidebarContent && (
                    <span className="text-xs truncate">
                      {isAdminMode ? 'Back to Main' : 'Admin Settings'}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    openModal(MODAL_TYPE.TUTORIAL_MODAL);
                    if (isMobile) setIsMobileVisible(false);
                  }}
                  onMouseEnter={e => onItemEnter('tutorial', e)}
                  onMouseLeave={onItemLeave}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-base-200 transition-colors ${!showSidebarContent ? 'justify-center' : ''}`}
                >
                  {ITEM_ICONS.tutorial}
                  {showSidebarContent && <span className="text-xs truncate">Tutorial</span>}
                </button>

               {!currrentOrgDetail?.meta?.unlimited_access && 
                <div className="relative">
                  <button
                    onClick={() => {
                      router.push(`/org/${orgId}/lifetime-access`);
                      if (isMobile) setIsMobileVisible(false);
                    }}
                    onMouseEnter={e => onItemEnter('lifetimeAccess', e)}
                    onMouseLeave={onItemLeave}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 transition-all duration-300 border-2 border-yellow-400/50 ${!showSidebarContent ? 'justify-center' : ''}`}
                  >
                    {/* Inner content */}
                    <div className="relative z-10 flex items-center gap-3 w-full">
                      <div className="relative">
                        {ITEM_ICONS.lifetimeAccess}
                        {/* Sparkle effect */}
                        <div className="absolute -top-1 -right-1 w-1 h-1 bg-yellow-400 rounded-full animate-ping opacity-40"></div>
                      </div>
                      {showSidebarContent && (
                        <span className="text-xs truncate font-medium bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                          Free Lifetime Access
                        </span>
                      )}
                    </div>
                  </button>
                  
                  {/* Gift ribbon effect */}
                  {showSidebarContent && (
                    <div className="absolute -top-0.5 -right-0.5 text-xs opacity-60 transform rotate-12">
                      🎁
                    </div>
                  )}
                </div>
              }

                <button
                   data-cal-namespace="30min"
                        data-cal-link="team/gtwy.ai/ai-consultation"
                        data-cal-origin="https://cal.id"
                        data-cal-config='{"layout":"month_view"}'
                  onMouseEnter={e => onItemEnter('speak-to-us', e)}
                  onMouseLeave={onItemLeave}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-base-200 transition-colors ${!showSidebarContent ? 'justify-center' : ''}`}
                >
                  {ITEM_ICONS.speakToUs}
                  {showSidebarContent && <span className="text-xs truncate">Speak To Us</span>}
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
                  {ITEM_ICONS.feedbackAdmin}
                  {showSidebarContent && <span className="text-xs truncate">Feedback</span>}
                </a>


              </div>
            </div>

            {/* GTWY Label Section */}
            <div className="border-t border-base-300 p-2">
              <div className="text-center">
                {showSidebarContent ? (
                  <span className="text-sm text-base-content/70">GTWY</span>
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
            className="fixed capitalize bg-base-300 text-base-content py-2 px-3 rounded-lg shadow-lg whitespace-nowrap border border-base-300 pointer-events-none z-50"
            style={{ top: tooltipPos.top - 20, left: tooltipPos.left }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-base-300 border rotate-45 capitalize -left-1 border-r-0 border-b-0 border-base-300" />
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
        <InviteUserModal />
      </div>
    </>
  );
}

export default Protected(MainSlider);
