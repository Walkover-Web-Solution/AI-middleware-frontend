'use client'
import React, {useState, useEffect, useRef, useCallback, useMemo} from 'react';
import {FileSliders, TestTube, MessageCircleMore, Pause, Play, ClipboardX, BookCheck, Bot, Building, ChevronRight, MoreVertical, History, Clock, Zap} from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useCustomSelector } from '@/customHooks/customSelector';
import {updateBridgeAction, dicardBridgeVersionAction, publishBridgeVersionAction} from '@/store/action/bridgeAction';
import { updateBridgeVersionReducer } from '@/store/reducer/bridgeReducer';
import {MODAL_TYPE} from '@/utils/enums';
import { openModal, toggleSidebar } from '@/utils/utility';
import { toast } from 'react-toastify';
import OrgSlider from './sliders/orgSlider';
import BridgeSlider from './sliders/bridgeSlider';
import ChatBotSlider from './sliders/chatBotSlider';
import ConfigHistorySlider from './sliders/configHistorySlider';


const TABS = [
  { id: 'configure', label: 'Configure', icon: FileSliders, shortLabel: 'Config' },
  { id: 'testcase',  label: 'Test Cases', icon: TestTube,   shortLabel: 'Tests'  },
  { id: 'history',   label: 'Chat History', icon: MessageCircleMore, shortLabel: 'History' }
];

const BRIDGE_STATUS = {
  ACTIVE: 1,
  PAUSED: 0
};


const SimpleNavbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled,     setIsScrolled]     = useState(false);
  const [isMobile,       setIsMobile]       = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef(null);
  const router       = useRouter();
  const pathname     = usePathname();             
  const searchParams = useSearchParams();
  const versionId  = searchParams.get('version'); 
  const pathParts  = pathname.split('?')[0].split('/');
  const orgId      = pathParts[2];                 
  const bridgeId   = pathParts[5];
  const dispatch = useDispatch();
  const {organizations, bridgeData, bridge, publishedVersion, isDrafted, bridgeStatus, isPublishing, isUpdatingBridge, activeTab} = useCustomSelector(state => ({
    organizations   : state.userDetailsReducer.organizations,
    bridgeData      : state.bridgeReducer.allBridgesMap[bridgeId],
    bridge          : state.bridgeReducer.allBridgesMap[bridgeId] || {},
    publishedVersion: state.bridgeReducer.allBridgesMap?.[bridgeId]?.published_version_id ?? null,
    isDrafted       : state.bridgeReducer.bridgeVersionMapping?.[bridgeId]?.[versionId]?.is_drafted ?? false,
    bridgeStatus    : state.bridgeReducer.allBridgesMap?.[bridgeId]?.bridge_status ?? BRIDGE_STATUS.ACTIVE,
    isPublishing    : state.bridgeReducer.isPublishing ?? false,
    isUpdatingBridge: state.bridgeReducer.isUpdatingBridge ?? false,
    activeTab       :pathname.includes('configure') ? 'configure' :pathname.includes('testcase')  ? 'testcase'  :pathname.includes('history')   ? 'history'   :'configure'
  }));

  const agentName = useMemo(() => bridgeData?.name || 'Customer Support AI', [bridgeData?.name]);
  const orgName = useMemo(() => organizations?.[orgId]?.name || 'Acme Corp', [organizations, orgId]);

  const shouldShowNavbar = useCallback(() => {
    const depth = pathParts.length;
    if (depth === 3) return false;
    return ['configure', 'history', 'testcase'].some(seg => pathname.includes(seg));
  }, [pathParts.length, pathname]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Mobile detection */
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /* Close dropdown when clicked outside */
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const handlePauseBridge = useCallback(async () => {
    const newStatus = bridgeStatus === BRIDGE_STATUS.PAUSED
      ? BRIDGE_STATUS.ACTIVE
      : BRIDGE_STATUS.PAUSED;

    try {
      await dispatch(updateBridgeAction({
        bridgeId,
        dataToSend: { bridge_status: newStatus }
      }));
      toast.success(`Agent ${newStatus === BRIDGE_STATUS.ACTIVE ? 'resumed' : 'paused'} successfully`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update agent status');
    }
  }, [dispatch, bridgeId, bridgeStatus]);

  /* Discard drafts */
  const handleDiscardChanges = useCallback(async () => {
    if (!window.confirm('Are you sure you want to discard all changes? This action cannot be undone.')) return;

    try {
      /* optimistic update */
      dispatch(updateBridgeVersionReducer({
        bridges: { ...bridge, _id: versionId, parent_id: bridgeId, is_drafted: false }
      }));
      await dispatch(dicardBridgeVersionAction({ bridgeId, versionId }));
      toast.success('Changes discarded successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to discard changes');
    }
  }, [dispatch, bridge, versionId, bridgeId]);

  /* Publish draft */
  const handlePublish = useCallback(async () => {
    if (!isDrafted) {
      toast.info('Nothing to publish');
      return;
    }
    try {
      await dispatch(publishBridgeVersionAction({ bridgeId, versionId }));
      toast.success('Version published successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to publish version');
    }
  }, [dispatch, isDrafted, bridgeId, versionId]);

  /* Tab switch */
  const handleTabChange = useCallback((tabId) => {
    setShowMobileMenu(false);
    const base = `/org/${orgId}/agents/${tabId}/${bridgeId}`;
    router.push(base + (versionId ? `?version=${versionId}` : ''));
  }, [router, orgId, bridgeId, versionId]);

  /* Sidebar toggles */
  const toggleOrgSidebar          = useCallback(() => toggleSidebar('default-org-sidebar'), []);
  const toggleBridgeSidebar       = useCallback(() => toggleSidebar('default-agent-sidebar'), []);
  const toggleConfigHistorySidebar= useCallback(() => toggleSidebar('default-config-history-slider', 'right'), []);

  const breadcrumbItems = useMemo(() => ([
    {
      label: orgName,
      icon: Building,
      handleClick: toggleOrgSidebar,
      isClickable: true
    },
    {
      label: 'Agents',
      icon: Bot,
      handleClick: toggleBridgeSidebar,
      isClickable: true
    },
    {
      label: agentName,
      icon : null,
      handleClick: undefined,
      isClickable: false,
      current: true
    }
  ]), [orgName, agentName, toggleOrgSidebar, toggleBridgeSidebar]);

  const StatusIndicator = ({ status }) => (
    status === BRIDGE_STATUS.ACTIVE ? null : (
      <div className="flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium bg-warning/20 text-warning border border-warning/30">
        <Clock size={12}/>
        <span>Paused</span>
      </div>
    )
  );

  const DraftBadge = () => (
    !isDrafted ? null : (
      <div className="badge badge-warning gap-2 animate-pulse">
        <Zap size={12}/>
        <span className="hidden sm:inline font-medium">Draft Changes</span>
        <span className="sm:hidden">Draft</span>
      </div>
    )
  );

  if (!shouldShowNavbar()) return null;

  return (
    <div className="bg-base-100">
      {/* Main nav bar */}
      <div className={`navbar sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-base-100/95 backdrop-blur-md shadow-lg border-b border-base-300'
          : 'bg-base-100   shadow-sm  border-b border-base-200'
      }`}>

        {/* Left section */}
        <div className="navbar-start flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-1 px-3">
            <StatusIndicator status={bridgeStatus}/>
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-1 min-w-0 flex-1" aria-label="Breadcrumb">
              {breadcrumbItems.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && (
                    <ChevronRight size={12} className="text-base-content/40 flex-shrink-0 mx-0.5"/>
                  )}
                  {item.isClickable ? (
                    <button
                      onClick={item.handleClick}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-all duration-200 min-w-0 group ${
                        item.current
                          ? 'bg-primary/10 text-primary font-semibold cursor-default'
                          : 'text-base-content/70 hover:text-base-content hover:bg-base-200/70 cursor-pointer hover:scale-105'
                      }`}
                      disabled={item.current}
                    >
                      {item.icon && <item.icon size={14} className="flex-shrink-0 transition-transform group-hover:scale-110"/>}
                      <span className={`truncate ${isMobile ? 'max-w-[60px]' : 'max-w-[100px] sm:max-w-[150px]'} ${item.current ? 'font-semibold' : ''}`}>
                        {item.label}
                      </span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-primary/10 text-primary min-w-0">
                      <span className={`truncate font-semibold ${isMobile ? 'max-w-[80px]' : 'max-w-[120px] sm:max-w-[180px]'}`} title={item.label}>
                        {item.label}
                      </span>
                    </div>
                  )}
                </React.Fragment>
              ))}
             {pathParts.includes('configure') &&  <DraftBadge/>}
            </nav>
          </div>
        </div>

        {/* Right section (desktop) */}
        <div className="navbar-end">
          {!isMobile ? (
            <div className="flex items-center gap-2 px-3">
              {/* Pause / Resume */}
              {pathParts?.includes('configure') && <>
              <button
                className={`btn btn-sm gap-2 transition-all duration-200 hover:scale-105 ${
                  bridgeStatus === BRIDGE_STATUS.PAUSED ? 'btn-success' : 'btn-error'
                } ${isUpdatingBridge ? 'loading' : ''}`}
                onClick={handlePauseBridge}
                disabled={isUpdatingBridge}
              >
                {!isUpdatingBridge && (bridgeStatus === BRIDGE_STATUS.PAUSED ? <Play size={14}/> : <Pause size={14}/>)}
                <span className="hidden lg:inline">{bridgeStatus === BRIDGE_STATUS.PAUSED ? 'Resume' : 'Pause'}</span>
              </button>

              {/* Discard */}
              {isDrafted && (
                <button
                  className="btn btn-sm btn-outline btn-error gap-2 hover:scale-105 transition-all duration-200"
                  onClick={handleDiscardChanges}
                  disabled={isUpdatingBridge || isPublishing}
                >
                  <ClipboardX size={14}/>
                  <span className="hidden lg:inline">Discard</span>
                </button>
              )}

              {/* Publish */}
              <button
                className={`btn btn-sm gap-2 transition-all duration-200 hover:scale-105 btn-success ${
                  isPublishing ? 'loading' : ''
                }`}
                onClick={() => openModal(MODAL_TYPE.PUBLISH_BRIDGE_VERSION)}
                disabled={!isDrafted || isPublishing}
              >
                {!isPublishing && <BookCheck size={14}/>}
                <span className="hidden lg:inline">{isPublishing ? 'Publishing…' : 'Publish'}</span>
              </button></>}

              {/* Tabs */}
              <div className="tabs tabs-boxed bg-base-200/50 backdrop-blur-sm">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`${activeTab === tab.id ? 'tab-active w-32' : 'w-14'} tab gap-2 hover:w-32 transition-all duration-300 overflow-hidden flex flex-col items-center group/tab hover:bg-base-300/50`}
                    title={activeTab !== tab.id ? tab.label : undefined}
                  >
                    <tab.icon size={16} className="shrink-0 transition-transform group-hover/tab:scale-110"/>
                    <span className={`${activeTab === tab.id ? 'opacity-100' : 'opacity-0 group-hover/tab:opacity-100'} transition-opacity duration-300 whitespace-nowrap font-medium text-sm`}>
                      {tab.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* History slider */}
              {/* <button
                className="btn btn-sm btn-ghost gap-2 hover:scale-105 transition-all duration-200"
                onClick={toggleConfigHistorySidebar}
                title="Updates History"
              >
                <History size={16}/>
              </button> */}
            </div>
          ) : (
            /* Mobile menu button */
            <div className="px-3">
              <button
                className="btn btn-square btn-ghost btn-sm"
                onClick={() => setShowMobileMenu(v => !v)}
              >
                <MoreVertical size={18}/>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile controls */}
      {isMobile && (
        <>
          <div className="bg-base-100 border-b border-base-300 shadow-sm">
            {pathParts.includes('configure') && <div className="flex items-center gap-1.5">
              {/* Pause / Resume */}
              <button
                className={`btn gap-2 flex-1 transition-all duration-200 ${
                  bridgeStatus === BRIDGE_STATUS.PAUSED ? 'btn-success' : 'btn-error'
                } ${isUpdatingBridge ? 'loading' : ''}`}
                onClick={handlePauseBridge}
                disabled={isUpdatingBridge}
              >
                {!isUpdatingBridge && (bridgeStatus === BRIDGE_STATUS.PAUSED ? <Play size={14}/> : <Pause size={14}/>)}
                {bridgeStatus === BRIDGE_STATUS.PAUSED ? 'Resume' : 'Pause'}
              </button>

              {/* Discard */}
              {isDrafted && (
                <button
                  className="btn btn-outline btn-error gap-2 flex-1"
                  onClick={handleDiscardChanges}
                  disabled={isUpdatingBridge || isPublishing}
                >
                  <ClipboardX size={14}/>
                  Discard
                </button>
              )}

              {/* Publish */}
              <button
                className={`btn btn-success ${isPublishing ? 'loading' : ''}`}
                onClick={handlePublish}
                disabled={!isDrafted || isPublishing}
              >
                {!isPublishing && <BookCheck size={14}/>}
                {isPublishing ? 'Publishing…' : 'Publish'}
              </button>
            </div>}
          </div>

          <div className="bg-base-100 border-b border-base-300 px-3 py-2">
            <div className="tabs w-full bg-base-200/50">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`tab flex-1 gap-1.5 ${activeTab === tab.id ? 'tab-active' : ''}`}
                >
                  <tab.icon size={14}/>
                  <span className="text-xs font-medium">{tab.shortLabel}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Sliders */}
      <OrgSlider/>
      <BridgeSlider/>
      <ChatBotSlider/>
      <ConfigHistorySlider versionId={versionId}/>
    </div>
  );
};

export default SimpleNavbar;
