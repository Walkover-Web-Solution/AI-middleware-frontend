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

export const runtime = "edge";

function Page({ searchParams }) {
  const params = searchParams;
  const search = useSearchParams();
  const router = useRouter();
  const pathName = usePathname();
  const dispatch = useDispatch();
  const sidebarRef = useRef(null);
  const searchRef = useRef();
  
  const { historyData, thread, versionData, selectedVersion } = useCustomSelector((state) => ({
    historyData: state?.historyReducer?.history || [],
    thread: state?.historyReducer?.thread || [],
    versionData: state?.historyReducer?.versionHistory || [],
    selectedVersion : state?.historyReducer?.selectedVersion || 'all'
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

  return (
    <div className="bg-base-100 relative scrollbar-hide text-base-content h-screen">
      <div className="drawer drawer-open">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          <ThreadContainer
            key={`thread-container-${params.id}-${params.version}`}
            thread={selectedVersion === "all" ? thread : versionData}
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
            setHasMoreThreadData={setHasMoreThreadData}          />
        </div>
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
        />
      </div>
      <ChatDetails selectedItem={selectedItem} setIsSliderOpen={setIsSliderOpen} isSliderOpen={isSliderOpen} />
    </div>
  );
}

export default Protected(Page);
