'use client'
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FileSliders, TestTube, MessageCircleMore, Pause, Play, ClipboardX, BookCheck, Bot, Building, ChevronRight, MoreVertical, History, Clock, Zap, Home, HistoryIcon, ArchiveRestore, Archive } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeAction, dicardBridgeVersionAction, publishBridgeVersionAction, archiveBridgeAction } from '@/store/action/bridgeAction';
import { updateBridgeVersionReducer } from '@/store/reducer/bridgeReducer';
import { MODAL_TYPE } from '@/utils/enums';
import { openModal, toggleSidebar } from '@/utils/utility';
import { toast } from 'react-toastify';
import OrgSlider from './sliders/orgSlider';
import BridgeSlider from './sliders/bridgeSlider';
import ChatBotSlider from './sliders/chatBotSlider';
import ConfigHistorySlider from './sliders/configHistorySlider';
import Protected from './protected';
import GuideSlider from './sliders/ChatbotConfigSlider';
import { FilterSliderIcon } from './Icons';

const BRIDGE_STATUS = {
  ACTIVE: 1,
  PAUSED: 0
};

const Navbar = ({ isEmbedUser }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showEllipsisMenu, setShowEllipsisMenu] = useState(false);
  const ellipsisMenuRef = useRef(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const versionId = searchParams.get('version');
  const pathParts = pathname.split('?')[0].split('/');
  const orgId = pathParts[2];
  const bridgeId = pathParts[5];
  const dispatch = useDispatch();

  const { organizations, bridgeData, bridge, publishedVersion, isDrafted, bridgeStatus, bridgeType,  isPublishing, isUpdatingBridge, activeTab, isArchived, hideHomeButton, showHistory} = useCustomSelector(state => ({
    organizations: state.userDetailsReducer.organizations,
    bridgeData: state.bridgeReducer.allBridgesMap[bridgeId],
    bridge: state.bridgeReducer.allBridgesMap[bridgeId] || {},
    publishedVersion: state.bridgeReducer.allBridgesMap?.[bridgeId]?.published_version_id ?? null,
    isDrafted: state.bridgeReducer.bridgeVersionMapping?.[bridgeId]?.[versionId]?.is_drafted ?? false,
    bridgeStatus: state.bridgeReducer.allBridgesMap?.[bridgeId]?.bridge_status ?? BRIDGE_STATUS.ACTIVE,
    bridgeType: state.bridgeReducer.allBridgesMap?.[bridgeId]?.bridgeType,
    isArchived: state.bridgeReducer.allBridgesMap?.[bridgeId]?.status ?? false,
    isPublishing: state.bridgeReducer.isPublishing ?? false,
    isUpdatingBridge: state.bridgeReducer.isUpdatingBridge ?? false,
    activeTab: pathname.includes('configure') ? 'configure' : pathname.includes('history') ? 'history' : pathname.includes('testcase') ? 'testcase' : 'configure',
    hideHomeButton:  state.userDetailsReducer?.userDetails?.hideHomeButton || false,
    showHistory:  state.userDetailsReducer?.userDetails?.showHistory,
  }));

  // Define tabs based on user type
  const TABS = useMemo(() => {
    const baseTabs = [
      { id: 'configure', label: 'Configure', icon: FileSliders, shortLabel: 'Config' },
      { id: 'history', label: 'Chat History', icon: MessageCircleMore, shortLabel: 'History' }
    ];

    // Only add test cases for non-embed users
    if (!isEmbedUser) {
      baseTabs.splice(1, 0, { id: 'testcase', label: 'Test Cases', icon: TestTube, shortLabel: 'Tests' });
    }

    return baseTabs;
  }, [isEmbedUser]);

  const agentName = useMemo(() => bridgeData?.name || 'Customer Support AI', [bridgeData?.name]);
  const orgName = useMemo(() => organizations?.[orgId]?.name || 'Acme Corp', [organizations, orgId]);

  const shouldShowNavbar = useCallback(() => {
    const depth = pathParts.length;
    if (depth === 3) return false;
    return ['configure', 'history', 'testcase'].some(seg => pathname.includes(seg));
  }, [pathParts.length, pathname]);

  // Close ellipsis menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ellipsisMenuRef.current && !ellipsisMenuRef.current.contains(event.target)) {
        setShowEllipsisMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll detection
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      setShowEllipsisMenu(false); // Close menu after action
    } catch (err) {
      console.error(err);
      toast.error('Failed to update agent status');
    }
  }, [dispatch, bridgeId, bridgeStatus]);

  const handleDiscardChanges = useCallback(async () => {
    if (!window.confirm('Are you sure you want to discard all changes? This action cannot be undone.')) return;

    try {
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

  const handlePublish = useCallback(async () => {
    if (!isDrafted) {
      toast.info('Nothing to publish');
      return;
    }
    try {
      openModal(MODAL_TYPE?.PUBLISH_BRIDGE_VERSION)
    } catch (err) {
      console.error(err);
      toast.error('Failed to publish version');
    }
  }, [dispatch, isDrafted, bridgeId, versionId]);

  const handleTabChange = useCallback((tabId) => {
    const base = `/org/${orgId}/agents/${tabId}/${bridgeId}`;
    router.push(base + (versionId ? `?version=${versionId}` : ''));
  }, [router, orgId, bridgeId, versionId]);

  const toggleOrgSidebar = useCallback(() => toggleSidebar('default-org-sidebar'), []);
  const toggleBridgeSidebar = useCallback(() => toggleSidebar('default-agent-sidebar'), []);
  const toggleConfigHistorySidebar = () => toggleSidebar("default-config-history-slider", "right");
  const toggleIntegrationGuideSlider = () => toggleSidebar("integration-guide-slider", "right");
  const handleHomeClick = useCallback(() => router.push(`/org/${orgId}/agents`), [router]);

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
      icon: null,
      handleClick: undefined,
      isClickable: false,
      current: true
    }
  ]), [orgName, agentName, toggleOrgSidebar, toggleBridgeSidebar]);

  const StatusIndicator = ({ status }) => (
    status === BRIDGE_STATUS.ACTIVE ? null : (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20">
        <Clock size={12} />
        <span className="hidden sm:inline">Paused</span>
      </div>
    )
  );

  const handleArchiveBridge = (bridgeId, newStatus = 0) => {
    try {
      dispatch(archiveBridgeAction(bridgeId, newStatus)).then((bridgeStatus) => {
        if (bridgeStatus === 1) {
          toast.success('Agent Unarchived Successfully');
        } else {
          toast.success('Agent Archived Successfully');
        }
      });
    } catch (error) {
      console.error('Failed to archive/unarchive agents', error);
    }
  }

  // Ellipsis Menu Component
  const EllipsisMenu = () => (
    <div className="relative" ref={ellipsisMenuRef}>
      <button
        onClick={() => setShowEllipsisMenu(!showEllipsisMenu)}
        className="btn btn-sm p-2 hover:bg-base-200"
        title="More options"
      >
        <MoreVertical size={16} />
      </button>

      {showEllipsisMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-base-100 border border-base-300 rounded-lg shadow-lg z-medium">
          <div className="py-1">
            <button
              onClick={handlePauseBridge}
              disabled={isUpdatingBridge}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-base-200 flex items-center gap-2 ${isUpdatingBridge ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              {bridgeStatus === BRIDGE_STATUS.PAUSED ? (
                <>
                  <Play size={14} className="text-green-600" />
                  Resume Agent
                </>
              ) : (
                <>
                  <Pause size={14} className="text-red-600" />
                  Pause Agent
                </>
              )}
            </button>
          </div>
          <div className="py-1">
            <button
              onClick={() => handleArchiveBridge(bridgeId, isArchived ? 0 : 1)}
              disabled={isUpdatingBridge}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-base-200 flex items-center gap-2 ${isUpdatingBridge ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              {isArchived ? (
                <>
                  <Archive size={14} className="text-green-600" />
                  Archive Agent
                </>
              ) : (
                <>
                  <ArchiveRestore size={14} className="text-red-600" />
                  Unarchive Agent
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (!shouldShowNavbar()) return null;

  return (
    <div className="bg-base-100 z-medium">
      {/* Main navigation header */}
      <div className={`sticky top-0 z-high transition-all duration-300 ${isScrolled
        ? 'bg-base-100/95 backdrop-blur-sm shadow-md border-b border-base-300'
        : 'bg-base-100 shadow-sm border-b border-base-200 '
        }`}>

        {/* Top bar with breadcrumb/home and actions */}
        <div className="flex items-center justify-between px-4 py-3 h-14">
          {/* Left: Breadcrumb or Home */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {(isEmbedUser && !hideHomeButton) && 
              <button
                onClick={handleHomeClick}
                className="btn btn-sm gap-2 hover:bg-base-200"
                title="Go to Home"
              >
                <Home size={16} />
                <span className="hidden sm:inline">Home</span>
              </button>
              }
            {!isEmbedUser &&  <nav className="flex items-center gap-1 min-w-0 flex-1" aria-label="Breadcrumb">
                {breadcrumbItems.map((item, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && (
                      <ChevronRight size={12} className="text-base-content/40 flex-shrink-0" />
                    )}
                    {item.isClickable ? (
                      <button
                        onClick={item.handleClick}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-sm transition-all hover:bg-base-200 text-base-content/70 hover:text-base-content min-w-0"
                      >
                        {item.icon && <item.icon size={14} className="flex-shrink-0" />}
                        <span className="truncate max-w-[100px] sm:max-w-[150px]">
                          {item.label}
                        </span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-primary min-w-0">
                        <span className="truncate font-medium text-sm max-w-[120px] sm:max-w-[200px]" title={item.label}>
                          {item.label}
                        </span>
                      </div>
                    )}
                  </React.Fragment>
                ))}
                {BRIDGE_STATUS?.ACTIVE && <StatusIndicator status={bridgeStatus} />}
              </nav>}
            
            
          </div>

          {/* Right: Action buttons */}
          <div className="flex items-center gap-2">
            {/* Desktop view - show buttons for both users */}
            <div className="hidden md:flex items-center gap-2">
              {!isEmbedUser && activeTab === 'configure' && <button className="btn  btn-sm tooltip tooltip-left" data-tip="Updates History" onClick={toggleConfigHistorySidebar}>
                <HistoryIcon size={16} />
              </button>}
              {/* Discard button */}
              {isDrafted && activeTab === 'configure' && (
                <button
                  className="btn btn-sm bg-red-200 hover:bg-red-300 gap-2"
                  onClick={handleDiscardChanges}
                  disabled={isUpdatingBridge || isPublishing}
                >
                  <ClipboardX size={14} />
                  <span>Discard</span>
                </button>
              )}

              {/* Publish button */}
              {activeTab === 'configure' && (
                <button
                  className={`btn btn-sm   bg-green-200 hover:bg-green-300 gap-2 ${isPublishing ? 'loading' : ''}`}
                  onClick={handlePublish}
                  disabled={!isDrafted || isPublishing}
                >
                  {!isPublishing && <BookCheck size={14} />}
                  <span>{isPublishing ? 'Publishing...' : 'Publish'}</span>
                </button>
              )}
            </div>

            {/* Mobile view - icons only for embed users */}
            <div className="md:hidden flex items-center gap-2">
              {isEmbedUser && activeTab === 'configure' && (
                <>
                  {/* Discard icon - only show if there are drafts */}
                  {isDrafted && (
                    <button
                      className="btn btn-sm flex gap-2 bg-red-200 hover:bg-red-300"
                      onClick={handleDiscardChanges}
                      disabled={isUpdatingBridge || isPublishing}
                      title="Discard changes"
                    >
                      <span><ClipboardX size={16} /></span>
                      <span>Discard</span>
                    </button>
                  )}

                  {/* Publish icon */}
                  <button
                    className={`btn btn-sm bg-green-200 hover:bg-green-300  flex gap-2 ${isPublishing ? 'loading' : ''}`}
                    onClick={handlePublish}
                    disabled={!isDrafted || isPublishing}
                    title={isPublishing ? 'Publishing...' : 'Publish'}
                  >
                    <span>{!isPublishing && <BookCheck size={16} />}</span>
                    <span>{isPublishing ? 'Publishing...' : 'Publish'}</span>
                  </button>
                </>
              )}
            </div>

            <button
              className="btn btn-sm"
              onClick={toggleIntegrationGuideSlider}
            >
            <FilterSliderIcon size={14}/>  Integration Guide
            </button>
            {/* Ellipsis menu - only for normal users */}
            {!isEmbedUser && pathname.includes("configure") && <EllipsisMenu />}
          </div>
        </div>

        {/* Tabs section */}
        {console.log(showHistory, isEmbedUser)}
        {(isEmbedUser && showHistory || !isEmbedUser) && 
        <div className="border-t border-base-200">
          <div className="px-1 h-10">
            <div className="tabs tabs-lifted h-10">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`tab gap-2 h-10 ${activeTab === tab.id
                    ? 'tab-active [--tab-bg:theme(colors.base-200)] [--tab-border-color:theme(colors.base-300)] bg-base-200'
                    : 'hover:bg-base-200/50'
                    }`}
                >
                  <tab.icon size={16} className="flex-shrink-0" />
                  <span className="font-medium">
                    {isMobile ? tab.shortLabel : tab.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>}
      </div>

      {/* Mobile action buttons - only for normal users on configure tab */}
      {isMobile && activeTab === 'configure' && !isEmbedUser && (
        <div className="bg-base-100 border-b border-base-200 p-3">
          <div className="flex gap-2">
            {!isEmbedUser && activeTab === 'configure' && <button className="btn btn-sm m-1 tooltip tooltip-left" data-tip="Updates History" onClick={toggleConfigHistorySidebar}>
              <HistoryIcon size={16} />
            </button>}

            {/* Discard button */}
            {isDrafted && (
              <button
                className="btn btn-sm btn-sm-outline bg-red-200 hover:bg-red-300 flex-1 gap-2"
                onClick={handleDiscardChanges}
                disabled={isUpdatingBridge || isPublishing}
              >
                <ClipboardX size={14} />
                Discard
              </button>
            )}

            {/* Publish button */}
            <button
              className={`btn btn-sm bg-green-200 hover:bg-green-300 flex-1 gap-2 ${isPublishing ? 'loading' : ''}`}
              onClick={handlePublish}
              disabled={!isDrafted || isPublishing}
            >
              {!isPublishing && <BookCheck size={14} />}
              {isPublishing ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>
      )}

      {/* Sliders - only for non-embed users */}
      {!isEmbedUser && (
        <>
          <OrgSlider />
          <BridgeSlider />
          <ChatBotSlider />
          <ConfigHistorySlider versionId={versionId} />
          <GuideSlider params={{ org_id: orgId, id: bridgeId, version:versionId }} bridgeType={bridgeType}/>
        </>
      )}
    </div>
  );
};

export default Protected(Navbar);