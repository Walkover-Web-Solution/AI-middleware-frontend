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
import { archiveBridgeAction } from "@/store/action/bridgeAction";
import { MODAL_TYPE, ONBOARDING_VIDEOS } from "@/utils/enums";
import { filterBridges, getIconOfService, openModal, } from "@/utils/utility";
import { ClockIcon, EllipsisIcon, LayoutGridIcon, TableIcon } from "@/components/Icons";
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import SearchItems from "@/components/UI/SearchItems";

export const runtime = 'edge';

function Home({ params, isEmbedUser }) {
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const router = useRouter();
  const { allBridges, averageResponseTime, isLoading, isFirstBridgeCreation } = useCustomSelector((state) => {
    const orgData = state.bridgeReducer.org[params.org_id] || {};
    const user = state.userDetailsReducer.userDetails
    return {
      allBridges: (orgData.orgs || []).slice().reverse(),
      averageResponseTime: orgData.average_response_time || [],
      isLoading: state.bridgeReducer.loading,
      isFirstBridgeCreation: user.meta?.onboarding?.bridgeCreation || "",
    };
  });
  const [viewMode, setViewMode] = useState(window.innerWidth < 640 ? 'grid' : 'table');
  const [filterBridges,setFilterBridges]=useState(allBridges);
  const [tutorialState, setTutorialState] = useState({
    showTutorial: false,
    showSuggestion: isFirstBridgeCreation
  });

  useEffect(() => {
    const updateScreenSize = () => {
      if (window.matchMedia('(max-width: 640px)').matches) {
        setViewMode('grid');
      } else {
        setViewMode('table');
      }
    };
    updateScreenSize();
    setFilterBridges(allBridges)
    window.addEventListener('resize', updateScreenSize);

    return () => window.removeEventListener('resize', updateScreenSize);
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
    totalTokens: item?.total_tokens,
    averageResponseTime: averageResponseTime[item?._id] === 0 ? <div className="text-xs">Not used in 24h</div> : <div className="text-xs">{averageResponseTime[item?._id]}</div>
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
    averageResponseTime: averageResponseTime[item?._id] === 0 ? <div className="text-xs">Not used in 24h</div> : <div className="text-xs">{averageResponseTime[item?._id]}</div>
  }));

  const onClickConfigure = (id, versionId) => {
    router.push(`/org/${params.org_id}/agents/configure/${id}?version=${versionId}`);
  };

  const renderBridgeCard = (item) => {
    return (
      <div className="flex rounded-md border cursor-pointer hover:shadow-lg bg-base-100 p-4 relative w-full">
        <div key={item._id} className="flex flex-col items-center w-full" onClick={() => onClickConfigure(item._id, item?.published_version_id || item?.versions?.[0])}>
          
          <div className="flex flex-col h-[200px] gap-2 w-full">
            <h1 className="flex items-center overflow-hidden gap-2 text-lg leading-5 font-semibold text-base-content mr-2">
              {getIconOfService(item.service)}
              {item.name}
            </h1>
            <p className="text-xs w-full flex items-center gap-2 line-clamp-5">
              {item.slugName && <span>SlugName: {item.slugName.length > 20 ? item.slugName.slice(0, 17) + '...' : item.slugName}</span>}
              
              {item.configuration?.prompt && (
                Array.isArray(item.configuration.prompt) ? item.configuration.prompt.map((promptItem, index) => (
                  <div key={index}>
                    <p>Role: {promptItem.role}</p>
                    <p>Content: {promptItem.content}</p>
                  </div>
                )) : <p>Prompt: {item.configuration.prompt}</p>
              )}
              {item.configuration?.input && <span>Input: {item.configuration.input}</span>}
            </p>
            <div className="mt-auto">
              {item.bridge_status === 0 && (
                <div className="flex items-center gap-1.5 mb-2 px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20">
                  <ClockIcon size={12}/>
                  <span className="whitespace-nowrap">Paused</span>
                </div>
              )}
              <span className="mb-2 mr-2 inline-block rounded-full bg-base-100 px-3 py-1 text-xs font-semibold">
                {item.service}
              </span>
              <span className="mb-2 mr-2 inline-block rounded-full bg-base-100 px-3 py-1 text-xs font-semibold">
                {item.configuration?.model || ""}
              </span>
            </div>
          </div>
        </div>
        <div className="dropdown bg-transparent absolute right-3 top-2">
          <div tabIndex={0} role="button" className="hover:bg-base-200 rounded-lg p-3" onClick={(e) => e.stopPropagation()}><EllipsisIcon className="rotate-90" size={16} /></div>
          <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-low w-52 p-2 shadow">
            <li><a onClick={(e) => { e.preventDefault(); archiveBridge(item._id, item.status != undefined ? Number(!item?.status) : undefined) }}>{(item?.status === 0) ? 'Un-archive Agent' : 'Archive Agent'}</a></li>
          </ul>
        </div>
      </div>
    )
  }

  const archiveBridge = (bridgeId, newStatus = 0) => {
    try {
      dispatch(archiveBridgeAction(bridgeId, newStatus)).then((bridgeStatus) => {
        if (bridgeStatus === 1) {
          toast.success('Agent Unarchived Successfully');
        } else {
          toast.success('Agent Archived Successfully');
        }
        router.push(`/org/${params.org_id}/agents`);
      });
    } catch (error) {
      console.error('Failed to archive/unarchive agents', error);
    }
  }

  const EndComponent = ({ row }) => {
    return (
      <div className="flex items-center mr-4">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {!isEmbedUser && <button
            className="btn btn-outline btn-ghost btn-sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/org/${params.org_id}/agents/testcase/${row._id}?version=${row?.versionId || null}`);
            }}
          >
            Test Case
          </button>}
        </div>
        <div className="dropdown dropdown-left bg-transparent">
          <div tabIndex={0} role="button" className="hover:bg-base-200 rounded-lg p-3" onClick={(e) => e.stopPropagation()}><EllipsisIcon className="rotate-90" size={16} /></div>
          <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-low w-52 p-2 shadow">
            <li><a onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              archiveBridge(row._id, row.status != undefined ? Number(!row?.status) : undefined)
            }}>{(row?.status === 0) ? 'Un-archive Agent' : 'Archive Agent'}</a></li>
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
    <div className="w-full">
      {tutorialState?.showSuggestion && <TutorialSuggestionToast setTutorialState={setTutorialState} flagKey={"bridgeCreation"} TutorialDetails={"Agent Creation"} />}
      {tutorialState?.showTutorial && (
        <OnBoarding
          setShowTutorial={() => setTutorialState(prev => ({ ...prev, showTutorial: false }))}
          video={ONBOARDING_VIDEOS.bridgeCreation}
          flagKey={"bridgeCreation"}

        />
      )}
      <CreateNewBridge />
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
                  <button className="btn mt-2 btn-primary" onClick={() => openModal(MODAL_TYPE.CREATE_BRIDGE_MODAL)}>+ create new agent</button>
                </div>
              </div>
            ) : (
              <div className={`flex flex-col ${viewMode !== 'grid' ? 'lg:mx-0' : ''}`}>
                <div className="px-2 pt-4">
                  <MainLayout>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between w-full mb-4">
                      <PageHeader
                        title="Agents"
                        description="Agents connect your app to AI models like Openai with zero boilerplate, smart prompt handling, and real-time context awareness.Focus on what your agent should do.Agents handle the rest."
                        docLink="https://blog.gtwy.ai/features/bridge"
                      />
                      <div className="flex-shrink-0 mt-4 sm:mt-0">
                        <button className="btn btn-primary" onClick={() => openModal(MODAL_TYPE.CREATE_BRIDGE_MODAL)}>+ create new agent</button>
                      </div>
                    </div>
                  </MainLayout>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ">
                
                   <SearchItems data={allBridges} setFilterItems={setFilterBridges} item="Agents"/>
                  
                    <div className="join hidden sm:block">
                      <a onClick={() => setViewMode('grid')} className={`btn join-item ${viewMode === 'grid' ? 'bg-primary text-base-100' : ''}`}>
                        <LayoutGridIcon className="h-4 w-4" />
                      </a>
                      <a onClick={() => setViewMode('table')} className={`btn join-item ${viewMode === 'table' ? 'bg-primary text-base-100' : ''}`}>
                        <TableIcon className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>

                {viewMode === 'grid' ? (
                  <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 p-4">
                    {filteredUnArchivedBridges.slice().sort((a, b) => a.name?.localeCompare(b.name)).map((item) => (
                      renderBridgeCard(item)
                    ))}
                  </div>
                ) : (
                  <CustomTable data={UnArchivedBridges} columnsToShow={['name', 'model', 'totalTokens', 'averageResponseTime']} sorting sortingColumns={['name', 'model', 'totalTokens', 'averageResponseTime']} handleRowClick={(props) => onClickConfigure(props?._id, props?.versionId)} keysToExtractOnRowClick={['_id', 'versionId']} keysToWrap={['name', 'model']} endComponent={EndComponent} />
                )}
                
                {filteredArchivedBridges?.length > 0 && (
                  <div className="">
                    <div className="flex justify-center items-center my-4">
                      <p className="border-t border-base-300 w-full"></p>
                      <p className="bg-black text-base-100 py-1 px-2 rounded-full mx-4 whitespace-nowrap text-sm">
                        Archived Agents
                      </p>
                      <p className="border-t border-base-300 w-full"></p>
                    </div>
                    {viewMode === 'grid' ? (
                      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 opacity-50">
                        {filteredArchivedBridges.slice().sort((a, b) => a.name?.localeCompare(b.name)).map((item) => (
                          renderBridgeCard(item)
                        ))}
                      </div>
                    ) : (
                      <div className="opacity-60">
                        <CustomTable data={ArchivedBridges} columnsToShow={['name', 'model', 'totalTokens', 'averageResponseTime']} sorting sortingColumns={['name', 'model', 'totalTokens', 'averageResponseTime']} handleRowClick={(props) => onClickConfigure(props?._id, props?.versionId)} keysToExtractOnRowClick={['_id', 'versionId']} keysToWrap={['name', 'prompt', 'model']} endComponent={EndComponent} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default Protected(Home);