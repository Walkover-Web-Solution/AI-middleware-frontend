'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ReactFlow, Background, Controls, BackgroundVariant, MarkerType, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft } from 'lucide-react';
import { getFromCookies } from '@/utils/utility';

// Custom scrollbar styles using DaisyUI theme colors
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: oklch(var(--b2));
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: oklch(var(--b3));
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: oklch(var(--bc) / 0.3);
  }
`;

// CSS animation removed - edges are now static

// Helper function to get agent display name
const getAgentDisplayName = (agentId, agentName, index) => {
  // If agent_name is provided, use it
  if (agentName && agentName !== `Agent ${index + 1}`) {
    return agentName;
  }
  // Try to extract a readable name from the agent ID
  if (!agentId || agentId.length > 20) {
    // It's likely a hash/ID, use generic name
    return `Agent ${index + 1}`;
  }
  // Convert snake_case or camelCase to readable format
  return agentId
    ?.replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ') || `Agent ${index + 1}`;
};

// Custom Tool node component
const CustomToolNode = ({ data }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      
      <div className={`w-24 h-20 rounded-lg flex flex-col items-center justify-center shadow-md transition-all duration-300 cursor-pointer ${
        isHovered 
          ? 'bg-gradient-to-br from-accent to-accent/80 border-2 border-accent/60 scale-105 shadow-lg' 
          : 'bg-base-200 border-2 border-base-300 hover:border-accent/40'
      }`}>
        <div className={`text-lg mb-1 ${isHovered ? 'text-accent-content' : 'text-accent'}`}>
          🔧
        </div>
        <div className={`text-[10px] font-medium transition-colors px-2 text-center leading-tight ${
          isHovered ? 'text-accent-content/90' : 'text-base-content/70'
        }`}>
          {data.name.length > 15 ? data.name.substring(0, 15) + '...' : data.name}
        </div>
      </div>

      {/* Tooltip on hover */}
      {isHovered && (
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="bg-base-100 border-2 border-accent shadow-xl rounded-lg p-3 min-w-[250px] max-w-[350px]">
            <div className="text-xs font-semibold text-accent mb-2 flex items-center gap-2">
              <span>🔧</span>
              <span>{data.name}</span>
            </div>
            {data.response && (
              <div className="text-xs text-base-content/80 mt-2">
                <div className="font-medium text-base-content mb-1">Response:</div>
                <div className="bg-base-200 p-2 rounded max-h-32 overflow-y-auto custom-scrollbar">
                  {typeof data.response === 'object' ? JSON.stringify(data.response, null, 2) : data.response}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Custom node component with hover functionality
const CustomAgentNode = ({ data }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTooltipHovered, setIsTooltipHovered] = useState(false);
  const hideTimeoutRef = useRef(null);

  const showTooltip = isHovered || isTooltipHovered;

  const clearHideTimeout = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const scheduleHide = () => {
    clearHideTimeout();
    hideTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      setIsTooltipHovered(false);
    }, 400);
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => {
        clearHideTimeout();
        setIsHovered(true);
      }}
      onMouseLeave={scheduleHide}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      
      <div className={`w-28 h-28 rounded-2xl flex flex-col items-center justify-center shadow-lg transition-all duration-300 cursor-pointer ${
        showTooltip 
          ? 'bg-gradient-to-br from-primary to-primary/80 border-2 border-primary/60 scale-110 shadow-2xl' 
          : 'bg-base-100 border-2 border-base-300 hover:border-primary/40 hover:shadow-xl'
      }`}>
        <div className={`text-2xl font-bold transition-colors mb-2 ${
          showTooltip ? 'text-primary-content' : 'text-base-content'
        }`}>
          {data.initials}
        </div>
        <div className={`text-[11px] font-medium transition-colors px-2 text-center leading-tight ${
          showTooltip ? 'text-primary-content/90' : 'text-base-content/60'
        }`}>
          {data.name.length > 18 ? data.name.substring(0, 18) + '...' : data.name}
        </div>
      </div>
      
      {/* Hover tooltip - Compact with scrollbar and interactive */}
      {showTooltip && (
        <div 
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-8 z-[9999] pointer-events-auto"
          onMouseEnter={() => {
            clearHideTimeout();
            setIsTooltipHovered(true);
          }}
          onMouseLeave={scheduleHide}
        >
          <div className="bg-base-100 border-2 border-base-300 rounded-xl shadow-2xl w-80 max-h-96 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 flex flex-col">
            {/* Header - Fixed */}
            <div className="text-sm font-bold px-4 py-2 text-primary border-b-2 border-primary/20 flex items-center gap-2 flex-shrink-0">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
              <span className="truncate">{data.name}</span>
            </div>
            
            {/* Scrollable Content */}
            <div 
              className="overflow-y-auto overflow-x-hidden max-h-80 cursor-default custom-scrollbar" 
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'oklch(var(--b3)) oklch(var(--b2))' }}
              onScroll={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onWheel={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onWheelCapture={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onTouchMove={(e) => e.stopPropagation()}
            >
              <div className="p-4 space-y-3">
                <div>
                  <div className="text-xs font-semibold text-base-content mb-1 flex items-center gap-1">
                    <svg className="w-3 h-3 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                    </svg>
                    <span>Query:</span>
                  </div>
                  <div className="text-xs text-base-content/80 bg-gradient-to-br from-info/10 to-info/20 p-2 rounded-lg border-l-2 border-info leading-relaxed">
                    {data.query}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-base-content mb-1 flex items-center gap-1">
                    <svg className="w-3 h-3 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>Response:</span>
                  </div>
                  <div className="text-xs text-base-content/80 bg-gradient-to-br from-success/10 to-success/20 p-2 rounded-lg border-l-2 border-success leading-relaxed whitespace-pre-wrap break-words">
                    {data.response}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-[2px]">
              <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-transparent border-t-base-300"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-[1px] w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-transparent border-t-base-100"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Custom User Query Node with hover
const CustomUserNode = ({ data }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTooltipHovered, setIsTooltipHovered] = useState(false);
  const hideTimeoutRef = useRef(null);
  const showTooltip = isHovered || isTooltipHovered;

  const clearHideTimeout = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const scheduleHide = () => {
    clearHideTimeout();
    hideTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      setIsTooltipHovered(false);
    }, 400);
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => {
        clearHideTimeout();
        setIsHovered(true);
      }}
      onMouseLeave={scheduleHide}
    >
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      
      <div className="text-center cursor-pointer">
        <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-info to-info/80 text-info-content flex items-center justify-center mx-auto mb-2 shadow-lg transition-all duration-300 ${
          showTooltip ? 'scale-110 shadow-2xl' : ''
        }`}>
          <span className="text-2xl">👤</span>
        </div>
        <div className="text-xs font-bold text-base-content mb-2">USER QUERY</div>
      </div>

      {showTooltip && (
        <div 
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-8 z-[9999] pointer-events-auto"
          onMouseEnter={() => {
            clearHideTimeout();
            setIsTooltipHovered(true);
          }}
          onMouseLeave={scheduleHide}
        >
          <div className="bg-base-100 border-2 border-info/40 rounded-xl shadow-2xl w-80 max-h-96 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 flex flex-col">
            <div className="text-sm font-bold px-4 py-2 text-info border-b-2 border-info/20 flex items-center gap-2 flex-shrink-0">
              <div className="w-3 h-3 rounded-full bg-info animate-pulse"></div>
              <span>User Query</span>
            </div>
            <div 
              className="overflow-y-auto overflow-x-hidden max-h-80 cursor-default custom-scrollbar" 
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'oklch(var(--b3)) oklch(var(--b2))' }}
              onScroll={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onWheel={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onWheelCapture={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onTouchMove={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="text-xs text-base-content/80 bg-gradient-to-br from-info/10 to-info/20 p-3 rounded-lg border-l-2 border-info leading-relaxed whitespace-pre-wrap break-words">
                  {data.query}
                </div>
              </div>
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-[2px]">
              <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-transparent border-t-info/40"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-[1px] w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-transparent border-t-base-100"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Custom Final Response Node with hover
const CustomResponseNode = ({ data }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTooltipHovered, setIsTooltipHovered] = useState(false);
  const hideTimeoutRef = useRef(null);
  const showTooltip = isHovered || isTooltipHovered;

  const clearHideTimeout = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const scheduleHide = () => {
    clearHideTimeout();
    hideTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      setIsTooltipHovered(false);
    }, 400);
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => {
        clearHideTimeout();
        setIsHovered(true);
      }}
      onMouseLeave={scheduleHide}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      
      <div className="text-center cursor-pointer">
        <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-success to-success/80 text-success-content flex items-center justify-center mx-auto mb-2 shadow-lg transition-all duration-300 ${
          showTooltip ? 'scale-110 shadow-2xl' : ''
        }`}>
          <span className="text-2xl">✓</span>
        </div>
        <div className="text-xs font-bold text-base-content mb-2">FINAL RESPONSE</div>
      </div>

      {showTooltip && (
        <div 
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-8 z-[9999] pointer-events-auto"
          onMouseEnter={() => {
            clearHideTimeout();
            setIsTooltipHovered(true);
          }}
          onMouseLeave={scheduleHide}
        >
          <div className="bg-base-100 border-2 border-success/40 rounded-xl shadow-2xl w-80 max-h-96 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 flex flex-col">
            <div className="text-sm font-bold px-4 py-2 text-success border-b-2 border-success/20 flex items-center gap-2 flex-shrink-0">
              <div className="w-3 h-3 rounded-full bg-success animate-pulse"></div>
              <span>Final Response</span>
            </div>
            <div 
              className="overflow-y-auto overflow-x-hidden max-h-80 cursor-default custom-scrollbar" 
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'oklch(var(--b3)) oklch(var(--b2))' }}
              onScroll={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onWheel={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onWheelCapture={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onTouchMove={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="text-xs text-base-content/80 bg-gradient-to-br from-success/10 to-success/20 p-3 rounded-lg border-l-2 border-success leading-relaxed whitespace-pre-wrap break-words">
                  {data.response}
                </div>
              </div>
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-[2px]">
              <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-transparent border-t-success/40"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-[1px] w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-transparent border-t-base-100"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  customAgent: CustomAgentNode,
  customUser: CustomUserNode,
  customResponse: CustomResponseNode,
  customTool: CustomToolNode,
};

// Custom edge component matching AgentToAgentConnection exactly
function MakeStyleEdge(props) {
  const { sourceX, sourceY, targetX, targetY, selected, style = {} } = props;

  const xDistance = Math.abs(sourceX - targetX);
  const controlPointX1 = sourceX + xDistance * 0.5;
  const controlPointX2 = targetX - xDistance * 0.5;

  const edgePath = `M${sourceX},${sourceY} C ${controlPointX1},${sourceY} ${controlPointX2},${targetY} ${targetX},${targetY}`;
  const isActive = style.animated || selected;
  
  // Get stroke color from style or use default (success color)
  const strokeColor = style.stroke || 'oklch(var(--su))';

  return (
    <g>
      <path
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth="3"
        strokeDasharray="8 6"
        strokeLinecap="round"
        opacity={isActive ? 0.9 : 0.7}
        className="transition-opacity duration-500"
      />

      <circle cx={sourceX} cy={sourceY} r="4" fill={strokeColor} opacity="0.3" />
      <circle cx={targetX} cy={targetY} r="4" fill={strokeColor} opacity="0.3" />
    </g>
  );
}

const edgeTypes = { 
  default: MakeStyleEdge, 
  smoothstep: MakeStyleEdge, 
  step: MakeStyleEdge, 
  fancy: MakeStyleEdge 
};

const defaultEdgeOptions = { 
  type: 'default', 
  style: { animated: false } 
};

const OrchestraFlowVisualization = ({ flowData, onBack, onClose }) => {
  console.log('Flow Data:', flowData);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  // Create nodes and edges from flow data
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!flowData?.agents_path || flowData.agents_path.length === 0) {
      return { initialNodes: [], initialEdges: [] };
    }

    const agentsPath = flowData.agents_path;
    const llmMessages = flowData.llm_message || {};
    const userMessages = flowData.user || {};
    const toolsCallData = flowData.tools_call_data || {};
    
    const nodeSpacing = 250;
    const startX = 300;
    const centerY = 300;

    // Get user query and final response
    const firstAgentId = agentsPath[0];
    const lastAgentId = agentsPath[agentsPath.length - 1];
    const userQuery = userMessages[firstAgentId] || flowData.user_query || "User query";
    const finalResponse = llmMessages[lastAgentId] || flowData.final_response || "Agent response";

    // Create user query node with hover tooltip
    const userNode = {
      id: 'user-query',
      type: 'customUser',
      position: { x: 50, y: centerY - 10 },
      data: { 
        query: userQuery
      },
      style: {
        background: 'transparent',
        border: 'none',
        width: 160,
        height: 140,
      }
    };

    // Create agent nodes and tool nodes from agents_path
    const agentNodes = [];
    const toolNodes = [];
    const toolEdges = [];
    
    agentsPath.forEach((agentId, index) => {
      const agentName = getAgentDisplayName(agentId, null, index);
      const agentInitials = agentName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 3);
      
      // Get query for this agent
      const agentQuery = userMessages[agentId] || (index === 0 ? userQuery : `Query from previous agent`);
      
      // Get response from this agent
      const agentResponse = llmMessages[agentId] || `Processing query through ${agentName}`;
      
      // Get tools called by this agent (filter for metadata.type === "function")
      let agentTools = [];
      if (toolsCallData[agentId]) {
        const toolData = toolsCallData[agentId];
        console.log(`🔧 Processing tools for agent ${agentId}:`, toolData);
        
        if (Array.isArray(toolData)) {
          // toolData is an array - could contain objects with nested tools
          toolData.forEach(item => {
            if (item?.transfer_agent_config) {
              // Skip transfer configs, these are not function tools
              return;
            }
            
            // Check if item itself is a tool with metadata
            if (item?.data?.metadata?.type === 'function' || item?.metadata?.type === 'function') {
              agentTools.push(item);
            } else if (typeof item === 'object') {
              // Item is an object with tool call IDs as keys
              Object.entries(item).forEach(([key, tool]) => {
                if (tool?.data?.metadata?.type === 'function' || tool?.metadata?.type === 'function') {
                  agentTools.push(tool);
                }
              });
            }
          });
        } else if (typeof toolData === 'object') {
          // toolData is a direct object with tool call IDs as keys
          Object.values(toolData).forEach(tool => {
            if (tool?.data?.metadata?.type === 'function' || tool?.metadata?.type === 'function') {
              agentTools.push(tool);
            }
          });
        }
        
        console.log(`✅ Extracted ${agentTools.length} function tools for agent ${agentId}`);
      }
      
      // Create agent node
      agentNodes.push({
        id: agentId,
        type: 'customAgent',
        position: { x: startX + (index * nodeSpacing), y: centerY },
        data: { 
          name: agentName,
          initials: agentInitials,
          query: agentQuery,
          response: agentResponse,
          tools_call_data: agentTools
        },
        style: {
          background: 'transparent',
          border: 'none',
          width: 140,
          height: 140,
        }
      });
      
      // Create tool nodes for this agent
      if (agentTools.length > 0) {
        const toolsPerRow = 3;
        const toolSpacing = 110;
        const toolYOffset = 180;
        
        agentTools.forEach((tool, toolIndex) => {
          const toolName = tool?.name || tool?.data?.name || `Tool ${toolIndex + 1}`;
          const toolResponse = tool?.data?.response || tool?.response;
          
          // Calculate position for tool nodes (arrange in grid below agent)
          const row = Math.floor(toolIndex / toolsPerRow);
          const col = toolIndex % toolsPerRow;
          const totalToolsInRow = Math.min(agentTools.length - (row * toolsPerRow), toolsPerRow);
          const rowOffset = ((toolsPerRow - totalToolsInRow) * toolSpacing) / 2;
          
          const toolNodeId = `${agentId}-tool-${toolIndex}`;
          
          toolNodes.push({
            id: toolNodeId,
            type: 'customTool',
            position: { 
              x: startX + (index * nodeSpacing) - 60 + rowOffset + (col * toolSpacing), 
              y: centerY + toolYOffset + (row * 100)
            },
            data: {
              name: toolName,
              response: toolResponse,
              agentId: agentId
            },
            style: {
              background: 'transparent',
              border: 'none',
              width: 100,
              height: 80,
            }
          });
          
          // Create edge from agent to tool
          toolEdges.push({
            id: `${agentId}-to-${toolNodeId}`,
            source: agentId,
            target: toolNodeId,
            type: 'smoothstep',
            style: { 
              stroke: 'oklch(var(--a))', 
              strokeWidth: 2,
              strokeDasharray: '5 5',
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 15,
              height: 15,
              color: 'oklch(var(--a))',
            },
          });
        });
      }
    });

    // Create final response node with hover tooltip
    const responseNode = {
      id: 'final-response',
      type: 'customResponse',
      position: { x: startX + (agentsPath.length * nodeSpacing), y: centerY - 10 },
      data: { 
        response: finalResponse
      },
      style: {
        background: 'transparent',
        border: 'none',
        width: 160,
        height: 140,
      }
    };

    const allNodes = [userNode, ...agentNodes, ...toolNodes, responseNode];

    // Create edges with better visibility
    const allEdges = [...toolEdges];
    
    // Edge from user to first agent
    if (agentsPath.length > 0) {
      allEdges.push({
        id: 'user-to-first',
        source: 'user-query',
        target: agentsPath[0],
        sourceHandle: undefined,
        targetHandle: undefined,
        type: 'smoothstep',
        style: { 
          stroke: 'oklch(var(--in))', 
          strokeWidth: 3,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 25,
          height: 25,
          color: 'oklch(var(--in))',
        },
        label: `Calling ${getAgentDisplayName(agentsPath[0], null, 0)}`,
        labelStyle: { 
          fontSize: 12, 
          fill: 'oklch(var(--inc))', 
          fontWeight: '600',
          background: 'oklch(var(--in) / 0.1)',
        },
        labelBgStyle: { 
          fill: 'oklch(var(--in) / 0.1)', 
          fillOpacity: 0.95,
          rx: 8,
          ry: 8,
          stroke: 'oklch(var(--in))',
          strokeWidth: 1.5,
        },
        labelBgPadding: [8, 4],
      });
    }

    // Edges between agents
    for (let i = 0; i < agentsPath.length - 1; i++) {
      allEdges.push({
        id: `${agentsPath[i]}-to-${agentsPath[i + 1]}`,
        source: agentsPath[i],
        target: agentsPath[i + 1],
        sourceHandle: undefined,
        targetHandle: undefined,
        type: 'smoothstep',
        style: { 
          stroke: 'oklch(var(--p))', 
          strokeWidth: 3,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 25,
          height: 25,
          color: 'oklch(var(--p))',
        },
        label: `Calling ${getAgentDisplayName(agentsPath[i + 1], null, i + 1)}`,
        labelStyle: { 
          fontSize: 12, 
          fill: 'oklch(var(--pc))', 
          fontWeight: '600',
        },
        labelBgStyle: { 
          fill: 'oklch(var(--p) / 0.1)', 
          fillOpacity: 0.95,
          rx: 8,
          ry: 8,
          stroke: 'oklch(var(--p))',
          strokeWidth: 1.5,
        },
        labelBgPadding: [8, 4],
      });
    }

    // Edge from last agent to final response
    if (agentsPath.length > 0) {
      allEdges.push({
        id: 'last-to-response',
        source: agentsPath[agentsPath.length - 1],
        target: 'final-response',
        sourceHandle: undefined,
        targetHandle: undefined,
        type: 'smoothstep',
        style: { 
          stroke: 'oklch(var(--su))', 
          strokeWidth: 3,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 25,
          height: 25,
          color: 'oklch(var(--su))',
        },
        label: 'Returning Result',
        labelStyle: { 
          fontSize: 12, 
          fill: 'oklch(var(--suc))', 
          fontWeight: '600',
        },
        labelBgStyle: { 
          fill: 'oklch(var(--su) / 0.1)', 
          fillOpacity: 0.95,
          rx: 8,
          ry: 8,
          stroke: 'oklch(var(--su))',
          strokeWidth: 1.5,
        },
        labelBgPadding: [8, 4],
      });
    }

    return { initialNodes: allNodes, initialEdges: allEdges };
  }, [flowData]);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges]);

  if (!flowData) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <h3 className="text-lg font-medium text-base-content/60 mb-2">No Flow Data</h3>
        <p className="text-sm text-base-content/40 text-center">Select a message with orchestral agent flow to visualize the process.</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-base-200 to-base-300">
      {/* Inject custom scrollbar styles */}
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      
      {/* Enhanced header with back button */}
      {(onBack || onClose) && (
        <div className="p-4 bg-base-100 border-b border-base-200 shadow-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack || onClose}
              className="flex items-center gap-2 text-base-content hover:text-base-content transition-colors px-4 py-2 rounded-lg hover:bg-base-200"
            >
              <ArrowLeft size={20} />
              <span className="font-semibold">Back to History</span>
            </button>
            
            <div className="flex items-center gap-2 text-sm text-base-content">
              <div className="flex items-center gap-2 px-3 py-1 bg-base-300 rounded-lg border border-base-200">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span className="font-medium">Agent Flow Visualization</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* React Flow visualization */}
      <div className="h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          edgeTypes={edgeTypes}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          fitView
          fitViewOptions={{ 
            padding: 0.15,
            maxZoom: 1,
            minZoom: 0.5,
          }}
          minZoom={0.3}
          maxZoom={1.5}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          colorMode={getFromCookies('theme')}
          style={{ width: '100%', height: '100%' }}
        >
          <Controls 
            showInteractive={false}
            showZoom={true}
            showFitView={true}
            position="bottom-left"
            style={{
              paddingBottom: '20px',
              paddingLeft: '20px',
            }}
          />
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={24} 
            size={1.5} 
            color="oklch(var(--b3))" 
            className="opacity-50" 
          />
        </ReactFlow>
      </div>
    </div>
  );
};

export default OrchestraFlowVisualization;
