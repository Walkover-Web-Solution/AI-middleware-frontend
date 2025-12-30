"use client";

import React, { useEffect, useMemo, useState } from "react";
import ReactFlow, { Background } from "reactflow";
import "reactflow/dist/style.css";
import { useCustomSelector } from "@/customHooks/customSelector";
import { useParams, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { getHistoryAction, getThread } from "@/store/action/historyAction";

import { UserPromptUI } from "./UserPromptUi.js";
import { AgentUI } from "./AgentUi.js";
import { BatchUI } from "./BatchUi.js";
import { FinalResponseUI } from "./FinalResponseUi.js";
import GenericNode from "./GenericNode.js";
import { ToolFullSlider } from "./ToolFullSlider.js";

const nodeTypes = {
  generic: GenericNode,
};



export default function Page() {
  const dispatch = useDispatch();
  const [selectedTool, setSelectedTool] = useState(null);
  const [childAgentData, setChildAgentData] = useState({});
  const params = useParams();
  const orgId = params?.org_id;
  const bridgeId = params?.id;
  const thread = useCustomSelector(
    (state) => state?.historyReducer?.thread || []
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
  const selectedThreadItem = useMemo(() => {
    if (!messageId) return null;
    return thread.find((item) => item?.message_id === messageId) || null;
  }, [messageId, thread]);


  useEffect(() => {
    if (selectedThreadItem) setStableThreadItem(selectedThreadItem);
  }, [selectedThreadItem]);

  const activeThreadItem = selectedThreadItem || stableThreadItem; // use this everywhere

  console.log("messageId:", messageId);
  console.log("thread :", thread);
  console.log("Selected thread item:", activeThreadItem);

  const agentTools = (activeThreadItem?.tools_call_data || [])
    .flatMap((toolSet) => Object.values(toolSet || {}))
    .filter((tool) => tool?.data?.metadata?.type === "agent");

  console.log("✅ ALL AGENT TOOLS:", agentTools);

  // Fetch complete child agent history (all threads + detailed data for each)
  useEffect(() => {
    const fetchCompleteChildAgentHistory = async () => {
      if (agentTools.length === 0) return;

      console.log("🚀 Fetching COMPLETE history for", agentTools.length, "child agents...");

      for (const agentTool of agentTools) {
        const agentId = agentTool?.data?.metadata?.agent_id;
        const versionId = agentTool?.data?.metadata?.version_id;

        if (!agentId) {
          console.warn("⚠️ Missing agent_id for agent:", agentTool);
          continue;
        }

        console.log(`📥 Step 1: Fetching all thread IDs for ${agentTool.name} (${agentId})...`);

        try {
          // Step 1: Get all thread IDs for this agent
          const allThreads = await dispatch(
            getHistoryAction(
              agentId,
              1,
              "all",
              false,
              undefined,
              undefined,
              undefined,
              undefined
            )
          );

          console.log(`✅ Found ${allThreads?.length || 0} threads for ${agentTool.name}`);

          if (!allThreads || allThreads.length === 0) {
            console.warn(`⚠️ No threads found for ${agentTool.name}`);
            continue;
          }

          // Step 2: Fetch detailed data for each thread
          console.log(`📥 Step 2: Fetching detailed data for all ${allThreads.length} threads...`);

          const detailedThreadsData = [];

          for (const thread of allThreads) {
            const threadId = thread.thread_id;

            console.log(`  📄 Fetching thread ${threadId}...`);

            try {
              const threadData = await dispatch(
                getThread({
                  threadId: threadId,
                  bridgeId: agentId,
                  subThreadId: threadId,
                  nextPage: 1,
                  user_feedback: "all",
                  versionId: versionId || "",
                  error: false,
                })
              );

              detailedThreadsData.push({
                thread_id: threadId,
                updated_at: thread.updated_at,
                messages: threadData
              });

            } catch (error) {
              console.error(`  ❌ Error fetching thread ${threadId}:`, error);
            }
          }

          console.log(`✅ Complete history for ${agentTool.name}:`, detailedThreadsData);

          // Filter to find the specific thread matching the message_id from agentTools
          const targetMessageId = agentTool?.data?.metadata?.message_id;

          let matchedThread = null;
          let childToolCalls = [];

          if (targetMessageId) {
            // Find the thread that contains a message with the matching message_id
            matchedThread = detailedThreadsData.find(thread => {
              const messages = thread.messages?.data || [];
              return messages.some(msg => msg.message_id === targetMessageId);
            });

            if (matchedThread) {
              console.log(`🎯 MATCHED THREAD for ${agentTool.name} (message_id: ${targetMessageId}):`, matchedThread);

              // Extract tools_call_data from all messages in the matched thread
              const messages = matchedThread.messages?.data || [];
              childToolCalls = messages
                .flatMap(msg => msg.tools_call_data || [])
                .flatMap(toolSet => Object.values(toolSet || {}));

              console.log(`🔧 CHILD TOOL CALLS for ${agentTool.name}:`, childToolCalls);
            } else {
              console.warn(`⚠️ No thread found matching message_id ${targetMessageId} for ${agentTool.name}`);
            }
          }

          // Store in state - only the matched thread, not all threads
          setChildAgentData(prev => ({
            ...prev,
            [agentId]: {
              agentName: agentTool.name,
              targetMessageId: targetMessageId,
              matchedThread: matchedThread,
              childToolCalls: childToolCalls
            }
          }));

        } catch (error) {
          console.error(`❌ Error fetching complete history for ${agentTool.name}:`, error);
        }
      }
    };

    fetchCompleteChildAgentHistory();
  }, [agentTools.length, dispatch]);

  // Console log the complete child agent history
  useEffect(() => {
    if (Object.keys(childAgentData).length > 0) {
      console.log("🎯 COMPLETE CHILD AGENT HISTORY (ALL THREADS WITH DETAILS):", childAgentData);
    }
  }, [childAgentData]);

  const toolCalls = useMemo(() => {
    const toolData = activeThreadItem?.tools_call_data;
    if (!Array.isArray(toolData) || toolData.length === 0) return [];

    return toolData.flatMap((toolSet) =>
      Object.keys(toolSet).map((key) => toolSet[key])
    );
  }, [activeThreadItem?.tools_call_data]);

  const derivedBatches = useMemo(() => {
    console.log(`⏰ derivedBatches running. childAgentData:`, childAgentData, `keys:`, Object.keys(childAgentData));

    // If we have childAgentData, create a batch with the parallel tools
    if (Object.keys(childAgentData).length > 0) {
      const agents = Object.entries(childAgentData).map(([agentId, agentData]) => {
        const parallelTools = (agentData.childToolCalls || []).map(tool => ({
          name: tool?.name || "Unknown Tool",
          functionData: {
            id: tool?.id || null,
            args: tool?.args || {},
            data: tool?.data || {},
          }
        }));

        return {
          name: agentData.agentName || "Unknown Agent",
          functionData: {
            id: agentId,
            args: {},
            data: {
              metadata: {
                type: "agent",
                agent_id: agentId
              }
            }
          },
          parallelTools
        };
      });

      console.log(`⏰ Processed child agents:`, agents);
      return [{
        title: "BATCH 1",
        agents
      }];
    }

    // Fallback to original logic if no childAgentData
    if (toolCalls.length === 0) return [];

    const orderedTools = toolCalls;
    const agents = [];
    let currentAgent = null;

    orderedTools.forEach((tool) => {
      const toolType = tool?.data?.metadata?.type;
      const functionData = {
        id: tool?.id ?? null,
        args: tool?.args ?? {},
        data: tool?.data ?? {},
      };

      if (toolType === "agent") {
        const agentId = tool?.data?.metadata?.agent_id;
        const childData = childAgentData[agentId];

        // Map all child tool calls directly to parallel tools
        const childParallelTools = (childData?.childToolCalls || []).map(childTool => ({
          name: childTool?.name || "Unknown Tool",
          functionData: {
            id: childTool?.id ?? null,
            args: childTool?.args ?? {},
            data: childTool?.data ?? {},
          }
        }));

        currentAgent = {
          name: tool?.name || "Unknown Agent",
          functionData,
          parallelTools: childParallelTools,
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

    console.log(`⏰ derivedBatches running. agents array:`, agents);
    console.log(`⏰ Number of agents:`, agents.length);
    agents.forEach((agent, idx) => {
      console.log(`⏰ Agent ${idx}:`, {
        name: agent.name,
        hasFunctionData: !!agent.functionData,
        parallelToolsCount: agent.parallelTools?.length || 0,
        parallelTools: agent.parallelTools
      });
    });

    return [{
      title: "BATCH 1",
      agents,
    }];
  }, [toolCalls, childAgentData]);

  const mainAgentTools = useMemo(() => {
    if (toolCalls.length === 0) return [];

    const data = toolCalls
      .filter(tool => tool?.data?.metadata?.type !== "agent")
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

  const mainAgentCalls = useMemo(() => {
    if (!Array.isArray(agentTools) || agentTools.length === 0) return [];

    return agentTools.map((tool) => ({
      name: tool?.name || "Unknown Agent",
      functionData: {
        id: tool?.id ?? null,
        args: tool?.args ?? {},
        data: tool?.data ?? {},
      },
    }));
  }, [agentTools]);

  const calledAgentTools = useMemo(() => {
    if (derivedBatches.length === 0) return [];

    return derivedBatches.flatMap((batch) =>
      batch.agents.map((agent) => ({
        agentName: agent.name,
        tools: agent.parallelTools || [],
      }))
    );
  }, [derivedBatches]);

  const isBatchLoading = useMemo(() => {
    if (!Array.isArray(agentTools) || agentTools.length === 0) return false;
    return Object.keys(childAgentData).length === 0;
  }, [agentTools, childAgentData]);

  const nodes = useMemo(() => [
    {
      id: "1",
      type: "generic",
      position: { x: 0, y: 150 },
      data: {
        source: true,
        ui: {
          width: 260,
          containerClass: "p-4",
          render: () => (
            <UserPromptUI text={activeThreadItem?.user || ""} />
          ),
        },
      },
    },
    {
      id: "2",
      type: "generic",
      position: { x: 320, y: 150 },
      data: {
        source: true,
        target: true,
        ui: {
          containerClass: "p-4",
          render: () => (
            <AgentUI
              label="MAIN AGENT"
              name={mainAgentName}
              onToolClick={(tool) => setSelectedTool(tool)}
              status="PROCESSING"
              statusClass="text-blue-500"
              tools={mainAgentTools}
            />
          ),
        },
      },
    },
    {
      id: "3",
      type: "generic",
      position: { x: 650, y: 120 },
      data: {
        source: true,
        target: true,
        ui: {
          width: 320,
          containerClass: "border border-base-300 p-3 bg-base-200",
          render: () => (
            <BatchUI
              isLoading={isBatchLoading}
              batches={derivedBatches.map(batch => ({
                ...batch,
                agents: batch.agents.map(agent => ({
                  name: agent.name,
                  functionData: agent.functionData,
                  parallelTools: agent.parallelTools
                }))
              }))}
              onToolClick={(agent) => setSelectedTool(agent)}
            />
          ),
        },
      },
    },
    {
      id: "4",
      type: "generic",
      position: { x: 1100, y: 170 },
      data: {
        source: true,
        target: true,
        ui: {
          width: 280,
          containerClass: "p-4",
          render: () => (
            <AgentUI
              label="MAIN AGENT TOOLS"
              name={`${mainAgentName} tools`}
              onToolClick={(tool) => setSelectedTool(tool)}
              status="FINALIZING"
              statusClass="text-blue-500"
              tools={mainAgentTools}
            />
          ),
        },
      },
    },
    {
      id: "5",
      type: "generic",
      position: { x: 1450, y: 170 },
      data: {
        target: true,
        ui: {
          containerClass: " p-4",
          render: () => (
            <FinalResponseUI status="Delivered" />
          ),
        },
      },
    },
  ], [derivedBatches, mainAgentTools, activeThreadItem?.user]);

  const edges = [
    { id: "e1-2", source: "1", target: "2" },
    { id: "e2-3", source: "2", target: "3" },
    { id: "e3-4", source: "3", target: "4" },
    { id: "e4-5", source: "4", target: "5" },
  ];

  return (
    <div className="h-screen w-full relative bg-base-200">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
      </ReactFlow>

      {selectedTool && (
        <ToolFullSlider
          tool={selectedTool}
          onClose={() => setSelectedTool(null)}
          onBack={() => setSelectedTool(null)}
        />
      )}
    </div>
  );
}
