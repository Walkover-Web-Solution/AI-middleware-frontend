import { useCustomSelector } from "@/customHooks/customSelector.js";
import { getHistoryAction, getSubThreadsAction, getThread, userFeedbackCountAction } from "@/store/action/historyAction.js";
import { clearSubThreadData } from "@/store/reducer/historyReducer.js";
import { MODAL_TYPE, USER_FEEDBACK_FILTER_OPTIONS } from "@/utils/enums.js";
import { openModal } from "@/utils/utility.js";
import { ChevronDown, ChevronUp, Download, ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useState, memo, useCallback } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import CreateFineTuneModal from "../modals/CreateFineTuneModal.js";
import DateRangePicker from "./dateRangePicker.js";
import { usePathname, useRouter } from "next/navigation.js";
import { setSelectedVersion } from '@/store/reducer/historyReducer';

const Sidebar = memo(({ historyData, threadHandler, fetchMoreData, hasMore, loading, params, setSearchMessageId, setPage, setHasMore, filterOption, setFilterOption, searchRef, setThreadPage, setHasMoreThreadData, selectedVersion}) => {
  const { subThreads } = useCustomSelector(state => ({
    subThreads: state?.historyReducer?.subThreads || [],
  }));

  const [isThreadSelectable, setIsThreadSelectable] = useState(false);
  const [selectedThreadIds, setSelectedThreadIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedThreads, setExpandedThreads] = useState([]);
  const [loadingSubThreads, setLoadingSubThreads] = useState(false);
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
  const handleVersionChange = async (event) => {
    const version = event.target.value;
    dispatch(setSelectedVersion(version));
  };

  useEffect(() => {
    setExpandedThreads([]);
  }, [params.thread_id]);

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
    setPage(1);
    setHasMore(true);
    setFilterOption("all");
    dispatch(clearSubThreadData());
    const result = await dispatch(getHistoryAction(params?.id, null, null, 1, searchRef?.current?.value || ""));
    if (result?.length < 40) setHasMore(false);
  };

  const clearInput = async () => {
    setSearchQuery("");
    if (searchRef?.current) searchRef.current.value = "";
    setPage(1);
    setHasMore(true);
    setFilterOption("all");
    const result = await dispatch(getHistoryAction(params?.id, null, null, 1, searchRef?.current?.value || ""));
    await dispatch(getThread(params.thread_id, params?.id, params.subThread_id || params.thread_id, 1, "all"));
    if (result?.length < 40) setHasMore(false);
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
      // setThreadPage(1);
      // const result = await dispatch(getThread({ threadId, bridgeId: params?.id, subThreadId: params?.subThread_id, nextPage: 1 }));
      // setHasMoreThreadData(result?.data?.length >= 40);
      // router.push(`${pathName}?version=${params.version}&thread_id=${threadId}&subThread_id=${threadId}`, undefined, { shallow: true });
    } else {
      setExpandedThreads([threadId]);
      setLoadingSubThreads(true);
      await dispatch(getSubThreadsAction({ thread_id: threadId }));
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
    router.push(`${pathName}?version=${params.version}&thread_id=${threadId}&subThread_id=${subThreadId}`, undefined, { shallow: true });
  };

  const handleFilterChange = async user_feedback => {
    setFilterOption(user_feedback);
    setThreadPage(1);
    dispatch(userFeedbackCountAction({ bridge_id: params?.id, user_feedback }));
  };

  const SubThreadSkeleton = () => (
    <div className="pl-10 p-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-md mb-2"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="drawer-side justify-items-stretch bg-base-200 min-w-[350px] max-w-[380px] border-r relative" id="sidebar">
      <CreateFineTuneModal params={params} selectedThreadIds={selectedThreadIds} />
      <div className="p-4 gap-3 flex flex-col">
        <div className="collapse collapse-arrow join-item border border-base-300">
          <input type="checkbox" className="peer" />
          <div className="collapse-title text-md font-medium peer-checked:bg-base-300 peer-checked:text-base-content">
            Advance Filter
          </div>
          <div className="collapse-content">
            <DateRangePicker params={params} setFilterOption={setFilterOption} />
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
                    {value === "all" ? <span>All</span> : value === "1" ? <ThumbsUp size={16} /> : <ThumbsDown size={16} />}
                  </label>
                ))}
              </div>
              <p className="text-xs text-base-content">
                {`The ${filterOption === "all" ? "All" : filterOption === "1" ? "Good" : "Bad"} User feedback for the bridge is ${userFeedbackCount}`}
              </p>
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
            className="border border-gray-300 rounded p-2 w-full pr-10"
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
      {loading ? (
        <div className="flex justify-center items-center bg-base-200 h-full">{/* Loading... */}</div>
      ) : (
        <InfiniteScroll
          dataLength={historyData?.length}
          next={fetchMoreData}
          hasMore={!searchQuery && hasMore}
          loader={<h4></h4>}
          scrollableTarget="sidebar"
        >
          <div className="slider-container min-w-[40%] overflow-x-auto mb-16">
            <ul className="menu min-h-full text-base-content flex flex-col space-y-2">
              {historyData?.map((item) => (
                <div className={`${isThreadSelectable ? "flex" : "flex-col"}`} key={item?.thread_id}>
                  {isThreadSelectable && (
                    <div onClick={(e) => e?.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-lg mr-2 bg-white"
                        checked={selectedThreadIds?.includes(item?.thread_id)}
                        onChange={() => handleThreadIds(item?.thread_id)}
                      />
                    </div>
                  )}
                  <li
                    className={`${params.thread_id === item?.thread_id
                      ? "text-base-100 bg-primary hover:text-base-100 hover:bg-primary rounded-md"
                      : ""
                      } flex-grow cursor-pointer`}
                    onClick={() => threadHandler(item?.thread_id)}
                  >
                    <a className={`w-full h-full flex items-center justify-between relative ${item?.thread_id?.length > 35 ? 'tooltip' : ''}`} data-tip={item?.thread_id?.length > 35 ? item?.thread_id : ''}>
                      <span>{truncate(`${item?.thread_id}`, 35)}</span>
                      {!searchQuery && params.thread_id === item?.thread_id && (
                        <div
                          onClick={(e) => {
                            e?.stopPropagation();
                            handleToggleThread(item?.thread_id);
                          }}
                          className="absolute right-4 cursor-pointer"
                        >
                          {!searchQuery && expandedThreads?.includes(item?.thread_id) ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </div>
                      )}
                    </a>
                  </li>
                  {params.thread_id === item?.thread_id && expandedThreads?.includes(item?.thread_id) && (
                    <>
                      {loadingSubThreads ? (
                        <SubThreadSkeleton />
                      ) : (
                        <div className="pl-10 p-2 text-gray-600 text-sm">
                          <ul>
                            {subThreads?.length === 0 ? (
                              <li>No sub thread available</li>
                            ) : (
                              subThreads?.map((subThreadId, index) => (
                                <li
                                  key={index}
                                  className={`cursor-pointer ${params.subThread_id === subThreadId?.sub_thread_id
                                    ? "hover:bg-base-primary hover:text-base-100"
                                    : "hover:bg-base-300 hover:text-gray-800"
                                    } p-2 rounded-md transition-all duration-200 ${params.subThread_id === subThreadId?.sub_thread_id
                                      ? "bg-primary text-base-100"
                                      : ""
                                    }`}
                                  onClick={() => handleSelectSubThread(subThreadId?.sub_thread_id, params.thread_id)}
                                >
                                  {subThreadId?.display_name || subThreadId?.sub_thread_id}
                                </li>
                              ))
                            )}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                  {item?.message && item?.message?.length > 0 && (
                    <div className="pl-10 pb-2 text-gray-600 text-sm">
                      {item?.message?.map((msg, index) => (
                        <div
                          key={index}
                          onClick={() => handleSetMessageId(msg?.message_id)}
                          className="cursor-pointer hover:bg-gray-100 hover:text-gray-800 p-2 rounded-md transition-all duration-200"
                        >
                          {truncate(msg?.message, 45)}
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
      <div className="fixed bottom-2 left-12">
        {!isThreadSelectable && historyData?.length > 0 && (
          <button onClick={() => setIsThreadSelectable(true)} className="btn btn-primary btn-sm">
            Generate Fine tuning file
          </button>
        )}
        {isThreadSelectable && (
          <div className="flex gap-3">
            <button
              onClick={() => openModal(MODAL_TYPE.FINE_TUNE_MODAL)}
              className="btn btn-primary"
              disabled={selectedThreadIds?.length === 0}
            >
              Download <Download size={16} />
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