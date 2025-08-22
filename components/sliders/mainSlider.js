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
  User
} from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { logoutUserFromMsg91 } from '@/config';
import { useCustomSelector } from '@/customHooks/customSelector';
import { truncate } from '@/components/historyPageComponents/assistFile';
import { openModal, toggleSidebar } from '@/utils/utility';
import OrgSlider from './orgSlider';
import TutorialModal from '@/components/modals/tutorialModal';
import DemoModal from '../modals/DemoModal';
import { MODAL_TYPE } from '@/utils/enums';
import Protected from '../protected';
import BridgeSlider from './bridgeSlider';
import { AddIcon, KeyIcon } from '../Icons';

/* -------------------------------------------------------------------------- */
/*                                    Consts                                  */
/* -------------------------------------------------------------------------- */

const ITEM_ICONS = {
  org: <Building2 size={16} />,
  agents: <Bot size={16} />,
  chatbot: <MessageSquare size={16} />,
  pauthkey: <Shield size={16} />,
  apikeys: <Database size={16} />,
  alerts: <AlertTriangle size={16} />,
  invite: <UserPlus size={16} />,
  metrics: <BarChart3 size={16} />,
  knowledge_base: <BookOpen size={16} />,
  feedback: <MessageSquareMore size={16} />,
  integration: <Blocks size={16} />
};

const NAV_SECTIONS = [
  { items: ['agents'] },
  { title: 'SECURITY & ACCESS', items: ['pauthkey', 'apikeys'] },
  { title: 'INTEGRATION', items: ['integration', 'knowledge_base'] },
  { title: 'MONITORING & SUPPORT', items: ['alerts', 'metrics'] },
  { title: 'TEAM & COLLABORATION', items: ['invite'] }
];

/* -------------------------------------------------------------------------- */
/*                               Helper Components                            */
/* -------------------------------------------------------------------------- */

