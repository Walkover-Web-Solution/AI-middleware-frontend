import InfiniteScroll from "react-infinite-scroll-component";
import DateRangePicker from "./dateRangePicker.js";
import { useDispatch } from "react-redux";
import { getHistoryAction } from "@/store/action/historyAction.js";
import { useRef, useState } from "react";

const Sidebar = ({ historyData, selectedThread, threadHandler, fetchMoreData, hasMore, loading, params }) => {

  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useDispatch();
  const searchRef = useRef();
  const handleChange = (e) => {
    setSearchQuery(e.target?.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(getHistoryAction(params.id, null, null, 1, searchRef.current.value || ""));
  }

  const clearInput = () => {
    setSearchQuery('');
    dispatch(getHistoryAction(params.id, null, null, 1, ""));
  }

  return (
    <div className="drawer-side bg-base-200 border-r" id="sidebar">
      <div className="p-4 gap-3 flex flex-col">
        <div className="collapse collapse-arrow join-item border border-base-300">
          <input type="checkbox" className="peer" />
          <div className="collapse-title text-lg font-medium peer-checked:bg-base-300 peer-checked:text-base-content">
            Add Filter
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
            value={searchQuery}
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
          <ul className="menu min-h-full text-base-content">
            {historyData.map((item) => (
              <li key={item.id} onClick={() => threadHandler(item.thread_id)}>
                <a className={`${selectedThread === item.thread_id ? "text-base-100 bg-primary hover:text-base-100 hover:bg-primary" : ""} block  truncate`}>{item.thread_id}</a>
              </li>
            ))}
          </ul>
        </InfiniteScroll>
      )}
    </div>
  )
};

export default Sidebar;