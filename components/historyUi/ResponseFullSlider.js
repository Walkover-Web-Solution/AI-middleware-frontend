import { useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";

export function ResponseFullSlider({ response, onClose, onBack }) {
  const sliderRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (sliderRef.current && !sliderRef.current.contains(event.target)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleBack = () => {
    onBack?.();
    onClose();
  };

  const content =
    response?.updated_llm_message ||
    response?.llm_message ||
    response?.chatbot_message ||
    response?.user ||
    "";

  return (
    <>
      <div
        className={`
          fixed inset-0 bg-black bg-opacity-50 z-[999998] transition-opacity duration-300
          ${response ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
      >
        <div
          ref={sliderRef}
          className={`
            fixed top-0 right-0
            h-screen w-[50vw] min-w-[600px]
            bg-base-100 z-[999999]
            transform transition-transform duration-300
            flex flex-col
            ${response ? "translate-x-0" : "translate-x-full"}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-base-300">
            <button
              onClick={handleBack}
              className="flex items-center text-sm text-primary hover:text-primary/80"
            >
              <ArrowLeft size={16} className="mr-1" />
              GO BACK TO FLOW EDITOR
            </button>
            <div className="text-xs text-base-content/60">
              RESPONSE
            </div>
          </div>

          <div className="px-6 py-4 border-b border-base-300">
            <h2 className="text-xl font-semibold text-base-content">
              Final Response
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {content ? (
              <div className="whitespace-pre-wrap text-sm text-base-content">
                {content}
              </div>
            ) : (
              <div className="text-sm text-base-content/60">
                No response available
              </div>
            )}
          </div>

          <div className="flex justify-end p-4 border-t border-base-300 bg-base-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/80"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
