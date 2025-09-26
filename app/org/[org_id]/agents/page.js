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
import { filterBridges, getIconOfService, openModal, closeModal } from "@/utils/utility";
import { ClockIcon, EllipsisIcon, RefreshIcon } from "@/components/Icons";
import { useRouter } from 'next/navigation';
import { use, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import SearchItems from "@/components/UI/SearchItems";
import ApiKeyLimitModal from "@/components/modals/ApiKeyLimitModal";
import { ArchiveIcon, ClockFading, ScaleIcon } from "lucide-react";

export const runtime = 'edge';

function Home({ params, isEmbedUser }) {
  const resolvedParams = use(params);
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const router = useRouter();
  const { allBridges, averageResponseTime, isLoading, isFirstBridgeCreation } = useCustomSelector((state) => {
    const orgData = state.bridgeReducer.org[resolvedParams.org_id] || {};
    const user = state.userDetailsReducer.userDetails
    return {
      allBridges: (orgData.orgs || []).slice().reverse(),
      averageResponseTime: orgData.average_response_time || [],
      isLoading: state.bridgeReducer.loading,
      isFirstBridgeCreation: user.meta?.onboarding?.bridgeCreation || "",
    };
  });
  const [filterBridges,setFilterBridges]=useState(allBridges);
  const [tutorialState, setTutorialState] = useState({
    showTutorial: false,
    showSuggestion: isFirstBridgeCreation
  });
  const [selectedBridgeForLimit, setSelectedBridgeForLimit] = useState(null);

  useEffect(() => {
    setFilterBridges(allBridges)
  }, []);

  
  const filteredArchivedBridges = filterBridges?.filter((item) => item.status === 0);
  const filteredUnArchivedBridges = filterBridges?.filter((item) => item.status === 1 || item.status === undefined);

  const UnArchivedBridges = filteredUnArchivedBridges?.filter((item) => item.status === 1 || item.status === undefined).map((item) => ({
    _id: item._id,
    model: item.configuration?.model || "",
    name: <div className="flex gap-3">
      <div className="flex gap-2 items-center">
        {getIconOfService(item.service, 30, 30)}
      </div>
      <div className="flex-col" title={item.name}>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            {item.name.length > 20 ? item.name.slice(0, 17) + '...' : item.name}
            {item.bridge_status === 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20">
                  <ClockIcon size={12}/>
                <span className="hidden sm:inline">Paused</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p className="opacity-60 text-xs" title={item.slugName}>
              {item?.slugName || ""}
            </p>
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
    bridge_quota: item?.bridge_quota
  }));

  const ArchivedBridges = filteredArchivedBridges.filter((item) => item.status === 0).map((item) => ({
    _id: item._id,
    model: item.configuration?.model || "",
    name: <div className="flex gap-3">
      <div className="flex gap-2 items-center">
        {getIconOfService(item.service, 30, 30)}
      </div>
      <div className="flex-col">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            {item.name}
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
    bridge_quota: item?.bridge_quota
  }));

  const onClickConfigure = (id, versionId) => {
    router.push(`/org/${resolvedParams.org_id}/agents/configure/${id}?version=${versionId}`);
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
  
  const handleSetBridgeApiKeyLimit = (item) => {
    setSelectedBridgeForLimit(item);
    openModal(MODAL_TYPE.API_KEY_LIMIT_MODAL);
  };

  const handleUpdateBridgeApiKeyLimit = async  (bridge, limit) => {
    closeModal(MODAL_TYPE?.API_KEY_LIMIT_MODAL);
    const dataToSend = {
      'bridge_quota': {
        limit: limit || 1,
        used: bridge?.used || 0
      }
    }
    const res = await dispatch(updateBridgeAction({ bridgeId: bridge._id, dataToSend }));
    if (res?.success) toast.success('Agent Usage Limit Updated Successfully');
  };

  const resetUsage = async (bridge) => {
    const dataToSend = { 'bridge_quota': { limit: bridge.bridge_quota.limit, used: 0 } }
    const res = await dispatch(updateBridgeAction({ bridgeId: bridge._id, dataToSend }));
    if (res?.success) toast.success('Agent Usage Reset Successfully');
  }

  const EndComponent = ({ row }) => {
    return (
      <div className="flex items-center mr-4 text-sm">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {!isEmbedUser && <button
            className="btn btn-outline btn-ghost btn-sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/org/${resolvedParams.org_id}/agents/testcase/${row._id}?version=${row?.versionId || null}`);
            }}
          >
            Test Case
          </button>}
        </div>
        <div className="dropdown dropdown-left bg-transparent">
          <div tabIndex={0} role="button" className="hover:bg-base-200 rounded-lg p-3" onClick={(e) => e.stopPropagation()}><EllipsisIcon className="rotate-90" size={16} /></div>
          <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-very-high w-52 p-2 shadow">
            <li><a onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              archiveBridge(row._id, row.status != undefined ? Number(!row?.status) : undefined)
            }}><ArchiveIcon className="mr-2" size={16} />{(row?.status === 0) ? 'Un-archive Agent' : 'Archive Agent'}</a></li>
            <li><a onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSetBridgeApiKeyLimit(row);
            }}><ClockFading className="mr-2" size={16} />Set Agent Usage Limit</a></li>
            <li><a onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              resetUsage(row);
            }}><RefreshIcon className="mr-2" size={16} />Reset Usage</a></li>
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
    <div className="w-full overflow-x-hidden">
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
              <div className="text-center w-full h-screen flex justify-center items-center py-10">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-16 h-16 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <p className="text-lg font-semibold text-base-content">Create Your First Agent</p>
                  <button className="btn mt-2 btn-primary" onClick={() => openModal(MODAL_TYPE?.CREATE_BRIDGE_MODAL)}>+ Create New Agent</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col lg:mx-0">
                <div className="px-2 pt-4">
                  <MainLayout>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between w-full mb-4">
                      <PageHeader
                        title="Agents"
                        description="Agents connect your app to AI models like Openai with zero boilerplate, smart prompt handling, and real-time context awareness.Focus on what your agent should do.Agents handle the rest."
                        docLink="https://gtwy.ai/blogs/features/bridge"
                        isEmbedUser={isEmbedUser}
                      />
                      <div className="flex-shrink-0 mt-4 sm:mt-0">
                        <button className="btn btn-primary" onClick={() => openModal(MODAL_TYPE?.CREATE_BRIDGE_MODAL)}>+ Create New Agent</button>
                      </div>
                    </div>
                  </MainLayout>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ">
                    <SearchItems data={allBridges} setFilterItems={setFilterBridges} item="Agents"/>
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
      <ApiKeyLimitModal data={selectedBridgeForLimit} onConfirm={handleUpdateBridgeApiKeyLimit} />
    </div>
  );
}
export default Protected(Home);