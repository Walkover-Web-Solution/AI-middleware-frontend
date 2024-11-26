import { getHistoryAction, getThread, userFeedbackCountAction } from "@/store/action/historyAction.js";
import { Download, ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useDispatch } from "react-redux";
import CreateFineTuneModal from "../modals/CreateFineTuneModal.js";
import DateRangePicker from "./dateRangePicker.js";
import { useCustomSelector } from "@/customHooks/customSelector.js";
import { useSearchParams } from "next/navigation.js";

const Sidebar = ({ historyData, selectedThread, threadHandler, fetchMoreData, hasMore, loading, params, setThreadPage, filterOption, setFilterOption}) => {
  const [isThreadSelectable, setIsThreadSelectable] = useState(false);
  const [selectedThreadIds, setSelectedThreadIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useDispatch();
  const searchRef = useRef();
  const search = useSearchParams();
  const { userFeedbackCount } = useCustomSelector((state) => ({
    userFeedbackCount: state?.historyReducer?.userFeedbackCount,
  }));

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const handleChange = debounce((e) => {
    setSearchQuery(e.target?.value);
    handleSearch(e);
  }, 500);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(getHistoryAction(params.id, null, null, 1, searchRef.current.value || ""));
  }

  const clearInput = () => {
    setSearchQuery('');
    searchRef.current.value = '';
    dispatch(getHistoryAction(params.id, null, null, 1, ""));
  }

  const handleDownload = async () => {
    document.getElementById('fine-tune-modal')?.showModal()
  };

  const handleThreadIds = (id) => {
    if (selectedThreadIds && selectedThreadIds.includes(id)) {
      setSelectedThreadIds(selectedThreadIds.filter((threadId) => threadId !== id));
    } else {
      setSelectedThreadIds([...selectedThreadIds, id]);
    }
  }

  const handleFilterChange = (user_feedback) => {
    const startDate = search.get("start");
    const endDate = search.get("end");
    setFilterOption(user_feedback);
    setThreadPage(1);
    dispatch(getThread(selectedThread, params.id, 1, user_feedback))
    dispatch(userFeedbackCountAction({bridge_id:params.id,user_feedback}));
  };

  return (
    <div className="drawer-side justify-items-stretch bg-base-200 border-r relative" id="sidebar">
      <CreateFineTuneModal params={params} selectedThreadIds={selectedThreadIds}/>
      <div className="p-2 gap-3 flex flex-col">
        <div className="p-2 bg-base-300 rounded-md text-center">
          <p className="text-center m-2 font-semibold">Filter Response</p>
          <div className="flex items-center justify-center mb-2 gap-4">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="filterOption"
                value="all"
                checked={filterOption === 'all'}
                onChange={() => handleFilterChange('all')}
                className="radio radio-primary"
              />
              <span>All</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="filterOption"
                value="1"
                checked={filterOption === '1'}
                onChange={() => handleFilterChange('1')}
                className="radio radio-success"
              />
              <ThumbsUp size={16} />
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="filterOption"
                value="2"
                checked={filterOption === '2'}
                onChange={() => handleFilterChange('2')}
                className="radio radio-error"
              />
              <ThumbsDown size={16}/>
            </label>
          </div>
          <p className={`text-xs text-base-content`}>
            {`The ${filterOption === 'all' ? 'All' : filterOption === '1' ? 'Good' : 'Bad'} User feedback for the bridge is ${userFeedbackCount}`}
          </p>
        </div>
        <div className="collapse collapse-arrow join-item border border-base-300">
          <input type="checkbox" className="peer" />
          <div className="collapse-title text-md font-medium peer-checked:bg-base-300 peer-checked:text-base-content">
            Advance Filter
          </div>
          <div className="collapse-content">
            <DateRangePicker params={params} />
          </div>
        </div>
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            ref={searchRef}
            placeholder="Search..."
            // value={searchQuery}
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
              style={{ fill: 'none', stroke: 'rgb(0, 0, 0)', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2 }}
            >
              <path id="primary" d="M19,19,5,5M19,5,5,19"></path>
            </svg>
          )}
        </form>
      </div>
      <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
      {loading ? (
        <div className="flex justify-center items-center bg-base-200 h-full">
          {/* Loading... */}
        </div>
      ) : (
        <InfiniteScroll dataLength={historyData.length} next={fetchMoreData} hasMore={hasMore} loader={<h4></h4>} scrollableTarget="sidebar">
          <div className="slider-container w-[fixed-width] overflow-x-auto mb-16">
            <ul className="menu min-h-full text-base-content flex flex-col space-y-2">
              {historyData.map((item) => (
                <div className="flex">
                  {isThreadSelectable && <div onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-lg mr-2 bg-white"
                      checked={selectedThreadIds?.includes(item.thread_id)}
                      onChange={() => handleThreadIds(item.thread_id)}
                    />
                  </div>}
                  <li
                    key={item.id}
                    className={`${selectedThread === item.thread_id
                      ? "text-base-100 bg-primary hover:text-base-100 hover:bg-primary rounded-md"
                      : ""
                      } flex-grow cursor-pointer`} // Add flex-grow and cursor-pointer
                    onClick={() => threadHandler(item.thread_id)}
                  >
                    <a className="block w-full h-full"> {/* Ensure the anchor takes full width and height */}
                      {item.thread_id}
                    </a>
                  </li>
                </div>

              ))}
            </ul>
          </div>
        </InfiniteScroll>
      )}
      <div className="fixed bottom-2 left-12">
        {!isThreadSelectable && historyData.length > 0 && <button onClick={() => { setIsThreadSelectable(true) }} className="btn btn-primary btn-sm">
          Generate Fine tunning file
        </button>}
        {
          isThreadSelectable && (
            <div className="flex gap-3">
              <button onClick={handleDownload} className="btn btn-primary" disabled={selectedThreadIds?.length === 0}>
                Download <Download size={16} />
              </button>
              <button onClick={() => setIsThreadSelectable(false)} className="btn bg-base-300">
                Cancel
              </button>
            </div>
          )
        }
      </div>
    </div>
  )
};

export default Sidebar;