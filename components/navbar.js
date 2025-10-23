'use client'
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { FileSliders, TestTube, MessageCircleMore, Pause, Play, ClipboardX, BookCheck, Bot, Building, ChevronRight, MoreVertical, History, Clock, Zap, Home, HistoryIcon, ArchiveRestore, Archive, Edit2, ChevronDown } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeAction, dicardBridgeVersionAction, publishBridgeVersionAction, archiveBridgeAction, updateBridgeVersionAction, createBridgeVersionAction, getBridgeVersionAction } from '@/store/action/bridgeAction';
import { updateBridgeVersionReducer } from '@/store/reducer/bridgeReducer';
import { MODAL_TYPE } from '@/utils/enums';
import { closeModal, openModal, toggleSidebar, sendDataToParent } from '@/utils/utility';
import { toast } from 'react-toastify';
const ChatBotSlider = dynamic(() => import('./sliders/chatBotSlider'), { ssr: false });
const ConfigHistorySlider = dynamic(() => import('./sliders/configHistorySlider'), { ssr: false });
import Protected from './protected';
const GuideSlider = dynamic(() => import('./sliders/IntegrationGuideSlider'), { ssr: false });
import { FilterSliderIcon } from './Icons';
const DeleteModal = dynamic(() => import('./UI/DeleteModal'), { ssr: false });
const BridgeVersionDropdown = dynamic(() => import('./configuration/configurationComponent/bridgeVersionDropdown'), { ssr: false });
const VersionDescriptionInput = dynamic(() => import('./configuration/configurationComponent/VersionDescriptionInput'), { ssr: false });

const BRIDGE_STATUS = {
  ACTIVE: 1,
  PAUSED: 0
};

