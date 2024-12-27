import React, { useEffect, useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { getHistoryAction, getSubThreadsAction, getThread, userFeedbackCountAction } from "@/store/action/historyAction.js"; 
import { Download, ThumbsDown, ThumbsUp, ChevronDown, ChevronUp, X } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import CreateFineTuneModal from "../modals/CreateFineTuneModal.js";
import DateRangePicker from "./dateRangePicker.js";
import { toast } from "react-toastify";
import { useCustomSelector } from "@/customHooks/customSelector.js";
import { clearSubThreadData } from "@/store/reducer/historyReducer.js";
import { USER_FEEDBACK_FILTER_OPTIONS } from "@/utils/enums.js";
import { debounce, truncate } from "./assistFile.js";

const Sidebar = ({ historyData, selectedThread, threadHandler, fetchMoreData, hasMore, loading, params, setSearchMessageId, setPage, setHasMore, filterOption, setFilterOption, searchRef, setIsFetchingMore }) => {
  
  const dispatch = useDispatch();
  const { subThreads, userFeedbackCount } = useCustomSelector((state) => ({
    subThreads: state?.historyReducer.subThreads || [],
    userFeedbackCount: state?.historyReducer.userFeedbackCount,
  }));

  const [state, setState] = useState({
    isThreadSelectable: false,
    selectedThreadIds: [],
    selectedSubThreadId: null,
    searchQuery: "",
    expandedThreads: [],
  });

  const { isThreadSelectable, selectedThreadIds, selectedSubThreadId, searchQuery, expandedThreads } = state;

  // Function to update state
  const updateState = useCallback((updates) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  useEffect(() => {
    updateState({ expandedThreads: [] });
  }, [selectedThread, updateState]);

  const handleSearch = useCallback(
    async (query) => {
      setPage(1);
      setHasMore(true);
      setFilterOption("all");
      updateState({ expandedThreads: [] });
      dispatch(clearSubThreadData());
      const result = await dispatch(
        getHistoryAction(params.id, null, null, 1, query || "")
      );
      if (result?.length < 40) {
        setHasMore(false);
      }
    },
    [setHasMore, updateState]
  );

  const handleChange = useCallback(
    debounce((e) => {
      const query = e.target.value;
      updateState({ searchQuery: query });
      handleSearch(query);
    }, 500),
    [handleSearch, updateState]
  );

  

  // Clear search input
  const clearInput = useCallback(async () => {
    updateState({ searchQuery: "" });
    if (searchRef.current) searchRef.current.value = "";
    setPage(1);
    // setHasMore(true);
    // setThreadPage(1);
    setFilterOption("all");
    const result = await dispatch(getHistoryAction(params.id, null, null, 1, ""));
    await dispatch(getThread({ threadId: selectedThread, bridgeId: params.id, nextPage: 1, user_feedback: "all" }));
    if (result?.length < 40) {
      // setHasMore(false);
    }
  }, [searchRef]);

  const handleDownload = useCallback(() => {
    const modal = document.getElementById("fine-tune-modal");
    if (modal) modal.showModal();
  }, []);

  const handleThreadIds = useCallback(
    (id) => {
      setState((prev) => {
        const isSelected = prev.selectedThreadIds.includes(id);
        const updatedThreadIds = isSelected
          ? prev.selectedThreadIds.filter((threadId) => threadId !== id)
          : [...prev.selectedThreadIds, id];
        return { ...prev, selectedThreadIds: updatedThreadIds };
      });
    },
    []
  );

  const handleToggleThread = useCallback(
    async (threadId) => {
      const isExpanded = expandedThreads.includes(threadId);
      if (isExpanded) {
        // setThreadPage(1);
        setFilterOption("all");
        await dispatch(
          getThread({ threadId, bridgeId: params.id, nextPage: 1 })
        );
        dispatch(clearSubThreadData());
        setState({ expandedThreads: []});
      } else {
        setState((prev) => ({
          expandedThreads: [...prev.expandedThreads, threadId],
        }));
        dispatch(getSubThreadsAction({ thread_id: threadId }));
      }
    },
    [expandedThreads]
  );

  // Truncate function
  

  // Handle setting message ID
  const handleSetMessageId = useCallback(
    (messageId) => {
      if (messageId) {
        setSearchMessageId(messageId);
      } else {
        toast.error("Message ID is null or not found");
      }
    },
    [setSearchMessageId]
  );

  // Handle selecting a sub-thread
  const handleSelectSubThread = useCallback(
    async (subThreadId, threadId) => {
      // setThreadPage(1);
      // setIsFetchingMore(true);
      updateState({ selectedSubThreadId: subThreadId });
      const result = await dispatch(getThread({ threadId, subThreadId, bridgeId: params.id, nextPage: 1, user_feedback: filterOption }));
      if (result.data.length < 40) {
        // setIsFetchingMore(false);
      }
    },
    []
  );

  // Handle filter option change
  const handleFilterChange = useCallback(
    async (user_feedback) => {
      setFilterOption(user_feedback);
      // setThreadPage(1);
      dispatch(userFeedbackCountAction({ bridge_id: params.id, user_feedback }));
    },
    [setFilterOption]
  );

  return (
    <div
      className="drawer-side justify-items-stretch bg-base-200 min-w-[380px] border-r relative"
      id="sidebar"
    >
      {/* Fine Tune Modal */}
      <CreateFineTuneModal
        params={params}
        selectedThreadIds={selectedThreadIds}
      />

      {/* Filter and Search Section */}
      <div className="p-4 gap-3 flex flex-col">
        {/* Filter Response Section */}
        <div className="p-2 bg-base-300 rounded-md text-center">
          <p className="text-center m-2 font-semibold">Filter Response</p>
          <div className="flex items-center justify-center mb-2 gap-4">
            {USER_FEEDBACK_FILTER_OPTIONS.map((value, index) => (
              <label
                key={index}
                className="flex items-center gap-1 cursor-pointer"
              >
                <input
                  type="radio"
                  name="filterOption"
                  value={value}
                  checked={filterOption === value}
                  onChange={() => handleFilterChange(value)}
                  className={`radio ${value === "all" ? "radio-primary" : value === "1" ? "radio-success" : "radio-error"}`} />
                {value === "all" ? (
                  <span>All</span>
                ) : value === "1" ? (
                  <ThumbsUp size={16} />
                ) : (
                  <ThumbsDown size={16} />
                )}
              </label>
            ))}
          </div>
          <p className="text-xs text-base-content">
            {`The ${
              filterOption === "all"
                ? "All"
                : filterOption === "1"
                ? "Good"
                : "Bad"
            } User feedback for the bridge is ${userFeedbackCount}`}
          </p>
        </div>

        {/* Advanced Filter Section */}
        <div className="collapse collapse-arrow join-item border border-base-300">
          <input type="checkbox" className="peer" />
          <div className="collapse-title text-md font-medium peer-checked:bg-base-300 peer-checked:text-base-content">
            Advanced Filter
          </div>
          <div className="collapse-content">
            <DateRangePicker params={params} setFilterOption={setFilterOption} />
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={(e) => e.preventDefault()} className="relative">
          <input
            type="text"
            ref={searchRef}
            placeholder="Search..."
            // value={searchQuery}
            onChange={handleChange}
            className="border border-gray-300 rounded p-2 w-full pr-10"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear search"
              className="absolute right-3 top-3 cursor-pointer"
              onClick={clearInput}
            >
             <X />
            </button>
          )}
        </form>
      </div>

      {/* Close Sidebar Overlay */}
      <label
        htmlFor="my-drawer-2"
        aria-label="close sidebar"
        className="drawer-overlay"
      ></label>

      {/* Loading Indicator */}
      {loading ? (
        <div className="flex justify-center items-center bg-base-200 h-full">
          {/* You can add a spinner or loading indicator here */}
        </div>
      ) : (
        <InfiniteScroll
          dataLength={historyData.length}
          next={fetchMoreData}
          hasMore={!searchQuery && hasMore}
          loader={<h4></h4>}
          scrollableTarget="sidebar"
        >
          <div className="slider-container min-w-[40%] overflow-x-auto mb-16">
            <ul className="menu min-h-full text-base-content flex flex-col space-y-2">
              {historyData.map((item) => (
                <div
                  key={item.thread_id}
                  className={`${
                    isThreadSelectable ? "flex" : "flex-col"
                  }`}
                >
                  {/* Thread Selection Checkbox */}
                  {isThreadSelectable && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-lg mr-2 bg-white"
                        checked={selectedThreadIds.includes(item.thread_id)}
                        onChange={() => handleThreadIds(item.thread_id)}
                      />
                    </div>
                  )}

                  {/* Thread Item */}
                  <li
                    className={`${
                      selectedThread === item.thread_id
                        ? "text-base-100 bg-primary hover:text-base-100 hover:bg-primary rounded-md"
                        : ""
                    } flex-grow cursor-pointer`}
                    onClick={() => threadHandler(item.thread_id)}
                  >
                    <a className="w-full h-full flex items-center justify-between">
                      <span>{item.thread_id}</span>
                      {!searchQuery && selectedThread === item.thread_id && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent click event from propagating to the list item
                            handleToggleThread(item.thread_id);
                          }}
                          className="ml-2 cursor-pointer"
                        >
                          {expandedThreads.includes(item.thread_id) ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </div>
                      )}
                    </a>
                  </li>

                  {/* Sub Threads */}
                  {selectedThread === item.thread_id &&
                    expandedThreads.includes(item.thread_id) && (
                      <div className="pl-10 p-2 text-gray-600 text-sm">
                        <ul>
                          {subThreads.length === 0 ? (
                            <li>No sub thread available</li>
                          ) : (
                            subThreads.map((subThread) => (
                              <li
                                key={subThread.display_name}
                                className={`cursor-pointer ${
                                  selectedSubThreadId === subThread.display_name
                                    ? "bg-primary text-base-100"
                                    : "hover:bg-base-300 hover:text-gray-800"
                                } p-2 rounded-md transition-all duration-200`}
                                onClick={() =>
                                  handleSelectSubThread(
                                    subThread.display_name,
                                    item.thread_id
                                  )
                                }
                              >
                                {subThread.display_name}
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    )}

                  {/* Messages */}
                  {item.message && item.message.length > 0 && (
                    <div className="pl-10 pb-2 text-gray-600 text-sm">
                      {item.message.map((msg) => (
                        <div
                          key={msg.message_id}
                          onClick={() => handleSetMessageId(msg.message_id)}
                          className="cursor-pointer hover:bg-gray-100 hover:text-gray-800 p-2 rounded-md transition-all duration-200"
                        >
                          {truncate(msg.message, 45)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </ul>
          </div>
        </InfiniteScroll>
      )}

      {/* Action Buttons */}
      <div className="fixed bottom-2 left-12">
        {!isThreadSelectable && historyData.length > 0 && (
          <button
            onClick={() => updateState({ isThreadSelectable: true })}
            className="btn btn-primary btn-sm"
          >
            Generate Fine Tuning File
          </button>
        )}
        {isThreadSelectable && (
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="btn btn-primary"
              disabled={selectedThreadIds.length === 0}
            >
              Download <Download size={16} />
            </button>
            <button
              onClick={() => updateState({ isThreadSelectable: false })}
              className="btn bg-base-300"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
