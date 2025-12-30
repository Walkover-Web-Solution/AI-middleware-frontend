import { Bot } from "lucide-react";

export function AgentUI({
  label,
  name,
  status,
  statusClass,
  onToolClick,
  tools = [],
}) {
  const handleToolClick = (tool) => {
    if (!onToolClick) return;
    onToolClick(tool?.functionData ?? tool);
  };
  console.log("Rendering AgentUI with tools:", tools);
  return (
    <div className="space-y-1 z-10">
      {/* Icon + Heading */}
      <div className="flex flex-col items-center gap-2">
        {/* Robot Icon Box */}
        <div className="w-8 h-8 flex items-center justify-center border border-blue-500 rounded-none bg-gray-50">
          <Bot size={16} className="text-gray-700" />
        </div>

        {/* Heading */}
        <div className="text-xs text-gray-500 font-semibold">
          {label}
        </div>
        {/* Agent Name */}
        <div className="font-semibold border border-blue-500 text-blue-600 text-sm p-2 bg-blue-100">
          {name}
        </div>
      </div>
      {status === "FINALIZING" && tools.length > 0 && (
        <div className="bg-white">
          <div className="text-center text-xs tracking-widest text-gray-500 mb-4">
            PROCESSING
          </div>

          {tools.map((tool, index) => (
  <div
    key={`${tool?.name || "tool"}-${index}`}
    className="flex items-center justify-between border hover:border-orange-400 border-2 p-2 mb-3 hover:bg-orange-50 cursor-pointer"
    onClick={() => handleToolClick(tool)}
  >
    <div className="flex items-center gap-2">
      <span className="text-orange-500">🔧</span>
      <span className="text-sm text-gray-700">
        {tool?.name || "Unknown Tool"}  {/* Add this line to display the tool name */}
      </span>
    </div>
  </div>
))}   
        </div>
      )}

    </div>
  );
}
