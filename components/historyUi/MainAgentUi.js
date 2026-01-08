import { Bot } from "lucide-react";

export function MainAgentUI({
  name,
  onToolClick,
  onResponseClick,
  responsePreview,
  tools = [],
}) {
  const handleToolClick = (tool) => {
    if (!onToolClick) return;
    onToolClick(tool?.functionData ?? tool);
  };

  return (
    <div className="space-y-3 z-10">
      {/* Agent Header */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 flex items-center justify-center border border-primary rounded-none bg-base-200">
          <Bot size={16} className="text-base-content" />
        </div>
        <div className="text-xs text-base-content/60 font-semibold">
          MAIN AGENT
        </div>
        <div className="font-semibold border border-primary text-primary text-sm p-2 bg-primary/10">
          {name}
        </div>
      </div>

      {/* Tools Section */}
      {tools.length > 0 && (
        <div className="space-y-2">
          <div className="text-center text-xs tracking-widest text-base-content/60">
            TOOL CALLS
          </div>
          <div className="space-y-2">
            {tools.map((tool, index) => (
              <div
                key={`${tool?.name || "tool"}-${index}`}
                className="flex items-center justify-between border border-base-300 hover:border-primary p-2 hover:bg-primary/10 cursor-pointer"
                onClick={() => handleToolClick(tool)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-primary">🔧</span>
                  <span className="text-sm text-base-content truncate">
                    {tool?.name || "Unknown Tool"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Response Section */}
      {responsePreview && (
        <div className="space-y-2">
          <div className="text-center text-xs tracking-widest text-base-content/60">
            RESPONSE
          </div>
          <div
            className="border border-base-300 hover:border-success p-3 hover:bg-success/10 cursor-pointer transition-all"
            onClick={onResponseClick}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-success">✓</span>
              <span className="text-xs font-semibold text-success">Delivered</span>
            </div>
            <p className="text-sm text-base-content/80 line-clamp-3">
              {responsePreview}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
