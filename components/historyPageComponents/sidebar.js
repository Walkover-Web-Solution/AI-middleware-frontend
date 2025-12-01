import { useCustomSelector } from "@/customHooks/customSelector.js";
import { getHistoryAction, getSubThreadsAction, searchMessageHistoryAction } from "@/store/action/historyAction.js";
import { clearSubThreadData, clearThreadData } from "@/store/reducer/historyReducer.js";
import { USER_FEEDBACK_FILTER_OPTIONS } from "@/utils/enums.js";
import { formatRelativeTime} from "@/utils/utility.js";
import { ThumbsDownIcon, ThumbsUpIcon, ChevronDownIcon, ChevronUpIcon, UserIcon, MessageCircleIcon } from "@/components/Icons";
import { useEffect, useState, memo, useCallback, useMemo, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import CreateFineTuneModal from "../modals/CreateFineTuneModal.js";
import DateRangePicker from "./dateRangePicker.js";
import { usePathname, useRouter } from "next/navigation.js";
import { setSelectedVersion } from '@/store/reducer/historyReducer';
import { FileTextIcon } from "lucide-react";

const useDebouncedCallback = (callback, delay, deps = []) => {
  const callbackRef = useRef(callback);
  const timerRef = useRef(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedFn = useMemo(() => {
    return (...args) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay, ...deps]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  debouncedFn.cancel = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return debouncedFn;
};

const Sidebar = memo(({ 
  historyData = [], 
  threadHandler, 
  fetchMoreData, 
  hasMore, 
  loading, 
  params, 
  searchParams, 
  setSearchMessageId, 
  setPage, 
  setHasMore, 
  filterOption, 
  setFilterOption, 
  searchRef, 
  setThreadPage, 
  selectedVersion, 
  setIsErrorTrue, 
  isErrorTrue 
}) => {
  const {
    subThreads,
    userFeedbackCount,
    bridgeVersionsArray
  } = useCustomSelector(state => ({
    subThreads: Array.isArray(state?.historyReducer?.subThreads) ? state.historyReducer.subThreads : [],
    userFeedbackCount: state?.historyReducer?.userFeedbackCount,
    bridgeVersionsArray: Array.isArray(state?.bridgeReducer?.allBridgesMap?.[params?.id]?.versions) ? state.bridgeReducer.allBridgesMap[params.id].versions : [],
  }));

  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  // Memoized display data to ensure it's always an array
  const displayData = useMemo(() => {
    return Array.isArray(historyData) ? historyData : [];
  }, [historyData]);

  const [isThreadSelectable, setIsThreadSelectable] = useState(false);
  const [selectedThreadIds, setSelectedThreadIds] = useState([]);
  const [expandedThreads, setExpandedThreads] = useState([]);
  const [loadingSubThreads, setLoadingSubThreads] = useState(true);
  const dispatch = useDispatch();
  const pathName = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (
      expandedThreads?.length &&
      subThreads?.length > 0 &&
      searchParams?.thread_id &&
      searchParams?.subThread_id === searchParams?.thread_id
    ) {
      // Check if any subThread matches the thread_id
      const matchExists = subThreads.some(
        (sub) => sub.sub_thread_id === searchParams?.thread_id
      );

      if (!matchExists) {
        const firstSubThreadId = subThreads[0]?.sub_thread_id;
        if (firstSubThreadId) {
          const thread_id = encodeURIComponent(searchParams?.thread_id?.replace(/&/g, '%26'));
          const firstSubThreadIdEncoded = encodeURIComponent(subThreads[0]?.sub_thread_id?.replace(/&/g, '%26'));
          router.push(
            `${pathName}?version=${searchParams?.version}&thread_id=${thread_id}&subThread_id=${firstSubThreadIdEncoded}${searchParams?.message_id ? `&message_id=${searchParams.message_id}` : ''}`,
            undefined,
            { shallow: true }
          );
        }
      }
    }
  }, [subThreads, expandedThreads, searchParams?.thread_id, searchParams?.subThread_id]);



  const handleVersionChange = async (event) => {
    const version = event.target.value;
    dispatch(setSelectedVersion(version));
  };

  useEffect(() => {
    if (searchParams?.thread_id) {
      setExpandedThreads([searchParams?.thread_id]);
      dispatch(clearSubThreadData());
      setLoadingSubThreads(true);
      dispatch(getSubThreadsAction({ thread_id: searchParams?.thread_id, error: isErrorTrue, bridge_id: params.id, version_id: selectedVersion}));
    }
  }, [  searchParams?.thread_id]);

  useEffect(() => {
    if (subThreads?.length > 0 && searchParams?.thread_id) {
      const firstSubThreadId = subThreads[0]?.sub_thread_id;
      if (firstSubThreadId) {
        const start = searchParams?.start;
        const end = searchParams?.end;
        router.push(
          `${pathName}?version=${searchParams.version}&thread_id=${searchParams.thread_id}&subThread_id=${firstSubThreadId}&start=${start || ''}&end=${end || ''}${searchParams?.message_id ? `&message_id=${searchParams.message_id}` : ''}`,
          undefined,
          { shallow: true }
        );
      }
    }
    else{
      if(searchParams?.thread_id){
      router.push(
        `${pathName}?version=${searchParams.version}&thread_id=${searchParams.thread_id}&subThread_id=${searchParams.thread_id}&start=${searchParams.start||''}&end=${searchParams.end||''}${searchParams?.message_id ? `&message_id=${searchParams.message_id}` : ''}`,
        undefined,
        { shallow: true }
      );
      }
    }
    setTimeout(() => {
      setLoadingSubThreads(false);
    }, 1000);
  }, [subThreads]);
  const versionOptions = useMemo(() => {
    return [
      { value: "all", label: "All Versions" },
      ...(bridgeVersionsArray?.map((version, index) => ({
        value: version,
        label: `Version ${index + 1}`
      })) || []),
    ];
  }, [bridgeVersionsArray]);

  const runSearch = useCallback(async (valueOverride) => {
    const rawValue =
      typeof valueOverride === "string"
        ? valueOverride
        : searchRef?.current?.value || searchParams?.message_id || "";

    if (!rawValue?.trim()) {
      return;
    }

    setPage(1);
    setHasMore(true);
    setFilterOption("all");
    dispatch(clearSubThreadData());
    setSearchLoading(true);

    try {
      const currentMessageId = searchParams?.message_id;
      const startDate = searchParams?.start;
      const endDate = searchParams?.end;

      const result = await dispatch(
        searchMessageHistoryAction({
          bridgeId: params?.id,
          keyword: rawValue,
          startDate,
          endDate,
        })
      );

      setSearchQuery(rawValue);
      const searchUrl = new URL(window.location.href);
      searchUrl.searchParams.set("version", searchParams?.version || "all");
      if (startDate) searchUrl.searchParams.set("start", startDate);
      if (endDate) searchUrl.searchParams.set("end", endDate);
      if (currentMessageId) {
        searchUrl.searchParams.set("message_id", currentMessageId);
      }
      router.push(searchUrl.pathname + searchUrl.search, undefined, { shallow: true });

      if (result?.data?.length) {
        const firstResult = result.data[0];
        const threadId = encodeURIComponent(firstResult.thread_id.replace(/&/g, "%26"));
        const subThreadId = encodeURIComponent(
          firstResult.sub_thread?.[0]?.sub_thread_id || threadId
        );

        const resultUrl = new URL(window.location.href);
        resultUrl.searchParams.set("version", searchParams?.version || "all");
        resultUrl.searchParams.set("thread_id", threadId);
        resultUrl.searchParams.set("subThread_id", subThreadId);
        if (startDate) resultUrl.searchParams.set("start", startDate);
        if (endDate) resultUrl.searchParams.set("end", endDate);
        if (currentMessageId) {
          resultUrl.searchParams.set("message_id", currentMessageId);
        }

        router.push(resultUrl.pathname + resultUrl.search, undefined, { shallow: true });
      } else {
        dispatch(clearThreadData());
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearchLoading(false);
    }
  }, [
    dispatch,
    params?.id,
    router,
    searchParams,
    setFilterOption,
    setHasMore,
    setPage,
  ]);

  const clearInput = useCallback(async () => {
    if (searchRef?.current) searchRef.current.value = "";
    const currentSearchParams = new URL(window.location.href);
    currentSearchParams.searchParams.delete("message_id");
    router.push(currentSearchParams.pathname + currentSearchParams.search, undefined, {
      shallow: true,
    });
    
    setPage(1);
    setHasMore(true);
    setFilterOption("all");
    
    try {
      // Fetch regular history data
      const result = await dispatch(getHistoryAction(
        params?.id,  
        1, 
        filterOption, 
        isErrorTrue, 
        selectedVersion
      ));
      let nextThreadRawId = result?.[0]?.thread_id || searchParams?.thread_id || null;
      if (result?.length) {
        const firstResult = result[0];
        const threadId = encodeURIComponent(firstResult.thread_id.replace(/&/g, '%26'));
        const subThreadId = encodeURIComponent(firstResult.sub_thread?.[0]?.sub_thread_id || threadId.replace(/&/g, '%26'));

        // Navigate to first result without search parameters
        const clearUrl = new URL(window.location.href);
        clearUrl.searchParams.set('version', searchParams?.version || 'all');
        clearUrl.searchParams.set('thread_id', threadId);
        clearUrl.searchParams.set('subThread_id', subThreadId);
        if (searchParams?.start) clearUrl.searchParams.set('start', searchParams.start);
        if (searchParams?.end) clearUrl.searchParams.set('end', searchParams.end);

        router.push(clearUrl.pathname + clearUrl.search, undefined, { shallow: true });
      }

      if (nextThreadRawId) {
        setLoadingSubThreads(true);
        dispatch(clearSubThreadData());
        try {
          await dispatch(
            getSubThreadsAction({
              thread_id: nextThreadRawId,
              error: isErrorTrue,
              bridge_id: params.id,
              version_id: selectedVersion
            })
          );
          setExpandedThreads([nextThreadRawId]);
        } finally {
          setLoadingSubThreads(false);
        }
      }
      
      if (result?.length < 40) setHasMore(false);

    } catch (error) {
      console.error("Clear search error:", error);
    }
  }, [
    dispatch,
    filterOption,
    isErrorTrue,
    params?.id,
    router,
    searchParams,
    selectedVersion,
    setFilterOption,
    setHasMore,
    setLoadingSubThreads,
    setPage,
    setExpandedThreads,
  ]);

  const debouncedSearch = useDebouncedCallback(
    (value) => {
      runSearch(value);
    },
    400,
    [runSearch]
  );

  useEffect(() => {
    if (searchParams?.message_id) {
      const messageId = searchParams.message_id;
      setSearchQuery(messageId);
      if (searchRef?.current) {
        searchRef.current.value = messageId;
      }
      debouncedSearch.cancel();
      runSearch(messageId);
    }
  }, [debouncedSearch, dispatch, runSearch, searchParams?.message_id]);

  const handleInputChange = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchQuery(value);

      if (!value.trim()) {
        debouncedSearch.cancel();
        clearInput();
        return;
      }
      debouncedSearch(value);
    },
    [clearInput, debouncedSearch, dispatch]
  );

  const handleSearchSubmit = useCallback(
    (e) => {
      e?.preventDefault();
      debouncedSearch.cancel();
      runSearch();
    },
    [debouncedSearch, runSearch]
  );


  const handleThreadIds = (id) => {
    setSelectedThreadIds((prevIds) =>
      prevIds?.includes(id) ? prevIds?.filter((threadId) => threadId !== id) : [...prevIds, id]
    );
  };

  const handleToggleThread = async (threadId) => {
    const isExpanded = expandedThreads?.includes(threadId);
    if (isExpanded) {
      setExpandedThreads(prev => prev.filter(id => id !== threadId));
    } else {
      setExpandedThreads([threadId]);
      setLoadingSubThreads(true);
      await dispatch(getSubThreadsAction({ thread_id: threadId, error: isErrorTrue, bridge_id: params.id, version_id: selectedVersion }));
      setLoadingSubThreads(false);
    }
  };

  const truncate = (string = "", maxLength) =>
    string?.length > maxLength ? string?.substring(0, maxLength - 3) + "..." : string;

  const handleSetMessageId = (messageId) => {
    messageId ? setSearchMessageId(messageId) : toast.error("Message ID null or not found");
  };

  const handleSelectSubThread = async (subThreadId, threadId) => {
    setThreadPage(1);
    setExpandedThreads([threadId]);
    const start = searchParams?.start;
    const end = searchParams?.end;
    router.push(`${pathName}?version=${searchParams?.version}&thread_id=${encodeURIComponent(threadId ? threadId : searchParams?.thread_id.replace(/&/g, '%26'))}&subThread_id=${encodeURIComponent(subThreadId.replace(/&/g, '%26'))}&start=${start}&end=${end}${searchParams?.message_id ? `&message_id=${searchParams.message_id}` : ''}`, undefined, { shallow: true });
  };

  const handleFilterChange = async user_feedback => {
    setFilterOption(user_feedback);
    setThreadPage(1);
    // dispatch(userFeedbackCountAction({ bridge_id: params?.id, user_feedback }));
  };

  const Skeleton = ({ count = 3 }) => (
    <div className="pl-4 p-2">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-6 bg-base-300 rounded-md mb-2"></div>
        </div>
      ))}
    </div>
  );

  const NoDataFound = () => (
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
  );

  const handleCheckError = async (isError) => {
    if (isError === true) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('error', 'true');
      const queryString = newSearchParams.toString();
      await dispatch(getHistoryAction(params.id, 1, filterOption, true, selectedVersion));
      setThreadPage(1);
      setIsErrorTrue(true);
      setHasMore(true);
      dispatch(clearThreadData());
      window.history.replaceState(null, '', `?${queryString}`);
    }
    else {
      setIsErrorTrue(false);
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('error');
      const queryString = newSearchParams.toString();
      await dispatch(getHistoryAction(params.id, 1, filterOption, false, selectedVersion));
      setThreadPage(1);
      setHasMore(true);
      window.history.replaceState(null, '', `?${queryString}`);
    }
  }

  return (
    <div className="drawer-side justify-items-stretch text-xs bg-base-200 min-w-[290px] max-w-[290px] border-r border-base-300 relative" id="sidebar">
      <CreateFineTuneModal params={params} selectedThreadIds={selectedThreadIds} />
      <div className="p-3 gap-3 flex flex-col">
        <div className="rounded-xl border border-base-300 bg-base-100 shadow-sm p-3 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-base-content/70">Search Threads</p>
            {searchLoading && <span className="loading loading-spinner loading-xs text-primary" />}
          </div>
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              ref={searchRef}
              placeholder="Search by ID or keyword"
              onChange={handleInputChange}
              className="input input-bordered input-sm w-full pr-16 text-xs"
            />
            <div className="absolute inset-y-0 right-2 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearInput}
                  className="btn btn-ghost btn-xs px-2 text-[10px] uppercase tracking-wide"
                >
                  Clear
                </button>
              )}
              <button
                type="submit"
                className="btn btn-primary btn-xs px-2"
                aria-label="Run search"
              >
                Go
              </button>
            </div>
          </form>
          <div className="grid grid-cols-2 gap-2">
            <select
              className="select select-bordered select-sm w-full text-xs"
              value={selectedVersion}
              onChange={handleVersionChange}
            >
              {versionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <label className="flex items-center justify-between gap-2 border border-base-300 rounded-lg px-3 py-1.5 text-xs bg-base-200/60">
              <span>Show error chats</span>
              <input
                type="checkbox"
                className="toggle toggle-xs"
                checked={isErrorTrue}
                onChange={() => handleCheckError(!isErrorTrue)}
              />
            </label>
          </div>
        </div>

        <details className="group rounded-xl border border-dashed border-base-300 bg-base-100/80 p-3 transition-all">
          <summary className="cursor-pointer flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-base-content/70">
            <span>Advanced Filters</span>
            <ChevronDownIcon size={14} className="transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-3 space-y-3">
            <DateRangePicker
              params={params}
              setFilterOption={setFilterOption}
              setHasMore={setHasMore}
              setPage={setPage}
              selectedVersion={selectedVersion}
              filterOption={filterOption}
              isErrorTrue={isErrorTrue}
            />

            <div>
              <p className="text-xs font-medium text-base-content/80 mb-2">User Feedback</p>
              <div className="flex flex-wrap gap-2">
                {USER_FEEDBACK_FILTER_OPTIONS?.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleFilterChange(value)}
                    className={`px-3 py-1 rounded-full text-[11px] border transition-colors ${
                      filterOption === value
                        ? "bg-primary text-base-100 border-primary"
                        : "border-base-300 text-base-content/70 hover:border-base-400"
                    } flex items-center gap-1`}
                  >
                    {value === "all" ? (
                      "All"
                    ) : value === "1" ? (
                      <>
                        <ThumbsUpIcon size={12} /> Good
                      </>
                    ) : (
                      <>
                        <ThumbsDownIcon size={12} /> Bad
                      </>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-base-content/70 mt-2">
                {`The ${
                  filterOption === "all" ? "overall" : filterOption === "1" ? "positive" : "negative"
                } feedback count is ${
                  userFeedbackCount?.[filterOption === "all" ? 0 : filterOption === "1" ? 1 : 2] ?? 0
                }`}
              </p>
            </div>
          </div>
        </details>
      </div>
      <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>

      {/* Fixed: Render search loader at the top level, not inside InfiniteScroll */}
      <div className="flex-1 overflow-hidden">
        {searchLoading ? (
          <Skeleton count={8} />
        ) : loading ? (
          <div className="flex justify-center items-center bg-base-200 h-full">
          </div>
        ) : displayData.length === 0 ? (
          <NoDataFound />
        ) : (
          <InfiniteScroll
            dataLength={displayData.length}
            next={isSearchActive ? () => {} : fetchMoreData}
            hasMore={isSearchActive ? false : hasMore}
            loader={<h4></h4>}
            scrollableTarget="sidebar"
          >
            <div className="slider-container min-w-[45%] w-full overflow-x-auto pb-20">
              <ul className="menu min-h-full text-base-content flex flex-col space-y-1">
                {displayData.map((item) => (
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
                        className={`${decodeURIComponent(searchParams?.thread_id) === item?.thread_id
                          ? "text-base-100 bg-primary hover:text-base-100 hover:bg-primary rounded-md"
                          : ""
                          } flex-grow cursor-pointer group`}
                        onClick={() => {
                          const isCurrentlySelected = decodeURIComponent(searchParams?.thread_id) === item?.thread_id;
                          
                          if (isCurrentlySelected && !searchQuery) {
                            // If thread is already selected and no search query, toggle dropdown
                            handleToggleThread(item?.thread_id);
                          } else {
                            // Otherwise, select the thread
                            threadHandler(item?.thread_id);
                          }
                        }}
                      >
                        <a className="w-full h-full flex items-center justify-between relative">
                          <span className="truncate flex-1 mr-1.5 text-xs">{truncate(item?.thread_id, 30)}</span>
                          <span className="text-xs whitespace-nowrap flex-shrink-0 mr-2 transition-opacity duration-200">
                            {formatRelativeTime(item?.updated_at)}
                          </span>
                          {/* Tooltip for full thread ID on hover */}
                          {item?.thread_id?.length > 35 && (
                            <div className="absolute left-0 top-full mt-1 bg-gray-800 text-white text-xs rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-low max-w-[260px] break-words shadow-lg pointer-events-none">
                              {item?.thread_id}
                            </div>
                          )}
                          {/* Show chevron button only when no search query */}
                          {!searchQuery && decodeURIComponent(searchParams?.thread_id) === item?.thread_id && (
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
                      {decodeURIComponent(searchParams?.thread_id) === searchParams?.thread_id && !isSearchActive && 
                        expandedThreads?.includes(item?.thread_id) && (
                        <>
                          {loadingSubThreads ? (
                            <Skeleton />
                          ) : (
                            <div className="pl-4 p-1.5 text-base-content text-xs rounded-x-lg rounded-b-lg shadow-sm bg-base-100 overflow-hidden">
                              <ul>
                                {subThreads?.length === 0 ? (
                                  <li className="text-xs p-1">No sub thread available</li>
                                ) : (
                                  [...subThreads]
                                    .sort((a, b) => {
                                      const aDate = new Date(a?.created_at || a?.createdAt || a?.updated_at || a?.updatedAt || 0).getTime();
                                      const bDate = new Date(b?.created_at || b?.createdAt || b?.updated_at || b?.updatedAt || 0).getTime();
                                      return bDate - aDate; // newest first
                                    })
                                    .map((subThreadId, index) => {
                                      return (
                                        <li
                                          key={index}
                                          className={`cursor-pointer ${searchParams?.subThread_id === subThreadId?.sub_thread_id
                                            ? "hover:bg-base-primary hover:text-base-100"
                                            : "hover:bg-base-300 hover:text-base-content"
                                            } rounded-md transition-all duration-200 text-xs ${searchParams?.subThread_id === subThreadId?.sub_thread_id
                                              ? "bg-primary text-base-100"
                                              : ""
                                            }`}
                                          onClick={() => handleSelectSubThread(subThreadId?.sub_thread_id, searchParams?.thread_id)}
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
                                      );
                                    })
                                )}
                              </ul>
                            </div>
                          )}
                        </>
                      )}
                      {decodeURIComponent(searchParams?.thread_id) === item?.thread_id && <div className="space-y-3">
                        <div key={item.id} className="rounded-x-lg rounded-b-lg shadow-sm bg-base-100 overflow-hidden">
                          {item?.sub_thread && item.sub_thread?.length > 0 && (
                            <div className="bg-base-100">
                              <div className="p-2">
                                <div className="space-y-1.5">
                                  {item?.sub_thread?.map((subThread, index) => (
                                    <div key={index}>
                                      <li className={`ml-4 ${decodeURIComponent(searchParams?.subThread_id) === subThread?.sub_thread_id
                                          ? "cursor-pointer hover:bg-base-primary hover:text-base-100 rounded-md transition-all duration-200 text-xs bg-primary text-base-100"
                                          : "cursor-pointer hover:bg-base-300 hover:text-base-content rounded-md transition-all duration-200 text-xs"
                                          } flex-grow group`}
                                        onClick={() => handleSelectSubThread(subThread?.sub_thread_id)}
                                      >
                                        <a className="w-full h-full flex items-center justify-between relative">
                                          <span className="truncate flex-1 mr-1.5 text-xs flex items-center">
                                            <MessageCircleIcon className={`w-3 h-3 mr-1.5 flex-shrink-0 ${searchParams?.subThread_id === subThread?.sub_thread_id ? 'text-base-100' : 'text-base-content'
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
                                      {subThread?.messages?.length > 0 && (<div className="mt-2 ml-4 space-y-2">
                                        {subThread?.messages?.map((msg, msgIndex) => (
                                          <div
                                            key={msgIndex}
                                            onClick={() => handleSetMessageId(msg?.message_id)}
                                            className={`cursor-pointer rounded-md transition-all duration-200 text-xs bg-base-100 hover:bg-base-200 text-base-content border-l-2 border-transparent hover:border-base-300`}
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
                                    className={`cursor-pointer p-2 rounded-md transition-all duration-200 text-xs bg-base-100 hover:bg-base-200 text-base-content hover:text-gray-800 border-l-2 border-transparent hover:border-base-300`}
                                  >
                                    <div className="flex items-start gap-1.5">
                                      <UserIcon className="w-2.5 h-2.5 mt-0.5 text-base-content" />
                                      <span>{truncate(msg?.message, 32)}</span>
                                    </div>
                                  </div>))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>}
                    </div>
                  </div>
                ))}
              </ul>
            </div>
          </InfiniteScroll>
        )}
      </div>
      {/* <div className="fixed bottom-2 left-12">
        {!isThreadSelectable && historyData?.length > 0 && (
          <button onClick={() => setIsThreadSelectable(true)} className="btn btn-primary btn-sm ml-20">
            Generate Fine tuning file
          </button>
        )}
        {isThreadSelectable && (
          <div className="flex gap-3 ml-20">
            <button
              onClick={() => openModal(MODAL_TYPE.FINE_TUNE_MODAL)}
              className="btn btn-primary"
              disabled={selectedThreadIds?.length === 0}
            >
              Download <DownloadIcon size={16} />
            </button>
            <button onClick={() => setIsThreadSelectable(false)} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        )}
      </div> */}
    </div>
  );
});

export default Sidebar;
