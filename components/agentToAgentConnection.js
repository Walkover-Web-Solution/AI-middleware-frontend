'use client'

import { useState, useCallback, useEffect, useMemo } from 'react';
import {ReactFlow,applyNodeChanges,applyEdgeChanges,addEdge,Handle,Position,ReactFlowProvider,Controls,Background,BackgroundVariant,} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, PlusIcon, Settings, Bot, X } from 'lucide-react';
import { useCustomSelector } from '@/customHooks/customSelector';
import { usePathname,useRouter } from 'next/navigation';
import {serializeAgentFlow,BRIDGE_TYPES,useAgentLookup,normalizeConnectedRefs,shallowEqual,AgentSidebar,FlowControlPanel,AgentConfigSidebar,} from '@/components/flowDataManager';
import { closeModal, openModal } from '@/utils/utility';
import { MODAL_TYPE } from '@/utils/enums';
import CreateBridgeCards from './CreateBridgeCards';
import { createNewOrchestralFlowAction, updateOrchestralFlowAction } from '@/store/action/orchestralFlowAction';
import { useDispatch } from 'react-redux';


function hydrateNodes(rawNodes, ctx) {
  const {
    handleFlowChange,
    openSidebar,
    selectAgentForNode,
    handleBridgeTypeSelect,
    selectedBridgeType,
    hasMasterAgent,
    agents,
    onOpenConfigSidebar,
  } = ctx;

  return (rawNodes || []).map((node) => {
    const common = {
      onFlowChange: handleFlowChange,
      openSidebar,
      onSelectAgent: selectAgentForNode,
      agents,
      onOpenConfigSidebar,
    };
    const extra =
      node.type === 'bridgeNode'
        ? {
            onBridgeTypeSelect: handleBridgeTypeSelect,
            bridgeType: node?.data?.bridgeType ?? selectedBridgeType,
            hasMasterAgent,
          }
        : {};

    return { ...node, data: { ...(node.data || {}), ...common, ...extra } };
  });
}

/* =========================================================
   NODES (Bridge / Agent) + EDGE COMPONENTS
   ========================================================= */
function BridgeNode({ id, data }) {
  const handleBridgeClick = () => {
    openModal(MODAL_TYPE.BRIDGE_TYPE_MODAL);
  };

  const bridgeConfig = BRIDGE_TYPES[data.bridgeType];
  const Icon = bridgeConfig?.icon || Plus;

  return (
    <div className="flex flex-col items-center">
      <Handle type="target" position={Position.Left} className="!bg-transparent !border-0" />
      <button
        onClick={handleBridgeClick}
        className={`text-white rounded-2xl w-20 h-20 flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 nodrag relative overflow-hidden ${bridgeConfig ? `bg-gradient-to-r ${bridgeConfig.color} hover:opacity-90` : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
          }`}
        title={bridgeConfig ? `${bridgeConfig.name} Bridge - Click to change` : 'Select Bridge Type'}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
        <Icon className="w-8 h-8 relative z-10 mb-1" />
        {bridgeConfig && <span className="text-xs font-medium relative z-10">{bridgeConfig.name}</span>}
        {!data.hasMasterAgent && !bridgeConfig && <span className="text-xs font-medium relative z-10">Start</span>}
      </button>

      <span className="mt-3 text-sm font-medium text-slate-700">{bridgeConfig ? `${bridgeConfig.name} Bridge` : 'Select Bridge Type'}</span>

      <Handle type="source" position={Position.Right} className="!bg-transparent !border-0" />
    </div>
  );
}

