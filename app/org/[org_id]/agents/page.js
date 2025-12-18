"use client"
import CreateNewBridge from "@/components/CreateNewBridge";
import CustomTable from "@/components/customTable/CustomTable";
import MainLayout from "@/components/layoutComponents/MainLayout";
import LoadingSpinner from "@/components/LoadingSpinner";
import OnBoarding from "@/components/OnBoarding";
import PageHeader from "@/components/Pageheader";
import Protected from "@/components/Protected";
import TutorialSuggestionToast from "@/components/TutorialSuggestoinToast";
import { useCustomSelector } from "@/customHooks/customSelector";
import OpenAiIcon from "@/icons/OpenAiIcon";
import { archiveBridgeAction, deleteBridgeAction, updateBridgeAction } from "@/store/action/bridgeAction";
import { MODAL_TYPE } from "@/utils/enums";
import useTutorialVideos from "@/hooks/useTutorialVideos";
import { getIconOfService, openModal, closeModal, formatRelativeTime, formatDate } from "@/utils/utility";

import { ClockIcon, EllipsisIcon, RefreshIcon } from "@/components/Icons";
import { useRouter } from 'next/navigation';
import { use, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import usePortalDropdown from "@/customHooks/usePortalDropdown";
import SearchItems from "@/components/UI/SearchItems";
import { ArchiveRestore,ClockFading, Pause, Play, Trash2, Undo2, Users } from "lucide-react";
import AgentEmptyState from "@/components/AgentEmptyState";
import DeleteModal from "@/components/UI/DeleteModal";
import UsageLimitModal from "@/components/modals/UsageLimitModal";
import AccessManagementModal from "@/components/modals/AccessManagementModal";
import useDeleteOperation from "@/customHooks/useDeleteOperation";

export const runtime = 'edge';

const BRIDGE_STATUS = {
  ACTIVE: 1,
  PAUSED: 0
};

// Footer Component
const PoweredByFooter = () => {
  return (
    <footer className="w-full py-4 border-t border-base-300">
      <div className="flex justify-center items-center gap-2  font-medium opacity-50 text-sm text-base-content/70">
        <span>Powered by</span>
        <a 
          href="https://gtwy.ai" 
          target="_blank" 
          rel="noopener noreferrer"
          className="font-semibold text-primary hover:text-primary-focus transition-colors"
        >
          GTWY
        </a>
      </div>
    </footer>
  );
};

function Home({ params, searchParams, isEmbedUser }) {
  // Use the tutorial videos hook
  const { getBridgeCreationVideo } = useTutorialVideos();
  
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  const dispatch = useDispatch();
  const router = useRouter();
  const { allBridges, averageResponseTime, isLoading, isFirstBridgeCreation, descriptions, bridgeStatus, showHistory, isAdminOrOwner, currentOrgRole, currentUser } = useCustomSelector((state) => {
    const orgData = state.bridgeReducer.org[resolvedParams.org_id] || {};
    const user = state.userDetailsReducer.userDetails;
    const orgRole = state?.userDetailsReducer?.organizations?.[resolvedParams.org_id]?.role_name;
    
    // Check if user is admin or owner
    const isAdminOrOwner = orgRole === "Admin" || orgRole === "Owner";
    
    return {
      allBridges: (orgData.orgs || []).slice().reverse(),
      averageResponseTime: orgData.average_response_time || [],
      isLoading: state.bridgeReducer.loading,
      isFirstBridgeCreation: user.meta?.onboarding?.bridgeCreation || "",
      descriptions: state.flowDataReducer.flowData.descriptionsData?.descriptions || {},
      bridgeStatus: state.bridgeReducer.allBridgesMap,
      showHistory: state.appInfoReducer.embedUserDetails?.showHistory || false,
      isAdminOrOwner,
      currentUser: state.userDetailsReducer.userDetails,
      currentOrgRole: orgRole || "Viewer",
    };
  });
  const bridgeTypeFilter = resolvedSearchParams?.type?.toLowerCase() === 'chatbot' ? 'chatbot' : 'api';
  const typeFilteredBridges = useMemo(() => {
    if (!Array.isArray(allBridges)) return [];
    return allBridges.filter((bridge) => {
      const type = bridge?.bridgeType?.toLowerCase?.();
      if (bridgeTypeFilter === 'chatbot') {
        return type === 'chatbot';
      }
      return type !== 'chatbot';
    });
  }, [allBridges, bridgeTypeFilter]);
  const pageHeaderContent = useMemo(() => {
    if (bridgeTypeFilter === 'chatbot') {
      return {
        title: 'Chatbot Agents',
        description: descriptions?.Chatbot || "Design, deploy, and monitor conversational agents tailored for your end users."
      };
    }
    return {
      title: 'API Agents',
      description: descriptions?.Agents || "Build and manage API-powered AI agents for workflows, automations, and integrations."
    };
  }, [bridgeTypeFilter, descriptions]);
  const archivedSectionTitle = bridgeTypeFilter === 'chatbot' ? 'Archived Chatbots' : 'Archived Agents';
  const deletedSectionTitle = bridgeTypeFilter === 'chatbot' ? 'Deleted Chatbots' : 'Deleted Agents';
  const createButtonLabel = bridgeTypeFilter === 'chatbot' ? 'Chatbot Agent' : 'API Agent';
  const [filterBridges, setFilterBridges] = useState(typeFilteredBridges);
  const [loadingAgentId, setLoadingAgentId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [tutorialState, setTutorialState] = useState({
    showSuggestion: isFirstBridgeCreation,
    showTutorial: false
  });
  const [selectedBridgeForLimit, setSelectedBridgeForLimit] = useState(null);
  const [selectedAgentForAccess, setSelectedAgentForAccess] = useState(null);
  
  // Use portal dropdown hook
  const {
    handlePortalOpen,
    handlePortalCloseImmediate,
    PortalDropdown,
    PortalStyles
  } = usePortalDropdown({
    offsetX: -120,  // Better positioning for table dropdowns
    offsetY: 5
  });
  const { isDeleting, executeDelete } = useDeleteOperation();

  useEffect(() => {
    setFilterBridges(typeFilteredBridges)
  }, [typeFilteredBridges]);

  // Reset loading state when component unmounts or navigation completes
  useEffect(() => {
    return () => {
      setLoadingAgentId(null);
    };
  }, [allBridges]);

  // Reset loading state when component unmounts or navigation completes
  useEffect(() => {
    return () => {
      setLoadingAgentId(null);
    };
  }, []);

  
  const filteredArchivedBridges = filterBridges?.filter((item) => item.status === 0 && !item.deletedAt);
  const filteredUnArchivedBridges = filterBridges?.filter((item) => (item.status === 1 || item.status === undefined) && !item.deletedAt);
  const filteredDeletedBridges = filterBridges?.filter((item) => item.deletedAt);

  const UnArchivedBridges = filteredUnArchivedBridges?.filter((item) => item.status === 1 || item.status === undefined).map((item) => ({
    _id: item._id,
    model: item.configuration?.model || "",
    name: <div className="flex gap-3 items-center">
      <div className="flex gap-2 items-center">
        {loadingAgentId === item._id ? (
          <div className="loading loading-spinner loading-sm"></div>
        ) : (
          getIconOfService(item.service, 20, 20)
        )}
      </div>
      <div className="flex-col" title={item.name}>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            {item.name}
            {item.bridge_status === 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20">
                <ClockIcon size={12} />
                <span className="hidden sm:inline">Paused</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>,
    actualName: item?.name || "",
    slugName: item?.slugName || "",
    service: getIconOfService(item.service),
    bridgeType: item.bridgeType,
    status: item.status,
    bridge_status: item.bridge_status,
    versionId: item?.published_version_id || item?.versions?.[0],
    totalTokens: item?.total_tokens ? item?.total_tokens : 0,
    averageResponseTime: averageResponseTime[item?._id] ? averageResponseTime[item?._id] : "Not used in 24h",
    agent_limit: item?.bridge_limit,
    agent_usage: item?.bridge_usage ? parseFloat(item.bridge_usage).toFixed(4) : 0,
    isLoading: loadingAgentId === item._id,
    last_used: <div className="group cursor-help">
                        <span className="group-hover:hidden">
                          {formatRelativeTime(item.last_used || "No records found",)}
                        </span>
                        <span className="hidden group-hover:inline">
                          {formatDate(item.last_used || "No records found",)}
                        </span>
                      </div> ,
    last_used_orignal: item.last_used,
    users:item.users
    
  }));

  const ArchivedBridges = filteredArchivedBridges.filter((item) => item.status === 0).map((item) => ({
    _id: item._id,
    model: item.configuration?.model || "",
    name: <div className="flex gap-3">
      <div className="flex gap-2 items-center">
        {loadingAgentId === item._id ? (
          <div className="loading loading-spinner loading-sm"></div>
        ) : (
          getIconOfService(item.service, 20, 20)
        )}
      </div>
      <div className="flex-col">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={loadingAgentId === item._id ? "opacity-50" : ""}>
              {item.name}
            </span>
            {loadingAgentId === item._id && (
              <span className="text-xs text-primary opacity-70">Loading...</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {item.bridge_status === 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20">
                <ClockIcon size={12} />
                <span className="hidden sm:inline">Paused</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    actualName: item?.name || "",
    slugName: item?.slugName || "",
    service: item.service === 'openai' ? <OpenAiIcon /> : item.service,
    bridgeType: item.bridgeType,
    status: item.status,
    bridge_status: item.bridge_status,
    versionId: item?.published_version_id || item?.versions?.[0],
    totalTokens: item?.total_tokens,
    averageResponseTime: averageResponseTime[item?._id] === 0 ? <div className="text-xs">Not used in 24h</div> : <div className="text-xs">{averageResponseTime[item?._id]} sec</div>,
    isLoading: loadingAgentId === item._id,
    last_used: <div className="group cursor-help">
                        <span className="group-hover:hidden">
                          {formatRelativeTime(item.last_used ? item.last_used : "No records found",)}
                        </span>
                        <span className="hidden group-hover:inline">
                          {formatDate(item.last_used ? item.last_used : "No records found",)}
                        </span>
                      </div> ,
    last_used_orignal: item.last_used,
    agent_usage: item?.bridge_usage ? parseFloat(item.bridge_usage).toFixed(4) : 0,

    }));

  // Helper function to calculate days remaining for deletion (30 days from deletedAt)
  const getDaysRemaining = (deletedAt) => {
    if (!deletedAt) return 0;
    const deletedDate = new Date(deletedAt);
    const expiryDate = new Date(deletedDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from deletion
    const now = new Date();
    const diffTime = expiryDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const DeletedBridges = filteredDeletedBridges?.map((item) => ({
    _id: item._id,
    model: item.configuration?.model || "",
    name: <div className="flex gap-3">
      <div className="flex gap-2 items-center">
        {loadingAgentId === item._id ? (
          <div className="loading loading-spinner loading-sm"></div>
        ) : (
          getIconOfService(item.service, 20, 20)
        )}
      </div>
      <div className="flex-col">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={loadingAgentId === item._id ? "opacity-50" : ""}>
              {item.name}
            </span>
            {loadingAgentId === item._id && (
              <span className="text-xs text-primary opacity-70">Loading...</span>
            )}
          </div>
        </div>
      </div>
    </div>,
    actualName: item?.name || "",
    slugName: item?.slugName || "",
    service: item.service === 'openai' ? <OpenAiIcon /> : item.service,
    bridgeType: item.bridgeType,
    status: item.status,
    deletedAt: item.deletedAt,
    daysRemaining: getDaysRemaining(item.deletedAt),
    versionId: item?.published_version_id || item?.versions?.[0],
    totalTokens: item?.total_tokens,
    averageResponseTime: averageResponseTime[item?._id] === 0 ? <div className="text-xs">Not used in 24h</div> : <div className="text-xs">{averageResponseTime[item?._id]} sec</div>,
    isLoading: loadingAgentId === item._id,
    last_used: item.last_used ? (
      <div className="group cursor-help">
        <span className="group-hover:hidden">
          {formatRelativeTime(item.last_used)}
        </span>
        <span className="hidden group-hover:inline">
          {formatDate(item.last_used)}
        </span>
      </div>
    ) : "No records found",
    last_used_original: item.last_used,
    agent_usage: item?.bridge_usage ? parseFloat(item.bridge_usage).toFixed(4) : 0,

  }));
 
  const onClickConfigure = (id, versionId) => {
    // Prevent multiple clicks while loading
    if (loadingAgentId) return;
    
    setLoadingAgentId(id);
    // Include the type parameter to maintain sidebar selection
    router.push(`/org/${resolvedParams.org_id}/agents/configure/${id}?version=${versionId}&type=${bridgeTypeFilter}`);
  };
  const handlePauseBridge = async (bridgeId) => {
    const newStatus = bridgeStatus[bridgeId]?.bridge_status === BRIDGE_STATUS.PAUSED
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
  };
  const archiveBridge = (bridgeId, newStatus = 0) => {
    try {
      dispatch(archiveBridgeAction(bridgeId, newStatus)).then((bridgeStatus) => {
        if (bridgeStatus === 1) {
          toast.success('Agent Unarchived Successfully');
        } else {
          toast.success('Agent Archived Successfully');
        }
        router.push(`/org/${resolvedParams.org_id}/agents`);
      });
    } catch (error) {
      console.error('Failed to archive/unarchive agents', error);
    }
  }
  
  const handleSetBridgeLimit = (item) => {
    const transformedData = {
      ...item,
      // Map agent_limit (used in table rows) to bridge_limit (used by the modal)
      item_limit: item.agent_limit,
      // Ensure actualName is present for the modal subtitle
      actualName: item.actualName || item.name || "",
    };
    setSelectedBridgeForLimit(transformedData);
    openModal(MODAL_TYPE.API_KEY_LIMIT_MODAL);
  };

  const handleUpdateBridgeLimit = async  (bridge, limit) => {
    closeModal(MODAL_TYPE?.API_KEY_LIMIT_MODAL);
    const dataToSend = {
      "bridge_limit": limit
    }
    const res = await dispatch(updateBridgeAction({ bridgeId: bridge._id, dataToSend }));
    if (res?.success) toast.success('Agent Usage Limit Updated Successfully');
  };

  const resetUsage = async (bridge) => {
    const dataToSend = { "bridge_usage": 0 }
    const res = await dispatch(updateBridgeAction({ bridgeId: bridge._id, dataToSend }));
    if (res?.success) toast.success('Agent Usage Reset Successfully');
  }

  const EndComponent = ({ row }) => {
    const isEditor = ((currentOrgRole === "Editor" && (row.users?.length === 0 || !row.users || (row.users?.length > 0 && row.users?.some(user => user === currentUser.id))))||((currentOrgRole==="Viewer")&&(row.users?.some(user => user === currentUser.id)))||currentOrgRole==="Creator")||isAdminOrOwner;
    const handleDropdownClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const dropdownContent = (
        <ul className="menu bg-base-100 rounded-box w-52 p-2 shadow">
          {!isEmbedUser && (
            <li><a onClick={(e) => {
              e.preventDefault();           
              e.stopPropagation();
              handlePortalCloseImmediate();
              handleSetBridgeLimit(row);
            }}><ClockFading className="" size={16} />Usage Limit</a></li>
          )}
          {!isEmbedUser && (Number(row?.agent_usage) > 0) && (
            <li><a onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handlePortalCloseImmediate();
              resetUsage(row);
            }}><RefreshIcon className="" size={16} />Reset Usage</a></li>
          )}
         
           <li className={`${row.status === 1 ? `hidden` : ''}`}><button onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handlePortalCloseImmediate();
              archiveBridge(row._id, row.status != undefined ? Number(!row?.status) : undefined)
            }}>{(row?.status === 0) ? <><ArchiveRestore size={14} className=" text-green-600" />Un-archive Agent</> : null}</button></li>
          {/* Only show Manage Access button for Admin or Owner roles */}
          {!isEmbedUser && isAdminOrOwner && (
            <li><a onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handlePortalCloseImmediate();
              setSelectedAgentForAccess(row);
              setTimeout(() => {
                openModal(MODAL_TYPE.ACCESS_MANAGEMENT_MODAL);
              }, 10);
            }}><Users size={16}/>Manage Access</a></li>
          )}
            <li> <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePortalCloseImmediate();
                handlePauseBridge(row._id)
              }}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-base-200 flex items-center gap-2`}
            >
              {bridgeStatus[row._id]?.bridge_status === BRIDGE_STATUS.PAUSED ? (
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
            </button></li>
            {/* Only show Delete button for Admin or Owner roles */}
            {isAdminOrOwner && (
              <li><button onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePortalCloseImmediate();
                setItemToDelete(row);
                // Small delay to ensure state is set before opening modal
                setTimeout(() => {
                  openModal(MODAL_TYPE.DELETE_MODAL);
                }, 10);
              }}>
                <Trash2 size={14} className="text-red-600" />
                Delete Agent
              </button></li>
            )} 
        </ul>
      );
      
      handlePortalOpen(e.currentTarget, dropdownContent);
    };

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center mr-4 text-sm">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {(!isEmbedUser || (isEmbedUser && showHistory)) ? (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button className="btn btn-outline btn-ghost btn-sm" onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/org/${resolvedParams.org_id}/agents/history/${row._id}?version=${row?.versionId}`);
            }}>
              History
            </button>
          </div> 
        ) : null}
        </div>
        {isEditor && (
        <div className="bg-transparent">
          <div 
            role="button" 
            className="hover:bg-base-200 rounded-lg p-3 cursor-pointer" 
            onClick={handleDropdownClick}
          >
            <EllipsisIcon className="rotate-90" size={16} />
          </div>
        </div>
        )}
      </div>
      </div>
    )
  }

  const DeletedEndComponent = ({ row }) => {
    return (
      <div className="flex items-center justify-center gap-2">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button 
            className="btn btn-outline btn-ghost btn-sm whitespace-nowrap flex items-center gap-1" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              restoreBridge(row._id)
            }}
          >
            <span className="flex items-center  gap-1">
             <div className="flex text-xs items-center gap-1">
             <Undo2 size={12} />
             </div>
             <div className="text-sm">
             Undo
             </div>
            </span>
          </button>
        </div>
        <div className="text-error font-sm mt-2 text-sm whitespace-nowrap">
          {row.daysRemaining} days left
        </div>
      </div>
    )
  }

  const deleteBridge = async (item, name) => {
    await executeDelete(async () => {
      const bridgeId = item._id;
      const response = await dispatch(deleteBridgeAction({ bridgeId, org_id: resolvedParams.org_id }));
      toast.success(response?.data?.message || response?.message || response || 'Agent deleted successfully');
    });
  }

  const restoreBridge = async (bridgeId) => {
    try {
      const response = await dispatch(deleteBridgeAction({ bridgeId, org_id: resolvedParams.org_id, restore: true }));
      toast.success(response?.data?.message || response?.message || response || 'Agent restored successfully');
    } catch (error) {
      console.error('Failed to restore agent', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to restore agent';
      toast.error(errorMessage);
    }
  }

  return (
    <div className="w-full overflow-x-hidden flex flex-col min-h-screen">
      <div className="w-full max-w-full flex-1">

        {tutorialState?.showSuggestion && <TutorialSuggestionToast setTutorialState={setTutorialState} flagKey={"bridgeCreation"} TutorialDetails={"Agent Creation"} />}
        {tutorialState?.showTutorial && (
          <OnBoarding
            setShowTutorial={() => setTutorialState(prev => ({ ...prev, showTutorial: false }))}
            video={getBridgeCreationVideo()}
            flagKey={"bridgeCreation"}

          />
        )}
        <CreateNewBridge orgid={resolvedParams.org_id} defaultBridgeType={bridgeTypeFilter} />
        {!typeFilteredBridges.length && isLoading && <LoadingSpinner />}
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col items-start justify-start">
          <div className="flex w-full justify-start gap-4 lg:gap-16 items-start">

            <div className="w-full">
              {typeFilteredBridges.length === 0 ? (
                <AgentEmptyState orgid={resolvedParams.org_id} isEmbedUser={isEmbedUser} defaultBridgeType={bridgeTypeFilter} />
              ) : (
                <div className="flex flex-col lg:mx-0">
                  <div className="px-2 pt-4">
                    <MainLayout>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between w-full ">
                        <PageHeader
                          title={pageHeaderContent.title}
                          description={pageHeaderContent.description}
                          docLink="https://gtwy.ai/blogs/features/bridge"
                          isEmbedUser={isEmbedUser}
                        />

                      </div>
                    </MainLayout>

                    <div className="flex flex-row gap-4">
                      {typeFilteredBridges.length > 5 && (
                        <SearchItems data={typeFilteredBridges} setFilterItems={setFilterBridges} item={pageHeaderContent.title} />
                      )}
                      <div className={`${typeFilteredBridges.length > 5 ? 'mr-2' : 'ml-2'}`}>
                        <button className="btn btn-primary btn-sm " onClick={() => openModal(MODAL_TYPE?.CREATE_BRIDGE_MODAL)}>+ Create {createButtonLabel}</button>
                      </div>
                  </div>
                </div>
                
                <div className="w-full overflow-visible">
                  <CustomTable 
                    data={UnArchivedBridges} 
                    columnsToShow={['name', 'model', 'totalTokens', 'agent_usage','last_used']} 
                    sorting 
                    sortingColumns={['name', 'model', 'totalTokens', 'agent_usage','last_used']} 
                    handleRowClick={(props) => onClickConfigure(props?._id, props?.versionId)} 
                    keysToExtractOnRowClick={['_id', 'versionId']} 
                    keysToWrap={['name', 'model']} 
                    endComponent={EndComponent} 
                  />
                </div>
                
                {filteredArchivedBridges?.length > 0 && (
                  <div className="">
                    <div className="flex justify-center items-center my-4">
                      <p className="border-t border-base-300 w-full"></p>
                      <p className="bg-base-300 text-white py-1 px-2 rounded-full mx-4 whitespace-nowrap text-sm">
                        {archivedSectionTitle}
                      </p>
                      <p className="border-t border-base-300 w-full"></p>
                    </div>
                    <div className="opacity-60 overflow-visible">
                      <CustomTable 
                        data={ArchivedBridges} 
                        columnsToShow={['name', 'model', 'totalTokens','agent_usage', 'last_used']} 
                        sorting 
                        sortingColumns={['name', 'model', 'totalTokens', 'agent_usage','last_used']} 
                        handleRowClick={(props) => onClickConfigure(props?._id, props?.versionId)} 
                        keysToExtractOnRowClick={['_id', 'versionId']} 
                        keysToWrap={['name', 'prompt', 'model']} 
                        endComponent={EndComponent} 
                      />
                    </div>
                  </div>
                )}
                
                {filteredDeletedBridges?.length > 0 && (
                  <div className="">
                    <div className="flex justify-center items-center my-4">
                      <p className="border-t border-base-300 w-full"></p>
                      <p className="bg-error text-white py-1 px-2 rounded-full mx-4 whitespace-nowrap text-sm">
                        {deletedSectionTitle}
                      </p>
                      <p className="border-t border-base-300 w-full"></p>
                    </div>
                    <div className="opacity-60 overflow-visible">
                      <CustomTable 
                        data={DeletedBridges} 
                        columnsToShow={['name', 'model', 'totalTokens','agent_usage', 'last_used']} 
                        sorting 
                        sortingColumns={['name', 'model', 'totalTokens','agent_usage','last_used']} 
                        keysToWrap={['name', 'model']} 
                        endComponent={DeletedEndComponent} 
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
          
          {/* Powered By Footer */}
          
        </div>
        
        {/* Single DeleteModal for all delete operations */}
        <DeleteModal onConfirm={deleteBridge} item={itemToDelete} title="Delete Agent" description={`Are you sure you want to delete the Agent "${itemToDelete?.actualName}"? This agent will be moved to deleted items and permanently removed after 30 days.`} loading={isDeleting} isAsync={true} />
      </div>

      {/* Powered By Footer pinned to bottom */}
    {isEmbedUser && <PoweredByFooter />}
      <UsageLimitModal data={selectedBridgeForLimit} onConfirm={handleUpdateBridgeLimit} item="Agent Name" />
      <AccessManagementModal agent={selectedAgentForAccess} />
      
      {/* Portal components from hook */}
      <PortalStyles />
      <PortalDropdown />
      
    </div>
  );
}
export default Protected(Home);
