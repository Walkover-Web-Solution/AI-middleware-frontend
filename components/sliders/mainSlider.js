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
  MessageSquareMoreIcon
} from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { logoutUserFromMsg91 } from '@/config';
import { useCustomSelector } from '@/customHooks/customSelector';
import { truncate } from '@/components/historyPageComponents/assistFile';
import { toggleSidebar, getIconOfService } from '@/utils/utility';
import OrgSlider from './orgSlider';
import TutorialModal from '@/components/modals/tutorialModal';
import DemoModal from '../modals/DemoModal';
import { MODAL_TYPE } from '@/utils/enums';
import Protected from '../protected';

/* -------------------------------------------------------------------------- */
/*                                    Consts                                  */
/* -------------------------------------------------------------------------- */

const ITEM_ICONS = {
  org: <Building2 />,
  agents: <Bot />,
  chatbot: <MessageSquare />,
  pauthkey: <Shield />,
  apikeys: <Database />,
  alerts: <AlertTriangle />,
  invite: <UserPlus />,
  metrics: <BarChart3 />,
  knowledge_base: <BookOpen />,
  feedback: <MessageSquareMore />
}

const NAV_SECTIONS = [
  { items: ['agents'] },
  { title: 'SECURITY & ACCESS', items: ['pauthkey', 'apikeys'] },
  { title: 'MONITORING & SUPPORT', items: ['alerts', 'metrics', 'knowledge_base'] },
  { title: 'TEAM & COLLABORATION', items: ['invite'] }
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
  const [activeModal, setActiveModal] = useState(null);

  /* ------------------------------------------------------------------------ */
  /*                                 Helpers                                  */
  /* ------------------------------------------------------------------------ */

  /** Nice display names for items */
  const displayName = (key) => {
    const names = {
      'knowledge_base': 'Knowledge base',
      'feedback': 'Feedback',
      'home': 'Home',
      'org': 'Organization',
      'current-agent': 'Current Agent',
      'updates-history': 'Updates History',
      'tutorial': 'Tutorial',
      'speak-to-us': 'Speak to Us'
    };
    return names[key] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  /** Modal handlers */
  const openModal = (modalType) => {
    setActiveModal(modalType);
  };

  const closeModal = () => {
    setActiveModal(null);
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
    if (e.detail === 2) {
      setIsOpen(true);
      setHovered(null);
    } else {
      setIsOpen(prev => !prev);
      setHovered(null);
    }
  };

  /** Hover handlers – active only when collapsed */
  const onItemEnter = (key, e) => {
    if (isOpen) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({ top: rect.top + rect.height / 2, left: rect.right + 8 });
    setHovered(key);
  };

  const onItemLeave = () => !isOpen && setHovered(null);

  /* Hide any tooltip the moment we expand */
  useEffect(() => { if (isOpen) setHovered(null); }, [isOpen]);

  /* ------------------------------------------------------------------------ */
  /*                                  Render                                  */
  /* ------------------------------------------------------------------------ */

  const barWidth = isOpen ? 'w-72' : 'w-16';
  const spacerW = isOpen ? '288px' : '64px';
  const activeKey = pathParts[3];          // e.g. 'agents'

  return (
    <div className="relative">
      {/* ------------------------------------------------------------------ */}
      {/*                              SIDE BAR                              */}
      {/* ------------------------------------------------------------------ */}
      <div className={`fixed left-0 top-0 h-screen bg-base-100 border-r transition-all duration-300 z-[100] ${barWidth}`}>

        {/* Toggle button (single / double click) */}
        <button
          onClick={handleToggle}
          className="absolute -right-3 top-6 w-6 h-6 bg-base-100 border border-base-300
                     rounded-full flex items-center justify-center hover:bg-base-200
                     transition-colors z-10 shadow-sm"
        >
          {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* -------------------------- NAVIGATION -------------------------- */}
        <div className="flex flex-col h-full py-4">

          <div className="flex-grow overflow-y-auto px-2">
            {/* ---------- Home ---------- */}
            {pathParts.length > 4 && (
              <div className="mb-4">
                <button
                  onMouseEnter={e => onItemEnter('home', e)}
                  onMouseLeave={onItemLeave}
                  onClick={() => router.push(`/org/${orgId}/agents`)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors"
                >
                  <Home size={20} className="shrink-0" />
                  {isOpen && <span>Home</span>}
                </button>
              </div>
            )}

            {/* ---------- Org ---------- */}
            {pathParts.length >= 4 && (
              <div className="mb-6">
                {pathParts.length > 4 ? (
                  // For length > 4: Show organization button
                  <button
                    onClick={() => toggleSidebar('default-org-sidebar')}
                    onMouseEnter={e => onItemEnter('org', e)}
                    onMouseLeave={onItemLeave}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors"
                  >
                    <Building2 size={20} />
                    {isOpen && <span>{truncate(organizations?.[orgId]?.name ?? 'Organization', 15)}</span>}
                  </button>
                ) : (
                  // For length === 4: Show org name and switch button
                  <>
                    {isOpen && <h3 className="text-2xl font-semibold self-center">{orgName}</h3>}
                    {isOpen && <button
                      onClick={() => {
                        console.log('Switch org button clicked'); // Debug log
                        toggleSidebar('default-org-sidebar');
                      }}
                      onMouseEnter={e => onItemEnter('org', e)}
                      onMouseLeave={onItemLeave}
                      className="font-medium text-primary"
                    >
                      Switch Organization
                    </button>}
                  </>
                )}
              </div>
            )}

            {/* ---------- Section loops ---------- */}
            {NAV_SECTIONS.map(({ title, items }, idx) => (
              <div key={idx} className="mb-6">
                {isOpen && title && (
                  <h3 className="px-3 mb-3 text-xs font-semibold text-base-content/60 uppercase tracking-wider">
                    {title}
                  </h3>
                )}
                <div className="space-y-1">
                  {items.map(key => (
                    <button
                      key={key}
                      onClick={() => router.push(`/org/${orgId}/${key}`)}
                      onMouseEnter={e => onItemEnter(key, e)}
                      onMouseLeave={onItemLeave}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors
                                  ${activeKey === key ? 'bg-primary text-primary-content' : 'hover:bg-base-200'}`}
                    >
                      <div className="shrink-0">{ITEM_ICONS[key]}</div>
                      {isOpen && <span className="font-medium">{displayName(key)}</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* ---------- Agent specific ---------- */}
            {activeKey === 'agents' && pathParts.length === 6 && (
              <div className="border-t pt-4 mb-4">
                <button
                  onClick={() => toggleSidebar('default-agent-sidebar')}
                  onMouseEnter={e => onItemEnter('current-agent', e)}
                  onMouseLeave={onItemLeave}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors"
                >
                  {bridgeData?.service
                    ? getIconOfService(bridgeData.service, 20, 20)
                    : <MessageSquare size={20} />}
                  {isOpen && <span>{truncate(bridgeData?.name ?? 'Current Agent', 15)}</span>}
                </button>

                <button
                  onClick={() => toggleSidebar('default-config-history-slider', 'right')}
                  onMouseEnter={e => onItemEnter('updates-history', e)}
                  onMouseLeave={onItemLeave}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 transition-colors ml-2"
                >
                  <History size={16} />
                  {isOpen && <span className="text-sm">Updates History</span>}
                </button>
              </div>
            )}
          </div>

          {/* ------------------------------------------------------------------ */}
          {/*                    SUPPORT & HELP SECTION                         */}
          {/* ------------------------------------------------------------------ */}
          <div className="border-t border-base-300 pt-4 px-2">
            <div className="space-y-1">
              {/* Tutorial Button */}
              <button
                onClick={() => openModal(MODAL_TYPE.TUTORIAL_MODAL)}
                onMouseEnter={e => onItemEnter('tutorial', e)}
                onMouseLeave={onItemLeave}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors"
              >
                <MonitorPlayIcon size={20} className="shrink-0" />
                {isOpen && <span className="font-medium">Tutorial</span>}
              </button>

              {/* Speak to Us Button */}
              <button
                onClick={() => openModal(MODAL_TYPE.DEMO_MODAL)}
                onMouseEnter={e => onItemEnter('speak-to-us', e)}
                onMouseLeave={onItemLeave}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors"
              >
                <MessageCircleMoreIcon size={20} className="shrink-0" />
                {isOpen && <span className="font-medium">Speak to Us</span>}
              </button>

              {/* Feedback Button */}
              <a
                href="https://gtwy.featurebase.app/"
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={e => onItemEnter('feedback', e)}
                onMouseLeave={onItemLeave}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors"
              >
                <MessageSquareMoreIcon size={20} className="shrink-0" />
                {isOpen && <span className="font-medium">Feedback</span>}
              </a>
            </div>
          </div>

          {/* ------------------------- SETTINGS / BOTTOM ---------------------- */}
          {isOpen && (
            <div className="mt-4 px-2">
              <details className="w-full">
                <summary
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors cursor-pointer list-none"
                >
                  <Settings2 size={20} />
                  <span className="flex-1">Settings</span>
                  <ChevronDown size={16} />
                </summary>
                <div className="mt-2 space-y-1 bg-base-200 rounded-lg p-2">
                  <div className="flex items-center gap-3 p-2 text-sm">
                    <Mail size={16} />
                    <span className="truncate">{userdetails?.email ?? 'user@email.com'}</span>
                  </div>

                  <button
                    onClick={() => router.push(`/org/${orgId}/userDetails`)}
                    className="w-full flex items-center gap-3 p-2 rounded hover:bg-base-300 transition-colors text-sm"
                  >
                    <Cog size={16} />
                    <span>Update User Details</span>
                  </button>

                  <button
                    onClick={() => router.push(`/org/${orgId}/workspaceSetting`)}
                    className="w-full flex items-center gap-3 p-2 rounded hover:bg-base-300 transition-colors text-sm"
                  >
                    <Cog size={16} />
                    <span>Workspace Setting</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-2 rounded hover:bg-base-300 transition-colors text-sm"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
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
      <div className="absolute top-0 left-0 transition-all duration-300" style={{ width: spacerW }} />

      {/* ------------------------------------------------------------------ */}
      {/*                              TOOL‑TIP                              */}
      {/* ------------------------------------------------------------------ */}
      {hovered && !isOpen && (
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
      <TutorialModal onClose={closeModal} />
      <DemoModal speakToUs={true} onClose={closeModal} />
    </div>
  );
}

export default Protected(MainSlider);