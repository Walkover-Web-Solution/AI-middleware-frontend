import React, { memo, useCallback, useMemo, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import InfiniteScroll from "react-infinite-scroll-component";
import { toast } from "react-toastify";

import { useHistoryData } from "@/customHooks/useHistoryData";
import { useHistoryNavigation } from "@/customHooks/useHistoryNavigation";
import { MODAL_TYPE, USER_FEEDBACK_FILTER_OPTIONS } from "@/utils/enums";
import { formatRelativeTime, openModal } from "@/utils/utility";
import { 
  DownloadIcon, 
  ThumbsDownIcon, 
  ThumbsUpIcon, 
  ChevronDownIcon, 
  ChevronUpIcon, 
  UserIcon, 
  MessageCircleIcon,
  FileTextIcon 
} from "@/components/Icons";

import CreateFineTuneModal from "../modals/CreateFineTuneModal";
import DateRangePicker from "./dateRangePicker";

/**
 * Optimized History Sidebar Component
 * - Fixed search results display
 * - Reduced flickering with better state management
 * - Improved performance with memoization
 */
const HistorySidebar = memo(({ 
  params, 
  searchParams, 
  searchRef, 
  setSearchMessageId, 
  setPage, 
  setHasMore, 
  filterOption, 
  setFilterOption,
  setThreadPage,
  setHasMoreThreadData,
  selectedVersion,
  setIsErrorTrue,
  isErrorTrue,
  threadHandler,
  fetchMoreData,
  hasMore,
  loading,
  // Receive data from parent instead of calling hook again
  historyData,
  searchResults,
  searchQuery,
  isSearchActive,
  searchLoading,
  hasMoreSearchResults,
  subThreads,
  bridgeVersionsArray,
  userFeedbackCount,
  displayData,
  hasData,
  isEmpty,
  fetchHistory,
  fetchSubThreads,
  searchMessages,
  clearSearch,
  updateSearchQuery,
  updateSelectedVersion
}) => {
  const dispatch = useDispatch();

  const { 
    currentParams, 
    navigateToThread, 
    navigateToSubThread, 
    navigateWithSearch,
    navigateToFirstThread 
  } = useHistoryNavigation();

  // Local state
  const [isThreadSelectable, setIsThreadSelectable] = useState(false);
  const [selectedThreadIds, setSelectedThreadIds] = useState([]);
  const [expandedThreads, setExpandedThreads] = useState([]);
  const [loadingSubThreads, setLoadingSubThreads] = useState(false);

  // Memoized data to prevent unnecessary re-renders
  const memoizedDisplayData = useMemo(() => displayData, [displayData]);
  const memoizedSubThreads = useMemo(() => subThreads, [subThreads]);

  // Initialize expanded threads when thread_id changes
  useEffect(() => {
    if (currentParams.threadId) {
      setExpandedThreads([currentParams.threadId]);
      if (currentParams.threadId !== currentParams.subThreadId) {
        setLoadingSubThreads(true);
        fetchSubThreads(currentParams.threadId, { isError: isErrorTrue })
          .finally(() => setLoadingSubThreads(false));
      }
    }
  }, [currentParams.threadId, fetchSubThreads, isErrorTrue]);

  // Handle search message ID from URL
  useEffect(() => {
    if (currentParams.messageId) {
      updateSearchQuery(currentParams.messageId);
      if (searchRef?.current) {
        searchRef.current.value = currentParams.messageId;
      }
      handleSearch();
    }
  }, [currentParams.messageId, updateSearchQuery]);

  // Debounced search handler
  const debounce = useCallback((func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }, []);

  const handleChange = useCallback(debounce((e) => {
    const value = e?.target?.value || currentParams.messageId || "";
    updateSearchQuery(value);
    handleSearch(e);
  }, 300), [updateSearchQuery, currentParams.messageId]); // Reduced debounce time

  const handleSearch = useCallback(async (e) => {
    e?.preventDefault();
    
    if (e && e.target && e.target.value === '') {
      clearInput();
      return;
    }

    setPage(1);
    setHasMore(true);
    setFilterOption("all");

    try {
      const searchValue = searchRef?.current?.value || currentParams.messageId || "";
      const result = await searchMessages(searchValue);
      
      navigateWithSearch(searchValue, { messageId: currentParams.messageId });
      
      if (result?.length) {
        const firstResult = result[0];
        navigateToThread(firstResult.thread_id, {
          subThreadId: firstResult.sub_thread?.[0]?.sub_thread_id || firstResult.thread_id,
          messageId: currentParams.messageId
        });
      }

      if (result?.length < 40) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  }, [searchMessages, clearSearch, setPage, setHasMore, setFilterOption, navigateWithSearch, navigateToThread, currentParams.messageId]);

  const clearInput = useCallback(async () => {
    clearSearch();
    if (searchRef?.current) searchRef.current.value = "";
    setPage(1);
    setHasMore(true);
    setFilterOption("all");
    
    try {
      const result = await fetchHistory({ page: 1 });
      if (result?.length) {
        navigateToFirstThread(result, { messageId: currentParams.messageId });
      }
      if (result?.length < 40) setHasMore(false);
    } catch (error) {
      console.error("Clear search error:", error);
    }
  }, [clearSearch, fetchHistory, navigateToFirstThread, setPage, setHasMore, setFilterOption, currentParams.messageId]);

  const handleVersionChange = useCallback(async (event) => {
    const version = event.target.value;
    updateSelectedVersion(version);
  }, [updateSelectedVersion]);

  const handleToggleThread = useCallback(async (threadId) => {
    const isExpanded = expandedThreads.includes(threadId);
    if (isExpanded) {
      setExpandedThreads(prev => prev.filter(id => id !== threadId));
    } else {
      setExpandedThreads([threadId]);
      setLoadingSubThreads(true);
      await fetchSubThreads(threadId, { isError: isErrorTrue });
      setLoadingSubThreads(false);
    }
  }, [expandedThreads, fetchSubThreads, isErrorTrue]);

  const handleSelectSubThread = useCallback((subThreadId, threadId) => {
    setThreadPage(1);
    setExpandedThreads([threadId]);
    navigateToSubThread(subThreadId, threadId, {
      start: currentParams.start,
      end: currentParams.end,
      messageId: currentParams.messageId
    });
  }, [navigateToSubThread, setThreadPage, currentParams]);

  const handleFilterChange = useCallback(async (userFeedback) => {
    setFilterOption(userFeedback);
    setThreadPage(1);
  }, [setFilterOption, setThreadPage]);

  const handleCheckError = useCallback(async (isError) => {
    setIsErrorTrue(isError);
    setThreadPage(1);
    setHasMore(true);
    
    const newParams = new URLSearchParams(currentParams);
    if (isError) {
      newParams.set('error', 'true');
    } else {
      newParams.delete('error');
    }
    
    await fetchHistory({ 
      page: 1, 
      filterOption, 
      isError, 
      version: selectedVersion 
    });
    
    window.history.replaceState(null, '', `?${newParams.toString()}`);
  }, [setIsErrorTrue, setThreadPage, setHasMore, fetchHistory, filterOption, selectedVersion, currentParams]);

  const handleThreadIds = useCallback((id) => {
    setSelectedThreadIds((prevIds) =>
      prevIds.includes(id) ? prevIds.filter((threadId) => threadId !== id) : [...prevIds, id]
    );
  }, []);

  const handleSetMessageId = useCallback((messageId) => {
    messageId ? setSearchMessageId(messageId) : toast.error("Message ID null or not found");
  }, [setSearchMessageId]);

  const truncate = useCallback((string = "", maxLength) =>
    string?.length > maxLength ? string?.substring(0, maxLength - 3) + "..." : string, []);

  // Memoized components
  const Skeleton = useMemo(() => ({ count = 3 }) => (
    <div className="pl-4 p-2">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-6 bg-base-300 rounded-md mb-2"></div>
        </div>
      ))}
    </div>
  ), []);

  const NoDataFound = useMemo(() => () => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="text-base-content mb-2">
        <FileTextIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
      </div>
      <p className="text-base-content text-sm">No data available</p>
      {searchQuery && (
        <p className="text-base-content text-xs mt-1 opacity-50">
          No results found for "{searchQuery}"
        </p>
      )}
    </div>
  ), [searchQuery]);

  return (
    <div className="drawer-side justify-items-stretch text-xs bg-base-200 min-w-[290px] max-w-[290px] border-r border-base-300 relative" id="sidebar">
      <CreateFineTuneModal params={params} selectedThreadIds={selectedThreadIds} />
      
      {/* Header Controls */}
      <div className="p-2 gap-2 flex flex-col">
        {/* Advanced Filter */}
        <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-lg min-h-0">
          <input type="checkbox" className="peer" />
          <div className="collapse-title font-semibold min-h-0 py-3 flex items-center">
            <span className="text-xs">Advance Filter</span>
          </div>
          <div className="collapse-content px-3">
            <div className="space-y-2">
              <DateRangePicker 
                params={params} 
                setFilterOption={setFilterOption} 
                setHasMore={setHasMore} 
                setPage={setPage} 
                selectedVersion={selectedVersion} 
                filterOption={filterOption} 
                isErrorTrue={isErrorTrue}
              />
              
              <div className="p-2 bg-base-200 rounded-lg">
                <p className="text-center mb-2 text-xs font-medium">Filter Response</p>
                <div className="flex items-center justify-center mb-2 gap-2">
                  {USER_FEEDBACK_FILTER_OPTIONS?.map((value, index) => (
                    <label key={index} className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="filterOption"
                        value={value}
                        checked={filterOption === value}
                        onChange={() => handleFilterChange(value)}
                        className={`radio radio-xs ${value === "all" ? "radio-primary" : value === "1" ? "radio-success" : "radio-error"}`}
                      />
                      {value === "all" ? <span className="text-xs">All</span> : value === "1" ? <ThumbsUpIcon size={12} /> : <ThumbsDownIcon size={12} />}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-base-content mb-2 text-center">
                  {`The ${filterOption === "all" ? "All" : filterOption === "1" ? "Good" : "Bad"} User feedback for the agent is ${userFeedbackCount?.[filterOption === 'all' ? 0 : filterOption === '1' ? 1 : 2] || 0}`}
                </p>

                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs">Show Error Chat History</span>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-xs" 
                    checked={isErrorTrue} 
                    onChange={() => handleCheckError(!isErrorTrue)} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Version Selector */}
        <div className='flex items-center'>
          <select
            className="select select-bordered select-sm w-full text-xs"
            value={selectedVersion}
            onChange={handleVersionChange}
          >
            <option value="all">All Versions</option>
            {bridgeVersionsArray?.map((version, index) => (
              <option key={version} value={version}>
                Version {index + 1}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            ref={searchRef}
            placeholder="Search..."
            onChange={handleChange}
            className="input input-bordered input-sm w-full pr-6 text-xs"
          />
          {searchQuery && (
            <svg
              fill="#000000"
              width="16px"
              height="16px"
              viewBox="0 0 24 24"
              className="absolute right-1.5 top-1.5 cursor-pointer"
              onClick={clearInput}
              style={{ fill: "none", stroke: "rgb(0, 0, 0)", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2 }}
            >
              <path d="M19,19,5,5M19,5,5,19"></path>
            </svg>
          )}
        </form>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {searchLoading ? (
          <Skeleton count={8} />
        ) : loading ? (
          <div className="flex justify-center items-center bg-base-200 h-full"></div>
        ) : isEmpty ? (
          <NoDataFound />
        ) : (
          <InfiniteScroll
            dataLength={memoizedDisplayData.length}
            next={fetchMoreData}
            hasMore={isSearchActive ? hasMoreSearchResults : (!searchQuery && hasMore)}
            loader={<h4></h4>}
            scrollableTarget="sidebar"
          >
            <div className="slider-container min-w-[45%] w-full overflow-x-auto pb-20">
              <ul className="menu min-h-full text-base-content flex flex-col space-y-1">
                {memoizedDisplayData?.map((item) => (
                  <div className={`${isThreadSelectable ? "flex" : "flex-col"}`} key={item?.thread_id}>
                    {isThreadSelectable && (
                      <div onClick={(e) => e?.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm mr-1.5 bg-base-100"
                          checked={selectedThreadIds?.includes(item?.thread_id)}
                          onChange={() => handleThreadIds(item?.thread_id)}
                        />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <li
                        className={`${decodeURIComponent(currentParams.threadId || '') === item?.thread_id
                          ? "text-base-100 bg-primary hover:text-base-100 hover:bg-primary rounded-md"
                          : ""
                          } flex-grow cursor-pointer group`}
                        onClick={() => {
                          const isCurrentlySelected = decodeURIComponent(currentParams.threadId || '') === item?.thread_id;
                          
                          if (isCurrentlySelected && !isSearchActive) {
                            handleToggleThread(item?.thread_id);
                          } else {
                            threadHandler(item?.thread_id);
                          }
                        }}
                      >
                        <a className="w-full h-full flex items-center justify-between relative">
                          <span className="truncate flex-1 mr-1.5 text-xs">{truncate(item?.thread_id, 30)}</span>
                          <span className="text-xs whitespace-nowrap flex-shrink-0 mr-2 transition-opacity duration-200">
                            {formatRelativeTime(item?.updated_at)}
                          </span>
                          
                          {/* Tooltip for full thread ID */}
                          {item?.thread_id?.length > 35 && (
                            <div className="absolute left-0 top-full mt-1 bg-gray-800 text-white text-xs rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-low max-w-[260px] break-words shadow-lg pointer-events-none">
                              {item?.thread_id}
                            </div>
                          )}
                          
                          {/* Chevron for expansion */}
                          {!searchQuery && decodeURIComponent(currentParams.threadId || '') === item?.thread_id && (
                            <div
                              onClick={(e) => {
                                e?.stopPropagation();
                                handleToggleThread(item?.thread_id);
                              }}
                              className="absolute right-2 cursor-pointer"
                            >
                              {expandedThreads?.includes(item?.thread_id) ? (
                                <ChevronUpIcon size={14} />
                              ) : (
                                <ChevronDownIcon size={14} />
                              )}
                            </div>
                          )}
                        </a>
                      </li>

                      {/* Sub Threads */}
                      {decodeURIComponent(currentParams.threadId || '') === item?.thread_id &&
                        expandedThreads?.includes(item?.thread_id) && (
                        <>
                          {loadingSubThreads ? (
                            <Skeleton />
                          ) : (
                            <div className="pl-4 p-1.5 text-base-content text-xs rounded-x-lg rounded-b-lg shadow-sm bg-base-100 overflow-hidden">
                              <ul>
                                {memoizedSubThreads?.length === 0 ? (
                                  <li className="text-xs p-1">No sub thread available</li>
                                ) : (
                                  memoizedSubThreads?.map((subThreadId, index) => (
                                    <li
                                      key={index}
                                      className={`cursor-pointer ${currentParams.subThreadId === subThreadId?.sub_thread_id
                                        ? "hover:bg-base-primary hover:text-base-100 bg-primary text-base-100"
                                        : "hover:bg-base-300 hover:text-base-content"
                                        } rounded-md transition-all duration-200 text-xs`}
                                      onClick={() => handleSelectSubThread(subThreadId?.sub_thread_id, currentParams.threadId)}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="truncate flex-1 mr-1.5">
                                          {truncate(subThreadId?.display_name || subThreadId?.sub_thread_id, 20)}
                                        </span>
                                        {(subThreadId?.updatedAt || subThreadId?.created_at || subThreadId?.createdAt || subThreadId?.updated_at) && (
                                          <span className="text-xs whitespace-nowrap flex-shrink-0 opacity-70">
                                            {formatRelativeTime(subThreadId?.updated_at || subThreadId?.created_at)}
                                          </span>
                                        )}
                                      </div>
                                    </li>
                                  ))
                                )}
                              </ul>
                            </div>
                          )}
                        </>
                      )}

                      {/* Messages */}
                      {decodeURIComponent(currentParams.threadId || '') === item?.thread_id && (
                        <div className="space-y-3">
                          <div className="rounded-x-lg rounded-b-lg shadow-sm bg-base-100 overflow-hidden">
                            {item?.sub_thread && item.sub_thread?.length > 0 && (
                              <div className="bg-base-100">
                                <div className="p-2">
                                  <div className="space-y-1.5">
                                    {item?.sub_thread?.map((subThread, index) => (
                                      <div key={index}>
                                        <li className={`ml-4 ${decodeURIComponent(currentParams.subThreadId || '') === subThread?.sub_thread_id
                                            ? "cursor-pointer hover:bg-base-primary hover:text-base-100 rounded-md transition-all duration-200 text-xs bg-primary text-base-100"
                                            : "cursor-pointer hover:bg-base-300 hover:text-base-content rounded-md transition-all duration-200 text-xs"
                                            } flex-grow group`}
                                          onClick={() => handleSelectSubThread(subThread?.sub_thread_id, item?.thread_id)}
                                        >
                                          <a className="w-full h-full flex items-center justify-between relative">
                                            <span className="truncate flex-1 mr-1.5 text-xs flex items-center">
                                              <MessageCircleIcon className={`w-3 h-3 mr-1.5 flex-shrink-0 ${currentParams.subThreadId === subThread?.sub_thread_id ? 'text-base-100' : 'text-base-content'
                                                }`} />
                                              {truncate(subThread?.display_name || subThread?.sub_thread_id, 20)}
                                            </span>
                                            {(subThread?.updated_at || subThread?.created_at) && (
                                              <span className="text-xs whitespace-nowrap flex-shrink-0 mr-2 transition-opacity duration-200">
                                                {formatRelativeTime(subThread?.updated_at || subThread?.created_at)}
                                              </span>
                                            )}
                                          </a>
                                        </li>
                                        {subThread?.messages?.length > 0 && (
                                          <div className="mt-1.5 ml-4 space-y-0">
                                            {subThread?.messages?.map((msg, msgIndex) => (
                                              <div
                                                key={msgIndex}
                                                onClick={() => handleSetMessageId(msg?.message_id)}
                                                className="cursor-pointer rounded-md transition-all duration-200 text-xs bg-base-100 hover:bg-base-200 text-base-content hover:text-gray-800 border-l-2 border-transparent hover:border-base-300"
                                              >
                                                <div className="flex items-start gap-1.5">
                                                  <UserIcon className="w-2.5 h-2.5 mt-0.5 text-base-content" />
                                                  <span>{truncate(msg?.message, 35)}</span>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                            {item?.message && item?.message?.length > 0 && (
                              <div className="p-2">
                                <div className="space-y-1.5 ml-2">
                                  {item?.message?.map((msg, index) => (
                                    <div
                                      key={index}
                                      onClick={() => handleSetMessageId(msg?.message_id)}
                                      className="cursor-pointer p-2 rounded-md transition-all duration-200 text-xs bg-base-100 hover:bg-base-200 text-base-content hover:text-gray-800 border-l-2 border-transparent hover:border-base-300"
                                    >
                                      <div className="flex items-start gap-1.5">
                                        <UserIcon className="w-2.5 h-2.5 mt-0.5 text-base-content" />
                                        <span>{truncate(msg?.message, 32)}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </ul>
            </div>
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
});

HistorySidebar.displayName = 'HistorySidebar';

export default HistorySidebar;
