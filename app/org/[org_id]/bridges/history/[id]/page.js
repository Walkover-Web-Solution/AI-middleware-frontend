"use client"
import ChatDetails from "@/components/historyPageComponents/chatDetails";
import Sidebar from "@/components/historyPageComponents/sidebar";
import ThreadItem from "@/components/historyPageComponents/threadItem";
import Protected from "@/components/protected";
import { getSingleMessage } from "@/config";
import { useCustomSelector } from "@/customHooks/customSelector";
import { getHistoryAction, getThread } from "@/store/action/historyAction";
import { clearThreadData } from "@/store/reducer/historyReducer";
import { CircleChevronDown } from "lucide-react"; // Corrected import
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useDispatch } from "react-redux";

export const runtime = "edge";

function Page({ searchParams }) {
  const params = searchParams;
  const search = useSearchParams();
  const router = useRouter();
  const pathName = usePathname();
  const dispatch = useDispatch();
  const sidebarRef = useRef(null);
  const historyRef = useRef(null); // Ref for the scrollable div
  const contentRef = useRef(null); // Ref for the content container
  const containerRef = useRef(null);

  const { historyData, thread, integrationData } = useCustomSelector((state) => ({
    historyData: state?.historyReducer?.history || [],
    thread: state?.historyReducer?.thread?.conversations,
    integrationData: state?.bridgeReducer?.org?.[params?.org_id]?.integrationData,
  }));

  const [selectedThread, setSelectedThread] = useState("");
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [page, setPage] = useState(1); // Track the current page of data
  const [threadPage, setThreadPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [hasMoreThreadData, setHasMoreThreadData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const previousScrollHeightRef = useRef(0);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [flexDirection, setFlexDirection] = useState("column"); 

  const closeSliderOnEsc = (event) => {
    if (event.key === "Escape") {
      setIsSliderOpen(false);
    }
  };

  const handleClickOutside = (event) => {
    if (sidebarRef?.current && !sidebarRef.current.contains(event.target)) {
      setIsSliderOpen(false);
    }
  };

  useEffect(() => {
    document?.addEventListener("keydown", closeSliderOnEsc);
    document?.addEventListener("mousedown", handleClickOutside);

    return () => {
      document?.removeEventListener("keydown", closeSliderOnEsc);
      document?.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeSliderOnEsc, handleClickOutside]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      const startDate = search.get("start");
      const endDate = search.get("end");
      await dispatch(getHistoryAction(params?.id, startDate, endDate, 1));  // paramaters are id , starting date , end date , page number
      dispatch(clearThreadData());
      setLoading(false);
    };
    fetchInitialData();
  }, [params?.id]);

  useEffect(() => {
    const thread_id = search.get("thread_id");
    const startDate = search.get("start");
    const endDate = search.get("end");
    setThreadPage(1);
    if (thread_id) {
      setSelectedThread(thread_id);
      dispatch(getThread(thread_id, params?.id, 1));
    } else if (historyData?.length > 0) {
      const firstThreadId = historyData[0]?.thread_id;
      setSelectedThread(firstThreadId);
      dispatch(getThread(firstThreadId, params?.id,1));
    }
      setLoading(false);
      let url = `${pathName}?version=${params.version}&thread_id=${selectedThread}`;
      if (startDate && endDate) {
        url += `&start=${startDate}&end=${endDate}`;
      }
      router.push(url, undefined, { shallow: true });
    
  }, [search, historyData, params.id, pathName]);

  const threadHandler = useCallback(
    async (thread_id, item) => {
      if (item?.role === "assistant") return ""
      if (item?.role === "user" || item?.role === "tools_call" && !thread_id) {
        try {
          const systemPromptResponse = await getSingleMessage({ bridge_id: params.id, message_id: item.createdAt });
          setSelectedItem({ variables: item.variables, "System Prompt": systemPromptResponse, ...item });
          setIsSliderOpen(true);
        } catch (error) {
          console.error("Failed to fetch single message:", error);
        }
      } else {
        setSelectedThread(thread_id);
        router.push(`${pathName}?version=${params.version}&thread_id=${thread_id}`, undefined, {
          shallow: true,
        });
      }
    },
    [params.id, pathName]
  );

  const fetchMoreData = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    const startDate = search.get("start");
    const endDate = search.get("end");
    const result = await dispatch(getHistoryAction(params.id, startDate, endDate, nextPage));
    if (result?.length < 40) {
      setHasMore(false);
    }
  };

  const formatDateAndTime = (created_at) => {
    const date = new Date(created_at);
    const options = {
      year: "numeric",
      month: "numeric",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    return isNaN(date.getTime())
      ? "Invalid Date"
      : date?.toLocaleDateString("en-US", options);
  };

  // Fetch more thread data for infinite scroll
  const fetchMoreThreadData = useCallback(async () => {
    if (isFetchingMore) return;
    
    setIsFetchingMore(true);
  
    // Capture the current scroll position and height
    const currentScrollHeight = historyRef.current.scrollHeight;
    previousScrollHeightRef.current = currentScrollHeight;
  
    const nextPage = threadPage + 1;
    setThreadPage(nextPage);
    
    const result = await dispatch(getThread(selectedThread, params.id, nextPage));
    
    if (!result || result.length < 40) {
      setHasMoreThreadData(false);
    }
    
    setIsFetchingMore(false);
  }, [isFetchingMore, threadPage, selectedThread,hasMoreThreadData]);

  // Adjust scroll position when thread updates
  useLayoutEffect(() => {
    if (isFetchingMore && historyRef.current) {
      const newScrollHeight = historyRef.current.scrollHeight;
      const scrollDifference = newScrollHeight - previousScrollHeightRef.current;
      historyRef.current.scrollTop += scrollDifference;
    }
  }, [thread, isFetchingMore]);

  // Scroll to bottom on initial render
  useEffect(() => {
    if (historyRef.current && threadPage === 1) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [thread, threadPage]);

  // Adjust flexDirection based on content height
  useEffect(() => {
    if (historyRef?.current && contentRef?.current) {
      const containerHeight = historyRef?.current.clientHeight;
      const contentHeight = contentRef?.current.clientHeight;
      if (contentHeight < containerHeight) {
        setFlexDirection("column"); // Start from top
      } else {
        setFlexDirection("column-reverse"); // Start from bottom
      }
    }
  }, [thread]);

  // Scroll event handler to show/hide the Scroll to Bottom button
  const handleScroll = useCallback(() => {
    if (!historyRef?.current) return;
    const { scrollTop, clientHeight } = historyRef.current;
    setShowScrollToBottom(scrollTop + clientHeight < clientHeight);
  }, []);

  useEffect(() => {
    if (historyRef?.current) {
      historyRef?.current.addEventListener("scroll", handleScroll);
      handleScroll();
    }

    return () => {
      if (historyRef?.current) {
        historyRef?.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, [handleScroll]);

  const scrollToBottom = useCallback(() => {
    if (historyRef.current) {
      historyRef.current.scrollTo({
        top: historyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive and user is at bottom
  useEffect(() => {
    if (!showScrollToBottom) {
      scrollToBottom()
    }
  }, [thread, showScrollToBottom, scrollToBottom]);

  return (
    <div className="bg-base-100 relative scrollbar-hide text-base-content h-screen">
      <div className="drawer drawer-open">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col items-center overflow-scroll justify-center">
        <div className="w-full min-h-screen ">
            <div
              id="scrollableDiv"
              ref={historyRef}
              className="w-full text-start flex flex-col h-screen overflow-y-auto"
              style={{
                height: "90vh",
                overflowY: "auto",
                display: "flex",
                flexDirection: flexDirection, // Use dynamic flexDirection
              }}
            >
              <InfiniteScroll
                dataLength={thread?.length || 0}
                next={fetchMoreThreadData}
                hasMore={hasMoreThreadData}
                loader={<p></p>}
                scrollThreshold="250px" // Fetch data when 20% of the scrollable area remains
                inverse={flexDirection === "column-reverse"} // Inverse only when flexDirection is column-reverse
                scrollableTarget="scrollableDiv"
              >
                <div
                  ref={contentRef}
                  className="pb-16 px-3 pt-4"
                  style={{ width: "100%" }}
                >
                  {thread &&
                    thread?.map((item, index) => (
                      <ThreadItem
                        key={index}
                        params={params}
                        index={index}
                        item={item}
                        threadHandler={threadHandler}
                        formatDateAndTime={formatDateAndTime}
                        integrationData={integrationData}
                      />
                    ))}
                </div>
              </InfiniteScroll>
            </div>

            {/* Scroll to Bottom Button */}
            {showScrollToBottom && (
              <button
                onClick={scrollToBottom}
                className="fixed bottom-16 right-4 bg-gray-500 text-white p-2 rounded-full shadow-lg z-10"
              >
                <CircleChevronDown size={24} />
              </button>
            )}
          </div>
        </div>
        <Sidebar historyData={historyData} selectedThread={selectedThread} threadHandler={threadHandler} fetchMoreData={fetchMoreData} hasMore={hasMore} loading={loading} params={params} />
      </div>
      <ChatDetails selectedItem={selectedItem} setIsSliderOpen={setIsSliderOpen} isSliderOpen={isSliderOpen} />
    </div>
  );
}

export default Protected(Page);
