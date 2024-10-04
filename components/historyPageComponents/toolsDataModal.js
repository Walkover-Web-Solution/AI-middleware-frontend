import { CircleX } from "lucide-react";

const ToolsDataModal = ({ toolsData, handleClose, toolsDataModalRef, integrationData }) => {
  return (
    <dialog className="modal modal-bottom sm:modal-middle" ref={toolsDataModalRef}>
      <div className="relative bg-white rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-[50%] p-6 max-h-[80%]">
        <h2 className="text-xl font-bold mb-4 ">Tools Call Data</h2>
        <div className="overflow-y-auto max-h-[50vh]">
          {toolsData && toolsData.function ? ( 
            <>
              <h3 className="text-lg font-semibold">Function Data:</h3>
              <div className="mt-4">
                {Object.entries(toolsData.function|| {}).map(([key, value], index) => (
                  <div key={index} className="flex items-start gap-2 mb-2">
                    <span className="font-semibold">{key}:</span>
                    <span className="w-full">
                      {typeof value === "string" && value.startsWith("{") ? (
                        <pre className="w-full text-sm bg-gray-100 p-2 rounded">
                          {JSON.stringify(JSON.parse(value), null, 2)}
                        </pre>
                      ) : (
                        key === 'name' ? (
                          <p>
                            {integrationData[value].title} <span>({value})</span>
                          </p>
                        ) : (
                          value.toString()
                        )
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
