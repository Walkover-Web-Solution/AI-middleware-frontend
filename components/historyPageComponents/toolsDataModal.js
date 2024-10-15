import { CircleX } from "lucide-react";

const ToolsDataModal = ({ toolsData, handleClose, toolsDataModalRef, integrationData }) => {
  const formatValue = (value) => {
    if (typeof value === "string" && (value.startsWith("{") || value.startsWith("["))) {
      try {
        const parsedValue = JSON.parse(value);
        return JSON.stringify(parsedValue, null, 2); 
      } catch (error) {
        return value; 
      }
    }
    return JSON.stringify(value, null, 2);
  };

  return (
    <dialog className="modal modal-middle mx-auto outline-none" ref={toolsDataModalRef}>
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-[80%] max-w-[80vw] overscroll-none">
        <h2 className="font-bold mb-1">Function Data:</h2>
        <div className="overflow-y-scroll max-h-[70vh] max-w-auto overflow-x-hidden">
          {toolsData ? (
            <>
              <div className="mt-4">
                {Object.entries(toolsData).map(([key, value], index) => (
                  <div key={index} className="flex items-start gap-2 mb-2 overflow-x-auto">
                    <span className="w-28 capitalize">{key}:</span>
                    <span className="flex-1">
                      {key === "name" && integrationData[value] ? (
                        <p>
                          {integrationData[value]?.title} <span>({value})</span>
                        </p>
                      ) : (
                        <div className="max-w-full ">
                          <pre className="text-sm bg-gray-100 p-2 rounded ">
                            {formatValue(value)}
                          </pre>
                        </div>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500">No tools call data available</p>
          )}
        </div>
        <div className="absolute top-4 right-5">
          <button
            className="hover:scale-110 transition-transform duration-300 ease-in-out focus:outline-none focus:border-none"
            onClick={handleClose}
          >
            <CircleX size={24} />
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default ToolsDataModal;
