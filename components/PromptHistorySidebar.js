import React, { useEffect, useRef, useState } from "react";
import { X, Bot } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import { getSystemPromptHistory } from "@/config/index"; // Ensure this import is correct

const PromptHistorySidebar = ({
  isOpen,
  onClose,
  bridgeId,
  handleMessageSelect,
  currentKey,
}) => {
  const sidebarRef = useRef(null);
  const [prompt, setPrompt] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchMessageHistory(1); // Fetch the first page when the sidebar opens
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarRef, onClose]);

  const fetchMessageHistory = async (pageNumber) => {
    console.log("Fetching page:", pageNumber);
    try {
      const response = await getSystemPromptHistory({
        bridge_id: bridgeId,
        pageNo: pageNumber,
        limit: 20,
      });
      if (Array.isArray(response)) {
        setPrompt((prevPrompt) =>
          pageNumber === 1 ? response : [...prevPrompt, ...response]
        );
        setPage(pageNumber + 1);
        if (response.length < 20) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } else {
        setHasMore(false);
        console.error("Unexpected response format:", response);
      }
    } catch (error) {
      console.error("Error fetching message history:", error);
      setHasMore(false);
    }
  };

  if (!isOpen) return null;

  return (
    <aside
      ref={sidebarRef}
      className="fixed right-0 top-0 z-20 flex h-full w-1/3 flex-col overflow-y-auto bg-white px-5 py-8 shadow-lg transition-all duration-300"
      id="scrollableDiv"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium flex items-center gap-2">
          <Bot /> Prompt History
        </h1>
        <button
          className="btn btn-outline btn-circle btn-xs"
          onClick={onClose}
        >
          <X size={16} />
        </button>
      </div>
      <div className="mt-6 flex flex-1 flex-col justify-between" id="scrollableDiv">
        <InfiniteScroll
          dataLength={prompt.length}
          next={() => fetchMessageHistory(page)}
          hasMore={hasMore}
          loader={<p>Loading...</p>}
          endMessage={<p>No more prompts</p>}
          scrollableTarget="scrollableDiv"
        >
          <nav className="-mx-3 space-y-6">
            <div className="space-y-3">
              {prompt.length > 0 ? (
                prompt.map((item, index) => (
                  <div
                    key={index}
                    className="flex transform items-center justify-between rounded-lg px-3 py-2 text-gray-600 transition-colors duration-300 hover:bg-gray-100 hover:text-gray-700"
                    onClick={() => handleMessageSelect(item.system_prompt, currentKey)}
                    style={{ overflow: "hidden" }}
                  >
                    <span className="mx-2 text-sm font-medium truncate">
                      {item.system_prompt}
                    </span>
                  </div>
                ))
              ) : (
                <p>No prompt history available</p>
              )}
            </div>
          </nav>
        </InfiniteScroll>
      </div>
    </aside>
  );
};

export default PromptHistorySidebar;

