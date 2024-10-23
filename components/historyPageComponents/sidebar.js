import InfiniteScroll from "react-infinite-scroll-component";
import DateRangePicker from "./dateRangePicker.js";
import { useDispatch } from "react-redux";
import { getHistoryAction } from "@/store/action/historyAction.js";
import { useRef, useState } from "react";
import { Download } from "lucide-react";
import { downloadFineTuneData } from "@/config/index.js";

const Sidebar = ({ historyData, selectedThread, threadHandler, fetchMoreData, hasMore, loading, params }) => {
  const [isThreadSelectable, setIsThreadSelectable] = useState(false);
  const [selectedThreadIds, setSelectedThreadIds] = useState([]);
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

  const handleDownload = async () => {
    try {
      const response = await downloadFineTuneData(params.id, selectedThreadIds)

      const blob = new Blob([typeof response == 'object' ? JSON.stringify(response) : response], { type: 'application/jsonl;charset=utf-8;' });

      // Create a link element
      const link = document.createElement('a');
      if (link.download !== undefined) {
        // Set the href and download attributes for the link
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'data.jsonl');
        link.style.visibility = 'hidden';

        // Append the link to the body
        document.body.appendChild(link);

        // Programmatically click the link to trigger the download
        link.click();

        // Clean up and remove the link
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleThreadIds = (id) => {
    if (selectedThreadIds && selectedThreadIds.includes(id)) {
      setSelectedThreadIds(selectedThreadIds.filter((threadId) => threadId !== id));
    } else {
      setSelectedThreadIds([...selectedThreadIds, id]);
    }
  }

  return (
    <div className="drawer-side justify-items-stretch bg-base-200 border-r relative" id="sidebar">
      <div className="p-4 gap-3 flex flex-col">
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