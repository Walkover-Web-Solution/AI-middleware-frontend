/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react';
import {
  BookOpen, MessageSquare, Building2, ChevronDown,
  Cog, Database, Shield, BarChart3, LogOut, Mail, MessageSquareMore,
  Settings2, AlertTriangle, UserPlus,
  ChevronRight, ChevronLeft,
  Bot,
  MonitorPlayIcon,
  MessageCircleMoreIcon,
  MessageSquareMoreIcon,
  Blocks,
  User,
  Workflow,
  FileSliders,
  AlignJustify
} from 'lucide-react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { logoutUserFromMsg91 } from '@/config';
import { useCustomSelector } from '@/customHooks/customSelector';
import { truncate } from '@/components/historyPageComponents/assistFile';
import { clearCookie, getFromCookies, openModal, toggleSidebar } from '@/utils/utility';
import OrgSlider from './orgSlider';
import TutorialModal from '@/components/modals/tutorialModal';
import DemoModal from '../modals/DemoModal';
import { MODAL_TYPE } from '@/utils/enums';
import Protected from '../protected';
import BridgeSlider from './bridgeSlider';
import { AddIcon, KeyIcon } from '../Icons';
import ThemeToggle from '../UI/ThemeUi';

/* -------------------------------------------------------------------------- */
/*                                    Consts                                  */
/* -------------------------------------------------------------------------- */

const ITEM_ICONS = {
  org: <Building2 size={16} />,
  agents: <Bot size={16} />,
  orchestratal_model: <Workflow size={16} />,
  chatbotConfig: <FileSliders size={16} />,
  chatbot: <MessageSquare size={16} />,
  pauthkey: <Shield size={16} />,
  apikeys: <Database size={16} />,
  alerts: <AlertTriangle size={16} />,
  invite: <UserPlus size={16} />,
  metrics: <BarChart3 size={16} />,
  knowledge_base: <BookOpen size={16} />,
  feedback: <MessageSquareMore size={16} />,
  RAG_embed: <Blocks size={16} /> ,
  integration: <Blocks size={16} />
};

const NAV_SECTIONS = [
  { items: ['agents', 'orchestratal_model', 'chatbotConfig','knowledge_base'] },
  { title: 'SECURITY & ACCESS', items: ['pauthkey', 'apikeys'] },
  { title: 'MONITORING & SUPPORT', items: ['alerts', 'metrics'] },
  { title: 'Developer', items: ['integration', 'RAG_embed'] },
  { title: 'TEAM & COLLABORATION', items: ['invite'] }
];

/* -------------------------------------------------------------------------- */
/*                               Helper Components                            */
/* -------------------------------------------------------------------------- */

