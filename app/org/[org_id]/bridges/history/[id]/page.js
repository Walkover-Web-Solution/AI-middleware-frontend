"use client"
import ChatDetails from "@/components/historyPageComponents/chatDetails";
import Sidebar from "@/components/historyPageComponents/sidebar";
import ThreadItem from "@/components/historyPageComponents/threadItem";
import Protected from "@/components/protected";
import { getSingleMessage } from "@/config";
import { useCustomSelector } from "@/customHooks/customSelector";
import { getHistoryAction, getThread } from "@/store/action/historyAction";
import { clearThreadData } from "@/store/reducer/historyReducer";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from "react-redux";
import { CircleChevronDown, Info } from "lucide-react"; // Import the component

export const runtime = "edge";

function Page({ params }) {
  const search = useSearchParams();
  const router = useRouter();
  const pathName = usePathname();
  const dispatch = useDispatch();
  const sidebarRef = useRef(null);
  const containerRef = useRef(null);

  const { historyData, thread, integrationData } = useCustomSelector((state) => ({
    historyData: state?.historyReducer?.history || [],
    thread: state?.historyReducer?.thread,
    integrationData: state?.bridgeReducer?.org?.[params?.org_id]?.integrationData
  }));
  const searchParams = useSearchParams();

  const [selectedThread, setSelectedThread] = useState("");
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [page, setPage] = useState(1); // Track the current page of data
  const [hasMore, setHasMore] = useState(true); // Track if more data is available
  const [loading, setLoading] = useState(false); // Track loading state
  const [isAtBottom, setIsAtBottom] = useState(true); // New state variable

  const closeSliderOnEsc = (event) => {
    if (event.key === "Escape") {
      setIsSliderOpen(false);
    }
  };

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setIsSliderOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", closeSliderOnEsc);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", closeSliderOnEsc);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // useEffect(() => {
  //   const fetchInitialData = async () => {
  //     setLoading(true);
  //     await dispatch(getHistoryAction(params.id));
  //     dispatch(clearThreadData());
  //     setLoading(false);
  //   };
  //   fetchInitialData();
  // }, [params.id, dispatch]);


  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      const startDate = search.get("start");
      const endDate = search.get("end");
      await dispatch(getHistoryAction(params.id, startDate, endDate, 1));  // paramaters are id , starting date , end date , page number
      dispatch(clearThreadData());
      setLoading(false);
    };
    fetchInitialData();
  }, [params.id]);

  useEffect(() => {
    const thread_id = search.get("thread_id");
    const startDate = search.get("start");
    const endDate = search.get("end");

    if (thread_id) {
      setSelectedThread(thread_id);
      dispatch(getThread(thread_id, params.id));
    } else if (historyData.length > 0) {
      const firstThreadId = historyData[0].thread_id;
      setSelectedThread(firstThreadId);
      dispatch(getThread(firstThreadId, params.id));

      let url = `${pathName}?thread_id=${firstThreadId}`;
      if (startDate && endDate) {
        url += `&start=${startDate}&end=${endDate}`;
      }
      router.push(url, undefined, { shallow: true });
    }
  }, [search, historyData, params.id, pathName]);

  const start = searchParams.get('start');
  const end = searchParams.get('end');

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
        // if (start && end) {
        //   router.push(`${pathName}?thread_id=${thread_id}&start=${start}&end=${end}`, undefined, {
        //     shallow: true,
        //   });
        // } else {
        router.push(`${pathName}?thread_id=${thread_id}`, undefined, {
          shallow: true,
        });
        // }
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
    if (result.length < 40) {
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
      : date.toLocaleDateString("en-US", options);
  };

  // if (historyData.length === 0) {
  //   return (
  //     <div className="flex items-center justify-center h-screen bg-base-200 text-base-content">
  //       <p className="text-xl">No History Present</p>
  //     </div>
  //   );
  // }

  // Scroll position effect
  useEffect(() => {
    const container = containerRef.current;

    const handleScroll = () => {
      if (container) {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isUserAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // Adjust threshold
        setIsAtBottom(isUserAtBottom);
      }
    };

    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  // Scroll to bottom when new messages arrive (with smooth scrolling)
  useEffect(() => {
    if (containerRef.current) {
      const { scrollHeight, clientHeight } = containerRef.current;
      if (scrollHeight > clientHeight && isAtBottom) {
        // Smooth scroll to the bottom when content overflows and user is at the bottom
        containerRef.current.scrollTo({
          top: scrollHeight - clientHeight,
          behavior: "smooth",
        });
      }
    }
  }, [thread, isAtBottom]);

  return (
    <div className="bg-base-100 relative scrollbar-hide text-base-content h-screen">
      <div className="drawer drawer-open">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col items-center justify-center">
          <div className="w-full min-h-auto overflow-x-hidden">       
            <div
              ref={containerRef}
              className="w-full text-start flex flex-col h-screen overflow-y-auto"
            >
              <div className="pb-16 px-3 pt-4 ">
                {thread &&
                  [...thread]?.map((item, index) => (
                  <ThreadItem key={index} params={params} index={index} item={item} threadHandler={threadHandler} formatDateAndTime={formatDateAndTime} integrationData={integrationData} />
                ))}
              </div>
            </div>
          </div>
          {/* Scroll-to-Bottom Button */}
          {!isAtBottom && (
            <button
              onClick={() => {
                if (containerRef.current) {
                  containerRef.current.scrollTo({
                    top: containerRef.current.scrollHeight,
                    behavior: "smooth",
                  });
                }
              }}
              className="fixed bottom-16 right-4 bg-gray-500 text-white p-2 rounded-full shadow-lg z-10"
            >
              <CircleChevronDown size={24} />
            </button>
          )}
        </div>
        <Sidebar historyData={historyData} selectedThread={selectedThread} threadHandler={threadHandler} fetchMoreData={fetchMoreData} hasMore={hasMore} loading={loading} params={params} />
      </div>
      <ChatDetails selectedItem={selectedItem} setIsSliderOpen={setIsSliderOpen} isSliderOpen={isSliderOpen} />
    </div>
  );
}

export default Protected(Page);
