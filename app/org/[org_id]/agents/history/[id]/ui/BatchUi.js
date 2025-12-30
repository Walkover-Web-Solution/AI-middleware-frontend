import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function BatchUI({ batches, onToolClick }) {
  const [openAgentKey, setOpenAgentKey] = useState(null);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const [selectedFunctionData, setSelectedFunctionData] = useState(null);
  const rowRefs = useRef({});

  const handleToolClick = (tool) => {
    if (!onToolClick) return;
    onToolClick(tool?.functionData ?? tool);
  };

  console.log(batches);

  const handleAgentClick = (agentKey, functionData) => {
    const nextOpen = openAgentKey === agentKey ? null : agentKey;
    setOpenAgentKey(nextOpen);
    setSelectedFunctionData(nextOpen ? functionData : null);
  };

  useEffect(() => {
    if (!openAgentKey) return;

    const updatePosition = () => {
      const el = rowRefs.current[openAgentKey];
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const popupWidth = 420;
      const gap = 12;
      let left = rect.right + gap;
      if (left + popupWidth > window.innerWidth - 8) {
        left = Math.max(8, rect.left - popupWidth - gap);
      }
      const top = Math.max(8, rect.top);
      setPopupPos({ top, left });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [openAgentKey]);

  return (
    <>
      <div className="space-y-4">
        {batches?.map((batch, batchIndex) => (
          <div key={batchIndex} className="space-y-2">
            <div className="text-xs font-semibold text-gray-600">
              {batch.title}
            </div>

            {batch.agents?.map((agent, agentIndex) => {
              const agentKey = `${batchIndex}-${agentIndex}`;
              const isOpen = openAgentKey === agentKey;

              // Check if this is an actual agent (has functionData) or just "FUNCTIONS" group
              const isActualAgent = agent.functionData !== null;

              const functionData = agent.functionData || {
                id: "null",
                args: {
                  _query: `Execute ${agent.name} with parameters for request 1`,
                },
                data: {
                  status: 0,
                  metadata: {
                    type: "agent",
                    agent_id: "hepvnes88in",
                    thread_id: null,
                    message_id: "",
                    version_id: null,
                    subthread_id: null,
                  },
                  response: "Successfully executed agent task",
                },
              };

              return (
                <div key={agentIndex} className="space-y-2">
                  {/* AGENT ROW - Only show for actual agents */}
                  {isActualAgent && (
                    <div className="relative">
                      <div
                        onClick={() => handleAgentClick(agentKey, functionData)}
                        ref={(node) => {
                          if (node) rowRefs.current[agentKey] = node;
                        }}
                        className="flex justify-between items-center border px-2 py-2 text-sm text-black hover:border-blue-500 border-2 hover:bg-blue-50 cursor-pointer"
                        title={agent.name}
                      >
                        <span className="truncate">{agent.name}</span>
                        <span className="text-green-500 flex-shrink-0 ml-2">✔</span>
                      </div>
                    </div>
                  )}

                  {/* Show FUNCTIONS label for non-agent groups */}
                  {!isActualAgent && agent.name === "FUNCTIONS" && (
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      MAIN AGENT TOOLS
                    </div>
                  )}

                  {/* PARALLEL TOOLS */}
                  {Array.isArray(agent.parallelTools) && agent.parallelTools.length > 0 && (
                    <div className={`space-y-1 ${isActualAgent ? 'ml-4' : ''}`}>
                      {isActualAgent && (
                        <div className="text-[10px] text-gray-600 flex items-center gap-1">
                          🔧 {agent.parallelTools.length} TOOL{agent.parallelTools.length > 1 ? 'S' : ''} CALLED BY {agent.name.toUpperCase()}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        {agent.parallelTools.map((tool, index) => {
                          const isLastOdd =
                            agent.parallelTools.length % 2 !== 0 &&
                            index === agent.parallelTools.length - 1;
                          const toolName =
                            typeof tool === "string"
                              ? tool
                              : tool?.name || tool?.id || `tool_${index + 1}`;

                          return (
                            <div
                              key={`${toolName}-${index}`}
                              onClick={() => handleToolClick(tool)}
                              className={`cursor-pointer flex items-center justify-between border px-2 py-1 text-xs text-black
                              ${isActualAgent ? 'hover:border-purple-400 hover:bg-purple-50' : 'hover:border-orange-400 hover:bg-orange-50'}
                              ${isLastOdd ? "col-span-2" : ""}`}
                              title={toolName}
                            >
                              <span className="truncate">{toolName}</span>
                              <span className="text-green-500 flex-shrink-0 ml-2">✔</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {openAgentKey && selectedFunctionData &&
        createPortal(
          <div
            className="fixed z-[9999] w-[420px] overflow-y-auto bg-white border border-gray-200 shadow-xl p-4 text-xs"
            style={{
              top: popupPos.top,
              left: popupPos.left,
              maxHeight: "70vh",
              overscrollBehavior: "contain",
            }}
          >
            <div className="text-[11px] font-semibold text-gray-700 tracking-wide mb-3">
              FUNCTION DATA:
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-[11px] text-gray-600 mb-1">Id:</div>
                <div className="border border-gray-200 bg-gray-50 px-2 py-1 text-gray-800">
                  {selectedFunctionData.id || "null"}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-gray-600 mb-1">Args:</div>
                <pre className="border border-gray-200 bg-gray-50 px-2 py-2 whitespace-pre-wrap text-gray-800 leading-5">
                  {JSON.stringify(selectedFunctionData.args, null, 2)}
                </pre>
              </div>

              <div>
                <div className="text-[11px] text-gray-600 mb-1">Data:</div>
                <pre className="border border-gray-200 bg-gray-50 px-2 py-2 whitespace-pre-wrap text-gray-800 leading-5">
                  {JSON.stringify(selectedFunctionData.data, null, 2)}
                </pre>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
