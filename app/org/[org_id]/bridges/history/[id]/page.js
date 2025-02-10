"use client"
import ChatDetails from "@/components/historyPageComponents/chatDetails";
import Sidebar from "@/components/historyPageComponents/sidebar";
import ThreadContainer from "@/components/historyPageComponents/threadContainer";
import Protected from "@/components/protected";
import { getSingleMessage } from "@/config";
import { useCustomSelector } from "@/customHooks/customSelector";
import { getHistoryAction, userFeedbackCountAction } from "@/store/action/historyAction";
import { clearThreadData } from "@/store/reducer/historyReducer";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { getBridgeVersionAction } from "@/store/action/bridgeAction";
import { getVersionHistory } from "@/config";


export const runtime = "edge";

function Page({ searchParams }) {
  const params = searchParams;
  const search = useSearchParams();
  const router = useRouter();
  const pathName = usePathname();
  const dispatch = useDispatch();
  const sidebarRef = useRef(null);
  const searchRef = useRef();

  const { historyData, thread } = useCustomSelector((state) => ({
    historyData: state?.historyReducer?.history || [],
    thread: state?.historyReducer?.thread || [],
  }));

  const [selectedThread, setSelectedThread] = useState(null);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [searchMessageId, setSearchMessageId] = useState(null);
  const [filterOption, setFilterOption] = useState("all");
  const [threadPage, setThreadPage] = useState(1);
  const [hasMoreThreadData, setHasMoreThreadData] = useState(true);
  const [selectedSubThreadId, setSelectedSubThreadId] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState("all");

  const { bridgeVersionsArray } = useCustomSelector(
    (state) => ({
      bridgeVersionsArray: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.versions || [],
    })
  );


  const [versionData, setVersionData] = useState(null);

  const closeSliderOnEsc = useCallback((event) => {
    if (event.key === "Escape") setIsSliderOpen(false);
  }, []);

  const handleClickOutside = useCallback((event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setIsSliderOpen(false);
    }
  }, []);

  useEffect(() => {
    dispatch(userFeedbackCountAction({ bridge_id: params.id, user_feedback: "all" }));
  }, [dispatch, params.id]);

  useEffect(() => {
    const handleEvents = (action) => {
      document[`${action}EventListener`]("keydown", closeSliderOnEsc);
      document[`${action}EventListener`]("mousedown", handleClickOutside);
    };
    handleEvents("add");
    return () => handleEvents("remove");
  }, [closeSliderOnEsc, handleClickOutside]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      const startDate = search.get("start");
      const endDate = search.get("end");
      await dispatch(getHistoryAction(params.id, startDate, endDate, 1, null, filterOption));
      dispatch(clearThreadData());
      setLoading(false);
    };
    if (!searchRef.current.value) fetchInitialData();
  }, [params.id, filterOption]);

  const threadHandler = useCallback(
    async (thread_id, item) => {
      if (item?.role === "assistant") return;
      if ((item?.role === "user" || item?.role === "tools_call") && !thread_id) {
        try {
          const systemPromptResponse = await getSingleMessage({ bridge_id: params.id, message_id: item.createdAt });
          setSelectedItem({ variables: item.variables, "System Prompt": systemPromptResponse, ...item });
          setIsSliderOpen(true);
        } catch (error) {
          console.error("Failed to fetch single message:", error);
        }
      } else {
        setSelectedThread(thread_id);
        router.push(`${pathName}?version=${params.version}&thread_id=${thread_id}`, undefined, { shallow: true });
      }
    },
    [pathName, router, params.id, params.version]
  );

  const fetchMoreData = useCallback(async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    const startDate = search.get("start");
    const endDate = search.get("end");
    const result = await dispatch(getHistoryAction(params.id, startDate, endDate, nextPage));
    if (result?.length < 40) setHasMore(false);
  }, [dispatch, page, params.id, search]);

  const handleVersionChange = async (event) => {
    const version = event.target.value;
    setSelectedVersion(version);

    if (version !== "all") {
      dispatch(getBridgeVersionAction({ versionId: version }));
      try {
        const response = await getVersionHistory(params.thread_id, params.id, version);
        setVersionData(response.data);
      } catch (error) {
        console.error('Failed to fetch version history:', error);
        setVersionData(null);
      }
    } else {
      setVersionData(null);
    }
  };

  return (
    <div className="bg-base-100 relative scrollbar-hide text-base-content h-screen">
      <div className="drawer drawer-open">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          <div className="flex justify-end mr-6 py-4 border-b border-gray-200">
            <select
              className="select select-bordered w-full max-w-xs"

              value={selectedVersion}
              onChange={handleVersionChange}
            >
              <option value="all">All Versions</option>
              {bridgeVersionsArray?.map((version, index) => (
                <option
                  key={version}
                  value={version}
                >
                  Version {index + 1} 
                </option>
              ))}
            </select>
          </div>
          <ThreadContainer
            key={`thread-container-${params.id}-${params.version}`}
            thread={selectedVersion === "all" ? thread : (versionData || [])}
            filterOption={filterOption}
            setFilterOption={setFilterOption}
            isFetchingMore={isFetchingMore}
            setIsFetchingMore={setIsFetchingMore}
            setLoading={setLoading}
            searchMessageId={searchMessageId}
            setSearchMessageId={setSearchMessageId}
            params={params}
            pathName={pathName}
            search={search}
            historyData={historyData}
            selectedThread={selectedThread}
            setSelectedThread={setSelectedThread}
            threadHandler={threadHandler}
            threadPage={threadPage}
            setThreadPage={setThreadPage}
            hasMoreThreadData={hasMoreThreadData}
            setHasMoreThreadData={setHasMoreThreadData}
            selectedSubThreadId={selectedSubThreadId}
          />
        </div>
        <Sidebar
          historyData={historyData}
          selectedThread={selectedThread}
          threadHandler={threadHandler}
          fetchMoreData={fetchMoreData}
          hasMore={hasMore}
          loading={loading}
          params={params}
          setSearchMessageId={setSearchMessageId}
          setPage={setPage}
          setHasMore={setHasMore}
          filterOption={filterOption}
          setFilterOption={setFilterOption}
          searchRef={searchRef}
          setIsFetchingMore={setIsFetchingMore}
          setThreadPage={setThreadPage}
          threadPage={threadPage}
          hasMoreThreadData={hasMoreThreadData}
          setHasMoreThreadData={setHasMoreThreadData}
          setSelectedSubThreadId={setSelectedSubThreadId}
          selectedSubThreadId={selectedSubThreadId}
        />
      </div>
      <ChatDetails selectedItem={selectedItem} setIsSliderOpen={setIsSliderOpen} isSliderOpen={isSliderOpen} />
    </div>
  );
}

export default Protected(Page);
