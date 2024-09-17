"use client"
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { useCustomSelector } from "@/customSelector/customSelector";
import { getHistoryAction, getThread } from "@/store/action/historyAction";
import { clearThreadData } from "@/store/reducer/historyReducer";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import Sidebar from "@/components/historyPageComponents/sidebar";
import ChatDetails from "@/components/historyPageComponents/chatDetails";
import ThreadItem from "@/components/historyPageComponents/threadItem";
import EmbedScriptLoader from "@/components/historyPageComponents/embedScriptLoader";
import Protected from "@/components/protected";
import { getSingleMessage } from "@/config";

export const runtime = "edge";

function Page({ params }) {
  const search = useSearchParams();
  const router = useRouter();
  const pathName = usePathname();
  const dispatch = useDispatch();
  const sidebarRef = useRef(null);

  const { historyData, thread, embedToken, integrationData } = useCustomSelector((state) => ({
    historyData: state?.historyReducer?.history || [],
    thread: state?.historyReducer?.thread,
    embedToken: state?.bridgeReducer?.org?.[params?.org_id]?.embed_token,
    integrationData: state?.bridgeReducer?.org?.[params?.org_id]?.integrationData
  }));
  const searchParams = useSearchParams();

  const [selectedThread, setSelectedThread] = useState("");
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [page, setPage] = useState(1); // Track the current page of data
  const [hasMore, setHasMore] = useState(true); // Track if more data is available
  const [loading, setLoading] = useState(false); // Track loading state

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

  return (
    <div className="bg-base-100  relative scrollbar-hide text-base-content h-screen">
      <EmbedScriptLoader embedToken={embedToken} />
      <div className="drawer drawer-open">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col items-center overflow-scroll justify-center ">
          <div className="w-full min-h-screen">
            <div className="w-full text-start">
              <div className="pb-16 pl-2 pt-4">
                {thread && thread.map((item, index) => (
                  <ThreadItem index={index} item={item} threadHandler={threadHandler} formatDateAndTime={formatDateAndTime} integrationData={integrationData} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <Sidebar historyData={historyData} selectedThread={selectedThread} threadHandler={threadHandler} fetchMoreData={fetchMoreData} hasMore={hasMore} loading={loading} params={params} />
      </div>
      <ChatDetails selectedItem={selectedItem} setIsSliderOpen={setIsSliderOpen} isSliderOpen={isSliderOpen} />
    </div>
  );
}

export default Protected(Page);