/** Small horizontal rule visible only when sidebar is collapsed */
const HRCollapsed = () => (
  <hr className="my-2 w-6 border-base-content/30 mx-auto" />
);

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
  const bridgeId = pathParts[5];
  const versionId = searchParams.get('version');

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileVisible, setIsMobileVisible] = useState(false); // New state for mobile visibility

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

  /* ------------------------------------------------------------------------ */
  /*                                 Helpers                                  */
  /* ------------------------------------------------------------------------ */

  /** Nice display names for items */
  const displayName = key => {
    const names = {
      orchestratal_model: 'Orchestral Model',
      knowledge_base: 'Knowledge base',
      chatbotConfig: 'Configure Chatbot',
      feedback: 'Feedback',
      tutorial: 'Tutorial',
      'speak-to-us': 'Speak to Us',
      integration: 'GTWY as Embed',
      settings: 'Settings',
      RAG_embed: 'RAG as Embed',
      invite: 'Members'
    };
    return names[key] || key.charAt(0).toUpperCase() + key.slice(1);
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
    if (isSideBySideMode) {
      // In side-by-side mode, allow both opening and closing
      setIsOpen(prev => !prev);
      setHovered(null);
    } else {
      // Normal toggle behavior for other modes
      if (e.detail === 2 && !isMobile) {
        setIsOpen(true);
        setHovered(null);
      } else {
        setIsOpen(prev => !prev);
        setHovered(null);
      }
    }
  };

  /** Close sidebar on outside click when in sub-routes */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pathParts.length > 4 && (isOpen || isMobileVisible)) {
        const sidebar = document.querySelector('.sidebar'); // Assuming sidebar has this class
        if (sidebar && !sidebar.contains(e.target)) {
          if (isMobile) {
            setIsMobileVisible(false);
          } else {
            setIsOpen(false);
          }
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isMobileVisible, pathParts.length, isMobile]);

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

  // Close on backdrop click (mobile)
  const handleBackdropClick = () => {
    if (isMobile && isMobileVisible) {
      setIsMobileVisible(false);
    }
  };

  // Settings toggler - modified for mobile
  const handleSettingsClick = () => {
    if (isMobile) {
      if (!isMobileVisible) {
        setIsMobileVisible(true);
        setIsSettingsOpen(true);
      } else {
        setIsSettingsOpen(prev => !prev);
      }
    } else {
      if (!isOpen) {
        setIsOpen(true);
        setIsSettingsOpen(true);
      } else {
        setIsSettingsOpen(prev => !prev);
      }
    }
  };

  // Mobile menu toggle handler
  const handleMobileMenuToggle = () => {
    setIsMobileVisible(prev => !prev);
    setHovered(null);
  };

  const betaBadge = () =>{
    return(
      <span className="badge badge-success mb-1 text-base-100 text-xs">Beta</span>
    )
  }

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

  // Determine if sidebar should show content (expanded view)
  const showSidebarContent = isMobile ? false : isOpen; // Mobile always shows collapsed view

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isMobileVisible && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40 sidebar"
          onClick={handleBackdropClick}
        />
      )}

      <div className="relative">
        {/* Mobile menu toggle button - shown only on mobile when sidebar is closed */}
        {isMobile && !isMobileVisible && (
          <button 
            onClick={handleMobileMenuToggle}
            className="fixed top-4 left-4 w-10 h-10 bg-base-100 border border-base-300 rounded-lg flex items-center justify-center hover:bg-base-200 transition-colors z-50 shadow-md"
          >
            <AlignJustify size={20} />
          </button>
        )}
        
        {/* ------------------------------------------------------------------ */}
        {/*                              SIDE BAR                              */}
        {/* ------------------------------------------------------------------ */}
        <div
          className={`${sidebarPositioning} sidebar border border-base-content/30 left-0 top-0 h-screen bg-base-100 transition-all duration-200 ease-in-out my-3 mx-3 shadow-lg rounded-xl flex flex-col pb-5 ${barWidth} ${sidebarZIndex}`}
          style={{ 
            width: isMobile ? (isMobileVisible ? '56px' : '0px') : (isOpen ? '220px' : '50px'),
            transform: (!isSideBySideMode && pathParts.length > 3) ? (isMobile && !isMobileVisible ? 'translateX(-100%)' : 'translateX(0)') : 'none',
            opacity: (isMobile && !isMobileVisible) ? '0' : '1',
            visibility: (isMobile && !isMobileVisible) ? 'hidden' : 'visible'
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
              className="absolute -right-3 top-8 w-7 h-7 bg-base-100 border border-base-300 rounded-full flex items-center justify-center hover:bg-base-200 transition-colors z-10 shadow-sm"
            >
              {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
          
          {/* -------------------------- NAVIGATION -------------------------- */}
          <div className="flex flex-col h-full">
            {/* Header section */}
            <div className="p-2 border-b border-base-300">
              {/* Organization */}
              {pathParts.length >= 4 && (
                <button
                  onClick={() => {
                    pathParts.length > 4 ? toggleSidebar('default-org-sidebar') : router.push('/org');
                    if (isMobile) setIsMobileVisible(false);
                  }}
                  onMouseEnter={e => onItemEnter('org', e)}
                  onMouseLeave={onItemLeave}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 transition-colors"
                >
                  <Building2 size={20} className="shrink-0" />
                  {showSidebarContent && (
                    <div className="flex-1 text-left overflow-hidden">
                      <div className="font-semibold text-sm truncate">{truncate(orgName, 20)}</div>
                      <div className="text-xs text-base-content/60">Organization</div>
                    </div>
                  )}
                </button>
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
                             <span className="font-medium text-sm truncate">{displayName(key)}</span> 
                             <span>{key === 'orchestratal_model' && betaBadge()}</span>
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

            {/* User & Settings Section */}
            <div className="border-t border-base-300 p-2">
              <button
                onClick={handleSettingsClick}
                onMouseEnter={e => onItemEnter('settings', e)}
                onMouseLeave={onItemLeave}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-base-200 transition-colors ${!showSidebarContent ? 'justify-center' : ''}`}
              >
                <div className="shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User size={16} className="text-primary-content" />
                </div>
                {showSidebarContent && (
                  <div className="flex-1 text-left overflow-hidden">
                    <div className="font-medium text-sm truncate">
                      {userdetails?.email?.split('@')[0] || 'User'}
                    </div>
                    <div className="text-xs text-base-content/60">Settings</div>
                  </div>
                )}
                {showSidebarContent && (
                  <ChevronDown size={16} className={`shrink-0 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} />
                )}
              </button>

              {showSidebarContent && isSettingsOpen && (
                <div className="mt-2 space-y-1 bg-base-200 rounded-lg p-2">
                  <div className="flex items-center gap-3 p-2 text-sm text-base-content/70">
                    <Mail size={14} className="shrink-0" />
                    <span className="truncate flex-1 text-xs">{userdetails?.email ?? 'user@email.com'}</span>
                  </div>

                  <button
                    onClick={() => {
                      router.push(`/org/${orgId}/userDetails`);
                      if (isMobile) setIsMobileVisible(false);
                    }}
                    className="w-full flex items-center gap-3 p-2 rounded hover:bg-base-300 transition-colors text-sm"
                  >
                    <Cog size={14} className="shrink-0" />
                    <span className="truncate text-xs">User Details</span>
                  </button>

                  <button
                    onClick={() => {
                      router.push(`/org/${orgId}/workspaceSetting`);
                      if (isMobile) setIsMobileVisible(false);
                    }}
                    className="w-full flex items-center gap-3 p-2 rounded hover:bg-base-300 transition-colors text-sm"
                  >
                    <Settings2 size={14} className="shrink-0" />
                    <span className="truncate text-xs">Workspace</span>
                  </button>

                  <button
                    onClick={()=>{
                      router.push(`/org/${orgId}/auth_route`);
                    }}
                    className="w-full flex items-center gap-3 p-2 rounded hover:bg-base-300 transition-colors text-sm"
                  >
                    <KeyIcon size={14} className="shrink-0" />
                    <span className="truncate text-xs">Auth 2.0</span>
                  </button>

                  <button
                    onClick={()=>{
                      router.push(`/org/${orgId}/addNewModel`);
                    }}
                    className="w-full flex items-center gap-3 p-2 rounded hover:bg-base-300 transition-colors text-sm"
                  >
                    <AddIcon size={14} className="shrink-0" />
                    <span className="truncate text-xs">Add new Model</span>
                  </button>

                  <ThemeToggle/>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-2 rounded hover:bg-base-300 transition-colors text-sm text-error"
                  >
                    <LogOut size={14} className="shrink-0" />
                    <span className="truncate text-xs">Logout</span>
                  </button>

                </div>
              )}

              {/* GTWY Label */}
              <div className="mt-2 text-center">
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
        {/* Only show spacer in side-by-side mode */}
        {isSideBySideMode && (
          <div className="transition-all duration-300 hidden lg:block" style={{ width: spacerW }} />
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
            {displayName(hovered)}
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