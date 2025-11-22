"use client"
import CreateNewBridge from "@/components/createNewBridge";
import CustomTable from "@/components/customTable/customTable";
import MainLayout from "@/components/layoutComponents/MainLayout";
import LoadingSpinner from "@/components/loadingSpinner";
import OnBoarding from "@/components/OnBoarding";
import PageHeader from "@/components/Pageheader";
import Protected from "@/components/protected";
import TutorialSuggestionToast from "@/components/tutorialSuggestoinToast";
import { useCustomSelector } from "@/customHooks/customSelector";
import OpenAiIcon from "@/icons/OpenAiIcon";
import { archiveBridgeAction, deleteBridgeAction, updateBridgeAction } from "@/store/action/bridgeAction";
import { MODAL_TYPE } from "@/utils/enums";
import useTutorialVideos from "@/hooks/useTutorialVideos";
import { getIconOfService, openModal, closeModal, formatRelativeTime, useOutsideClick, formatDate } from "@/utils/utility";

import { ClockIcon, EllipsisIcon, RefreshIcon } from "@/components/Icons";
import { useRouter } from 'next/navigation';
import { use, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import usePortalDropdown from "@/customHooks/usePortalDropdown";
import SearchItems from "@/components/UI/SearchItems";
import { ClockFading } from "lucide-react";
import AgentEmptyState from "@/components/AgentEmptyState";
import { Archive, ArchiveRestore, Pause, Play, Trash2, Undo2 } from "lucide-react";
import DeleteModal from "@/components/UI/DeleteModal";
import UsageLimitModal from "@/components/modals/UsageLimitModal";
import useDeleteOperation from "@/customHooks/useDeleteOperation";

export const runtime = 'edge';

const BRIDGE_STATUS = {
  ACTIVE: 1,
  PAUSED: 0
};
function Home({ params, isEmbedUser }) {
  // Use the tutorial videos hook
  const { getBridgeCreationVideo } = useTutorialVideos();
  
  const resolvedParams = use(params);
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const router = useRouter();
  const { allBridges, averageResponseTime, isLoading, isFirstBridgeCreation, descriptions, bridgeStatus, showHistory } = useCustomSelector((state) => {
    const orgData = state.bridgeReducer.org[resolvedParams.org_id] || {};
    const user = state.userDetailsReducer.userDetails
    return {
      allBridges: (orgData.orgs || []).slice().reverse(),
      averageResponseTime: orgData.average_response_time || [],
      isLoading: state.bridgeReducer.loading,
      isFirstBridgeCreation: user.meta?.onboarding?.bridgeCreation || "",
      descriptions: state.flowDataReducer.flowData.descriptionsData?.descriptions || {},
      bridgeStatus: state.bridgeReducer.allBridgesMap,
      showHistory: state.appInfoReducer.embedUserDetails?.showHistory || false,
    };
  });
  const [filterBridges, setFilterBridges] = useState(allBridges);
  const [loadingAgentId, setLoadingAgentId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [tutorialState, setTutorialState] = useState({
    showSuggestion: isFirstBridgeCreation,
    showTutorial: false
  });
  const [selectedBridgeForLimit, setSelectedBridgeForLimit] = useState(null);
  
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
    setFilterBridges(allBridges)
  }, [allBridges]);

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

  // Helper function to calculate days remaining for deletion (30 days from deletedAt)
 
  const onClickConfigure = (id, versionId) => {
    // Prevent multiple clicks while loading
    if (loadingAgentId) return;
    
    setLoadingAgentId(id);
    router.push(`/org/${resolvedParams.org_id}/agents/configure/${id}?version=${versionId}`);
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
    setSelectedBridgeForLimit(item);
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
    const handleDropdownClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const dropdownContent = (
        <ul className="menu bg-base-100 rounded-box w-52 p-2 shadow">
          {!isEmbedUser && (
            <li><a onClick={(e) => {
              e.preventDefault();           
              e.stopPropagation();
              handleSetBridgeLimit(row);
            }}><ClockFading className="" size={16} />Usage Limit</a></li>
          )}
          {!isEmbedUser && (Number(row?.agent_usage) > 0) && (
            <li><a onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              resetUsage(row);
            }}><RefreshIcon className="" size={16} />Reset Usage</a></li>
          )}
          <li><button onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              archiveBridge(row._id, row.status != undefined ? Number(!row?.status) : undefined)
            }}>{(row?.status === 0) ? <><ArchiveRestore size={14} className=" text-green-600" />Un-archive Agent</> : <><Archive size={14} className=" text-red-600" />Archive Agent</>}</button></li>
            <li> <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
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
            <li><button onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setItemToDelete(row);
              // Small delay to ensure state is set before opening modal
              setTimeout(() => {
                openModal(MODAL_TYPE.DELETE_MODAL);
              }, 10);
            }}>
              <Trash2 size={14} className="text-red-600" />
              Delete Agent
            </button></li> 
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
        <div className="bg-transparent">
          <div 
            role="button" 
            className="hover:bg-base-200 rounded-lg p-3 cursor-pointer" 
            onClick={handleDropdownClick}
          >
            <EllipsisIcon className="rotate-90" size={16} />
          </div>
        </div>
      </div>
      </div>
    )
  }

  const DeletedEndComponent = ({ row }) => {
    return (
      <div className="flex items-center gap-2">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button 
            className="btn btn-outline btn-ghost btn-xs whitespace-nowrap flex items-center gap-1" 
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
             <div className="text-xs">
             Undo
             </div>
            </span>
          </button>
        </div>
        <div className="text-error font-sm mt-2 text-xs whitespace-nowrap">
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
    <div className="w-full overflow-x-hidden flex justify-start">
      <div className="w-full max-w-full">
        {tutorialState?.showSuggestion && <TutorialSuggestionToast setTutorialState={setTutorialState} flagKey={"bridgeCreation"} TutorialDetails={"Agent Creation"} />}
        {tutorialState?.showTutorial && (
          <OnBoarding
            setShowTutorial={() => setTutorialState(prev => ({ ...prev, showTutorial: false }))}
            video={getBridgeCreationVideo()}
            flagKey={"bridgeCreation"}

          />
        )}
        <CreateNewBridge orgid={resolvedParams.org_id} />
        {!allBridges.length && isLoading && <LoadingSpinner />}
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col items-start justify-start">
          <div className="flex w-full justify-start gap-4 lg:gap-16 items-start">
            <div className="w-full">
              {allBridges.length === 0 ? (
                <AgentEmptyState orgid={resolvedParams.org_id} isEmbedUser={isEmbedUser} />
              ) : (
                <div className="flex flex-col lg:mx-0">
                  <div className="px-2 pt-4">
                    <MainLayout>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between w-full ">
                        <PageHeader
                          title="Agents"
                          description={descriptions?.Agents || "Agents connect your app to AI models like Openai with zero boilerplate, smart prompt handling, and real-time context awareness.Focus on what your agent should do.Agents handle the rest."}
                          docLink="https://gtwy.ai/blogs/features/bridge"
                          isEmbedUser={isEmbedUser}
                        />

                      </div>
                    </MainLayout>

                    <div className="flex flex-row gap-4">
                      {allBridges.length > 5 && (
                        <SearchItems data={allBridges} setFilterItems={setFilterBridges} item="Agents" />
                      )}
                      <div className={`${allBridges.length > 5 ? 'mr-2' : 'ml-2'}`}>
                        <button className="btn btn-primary btn-sm " onClick={() => openModal(MODAL_TYPE?.CREATE_BRIDGE_MODAL)}>+ Create New Agent</button>
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
                        Archived Agents
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
                        Deleted Agents
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
        </div>
        
        {/* Single DeleteModal for all delete operations */}
        <DeleteModal onConfirm={deleteBridge} item={itemToDelete} title="Delete Agent" description={`Are you sure you want to delete the Agent "${itemToDelete?.actualName}"? This agent will be moved to deleted items and permanently removed after 30 days.`} loading={isDeleting} isAsync={true} />
      </div>
      <UsageLimitModal data={selectedBridgeForLimit} onConfirm={handleUpdateBridgeLimit} item="Agent Name" />
      
      {/* Portal components from hook */}
      <PortalStyles />
      <PortalDropdown />
    </div>
  );
}
export default Protected(Home);