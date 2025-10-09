import { useCustomSelector } from "@/customHooks/customSelector.js";
import { getHistoryAction, getSubThreadsAction, getThread, userFeedbackCountAction } from "@/store/action/historyAction.js";
import { clearSubThreadData, clearThreadData } from "@/store/reducer/historyReducer.js";
import { MODAL_TYPE, USER_FEEDBACK_FILTER_OPTIONS } from "@/utils/enums.js";
import { openModal } from "@/utils/utility.js";
import { DownloadIcon, ThumbsDownIcon, ThumbsUpIcon, ChevronDownIcon, ChevronUpIcon, UserIcon, MessageCircleIcon } from "@/components/Icons";
import { useEffect, useState, memo, useCallback } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import CreateFineTuneModal from "../modals/CreateFineTuneModal.js";
import DateRangePicker from "./dateRangePicker.js";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation.js";
import { setSelectedVersion } from '@/store/reducer/historyReducer';
import { FileTextIcon } from "lucide-react";

const Sidebar = memo(({ historyData, threadHandler, fetchMoreData, hasMore, loading, params, searchParams, setSearchMessageId, setPage, setHasMore, filterOption, setFilterOption, searchRef, setThreadPage, setHasMoreThreadData, selectedVersion, setIsErrorTrue, isErrorTrue }) => {
  const { subThreads } = useCustomSelector(state => ({
    subThreads: state?.historyReducer?.subThreads || [],
  }));

  const [isThreadSelectable, setIsThreadSelectable] = useState(false);
  const [selectedThreadIds, setSelectedThreadIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedThreads, setExpandedThreads] = useState([]);
  const [loadingSubThreads, setLoadingSubThreads] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const dispatch = useDispatch();
  const pathName = usePathname();
  const router = useRouter();

  const { userFeedbackCount } = useCustomSelector(state => ({
    userFeedbackCount: state?.historyReducer?.userFeedbackCount,
  }));
  const { bridgeVersionsArray } = useCustomSelector(
    (state) => ({
      bridgeVersionsArray: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.versions || [],
    })

  );

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
            `${pathName}?version=${searchParams?.version}&thread_id=${thread_id}&subThread_id=${firstSubThreadIdEncoded}`,
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
          `${pathName}?version=${searchParams.version}&thread_id=${searchParams.thread_id}&subThread_id=${firstSubThreadId}&start=${start || ''}&end=${end || ''}`,
          undefined,
          { shallow: true }
        );
      }

    }
    else{
      if(searchParams?.thread_id){
      router.push(
        `${pathName}?version=${searchParams.version}&thread_id=${searchParams.thread_id}&subThread_id=${searchParams.thread_id}&start=${searchParams.start||''}&end=${searchParams.end||''}`,
        undefined,
        { shallow: true }
      );
      }
    }  
    setTimeout(() => {
      setLoadingSubThreads(false);
    }, 1000);
  }, [subThreads]);
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const handleChange = useCallback(debounce((e) => {
    setSearchQuery(e?.target?.value);
    handleSearch(e);
  }, 500), [setSearchQuery]);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (e.target.value === '') {
      clearInput();
      return;
    }

    setSearchLoading(true);
    setPage(1);
    setHasMore(true);
    setFilterOption("all");
    dispatch(clearSubThreadData());

    try {
      const searchValue = searchRef?.current?.value || "";
      const result = await dispatch(
        getHistoryAction(params?.id, null, null, 1, searchValue, filterOption, isErrorTrue, selectedVersion)
      );
      router.push(
        `${pathName}?version=${searchParams?.version}`,
        undefined,
        { shallow: true }
      );
      if (result?.length) {
        const firstResult = result[0];
        const threadId = encodeURIComponent(firstResult.thread_id.replace(/&/g, '%26'));
        const subThreadId = encodeURIComponent(firstResult.sub_thread?.[0]?.sub_thread_id || threadId.replace(/&/g, '%26'));

        router.push(
          `${pathName}?version=${searchParams?.version}&thread_id=${threadId}&subThread_id=${subThreadId}&start=&end=`,
          undefined,
          { shallow: true }
        );
      }
      else {
        dispatch(clearThreadData())
      }



      if (result?.length < 40) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearInput = async () => {
    setSearchQuery("");
    if (searchRef?.current) searchRef.current.value = "";
    setSearchLoading(true);
    setPage(1);
    setHasMore(true);
    setFilterOption("all");
    try {
      const result = await dispatch(getHistoryAction(params?.id, null, null, 1, searchRef?.current?.value || ""));
      if (result?.length) {
        const firstResult = result[0];
        const threadId = encodeURIComponent(firstResult.thread_id.replace(/&/g, '%26'));
        const subThreadId = encodeURIComponent(firstResult.sub_thread?.[0]?.sub_thread_id || threadId.replace(/&/g, '%26'));

        router.push(
          `${pathName}?version=${searchParams?.version}&thread_id=${threadId}&subThread_id=${subThreadId}&start=&end=`,
          undefined,
          { shallow: true }
        );
      }
      if (result?.length < 40) setHasMore(false);
    } catch (error) {
      console.error("Clear search error:", error);
    } finally {
      setSearchLoading(false);
    }
  };

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
    router.push(`${pathName}?version=${searchParams?.version}&thread_id=${encodeURIComponent(threadId ? threadId : searchParams?.thread_id.replace(/&/g, '%26'))}&subThread_id=${encodeURIComponent(subThreadId.replace(/&/g, '%26'))}&start=${start}&end=${end}`, undefined, { shallow: true });
  };

  const handleFilterChange = async user_feedback => {
    setFilterOption(user_feedback);
    setThreadPage(1);
    dispatch(userFeedbackCountAction({ bridge_id: params?.id, user_feedback }));
  };

  const Skeleton = ({ count = 3 }) => (
    <div className="pl-4 p-2">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-md mb-2"></div>
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
      await dispatch(getHistoryAction(params.id, null, null, 1, null, filterOption, true, selectedVersion));
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
      await dispatch(getHistoryAction(params.id, null, null, 1, null, filterOption, false, selectedVersion));
      setThreadPage(1);
      setHasMore(true);
      window.history.replaceState(null, '', `?${queryString}`);
    }
  }

  return (
    <div className="drawer-side justify-items-stretch bg-base-200 min-w-[350px] max-w-[380px] border-r border-base-300 relative" id="sidebar">
      <CreateFineTuneModal params={params} selectedThreadIds={selectedThreadIds} />
      <div className="p-4 gap-3 flex flex-col">
        <div className="collapse collapse-arrow join-item border border-base-300">
          <input type="checkbox" className="peer" />
          <div className="collapse-title text-md font-medium peer-checked:bg-base-300 peer-checked:text-base-content">
            Advance Filter
          </div>
          <div className="collapse-content">
            <DateRangePicker params={params} setFilterOption={setFilterOption} setHasMore={setHasMore} setPage={setPage} selectedVersion={selectedVersion} filterOption={filterOption} isErrorTrue={isErrorTrue}/>
            <div className="p-2 mt-4 bg-base-300 rounded-md text-center">
              <p className="text-center m-2 font-semibold">Filter Response</p>
              <div className="flex items-center justify-center mb-2 gap-4">
                {USER_FEEDBACK_FILTER_OPTIONS?.map((value, index) => (
                  <label key={index} className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="filterOption"
                      value={value}
                      checked={filterOption === value}
                      onChange={() => handleFilterChange(value)}
                      className={`radio ${value === "all" ? "radio-primary" : value === "1" ? "radio-success" : "radio-error"}`}
                    />
                    {value === "all" ? <span>All</span> : value === "1" ? <ThumbsUpIcon size={16} /> : <ThumbsDownIcon size={16} />}
                  </label>
                ))}
              </div>
              <p className="text-xs text-base-content">
                {`The ${filterOption === "all" ? "All" : filterOption === "1" ? "Good" : "Bad"} User feedback for the agent is ${userFeedbackCount}`}
              </p>

              <div className="flex items-center justify-center gap-2 mt-4">
                <span className="text-sm">
                  Show Error Chat History
                </span>
                <input type="checkbox" className="toggle" checked={isErrorTrue} onChange={() => handleCheckError(!isErrorTrue)} />
              </div>
            </div>
          </div>
        </div>
        <div className='flex items-center'>
          <select
            className="select select-bordered w-full max-w-xs"
            value={selectedVersion}
            onChange={handleVersionChange}
          >
            <option value="all">All Versions</option>
            {bridgeVersionsArray?.map((version, index) => (
              <option
                key={version}
                value={version}
              >
                Version {index + 1}
              </option>
            ))}
          </select>
        </div>
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            ref={searchRef}
            placeholder="Search..."
            onChange={handleChange}
            className="border border-base-300 rounded p-2 w-full pr-10"
          />
          {searchQuery && (
            <svg
              fill="#000000"
              width="20px"
              height="20px"
              viewBox="0 0 24 24"
              id="cross"
              data-name="Flat Line"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute right-3 top-3 cursor-pointer"
              onClick={clearInput}
              style={{ fill: "none", stroke: "rgb(0, 0, 0)", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2 }}
            >
              <path id="primary" d="M19,19,5,5M19,5,5,19"></path>
            </svg>
          )}
        </form>
      </div>
      <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>

      {/* Fixed: Render search loader at the top level, not inside InfiniteScroll */}
      <div className="flex-1 overflow-hidden">
        {searchLoading ? (
          <Skeleton count={8} />
        ) : loading ? (
          <div className="flex justify-center items-center bg-base-200 h-full">
          </div>
        ) : historyData?.length === 0 ? (
          <NoDataFound />
        ) : (
          <InfiniteScroll
            dataLength={historyData?.length}
            next={fetchMoreData}
            hasMore={!searchQuery && hasMore}
            loader={<h4></h4>}
            scrollableTarget="sidebar"
          >
            <div className="slider-container min-w-[40%] overflow-x-auto pb-40">
              <ul className="menu min-h-full text-base-content flex flex-col space-y-2">
                {historyData?.map((item) => (
                  <div className={`${isThreadSelectable ? "flex" : "flex-col"}`} key={item?.thread_id}>
                    {isThreadSelectable && (
                      <div onClick={(e) => e?.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="checkbox checkbox-lg mr-2 bg-base-100"
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
                          } flex-grow cursor-pointer`}
                        onClick={() => threadHandler(item?.thread_id)}
                      >
                        <a className="w-full h-full flex items-center justify-between relative group">
                          <span className="truncate flex-1 mr-3 w-[160px] pr-2">{truncate(item?.thread_id, 35)}</span>
                          {item?.thread_id?.length > 35 && (
                            <div className="absolute left-0 top-full mt-1 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-low max-w-[300px] break-words shadow-lg pointer-events-none">
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
                              className="absolute right-4 cursor-pointer"
                            >
                              {expandedThreads?.includes(item?.thread_id) ? (
                                <ChevronUpIcon size={16} />
                              ) : (
                                <ChevronDownIcon size={16} />
                              )}
                            </div>
                          )}
                        </a>
                      </li>
                      {decodeURIComponent(searchParams?.thread_id) === searchParams?.thread_id &&
                        expandedThreads?.includes(item?.thread_id) && (
                        <>
                          {loadingSubThreads ? (
                            <Skeleton />
                          ) : (
                            <div className="pl-10 p-2 text-base-content text-sm rounded-x-lg rounded-b-lg shadow-sm bg-base-100 overflow-hidden">
                              <ul>
                                {subThreads?.length === 0 ? (
                                  <li>No sub thread available</li>
                                ) : (
                                  subThreads?.map((subThreadId, index) => (
                                    <li
                                      key={index}
                                      className={`cursor-pointer ${searchParams?.subThread_id === subThreadId?.sub_thread_id
                                        ? "hover:bg-base-primary hover:text-base-100"
                                        : "hover:bg-base-300 hover:text-base-content"
                                        } p-2 rounded-md transition-all duration-200 ${searchParams?.subThread_id === subThreadId?.sub_thread_id
                                          ? "bg-primary text-base-100"
                                          : ""
                                        }`}
                                      onClick={() => handleSelectSubThread(subThreadId?.sub_thread_id, searchParams?.thread_id)}
                                    >
                                      {truncate(subThreadId?.display_name || subThreadId?.sub_thread_id, 35)}
                                    </li>
                                  ))
                                )}
                              </ul>
                            </div>
                          )}
                        </>
                      )}
                      {decodeURIComponent(searchParams?.thread_id) === item?.thread_id && <div className="space-y-6">
                        <div key={item.id} className="rounded-x-lg rounded-b-lg shadow-sm bg-base-100 overflow-hidden">
                          {item?.sub_thread && item.sub_thread?.length > 0 && (
                            <div className="bg-base-100">
                              <div className="p-4">
                                <div className="space-y-2">
                                  {item?.sub_thread?.map((subThread, index) => (
                                    <div key={index} className="ml-4">
                                      <div
                                        onClick={() => handleSelectSubThread(subThread?.sub_thread_id)}
                                        className={`cursor-pointer p-3 rounded-lg transition-all duration-200 border-2 ${decodeURIComponent(searchParams?.subThread_id) === subThread?.sub_thread_id
                                          ? 'bg-base-200 border-primary text-base-content'
                                          : 'bg-base-100 border-base-200 hover:bg-base-200 hover:border-base-300 text-base-content'
                                          }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <MessageCircleIcon className={`w-4 h-4 ${searchParams?.subThread_id === subThread?.sub_thread_id ? 'text-primary' : 'text-base-content'
                                            }`} />
                                          <span
                                            className="font-medium text-sm"
                                          >
                                            {truncate(subThread?.display_name || subThread?.sub_thread_id, 35)}
                                          </span>
                                        </div>
                                      </div>
                                      {subThread?.messages?.length > 0 && (<div className="mt-2 ml-6 space-y-1">
                                        {subThread?.messages?.map((msg, msgIndex) => (
                                          <div
                                            key={msgIndex}
                                            onClick={() => handleSetMessageId(msg?.message_id)}
                                            className={`cursor-pointer p-2 rounded-md transition-all duration-200 text-sm bg-base-100 hover:bg-base-200 text-base-content hover:text-gray-800 border-l-4 border-transparent hover:border-base-300`}
                                          >
                                            <div className="flex items-start gap-2">
                                              <UserIcon className="w-3 h-3 mt-0.5 text-base-content" />
                                              <span>{truncate(msg?.message, 45)}</span>
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
                            <div className="p-4">
                              <div className="space-y-2 ml-4">
                                {item?.message?.map((msg, index) => (
                                  <div
                                    key={index}
                                    onClick={() => handleSetMessageId(msg?.message_id)}
                                    className={`cursor-pointer p-3 rounded-md transition-all duration-200 text-sm bg-base-100 hover:bg-base-200 text-base-content hover:text-gray-800 border-l-4 border-transparent hover:border-base-300`}
                                  >
                                    <div className="flex items-start gap-2">
                                      <UserIcon className="w-3 h-3 mt-0.5 text-base-content" />
                                      <span>{truncate(msg?.message, 45)}</span>
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
      <div className="fixed bottom-2 left-12">
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
      </div>
    </div>
  );
});

export default Sidebar;