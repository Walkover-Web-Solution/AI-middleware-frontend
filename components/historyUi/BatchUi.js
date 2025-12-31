import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function BatchUI({ batches, onToolClick, isLoading = false }) {
  const [openAgentKey, setOpenAgentKey] = useState(null);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const [selectedFunctionData, setSelectedFunctionData] = useState(null);
  const [selectedAgentMeta, setSelectedAgentMeta] = useState(null);
  const rowRefs = useRef({});
  const popupRef = useRef(null);

  const handleToolClick = (tool) => {
    if (!onToolClick) return;
    onToolClick(tool?.functionData ?? tool);
  };

  console.log(batches);

  const handleAgentClick = (agentKey, functionData, agentName, tools) => {
    const nextOpen = openAgentKey === agentKey ? null : agentKey;
    setOpenAgentKey(nextOpen);
    setSelectedFunctionData(nextOpen ? functionData : null);
    setSelectedAgentMeta(
      nextOpen
        ? {
            name: agentName || "Unknown Agent",
            tools: Array.isArray(tools) ? tools : [],
            error: false,
          }
        : null
    );
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

  useEffect(() => {
    if (!openAgentKey) return;

    const handleOutsideClick = (event) => {
      const popupEl = popupRef.current;
      if (popupEl && popupEl.contains(event.target)) return;
      setOpenAgentKey(null);
      setSelectedFunctionData(null);
      setSelectedAgentMeta(null);
    };

    document.addEventListener("pointerdown", handleOutsideClick, true);
    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick, true);
    };
  }, [openAgentKey]);

  const isBatchEmpty =
    !Array.isArray(batches) ||
    batches.length === 0 ||
    batches.every(
      (batch) => !Array.isArray(batch?.agents) || batch.agents.length === 0
    );

  if (isLoading || isBatchEmpty) {
    return (
      <div className="flex items-center gap-2 text-xs text-base-content/60">
        <span
          className="h-4 w-4 border-2 hover:border-primary border-t-transparent rounded-full animate-spin"
          aria-label="Loading"
        />
        <span>Loading batch data...</span>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 bg-base-100">
        {batches?.map((batch, batchIndex) => (
          <div key={batchIndex} className="space-y-2">
            <div className="text-xs font-semibold text-base-content/60">
              {batch.title}
            </div>

            {batch.agents?.map((agent, agentIndex) => {
              const agentKey = `${batchIndex}-${agentIndex}`;

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
                        onClick={() =>
                          handleAgentClick(
                            agentKey,
                            functionData,
                            agent.name,
                            agent.parallelTools
                          )
                        }
                        ref={(node) => {
                          if (node) rowRefs.current[agentKey] = node;
                        }}
                        className="flex justify-between items-center border hover:border-primary px-2 py-2 text-sm text-base-content hover:hover:border-primary hover:bg-primary/10 cursor-pointer"
                        title={agent.name}
                      >
                        <span className="truncate">{agent.name}</span>
                        <span className="text-green-500 flex-shrink-0 ml-2">✔</span>
                      </div>
                    </div>
                  )}

                  {/* Show FUNCTIONS label for non-agent groups */}
                  {!isActualAgent && agent.name === "FUNCTIONS" && (
                    <div className="text-xs font-semibold text-base-content/60 mb-1">
                      MAIN AGENT TOOLS
                    </div>
                  )}

                  {isActualAgent && agent.isLoading && (
                    <div className={`flex items-center gap-2 text-[10px] text-base-content/60 ${isActualAgent ? 'ml-4' : ''}`}>
                      <span className="h-3 w-3 border-2 hover:border-primary border-t-transparent rounded-full animate-spin" />
                      <span>Loading tools...</span>
                    </div>
                  )}

                  {/* PARALLEL TOOLS */}
                  {Array.isArray(agent.parallelTools) && agent.parallelTools.length > 0 && (
                    <div className={`space-y-1 ${isActualAgent ? 'ml-4' : ''}`}>
                      {isActualAgent && (
                        <div className="text-[10px] text-base-content/60 flex items-center gap-1">
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
                              className={`cursor-pointer flex items-center justify-between border hover:border-primary px-2 py-1 text-xs text-base-content
                              ${isActualAgent ? 'hover:hover:border-primary hover:bg-primary/10' : 'hover:hover:border-primary hover:bg-primary/10'}
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
            ref={popupRef}
            className="fixed z-[9999] w-[420px] overflow-y-auto bg-base-100 border hover:border-primary shadow-xl p-4 text-xs text-base-content"
            style={{
              top: popupPos.top,
              left: popupPos.left,
              maxHeight: "70vh",
              overscrollBehavior: "contain",
            }}
          >
            <div className="text-[11px] font-semibold text-base-content tracking-wide mb-3">
              FUNCTION DATA:
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-[11px] text-base-content/60 mb-1">Id:</div>
                <div className="border hover:border-primary bg-base-200 px-2 py-1 text-base-content">
                  {selectedFunctionData.id || "null"}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-base-content/60 mb-1">Args:</div>
                <pre className="border hover:border-primary bg-base-200 px-2 py-2 whitespace-pre-wrap text-base-content leading-5">
                  {JSON.stringify(selectedFunctionData.args, null, 2)}
                </pre>
              </div>

              <div>
                <div className="text-[11px] text-base-content/60 mb-1">Data:</div>
                <pre className="border hover:border-primary bg-base-200 px-2 py-2 whitespace-pre-wrap text-base-content leading-5">
                  {JSON.stringify(selectedFunctionData.data, null, 2)}
                </pre>
              </div>

              <div>
                <div className="text-[11px] text-base-content/60 mb-1">Name:</div>
                <div className="border hover:border-primary bg-base-200 px-2 py-1 text-base-content">
                  {selectedAgentMeta?.name || "Unknown Agent"}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-base-content/60 mb-1">Error:</div>
                <div className="border hover:border-primary bg-base-200 px-2 py-1 text-base-content">
                  {selectedAgentMeta?.error ? "true" : "false"}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-base-content/60 mb-1">Tools:</div>
                {(selectedAgentMeta?.tools || []).length === 0 ? (
                  <div className="border hover:border-primary bg-base-200 px-2 py-1 text-base-content/60">
                    No tools found
                  </div>
                ) : (
                  <pre className="border hover:border-primary bg-base-200 px-2 py-2 whitespace-pre-wrap text-base-content leading-5">
                    {JSON.stringify(selectedAgentMeta?.tools || [], null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
