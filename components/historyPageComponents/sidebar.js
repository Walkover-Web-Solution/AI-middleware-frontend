import InfiniteScroll from "react-infinite-scroll-component";
import DateRangePicker from "./dateRangePicker.js";

const Sidebar = ({ historyData, selectedThread, threadHandler, fetchMoreData, hasMore, loading , params}) => (

  <div className="drawer-side bg-base-200 border-r" id="sidebar">
    <DateRangePicker params={params}/>
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
);

export default Sidebar;
