"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCustomSelector } from "@/customHooks/customSelector";
import { getHistoryAction, userFeedbackCountAction } from "@/store/action/historyAction";
import { clearThreadData, clearHistoryData, setSelectedVersion } from "@/store/reducer/historyReducer";
import LoadingSpinner from '@/components/loadingSpinner';
import Protected from "@/components/protected";
import ChatDetails from "@/components/historyPageComponents/chatDetails";
import { getSingleMessage } from "@/config";

// Lazy load the components to reduce initial render time
const ThreadContainer = React.lazy(() => import('@/components/historyPageComponents/threadContainer'));
const Sidebar = React.lazy(() => import('@/components/historyPageComponents/sidebar'));

export const runtime = "edge";
function Page({ searchParams }) {
  const params = searchParams;
  const search = useSearchParams();
  const router = useRouter();
  const pathName = usePathname();
  const dispatch = useDispatch();
  const sidebarRef = useRef(null);
  const searchRef = useRef();
  const { historyData, thread, selectedVersion } = useCustomSelector((state) => ({
    historyData: state?.historyReducer?.history || [],
    thread: state?.historyReducer?.thread || [],
    selectedVersion: state?.historyReducer?.selectedVersion || 'all'
  }));

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

  const closeSliderOnEsc = useCallback((event) => {
    if (event.key === "Escape") setIsSliderOpen(false);
  }, []);

  const handleClickOutside = useCallback((event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setIsSliderOpen(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      dispatch(clearThreadData());
      dispatch(clearHistoryData());
      dispatch(setSelectedVersion("all"));
    };
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
     const result =  await dispatch(getHistoryAction(params.id, startDate, endDate, 1, null, filterOption));
      dispatch(clearThreadData());
      if(params?.thread_id) {
        const threadId = params?.thread_id;
        const thread = result?.find(item => item?.thread_id === threadId);
        if(thread) {
          router.push(`${pathName}?version=${params.version}&thread_id=${threadId}&subThread_id=${threadId}`, undefined, { shallow: true });
        }
      }
      else if (!params?.thread_id && result?.length > 0) {
        const firstThreadId = result[0]?.thread_id;
        if (firstThreadId) {
          router.push(`${pathName}?version=${params.version}&thread_id=${firstThreadId}&subThread_id=${firstThreadId}`, undefined, { shallow: true });
        }
      }
      setLoading(false);
    };
    if (!searchRef?.current?.value) fetchInitialData();
  }, [params.id, filterOption]);

  const threadHandler = useCallback(
    async (thread_id, item, value) => {
      if (item?.role === "assistant") return;
      if ((item?.role === "user" || item?.role === "tools_call") && !thread_id) {
        try {
          const systemPromptResponse = await getSingleMessage({ bridge_id: params.id, message_id: item.createdAt });
          setSelectedItem({ variables: item.variables, "System Prompt": systemPromptResponse, ...item, value});
          if(value === 'system Prompt' || value === 'more' || item?.[value] === null)
            setIsSliderOpen(true);
        } catch (error) {
          console.error("Failed to fetch single message:", error);
        }
      } else {
        router.push(`${pathName}?version=${params.version}&thread_id=${thread_id}&subThread_id=${thread_id}`, undefined, { shallow: true });
      }
    },
    [pathName, params.id, params.version]
  );

  const fetchMoreData = useCallback(async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    const startDate = search.get("start");
    const endDate = search.get("end");
    const result = await dispatch(getHistoryAction(params.id, startDate, endDate, nextPage));
    if (result?.length < 40) setHasMore(false);
  }, [dispatch, page, params.id, search]);

  if (loading || !historyData) return (
    <div>
      <LoadingSpinner width="auto" height="999px" marginLeft='350px' marginTop='65px'/>
    </div>
  );

  return (
    <div className="bg-base-100 relative scrollbar-hide text-base-content h-screen">
      <div className="drawer drawer-open">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          <React.Suspense fallback={<LoadingSpinner width="auto" height="999px" marginLeft='350px' marginTop='65px'/>}>
            <ThreadContainer
              key={`thread-container-${params.id}-${params.version}`}
              thread={thread}
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
              threadHandler={threadHandler}
              threadPage={threadPage}
              setThreadPage={setThreadPage}
              hasMoreThreadData={hasMoreThreadData}
              setHasMoreThreadData={setHasMoreThreadData} 
              selectedVersion={selectedVersion}
            />
          </React.Suspense>
        </div>
        <React.Suspense fallback={<LoadingSpinner width="auto" height="999px" marginLeft='350px' marginTop='65px'/>}>
          <Sidebar
            historyData={historyData}
            threadHandler={threadHandler}
            fetchMoreData={fetchMoreData}
            hasMore={hasMore}
            loading={loading}
            params={params}
            search={search}
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
            selectedVersion={selectedVersion}
          />
        </React.Suspense>
      </div>
      <ChatDetails selectedItem={selectedItem} setIsSliderOpen={setIsSliderOpen} isSliderOpen={isSliderOpen} />
    </div>
  );
}

export default Protected(Page);
