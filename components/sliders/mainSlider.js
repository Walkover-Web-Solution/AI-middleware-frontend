'use client'
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  MouseEvent as ReactMouseEvent,
  useMemo
} from 'react';
import {
  AlignJustify, BookOpen, MessageSquare, Building2, ChevronDown,
  Cog, Database, Shield, BarChart3, LogOut, Mail, MessageSquareMore,
  Users, Settings2, AlertTriangle, UserPlus, Home, History, Rss,
  ChevronRight, ChevronLeft,
  Bot,
  MonitorPlayIcon,
  MessageCircleMoreIcon,
  MessageSquareMoreIcon,
  Blocks
} from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { logoutUserFromMsg91 } from '@/config';
import { useCustomSelector } from '@/customHooks/customSelector';
import { truncate } from '@/components/historyPageComponents/assistFile';
import { toggleSidebar, getIconOfService, openModal } from '@/utils/utility';
import OrgSlider from './orgSlider';
import TutorialModal from '@/components/modals/tutorialModal';
import DemoModal from '../modals/DemoModal';
import { MODAL_TYPE } from '@/utils/enums';
import Protected from '../protected';

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
}

const NAV_SECTIONS = [
  { items: ['agents'] },
  { title: 'SECURITY & ACCESS', items: ['pauthkey', 'apikeys'] },
  { title: 'MONITORING & SUPPORT', items: ['alerts', 'metrics', 'knowledge_base'] },
  { title: 'TEAM & COLLABORATION', items: ['invite'] },
  { title: 'INTEGRATION', items: ['integration'] },
];

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

  const { userdetails, organizations, bridgeData, chatbotData } = useCustomSelector(
    state => ({
      userdetails: state.userDetailsReducer.userDetails,
      organizations: state.userDetailsReducer.organizations,
      bridgeData: state.bridgeReducer.allBridgesMap[bridgeId],
      chatbotData: state.ChatBot.ChatBotMap[bridgeId]
    })
  );

  const orgName = useMemo(() => organizations?.[orgId]?.name || 'Organization', [organizations, orgId]);

  /* ------------------------------- UI state ------------------------------- */
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [isMobile, setIsMobile] = useState(false);

  /* --------------------------- Responsive logic --------------------------- */
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-collapse on mobile
      if (mobile && isOpen) {
        setIsOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [isOpen]);

  /* ------------------------------------------------------------------------ */
  /*                                 Helpers                                  */
  /* ------------------------------------------------------------------------ */

  /** Nice display names for items */
  const displayName = (key) => {
    const names = {
      'knowledge_base': 'Knowledge base',
      'feedback': 'Feedback',
      'tutorial': 'Tutorial',
      'speak-to-us': 'Speak to Us',
      'integration': 'Integration'
    };
    return names[key] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  /** Logout */
  const handleLogout = useCallback(async () => {
    try {
      await logoutUserFromMsg91({
        headers: { proxy_auth_token: localStorage.getItem('proxy_token') ?? '' }
      });
      localStorage.clear();
      sessionStorage.clear();
      router.replace('/');
    } catch (e) {
      console.error(e);
    }
  }, [router]);

  /** Single‑click toggles; double‑click always fully opens */
  const handleToggle = (e) => {
    if (e.detail === 2 && !isMobile) {
      setIsOpen(true);
      setHovered(null);
    } else {
      setIsOpen(prev => !prev);
      setHovered(null);
    }
  };

  /** Hover handlers – active only when collapsed and not on mobile */
  const onItemEnter = (key, e) => {
    if (isOpen || isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({ top: rect.top + rect.height / 2, left: rect.right + 8 });
    setHovered(key);
  };

  const onItemLeave = () => !isOpen && !isMobile && setHovered(null);

  /* Hide any tooltip the moment we expand */
  useEffect(() => { if (isOpen) setHovered(null); }, [isOpen]);

  // Close sidebar when clicking outside on mobile
  const handleBackdropClick = () => {
    if (isMobile && isOpen) {
      setIsOpen(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /*                                  Render                                  */
  /* ------------------------------------------------------------------------ */

  const barWidth = isOpen ? (isMobile ? 'w-80' : 'w-72') : 'w-16';
  const spacerW = isMobile ? '0px' : (isOpen ? '288px' : '64px');
  const activeKey = pathParts[3];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[90] lg:hidden"
          onClick={handleBackdropClick}
        />
      )}

      <div className="relative">
        {/* ------------------------------------------------------------------ */}
        {/*                              SIDE BAR                              */}
        {/* ------------------------------------------------------------------ */}
        <div className={`
          fixed left-0 top-0 h-screen bg-base-100 border-r transition-all duration-300 z-[100]
          ${barWidth}
          ${isMobile ? 'shadow-xl' : ''}
          flex flex-col
        `}>
          {/* Toggle button */}
          <button
            onClick={handleToggle}
            className={`
              absolute -right-3 top-10 w-8 h-8 bg-base-100 border border-base-300
              rounded-full flex items-center justify-center hover:bg-base-200
              transition-colors z-10 shadow-sm
              ${isMobile ? 'hidden' : ''}
            `}
          >
            {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>

          {/* Mobile close button */}
          {isMobile && isOpen && (
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 w-8 h-8 bg-base-200 rounded-full 
                         flex items-center justify-center hover:bg-base-300 transition-colors z-10"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          {/* -------------------------- NAVIGATION -------------------------- */}
          <div className="flex flex-col h-full">
            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden py-4">
              <div className="px-2 space-y-4">
                {/* ---------- Org ---------- */}
                {pathParts.length >= 4 && (
                  <div>
                    <button
                      onClick={() => {
                        toggleSidebar('default-org-sidebar');
                        if (isMobile) setIsOpen(false);
                      }}
                      onMouseEnter={e => onItemEnter('org', e)}
                      onMouseLeave={onItemLeave}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors"
                    >
                      <Building2 size={16} className="shrink-0" />
                      {isOpen && (
                        <span className="truncate">
                          {truncate(organizations?.[orgId]?.name ?? 'Organization', isMobile ? 20 : 15)}
                        </span>
                      )}
                    </button>
                  </div>
                )}

                {/* ---------- Section loops ---------- */}
                {NAV_SECTIONS.map(({ title, items }, idx) => (
                  <div key={idx}>
                    {isOpen && title && (
                      <h3 className="px-3 mb-2 text-xs font-semibold text-base-content/60 uppercase tracking-wider">
                        {title}
                      </h3>
                    )}
                    <div className="space-y-1">
                      {items.map(key => (
                        <button
                          key={key}
                          onClick={() => {
                            router.push(`/org/${orgId}/${key}`);
                            if (isMobile) setIsOpen(false);
                          }}
                          onMouseEnter={e => onItemEnter(key, e)}
                          onMouseLeave={onItemLeave}
                          className={`btn btn-ghost btn-sm flex items-center justify-start gap-2 w-full
                                      ${activeKey === key ? 'bg-primary text-primary-content' : 'hover:bg-base-200'}`}
                        >
                          <div className="shrink-0">{ITEM_ICONS[key]}</div>
                          {isOpen && <span className="font-medium truncate">{displayName(key)}</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ------------------------------------------------------------------ */}
            {/*                    SUPPORT & HELP SECTION                         */}
            {/* ------------------------------------------------------------------ */}
            <div className="border-t border-base-300 pt-4 px-2 pb-2">
              <div className="space-y-1">
                <button
                  onClick={() => {
                    openModal(MODAL_TYPE.TUTORIAL_MODAL);
                    if (isMobile) setIsOpen(false);
                  }}
                  onMouseEnter={e => onItemEnter('tutorial', e)}
                  onMouseLeave={onItemLeave}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors"
                >
                  <MonitorPlayIcon size={16} className="shrink-0" />
                  {isOpen && <span className="font-medium truncate">Tutorial</span>}
                </button>

                <button
                  onClick={() => {
                    openModal(MODAL_TYPE.DEMO_MODAL);
                    if (isMobile) setIsOpen(false);
                  }}
                  onMouseEnter={e => onItemEnter('speak-to-us', e)}
                  onMouseLeave={onItemLeave}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors"
                >
                  <MessageCircleMoreIcon size={16} className="shrink-0" />
                  {isOpen && <span className="font-medium truncate">Speak to Us</span>}
                </button>

                <a
                  href="https://gtwy.featurebase.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={e => onItemEnter('feedback', e)}
                  onMouseLeave={onItemLeave}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors"
                  onClick={() => isMobile && setIsOpen(false)}
                >
                  <MessageSquareMoreIcon size={16} className="shrink-0" />
                  {isOpen && <span className="font-medium truncate">Feedback</span>}
                </a>
              </div>
            </div>

            {/* ------------------------- SETTINGS / BOTTOM ---------------------- */}
            {isOpen && (
              <div className="border-t border-base-300 pt-4 px-2 pb-4">
                <details className="w-full">
                  <summary className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors cursor-pointer list-none">
                    <Settings2 size={16} className="shrink-0" />
                    <span className="flex-1 truncate">Settings</span>
                    <ChevronDown size={16} className="shrink-0" />
                  </summary>
                  <div className="mt-2 space-y-1 bg-base-200 rounded-lg p-2">
                    <div className="flex items-center gap-3 p-2 text-sm">
                      <Mail size={16} className="shrink-0" />
                      <span className="truncate flex-1">{userdetails?.email ?? 'user@email.com'}</span>
                    </div>

                    <button
                      onClick={() => {
                        router.push(`/org/${orgId}/userDetails`);
                        if (isMobile) setIsOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded hover:bg-base-300 transition-colors text-sm"
                    >
                      <Cog size={16} className="shrink-0" />
                      <span className="truncate">Update User Details</span>
                    </button>

                    <button
                      onClick={() => {
                        router.push(`/org/${orgId}/workspaceSetting`);
                        if (isMobile) setIsOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded hover:bg-base-300 transition-colors text-sm"
                    >
                      <Cog size={16} className="shrink-0" />
                      <span className="truncate">Workspace Setting</span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 p-2 rounded hover:bg-base-300 transition-colors text-sm"
                    >
                      <LogOut size={16} className="shrink-0" />
                      <span className="truncate">Logout</span>
                    </button>
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/*                         CONTENT SPACER                             */}
        {/* ------------------------------------------------------------------ */}
        <div
          className="absolute top-0 left-0 transition-all duration-300 hidden lg:block"
          style={{ width: spacerW }}
        />

        {/* ------------------------------------------------------------------ */}
        {/*                              TOOL‑TIP                              */}
        {/* ------------------------------------------------------------------ */}
        {hovered && !isOpen && !isMobile && (
          <div
            className="fixed z-[200] bg-base-300 text-base-content px-3 py-2 rounded-lg
                       shadow-lg whitespace-nowrap border pointer-events-none"
            style={{ top: tooltipPos.top - 20, left: tooltipPos.left }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-base-300 border
                            rotate-45 -left-1 border-r-0 border-b-0"/>
            {displayName(hovered)}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/*                               MODALS                               */}
        {/* ------------------------------------------------------------------ */}
        <OrgSlider />
        <TutorialModal />
        <DemoModal speakToUs={true} />
      </div>
    </>
  );
}

export default Protected(MainSlider);