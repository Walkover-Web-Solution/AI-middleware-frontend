import { CircleX, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useCloseSliderOnEsc } from "./assistFile";
import { toast } from "react-toastify";

const ChatDetails = ({ selectedItem, setIsSliderOpen }) => {

   useEffect(() => {
    const closeSliderOnEsc = (event) => {
      if (event.key === "Escape") {
        setIsSliderOpen(false);
      }
    };

    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSliderOpen(false);
      }
    };

    document.addEventListener("keydown", closeSliderOnEsc);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", closeSliderOnEsc);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const sidebarRef = useRef(null);

  useCloseSliderOnEsc(setIsSliderOpen);
  // Removed useHandleClickOutside

  const copyToClipboard = (content) => {
    
    const keyValueArray = Object?.entries(content)?.map(([key, value]) => {
      return `${key}:${value}`;
    });

    const data = keyValueArray.join("\n");

    navigator.clipboard
      .writeText(data)
      .then(() => {
        toast.success(`Copied to clipboard`);
      })
      .catch((error) => {
        toast.error(`Error while copy to clipboard`);
        console.log(error);
      });
  };

  return (
    <div ref={sidebarRef} className="scrollbar-hide text-justify overflow-auto  fixed top-0 right-0 h-screen w-[45%] bg-gray-100 shadow-lg z-50  transition-all ease-in duration-500 p-[20px]">
      <aside className="scrollbar-hide flex w-full flex-col transition-opacity duration-500 ease-in-out opacity-100">
        <div className=" px-[20px]">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-base-content">Chat Details</h2>
            <button onClick={() => setIsSliderOpen(false)} className="btn ">
             <CircleX size={16} />
            </button>
          </div>
          <ul className="mt-4">
            {Object.entries(selectedItem).map(([key, value]) => (
              <li key={key} className="mb-2">
                <strong className="font-medium text-base-content capitalize">{key}:</strong>
                <span className="ml-2 text-base-content">
                  {typeof value === "object" ? (
                    <pre className="bg-gray-200 p-2 rounded text-sm flex  justify-between items-start">
                           {JSON.stringify(value, null, 2)}
                           {key==="variables"? <div
                              className="tooltip tooltip-primary"
                              onClick={() =>key==="variables" ?  copyToClipboard(value) : ""}
                              data-tip="copy variables"
                            >
                              <a>
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <g clip-path="url(#clip0_7_7)">
                                    <path
                                      d="M7 6V3C7 2.73478 7.10536 2.48043 7.29289 2.29289C7.48043 2.10536 7.73478 2 8 2H20C20.2652 2 20.5196 2.10536 20.7071 2.29289C20.8946 2.48043 21 2.73478 21 3V17C21 17.2652 20.8946 17.5196 20.7071 17.7071C20.5196 17.8946 20.2652 18 20 18H17V21C17 21.552 16.55 22 15.993 22H4.007C3.87513 22.0008 3.7444 21.9755 3.62232 21.9256C3.50025 21.8757 3.38923 21.8022 3.29566 21.7093C3.20208 21.6164 3.12779 21.5059 3.07705 21.3841C3.02632 21.2624 3.00013 21.1319 3 21L3.003 7C3.003 6.448 3.453 6 4.01 6H7ZM5.003 8L5 20H15V8H5.003ZM9 6H17V16H19V4H9V6Z"
                                      fill="#03053D"
                                    />
                                  </g>
                                  <defs>
                                    <clipPath id="clip0_7_7">
                                      <rect
                                        width="24 "
                                        height="24"
                                        fill="white"
                                      />
                                    </clipPath>
                                  </defs>
                                </svg>
                              </a>
                            </div>:""}
                           
                          </pre>) : (
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