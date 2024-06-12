"use client";
import Protected from "@/components/protected";
import { useCustomSelector } from "@/customSelector/customSelector";
import { getHistoryAction, getThread } from "@/store/action/historyAction";
import { clearThreadData } from "@/store/reducer/historyReducer";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import ReactMarkdown from "react-markdown";
import { getSingleMessage } from "@/config";
import { CircleX } from "lucide-react";

export const runtime = "edge";

const Page = ({ params }) => {
  const search = useSearchParams();
  const router = useRouter();
  const pathName = usePathname();
  const dispatch = useDispatch();

  const { historyData, thread } = useCustomSelector((state) => ({
    historyData: state?.historyReducer?.history || [],
    thread: state?.historyReducer?.thread,
  }));

  const [selectedThread, setSelectedThread] = useState("");
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        setIsSliderOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, []);

  useEffect(() => {
    dispatch(getHistoryAction(params.id));
    dispatch(clearThreadData());
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
      router.push(`${pathName}?thread_id=${firstThreadId}`, undefined, { shallow: true });
    }
  }, [search, historyData, params.id, dispatch, router, pathName]);

  const threadHandler = useCallback(
    async (thread_id, item) => {
      if (item?.role === "user" && !thread_id) {
        try {
          const systemPromptResponse = await getSingleMessage({ bridge_id: params.id, message_id: item.createdAt });
          setSelectedItem({ "System Prompt": systemPromptResponse, ...item });
          setIsSliderOpen(true);
        } catch (error) {
          console.error("Failed to fetch single message:", error);
        }
      } else if (item?.role !== "assistant") {
        setSelectedThread(thread_id);
        router.push(`${pathName}?thread_id=${thread_id}`, undefined, { shallow: true });
      }
    },
    [params.id, router, pathName]
  );

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
    return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString("en-US", options);
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
      <div className="drawer drawer-open">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" readOnly />
        <div className="drawer-content flex flex-col items-center justify-center">
          <div className="w-full min-h-screen bg-base-200">
            <div className="w-full text-start">
              <div className="w-full">
                {thread &&
                  thread.map((item, index) => (
                    <div key={`item.id${index}`}>
                      <div className={`chat ${item.role === "user" ? "chat-start" : "chat-end"}`}>
                        <div className="chat-header flex gap-2">
                          {item.role.replaceAll("_", " ")}
                          <time className="text-xs opacity-50">{formatDateAndTime(item.createdAt)}</time>
                        </div>
                        <div
                          className={`chat-bubble ${item.role === "user" ? "chat-bubble-primary hover:shadow-lg hover:scale-105 transition-transform duration-300" : "bg-gray-300 text-black"}`} // Add hover effects for blue chat bubbles
                          onClick={() => threadHandler(item.thread_id, item)}
                        >
                          <ReactMarkdown>{item.content}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
        <div className="drawer-side border-r-4">
          <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay" onClick={() => setIsSliderOpen(false)}></label>
          <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
            {historyData.map((item) => (
              <li key={item.id} onClick={() => threadHandler(item.thread_id)}>
                <a
                  className={`${selectedThread === item.thread_id ? "active" : ""
                    } block overflow-hidden whitespace-nowrap text-ellipsis`}
                >
                  {item.thread_id}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div
        className={`fixed inset-y-0 right-0 border-l-2 ${isSliderOpen ? "w-full md:w-1/3 lg:w-1/6 opacity-100" : "w-0"
          } overflow-y-auto bg-base-200 transition-all duration-300 z-50`}
      >
        {selectedItem && (
          <aside className="flex w-full flex-col h-screen overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Chat Details</h2>
                <button onClick={() => setIsSliderOpen(false)} className="btn">
                  <CircleX size={16} />
                </button>
              </div>
              <ul className="mt-4">
                {Object.entries(selectedItem).map(([key, value]) => {
                  if (!value || ["id", "org_id", "createdAt", "created_at", "chat_id"].includes(key)) return null;
                  return (
                    <li key={key} className="mb-2">
                      <strong className="font-medium text-gray-700 capitalize">{key}:</strong>
                      <span className="ml-2 text-gray-600">
                        {typeof value === "object" ? (
                          <pre className="bg-gray-200 p-2 rounded text-sm overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>
                        ) : (
                          value.toString()
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
};

export default Protected(Page);


