import { Bot } from "lucide-react";

export function AgentUI({ label, name, status, statusClass, onToolClick }) {
  // Handle tool click
  const handleToolClick = (toolName) => {
    if (onToolClick) {
      onToolClick({
        name: toolName,
        payload: {
          endpoint: `https://api.example.com/v1/tools/${toolName}`,
          method: "POST",
          params: { tool: toolName }
        },
        tool_2: {
          time: Math.floor(Math.random() * 1000),
          output: {
            success: true,
            results: `${toolName} executed successfully`,
            timestamp: new Date().toISOString()
          }
        },
        response: {
          success: true,
          results: `${toolName} executed successfully`,
          timestamp: new Date().toISOString()
        },
        metadata: {
          tool_id: `tool_${toolName.replace(/\s+/g, '_').toLowerCase()}`
        }
      });
    }
  };
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
      {
        status == 'FINALIZING' && (
          <>
            <div className="bg-white">
              {/* Heading */}
              <div className="text-center text-xs tracking-widest text-gray-500 mb-4">
                PROCESSING
              </div>

              {/* Tool Row 1 */}
              <div 
                className="flex items-center justify-between border hover:border-orange-400 border-2 p-2 mb-3 hover:bg-orange-50 cursor-pointer"
                onClick={() => handleToolClick('main_agent_tool_1')}
              >
                <div className="flex items-center gap-2">
                  <span className="text-orange-500">🔧</span>
                  <span className="text-sm text-gray-700">
                    main_agent_tool_1
                  </span>
                </div>
                <span className="text-green-500">✔</span>
              </div>

              {/* Tool Row 2 */}
              <div 
                className="flex items-center justify-between border hover:border-orange-400 border-2 p-2 mb-3 hover:bg-orange-50 cursor-pointer"
                onClick={() => handleToolClick('main_agent_tool_2')}
              >
                <div className="flex items-center gap-2">
                  <span className="text-orange-500">🔧</span>
                  <span className="text-sm text-gray-700">
                    main_agent_tool_2
                  </span>
                </div>
                <span className="text-green-500">✔</span>
              </div>

              {/* Tool Row 3 */}
              <div 
                className="flex items-center justify-between hover:border-orange-400 border-2 p-2 mb-3 hover:bg-orange-50 cursor-pointer"
                onClick={() => handleToolClick('main_agent_tool_3')}
              >
                <div className="flex items-center gap-2">
                  <span className="text-orange-500">🔧</span>
                  <span className="text-sm text-gray-700">
                    main_agent_tool_3
                  </span>
                </div>
                <span className="text-green-500">✔</span>
              </div>
            </div>

          </>
        )
      }

    </div>
  );
}
