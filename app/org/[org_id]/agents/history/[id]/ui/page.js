"use client";

import React, { useEffect, useMemo, useState } from "react";
import ReactFlow, { Background } from "reactflow";
import "reactflow/dist/style.css";
import { useCustomSelector } from "@/customHooks/customSelector";

import { UserPromptUI } from "./UserPromptUi.js";
import { AgentUI } from "./AgentUi.js";
import { BatchUI } from "./BatchUi.js";
import { FinalResponseUI } from "./FinalResponseUi.js";
import GenericNode from "./GenericNode.js";
import { ToolFullSlider } from "./ToolFullSlider.js";

const nodeTypes = {
  generic: GenericNode,
};



export default function Page({ searchParams }) {
  const [selectedTool, setSelectedTool] = useState(null);
  const thread = useCustomSelector(
    (state) => state?.historyReducer?.thread || []
  );
  const selectedThreadItem = useMemo(() => {
    if (!searchParams?.message_id) return null;
    return thread.find((item) => item?.message_id === searchParams.message_id) || null;
  }, [searchParams?.message_id, thread]);

  useEffect(() => {
    if (selectedThreadItem) {
      console.log("Thread data:", selectedThreadItem);
      console.log("Thread data:", selectedThreadItem.tools_call_data[0]);

    }
  }, [selectedThreadItem]);

 
  const toolCalls = useMemo(() => {
    const toolData = selectedThreadItem?.tools_call_data;
    if (!Array.isArray(toolData) || toolData.length === 0) return [];

    return toolData.flatMap((toolSet) =>
      Object.keys(toolSet).map((key) => toolSet[key])
    );
  }, [selectedThreadItem?.tools_call_data]);

  const derivedBatches = useMemo(() => {
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
        currentAgent = {
          name: tool?.name || "Unknown Agent",
          functionData,
          parallelTools: [],
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

    return [
      {
        title: "BATCH 1",
        agents,
      },
    ];
  }, [toolCalls]);

  const mainAgentTools = useMemo(() => {
    if (toolCalls.length === 0) return [];

    const data = toolCalls
  .filter(tool => tool?.data?.metadata?.type === "function")
  .map((tool) => ({
    name: tool?.name || "Unknown Tool",
    functionData: {
      id: tool?.id ?? null,
      args: tool?.args ?? {},
      data: tool?.data ?? {},
    },
  }));
    console.log("Main agent tools:", data);
    return data;
  }, [toolCalls]);

   useEffect(() => {
    if (derivedBatches.length) {
      console.log("Derived batches:", derivedBatches);
    }
  }, [derivedBatches]);

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
            <UserPromptUI text={selectedThreadItem?.user || ""} />
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
              name="untitled_agent_4"
              onToolClick={(tool) => setSelectedTool(tool)}
              status="PROCESSING"
              statusClass="text-blue-500"
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
          containerClass: "border p-3 bg-gray-100",
          render: () => (
            <BatchUI
  batches={derivedBatches.map(batch => ({
    ...batch,
    agents: batch.agents.map(agent => ({
      name: agent.name,
      functionData: agent.functionData
      // ⛔ remove parallelTools
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
              label="MAIN AGENT"
              name="finalizing_agent"
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
  ], []);

  const edges = [
    { id: "e1-2", source: "1", target: "2" },
    { id: "e2-3", source: "2", target: "3" },
    { id: "e3-4", source: "3", target: "4" },
    { id: "e4-5", source: "4", target: "5" },
  ];

  return (
    <div className="h-screen w-full relative bg-gray-200">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
      >
        {/* <Background /> */}
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
