'use client';
import { CircleX, Copy } from "lucide-react";
import { useEffect, useRef } from "react";
import { useCloseSliderOnEsc } from "./assistFile";
import { toast } from "react-toastify";

const ChatDetails = ({ selectedItem, setIsSliderOpen, isSliderOpen }) => {
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
    navigator.clipboard
      .writeText(JSON.stringify(content))
      .then(() => {
        toast.success(`Copied to clipboard`);
      })
      .catch((error) => {
        toast.error(`Error while copying to clipboard`);
        console.log(error);
      });
  };

  return (
    <div
      ref={sidebarRef}
      className={`fixed inset-y-0 right-0 border-l-2 ${isSliderOpen ? "w-full md:w-1/2 lg:w-1/3 opacity-100" : "w-0"
        } overflow-y-auto bg-base-200 transition-all duration-200 z-50`}
    >
      {selectedItem && (
        <aside className="flex flex-col h-screen overflow-y-auto">
          <div className="p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
              Chat Details
              </h2>
              <button onClick={() => setIsSliderOpen(false)} className="btn">
                <CircleX size={18} />
              </button>
            </div>
            <table className="mt-4 w-full">
              <tbody>
                {Object.entries(selectedItem).map(([key, value]) => (
                  <tr key={key} className="border-b">
                    <td className="text-sm capitalize p-2 font-medium">{key}:</td>
                    <td className="text-gray-600 p-2">
                      {typeof value === "object" ? (
                        <div className="relative">
                          <pre className="bg-gray-200 p-2 rounded text-sm overflow-auto">{JSON.stringify(value, null, 2)}</pre>
                          {key === "variables" && (
                            <div
                              className="absolute top-1 right-2 tooltip tooltip-primary tooltip-left bg-gray-200 p-1 rounded cursor-pointer"
                              onClick={() => copyToClipboard(value)}
                              data-tip="Copy variables"
                            >
                              <Copy size={20} />
                            </div>
                          )}
                        </div>
                      ) : (
                        value?.toString()
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </aside>
      )}
    </div>
  );
};

export default ChatDetails;