/** Small horizontal rule visible only when sidebar is collapsed */
const HRCollapsed = () => (
  <hr className="my-2 w-6 border-base-300 mx-auto" />
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

  // Effect to handle sidebar state when path changes
  useEffect(() => {
    if (isSideBySideMode) {
      setIsOpen(true); // Always open in side-by-side mode
    } else if (pathParts.length > 4) {
      setIsOpen(false); // Automatically close when pathParts length > 4
    }
  }, [isSideBySideMode, pathParts.length]);

  /* ------------------------------------------------------------------------ */
  /*                                 Helpers                                  */
  /* ------------------------------------------------------------------------ */

  /** Nice display names for items */
  const displayName = key => {
    const names = {
      knowledge_base: 'Knowledge base',
      feedback: 'Feedback',
      tutorial: 'Tutorial',
      'speak-to-us': 'Speak to Us',
      integration: 'Integration',
      settings: 'Settings'
    };
    return names[key] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  /** Logout handler */
  const handleLogout = useCallback(async () => {
    try {
      await logoutUserFromMsg91({
        headers: { proxy_auth_token: localStorage.getItem('proxy_token') ?? '' }
      });
      localStorage.clear();
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
      if (pathParts.length > 4 && isOpen) {
        const sidebar = document.querySelector('.sidebar'); // Assuming sidebar has this class
        if (sidebar && !sidebar.contains(e.target)) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, pathParts.length]);

  /** Hover handlers – active only when collapsed (desktop) */
  const onItemEnter = (key, e) => {
    if (isOpen || isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({ top: rect.top + rect.height / 2, left: rect.right + 8 });
    setHovered(key);
  };
  const onItemLeave = () => !isOpen && !isMobile && setHovered(null);

  // Hide tooltip the moment sidebar expands
  useEffect(() => {
    if (isOpen) setHovered(null);
  }, [isOpen]);

  // Close on backdrop click (mobile)
  const handleBackdropClick = () => {
    if (isMobile && isOpen) setIsOpen(false);
  };

  // Settings toggler
  const handleSettingsClick = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsSettingsOpen(true);
    } else {
      setIsSettingsOpen(prev => !prev);
    }
  };

  /* ------------------------------------------------------------------------ */
  /*                                  Render                                  */
  /* ------------------------------------------------------------------------ */

  // Fixed sidebar width - always 64px collapsed, 256px expanded
  const barWidth = 'w-50';
  const spacerW = isMobile ? '50px' : isOpen ? '256px' : '50px';
  const activeKey = pathParts[3];
  
  // Determine positioning based on mode
  const sidebarPositioning = isSideBySideMode ? 'relative' : 'fixed';
  const sidebarZIndex = isMobile ? 'z-50' : 'z-30';

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40 sidebar"
          onClick={handleBackdropClick}
        />
      )}

      <div className="relative">
        {/* ------------------------------------------------------------------ */}
        {/*                              SIDE BAR                              */}
        {/* ------------------------------------------------------------------ */}
        <div
          className={`${sidebarPositioning} sidebar left-0 top-0 h-screen bg-base-100 border transition-all duration-300 my-3 mx-3 shadow-lg rounded-xl flex flex-col pb-5 ${barWidth} ${sidebarZIndex}`}
          style={{ 
            width: isMobile ? (isOpen ? '320px' : '56px') : (isOpen ? '256px' : '50px'),
            transform: (!isSideBySideMode && pathParts.length > 3) ? (isMobile && !isOpen ? 'translateX(-200px)' : 'translateX(0)') : 'none'
          }}
        >
          {/* Toggle button - always show chevron button */}
          {!isMobile && (
            <button
              onClick={handleToggle}
              className="absolute -right-3 top-8 w-7 h-7 bg-base-100 border border-base-300 rounded-full flex items-center justify-center hover:bg-base-200 transition-colors z-10 shadow-sm"
            >
              {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>
          )}

          {/* Mobile close */}
          {isMobile && isOpen && (
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-2 w-8 h-8 bg-base-200 rounded-full flex items-center justify-center hover:bg-base-300 transition-colors z-10"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          {/* Mobile hamburger when closed */}
          {isMobile && !isOpen && (
            <button
              onClick={() => setIsOpen(true)}
              className="absolute right-2 top-2 w-8 h-8 bg-base-200 rounded-full flex items-center justify-center hover:bg-base-300 transition-colors z-10"
            >
              <ChevronRight size={16} />
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
                    if (isMobile) setIsOpen(false);
                  }}
                  onMouseEnter={e => onItemEnter('org', e)}
                  onMouseLeave={onItemLeave}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 transition-colors"
                >
                  <Building2 size={20} className="shrink-0" />
                  {(isOpen || isMobile) && (
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
                    {(isOpen || isMobile) && title && (
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
                            if (isMobile) setIsOpen(false);
                          }}
                          onMouseEnter={e => onItemEnter(key, e)}
                          onMouseLeave={onItemLeave}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200 ${
                            activeKey === key 
                              ? 'bg-primary text-primary-content shadow-sm' 
                              : 'hover:bg-base-200 text-base-content'
                          } ${!isOpen && !isMobile ? 'justify-center' : ''}`}
                        >
                          <div className="shrink-0">{ITEM_ICONS[key]}</div>
                          {(isOpen || isMobile) && (
                            <span className="font-medium text-sm truncate">{displayName(key)}</span>
                          )}
                        </button>
                      ))}
                    </div>
                    {!isOpen && !isMobile && idx !== NAV_SECTIONS.length - 1 && <HRCollapsed />}
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
                    if (isMobile) setIsOpen(false);
                  }}
                  onMouseEnter={e => onItemEnter('tutorial', e)}
                  onMouseLeave={onItemLeave}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-base-200 transition-colors ${!isOpen && !isMobile ? 'justify-center' : ''}`}
                >
                  <MonitorPlayIcon size={16} className="shrink-0" />
                  {(isOpen || isMobile) && <span className="font-medium text-sm truncate">Tutorial</span>}
                </button>

                <button
                  onClick={() => {
                    openModal(MODAL_TYPE.DEMO_MODAL);
                    if (isMobile) setIsOpen(false);
                  }}
                  onMouseEnter={e => onItemEnter('speak-to-us', e)}
                  onMouseLeave={onItemLeave}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-base-200 transition-colors ${!isOpen && !isMobile ? 'justify-center' : ''}`}
                >
                  <MessageCircleMoreIcon size={16} className="shrink-0" />
                  {(isOpen || isMobile) && <span className="font-medium text-sm truncate">Speak to Us</span>}
                </button>

                <a
                  href="https://gtwy.featurebase.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={e => onItemEnter('feedback', e)}
                  onMouseLeave={onItemLeave}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-base-200 transition-colors ${!isOpen && !isMobile ? 'justify-center' : ''}`}
                  onClick={() => isMobile && setIsOpen(false)}
                >
                  <MessageSquareMoreIcon size={16} className="shrink-0" />
                  {(isOpen || isMobile) && <span className="font-medium text-sm truncate">Feedback</span>}
                </a>
              </div>
            </div>

            {/* User & Settings Section */}
            <div className="border-t border-base-300 p-2">
              <button
                onClick={handleSettingsClick}
                onMouseEnter={e => onItemEnter('settings', e)}
                onMouseLeave={onItemLeave}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-base-200 transition-colors ${!isOpen && !isMobile ? 'justify-center' : ''}`}
              >
                <div className="shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User size={16} className="text-primary-content" />
                </div>
                {(isOpen || isMobile) && (
                  <div className="flex-1 text-left overflow-hidden">
                    <div className="font-medium text-sm truncate">
                      {userdetails?.email?.split('@')[0] || 'User'}
                    </div>
                    <div className="text-xs text-base-content/60">Settings</div>
                  </div>
                )}
                {(isOpen || isMobile) && (
                  <ChevronDown size={16} className={`shrink-0 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} />
                )}
              </button>

              {(isOpen || isMobile) && isSettingsOpen && (
                <div className="mt-2 space-y-1 bg-base-200 rounded-lg p-2">
                  <div className="flex items-center gap-3 p-2 text-sm text-base-content/70">
                    <Mail size={14} className="shrink-0" />
                    <span className="truncate flex-1 text-xs">{userdetails?.email ?? 'user@email.com'}</span>
                  </div>

                  <button
                    onClick={() => {
                      router.push(`/org/${orgId}/userDetails`);
                      if (isMobile) setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-2 rounded hover:bg-base-300 transition-colors text-sm"
                  >
                    <Cog size={14} className="shrink-0" />
                    <span className="truncate text-xs">User Details</span>
                  </button>

                  <button
                    onClick={() => {
                      router.push(`/org/${orgId}/workspaceSetting`);
                      if (isMobile) setIsOpen(false);
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
                {isOpen || isMobile ? (
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
        {hovered && !isOpen && !isMobile && (
          <div
            className="fixed bg-base-300 text-base-content py-2 px-3 rounded-lg shadow-lg whitespace-nowrap border pointer-events-none z-50"
            style={{ top: tooltipPos.top - 20, left: tooltipPos.left }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-base-300 border rotate-45 -left-1 border-r-0 border-b-0" />
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