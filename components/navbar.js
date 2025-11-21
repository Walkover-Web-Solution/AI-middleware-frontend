'use client'
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { TestTube, MessageCircleMore, Pause, Play, ClipboardX, BookCheck, Bot, Building, ChevronRight, MoreVertical, Clock, Home, HistoryIcon, ArchiveRestore, Archive, Edit2, BotIcon, Variable, ChevronDown, RotateCcw, RefreshCcw } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeAction, dicardBridgeVersionAction, archiveBridgeAction, getBridgeVersionAction } from '@/store/action/bridgeAction';
import { updateBridgeVersionReducer } from '@/store/reducer/bridgeReducer';
import { MODAL_TYPE } from '@/utils/enums';
import { openModal, toggleSidebar, sendDataToParent } from '@/utils/utility';
import { toast } from 'react-toastify';
const ChatBotSlider = dynamic(() => import('./sliders/chatBotSlider'), { ssr: false });
const ConfigHistorySlider = dynamic(() => import('./sliders/configHistorySlider'), { ssr: false });
import Protected from './protected';
const GuideSlider = dynamic(() => import('./sliders/IntegrationGuideSlider'), { ssr: false });
import { FilterSliderIcon } from './Icons';
const DeleteModal = dynamic(() => import('./UI/DeleteModal'), { ssr: false });
import useDeleteOperation from '@/customHooks/useDeleteOperation';
import BridgeVersionDropdown from './configuration/configurationComponent/bridgeVersionDropdown';
const VariableCollectionSlider = dynamic(() => import('./sliders/VariableCollectionSlider'), { ssr: false });

const BRIDGE_STATUS = {
  ACTIVE: 1,
  PAUSED: 0
};

