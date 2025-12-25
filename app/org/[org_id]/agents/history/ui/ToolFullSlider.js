import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react';

const CollapsibleSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200">
      <button
        className="w-full flex items-center justify-between p-4 text-left font-medium text-gray-700 hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </button>
      {isOpen && (
        <div className="p-4 bg-gray-50">
          {children}
        </div>
      )}
    </div>
  );
};

const JsonViewer = ({ data }) => {
  if (!data) return null;
  
  return (
    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-64">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
};

export function ToolFullSlider({ tool, onClose, onBack }) {
  const sliderRef = useRef(null);

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (sliderRef.current && !sliderRef.current.contains(event.target)) {
        onClose();
      }
    }

    // Add event listener when the component mounts
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleBack = () => {
    onBack?.(); // Call the onBack handler if provided
    onClose();   // Also close the slider
  };
  // Sample data - replace with actual tool data
  const toolData = tool || {
    payload: {
      endpoint: "https://api.example.com/v1/websearch-agent/action",
      method: "GET",
      params: {}
    },
    tool_2: {
      time: 387,
      output: {
        success: true,
        results: "Tool 2 executed successfully",
        timestamp: new Date().toISOString()
      }
    },
    response: {
      success: true,
      results: "Tool 2 executed successfully",
      timestamp: new Date().toISOString()
    },
    metadata: {
      tool_id: "tool_xegnttc"
    }
  };

  const handleExportLogs = () => {
    // Implement export logs functionality
    console.log('Exporting logs...');
  };

  return (
<>
      <div
        className={`
          fixed inset-0 bg-black bg-opacity-50 z-[999998] transition-opacity duration-300
          ${tool ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
      >
        <div
          ref={sliderRef}
          className={`
            fixed top-0 right-0
            h-screen w-[50vw] min-w-[600px]
            bg-white z-[999999]
            transform transition-transform duration-300
            flex flex-col
            ${tool ? "translate-x-0" : "translate-x-full"}
          `}
          onClick={(e) => e.stopPropagation()}
        >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={handleBack}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={16} className="mr-1" />
          GO BACK TO FLOW EDITOR
        </button>
        <div className="text-xs text-gray-500">
          SECURED BY VIASOCKET
        </div>
      </div>

      {/* Title */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Run History</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <CollapsibleSection title="Payload">
          <JsonViewer data={toolData.payload} />
        </CollapsibleSection>

        {toolData.tool_2 && (
          <CollapsibleSection title={`tool_2 (${toolData.tool_2.time}ms)`}>
            <JsonViewer data={toolData.tool_2.output} />
          </CollapsibleSection>
        )}

        <CollapsibleSection title="Response">
          <JsonViewer data={toolData.response} />
        </CollapsibleSection>

        <CollapsibleSection title="Metadata">
          <JsonViewer data={toolData.metadata} />
        </CollapsibleSection>
      </div>

          {/* Footer */}
          <div className="flex justify-between p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleExportLogs}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              EXPORT LOGS
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
