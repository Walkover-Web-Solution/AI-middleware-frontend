export function BatchUI({ batches, onToolClick }) {
  const handleToolClick = (tool) => {
    if (!onToolClick) return;
    onToolClick(tool);
  };

  return (
    <>
      <div className="space-y-4">
        {batches?.map((batch, batchIndex) => (
          <div key={batchIndex} className="space-y-2">
            <div className="text-xs font-semibold text-gray-600">
              {batch.title}
            </div>

            {batch.agents?.map((agent, agentIndex) => (
              <div key={agentIndex} className="space-y-2">
                
                {/* AGENT ROW — unchanged */}
                <div className="flex justify-between items-center border px-2 py-2 text-sm text-black hover:border-blue-500 border-2 hover:bg-blue-50">
                  <span>{agent.name}</span>
                  <span className="text-green-500">✔</span>
                </div>

                {/* TOOLS */}
                {agent.parallelTools && (
                  <div className="space-y-1 ml-4">
                    <div className="text-[10px] text-gray-600 flex items-center gap-1">
                      ⚡ {agent.parallelTools.length} PARALLEL TOOLS
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {agent.parallelTools.map((tool, index) => {
                        const isLastOdd =
                          agent.parallelTools.length % 2 !== 0 &&
                          index === agent.parallelTools.length - 1;

                        return (
                          <div
                            key={tool}
                            onClick={() => handleToolClick(tool)}
                            className={`cursor-pointer flex items-center justify-between border px-2 py-1 text-xs text-black
                              hover:border-orange-400 hover:bg-orange-50
                              ${isLastOdd ? "col-span-2" : ""}`}
                          >
                            <span>{tool}</span>
                            <span className="text-green-500">✔</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