const Navbar = ({ isEmbedUser }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showEllipsisMenu, setShowEllipsisMenu] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const ellipsisMenuRef = useRef(null);

  const router = useRouter();
  const pathname = usePathname();
  const pathParts = pathname.split('?')[0].split('/');
  const orgId = pathParts[2];
  const bridgeId = pathParts[5];
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const { organizations, bridgeData, bridge, publishedVersion, isDrafted, bridgeStatus, bridgeType, isPublishing, isUpdatingBridge, activeTab, isArchived, hideHomeButton, showHistory, bridgeName, versionDescription, bridgeVersionsArray } = useCustomSelector(state => ({
    organizations: state.userDetailsReducer.organizations,
    bridgeData: state?.bridgeReducer?.org?.[orgId]?.orgs?.find((bridge) => bridge._id === bridgeId)||{},
    bridge: state.bridgeReducer.allBridgesMap[bridgeId] || {},
    publishedVersion: state.bridgeReducer.allBridgesMap?.[bridgeId]?.published_version_id ?? null,
    isDrafted: state.bridgeReducer.bridgeVersionMapping?.[bridgeId]?.[searchParams?.get('version')]?.is_drafted ?? false,
    bridgeStatus: state.bridgeReducer.allBridgesMap?.[bridgeId]?.bridge_status ?? BRIDGE_STATUS.ACTIVE,
    bridgeType: state?.bridgeReducer?.allBridgesMap?.[bridgeId]?.bridgeType,
    isArchived: state.bridgeReducer.allBridgesMap?.[bridgeId]?.status ?? false,
    isPublishing: state.bridgeReducer.isPublishing ?? false,
    isUpdatingBridge: state.bridgeReducer.isUpdatingBridge ?? false,
    activeTab: pathname.includes('configure') ? 'configure' : pathname.includes('history') ? 'history' : pathname.includes('testcase') ? 'testcase' : 'configure',
    hideHomeButton:  state.userDetailsReducer?.userDetails?.hideHomeButton || false,
    showHistory:  state.userDetailsReducer?.userDetails?.showHistory,
    bridgeName: state?.bridgeReducer?.allBridgesMap?.[bridgeId]?.name || "",
    versionDescription: state?.bridgeReducer?.bridgeVersionMapping?.[bridgeId]?.[searchParams?.get('version')]?.version_description || "",
    bridgeVersionsArray: state?.bridgeReducer?.allBridgesMap?.[bridgeId]?.versions || [],
  }));
  // Define tabs based on user type
  const TABS = useMemo(() => {
    const baseTabs = [
      { id: 'configure', label: 'Configure', icon: FileSliders, shortLabel: 'Config' },
      { id: 'history', label: 'Chat History', icon: MessageCircleMore, shortLabel: 'History' }
    ];
    if (!isEmbedUser) {
      baseTabs.splice(1, 0, { id: 'testcase', label: 'Test Cases', icon: TestTube, shortLabel: 'Tests' });
    }
    return baseTabs;
  }, [isEmbedUser]);

  const agentName = useMemo(() => bridgeName || bridgeData?.name || 'Agent not Found', [bridgeName, bridgeData?.name]);
  const orgName = useMemo(() => organizations?.[orgId]?.name || 'Organization not Found', [organizations, orgId]);

  // Create compatible searchParams object for prebuilt components
  const compatibleSearchParams = useMemo(() => ({
    version: searchParams?.get('version')
  }), [searchParams]);

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
    try {
      dispatch(updateBridgeVersionReducer({
        bridges: { ...bridge, _id: searchParams?.get('version'), parent_id: bridgeId, is_drafted: false }
      }));
      await dispatch(dicardBridgeVersionAction({ bridgeId, versionId: searchParams?.get('version') }));
      toast.success('Changes discarded successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to discard changes');
    }
    finally{
      closeModal(MODAL_TYPE.DELETE_MODAL);
    }
  }, [dispatch, bridge, searchParams?.get('version'), bridgeId]);

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
  }, [dispatch, isDrafted, bridgeId, searchParams?.get('version')]);

  const handleTabChange = useCallback((tabId) => {
    const base = `/org/${orgId}/agents/${tabId}/${bridgeId}`;
    const version = searchParams?.get('version');
    router.push(base + (version ? `?version=${version}` : ''));
  }, [router, orgId, bridgeId, searchParams]);

  const toggleOrgSidebar = useCallback(() => router.push(`/org?redirection=false`), [router]);
  const toggleBridgeSidebar = useCallback(() => router.push(`/org/${orgId}/agents`), [router, orgId]);
  const toggleConfigHistorySidebar = useCallback(() => toggleSidebar("default-config-history-slider", "right"), []);
  const toggleIntegrationGuideSlider = useCallback(() => toggleSidebar("integration-guide-slider", "right"), []);
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
      handleClick: handleNameEdit,
      current: true,
      editable: true
    }
  ]), [orgName, agentName, toggleOrgSidebar, toggleBridgeSidebar, handleNameEdit]);

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
            {!isEmbedUser &&  <nav className="flex items-center ml-6 lg:ml-0 md:ml-0 xl:ml-0 gap-1 min-w-0 flex-1" aria-label="Breadcrumb">
                {breadcrumbItems.map((item, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && (
                      <ChevronRight size={12} className="text-base-content/40 flex-shrink-0" />
                    )}
                    {item.editable ? (
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-primary min-w-0">
                        {!isEditingName ? (
                          <div className="flex items-center gap-2">
                            <span className="truncate font-medium text-sm max-w-[120px] sm:max-w-[200px]" title={item.label}>
                              {item.label}
                            </span>
                            <button
                              onClick={item.handleClick}
                              className="btn btn-xs btn-ghost hover:bg-primary/20 p-1 min-h-0 h-6 w-6 rounded"
                              title="Edit agent name"
                            >
                              <Edit2 size={12} className="text-primary" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editedName}
                              onChange={(e) => setEditedName(e.target.value)}
                              onBlur={handleNameSave}
                              onKeyDown={handleNameKeyDown}
                              className="bg-transparent border-none outline-none font-medium text-sm max-w-[120px] sm:max-w-[200px]"
                              autoFocus
                            />
                            <div className="flex items-center gap-1">
                              <button
                                onClick={handleNameSave}
                                className="btn btn-xs btn-ghost hover:bg-green-200 p-1 min-h-0 h-6 w-6 rounded"
                                title="Save changes"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                                  <polyline points="20,6 9,17 4,12"></polyline>
                                </svg>
                              </button>
                              <button
                                onClick={handleNameCancel}
                                className="btn btn-xs btn-ghost hover:bg-red-200 p-1 min-h-0 h-6 w-6 rounded"
                                title="Cancel editing"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : item.isClickable ? (
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
                      <span className="truncate font-medium text-sm max-w-[120px] sm:max-w-[200px]" title={item.label}>
                        {item.label}
                      </span>
                    )}
                  </React.Fragment>
                ))}
                {BRIDGE_STATUS?.ACTIVE && <StatusIndicator status={bridgeStatus} />}
              </nav>}
            
            {/* Version Controls - show on configure tab for non-embed users */}
            {activeTab === 'configure' && bridgeId && (
              <div className="flex items-center gap-2 mx-4">
                <BridgeVersionDropdown 
                  params={{ org_id: orgId, id: bridgeId }} 
                  searchParams={compatibleSearchParams} 
                  isEmbedUser={isEmbedUser} 
                />
                <div className="flex-1 max-w-xs">
                  <VersionDescriptionInput 
                    params={{ org_id: orgId, id: bridgeId }} 
                    searchParams={compatibleSearchParams} 
                    isEmbedUser={isEmbedUser} 
                  />
                </div>
              </div>
            )}
            
            
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
                  className="btn btn-sm bg-red-200 hover:bg-red-300 gap-2 text-base-content"
                  onClick={() => openModal(MODAL_TYPE.DELETE_MODAL)}
                  disabled={isUpdatingBridge || isPublishing}
                >
                  <ClipboardX size={14} className='text-black'/>
                  <span className="text-black">Discard</span>
                </button>
              )}

              {/* Publish button */}
              {activeTab === 'configure' && (
                <button
                  className={`btn btn-sm   bg-green-200 hover:bg-green-300 gap-2 ${isPublishing ? 'loading' : ''}`}
                  onClick={handlePublish}
                  disabled={!isDrafted || isPublishing}
                >
                  {!isPublishing && <BookCheck size={14} className="text-black" />}
                  <span className="text-black">{isPublishing ? 'Publishing...' : 'Publish'}</span>
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
                      className="btn btn-sm flex gap-2 bg-red-200 hover:bg-red-300 text-base-content"
                      onClick={() => openModal(MODAL_TYPE.DELETE_MODAL)}
                      disabled={isUpdatingBridge || isPublishing}
                      title="Discard changes"
                    >
                      <span className="text-black"><ClipboardX size={16} className='text-black'/></span>
                      <span className="text-black">Discard</span>
                    </button>
                  )}

                  {/* Publish icon */}
                  <button
                    className={`btn btn-sm bg-green-200 hover:bg-green-300  flex gap-2 ${isPublishing ? 'loading' : ''}`}
                    onClick={handlePublish}
                    disabled={!isDrafted || isPublishing}
                    title={isPublishing ? 'Publishing...' : 'Publish'}
                  >
                    <span className="text-black">{!isPublishing && <BookCheck size={16} className='text-black'/>}</span>
                    <span className="text-black">{isPublishing ? 'Publishing...' : 'Publish'}</span>
                  </button>
                </>
              )}
            </div>

            {!isEmbedUser && <button
              className={`btn btn-sm ${isMobile ? "flex-row" : "flex-col"} items-center gap-2`}
              onClick={toggleIntegrationGuideSlider}
            >
              <FilterSliderIcon size={14}/>
              {isMobile ? null : <span className="hidden sm:block">Integration Guide</span>}
            </button>}
            {/* Ellipsis menu - only for normal users */}
            {!isEmbedUser && pathname.includes("configure") && <EllipsisMenu />}
          </div>
        </div>

        {/* Tabs section */}
        {(isEmbedUser && showHistory || !isEmbedUser) && 
        <div className="border-t border-base-200">
          <div className="px-1 h-10">
            <div className="tabs tabs-lifted h-10">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`tab gap-2 h-[42px] ${activeTab === tab.id
                    ? 'tab-active [--tab-bg:theme(colors.base-300)] [--tab-border-color:theme(colors.base-300)] bg-base-300'
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
                onClick={() => openModal(MODAL_TYPE.DELETE_MODAL)}
                disabled={isUpdatingBridge || isPublishing}
              >
                <ClipboardX size={14} className='text-black' />
                <span className="text-black">Discard</span>
              </button>
            )}

            {/* Publish button */}
            <button
              className={`btn btn-sm bg-green-200 hover:bg-green-300 flex-1 gap-2 ${isPublishing ? 'loading' : ''}`}
              onClick={handlePublish}
              disabled={!isDrafted || isPublishing}
            >
              {!isPublishing && <BookCheck size={14} className='text-black' />}
              <span className="text-black">{isPublishing ? 'Publishing...' : 'Publish'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Sliders - only for non-embed users */}
      {!isEmbedUser && (
        <>
          <ChatBotSlider />
          <ConfigHistorySlider versionId={searchParams?.get('version')} />
          <GuideSlider params={{ org_id: orgId, id: bridgeId, version:searchParams?.get('version') }} bridgeType={bridgeType}/>
        </>
      )}
      
      {/* Modals */}
      <DeleteModal onConfirm={handleDiscardChanges} title="Discard Changes" description={`Are you sure you want to discard the changes? This action cannot be undone.`} buttonTitle="Discard"/>
    </div>
  );
};

const MemoNavbar = React.memo(Navbar);

export default Protected(MemoNavbar);