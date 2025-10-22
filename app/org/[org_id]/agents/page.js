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
import { archiveBridgeAction, updateBridgeAction } from "@/store/action/bridgeAction";
import { MODAL_TYPE, ONBOARDING_VIDEOS } from "@/utils/enums";
import { filterBridges, getIconOfService, openModal, } from "@/utils/utility";
import { ClockIcon, EllipsisIcon } from "@/components/Icons";
import { useRouter } from 'next/navigation';
import { use, useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import SearchItems from "@/components/UI/SearchItems";
import AgentEmptyState from "@/components/AgentEmptyState";
import { Archive, ArchiveRestore, Pause, Play } from "lucide-react";

export const runtime = 'edge';

const BRIDGE_STATUS = {
  ACTIVE: 1,
  PAUSED: 0
};
function Home({ params, isEmbedUser }) {
  const resolvedParams = use(params);
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const router = useRouter();
  const { allBridges, averageResponseTime, isLoading, isFirstBridgeCreation, descriptions, bridgeStatus } = useCustomSelector((state) => {
    const orgData = state.bridgeReducer.org[resolvedParams.org_id] || {};
    const user = state.userDetailsReducer.userDetails
    return {
      allBridges: (orgData.orgs || []).slice().reverse(),
      averageResponseTime: orgData.average_response_time || [],
      isLoading: state.bridgeReducer.loading,
      isFirstBridgeCreation: user.meta?.onboarding?.bridgeCreation || "",
      descriptions: state.flowDataReducer.flowData.descriptionsData?.descriptions||{},
      bridgeStatus: state.bridgeReducer.allBridgesMap,

    };
  });
  const [filterBridges,setFilterBridges]=useState(allBridges);
  const [loadingAgentId, setLoadingAgentId] = useState(null);
  const [tutorialState, setTutorialState] = useState({
    showTutorial: false,
    showSuggestion: isFirstBridgeCreation
  });

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

  
  const filteredArchivedBridges = filterBridges?.filter((item) => item.status === 0);
  const filteredUnArchivedBridges = filterBridges?.filter((item) => item.status === 1 || item.status === undefined);

  const UnArchivedBridges = filteredUnArchivedBridges?.filter((item) => item.status === 1 || item.status === undefined).map((item) => ({
    _id: item._id,
    model: item.configuration?.model || "",
    name: <div className="flex gap-3 items-center">
      <div className="flex gap-2 items-center">
        {loadingAgentId === item._id ? (
          <div className="loading loading-spinner loading-sm"></div>
        ) : (
          getIconOfService(item.service, 30, 30)
        )}
      </div>
      <div className="flex-col" title={item.name}>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            { item.name}
            {item.bridge_status === 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20">
                  <ClockIcon size={12}/>
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
    isLoading: loadingAgentId === item._id
  }));

  const ArchivedBridges = filteredArchivedBridges.filter((item) => item.status === 0).map((item) => ({
    _id: item._id,
    model: item.configuration?.model || "",
    name: <div className="flex gap-3">
      <div className="flex gap-2 items-center">
        {loadingAgentId === item._id ? (
          <div className="loading loading-spinner loading-sm"></div>
        ) : (
          getIconOfService(item.service, 30, 30)
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
            <p className="opacity-60 text-xs">
              {item?.slugName || ""}
            </p>
            {item.bridge_status === 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20">
                  <ClockIcon size={12}/>
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
    isLoading: loadingAgentId === item._id
  }));

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

  const EndComponent = ({ row }) => {
    return (
      <div className="flex items-center">
       <div className="flex items-center gap-2">
      <button className="btn btn-outline btn-ghost btn-sm" onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/org/${resolvedParams.org_id}/agents/history/${row._id}?version=${row?.versionId}`);
      }}>
        History
      </button>
    </div> 
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        </div>
        <div className="dropdown dropdown-left bg-transparent">
          <div tabIndex={0} role="button" className="hover:bg-base-200 rounded-lg p-3" onClick={(e) => e.stopPropagation()}><EllipsisIcon className="rotate-90" size={16} /></div>
          <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-low w-52 p-2 shadow">
            <li><a onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              archiveBridge(row._id, row.status != undefined ? Number(!row?.status) : undefined)
            }}>{(row?.status === 0) ? <><ArchiveRestore size={14} className="mr-2 text-green-600" />Un-archive Agent</> : <><Archive size={14} className="mr-2 text-red-600" />Archive Agent</>}</a></li>
            <li> <button
              onClick={(e) =>{
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
          </ul>
        </div>
      </div>
    )
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus(); // Focus on the input field
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="w-full overflow-x-hidden flex justify-start">
      <div className="w-full max-w-full">
        {tutorialState?.showSuggestion && <TutorialSuggestionToast setTutorialState={setTutorialState} flagKey={"bridgeCreation"} TutorialDetails={"Agent Creation"} />}
        {tutorialState?.showTutorial && (
          <OnBoarding
            setShowTutorial={() => setTutorialState(prev => ({ ...prev, showTutorial: false }))}
            video={ONBOARDING_VIDEOS.bridgeCreation}
            flagKey={"bridgeCreation"}

          />
        )}
        <CreateNewBridge orgid={resolvedParams.org_id}/>
        {!allBridges.length && isLoading && <LoadingSpinner />}
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col items-start justify-start">
          <div className="flex w-full justify-start gap-4 lg:gap-16 items-start">
            <div className="w-full">
            {allBridges.length === 0 ? (
              <AgentEmptyState orgid={resolvedParams.org_id} isEmbedUser={isEmbedUser}/>
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
                  
                  <div className="flex flex-row gap-4 justify-between ">
                    {allBridges.length > 5 && (
                      <SearchItems data={allBridges} setFilterItems={setFilterBridges} item="Agents"/>
                    )}
                    <div className={`${allBridges.length > 5 ? 'mr-2' : 'ml-auto mr-2'}`}>
                        <button className="btn btn-primary " onClick={() => openModal(MODAL_TYPE?.CREATE_BRIDGE_MODAL)}>+ Create New Agent</button>
                      </div>
                  </div>
                </div>
                
                <CustomTable 
                  data={UnArchivedBridges} 
                  columnsToShow={['name', 'model', 'totalTokens', 'averageResponseTime']} 
                  sorting 
                  sortingColumns={['name', 'model', 'totalTokens', 'averageResponseTime']} 
                  handleRowClick={(props) => onClickConfigure(props?._id, props?.versionId)} 
                  keysToExtractOnRowClick={['_id', 'versionId']} 
                  keysToWrap={['name', 'model']} 
                  endComponent={EndComponent} 
                />
                
                {filteredArchivedBridges?.length > 0 && (
                  <div className="">
                    <div className="flex justify-center items-center my-4">
                      <p className="border-t border-base-300 w-full"></p>
                      <p className="bg-base-300 text-white py-1 px-2 rounded-full mx-4 whitespace-nowrap text-sm">
                        Archived Agents
                      </p>
                      <p className="border-t border-base-300 w-full"></p>
                    </div>
                    <div className="opacity-60">
                      <CustomTable 
                        data={ArchivedBridges} 
                        columnsToShow={['name', 'model', 'totalTokens', 'averageResponseTime']} 
                        sorting 
                        sortingColumns={['name', 'model', 'totalTokens', 'averageResponseTime']} 
                        handleRowClick={(props) => onClickConfigure(props?._id, props?.versionId)} 
                        keysToExtractOnRowClick={['_id', 'versionId']} 
                        keysToWrap={['name', 'prompt', 'model']} 
                        endComponent={EndComponent} 
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Protected(Home);