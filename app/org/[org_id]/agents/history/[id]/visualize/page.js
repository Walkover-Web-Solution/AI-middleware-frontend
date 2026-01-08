"use client";

import React, { useEffect, useMemo, useState } from "react";
import ReactFlow, { Background } from "reactflow";
import "reactflow/dist/style.css";
import { useCustomSelector } from "@/customHooks/customSelector";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { getHistoryAction, getThread, getRecursiveHistoryAction } from "@/store/action/historyAction";
import { X, ArrowLeft } from "lucide-react";
import { formatRelativeTime } from "@/utils/utility";

import { UserPromptUI } from "@/components/historyUi/UserPromptUi.js";
import { MainAgentUI } from "@/components/historyUi/MainAgentUi.js";
import { BatchUI } from "@/components/historyUi/BatchUi.js";
import GenericNode from "@/components/historyUi/GenericNode.js";
import { ToolFullSlider } from "@/components/historyUi/ToolFullSlider.js";
import { ResponseFullSlider } from "@/components/historyUi/ResponseFullSlider.js";

const nodeTypes = {
  generic: GenericNode,
};



export default function Page() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const params = useParams();
  const orgId = params?.org_id;
  const bridgeId = params?.id;
  const thread = useCustomSelector(
    (state) => state?.historyReducer?.thread || []
  );
  const recursiveHistory = useCustomSelector(
    (state) => state?.historyReducer?.recursiveHistory
  );
  const recursiveHistoryLoading = useCustomSelector(
    (state) => state?.historyReducer?.recursiveHistoryLoading
  );
  const mainAgentName = useCustomSelector((state) => {
    const orgAgents = state?.bridgeReducer?.org?.[orgId]?.orgs || [];
    const agent = orgAgents.find(
      (item) => item?._id === bridgeId || item?.id === bridgeId
    );
    return (
      agent?.name ||
      agent?.agent_name ||
      agent?.bridge_name ||
      "main_agent"
    );
  });
  const [stableThreadItem, setStableThreadItem] = useState(null);

  const sp = useSearchParams();
  const messageId = sp.get("message_id");
  const threadId = sp.get("thread_id");
  const subThreadId = sp.get("subThread_id");
  const versionId = sp.get("version");
  const errorParam = sp.get("error") === "true";
  const selectedThreadItem = useMemo(() => {
    if (!messageId) return null;
    return thread.find((item) => item?.message_id === messageId) || null;
  }, [messageId, thread]);

  console.log("🚀 selectedThreadItem:", selectedThreadItem);
  useEffect(() => {
    if (selectedThreadItem) setStableThreadItem(selectedThreadItem);
  }, [selectedThreadItem]);

  useEffect(() => {
    if (messageId || thread.length === 0) return;
    if (!stableThreadItem) {
      setStableThreadItem(thread[thread.length - 1]);
    }
  }, [messageId, thread, stableThreadItem]);

  // COMMENTED OUT: These hooks fetch thread data, but activeThreadItem already has all needed data
  // useEffect(() => {
  //   if (thread.length > 0 || threadId || !bridgeId) return;

  //   const fetchInitialThread = async () => {
  //     const history = await dispatch(
  //       getHistoryAction(
  //         bridgeId,
  //         1,
  //         "all",
  //         errorParam,
  //         versionId || undefined,
  //         undefined,
  //         undefined,
  //         undefined
  //       )
  //     );
  //     console.log("🚀 history:", history);
  //     const firstThreadId = history?.[0]?.thread_id;
  //     if (!firstThreadId) return;

  //     dispatch(
  //       getThread({
  //         threadId: firstThreadId,
  //         bridgeId,
  //         subThreadId: firstThreadId,
  //         nextPage: 1,
  //         user_feedback: "all",
  //         versionId: versionId || undefined,
  //         error: errorParam,
  //       })
  //     );
  //   };

  //   fetchInitialThread();
  // }, [thread.length, threadId, bridgeId, versionId, errorParam, dispatch]);

  // useEffect(() => {
  //   if (thread.length > 0 || !threadId || !bridgeId) return;

  //   dispatch(
  //     getThread({
  //       threadId,
  //       bridgeId,
  //       subThreadId: subThreadId || threadId,
  //       nextPage: 1,
  //       user_feedback: "all",
  //       versionId: versionId || undefined,
  //       error: errorParam,
  //     })
  //   );
  // }, [thread.length, threadId, subThreadId, bridgeId, versionId, errorParam, dispatch]);

  const activeThreadItem = selectedThreadItem || stableThreadItem; // use this everywhere
  console.log("🚀 activeThreadItem:", activeThreadItem);
  const responsePreview = useMemo(() => {
    const content =
      activeThreadItem?.updated_llm_message ||
      activeThreadItem?.llm_message ||
      activeThreadItem?.chatbot_message ||
      "";
    if (!content) return "";
    return content.length > 120 ? `${content.slice(0, 120)}...` : content;
  }, [activeThreadItem]);


  // Fetch recursive history using activeThreadItem data
  useEffect(() => {
    if (!activeThreadItem) return;

    const selectedBridgeId = activeThreadItem.bridge_id;
    const selectedThreadId = activeThreadItem.thread_id;
    const selectedMessageId = activeThreadItem.message_id;

    const fetchRecursiveHistory = async () => {
      if (!selectedBridgeId || !selectedThreadId || !selectedMessageId) {
        console.warn("Missing required IDs for recursive history fetch");
        return;
      }

      try {
        const data = await dispatch(getRecursiveHistoryAction({
          agent_id: selectedBridgeId,
          thread_id: selectedThreadId,
          message_id: selectedMessageId,
        }));
        console.log("🚀 Recursive history data:", data);
      } catch (error) {
        console.error("❌ Error fetching recursive history:", error);
      }
    };

    fetchRecursiveHistory();
  }, [activeThreadItem, dispatch]);

  const normalizeToolCalls = (toolData) => {
    if (!toolData) return [];
    if (Array.isArray(toolData)) {
      if (toolData.length === 0) return [];
      return toolData.flatMap((toolSet) => Object.values(toolSet || {}));
    }
    if (typeof toolData === "object") {
      return Object.values(toolData);
    }
    return [];
  };

  const recursiveMessage = recursiveHistory?.data || null;

  const toolCalls = useMemo(() => {
    return normalizeToolCalls(recursiveMessage?.tools_call_data);
  }, [recursiveMessage?.tools_call_data]);

  const getToolType = (tool) => {
    if (tool?.data?.metadata?.type) return tool.data.metadata.type;
    if (tool?.message_id || tool?.bridge_id || tool?.thread_id) return "agent";
    if (Array.isArray(tool?.tools_call_data)) return "agent";
    return null;
  };

  const buildToolNode = (tool) => {
    const toolType = getToolType(tool);
    const functionData = {
      id: tool?.id ?? null,
      args: tool?.args ?? (tool?.user ? { _query: tool.user } : {}),
      data:
        tool?.data ??
        (toolType
          ? { metadata: { type: toolType }, response: tool }
          : { response: tool }),
    };

    if (toolType === "agent") {
      const childMessage = tool?.data?.response || tool?.response || tool || null;
      const childTools = normalizeToolCalls(childMessage?.tools_call_data);
      return {
        name:
          tool?.name ||
          tool?.AiConfig?.model ||
          tool?.bridge_id ||
          "Unknown Agent",
        functionData,
        nodeType: "agent",
        children: childTools.map(buildToolNode),
      };
    }

    return {
      name: tool?.name || "Unknown Tool",
      nodeType: "tool",
      functionData,
      children: [],
    };
  };

  const derivedAgents = useMemo(() => {

    if (toolCalls.length === 0) return [];

    const orderedTools = toolCalls;
    const agents = [];
    let currentAgent = null;

    orderedTools.forEach((tool) => {
      const toolType = getToolType(tool);
      const functionData = {
        id: tool?.id ?? null,
        args: tool?.args ?? (tool?.user ? { _query: tool.user } : {}),
        data:
          tool?.data ??
          (toolType
            ? { metadata: { type: toolType }, response: tool }
            : { response: tool }),
      };

      if (toolType === "agent") {
        const childMessage =
          tool?.data?.response || tool?.response || tool || null;
        const childToolCalls = normalizeToolCalls(childMessage?.tools_call_data);
        const childParallelTools = childToolCalls.map(buildToolNode);

        currentAgent = {
          name:
            tool?.name ||
            tool?.AiConfig?.model ||
            tool?.bridge_id ||
            "Unknown Agent",
          functionData,
          nodeType: "agent",
          parallelTools: childParallelTools,
          isLoading: recursiveHistoryLoading && childParallelTools.length === 0,
        };
        agents.push(currentAgent);
        return;
      }

      if (toolType === "function") {
        if (!currentAgent) {
          currentAgent = {
            name: "FUNCTIONS",
            functionData: null,
            parallelTools: [],
          };
          agents.push(currentAgent);
        }
        currentAgent.parallelTools.push({
          name: tool?.name || "Unknown Tool",
          functionData,
        });
      }
    });
    return agents;
  }, [toolCalls, recursiveHistoryLoading]);
  const mainAgentTools = useMemo(() => {
    if (toolCalls.length === 0) return [];

    const data = toolCalls
      .filter((tool) => getToolType(tool) === "function")
      .map((tool) => ({
        name: tool?.name || "Unknown Tool",
        functionData: {
          id: tool?.id ?? null,
          args: tool?.args ?? {},
          data: tool?.data ?? {},
        },
      }));

    return data;
  }, [toolCalls]);

  // Store edges at component level so they can be accessed by edges memo
  const treeEdgesRef = React.useRef([]);

  const nodes = useMemo(() => {
    const baseX = 650;
    const levelGap = 400; // Horizontal gap between tree levels
    const siblingGap = 200; // Vertical gap between sibling nodes
    const alignY = 150; // Y position for root level

    const allNodes = [];
    const allEdges = [];
    let nodeIdCounter = 0;

    // Recursive function to build tree nodes
    const buildTreeNodes = (agent, parentId, level, siblingIndex, totalSiblings) => {
      const nodeId = `agent-${nodeIdCounter++}`;
      const x = baseX + level * levelGap;
      
      // Calculate Y position based on sibling index
      // Center the siblings vertically around alignY
      const totalHeight = (totalSiblings - 1) * siblingGap;
      const startY = alignY - totalHeight / 2;
      const y = startY + siblingIndex * siblingGap;

      // Get child agents from parallelTools
      const childAgents = agent.parallelTools?.filter(tool => tool?.nodeType === "agent") || [];
      
      // Filter parallelTools to exclude child agents (they'll be separate nodes)
      // Only show direct tools and functions in this node's BatchUI
      const toolsForDisplay = agent.parallelTools?.filter(tool => tool?.nodeType !== "agent") || [];
      
      // Create node for this agent using BatchUI
      allNodes.push({
        id: nodeId,
        type: "generic",
        position: { x, y },
        data: {
          source: childAgents.length > 0,
          target: level > 0,
          ui: {
            width: 320,
            containerClass: "border border-base-300 p-3 bg-base-100",
            render: () => (
              <BatchUI
                agents={[
                  {
                    name: agent.name,
                    functionData: agent.functionData,
                    parallelTools: toolsForDisplay, // Only direct tools, no child agents
                    isLoading: agent.isLoading,
                    nodeType: agent.nodeType,
                  },
                ]}
                onToolClick={(tool) => setSelectedTool(tool)}
              />
            ),
          },
        },
      });

      // Create edge from parent to this node
      if (parentId) {
        allEdges.push({
          id: `e-${parentId}-${nodeId}`,
          source: parentId,
          target: nodeId,
          style: {
            stroke: '#22c55e',
            strokeWidth: 2,
            animated: true,
          },
          animated: true,
        });
      }

      // Recursively build nodes for child agents (they become separate nodes)
      if (childAgents.length > 0) {
        childAgents.forEach((childAgent, index) => {
          buildTreeNodes(childAgent, nodeId, level + 1, index, childAgents.length);
        });
      }

      return nodeId;
    };

    // Build the tree starting from derived agents
    derivedAgents.forEach((agent, index) => {
      buildTreeNodes(agent, "2", 1, index, derivedAgents.length);
    });

    // Store edges for use in edges memo
    treeEdgesRef.current = allEdges;

    return [
      {
        id: "1",
        type: "generic",
        position: { x: 0, y: alignY },
        data: {
          source: true,
          ui: {
            width: 260,
            containerClass: "p-4 border border-base-300 ",
            render: () => (
              <UserPromptUI text={activeThreadItem?.user || ""} />
            ),
          },
        },
      },
      {
        id: "2",
        type: "generic",
        position: { x: 320, y: alignY },
        data: {
          source: true,
          target: true,
          ui: {
            width: 320,
            containerClass: "p-4 border border-base-300 ",
            render: () => (
              <MainAgentUI
                name={mainAgentName}
                onToolClick={(tool) => setSelectedTool(tool)}
                onResponseClick={() => setSelectedResponse(activeThreadItem)}
                responsePreview={responsePreview}
                tools={mainAgentTools}
              />
            ),
          },
        },
      },
      ...allNodes,
    ];
  }, [
    derivedAgents,
    mainAgentTools,
    activeThreadItem?.user,
    mainAgentName,
    responsePreview,
    activeThreadItem,
  ]);

  const edges = useMemo(() => {
    const edgeStyle = {
      stroke: '#22c55e', // Green color
      strokeWidth: 2,
      animated: true,
    };

    // Start with the edge from User Prompt to Main Agent
    const edgeList = [
      { 
        id: "e1-2", 
        source: "1", 
        target: "2",
        style: edgeStyle,
        animated: true,
      },
      // Add all the tree edges collected during node building
      ...treeEdgesRef.current,
    ];

    return edgeList;
  }, [derivedAgents.length]);

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="h-screen w-full relative bg-base-200 flex flex-col">
      {/* Navbar */}
      <div className="bg-base-100 border-b border-base-300 px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-base-content">Agent Execution Flow</h1>
          <span className="text-base-content/40">•</span>
          <p className="text-sm text-base-content/60">
            Executed {activeThreadItem?.created_at ? formatRelativeTime(activeThreadItem.created_at) : 'recently'}
          </p>
        </div>
        <button
          onClick={handleGoBack}
          className="text-base-content hover:text-primary transition-colors"
          title="Close"
        >
          <X size={24} />
        </button>
      </div>

      {/* ReactFlow Container */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
        >
          {/* <Background /> */}
        </ReactFlow>
      </div>

      {selectedTool && (
        <ToolFullSlider
          tool={selectedTool}
          onClose={() => setSelectedTool(null)}
          onBack={() => setSelectedTool(null)}
        />
      )}

      {selectedResponse && (
        <ResponseFullSlider
          response={selectedResponse}
          onClose={() => setSelectedResponse(null)}
          onBack={() => setSelectedResponse(null)}
        />
      )}

      {/* Close Button - Bottom Right */}
      <button
        onClick={handleGoBack}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-primary text-primary-content rounded-md hover:bg-primary/80 shadow-lg transition-all"
      >
        <ArrowLeft size={16} />
        <span className="text-sm font-medium">GO BACK</span>
      </button>
    </div>
  );
}
