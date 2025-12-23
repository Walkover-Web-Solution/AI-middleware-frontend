"use client";

import React, { useMemo, useState } from "react";
import ReactFlow from "reactflow";
import "reactflow/dist/style.css";

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
   const [activeTool, setActiveTool] = useState(null);
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
            <UserPromptUI text="i want to create a action for testing purpose so get a curl those no need to auth and create it's action" />
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
            onToolClick={setActiveTool}
              batches={[
                {
                  title: "BATCH 1",
                  agents: [
                    {
                      name: "Websearch Agent",
                      parallelTools: ["tool_1", "tool_2"],
                    },
                    {
                      name: "Data Validator",
                    },
                  ],
                },
                {
                  title: "BATCH 2",
                  agents: [
                    {
                      name: "String Formatter",
                    },
                    {
                      name: "Date Parser",
                      parallelTools: ["tool_1", "tool_2", "tool_3"],
                    },
                  ],
                },
                {
                  title: "BATCH 3",
                  agents: [
                    {
                      name: "Number Converter",
                    },
                    {
                      name: "API Authenticator",
                    },
                  ],
                },
              ]
              }
            />
          ),
        },
      },
    }
    ,
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
              status="FINALIZING"
              statusClass="text-blue-500"
            />
          ),
        },
      },
    }
    ,

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
    <div className="h-screen w-screen bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
      />
      <ToolFullSlider
        tool={activeTool}
        onClose={() => setActiveTool(null)}
      />
    </div>
  );
}