// Updated AgentNode - Remove sidebar from here
function AgentNode({ id, data }) {
  const pathname = usePathname();
  const pathParts = pathname.split('?')[0].split('/');
  const orgId = pathParts[2];
  
  const {allFunction, allAgent} = useCustomSelector(
    (state) => ({
      allFunction: state.bridgeReducer?.org?.[orgId]?.functionData || {},
      allAgent: state.bridgeReducer.org?.[orgId]?.orgs || {}
    })
  );

  const handleRelabel = () => data.openSidebar({ mode: 'select', nodeId: id, title: 'Change agent' });
  const handleAdd = () => data.openSidebar({ mode: 'add', sourceNodeId: id, title: 'Add next agent' });
  const handleDelete = () => data.onFlowChange({ action: 'DELETE_NODE', payload: { nodeId: id } });
  const handleOpenConfig = () => data.onOpenConfigSidebar(id);

  const functions = useMemo(() => {
    if (!allAgent.find((a) => a._id === data.selectedAgent._id)?.function_ids || !allFunction) return [];
    return allAgent.find((a) => a._id === data.selectedAgent._id)?.function_ids.map((fid) => allFunction[fid]).filter(Boolean);
  }, [allAgent, data.selectedAgent, allFunction]);

  const isMasterAgent = data.isFirstAgent;

  return (
    <div className='w-full h-full flex flex-col items-center'>
      <div className="relative flex flex-col items-center group">
        <div className="relative flex items-center justify-center">
          {/* Delete button - Top Left */}
          <button
            onClick={handleDelete}
            className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-base-100 shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 z-30 flex items-center justify-center"
            title="Delete agent"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          
          {/* Orbiting Functions - Left Side Only */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
            {functions.length > 0 && (
              <div className="relative">
                {functions.map((fn, i) => {
                  const totalFunctions = functions.length;
                  const angleSpread = Math.PI * 0.8;
                  const startAngle = Math.PI - angleSpread / 2;
                  const angle = startAngle + (i / Math.max(totalFunctions - 1, 1)) * angleSpread;
                  const orbitRadius = 60;
                  const x = orbitRadius * Math.cos(angle);
                  const y = orbitRadius * Math.sin(angle);

                  return (
                    <div key={fn._id} className="absolute transform -translate-x-1/2 -translate-y-1/2 group/function" style={{ left: `${x}px`, top: `${y}px` }}>
                      <div
                        className="w-8 h-8 bg-gradient-to-br from-orange-100 to-orange-200 
                                 border-2 border-orange-300 text-orange-600 rounded-full 
                                 flex items-center justify-center shadow-lg hover:shadow-xl 
                                 transition-all duration-200 hover:scale-110 hover:border-orange-400
                                 cursor-pointer backdrop-blur-sm"
                        title={fn.endpoint_name}
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </div>

                      <div
                        className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 
                                    opacity-0 group-hover/function:opacity-100 transition-opacity duration-200
                                    bg-slate-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap
                                    shadow-lg z-50 pointer-events-none"
                      >
                        {fn.endpoint_name}
                        <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-slate-800"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Central Agent Node */}
          <div
            className={`relative border-2 rounded-full shadow-xl hover:shadow-2xl p-6 z-20 transition-all duration-300 hover:scale-105 group-hover:shadow-blue-100 cursor-pointer ${isMasterAgent ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-400 hover:border-amber-500' : 'bg-gradient-to-br from-white to-slate-50 border-slate-300 hover:border-blue-400'
              }`}
            onClick={handleOpenConfig}
          >
            {/* Target handle */}
            <Handle
              type="target"
              position={Position.Left}
              className="!w-4 !h-4 !-ml-2 !bg-blue-500 !border-white !border-2 !shadow-lg hover:!bg-blue-600 transition-colors duration-200"
            />

            <div className="flex items-center justify-center">
              <div className={`text-base-primary rounded-full p-4 shadow-inner ${isMasterAgent ? 'bg-gradient-to-br from-amber-100 to-amber-200' : 'bg-gradient-to-br from-blue-50 to-blue-100'}`}>
                <Bot className="w-8 h-8" />
                {isMasterAgent && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">M</span>
                  </div>
                )}
              </div>
            </div>

            {/* Add next agent */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAdd();
              }}
              className="hidden absolute top-1/2 -translate-y-1/2 -right-5 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl hover:shadow-2xl hover:from-emerald-600 hover:to-emerald-700 place-items-center hover:transition-transform group-hover:block group-hover:rotate-90 group-hover:transition-transform group-hover:duration-200 group-hover:delay-100"
              title="Add next step"
            >
              <PlusIcon className="w-6 h-6" />
            </button>

            {/* Output handle */}
            <Handle
              type="source"
              position={Position.Right}
              className="!w-4 !h-4 !-mr-2 !bg-emerald-500 !border-white !border-2 !shadow-lg hover:!bg-emerald-600 transition-colors duration-200 z-[-1]"
            />
          </div>
        </div>

        {/* Label */}
        <div className="mt-4 text-center">
          <div
            className={`px-4 py-2.5 text-sm font-semibold cursor-pointer transition-all duration-300 rounded-xl shadow-sm hover:shadow-md border ${isMasterAgent
                ? 'text-amber-800 hover:text-amber-900 bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200 hover:border-amber-300'
                : 'text-slate-700 hover:text-base-300 '
              }`}
            onClick={handleRelabel}
          >
            {isMasterAgent && <span className="text-xs font-bold text-amber-600 mr-1">[MASTER]</span>}
            {data.selectedAgent ? data.selectedAgent.name : 'Click to select'}
          </div>

          {functions.length > 0 && (
            <div className="inline-flex items-center mt-2 px-2 py-1 text-xs font-medium bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 rounded-full border border-orange-300 shadow-sm">
              <Settings className="w-3 h-3 mr-1" />
              {functions.length} function{functions.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
const nodeTypes = { bridgeNode: BridgeNode, agentNode: AgentNode };

function MakeStyleEdge(props) {
  const { sourceX, sourceY, targetX, targetY, selected, style = {} } = props;

  const xDistance = Math.abs(sourceX - targetX);
  const controlPointX1 = sourceX + xDistance * 0.5;
  const controlPointX2 = targetX - xDistance * 0.5;

  const edgePath = `M${sourceX},${sourceY} C ${controlPointX1},${sourceY} ${controlPointX2},${targetY} ${targetX},${targetY}`;
  const isActive = style.animated || selected;

  return (
    <g>
      <path
        d={edgePath}
        fill="none"
        stroke="#10b981"
        strokeWidth="3"
        strokeDasharray="8 6"
        strokeLinecap="round"
        opacity={isActive ? 0.9 : 0.7}
        className="transition-opacity duration-300"
      >
        <animate attributeName="stroke-dashoffset" values="0;-14;0" dur="2s" repeatCount="indefinite" />
      </path>

      <circle cx={sourceX} cy={sourceY} r="4" fill="#10b981" opacity="0.3" className="animate-pulse" />
      <circle cx={targetX} cy={targetY} r="4" fill="#10b981" opacity="0.3" className="animate-pulse" style={{ animationDelay: '1s' }} />
    </g>
  );
}

const edgeTypes = {
  default: MakeStyleEdge,
  smoothstep: MakeStyleEdge,
  step: MakeStyleEdge,
  fancy: MakeStyleEdge,
};

const defaultEdgeOptions = {
  type: 'default',
  style: { animated: true },
};
function Flow({ params, orchestralData, name, description, createdFlow, setIsLoading }) {
  const [nodes, setNodes] = useState(() => {
    const seed =
    orchestralData?.nodes ??
    (Array.isArray(orchestralData) ? orchestralData : []) ??
    [];
    return seed.map((node) => ({
      ...node,
      data: {
        ...(node.data || {}),
        onFlowChange: null,
        openSidebar: null,
      },
    }));
  });
  const agents = useCustomSelector((state) => state.bridgeReducer.org?.[params.org_id]?.orgs ?? {});
  const [configSidebar, setConfigSidebar] = useState({
    isOpen: false,
    nodeId: null,
    agent: null
  });

  // Add config sidebar handlers
  const openConfigSidebar = useCallback((nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    const agent = agents.find(a => a._id === node?.data?.selectedAgent?._id || nodeId);
    setConfigSidebar({
      isOpen: true,
      nodeId,
      agent
    });
  }, [nodes, agents]);

  const closeConfigSidebar = useCallback(() => {
    setConfigSidebar({
      isOpen: false,
      nodeId: null,
      agent: null
    });
  }, []);

  const [edges, setEdges] = useState(() => { const seed = orchestralData?.edges ?? [];return seed;});

  const [shouldLayout, setShouldLayout] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const router = useRouter()
  useEffect(() => {
    setIsModified(!orchestralData.length > 0 ?  (nodes.length !== orchestralData?.nodes?.length || edges.length !== orchestralData?.edges?.length) : nodes.length > 0);
  }, [nodes, edges]);
  const [selectedBridgeType, setSelectedBridgeType] = useState(() => {
    const bridgeNode =
      (orchestralData?.nodes || []).find?.((n) => n.type === 'bridgeNode') ||
      (Array.isArray(orchestralData) ? orchestralData.find((n) => n.type === 'bridgeNode') : null);
    return bridgeNode?.data?.bridgeType || '';
  });

  const [masterAgent, setMasterAgent] = useState(null);
  const dispatch = useDispatch();

  const [sidebar, setSidebar] = useState({
    isOpen: false,
    mode: null,
    title: '',
    sourceNodeId: null,
    isFirstAgent: false,
    nodeId: null,
    bridgeType: null,
  });

  const openSidebar = useCallback((ctx) => setSidebar((s) => ({ ...s, ...ctx, isOpen: true })), []);
  const closeSidebar = useCallback(
    () =>
      setSidebar({
        isOpen: false,
        mode: null,
        title: '',
        sourceNodeId: null,
        isFirstAgent: false,
        nodeId: null,
        bridgeType: null,
      }),
    []
  );

  const { resolve: resolveAgent } = useAgentLookup(agents);

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep', data: {} }, eds)), []);

  // INITIAL HYDRATION (run once after mount)
  useEffect(() => {
    setNodes((current) =>
      hydrateNodes(current, {
        handleFlowChange,
        openSidebar,
        selectAgentForNode,
        handleBridgeTypeSelect,
        selectedBridgeType,
        hasMasterAgent: current.some((n) => n.type === 'agentNode' && n.data?.isFirstAgent),
        agents,
        onOpenConfigSidebar: openConfigSidebar,
      })
    );
  }, []); // eslint-disable-line

  // RUNTIME IMPORT of initialFlow (e.g., navigation/redirect with prebuilt graph)
  useEffect(() => {
    if (orchestralData?.nodes || orchestralData?.edges) {
      setNodes((_) =>
        hydrateNodes(orchestralData.nodes || [], {
          handleFlowChange,
          openSidebar,
          selectAgentForNode,
          handleBridgeTypeSelect,
          selectedBridgeType,
          hasMasterAgent: (orchestralData.nodes || []).some((n) => n.type === 'agentNode' && n.data?.isFirstAgent),
          agents,
          onOpenConfigSidebar: openConfigSidebar,
        })
      );
      setEdges(orchestralData.edges || []);
      setShouldLayout(true);
    }
  }, [orchestralData]); // eslint-disable-line

  const selectAgentForNode = useCallback((nodeId, agent) => {
    setNodes((nds) => nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, selectedAgent: agent } } : n)));
  }, []);

  const handleBridgeTypeSelect = useCallback(
    (bridgeType) => {
      setSelectedBridgeType(bridgeType);
      setNodes((nds) => nds.map((n) => (n.type === 'bridgeNode' ? { ...n, data: { ...n.data, bridgeType } } : n)));
      closeModal(MODAL_TYPE.BRIDGE_TYPE_MODAL);

      const hasMasterAgent = nodes.some((n) => n.type === 'agentNode' && n.data?.isFirstAgent);
      if (!hasMasterAgent) {
        const bridgeNode = nodes.find((n) => n.type === 'bridgeNode');
        const bridgeNodeId = bridgeNode ? bridgeNode.id : 'bridge-node-root';
        openSidebar({
          mode: 'add',
          sourceNodeId: bridgeNodeId,
          isFirstAgent: true,
          title: 'Select Master Agent',
          bridgeType,
        });
      }
    },
    [nodes, openSidebar]
  );

  // Initialize with Bridge node when empty
  useEffect(() => {
    if (nodes.length === 0 && Object.keys(agents).length > 0) {
      setNodes([
        {
          id: 'bridge-node-root',
          type: 'bridgeNode',
          position: { x: 80, y: 400 },
          data: {
            onFlowChange: handleFlowChange,
            agents,
            openSidebar,
            onBridgeTypeSelect: handleBridgeTypeSelect,
            bridgeType: selectedBridgeType,
            hasMasterAgent: false,
          },
        },
      ]);
    }
  }, [agents, selectedBridgeType]); // eslint-disable-line

  // Keep node data fresh (no heavy objects inside data)
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        const common = { agents, openSidebar };
        const extra =
          node.type === 'bridgeNode'
            ? { onBridgeTypeSelect: handleBridgeTypeSelect, bridgeType: selectedBridgeType, masterAgent }
            : {};
        const nextData = { ...node.data, ...common, ...extra };
        if (shallowEqual(node.data, nextData)) return node;
        return { ...node, data: nextData };
      })
    );
  }, [agents, selectedBridgeType]); // eslint-disable-line

  // Mark last nodes by edges
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.type !== 'agentNode') return n;
        const hasOutgoing = edges.some((e) => e.source === n.id);
        const isLast = !hasOutgoing;
        if (n.data?.isLast === isLast) return n;
        return { ...n, data: { ...n.data, isLast } };
      })
    );
  }, [edges]);

  // Auto layout
  const applyAutoLayout = useCallback(() => {
    const HORIZONTAL_SPACING = 280;
    const VERTICAL_SPACING = 200;
    const BASE_Y = 400;

    const bridgeNode = nodes.find((n) => n.type === 'bridgeNode');
    if (!bridgeNode || nodes.length <= 1) return;

    const getLayoutedNodes = (nodesToLayout, edgesToLayout) => {
      const graph = new Map(nodesToLayout.map((n) => [n.id, []]));
      edgesToLayout.forEach((e) => {
        if (graph.has(e.source)) graph.get(e.source).push(e.target);
      });

      const nodeLevels = new Map();
      const nodeOrder = new Map();
      const queue = [[bridgeNode.id, 0]];
      const visited = new Set([bridgeNode.id]);
      nodeLevels.set(bridgeNode.id, 0);
      nodeOrder.set(bridgeNode.id, 0);

      const levelCounts = new Map([[0, 1]]);

      while (queue.length > 0) {
        const [currId, level] = queue.shift();
        const children = graph.get(currId) || [];
        children.forEach((childId) => {
          if (!visited.has(childId)) {
            visited.add(childId);
            const childLevel = level + 1;
            const currentLevelCount = levelCounts.get(childLevel) || 0;
            nodeLevels.set(childId, childLevel);
            nodeOrder.set(childId, currentLevelCount);
            levelCounts.set(childLevel, currentLevelCount + 1);
            queue.push([childId, childLevel]);
          }
        });
      }

      const newNodes = [];
      nodesToLayout.forEach((node) => {
        const level = nodeLevels.get(node.id);
        const order = nodeOrder.get(node.id);
        const levelNodeCount = levelCounts.get(level) || 1;

        if (level !== undefined && order !== undefined) {
          const x = level * HORIZONTAL_SPACING + 80;
          let y;
          if (levelNodeCount === 1) {
            y = BASE_Y;
          } else {
            const total = (levelNodeCount - 1) * VERTICAL_SPACING;
            const startY = BASE_Y - total / 2;
            y = startY + order * VERTICAL_SPACING;
          }
          newNodes.push({
            ...node,
            position: { x, y },
            style: { ...node.style, transition: 'all 0.8s cubic-bezier(0.4,0,0.2,1)' },
          });
        }
      });
      return newNodes;
    };

    setNodes(getLayoutedNodes(nodes, edges));
  }, [nodes, edges]);

  useEffect(() => {
    if (shouldLayout && nodes.length > 1) {
      const t = setTimeout(() => {
        applyAutoLayout();
        setShouldLayout(false);
      }, 150);
      return () => clearTimeout(t);
    }
  }, [shouldLayout, applyAutoLayout, nodes.length]);

  // Save flow with master agent
  const handleSaveAgentStructure = useCallback(
    async(metadata) => {
      try {
        !metadata.createdFlow && metadata.setIsLoading(true);
        const firstAgentNode = nodes.find((n) => n.type === 'agentNode' && n.data?.isFirstAgent && n.data?.selectedAgent);
        const masterAgentData = firstAgentNode?.data?.selectedAgent;
        if (!masterAgentData) {
          alert('Please select a master agent first');
          return;
        }

        const agentStructure = serializeAgentFlow(nodes, edges, {
          ...metadata,
          org_id: params.org_id,
          bridge_type: selectedBridgeType,
          master_agent: masterAgentData.bridge_id || masterAgentData.name,
          master_agent_name: masterAgentData.name,
        });
        console.log('Serialized Flow:', agentStructure);
      const id = await dispatch(metadata.createdFlow ? updateOrchestralFlowAction(agentStructure, params.org_id, params.orchestralId) : createNewOrchestralFlowAction(agentStructure, params.org_id)).then(response => response.data.id);
      if (id && !metadata.createdFlow) {
        router.push(`/org/${params.org_id}/orchestratal_model/${id}`);
      }
      } catch (error) {
        console.error('Error saving agent structure:', error);
      }
    },
    [nodes, edges, params.org_id, selectedBridgeType]
  );

  // subgraph / add nodes
  const createFanoutSubgraph = useCallback(
    (sourceNodeId, rootAgent, childRefs, isFirstAgent = false, visitedAgents = new Set()) => {
      const rootAgentKey = rootAgent?._id || rootAgent?.bridge_id || rootAgent?.name;
      console.log(rootAgentKey);
      if (!rootAgentKey || visitedAgents.has(rootAgentKey)) {
        console.warn('Circular reference detected or invalid agent:', rootAgentKey);
        return;
      }

      const newVisitedAgents = new Set(visitedAgents);
      newVisitedAgents.add(rootAgentKey);

      const rootNodeId = rootAgentKey;
      if (isFirstAgent) setMasterAgent(rootAgent);

      let rootPos = isFirstAgent ? { x: 280, y: 400 } : { x: 530, y: 400 };

      setNodes((current) => {
        const sourceNode = current.find((n) => n.id === sourceNodeId);
        if (sourceNode && !isFirstAgent) {
          rootPos = { x: sourceNode.position.x + 250, y: sourceNode.position.y };
        }

        const newRoot = {
          id: rootNodeId,
          type: 'agentNode',
          position: rootPos,
          data: {
            onFlowChange: handleFlowChange,
            onSelectAgent: selectAgentForNode,
            agents,
            selectedAgent: { ...agents.find?.((bridge) => bridge._id === rootAgentKey), description: rootAgent.description },
            isFirstAgent: !!isFirstAgent,
            openSidebar,
            isLast: true,
            onOpenConfigSidebar: openConfigSidebar, // Add this line
          },
          style: { transition: 'all 0.4s ease-in-out' },
        };
        return [...current, newRoot];
      });

      setEdges((eds) =>
        addEdge(
          {
            id: `e-${sourceNodeId}-${rootNodeId}`,
            source: sourceNodeId,
            target: rootNodeId,
            type: 'smoothstep',
            data: {},
          },
          eds
        )
      );

      const unique = new Set();
      const immediateChildren = normalizeConnectedRefs(childRefs)
        .map((ref) => resolveAgent(ref))
        .filter((a) => {
          if (!a) return false;
          const key = a.bridge_id || a.name;
          if (newVisitedAgents.has(key)) return false;
          if (unique.has(key)) return false;
          unique.add(key);
          return true;
        });

      if (immediateChildren.length > 0) {
        setNodes((nds) => nds.map((n) => (n.id === rootNodeId ? { ...n, data: { ...n.data, isLast: false } } : n)));

        immediateChildren.forEach((child, i) => {
          const childBridge = { ...agents.find?.((bridge) => bridge._id === child.bridge_id), description: child.description };
          const childConnectedRefs = normalizeConnectedRefs(childBridge?.connected_agents || []);
          setTimeout(() => {
            createFanoutSubgraph(rootNodeId, childBridge, childConnectedRefs, false, newVisitedAgents);
          }, 100 * i);
        });
      }

      setTimeout(() => setShouldLayout(true), 200);
    },
    [agents, selectAgentForNode, openSidebar, resolveAgent]
  );

  const handleFlowChange = useCallback(
    (change) => {
      const { action, payload } = change;

      if (action === 'ADD_NODE') {
        const { sourceNodeId, agent, isFirstAgent } = payload;
        const childrenRefs = normalizeConnectedRefs(agent.connected_agents);

        if (childrenRefs.length > 0) {
          createFanoutSubgraph(sourceNodeId, agent, childrenRefs, isFirstAgent, new Set());
        } else {
          const newNodeId = `agent-${Date.now()}`;

          if (isFirstAgent) setMasterAgent(agent);

          setNodes((currentNodes) => {
            const sourceNode = currentNodes.find((n) => n.id === sourceNodeId);
            if (!sourceNode) return currentNodes;

            const sourcePosition = sourceNode.position;
            const newPosition = isFirstAgent
              ? { x: sourcePosition.x + 200, y: sourcePosition.y }
              : { x: sourcePosition.x + 250, y: sourcePosition.y };

            const newNode = {
              id: newNodeId,
              type: 'agentNode',
              position: newPosition,
              data: {
                onFlowChange: handleFlowChange,
                onSelectAgent: selectAgentForNode,
                selectedAgent: agent,
                isFirstAgent: !!isFirstAgent,
                openSidebar,
                isLast: true,
                onOpenConfigSidebar: openConfigSidebar,
              },
              style: { transition: 'all 0.4s ease-in-out' },
            };
            return [...currentNodes, newNode];
          });

          setEdges((currentEdges) =>
            addEdge(
              {
                id: `e-${sourceNodeId}-${newNodeId}`,
                source: sourceNodeId,
                target: newNodeId,
                type: 'smoothstep',
                data: {},
              },
              currentEdges
            )
          );

          setTimeout(() => setShouldLayout(true), 100);
        }
      }

      if (action === 'DELETE_NODE') {
        const { nodeId } = payload;
        const nodeToDelete = nodes.find((n) => n.id === nodeId);
        if (nodeToDelete?.data?.isFirstAgent) setMasterAgent(null);

        setNodes((nds) => nds.filter((n) => n.id !== nodeId));
        setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
        setTimeout(() => setShouldLayout(true), 100);
      }
    },
    [selectAgentForNode, openSidebar, createFanoutSubgraph, nodes]
  );

  // UI
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      <div className="absolute top-4 left-4 z-50 bg-white/90 p-2 rounded text-xs font-mono">
        Nodes: {nodes.length} | Edges: {edges.length} | Bridge: {selectedBridgeType || 'none'}
      </div>

      <FlowControlPanel onSaveAgent={handleSaveAgentStructure} bridgeType={selectedBridgeType} name={name} description={description} createdFlow={createdFlow} isModified={isModified} setIsLoading={setIsLoading} params={params}/>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}     // editable
        nodesConnectable={false}   // editable
        fitView
        fitViewOptions={{ padding: 0.2, duration: 800, includeHiddenNodes: false }}
      >
        <Controls showInteractive={false} className="!bg-white/80 !backdrop-blur-md !border-white/60 !shadow-lg !rounded-xl" />
        <Background variant={BackgroundVariant.Dots} gap={32} size={1.5} color="#e2e8f0" className="opacity-60" />
      </ReactFlow>

      <CreateBridgeCards
        handleBridgeTypeSelection={handleBridgeTypeSelect}
        selectedBridgeTypeCard={selectedBridgeType}
        isModal={true}
      />
      <AgentSidebar
        isOpen={sidebar.isOpen}
        title={sidebar.title}
        agents={agents}
        onClose={closeSidebar}
        onChoose={(agent) => {
          if (sidebar.mode === 'add') {
            handleFlowChange({
              action: 'ADD_NODE',
              payload: { sourceNodeId: sidebar.sourceNodeId, agent, isFirstAgent: sidebar.isFirstAgent},
            });
          } else if (sidebar.mode === 'select') {
            selectAgentForNode(sidebar.nodeId, agent);
          }
          closeSidebar();
        }}
        nodes={nodes}
      />
      <AgentConfigSidebar 
        isOpen={configSidebar.isOpen} 
        onClose={closeConfigSidebar} 
        agent={configSidebar.agent}
      />
    </div>
  );
}

/* =========================================================
   WRAPPER COMPONENT
   - Accepts optional `initialFlow` (prebuilt {nodes, edges})
   ========================================================= */
export default function AgentToAgentConnection({ params, orchestralData = [], name, description, createdFlow = false, setIsLoading }) {
  return (
    <ReactFlowProvider>
      <Flow params={params} orchestralData={orchestralData} name={name} description={description} createdFlow={createdFlow} setIsLoading={setIsLoading}/>
    </ReactFlowProvider>
  );
}