const Navbar = ({ isEmbedUser, params }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showEllipsisMenu, setShowEllipsisMenu] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const { isDeleting: isDiscardingWithHook, executeDelete } = useDeleteOperation();
  const ellipsisMenuRef = useRef(null);

  const router = useRouter();
  const pathname = usePathname();
  const pathParts = pathname.split('?')[0].split('/');
  const orgId = params?.org_id || pathParts[2];
  const bridgeId = params?.id || pathParts[5];
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const versionId = useMemo(() => searchParams?.get('version'), [searchParams]);
  const { organizations, bridgeData, bridge, publishedVersion, isDrafted, bridgeStatus, bridgeType, isPublishing, isUpdatingBridge, activeTab, isArchived, hideHomeButton, showHistory, bridgeName, versionDescription, bridgeVersionsArray, variablesCount } = useCustomSelector(state => {
    return {
    organizations: state.userDetailsReducer.organizations,
    bridgeData: state?.bridgeReducer?.org?.[orgId]?.orgs?.find((bridge) => bridge._id === bridgeId) || {},
    bridge: state.bridgeReducer.allBridgesMap[bridgeId] || {},
    publishedVersion: state.bridgeReducer.allBridgesMap?.[bridgeId]?.published_version_id ?? null,
    isDrafted: state.bridgeReducer.bridgeVersionMapping?.[bridgeId]?.[versionId]?.is_drafted ?? false,
    bridgeStatus: state.bridgeReducer.allBridgesMap?.[bridgeId]?.bridge_status ?? BRIDGE_STATUS.ACTIVE,
    bridgeType: state?.bridgeReducer?.allBridgesMap?.[bridgeId]?.bridgeType,
    isArchived: state.bridgeReducer.allBridgesMap?.[bridgeId]?.status ?? false,
    isPublishing: state.bridgeReducer.isPublishing ?? false,
    isUpdatingBridge: state.bridgeReducer.isUpdatingBridge ?? false,
    activeTab: pathname.includes('configure') ? 'configure' : pathname.includes('history') ? 'history' : pathname.includes('testcase') ? 'testcase' : 'configure',
    hideHomeButton: state.appInfoReducer?.embedUserDetails?.hideHomeButton || false,
    showHistory: state.appInfoReducer?.embedUserDetails?.showHistory,
    bridgeName: state?.bridgeReducer?.allBridgesMap?.[bridgeId]?.name || "",
    versionDescription: state?.bridgeReducer?.bridgeVersionMapping?.[bridgeId]?.[versionId]?.version_description || "",
    bridgeVersionsArray: state?.bridgeReducer?.allBridgesMap?.[bridgeId]?.versions || [],
    variablesCount: Object.keys(state?.variableCollectionReducer?.variableCollections?.[bridgeId] || {}).length || 0,
  }});
  // Define tabs based on user type
  const TABS = useMemo(() => {
    const baseTabs = [
      {
        id: 'configure',
        label: ' Agent Config',
        icon: BotIcon,
        shortLabel: 'Agent Config'
      },
      { id: 'history', label: 'Chat History', icon: MessageCircleMore, shortLabel: 'History' }
    ];
    if (!isEmbedUser) {
      baseTabs.splice(1, 0, { id: 'testcase', label: 'Test Cases', icon: TestTube, shortLabel: 'Tests' });
    }
    return baseTabs;
  }, [isEmbedUser, bridgeType]);

  const agentName = useMemo(() => bridgeName || bridgeData?.name || 'Agent not Found', [bridgeName, bridgeData?.name]);

  // Calculate active tab index for tab switcher animation
  const activeTabIndex = useMemo(() => {
    return TABS.findIndex(tab => tab.id === activeTab);
  }, [TABS, activeTab]);

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
      if (configPublishModalRef.current && !configPublishModalRef.current.contains(event.target)) {
        setShowConfigPublishModal(false);
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

  // Responsive detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Agent name editing functions
  const handleNameEdit = useCallback(() => {
    setIsEditingName(true);
    setEditedName(agentName);
  }, [agentName]);

  const handleNameSave = useCallback(() => {
    const trimmed = editedName.trim();
    if (trimmed === "") {
      toast.error("Agent name cannot be empty");
      setEditedName(agentName);
      return;
    }
    if (trimmed !== agentName) {
      dispatch(updateBridgeAction({
        bridgeId: bridgeId,
        dataToSend: { name: trimmed },
      }));
      isEmbedUser && sendDataToParent("updated", {
        name: trimmed,
        agent_id: bridgeId
      }, "Agent Name Updated");
    }
    setIsEditingName(false);
  }, [editedName, agentName, dispatch, bridgeId, isEmbedUser]);

  const handleNameCancel = useCallback(() => {
    setIsEditingName(false);
    setEditedName(agentName);
  }, [agentName]);

  const handleNameKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNameSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleNameCancel();
    }
  }, [handleNameSave, handleNameCancel]);

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
    await executeDelete(async () => {
      dispatch(updateBridgeVersionReducer({
        bridges: { ...bridge, _id: versionId, parent_id: bridgeId, is_drafted: false }
      }));
      await dispatch(dicardBridgeVersionAction({ bridgeId, versionId }));
      toast.success('Changes discarded successfully');
    });
  }, [executeDelete, dispatch, bridge, searchParams, bridgeId]);

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
  }, [isDrafted]);

  const handleTabChange = useCallback((tabId) => {
    const base = `/org/${orgId}/agents/${tabId}/${bridgeId}`;
    router.push(base + (versionId ? `?version=${versionId}` : ''));
  }, [router, orgId, bridgeId, versionId]);

  const toggleConfigHistorySidebar = useCallback(() => toggleSidebar("default-config-history-slider", "right"), []);
  const toggleIntegrationGuideSlider = useCallback(() => toggleSidebar("integration-guide-slider", "right"), []);
  const handleHomeClick = useCallback(() => router.push(`/org/${orgId}/agents`), [router, orgId]);


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
        className="p-2"
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
        <div className="flex w-full items-center justify-between px-2 sm:px-4 lg:px-6 h-10 min-w-0">
          {/* Left: Agent Name and Versions */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-5 min-w-0 flex-1">
            {(isEmbedUser && !hideHomeButton) &&
              <button
                onClick={handleHomeClick}
                className="btn btn-xs sm:btn-sm gap-1 sm:gap-2 hover:bg-base-200 px-2 sm:px-3"
                title="Go to Home"
              >
                <Home size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline text-xs sm:text-sm">Home</span>
              </button>
            }
            
            {/* Simple Agent Name Display */}
            <div className="flex items-center ml-1 sm:ml-2 lg:ml-0 min-w-0 flex-1">
              <div className="flex items-center px-1 sm:px-2 py-1 sm:py-2 rounded-lg min-w-0 max-w-[120px] sm:max-w-fit cursor-pointer group hover:bg-base-200/50 transition-colors">
                {!isEditingName ? (
                  <div className="flex items-center gap-1.5" onClick={handleNameEdit}>
                    <span 
                      className="font-semibold text-xs text-base-content truncate flex-shrink" 
                      title={`${agentName} - Click to edit`}
                    >
                      {agentName}
                    </span>
                    <Edit2 
                      size={12} 
                      className="text-base-content/40 group-hover:text-base-content/60 transition-colors flex-shrink-0" 
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onBlur={handleNameSave}
                    onKeyDown={handleNameKeyDown}
                    className="input input-xs text-xs text-base-content"
                    autoFocus
                    maxLength={50}
                  />
                )}
              </div>
              
              {/* Divider */}
              <div className="mx-1 sm:mx-2 h-4 w-px bg-base-300 flex-shrink-0"></div>
              
              {/* Bridge Version Dropdown */}
              <div className="flex-shrink-0">
                <BridgeVersionDropdown 
                  params={{ org_id: orgId, id: bridgeId }} 
                  searchParams={searchParams}
                />
              </div>
              
              {/* Status Indicator */}
              {bridgeStatus !== BRIDGE_STATUS.ACTIVE && (
                <div className="flex-shrink-0">
                  <StatusIndicator status={bridgeStatus} />
                </div>
              )}
            </div>
          </div>

          {/* Right: Action buttons */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 flex-shrink-0">
            {/* Navigation Tabs - Fixed Position with Sliding Animation */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {(isEmbedUser && showHistory) || !isEmbedUser ? (
                <div className="relative flex items-center gap-1">
                  {/* Sliding background indicator */}
                  <span
                    className="absolute inset-0 rounded-lg bg-primary shadow-sm transition-all duration-300 ease-in-out"
                    style={{
                      width: `${100 / (TABS.length || 1)}%`,
                      transform: `translateX(${activeTabIndex * 100}%)`,
                    }}
                  />
                  {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`relative z-10 px-2 sm:px-3 h-8 rounded-lg transition-all duration-200 flex items-center gap-1 sm:gap-2 text-xs font-medium whitespace-nowrap ${
                          isActive
                            ? 'text-black hover:text-black/80 bg-primary hover:bg-primary'
                            : 'text-base-content/70 hover:text-black hover:bg-primary/50'
                        }`}
                      >
                        <tab.icon
                          size={14}
                          className={`w-3.5 h-3.5 transition-opacity ${
                            isActive ? 'opacity-100' : 'opacity-60'
                          }`}
                        />
                        <span className="truncate text-xs">
                          {window.innerWidth < 640 ? tab.shortLabel : tab.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                // Invisible placeholder to maintain spacing when tabs are hidden
                <div className="w-32 h-8"></div>
              )}
            </div>
            
            {/* Divider */}
             <div className="h-4 w-px bg-base-300 flex-shrink-0"></div>
            
            {/* Desktop view - show buttons for both users with fixed positioning */}
            <div className="hidden md:flex items-center gap-1 lg:gap-2 flex-shrink-0">
              {/* History button - Fixed Position */}
              <div className="flex items-center">
                {!isEmbedUser && (
                  <button className="tooltip tooltip-left p-1" data-tip="Updates History" onClick={toggleConfigHistorySidebar}>
                    <HistoryIcon size={16} />
                  </button>
                )}
              </div>
              
              {/* Publish/Discard Dropdown - Fixed Position */}
              <div className="flex items-center">
                <div className="dropdown dropdown-end">
                    <div 
                      tabIndex={0} 
                      role="button" 
                      className={`inline-flex items-center justify-center whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-primary/90 rounded-md gap-1 lg:gap-1.5 px-2 lg:px-3 has-[>svg]:px-2 lg:has-[>svg]:px-2.5 h-8 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs shadow-lg shadow-emerald-500/20 transition-all duration-200 font-medium min-w-0 ${isPublishing ? 'loading' : ''}`}
                      disabled={isPublishing}
                    >
                      <span className="text-white text-xs truncate">{isPublishing ? 'Publishing...' : 'Configure and Publish'}</span>
                      {!isPublishing && <ChevronDown size={12} className="text-white" />}
                    </div>
                    <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow border border-base-200">
                      <li>
                        <button
                          onClick={handlePublish}
                          disabled={!isDrafted || isPublishing}
                          className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-base-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <BookCheck size={14} className="text-success" />
                          <span>Configure and Publish</span>
                        </button>
                      </li>
                      {isDrafted && (
                        <li>
                          <button
                            onClick={() => openModal(MODAL_TYPE.DELETE_MODAL)}
                            disabled={isUpdatingBridge || isPublishing}
                            className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-base-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <RefreshCcw size={14} className="text-error" />
                            <span>Revert to Published</span>
                          </button>
                        </li>
                      )}
                    </ul>
                  </div>
              
              </div>
              
              {/* Ellipsis menu - Fixed Position */}
              <div className="flex items-center">
                {!isEmbedUser && (
                  <EllipsisMenu />
                )}
              </div>
            </div>

            {/* Mobile view - compact buttons removed from header for embed users */}
            <div className="md:hidden flex items-center gap-1 flex-shrink-0">
              {/* Ellipsis menu - only for normal users */}
              {!isEmbedUser && pathname.includes("configure") && <EllipsisMenu />}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile action buttons - for both normal and embed users on configure tab */}
      {isMobile && activeTab === 'configure' && (
        <div className=" p-2">
          <div className="flex gap-1 sm:gap-2">
            {!isEmbedUser && <button className="tooltip tooltip-left px-2" data-tip="Updates History" onClick={toggleConfigHistorySidebar}>
              <HistoryIcon size={14} />
            </button>}

            {/* Mobile Publish/Discard Dropdown */}
            <div className="dropdown dropdown-end flex-1">
              <div 
                tabIndex={0} 
                role="button" 
                className={`btn btn-xs bg-success gap-1 w-full rounded-full ${isPublishing ? 'loading' : ''}`}
                disabled={isPublishing}
              >
                {!isPublishing && <BookCheck size={12} className="text-black" />}
                <span className="text-black text-xs">{isPublishing ? 'Publishing...' : 'Configure and Publish'}</span>
                {!isPublishing && <ChevronDown size={10} className="text-black" />}
              </div>
              <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-48 p-2 shadow border border-base-200">
                <li>
                  <button
                    onClick={handlePublish}
                    disabled={!isDrafted || isPublishing}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <BookCheck size={14} className="text-green-600" />
                    <span>Publish</span>
                  </button>
                </li>
                {isDrafted && (
                  <li>
                    <button
                      onClick={() => openModal(MODAL_TYPE.DELETE_MODAL)}
                      disabled={isUpdatingBridge || isPublishing}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ClipboardX size={14} className="text-red-600" />
                      <span>Discard</span>
                    </button>
                  </li>
                )}
              </ul>
            </div>

            {/* Mobile Variables Button */}
           
            {/* {!isEmbedUser && (
              <button
                className="btn btn-xs gap-1 tooltip tooltip-top"
                data-tip="Integration Guide"
                onClick={toggleIntegrationGuideSlider}
              >
                <FilterSliderIcon size={14} />
                <span className="text-xs font-medium whitespace-nowrap">Guide</span>
              </button>
            )} */}
          </div>
        </div>
      )}

      {/* Sliders - only for non-embed users */}
      {!isEmbedUser && (
        <>
          <ChatBotSlider />
          <ConfigHistorySlider versionId={versionId} />
          {/* <GuideSlider params={{ org_id: orgId, id: bridgeId, version:versionId }} bridgeType={bridgeType}/> */}
        </>
      )}

      <VariableCollectionSlider
        params={{ org_id: orgId, id: bridgeId }}
        versionId={versionId}
        isEmbedUser={isEmbedUser}
      />
      
      {/* Modals */}
      <DeleteModal onConfirm={handleDiscardChanges} title="Discard Changes" description={`Are you sure you want to discard the changes? This action cannot be undone.`} buttonTitle="Discard" loading={isDiscardingWithHook} isAsync={true} />
    </div>
  );
};

const MemoNavbar = React.memo(Navbar);

export default Protected(MemoNavbar);
