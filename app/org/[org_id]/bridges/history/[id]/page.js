"use client";
import Protected from "@/components/protected";
import React, { useEffect, useState, useCallback, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useDispatch } from "react-redux";
import { useCustomSelector } from "@/customSelector/customSelector";
import { getHistoryAction, getThread } from "@/store/action/historyAction";
import { clearThreadData } from "@/store/reducer/historyReducer";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getSingleMessage } from "@/config";
import { CircleX } from "lucide-react";

export const runtime = "edge";

function Page({ params }) {
  const search = useSearchParams();
  const router = useRouter();
  const pathName = usePathname();
  const dispatch = useDispatch();

  const { historyData, thread, embedToken, integrationData

  } = useCustomSelector((state) => ({
    historyData: state?.historyReducer?.history || [],
    thread: state?.historyReducer?.thread,
    embedToken: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.embed_token,
    integrationData: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.integrationData
  }));

  useEffect(() => {
    if (embedToken) {
      const script = document.createElement("script");
      script.setAttribute("embedToken", embedToken);
      script.id = process.env.NEXT_PUBLIC_EMBED_SCRIPT_ID;
      script.src = process.env.NEXT_PUBLIC_EMBED_SCRIPT_SRC;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(document.getElementById(process.env.NEXT_PUBLIC_EMBED_SCRIPT_ID));
      };
    }
  }, [embedToken]);

  const [selectedThread, setSelectedThread] = useState("");
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [page, setPage] = useState(1); // Track the current page of data
  const [hasMore, setHasMore] = useState(true); // Track if more data is available
  const [loading, setLoading] = useState(false); // Track loading state
  const sidebarRef = useRef(null);

  useEffect(() => {
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

    document.addEventListener("keydown", closeSliderOnEsc);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", closeSliderOnEsc);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      await dispatch(getHistoryAction(params.id));
      dispatch(clearThreadData());
      setLoading(false);
    };
    fetchInitialData();
  }, [params.id, dispatch]);

  useEffect(() => {
    const thread_id = search.get("thread_id");
    if (thread_id) {
      setSelectedThread(thread_id);
      dispatch(getThread(thread_id, params.id));
    } else if (historyData.length > 0) {
      const firstThreadId = historyData[0].thread_id;
      setSelectedThread(firstThreadId);
      dispatch(getThread(firstThreadId, params.id));
      router.push(`${pathName}?thread_id=${firstThreadId}`, undefined, {
        shallow: true,
      });
    }
  }, [search, historyData, params.id, dispatch, router, pathName]);

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
        router.push(`${pathName}?thread_id=${thread_id}`, undefined, {
          shallow: true,
        });
      }
    },
    [params.id, router, pathName]
  );

  const fetchMoreData = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    const result = await dispatch(getHistoryAction(params.id, nextPage));
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

  if (historyData.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">No History Present</p>
      </div>
    );
  }


  return (
    <div className="flex">
      <div className="drawer lg:drawer-open">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col items-center justify-center">
          <div className="w-full min-h-screen bg-base-200">
            <div className="w-full text-start">
              <div className="w-full">
                {thread &&
                  thread.map((item, index) => (
                    <div key={`item.id${index}`}>
                      {item.role === "tools_call" ?
                        <div className="w-full flex align-center justify-center" >
                          {Object.keys(item.function).map((funcName, index) => (
                            // <div role="alert" className="alert shadow-lg w-2/3 cursor-pointer hover:bg-base-300 transition-colors duration-200" onClick={() => openViasocket(funcName)}>
                            <div role="alert" className="alert shadow-lg w-1/3 transition-colors duration-200" >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                              <div>
                                <h3 className="font-bold">Functions Executed</h3>
                                <div key={index}>
                                  {/* <div className="text-xs">Function "{integrationData[funcName].title || funcName}" executed successfully. Inspect details?</div> */}
                                  <div className="text-xs">Function "{integrationData[funcName].title || funcName}" executed successfully.</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        :
                        <div
                          className={`chat ${item.role === "user" ? "chat-start" : "chat-end"
                            }`}
                        >
                          <div className="chat-header flex gap-2">
                            {item.role.replaceAll("_", " ")}
                            <time className="text-xs opacity-50">
                              {formatDateAndTime(item.createdAt)}
                            </time>
                          </div>
                          <div
                            className={`${item.role === "user" ? "cursor-pointer chat-bubble-primary" : "bg-base-100 text-black"
                              } chat-bubble`}
                            onClick={() => threadHandler(item.thread_id, item)}
                          >
                            <ReactMarkdown>{item.content}</ReactMarkdown>
                          </div>
                        </div>
                      }
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
        <div className="drawer-side bg-base-200 border-r-4" id="sidebar">
          <label
            htmlFor="my-drawer-2"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          {loading ? (
            <div className="flex justify-center items-center bg-base-200 h-full">
              {/* Loading... */}
            </div>
          ) : (
            <InfiniteScroll
              dataLength={historyData.length}
              next={fetchMoreData}
              hasMore={hasMore}
              loader={<h4></h4>}
              scrollableTarget="sidebar"
            >
              <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                {historyData.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => threadHandler(item.thread_id)}
                  >
                    <a
                      className={`${selectedThread === item.thread_id ? "text-white bg-primary hover:text-white hover:bg-primary" : ""
                        } block overflow-hidden whitespace-nowrap text-ellipsis`}
                    >
                      {item.thread_id}
                    </a>
                  </li>
                ))}
              </ul>
            </InfiniteScroll>
          )}
        </div>
      </div>
      <div
        ref={sidebarRef}
        className={`fixed inset-y-0 right-0 border-l-2 ${isSliderOpen ? "w-full md:w-1/2 lg:w-1/2 opacity-100" : "w-0"
          } overflow-y-auto bg-base-200 transition-all duration-300 z-50`}
      >
        {selectedItem && (
          <aside className="flex w-full flex-col h-screen overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  Chat Details
                </h2>
                <button onClick={() => setIsSliderOpen(false)} className="btn">
                  <CircleX size={16} />
                </button>
              </div>
              <ul className="mt-4">
                {Object.entries(selectedItem).map(([key, value]) => {
                  return (
                    <li key={key} className="mb-2">
                      <strong className="font-medium text-gray-700 capitalize">{key}:</strong>
                      <span className="ml-2 text-gray-600">
                        {typeof value === "object" ? (
                          <pre className="bg-gray-200 p-2 rounded text-sm overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>
                        ) : (
                          value?.toString()
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export default Protected(Page);
