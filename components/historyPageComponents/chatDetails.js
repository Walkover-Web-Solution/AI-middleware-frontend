import { X } from "lucide-react";
import { useRef } from "react";
import { useCloseSliderOnEsc } from "./assistFile";

const ChatDetails = ({ selectedItem, setIsSliderOpen }) => {
  const sidebarRef = useRef(null);

  useCloseSliderOnEsc(setIsSliderOpen);
  // Removed useHandleClickOutside

  return (
    <div ref={sidebarRef} className=" ">
      <aside className="flex w-full flex-col h-screen overflow-y-auto transition-opacity duration-500 ease-in-out opacity-100">
        <div className="p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-base-content">Chat Details</h2>
            <button onClick={() => setIsSliderOpen(false)} className="btn ">
              <X size={16} />
            </button>
          </div>
          <ul className="mt-4">
            {Object.entries(selectedItem).map(([key, value]) => (
              <li key={key} className="mb-2">
                <strong className="font-medium text-base-content capitalize">{key}:</strong>
                <span className="ml-2 text-base-content">
                  {typeof value === "object" ? (
                    <pre className=" p-2 rounded text-sm overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>
                  ) : (
                    value?.toString()
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default ChatDetails;